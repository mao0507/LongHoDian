<template>
  <div class="relative">
    <!-- 通知鈴鐺按鈕 -->
    <button
      @click="toggleDropdown"
      class="relative p-ds-050 text-ds-text-subtle hover:text-ds-text rounded-ds-100 hover:bg-ds-background-neutral transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- 未讀數量徽章 -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-ds-050 bg-ds-accent-red text-white text-xs font-medium rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 下拉選單 -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-ds-050 w-80 max-h-96 bg-ds-surface rounded-ds-200 shadow-ds-raised border border-ds-border overflow-hidden z-50"
    >
      <!-- 標頭 -->
      <div class="flex items-center justify-between p-ds-150 border-b border-ds-border">
        <h3 class="font-semibold text-ds-text">通知</h3>
        <div class="flex items-center gap-ds-100">
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs text-ds-text-accent-blue hover:underline"
          >
            全部標為已讀
          </button>
          <router-link
            to="/settings/notifications"
            @click="isOpen = false"
            class="text-ds-text-subtle hover:text-ds-text"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="overflow-y-auto max-h-72">
        <div v-if="isLoading" class="p-ds-200 text-center text-ds-text-subtle">
          載入中...
        </div>
        <div v-else-if="notifications.length === 0" class="p-ds-200 text-center text-ds-text-subtle">
          目前沒有通知
        </div>
        <template v-else>
          <NotificationItem
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @click="handleNotificationClick"
          />
        </template>
      </div>

      <!-- 查看全部 -->
      <div v-if="notifications.length > 0" class="p-ds-100 border-t border-ds-border text-center">
        <router-link
          to="/settings/notifications"
          @click="isOpen = false"
          class="text-sm text-ds-text-accent-blue hover:underline"
        >
          管理通知設定
        </router-link>
      </div>
    </div>

    <!-- 點擊外部關閉 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationItem from '@/components/NotificationItem.vue'
import type { Notification } from '@/types/notification'

const store = useNotificationsStore()

const isOpen = ref<boolean>(false)
const isLoading = computed<boolean>(() => store.isLoading)
const notifications = computed<Notification[]>(() => store.notifications)
const unreadCount = computed<number>(() => store.unreadCount)

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    store.fetchNotifications(1, 10)
  }
}

const handleMarkAllAsRead = async (): Promise<void> => {
  await store.markAllAsRead()
}

const handleNotificationClick = async (notification: Notification): Promise<void> => {
  if (!notification.isRead) {
    await store.markAsRead([notification.id])
  }

  // 根據通知類型導航
  if (notification.metadata) {
    try {
      const metadata = JSON.parse(notification.metadata)
      if (metadata.orderId) {
        isOpen.value = false
        // 可以導航到訂單詳情頁
      }
    } catch {
      // 忽略解析錯誤
    }
  }
}

onMounted(() => {
  store.fetchUnreadCount()

  // 每 30 秒更新一次未讀數量
  setInterval(() => {
    store.fetchUnreadCount()
  }, 30000)
})
</script>
