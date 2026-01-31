import { z } from 'zod'

// 更新通知偏好設定 Schema
export const UpdateNotificationPreferenceSchema = z.object({
  // Line Notify 設定
  lineNotifyEnabled: z.boolean().optional(),

  // Web Push 設定
  webPushEnabled: z.boolean().optional(),

  // Telegram 設定
  telegramEnabled: z.boolean().optional(),
  telegramChatId: z.string().max(100).optional().nullable(),

  // 通知類型開關
  orderDeadlineReminder: z.boolean().optional(),
  orderSummaryCompleted: z.boolean().optional(),
  orderStarted: z.boolean().optional(),

  // 截止提醒時間設定（分鐘）
  deadlineReminderMinutes: z.number().int().min(5).max(120).optional(),
})

export type UpdateNotificationPreferenceDto = z.infer<typeof UpdateNotificationPreferenceSchema>

// Web Push 訂閱 Schema
export const WebPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
})

export type WebPushSubscriptionDto = z.infer<typeof WebPushSubscriptionSchema>

// 發送測試通知 Schema
export const SendTestNotificationSchema = z.object({
  channel: z.enum(['web_push', 'line_notify', 'telegram']),
})

export type SendTestNotificationDto = z.infer<typeof SendTestNotificationSchema>

// 通知記錄查詢參數 Schema
export const GetNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  unreadOnly: z.coerce.boolean().default(false).optional(),
})

export type GetNotificationsQueryDto = z.infer<typeof GetNotificationsQuerySchema>

// 標記通知為已讀 Schema
export const MarkNotificationReadSchema = z.object({
  notificationIds: z.array(z.number().int().positive()).min(1),
})

export type MarkNotificationReadDto = z.infer<typeof MarkNotificationReadSchema>
