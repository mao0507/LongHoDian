import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import type {
  Notification,
  NotificationPreferences,
  ChannelStatus,
  UpdatePreferencesDto,
  NotificationChannel,
} from '@/types/notification'

interface PreferencesResponse {
  preferences: NotificationPreferences
  channelStatus: ChannelStatus
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const preferences = ref<NotificationPreferences | null>(null)
  const channelStatus = ref<ChannelStatus | null>(null)
  const unreadCount = ref<number>(0)
  const total = ref<number>(0)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Computed
  const hasUnread = computed<boolean>(() => unreadCount.value > 0)

  // Actions - 通知記錄
  const fetchNotifications = async (
    page = 1,
    limit = 20,
    unreadOnly = false,
  ): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: { page, limit, unreadOnly },
      })
      notifications.value = response.data.notifications
      total.value = response.data.total
    } catch (err) {
      error.value = '取得通知失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count')
      unreadCount.value = response.data.count
    } catch (err) {
      console.error('取得未讀數量失敗', err)
    }
  }

  const markAsRead = async (notificationIds: number[]): Promise<void> => {
    try {
      await api.post('/notifications/read', { notificationIds })
      // 更新本地狀態
      notifications.value = notifications.value.map((n) =>
        notificationIds.includes(n.id) ? { ...n, isRead: true } : n,
      )
      await fetchUnreadCount()
    } catch (err) {
      error.value = '標記已讀失敗'
      throw err
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    try {
      await api.post('/notifications/read-all')
      notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }))
      unreadCount.value = 0
    } catch (err) {
      error.value = '標記已讀失敗'
      throw err
    }
  }

  // Actions - 偏好設定
  const fetchPreferences = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<PreferencesResponse>('/notifications/preferences')
      preferences.value = response.data.preferences
      channelStatus.value = response.data.channelStatus
    } catch (err) {
      error.value = '取得通知設定失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePreferences = async (dto: UpdatePreferencesDto): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch<{ preferences: NotificationPreferences }>(
        '/notifications/preferences',
        dto,
      )
      preferences.value = response.data.preferences
    } catch (err) {
      error.value = '更新通知設定失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Actions - Line Notify
  const getLineNotifyAuthUrl = async (): Promise<string> => {
    const response = await api.get<{ authUrl: string }>('/notifications/line-notify/auth-url')
    return response.data.authUrl
  }

  const revokeLineNotify = async (): Promise<void> => {
    await api.delete('/notifications/line-notify')
    if (preferences.value) {
      preferences.value.lineNotifyEnabled = false
      preferences.value.lineNotifyConnected = false
    }
  }

  // Actions - Web Push
  const getVapidPublicKey = async (): Promise<string> => {
    const response = await api.get<{ vapidPublicKey: string }>(
      '/notifications/web-push/vapid-public-key',
    )
    return response.data.vapidPublicKey
  }

  const subscribeWebPush = async (subscription: PushSubscription): Promise<void> => {
    const json = subscription.toJSON()
    await api.post('/notifications/web-push/subscribe', {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
      userAgent: navigator.userAgent,
    })
    if (preferences.value) {
      preferences.value.webPushEnabled = true
    }
  }

  const unsubscribeWebPush = async (endpoint: string): Promise<void> => {
    await api.delete('/notifications/web-push/subscribe', {
      data: { endpoint },
    })
    if (preferences.value) {
      preferences.value.webPushEnabled = false
    }
  }

  // Actions - Telegram
  const getTelegramLinkUrl = async (): Promise<string> => {
    const response = await api.get<{ linkUrl: string }>('/notifications/telegram/link-url')
    return response.data.linkUrl
  }

  const setTelegramChatId = async (chatId: string): Promise<void> => {
    await api.patch('/notifications/telegram/chat-id', { chatId })
    if (preferences.value) {
      preferences.value.telegramEnabled = true
      preferences.value.telegramConnected = true
    }
  }

  const revokeTelegram = async (): Promise<void> => {
    await api.delete('/notifications/telegram')
    if (preferences.value) {
      preferences.value.telegramEnabled = false
      preferences.value.telegramConnected = false
    }
  }

  // Actions - 測試通知
  const sendTestNotification = async (channel: NotificationChannel): Promise<void> => {
    await api.post('/notifications/test', { channel })
  }

  // Reset
  const reset = (): void => {
    notifications.value = []
    preferences.value = null
    channelStatus.value = null
    unreadCount.value = 0
    total.value = 0
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    notifications,
    preferences,
    channelStatus,
    unreadCount,
    total,
    isLoading,
    error,
    // Computed
    hasUnread,
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    fetchPreferences,
    updatePreferences,
    getLineNotifyAuthUrl,
    revokeLineNotify,
    getVapidPublicKey,
    subscribeWebPush,
    unsubscribeWebPush,
    getTelegramLinkUrl,
    setTelegramChatId,
    revokeTelegram,
    sendTestNotification,
    reset,
  }
})
