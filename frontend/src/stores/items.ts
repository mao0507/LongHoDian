import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Item, CreateItemDto, UpdateItemDto } from '@/types/item'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(storeId?: number) {
    loading.value = true
    error.value = null
    try {
      const url = storeId ? `/items?storeId=${storeId}` : '/items'
      const response = await api.get<Item[]>(url)
      items.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入品項列表失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createItem(itemData: CreateItemDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<Item>('/items', itemData)
      items.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '新增品項失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: number, itemData: UpdateItemDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Item>(`/items/${id}`, itemData)
      const index = items.value.findIndex((i) => i.id === id)
      if (index !== -1) {
        items.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新品項失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id: number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/items/${id}`)
      items.value = items.value.filter((i) => i.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || '刪除品項失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Item>(`/items/${id}/toggle-active`)
      const index = items.value.findIndex((i) => i.id === id)
      if (index !== -1) {
        items.value[index] = response.data
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
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleActive,
  }
})
