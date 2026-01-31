<template>
  <div class="min-h-screen bg-ds-background-neutral">
    <!-- 手機版側邊欄遮罩 -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="sidebarOpen = false"
      ></div>
    </Transition>

    <!-- 側邊欄 -->
    <aside
      ref="sidebarRef"
      :class="[
        'fixed left-0 top-0 h-full bg-ds-surface border-r border-ds-border z-50',
        'w-72 sm:w-64',
        'transition-transform duration-300 ease-out',
        'will-change-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Logo 和標題 -->
      <div class="flex items-center justify-between p-ds-200 border-b border-ds-border safe-area-top">
        <div class="flex items-center gap-ds-100">
          <div class="w-8 h-8 bg-ds-accent-blue rounded-ds-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-ds-text">午餐點餐</h1>
        </div>
        <button
          @click="sidebarOpen = false"
          class="lg:hidden text-ds-text-subtle hover:text-ds-text p-ds-100 -mr-ds-050 rounded-ds-100 hover:bg-ds-background-neutral active:bg-ds-background-neutral-bold transition-colors touch-manipulation"
          aria-label="關閉選單"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 用戶資訊卡片（手機版） -->
      <div class="lg:hidden p-ds-200 border-b border-ds-border bg-ds-background-neutral-subtle">
        <div class="flex items-center gap-ds-150">
          <div class="w-10 h-10 rounded-full bg-ds-accent-blue flex items-center justify-center text-white font-semibold">
            {{ (authStore.user?.nickname || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-ds-text truncate">{{ authStore.user?.nickname || authStore.user?.username || '使用者' }}</p>
            <span
              :class="[
                'inline-flex items-center px-ds-100 py-ds-025 rounded-full text-xs font-medium',
                authStore.isOrganizer ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-information text-ds-text-accent-blue',
              ]"
            >
              {{ authStore.isOrganizer ? '召集人' : '一般用戶' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 導航選單 -->
      <nav class="p-ds-150 overflow-y-auto flex-1" style="max-height: calc(100vh - 180px);">
        <ul class="space-y-ds-050">
          <li>
            <router-link
              to="/"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'home' }"
              @click="closeSidebarOnMobile"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>首頁</span>
            </router-link>
          </li>

          <!-- 召集人專用選單 -->
          <template v-if="authStore.isOrganizer">
            <li class="pt-ds-200">
              <p class="px-ds-150 py-ds-075 text-xs font-semibold text-ds-text-subtle uppercase tracking-wider">
                管理功能
              </p>
            </li>
            <li>
              <router-link
                to="/stores"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'stores' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>店家管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/items"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'items' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>品項管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders/create"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path.startsWith('/orders/create') }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>開始點餐</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'orders' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>訂單管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders/history"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'orders-history' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>歷史訂單</span>
              </router-link>
            </li>
          </template>

          <!-- 一般功能 -->
          <li class="pt-ds-200">
            <p class="px-ds-150 py-ds-075 text-xs font-semibold text-ds-text-subtle uppercase tracking-wider">
              設定
            </p>
          </li>
          <li>
            <router-link
              to="/profile"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'profile' }"
              @click="closeSidebarOnMobile"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>個人資料</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/settings/notifications"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'notification-settings' }"
              @click="closeSidebarOnMobile"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>通知設定</span>
            </router-link>
          </li>

          <!-- 登出按鈕（手機版） -->
          <li class="lg:hidden pt-ds-200 border-t border-ds-border mt-ds-200">
            <button
              @click="handleLogout"
              class="nav-link w-full text-ds-text-accent-red hover:bg-ds-background-danger"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>登出</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主內容區域 -->
    <div class="lg:pl-64 min-h-screen flex flex-col">
      <!-- 頂部導航欄 -->
      <header class="sticky top-0 z-30 bg-ds-surface/95 backdrop-blur-sm border-b border-ds-border shadow-sm safe-area-top">
        <div class="flex items-center justify-between px-ds-200 py-ds-150 min-h-[56px]">
          <!-- 左側：漢堡選單按鈕 -->
          <button
            @click="sidebarOpen = true"
            class="lg:hidden text-ds-text-subtle hover:text-ds-text p-ds-100 -ml-ds-050 rounded-ds-100 hover:bg-ds-background-neutral active:bg-ds-background-neutral-bold transition-colors touch-manipulation"
            aria-label="開啟選單"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 中間：頁面標題 -->
          <h2 class="text-lg font-semibold text-ds-text lg:hidden">{{ pageTitle }}</h2>
          <h2 class="text-lg font-semibold text-ds-text hidden lg:block">{{ pageTitle }}</h2>

          <!-- 右側：用戶資訊和登出 -->
          <div class="flex items-center gap-ds-100 sm:gap-ds-150">
            <!-- 通知中心 -->
            <NotificationCenter />

            <div class="hidden lg:flex items-center gap-ds-100 text-sm text-ds-text-subtle">
              <span>{{ authStore.user?.nickname || authStore.user?.username || '使用者' }}</span>
              <span
                :class="[
                  'inline-flex items-center px-ds-100 py-ds-025 rounded-full text-xs font-medium',
                  authStore.isOrganizer ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-information text-ds-text-accent-blue',
                ]"
              >
                {{ authStore.isOrganizer ? '召集人' : '一般用戶' }}
              </span>
            </div>
            <button
              @click="handleLogout"
              class="hidden lg:flex items-center gap-ds-050 px-ds-150 py-ds-100 text-sm text-ds-text-subtle hover:text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>登出</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 內容區域 -->
      <main class="flex-1 p-ds-150 sm:p-ds-200 safe-area-bottom">
        <slot />
      </main>
    </div>

    <!-- 邊緣滑動提示區域（僅手機版） -->
    <div
      class="fixed left-0 top-0 w-5 h-full z-30 lg:hidden"
      @touchstart="handleEdgeTouchStart"
      @touchmove="handleEdgeTouchMove"
      @touchend="handleEdgeTouchEnd"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationCenter from '@/components/NotificationCenter.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref<boolean>(false)
