<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        {{ store ? '編輯店家' : '新增店家' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            店家名稱 <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入店家名稱"
          />
        </div>

        <div>
          <label for="contact" class="block text-sm font-medium text-gray-700 mb-1">
            聯絡方式
          </label>
          <input
            id="contact"
            v-model="formData.contact"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入聯絡方式（選填）"
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

        <div v-if="store">
          <label class="flex items-center">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">啟用店家</span>
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
            :disabled="loading"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '處理中...' : store ? '更新' : '新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useStoresStore } from '@/stores/stores'
import type { Store, CreateStoreDto, UpdateStoreDto } from '@/types/store'

interface Props {
  store?: Store | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const storesStore = useStoresStore()

const formData = reactive<CreateStoreDto & { isActive?: boolean }>({
  name: '',
  contact: '',
  notes: '',
  isActive: true,
})

const loading = ref(false)
const error = ref('')

// 監聽 store prop 變化，初始化表單資料
watch(
  () => props.store,
  (store) => {
    if (store) {
      formData.name = store.name
      formData.contact = store.contact || ''
      formData.notes = store.notes || ''
      formData.isActive = store.isActive
    } else {
      formData.name = ''
      formData.contact = ''
      formData.notes = ''
      formData.isActive = true
    }
    error.value = ''
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!formData.name.trim()) {
    error.value = '請輸入店家名稱'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (props.store) {
      // 更新店家
      const updateData: UpdateStoreDto = {
        name: formData.name.trim(),
        contact: formData.contact?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        isActive: formData.isActive,
      }
      await storesStore.updateStore(props.store.id, updateData)
    } else {
      // 新增店家
      const createData: CreateStoreDto = {
        name: formData.name.trim(),
        contact: formData.contact?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        isActive: formData.isActive,
      }
      await storesStore.createStore(createData)
    }
    emit('saved')
  } catch (err: any) {
    error.value = err.response?.data?.message || (props.store ? '更新店家失敗' : '新增店家失敗')
  } finally {
    loading.value = false
  }
}
</script>
