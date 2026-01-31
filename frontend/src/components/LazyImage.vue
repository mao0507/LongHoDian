<template>
  <div :class="['lazy-image-container', containerClass]" :style="containerStyle">
    <!-- 骨架屏/佔位圖 -->
    <div
      v-if="!isLoaded && !hasError"
      class="lazy-image-skeleton"
    >
      <div class="skeleton-shimmer"></div>
      <svg class="skeleton-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <!-- 錯誤狀態 -->
    <div
      v-else-if="hasError"
      class="lazy-image-error"
    >
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span v-if="showErrorText" class="error-text">圖片載入失敗</span>
    </div>

    <!-- 實際圖片 -->
    <img
      v-show="isLoaded && !hasError"
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :class="['lazy-image', imageClass]"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  src: string
  alt?: string
  placeholder?: string
  aspectRatio?: string // e.g., '16/9', '4/3', '1/1'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  containerClass?: string
  imageClass?: string
  showErrorText?: boolean
  threshold?: number // Intersection observer threshold
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholder: '',
  aspectRatio: '',
  objectFit: 'cover',
  containerClass: '',
  imageClass: '',
  showErrorText: false,
  threshold: 0.1,
})

const emit = defineEmits<{
  load: []
  error: [error: Event]
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref<boolean>(false)
const hasError = ref<boolean>(false)
const isInView = ref<boolean>(false)
const observer = ref<IntersectionObserver | null>(null)

// 計算當前要顯示的圖片 src
const currentSrc = computed<string>(() => {
  if (!isInView.value) {
    return props.placeholder || ''
  }
  return props.src
})

// 容器樣式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.aspectRatio) {
    style.aspectRatio = props.aspectRatio
  }
  return style
})

// 圖片樣式
const imageStyle = computed(() => {
  return {
    objectFit: props.objectFit,
  }
})

// 處理圖片載入成功
const handleLoad = (): void => {
  isLoaded.value = true
  hasError.value = false
  emit('load')
}

// 處理圖片載入失敗
const handleError = (event: Event): void => {
  hasError.value = true
  isLoaded.value = false
  emit('error', event)
}

// 設置 Intersection Observer
const setupObserver = (): void => {
  if (!imageRef.value?.parentElement) return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          // 進入視窗後不再需要觀察
          observer.value?.disconnect()
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: '50px', // 提前 50px 開始載入
    },
  )

  observer.value.observe(imageRef.value.parentElement)
}

// 監聽 src 變化
watch(() => props.src, () => {
  isLoaded.value = false
  hasError.value = false
})

onMounted(() => {
  // 如果沒有 src，直接標記為視窗內
  if (!props.src) {
    isInView.value = true
    return
  }

  // 延遲設置 observer，確保 DOM 已渲染
  setTimeout(() => {
    setupObserver()
  }, 0)
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<style scoped>
.lazy-image-container {
  @apply relative overflow-hidden bg-ds-background-neutral-subtle;
  @apply rounded-ds-100;
}

.lazy-image-skeleton {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-ds-background-neutral;
}

.skeleton-shimmer {
  @apply absolute inset-0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-icon {
  @apply w-12 h-12 text-ds-text-subtlest opacity-50;
  z-index: 1;
}

.lazy-image-error {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply bg-ds-background-neutral-subtle text-ds-text-subtle;
}

.error-icon {
  @apply w-10 h-10 opacity-40;
}

.error-text {
  @apply text-xs mt-ds-100 opacity-60;
}

.lazy-image {
  @apply w-full h-full;
  @apply transition-opacity duration-300;
}
</style>
