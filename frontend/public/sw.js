/**
 * Service worker de BD Metrics.
 *
 * Objetivo: que la app abra estando sin señal a campo. NO cachea la API —
 * las mediciones siempre van y vuelven por red, igual que en la app nativa.
 *
 * Subir CACHE_VERSION invalida todo lo cacheado por versiones anteriores.
 */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `bd-metrics-${CACHE_VERSION}`;

// El shell mínimo para poder arrancar sin red. El bundle JS lleva hash en el
// nombre y cambia en cada build, así que no se puede precachear por nombre:
// entra solo al cache la primera vez que se pide (cache-first de más abajo).
const APP_SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll falla entero si un recurso falla; los pedimos sueltos para que
      // un 404 puntual no rompa la instalación del service worker.
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Todo lo que no sea de este origen (la API, Google, etc.) va directo a la
  // red sin tocar el cache.
  if (url.origin !== self.location.origin) return;

  // Navegación (abrir una ruta): red primero para tomar el último deploy, y si
  // no hay señal caemos al HTML cacheado, o al shell como último recurso.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/'))
            .then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Estáticos (bundle JS, imágenes, fuentes): llevan hash en el nombre, así que
  // son inmutables y conviene cache primero.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Las respuestas opacas y los errores no se cachean.
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
