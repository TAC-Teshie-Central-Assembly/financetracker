// service-worker.js

// Cache name to avoid conflict with other versions
const CACHE_NAME = 'my-app-cache-v1';

// List of files to cache (this can be dynamically generated if needed)
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css', // Your CSS file(s)
  '/script.js',     // Your app icon (optional)
  '/favicon.ico',    // Your app icon (optional)
];

// Install event - cache necessary files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches if necessary
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached files if available, otherwise fetch from the network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the file is cached, serve it from cache
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from the network
      return fetch(event.request);
    })
  );
});
