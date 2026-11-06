// Offline support. The page itself is always fetched fresh when online, so updates show up straight away; the cache
// is only the fallback when there is no connection. Built files have a content hash in their name, so those are
// served from the cache first.
const CACHE = 'atelier-noor-books-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document' || new URL(req.url).pathname.endsWith('/sw.js');
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      if (isPage) {
        try {
          const res = await fetch(req, { cache: 'no-cache' });
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return (await cache.match(req)) || (await cache.match('./index.html')) || Response.error();
        }
      }
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }),
  );
});
