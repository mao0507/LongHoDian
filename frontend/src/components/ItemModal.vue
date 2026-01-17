<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        {{ item ? '編輯品項' : '新增品項' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="storeId" class="block text-sm font-medium text-gray-700 mb-1">
            店家 <span class="text-red-500">*</span>
          </label>
          <select
            id="storeId"
            v-model.number="formData.storeId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="0">請選擇店家</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            品項名稱 <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入品項名稱"
          />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
            價格 <span class="text-red-500">*</span>
          </label>
          <input
            id="price"
            v-model.number="formData.price"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入價格"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
            分類
          </label>
          <input
            id="category"
            v-model="formData.category"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入分類（選填）"
          />
        </div>

        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
            備註
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入備註（選填）"
          />
        </div>

        <div v-if="item">
          <label class="flex items-center">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">啟用品項</span>
          </label>
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading || formData.storeId === 0"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '處理中...' : item ? '更新' : '新增' }}
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
