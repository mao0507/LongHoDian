import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Order, CreateOrderDto, UpdateOrderDto, SubmitOrderDto } from '@/types/order'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 召集人功能
  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Order[]>('/orders')
      orders.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入訂單列表失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createOrder(orderData: CreateOrderDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<Order>('/orders', orderData)
      orders.value.unshift(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '建立訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getOrder(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Order>(`/orders/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(id: number, orderData: UpdateOrderDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Order>(`/orders/${id}`, orderData)
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function regenerateToken(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<Order>(`/orders/${id}/regenerate-token`)
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '重新產生 Token 失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(id: number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/orders/${id}`)
      orders.value = orders.value.filter((o) => o.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || '刪除訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchHistoryOrders(searchParams?: {
    startDate?: string
    endDate?: string
    storeName?: string
    orderName?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (searchParams?.startDate) params.append('startDate', searchParams.startDate)
      if (searchParams?.endDate) params.append('endDate', searchParams.endDate)
      if (searchParams?.storeName) params.append('storeName', searchParams.storeName)
      if (searchParams?.orderName) params.append('orderName', searchParams.orderName)

      const queryString = params.toString()
      const url = `/orders/history${queryString ? `?${queryString}` : ''}`
      const response = await api.get<Order[]>(url)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入歷史訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 匿名用戶功能
  async function getOrderByToken(token: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Order>(`/orders/token/${token}`)
      currentOrder.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '載入訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitOrder(token: string, orderData: SubmitOrderDto) {
    loading.value = true
    error.value = null
    try {
      await api.post(`/orders/token/${token}/submit`, orderData)
    } catch (err: any) {
      error.value = err.response?.data?.message || '提交訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelOrder(token: string, participantName: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/orders/token/${token}/participant/${encodeURIComponent(participantName)}`)
    } catch (err: any) {
      error.value = err.response?.data?.message || '取消訂單失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    createOrder,
    getOrder,
    updateOrder,
    regenerateToken,
    deleteOrder,
    getOrderByToken,
    submitOrder,
    cancelOrder,
    fetchHistoryOrders,
  }
})
