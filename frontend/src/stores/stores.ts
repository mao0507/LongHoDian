import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Store, CreateStoreDto, UpdateStoreDto } from '@/types/store'

export const useStoresStore = defineStore('stores', () => {
  const stores = ref<Store[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStores() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Store[]>('/stores')
      stores.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入店家列表失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createStore(storeData: CreateStoreDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<Store>('/stores', storeData)
      stores.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '新增店家失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStore(id: number, storeData: UpdateStoreDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Store>(`/stores/${id}`, storeData)
      const index = stores.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        stores.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新店家失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStore(id: number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/stores/${id}`)
      stores.value = stores.value.filter((s) => s.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || '刪除店家失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Store>(`/stores/${id}/toggle-active`)
      const index = stores.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        stores.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '切換狀態失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    toggleActive,
  }
})
