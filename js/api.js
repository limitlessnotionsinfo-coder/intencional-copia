/* ═══════════════════════════════════════════════════════════
   API — única puerta de entrada a Supabase.
   Ninguna página llama a fetch por su cuenta: todo pasa por acá,
   así la paginación, la caché y el manejo de
   errores viven en un solo lugar.
   ═══════════════════════════════════════════════════════════ */

var TOPE_PAGINA = 1000;   // tope que impone PostgREST por request
var _sesion = null;       // sesión de Supabase Auth
var _cache = {};          // { tabla: {datos, ts} }
var TTL_CACHE = 15000;    // 15 s: evita ráfagas de pedidos iguales

/* ── Sesión ──────────────────────────────────────────────── */
function sesionActual() { return _sesion; }
function tokenActual() { return (_sesion && _sesion.access_token) || SB_KEY; }

function guardarSesion(s) {
  _sesion = s;
  try { localStorage.setItem('intencional_sesion', JSON.stringify(s)); } catch (e) {}
}
function recuperarSesion() {
  try {
    var s = JSON.parse(localStorage.getItem('intencional_sesion') || 'null');
    if (s && s.access_token) { _sesion = s; return s; }
  } catch (e) {}
  return null;
}
function borrarSesion() {
  _sesion = null;
  try { localStorage.removeItem('intencional_sesion'); } catch (e) {}
}

async function authFetch(ruta, opciones) {
  if (typeof SB_URL === 'undefined') {
    throw new Error('Falta config.js. Recargá la página con Ctrl/Cmd + Shift + R.');
  }
  var res = await fetch(SB_URL + '/auth/v1/' + ruta, Object.assign({
    headers: Object.assign({ apikey: SB_KEY, 'Content-Type': 'application/json' }, opciones && opciones.headers)
  }, opciones));
  var txt = await res.text();
  var data = txt ? JSON.parse(txt) : {};
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'No se pudo iniciar sesión');
  return data;
}

async function iniciarSesion(email, contrasena) {
  var d = await authFetch('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email: email, password: contrasena })
  });
  guardarSesion(d);
  return d;
}

async function cerrarSesion() {
  try {
    if (_sesion) {
      await authFetch('logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + _sesion.access_token }
      });
    }
  } catch (e) { /* si falla, igual cerramos del lado del navegador */ }
  borrarSesion();
  _cache = {};
}

/* ── REST ────────────────────────────────────────────────── */
async function rest(ruta, opciones) {
  opciones = opciones || {};
  var metodo = (opciones.method || 'GET').toUpperCase();
  var ctrl = new AbortController();
  var corte = setTimeout(function () { ctrl.abort(); }, opciones.timeout || 20000);
  try {
    var res = await fetch(SB_URL + '/rest/v1/' + ruta, {
      method: metodo,
      signal: ctrl.signal,
      body: opciones.body,
      headers: Object.assign({
        apikey: SB_KEY,
        Authorization: 'Bearer ' + tokenActual(),
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }, opciones.headers || {})
    });
    clearTimeout(corte);
    var txt = await res.text();
    if (!res.ok) throw new Error(mensajeDeError(res.status, txt));
    return txt ? JSON.parse(txt) : [];
  } catch (e) {
    clearTimeout(corte);
    if (e.name === 'AbortError') throw new Error('La base tardó demasiado en responder. Revisá la conexión.');
    throw e;
  }
}

/* Traduce el error crudo de PostgREST a algo que se pueda leer */
function mensajeDeError(status, txt) {
  var d = {};
  try { d = JSON.parse(txt); } catch (e) {}
  if (status === 401 || status === 403) return 'La sesión venció. Volvé a entrar.';
  if (d.message && /column .* does not exist/.test(d.message)) {
    return 'Falta una columna en la base: ' + d.message + '. ¿Corriste el SQL?';
  }
  return d.message || d.hint || ('Error ' + status);
}

/* ── Lecturas ────────────────────────────────────────────── */
/* Trae una tabla entera paginando. Sin esto, cualquier consulta
   se corta en 1000 filas y el error pasa desapercibido. */
async function traerTodo(tabla, consulta) {
  var pk = TABLAS[tabla] || 'id';
  var filas = [], offset = 0;
  for (;;) {
    var q = tabla + '?select=*' + (consulta ? '&' + consulta : '') +
            '&order=' + encodeURIComponent(pk) + '.asc' +
            '&limit=' + TOPE_PAGINA + '&offset=' + offset;
    var lote = await rest(q);
    filas = filas.concat(lote);
    if (lote.length < TOPE_PAGINA) break;
    offset += TOPE_PAGINA;
    if (offset > 200000) break;   // freno de seguridad
  }
  return filas;
}

/* Igual que traerTodo pero con caché corta, para las pantallas
   que piden la misma tabla varias veces seguidas */
async function traerCacheado(tabla, consulta) {
  var clave = tabla + '|' + (consulta || '');
  var c = _cache[clave];
  if (c && (Date.now() - c.ts) < TTL_CACHE) return c.datos;
  var datos = await traerTodo(tabla, consulta);
  _cache[clave] = { datos: datos, ts: Date.now() };
  return datos;
}

function invalidarCache(tabla) {
  if (!tabla) { _cache = {}; return; }
  Object.keys(_cache).forEach(function (k) {
    if (k.indexOf(tabla + '|') === 0) delete _cache[k];
  });
}

/* ── Escrituras ──────────────────────────────────────────── */
async function crear(tabla, fila) {
  var r = await rest(tabla, { method: 'POST', body: JSON.stringify(fila) });
  invalidarCache(tabla);
  return r;
}

async function actualizar(tabla, valorPk, cambios) {
  var pk = TABLAS[tabla] || 'id';
  var r = await rest(tabla + '?' + pk + '=eq.' + encodeURIComponent(valorPk), {
    method: 'PATCH', body: JSON.stringify(cambios)
  });
  invalidarCache(tabla);
  return r;
}

async function borrar(tabla, valorPk) {
  var pk = TABLAS[tabla] || 'id';
  var r = await rest(tabla + '?' + pk + '=eq.' + encodeURIComponent(valorPk), { method: 'DELETE' });
  invalidarCache(tabla);
  return r;
}

/* ── Config (tabla key/value) ────────────────────────────── */
var _config = null;

async function cargarConfig() {
  if (_config) return _config;
  var filas = await traerTodo('config');
  _config = {};
  filas.forEach(function (f) { _config[f.key] = f.value; });
  return _config;
}

function leerConfig(clave, pordefecto) {
  if (_config && _config[clave] !== undefined && _config[clave] !== null) return _config[clave];
  try {
    var v = localStorage.getItem('cfg_' + clave);
    if (v !== null) return v;
  } catch (e) {}
  return pordefecto;
}

async function guardarConfig(clave, valor) {
  try { localStorage.setItem('cfg_' + clave, String(valor)); } catch (e) {}
  if (_config) _config[clave] = String(valor);
  await rest('config', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key: clave, value: String(valor) })
  });
  invalidarCache('config');
}
