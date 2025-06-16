// This is a simple service worker for the PWA
// In a production app, you would use Workbox or another library for more advanced caching

const CACHE_NAME = "duchess-pastries-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/images/red-velvet.png",
  "/images/categories/cake.png",
  "/images/categories/cupcake.png",
  "/images/categories/cookies.png",
  "/images/categories/bread.png",
  "/images/image1.png",
  "/images/image2.png",
  "/images/image3.png",
  // Add other important assets here
]

// TypeScript interfaces for service worker events
interface ExtendedServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  __WB_MANIFEST: any
}

declare const self: ExtendedServiceWorkerGlobalScope

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
          return null
        }),
      )
    }),
  )
})
