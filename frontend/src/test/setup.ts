// 測試設定檔
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// 在每個測試前重置 Pinia
beforeEach(() => {
  setActivePinia(createPinia())
})

// 全域元件 mock
config.global.stubs = {
  // 如有需要可以 stub RouterLink 等元件
  RouterLink: true,
  RouterView: true,
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
