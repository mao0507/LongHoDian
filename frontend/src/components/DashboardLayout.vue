<template>
  <div class="min-h-screen bg-ds-background-neutral">
    <!-- 手機版側邊欄遮罩 -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 側邊欄 -->
    <aside
      :class="[
        'fixed left-0 top-0 h-full bg-ds-surface border-r border-ds-border z-50 transition-transform duration-300 ease-in-out',
        'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo 和標題 -->
      <div class="flex items-center justify-between p-ds-200 border-b border-ds-border">
        <h1 class="text-lg font-semibold text-ds-text">午餐點餐平台</h1>
        <button
          @click="sidebarOpen = false"
          class="lg:hidden text-ds-text-subtle hover:text-ds-text p-ds-050"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 導航選單 -->
      <nav class="p-ds-100">
        <ul class="space-y-ds-050">
          <li>
            <router-link
              to="/"
              class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
              :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'home' }"
              @click="closeSidebarOnMobile"
            >
              <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="transition-all duration-200">首頁</span>
            </router-link>
          </li>

          <!-- 召集人專用選單 -->
          <template v-if="authStore.isOrganizer">
            <li class="pt-ds-200 border-t border-ds-border">
              <p class="px-ds-100 py-ds-050 text-xs font-semibold text-ds-text-subtle uppercase tracking-wider">
                管理功能
              </p>
            </li>
            <li>
              <router-link
                to="/stores"
                class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
                :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'stores' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="transition-all duration-200">店家管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/items"
                class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
                :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'items' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span class="transition-all duration-200">品項管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders/create"
                class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
                :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.path.startsWith('/orders/create') }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="transition-all duration-200">開始點餐</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders"
                class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
                :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'orders' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span class="transition-all duration-200">訂單管理</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders/history"
                class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
                :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'orders-history' }"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="transition-all duration-200">歷史訂單</span>
              </router-link>
            </li>
          </template>

          <!-- 一般功能 -->
          <li class="pt-ds-200 border-t border-ds-border">
            <router-link
              to="/profile"
              class="flex items-center gap-ds-100 p-ds-100 rounded-ds-100 text-ds-text hover:bg-ds-background-neutral transition-all duration-200 group"
              :class="{ 'bg-ds-background-selected text-ds-text-accent-blue font-medium shadow-sm': $route.name === 'profile' }"
              @click="closeSidebarOnMobile"
            >
              <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="transition-all duration-200">個人資料</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主內容區域 -->
    <div class="lg:pl-64">
      <!-- 頂部導航欄 -->
      <header class="sticky top-0 z-30 bg-ds-surface border-b border-ds-border shadow-ds-raised">
        <div class="flex items-center justify-between px-ds-200 py-ds-150">
          <!-- 左側：漢堡選單按鈕 -->
          <button
            @click="sidebarOpen = true"
            class="lg:hidden text-ds-text-subtle hover:text-ds-text p-ds-050"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 中間：頁面標題（手機版） -->
          <h2 class="lg:hidden text-lg font-semibold text-ds-text">{{ pageTitle }}</h2>

          <!-- 右側：用戶資訊和登出 -->
          <div class="flex items-center gap-ds-150 ml-auto">
            <div class="hidden sm:flex items-center gap-ds-100 text-sm text-ds-text-subtle">
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
              class="flex items-center gap-ds-050 px-ds-150 py-ds-075 text-sm text-ds-text-subtle hover:text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 內容區域 -->
      <main class="p-ds-200">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

// 頁面標題
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    home: '首頁',
    stores: '店家管理',
    items: '品項管理',
    profile: '個人資料',
    'orders-create': '開始點餐',
    orders: '訂單管理',
    'orders-history': '歷史訂單',
  }
  return titles[route.name as string] || '午餐點餐平台'
})

// 手機版點擊連結時關閉側邊欄
function closeSidebarOnMobile() {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

// 處理登出
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

// 監聽視窗大小變化，在大螢幕時自動打開側邊欄
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      sidebarOpen.value = true
    }
  }
  handleResize()
  window.addEventListener('resize', handleResize)
})
</script>
