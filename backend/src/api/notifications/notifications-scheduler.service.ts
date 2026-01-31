import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, In } from 'typeorm'
import { Order, OrderStatus } from '../entities/order.entity'
import { NotificationPreference } from '../entities/notification-preference.entity'
import { NotificationsService } from './notifications.service'
import { NotificationType } from '../entities/notification.entity'

@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name)
  private readonly sentDeadlineReminders = new Set<string>() // orderId-userId 組合

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 每分鐘檢查是否需要發送截止提醒
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDeadlineReminders() {
    try {
      // 取得所有開放中的訂單
      const openOrders = await this.orderRepository.find({
        where: { status: OrderStatus.OPEN },
        relations: ['organizer'],
      })

      if (openOrders.length === 0) {
        return
      }

      // 取得所有召集人的通知偏好
      const organizerIds = [...new Set(openOrders.map((o) => o.organizerId))]
      const preferences = await this.preferenceRepository.find({
        where: { userId: In(organizerIds) },
      })

      const preferenceMap = new Map(preferences.map((p) => [p.userId, p]))

      const now = new Date()

      for (const order of openOrders) {
        const preference = preferenceMap.get(order.organizerId)

        // 檢查是否啟用截止提醒
        if (!preference || !preference.orderDeadlineReminder) {
          continue
        }

        // 計算提醒時間
        const reminderMinutes = preference.deadlineReminderMinutes || 30
        const deadline = new Date(order.deadline)
        const reminderTime = new Date(deadline.getTime() - reminderMinutes * 60 * 1000)

        // 檢查是否在提醒時間窗口內（當前時間在提醒時間前後 1 分鐘內）
        const reminderKey = `${order.id}-${order.organizerId}`
        const isWithinWindow =
          now >= reminderTime && now < deadline && !this.sentDeadlineReminders.has(reminderKey)

        if (isWithinWindow) {
          this.logger.log(`Sending deadline reminder for order ${order.id}`)

          await this.notificationsService.sendNotification({
            userId: order.organizerId,
            type: NotificationType.ORDER_DEADLINE_REMINDER,
            title: '訂單即將截止',
            content: `「${order.name}」將在 ${reminderMinutes} 分鐘後截止，請提醒同事趕快點餐！`,
            metadata: { orderId: order.id },
          })

          this.sentDeadlineReminders.add(reminderKey)
        }
      }

      // 清理已過期的提醒記錄
      this.cleanupSentReminders(openOrders)
    } catch (error) {
      this.logger.error(`Deadline reminder error: ${error.message}`)
    }
  }

  /**
   * 清理已過期的提醒記錄
   */
  private cleanupSentReminders(openOrders: Order[]) {
    const activeKeys = new Set(openOrders.map((o) => `${o.id}-${o.organizerId}`))

    for (const key of this.sentDeadlineReminders) {
      if (!activeKeys.has(key)) {
        this.sentDeadlineReminders.delete(key)
      }
    }
  }

  /**
   * 發送訂單建立通知（由 OrdersService 呼叫）
   */
  async sendOrderStartedNotification(order: Order): Promise<void> {
    // 通知召集人（自己）
    await this.notificationsService.sendNotification({
      userId: order.organizerId,
      type: NotificationType.ORDER_STARTED,
      title: '點餐已開始',
      content: `「${order.name}」已建立，截止時間為 ${new Date(order.deadline).toLocaleString('zh-TW')}`,
      metadata: { orderId: order.id, shareToken: order.shareToken },
    })
  }

  /**
   * 發送訂單關閉通知（由 OrdersService 呼叫）
   */
  async sendOrderSummaryNotification(order: Order, itemCount: number): Promise<void> {
    await this.notificationsService.sendNotification({
      userId: order.organizerId,
      type: NotificationType.ORDER_SUMMARY_COMPLETED,
      title: '訂單已截止',
      content: `「${order.name}」已截止，共有 ${itemCount} 筆點餐項目，請前往查看統整結果。`,
      metadata: { orderId: order.id },
    })
  }
}
