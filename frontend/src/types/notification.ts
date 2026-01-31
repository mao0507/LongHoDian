export enum NotificationType {
  ORDER_DEADLINE_REMINDER = 'order_deadline_reminder',
  ORDER_SUMMARY_COMPLETED = 'order_summary_completed',
  ORDER_STARTED = 'order_started',
}

export enum NotificationChannel {
  WEB_PUSH = 'web_push',
  LINE_NOTIFY = 'line_notify',
  TELEGRAM = 'telegram',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  content: string
  metadata: string | null
  errorMessage: string | null
  isRead: boolean
  createdAt: string
  sentAt: string | null
}

export interface NotificationPreferences {
  lineNotifyEnabled: boolean
  lineNotifyConnected: boolean
  webPushEnabled: boolean
  telegramEnabled: boolean
  telegramConnected: boolean
  orderDeadlineReminder: boolean
  orderSummaryCompleted: boolean
  orderStarted: boolean
  deadlineReminderMinutes: number
}

export interface ChannelStatus {
  lineNotify: {
    configured: boolean
  }
  webPush: {
    configured: boolean
    vapidPublicKey: string
  }
  telegram: {
    configured: boolean
  }
}

export interface UpdatePreferencesDto {
  lineNotifyEnabled?: boolean
  webPushEnabled?: boolean
  telegramEnabled?: boolean
  telegramChatId?: string | null
  orderDeadlineReminder?: boolean
  orderSummaryCompleted?: boolean
  orderStarted?: boolean
  deadlineReminderMinutes?: number
}
