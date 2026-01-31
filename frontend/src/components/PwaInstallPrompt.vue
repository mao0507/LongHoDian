<template>
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="fixed bottom-0 left-0 right-0 z-50 p-ds-200 safe-area-bottom"
    >
      <div class="max-w-md mx-auto bg-ds-surface rounded-ds-200 shadow-ds-overlay border border-ds-border p-ds-200">
        <div class="flex items-start gap-ds-150">
          <!-- 圖示 -->
          <div class="w-12 h-12 bg-ds-accent-blue rounded-ds-150 flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <!-- 內容 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-ds-text mb-ds-050">安裝午餐點餐 App</h3>
            <p class="text-sm text-ds-text-subtle mb-ds-150">
              安裝到主畫面，享受更快速的使用體驗
            </p>
            <div class="flex gap-ds-100">
              <button
                @click="handleInstall"
                class="px-ds-200 py-ds-100 bg-ds-accent-blue text-white rounded-ds-100 text-sm font-medium hover:bg-ds-accent-blue/90 active:bg-ds-accent-blue/80 transition-colors touch-manipulation"
              >
                安裝
              </button>
              <button
                @click="handleDismiss"
                class="px-ds-200 py-ds-100 text-ds-text-subtle rounded-ds-100 text-sm hover:bg-ds-background-neutral active:bg-ds-background-neutral-bold transition-colors touch-manipulation"
              >
                稍後再說
              </button>
            </div>
          </div>

          <!-- 關閉按鈕 -->
          <button
            @click="handleDismiss"
            class="text-ds-text-subtle hover:text-ds-text p-ds-050 -mt-ds-050 -mr-ds-050 touch-manipulation"
            aria-label="關閉"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- iOS 安裝說明 -->
        <div v-if="isIOS && !isStandalone" class="mt-ds-200 pt-ds-200 border-t border-ds-border">
          <p class="text-sm text-ds-text-subtle">
            <span class="font-medium text-ds-text">iOS 安裝說明：</span>
            點擊 Safari 底部的
            <svg class="w-4 h-4 inline-block mx-ds-025 text-ds-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            分享按鈕，然後選擇「加入主畫面」
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const showPrompt = ref<boolean>(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

// 檢測是否為 iOS
const isIOS = computed<boolean>(() => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
})

// 檢測是否已安裝（獨立模式）
const isStandalone = computed<boolean>(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
})

// 檢查是否應該顯示提示
const shouldShowPrompt = (): boolean => {
  // 已經是獨立模式，不顯示
  if (isStandalone.value) return false

  // 檢查是否之前已經拒絕過
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10)
    const now = Date.now()
    // 7 天內不再顯示
    if (now - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
      return false
    }
  }

  return true
}

// 處理安裝
const handleInstall = async (): Promise<void> => {
  if (deferredPrompt.value) {
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      console.log('PWA 已安裝')
    }

    deferredPrompt.value = null
    showPrompt.value = false
  } else if (isIOS.value) {
    // iOS 無法自動安裝，保持提示顯示讓用戶看到說明
  }
}

// 處理關閉
const handleDismiss = (): void => {
  showPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
}

onMounted(() => {
  // 監聽 beforeinstallprompt 事件（僅 Chrome/Edge/Android）
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent

    if (shouldShowPrompt()) {
      // 延遲顯示，避免干擾用戶
      setTimeout(() => {
        showPrompt.value = true
      }, 3000)
    }
  })

  // iOS 沒有 beforeinstallprompt，手動顯示提示
  if (isIOS.value && shouldShowPrompt()) {
    setTimeout(() => {
      showPrompt.value = true
    }, 5000)
  }
})
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(env(safe-area-inset-bottom, 0), 16px);
}

/* 滑入動畫 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
