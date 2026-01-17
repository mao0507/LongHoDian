<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">登入</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            使用者名稱
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <span class="text-sm text-gray-600">還沒有帳號？</span>
        <router-link to="/register" class="text-sm text-blue-600 hover:text-blue-800 ml-1">
          立即註冊
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value.trim()) {
    error.value = '請輸入使用者名稱'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login({ username: username.value.trim() })
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || '登入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
