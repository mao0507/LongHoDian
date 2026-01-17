<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- 頁面標題 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">店家管理</h1>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          新增店家
        </button>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="storesStore.error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ storesStore.error }}
      </div>

      <!-- 載入中 -->
      <div v-if="storesStore.loading && storesStore.stores.length === 0" class="text-center py-8">
        <div class="text-gray-600">載入中...</div>
      </div>

      <!-- 店家列表 -->
      <div v-else-if="storesStore.stores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="store in storesStore.stores"
          :key="store.id"
          :class="[
            'bg-white rounded-lg shadow-md p-6',
            !store.isActive && 'opacity-60',
          ]"
        >
          <!-- 店家狀態標籤 -->
          <div class="flex justify-between items-start mb-4">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                store.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ store.isActive ? '啟用' : '停用' }}
            </span>
          </div>

          <!-- 店家資訊 -->
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ store.name }}</h3>
          <div v-if="store.contact" class="text-sm text-gray-600 mb-2">
            <span class="font-medium">聯絡方式：</span>{{ store.contact }}
          </div>
          <div v-if="store.notes" class="text-sm text-gray-600 mb-4">
            <span class="font-medium">備註：</span>{{ store.notes }}
          </div>

          <!-- 操作按鈕 -->
          <div class="flex gap-2 mt-4">
            <button
              @click="toggleStoreActive(store.id)"
              :class="[
                'flex-1 px-3 py-2 rounded-md text-sm font-medium',
                store.isActive
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200',
              ]"
            >
              {{ store.isActive ? '停用' : '啟用' }}
            </button>
            <button
              @click="editStore(store)"
              class="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm font-medium"
            >
              編輯
            </button>
            <button
              @click="confirmDelete(store)"
              class="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      <!-- 空的店家列表 -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-600 mb-4">目前沒有任何店家</p>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新增第一個店家
        </button>
      </div>

      <!-- 新增/編輯店家 Modal -->
      <StoreModal
        v-if="showCreateModal || editingStore"
        :store="editingStore"
        @close="closeModal"
        @saved="handleStoreSaved"
      />
    </div>
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
