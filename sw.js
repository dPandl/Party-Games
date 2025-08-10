const CACHE_NAME = 'party-game-cache-v16'; // Aggressives Cache-Busting

// Kern-Dateien, die für die Offline-Funktionalität der App zwischengespeichert werden MÜSSEN.
const APP_SHELL_URLS = [
  '/Party-Games/',
  '/Party-Games/index.html',
  '/Party-Games/assets/index.js', // Dieser Name muss mit der Ausgabe von vite.config.ts übereinstimmen
  '/Party-Games/manifest.json',
  '/Party-Games/icons/icon-any.svg',
  '/Party-Games/icons/icon-maskable.svg',
  '/Party-Games/audio/bomb_squad_music.ogg',
  '/Party-Games/fonts/Nunito-VariableFont.woff2',
];

// Installieren: App Shell zwischenspeichern und sofort aktivieren.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting()) // Erzwingt, dass der neue SW sofort aktiv wird
      .catch(error => {
        console.error('[ServiceWorker] Failed to cache app shell:', error);
      })
  );
});

// Aktivieren: Alte Caches aufräumen und Kontrolle übernehmen.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // Übernimmt sofort die Kontrolle über offene Clients
  );
});


// Fetch: Aus dem Cache bereitstellen, auf Netzwerk zurückgreifen und neue Anfragen zwischenspeichern.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategie: Cache-First, dann Netzwerk. Neue Ressourcen bei erfolgreichem Netzwerkabruf zwischenspeichern.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Wenn wir eine zwischengespeicherte Antwort haben, gib sie zurück.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Wenn nicht im Cache, vom Netzwerk abrufen.
      return fetch(event.request).then(networkResponse => {
        // Eine Antwort von einer Cross-Origin-Anfrage ist "opaque" und hat einen Status von 0.
        // Wir sollten diese auch zwischenspeichern, damit CDNs offline funktionieren.
        // Wir speichern auch normale erfolgreiche Antworten (Status 200).
        if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        // DIES IST DER ENTSCHEIDENDE TEIL FÜR OFFLINE.
        // Wenn fetch fehlschlägt (z.B. der Benutzer ist offline), wird es hier abgefangen.
        console.warn(`[ServiceWorker] Network request for "${event.request.url}" failed. This is expected when offline and the resource is not cached.`);
        // Gibt eine einfache Fehlerantwort zurück. Der Browser behandelt dies besser als einen Absturz.
        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
    })
  );
});