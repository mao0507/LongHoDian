import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import type { User } from '@/types/auth'

interface LoginRequest {
  username: string
  password: string
}

interface RegisterRequest {
  username: string
  nickname?: string
  role?: 'user' | 'organizer'
}

interface AuthResponse {
  user: User
  token: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isOrganizer = computed(() => user.value?.role === 'organizer')

  // 初始化：如果已有 token，載入用戶資料
  async function initAuth() {
    if (token.value) {
      try {
        const response = await api.get<{ user: User }>('/auth/me')
        user.value = response.data.user
        setAuthToken(token.value)
      } catch (error) {
        logout()
      }
    }
  }

  async function login(loginData: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/login', loginData)
    const { user: userData, token: tokenData } = response.data

    user.value = userData
    token.value = tokenData
    localStorage.setItem('token', tokenData)
    setAuthToken(tokenData)

    return response.data
  }

  async function register(registerData: RegisterRequest) {
    const response = await api.post<AuthResponse>('/auth/register', registerData)
    const { user: userData, token: tokenData } = response.data

    user.value = userData
    token.value = tokenData
    localStorage.setItem('token', tokenData)
    setAuthToken(tokenData)

    return response.data
  }

  async function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    setAuthToken(null)
  }

  async function fetchProfile() {
    const response = await api.get<{ user: User }>('/auth/profile')
    user.value = response.data.user
    return response.data.user
  }

  function setAuthToken(tokenValue: string | null) {
    if (tokenValue) {
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }

  // 初始化 auth token（僅在客戶端執行）
  if (typeof window !== 'undefined' && token.value) {
    setAuthToken(token.value)
  }

  return {
    user,
    token,
    isAuthenticated,
    isOrganizer,
    login,
    register,
    logout,
    fetchProfile,
    initAuth,
  }
})
