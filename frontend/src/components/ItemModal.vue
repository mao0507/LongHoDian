<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn" @click.self="$emit('close')">
    <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 animate-scaleIn">
      <!-- Modal 標題 -->
      <div class="flex items-center justify-between p-ds-400 pb-ds-200 border-b border-ds-border flex-shrink-0">
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

      <!-- 可滾動內容區域 -->
      <div class="flex-1 overflow-y-auto px-ds-400">
        <form @submit.prevent="handleSubmit" class="space-y-ds-300 py-ds-300">
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
          <label for="description" class="block text-sm font-medium text-ds-text mb-ds-075">
            描述
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200 resize-none"
            placeholder="請輸入品項描述（選填）"
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
          <label for="imageUrl" class="block text-sm font-medium text-ds-text mb-ds-075">
            圖片 URL
          </label>
          <input
            id="imageUrl"
            v-model="formData.imageUrl"
            type="url"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div class="grid grid-cols-2 gap-ds-200">
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
              placeholder="0"
            />
          </div>
          <div>
            <label class="flex items-center cursor-pointer group mt-ds-400">
              <input
                v-model="formData.isRecommended"
                type="checkbox"
                class="w-4 h-4 rounded border-ds-border text-ds-background-brand focus:ring-ds-border-focus focus:ring-2 cursor-pointer transition-colors"
              />
              <span class="ml-ds-150 text-sm text-ds-text group-hover:text-ds-text-accent-blue transition-colors">推薦品項</span>
            </label>
          </div>
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

        <!-- 客製化選項管理 -->
        <div class="border-t border-ds-border pt-ds-300">
          <div class="flex items-center justify-between mb-ds-200">
            <label class="block text-sm font-medium text-ds-text">客製化選項</label>
            <div class="flex gap-ds-100">
              <!-- 範本快速套用 -->
              <select
                @change="(e: any) => { if (e.target.value) { applyTemplate(e.target.value); e.target.value = ''; } }"
                class="px-ds-150 py-ds-075 text-xs border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
              >
                <option value="">套用範本...</option>
                <option v-for="template in templates" :key="template.name" :value="template.name">
                  {{ template.name }}
                </option>
              </select>
              <button
                type="button"
                @click="addCustomizationOption"
                class="px-ds-150 py-ds-075 text-xs bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors"
              >
                + 新增選項
              </button>
            </div>
          </div>

          <div v-if="formData.customizationOptions && formData.customizationOptions.length > 0" class="space-y-ds-200">
            <div
              v-for="(option, optIndex) in formData.customizationOptions"
              :key="optIndex"
              class="p-ds-200 bg-ds-background-neutral-subtle rounded-ds-100 border border-ds-border"
            >
              <div class="flex items-start gap-ds-150 mb-ds-150">
                <div class="flex-1">
                  <input
                    v-model="option.optionName"
                    type="text"
                    placeholder="選項名稱（例如：大小）"
                    class="w-full px-ds-150 py-ds-075 text-sm border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
                  />
                </div>
                <button
                  type="button"
                  @click="removeCustomizationOption(optIndex)"
                  class="text-ds-text-accent-red hover:text-ds-text-accent-red-bold transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-ds-100">
                <div class="text-xs text-ds-text-subtle mb-ds-050">選項值：</div>
                <div v-for="(value, valIndex) in option.optionValues" :key="valIndex" class="flex gap-ds-100">
                  <input
                    v-model="option.optionValues[valIndex]"
                    type="text"
                    placeholder="選項值（例如：小）"
                    class="flex-1 px-ds-150 py-ds-075 text-sm border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
                  />
                  <button
                    type="button"
                    @click="removeOptionValue(optIndex, valIndex)"
                    class="text-ds-text-accent-red hover:text-ds-text-accent-red-bold transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addOptionValue(optIndex)"
                  class="text-xs text-ds-text-accent-blue hover:text-ds-text-accent-blue-bold transition-colors"
                >
                  + 新增選項值
                </button>
              </div>
              <div class="mt-ds-150 flex gap-ds-200">
                <div class="flex-1">
                  <input
                    v-model="option.defaultValue"
                    type="text"
                    placeholder="預設值（選填）"
                    class="w-full px-ds-150 py-ds-075 text-sm border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
                  />
                </div>
                <div class="flex-1">
                  <input
                    v-model="option.template"
                    type="text"
                    placeholder="範本名稱（選填）"
                    class="w-full px-ds-150 py-ds-075 text-sm border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-ds-text-subtle text-center py-ds-200">
            暫無客製化選項
          </div>
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
        </form>
      </div>

      <!-- Modal 按鈕區域 -->
      <div class="flex gap-ds-150 p-ds-400 pt-ds-300 border-t border-ds-border flex-shrink-0">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 transition-all duration-200 font-medium"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleSubmit"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useItemsStore } from '@/stores/items'
