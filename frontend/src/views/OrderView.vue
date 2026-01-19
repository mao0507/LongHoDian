<template>
  <div class="min-h-screen bg-ds-background-neutral pb-ds-1000">
    <!-- 載入中 -->
    <div v-if="loading && !order" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-ds-text-accent-blue mx-auto mb-ds-300" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-ds-text-subtle">載入中...</p>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error && !order" class="flex items-center justify-center min-h-screen p-ds-400">
      <div class="text-center bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-400 max-w-md w-full">
        <div class="w-16 h-16 rounded-full bg-ds-background-danger mx-auto mb-ds-300 flex items-center justify-center">
          <svg class="w-8 h-8 text-ds-text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-ds-text mb-ds-200">載入訂單失敗</h2>
        <p class="text-ds-text-subtle mb-ds-400">{{ error }}</p>
        <button
          @click="loadOrder"
          class="px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
        >
          重新載入
        </button>
      </div>
    </div>

    <!-- 訂單內容 -->
    <div v-else-if="order" class="max-w-4xl mx-auto px-ds-200 py-ds-300">
      <!-- 訂單標題 -->
      <div class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-400 mb-ds-300">
        <h1 class="text-2xl font-semibold text-ds-text mb-ds-150">{{ order.name }}</h1>
        <div class="flex flex-wrap gap-ds-200 text-sm text-ds-text-subtle mb-ds-200">
          <span>
            <span class="font-medium">店家：</span>{{ order.store?.name }}
          </span>
          <span>
            <span class="font-medium">截止時間：</span>{{ formatDeadline(order.deadline) }}
          </span>
          <span
            :class="[
              'inline-flex items-center px-ds-150 py-ds-050 rounded-full text-xs font-medium',
              order.status === 'open' ? 'bg-ds-background-success text-ds-text-accent-green' : 'bg-ds-background-neutral text-ds-text-subtle',
            ]"
          >
            {{ order.status === 'open' ? '開放點餐' : '已關閉' }}
          </span>
        </div>

        <!-- 已提交的訂單顯示 -->
        <div v-if="myOrderItems.length > 0 && order.status === 'open' && !isDeadlinePassed" class="mt-ds-300 pt-ds-300 border-t border-ds-border">
          <div class="flex justify-between items-start mb-ds-200">
            <div>
              <h3 class="font-semibold text-ds-text mb-ds-050">您的點餐</h3>
              <p class="text-sm text-ds-text-subtle">共 {{ myOrderItemsTotalQuantity }} 項，總計 NT$ {{ formatPrice(myOrderItemsTotalAmount) }}</p>
            </div>
            <div class="flex gap-ds-100">
              <button
                @click="loadMyOrderToCart"
                class="px-ds-200 py-ds-075 text-sm bg-ds-background-information text-ds-text-accent-blue rounded-ds-100 hover:bg-ds-background-information-bold transition-colors"
              >
                修改訂單
              </button>
              <button
                @click="confirmCancelOrder"
                class="px-ds-200 py-ds-075 text-sm bg-ds-background-danger text-ds-text-accent-red rounded-ds-100 hover:bg-ds-background-danger-bold transition-colors"
              >
                取消訂單
              </button>
            </div>
          </div>
          <div class="space-y-ds-100">
            <div
              v-for="item in myOrderItems"
              :key="item.id"
              class="text-sm bg-ds-background-neutral-subtle rounded-ds-100 p-ds-150"
            >
              <div class="flex justify-between">
                <span class="text-ds-text">{{ item.item?.name || '未知品項' }} × {{ item.quantity }}</span>
                <span class="text-ds-text-accent-blue font-medium">NT$ {{ formatPrice(item.subtotal) }}</span>
              </div>
              <div v-if="item.customizationOptions" class="text-xs text-ds-text-subtle mt-ds-050">
                {{ formatCustomizationOptions(item.customizationOptions) }}
              </div>
              <div v-if="item.notes" class="text-xs text-ds-text-subtle mt-ds-050">備註：{{ item.notes }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="myOrderItems.length > 0" class="mt-ds-300 pt-ds-300 border-t border-ds-border">
          <h3 class="font-semibold text-ds-text mb-ds-200">您的點餐</h3>
          <div class="space-y-ds-100">
            <div
              v-for="item in myOrderItems"
              :key="item.id"
              class="text-sm bg-ds-background-neutral-subtle rounded-ds-100 p-ds-150"
            >
              <div class="flex justify-between">
                <span class="text-ds-text">{{ item.item?.name || '未知品項' }} × {{ item.quantity }}</span>
                <span class="text-ds-text-accent-blue font-medium">NT$ {{ formatPrice(item.subtotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜尋和篩選 -->
      <div v-if="items.length > 0" class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300 mb-ds-300 space-y-ds-200">
        <!-- 搜尋框 -->
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋品項名稱..."
            class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200"
          />
        </div>

        <!-- 分類導航和篩選 -->
        <div class="flex flex-col sm:flex-row gap-ds-200">
          <!-- 分類導航 -->
          <div class="flex-1">
            <div class="flex flex-wrap gap-ds-100">
              <button
                @click="selectedCategory = null"
                :class="[
                  'px-ds-200 py-ds-075 rounded-ds-100 text-sm font-medium transition-colors',
                  selectedCategory === null
                    ? 'bg-ds-background-brand text-ds-text-inverse'
                    : 'bg-ds-background-neutral text-ds-text hover:bg-ds-background-neutral-bold',
                ]"
              >
                全部
              </button>
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = category; scrollToCategory(category)"
                :class="[
                  'px-ds-200 py-ds-075 rounded-ds-100 text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-ds-background-brand text-ds-text-inverse'
                    : 'bg-ds-background-neutral text-ds-text hover:bg-ds-background-neutral-bold',
                ]"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <!-- 價格篩選 -->
          <div class="flex items-center gap-ds-100">
            <input
              v-model.number="minPrice"
              type="number"
              placeholder="最低"
              min="0"
              step="1"
              class="w-24 px-ds-150 py-ds-075 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text text-sm focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
            />
            <span class="text-ds-text-subtle">-</span>
            <input
              v-model.number="maxPrice"
              type="number"
              placeholder="最高"
              min="0"
              step="1"
              class="w-24 px-ds-150 py-ds-075 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text text-sm focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
            />
            <button
              v-if="minPrice || maxPrice"
              @click="minPrice = null; maxPrice = null"
              class="px-ds-150 py-ds-075 text-xs text-ds-text-subtle hover:text-ds-text transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      <!-- 品項列表 -->
      <div v-if="filteredItems.length > 0" class="space-y-ds-300">
        <h2 class="text-xl font-semibold text-ds-text">品項列表</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-300">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            :id="`item-${item.id}`"
            class="bg-ds-surface rounded-ds-200 shadow-ds-raised p-ds-300 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            <!-- 品項圖片 -->
            <div v-if="item.imageUrl" class="mb-ds-200 rounded-ds-100 overflow-hidden bg-ds-background-neutral-subtle">
              <img :src="item.imageUrl" :alt="item.name" class="w-full h-40 object-cover" />
            </div>

            <!-- 品項資訊 -->
            <div class="flex justify-between items-start mb-ds-150">
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

            <h3 class="text-lg font-semibold text-ds-text mb-ds-150">{{ item.name }}</h3>
            <div v-if="item.description" class="text-sm text-ds-text-subtle mb-ds-150 line-clamp-2">
              {{ item.description }}
            </div>
            <div class="text-2xl font-bold text-ds-text-accent-blue mb-ds-300">NT$ {{ formatPrice(item.price) }}</div>

            <!-- 加入購物車按鈕 -->
            <button
              @click="handleAddToCart(item)"
              class="w-full px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
            >
              加入購物車
            </button>
          </div>
        </div>
      </div>

      <!-- 空的品項列表 -->
      <div v-else-if="items.length === 0" class="text-center py-ds-1000 bg-ds-surface rounded-ds-200 shadow-ds-raised">
        <p class="text-ds-text-subtle">目前沒有任何品項</p>
      </div>
      <!-- 篩選後無結果 -->
      <div v-else class="text-center py-ds-1000 bg-ds-surface rounded-ds-200 shadow-ds-raised">
        <p class="text-ds-text-subtle">沒有符合條件的品項</p>
        <button
          @click="searchQuery = ''; selectedCategory = null; minPrice = null; maxPrice = null"
          class="mt-ds-200 px-ds-200 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors"
        >
          清除篩選條件
        </button>
      </div>
    </div>

    <!-- 購物車浮動按鈕 -->
    <div
      v-if="cart.length > 0"
      class="fixed bottom-ds-300 right-ds-300 z-40"
    >
      <button
        @click="showCart = true"
        class="bg-ds-background-brand text-ds-text-inverse px-ds-400 py-ds-200 rounded-ds-200 shadow-ds-overlay hover:bg-ds-background-brand-boldest transition-all duration-200 transform hover:scale-105 flex items-center gap-ds-150 font-medium"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>購物車 ({{ totalQuantity }})</span>
        <span class="font-bold">NT$ {{ formatPrice(totalAmount) }}</span>
      </button>
    </div>

    <!-- 購物車 Modal -->
    <div
      v-if="showCart"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="showCart = false"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col transform transition-all duration-300 animate-scaleIn">
        <!-- Modal 標題 -->
        <div class="flex items-center justify-between p-ds-400 pb-ds-200 border-b border-ds-border flex-shrink-0">
          <h2 class="text-xl font-semibold text-ds-text">購物車</h2>
          <button
            @click="showCart = false"
            class="text-ds-text-subtle hover:text-ds-text hover:bg-ds-background-neutral rounded-ds-050 p-ds-075 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 購物車內容（可滾動） -->
        <div class="flex-1 overflow-y-auto px-ds-400 py-ds-300">
          <div v-if="cart.length === 0" class="text-center py-ds-800">
            <p class="text-ds-text-subtle">購物車是空的</p>
          </div>

          <div v-else class="space-y-ds-200">
            <div
              v-for="(cartItem, index) in cart"
              :key="`${cartItem.itemId}-${JSON.stringify(cartItem.customizationOptions)}`"
              class="bg-ds-background-neutral-subtle rounded-ds-100 p-ds-200 border border-ds-border"
            >
              <div class="flex items-start justify-between mb-ds-150">
                <div class="flex-1">
                  <h3 class="font-semibold text-ds-text mb-ds-050">{{ cartItem.item.name }}</h3>
                  <div class="text-sm text-ds-text-accent-blue font-medium mb-ds-050">NT$ {{ formatPrice(cartItem.item.price) }}</div>
                  <!-- 客製化選項顯示 -->
                  <div v-if="cartItem.customizationOptions && Object.keys(cartItem.customizationOptions).length > 0" class="text-xs text-ds-text-subtle mt-ds-050">
                    <div v-for="(value, key) in cartItem.customizationOptions" :key="key">
                      <span class="font-medium">{{ key }}：</span>{{ value }}
                    </div>
                  </div>
                  <!-- 備註顯示 -->
                  <div v-if="cartItem.notes" class="text-xs text-ds-text-subtle mt-ds-050">
                    <span class="font-medium">備註：</span>{{ cartItem.notes }}
                  </div>
                </div>
                <button
                  @click="removeFromCart(index)"
                  class="text-ds-text-accent-red hover:text-ds-text-accent-red-bold transition-colors ml-ds-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- 數量控制 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-ds-150">
                  <button
                    @click="decreaseQuantity(index)"
                    class="w-8 h-8 rounded-ds-100 border border-ds-border bg-ds-surface text-ds-text hover:bg-ds-background-neutral transition-colors flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="text-ds-text font-medium w-8 text-center">{{ cartItem.quantity }}</span>
                  <button
                    @click="increaseQuantity(index)"
                    class="w-8 h-8 rounded-ds-100 border border-ds-border bg-ds-surface text-ds-text hover:bg-ds-background-neutral transition-colors flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div class="text-sm font-medium text-ds-text">
                  小計：NT$ {{ formatPrice(cartItem.item.price * cartItem.quantity) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單備註 -->
          <div v-if="cart.length > 0" class="mt-ds-400 pt-ds-300 border-t border-ds-border">
            <label class="block text-sm font-medium text-ds-text mb-ds-075">訂單備註（選填）</label>
            <textarea
              v-model="orderNotes"
              rows="3"
              placeholder="如有特殊需求請在此填寫..."
              class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <!-- 購物車總計和操作按鈕 -->
        <div v-if="cart.length > 0" class="p-ds-400 pt-ds-300 border-t border-ds-border flex-shrink-0 space-y-ds-200">
          <div class="flex justify-between items-center text-lg font-semibold text-ds-text">
            <span>總計：</span>
            <span class="text-ds-text-accent-blue">NT$ {{ formatPrice(totalAmount) }}</span>
          </div>
          <button
            @click="submitOrder"
            :disabled="!participantName.trim() || loading"
            class="w-full px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading" class="flex items-center justify-center gap-ds-075">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              提交中...
            </span>
            <span v-else>提交點餐</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 客製化選項選擇 Modal -->
    <div
      v-if="selectedItemForCustomization"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
      @click.self="selectedItemForCustomization = null"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-ds-400 transform transition-all duration-300 animate-scaleIn">
        <h2 class="text-xl font-semibold text-ds-text mb-ds-300">{{ selectedItemForCustomization.name }}</h2>
        <div class="space-y-ds-300 mb-ds-400">
          <div v-for="option in selectedItemForCustomization.customizationOptions" :key="option.id || option.optionName" class="space-y-ds-100">
            <label class="block text-sm font-medium text-ds-text">{{ option.optionName }}</label>
            <select
              v-model="customizationSelections[option.optionName]"
              class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-border-focus"
            >
              <option v-for="value in option.optionValues" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex gap-ds-200">
          <button
            @click="selectedItemForCustomization = null"
            class="flex-1 px-ds-300 py-ds-100 border border-ds-border rounded-ds-100 text-ds-text bg-ds-surface hover:bg-ds-background-neutral transition-colors font-medium"
          >
            取消
          </button>
          <button
            @click="confirmCustomization"
            class="flex-1 px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest transition-colors font-medium"
          >
            確認加入購物車
          </button>
        </div>
      </div>
    </div>

    <!-- 姓名輸入對話框 -->
    <div
      v-if="showNameDialog && order"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-ds-300 z-50 animate-fadeIn"
    >
      <div class="bg-ds-surface rounded-ds-300 shadow-2xl max-w-md w-full p-ds-400 transform transition-all duration-300 animate-scaleIn">
        <h2 class="text-xl font-semibold text-ds-text mb-ds-200">請輸入您的姓名</h2>
        <p class="text-sm text-ds-text-subtle mb-ds-300">我們需要您的姓名來記錄點餐資訊</p>
        <input
          v-model="participantName"
          type="text"
          placeholder="請輸入您的姓名"
          class="w-full px-ds-200 py-ds-100 border border-ds-border rounded-ds-100 bg-ds-surface text-ds-text placeholder-ds-text-subtlest focus:outline-none focus:ring-2 focus:ring-ds-border-focus focus:border-ds-border-focus transition-all duration-200 mb-ds-300"
          @keyup.enter="confirmName"
        />
        <div class="flex gap-ds-200">
          <button
            @click="confirmName"
            :disabled="!participantName.trim()"
            class="flex-1 px-ds-300 py-ds-100 bg-ds-background-brand text-ds-text-inverse rounded-ds-100 hover:bg-ds-background-brand-boldest disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useItemsStore } from '@/stores/items'
import type { Order } from '@/types/order'
import type { Item } from '@/types/item'
import type { CartItem } from '@/types/order'

const route = useRoute()
const ordersStore = useOrdersStore()
const itemsStore = useItemsStore()

const order = ref<Order | null>(null)
const items = ref<Item[]>([])
const cart = ref<CartItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showCart = ref(false)
const showNameDialog = ref(false)
const participantName = ref('')
const orderNotes = ref('')
const selectedItemForCustomization = ref<Item | null>(null)
const customizationSelections = ref<Record<string, string>>({})
const myOrderItems = ref<any[]>([])

// 搜尋和篩選
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

// 從 URL 參數中獲取姓名（如果有）
const urlName = route.query.name as string | undefined

// 計算購物車總數量和總金額
const totalQuantity = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.item.price * item.quantity, 0)
})

// 分類列表
const categories = computed(() => {
  const cats = new Set<string>()
  items.value.forEach((item) => {
    if (item.category) {
      cats.add(item.category)
    }
  })
  return Array.from(cats).sort()
})

// 篩選後的品項列表
const filteredItems = computed(() => {
  let result = items.value

  // 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter((item) => item.name.toLowerCase().includes(query))
  }

  // 分類篩選
  if (selectedCategory.value !== null) {
    result = result.filter((item) => item.category === selectedCategory.value)
  }

  // 價格篩選
  if (minPrice.value !== null) {
    result = result.filter((item) => item.price >= minPrice.value!)
  }
  if (maxPrice.value !== null) {
    result = result.filter((item) => item.price <= maxPrice.value!)
  }

  return result
})

