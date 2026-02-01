import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStoresStore } from './stores'
import api from '@/utils/api'

// Mock api module
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Stores Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockStore = {
    id: 1,
    name: '測試店家',
    contact: '02-1234-5678',
    notes: '備註',
    imageUrl: null,
    categoryTags: ['便當'],
    sortOrder: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  describe('initial state', () => {
    it('應該初始化為空列表', () => {
      const store = useStoresStore()
      expect(store.stores).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchStores', () => {
    it('應該成功取得店家列表', async () => {
      const mockStores = [mockStore, { ...mockStore, id: 2, name: '店家2' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockStores })

      const store = useStoresStore()
      await store.fetchStores()

      expect(store.stores).toEqual(mockStores)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('取得失敗時應該設定錯誤訊息', async () => {
      vi.mocked(api.get).mockRejectedValueOnce({
        response: { data: { message: '載入失敗' } },
      })

      const store = useStoresStore()
      await expect(store.fetchStores()).rejects.toBeDefined()

      expect(store.error).toBe('載入失敗')
      expect(store.loading).toBe(false)
    })

    it('載入時應該設定 loading 為 true', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(api.get).mockReturnValueOnce(promise as any)

      const store = useStoresStore()
      const fetchPromise = store.fetchStores()

      expect(store.loading).toBe(true)

      resolvePromise!({ data: [] })
      await fetchPromise

      expect(store.loading).toBe(false)
    })
  })

  describe('createStore', () => {
    it('應該成功新增店家', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockStore })

      const store = useStoresStore()
      const result = await store.createStore({ name: '測試店家' })

      expect(result).toEqual(mockStore)
      expect(store.stores).toContainEqual(mockStore)
    })

    it('新增失敗時應該設定錯誤訊息', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: '新增失敗' } },
      })

      const store = useStoresStore()
      await expect(store.createStore({ name: '失敗' })).rejects.toBeDefined()

      expect(store.error).toBe('新增失敗')
    })
  })

  describe('updateStore', () => {
    it('應該成功更新店家', async () => {
      const updatedStore = { ...mockStore, name: '更新後的店家' }
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedStore })

      const store = useStoresStore()
      store.stores = [mockStore]

      const result = await store.updateStore(1, { name: '更新後的店家' })

      expect(result).toEqual(updatedStore)
      expect(store.stores[0].name).toBe('更新後的店家')
    })

    it('更新不存在的店家時不應該拋出錯誤', async () => {
      const updatedStore = { ...mockStore, id: 999 }
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedStore })

      const store = useStoresStore()
      store.stores = [mockStore]

      await store.updateStore(999, { name: '不存在' })

      // 原本的店家應該不變
      expect(store.stores[0].id).toBe(1)
    })
  })

  describe('deleteStore', () => {
    it('應該成功刪除店家', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})

      const store = useStoresStore()
      store.stores = [mockStore, { ...mockStore, id: 2 }]

      await store.deleteStore(1)

      expect(store.stores).toHaveLength(1)
      expect(store.stores[0].id).toBe(2)
    })

    it('刪除失敗時應該保留原列表', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce({
        response: { data: { message: '刪除失敗' } },
      })

      const store = useStoresStore()
      store.stores = [mockStore]

      await expect(store.deleteStore(1)).rejects.toBeDefined()

      // 刪除失敗，原列表應該不變
      expect(store.stores).toHaveLength(1)
    })
  })

  describe('toggleActive', () => {
    it('應該成功切換店家狀態', async () => {
      const toggledStore = { ...mockStore, isActive: false }
      vi.mocked(api.patch).mockResolvedValueOnce({ data: toggledStore })

      const store = useStoresStore()
      store.stores = [mockStore]

      const result = await store.toggleActive(1)

      expect(result.isActive).toBe(false)
      expect(store.stores[0].isActive).toBe(false)
    })
  })
})
