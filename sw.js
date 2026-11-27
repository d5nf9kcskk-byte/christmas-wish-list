// Network first, cache as offline fallback. Only the app itself and its CDN scripts/fonts are cached:
// Supabase responses (who claimed what) and store images must never sit on the device.
const C = 'wl-v2';
const KEEP = [location.origin, 'https://cdn.tailwindcss.com', 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !KEEP.includes(new URL(e.request.url).origin)) return;
  e.respondWith(fetch(e.request).then(r => {
    const cp = r.clone();
    caches.open(C).then(c => c.put(e.request, cp));
    return r;
  }).catch(() => caches.match(e.request)));
});
