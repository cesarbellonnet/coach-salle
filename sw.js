// Service worker : l'app s'ouvre même sans réseau, et se met à jour toute seule.
// À chaque ouverture, il affiche tout de suite la copie en cache, va chercher la version du serveur en arrière-plan,
// et prévient la page si un fichier a changé pour qu'elle se recharge.
const VERSION = 'coach-salle-v3';
const APP = ['./', 'index.html', 'css/style.css', 'js/data.js', 'js/ai.js', 'js/today.js', 'js/barcode.js', 'js/gym.js',
  'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const TEXT = /\.(html|css|js|webmanifest)$|\/$/;     // fichiers dont on compare le contenu

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function notify() {
  self.clients.matchAll({ type: 'window' }).then(cs => cs.forEach(c => c.postMessage({ type: 'updated' })));
}
// Récupère la version du serveur, la met en cache, et signale un changement de contenu par rapport à `old`
async function update(cache, key, url, old, compare) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) return res;
  const changed = !!old && compare && (await old.text()) !== (await res.clone().text());
  await cache.put(key, res.clone());
  if (changed) notify();
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // les appels à l'API ne passent pas par le cache
  const url = new URL(req.url);
  const isApp = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!isApp && !isFont) return;
  // Réponse immédiate depuis le cache, mise à jour en arrière-plan
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: isApp });
    const fresh = isApp
      ? update(cache, req, req.url, cached ? cached.clone() : null, TEXT.test(url.pathname)).catch(() => cached)
      : fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
    if (!cached) return fresh;
    e.waitUntil(fresh);
    return cached;
  }));
});

// La page demande une vérification quand elle revient au premier plan
self.addEventListener('message', e => {
  if (e.data !== 'check') return;
  e.waitUntil(caches.open(VERSION).then(cache => Promise.all(APP.map(async u => {
    const url = new URL(u, self.registration.scope);
    if (!TEXT.test(url.pathname)) return;
    const old = await cache.match(url.href);
    return update(cache, url.href, url.href, old, true).catch(() => {});
  }))));
});
