<template>
  <div class="min-h-screen bg-gradient-to-br from-ds-background-neutral to-ds-background-neutral-subtle flex items-center justify-center p-ds-300">
    <div class="max-w-md w-full bg-ds-surface rounded-ds-300 shadow-ds-raised p-ds-400 transform transition-all duration-300 hover:shadow-xl">
      <!-- Logo 區域 -->
      <div class="text-center mb-ds-400">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-ds-background-brand rounded-ds-200 mb-ds-200">
          <svg class="w-8 h-8 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-ds-text">登入</h1>
        <p class="text-sm text-ds-text-subtle mt-ds-050">歡迎回來</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-ds-300">
        <div>
          <label for="username" class="block text-sm font-medium text-ds-text mb-ds-075">
            使用者名稱
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-ds-text mb-ds-075">
            密碼
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入密碼"
          />
        </div>

        <div v-if="error" class="p-ds-150 bg-ds-background-danger border border-ds-border-error rounded-ds-100 text-ds-text-accent-red text-sm flex items-center gap-ds-075">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-ds-background-brand text-ds-text-inverse py-ds-150 px-ds-300 rounded-ds-100 hover:bg-ds-background-brand-boldest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span v-if="loading" class="flex items-center justify-center gap-ds-075">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登入中...
          </span>
          <span v-else>登入</span>
        </button>
      </form>

      <div class="mt-ds-300 text-center pt-ds-300 border-t border-ds-border">
        <span class="text-sm text-ds-text-subtle">還沒有帳號？</span>
        <router-link to="/register" class="text-sm text-ds-text-link hover:text-ds-text-link-pressed ml-ds-075 font-medium transition-colors">
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
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value.trim()) {
    error.value = '請輸入使用者名稱'
    return
  }

  if (!password.value) {
    error.value = '請輸入密碼'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login({ username: username.value.trim(), password: password.value })
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || '登入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
