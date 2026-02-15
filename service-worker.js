const CACHE_NAME = 'ruafit-static-v2';
const ASSET_CACHE = 'ruafit-assets-v2';
const BASE_PATH = new URL(self.registration.scope).pathname;

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
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => ![CACHE_NAME, ASSET_CACHE].includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

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
