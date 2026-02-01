import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'
import api from '@/utils/api'

// Mock api module
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initial state', () => {
    it('應該初始化為未登入狀態', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isOrganizer).toBe(false)
    })
  })

  describe('login', () => {
    it('應該成功登入並儲存用戶資訊', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            username: 'testuser',
            nickname: '測試用戶',
            role: 'organizer',
          },
          token: 'mock-token-123',
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const store = useAuthStore()
      await store.login({ username: 'testuser', password: 'password123' })

      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.token).toBe('mock-token-123')
      expect(store.isAuthenticated).toBe(true)
      expect(store.isOrganizer).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token-123')
    })

    it('登入失敗時應該拋出錯誤', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('登入失敗'))

      const store = useAuthStore()
      await expect(store.login({ username: 'wrong', password: 'wrong' })).rejects.toThrow('登入失敗')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('應該成功註冊並儲存用戶資訊', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 2,
            username: 'newuser',
            nickname: '新用戶',
            role: 'user',
          },
          token: 'new-token-456',
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const store = useAuthStore()
      await store.register({ username: 'newuser', nickname: '新用戶', role: 'user' })

      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.token).toBe('new-token-456')
      expect(store.isAuthenticated).toBe(true)
      expect(store.isOrganizer).toBe(false)
    })
  })

  describe('logout', () => {
    it('應該清除用戶資訊並移除 token', async () => {
      const store = useAuthStore()
      // 先設定已登入狀態
      store.user = { id: 1, username: 'test', role: 'organizer' } as any
      store.token = 'test-token'

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('fetchProfile', () => {
    it('應該取得並更新用戶資料', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: '測試',
        role: 'organizer',
      }
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockUser } })

      const store = useAuthStore()
      const result = await store.fetchProfile()

      expect(result).toEqual(mockUser)
      expect(store.user).toEqual(mockUser)
    })
  })

  describe('initAuth', () => {
    it('有 token 時應該嘗試載入用戶資料', async () => {
      localStorageMock.getItem.mockReturnValue('existing-token')
      const mockUser = { id: 1, username: 'test', role: 'user' }
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockUser } })

      // 重新建立 pinia 來測試初始化邏輯
      setActivePinia(createPinia())
      const store = useAuthStore()
      await store.initAuth()

      expect(store.user).toEqual(mockUser)
    })

    it('token 無效時應該登出', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

      setActivePinia(createPinia())
      const store = useAuthStore()
      await store.initAuth()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })
  })

  describe('isOrganizer', () => {
    it('用戶為 organizer 時應該返回 true', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'org', role: 'organizer' } as any
      expect(store.isOrganizer).toBe(true)
    })

    it('用戶為 user 時應該返回 false', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'user', role: 'user' } as any
      expect(store.isOrganizer).toBe(false)
    })
  })
})
