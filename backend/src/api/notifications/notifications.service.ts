import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../entities/notification.entity'
import { NotificationPreference } from '../entities/notification-preference.entity'
import { WebPushSubscription } from '../entities/web-push-subscription.entity'
import { UpdateNotificationPreferenceDto, WebPushSubscriptionDto } from '../dto/notification.dto'
import { LineNotifyService } from './channels/line-notify.service'
import { WebPushService } from './channels/web-push.service'
import { TelegramService } from './channels/telegram.service'

interface SendNotificationOptions {
  userId: number
  type: NotificationType
  title: string
  content: string
  metadata?: Record<string, unknown>
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(WebPushSubscription)
    private webPushSubscriptionRepository: Repository<WebPushSubscription>,
    private lineNotifyService: LineNotifyService,
    private webPushService: WebPushService,
    private telegramService: TelegramService,
  ) {}

  // ==================== 通知偏好設定 ====================

  /**
   * 取得用戶的通知偏好設定（自動建立預設值）
   */
  async getPreferences(userId: number): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({
      where: { userId },
    })

    if (!preference) {
      preference = this.preferenceRepository.create({ userId })
      preference = await this.preferenceRepository.save(preference)
    }

    return preference
  }

  /**
   * 更新用戶的通知偏好設定
   */
  async updatePreferences(
    userId: number,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preference = await this.getPreferences(userId)
    Object.assign(preference, dto)
    return this.preferenceRepository.save(preference)
  }

  // ==================== Web Push 訂閱管理 ====================

  /**
   * 儲存 Web Push 訂閱
   */
  async saveWebPushSubscription(userId: number, dto: WebPushSubscriptionDto): Promise<void> {
    // 檢查是否已存在相同的 endpoint
    const existing = await this.webPushSubscriptionRepository.findOne({
      where: { userId, endpoint: dto.endpoint },
    })

    if (existing) {
      // 更新現有訂閱
      existing.p256dh = dto.keys.p256dh
      existing.auth = dto.keys.auth
      existing.userAgent = dto.userAgent || null
      await this.webPushSubscriptionRepository.save(existing)
    } else {
      // 建立新訂閱
      const subscription = this.webPushSubscriptionRepository.create({
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent || null,
      })
      await this.webPushSubscriptionRepository.save(subscription)
    }

    // 自動啟用 Web Push
    await this.updatePreferences(userId, { webPushEnabled: true })
  }

  /**
   * 刪除 Web Push 訂閱
   */
  async removeWebPushSubscription(userId: number, endpoint: string): Promise<void> {
    await this.webPushSubscriptionRepository.delete({ userId, endpoint })

    // 檢查是否還有其他訂閱
    const count = await this.webPushSubscriptionRepository.count({
      where: { userId },
    })

    if (count === 0) {
      await this.updatePreferences(userId, { webPushEnabled: false })
    }
  }

  /**
   * 取得用戶的所有 Web Push 訂閱
   */
  async getWebPushSubscriptions(userId: number): Promise<WebPushSubscription[]> {
    return this.webPushSubscriptionRepository.find({
      where: { userId },
    })
  }

  // ==================== Line Notify 管理 ====================

  /**
   * 取得 Line Notify 授權 URL
   */
  getLineNotifyAuthUrl(userId: number): string | null {
    if (!this.lineNotifyService.isConfigured()) {
      return null
    }

    // 使用 userId 作為 state 參數
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64')
    return this.lineNotifyService.getAuthUrl(state)
  }

  /**
   * 處理 Line Notify OAuth 回調
   */
  async handleLineNotifyCallback(code: string, state: string): Promise<number> {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    const accessToken = await this.lineNotifyService.exchangeToken(code)

    await this.updatePreferences(userId, { lineNotifyEnabled: true })

    // 儲存 token（透過 preference 更新）
    const preference = await this.getPreferences(userId)
    preference.lineNotifyToken = accessToken
    preference.lineNotifyEnabled = true
    await this.preferenceRepository.save(preference)

    return userId
  }

  /**
   * 撤銷 Line Notify 連結
   */
  async revokeLineNotify(userId: number): Promise<void> {
    const preference = await this.getPreferences(userId)

    if (preference.lineNotifyToken) {
      try {
        await this.lineNotifyService.revokeToken(preference.lineNotifyToken)
      } catch (error) {
        this.logger.error(`Failed to revoke Line Notify token: ${error.message}`)
      }
    }

    preference.lineNotifyToken = null
    preference.lineNotifyEnabled = false
    await this.preferenceRepository.save(preference)
  }

  // ==================== Telegram 管理 ====================

  /**
   * 取得 Telegram Bot 連結 URL
   */
  async getTelegramBotLinkUrl(): Promise<string | null> {
    return this.telegramService.getBotLinkUrl()
  }

  /**
   * 設定 Telegram Chat ID
   */
  async setTelegramChatId(userId: number, chatId: string): Promise<void> {
    const isValid = await this.telegramService.validateChatId(chatId)
    if (!isValid) {
      throw new NotFoundException('無效的 Telegram Chat ID')
    }

    const preference = await this.getPreferences(userId)
    preference.telegramChatId = chatId
    preference.telegramEnabled = true
    await this.preferenceRepository.save(preference)
  }

  /**
   * 撤銷 Telegram 連結
   */
  async revokeTelegram(userId: number): Promise<void> {
    const preference = await this.getPreferences(userId)
    preference.telegramChatId = null
    preference.telegramEnabled = false
    await this.preferenceRepository.save(preference)
  }

  // ==================== 通知記錄管理 ====================

  /**
   * 取得通知記錄
   */
  async getNotifications(
    userId: number,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, unreadOnly = false } = options

    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })

    if (unreadOnly) {
      query.andWhere('notification.isRead = :isRead', { isRead: false })
    }

    const [notifications, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { notifications, total }
  }

  /**
   * 標記通知為已讀
   */
  async markAsRead(userId: number, notificationIds: number[]): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationIds as any, userId },
      { isRead: true },
    )
  }

  /**
   * 標記所有通知為已讀
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true })
  }

  /**
   * 取得未讀通知數量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    })
  }

  // ==================== 發送通知 ====================

  /**
   * 發送通知給用戶（透過所有啟用的管道）
   */
  async sendNotification(options: SendNotificationOptions): Promise<void> {
    const { userId, type, title, content, metadata } = options

    const preference = await this.getPreferences(userId)

    // 檢查通知類型是否啟用
    const isTypeEnabled = this.isNotificationTypeEnabled(preference, type)
    if (!isTypeEnabled) {
      this.logger.log(`Notification type ${type} is disabled for user ${userId}`)
      return
    }

    // 發送到各管道
    const channels: NotificationChannel[] = []

    if (preference.webPushEnabled) {
      channels.push(NotificationChannel.WEB_PUSH)
    }
    if (preference.lineNotifyEnabled && preference.lineNotifyToken) {
      channels.push(NotificationChannel.LINE_NOTIFY)
    }
    if (preference.telegramEnabled && preference.telegramChatId) {
      channels.push(NotificationChannel.TELEGRAM)
    }

    // 為每個管道建立通知記錄並發送
    for (const channel of channels) {
      const notification = this.notificationRepository.create({
        userId,
        type,
        channel,
        title,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: NotificationStatus.PENDING,
      })

      await this.notificationRepository.save(notification)

      try {
        await this.sendToChannel(userId, channel, title, content, preference)
        notification.status = NotificationStatus.SENT
        notification.sentAt = new Date()
      } catch (error) {
        notification.status = NotificationStatus.FAILED
        notification.errorMessage = error.message
        this.logger.error(`Failed to send notification via ${channel}: ${error.message}`)
      }

      await this.notificationRepository.save(notification)
    }
  }

  /**
   * 檢查通知類型是否啟用
   */
  private isNotificationTypeEnabled(
    preference: NotificationPreference,
    type: NotificationType,
  ): boolean {
    switch (type) {
      case NotificationType.ORDER_DEADLINE_REMINDER:
        return preference.orderDeadlineReminder
      case NotificationType.ORDER_SUMMARY_COMPLETED:
        return preference.orderSummaryCompleted
      case NotificationType.ORDER_STARTED:
        return preference.orderStarted
      default:
        return true
    }
  }

  /**
   * 發送到特定管道
   */
  private async sendToChannel(
    userId: number,
    channel: NotificationChannel,
    title: string,
    content: string,
    preference: NotificationPreference,
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.WEB_PUSH:
        await this.sendWebPushNotification(userId, title, content)
        break
      case NotificationChannel.LINE_NOTIFY:
        await this.lineNotifyService.sendNotification(preference.lineNotifyToken!, {
          message: `\n${title}\n${content}`,
        })
        break
      case NotificationChannel.TELEGRAM:
        await this.telegramService.sendMessage(preference.telegramChatId!, {
          text: `<b>${title}</b>\n\n${content}`,
          parseMode: 'HTML',
        })
        break
    }
  }

  /**
   * 發送 Web Push 通知
   */
  private async sendWebPushNotification(
    userId: number,
    title: string,
    body: string,
  ): Promise<void> {
    const subscriptions = await this.getWebPushSubscriptions(userId)

    if (subscriptions.length === 0) {
      throw new Error('No Web Push subscriptions found')
    }

    const payload = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: '/' },
    }

    const results = await this.webPushService.sendNotificationToMultiple(
      subscriptions.map((s) => ({
        endpoint: s.endpoint,
        p256dh: s.p256dh,
        auth: s.auth,
      })),
      payload,
    )

    // 清理失敗的訂閱
    if (results.failedEndpoints.length > 0) {
      for (const endpoint of results.failedEndpoints) {
        await this.webPushSubscriptionRepository.delete({ userId, endpoint })
      }
    }

    if (results.success === 0) {
      throw new Error('All Web Push subscriptions failed')
    }
  }

  // ==================== 測試通知 ====================

  /**
   * 發送測試通知
   */
  async sendTestNotification(userId: number, channel: NotificationChannel): Promise<void> {
    const preference = await this.getPreferences(userId)
    const title = '測試通知'
    const content = '這是一則來自午餐點餐平台的測試通知。'

    await this.sendToChannel(userId, channel, title, content, preference)
  }

  // ==================== 通知管道狀態查詢 ====================

  /**
   * 取得通知管道設定狀態
   */
  getChannelStatus(): {
    lineNotify: { configured: boolean }
    webPush: { configured: boolean; vapidPublicKey: string }
    telegram: { configured: boolean }
  } {
    return {
      lineNotify: {
        configured: this.lineNotifyService.isConfigured(),
      },
      webPush: {
        configured: this.webPushService.isVapidConfigured(),
        vapidPublicKey: this.webPushService.getVapidPublicKey(),
      },
      telegram: {
        configured: this.telegramService.isConfigured(),
      },
    }
  }
}
