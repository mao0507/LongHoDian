<template>
  <div class="max-w-3xl mx-auto">
    <!-- 頁面標題 -->
    <h1 class="text-2xl font-semibold text-ds-text mb-ds-400">建立點餐訂單</h1>

    <!-- 錯誤訊息 -->
    <div v-if="ordersStore.error" class="mb-ds-300 p-ds-200 bg-ds-background-danger border border-ds-border-error text-ds-text-accent-red rounded-ds-100">
      {{ ordersStore.error }}
    </div>

    <!-- 表單 -->
    <div class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-400">
      <form @submit.prevent="handleSubmit" class="space-y-ds-300">
        <div>
          <label for="name" class="block text-sm font-medium text-ds-text mb-ds-075">
            訂單名稱 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
            placeholder="例如：2024年1月第一週午餐"
          />
        </div>

        <div>
          <label for="storeId" class="block text-sm font-medium text-ds-text mb-ds-075">
            選擇店家 <span class="text-ds-text-accent-red">*</span>
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
          <label for="deadline" class="block text-sm font-medium text-ds-text mb-ds-075">
            截止時間 <span class="text-ds-text-accent-red">*</span>
          </label>
          <input
            id="deadline"
            v-model="formData.deadline"
            type="datetime-local"
            required
            :min="minDateTime"
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
          />
          <p class="mt-ds-050 text-xs text-ds-text-subtle">請選擇未來時間作為截止時間</p>
        </div>

        <div class="flex gap-ds-200 pt-ds-300 border-t border-ds-border">
          <button
            type="button"
            @click="$router.back()"
            class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading || formData.storeId === 0 || !formData.name.trim()"
            class="flex-1 bg-ds-background-brand text-ds-text-inverse px-ds-300 py-ds-100 rounded-ds-100 hover:bg-ds-background-brand-boldest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-ds-075">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              建立中...
            </span>
            <span v-else>建立訂單</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 成功訊息 Modal -->
    <div
      v-if="createdOrder"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="handleCloseSuccessModal"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full p-ds-400 transform transition-all duration-300 animate-scaleIn">
        <div class="text-center mb-ds-400">
          <div class="w-16 h-16 rounded-full bg-ds-background-success mx-auto mb-ds-300 flex items-center justify-center">
            <svg class="w-8 h-8 text-ds-text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-ds-text mb-ds-150">訂單建立成功！</h2>
          <p class="text-sm text-ds-text-subtle">訂單已建立，請分享連結給參與者</p>
        </div>

        <div class="space-y-ds-200 mb-ds-400">
          <div>
            <label class="block text-sm font-medium text-ds-text mb-ds-075">分享連結</label>
            <div class="flex gap-ds-100">
              <input
                :value="shareLink"
                readonly
                class="flex-1 px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-background-neutral-subtle text-ds-text text-sm"
              />
              <button
                @click="copyShareLink"
                class="px-ds-200 py-ds-100 bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors text-sm font-medium"
              >
                複製
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-ds-text mb-ds-075">分享 Token</label>
            <div class="flex gap-ds-100">
              <input
                :value="createdOrder.shareToken"
                readonly
                class="flex-1 px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-background-neutral-subtle text-ds-text text-sm font-mono"
              />
              <button
                @click="copyToken"
                class="px-ds-200 py-ds-100 bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors text-sm font-medium"
              >
                複製
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-ds-text mb-ds-075">QRCode</label>
            <div class="flex flex-col items-center gap-ds-200">
              <div v-if="qrcodeSvg" class="p-ds-200 bg-white rounded-ds-100 border border-ds-border" v-html="qrcodeSvg"></div>
              <div class="flex gap-ds-100 w-full">
                <input
                  v-model="qrcodeName"
                  type="text"
                  placeholder="預填姓名（選填）"
                  class="flex-1 px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
                  @input="generateQRCode"
                />
                <button
                  @click="downloadQRCode"
                  class="px-ds-200 py-ds-100 bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors text-sm font-medium"
                >
                  下載
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-ds-200 pt-ds-300 border-t border-ds-border">
          <button
            @click="handleCloseSuccessModal"
            class="flex-1 px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
          >
            關閉
          </button>
          <button
            @click="goToOrderManagement"
            class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral transition-colors font-medium"
          >
            前往訂單管理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useStoresStore } from '@/stores/stores'
import type { CreateOrderDto, Order } from '@/types/order'

const router = useRouter()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const storesStore = useStoresStore()

// 檢查是否為召集人
if (!authStore.isOrganizer) {
  router.push('/')
}

const formData = reactive<CreateOrderDto>({
  name: '',
  deadline: '',
  storeId: 0,
})

const loading = ref(false)
const createdOrder = ref<Order | null>(null)
const qrcodeSvg = ref<string>('')
const qrcodeName = ref<string>('')

const stores = computed(() => storesStore.stores.filter((store) => store.isActive))

// 計算最小日期時間（當前時間）
const minDateTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

// 計算分享連結
const shareLink = computed(() => {
  if (!createdOrder.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/order/${createdOrder.value.shareToken}`
})

onMounted(async () => {
  // 載入店家列表
  if (storesStore.stores.length === 0) {
    await storesStore.fetchStores()
  }
})

async function handleSubmit() {
  if (!formData.name.trim()) {
    return
  }

  if (formData.storeId === 0) {
    return
  }

  // 將本地日期時間轉換為 ISO 字串
  const deadlineDate = new Date(formData.deadline)
  if (deadlineDate <= new Date()) {
    alert('截止時間必須在未來')
    return
  }

  loading.value = true

  try {
    const orderData: CreateOrderDto = {
      name: formData.name.trim(),
      deadline: deadlineDate.toISOString(),
      storeId: formData.storeId,
    }

    const order = await ordersStore.createOrder(orderData)
    createdOrder.value = order
  } catch (err: any) {
    // 錯誤已在 store 中處理
  } finally {
    loading.value = false
  }
}

function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value)
  alert('分享連結已複製到剪貼簿')
}

function copyToken() {
  if (createdOrder.value) {
    navigator.clipboard.writeText(createdOrder.value.shareToken)
    alert('Token 已複製到剪貼簿')
  }
}

function handleCloseSuccessModal() {
  createdOrder.value = null
  // 重置表單
  formData.name = ''
  formData.deadline = ''
  formData.storeId = 0
}

function goToOrderManagement() {
  handleCloseSuccessModal()
  router.push('/orders')
}

// 監聽訂單建立，生成 QRCode
watch(createdOrder, async (order) => {
  if (order) {
    await generateQRCode()
  }
})

async function generateQRCode() {
  if (!createdOrder.value) return

  const baseUrl = window.location.origin
  let url = `${baseUrl}/order/${createdOrder.value.shareToken}`
  if (qrcodeName.value.trim()) {
    url += `?name=${encodeURIComponent(qrcodeName.value.trim())}`
  }

  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    qrcodeSvg.value = svg
  } catch (err) {
    console.error('生成 QRCode 失敗：', err)
  }
}

async function downloadQRCode() {
  if (!qrcodeSvg.value || !createdOrder.value) return

  const svgBlob = new Blob([qrcodeSvg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `order_${createdOrder.value.shareToken}_qrcode.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
