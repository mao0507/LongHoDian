import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // Token 會由 auth store 設定
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 回應攔截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 統一錯誤處理
    if (error.response?.status === 401) {
      // Token 過期或無效，清除認證狀態和本地儲存
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // 可以導向登入頁面
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
