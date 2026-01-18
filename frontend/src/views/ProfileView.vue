<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300">
      <h1 class="text-2xl font-semibold text-ds-text mb-ds-400">個人資料</h1>

      <div v-if="loading" class="text-center py-ds-800">
        <div class="text-ds-text-subtle">載入中...</div>
      </div>

      <div v-else-if="user" class="space-y-ds-400">
        <div>
          <label class="block text-sm font-medium text-ds-text mb-ds-050">使用者名稱</label>
          <div class="px-ds-200 py-ds-100 bg-ds-background-neutral-subtle border border-ds-border rounded-ds-100 text-ds-text">
            {{ user.username }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ds-text mb-ds-050">暱稱</label>
          <div class="px-ds-200 py-ds-100 bg-ds-background-neutral-subtle border border-ds-border rounded-ds-100 text-ds-text">
            {{ user.nickname || user.username }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ds-text mb-ds-050">角色</label>
          <div class="px-ds-200 py-ds-100 bg-ds-background-neutral-subtle border border-ds-border rounded-ds-100 text-ds-text">
            <span
              :class="[
                'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
                user.role === 'organizer'
                  ? 'bg-ds-background-success text-ds-text-accent-green'
                  : 'bg-ds-background-information text-ds-text-accent-blue',
              ]"
            >
              {{ user.role === 'organizer' ? '召集人' : '一般用戶' }}
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ds-text mb-ds-050">註冊時間</label>
          <div class="px-ds-200 py-ds-100 bg-ds-background-neutral-subtle border border-ds-border rounded-ds-100 text-ds-text">
            {{ formatDate(user.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = ref<User | null>(authStore.user)
const loading = ref(false)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    await authStore.fetchProfile()
    user.value = authStore.user
  } catch (error) {
    console.error('載入個人資料失敗:', error)
  } finally {
    loading.value = false
  }
})
</script>
