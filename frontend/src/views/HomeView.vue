<template>
  <div class="max-w-6xl mx-auto">
    <div class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300">
      <h1 class="text-2xl font-semibold text-ds-text mb-ds-200">歡迎使用午餐點餐協作平台</h1>
      <p class="text-ds-text-subtle mb-ds-400">請從左側選單選擇功能</p>

      <div v-if="authStore.user" class="space-y-ds-400">
        <div class="text-sm text-ds-text-subtle">
          目前角色：
          <span
            :class="[
              'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium ml-ds-100',
              authStore.isOrganizer ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-information text-ds-text-accent-blue',
            ]"
          >
            {{ authStore.isOrganizer ? '召集人' : '一般用戶' }}
          </span>
        </div>

        <!-- 召集人專用功能 -->
        <div v-if="authStore.isOrganizer" class="pt-ds-400 border-t border-ds-border">
          <h2 class="text-lg font-semibold text-ds-text mb-ds-300">快速功能</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-ds-300">
            <router-link
              to="/stores"
              class="block p-ds-300 bg-ds-background-information rounded-ds-100 hover:bg-ds-background-information-bold transition-all duration-200 transform hover:scale-105 hover:shadow-md group"
            >
              <h3 class="font-semibold text-ds-text mb-ds-050 group-hover:text-ds-text-accent-blue transition-colors">店家管理</h3>
              <p class="text-sm text-ds-text-subtle">管理可用店家資訊</p>
            </router-link>
            <router-link
              to="/items"
              class="block p-ds-300 bg-ds-background-success rounded-ds-100 hover:bg-ds-background-success-bold transition-all duration-200 transform hover:scale-105 hover:shadow-md group"
            >
              <h3 class="font-semibold text-ds-text mb-ds-050 group-hover:text-ds-text-accent-green transition-colors">品項管理</h3>
              <p class="text-sm text-ds-text-subtle">管理店家品項與價格</p>
            </router-link>
            <router-link
              to="/orders/create"
              class="block p-ds-300 bg-ds-background-discovery rounded-ds-100 hover:bg-ds-background-discovery-bold transition-all duration-200 transform hover:scale-105 hover:shadow-md group"
            >
              <h3 class="font-semibold text-ds-text mb-ds-050 group-hover:text-ds-text-accent-purple transition-colors">開始點餐</h3>
              <p class="text-sm text-ds-text-subtle">建立新的點餐訂單</p>
            </router-link>
            <router-link
              to="/orders"
              class="block p-ds-300 bg-ds-background-warning rounded-ds-100 hover:bg-ds-background-warning-bold transition-all duration-200 transform hover:scale-105 hover:shadow-md group"
            >
              <h3 class="font-semibold text-ds-text mb-ds-050 group-hover:text-ds-text-accent-yellow transition-colors">訂單管理</h3>
              <p class="text-sm text-ds-text-subtle">查看與管理進行中的訂單</p>
            </router-link>
            <router-link
              to="/orders/history"
              class="block p-ds-300 bg-ds-background-neutral rounded-ds-100 hover:bg-ds-background-neutral-bold transition-all duration-200 transform hover:scale-105 hover:shadow-md group"
            >
              <h3 class="font-semibold text-ds-text mb-ds-050 transition-colors">歷史訂單</h3>
              <p class="text-sm text-ds-text-subtle">查看過去的訂單記錄</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
