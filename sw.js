const CACHE_NAME = 'luxury-portfolio-v63';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/booking.html',
    '/style.css',
    '/main.js',
    '/nav.js',
    '/footer.js',
    '/config.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only cache simple HTTP GET requests (ignore extensions, POSTs, etc)
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                }
                return networkResponse;
            }).catch(() => cachedResponse); // Failsafe fallback to cache if offline
            return cachedResponse || fetchPromise; // Stale-while-revalidate strategy
        })
    );
});
