<template>
  <DashboardLayout>
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-ds-text mb-ds-300">通知設定</h1>

      <!-- 載入中 -->
      <div v-if="isLoading && !preferences" class="text-center py-ds-400">
        <div class="animate-spin w-8 h-8 border-4 border-ds-border border-t-ds-accent-blue rounded-full mx-auto"></div>
        <p class="mt-ds-200 text-ds-text-subtle">載入中...</p>
      </div>

      <!-- 錯誤訊息 -->
      <div v-else-if="loadError" class="bg-ds-background-danger text-ds-text-accent-red p-ds-200 rounded-ds-100 mb-ds-200">
        {{ loadError }}
      </div>

      <template v-else-if="preferences">
        <!-- 通知類型設定 -->
        <section class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-200 mb-ds-200">
          <h2 class="text-lg font-semibold text-ds-text mb-ds-200">通知類型</h2>
          <p class="text-sm text-ds-text-subtle mb-ds-200">選擇要接收的通知類型</p>

          <div class="space-y-ds-150">
            <label class="flex items-center justify-between p-ds-150 bg-ds-background-neutral rounded-ds-100">
              <div>
                <p class="font-medium text-ds-text">訂單截止提醒</p>
                <p class="text-sm text-ds-text-subtle">在訂單截止前收到提醒</p>
              </div>
              <input
                type="checkbox"
                :checked="preferences.orderDeadlineReminder"
                @change="handlePreferenceChange('orderDeadlineReminder', ($event.target as HTMLInputElement).checked)"
                class="w-5 h-5 text-ds-accent-blue rounded focus:ring-ds-accent-blue"
              />
            </label>

            <!-- 截止提醒時間 -->
            <div v-if="preferences.orderDeadlineReminder" class="ml-ds-200 p-ds-150 bg-ds-background-neutral rounded-ds-100">
              <label class="flex items-center gap-ds-150">
                <span class="text-sm text-ds-text">提前通知時間：</span>
                <select
                  :value="preferences.deadlineReminderMinutes"
                  @change="handlePreferenceChange('deadlineReminderMinutes', parseInt(($event.target as HTMLSelectElement).value))"
                  class="px-ds-100 py-ds-050 bg-ds-surface border border-ds-border rounded-ds-100 text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-accent-blue"
                >
                  <option :value="5">5 分鐘</option>
                  <option :value="10">10 分鐘</option>
                  <option :value="15">15 分鐘</option>
                  <option :value="30">30 分鐘</option>
                  <option :value="60">1 小時</option>
                  <option :value="120">2 小時</option>
                </select>
              </label>
            </div>

            <label class="flex items-center justify-between p-ds-150 bg-ds-background-neutral rounded-ds-100">
              <div>
                <p class="font-medium text-ds-text">訂單統整完成</p>
                <p class="text-sm text-ds-text-subtle">訂單截止後收到統整結果通知</p>
              </div>
              <input
                type="checkbox"
                :checked="preferences.orderSummaryCompleted"
                @change="handlePreferenceChange('orderSummaryCompleted', ($event.target as HTMLInputElement).checked)"
                class="w-5 h-5 text-ds-accent-blue rounded focus:ring-ds-accent-blue"
              />
            </label>

            <label class="flex items-center justify-between p-ds-150 bg-ds-background-neutral rounded-ds-100">
              <div>
                <p class="font-medium text-ds-text">點餐開始通知</p>
                <p class="text-sm text-ds-text-subtle">新訂單建立時收到通知</p>
              </div>
              <input
                type="checkbox"
                :checked="preferences.orderStarted"
                @change="handlePreferenceChange('orderStarted', ($event.target as HTMLInputElement).checked)"
                class="w-5 h-5 text-ds-accent-blue rounded focus:ring-ds-accent-blue"
              />
            </label>
          </div>
        </section>

        <!-- 通知管道設定 -->
        <section class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-200 mb-ds-200">
          <h2 class="text-lg font-semibold text-ds-text mb-ds-200">通知管道</h2>
          <p class="text-sm text-ds-text-subtle mb-ds-200">設定接收通知的方式</p>

          <div class="space-y-ds-200">
            <!-- Web Push -->
            <div class="p-ds-150 border border-ds-border rounded-ds-100">
              <div class="flex items-center justify-between mb-ds-150">
                <div class="flex items-center gap-ds-100">
                  <div class="w-10 h-10 bg-ds-background-information rounded-ds-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-ds-text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-ds-text">瀏覽器推播</p>
                    <p class="text-sm text-ds-text-subtle">透過瀏覽器接收即時通知</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-ds-100 py-ds-025 rounded-full text-xs font-medium',
                    preferences.webPushEnabled ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle'
                  ]"
                >
                  {{ preferences.webPushEnabled ? '已啟用' : '未啟用' }}
                </span>
              </div>

              <div v-if="!channelStatus?.webPush.configured" class="text-sm text-ds-text-subtle">
                Web Push 尚未設定（需要 VAPID 金鑰）
              </div>
              <div v-else class="flex gap-ds-100">
                <button
                  v-if="!preferences.webPushEnabled"
                  @click="handleEnableWebPush"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 bg-ds-accent-blue text-white rounded-ds-100 text-sm hover:bg-ds-accent-blue/90 disabled:opacity-50"
                >
                  啟用推播
                </button>
                <button
                  v-else
                  @click="handleDisableWebPush"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 text-sm hover:bg-ds-background-danger/80 disabled:opacity-50"
                >
                  停用推播
                </button>
                <button
                  v-if="preferences.webPushEnabled"
                  @click="handleTestNotification(NotificationChannel.WEB_PUSH)"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 border border-ds-border text-ds-text rounded-ds-100 text-sm hover:bg-ds-background-neutral disabled:opacity-50"
                >
                  測試通知
                </button>
              </div>
            </div>

            <!-- Line Notify -->
            <div class="p-ds-150 border border-ds-border rounded-ds-100">
              <div class="flex items-center justify-between mb-ds-150">
                <div class="flex items-center gap-ds-100">
                  <div class="w-10 h-10 bg-[#06C755]/10 rounded-ds-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-[#06C755]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .195-.099.41-.247.556l-1.955 2.121v.009c-.075.075-.166.158-.268.177-.042.017-.092.017-.134.017-.158 0-.311-.059-.426-.175l-1.126-.973c-.158-.159-.158-.394 0-.553.158-.158.394-.158.553 0l.797.689 1.7-1.847c.158-.158.394-.158.553 0 .075.075.134.191.134.306 0 .117-.059.233-.134.307l-2.121 2.304c-.042.042-.092.075-.158.092-.042.017-.092.017-.134.017-.117 0-.233-.042-.306-.117l-1.4-1.214c-.158-.158-.158-.394 0-.552.159-.158.394-.158.553 0l.973.847 1.955-2.121c.134-.134.315-.213.503-.213h.001zM12 2c5.514 0 10 4.042 10 9.042 0 4.999-4.486 9.042-10 9.042-1.08 0-2.134-.146-3.119-.421-.233.209-2.99 2.338-3.156 2.338-.033 0-.067-.008-.1-.025-.1-.042-.142-.158-.117-.258.025-.1 1.038-3.828 1.176-4.328C3.583 15.64 2 13.486 2 11.042 2 6.042 6.486 2 12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-ds-text">Line Notify</p>
                    <p class="text-sm text-ds-text-subtle">透過 Line 接收通知</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-ds-100 py-ds-025 rounded-full text-xs font-medium',
                    preferences.lineNotifyConnected ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle'
                  ]"
                >
                  {{ preferences.lineNotifyConnected ? '已連結' : '未連結' }}
                </span>
              </div>

              <div v-if="!channelStatus?.lineNotify.configured" class="text-sm text-ds-text-subtle">
                Line Notify 尚未設定（需要 Client ID 和 Secret）
              </div>
              <div v-else class="flex gap-ds-100">
                <button
                  v-if="!preferences.lineNotifyConnected"
                  @click="handleConnectLineNotify"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 bg-[#06C755] text-white rounded-ds-100 text-sm hover:bg-[#06C755]/90 disabled:opacity-50"
                >
                  連結 Line
                </button>
                <button
                  v-else
                  @click="handleDisconnectLineNotify"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 text-sm hover:bg-ds-background-danger/80 disabled:opacity-50"
                >
                  取消連結
                </button>
                <button
                  v-if="preferences.lineNotifyConnected"
                  @click="handleTestNotification(NotificationChannel.LINE_NOTIFY)"
                  :disabled="isUpdating"
                  class="px-ds-150 py-ds-075 border border-ds-border text-ds-text rounded-ds-100 text-sm hover:bg-ds-background-neutral disabled:opacity-50"
                >
                  測試通知
                </button>
              </div>
            </div>

            <!-- Telegram -->
            <div class="p-ds-150 border border-ds-border rounded-ds-100">
              <div class="flex items-center justify-between mb-ds-150">
                <div class="flex items-center gap-ds-100">
                  <div class="w-10 h-10 bg-[#0088cc]/10 rounded-ds-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.24.37-.49 1.02-.75 4-1.74 6.67-2.89 8.01-3.45 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-ds-text">Telegram</p>
                    <p class="text-sm text-ds-text-subtle">透過 Telegram 接收通知</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-ds-100 py-ds-025 rounded-full text-xs font-medium',
                    preferences.telegramConnected ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle'
                  ]"
                >
                  {{ preferences.telegramConnected ? '已連結' : '未連結' }}
                </span>
              </div>

              <div v-if="!channelStatus?.telegram.configured" class="text-sm text-ds-text-subtle">
                Telegram Bot 尚未設定（需要 Bot Token）
              </div>
              <div v-else>
                <div v-if="!preferences.telegramConnected" class="space-y-ds-100">
                  <p class="text-sm text-ds-text-subtle">
                    1. 點擊下方按鈕開啟 Telegram Bot<br>
                    2. 發送任意訊息給 Bot<br>
                    3. 輸入你的 Chat ID
                  </p>
                  <div class="flex gap-ds-100">
                    <button
                      @click="handleOpenTelegramBot"
                      :disabled="isUpdating"
                      class="px-ds-150 py-ds-075 bg-[#0088cc] text-white rounded-ds-100 text-sm hover:bg-[#0088cc]/90 disabled:opacity-50"
                    >
                      開啟 Telegram Bot
                    </button>
                  </div>
                  <div class="flex gap-ds-100 items-center mt-ds-100">
                    <input
                      v-model="telegramChatId"
                      type="text"
                      placeholder="輸入 Chat ID"
                      class="flex-1 px-ds-100 py-ds-075 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                    />
                    <button
                      @click="handleSetTelegramChatId"
                      :disabled="isUpdating || !telegramChatId"
                      class="px-ds-150 py-ds-075 bg-[#0088cc] text-white rounded-ds-100 text-sm hover:bg-[#0088cc]/90 disabled:opacity-50"
                    >
                      確認
                    </button>
                  </div>
                </div>
                <div v-else class="flex gap-ds-100">
                  <button
                    @click="handleDisconnectTelegram"
                    :disabled="isUpdating"
                    class="px-ds-150 py-ds-075 bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 text-sm hover:bg-ds-background-danger/80 disabled:opacity-50"
                  >
                    取消連結
                  </button>
                  <button
                    @click="handleTestNotification(NotificationChannel.TELEGRAM)"
                    :disabled="isUpdating"
                    class="px-ds-150 py-ds-075 border border-ds-border text-ds-text rounded-ds-100 text-sm hover:bg-ds-background-neutral disabled:opacity-50"
                  >
                    測試通知
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- 成功/錯誤提示 -->
      <div
        v-if="statusMessage"
        :class="[
          'fixed bottom-ds-200 right-ds-200 px-ds-200 py-ds-150 rounded-ds-100 shadow-ds-raised z-50 transition-all',
          statusType === 'success' ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-danger text-ds-text-accent-red'
        ]"
      >
        {{ statusMessage }}
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { NotificationChannel } from '@/types/notification'

