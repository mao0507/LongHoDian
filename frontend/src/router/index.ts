import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoresView.vue'),
    meta: { requiresAuth: true, requiresOrganizer: true },
  },
  {
    path: '/items',
    name: 'items',
    component: () => import('@/views/ItemsView.vue'),
    meta: { requiresAuth: true, requiresOrganizer: true },
  },
  {
    path: '/orders/create',
    name: 'create-order',
    component: () => import('@/views/CreateOrderView.vue'),
    meta: { requiresAuth: true, requiresOrganizer: true },
  },
  {
    path: '/order/:token',
    name: 'order',
    component: () => import('@/views/OrderView.vue'),
    meta: { isPublic: true }, // 匿名用戶可訪問
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true, requiresOrganizer: true },
  },
  {
    path: '/orders/history',
    name: 'orders-history',
    component: () => import('@/views/HistoryOrdersView.vue'),
    meta: { requiresAuth: true, requiresOrganizer: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化認證狀態
  if (!authStore.isAuthenticated && authStore.token) {
    await authStore.initAuth()
  }

  // 檢查是否需要認證
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 檢查是否需要訪客（已登入則跳轉）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // 檢查是否需要召集人權限
  if (to.meta.requiresOrganizer && !authStore.isOrganizer) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
