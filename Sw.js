const CACHE_NAME = 'mboka-roi-universal-v2';
const urlsToCache = ['/mboka-clash/', '/mboka-clash/index.html', '/mboka-clash/manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
