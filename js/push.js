/* ═══════════════════════════════════════════════════════════
   NOTIFICACIONES
   En iPhone solo funcionan si la app está instalada en la
   pantalla de inicio: una pestaña de Safari no alcanza. Acá se
   detecta eso y se explica qué falta en cada caso.
   ═══════════════════════════════════════════════════════════ */

function esIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/* Instalada en la pantalla de inicio, no abierta en el navegador */
function appInstalada() {
  return window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
}

function soportaPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/* Qué le falta al teléfono para poder recibir notificaciones */
function estadoNotificaciones() {
  if (!soportaPush()) {
    return { puede: false, motivo: 'Este navegador no soporta notificaciones.' };
  }
  if (esIOS() && !appInstalada()) {
    return {
      puede: false,
      instalar: true,
      motivo: 'En iPhone hay que instalar la app primero: tocá Compartir y después ' +
              '“Agregar a inicio”. Abrila desde el ícono y volvé acá.'
    };
  }
  if (!clavePublicaPush()) {
    return { puede: false, motivo: 'Falta cargar la clave de notificaciones en Configuraciones.' };
  }
  return { puede: true, permiso: Notification.permission };
}

function clavePublicaPush() {
  return String(leerConfig('push_clave_publica', '')).trim();
}

/* La clave viene en base64url y el navegador la pide en bytes */
function claveABytes(base64) {
  var relleno = '='.repeat((4 - base64.length % 4) % 4);
  var normal = (base64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
  var crudo = atob(normal);
  var bytes = new Uint8Array(crudo.length);
  for (var i = 0; i < crudo.length; i++) bytes[i] = crudo.charCodeAt(i);
  return bytes;
}

async function suscripcionActual() {
  if (!soportaPush()) return null;
  try {
    var reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (e) { return null; }
}

/* ── Activar ─────────────────────────────────────────────── */
async function activarNotificaciones() {
  var estado = estadoNotificaciones();
  if (!estado.puede) { toast(estado.motivo, 'error'); return false; }

  try {
    var permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
      toast('No diste permiso. Se puede volver a intentar desde los ajustes del teléfono.', 'error');
      return false;
    }

    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveABytes(clavePublicaPush())
      });
    }

    await guardarSuscripcion(sub);
    toast('Notificaciones activadas');
    return true;
  } catch (e) {
    toast('No se pudieron activar: ' + e.message, 'error');
    return false;
  }
}

async function desactivarNotificaciones() {
  try {
    var sub = await suscripcionActual();
    if (sub) {
      await borrarSuscripcion(sub.endpoint);
      await sub.unsubscribe();
    }
    toast('Notificaciones desactivadas');
    return true;
  } catch (e) {
    toast(e.message, 'error');
    return false;
  }
}

/* ── Dónde se guardan ────────────────────────────────────────
   El servidor necesita la suscripción para poder mandar el push.
   Se guarda en la base, no en el teléfono.
   ────────────────────────────────────────────────────────── */
async function guardarSuscripcion(sub) {
  var j = sub.toJSON();
  var fila = {
    endpoint: j.endpoint,
    p256dh: j.keys && j.keys.p256dh,
    auth: j.keys && j.keys.auth,
    dispositivo: (esIOS() ? 'iPhone' : 'Otro') + (appInstalada() ? ' (instalada)' : ''),
    activa: true,
    created_at: new Date().toISOString()
  };

  /* Si el mismo teléfono ya estaba, se actualiza en vez de duplicar */
  var previas = await traerTodo('push_subs', 'endpoint=eq.' + encodeURIComponent(j.endpoint));
  if (previas.length) await actualizar('push_subs', previas[0].id, fila);
  else await crear('push_subs', fila);
}

async function borrarSuscripcion(endpoint) {
  var previas = await traerTodo('push_subs', 'endpoint=eq.' + encodeURIComponent(endpoint));
  for (var i = 0; i < previas.length; i++) await borrar('push_subs', previas[i].id);
}

/* Una prueba local: no pasa por el servidor, sirve para confirmar
   que el permiso y el service worker están bien. */
async function probarNotificacion() {
  if (Notification.permission !== 'granted') { toast('Primero activá las notificaciones', 'error'); return; }
  var reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Intencional', {
    body: 'Si ves esto, las notificaciones están andando.',
    icon: './iconos/icono-192.png',
    badge: './iconos/badge-96.png',
    tag: 'prueba'
  });
}

/* ═══════════════════════════════════════════════════════════
   GENERAR EL PAR DE CLAVES
   Se generan acá, en el teléfono o la compu: no salen a ningún
   servidor. La pública queda guardada en la app; la privada se
   muestra una vez para copiarla a Supabase y no se guarda.
   ═══════════════════════════════════════════════════════════ */
function bytesABase64Url(buffer) {
  var bytes = new Uint8Array(buffer);
  var s = '';
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generarClavesVapid() {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Este navegador no puede generar las claves. Probá desde la compu.');
  }
  var par = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
  );
  var publica = await crypto.subtle.exportKey('raw', par.publicKey);
  var privada = await crypto.subtle.exportKey('jwk', par.privateKey);
  return { publica: bytesABase64Url(publica), privada: privada.d };
}
