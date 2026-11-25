/* Offline support. The page itself is fetched from the network first, so updates arrive as soon as you are online;
   the cached copy is used only when the network fails. Fonts are self-hosted and precached.
   Real recordings (Wikimedia) and YouTube are never cached. */
const VERSION = 'maqamat-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'fonts/fonts.css',
  'fonts/Amiri-400-arabic.woff2',
  'fonts/Amiri-400-latin-ext.woff2',
  'fonts/Amiri-400-latin.woff2',
  'fonts/Amiri-700-arabic.woff2',
  'fonts/Amiri-700-latin-ext.woff2',
  'fonts/Amiri-700-latin.woff2',
  'fonts/IBMPlexSans-400-latin-ext.woff2',
  'fonts/IBMPlexSans-400-latin.woff2',
  'fonts/IBMPlexSans-500-latin-ext.woff2',
  'fonts/IBMPlexSans-500-latin.woff2',
  'fonts/IBMPlexSans-600-latin-ext.woff2',
  'fonts/IBMPlexSans-600-latin.woff2',
  'fonts/IBMPlexSansArabic-400-arabic.woff2',
  'fonts/IBMPlexSansArabic-400-latin-ext.woff2',
  'fonts/IBMPlexSansArabic-400-latin.woff2',
  'fonts/IBMPlexSansArabic-600-arabic.woff2',
  'fonts/IBMPlexSansArabic-600-latin-ext.woff2',
  'fonts/IBMPlexSansArabic-600-latin.woff2',
  'fonts/ReemKufi-500-arabic.woff2',
  'fonts/ReemKufi-500-latin-ext.woff2',
  'fonts/ReemKufi-500-latin.woff2',
  'fonts/ReemKufi-700-arabic.woff2',
  'fonts/ReemKufi-700-latin-ext.woff2',
  'fonts/ReemKufi-700-latin.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.headers.has('range')) return;
    e.respondWith(fetch(req).then(res => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
});
