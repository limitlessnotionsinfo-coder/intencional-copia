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
          '<div class="campo-ayuda" style="margin:14px 0 8px;text-align:center">¿Todavía no creaste tu usuario?</div>' +
          '<button class="btn btn-secundario btn-bloque" onclick="entrarSinCuenta()">Entrar sin cuenta</button>' +
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

/* Sin cuenta se entra con la clave pública: sirve mientras las
   políticas RLS de la base lo permitan. */
function entrarSinCuenta() {
  try { localStorage.setItem('intencional_sin_cuenta', '1'); } catch (e) {}
  arrancarApp();
}

async function salir() {
  try { localStorage.removeItem('intencional_sin_cuenta'); } catch (e) {}
  await cerrarSesion();
  pantallaIngreso();
}

/* ── Armazón ─────────────────────────────────────────────── */
function arrancarApp() {
  porId('app').innerHTML =
    '<div class="velo" onclick="document.body.classList.remove(\'menu-abierto\')"></div>' +
    '<div class="shell">' +
      '<aside class="barra-lateral">' +
        '<div class="marca" id="marca-lateral"></div>' +
        '<nav class="nav" id="nav"></nav>' +
        '<div class="pie-lateral">' +
          '<button class="btn btn-fantasma" style="padding:6px 0" onclick="salir()">' + ic('undo', 15) + ' Cerrar sesión</button>' +
        '</div>' +
      '</aside>' +
      '<main class="contenido">' +
        '<div class="topbar">' +
          '<button class="btn btn-fantasma" style="padding:6px" aria-label="Abrir menú" ' +
                  'onclick="document.body.classList.toggle(\'menu-abierto\')">' + ic('menu', 20) + '</button>' +
          '<div class="marca-nombre">Intencional</div>' +
        '</div>' +
        '<div id="contenido"></div>' +
      '</main>' +
      '<nav class="barra-inferior" id="barra-inferior"></nav>' +
    '</div>';

  pintarMarca(porId('marca-lateral'));
  construirMenu();
  construirBarraInferior();
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
  var sinCuenta = false;
  try { sinCuenta = localStorage.getItem('intencional_sin_cuenta') === '1'; } catch (e) {}
  if (recuperarSesion() || sinCuenta) arrancarApp();
  else pantallaIngreso();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function (e) {
      console.warn('[SW] no se registró:', e.message);
    });
  });
}
