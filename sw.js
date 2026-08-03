/* Service worker: red primero, caché como respaldo si no hay señal. */
const CACHE = 'intencional-v16';

const LOCALES = [
  './', './index.html', './css/estilo.css',
  './js/config.js', './js/logo.js', './js/iconos.js', './js/ui.js',
  './js/api.js', './js/dominio.js', './js/router.js', './js/app.js',
  './js/pag-inicio.js', './js/pag-remito.js', './js/pag-hechos.js',
  './js/pag-clientes.js', './js/pag-compras.js', './js/pag-gastos.js',
  './js/pag-metricas.js', './js/pag-configuraciones.js'
];

const EXTERNOS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    // uno por uno: si falta un archivo, no se cae toda la instalación
    for (const u of LOCALES.concat(EXTERNOS)) { try { await c.add(u); } catch (err) { console.warn('[SW]', u, err); } }
  }));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).hostname.includes('supabase.co')) return;  // la base siempre por red

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req).then(c =>
        c || (req.destination === 'document' ? caches.match('./index.html') : undefined)
      ))
  );
});
