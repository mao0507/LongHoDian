import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { Public } from '../auth/public.decorator'
import { NotificationsService } from './notifications.service'
import {
  UpdateNotificationPreferenceSchema,
  UpdateNotificationPreferenceDto,
  WebPushSubscriptionSchema,
  WebPushSubscriptionDto,
  SendTestNotificationSchema,
  SendTestNotificationDto,
  MarkNotificationReadSchema,
  MarkNotificationReadDto,
} from '../dto/notification.dto'
import { NotificationChannel } from '../entities/notification.entity'
import { ConfigService } from '@nestjs/config'

interface AuthenticatedRequest extends Request {
  user: {
    userId: number
    username: string
    role: string
  }
}

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== 通知記錄 ====================

  @Get()
  @ApiOperation({ summary: '取得通知記錄', description: '取得當前用戶的通知記錄，支援分頁和篩選' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: '頁碼（預設 1）' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '每頁筆數（預設 20）' })
  @ApiQuery({ name: 'unreadOnly', type: 'boolean', required: false, description: '僅顯示未讀通知' })
  @ApiResponse({
    status: 200,
    description: '成功取得通知記錄',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              type: { type: 'string', enum: ['order_started', 'order_deadline_reminder', 'order_summary_completed'] },
              channel: { type: 'string', enum: ['web_push', 'line_notify', 'telegram'] },
              status: { type: 'string', enum: ['pending', 'sent', 'failed', 'read'] },
              title: { type: 'string' },
              content: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const { notifications, total } = await this.notificationsService.getNotifications(
      req.user.userId,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        unreadOnly: unreadOnly === 'true',
      },
    )

    return { notifications, total }
  }

  @Get('unread-count')
  @ApiOperation({ summary: '取得未讀通知數量', description: '取得當前用戶的未讀通知數量' })
  @ApiResponse({
    status: 200,
    description: '成功取得未讀數量',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId)
    return { count }
  }

  @Post('read')
  @ApiOperation({ summary: '標記通知為已讀', description: '將指定的通知標記為已讀' })
  @ApiBody({
    description: '要標記為已讀的通知 ID 列表',
    schema: {
      type: 'object',
      required: ['notificationIds'],
      properties: {
        notificationIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '標記成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @UsePipes(ZodValidationPipe(MarkNotificationReadSchema))
  async markAsRead(@Req() req: AuthenticatedRequest, @Body() dto: MarkNotificationReadDto) {
    await this.notificationsService.markAsRead(req.user.userId, dto.notificationIds)
    return { success: true }
  }

  @Post('read-all')
  @ApiOperation({ summary: '標記所有通知為已讀', description: '將當前用戶的所有通知標記為已讀' })
  @ApiResponse({ status: 200, description: '標記成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.markAllAsRead(req.user.userId)
    return { success: true }
  }

  // ==================== 通知偏好設定 ====================

  @Get('preferences')
  @ApiOperation({ summary: '取得通知偏好設定', description: '取得當前用戶的通知偏好設定及各通道狀態' })
  @ApiResponse({
    status: 200,
    description: '成功取得偏好設定',
    schema: {
      type: 'object',
      properties: {
        preferences: {
          type: 'object',
          properties: {
            lineNotifyEnabled: { type: 'boolean' },
            lineNotifyConnected: { type: 'boolean' },
            webPushEnabled: { type: 'boolean' },
            telegramEnabled: { type: 'boolean' },
            telegramConnected: { type: 'boolean' },
            orderDeadlineReminder: { type: 'boolean' },
            orderSummaryCompleted: { type: 'boolean' },
            orderStarted: { type: 'boolean' },
            deadlineReminderMinutes: { type: 'number' },
          },
        },
        channelStatus: {
          type: 'object',
          properties: {
            lineNotify: { type: 'object', properties: { configured: { type: 'boolean' } } },
            webPush: { type: 'object', properties: { configured: { type: 'boolean' }, vapidPublicKey: { type: 'string' } } },
            telegram: { type: 'object', properties: { configured: { type: 'boolean' } } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async getPreferences(@Req() req: AuthenticatedRequest) {
    const preferences = await this.notificationsService.getPreferences(req.user.userId)
    const channelStatus = this.notificationsService.getChannelStatus()

    // 隱藏敏感資訊
    return {
      preferences: {
        lineNotifyEnabled: preferences.lineNotifyEnabled,
        lineNotifyConnected: !!preferences.lineNotifyToken,
        webPushEnabled: preferences.webPushEnabled,
        telegramEnabled: preferences.telegramEnabled,
        telegramConnected: !!preferences.telegramChatId,
        orderDeadlineReminder: preferences.orderDeadlineReminder,
        orderSummaryCompleted: preferences.orderSummaryCompleted,
        orderStarted: preferences.orderStarted,
        deadlineReminderMinutes: preferences.deadlineReminderMinutes,
      },
      channelStatus,
    }
  }

  @Patch('preferences')
  @ApiOperation({ summary: '更新通知偏好設定', description: '更新當前用戶的通知偏好設定' })
  @ApiBody({
    description: '要更新的偏好設定（所有欄位皆為可選）',
    schema: {
      type: 'object',
      properties: {
        lineNotifyEnabled: { type: 'boolean' },
        webPushEnabled: { type: 'boolean' },
        telegramEnabled: { type: 'boolean' },
        orderDeadlineReminder: { type: 'boolean' },
        orderSummaryCompleted: { type: 'boolean' },
        orderStarted: { type: 'boolean' },
        deadlineReminderMinutes: { type: 'number', minimum: 5, maximum: 120 },
      },
    },
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @UsePipes(ZodValidationPipe(UpdateNotificationPreferenceSchema))
  async updatePreferences(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    const preferences = await this.notificationsService.updatePreferences(req.user.userId, dto)
    return {
      preferences: {
        lineNotifyEnabled: preferences.lineNotifyEnabled,
        lineNotifyConnected: !!preferences.lineNotifyToken,
        webPushEnabled: preferences.webPushEnabled,
        telegramEnabled: preferences.telegramEnabled,
        telegramConnected: !!preferences.telegramChatId,
        orderDeadlineReminder: preferences.orderDeadlineReminder,
        orderSummaryCompleted: preferences.orderSummaryCompleted,
        orderStarted: preferences.orderStarted,
        deadlineReminderMinutes: preferences.deadlineReminderMinutes,
      },
    }
  }

  // ==================== Line Notify ====================

  @Get('line-notify/auth-url')
  @ApiOperation({ summary: '取得 Line Notify 授權 URL', description: '取得 Line Notify OAuth 2.0 授權頁面的 URL' })
  @ApiResponse({
    status: 200,
    description: '成功取得授權 URL',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string', format: 'uri' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Line Notify 尚未設定' })
  @ApiResponse({ status: 401, description: '未授權' })
  getLineNotifyAuthUrl(@Req() req: AuthenticatedRequest) {
    const authUrl = this.notificationsService.getLineNotifyAuthUrl(req.user.userId)

    if (!authUrl) {
      throw new BadRequestException('Line Notify 尚未設定')
    }

    return { authUrl }
  }

  @Public()
  @Get('line-notify/callback')
  @ApiOperation({ summary: 'Line Notify OAuth 回調', description: 'Line Notify OAuth 2.0 授權回調端點（無需認證）' })
  @ApiQuery({ name: 'code', type: 'string', description: '授權碼' })
  @ApiQuery({ name: 'state', type: 'string', description: '狀態參數' })
  @ApiResponse({ status: 302, description: '重導向至前端設定頁面' })
  @ApiResponse({ status: 400, description: '無效的回調參數' })
  async lineNotifyCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code || !state) {
      throw new BadRequestException('無效的回調參數')
    }

    try {
      await this.notificationsService.handleLineNotifyCallback(code, state)
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')
      res.redirect(`${frontendUrl}/settings/notifications?lineNotify=success`)
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')
      res.redirect(`${frontendUrl}/settings/notifications?lineNotify=error`)
    }
  }

  @Delete('line-notify')
  @ApiOperation({ summary: '撤銷 Line Notify 連結', description: '撤銷與 Line Notify 的連結' })
  @ApiResponse({ status: 200, description: '撤銷成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async revokeLineNotify(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.revokeLineNotify(req.user.userId)
    return { success: true }
  }

  // ==================== Web Push ====================

  @Get('web-push/vapid-public-key')
  @ApiOperation({ summary: '取得 VAPID 公鑰', description: '取得 Web Push VAPID 公鑰用於訂閱' })
  @ApiResponse({
    status: 200,
    description: '成功取得 VAPID 公鑰',
    schema: {
      type: 'object',
      properties: {
        vapidPublicKey: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Web Push 尚未設定' })
  getVapidPublicKey() {
    const channelStatus = this.notificationsService.getChannelStatus()

    if (!channelStatus.webPush.configured) {
      throw new BadRequestException('Web Push 尚未設定')
    }

    return { vapidPublicKey: channelStatus.webPush.vapidPublicKey }
  }

  @Post('web-push/subscribe')
  @ApiOperation({ summary: '儲存 Web Push 訂閱', description: '儲存瀏覽器的 Web Push 訂閱資訊' })
  @ApiBody({
    description: 'Web Push 訂閱資訊',
    schema: {
      type: 'object',
      required: ['endpoint', 'keys'],
      properties: {
        endpoint: { type: 'string', format: 'uri' },
        keys: {
          type: 'object',
          properties: {
            p256dh: { type: 'string' },
            auth: { type: 'string' },
          },
        },
        userAgent: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '訂閱成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @UsePipes(ZodValidationPipe(WebPushSubscriptionSchema))
  async saveWebPushSubscription(
    @Req() req: AuthenticatedRequest,
    @Body() dto: WebPushSubscriptionDto,
  ) {
    await this.notificationsService.saveWebPushSubscription(req.user.userId, dto)
    return { success: true }
  }

  @Delete('web-push/subscribe')
  @ApiOperation({ summary: '取消 Web Push 訂閱', description: '取消指定端點的 Web Push 訂閱' })
  @ApiBody({
    description: '要取消訂閱的端點',
    schema: {
      type: 'object',
      required: ['endpoint'],
      properties: {
        endpoint: { type: 'string', format: 'uri' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '取消訂閱成功' })
  @ApiResponse({ status: 400, description: '缺少 endpoint 參數' })
  @ApiResponse({ status: 401, description: '未授權' })
  async removeWebPushSubscription(
    @Req() req: AuthenticatedRequest,
    @Body('endpoint') endpoint: string,
  ) {
    if (!endpoint) {
      throw new BadRequestException('缺少 endpoint 參數')
    }

    await this.notificationsService.removeWebPushSubscription(req.user.userId, endpoint)
    return { success: true }
  }

  // ==================== Telegram ====================

  @Get('telegram/link-url')
  @ApiOperation({ summary: '取得 Telegram Bot 連結 URL', description: '取得 Telegram Bot 的連結 URL' })
  @ApiResponse({
    status: 200,
    description: '成功取得連結 URL',
    schema: {
      type: 'object',
      properties: {
        linkUrl: { type: 'string', format: 'uri' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Telegram Bot 尚未設定' })
  async getTelegramLinkUrl() {
    const linkUrl = await this.notificationsService.getTelegramBotLinkUrl()

    if (!linkUrl) {
      throw new BadRequestException('Telegram Bot 尚未設定')
    }

    return { linkUrl }
  }

  @Patch('telegram/chat-id')
  @ApiOperation({ summary: '設定 Telegram Chat ID', description: '設定用戶的 Telegram Chat ID' })
  @ApiBody({
    description: 'Telegram Chat ID',
    schema: {
      type: 'object',
      required: ['chatId'],
      properties: {
        chatId: { type: 'string', example: '123456789' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '設定成功' })
  @ApiResponse({ status: 400, description: '缺少 chatId 參數' })
  @ApiResponse({ status: 401, description: '未授權' })
  async setTelegramChatId(@Req() req: AuthenticatedRequest, @Body('chatId') chatId: string) {
    if (!chatId) {
      throw new BadRequestException('缺少 chatId 參數')
    }

    await this.notificationsService.setTelegramChatId(req.user.userId, chatId)
    return { success: true }
  }

  @Delete('telegram')
  @ApiOperation({ summary: '撤銷 Telegram 連結', description: '撤銷與 Telegram 的連結' })
  @ApiResponse({ status: 200, description: '撤銷成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async revokeTelegram(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.revokeTelegram(req.user.userId)
    return { success: true }
  }

  // ==================== 測試通知 ====================

  @Post('test')
  @ApiOperation({ summary: '發送測試通知', description: '發送測試通知到指定的通知管道' })
  @ApiBody({
    description: '測試通知參數',
    schema: {
      type: 'object',
      required: ['channel'],
      properties: {
        channel: {
          type: 'string',
          enum: ['web_push', 'line_notify', 'telegram'],
          example: 'web_push',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '測試通知發送成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤或通知管道未設定' })
  @ApiResponse({ status: 401, description: '未授權' })
  @UsePipes(ZodValidationPipe(SendTestNotificationSchema))
  async sendTestNotification(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendTestNotificationDto,
  ) {
    const channel = dto.channel as NotificationChannel
    await this.notificationsService.sendTestNotification(req.user.userId, channel)
    return { success: true }
  }
}
