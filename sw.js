// sw.js - Minimal Service Worker for Lee's Coffee POS PWA installation support
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Bypass caching to ensure "live cloud checking" works perfectly on FABI
  e.respondWith(fetch(e.request));
});
