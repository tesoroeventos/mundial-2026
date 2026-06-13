/**
 * SERVICE WORKER
 * - App shell (HTML/CSS/JS/íconos): cache-first, para que la app
 *   abra instantáneo y funcione offline.
 * - Llamadas a la API de Apps Script (?recurso=...): network-first
 *   con fallback a la última respuesta guardada, para que el
 *   fixture/posiciones funcionen sin conexión con el último dato
 *   disponible.
 *
 * Si agregás archivos nuevos al proyecto (ej. js/calendario.js),
 * sumalos a ARCHIVOS_SHELL y subí la versión de CACHE_NAME para
 * forzar la actualización en los celulares que ya instalaron la app.
 */

const CACHE_NAME = 'mundial2026-v6';

const ARCHIVOS_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
  './js/datos-ejemplo.js',
  './js/api.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url);
  const esLlamadaApi = url.hostname.includes('script.google.com')
    || url.hostname.includes('googleusercontent.com');

  if (esLlamadaApi) {
    evento.respondWith(networkFirst(evento.request));
    return;
  }

  evento.respondWith(cacheFirst(evento.request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cacheado = await cache.match(request);
  if (cacheado) return cacheado;

  try {
    const respuesta = await fetch(request);
    cache.put(request, respuesta.clone());
    return respuesta;
  } catch (err) {
    return cacheado || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const respuesta = await fetch(request);
    cache.put(request, respuesta.clone());
    return respuesta;
  } catch (err) {
    const cacheado = await cache.match(request);
    if (cacheado) return cacheado;
    return Response.error();
  }
}
