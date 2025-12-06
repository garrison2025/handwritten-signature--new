
const CACHE_NAME = 'signcraft-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// External assets to cache for offline usage (CDNs)
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/react@^19.2.1/',
  'https://aistudiocdn.com/react@^19.2.1',
  'https://aistudiocdn.com/react-dom@^19.2.1/',
  'https://esm.sh/perfect-freehand@1.2.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We process these promises strictly to avoid failure on one failing all
      // but ideally we want to cache core assets.
      return Promise.all([
        cache.addAll(STATIC_ASSETS),
        // Attempt to cache external assets, but don't fail install if one fails (optional robustness)
        ...EXTERNAL_ASSETS.map(url => cache.add(url).catch(err => console.warn('Failed to cache external:', url, err)))
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML): Network First, fall back to Cache
  // This ensures users always get the latest version when they refresh or open the app.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request).then(res => res || caches.match('/index.html'));
        })
    );
    return;
  }

  // 2. External Assets & Static Files: Stale-While-Revalidate
  // Serve from cache immediately for speed, but update cache in background.
  if (EXTERNAL_ASSETS.some(asset => url.href.includes(asset)) || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Google Fonts (Cache First)
  // Fonts rarely change, so we can aggressively cache them.
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request).then((response) => {
           // Cache opaque responses (CDN)
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
           return response;
        });
      })
    );
    return;
  }

  // Default: Network Only (or standard browser cache)
});
