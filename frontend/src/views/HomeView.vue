<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">午餐點餐平台</h1>
          <div class="flex gap-4 items-center">
            <router-link to="/profile" class="text-sm text-gray-600 hover:text-gray-900">
              {{ authStore.user?.nickname || authStore.user?.username || '個人資料' }}
            </router-link>
            <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-800">
              登出
            </button>
          </div>
        </div>
        <p class="text-gray-600 mb-4">歡迎使用午餐點餐協作平台</p>
        <div v-if="authStore.user" class="mt-4 space-y-4">
          <div class="text-sm text-gray-500">
            目前角色：
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2',
                authStore.isOrganizer ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800',
              ]"
            >
              {{ authStore.isOrganizer ? '召集人' : '一般用戶' }}
            </span>
          </div>

          <!-- 召集人專用功能 -->
          <div v-if="authStore.isOrganizer" class="mt-6 pt-6 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">管理功能</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <router-link
                to="/stores"
                class="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 class="font-semibold text-gray-900 mb-1">店家管理</h3>
                <p class="text-sm text-gray-600">管理可用店家資訊</p>
              </router-link>
              <router-link
                to="/items"
                class="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 class="font-semibold text-gray-900 mb-1">品項管理</h3>
                <p class="text-sm text-gray-600">管理店家品項與價格</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
