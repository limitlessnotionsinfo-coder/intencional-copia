/* Service worker.
   Los archivos de la app se sirven desde la caché primero: así
   abre al instante y funciona sin señal. Se actualizan en
   segundo plano para la próxima vez. */
const CACHE = 'intencional-v61';

const LOCALES = [
  './', './index.html', './css/estilo.css',
  './js/config.js', './js/logo.js', './js/iconos.js', './js/ui.js',
  './js/api.js', './js/dominio.js', './js/router.js', './js/app.js',
  './js/cola.js', './js/push.js', './js/pag-inicio.js', './js/pag-remito.js', './js/pag-hechos.js',
  './js/pag-clientes.js', './js/pag-compras.js', './js/pag-gastos.js',
  './js/finanzas.js', './js/pag-numeros.js', './js/pag-configuraciones.js',
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
    for (const u of LOCALES.concat(EXTERNOS)) {
      try {
        /* Se guarda la respuesta final, no el redirect */
        const res = await fetch(u, { redirect: 'follow' });
        if (res.ok) await c.put(u, res.redirected ? new Response(await res.blob(), {
          status: res.status, statusText: res.statusText, headers: res.headers
        }) : res);
      } catch (err) { console.warn('[SW]', u, err); }
    }
  }));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

/* Una respuesta que vino de un redirect no se puede devolver tal
   cual a una navegación: el navegador la rechaza con
   "Response served by service worker has redirections".
   Se copia el cuerpo en una respuesta limpia. */
async function sinRedirect(res) {
  if (!res || !res.redirected) return res;
  const cuerpo = await res.blob();
  return new Response(cuerpo, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.hostname.includes('supabase.co')) return;   // la base siempre por red

  /* Caché primero: abre al instante y funciona sin señal. La
     versión nueva se busca igual, para la próxima vez. */
  e.respondWith((async () => {
    const guardado = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (guardado) return sinRedirect(guardado);

    try {
      const res = await fetch(req);
      /* Los redirects no se guardan: al servirlos rompen la app */
      if (res && res.status === 200 && res.type !== 'opaque' && !res.redirected) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return sinRedirect(res);
    } catch (err) {
      if (req.mode === 'navigate' || req.destination === 'document') {
        const shell = await caches.match('./') || await caches.match('./index.html');
        if (shell) return sinRedirect(shell);
      }
      throw err;
    }
  })());
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
