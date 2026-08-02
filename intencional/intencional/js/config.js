/* ═══════════════════════════════════════════════════════════
   CONEXIÓN — a qué base apunta la app.
   Van con `var` a propósito: quedan como propiedades de window
   y las ve cualquier script, sin depender del orden de carga.
   ═══════════════════════════════════════════════════════════ */

/* Base por defecto. La clave publishable es pública por diseño:
   quien protege los datos son las políticas RLS del proyecto. */
var SB_BASE = {
  url: 'https://runlbcwrehbaqcwvzcxs.supabase.co',
  key: 'sb_publishable_9P5b9VpiJyExFJ8-OLtDkg_JjSHJhep',
  nombre: 'Intencional'
};

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
  clientes:         'num',
  remitos:          'id',
  pagos:            'id',
  gastos:           'id',
  compras:          'id',
  pedidos:          'id',
  pedidos_propios:  'id',
  stock:            'id',
  stock_categorias: 'id',
  tareas:           'id',
  config:           'key'
};
