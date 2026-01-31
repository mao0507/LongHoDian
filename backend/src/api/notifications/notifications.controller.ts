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

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== 通知記錄 ====================

  /**
   * 取得通知記錄
   */
  @Get()
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

  /**
   * 取得未讀通知數量
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId)
    return { count }
  }

  /**
   * 標記通知為已讀
   */
  @Post('read')
  @UsePipes(ZodValidationPipe(MarkNotificationReadSchema))
  async markAsRead(@Req() req: AuthenticatedRequest, @Body() dto: MarkNotificationReadDto) {
    await this.notificationsService.markAsRead(req.user.userId, dto.notificationIds)
    return { success: true }
  }

  /**
   * 標記所有通知為已讀
   */
  @Post('read-all')
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.markAllAsRead(req.user.userId)
    return { success: true }
  }

  // ==================== 通知偏好設定 ====================

  /**
   * 取得通知偏好設定
   */
  @Get('preferences')
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

  /**
   * 更新通知偏好設定
   */
  @Patch('preferences')
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

  /**
   * 取得 Line Notify 授權 URL
   */
  @Get('line-notify/auth-url')
  getLineNotifyAuthUrl(@Req() req: AuthenticatedRequest) {
    const authUrl = this.notificationsService.getLineNotifyAuthUrl(req.user.userId)

    if (!authUrl) {
      throw new BadRequestException('Line Notify 尚未設定')
    }

    return { authUrl }
  }

  /**
   * Line Notify OAuth 回調（不需要認證）
   */
  @Public()
  @Get('line-notify/callback')
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

  /**
   * 撤銷 Line Notify 連結
   */
  @Delete('line-notify')
  async revokeLineNotify(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.revokeLineNotify(req.user.userId)
    return { success: true }
  }

  // ==================== Web Push ====================

  /**
   * 取得 VAPID 公鑰
   */
  @Get('web-push/vapid-public-key')
  getVapidPublicKey() {
    const channelStatus = this.notificationsService.getChannelStatus()

    if (!channelStatus.webPush.configured) {
      throw new BadRequestException('Web Push 尚未設定')
    }

    return { vapidPublicKey: channelStatus.webPush.vapidPublicKey }
  }

  /**
   * 儲存 Web Push 訂閱
   */
  @Post('web-push/subscribe')
  @UsePipes(ZodValidationPipe(WebPushSubscriptionSchema))
  async saveWebPushSubscription(
    @Req() req: AuthenticatedRequest,
    @Body() dto: WebPushSubscriptionDto,
  ) {
    await this.notificationsService.saveWebPushSubscription(req.user.userId, dto)
    return { success: true }
  }

  /**
   * 取消 Web Push 訂閱
   */
  @Delete('web-push/subscribe')
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

  /**
   * 取得 Telegram Bot 連結 URL
   */
  @Get('telegram/link-url')
  async getTelegramLinkUrl() {
    const linkUrl = await this.notificationsService.getTelegramBotLinkUrl()

    if (!linkUrl) {
      throw new BadRequestException('Telegram Bot 尚未設定')
    }

    return { linkUrl }
  }

  /**
   * 設定 Telegram Chat ID
   */
  @Patch('telegram/chat-id')
  async setTelegramChatId(@Req() req: AuthenticatedRequest, @Body('chatId') chatId: string) {
    if (!chatId) {
      throw new BadRequestException('缺少 chatId 參數')
    }

    await this.notificationsService.setTelegramChatId(req.user.userId, chatId)
    return { success: true }
  }

  /**
   * 撤銷 Telegram 連結
   */
  @Delete('telegram')
  async revokeTelegram(@Req() req: AuthenticatedRequest) {
    await this.notificationsService.revokeTelegram(req.user.userId)
    return { success: true }
  }

  // ==================== 測試通知 ====================

  /**
   * 發送測試通知
   */
  @Post('test')
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
