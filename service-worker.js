const CACHE_NAME = 'ruafit-static-v3';
const ASSET_CACHE = 'ruafit-assets-v3';
const BASE_PATH = new URL(self.registration.scope).pathname;
const RELOAD_MESSAGE_TYPE = 'SERVICE_WORKER_UPDATED';

const CORE_ASSETS = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}programme.html`,
  `${BASE_PATH}sports.html`,
  `${BASE_PATH}venue.html`,
  `${BASE_PATH}gallery.html`,
  `${BASE_PATH}announcements.html`,
  `${BASE_PATH}contact.html`,
  `${BASE_PATH}404.html`,
  `${BASE_PATH}css/styles.css`,
  `${BASE_PATH}js/app.js`,
  `${BASE_PATH}js/router.js`,
  `${BASE_PATH}js/storage.js`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}data/event.json`,
  `${BASE_PATH}data/programme.json`,
  `${BASE_PATH}data/sports.json`,
  `${BASE_PATH}data/gallery.json`,
  `${BASE_PATH}data/announcements.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => ![CACHE_NAME, ASSET_CACHE].includes(k)).map((k) => caches.delete(k)));

      const coreCache = await caches.open(CACHE_NAME);
      await Promise.all(
        CORE_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(new Request(asset, { cache: 'reload' }));
            if (response.ok) await coreCache.put(asset, response);
          } catch {
            // Keep the previously cached resource when a network refresh fails.
          }
        })
      );

      await self.clients.claim();

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => client.postMessage({ type: RELOAD_MESSAGE_TYPE }));
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isDataRequest = requestUrl.origin === self.location.origin
    && requestUrl.pathname.startsWith(`${BASE_PATH}data/`);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(event.request)) || (await cache.match(`${BASE_PATH}offline.html`));
        })
    );
    return;
  }

  if (isDataRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(ASSET_CACHE);
          return (await cache.match(event.request)) || (await caches.match(`${BASE_PATH}offline.html`));
        })
    );
    return;
  }

  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch {
        return caches.match(`${BASE_PATH}offline.html`);
      }
    })
  );
});
