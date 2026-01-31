import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as Papa from 'papaparse'
import { Order, OrderStatus } from '../entities/order.entity'
import { OrderItem } from '../entities/order-item.entity'
import { Store } from '../entities/store.entity'
import { Item } from '../entities/item.entity'
import { CreateOrderDto, SubmitOrderDto, UpdateOrderDto } from '../dto/order.dto'
import { randomBytes } from 'crypto'
import { NotificationsSchedulerService } from '../notifications/notifications-scheduler.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @Inject(forwardRef(() => NotificationsSchedulerService))
    private notificationsSchedulerService: NotificationsSchedulerService,
  ) {}

  /**
   * 產生分享 Token（唯一識別碼）
   */
  private generateShareToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * 建立點餐訂單（召集人）
   */
  async create(createOrderDto: CreateOrderDto, organizerId: number): Promise<Order> {
    // 驗證店家是否屬於當前召集人
    const store = await this.storeRepository.findOne({
      where: { id: createOrderDto.storeId, organizerId },
    })

    if (!store) {
      throw new NotFoundException('店家不存在或您沒有權限')
    }

    // 驗證截止時間必須在未來
    if (createOrderDto.deadline <= new Date()) {
      throw new BadRequestException('截止時間必須在未來')
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      organizerId,
      shareToken: this.generateShareToken(),
      status: OrderStatus.OPEN,
    })

    const savedOrder = await this.orderRepository.save(order)

    // 發送訂單建立通知
    try {
      await this.notificationsSchedulerService.sendOrderStartedNotification(savedOrder)
    } catch (error) {
      console.error('發送訂單建立通知失敗:', error)
    }

    return savedOrder
  }

  /**
   * 取得訂單（透過 Token，匿名用戶使用）
   */
  async findByToken(token: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { shareToken: token },
      relations: ['store', 'items', 'items.item'],
    })

    if (!order) {
      throw new NotFoundException('訂單不存在')
    }

    return order
  }

  /**
   * 取得所有訂單（召集人）
   */
  async findAll(organizerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { organizerId },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * 取得歷史訂單（召集人，支援搜尋）
   */
  async findHistory(
    organizerId: number,
    options?: {
      startDate?: Date
      endDate?: Date
      storeName?: string
      orderName?: string
    },
  ): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.store', 'store')
      .where('order.organizerId = :organizerId', { organizerId })
      .andWhere('order.status IN (:...statuses)', { statuses: [OrderStatus.CLOSED, OrderStatus.COMPLETED] })

    // 日期範圍篩選
    if (options?.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate: options.startDate })
    }
    if (options?.endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate: options.endDate })
    }

    // 店家名稱搜尋
    if (options?.storeName) {
      queryBuilder.andWhere('store.name LIKE :storeName', { storeName: `%${options.storeName}%` })
    }

    // 訂單名稱搜尋
    if (options?.orderName) {
      queryBuilder.andWhere('order.name LIKE :orderName', { orderName: `%${options.orderName}%` })
    }

    return queryBuilder.orderBy('order.createdAt', 'DESC').getMany()
  }

  /**
   * 取得單一訂單（召集人）
   */
  async findOne(id: number, organizerId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, organizerId },
      relations: ['store', 'items', 'items.item'],
    })

    if (!order) {
      throw new NotFoundException('訂單不存在或您沒有權限')
    }

    return order
  }

  /**
   * 更新訂單
   */
  async update(id: number, updateOrderDto: UpdateOrderDto, organizerId: number): Promise<Order> {
    const order = await this.findOne(id, organizerId)

    if (updateOrderDto.deadline && updateOrderDto.deadline <= new Date()) {
      throw new BadRequestException('截止時間必須在未來')
    }

    Object.assign(order, updateOrderDto)

    return this.orderRepository.save(order)
  }

  /**
   * 重新產生 Token
   */
  async regenerateToken(id: number, organizerId: number): Promise<Order> {
    const order = await this.findOne(id, organizerId)
    order.shareToken = this.generateShareToken()
    return this.orderRepository.save(order)
  }

  /**
   * 提交點餐（匿名用戶）
   */
  async submitOrder(token: string, submitOrderDto: SubmitOrderDto): Promise<void> {
    const order = await this.findByToken(token)

    // 檢查訂單狀態
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException('訂單已關閉，無法點餐')
    }

    // 檢查截止時間
    if (order.deadline <= new Date()) {
      throw new BadRequestException('訂單已截止，無法點餐')
    }

    // 檢查店家 ID
    if (!order.storeId) {
      throw new BadRequestException('訂單缺少店家資訊，無法點餐')
    }

    // 刪除該參與者的舊訂單項目
    await this.orderItemRepository.delete({
      orderId: order.id,
      participantName: submitOrderDto.participantName,
    })

    // 建立新的訂單項目
    const orderItems: OrderItem[] = []

    for (const itemDto of submitOrderDto.items) {
      const item = await this.itemRepository.findOne({
        where: { id: itemDto.itemId, storeId: order.storeId, isActive: true },
      })

      if (!item) {
        throw new NotFoundException(`品項 ID ${itemDto.itemId} 不存在或已停用`)
      }

      const subtotal = Number(item.price) * itemDto.quantity

      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        participantName: submitOrderDto.participantName,
        itemId: itemDto.itemId,
        quantity: itemDto.quantity,
        customizationOptions: itemDto.customizationOptions ? JSON.stringify(itemDto.customizationOptions) : null,
        notes: itemDto.notes,
        subtotal,
      })

      orderItems.push(orderItem)
    }

    await this.orderItemRepository.save(orderItems)
  }

  /**
   * 取消訂單（匿名用戶取消自己的點餐）
   */
  async cancelOrder(token: string, participantName: string): Promise<void> {
    const order = await this.findByToken(token)

    // 檢查訂單狀態
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException('訂單已關閉，無法取消點餐')
    }

    // 檢查截止時間
    if (order.deadline <= new Date()) {
      throw new BadRequestException('訂單已截止，無法取消點餐')
    }

    // 刪除該參與者的所有訂單項目
    await this.orderItemRepository.delete({
      orderId: order.id,
      participantName,
    })
  }

  /**
   * 刪除訂單
   */
  async remove(id: number, organizerId: number): Promise<void> {
    const order = await this.findOne(id, organizerId)
    await this.orderRepository.remove(order)
  }

  /**
   * 自動關閉過期的訂單（定時任務使用）
   */
  async autoCloseExpiredOrders(): Promise<void> {
    const now = new Date()
    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.OPEN,
      },
      relations: ['items'],
    })

    const ordersToClose = expiredOrders.filter((order) => order.deadline <= now)

    if (ordersToClose.length > 0) {
      for (const order of ordersToClose) {
        order.status = OrderStatus.CLOSED
        await this.orderRepository.save(order)

        // 發送訂單關閉通知
        try {
          const itemCount = order.items?.length || 0
          await this.notificationsSchedulerService.sendOrderSummaryNotification(order, itemCount)
        } catch (error) {
          console.error('發送訂單關閉通知失敗:', error)
        }
      }
      console.log(`自動關閉了 ${ordersToClose.length} 個過期訂單`)
    }
  }

  /**
   * 匯出訂單為 CSV
   */
  async exportOrderToCSV(orderId: number, organizerId: number): Promise<string> {
    const order = await this.findOne(orderId, organizerId)

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('訂單中沒有項目，無法匯出')
    }

    const headers = ['參與者姓名', '品項名稱', '數量', '單價', '小計', '客製化選項', '備註']

    const rows = order.items.map((item) => {
      let customizationOptions = ''
      if (item.customizationOptions) {
        try {
          const parsed = typeof item.customizationOptions === 'string' 
            ? JSON.parse(item.customizationOptions) 
            : item.customizationOptions
          customizationOptions = Object.entries(parsed)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ')
        } catch {
          customizationOptions = String(item.customizationOptions)
        }
      }

      return [
        item.participantName || '未知參與者',
        item.item?.name || '未知品項',
        item.quantity.toString(),
        (item.item?.price || 0).toFixed(2),
        item.subtotal.toFixed(2),
        customizationOptions,
        item.notes || '',
      ]
    })

    const csv = Papa.unparse({
      fields: headers,
      data: rows,
    })

    return csv
  }

  /**
   * 匯出訂單為 PDF
   */
  async exportOrderToPDF(orderId: number, organizerId: number): Promise<Buffer> {
    const order = await this.findOne(orderId, organizerId)

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('訂單中沒有項目，無法匯出')
    }

    // 動態導入 jsPDF（因為它是 CommonJS 模組）
    const jsPDF = (await import('jspdf')).default
    await import('jspdf-autotable')

    const doc = new jsPDF()

    // 訂單標題
    doc.setFontSize(18)
    doc.text(order.name, 14, 20)
    doc.setFontSize(12)
    doc.text(`訂單編號: #${order.id}`, 14, 30)
    doc.text(`店家: ${order.store?.name || '未知店家'}`, 14, 36)
    doc.text(`建立時間: ${new Date(order.createdAt).toLocaleString('zh-TW')}`, 14, 42)
    doc.text(`截止時間: ${new Date(order.deadline).toLocaleString('zh-TW')}`, 14, 48)
    doc.text(`狀態: ${order.status === 'open' ? '開放點餐' : order.status === 'closed' ? '已截止' : '已完成'}`, 14, 54)

    // 準備表格資料
    const tableData = order.items.map((item) => {
      let customizationOptions = ''
      if (item.customizationOptions) {
        try {
          const parsed = typeof item.customizationOptions === 'string' 
            ? JSON.parse(item.customizationOptions) 
            : item.customizationOptions
          customizationOptions = Object.entries(parsed)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ')
        } catch {
          customizationOptions = String(item.customizationOptions)
        }
      }

      return [
        item.participantName || '未知參與者',
        item.item?.name || '未知品項',
        item.quantity.toString(),
        `NT$ ${(item.item?.price || 0).toFixed(2)}`,
        `NT$ ${item.subtotal.toFixed(2)}`,
        customizationOptions || '-',
        item.notes || '-',
      ]
    })

    // 使用 autoTable 插件
    ;(doc as any).autoTable({
      startY: 60,
      head: [['參與者姓名', '品項名稱', '數量', '單價', '小計', '客製化選項', '備註']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
    })

    // 計算總計
    const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0)
    const finalY = (doc as any).lastAutoTable.finalY || 60

    doc.setFontSize(12)
    doc.text(`總計: NT$ ${totalAmount.toFixed(2)}`, 14, finalY + 10)

    return Buffer.from(doc.output('arraybuffer'))
  }
}
