<template>
  <div class="max-w-7xl mx-auto">
    <!-- 頁面標題和操作按鈕 -->
    <div class="flex justify-between items-center mb-ds-400">
      <h1 class="text-2xl font-semibold text-ds-text">訂單管理</h1>
      <router-link
        to="/orders/create"
        class="flex items-center gap-ds-075 px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:ring-offset-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>建立新訂單</span>
      </router-link>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="ordersStore.error" class="mb-ds-300 p-ds-200 bg-ds-background-danger border border-ds-border-error text-ds-text-accent-red rounded-ds-100">
      {{ ordersStore.error }}
    </div>

    <!-- 載入中 -->
    <div v-if="ordersStore.loading && ordersStore.orders.length === 0" class="text-center py-ds-800">
      <div class="inline-flex flex-col items-center gap-ds-200">
        <svg class="animate-spin h-8 w-8 text-ds-text-accent-blue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="text-ds-text-subtle">載入中...</div>
      </div>
    </div>

    <!-- 訂單列表（表格） -->
    <div v-else-if="ordersStore.orders.length > 0" class="bg-ds-surface rounded-ds-200 shadow-ds-raised overflow-hidden">
      <!-- 桌面版表格 -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-ds-background-neutral-subtle border-b border-ds-border">
            <tr>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">訂單ID</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">訂單名稱</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">訂餐店家</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">訂單狀態</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">建立日期</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">截止時間</th>
              <th class="px-ds-300 py-ds-200 text-left text-sm font-semibold text-ds-text">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ds-border">
            <tr
              v-for="order in ordersStore.orders"
              :key="order.id"
              class="hover:bg-ds-background-neutral transition-colors"
            >
              <td class="px-ds-300 py-ds-200 text-sm text-ds-text">#{{ order.id }}</td>
              <td class="px-ds-300 py-ds-200 text-sm text-ds-text font-medium">{{ order.name }}</td>
              <td class="px-ds-300 py-ds-200 text-sm text-ds-text">{{ order.store?.name || '未知店家' }}</td>
              <td class="px-ds-300 py-ds-200">
                <span
                  :class="[
                    'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
                    order.status === 'open' ? 'bg-ds-background-success text-ds-text-accent-green' : order.status === 'closed' ? 'bg-ds-background-warning text-ds-text-accent-yellow' : 'bg-ds-background-neutral text-ds-text-subtle',
                  ]"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="px-ds-300 py-ds-200 text-sm text-ds-text-subtle">{{ formatDate(order.createdAt) }}</td>
              <td class="px-ds-300 py-ds-200 text-sm text-ds-text-subtle">{{ formatDateTime(order.deadline) }}</td>
              <td class="px-ds-300 py-ds-200">
                <div class="flex items-center gap-ds-100">
                  <button
                    @click="viewOrderDetails(order.id)"
                    class="px-ds-150 py-ds-075 text-xs bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors"
                  >
                    查看
                  </button>
                  <button
                    v-if="order.status === 'open'"
                    @click="closeOrder(order.id)"
                    class="px-ds-150 py-ds-075 text-xs bg-ds-background-warning text-ds-text-accent-yellow rounded-ds-100 hover:bg-ds-background-warning-bold transition-colors"
                  >
                    結束
                  </button>
                  <button
                    @click="showShareModal(order)"
                    class="px-ds-150 py-ds-075 text-xs bg-ds-background-discovery text-ds-text-accent-purple rounded-ds-100 hover:bg-ds-background-discovery-bold transition-colors"
                  >
                    分享
                  </button>
                  <button
                    @click="confirmDelete(order)"
                    class="px-ds-150 py-ds-075 text-xs bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger-bold transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 手機版卡片列表 -->
      <div class="md:hidden divide-y divide-ds-border">
        <div
          v-for="order in ordersStore.orders"
          :key="order.id"
          class="p-ds-300 hover:bg-ds-background-neutral transition-colors"
        >
          <div class="flex justify-between items-start mb-ds-200">
            <div>
              <h3 class="font-semibold text-ds-text mb-ds-050">#{{ order.id }} {{ order.name }}</h3>
              <p class="text-sm text-ds-text-subtle">{{ order.store?.name || '未知店家' }}</p>
            </div>
            <span
              :class="[
                'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
                order.status === 'open' ? 'bg-ds-background-success text-ds-text-accent-green' : order.status === 'closed' ? 'bg-ds-background-warning text-ds-text-accent-yellow' : 'bg-ds-background-neutral text-ds-text-subtle',
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="text-xs text-ds-text-subtle space-y-ds-050 mb-ds-200">
            <div>建立：{{ formatDate(order.createdAt) }}</div>
            <div>截止：{{ formatDateTime(order.deadline) }}</div>
          </div>
          <div class="flex flex-wrap gap-ds-100">
            <button
              @click="viewOrderDetails(order.id)"
              class="px-ds-150 py-ds-075 text-xs bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors"
            >
              查看
            </button>
            <button
              v-if="order.status === 'open'"
              @click="closeOrder(order.id)"
              class="px-ds-150 py-ds-075 text-xs bg-ds-background-warning text-ds-text-accent-yellow rounded-ds-100 hover:bg-ds-background-warning-bold transition-colors"
            >
              結束
            </button>
            <button
              @click="showShareModal(order)"
              class="px-ds-150 py-ds-075 text-xs bg-ds-background-discovery text-ds-text-accent-purple rounded-ds-100 hover:bg-ds-background-discovery-bold transition-colors"
            >
              分享
            </button>
            <button
              @click="confirmDelete(order)"
              class="px-ds-150 py-ds-075 text-xs bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger-bold transition-colors"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空的訂單列表 -->
    <div v-else class="text-center py-ds-1000 bg-ds-surface rounded-ds-200 shadow-ds-raised">
      <p class="text-ds-text-subtle mb-ds-300">目前沒有任何訂單</p>
      <router-link
        to="/orders/create"
        class="inline-block px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors"
      >
        建立第一個訂單
      </router-link>
    </div>

    <!-- 訂單詳細資訊 Modal -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="selectedOrder = null"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 animate-scaleIn">
        <!-- Modal 標題 -->
        <div class="flex items-center justify-between p-ds-400 pb-ds-200 border-b border-ds-border flex-shrink-0">
          <div>
            <h2 class="text-xl font-semibold text-ds-text">訂單詳細資訊</h2>
            <p class="text-sm text-ds-text-subtle mt-ds-050">#{{ selectedOrder.id }} {{ selectedOrder.name }}</p>
          </div>
          <button
            @click="selectedOrder = null"
            class="text-ds-text-subtle hover:text-ds-text hover:bg-ds-background-neutral rounded-ds-050 p-ds-075 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal 內容（可滾動） -->
        <div class="flex-1 overflow-y-auto px-ds-400 py-ds-300">
          <div v-if="loadingOrderDetails" class="text-center py-ds-800">
            <svg class="animate-spin h-8 w-8 text-ds-text-accent-blue mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="orderDetails" class="space-y-ds-400">
            <!-- 訂單基本資訊 -->
            <div class="bg-ds-background-neutral-subtle rounded-ds-100 p-ds-300">
              <h3 class="font-semibold text-ds-text mb-ds-200">訂單資訊</h3>
              <div class="grid grid-cols-2 gap-ds-200 text-sm">
                <div>
                  <span class="text-ds-text-subtle">店家：</span>
                  <span class="text-ds-text">{{ orderDetails.store?.name || '未知店家' }}</span>
                </div>
                <div>
                  <span class="text-ds-text-subtle">狀態：</span>
                  <span
                    :class="[
                      'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium ml-ds-050',
                      orderDetails.status === 'open' ? 'bg-ds-background-success text-ds-text-accent-green' : orderDetails.status === 'closed' ? 'bg-ds-background-warning text-ds-text-accent-yellow' : 'bg-ds-background-neutral text-ds-text-subtle',
                    ]"
                  >
                    {{ getStatusText(orderDetails.status) }}
                  </span>
                </div>
                <div>
                  <span class="text-ds-text-subtle">建立時間：</span>
                  <span class="text-ds-text">{{ formatDateTime(orderDetails.createdAt) }}</span>
                </div>
                <div>
                  <span class="text-ds-text-subtle">截止時間：</span>
                  <span class="text-ds-text">{{ formatDateTime(orderDetails.deadline) }}</span>
                </div>
              </div>
            </div>

            <!-- 訂單統計 -->
            <div v-if="orderDetails.items && orderDetails.items.length > 0" class="bg-ds-background-information-subtle rounded-ds-100 p-ds-300">
              <h3 class="font-semibold text-ds-text mb-ds-200">訂單統計</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-ds-200 text-sm">
                <div>
                  <div class="text-ds-text-subtle text-xs">參與人數</div>
                  <div class="text-lg font-semibold text-ds-text">{{ uniqueParticipants.length }}</div>
                </div>
                <div>
                  <div class="text-ds-text-subtle text-xs">總品項數</div>
                  <div class="text-lg font-semibold text-ds-text">{{ totalItems }}</div>
                </div>
                <div>
                  <div class="text-ds-text-subtle text-xs">總金額</div>
                  <div class="text-lg font-semibold text-ds-text-accent-blue">NT$ {{ formatPrice(totalAmount) }}</div>
                </div>
                <div>
                  <div class="text-ds-text-subtle text-xs">平均金額</div>
                  <div class="text-lg font-semibold text-ds-text">NT$ {{ formatPrice(averageAmount) }}</div>
                </div>
              </div>
            </div>

            <!-- 點餐明細 -->
            <div>
              <h3 class="font-semibold text-ds-text mb-ds-200">點餐明細</h3>
              <div class="space-y-ds-200">
                <div
                  v-for="(group, participant) in groupedOrderItems"
                  :key="participant"
                  class="bg-ds-background-neutral-subtle rounded-ds-100 p-ds-300 border border-ds-border"
                >
                  <div class="flex justify-between items-center mb-ds-200">
                    <h4 class="font-semibold text-ds-text">{{ participant }}</h4>
                    <span class="text-sm font-medium text-ds-text-accent-blue">NT$ {{ formatPrice(getParticipantTotal(participant)) }}</span>
                  </div>
                  <div class="space-y-ds-100">
                    <div
                      v-for="item in group"
                      :key="item.id"
                      class="flex justify-between items-start text-sm"
                    >
                      <div class="flex-1">
                        <div class="font-medium text-ds-text">{{ item.item?.name || '未知品項' }}</div>
                        <div class="text-ds-text-subtle text-xs mt-ds-050">
                          <span>數量：{{ item.quantity }} × NT$ {{ formatPrice(item.item?.price || 0) }}</span>
                          <span v-if="item.customizationOptions" class="ml-ds-100">
                            （{{ formatCustomizationOptions(item.customizationOptions) }}）
                          </span>
                        </div>
                        <div v-if="item.notes" class="text-ds-text-subtle text-xs mt-ds-050">備註：{{ item.notes }}</div>
                      </div>
                      <div class="text-ds-text font-medium ml-ds-200">NT$ {{ formatPrice(item.subtotal) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal 底部按鈕 -->
        <div class="p-ds-400 pt-ds-300 border-t border-ds-border flex-shrink-0 space-y-ds-200">
          <div class="flex gap-ds-200">
            <button
              @click="exportOrder('csv')"
              :disabled="!orderDetails || !orderDetails.items || orderDetails.items.length === 0"
              class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-ds-075"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              匯出 CSV
            </button>
            <button
              @click="exportOrder('pdf')"
              :disabled="!orderDetails || !orderDetails.items || orderDetails.items.length === 0"
              class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-ds-075"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              匯出 PDF
            </button>
          </div>
          <button
            @click="selectedOrder = null"
            class="w-full px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
          >
            關閉
          </button>
        </div>
      </div>
    </div>

    <!-- 分享 Modal（包含 QRCode） -->
    <div
      v-if="sharingOrder"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="sharingOrder = null"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full p-ds-400 transform transition-all duration-300 animate-scaleIn">
        <div class="flex items-center justify-between mb-ds-300">
          <h2 class="text-xl font-semibold text-ds-text">分享訂單</h2>
          <button
            @click="sharingOrder = null"
            class="text-ds-text-subtle hover:text-ds-text hover:bg-ds-background-neutral rounded-ds-050 p-ds-075 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-ds-300">
          <div>
            <label class="block text-sm font-medium text-ds-text mb-ds-075">分享連結</label>
            <div class="flex gap-ds-100">
              <input
                :value="shareLink"
                readonly
                class="flex-1 px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-background-neutral-subtle text-ds-text text-sm"
              />
              <button
                @click="copyShareLink(sharingOrder!)"
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

        <div class="mt-ds-400 pt-ds-300 border-t border-ds-border">
          <button
            @click="sharingOrder = null"
            class="w-full px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import type { Order, OrderItem } from '@/types/order'

const router = useRouter()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()

// 檢查是否為召集人
if (!authStore.isOrganizer) {
  router.push('/')
}

const selectedOrder = ref<Order | null>(null)
const orderDetails = ref<Order | null>(null)
const loadingOrderDetails = ref(false)
const sharingOrder = ref<Order | null>(null)
const qrcodeSvg = ref<string>('')
const qrcodeName = ref<string>('')

// 計算統計資訊
const uniqueParticipants = computed(() => {
  if (!orderDetails.value?.items) return []
  const participants = new Set(orderDetails.value.items.map((item) => item.participantName))
  return Array.from(participants)
})

const totalItems = computed(() => {
  if (!orderDetails.value?.items) return 0
  return orderDetails.value.items.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  if (!orderDetails.value?.items) return 0
  return orderDetails.value.items.reduce((sum, item) => sum + item.subtotal, 0)
})

const averageAmount = computed(() => {
  if (uniqueParticipants.value.length === 0) return 0
  return totalAmount.value / uniqueParticipants.value.length
})

const groupedOrderItems = computed(() => {
  if (!orderDetails.value?.items) return {}
  const grouped: Record<string, OrderItem[]> = {}
  orderDetails.value.items.forEach((item) => {
    if (!grouped[item.participantName]) {
      grouped[item.participantName] = []
    }
    grouped[item.participantName].push(item)
  })
  return grouped
})

onMounted(async () => {
  await ordersStore.fetchOrders()
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    open: '開放點餐',
    closed: '已截止',
    completed: '已完成',
  }
  return statusMap[status] || status
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

function formatCustomizationOptions(options: string | null): string {
  if (!options) return ''
  try {
    const parsed = JSON.parse(options)
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  } catch {
    return options
  }
}

function getParticipantTotal(participantName: string): number {
  if (!orderDetails.value?.items) return 0
  return orderDetails.value.items
    .filter((item) => item.participantName === participantName)
    .reduce((sum, item) => sum + item.subtotal, 0)
}

async function viewOrderDetails(orderId: number) {
  selectedOrder.value = ordersStore.orders.find((o) => o.id === orderId) || null
  loadingOrderDetails.value = true
  try {
    orderDetails.value = await ordersStore.getOrder(orderId)
  } catch (err) {
    // 錯誤已在 store 中處理
  } finally {
    loadingOrderDetails.value = false
  }
}

async function closeOrder(orderId: number) {
  if (!confirm('確定要結束此訂單嗎？結束後將無法再點餐。')) {
    return
  }
  try {
    await ordersStore.updateOrder(orderId, { status: 'closed' })
    await ordersStore.fetchOrders()
  } catch (err) {
    // 錯誤已在 store 中處理
  }
}

const shareLink = computed(() => {
  if (!sharingOrder.value) return ''
  const baseUrl = window.location.origin
  let url = `${baseUrl}/order/${sharingOrder.value.shareToken}`
  if (qrcodeName.value.trim()) {
    url += `?name=${encodeURIComponent(qrcodeName.value.trim())}`
  }
  return url
})

function copyShareLink(order: Order) {
  const baseUrl = window.location.origin
  const link = `${baseUrl}/order/${order.shareToken}`
  navigator.clipboard.writeText(link)
  alert('分享連結已複製到剪貼簿')
}

async function showShareModal(order: Order) {
  sharingOrder.value = order
  qrcodeName.value = ''
  await generateQRCode()
}

watch(sharingOrder, async (order) => {
  if (order) {
    await generateQRCode()
  }
})

watch(qrcodeName, async () => {
  if (sharingOrder.value) {
    await generateQRCode()
  }
})

async function generateQRCode() {
  if (!sharingOrder.value) return

  const baseUrl = window.location.origin
  let url = `${baseUrl}/order/${sharingOrder.value.shareToken}`
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
  if (!qrcodeSvg.value || !sharingOrder.value) return

  const svgBlob = new Blob([qrcodeSvg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `order_${sharingOrder.value.shareToken}_qrcode.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function confirmDelete(order: Order) {
  if (!confirm(`確定要刪除訂單「${order.name}」嗎？此操作無法復原。`)) {
    return
  }
  try {
    await ordersStore.deleteOrder(order.id)
  } catch (err) {
    // 錯誤已在 store 中處理
  }
}

async function exportOrder(format: 'csv' | 'pdf') {
  if (!orderDetails.value) return

  try {
    const response = await api.get(`/orders/${orderDetails.value.id}/export/${format}`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/pdf',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order_${orderDetails.value.id}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    alert('匯出失敗：' + (err.response?.data?.message || err.message))
  }
}
</script>
