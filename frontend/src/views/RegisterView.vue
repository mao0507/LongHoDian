<template>
  <div class="min-h-screen bg-gradient-to-br from-ds-background-neutral to-ds-background-neutral-subtle flex items-center justify-center p-ds-300">
    <div class="max-w-md w-full bg-ds-surface rounded-ds-300 shadow-ds-raised p-ds-400 transform transition-all duration-300 hover:shadow-xl">
      <!-- Logo 區域 -->
      <div class="text-center mb-ds-400">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-ds-background-brand rounded-ds-200 mb-ds-200">
          <svg class="w-8 h-8 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-ds-text">註冊</h1>
        <p class="text-sm text-ds-text-subtle mt-ds-050">建立新帳號</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-ds-300">
        <div>
          <label for="username" class="block text-sm font-medium text-ds-text mb-ds-075">
            使用者名稱 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div>
          <label for="nickname" class="block text-sm font-medium text-ds-text mb-ds-075">
            暱稱
          </label>
          <input
            id="nickname"
            v-model="formData.nickname"
            type="text"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入暱稱（選填）"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-ds-text mb-ds-075">
            密碼 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            minlength="6"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入密碼（至少 6 個字元）"
          />
        </div>

        <div>
          <label class="flex items-center cursor-pointer group">
            <input
              v-model="isOrganizer"
              type="checkbox"
              class="w-4 h-4 rounded border-ds-border text-ds-background-brand focus:ring-ds-border-focus focus:ring-2 cursor-pointer transition-colors"
            />
            <span class="ml-ds-150 text-sm text-ds-text group-hover:text-ds-text-accent-blue transition-colors">我要成為召集人</span>
          </label>
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
            註冊中...
          </span>
          <span v-else>註冊</span>
        </button>
      </form>

      <div class="mt-ds-300 text-center pt-ds-300 border-t border-ds-border">
        <span class="text-sm text-ds-text-subtle">已有帳號？</span>
        <router-link to="/login" class="text-sm text-ds-text-link hover:text-ds-text-link-pressed ml-ds-075 font-medium transition-colors">
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
  password: '',
})

const isOrganizer = ref(false)
const loading = ref(false)
const error = ref('')

const registerData = computed(() => ({
  username: formData.value.username.trim(),
  nickname: formData.value.nickname.trim() || undefined,
  password: formData.value.password,
  role: isOrganizer.value ? ('organizer' as const) : undefined,
}))

async function handleRegister() {
  if (!formData.value.username.trim()) {
    error.value = '請輸入使用者名稱'
    return
  }

  if (!formData.value.password || formData.value.password.length < 6) {
    error.value = '密碼至少需要 6 個字元'
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
