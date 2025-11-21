const CACHE_NAME = 'oman-pulse-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - Network first, fallback to cache strategy (safe for dynamic content)
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests or API calls if needed, 
  // but for PWA installability, a basic fetch handler is required.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});