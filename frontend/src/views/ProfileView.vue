<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">個人資料</h1>

        <div v-if="loading" class="text-center py-8">
          <div class="text-gray-600">載入中...</div>
        </div>

        <div v-else-if="user" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">使用者名稱</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {{ user.username }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">暱稱</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {{ user.nickname || user.username }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.role === 'organizer'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ user.role === 'organizer' ? '召集人' : '一般用戶' }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">註冊時間</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {{ formatDate(user.createdAt) }}
            </div>
          </div>

          <div class="pt-4 border-t">
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              登出
            </button>
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
