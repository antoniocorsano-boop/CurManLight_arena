const CACHE_NAME = 'curmanlight-v1.6.0';
const MODEL_CACHE_NAME = 'curmanlight-model-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== MODEL_CACHE_NAME) {
            console.log('SW: Rimozione vecchia cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // If it's a request for WebLLM, GGUF weights, or HuggingFace WASM, use persistent cache-first strategy!
  if (e.request.url.includes('huggingface.co') || e.request.url.includes('webllm') || e.request.url.endsWith('.wasm') || e.request.url.endsWith('.bin')) {
    e.respondWith(
      caches.open(MODEL_CACHE_NAME).then((cache) => {
        return cache.match(e.request).then((response) => {
          return response || fetch(e.request).then((networkResponse) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // If it's a navigation request (HTML page), use Network-First strategy!
  // This guarantees that online users always load the latest deployed version,
  // bypassing the "cache trap" while fully preserving offline-first functionality.
  if (e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url === self.location.origin + '/') {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // For other static assets (CSS, JS, Fonts), use Cache-First with Network-Fallback
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache external assets on-the-fly
        if (e.request.url.startsWith('http') || e.request.url.includes('cdn') || e.request.url.includes('unpkg')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback for static assets in case of offline
      return new Response('', { status: 404 });
    })
  );
});
