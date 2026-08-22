/* ═══════════════════════════════════════════════════════════
   CONEXIÓN — a qué base apunta la app.
   Van con `var` a propósito: quedan como propiedades de window
   y las ve cualquier script, sin depender del orden de carga.
   ═══════════════════════════════════════════════════════════ */

/* Base por defecto. La clave publishable es pública por diseño:
   quien protege los datos son las políticas RLS del proyecto. */
var SB_BASE = {
  url: 'https://mcobunyyuahxtjkykfby.supabase.co',
  key: 'sb_publishable_BWiNB58kOu1NQOXbFZPbQw_N-BOcaDn',
  nombre: 'Intencional'
};

/* Mientras se termina la app se entra directo, sin login.
   Poner en true para volver a pedir email y contraseña. */
var PEDIR_LOGIN = true;

/* Si guardaste otra base desde Configuraciones, se usa esa. */
function _conexionGuardada() {
  try {
    var c = JSON.parse(localStorage.getItem('intencional_conexion') || 'null');
    if (c && c.url && c.key) return c;
  } catch (e) {}
  return null;
}

var CONEXION = _conexionGuardada() || SB_BASE;
var SB_URL = CONEXION.url;
var SB_KEY = CONEXION.key;

/* El proyecto se identifica por el subdominio de la URL */
function refProyecto(url) {
  var m = String(url || '').match(/^https:\/\/([a-z0-9]+)\.supabase\.co/);
  return m ? m[1] : '(desconocida)';
}

function guardarConexion(url, key, nombre) {
  localStorage.setItem('intencional_conexion', JSON.stringify({
    url: url.trim().replace(/\/+$/, ''), key: key.trim(), nombre: (nombre || '').trim() || 'Sin nombre'
  }));
}
function restaurarConexion() {
  localStorage.removeItem('intencional_conexion');
}

/* Una clave sirve si es publishable (sb_publishable_…) o un JWT anon */
function claveValida(k) {
  k = String(k || '').trim();
  return /^sb_publishable_[A-Za-z0-9_\-]{10,}$/.test(k) || k.split('.').length === 3;
}

/* Tablas y su clave primaria */
var TABLAS = {
  clientes: 'num',
  remitos:  'id',
  pagos:    'id',
  gastos:   'id',
  compras:  'id',
  tareas:   'id',
  push_subs: 'id',
  config:   'key'
};

/* ═══════════════════════════════════════════════════════════
   TEMA
   'auto' sigue al sistema, 'claro' y 'oscuro' lo fuerzan.
   Se aplica antes de pintar nada para que no haya un destello
   blanco al abrir la app de noche.
   ═══════════════════════════════════════════════════════════ */
function temaGuardado() {
  try { return localStorage.getItem('intencional_tema') || 'auto'; }
  catch (e) { return 'auto'; }
}

function aplicarTema(t) {
  var tema = t || temaGuardado();
  document.documentElement.setAttribute('data-tema', tema);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', temaEsOscuro(tema) ? '#1a1618' : '#c84b8c');
}

function temaEsOscuro(t) {
  var tema = t || temaGuardado();
  if (tema === 'oscuro') return true;
  if (tema === 'claro') return false;
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch (e) { return false; }
}

function guardarTema(t) {
  try { localStorage.setItem('intencional_tema', t); } catch (e) {}
  aplicarTema(t);
}

/* Se aplica ya, sin esperar al resto de los scripts */
aplicarTema();
