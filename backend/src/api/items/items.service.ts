import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as Papa from 'papaparse'
import { Item } from '../entities/item.entity'
import { Store } from '../entities/store.entity'
import { CustomizationOption } from '../entities/customization-option.entity'
import { Order, OrderStatus } from '../entities/order.entity'
import { User } from '../entities/user.entity'
import { CreateItemDto, UpdateItemDto } from '../dto/item.dto'

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(CustomizationOption)
    private customizationOptionRepository: Repository<CustomizationOption>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * 建立品項（僅召集人可操作，且只能在自己的店家中新增）
   */
  async create(createItemDto: CreateItemDto, organizerId: number): Promise<Item> {
    // 驗證店家是否屬於當前召集人
    const store = await this.storeRepository.findOne({
      where: { id: createItemDto.storeId, organizerId },
    })

    if (!store) {
      throw new NotFoundException('店家不存在或您沒有權限')
    }

    const { customizationOptions, ...itemData } = createItemDto

    const item = this.itemRepository.create({
      ...itemData,
      storeId: store.id,
    })

    const savedItem = await this.itemRepository.save(item)

    // 處理客製化選項
    if (customizationOptions && customizationOptions.length > 0) {
      const options = customizationOptions.map((opt) =>
        this.customizationOptionRepository.create({
          itemId: savedItem.id,
          optionName: opt.optionName,
          optionValues: JSON.stringify(opt.optionValues),
          defaultValue: opt.defaultValue,
          template: opt.template,
        }),
      )
      await this.customizationOptionRepository.save(options)
    }

    return this.findOne(savedItem.id, organizerId)
  }

  /**
   * 轉換客製化選項的 optionValues 從 JSON string 到陣列
   */
  private transformItem(item: Item): Item {
    if (item.customizationOptions) {
      item.customizationOptions = item.customizationOptions.map((opt) => ({
        ...opt,
        optionValues: typeof opt.optionValues === 'string' ? JSON.parse(opt.optionValues) : opt.optionValues,
      })) as any
    }
    return item
  }

  /**
   * 取得所有品項（僅召集人可查看自己店家的品項）
   */
  async findAll(organizerId: number, storeId?: number): Promise<Item[]> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.customizationOptions', 'customizationOptions')
      .innerJoin('item.store', 'store')
      .where('store.organizerId = :organizerId', { organizerId })

    if (storeId) {
      queryBuilder.andWhere('item.storeId = :storeId', { storeId })
    }

    const items = await queryBuilder.orderBy('item.sortOrder', 'ASC').addOrderBy('item.createdAt', 'DESC').getMany()
    return items.map((item) => this.transformItem(item))
  }

  /**
   * 取得單一品項
   */
  async findOne(id: number, organizerId: number): Promise<Item> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.customizationOptions', 'customizationOptions')
      .innerJoin('item.store', 'store')
      .where('item.id = :id', { id })
      .andWhere('store.organizerId = :organizerId', { organizerId })
      .getOne()

    if (!item) {
      throw new NotFoundException('品項不存在或您沒有權限')
    }

    return this.transformItem(item)
  }

  /**
   * 更新品項
   */
  async update(id: number, updateItemDto: UpdateItemDto, organizerId: number): Promise<Item> {
    const item = await this.findOne(id, organizerId)

    // 如果更新 storeId，需要驗證新的店家是否屬於當前召集人
    if (updateItemDto.storeId && updateItemDto.storeId !== item.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: updateItemDto.storeId, organizerId },
      })

      if (!store) {
        throw new NotFoundException('店家不存在或您沒有權限')
      }
    }

    const { customizationOptions, ...itemData } = updateItemDto

    Object.assign(item, itemData)

    const savedItem = await this.itemRepository.save(item)

    // 處理客製化選項：先刪除所有現有選項，再新增
    if (customizationOptions !== undefined) {
      await this.customizationOptionRepository.delete({ itemId: id })

      if (customizationOptions.length > 0) {
        const options = customizationOptions.map((opt) =>
          this.customizationOptionRepository.create({
            itemId: id,
            optionName: opt.optionName,
            optionValues: JSON.stringify(opt.optionValues),
            defaultValue: opt.defaultValue,
            template: opt.template,
          }),
        )
        await this.customizationOptionRepository.save(options)
      }
    }

    return this.findOne(id, organizerId)
  }

  /**
   * 刪除品項
   */
  async remove(id: number, organizerId: number): Promise<void> {
    const item = await this.findOne(id, organizerId)
    await this.itemRepository.remove(item)
  }

  /**
   * 切換品項啟用狀態
   */
  async toggleActive(id: number, organizerId: number): Promise<Item> {
    const item = await this.findOne(id, organizerId)
    item.isActive = !item.isActive
    const savedItem = await this.itemRepository.save(item)
    return this.findOne(id, organizerId)
  }

  /**
   * 透過訂單 Token 取得店家的啟用品項（匿名用戶使用）
   */
  async findByOrderToken(token: string): Promise<Item[]> {
    // 驗證訂單 Token 和狀態
    const order = await this.orderRepository.findOne({
      where: { shareToken: token },
      relations: ['store'],
    })

    if (!order) {
      throw new NotFoundException('訂單不存在')
    }

    // 檢查訂單狀態
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException('訂單已關閉，無法點餐')
    }

    // 檢查截止時間
    if (order.deadline <= new Date()) {
      throw new BadRequestException('訂單已截止，無法點餐')
    }

    // 取得該店家的所有啟用品項
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.customizationOptions', 'customizationOptions')
      .where('item.storeId = :storeId', { storeId: order.storeId })
      .andWhere('item.isActive = :isActive', { isActive: true })

    const items = await queryBuilder.orderBy('item.sortOrder', 'ASC').addOrderBy('item.category', 'ASC').addOrderBy('item.createdAt', 'DESC').getMany()
    return items.map((item) => this.transformItem(item))
  }

  /**
   * 產生 CSV 範本
   */
  generateTemplateCSV(): string {
    const headers = [
      '店家ID',
      '品項名稱',
      '價格',
      '分類',
      '描述',
      '備註',
      '圖片URL',
      '排序順序',
      '是否推薦',
      '是否啟用',
      '客製化選項名稱',
      '客製化選項值',
      '客製化選項預設值',
      '客製化選項範本',
    ]

    const exampleRows = [
      [
        '1',
        '珍珠奶茶',
        '50',
        '飲料',
        '經典珍珠奶茶',
        '可調整甜度冰塊',
        'https://example.com/bubble-tea.jpg',
        '0',
        'true',
        'true',
        '大小',
        '小,中,大',
        '中',
        '飲料大小',
      ],
      [
        '1',
        '紅茶',
        '30',
        '飲料',
        '經典紅茶',
        '',
        '',
        '1',
        'false',
        'true',
        '甜度',
        '無糖,微糖,半糖,少糖,正常',
        '正常',
        '甜度',
      ],
    ]

    const csv = Papa.unparse({
      fields: headers,
      data: exampleRows,
    })

    return csv
  }

  /**
   * 從 CSV 匯入品項
   */
  async importItemsFromCSV(csvContent: string, organizerId: number): Promise<{
    success: number
    failed: number
    errors: Array<{ row: number; message: string }>
  }> {
    // 移除 BOM（如果存在）
    const cleanContent = csvContent.replace(/^\ufeff/, '')

    const parseResult = Papa.parse<Record<string, string>>(cleanContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (parseResult.errors.length > 0) {
      throw new BadRequestException(`CSV 解析錯誤：${parseResult.errors[0].message}`)
    }

    const rows = parseResult.data
    if (rows.length === 0) {
      throw new BadRequestException('CSV 檔案中沒有資料')
    }

    let success = 0
    let failed = 0
    const errors: Array<{ row: number; message: string }> = []

    // 按店家ID和品項名稱分組，因為一個品項可能有多行（多個客製化選項）
    const itemGroups = new Map<string, any[]>()

    rows.forEach((row, index) => {
      const storeId = row['店家ID']?.trim()
      const itemName = row['品項名稱']?.trim()

      if (!storeId || !itemName) {
        failed++
        errors.push({ row: index + 2, message: '店家ID 或品項名稱不能為空' })
        return
      }

      const key = `${storeId}_${itemName}`
      if (!itemGroups.has(key)) {
        itemGroups.set(key, [])
      }
      itemGroups.get(key)!.push({ ...row, originalIndex: index + 2 })
    })

    // 處理每個品項
    for (const [key, groupRows] of itemGroups) {
      const firstRow = groupRows[0]
      const storeId = parseInt(firstRow['店家ID']?.trim(), 10)
      const itemName = firstRow['品項名稱']?.trim()

      try {
        // 驗證店家是否屬於當前召集人
        const store = await this.storeRepository.findOne({
          where: { id: storeId, organizerId },
        })

        if (!store) {
          failed++
          errors.push({
            row: firstRow.originalIndex,
            message: `店家 ID ${storeId} 不存在或您沒有權限`,
          })
          continue
        }

        // 解析品項基本資料
        const price = parseFloat(firstRow['價格']?.trim() || '0')
        if (isNaN(price) || price < 0) {
          failed++
          errors.push({
            row: firstRow.originalIndex,
            message: '價格必須為有效的數字且大於等於 0',
          })
          continue
        }

        const category = firstRow['分類']?.trim() || undefined
        const description = firstRow['描述']?.trim() || undefined
        const notes = firstRow['備註']?.trim() || undefined
        const imageUrl = firstRow['圖片URL']?.trim() || undefined
        const sortOrder = parseInt(firstRow['排序順序']?.trim() || '0', 10) || 0
        const isRecommended = firstRow['是否推薦']?.trim().toLowerCase() === 'true'
        const isActive = firstRow['是否啟用']?.trim().toLowerCase() !== 'false' // 預設為 true

        // 收集客製化選項
        const customizationOptions: Array<{
          optionName: string
          optionValues: string[]
          defaultValue?: string
          template?: string
        }> = []

        const optionMap = new Map<string, any>()

        groupRows.forEach((row) => {
          const optionName = row['客製化選項名稱']?.trim()
          if (optionName) {
            if (!optionMap.has(optionName)) {
              optionMap.set(optionName, {
                optionName,
                optionValues: [],
                defaultValue: row['客製化選項預設值']?.trim() || undefined,
                template: row['客製化選項範本']?.trim() || undefined,
              })
            }

            const optionValuesStr = row['客製化選項值']?.trim()
            if (optionValuesStr) {
              const values = optionValuesStr.split(',').map((v) => v.trim()).filter((v) => v)
              const existing = optionMap.get(optionName)!
              existing.optionValues = [...new Set([...existing.optionValues, ...values])]
            }
          }
        })

        customizationOptions.push(...Array.from(optionMap.values()))

        // 驗證客製化選項
        let hasOptionError = false
        for (const opt of customizationOptions) {
          if (!opt.optionName) {
            failed++
            errors.push({
              row: firstRow.originalIndex,
              message: '客製化選項名稱不能為空',
            })
            hasOptionError = true
            break
          }
          if (!opt.optionValues || opt.optionValues.length === 0) {
            failed++
            errors.push({
              row: firstRow.originalIndex,
              message: `客製化選項「${opt.optionName}」至少需要一個選項值`,
            })
            hasOptionError = true
            break
          }
        }

        if (hasOptionError) {
          continue
        }

        // 建立品項
        const createItemDto: CreateItemDto = {
          name: itemName,
          price,
          category,
          description,
          notes,
          imageUrl,
          sortOrder,
          isRecommended,
          storeId,
          isActive,
          customizationOptions: customizationOptions.length > 0 ? customizationOptions : undefined,
        }

        await this.create(createItemDto, organizerId)
        success++
      } catch (error: any) {
        failed++
        errors.push({
          row: firstRow.originalIndex,
          message: error.message || '匯入失敗',
        })
      }
    }

    return { success, failed, errors }
  }
}
