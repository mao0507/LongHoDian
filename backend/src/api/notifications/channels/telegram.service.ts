import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface TelegramMessage {
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name)
  private readonly botToken: string
  private readonly apiBase = 'https://api.telegram.org'

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '')
  }

  /**
   * 檢查 Telegram Bot 是否已設定
   */
  isConfigured(): boolean {
    return !!this.botToken
  }

  /**
   * 取得 Bot 連結 URL
   */
  async getBotLinkUrl(): Promise<string | null> {
    if (!this.isConfigured()) {
      return null
    }

    try {
      const response = await fetch(`${this.apiBase}/bot${this.botToken}/getMe`)
      const data = await response.json()

      if (data.ok && data.result?.username) {
        return `https://t.me/${data.result.username}`
      }

      return null
    } catch (error) {
      this.logger.error(`Failed to get bot info: ${error.message}`)
      return null
    }
  }

  /**
   * 發送訊息
   */
  async sendMessage(chatId: string, message: TelegramMessage): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Telegram Bot not configured')
    }

    const params: Record<string, string> = {
      chat_id: chatId,
      text: message.text,
    }

    if (message.parseMode) {
      params.parse_mode = message.parseMode
    }

    const response = await fetch(`${this.apiBase}/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!data.ok) {
      this.logger.error(`Telegram send failed: ${JSON.stringify(data)}`)
      throw new Error(data.description || '發送 Telegram 訊息失敗')
    }

    this.logger.log(`Telegram message sent to chat ${chatId}`)
  }

  /**
   * 驗證 Chat ID 是否有效
   */
  async validateChatId(chatId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false
    }

    try {
      const response = await fetch(`${this.apiBase}/bot${this.botToken}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: chatId }),
      })

      const data = await response.json()
      return data.ok
    } catch {
      return false
    }
  }
}