// 我的訂單項目
const myOrderItemsTotalQuantity = computed(() => {
  return myOrderItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const myOrderItemsTotalAmount = computed(() => {
  return myOrderItems.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const isDeadlinePassed = computed(() => {
  if (!order.value) return false
  return new Date(order.value.deadline) <= new Date()
})

// 點擊分類標籤時滾動到該分類的第一個品項
function scrollToCategory(category: string | null) {
  if (category === null) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const firstItem = filteredItems.value.find((item) => item.category === category)
  if (firstItem) {
    const element = document.getElementById(`item-${firstItem.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 載入訂單和品項
async function loadOrder() {
  const token = route.params.token as string
  if (!token) {
    error.value = '訂單 Token 不存在'
    return
  }

  loading.value = true
  error.value = null

  try {
    // 載入訂單資訊
    order.value = await ordersStore.getOrderByToken(token)

    // 載入品項列表
    items.value = await itemsStore.fetchItemsByOrderToken(token)

    // 檢查是否需要顯示姓名輸入對話框
    if (!localStorage.getItem(`order_${token}_name`)) {
      if (urlName) {
        participantName.value = urlName
        confirmName()
      } else {
        showNameDialog.value = true
      }
    } else {
      participantName.value = localStorage.getItem(`order_${token}_name`) || ''
    }

    // 載入我的訂單項目
    if (order.value.items && participantName.value) {
      myOrderItems.value = order.value.items.filter((item: any) => item.participantName === participantName.value)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '載入訂單失敗'
  } finally {
    loading.value = false
  }
}

function confirmName() {
  if (participantName.value.trim()) {
    const token = route.params.token as string
    localStorage.setItem(`order_${token}_name`, participantName.value.trim())
    showNameDialog.value = false
  }
}

function handleAddToCart(item: Item) {
  // 如果有客製化選項，顯示選擇對話框
  if (item.customizationOptions && item.customizationOptions.length > 0) {
    selectedItemForCustomization.value = item
    // 初始化選項值（使用預設值或第一個選項值）
    customizationSelections.value = {}
    item.customizationOptions.forEach((opt) => {
      customizationSelections.value[opt.optionName] = opt.defaultValue || opt.optionValues[0]
    })
  } else {
    // 無客製化選項，直接加入購物車
    addToCart(item)
  }
}

function addToCart(item: Item, customizationOptions?: Record<string, string>) {
  // 檢查購物車中是否已有此品項（相同的客製化選項）
  const existingIndex = cart.value.findIndex(
    (ci) => ci.itemId === item.id && JSON.stringify(ci.customizationOptions) === JSON.stringify(customizationOptions),
  )
  if (existingIndex >= 0) {
    cart.value[existingIndex].quantity++
  } else {
    cart.value.push({
      itemId: item.id,
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      },
      quantity: 1,
      customizationOptions,
    })
  }
}

function confirmCustomization() {
  if (selectedItemForCustomization.value) {
    addToCart(selectedItemForCustomization.value, { ...customizationSelections.value })
    selectedItemForCustomization.value = null
    customizationSelections.value = {}
  }
}

function increaseQuantity(index: number) {
  if (cart.value[index]) {
    cart.value[index].quantity++
  }
}

function decreaseQuantity(index: number) {
  if (cart.value[index]) {
    if (cart.value[index].quantity > 1) {
      cart.value[index].quantity--
    } else {
      cart.value.splice(index, 1)
    }
  }
}

function removeFromCart(index: number) {
  cart.value.splice(index, 1)
}

async function submitOrder() {
  if (!participantName.value.trim()) {
    alert('請先輸入您的姓名')
    return
  }

  if (cart.value.length === 0) {
    alert('購物車是空的')
    return
  }

  if (!confirm(`確定要提交點餐嗎？共 ${totalQuantity.value} 項，總金額 NT$ ${formatPrice(totalAmount.value)}`)) {
    return
  }

  const token = route.params.token as string
  loading.value = true
  error.value = null

  try {
    const submitData = {
      participantName: participantName.value.trim(),
      items: cart.value.map((ci) => ({
        itemId: ci.itemId,
        quantity: ci.quantity,
        customizationOptions: ci.customizationOptions,
        notes: ci.notes,
      })),
      notes: orderNotes.value.trim() || undefined,
    }

    await ordersStore.submitOrder(token, submitData)

    // 成功提示
    alert('點餐提交成功！')

    // 清空購物車和備註
    cart.value = []
    orderNotes.value = ''
    showCart.value = false

    // 重新載入訂單資訊（顯示已提交的訂單項目）
    await loadOrder()
  } catch (err: any) {
    error.value = err.response?.data?.message || '提交點餐失敗'
    alert(error.value)
  } finally {
    loading.value = false
  }
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

async function loadMyOrderToCart() {
  if (!order.value || !participantName.value) return

  // 將我的訂單項目載入購物車
  cart.value = []
  for (const orderItem of myOrderItems.value) {
    const item = items.value.find((i) => i.id === orderItem.itemId)
    if (item) {
      let customizationOptions: Record<string, string> | undefined
      if (orderItem.customizationOptions) {
        try {
          customizationOptions = typeof orderItem.customizationOptions === 'string' 
            ? JSON.parse(orderItem.customizationOptions) 
            : orderItem.customizationOptions
        } catch {
          customizationOptions = undefined
        }
      }

      cart.value.push({
        itemId: item.id,
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          category: item.category,
        },
        quantity: orderItem.quantity,
        customizationOptions,
        notes: orderItem.notes || undefined,
      })
    }
  }
  orderNotes.value = ''
  showCart.value = true
}

async function confirmCancelOrder() {
  if (!confirm('確定要取消您的點餐嗎？此操作無法復原。')) {
    return
  }

  const token = route.params.token as string
  loading.value = true
  error.value = null

  try {
    await ordersStore.cancelOrder(token, participantName.value)
    alert('訂單已取消')
    myOrderItems.value = []
    await loadOrder()
  } catch (err: any) {
    error.value = err.response?.data?.message || '取消訂單失敗'
    alert(error.value)
  } finally {
    loading.value = false
  }
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadOrder()
})
</script>