import type { Item, CreateItemDto, UpdateItemDto, CustomizationOption } from '@/types/item'
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
  description: '',
  category: '',
  notes: '',
  imageUrl: '',
  sortOrder: 0,
  isRecommended: false,
  isActive: true,
  customizationOptions: [],
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
      formData.description = item.description || ''
      formData.category = item.category || ''
      formData.notes = item.notes || ''
      formData.imageUrl = item.imageUrl || ''
      formData.sortOrder = item.sortOrder || 0
      formData.isRecommended = item.isRecommended || false
      formData.isActive = item.isActive
      // 處理客製化選項：將 optionValues 轉換為陣列（如果後端返回的是字符串）
      formData.customizationOptions = (item.customizationOptions || []).map((opt) => ({
        id: opt.id,
        optionName: opt.optionName,
        optionValues: Array.isArray(opt.optionValues) ? opt.optionValues : (typeof opt.optionValues === 'string' ? JSON.parse(opt.optionValues) : []),
        defaultValue: opt.defaultValue,
        template: opt.template,
      }))
    } else {
      formData.storeId = props.stores.length > 0 ? props.stores[0].id : 0
      formData.name = ''
      formData.price = 0
      formData.description = ''
      formData.category = ''
      formData.notes = ''
      formData.imageUrl = ''
      formData.sortOrder = 0
      formData.isRecommended = false
      formData.isActive = true
      formData.customizationOptions = []
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
        description: formData.description?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        sortOrder: formData.sortOrder,
        isRecommended: formData.isRecommended,
        storeId: formData.storeId,
        isActive: formData.isActive,
        customizationOptions: formData.customizationOptions && formData.customizationOptions.length > 0 ? formData.customizationOptions.map((opt) => ({
          optionName: opt.optionName,
          optionValues: opt.optionValues,
          defaultValue: opt.defaultValue,
          template: opt.template,
        })) : [],
      }
      await itemsStore.updateItem(props.item.id, updateData)
    } else {
      // 新增品項
      const createData: CreateItemDto = {
        name: formData.name.trim(),
        price: formData.price,
        description: formData.description?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        sortOrder: formData.sortOrder,
        isRecommended: formData.isRecommended,
        storeId: formData.storeId,
        isActive: formData.isActive,
        customizationOptions: formData.customizationOptions && formData.customizationOptions.length > 0 ? formData.customizationOptions.map((opt) => ({
          optionName: opt.optionName,
          optionValues: opt.optionValues,
          defaultValue: opt.defaultValue,
          template: opt.template,
        })) : undefined,
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

// 客製化選項管理
function addCustomizationOption() {
  if (!formData.customizationOptions) {
    formData.customizationOptions = []
  }
  formData.customizationOptions.push({
    optionName: '',
    optionValues: [],
    defaultValue: '',
    template: '',
  })
}

function removeCustomizationOption(index: number) {
  if (formData.customizationOptions) {
    formData.customizationOptions.splice(index, 1)
  }
}

function addOptionValue(optionIndex: number) {
  if (formData.customizationOptions && formData.customizationOptions[optionIndex]) {
    if (!formData.customizationOptions[optionIndex].optionValues) {
      formData.customizationOptions[optionIndex].optionValues = []
    }
    formData.customizationOptions[optionIndex].optionValues.push('')
  }
}

function removeOptionValue(optionIndex: number, valueIndex: number) {
  if (formData.customizationOptions && formData.customizationOptions[optionIndex]?.optionValues) {
    formData.customizationOptions[optionIndex].optionValues.splice(valueIndex, 1)
  }
}

// 範本快速套用
const templates = ref<{ name: string; options: CustomizationOption[] }[]>([
  {
    name: '飲料大小',
    options: [
      {
        optionName: '大小',
        optionValues: ['小', '中', '大'],
        defaultValue: '中',
        template: '飲料大小',
      },
    ],
  },
  {
    name: '辣度',
    options: [
      {
        optionName: '辣度',
        optionValues: ['不辣', '小辣', '中辣', '大辣', '特辣'],
        defaultValue: '不辣',
        template: '辣度',
      },
    ],
  },
  {
    name: '甜度',
    options: [
      {
        optionName: '甜度',
        optionValues: ['無糖', '微糖', '半糖', '少糖', '正常'],
        defaultValue: '正常',
        template: '甜度',
      },
    ],
  },
])

function applyTemplate(templateName: string) {
  const template = templates.value.find((t) => t.name === templateName)
  if (template) {
    if (!formData.customizationOptions) {
      formData.customizationOptions = []
    }
    formData.customizationOptions.push(...JSON.parse(JSON.stringify(template.options)))
  }
}
</script>
