/* Service worker: red primero, caché como respaldo si no hay señal. */
const CACHE = 'intencional-v43';

const LOCALES = [
  './', './index.html', './css/estilo.css',
  './js/config.js', './js/logo.js', './js/iconos.js', './js/ui.js',
  './js/api.js', './js/dominio.js', './js/router.js', './js/app.js',
  './js/push.js', './js/pag-inicio.js', './js/pag-remito.js', './js/pag-hechos.js',
  './js/pag-clientes.js', './js/pag-compras.js', './js/pag-gastos.js',
  './js/pag-metricas.js', './js/pag-configuraciones.js',
  './manifest.json', './favicon.ico',
  './iconos/icono-192.png', './iconos/icono-512.png',
  './iconos/apple-touch-icon.png', './iconos/badge-96.png'
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

/* ═══════════════════════════════════════════════════════════
   NOTIFICACIONES
   El servidor manda un push; acá se muestra y se decide adónde
   lleva al tocarla.
   ═══════════════════════════════════════════════════════════ */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { cuerpo: e.data && e.data.text() }; }

  const titulo = d.titulo || 'Intencional';
  const opciones = {
    body: d.cuerpo || '',
    icon: './iconos/icono-192.png',
    badge: './iconos/badge-96.png',
    tag: d.tipo || 'intencional',        // uno por tipo: no se apilan repetidos
    renotify: true,
    data: { ruta: d.ruta || '/inicio' },
    lang: 'es-AR'
  };
  e.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.ruta) || '/inicio';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
      /* Si la app ya está abierta, se la trae al frente en vez de
         abrir otra ventana. */
      for (const c of lista) {
        if (c.url.includes('index.html') || c.url.endsWith('/')) {
          c.navigate(c.url.split('#')[0] + '#' + destino);
          return c.focus();
        }
      }
      return self.clients.openWindow('./index.html#' + destino);
    })
  );
});
