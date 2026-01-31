// Service Worker for PWA and Web Push notifications
const CACHE_NAME = 'longhodian-v1'
const STATIC_CACHE = 'longhodian-static-v1'
const DYNAMIC_CACHE = 'longhodian-dynamic-v1'

// 需要預先快取的靜態資源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// 安裝事件 - 預先快取靜態資源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets')
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.log('[SW] Pre-cache failed for some assets:', err)
        })
      })
      .then(() => self.skipWaiting())
  )
})

// 啟用事件 - 清理舊快取
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// 請求攔截 - 實作 Stale-While-Revalidate 策略
self.addEventListener('fetch', (event) => {
  const { request } = event

  // 只處理 GET 請求
  if (request.method !== 'GET') return

  // 跳過 API 請求（讓它們直接走網路）
  if (request.url.includes('/api/')) {
    return
  }

  // 跳過 Chrome 擴充功能請求
  if (request.url.startsWith('chrome-extension://')) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 返回快取的同時，在背景更新快取
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // 只快取成功的回應
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // 網路失敗時，返回離線頁面（如果有的話）
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
          return null
        })

      // 優先返回快取，沒有快取則等待網路
      return cachedResponse || fetchPromise
    })
  )
})

// 推播通知事件
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received')

  let data = {
    title: '午餐點餐平台',
    body: '您有新的通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: { url: '/' },
  }

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e)
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: data.data,
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '查看',
      },
      {
        action: 'close',
        title: '關閉',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// 通知點擊事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 如果已有開啟的視窗，聚焦並導航
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus().then(() => {
            if (client.url !== urlToOpen && 'navigate' in client) {
              return client.navigate(urlToOpen)
            }
          })
        }
      }

      // 如果沒有開啟的視窗，開啟新視窗
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// 背景同步（未來擴充用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag)
})

// 訊息處理
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
