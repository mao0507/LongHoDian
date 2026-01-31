import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface LineNotifyMessage {
  message: string
  imageUrl?: string
}

@Injectable()
export class LineNotifyService {
  private readonly logger = new Logger(LineNotifyService.name)
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectUri: string

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('LINE_NOTIFY_CLIENT_ID', '')
    this.clientSecret = this.configService.get<string>('LINE_NOTIFY_CLIENT_SECRET', '')
    this.redirectUri = this.configService.get<string>(
      'LINE_NOTIFY_REDIRECT_URI',
      'http://localhost:3001/api/notifications/line-notify/callback',
    )
  }

  /**
   * 檢查 Line Notify 是否已設定
   */
  isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret
  }

  /**
   * 取得 OAuth 授權 URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'notify',
      state,
    })

    return `https://notify-bot.line.me/oauth/authorize?${params.toString()}`
  }

  /**
   * 交換 access token
   */
  async exchangeToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const response = await fetch('https://notify-bot.line.me/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      this.logger.error(`Line Notify token exchange failed: ${error}`)
      throw new Error('無法取得 Line Notify access token')
    }

    const data = await response.json()
    return data.access_token
  }

  /**
   * 撤銷 access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    const response = await fetch('https://notify-api.line.me/api/revoke', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      this.logger.error(`Line Notify revoke failed: ${error}`)
      throw new Error('撤銷 Line Notify 連結失敗')
    }
  }

  /**
   * 發送通知
   */
  async sendNotification(accessToken: string, notification: LineNotifyMessage): Promise<void> {
    const params = new URLSearchParams({
      message: notification.message,
    })

    if (notification.imageUrl) {
      params.append('imageThumbnail', notification.imageUrl)
      params.append('imageFullsize', notification.imageUrl)
    }

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      this.logger.error(`Line Notify send failed: ${error}`)
      throw new Error('發送 Line Notify 通知失敗')
    }

    this.logger.log('Line Notify message sent successfully')
  }
}
