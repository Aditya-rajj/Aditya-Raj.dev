const CACHE = 'aditya-portfolio-v15';
const ASSETS = [
  './',
  './index.html',
  './offline.html',
  './404.html',
  './style.css?v=15',
  './cloud-config.js?v=15',
  './cloud.js?v=15',
  './script.js?v=15',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() =>
        caches.match('./offline.html').then(r => r || caches.match('./index.html'))
      )
    );
  }
});
