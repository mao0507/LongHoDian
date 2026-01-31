<template>
  <div
    :class="[
      'p-ds-150 border-b border-ds-border last:border-b-0 transition-colors cursor-pointer hover:bg-ds-background-neutral',
      !notification.isRead && 'bg-ds-background-information/30'
    ]"
    @click="$emit('click', notification)"
  >
    <div class="flex items-start gap-ds-100">
      <!-- 圖標 -->
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', iconClass]">
        <svg v-if="notification.type === 'order_deadline_reminder'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="notification.type === 'order_summary_completed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <!-- 內容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-ds-050">
          <p class="font-medium text-ds-text text-sm truncate">{{ notification.title }}</p>
          <span v-if="!notification.isRead" class="w-2 h-2 bg-ds-accent-blue rounded-full flex-shrink-0"></span>
        </div>
        <p class="text-xs text-ds-text-subtle mt-ds-025 line-clamp-2">{{ notification.content }}</p>
        <div class="flex items-center gap-ds-100 mt-ds-050">
          <span class="text-xs text-ds-text-subtle">{{ formattedTime }}</span>
          <span :class="['text-xs px-ds-050 rounded', channelClass]">{{ channelLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Notification, NotificationType, NotificationChannel } from '@/types/notification'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

defineEmits<{
  click: [notification: Notification]
}>()

const iconClass = computed<string>(() => {
  const classes: Record<NotificationType, string> = {
    order_deadline_reminder: 'bg-ds-background-warning text-ds-text-accent-orange',
    order_summary_completed: 'bg-ds-background-success text-ds-text-accent-green',
    order_started: 'bg-ds-background-information text-ds-text-accent-blue',
  }
  return classes[props.notification.type] || 'bg-ds-background-neutral text-ds-text-subtle'
})

const channelLabel = computed<string>(() => {
  const labels: Record<NotificationChannel, string> = {
    web_push: '推播',
    line_notify: 'Line',
    telegram: 'TG',
  }
  return labels[props.notification.channel] || props.notification.channel
})

const channelClass = computed<string>(() => {
  const classes: Record<NotificationChannel, string> = {
    web_push: 'bg-ds-background-information text-ds-text-accent-blue',
    line_notify: 'bg-[#06C755]/10 text-[#06C755]',
    telegram: 'bg-[#0088cc]/10 text-[#0088cc]',
  }
  return classes[props.notification.channel] || 'bg-ds-background-neutral text-ds-text-subtle'
})

const formattedTime = computed<string>(() => {
  const date = new Date(props.notification.createdAt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-TW')
})
</script>
