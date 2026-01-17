<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- 頁面標題 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">品項管理</h1>
        <button
          @click="showCreateModal = true"
          :disabled="stores.length === 0"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          新增品項
        </button>
      </div>

      <!-- 店家篩選 -->
      <div v-if="stores.length > 0" class="mb-4">
        <label for="storeFilter" class="block text-sm font-medium text-gray-700 mb-2">
          篩選店家
        </label>
        <select
          id="storeFilter"
          v-model="selectedStoreId"
          @change="handleStoreFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option :value="undefined">全部店家</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="itemsStore.error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ itemsStore.error }}
      </div>

      <!-- 載入中 -->
      <div v-if="itemsStore.loading && itemsStore.items.length === 0" class="text-center py-8">
        <div class="text-gray-600">載入中...</div>
      </div>

      <!-- 品項列表 -->
      <div v-else-if="itemsStore.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in itemsStore.items"
          :key="item.id"
          :class="[
            'bg-white rounded-lg shadow-md p-6',
            !item.isActive && 'opacity-60',
          ]"
        >
          <!-- 品項狀態標籤 -->
          <div class="flex justify-between items-start mb-4">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ item.isActive ? '啟用' : '停用' }}
            </span>
            <span v-if="item.category" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {{ item.category }}
            </span>
          </div>

          <!-- 品項資訊 -->
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ item.name }}</h3>
          <div class="text-2xl font-bold text-blue-600 mb-2">NT$ {{ formatPrice(item.price) }}</div>
          <div v-if="item.notes" class="text-sm text-gray-600 mb-4">
            <span class="font-medium">備註：</span>{{ item.notes }}
          </div>
          <div class="text-xs text-gray-500 mb-4">
            店家：{{ getStoreName(item.storeId) }}
          </div>

          <!-- 操作按鈕 -->
          <div class="flex gap-2 mt-4">
            <button
              @click="toggleItemActive(item.id)"
              :class="[
                'flex-1 px-3 py-2 rounded-md text-sm font-medium',
                item.isActive
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200',
              ]"
            >
              {{ item.isActive ? '停用' : '啟用' }}
            </button>
            <button
              @click="editItem(item)"
              class="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm font-medium"
            >
              編輯
            </button>
            <button
              @click="confirmDelete(item)"
              class="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      <!-- 空的品項列表 -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-600 mb-4">
          {{ selectedStoreId ? '此店家目前沒有任何品項' : '目前沒有任何品項' }}
        </p>
        <button
          v-if="stores.length > 0"
          @click="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新增第一個品項
        </button>
        <router-link
          v-else
          to="/stores"
          class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          先去新增店家
        </router-link>
      </div>

      <!-- 新增/編輯品項 Modal -->
      <ItemModal
        v-if="showCreateModal || editingItem"
        :item="editingItem"
        :stores="stores"
        @close="closeModal"
        @saved="handleItemSaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useItemsStore } from '@/stores/items'
import { useStoresStore } from '@/stores/stores'
import ItemModal from '@/components/ItemModal.vue'
import type { Item } from '@/types/item'
import type { Store } from '@/types/store'

const router = useRouter()
const authStore = useAuthStore()
const itemsStore = useItemsStore()
const storesStore = useStoresStore()

const showCreateModal = ref(false)
const editingItem = ref<Item | null>(null)
const selectedStoreId = ref<number | undefined>()

// 檢查是否為召集人
if (!authStore.isOrganizer) {
  router.push('/')
}

const stores = computed(() => storesStore.stores)

onMounted(async () => {
  // 載入店家列表
  if (storesStore.stores.length === 0) {
    await storesStore.fetchStores()
  }
  // 載入品項列表
  await itemsStore.fetchItems()
})

function handleStoreFilterChange() {
  itemsStore.fetchItems(selectedStoreId.value)
}

function editItem(item: Item) {
  editingItem.value = item
}

function toggleItemActive(id: number) {
  itemsStore.toggleActive(id)
}

async function confirmDelete(item: Item) {
  if (confirm(`確定要刪除品項「${item.name}」嗎？此操作無法復原。`)) {
    await itemsStore.deleteItem(item.id)
  }
}

function closeModal() {
  showCreateModal.value = false
  editingItem.value = null
}

async function handleItemSaved() {
  closeModal()
  await itemsStore.fetchItems(selectedStoreId.value)
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

function getStoreName(storeId: number): string {
  const store = stores.value.find((s) => s.id === storeId)
  return store?.name || '未知店家'
}
</script>