const route = useRoute()
const store = useNotificationsStore()

const isLoading = computed<boolean>(() => store.isLoading)
const preferences = computed(() => store.preferences)
const channelStatus = computed(() => store.channelStatus)
const loadError = ref<string | null>(null)
const isUpdating = ref<boolean>(false)
const statusMessage = ref<string | null>(null)
const statusType = ref<'success' | 'error'>('success')

const telegramChatId = ref<string>('')

// 顯示狀態訊息
const showStatus = (message: string, type: 'success' | 'error' = 'success'): void => {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = null
  }, 3000)
}

// 處理偏好設定變更
const handlePreferenceChange = async (key: string, value: boolean | number): Promise<void> => {
  isUpdating.value = true
  try {
    await store.updatePreferences({ [key]: value })
    showStatus('設定已更新')
  } catch {
    showStatus('更新失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Web Push
const handleEnableWebPush = async (): Promise<void> => {
  isUpdating.value = true
  try {
    // 請求通知權限
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      showStatus('請允許瀏覽器通知權限', 'error')
      return
    }

    // 取得 VAPID 公鑰
    const vapidPublicKey = await store.getVapidPublicKey()

    // 註冊 Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // 訂閱推播
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    await store.subscribeWebPush(subscription)
    showStatus('瀏覽器推播已啟用')
  } catch (err) {
    console.error('啟用 Web Push 失敗', err)
    showStatus('啟用失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

const handleDisableWebPush = async (): Promise<void> => {
  isUpdating.value = true
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await store.unsubscribeWebPush(subscription.endpoint)
        await subscription.unsubscribe()
      }
    }
    showStatus('瀏覽器推播已停用')
  } catch {
    showStatus('停用失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Line Notify
const handleConnectLineNotify = async (): Promise<void> => {
  isUpdating.value = true
  try {
    const authUrl = await store.getLineNotifyAuthUrl()
    window.location.href = authUrl
  } catch {
    showStatus('取得授權連結失敗', 'error')
    isUpdating.value = false
  }
}

const handleDisconnectLineNotify = async (): Promise<void> => {
  isUpdating.value = true
  try {
    await store.revokeLineNotify()
    showStatus('Line Notify 已取消連結')
  } catch {
    showStatus('取消連結失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Telegram
const handleOpenTelegramBot = async (): Promise<void> => {
  try {
    const linkUrl = await store.getTelegramLinkUrl()
    window.open(linkUrl, '_blank')
  } catch {
    showStatus('取得 Bot 連結失敗', 'error')
  }
}

const handleSetTelegramChatId = async (): Promise<void> => {
  if (!telegramChatId.value) return

  isUpdating.value = true
  try {
    await store.setTelegramChatId(telegramChatId.value)
    telegramChatId.value = ''
    showStatus('Telegram 已連結')
  } catch {
    showStatus('連結失敗，請確認 Chat ID 是否正確', 'error')
  } finally {
    isUpdating.value = false
  }
}

const handleDisconnectTelegram = async (): Promise<void> => {
  isUpdating.value = true
  try {
    await store.revokeTelegram()
    showStatus('Telegram 已取消連結')
  } catch {
    showStatus('取消連結失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

// 測試通知
const handleTestNotification = async (channel: NotificationChannel): Promise<void> => {
  isUpdating.value = true
  try {
    await store.sendTestNotification(channel)
    showStatus('測試通知已發送')
  } catch {
    showStatus('發送測試通知失敗', 'error')
  } finally {
    isUpdating.value = false
  }
}

// 工具函式：將 Base64 VAPID 公鑰轉換為 Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

onMounted(async () => {
  try {
    await store.fetchPreferences()

    // 處理 Line Notify OAuth 回調
    const lineNotifyStatus = route.query.lineNotify
    if (lineNotifyStatus === 'success') {
      showStatus('Line Notify 連結成功')
      // 重新載入偏好設定
      await store.fetchPreferences()
    } else if (lineNotifyStatus === 'error') {
      showStatus('Line Notify 連結失敗', 'error')
    }
  } catch {
    loadError.value = '載入通知設定失敗'
  }
})
</script>
