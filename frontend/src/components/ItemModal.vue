<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn" @click.self="$emit('close')">
    <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full p-ds-400 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn">
      <!-- Modal 標題 -->
      <div class="flex items-center justify-between mb-ds-400 sticky top-0 bg-ds-surface pb-ds-200">
        <div class="flex items-center gap-ds-150">
          <div class="w-10 h-10 rounded-ds-100 bg-ds-background-brand flex items-center justify-center">
            <svg v-if="!item" class="w-5 h-5 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <svg v-else class="w-5 h-5 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-ds-text">
            {{ item ? '編輯品項' : '新增品項' }}
          </h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-ds-text-subtle hover:text-ds-text hover:bg-ds-background-neutral rounded-ds-050 p-ds-075 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-ds-300">
        <div>
          <label for="storeId" class="block text-sm font-medium text-ds-text mb-ds-075">
            店家 <span class="text-ds-text-accent-red">*</span>
          </label>
          <select
            id="storeId"
            v-model.number="formData.storeId"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
          >
            <option :value="0">請選擇店家</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-ds-text mb-ds-075">
            品項名稱 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入品項名稱"
          />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-ds-text mb-ds-075">
            價格 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="price"
            v-model.number="formData.price"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入價格"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-ds-text mb-ds-075">
            分類
          </label>
          <input
            id="category"
            v-model="formData.category"
            type="text"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入分類（選填）"
          />
        </div>

        <div>
          <label for="notes" class="block text-sm font-medium text-ds-text mb-ds-075">
            備註
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200 resize-none"
            placeholder="請輸入備註（選填）"
          />
        </div>

        <div v-if="item">
          <label class="flex items-center cursor-pointer group">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="w-4 h-4 rounded border-ds-border text-ds-background-brand focus:ring-ds-border-focus focus:ring-2 cursor-pointer transition-colors"
            />
            <span class="ml-ds-150 text-sm text-ds-text group-hover:text-ds-text-accent-blue transition-colors">啟用品項</span>
          </label>
        </div>

        <div v-if="error" class="p-ds-150 bg-ds-background-danger border border-ds-border-error rounded-ds-100 text-ds-text-accent-red text-sm flex items-center gap-ds-075">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <div class="flex gap-ds-150 pt-ds-300 border-t border-ds-border sticky bottom-0 bg-ds-surface pb-ds-200">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading || formData.storeId === 0"
            class="flex-1 bg-ds-background-brand text-ds-text-inverse px-ds-300 py-ds-100 rounded-ds-100 hover:bg-ds-background-brand-boldest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-ds-075">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              處理中...
            </span>
            <span v-else>{{ item ? '更新' : '新增' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useItemsStore } from '@/stores/items'
import type { Item, CreateItemDto, UpdateItemDto } from '@/types/item'
import type { Store } from '@/types/store'

interface Props {
  item?: Item | null
  stores: Store[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const itemsStore = useItemsStore()

const formData = reactive<CreateItemDto & { isActive?: boolean }>({
  storeId: 0,
  name: '',
  price: 0,
  category: '',
  notes: '',
  isActive: true,
})

const loading = ref(false)
const error = ref('')

// 監聽 item prop 變化，初始化表單資料
watch(
  () => props.item,
  (item) => {
    if (item) {
      formData.storeId = item.storeId
      formData.name = item.name
      formData.price = item.price
      formData.category = item.category || ''
      formData.notes = item.notes || ''
      formData.isActive = item.isActive
    } else {
      formData.storeId = props.stores.length > 0 ? props.stores[0].id : 0
      formData.name = ''
      formData.price = 0
      formData.category = ''
      formData.notes = ''
      formData.isActive = true
    }
    error.value = ''
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!formData.name.trim()) {
    error.value = '請輸入品項名稱'
    return
  }

  if (formData.storeId === 0) {
    error.value = '請選擇店家'
    return
  }

  if (formData.price < 0) {
    error.value = '價格必須大於等於 0'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (props.item) {
      // 更新品項
      const updateData: UpdateItemDto = {
        name: formData.name.trim(),
        price: formData.price,
        category: formData.category?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        storeId: formData.storeId,
        isActive: formData.isActive,
      }
      await itemsStore.updateItem(props.item.id, updateData)
    } else {
      // 新增品項
      const createData: CreateItemDto = {
        name: formData.name.trim(),
        price: formData.price,
        category: formData.category?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        storeId: formData.storeId,
        isActive: formData.isActive,
      }
      await itemsStore.createItem(createData)
    }
    emit('saved')
  } catch (err: any) {
    error.value = err.response?.data?.message || (props.item ? '更新品項失敗' : '新增品項失敗')
  } finally {
    loading.value = false
  }
}
</script>
