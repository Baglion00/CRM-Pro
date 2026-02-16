const CACHE_NAME = 'autoquote-pro-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — Network First strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET and chrome-extension requests
    if (event.request.method !== 'GET') return;
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Offline fallback
                return caches.match(event.request).then((cached) => {
                    return cached || new Response('Offline', { status: 503 });
                });
            })
    );
});