const sidebarRef = ref<HTMLElement | null>(null)

// 觸控滑動相關變數
const touchStartX = ref<number>(0)
const touchStartY = ref<number>(0)
const isSwiping = ref<boolean>(false)
const swipeThreshold = 50 // 滑動閾值

// 頁面標題
const pageTitle = computed<string>(() => {
  const titles: Record<string, string> = {
    home: '首頁',
    stores: '店家管理',
    items: '品項管理',
    profile: '個人資料',
    'create-order': '開始點餐',
    orders: '訂單管理',
    'orders-history': '歷史訂單',
    'notification-settings': '通知設定',
  }
  return titles[route.name as string] || '午餐點餐平台'
})

// 手機版點擊連結時關閉側邊欄
const closeSidebarOnMobile = (): void => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

// 處理登出
const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  router.push('/login')
}

// 側邊欄內滑動關閉
const handleTouchStart = (e: TouchEvent): void => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent): void => {
  if (!sidebarOpen.value) return

  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)

  // 如果垂直滑動大於水平滑動，忽略
  if (deltaY > Math.abs(deltaX)) return

  // 向左滑動
  if (deltaX < -swipeThreshold) {
    isSwiping.value = true
  }
}

const handleTouchEnd = (): void => {
  if (isSwiping.value) {
    sidebarOpen.value = false
  }
  isSwiping.value = false
}

// 邊緣滑動打開側邊欄
const handleEdgeTouchStart = (e: TouchEvent): void => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleEdgeTouchMove = (e: TouchEvent): void => {
  if (sidebarOpen.value) return

  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)

  // 如果垂直滑動大於水平滑動，忽略
  if (deltaY > Math.abs(deltaX)) return

  // 向右滑動
  if (deltaX > swipeThreshold) {
    isSwiping.value = true
  }
}

const handleEdgeTouchEnd = (): void => {
  if (isSwiping.value) {
    sidebarOpen.value = true
  }
  isSwiping.value = false
}

// 監聽視窗大小變化
const handleResize = (): void => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false // 大螢幕不需要控制，CSS 會自動顯示
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-ds-150 px-ds-150 py-ds-125 rounded-ds-100 text-ds-text;
  @apply hover:bg-ds-background-neutral active:bg-ds-background-neutral-bold;
  @apply transition-all duration-200 touch-manipulation;
  @apply min-h-[44px]; /* 最小觸控目標尺寸 */
}

.nav-link-active {
  @apply bg-ds-background-selected text-ds-text-accent-blue font-medium;
}

.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
