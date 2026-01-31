import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as webPush from 'web-push'

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
}

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name)
  private readonly vapidPublicKey: string
  private readonly vapidPrivateKey: string
  private readonly vapidSubject: string
  private isConfigured = false

  constructor(private configService: ConfigService) {
    this.vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY', '')
    this.vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY', '')
    this.vapidSubject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@example.com')

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webPush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey)
      this.isConfigured = true
      this.logger.log('Web Push VAPID configured successfully')
    } else {
      this.logger.warn('Web Push VAPID keys not configured')
    }
  }

  /**
   * 檢查是否已設定 VAPID
   */
  isVapidConfigured(): boolean {
    return this.isConfigured
  }

  /**
   * 取得 VAPID 公鑰
   */
  getVapidPublicKey(): string {
    return this.vapidPublicKey
  }

  /**
   * 發送推播通知
   */
  async sendNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
  ): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Web Push VAPID not configured')
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    }

    try {
      await webPush.sendNotification(pushSubscription, JSON.stringify(payload))
      this.logger.log(`Web Push notification sent to ${subscription.endpoint.substring(0, 50)}...`)
    } catch (error) {
      this.logger.error(`Web Push send failed: ${error.message}`)
      throw error
    }
  }

  /**
   * 批次發送推播通知
   */
  async sendNotificationToMultiple(
    subscriptions: PushSubscription[],
    payload: PushNotificationPayload,
  ): Promise<{ success: number; failed: number; failedEndpoints: string[] }> {
    const results = await Promise.allSettled(
      subscriptions.map((sub) => this.sendNotification(sub, payload)),
    )

    const failedEndpoints: string[] = []
    let success = 0
    let failed = 0

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
        failedEndpoints.push(subscriptions[index].endpoint)
      }
    })

    return { success, failed, failedEndpoints }
  }
}
