const CACHE_NAME = 'calentamiento-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Cacheamos dinámicamente el CDN de Tailwind para que funcione sin conexión
        if (event.request.url.includes('cdn.tailwindcss.com')) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      }).catch(error => {
        console.error('Fetch failed:', error);
        // Aquí se podría devolver un fallback si fuera necesario
      });
    })
  );
});
