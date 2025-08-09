const CACHE_NAME = 'party-game-cache-v7'; // Cache-Version erhöht, um Update zu erzwingen

// Kern-Dateien, die für die Offline-Funktionalität der App zwischengespeichert werden MÜSSEN.
const APP_SHELL_URLS = [
  '/Party-Games/',
  '/Party-Games/index.html',
  '/Party-Games/assets/index.js', // Dieser Name muss mit der Ausgabe von vite.config.ts übereinstimmen
  '/Party-Games/manifest.json',
  '/Party-Games/icons/icon-any.svg',
  '/Party-Games/icons/icon-maskable.svg',
  '/Party-Games/audio/bomb_squad_music.ogg',
];

// Installieren: App Shell zwischenspeichern.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('[ServiceWorker] Failed to cache app shell:', error);
      })
  );
});

// Aktivieren: Alte Caches aufräumen.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch: Aus dem Cache bereitstellen, auf Netzwerk zurückgreifen und neue Anfragen zwischenspeichern.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Wenn die Antwort im Cache ist, gib sie zurück.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Wenn sie nicht im Cache ist, hole sie aus dem Netzwerk.
        return fetch(event.request).then(
          networkResponse => {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                // Zwischenspeichern der neuen Antwort, einschließlich "opaque" Antworten für Cross-Origin-Ressourcen (CDNs).
                if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
                  cache.put(event.request, responseToCache);
                }
              });
            return networkResponse;
          }
        ).catch(error => {
          // Dieser .catch()-Block fängt Netzwerkfehler ab (z.B. wenn man offline ist).
          // Dies verhindert den Absturz des Service Workers und den "Failed to fetch"-Fehler.
          console.warn(`[ServiceWorker] Fetch failed for: ${event.request.url}. This is expected when offline and the resource is not cached.`, error);
          // Gibt eine leere Fehlerantwort zurück, um den Absturz zu verhindern.
          return new Response(null, {
            status: 404,
            statusText: "Not Found"
          });
        });
      })
  );
});
