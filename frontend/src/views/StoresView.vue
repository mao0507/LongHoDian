<template>
  <div class="max-w-7xl mx-auto">
    <!-- 頁面標題和操作按鈕 -->
    <div class="flex justify-between items-center mb-ds-400">
      <h1 class="text-2xl font-semibold text-ds-text">店家管理</h1>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-ds-075 px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>新增店家</span>
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="storesStore.error" class="mb-ds-300 p-ds-200 bg-ds-background-danger border border-ds-border-error text-ds-text-accent-red rounded-ds-100">
      {{ storesStore.error }}
    </div>

    <!-- 載入中 -->
    <div v-if="storesStore.loading && storesStore.stores.length === 0" class="text-center py-ds-800">
      <div class="inline-flex flex-col items-center gap-ds-200">
        <svg class="animate-spin h-8 w-8 text-ds-text-accent-blue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="text-ds-text-subtle">載入中...</div>
      </div>
    </div>

    <!-- 店家列表 -->
    <div v-else-if="storesStore.stores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-300">
      <div
        v-for="store in storesStore.stores"
        :key="store.id"
        :class="[
          'bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
          !store.isActive && 'opacity-60',
        ]"
      >
        <!-- 店家狀態標籤 -->
        <div class="flex justify-between items-start mb-ds-300">
          <span
            :class="[
              'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
              store.isActive ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle',
            ]"
          >
            {{ store.isActive ? '啟用' : '停用' }}
          </span>
        </div>

        <!-- 店家資訊 -->
        <h3 class="text-lg font-semibold text-ds-text mb-ds-150">{{ store.name }}</h3>
        <div v-if="store.contact" class="text-sm text-ds-text-subtle mb-ds-150">
          <span class="font-medium">聯絡方式：</span>{{ store.contact }}
        </div>
        <div v-if="store.notes" class="text-sm text-ds-text-subtle mb-ds-300">
          <span class="font-medium">備註：</span>{{ store.notes }}
        </div>

        <!-- 操作按鈕 -->
        <div class="flex gap-ds-100 mt-ds-300">
          <button
            @click="toggleStoreActive(store.id)"
            :class="[
              'flex-1 px-ds-200 py-ds-075 rounded-ds-100 text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95',
              store.isActive
                ? 'bg-ds-background-warning text-ds-text-accent-yellow hover:bg-ds-background-warning-bold'
                : 'bg-ds-background-success text-ds-text-accent-green hover:bg-ds-background-success-bold',
            ]"
          >
            {{ store.isActive ? '停用' : '啟用' }}
          </button>
          <button
            @click="editStore(store)"
            class="flex-1 px-ds-200 py-ds-075 bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            編輯
          </button>
          <button
            @click="confirmDelete(store)"
            class="flex-1 px-ds-200 py-ds-075 bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger-bold text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 空的店家列表 -->
    <div v-else class="text-center py-ds-1000 bg-ds-surface rounded-ds-200 shadow-ds-raised">
      <div class="inline-flex flex-col items-center gap-ds-300">
        <div class="w-16 h-16 rounded-full bg-ds-background-neutral flex items-center justify-center">
          <svg class="w-8 h-8 text-ds-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p class="text-ds-text font-medium mb-ds-050">目前沒有任何店家</p>
          <p class="text-sm text-ds-text-subtle mb-ds-300">開始建立第一個店家吧</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-ds-075 px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新增第一個店家</span>
        </button>
      </div>
    </div>

    <!-- 新增/編輯店家 Modal -->
    <StoreModal
      v-if="showCreateModal || editingStore"
      :store="editingStore"
      @close="closeModal"
      @saved="handleStoreSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStoresStore } from '@/stores/stores'
import StoreModal from '@/components/StoreModal.vue'
import type { Store } from '@/types/store'

const router = useRouter()
const authStore = useAuthStore()
const storesStore = useStoresStore()

const showCreateModal = ref(false)
const editingStore = ref<Store | null>(null)

// 檢查是否為召集人
if (!authStore.isOrganizer) {
  router.push('/')
}

onMounted(async () => {
  await storesStore.fetchStores()
})

function editStore(store: Store) {
  editingStore.value = store
}

function toggleStoreActive(id: number) {
  storesStore.toggleActive(id)
}

async function confirmDelete(store: Store) {
  if (confirm(`確定要刪除店家「${store.name}」嗎？此操作無法復原。`)) {
    await storesStore.deleteStore(store.id)
  }
}

function closeModal() {
  showCreateModal.value = false
  editingStore.value = null
}

async function handleStoreSaved() {
  closeModal()
  await storesStore.fetchStores()
}
</script>
