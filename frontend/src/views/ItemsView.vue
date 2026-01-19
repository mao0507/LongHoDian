<template>
  <div class="max-w-7xl mx-auto">
    <!-- 頁面標題和操作按鈕 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-ds-200 mb-ds-400">
      <h1 class="text-2xl font-semibold text-ds-text">品項管理</h1>
      <div class="flex flex-wrap gap-ds-150">
        <button
          @click="handleDownloadTemplate"
          :disabled="!authStore.isOrganizer"
          class="flex items-center gap-ds-075 px-ds-200 py-ds-100 border border-ds-border bg-ds-surface text-ds-text rounded-ds-100 hover:bg-ds-background-neutral transition-colors focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>下載範本</span>
        </button>
        <label
          :class="[
            'flex items-center gap-ds-075 px-ds-200 py-ds-100 border border-ds-border bg-ds-surface text-ds-text rounded-ds-100 hover:bg-ds-background-neutral transition-colors focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 cursor-pointer',
            (!authStore.isOrganizer || stores.length === 0) && 'opacity-50 cursor-not-allowed',
          ]"
        >
          <input
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            :disabled="!authStore.isOrganizer || stores.length === 0"
            class="hidden"
          />
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>批量匯入</span>
        </label>
        <button
          @click="showCreateModal = true"
          :disabled="stores.length === 0"
          class="flex items-center gap-ds-075 px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新增品項</span>
        </button>
      </div>
    </div>

    <!-- 店家篩選 -->
    <div v-if="stores.length > 0" class="mb-ds-300">
      <label for="storeFilter" class="block text-sm font-medium text-ds-text mb-ds-100">
        篩選店家
      </label>
      <select
        id="storeFilter"
        v-model="selectedStoreId"
        @change="handleStoreFilterChange"
        class="px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 shadow-ds-surface focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus bg-ds-surface text-ds-text"
      >
        <option :value="undefined">全部店家</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="itemsStore.error" class="mb-ds-300 p-ds-200 bg-ds-background-danger border border-ds-border-error text-ds-text-accent-red rounded-ds-100">
      {{ itemsStore.error }}
    </div>

    <!-- 載入中 -->
    <div v-if="itemsStore.loading && itemsStore.items.length === 0" class="text-center py-ds-800">
      <div class="inline-flex flex-col items-center gap-ds-200">
        <svg class="animate-spin h-8 w-8 text-ds-text-accent-blue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="text-ds-text-subtle">載入中...</div>
      </div>
    </div>

    <!-- 品項列表 -->
    <div v-else-if="itemsStore.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-300">
      <div
        v-for="item in itemsStore.items"
        :key="item.id"
        :class="[
          'bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
          !item.isActive && 'opacity-60',
        ]"
      >
        <!-- 品項圖片 -->
        <div v-if="item.imageUrl" class="mb-ds-200 rounded-ds-100 overflow-hidden bg-ds-background-neutral-subtle">
          <img :src="item.imageUrl" :alt="item.name" class="w-full h-40 object-cover" />
        </div>

        <!-- 品項狀態標籤 -->
        <div class="flex justify-between items-start mb-ds-300 flex-wrap gap-ds-100">
          <div class="flex gap-ds-075 flex-wrap">
            <span
              :class="[
                'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
                item.isActive ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle',
              ]"
            >
              {{ item.isActive ? '啟用' : '停用' }}
            </span>
            <span
              v-if="item.isRecommended"
              class="inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium bg-ds-background-warning text-ds-text-accent-yellow"
            >
              推薦
            </span>
            <span v-if="item.category" class="text-xs text-ds-text-subtle bg-ds-background-neutral px-ds-100 py-ds-050 rounded-ds-050">
              {{ item.category }}
            </span>
          </div>
        </div>

        <!-- 品項資訊 -->
        <h3 class="text-lg font-semibold text-ds-text mb-ds-150">{{ item.name }}</h3>
        <div v-if="item.description" class="text-sm text-ds-text-subtle mb-ds-150 line-clamp-2">
          {{ item.description }}
        </div>
        <div class="text-2xl font-bold text-ds-text-accent-blue mb-ds-150">NT$ {{ formatPrice(item.price) }}</div>
        <div v-if="item.notes" class="text-sm text-ds-text-subtle mb-ds-300">
          <span class="font-medium">備註：</span>{{ item.notes }}
        </div>
        <div class="text-xs text-ds-text-subtle mb-ds-300">
          店家：{{ getStoreName(item.storeId) }}
        </div>

        <!-- 操作按鈕 -->
        <div class="flex gap-ds-100 mt-ds-300">
          <button
            @click="toggleItemActive(item.id)"
            :class="[
              'flex-1 px-ds-200 py-ds-075 rounded-ds-100 text-sm font-medium transition-colors',
              item.isActive
                ? 'bg-ds-background-warning text-ds-text-accent-yellow hover:bg-ds-background-warning-bold'
                : 'bg-ds-background-success text-ds-text-accent-green hover:bg-ds-background-success-bold',
            ]"
          >
            {{ item.isActive ? '停用' : '啟用' }}
          </button>
          <button
            @click="editItem(item)"
            class="flex-1 px-ds-200 py-ds-075 bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold text-sm font-medium transition-colors"
          >
            編輯
          </button>
          <button
            @click="confirmDelete(item)"
            class="flex-1 px-ds-200 py-ds-075 bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger-bold text-sm font-medium transition-colors"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 空的品項列表 -->
    <div v-else class="text-center py-ds-1000 bg-ds-surface rounded-ds-200 shadow-ds-raised">
      <p class="text-ds-text-subtle mb-ds-300">
        {{ selectedStoreId ? '此店家目前沒有任何品項' : '目前沒有任何品項' }}
      </p>
      <button
        v-if="stores.length > 0"
        @click="showCreateModal = true"
        class="px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors"
      >
        新增第一個品項
      </button>
      <router-link
        v-else
        to="/stores"
        class="inline-block px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors"
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

    <!-- 匯入結果 Modal -->
    <div
      v-if="importResult"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="importResult = null"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 animate-scaleIn">
        <div class="flex items-center justify-between p-ds-400 pb-ds-200 border-b border-ds-border flex-shrink-0">
          <h2 class="text-xl font-semibold text-ds-text">匯入結果</h2>
          <button
            @click="importResult = null"
            class="text-ds-text-subtle hover:text-ds-text hover:bg-ds-background-neutral rounded-ds-050 p-ds-075 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-ds-400 py-ds-300">
          <div class="space-y-ds-300">
            <div class="grid grid-cols-2 gap-ds-200">
              <div class="p-ds-200 bg-ds-background-success rounded-ds-100">
                <div class="text-sm text-ds-text-subtle mb-ds-050">成功</div>
                <div class="text-2xl font-bold text-ds-text-accent-green">{{ importResult.success }}</div>
              </div>
              <div class="p-ds-200 bg-ds-background-danger rounded-ds-100">
                <div class="text-sm text-ds-text-subtle mb-ds-050">失敗</div>
                <div class="text-2xl font-bold text-ds-text-accent-red">{{ importResult.failed }}</div>
              </div>
            </div>
            <div v-if="importResult.errors && importResult.errors.length > 0" class="mt-ds-300">
              <h3 class="text-sm font-medium text-ds-text mb-ds-150">錯誤詳情：</h3>
              <div class="max-h-60 overflow-y-auto space-y-ds-100">
                <div
                  v-for="(error, index) in importResult.errors"
                  :key="index"
                  class="p-ds-150 bg-ds-background-danger-subtle border border-ds-border-error rounded-ds-100 text-sm"
                >
                  <span class="font-medium">第 {{ error.row }} 行：</span>
                  <span class="text-ds-text-accent-red">{{ error.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-ds-150 p-ds-400 pt-ds-300 border-t border-ds-border flex-shrink-0">
          <button
            @click="importResult = null; itemsStore.fetchItems(selectedStoreId)"
            class="flex-1 bg-ds-background-brand text-ds-text-inverse px-ds-300 py-ds-100 rounded-ds-100 hover:bg-ds-background-brand-boldest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 font-medium transition-all duration-200"
          >
            確定
          </button>
        </div>
      </div>
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
const importResult = ref<{
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
} | null>(null)

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

async function handleDownloadTemplate() {
  try {
    await itemsStore.downloadTemplate()
  } catch (err: any) {
    alert('下載範本失敗：' + (err.response?.data?.message || err.message))
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.name.endsWith('.csv')) {
    alert('請選擇 CSV 檔案')
    target.value = ''
    return
  }

  try {
    const result = await itemsStore.importItemsFromCSV(file)
    importResult.value = result
    // 重新載入品項列表
    await itemsStore.fetchItems(selectedStoreId.value)
  } catch (err: any) {
    alert('匯入失敗：' + (err.response?.data?.message || err.message))
  } finally {
    target.value = ''
  }
}
</script>
