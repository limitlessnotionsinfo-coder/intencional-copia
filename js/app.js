/* ═══════════════════════════════════════════════════════════
   APP — arranque: pinta el armazón, resuelve la sesión y le
   pasa el control al router.
   ═══════════════════════════════════════════════════════════ */

function pintarMarca(destino) {
  destino.innerHTML =
    '<img src="' + LOGO_INTENCIONAL + '" alt=""/>' +
    '<div>' +
      '<div class="marca-nombre">Intencional</div>' +
      '<div class="marca-sub">Esmaltes · Cremas</div>' +
    '</div>';
}

/* ── Pantalla de ingreso ─────────────────────────────────── */
function pantallaIngreso() {
  porId('app').innerHTML =
    '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--surface)">' +
      '<div style="width:100%;max-width:360px">' +
        '<div class="marca" id="marca-ingreso" style="border:none;justify-content:center;margin-bottom:22px;padding:0"></div>' +
        '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
          '<div class="campo">' +
            '<div class="campo-etiq">Email</div>' +
            '<input class="campo-input" id="ing-email" type="email" autocomplete="username" placeholder="usuario@intencional.com"/>' +
          '</div>' +
          '<div class="campo">' +
            '<div class="campo-etiq">Contraseña</div>' +
            '<input class="campo-input" id="ing-pass" type="password" autocomplete="current-password" ' +
                   'onkeydown="if(event.key===\'Enter\')entrar()"/>' +
          '</div>' +
          '<button class="btn btn-primario btn-bloque" id="ing-btn" onclick="entrar()">Entrar</button>' +
          '<div id="ing-error" style="margin-top:12px"></div>' +
        '</div></div>' +
      '</div>' +
    '</div>';
  pintarMarca(porId('marca-ingreso'));
  var e = porId('ing-email'); if (e) e.focus();
}

async function entrar() {
  var btn = porId('ing-btn');
  var email = (porId('ing-email').value || '').trim();
  var pass = porId('ing-pass').value || '';
  var err = porId('ing-error');
  err.innerHTML = '';

  if (!email || !pass) {
    err.innerHTML = avisoHTML('danger', 'Escribí el email y la contraseña.');
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Entrando…';
  try {
    await iniciarSesion(email, pass);
    arrancarApp();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = 'Entrar';
    err.innerHTML = avisoHTML('danger', esc(e.message));
  }
}

/* El atajo "entrar sin cuenta" ya no existe: con el login puesto,
   dejarlo era dejar la puerta al lado abierta. Se limpia la marca
   por si quedó de antes. */
function limpiarSinCuenta() {
  try { localStorage.removeItem('intencional_sin_cuenta'); } catch (e) {}
}

async function salir() {
  try { localStorage.removeItem('intencional_sin_cuenta'); } catch (e) {}
  await cerrarSesion();
  pantallaIngreso();
}

/* ── Armazón ─────────────────────────────────────────────── */
function arrancarApp() {
  porId('app').innerHTML =
    '<div class="shell">' +
      '<aside class="barra-lateral">' +
        '<div class="marca" id="marca-lateral"></div>' +
        '<nav class="nav" id="nav"></nav>' +
        (PEDIR_LOGIN
          ? '<div class="pie-lateral">' +
              '<button class="btn btn-fantasma" style="padding:6px 0" onclick="salir()">' + ic('undo', 15) + ' Cerrar sesión</button>' +
            '</div>'
          : '') +
      '</aside>' +
      '<main class="contenido">' +
        '<div class="topbar">' +
          '<img src="' + LOGO_INTENCIONAL + '" style="width:26px;height:26px;object-fit:contain" alt=""/>' +
          '<div class="marca-nombre">Intencional</div>' +
          '<button class="btn btn-fantasma" style="padding:6px;margin-left:auto" aria-label="Configuraciones" ' +
                  'onclick="irA(\'configuraciones\')">' + ic('settings', 19) + '</button>' +
        '</div>' +
        '<div id="contenido"></div>' +
      '</main>' +
      '<nav class="barra-inferior" id="barra-inferior"></nav>' +
    '</div>';

  pintarMarca(porId('marca-lateral'));
  construirMenu();
  construirBarraInferior();
  arrancarCola();       // sube lo que haya quedado sin señal
  precargar();          // las tablas grandes se bajan mientras mirás el inicio
  cargarFeriados().catch(function () {});   // y los feriados, sin bloquear nada
  cargarConfig().catch(function () { /* si no hay red, se usa lo local */ });
  pintarRuta();
}

/* iOS Safari ignora user-scalable=no desde la versión 10, así que
   el pinch y el doble toque se frenan acá. */
function bloquearZoom() {
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  var ultimoToque = 0;
  document.addEventListener('touchend', function (e) {
    var ahora = Date.now();
    if (ahora - ultimoToque < 300) e.preventDefault();   // doble toque
    ultimoToque = ahora;
  }, { passive: false });
}

/* ── Arranque ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  bloquearZoom();
  /* Si quedó la marca del atajo viejo, se borra: ya no sirve
     para saltear el login. */
  limpiarSinCuenta();
  recuperarSesion();
  if (!PEDIR_LOGIN || _sesion) arrancarApp();
  else pantallaIngreso();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      vigilarActualizaciones(reg);
    }).catch(function (e) {
      console.warn('[SW] no se registró:', e.message);
    });
  });

  /* ── Que la versión nueva llegue sola ────────────────────────
     El service worker guarda los archivos y los sirve desde ahí.
     Sin esto, una pestaña abierta puede seguir usando la versión
     vieja aunque el servidor ya tenga otra: es lo que hacía que
     los cambios no aparecieran por más que se subieran. */
  var _recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (_recargando) return;      // una sola vez, si no queda en bucle
    _recargando = true;
    location.reload();
  });
}

function vigilarActualizaciones(reg) {
  if (!reg) return;

  /* Al volver a la app y cada media hora */
  var revisar = function () { try { reg.update(); } catch (e) {} };
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) revisar();
  });
  setInterval(revisar, 30 * 60 * 1000);
  revisar();

  /* Si aparece una versión nueva mientras estás usando la app */
  reg.addEventListener('updatefound', function () {
    var nuevo = reg.installing;
    if (!nuevo) return;
    nuevo.addEventListener('statechange', function () {
      if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
        if (typeof toast === 'function') toast('Actualizando a la versión nueva…');
      }
    });
  });
}
