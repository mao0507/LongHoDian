<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn" @click.self="$emit('close')">
    <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full p-ds-400 transform transition-all duration-300 animate-scaleIn">
      <!-- Modal 標題 -->
      <div class="flex items-center justify-between mb-ds-400">
        <div class="flex items-center gap-ds-150">
          <div class="w-10 h-10 rounded-ds-100 bg-ds-background-brand flex items-center justify-center">
            <svg v-if="!store" class="w-5 h-5 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <svg v-else class="w-5 h-5 text-ds-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-ds-text">
            {{ store ? '編輯店家' : '新增店家' }}
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
          <label for="name" class="block text-sm font-medium text-ds-text mb-ds-075">
            店家名稱 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入店家名稱"
          />
        </div>

        <div>
          <label for="contact" class="block text-sm font-medium text-ds-text mb-ds-075">
            聯絡方式
          </label>
          <input
            id="contact"
            v-model="formData.contact"
            type="text"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入聯絡方式（選填）"
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

        <div>
          <label for="imageUrl" class="block text-sm font-medium text-ds-text mb-ds-075">
            圖片 URL
          </label>
          <input
            id="imageUrl"
            v-model="formData.imageUrl"
            type="url"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入圖片網址（選填）"
          />
        </div>

        <div>
          <label for="categoryTags" class="block text-sm font-medium text-ds-text mb-ds-075">
            分類標籤
          </label>
          <input
            id="categoryTags"
            v-model="categoryTagsInput"
            type="text"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入分類標籤，以逗號分隔（選填，例如：中式,快餐）"
            @blur="handleCategoryTagsBlur"
          />
          <p class="mt-ds-050 text-xs text-ds-text-subtle">多個標籤請以逗號分隔</p>
          <div v-if="formData.categoryTags && formData.categoryTags.length > 0" class="mt-ds-100 flex flex-wrap gap-ds-050">
            <span
              v-for="(tag, index) in formData.categoryTags"
              :key="index"
              class="inline-flex items-center gap-ds-050 px-ds-100 py-ds-025 bg-ds-background-neutral rounded-ds-050 text-xs text-ds-text"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeCategoryTag(index)"
                class="text-ds-text-subtle hover:text-ds-text-accent-red transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <div>
          <label for="sortOrder" class="block text-sm font-medium text-ds-text mb-ds-075">
            排序順序
          </label>
          <input
            id="sortOrder"
            v-model.number="formData.sortOrder"
            type="number"
            min="0"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="請輸入排序順序（數字越小越前面，預設為 0）"
          />
          <p class="mt-ds-050 text-xs text-ds-text-subtle">數字越小排序越前面</p>
        </div>

        <div v-if="store">
          <label class="flex items-center cursor-pointer group">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="w-4 h-4 rounded border-ds-border text-ds-background-brand focus:ring-ds-border-focus focus:ring-2 cursor-pointer transition-colors"
            />
            <span class="ml-ds-150 text-sm text-ds-text group-hover:text-ds-text-accent-blue transition-colors">啟用店家</span>
          </label>
        </div>

        <div v-if="error" class="p-ds-150 bg-ds-background-danger border border-ds-border-error rounded-ds-100 text-ds-text-accent-red text-sm flex items-center gap-ds-075">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <div class="flex gap-ds-150 pt-ds-300 border-t border-ds-border">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-ds-background-brand text-ds-text-inverse px-ds-300 py-ds-100 rounded-ds-100 hover:bg-ds-background-brand-boldest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-ds-075">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              處理中...
            </span>
            <span v-else>{{ store ? '更新' : '新增' }}</span>
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
  imageUrl: '',
  categoryTags: [],
  sortOrder: 0,
  isActive: true,
})

const categoryTagsInput = ref('')

const loading = ref(false)
const error = ref('')

// 處理分類標籤輸入
function handleCategoryTagsBlur() {
  if (categoryTagsInput.value.trim()) {
    formData.categoryTags = categoryTagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  } else {
    formData.categoryTags = []
  }
}

// 移除分類標籤
function removeCategoryTag(index: number) {
  if (formData.categoryTags) {
    formData.categoryTags.splice(index, 1)
    categoryTagsInput.value = formData.categoryTags.join(', ')
  }
}

// 監聽 store prop 變化，初始化表單資料
watch(
  () => props.store,
  (store) => {
    if (store) {
      formData.name = store.name
      formData.contact = store.contact || ''
      formData.notes = store.notes || ''
      formData.imageUrl = store.imageUrl || ''
      formData.categoryTags = store.categoryTags || []
      formData.sortOrder = store.sortOrder ?? 0
      formData.isActive = store.isActive
      categoryTagsInput.value = store.categoryTags ? store.categoryTags.join(', ') : ''
    } else {
      formData.name = ''
      formData.contact = ''
      formData.notes = ''
      formData.imageUrl = ''
      formData.categoryTags = []
      formData.sortOrder = 0
      formData.isActive = true
      categoryTagsInput.value = ''
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
      // 先處理分類標籤
      handleCategoryTagsBlur()
      const updateData: UpdateStoreDto = {
        name: formData.name.trim(),
        contact: formData.contact?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        categoryTags: formData.categoryTags && formData.categoryTags.length > 0 ? formData.categoryTags : undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      }
      await storesStore.updateStore(props.store.id, updateData)
    } else {
      // 新增店家
      // 先處理分類標籤
      handleCategoryTagsBlur()
      const createData: CreateStoreDto = {
        name: formData.name.trim(),
        contact: formData.contact?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        categoryTags: formData.categoryTags && formData.categoryTags.length > 0 ? formData.categoryTags : undefined,
        sortOrder: formData.sortOrder,
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
