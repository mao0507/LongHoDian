<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">註冊</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            使用者名稱 <span class="text-red-500">*</span>
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1">
            暱稱
          </label>
          <input
            id="nickname"
            v-model="formData.nickname"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入暱稱（選填）"
          />
        </div>

        <div>
          <label class="flex items-center">
            <input
              v-model="isOrganizer"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">我要成為召集人</span>
          </label>
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '註冊中...' : '註冊' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <span class="text-sm text-gray-600">已有帳號？</span>
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-800 ml-1">
          立即登入
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  nickname: '',
})

const isOrganizer = ref(false)
const loading = ref(false)
const error = ref('')

const registerData = computed(() => ({
  username: formData.value.username.trim(),
  nickname: formData.value.nickname.trim() || undefined,
  role: isOrganizer.value ? ('organizer' as const) : undefined,
}))

async function handleRegister() {
  if (!formData.value.username.trim()) {
    error.value = '請輸入使用者名稱'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register(registerData.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || '註冊失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
