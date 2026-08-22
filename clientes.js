const SB_URL = 'https://mcobunyyuahxtjkykfby.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jb2J1bnl5dWFoeHRqa3lrZmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwODMsImV4cCI6MjA5MTQyMjA4M30.Z4iqz6GsTF5dwU6sdMhIR9OmK8giYHTMiN3iUJEpaEY';
const NUM_KEY = 'intencional_num_counter';

/* ═══════════════════════════════════════════════════════
   SISTEMA DE ÍCONOS DE LÍNEA (reemplaza emojis)
   Uso: ic('nombre')  ó  ic('nombre', 20)
   Heredan color del texto (currentColor).
═══════════════════════════════════════════════════════ */
const _ICONS = {
  alert:      '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check:      '<path d="M4 12.5l5 5 11-11"/>',
  x:          '<path d="M6 6l12 12M18 6L6 18"/>',
  ban:        '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  box:        '<path d="M12 2.5 20 7v10l-8 4.5L4 17V7z"/><path d="M4 7l8 4.5L20 7"/><path d="M12 11.5V21"/>',
  clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  smartphone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  cash:       '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  wallet:     '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><path d="M16.5 15h1.5"/>',
  coins:      '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3"/><path d="M3 12v5c0 1.7 2.7 3 6 3 .7 0 1.4-.06 2-.17"/><circle cx="16" cy="15" r="5"/>',
  edit:       '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  trash:      '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/>',
  receipt:    '<path d="M5 3v18l2.5-1.5L10 21l2-1.5L14 21l2.5-1.5L19 21V3l-2.5 1.5L14 3l-2 1.5L10 3 7.5 4.5 5 3z"/><path d="M9 8h6M9 12h6"/>',
  clipboard:  '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4z"/><path d="M9 11h6M9 15h4"/>',
  search:     '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  chart:      '<path d="M4 4v15a1 1 0 0 0 1 1h15"/><path d="M8 15l3-4 3 2 4-6"/>',
  plus:       '<path d="M12 5v14M5 12h14"/>',
  settings:   '<path d="M4 8h8"/><path d="M16 8h4"/><circle cx="14" cy="8" r="2"/><path d="M4 16h4"/><path d="M12 16h8"/><circle cx="10" cy="16" r="2"/>',
  card:       '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><path d="M6 15h4"/>',
  droplet:    '<path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z"/>',
  calendar:   '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  download:   '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/>',
  upload:     '<path d="M12 21V9"/><path d="M7 13l5-5 5 5"/><path d="M4 3h16"/>',
  save:       '<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 3v5h7"/><path d="M8 15h8v6H8z"/>',
  file:       '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  pin:        '<path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  store:      '<path d="M4 9V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/><path d="M4 9h16l-1 3H5L4 9z"/><path d="M5 12v8h14v-8"/><path d="M10 20v-4h4v4"/>',
  building:   '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  bag:        '<path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  cart:       '<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 12h10.2l1.9-9H6"/>',
  trophy:     '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3"/><path d="M10 15h4v3h-4z"/><path d="M8 21h8"/>',
  users:      '<circle cx="9" cy="8" r="3"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M15 5.5a3 3 0 0 1 0 5.5"/><path d="M16.6 14.2c1.9.6 3.2 2.4 3.2 4.8"/>',
  user:       '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>',
  map:        '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  truck:      '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  phone:      '<path d="M6 3h3l2 5-2 1.5a11 11 0 0 0 5 5L17.5 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
  eye:        '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  hash:       '<path d="M5 9h14M5 15h14M9 4l-1 16M16 4l-1 16"/>',
  refresh:    '<path d="M20 11a8 8 0 0 0-14-4L3 10"/><path d="M4 13a8 8 0 0 0 14 4l3-3"/><path d="M3 6v4h4M21 18v-4h-4"/>',
  lock:       '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  zap:        '<path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z"/>',
  chevronDown:'<path d="M6 9l6 6 6-6"/>',
  bulb:       '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M8 14a5 5 0 1 1 8 0c-.7.9-1 1.5-1 2.5H9c0-1-.3-1.6-1-2.5z"/>',
  pill:       '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/>',
  scissors:   '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 10M8 16L20 6"/>',
  folder:     '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  tag:        '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  menu:       '<path d="M4 7h16M4 12h16M4 17h16"/>',
  shuffle:    '<path d="M3 6h4l10 12h4"/><path d="M3 18h4L17 6h4"/><path d="M18 3l3 3-3 3M18 15l3 3-3 3"/>',
  sparkles:   '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z"/>',
  palette:    '<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-.6-1.2-.6-2 .8-1 1.6-1H18a3 3 0 0 0 3-3 8 8 0 0 0-9-8z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>',
  gem:        '<path d="M6 3h12l3 6-9 12L3 9l3-6z"/><path d="M3 9h18M9 3 6 9l6 12 6-12-3-6"/>',
  signal:     '<path d="M4 20v-3M9 20v-7M14 20v-11M19 20V6"/>',
  message:    '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
  fuel:       '<path d="M5 21V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16M4 21h11"/><path d="M13 9h3l2 2v6a2 2 0 0 1-4 0v-3h-1"/>',
  shield:     '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  tool:       '<path d="M14 7a4 4 0 0 0-5 5L3 18l3 3 6-6a4 4 0 0 0 5-5l-2.5 2.5L12 11l1.5-3L14 7z"/>',
  megaphone:  '<path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 9a3 3 0 0 1 0 6"/>',
  camera:     '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13" r="3.5"/>',
  scale:      '<path d="M12 3v18M7 21h10"/><path d="M12 6l-6 1 3 6a3 3 0 0 1-6 0l3-6M12 6l6 1-3 6a3 3 0 0 0 6 0l-3-6"/>',
  square:     '<rect x="4" y="4" width="16" height="16" rx="3"/>',
  checkSquare:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-5.5"/>',
  home:       '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/>',
  flask:      '<path d="M9 3h6M10 3v6l-5 9a1 1 0 0 0 1 1.5h12a1 1 0 0 0 1-1.5l-5-9V3"/><path d="M7.5 14h9"/>',
  db:         '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  undo:       '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-1"/>'
};
function ic(name, size) {
  const p = _ICONS[name] || '';
  const s = size || 16;
  return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'style="vertical-align:middle;position:relative;top:-1px;flex-shrink:0;display:inline-block">' + p + '</svg>';
}

let _rutaFiltro  = null;
let _rubroFiltro = null;
let _cache = null, rubroSel = '', mRubroSel = '';

/* ══════════════════════════════════════════════════════
   SISTEMA OFFLINE — IndexedDB + sincronización automática
══════════════════════════════════════════════════════ */
const OFFLINE_DB_NAME  = 'intencional_offline';
const OFFLINE_DB_VER   = 1;
const OFFLINE_STORE    = 'remitos_pendientes';
const STOCK_CACHE_KEY  = 'intencional_stock_cache';
const CATS_CACHE_KEY   = 'intencional_cats_cache';
const ALIAS_KEY        = 'intencional_alias_config';

/* ── Alias persistentes ── */
function guardarAliasConfig(alias1, alias2) {
  try { localStorage.setItem(ALIAS_KEY, JSON.stringify({ alias1: alias1||'', alias2: alias2||'' })); } catch(e) {}
}
function leerAliasConfig() {
  try { const d = localStorage.getItem(ALIAS_KEY); return d ? JSON.parse(d) : { alias1:'', alias2:'' }; } catch(e) { return { alias1:'', alias2:'' }; }
}

/* ── Alias en Supabase (tabla config) ── */
async function guardarAliasEnDB() {
  const alias1 = (document.getElementById('dash-alias1')?.value||'').trim();
  const alias2 = (document.getElementById('dash-alias2')?.value||'').trim();
  guardarAliasConfig(alias1, alias2);
  try {
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'alias1',value:alias1}) });
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'alias2',value:alias2}) });
    toast('✅ Alias guardados en la base de datos');
  } catch(e) {
    toast('⚠️ Guardado solo localmente (revisá la conexión)');
  }
}

async function guardarMsgDeudaEnDB() {
  const msg = (document.getElementById('dash-deuda-msg')?.value||'').trim();
  localStorage.setItem('intencional_deuda_msg', msg);
  try {
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'deuda_msg',value:msg}) });
    toast('✅ Mensaje de deuda guardado');
  } catch(e) {
    toast('⚠️ Guardado solo localmente (revisá la conexión)');
  }
}

function leerMsgDeudaConfig() {
  try { return localStorage.getItem('intencional_deuda_msg') || ''; } catch(e) { return ''; }
}

async function cargarAliasDesdeDB() {
  try {
    const rows = await sbFetch('config?key=in.(alias1,alias2,deuda_msg,rutas_config)&select=key,value');
    if (rows && rows.length) {
      const a1 = rows.find(r=>r.key==='alias1')?.value || '';
      const a2 = rows.find(r=>r.key==='alias2')?.value || '';
      const dm = rows.find(r=>r.key==='deuda_msg')?.value || '';
      const rc = rows.find(r=>r.key==='rutas_config')?.value || '';
      guardarAliasConfig(a1, a2);
      if (dm) localStorage.setItem('intencional_deuda_msg', dm);
      // Sincronizar rutas_config: DB gana si es más reciente
      if (rc) {
        try {
          const dbCfg = JSON.parse(rc);
          const localCfg = leerRutasConfig();
          // Mezclar: DB tiene prioridad para cada ruta
          const merged = { ...localCfg, ...dbCfg };
          guardarRutasConfig(merged);
        } catch(e) {}
      }
      return { alias1: a1, alias2: a2, deudaMsg: dm };
    }
  } catch(e) {
    console.warn('No se pudo cargar config desde DB:', e.message);
  }
  return { ...leerAliasConfig(), deudaMsg: leerMsgDeudaConfig() };
}

/* ── Gestión de hojas de ruta (nombres y notas en localStorage) ── */
const RUTAS_CONFIG_KEY = 'intencional_rutas_config';
function leerRutasConfig() {
  try { const d = localStorage.getItem(RUTAS_CONFIG_KEY); return d ? JSON.parse(d) : {}; } catch(e) { return {}; }
}
function guardarRutasConfig(cfg) {
  try { localStorage.setItem(RUTAS_CONFIG_KEY, JSON.stringify(cfg)); } catch(e) {}
}
function getNombreRuta(orden) {
  if (!orden) return 'Sin ruta';
  const cfg = leerRutasConfig();
  return cfg[orden]?.nombre || 'Ruta ' + orden;
}
function getNotasRuta(orden) {
  if (!orden) return '';
  const cfg = leerRutasConfig();
  return cfg[orden]?.notas || '';
}
let _offlineDB = null;

/* ── Guardar/leer stock en localStorage para uso offline ── */
function guardarStockLocal(items) {
  try { localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify(items)); } catch(e) {}
}
function leerStockLocal() {
  try { const d = localStorage.getItem(STOCK_CACHE_KEY); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}
function guardarCatsLocal(cats) {
  try { localStorage.setItem(CATS_CACHE_KEY, JSON.stringify(cats)); } catch(e) {}
}
function leerCatsLocal() {
  try { const d = localStorage.getItem(CATS_CACHE_KEY); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}

// Abrir/crear la base de datos IndexedDB
function abrirOfflineDB() {
  return new Promise((resolve, reject) => {
    if (_offlineDB) { resolve(_offlineDB); return; }
    const req = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        const store = db.createObjectStore(OFFLINE_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
    };
    req.onsuccess = e => { _offlineDB = e.target.result; resolve(_offlineDB); };
    req.onerror   = e => reject(e.target.error);
  });
}

// Guardar remito pendiente en IndexedDB
async function guardarRemitoOffline(remito) {
  const db = await abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    const req = tx.objectStore(OFFLINE_STORE).add({ ...remito, _pendiente: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// Obtener todos los remitos pendientes
async function obtenerRemitosPendientes() {
  const db = await abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readonly');
    const req = tx.objectStore(OFFLINE_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// Eliminar remito pendiente por id local
async function eliminarRemitoPendiente(localId) {
  const db = await abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    const req = tx.objectStore(OFFLINE_STORE).delete(localId);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// Actualizar el badge de pendientes en la UI
async function actualizarBadgePendientes() {
  try {
    const pendientes = await obtenerRemitosPendientes();
    const n = pendientes.length;
    let badge = document.getElementById('badge-offline-pendientes');
    if (n > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'badge-offline-pendientes';
        badge.style.cssText = 'position:fixed;bottom:80px;right:16px;background:#d97706;color:#fff;border-radius:20px;padding:8px 14px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;z-index:500;box-shadow:0 2px 12px rgba(0,0,0,.2);cursor:pointer;display:flex;align-items:center;gap:6px;-webkit-tap-highlight-color:transparent';
        badge.onclick = () => sincronizarPendientes();
        document.body.appendChild(badge);
      }
      badge.innerHTML = '' + ic('upload') + ' ' + n + ' remito' + (n > 1 ? 's' : '') + ' sin enviar — Tocar para sincronizar';
    } else if (badge) {
      badge.remove();
    }
  } catch(e) {}
}

// Intentar sincronizar todos los pendientes con Supabase
async function sincronizarPendientes() {
  if (!navigator.onLine) {
    toast('⚠️ Sin conexión. Los remitos se enviarán cuando tengas internet.');
    return;
  }
  let pendientes;
  try { pendientes = await obtenerRemitosPendientes(); } catch(e) { return; }
  if (!pendientes.length) return;

  toast('📤 Sincronizando ' + pendientes.length + ' remito' + (pendientes.length > 1 ? 's' : '') + '...');
  let ok = 0, err = 0;
  for (const r of pendientes) {
    const { id: localId, _pendiente, ...remito } = r;
    try {
      await sbInsertRemito(remito);
      await eliminarRemitoPendiente(localId);
      ok++;
    } catch(e) {
      err++;
      console.warn('Error sincronizando remito offline:', e.message);
    }
  }
  await actualizarBadgePendientes();
  if (ok > 0 && err === 0) toast('✅ ' + ok + ' remito' + (ok > 1 ? 's' : '') + ' sincronizado' + (ok > 1 ? 's' : '') + ' correctamente');
  else if (ok > 0) toast('⚠️ ' + ok + ' sincronizados, ' + err + ' con error');
  else toast('❌ No se pudo sincronizar. Intentá más tarde.');
}

// Escuchar cuando vuelve la conexión → sincronizar automáticamente
window.addEventListener('online', () => {
  setTimeout(() => {
    sincronizarPendientes();
  }, 1500); // pequeña espera para que la red estabilice
});

// Inicializar al cargar
window.addEventListener('DOMContentLoaded', () => {
  abrirOfflineDB().catch(() => {});

  // Precargar _stockCache desde localStorage inmediatamente (para remito offline)
  if (!_stockCache || !_stockCache.length) {
    const stockLocal = leerStockLocal();
    if (stockLocal && stockLocal.length) {
      _stockCache = stockLocal;
      console.log('[Offline] Stock cargado desde caché local:', stockLocal.length, 'items');
    }
  }

  setTimeout(actualizarBadgePendientes, 1000);
  // Si hay internet al cargar, intentar sincronizar pendientes viejos
  if (navigator.onLine) setTimeout(sincronizarPendientes, 2000);
  // Precargar stock y categorías en background para tenerlos disponibles offline
  if (navigator.onLine) {
    setTimeout(async () => {
      try {
        const stockLocal = leerStockLocal();
        const HORA_MS = 60 * 60 * 1000;
        const cacheTimestamp = parseInt(localStorage.getItem('intencional_stock_ts') || '0');
        const cacheVencido = (Date.now() - cacheTimestamp) > HORA_MS;
        if (!stockLocal || !stockLocal.length || cacheVencido) {
          const cats = await sbCatsFetch().catch(() => null);
          if (cats && cats.length) {
            const catsFormateadas = cats.map(c => ({
              id: c.id, label: c.label, icon: c.icon || 'box',
              unidad: c.unidad || 'unid', precio: +c.precio || 0, orden: +c.orden || 99
            }));
            guardarCatsLocal(catsFormateadas);
          }
          const stock = await sbStockFetch().catch(() => null);
          if (stock && stock.length) {
            guardarStockLocal(stock);
            localStorage.setItem('intencional_stock_ts', Date.now().toString());
            if (!_stockCache || !_stockCache.length) _stockCache = stock;
            console.log('[Offline] Stock precargado:', stock.length, 'items');
          }
        }
      } catch(e) {
        console.warn('[Offline] No se pudo precargar stock:', e.message);
      }
    }, 3000);
  }
});

/* ── SUPABASE ── */
async function sbFetch(path, opts = {}) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 8000);
  // Usar token de sesión si está disponible, sino usar anon key
  const token = (typeof _authSession !== 'undefined' && _authSession && _authSession.access_token)
    ? _authSession.access_token
    : SB_KEY;
  try {
    const res = await fetch(SB_URL + '/rest/v1/' + path, {
      ...opts,
      signal: controller.signal,
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(opts.headers || {})
      }
    });
    clearTimeout(tid);
    if (!res.ok) { const t = await res.text(); throw new Error(t || res.status); }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : [];
  } catch(e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado. Revisá tu conexión.');
    throw e;
  }
}
let _cacheTimestamp = 0;
async function cargarDB(incluirInactivos = false) {
  try {
    // Usar caché si fue actualizado hace menos de 10s (evita dobles fetches)
    const ahora = Date.now();
    if (!incluirInactivos && _cache && (ahora - _cacheTimestamp) < 10000) return _cache;
    const filtro = incluirInactivos ? 'clientes?select=*&order=num.asc' : 'clientes?select=*&activo=neq.false&order=num.asc';
    const data = await sbFetch(filtro);
    if (!incluirInactivos) {
      _cache = data;
      _cacheTimestamp = Date.now();
      localStorage.setItem('sb_cache', JSON.stringify(data));
      ocultarErrorConexion();
    }
    return data;
  } catch(e) {
    console.warn('Supabase error:', e.message);
    mostrarErrorConexion(e.message);
    if (_cache) return _cache;
    try { return JSON.parse(localStorage.getItem('sb_cache') || '[]'); } catch(_) { return []; }
  }
}
function mostrarErrorConexion(msg) {
  loading(false);
  let el = document.getElementById('conn-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'conn-error';
    el.style.cssText = 'background:#fff3cd;border:1px solid #fcd97a;border-radius:10px;padding:12px 16px;margin:12px;font-size:13px;color:#7a5200;display:flex;align-items:flex-start;gap:10px;flex-direction:column';
    const card = document.querySelector('.card');
    if (card) card.insertBefore(el, card.querySelector('.tabs').nextSibling);
  }
  el.style.display = 'block';
  el.innerHTML = '<strong>' + ic('alert') + ' No se pudo conectar a la base de datos</strong><div style="margin-top:4px">' + esc(msg) + '</div>' +
    '<div style="margin-top:8px;font-size:12px">Verificá que:<br>• La tabla <strong>clientes</strong> exista en Supabase<br>• La política de acceso esté activa (RLS)<br>• Tu conexión a internet funcione</div>' +
    '<button onclick="reintentarConexion()" style="margin-top:10px;background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:DM Sans,sans-serif;font-weight:500">' + ic('refresh') + ' Reintentar</button>';
}
function ocultarErrorConexion() {
  const el = document.getElementById('conn-error');
  if (el) el.style.display = 'none';
}
async function reintentarConexion() {
  loading(true);
  _cache = null;
  await actualizarCounter();
  actualizarPreview();
  await actualizarBadgeIncompletos();
  loading(false);
}
async function sbInsert(c) { return sbFetch('clientes', { method: 'POST', body: JSON.stringify(c) }); }
async function sbUpdate(num, d) { return sbFetch('clientes?num=eq.' + num, { method: 'PATCH', body: JSON.stringify(d) }); }
async function sbDelete(num) { return sbFetch('clientes?num=eq.' + num, { method: 'DELETE', headers: { 'Prefer': '' } }); }
async function sbInsertRemito(r) { return sbFetch('remitos', { method: 'POST', body: JSON.stringify(r) }); }
async function sbFetchRemitos(filtro) { return sbFetch('remitos?' + (filtro||'select=*') + '&order=created_at.desc'); }

/* ── GUARDAR REMITO EN DB ── */
async function guardarRemitoEnDB() {
  const nombre = (document.getElementById('f-nombre')||{}).value?.trim() || '';
  const fecha  = (document.getElementById('f-fecha') ||{}).value || todayStr();
  const tel    = (document.getElementById('f-tel')   ||{}).value || '';
  const dir    = (document.getElementById('f-dir')   ||{}).value || '';
  const loc    = (document.getElementById('f-loc')   ||{}).value || '';
  const total  = rows.reduce((s,r)=>s+(r.cant*(+r.precio||0)),0);

  // ── Anti-duplicado ──
  if (typeof esRemitoDuplicado === 'function' && esRemitoDuplicado(nombre, fecha, total)) {
    const confirmar = confirm(
      '' + ic('alert') + ' POSIBLE DUPLICADO\n\n' +
      'Ya existe un remito con:\n• Cliente: ' + nombre +
      '\n• Fecha: ' + fecha +
      '\n• Total: $' + total.toLocaleString('es-AR') + '\n\n¿Guardarlo de todas formas?'
    );
    if (!confirmar) return;
  }

  // ── Auto-crear cliente si no está registrado ──
  if (nombre) {
    try {
      const todosDB = _cache || await cargarDB();
      const existeDB = todosDB.find(c =>
        typeof normalizarTexto === 'function'
          ? normalizarTexto(c.local) === normalizarTexto(nombre)
          : c.local === nombre
      );
      if (!existeDB && typeof autoCrearClienteNoRegistrado === 'function') {
        await autoCrearClienteNoRegistrado(nombre, dir, loc, tel);
      }
    } catch(e) { /* no bloquear si falla */ }
  }

  let pago = 'sin_definir';
  document.querySelectorAll('.pago-btn').forEach(b => {
    if (b.classList.contains('active-efectivo'))      pago = 'efectivo';
    if (b.classList.contains('active-transferencia')) pago = 'transferencia';
    if (b.classList.contains('active-deuda'))         pago = 'deuda';
  });
  const aliasVal = aliasActivo === 1
    ? (document.getElementById('alias1-val')?.value || '').trim()
    : aliasActivo === 2
      ? (document.getElementById('alias2-val')?.value || '').trim()
      : '';
  const unidades = rows.reduce((s,r)=>s+(+r.cant||0),0);
  // Segundo medio de pago
  const segPago = typeof getSegundoPago === 'function' ? getSegundoPago() : null;
  const monto2 = segPago ? Math.min(+segPago.monto || 0, +total || 0) : 0;

  // Desglose de pagos: siempre al menos una parte. Es la fuente de verdad
  // para las métricas, el cobro de deuda y el balance de alias.
  const partesPagoRemito = [{ tipo: pago, monto: Math.max(0, (+total || 0) - monto2), alias: aliasVal || null }];
  if (segPago && monto2 > 0) {
    partesPagoRemito.push({ tipo: segPago.tipo, monto: monto2, alias: segPago.alias || null });
  }

  const remito = {
    fecha,
    cliente_nombre: nombre,
    cliente_tel: tel,
    cliente_dir: dir,
    cliente_loc: loc,
    total,
    pago,
    alias: aliasVal || null,
    unidades,
    productos: JSON.stringify(rows.map(r=>({prod:r.prod,cant:r.cant,precio:r.precio}))),
    pagos_detalle: JSON.stringify(partesPagoRemito),
    created_at: new Date().toISOString(),
    ...(segPago && monto2 > 0 ? { pago2_tipo: segPago.tipo, pago2_monto: monto2, pago2_alias: segPago.alias } : {})
  };

  // Registrar hash para anti-dup futuro
  if (typeof _hashRemitosRecientes !== 'undefined') {
    const h = (typeof normalizarTexto === 'function' ? normalizarTexto(nombre) : nombre) + '|' + fecha + '|' + String(+total||0);
    _hashRemitosRecientes.add(h);
  }

  if (navigator.onLine) {
    try {
      await sbInsertRemito(remito);
      return;
    } catch(e) {
      console.warn('Error Supabase, guardando offline:', e.message);
    }
  }
  try {
    await guardarRemitoOffline(remito);
    await actualizarBadgePendientes();
  } catch(e) {
    console.warn('No se pudo guardar ni online ni offline:', e.message);
  }
}

/* ── DASHBOARD CON MÉTRICAS — NAVEGACIÓN POR MES ── */
var _dashMesOffset = 0; // 0 = mes actual, -1 = mes anterior, etc.


function renderRankingsDash(remitos, clientes) {
  if (!remitos || remitos.length === 0) {
    return '<div class="card" style="margin-bottom:1.5rem;padding:1.5rem;text-align:center">'+
      '<div style="font-size:24px;margin-bottom:8px">' + ic('trophy') + '</div>'+
      '<div style="font-size:13px;color:var(--muted)">Los rankings aparecerán cuando haya remitos registrados</div>'+
    '</div>';
  }

  const fp = n => '$' + n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

  // Mapear cliente_nombre → datos del cliente
  const clienteMap = {};
  (clientes||[]).forEach(c => { clienteMap[c.local] = c; });

  // Acumular totales por cliente, zona (loc) y rubro
  const porCliente = {}, porZona = {}, porRubro = {};
  remitos.forEach(r => {
    const nombre = r.cliente_nombre || '—';
    const total  = +r.total || 0;
    const cli    = clienteMap[nombre] || {};
    const zona   = (r.cliente_loc || cli.loc || '').trim();
    const zonaNorm = zona ? zona.toLowerCase().replace(/\b\w/g, c=>c.toUpperCase()) : '—';
    const rubro  = cli.rubro || '—';

    porCliente[nombre] = (porCliente[nombre]||0) + total;
    if (zonaNorm !== '—') porZona[zonaNorm] = (porZona[zonaNorm]||0) + total;
    if (rubro !== '—') porRubro[rubro] = (porRubro[rubro]||0) + total;
  });

  const top = (obj, icon) => {
    const sorted = Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if (!sorted.length) return '<div style="font-size:13px;color:var(--muted);padding:.5rem 0">Sin datos</div>';
    const max = sorted[0][1] || 1;
    return sorted.map(([nombre, total], i) => {
      const pct = Math.round((total / max) * 100);
      const medalla = i===0?'' + ic('trophy') + '':i===1?'' + ic('trophy') + '':i===2?'' + ic('trophy') + '':'';
      return '<div style="margin-bottom:12px">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'+
          '<div style="font-size:13px;font-weight:500;color:var(--text);display:flex;align-items:center;gap:5px">'+
            (medalla?'<span>'+medalla+'</span>':
              '<span style="font-size:11px;color:var(--muted);font-weight:700;min-width:16px;text-align:center">'+(i+1)+'</span>')+
            '<span>'+esc(nombre)+'</span>'+
          '</div>'+
          '<div style="font-size:13px;font-weight:600;color:var(--rose)">'+fp(total)+'</div>'+
        '</div>'+
        '<div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">'+
          '<div style="height:100%;width:'+pct+'%;background:var(--grad-h);border-radius:4px;transition:width .3s"></div>'+
        '</div>'+
      '</div>';
    }).join('');
  };

  const rankCard = (titulo, icon, contenido) =>
    '<div class="card" style="margin-bottom:1rem">'+
      '<div style="padding:.9rem 1.2rem .7rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:18px">'+icon+'</span>'+
        '<span style="font-size:13px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.5px">'+titulo+'</span>'+
      '</div>'+
      '<div style="padding:.9rem 1.2rem">'+contenido+'</div>'+
    '</div>';

  return '<div style="margin-bottom:1.5rem">'+
    '<div class="dash-section-title">' + ic('trophy') + ' Rankings</div>'+
    rankCard('Clientes que más compran', '' + ic('store') + '', top(porCliente)) +
    rankCard('Zonas con más ventas', '' + ic('pin') + '', top(porZona)) +
    rankCard('Rubros con más ventas', '' + ic('tag') + '', top(porRubro)) +
  '</div>';
}


/* ── MODAL DETALLE DASHBOARD ── */
function abrirModalDetalleDash(tipo, remitos) {
  let modal = g('dash-detalle-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dash-detalle-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.innerHTML =
      '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
        '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
          '<div id="ddm-title" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)"></div>'+
          '<button onclick="cerrarModalDetalleDash()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
        '</div>'+
        '<div id="ddm-body" style="padding:1rem 1.2rem"></div>'+
      '</div>';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarModalDetalleDash(); });
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const titleEl = g('ddm-title');
  const bodyEl  = g('ddm-body');

  // Probadores — lista de clientes
  if (tipo === 'probadores') {
    titleEl.textContent = 'Clientes con probador de cremas';
    const cs = window._dashClientes || _cache || [];
    const con = cs.filter(c=>c.probador_cremas);
    if (!con.length) {
      bodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">No hay clientes con probador registrado.</div>';
      return;
    }
    bodyEl.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">'+con.length+' cliente'+(con.length===1?'':'s')+'</div>'+
      con.map(c=>{
        const ruta = parseRuta(c.ruta);
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">'+
          '<div>'+
            '<div style="font-size:13px;font-weight:600;color:var(--text)">'+esc(c.local)+'</div>'+
            '<div style="font-size:11px;color:var(--muted);margin-top:2px">'+
              [c.num_str, ruta.orden?'Ruta '+ruta.orden:'', c.loc].filter(Boolean).map(esc).join(' · ')+
            '</div>'+
          '</div>'+
          '<span class="probador-tag">' + ic('check') + ' Probador</span>'+
        '</div>';
      }).join('');
    return;
  }

  // Incompletos — lista con campos faltantes
  if (tipo === 'incompletos') {
    titleEl.textContent = 'Clientes con datos incompletos';
    const cs = window._dashClientes || _cache || [];
    const con = cs.map(c=>({c, f:camposFaltantes(c)})).filter(x=>x.f.length>0);
    if (!con.length) {
      bodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">' + ic('check') + ' ¡Todos los clientes tienen sus datos completos!</div>';
      return;
    }
    bodyEl.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">'+con.length+' cliente'+(con.length===1?'':'s')+' con datos faltantes</div>'+
      '<div style="display:flex;flex-direction:column;gap:10px">'+
      con.map(({c,f})=>
        '<div style="background:var(--bg);border:1px solid #fde8b8;border-radius:var(--radius);padding:12px 14px">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:6px">'+
            '<div>'+
              '<span style="font-size:10px;background:#fde8b8;color:#92600a;border-radius:6px;padding:2px 7px;font-weight:700;margin-right:6px">'+esc(c.num_str||'')+'</span>'+
              '<span style="font-size:13px;font-weight:600;color:var(--text)">'+esc(c.local)+'</span>'+
            '</div>'+
            '<button onclick="cerrarModalDetalleDash();abrirEdicion('+c.num+')" style="background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">Completar ' + ic('edit') + '</button>'+
          '</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:5px">'+
            f.map(x=>'<span style="background:#fff3cd;border:1px solid #fcd97a;border-radius:12px;padding:3px 9px;font-size:11px;color:#7a5200">'+esc(x)+'</span>').join('')+
          '</div>'+
        '</div>'
      ).join('')+
      '</div>';
    return;
  }

  // Rutas activas — hojas de ruta
  if (tipo === 'rutas') {
    titleEl.textContent = 'Hojas de ruta';
    const cs = window._dashClientes || _cache || [];
    const grupos = {};
    cs.forEach(c=>{
      const r = parseRuta(c.ruta);
      const key = r.orden ? 'Ruta '+r.orden : 'Sin ruta';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push({c, r});
    });
    const keys = Object.keys(grupos).sort((a,b)=>{
      if(a==='Sin ruta') return 1; if(b==='Sin ruta') return -1;
      return parseInt(a.replace('Ruta ',''))-parseInt(b.replace('Ruta ',''));
    });
    if (!keys.length) {
      bodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">No hay rutas registradas.</div>';
      return;
    }
    bodyEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:14px">'+
      keys.filter(k=>k!=='Sin ruta').map(key=>{
        const items = grupos[key];
        const sorted = [...items].sort((a,b)=>(+a.r.orden||0)-(+b.r.orden||0));
        const lv0 = (sorted[0]?.r?.horarios||[]).find(h=>h.periodo==='Lun a Vier');
        const horStr = lv0 ? [
          lv0.manana?.ap?'Mañana: '+lv0.manana.ap+' a '+lv0.manana.ci:'',
          lv0.tarde?.ap?'Tarde: '+lv0.tarde.ap+' a '+lv0.tarde.ci:''
        ].filter(Boolean).join(' · ') : '';
        return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">'+
          '<div style="background:var(--subtle);padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'+
            '<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:var(--text)">'+esc(key)+'</span>'+
            '<span style="font-size:11px;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:2px 9px">'+items.length+' clientes</span>'+
          '</div>'+
          '<div style="padding:10px 14px">'+
            (horStr?'<div style="font-size:11px;color:var(--muted);margin-bottom:8px">' + ic('clock') + ' '+esc(horStr)+'</div>':'')+
            items.sort((a,b)=>(+a.r.orden||999)-(+b.r.orden||999)).map(({c,r})=>{
              const lv = (r.horarios||[]).find(h=>h.periodo==='Lun a Vier');
              const h = lv ? [lv.manana?.ap?lv.manana.ap+' a '+lv.manana.ci:'',lv.tarde?.ap?lv.tarde.ap+' a '+lv.tarde.ci:''].filter(Boolean).join(' · ') : '';
              return '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">'+
                '<div style="flex:1;min-width:0">'+
                  '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'+
                    (r.orden?'<span style="font-size:9px;background:rgba(200,75,140,.12);color:var(--rose);border-radius:4px;padding:1px 6px;font-weight:700">#'+esc(r.orden)+'</span>':'')+
                    '<span style="font-size:13px;font-weight:600;color:var(--text)">'+esc(c.local)+'</span>'+
                    (c.probador_cremas?'<span class="probador-tag">' + ic('droplet') + '</span>':'')+
                  '</div>'+
                  (c.tel?'<div style="font-size:11px;color:var(--muted);margin-top:2px">' + ic('phone') + ' '+esc(c.tel)+(c.tel2?' · '+esc(c.tel2):'')+'</div>':'')+
                  (c.dir?'<div style="font-size:11px;color:var(--muted)">' + ic('pin') + ' '+esc(c.dir)+(c.loc?' · '+esc(c.loc):'')+'</div>':'')+
                  (h?'<div style="font-size:10px;color:var(--muted);margin-top:2px">' + ic('clock') + ' '+esc(h)+'</div>':'')+
                  (r.notas?'<div style="font-size:10px;color:var(--muted);font-style:italic">' + ic('edit') + ' '+esc(r.notas)+'</div>':'')+
                '</div>'+
              '</div>';
            }).join('')+
          '</div>'+
        '</div>';
      }).join('')+
    '</div>';
    return;
  }

  // Rubro — lista de clientes de ese rubro
  if (tipo === 'rubro') {
    const rubroNombre = remitos; // reusamos el param para pasar el nombre del rubro
    titleEl.textContent = '' + rubroNombre;
    const cs = window._dashClientes || _cache || [];
    const lista = cs.filter(c=>(c.rubro||'').trim()===rubroNombre);
    if (!lista.length) {
      bodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">No hay clientes en este rubro.</div>';
      return;
    }
    bodyEl.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">'+lista.length+' cliente'+(lista.length===1?'':'s')+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      lista.sort((a,b)=>(a.local||'').localeCompare(b.local||'')).map(c=>{
        const ruta = parseRuta(c.ruta);
        return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px">'+
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">'+
            '<div style="flex:1;min-width:0">'+
              '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">'+
                '<span style="font-size:10px;background:rgba(200,75,140,.12);color:var(--rose);border-radius:6px;padding:2px 7px;font-weight:700">'+esc(c.num_str||'')+'</span>'+
                '<span style="font-size:14px;font-weight:600;color:var(--text)">'+esc(c.local)+'</span>'+
                (c.probador_cremas?'<span class="probador-tag">' + ic('droplet') + '</span>':'')+
              '</div>'+
              (c.duenio?'<div style="font-size:12px;color:var(--muted)">'+esc(c.duenio)+'</div>':'')+
              (c.tel?'<div style="font-size:12px;color:var(--muted)">' + ic('phone') + ' '+esc(c.tel)+'</div>':'')+
              (c.loc||ruta.orden?'<div style="font-size:11px;color:var(--muted);margin-top:2px">'+[c.loc?esc(c.loc):'',ruta.orden?'Ruta '+esc(ruta.orden):''].filter(Boolean).join(' · ')+'</div>':'')+
            '</div>'+
            '<button onclick="cerrarModalDetalleDash();abrirEdicion('+c.num+')" style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 10px;font-size:13px;color:var(--muted);cursor:pointer;flex-shrink:0">' + ic('edit') + '</button>'+
          '</div>'+
        '</div>';
      }).join('')+
      '</div>';
    return;
  }

  // Remitos — filtrar según tipo
  const fp = n => '$' + n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const pagoColor = {efectivo:'var(--violet)',transferencia:'var(--violet)',deuda:'var(--violet)',sin_definir:'var(--muted)'};
  const pagoLabel = {efectivo:'' + ic('cash') + ' Efectivo',transferencia:'' + ic('smartphone') + ' Transferencia',deuda:'' + ic('clock') + ' Deuda',sin_definir:'— Sin definir'};
  const titulos = {
    'total-hoy':'Total facturado hoy','efectivo-hoy':'Efectivo de hoy',
    'transferencia-hoy':'Transferencias de hoy','deuda-hoy':'Deudas de hoy',
    'visitas-hoy':'Visitas de hoy',
    'total-mes':'Total facturado del mes','efectivo-mes':'Efectivo del mes',
    'transferencia-mes':'Transferencias del mes','deuda-mes':'Deudas del mes',
    'unidades-mes':'Unidades del mes',
    'total-hist':'Total facturado histórico','efectivo-hist':'Efectivo histórico',
    'transferencia-hist':'Transferencias históricas','deuda-hist':'Deuda pendiente total',
    'unidades-hist':'Unidades históricas',
  };
  titleEl.textContent = titulos[tipo] || 'Detalle';

  let lista = remitos || [];
  if (tipo.startsWith('efectivo'))       lista = lista.filter(r=>r.pago==='efectivo');
  else if (tipo.startsWith('transferencia')) lista = lista.filter(r=>r.pago==='transferencia');
  else if (tipo.startsWith('deuda'))     lista = lista.filter(r=>tieneDeudaPendiente(r));

  if (!lista.length) {
    bodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">No hay registros para mostrar.</div>';
    return;
  }

  const totalLista = lista.reduce((s,r)=>s+(+r.total||0),0);
  bodyEl.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface);border-radius:var(--radius);margin-bottom:14px;border:1px solid var(--border)">'+
      '<span style="font-size:12px;color:var(--muted);font-weight:600">'+lista.length+' remito'+(lista.length===1?'':'s')+'</span>'+
      '<span style="font-size:16px;font-weight:700;font-family:Montserrat,sans-serif;color:var(--violet)">'+fp(totalLista)+'</span>'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:10px">'+
    lista.map(r=>{
      let prods=[]; try{prods=JSON.parse(r.productos||'[]');}catch(_){}
      const prodStr = prods.filter(p=>p.prod).map(p=>esc(p.prod)+' ×'+p.cant).join(', ');
      const color = pagoColor[r.pago]||'#9c8b88';
      const badge = pagoLabel[r.pago]||r.pago;
      return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;position:relative;overflow:hidden">'+
        '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--grad-h)"></div>'+
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">'+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:13px;font-weight:600;color:var(--text)">'+esc(r.cliente_nombre||'—')+'</div>'+
            (r.cliente_loc?'<div style="font-size:11px;color:var(--muted);margin-top:1px">'+esc(r.cliente_loc)+'</div>':'')+
            (r.alias && r.pago !== 'efectivo' ?'<div style="font-size:11px;color:#d6539a;margin-top:2px">' + ic('card') + ' '+esc(r.alias)+'</div>':'')+
          '</div>'+
          '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">'+
            '<span style="font-size:11px;font-weight:600;color:'+color+'">'+badge+'</span>'+
            '<button onclick="cerrarModalDetalleDash();_historialCache=[...window._dashRemMes||[],...window._dashRemitosHoy||[]];editarRemito('+r.id+')" '+
              'style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:4px 8px;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('edit') + '</button>'+
            '<button onclick="if(confirm(\'¿Eliminar este remito?\'))sbFetch(\'remitos?id=eq.'+r.id+'\',{method:\'DELETE\',headers:{\'Prefer\':\'\'}}).then(()=>{cerrarModalDetalleDash();actualizarDashboard();toast(\'Remito eliminado\')})" '+
              'style="background:var(--surface);border:1px solid #fecaca;border-radius:7px;padding:4px 8px;font-size:12px;color:#dc2626;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('trash') + '</button>'+
          '</div>'+
        '</div>'+
        '<div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px">'+
          '<div style="font-size:1.2rem;font-weight:700;font-family:Montserrat,sans-serif;color:var(--violet)">'+fp(+r.total||0)+'</div>'+
          '<div style="font-size:11px;color:var(--muted)">'+esc(r.fecha||'')+(r.unidades?' · '+r.unidades+' u':'')+'</div>'+
        '</div>'+
        (prodStr?'<div style="font-size:11px;color:var(--muted);margin-top:5px;border-top:1px solid var(--border);padding-top:5px">'+prodStr+'</div>':'')+
      '</div>';
    }).join('')+
    '</div>';
}

function cerrarModalDetalleDash() {
  const modal = g('dash-detalle-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ── REINICIAR MÉTRICAS ── */
function confirmarReiniciarMetricas() {
  let modal = g('reiniciar-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reiniciar-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:center;justify-content:center;backdrop-filter:blur(2px)';
    modal.innerHTML =
      '<div style="background:var(--bg);border-radius:var(--radius-lg);width:90%;max-width:380px;padding:1.5rem;box-shadow:0 8px 32px rgba(0,0,0,.15)">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px">' + ic('trash') + ' Reiniciar métricas</div>'+
        '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6">Esto eliminará <strong>todos los remitos guardados</strong> de la base de datos. Los clientes no se ven afectados. Esta acción no se puede deshacer.</div>'+
        '<div style="display:flex;gap:10px">'+
          '<button onclick="cerrarReiniciarModal()" style="flex:1;background:transparent;border:1px solid var(--border);border-radius:var(--radius);padding:11px;font-size:13px;font-family:Inter,sans-serif;cursor:pointer;color:var(--muted)">Cancelar</button>'+
          '<button onclick="ejecutarReiniciarMetricas()" style="flex:2;background:#dc2626;color:#fff;border:none;border-radius:var(--radius);padding:11px;font-size:13px;font-family:Inter,sans-serif;font-weight:600;cursor:pointer">Sí, reiniciar todo</button>'+
        '</div>'+
      '</div>';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarReiniciarModal(); });
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarReiniciarModal() {
  const modal = g('reiniciar-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function ejecutarReiniciarMetricas() {
  const btn = document.querySelector('#reiniciar-modal button:last-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Eliminando...'; }
  try {
    await sbFetch('remitos?id=gt.0', { method: 'DELETE', headers: { 'Prefer': '' } });
    window._dashRemitosHoy = [];
    window._dashRemMes = [];
    cerrarReiniciarModal();
    toast('✓ Métricas reiniciadas');
    actualizarDashboard();
  } catch(e) {
    toast('Error: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Sí, reiniciar todo'; }
  }
}

/* ── HELPERS ── */
function g(id) { return document.getElementById(id); }
function rd(id) { const el = g(id); return el ? el.value.trim() : ''; }
function loading(on) { g('sb-bar').classList.toggle('on', on); }
function siguienteNum() { return parseInt(localStorage.getItem(NUM_KEY) || '0') + 1; }
function incrementarNum() { const n = siguienteNum(); localStorage.setItem(NUM_KEY, String(n)); return n; }
function numFmt(n) { return 'C-' + String(n).padStart(4, '0'); }

/* ── Formato de número según ruta ── */
function numFmtRuta(n, rutaOrden) {
  if (!rutaOrden || rutaOrden === '__sin__' || String(rutaOrden).trim() === '') {
    return 'SR-' + String(n).padStart(4, '0');
  }
  return 'R' + rutaOrden + '-' + String(n).padStart(4, '0');
}

/* ── Siguiente número global disponible (garantiza unicidad absoluta) ──
   Consulta todos los num_str existentes y devuelve el siguiente sin repetir */
async function siguienteNumGlobal() {
  // Solo calcula el siguiente número, NO lo guarda.
  // El número se reserva en localStorage únicamente al guardar el cliente de verdad.
  try {
    const todos = _cache || await cargarDB();
    const nums = todos.map(c => {
      const ns = c.num_str || '';
      const m = ns.match(/(\d+)$/);
      return m ? parseInt(m[1]) : 0;
    }).filter(n => n > 0);
    const maxExistente = nums.length ? Math.max(...nums) : 0;
    const contadorLocal = parseInt(localStorage.getItem(NUM_KEY) || '0');
    return Math.max(maxExistente, contadorLocal) + 1; // sin setItem
  } catch(e) {
    return parseInt(localStorage.getItem(NUM_KEY) || '0') + 1;
  }
}

/* ── Generar num_str para una ruta determinada ── */
async function generarNumStrParaRuta(rutaOrden) {
  const n = await siguienteNumGlobal();
  return numFmtRuta(n, rutaOrden);
}
let toastT;
function toast(msg, type) {
  const el = g('toast');
  let m = String(msg == null ? '' : msg);
  if (!type) {
    if (/^(?:' + ic('check') + '|' + ic('check') + ')/.test(m)) type = 'success';
    else if (/^' + ic('alert') + '/.test(m)) type = 'warning';
    else if (/^(?:' + ic('x') + '|' + ic('ban') + ')/.test(m)) type = 'error';
  }
  m = m.replace(/^[\u2190-\u21FF\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u{1F000}-\u{1FAFF}\s]+/u, '');
  el.textContent = m;
  el.classList.remove('toast-success', 'toast-warning', 'toast-error');
  if (type) el.classList.add('toast-' + type);
  el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2800);
}
function fmtTime(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2) + ':' + v.slice(2, 4);
  el.value = v;
}
function fmtCuit(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 2)  v = v.slice(0, 2) + '-' + v.slice(2);
  if (v.length > 11) v = v.slice(0, 11) + '-' + v.slice(11, 12);
  el.value = v;
}
function fmtDni(el) {
  // DNI: XX.XXX.XXX
  let v = el.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0,2) + '.' + v.slice(2,5) + '.' + v.slice(5);
  else if (v.length > 2) v = v.slice(0,2) + '.' + v.slice(2);
  el.value = v;
}
function onDocInput(el, pfx) {
  const tipo = document.getElementById(pfx + '-doc-tipo');
  if (tipo && tipo.value === 'DNI') fmtDni(el);
  else fmtCuit(el);
}
function onDocTipoChange(pfx) {
  const tipo = document.getElementById(pfx + '-doc-tipo').value;
  const inp  = document.getElementById(pfx + '-cuit');
  const lbl  = document.getElementById(pfx + '-doc-label');
  if (lbl) lbl.textContent = tipo;
  // Solo borrar el valor si está vacío o si el formato no coincide con el nuevo tipo
  // No borrar si el usuario ya tiene datos ingresados
  inp.placeholder = tipo === 'DNI' ? 'XX.XXX.XXX' : '20-12345678-9';
  inp.maxLength   = tipo === 'DNI' ? 10 : 13;
}
function fmtTel(el) {
  let v = el.value.replace(/\D/g, '');
  const a = v[0] === '0' ? 3 : 2;
  if (v.length <= a) { el.value = v; return; }
  const area = v.slice(0, a), rest = v.slice(a);
  el.value = rest.length <= 4 ? area + '-' + rest : area + '-' + rest.slice(0, 4) + '-' + rest.slice(4, 8);
}
function fmtNumCliente(el) {
  el._userEdited = true;
  let v = el.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
  if (/^[A-Z]+[0-9]/.test(v)) { const l = v.match(/^[A-Z]+/)[0]; v = l + '-' + v.slice(l.length); }
  el.value = v;
}
function titleCase(el) {
  const p = el.selectionStart, s = el.value;
  const allUp = s === s.toUpperCase() && /[A-ZÁÉÍÓÚÜÑ]/.test(s);
  el.value = (allUp ? s.toLowerCase() : s).replace(/(^|[\s\-])([a-záéíóúüña-z])/gi, m => m.toUpperCase());
  try { el.setSelectionRange(p, p); } catch(_) {}
}
function actualizarPreview() {
  const el = g('num-input');
  if (el && !el._userEdited) el.value = numFmt(siguienteNum());
  // También actualizar el modal si está abierto y no fue editado manualmente
  const mEl = g('m-numStr');
  if (mEl && !mEl._userEdited && document.getElementById('modal-title-txt')?.textContent === 'Nuevo cliente') {
    mEl.value = numFmt(siguienteNum());
  }
}
function parseRuta(r) {
  if (!r) return {};
  if (typeof r === 'string') { try { return JSON.parse(r); } catch(_) { return {}; } }
  return r;
}

/* ── RUBROS ── */
function selRubro(btn, val) {
  document.querySelectorAll('#rubros-wrap .rubro-chip').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); rubroSel = val;
  const cw = g('rubro-custom-wrap');
  if (val === '__custom__') { cw.classList.add('visible'); g('c-rubro-custom').focus(); }
  else cw.classList.remove('visible');
}
function mSelRubro(btn, val) {
  document.querySelectorAll('#m-rubros-wrap .rubro-chip').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); mRubroSel = val;
  const cw = g('m-rubro-custom-wrap');
  if (val === '__custom__') { cw.classList.add('visible'); g('m-rubro-custom').focus(); }
  else cw.classList.remove('visible');
}
function getRubro() { return rubroSel === '__custom__' ? rd('c-rubro-custom') : rubroSel; }
function getMRubro() { return mRubroSel === '__custom__' ? rd('m-rubro-custom') : mRubroSel; }
function leerHorarios(pfx) {
  const p = pfx ? pfx + '-' : '';
  return [{ periodo: 'Lun a Vier', manana: { ap: rd(p + 'lv-map'), ci: rd(p + 'lv-mci') }, tarde: { ap: rd(p + 'lv-tap'), ci: rd(p + 'lv-tci') } }];
}

/* ── TABS ── */
async function showTab(tab, btn) {
  g('tab-agregar').style.display     = tab === 'agregar'   ? '' : 'none';
  g('tab-clientes').style.display    = tab === 'clientes'  ? '' : 'none';
  g('tab-incompletos').style.display = tab === 'incompletos' ? '' : 'none';
  g('tab-remito').style.display      = tab === 'remito'    ? '' : 'none';
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'clientes') {
    // Always reset to mosaico when switching to clientes tab
    g('ruta-detalle').style.display = 'none';
    g('ruta-mosaico').style.display = '';
    _rutaDetalleActual = null;
    _rutaFiltro = null;
    _rubroFiltro = null;
    await renderMosaico();
    const cl = await cargarDB();
    g('export-bar').style.display = cl.length ? '' : 'none';
  } else if (tab === 'incompletos') {
    await renderIncompletos();
    g('export-bar').style.display = 'none';
  } else if (tab === 'remito') {
    g('export-bar').style.display = 'none';
    cargarRemito();
  } else {
    g('export-bar').style.display = 'none';
    actualizarPreview();
  }
}

/* ── GUARDAR CLIENTE ── */
async function guardarCliente() {
  const local = rd('c-local');
  if (!local) { toast('Ingresá el nombre del local'); return; }
  const customStr = rd('num-input');
  const num = incrementarNum();
  const numStr = customStr || numFmt(num);
  const cliente = {
    num, num_str: numStr,
    fecha: new Date().toLocaleDateString('es-AR'),
    local, rubro: getRubro(),
    duenio: rd('c-duenio'), cuit: rd('c-cuit'),
    tel: rd('c-tel'), dir: rd('c-dir'), loc: rd('c-loc'),
    doc_tipo: rd('c-doc-tipo') || 'CUIT',
    regimen:  rd('c-regimen'),
    probador_cremas: g('c-probador') ? g('c-probador').checked : false,
    ruta: JSON.stringify({ horarios: leerHorarios(), orden: rd('r-orden'), notas: rd('r-notas') })
  };
  const btn = g('save-btn'); btn.disabled = true; btn.textContent = 'Guardando...'; loading(true);
  try {
    await sbInsert(cliente); _cache = null;
    await actualizarCounter(); actualizarPreview(); limpiarForm(); actualizarBadgeIncompletos();
    toast('✓ Cliente ' + numStr + ' guardado');
  } catch(e) {
    localStorage.setItem(NUM_KEY, String(num - 1));
    toast('Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar cliente'; loading(false);
  }
}
function limpiarForm() {
  ['c-local','c-duenio','c-cuit','c-tel','c-dir','c-loc','c-rubro-custom','r-orden','r-notas','lv-map','lv-mci','lv-tap','lv-tci']
    .forEach(id => { const el = g(id); if (el) el.value = ''; });
  document.querySelectorAll('#rubros-wrap .rubro-chip').forEach(b => b.classList.remove('selected'));
  g('rubro-custom-wrap').classList.remove('visible'); rubroSel = '';
  const pc = g('c-probador'); if (pc) pc.checked = false;
  const ni = g('num-input'); if (ni) { ni._userEdited = false; ni.value = numFmt(siguienteNum()); }
  const cp = g('c-probador'); if (cp) cp.checked = false;
  const cdt = document.getElementById('c-doc-tipo'); if (cdt) { cdt.value = 'CUIT'; onDocTipoChange('c'); }
  const cr = document.getElementById('c-regimen'); if (cr) cr.value = '';
}

/* ── LISTA ── */
async function renderLista() {
  const q = (g('search-input').value || '').toLowerCase();
  loading(true); const todos = await cargarDB(); loading(false);

  // Apply search filter (includes rubro)
  let lista = q ? todos.filter(c => {
    const ruta = parseRuta(c.ruta);
    const probadorStr = c.probador_cremas ? 'probador cremas ordeñe' : '';
    const haystack = [
      c.local, c.rubro, c.loc, c.duenio, c.num_str, c.regimen || '',
      c.tel || '', c.tel2 || '',
      ruta.orden ? 'ruta ' + ruta.orden : '',
      ruta.notas || '', probadorStr
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  }) : todos;

  // Build rubro filter tabs (based on search-filtered list)
  buildRubroFilterTabs(lista);

  // Apply rubro filter
  if (_rubroFiltro !== null) {
    lista = lista.filter(c => {
      const r = (c.rubro || 'Sin rubro').trim() || 'Sin rubro';
      return r === _rubroFiltro;
    });
  }

  const el = g('client-list');
  if (!lista.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon"></div><p>' +
      (todos.length===0 ? 'Todavía no hay clientes.' : 'Sin resultados.') + '</p></div>';
    return;
  }

  // Group by ruta order
  const grupos = {};
  const ordenKeys = [];
  lista.forEach(function(c) {
    const r = parseRuta(c.ruta);
    const o = r.orden ? 'Ruta ' + r.orden : 'Sin ruta';
    if (!grupos[o]) { grupos[o] = []; ordenKeys.push(o); }
    grupos[o].push(c);
  });

  // Sort groups
  const keys = Object.keys(grupos).sort(function(a,b) {
    if (a==='Sin ruta') return 1;
    if (b==='Sin ruta') return -1;
    return parseInt(a.replace('Ruta ','')) - parseInt(b.replace('Ruta ',''));
  });

  let html = '';
  keys.forEach(function(key) {
    const clientes = grupos[key];
    const n = clientes.length;
    html += '<div class="ruta-group">' +
      '<div class="ruta-group-header">' +
        '<span class="ruta-group-title">' + esc(key) + '</span>' +
        '<span class="' + (n < 20 ? 'ruta-group-warn' : 'ruta-group-count') + '">' +
          n + ' cliente' + (n===1?'':'s') + (n < 20 ? ' ' + ic('alert') + '':'') +
        '</span>' +
      '</div>' +
      clientes.map(c => renderClientCard(c)).join('') +
    '</div>';
  });
  el.innerHTML = html;
}

function renderClientCard(c) {
  const ruta = parseRuta(c.ruta);
  const badge = [c.loc ? esc(c.loc) : '', ruta.orden ? 'Ruta #' + ruta.orden : ''].filter(Boolean).join(' · ');
  const lv = (ruta.horarios || []).find(h => h.periodo === 'Lun a Vier');
  let horStr = '';
  if (lv) {
    const man = (lv.manana && (lv.manana.ap || lv.manana.ci)) ? (lv.manana.ap||'—') + ' a ' + (lv.manana.ci||'—') : '';
    const tar = (lv.tarde  && (lv.tarde.ap  || lv.tarde.ci))  ? (lv.tarde.ap ||'—') + ' a ' + (lv.tarde.ci ||'—') : '';
    horStr = [man?'Mañana: '+man:'', tar?'Tarde: '+tar:''].filter(Boolean).join(' · ');
  }
  // Badge pedidos pendientes de este cliente
  const pedCount = (window._pedPorCliente||{})[c.local] || 0;
  const pedBadge = pedCount > 0
    ? '<span onclick="event.stopPropagation();showPage(\'pedidos\',document.getElementById(\'nav-pedidos\'))" '+
        'style="font-size:10px;background:#fff7ed;color:#d97706;border:1px solid #fed7aa;border-radius:6px;padding:2px 8px;font-weight:600;cursor:pointer;white-space:nowrap">'+
        '' + ic('clipboard') + ' '+pedCount+' pedido'+(pedCount>1?'s':'')+' pendiente'+(pedCount>1?'s':'')+
      '</span>'
    : '';
  return '<div class="client-card" onclick="toggleExp(\'exp-' + c.num + '\')">' +
    '<div class="client-card-top">' +
      '<div class="client-info">' +
        '<div class="client-header">' +
          (ruta.orden ? '<span style="font-size:10px;background:#f0d6e8;color:#b03a7a;border-radius:6px;padding:2px 7px;font-weight:600;letter-spacing:1px;white-space:nowrap">Ruta ' + esc(ruta.orden) + '</span>' : '') +
          '<span class="client-num">' + esc(c.num_str||'') + '</span>' +
          '<span class="client-name">' + esc(c.local) + '</span>' +
          (pedBadge ? ' '+pedBadge : '') +
          (typeof chipAvisoAumento === 'function' ? ' ' + chipAvisoAumento(c) : '') +
        '</div>' +
        (c.rubro ? '<div><span class="client-rubro">' + esc(c.rubro) + '</span>' + (c.probador_cremas ? ' <span class="probador-tag">' + ic('check') + ' Probador cremas</span>' : '') + '</div>' : (!c.rubro && c.probador_cremas ? '<div><span class="probador-tag">' + ic('check') + ' Probador cremas</span></div>' : '')) +
        '<div class="client-detail">' + [c.duenio, c.tel, c.tel2].filter(Boolean).map(esc).join(' · ') + '</div>' +
        (c.dir ? '<div class="client-detail2">' + esc(c.dir) + '</div>' : '') +
        (badge ? '<div class="ruta-badge">' + ic('map') + ' ' + badge + '</div>' : '') +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="edit-card-btn" onclick="event.stopPropagation();abrirEdicion(' + c.num + ')">' + ic('edit') + '</button>' +
        '<button class="del-btn" onclick="event.stopPropagation();eliminarCliente(' + c.num + ')">' + ic('x') + '</button>' +
      '</div>' +
    '</div>' +
    '<div class="client-expand" id="exp-' + c.num + '">' +
      '<div class="expand-grid">' +
        (c.cuit ? '<div class="expand-item"><div class="expand-label">' + esc(c.doc_tipo||'CUIT') + '</div><div class="expand-val">' + esc(c.cuit) + '</div></div>' : '') +
        (c.regimen ? '<div class="expand-item"><div class="expand-label">Régimen</div><div class="expand-val">' + esc(c.regimen) + '</div></div>' : '') +
        (c.fecha ? '<div class="expand-item"><div class="expand-label">Alta</div><div class="expand-val">' + esc(c.fecha) + '</div></div>' : '') +
        (ruta.orden ? '<div class="expand-item"><div class="expand-label">Orden ruta</div><div class="expand-val">#' + esc(ruta.orden) + '</div></div>' : '') +
      '</div>' +
      (horStr ? '<div style="font-size:11px;color:#b099a8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Horarios Lun-Vier</div><div style="font-size:13px;color:#1a0a12">' + horStr + '</div>' : '') +
      (ruta.notas ? '<div style="margin-top:8px"><div class="expand-label">Notas</div><div class="expand-val" style="white-space:pre-wrap;line-height:1.5;margin-top:2px;font-size:13px">' + esc(ruta.notas) + '</div></div>' : '') +
      '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn-secondary" style="font-size:12px;padding:7px 12px" onclick="event.stopPropagation();verVentasCliente(' + c.num + ',\'' + esc(c.local).replace(/'/g,"\\'") + '\')">' + ic('chart') + ' Ver ventas</button>' +
        '<button class="btn-secondary" style="font-size:12px;padding:7px 12px;border-color:var(--rose-border,#f0c8d8);color:var(--rose)" onclick="event.stopPropagation();abrirFichaCliente(\'' + esc(c.local).replace(/'/g,"\\'") + '\')">' + ic('wallet') + ' Cuenta</button>' +
        (pedCount > 0 ? '<button class="btn-secondary" style="font-size:12px;padding:7px 12px;border-color:#fed7aa;color:#d97706" onclick="event.stopPropagation();showPage(\'pedidos\',document.getElementById(\'nav-pedidos\'))">' + ic('clipboard') + ' Ver pedidos</button>' : '') +
        '<button class="btn-secondary" style="font-size:12px;padding:7px 12px;border-color:#fecaca;color:#dc2626" onclick="event.stopPropagation();darDeBajaCliente(' + c.num + ',\'' + esc(c.local).replace(/'/g,"\\'") + '\')">' + ic('ban') + ' Dar de baja</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}


function toggleExp(id) { const el = g(id); if (el) el.classList.toggle('open'); }

/* ── VENTAS POR CLIENTE ── */
async function verVentasCliente(num, nombre) {
  // Abrir modal de ventas
  let modal = g('ventas-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ventas-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.innerHTML =
      '<div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">' +
        '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2">' +
          '<div id="ventas-modal-title" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">Historial de ventas</div>' +
          '<button onclick="cerrarVentasModal()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
        '</div>' +
        '<div id="ventas-modal-body" style="padding:1rem 1.2rem"></div>' +
      '</div>';
    modal.addEventListener('click', e => { if (e.target === modal) cerrarVentasModal(); });
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  g('ventas-modal-title').textContent = '' + nombre;
  g('ventas-modal-body').innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">Cargando ventas...</div>';

  try {
    const todos = await sbFetchRemitos('select=*');
    // Buscar remitos por nombre exacto o parecido
    const nomLower = nombre.toLowerCase();
    const remitos = todos.filter(r => r.cliente_nombre && r.cliente_nombre.toLowerCase().includes(nomLower));

    if (!remitos.length) {
      g('ventas-modal-body').innerHTML =
        '<div style="text-align:center;padding:32px;color:var(--muted)">' +
          '<div style="font-size:32px;margin-bottom:10px">' + ic('receipt') + '</div>' +
          '<div style="font-size:14px">No hay remitos registrados para este cliente.</div>' +
          '<div style="font-size:12px;margin-top:6px;opacity:.7">Los remitos se guardan automáticamente al compartirlos.</div>' +
        '</div>';
      return;
    }

    // Totales
    const totalAcum = remitos.reduce((s,r)=>s+(+r.total||0),0);
    const unidAcum  = remitos.reduce((s,r)=>s+(+r.unidades||0),0);
    const fp = n => '$' + n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
    const pagoColor = {'efectivo':'#059669','transferencia':'#2563eb','deuda':'#d97706','sin_definir':'#9c8b88'};
    const pagoBadge = {'efectivo':'' + ic('cash') + ' Efectivo','transferencia':'' + ic('smartphone') + ' Transferencia','deuda':'' + ic('clock') + ' Deuda','sin_definir':'— Sin definir'};

    let html =
      '<div class="ventas-stats">' +
        '<div class="ventas-stat">' +
          '<div class="ventas-stat-label">REMITOS</div>' +
          '<div class="ventas-stat-val" style="color:var(--text)">' + remitos.length + '</div>' +
        '</div>' +
        '<div class="ventas-stat">' +
          '<div class="ventas-stat-label">TOTAL</div>' +
          '<div class="ventas-stat-val" style="color:var(--violet)">' + fp(totalAcum) + '</div>' +
        '</div>' +
        '<div class="ventas-stat">' +
          '<div class="ventas-stat-label">UNIDADES</div>' +
          '<div class="ventas-stat-val" style="color:var(--text)">' + unidAcum + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">';

    remitos.forEach(r => {
      let prods = [];
      try { prods = JSON.parse(r.productos||'[]'); } catch(_) {}
      const prodStr = prods.filter(p=>p.prod).map(p => esc(p.prod) + ' ×' + p.cant).join(', ');
      const color = pagoColor[r.pago] || '#9c8b88';
      const badge = pagoBadge[r.pago] || r.pago;
      html +=
        '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;position:relative;overflow:hidden">' +
          '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--grad-h)"></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:6px">' +
            '<span style="font-size:13px;font-weight:600;color:var(--text)">' + esc(r.fecha||'') + '</span>' +
            '<span style="font-size:12px;font-weight:700;color:' + color + '">' + badge + '</span>' +
          '</div>' +
          '<div style="font-size:1.25rem;font-weight:700;font-family:Montserrat,sans-serif;color:var(--violet);margin-bottom:4px">' + fp(+r.total||0) + '</div>' +
          (prodStr ? '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + prodStr + '</div>' : '') +
          (r.unidades ? '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + r.unidades + ' unidades</div>' : '') +
        '</div>';
    });

    html += '</div>';
    g('ventas-modal-body').innerHTML = html;
  } catch(e) {
    g('ventas-modal-body').innerHTML = '<div style="font-size:13px;color:#d97706;padding:1rem">' + ic('alert') + ' Error al cargar ventas: ' + esc(e.message) + '</div>';
  }
}

function cerrarVentasModal() {
  const modal = g('ventas-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}
async function eliminarCliente(num) {
  if (!confirm('¿Eliminar este cliente?')) return;
  loading(true);
  try {
    await sbDelete(num); _cache = null;
    await actualizarCounter(); await renderLista(); actualizarBadgeIncompletos();
    const cl = await cargarDB(); g('export-bar').style.display = cl.length ? '' : 'none';
    toast('Cliente eliminado');
  } catch(e) { toast('Error: ' + e.message); } finally { loading(false); }
}

async function darDeBajaCliente(num, nombre) {
  if (!confirm('¿Dar de baja a ' + nombre + '? Se moverá a clientes inactivos y no aparecerá en la lista principal.')) return;
  loading(true);
  try {
    await sbUpdate(num, { activo: false }); _cache = null;
    await actualizarCounter(); await renderLista(); actualizarBadgeIncompletos();
    toast('🚫 ' + nombre + ' dado de baja');
  } catch(e) { toast('Error: ' + e.message); } finally { loading(false); }
}

async function reactivarCliente(num, nombre) {
  if (!confirm('¿Reactivar a ' + nombre + '?')) return;
  loading(true);
  try {
    await sbUpdate(num, { activo: true }); _cache = null;
    toast('✓ ' + nombre + ' reactivado');
    verClientesInactivos(); // refrescar la lista de inactivos
  } catch(e) { toast('Error: ' + e.message); } finally { loading(false); }
}

async function verClientesInactivos() {
  let modal = g('inactivos-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'inactivos-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal) modal.style.display='none'; document.body.style.overflow=''; });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('ban') + ' Clientes inactivos</div>'+
        '<button onclick="document.getElementById(\'inactivos-modal\').style.display=\'none\';document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div id="inactivos-body" style="padding:1rem 1.2rem"><div style="font-size:13px;color:var(--muted)">Cargando...</div></div>'+
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const [todos, remitos] = await Promise.all([
      cargarDB(true),
      sbFetch('remitos?select=cliente_nombre,total,pago')
    ]);
    const inactivos = todos.filter(c => c.activo === false);
    const body = document.getElementById('inactivos-body');
    if (!inactivos.length) {
      body.innerHTML = '<div style="text-align:center;padding:2rem"><div style="font-size:32px;margin-bottom:10px">' + ic('check') + '</div><div style="font-size:14px;color:var(--muted)">No hay clientes inactivos</div></div>';
      return;
    }

    const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

    // Calcular deuda por cliente (remitos con pago = 'deuda')
    const deudaPor = {};
    remitos.filter(r => r.pago === 'deuda').forEach(r => {
      const k = r.cliente_nombre;
      if (k) deudaPor[k] = (deudaPor[k]||0) + (+r.total||0);
    });

    const conDeuda  = inactivos.filter(c => deudaPor[c.local] > 0);
    const sinDeuda  = inactivos.filter(c => !deudaPor[c.local]);
    const totalDeudaInactivos = conDeuda.reduce((s,c) => s + (deudaPor[c.local]||0), 0);

    const renderCard = c => {
      const deuda = deudaPor[c.local] || 0;
      return '<div style="background:var(--surface);border:1px solid '+(deuda>0?'#fecaca':'var(--border)')+';border-radius:var(--radius);margin-bottom:8px;overflow:hidden">'+
        '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px">'+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:13px;font-weight:600;color:var(--text)">'+esc(c.num_str||'')+' '+esc(c.local||'')+'</div>'+
            '<div style="font-size:11px;color:var(--muted)">'+[c.rubro,c.loc].filter(Boolean).map(esc).join(' · ')+'</div>'+
          '</div>'+
          (deuda > 0
            ? '<div style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:#dc2626;flex-shrink:0">'+fp(deuda)+'<div style="font-size:9px;font-weight:400;color:#dc2626;text-align:right">deuda</div></div>'
            : '<div style="font-size:11px;color:#059669;font-weight:600;flex-shrink:0">' + ic('check') + ' Sin deuda</div>'
          )+
          '<button onclick="reactivarCliente('+c.num+',\''+esc(c.local).replace(/'/g,"\\'")+'\')" '+
            'style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0">'+
            '' + ic('check') + ' Reactivar</button>'+
        '</div>'+
      '</div>';
    };

    body.innerHTML =
      // Resumen
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">'+
        '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;text-align:center">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Total inactivos</div>'+
          '<div style="font-size:22px;font-weight:700;color:var(--text)">'+inactivos.length+'</div>'+
        '</div>'+
        '<div style="background:#fff1f1;border:1px solid #fecaca;border-radius:var(--radius);padding:10px 12px;text-align:center">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626">Con deuda</div>'+
          '<div style="font-size:22px;font-weight:700;color:#dc2626">'+conDeuda.length+'</div>'+
        '</div>'+
        '<div style="background:#fff1f1;border:1px solid #fecaca;border-radius:var(--radius);padding:10px 12px;text-align:center">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626">Deuda total</div>'+
          '<div style="font-size:16px;font-weight:700;color:#dc2626">'+fp(totalDeudaInactivos)+'</div>'+
        '</div>'+
      '</div>'+
      // Con deuda primero
      (conDeuda.length ? '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#dc2626;margin-bottom:6px">' + ic('alert') + ' Con deuda pendiente</div>'+conDeuda.map(renderCard).join('') : '')+
      (sinDeuda.length ? '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-top:12px;margin-bottom:6px">Sin deuda</div>'+sinDeuda.map(renderCard).join('') : '');

  } catch(e) {
    const body = document.getElementById('inactivos-body');
    if (body) body.innerHTML = '<div style="color:#dc2626;font-size:13px">Error: '+esc(e.message)+'</div>';
  }
}

/* ── EDICIÓN MODAL ── */
async function abrirEdicion(num) {
  const todos = await cargarDB(); const c = todos.find(x => x.num === num); if (!c) return;
  const ruta = parseRuta(c.ruta);
  const lv = (ruta.horarios || []).find(h => h.periodo === 'Lun a Vier') || { manana: {}, tarde: {} };
  g('m-num').value    = c.num;
  g('m-numStr').value = c.num_str || '';
  g('m-local').value  = c.local || '';
  g('m-duenio').value = c.duenio || '';
  g('m-cuit').value   = c.cuit || '';
  const mdt = document.getElementById('m-doc-tipo');
  if (mdt) { mdt.value = c.doc_tipo || 'CUIT'; onDocTipoChange('m'); g('m-cuit').value = c.cuit || ''; }
  const mr = document.getElementById('m-regimen'); if (mr) mr.value = c.regimen || '';
  g('m-tel').value    = c.tel  || '';
  const mtel2 = g('m-tel2'); if (mtel2) mtel2.value = c.tel2 || '';
  g('m-dir').value    = c.dir || '';
  g('m-loc').value    = c.loc || '';
  g('m-orden').value  = ruta.orden || '';
  g('m-notas').value  = ruta.notas || '';
  g('m-lv-map').value = lv.manana.ap || '';
  g('m-lv-mci').value = lv.manana.ci || '';
  g('m-lv-tap').value = lv.tarde.ap || '';
  g('m-lv-tci').value = lv.tarde.ci || '';
  const mp = g('m-probador'); if (mp) mp.checked = !!c.probador_cremas;
  document.querySelectorAll('#m-rubros-wrap .rubro-chip').forEach(b => b.classList.remove('selected'));
  g('m-rubro-custom-wrap').classList.remove('visible');
  const FIJOS = ['Farmacia','Peluquería','Perfumería','Química','Almacén','Kiosco','Supermercado'];
  if (FIJOS.includes(c.rubro)) {
    mRubroSel = c.rubro;
    document.querySelectorAll('#m-rubros-wrap .rubro-chip').forEach(b => { if (b.textContent.includes(c.rubro)) b.classList.add('selected'); });
  } else if (c.rubro) {
    mRubroSel = '__custom__';
    document.querySelectorAll('#m-rubros-wrap .rubro-chip').forEach(b => { if (b.textContent.includes('Otro')) b.classList.add('selected'); });
    g('m-rubro-custom-wrap').classList.add('visible'); g('m-rubro-custom').value = c.rubro;
  } else mRubroSel = '';
  g('edit-modal').classList.add('open'); document.body.style.overflow = 'hidden';
}
function cerrarModal() { g('edit-modal').classList.remove('open'); document.body.style.overflow = ''; }
async function guardarEdicion() {
  const local = rd('m-local'); if (!local) { toast('El nombre del local es obligatorio'); return; }
  const num = parseInt(g('m-num').value);
  const numStr = rd('m-numStr') || ('C-' + String(num).padStart(4, '0'));
  const datos = {
    num_str: numStr, local, rubro: getMRubro(),
    duenio: rd('m-duenio'), cuit: rd('m-cuit'), tel: rd('m-tel'), tel2: rd('m-tel2') || '', dir: rd('m-dir'), loc: rd('m-loc'),
    probador_cremas: g('m-probador') ? g('m-probador').checked : false,
    ruta: JSON.stringify({ horarios: leerHorarios('m'), orden: rd('m-orden'), notas: rd('m-notas') })
  };
  const btn = g('modal-save-btn'); btn.disabled = true; btn.textContent = 'Guardando...'; loading(true);
  try {
    await sbUpdate(num, datos); _cache = null;
    cerrarModal(); await renderLista(); actualizarBadgeIncompletos(); toast('✓ Cliente actualizado');
  } catch(e) { toast('Error: ' + e.message); }
  finally { btn.disabled = false; btn.textContent = 'Guardar cambios'; loading(false); }
}

/* ── INCOMPLETOS ── */
const CAMPOS_REQ = [
  { key: 'rubro',  label: 'Rubro' },
  { key: 'duenio', label: 'Nombre del dueño/a' },
  { key: 'cuit',   label: 'CUIT/DNI' },
  { key: 'tel',    label: 'Teléfono' },
  { key: 'dir',    label: 'Dirección' },
  { key: 'loc',    label: 'Localidad' }
];
function camposFaltantes(c) {
  const f = CAMPOS_REQ.filter(x => !c[x.key] || !c[x.key].toString().trim()).map(x => x.label);
  const ruta = parseRuta(c.ruta);
  if (!ruta.orden) f.push('N° orden en ruta');
  const lv = (ruta.horarios || []).find(h => h.periodo === 'Lun a Vier');
  if (!lv || (!lv.manana.ap && !lv.tarde.ap)) f.push('Horarios Lun a Vier');
  return f;
}
async function renderIncompletos() {
  loading(true); const todos = await cargarDB(); loading(false);
  const con = todos.map(c => ({ c, f: camposFaltantes(c) })).filter(x => x.f.length > 0);
  const el = g('incompletos-list');
  if (!con.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">' + ic('check') + '</div><p>¡Todos los clientes tienen sus datos completos!</p></div>';
    return;
  }
  el.innerHTML = con.map(({ c, f }) =>
    '<div class="inc-card">' +
      '<div class="inc-header">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
          '<span class="inc-num">' + esc(c.num_str || '') + '</span>' +
          '<span class="inc-name">' + esc(c.local) + '</span>' +
        '</div>' +
        '<button class="inc-edit-btn" onclick="abrirEdicion(' + c.num + ')">Completar ' + ic('edit') + '</button>' +
      '</div>' +
      '<div class="inc-summary">Le faltan <strong>' + f.length + '</strong> dato' + (f.length === 1 ? '' : 's') + ' — recordá pedirle' + (f.length === 1 ? ' este dato' : ' estos datos') + ' en tu próxima visita:</div>' +
      '<div class="inc-fields">' + f.map(x => '<span class="inc-field-tag">' + esc(x) + '</span>').join('') + '</div>' +
    '</div>'
  ).join('');
}
async function actualizarBadgeIncompletos() {
  try {
    const todos = await cargarDB();
    const n = todos.filter(c => camposFaltantes(c).length > 0).length;
    // Update clientes tab button with incomplete count
    const clientesBtn = document.querySelector('.tab[onclick*="clientes"]');
    if (clientesBtn) {
      clientesBtn.innerHTML = '' + ic('users') + ' Clientes' + (n > 0 ? ' <span class="inc-counter">' + n + '</span>' : '');
    }
  } catch(e) {
    // silently fail
  }
}

/* ── CONTADOR ── */
async function actualizarCounter() {
  g('counter-badge').textContent = 'Conectando...';
  try {
    const cl = await cargarDB();
    const n = cl.length;
    g('counter-badge').textContent = n === 1 ? '1 cliente' : n + ' clientes';
    // Badge sidebar y topbar
    const badge = document.getElementById('nav-badge-clientes');
    if (badge) { badge.textContent = n; badge.style.display = n ? '' : 'none'; }
    const tc = document.getElementById('topbar-counter');
    if (tc) tc.textContent = n ? n + ' clientes' : '';
    if (n > 0) {
      const mx = Math.max(...cl.map(c => c.num || 0));
      if (mx > parseInt(localStorage.getItem(NUM_KEY) || '0')) {
        localStorage.setItem(NUM_KEY, String(mx));
        actualizarPreview();
      }
    }
  } catch(e) {
    g('counter-badge').textContent = 'Sin conexión';
  }
}

/* ── EXPORTAR ── */
async function exportarCSV() {
  const cl = await cargarDB(); if (!cl.length) { toast('No hay clientes'); return; }
  const h = ['N° Cliente','Local','Rubro','Dueño/a','Tipo Doc','CUIT/DNI','Régimen','Teléfono','Dirección','Localidad','Probador Cremas','Horarios','Orden Ruta','Notas Ruta','Fecha'];
  const rows = cl.map(c => {
    const r = parseRuta(c.ruta), lv = (r.horarios || []).find(h => h.periodo === 'Lun a Vier');
    let hs = '';
    if (lv) { const man = lv.manana.ap ? lv.manana.ap + '-' + lv.manana.ci : ''; const tar = lv.tarde.ap ? lv.tarde.ap + '-' + lv.tarde.ci : ''; hs = [man, tar].filter(Boolean).join(' / '); }
    return [c.num_str, c.local, c.rubro, c.duenio, c.doc_tipo||'CUIT', c.cuit, c.regimen||'', c.tel, c.dir, c.loc, c.probador_cremas ? 'Sí' : 'No', hs, r.orden, r.notas, c.fecha].map(v => '"' + String(v || '').replace(/"/g, '""') + '"');
  });
  dl(new Blob(['\uFEFF' + [h.join(','), ...rows.map(r => r.join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' }), 'intencional_clientes.csv');
  toast('CSV descargado');
}
async function exportarJSON() {
  const cl = await cargarDB(); if (!cl.length) { toast('No hay clientes'); return; }
  dl(new Blob([JSON.stringify(cl, null, 2)], { type: 'application/json' }), 'intencional_clientes.json');
  toast('JSON descargado');
}
async function importarCSV(input) {
  const file = input.files[0]; if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  // skip header row
  const dataLines = lines.slice(1);
  if (!dataLines.length) { toast('El archivo está vacío'); return; }

  function parseCSVRow(row) {
    const vals = []; let cur = '', inQ = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    return vals.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
  }

  let ok = 0, fail = 0;
  loading(true);
  for (const line of dataLines) {
    const v = parseCSVRow(line);
    // columns: num_str,local,rubro,duenio,cuit,tel,dir,loc,probador,horarios,orden,notas,fecha
    if (!v[1]) continue;
    const num = incrementarNum();
    const cliente = {
      num,
      num_str: v[0] || numFmt(num),
      local: v[1] || '',
      rubro: v[2] || '',
      duenio: v[3] || '',
      cuit: v[4] || '',
      tel: v[5] || '',
      dir: v[6] || '',
      loc: v[7] || '',
      probador_cremas: (v[8] || '').toLowerCase() === 'sí' || (v[8] || '').toLowerCase() === 'si',
      ruta: JSON.stringify({ orden: v[10] || '', notas: v[11] || '', horarios: [] }),
      fecha: v[12] || new Date().toLocaleDateString('es-AR')
    };
    try { await sbInsert(cliente); ok++; }
    catch(e) { console.warn('Error importando fila:', e); fail++; localStorage.setItem(NUM_KEY, String(num-1)); }
  }
  loading(false);
  _cache = null;
  await actualizarCounter();
  actualizarBadgeIncompletos();
  input.value = '';
  toast('✓ Importados: ' + ok + (fail ? ' | Errores: ' + fail : ''));
  // switch to lista tab
  const listaBtn = document.querySelector('.tab:nth-child(2)');
  if (listaBtn) await showTab('lista', listaBtn);
}

function dl(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── IMPORTAR CLIENTES DESDE ARCHIVO ── */
async function importarArchivo(input) {
  const file = input.files[0]; if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  const btn = g('import-btn'); btn.disabled = true; btn.textContent = 'Importando...';
  try {
    let clientes = [];
    if (ext === 'json') {
      const txt = await file.text();
      clientes = JSON.parse(txt);
      if (!Array.isArray(clientes)) throw new Error('El JSON no es una lista de clientes');
    } else if (ext === 'csv') {
      const txt = await file.text();
      const rows = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
      const headers = rows[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const col = k => headers.findIndex(h => h.toLowerCase().includes(k));
      const iNum = col('n'), iLocal = col('local'), iRubro = col('rubro');
      const iDuenio = col('due'), iCuit = col('cuit'), iTel = col('tel');
      const iDir = col('direcc'), iLoc = col('localidad');
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].match(/("(?:[^"]|"")*"|[^,]*)/g).map(c => c.replace(/^"|"$/g,'').replace(/""/g,'"').trim());
        const local = iLocal >= 0 ? cols[iLocal] : '';
        if (!local) continue;
        clientes.push({
          num_str: iNum >= 0 ? cols[iNum] : '',
          local,
          rubro:  iRubro  >= 0 ? cols[iRubro]  : '',
          duenio: iDuenio >= 0 ? cols[iDuenio] : '',
          cuit:   iCuit   >= 0 ? cols[iCuit]   : '',
          tel:    iTel    >= 0 ? cols[iTel]     : '',
          dir:    iDir    >= 0 ? cols[iDir]     : '',
          loc:    iLoc    >= 0 ? cols[iLoc]     : '',
          fecha:  new Date().toLocaleDateString('es-AR')
        });
      }
    } else {
      throw new Error('Formato no soportado. Usá JSON o CSV.');
    }
    if (!clientes.length) throw new Error('No se encontraron clientes en el archivo');
    const existing = await cargarDB();
    let maxNum = existing.length > 0 ? Math.max(...existing.map(c => c.num || 0)) : 0;
    let ok = 0, err = 0;
    for (const c of clientes) {
      maxNum++;
      const row = {
        num: maxNum,
        num_str: c.num_str || numFmt(maxNum),
        fecha: c.fecha || new Date().toLocaleDateString('es-AR'),
        local: c.local, rubro: c.rubro || '', duenio: c.duenio || '',
        cuit: c.cuit || '', tel: c.tel || '', dir: c.dir || '', loc: c.loc || '',
        probador_cremas: c.probador_cremas || false,
        ruta: typeof c.ruta === 'string' ? c.ruta : JSON.stringify(c.ruta || {})
      };
      try { await sbInsert(row); ok++; } catch(_) { err++; }
    }
    localStorage.setItem(NUM_KEY, String(maxNum));
    _cache = null;
    await actualizarCounter();
    actualizarPreview();
    actualizarBadgeIncompletos();
    toast('Importados ' + ok + ' clientes' + (err > 0 ? ' (' + err + ' con error)' : ''));
  } catch(e) {
    toast('Error al importar: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Cargar lista';
    input.value = '';
  }
}




/* ══ REMITO JS ══ */
const PRODUCTS = ['Esmalte en Gel','Crema de Ordeñe']; // fallback — se sobreescribe dinámicamente
let rows = [];
let aliasActivo = 0;

/* ---- FECHA dd/mm/aa ---- */
function todayStr(){
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  return dd+'/'+mm+'/'+yy;
}
const _fFecha = document.getElementById('f-fecha'); if(_fFecha) _fFecha.value = todayStr();
(document.getElementById('f-fecha')||{addEventListener:()=>{}}).addEventListener('input', function(){
  let v = this.value.replace(/\D/g,'');
  if(v.length > 2) v = v.slice(0,2)+'/'+v.slice(2);
  if(v.length > 5) v = v.slice(0,5)+'/'+v.slice(5,7);
  this.value = v;
});

/* ---- FORMATO ---- */
function fmt(n){
  return n.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ---- FILAS ---- */
function autocompletarPrecioRemito(idx, nombreProd) {
  // BUG FIX: siempre renderizar al final, aunque no se encuentre precio.
  // Antes, si el producto no resolvía precio, la fila quedaba en `rows`
  // sin renderizar (input invisible) y el próximo addRow mostraba las dos juntas.
  if (nombreProd && rows[idx]) {
    // 1. Buscar precio en stock por nombre exacto
    const item = (_stockCache||[]).find(s => s.nombre === nombreProd && +s.precio > 0);
    if (item) {
      rows[idx].precio = +item.precio;
    } else {
      // 2. Fallback: precio de la categoría del producto
      const cat = STOCK_CATS.find(c => {
        const itemsDeEsaCat = (_stockCache||[]).filter(s => s.categoria === c.id);
        return itemsDeEsaCat.some(s => s.nombre === nombreProd);
      });
      if (cat && +cat.precio > 0) {
        rows[idx].precio = +cat.precio;
      } else {
        // 3. Fallback: precio de categoría por nombre del producto
        const catPorNombre = STOCK_CATS.find(c => c.label === nombreProd || c.id === nombreProd.toLowerCase());
        if (catPorNombre && +catPorNombre.precio > 0) rows[idx].precio = +catPorNombre.precio;
      }
    }
  }
  renderRows();
}

function addRow(prod='',cant=1,precio='',manual=false){
  rows.push({prod,cant,precio,manual});
  // Si hay producto y no precio, intentar autocompletar desde stock
  const idx = rows.length - 1;
  if (prod && (precio==='' || precio===0 || precio==='0') && !manual) {
    autocompletarPrecioRemito(idx, prod);
  } else {
    renderRows();
  }
}
function removeRow(i){
  rows.splice(i,1);
  renderRows();
}
function toggleManual(i){
  rows[i].manual = !rows[i].manual;
  if(!rows[i].manual) rows[i].prod='';
  renderRows();
}

function renderRows(){
  const tbody = document.getElementById('productos-body');
  tbody.innerHTML='';
  rows.forEach((r,i)=>{
    const tr = document.createElement('tr');

    /* Celda producto */
    const tdProd = document.createElement('td');
    tdProd.className='td-prod col-prod';
    if(r.manual){
      tdProd.innerHTML=`<div class="prod-wrap">
        <input class="prod-input" type="text" placeholder="Escribí el producto" value="${esc(r.prod)}"
          autocapitalize="words" autocorrect="off"
          oninput="rows[${i}].prod=this.value;calcTotal()"/>
        <button class="edit-btn" onclick="toggleManual(${i})" title="Usar lista">${ic('menu')}</button>
      </div>`;
    }else{
      const prodList = getProductsParaRemito();
      const opts = prodList.map(p=>`<option${r.prod.toLowerCase()===p.toLowerCase()?' selected':''}>${p}</option>`).join('');
      tdProd.innerHTML=`<div class="prod-wrap">
        <select class="prod-select" onchange="rows[${i}].prod=this.value;autocompletarPrecioRemito(${i},this.value);calcTotal()">
          <option value="">— seleccionar —</option>
          ${opts}
        </select>
        <button class="edit-btn" onclick="toggleManual(${i})" title="Escribir a mano">${ic('edit')}</button>
      </div>`;
    }

    /* Celda cantidad */
    const tdCant = document.createElement('td');
    tdCant.className='td-cant col-cant';
    tdCant.innerHTML=`<input class="cant-input" type="number" min="1" value="${r.cant}"
      onchange="rows[${i}].cant=Math.max(1,+this.value);calcTotal()"/>`;

    /* Celda precio */
    const tdPrecio = document.createElement('td');
    tdPrecio.className='td-precio col-precio';
    tdPrecio.innerHTML=`<input class="precio-input" type="number" min="0" step="0.01"
      value="${r.precio}" placeholder="0"
      onchange="rows[${i}].precio=+this.value;calcTotal()" inputmode="decimal"/>`;

    /* Celda subtotal */
    const tdSub = document.createElement('td');
    tdSub.className='td-sub col-sub';
    tdSub.id='sub-'+i;
    tdSub.textContent=fmt(r.cant*(+r.precio||0));

    /* Celda eliminar */
    const tdDel = document.createElement('td');
    tdDel.className='td-del col-del';
    tdDel.innerHTML=`<button class="remove-btn" onclick="removeRow(${i})">×</button>`;

    tr.appendChild(tdProd);
    tr.appendChild(tdCant);
    tr.appendChild(tdPrecio);
    tr.appendChild(tdSub);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
  calcTotal();
}

function calcTotal(){
  const total = rows.reduce((s,r)=>s+(r.cant*(+r.precio||0)),0);
  document.getElementById('total-val').textContent='$'+fmt(total);
  rows.forEach((_,i)=>{
    const el=document.getElementById('sub-'+i);
    if(el) el.textContent=fmt(rows[i].cant*(+rows[i].precio||0));
  });
}

/* ---- ALIAS / PAGO ---- */
function setAlias(btn,num){
  document.querySelectorAll('.alias-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  aliasActivo=num;
  // alias-wrap eliminado — se configura desde el dashboard
  updateDeudaMsg();
}

/* ── Actualizar texto de los botones de alias con el nombre real ── */
function actualizarBotonesAlias() {
  const v1 = (document.getElementById('alias1-val')?.value || '').trim();
  const v2 = (document.getElementById('alias2-val')?.value || '').trim();
  const btn1 = document.getElementById('alias-btn-1');
  const btn2 = document.getElementById('alias-btn-2');
  if (btn1) { btn1.textContent = v1 || 'Alias 1'; btn1.style.display = v1 ? '' : 'none'; }
  if (btn2) { btn2.textContent = v2 || 'Alias 2'; btn2.style.display = v2 ? '' : 'none'; }
  // Mostrar sección solo si hay alias configurado Y el pago es transferencia o deuda
  const sec = document.getElementById('alias-section');
  if (sec) {
    const pagoActivo = [...document.querySelectorAll('.pago-btn')].find(b =>
      b.classList.contains('active-transferencia') || b.classList.contains('active-deuda')
    );
    sec.style.display = ((v1 || v2) && pagoActivo) ? '' : 'none';
  }
}
function updateDeudaMsg(){
  const val = aliasActivo===1
    ? document.getElementById('alias1-val').value.trim()
    : aliasActivo===2
      ? document.getElementById('alias2-val').value.trim()
      : '';
  const t = val||'[alias no seleccionado]';
  // Usar mensaje configurado o el default
  const msgTemplate = leerMsgDeudaConfig() ||
    '' + ic('alert') + ' Pago pendiente — Por favor realizá la transferencia dentro de las <strong>72 horas (3 días)</strong> al alias <strong>{alias}</strong> y enviá el comprobante al <strong>11-7904-7745</strong>. Pasado ese plazo el pedido puede ser cancelado.';
  const msgFinal = msgTemplate.replace(/\{alias\}/g, `<strong>${t}</strong>`);
  document.getElementById('deuda-msg').innerHTML = msgFinal;
}
var _pago2Activo = null;
var _alias2Activo = 0;

function toggleSegundoPago(btn) {
  const wrap = document.getElementById('segundo-pago-wrap');
  if (!wrap) return;
  const visible = wrap.style.display !== 'none';
  wrap.style.display = visible ? 'none' : '';
  btn.textContent = visible ? '+ Agregar segundo medio de pago' : '— Quitar segundo pago';
  if (visible) {
    _pago2Activo = null;
    document.querySelectorAll('.pago-btn2').forEach(b => {
      b.style.background = '#fff'; b.style.color = '#b099a8'; b.style.borderColor = '#ead8e4';
    });
    const mEl = document.getElementById('pago2-monto'); if (mEl) mEl.value = '';
  }
}

function setPago2(btn, tipo) {
  _pago2Activo = tipo;
  document.querySelectorAll('.pago-btn2').forEach(b => {
    b.style.background = '#fff'; b.style.color = '#b099a8'; b.style.borderColor = '#ead8e4';
  });
  const colors = {
    efectivo:       { bg:'#f0fdf4', color:'#059669', border:'#059669' },
    transferencia:  { bg:'#eff6ff', color:'#2563eb', border:'#2563eb' },
    deuda:          { bg:'#fff7ed', color:'#d97706', border:'#d97706' }
  };
  const c = colors[tipo] || colors.efectivo;
  btn.style.background = c.bg; btn.style.color = c.color; btn.style.borderColor = c.border;
  // Mostrar alias si es transferencia
  const aliasWrap = document.getElementById('pago2-alias-wrap');
  if (aliasWrap) {
    if (tipo === 'transferencia') {
      aliasWrap.style.display = '';
      const cfg = typeof leerAliasConfig === 'function' ? leerAliasConfig() : {};
      const ab1 = document.getElementById('alias-btn2-1');
      const ab2 = document.getElementById('alias-btn2-2');
      if (ab1) { ab1.textContent = cfg.alias1 || 'Alias 1'; ab1.style.display = cfg.alias1 ? '' : 'none'; }
      if (ab2) { ab2.textContent = cfg.alias2 || 'Alias 2'; ab2.style.display = cfg.alias2 ? '' : 'none'; }
    } else {
      aliasWrap.style.display = 'none';
      _alias2Activo = 0;
      document.querySelectorAll('.pago2-alias-btn').forEach(b => b.classList.remove('active'));
    }
  }
}

function setAlias2(btn, num) {
  document.querySelectorAll('.pago2-alias-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _alias2Activo = num;
}

function getSegundoPago() {
  const wrap = document.getElementById('segundo-pago-wrap');
  if (!wrap || wrap.style.display === 'none') return null;
  if (!_pago2Activo) return null;
  const monto = parseFloat(document.getElementById('pago2-monto')?.value || '0') || 0;
  if (monto <= 0 && _pago2Activo !== 'deuda') return null;
  const a1val = document.getElementById('alias1-val')?.value || '';
  const a2val = document.getElementById('alias2-val')?.value || '';
  const aliasVal = _alias2Activo === 1 ? a1val : _alias2Activo === 2 ? a2val : '';
  return { tipo: _pago2Activo, monto, alias: aliasVal || null };
}

function setPago(btn,cls){
  document.querySelectorAll('.pago-btn').forEach(b=>b.className='pago-btn'); const _as=document.getElementById('alias-section'); if(_as) _as.style.display='none';
  btn.classList.add(cls);
  const isDeuda = cls==='active-deuda';
  const isTransODeuda = cls==='active-transferencia' || cls==='active-deuda';
  document.getElementById('deuda-aviso').classList.toggle('visible',isDeuda);
  if(isDeuda) updateDeudaMsg();
  // Mostrar alias solo con transferencia o deuda
  const aliasSec = document.getElementById('alias-section');
  if (aliasSec) {
    const tieneAlias = (document.getElementById('alias1-val')?.value||'').trim() ||
                       (document.getElementById('alias2-val')?.value||'').trim();
    aliasSec.style.display = (isTransODeuda && tieneAlias) ? '' : 'none';
  }
}

/* ---- COMPARTIR ---- */
async function compartirRemito(){
  // Validar método de pago
  let pago = '';
  document.querySelectorAll('.pago-btn').forEach(b => {
    if (b.classList.contains('active-efectivo'))      pago = 'efectivo';
    if (b.classList.contains('active-transferencia')) pago = 'transferencia';
    if (b.classList.contains('active-deuda'))         pago = 'deuda';
  });
  if (!pago) {
    toast('⚠️ Seleccioná un método de pago antes de compartir');
    const pagoSection = document.querySelector('.pago-btn')?.closest('div');
    if (pagoSection) {
      pagoSection.style.outline = '2px solid #dc2626';
      pagoSection.style.borderRadius = '8px';
      setTimeout(() => { pagoSection.style.outline = ''; }, 2500);
    }
    return;
  }

  // Validar alias si el pago es transferencia o deuda
  if (pago === 'transferencia' || pago === 'deuda') {
    if (!aliasActivo || aliasActivo === 0) {
      toast('⚠️ Seleccioná un alias de transferencia antes de confirmar');
      const aliasSec = document.getElementById('alias-section');
      if (aliasSec) {
        aliasSec.style.outline = '2px solid #dc2626';
        aliasSec.style.borderRadius = '8px';
        setTimeout(() => { aliasSec.style.outline = ''; }, 2500);
      }
      return;
    }
  }

  // Validar nombre del local
  const nombreVal = (document.getElementById('f-nombre') || {}).value?.trim() || '';
  if (!nombreVal) {
    toast('⚠️ Completá el nombre del local antes de confirmar');
    const nomEl = document.getElementById('f-nombre');
    if (nomEl) {
      nomEl.style.borderBottomColor = '#dc2626';
      nomEl.focus();
      setTimeout(() => { nomEl.style.borderBottomColor = ''; }, 2500);
    }
    return;
  }

  // Validar localidad
  const locVal = (document.getElementById('f-loc') || {}).value?.trim() || '';
  if (!locVal) {
    toast('⚠️ Completá la localidad antes de confirmar');
    const locEl = document.getElementById('f-loc');
    if (locEl) {
      locEl.style.borderBottomColor = '#dc2626';
      locEl.focus();
      setTimeout(() => { locEl.style.borderBottomColor = ''; }, 2500);
    }
    return;
  }

  // Validar que haya al menos un producto seleccionado
  const hayProducto = rows.some(r => r.prod && r.prod.trim() !== '');
  if (!hayProducto) {
    toast('⚠️ Agregá al menos un producto antes de confirmar');
    const prodSection = document.querySelector('.productos-section, #productos-body')?.closest('div');
    if (prodSection) {
      prodSection.style.outline = '2px solid #dc2626';
      prodSection.style.borderRadius = '8px';
      setTimeout(() => { prodSection.style.outline = ''; }, 2500);
    }
    return;
  }

  const card = document.getElementById('remito-card');
  if (!card) { alert('No se pudo encontrar el remito.'); return; }

  const aliasSec  = document.getElementById('alias-section');
  const btnGroup  = card.querySelector('.btn-group');
  const searchBar = document.getElementById('r-cs-badge');

  if (aliasSec)  aliasSec.style.display  = 'none';
  if (btnGroup)  btnGroup.style.display  = 'none';
  if (searchBar) searchBar.style.display = 'none';

  const spinner = document.createElement('div');
  spinner.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,.95);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px';
  spinner.innerHTML = '<div style="width:40px;height:40px;border:3px solid #f0d6e8;border-top-color:#d6539a;border-radius:50%;animation:spin .8s linear infinite"></div><div style="font-size:14px;color:#b06090;font-family:Inter,sans-serif;font-weight:500">Generando imagen...</div>';
  document.body.appendChild(spinner);
  if (!document.getElementById('spin-style')) {
    const st = document.createElement('style'); st.id='spin-style';
    st.textContent='@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }

  const cleanup = () => {
    spinner.remove();
    if (aliasSec)  aliasSec.style.display  = '';
    if (btnGroup)  btnGroup.style.display  = '';
    if (searchBar) searchBar.style.display = '';
  };

  // Guardar en DB
  let guardadoOk = false;
  try {
    await guardarRemitoEnDB();
    guardadoOk = true;
  } catch(e) {
    console.warn('Error guardando remito:', e.message);
  }

  try {
    await new Promise(r => setTimeout(r, 200));

    const canvas = await capturarRemitoCard(card);

    const nombre = (document.getElementById('f-nombre') || {}).value || 'remito';
    const fecha  = (document.getElementById('f-fecha')  || {}).value || todayStr();
    const fileName = 'intencional_' + nombre.trim().replace(/\s+/g,'_') + '_' + fecha.replace(/\//g,'-') + '.png';

    const telClienteObj = window._clienteRemitoActual;
    const telFuente = (telClienteObj && telClienteObj.tel)
      ? telClienteObj.tel
      : ((document.getElementById('f-tel') || {}).value || '');
    const telLimpio = telFuente.trim().replace(/[\s\-\.\(\)]/g, '');
    const telWA = telLimpio
      ? (telLimpio.startsWith('+') ? telLimpio.replace('+','')
        : '549' + (telLimpio.startsWith('0') ? telLimpio.slice(1) : telLimpio))
      : '';

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    const fileImg = new File([blob], fileName, { type: 'image/png' });

    cleanup();

    // ── Mostrar modal de confirmación con opción de compartir
    const confirmEl = document.createElement('div');
    confirmEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    confirmEl.innerHTML = `
      <div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 32px;box-shadow:0 -4px 32px rgba(0,0,0,.15)">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:40px;margin-bottom:10px">${ic('check')}</div>
          <div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:#1e1a1a;margin-bottom:6px">REMITO GUARDADO</div>
          <div style="font-size:13px;color:#9c8b88">${guardadoOk ? 'El remito fue guardado correctamente.' : 'El remito fue procesado.'}</div>
        </div>
        <button id="btn-compartir-ahora" style="width:100%;background:#059669;color:#fff;border:none;border-radius:12px;padding:16px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">${ic('smartphone')} Compartir remito</button>
        <button id="btn-cerrar-confirm" style="width:100%;background:#f5f0f0;color:#9c8b88;border:none;border-radius:12px;padding:14px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;text-transform:uppercase;letter-spacing:.5px">Volver al inicio</button>
      </div>`;
    document.body.appendChild(confirmEl);

    const hacerLimpieza = () => {
      // Navegar al dashboard PRIMERO, antes de cualquier otra cosa
      showPage('inicio', document.getElementById('nav-inicio'));
      // Limpiar datos en segundo plano
      try {
        limpiarClienteRemito(); // BUG FIX: antes llamaba a limpiarClienteCargado() (inexistente) y cortaba toda la limpieza
        ['f-nombre','f-dir','f-loc','f-tel'].forEach(id => {
          const el = document.getElementById(id); if(el) el.value='';
        });
        ['f-nombre-clear','f-dir-clear','f-loc-clear','f-tel-clear'].forEach(id => {
          const btn = document.getElementById(id); if(btn) btn.classList.remove('visible');
        });
        const fechaEl = document.getElementById('f-fecha');
        if (fechaEl) fechaEl.value = todayStr();
        document.querySelectorAll('.notas-input').forEach(el => el.value='');
        document.querySelectorAll('.pago-btn').forEach(b => b.className='pago-btn'); const _as2=document.getElementById('alias-section'); if(_as2) _as2.style.display='none';
        document.querySelectorAll('.alias-btn').forEach(b => b.classList.remove('active'));
        const da  = document.getElementById('deuda-aviso');
        if (da)  da.classList.remove('visible');
        aliasActivo = 0;
        rows = [];
        addRow('Esmalte en Gel', 1, '');
        window._clienteRemitoActual = null;
      } catch(e) { console.warn('limpieza remito:', e.message); }
    };

    document.getElementById('btn-cerrar-confirm').onclick = () => {
      confirmEl.remove();
      hacerLimpieza();
    };

    document.getElementById('btn-compartir-ahora').onclick = async () => {
      confirmEl.remove();
      const nombreCliente = (document.getElementById('f-nombre')||{}).value?.trim() || '';
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [fileImg] })) {
        try {
          await navigator.share({ files: [fileImg], title: getTitleCompartir() });
        } catch(e) {
          if (e.name !== 'AbortError') descargarImagen(canvas.toDataURL('image/png'), fileName);
        }
      } else {
        descargarImagen(canvas.toDataURL('image/png'), fileName);
        if (telWA) {
          const msg = encodeURIComponent(getMsgCompartir(nombreCliente));
          setTimeout(() => window.open('https://wa.me/' + telWA + '?text=' + msg, '_blank'), 400);
        }
      }
      hacerLimpieza();
    };

  } catch(e) {
    alert('No se pudo generar el remito: ' + e.message);
    cleanup();
  }
}



function descargarImagen(url, name) {
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
}
function fallbackDescargar(url, name) { descargarImagen(url, name); }

/* ── HELPER: captura el remito-card correctamente sin offset ── */
async function capturarRemitoCard(card) {
  const cardW = card.offsetWidth;
  const cardH = card.offsetHeight;
  // Clonar el card en un contenedor temporal fuera del flujo normal
  const tmp = document.createElement('div');
  tmp.style.cssText = `position:fixed;top:0;left:0;width:${cardW}px;z-index:-9999;pointer-events:none;overflow:hidden;background:#fff`;
  const clone = card.cloneNode(true);
  clone.style.cssText = `width:${cardW}px;margin:0;border-radius:16px;overflow:hidden;box-shadow:none`;
  tmp.appendChild(clone);
  document.body.appendChild(tmp);

  // Ocultar elementos de UI que no deben aparecer en el comprobante
  const uiSelectors = [
    '.field-clear',       // X de cada campo
    '.edit-btn',          // botón ' + ic('edit') + ' de edición de fila de producto
    '.add-btn',           // + Agregar producto
    '.remove-btn',        // X de fila de producto
    '.pago-btn:not([class*="active"])', // botones de pago no seleccionados
    '#alias-section',     // sección alias
    '.notas-section',     // si existe
    '#segundo-pago-wrap', // controles del segundo pago (queda el desglose)
    '.toggle-seg-pago',   // botón "+ Agregar segundo medio de pago"
  ];
  uiSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
  });

  // Ocultar placeholder de notas visualmente (dejar el input pero sin placeholder visible)
  clone.querySelectorAll('.notas-input').forEach(el => { el.style.color = el.value ? '' : 'transparent'; });

  // Hacer el select de productos no-interactivo y solo texto
  clone.querySelectorAll('.prod-select').forEach(el => {
    el.style.cssText += ';pointer-events:none;appearance:none;-webkit-appearance:none;border:none;background:transparent';
  });

  // Ocultar botones de pago no activos, mostrar solo el activo como badge estático
  clone.querySelectorAll('.pago-btn').forEach(b => {
    const isActive = b.className.includes('active');
    if (!isActive) { b.style.display = 'none'; }
    else { b.style.cursor = 'default'; b.style.pointerEvents = 'none'; }
  });

  await new Promise(r => setTimeout(r, 80));
  try {
    const canvas = await html2canvas(clone, {
      scale: 4,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: cardW,
      height: clone.offsetHeight,
      windowWidth: cardW,
      windowHeight: clone.offsetHeight,
      x: 0,
      y: 0,
    });
    return canvas;
  } finally {
    document.body.removeChild(tmp);
  }
}


/* ---- NUEVO REMITO ---- */
function nuevoRemito(){
  if(!confirm('¿Crear un nuevo remito? Se limpiará el formulario.')) return;
  // BUG FIX: acá se llamaba a limpiarClienteCargado(), que no existe →
  // ReferenceError y la función moría antes de resetear los renglones.
  limpiarClienteRemito();
  ['f-nombre','f-dir','f-loc','f-tel'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-fecha').value=todayStr();
  document.querySelectorAll('.notas-input').forEach(el=>el.value='');
  document.querySelectorAll('.pago-btn').forEach(b=>b.className='pago-btn'); const _as=document.getElementById('alias-section'); if(_as) _as.style.display='none';
  document.querySelectorAll('.alias-btn').forEach(b=>b.classList.remove('active'));
  // alias-wrap eliminado
  document.getElementById('deuda-aviso').classList.remove('visible');
  aliasActivo=0;
  rows=[];
  addRow('Esmalte en Gel');
  addRow('Crema de Ordeñe');
}

/* ── BORRAR TODOS LOS RENGLONES ── */
function limpiarTodoRemito(){
  if(rows.length === 0){ toast('No hay renglones para borrar'); return; }
  rows = [];
  addRow('Esmalte en Gel', 1, '');
  toast('🗑 Renglones borrados');
}

/* ── CLEAR INDIVIDUAL DE CAMPO ── */
function toggleClear(btnId, val){
  const btn = document.getElementById(btnId);
  if(btn) btn.classList.toggle('visible', val.length > 0);
}
function clearField(inputId, btnId){
  const el = document.getElementById(inputId);
  if(el){ el.value=''; el.focus(); }
  const btn = document.getElementById(btnId);
  if(btn) btn.classList.remove('visible');
}

/* ── FILTRO POR RUTA ── */
// Vista única: mosaico → detalle de ruta
let _rutaDetalleActual = null;

function cerrarRutaDetalle() {
  _rutaDetalleActual = null;
  _rubroFiltro = null;
  _rutaFiltro  = null;
  g('ruta-detalle').style.display = 'none';
  g('ruta-mosaico').style.display = '';
  const si = g('search-input'); if (si) si.value = '';
  renderMosaico();
}

/* ── GESTIÓN DE HOJA DE RUTA ── */
async function abrirGestionRuta(orden) {
  const esSinRuta = (orden === '__sin__' || !orden);
  const cfg = leerRutasConfig();
  const rutaCfg = esSinRuta ? {} : (cfg[orden] || {});
  const nombreActual = esSinRuta ? 'Sin ruta' : (rutaCfg.nombre || ('Ruta ' + orden));
  const notasActuales = esSinRuta ? '' : (rutaCfg.notas || '');
  const todos = _cache || await cargarDB();
  const clientesRuta = esSinRuta
    ? todos.filter(c => !parseRuta(c.ruta).orden)
    : todos.filter(c => String(parseRuta(c.ruta).orden) === String(orden));
  const otrasRutas = [...new Set(todos.map(c => parseRuta(c.ruta).orden)
    .filter(o => o && (esSinRuta || String(o) !== String(orden))))].sort((a,b)=>+a-+b);

  let modal = document.getElementById('gestion-ruta-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gestion-ruta-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarGestionRuta(); });
    document.body.appendChild(modal);
  }

  const optsRutas = otrasRutas.map(function(o) {
    return '<option value="' + o + '">' + getNombreRuta(o) + ' (Ruta ' + o + ')</option>';
  }).join('');
  const ordenParam = esSinRuta ? '__sin__' : orden;

  let html = '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:540px;max-height:88vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">';
  // Header
  html += '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">';
  html += '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('settings') + ' ' + esc(nombreActual) + '</div>';
  html += '<button onclick="cerrarGestionRuta()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer">×</button>';
  html += '</div>';
  html += '<div style="padding:1.2rem;display:flex;flex-direction:column;gap:14px">';

  // Sección nombre/notas (solo para rutas numeradas)
  if (!esSinRuta) {
    html += '<div style="background:var(--surface);border-radius:var(--radius);padding:14px">';
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px">Identificación</div>';
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">Nombre de la hoja</div>';
    html += '<input id="gr-nombre" type="text" value="' + esc(nombreActual) + '" placeholder="ej: Zona Centro, Lunes..." style="width:100%;border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:14px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);box-sizing:border-box"/>';
    html += '</div>';
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">Anotaciones / observaciones</div>';
    html += '<textarea id="gr-notas" placeholder="ej: Hacer los martes, llevar catálogo nuevo..." style="width:100%;border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);box-sizing:border-box;resize:vertical;min-height:70px;line-height:1.5">' + esc(notasActuales) + '</textarea>';
    html += '</div>';
    html += '<button id="btn-guardar-ruta" class="btn-primary" style="width:100%;justify-content:center">' + ic('save') + ' Guardar nombre y notas</button>';
    html += '</div>';
  }

  // Sección mover clientes
  html += '<div style="background:var(--surface);border-radius:var(--radius);padding:14px">';
  html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px">Mover clientes a otra ruta</div>';
  if (clientesRuta.length === 0) {
    html += '<div style="font-size:13px;color:var(--muted)">No hay clientes en esta ruta</div>';
  } else {
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;color:var(--muted);margin-bottom:6px">Seleccioná los clientes a mover (' + clientesRuta.length + ' en esta ruta)</div>';
    html += '<div style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;background:var(--bg)">';
    clientesRuta.forEach(function(c) {
      html += '<label style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer">';
      html += '<input type="checkbox" class="gr-cliente-check" value="' + c.num + '" style="width:16px;height:16px;accent-color:var(--rose);flex-shrink:0"/>';
      html += '<span style="font-size:13px;color:var(--text)">' + esc(c.local||'') + ' <span style="color:var(--muted);font-size:11px">' + (c.num_str ? '#'+c.num_str : '') + '</span></span>';
      html += '</label>';
    });
    html += '</div></div>';
    html += '<div style="display:flex;gap:8px;align-items:center">';
    html += '<select id="gr-ruta-destino" style="flex:1;border:1px solid var(--border);border-radius:8px;padding:9px 10px;font-size:13px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg)">';
    html += '<option value="">— Ruta destino —</option>' + optsRutas + '<option value="__sin__">Sin ruta</option>';
    html += '</select>';
    html += '<button id="btn-mover-clientes" class="btn-secondary" style="white-space:nowrap">' + ic('box') + ' Mover</button>';
    html += '</div>';
  }
  html += '</div>';

  // Sección combinar
  if (otrasRutas.length > 0) {
    html += '<div style="background:var(--surface);border-radius:var(--radius);padding:14px">';
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px">Combinar con otra ruta</div>';
    html += '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Todos los clientes de la ruta seleccionada pasarán a ' + esc(nombreActual) + '</div>';
    html += '<div style="display:flex;gap:8px;align-items:center">';
    html += '<select id="gr-ruta-combinar" style="flex:1;border:1px solid var(--border);border-radius:8px;padding:9px 10px;font-size:13px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg)">';
    html += '<option value="">— Seleccionar ruta —</option>' + optsRutas;
    html += '</select>';
    html += '<button id="btn-combinar-rutas" style="background:#d97706;color:#fff;border:none;border-radius:var(--radius);padding:9px 14px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">' + ic('shuffle') + ' Combinar</button>';
    html += '</div>';
    html += '</div>';
  }

  html += '</div></div>';
  modal.innerHTML = html;

  // Asignar eventos después de insertar HTML (evita problemas de comillas en onclick)
  const btnGuardar = modal.querySelector('#btn-guardar-ruta');
  if (btnGuardar) btnGuardar.onclick = function() { guardarDatosRuta(orden); };
  const btnMover = modal.querySelector('#btn-mover-clientes');
  if (btnMover) btnMover.onclick = function() { moverClientesSeleccionados(ordenParam); };
  const btnCombinar = modal.querySelector('#btn-combinar-rutas');
  if (btnCombinar) btnCombinar.onclick = function() { combinarRutas(ordenParam); };

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarGestionRuta() {
  const modal = document.getElementById('gestion-ruta-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

async function guardarDatosRuta(orden) {
  const nombre = (document.getElementById('gr-nombre')?.value || '').trim();
  const notas  = (document.getElementById('gr-notas')?.value  || '').trim();
  const cfg = leerRutasConfig();
  cfg[orden] = { ...(cfg[orden]||{}), nombre, notas };
  guardarRutasConfig(cfg);
  // También guardar en Supabase para sincronizar entre dispositivos
  try {
    await sbFetch('config', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: 'rutas_config', value: JSON.stringify(cfg) })
    });
  } catch(e) { console.warn('rutas no sincronizadas en DB:', e.message); }
  cerrarGestionRuta();
  renderMosaico();
  toast('✅ Ruta guardada');
}

async function moverClientesSeleccionados(ordenOrigen) {
  const destino = document.getElementById('gr-ruta-destino')?.value;
  if (!destino) { toast('⚠️ Seleccioná una ruta destino'); return; }
  const checks = [...document.querySelectorAll('.gr-cliente-check:checked')];
  if (!checks.length) { toast('⚠️ Seleccioná al menos un cliente'); return; }
  const nums = checks.map(c => +c.value);
  try {
    const todos = _cache || await cargarDB();
    let ok = 0;
    for (const num of nums) {
      const c = todos.find(x => x.num === num);
      if (!c) continue;
      const rutaActual = parseRuta(c.ruta);
      const nuevaRuta = JSON.stringify({ ...rutaActual, orden: destino === '__sin__' ? '' : destino });
      await sbUpdate(num, { ruta: nuevaRuta });
      ok++;
    }
    _cache = null;
    cerrarGestionRuta();
    await renderMosaico();
    toast('✅ ' + ok + ' cliente' + (ok>1?'s':'') + ' movido' + (ok>1?'s':''));
  } catch(e) { toast('Error: ' + e.message); }
}

async function combinarRutas(ordenDestino) {
  const origen = document.getElementById('gr-ruta-combinar')?.value;
  if (!origen) { toast('⚠️ Seleccioná una ruta origen'); return; }
  if (!confirm('¿Mover todos los clientes de Ruta ' + origen + ' a ' + getNombreRuta(ordenDestino) + '? No se puede deshacer.')) return;
  try {
    const todos = _cache || await cargarDB();
    const clientesOrigen = todos.filter(c => String(parseRuta(c.ruta).orden) === String(origen));
    let ok = 0;
    for (const c of clientesOrigen) {
      const rutaActual = parseRuta(c.ruta);
      const nuevaRuta = JSON.stringify({ ...rutaActual, orden: ordenDestino });
      await sbUpdate(c.num, { ruta: nuevaRuta });
      ok++;
    }
    _cache = null;
    cerrarGestionRuta();
    await renderMosaico();
    toast('✅ ' + ok + ' cliente' + (ok>1?'s':'') + ' combinado' + (ok>1?'s':''));
  } catch(e) { toast('Error: ' + e.message); }
}

async function buscarGlobal(q) {
  if (!q || q.trim().length < 1) {
    // Back to mosaico
    if (_rutaDetalleActual !== null) cerrarRutaDetalle();
    else renderMosaico();
    return;
  }

  // Show results as flat list (no ruta grouping) across all clients
  loading(true); const todos = await cargarDB(); loading(false);
  const ql = q.toLowerCase();
  // Match bare number: "3" or "03" should match C-0003
  const isNum = /^\d+$/.test(ql);
  const numVal = isNum ? parseInt(ql, 10) : null;

  const filtrados = todos.filter(c => {
    const ruta = parseRuta(c.ruta);
    const haystack = [c.local, c.rubro, c.loc, c.duenio, c.num_str, c.regimen||'',
            c.tel||'', c.tel2||'',
            ruta.orden ? 'ruta '+ruta.orden : '', ruta.notas||'',
            c.probador_cremas ? 'probador cremas' : ''].join(' ').toLowerCase();
    return haystack.includes(ql) || (numVal !== null && c.num === numVal);
  }).sort((a,b) => (a.num||0) - (b.num||0));

  // Show results in detalle panel (as flat list, no ruta header)
  g('ruta-mosaico').style.display = 'none';
  g('ruta-detalle').style.display = '';
  const titleEl = g('ruta-detalle-title');
  if (titleEl) titleEl.textContent = filtrados.length + ' resultado' + (filtrados.length===1?'':'s');

  // Hide rubro filter while searching globally
  const rubroWrap = g('rubro-filter-tabs');
  if (rubroWrap) rubroWrap.style.display = 'none';

  const el = g('client-list');
  if (!filtrados.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">' + ic('search') + '</div><p>Sin resultados para "' + esc(q) + '"</p></div>';
  } else {
    el.innerHTML = filtrados.map(c => renderClientCard(c)).join('');
  }
}

async function renderMosaico() {
  const wrap = g('ruta-mosaico');
  if (!wrap) return;
  const q = (g('search-input').value || '').toLowerCase();
  const todos = await cargarDB();

  // Cargar pedidos pendientes para mostrar en mosaico
  const pedPend = (_pedidosCache && _pedidosCache.length)
    ? _pedidosCache.filter(p => p.estado === 'pendiente')
    : [];
  // Agrupar pedidos pendientes por ruta del cliente
  const pedPorRuta = {};
  pedPend.forEach(p => {
    const ruta = p.cliente_ruta ? 'Ruta ' + p.cliente_ruta : '__sin__';
    pedPorRuta[ruta] = (pedPorRuta[ruta]||0) + 1;
  });
  // También agrupar por nombre de cliente para detalle
  const pedPorCliente = {};
  pedPend.forEach(p => {
    if (p.cliente_nombre) {
      if (!pedPorCliente[p.cliente_nombre]) pedPorCliente[p.cliente_nombre] = 0;
      pedPorCliente[p.cliente_nombre]++;
    }
  });
  window._pedPorCliente = pedPorCliente;

  // Filter by search
  const filtrados = q ? todos.filter(c => {
    const ruta = parseRuta(c.ruta);
    return [c.local, c.rubro, c.loc, c.num_str, ruta.orden ? String(ruta.orden) : ''].join(' ').toLowerCase().includes(q);
  }) : todos;

  // Group by ruta order
  const grupos = {};
  filtrados.forEach(function(c) {
    const r = parseRuta(c.ruta);
    const o = r.orden ? 'Ruta ' + r.orden : 'Sin ruta';
    if (!grupos[o]) grupos[o] = { clientes: [], rubros: {} };
    grupos[o].clientes.push(c);
    const rb = (c.rubro || 'Sin rubro').trim() || 'Sin rubro';
    grupos[o].rubros[rb] = (grupos[o].rubros[rb] || 0) + 1;
  });

  if (!Object.keys(grupos).length) {
    wrap.innerHTML = '<div class="empty-state"><div class="icon"></div><p>' + (todos.length===0?'Todavía no hay clientes.':'Sin resultados.') + '</p></div>';
    return;
  }

  // Sort groups: Ruta 1, Ruta 2... then Sin ruta
  const keys = Object.keys(grupos).sort(function(a,b) {
    if (a==='Sin ruta') return 1;
    if (b==='Sin ruta') return -1;
    return parseInt(a.replace('Ruta ','')) - parseInt(b.replace('Ruta ',''));
  });

  let html = '<div class="mosaico-grid">';
  keys.forEach(function(key) {
    const g_ = grupos[key];
    const n       = g_.clientes.length;
    const probNum = g_.clientes.filter(function(c){ return c.probador_cremas; }).length;
    const warn    = (key !== 'Sin ruta' && n < 20) ? '<div class="mosaico-warn">' + ic('alert') + ' Menos de 20 clientes</div>' : '';
    const probTag = probNum > 0 ? '<div style="font-size:11px;color:#059669;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:2px 8px;display:inline-block;margin-top:5px">' + ic('droplet') + ' ' + probNum + ' con probador</div>' : '';
    const topRubros = Object.keys(g_.rubros).sort(function(a,b){return g_.rubros[b]-g_.rubros[a];}).slice(0,4);
    const rubroTags = topRubros.map(function(r) {
      return '<span class="mosaico-rubro-tag">' + esc(r) + ' (' + g_.rubros[r] + ')</span>';
    }).join('');
    const safeKey = key.replace(/'/g, '');
    // Obtener nombre custom y notas de ruta
    const orden = key === 'Sin ruta' ? null : key.replace('Ruta ','');
    const nombreCustom = orden ? getNombreRuta(orden) : 'Sin ruta';
    const notasRuta = orden ? getNotasRuta(orden) : '';
    const nombreDisplay = nombreCustom !== ('Ruta ' + orden) ? nombreCustom : key;
    const subNombre = (orden && nombreCustom !== ('Ruta ' + orden)) ? '<div style="font-size:10px;color:var(--muted);margin-top:1px">Ruta ' + orden + '</div>' : '';
    const notasTag = notasRuta ? '<div style="font-size:11px;color:var(--text2);background:var(--subtle);border-radius:6px;padding:3px 8px;margin-top:5px;line-height:1.4">' + ic('edit') + ' ' + esc(notasRuta) + '</div>' : '';
    // Badge de pedidos pendientes
    const pedCount = pedPorRuta[key] || 0;
    const pedTag = pedCount > 0
      ? '<div style="font-size:11px;color:#d97706;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:2px 8px;display:inline-block;margin-top:5px;margin-left:4px">' + ic('clipboard') + ' ' + pedCount + ' pedido' + (pedCount>1?'s':'') + ' pendiente' + (pedCount>1?'s':'') + '</div>'
      : '';
    const btnGestionar = orden
      ? '<button onclick="event.stopPropagation();abrirGestionRuta(\''+orden+'\')" style="position:absolute;top:8px;right:8px;background:none;border:1px solid var(--border);border-radius:6px;padding:2px 7px;font-size:11px;color:var(--muted);cursor:pointer;font-family:Inter,sans-serif">' + ic('settings') + '</button>'
      : '<button onclick="event.stopPropagation();abrirGestionRuta(\'__sin__\')" style="position:absolute;top:8px;right:8px;background:none;border:1px solid var(--border);border-radius:6px;padding:2px 7px;font-size:11px;color:var(--muted);cursor:pointer;font-family:Inter,sans-serif">' + ic('settings') + '</button>';
    html += '<div class="mosaico-card" onclick="abrirRutaEnLista(this)" data-ruta="' + safeKey + '" style="position:relative">' +
      btnGestionar +
      '<div class="mosaico-ruta">' + esc(nombreDisplay) + '</div>' +
      subNombre +
      '<div class="mosaico-num">' + n + '</div>' +
      '<div class="mosaico-label">cliente' + (n===1?'':'s') + '</div>' +
      warn + probTag + pedTag + notasTag +
      '<div class="mosaico-rubros" style="margin-top:6px">' + rubroTags + '</div>' +
    '</div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
}

function abrirRutaEnLista(el) {
  const rutaKey = el.dataset ? el.dataset.ruta : '';
  _rutaDetalleActual = rutaKey;
  _rubroFiltro = null;
  const rubroWrap = g('rubro-filter-tabs');
  if (rubroWrap) rubroWrap.style.display = '';
  g('ruta-mosaico').style.display = 'none';
  g('ruta-detalle').style.display = '';
  const titleEl = g('ruta-detalle-title');
  if (titleEl) {
    const orden = rutaKey === 'Sin ruta' ? null : rutaKey.replace('Ruta ','');
    const nombreCustom = orden ? getNombreRuta(orden) : 'Sin ruta';
    titleEl.textContent = nombreCustom;
    // Mostrar botón gestionar solo si tiene número de ruta
    const btnG = g('btn-gestionar-ruta');
    if (btnG) {
      if (orden) { btnG.style.display = ''; btnG.dataset.orden = orden; }
      else btnG.style.display = 'none';
    }
  }
  if (rutaKey === 'Sin ruta') {
    _rutaFiltro = '__sin__';
  } else {
    _rutaFiltro = rutaKey.replace('Ruta ', '');
  }
  renderListaDetalle();
}

function abrirGestionRutaDesdeDetalle() {
  const btn = g('btn-gestionar-ruta');
  if (btn && btn.dataset.orden) abrirGestionRuta(btn.dataset.orden);
}

/* ── Crear cliente directamente desde el detalle de una ruta ── */
async function abrirCrearClienteEnRuta() {
  // Abrir el modal de crear cliente con número correcto para la ruta
  if (typeof openCrearCliente === 'function') await openCrearCliente();
  // Pre-rellenar el número de ruta
  setTimeout(async () => {
    const orden = _rutaFiltro && _rutaFiltro !== '__sin__' ? _rutaFiltro : '';
    const ordenEl = document.getElementById('m-orden');
    if (ordenEl) ordenEl.value = orden;
    // Regenerar num_str con el prefijo correcto de la ruta
    const mNumStr = document.getElementById('m-numStr');
    if (mNumStr && !mNumStr._userEdited) {
      try {
        mNumStr.value = await generarNumStrParaRuta(orden);
        mNumStr._rutaOrden = orden;
      } catch(e) {}
    }
  }, 80);
}

async function renderListaDetalle() {
  const q = (g('search-input').value || '').toLowerCase();
  loading(true); const todos = await cargarDB(); loading(false);

  // Filter by ruta
  let lista = todos.filter(c => {
    const r = parseRuta(c.ruta);
    if (_rutaFiltro === '__sin__') return !r.orden;
    return String(r.orden) === _rutaFiltro;
  });

  // Apply search
  if (q) {
    lista = lista.filter(c => {
      const r = parseRuta(c.ruta);
      return [c.local, c.rubro, c.loc, c.duenio, c.num_str, r.notas||'',
              c.probador_cremas ? 'probador' : ''].join(' ').toLowerCase().includes(q);
    });
  }

  // Build rubro filter
  buildRubroFilterTabs(lista);

  // Apply rubro filter
  if (_rubroFiltro !== null) {
    lista = lista.filter(c => (c.rubro||'Sin rubro').trim() === _rubroFiltro || (!(c.rubro||'').trim() && _rubroFiltro==='Sin rubro'));
  }

  const el = g('client-list');
  if (!lista.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon"></div><p>Sin resultados.</p></div>';
    return;
  }
  el.innerHTML = (typeof barraAvisoRutaHTML === 'function' ? barraAvisoRutaHTML() : '') +
                 lista.map(c => renderClientCard(c)).join('');
}

function filtrarRuta(orden, btn) {
  _rutaFiltro = orden;
  const rutaTabs = g('ruta-filter-tabs');
  if (rutaTabs) rutaTabs.querySelectorAll('.clientes-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderLista();
}

function filtrarRubro(rubro, btn) {
  _rubroFiltro = rubro;
  const rubroTabs = g('rubro-filter-tabs');
  if (rubroTabs) rubroTabs.querySelectorAll('.clientes-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (_rutaDetalleActual !== null) renderListaDetalle();
  else renderLista();
}

function buildRubroFilterTabs(todos) {
  const wrap = g('rubro-filter-tabs');
  if (!wrap) return;

  // Count per rubro
  const rubros = {};
  todos.forEach(function(c) {
    const r = (c.rubro || 'Sin rubro').trim() || 'Sin rubro';
    rubros[r] = (rubros[r] || 0) + 1;
  });

  const cur = _rubroFiltro;
  wrap.innerHTML = '';

  // "Todos" button
  const btnAll = document.createElement('button');
  btnAll.className = 'clientes-tab-btn rubro-btn' + (cur===null ? ' active' : '');
  btnAll.style.cssText = 'font-size:11px;padding:4px 10px;background:' + (cur===null?'#fdf2f8':'#fff');
  btnAll.textContent = 'Todos los rubros';
  btnAll.onclick = function() { filtrarRubro(null, this); };
  wrap.appendChild(btnAll);

  // One button per rubro, sorted by count desc
  Object.keys(rubros).sort(function(a,b){ return rubros[b]-rubros[a]; }).forEach(function(r) {
    const n = rubros[r];
    const btn = document.createElement('button');
    btn.className = 'clientes-tab-btn rubro-btn' + (cur===r ? ' active' : '');
    btn.style.cssText = 'font-size:11px;padding:4px 10px';
    btn.textContent = r + ' (' + n + ')';
    btn.onclick = function() { filtrarRubro(r, this); };
    wrap.appendChild(btn);
  });
}

function buildRutaFilterTabs(todos) {
  const ordenes = {};
  todos.forEach(function(c) {
    const r = parseRuta(c.ruta);
    const o = r.orden ? String(r.orden) : null;
    if (o) ordenes[o] = (ordenes[o] || 0) + 1;
  });
  const sinRuta = todos.filter(function(c) { const r = parseRuta(c.ruta); return !r.orden; }).length;
  const wrap = g('ruta-filter-tabs');
  if (!wrap) return;
  const cur = _rutaFiltro;

  wrap.innerHTML = '';

  // "Todas" button
  const btnAll = document.createElement('button');
  btnAll.className = 'clientes-tab-btn' + (cur===null ? ' active' : '');
  btnAll.textContent = 'Todas (' + todos.length + ')';
  btnAll.onclick = function() { filtrarRuta(null, this); };
  wrap.appendChild(btnAll);

  // One button per ruta order
  Object.keys(ordenes).sort(function(a,b){ return parseInt(a)-parseInt(b); }).forEach(function(o) {
    const n = ordenes[o];
    const btn = document.createElement('button');
    btn.className = 'clientes-tab-btn' + (cur===o ? ' active' : '');
    btn.textContent = 'Ruta ' + o + ' (' + n + ')' + (n < 20 ? ' ' : '');
    btn.onclick = function() { filtrarRuta(o, this); };
    wrap.appendChild(btn);
  });

  // "Sin ruta" button
  if (sinRuta > 0) {
    const btnSin = document.createElement('button');
    btnSin.className = 'clientes-tab-btn' + (cur==='__sin__' ? ' active' : '');
    btnSin.textContent = 'Sin ruta (' + sinRuta + ')';
    btnSin.onclick = function() { filtrarRuta('__sin__', this); };
    wrap.appendChild(btnSin);
  }
}



function seleccionarClienteRemito(idx) {
  const c = (window._remitoSearchResults || [])[idx]; if (!c) return;
  window._clienteRemitoActual = c; // store for later save

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('f-nombre', c.local); set('f-dir', c.dir); set('f-loc', c.loc); set('f-tel', c.tel);
  // Mostrar X en campos que tienen valor
  if(c.local) toggleClear('f-nombre-clear', c.local);
  if(c.dir)   toggleClear('f-dir-clear', c.dir);
  if(c.loc)   toggleClear('f-loc-clear', c.loc);
  if(c.tel)   toggleClear('f-tel-clear', c.tel);

  document.getElementById('r-cs-input').value = '';
  const rcsr = document.getElementById('r-cs-results'); if(rcsr) rcsr.style.display='none';
  document.getElementById('r-cs-badge-name').textContent = (c.num_str||'') + ' — ' + (c.local||'');
  const rcbadge = document.getElementById('r-cs-badge'); if(rcbadge) rcbadge.style.display='flex';

  const faltantes = [];
  if (!c.dir) faltantes.push('Dirección');
  if (!c.loc) faltantes.push('Localidad');
  if (!c.tel) faltantes.push('Teléfono');

  const warn = document.getElementById('r-cs-badge-warn');
  if (faltantes.length) {
    warn.innerHTML = '' + ic('alert') + ' Faltan: <strong>' + faltantes.join(', ') + '</strong> &nbsp;' +
      '<button onclick="abrirEdicionRapidaRemito()" style="background:#d97706;color:#fff;border:none;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:DM Sans,sans-serif;margin-left:4px">Completar</button>';
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }

  chequearDeudaClienteRemito(c.local);
}

/* ── Aviso de deuda pendiente al seleccionar cliente en el remito ── */
async function chequearDeudaClienteRemito(nombre) {
  const el = document.getElementById('r-cs-deuda-warn');
  if (!el) return;
  el.style.display = 'none';
  el.innerHTML = '';
  if (!nombre) return;
  try {
    // Se traen TODOS los remitos del cliente: con pagos divididos, un remito
    // puede tener deuda aunque su pago principal sea efectivo o transferencia.
    const rems = await sbFetch('remitos?select=fecha,total,pago,alias,saldado,saldado_fecha,pagos_detalle,pago2_tipo,pago2_monto,pago2_alias&cliente_nombre=eq.' +
      encodeURIComponent(nombre) + '&order=created_at.asc');
    // Si el cliente cambió mientras cargaba, no pisar
    if (!window._clienteRemitoActual || window._clienteRemitoActual.local !== nombre) return;

    const pend = (rems || []).filter(r => deudaPendienteRemito(r) > 0);
    if (!pend.length) return;

    const fp = n => '$' + (+n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const totalPend = pend.reduce((s, r) => s + deudaPendienteRemito(r), 0);
    const hoyISO = new Date().toISOString().slice(0, 10);
    const diasVieja = Math.max(...pend.map(r => _diasEntre(r.fecha, hoyISO) || 0));

    // Demora del último pago saldado (para decidir si dejarle "transferencia" de nuevo)
    const saldados = (rems || []).filter(r => r.saldado && r.saldado_fecha && r.fecha);
    let demoraTxt = '';
    if (saldados.length) {
      const ult = saldados[saldados.length - 1];
      const d = _diasEntre(ult.fecha, ult.saldado_fecha);
      if (d !== null) demoraTxt = '<br>La última deuda la pagó en <strong>' + d + ' día' + (d === 1 ? '' : 's') + '</strong>.';
    }

    el.innerHTML = ic('alert', 13) + ' Debe <strong>' + fp(totalPend) + '</strong> (' +
      pend.length + ' remito' + (pend.length === 1 ? '' : 's') + ', el más viejo hace <strong>' +
      diasVieja + ' día' + (diasVieja === 1 ? '' : 's') + '</strong>).' + demoraTxt + ' ' +
      '<button onclick="abrirFichaCliente(\'' + esc(nombre).replace(/'/g, "\\'") + '\')" ' +
        'style="background:#b91c1c;color:#fff;border:none;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:DM Sans,sans-serif;margin-left:2px">Ver cuenta</button>';
    el.style.display = 'block';
  } catch (e) { /* sin conexión o error: no bloquear el remito */ }
}

function abrirEdicionRapidaRemito() {
  const c = window._clienteRemitoActual; if (!c) return;

  // Build quick-edit modal
  let modal = document.getElementById('remito-quick-edit');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'remito-quick-edit';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(26,10,18,.45);z-index:2000;display:flex;align-items:flex-end;justify-content:center';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:680px;padding:1.2rem;padding-bottom:env(safe-area-inset-bottom)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:'Playfair Display',serif;font-size:17px;font-weight:600;color:#1a0a12">Completar datos</div>
          <button onclick="cerrarEdicionRapidaRemito()" style="background:none;border:none;font-size:24px;color:#c0a8b8;cursor:pointer;padding:0;line-height:1">×</button>
        </div>
        <div id="rqe-fields" style="display:flex;flex-direction:column;gap:14px"></div>
        <button onclick="guardarEdicionRapidaRemito()" style="margin-top:16px;width:100%;background:#d6539a;color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-family:DM Sans,sans-serif;font-weight:500;cursor:pointer">Guardar y actualizar</button>
      </div>`;
    document.body.appendChild(modal);
  }

  // Build fields for missing data
  const faltantes = [];
  if (!c.dir) faltantes.push({key:'dir', label:'Dirección', placeholder:'Calle y número'});
  if (!c.loc) faltantes.push({key:'loc', label:'Localidad', placeholder:'Ciudad / Partido'});
  if (!c.tel) faltantes.push({key:'tel', label:'Teléfono', placeholder:'11-1234-5678'});

  const fieldsEl = document.getElementById('rqe-fields');
  fieldsEl.innerHTML = faltantes.map(f =>
    '<div>' +
      '<div style="font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500;margin-bottom:3px">' + f.label + '</div>' +
      '<input id="rqe-' + f.key + '" type="text" placeholder="' + f.placeholder + '" ' +
        'style="border:none;border-bottom:1px solid #ead8e4;padding:8px 0;font-size:15px;color:#1a0a12;background:transparent;font-family:DM Sans,sans-serif;width:100%;-webkit-appearance:none"' +
        (f.key==='tel' ? ' inputmode="tel" oninput="fmtTel(this)"' : ' oninput="titleCase(this)"') +
      '/>' +
    '</div>'
  ).join('');

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarEdicionRapidaRemito() {
  const modal = document.getElementById('remito-quick-edit');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function guardarEdicionRapidaRemito() {
  const c = window._clienteRemitoActual; if (!c) return;

  const updates = {};
  ['dir','loc','tel'].forEach(key => {
    const el = document.getElementById('rqe-' + key);
    if (el && el.value.trim()) updates[key] = el.value.trim();
  });

  if (!Object.keys(updates).length) { cerrarEdicionRapidaRemito(); return; }

  const btn = document.querySelector('#remito-quick-edit button:last-of-type');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    await sbUpdate(c.num, updates);
    // Update local cache
    Object.assign(c, updates);
    window._clienteRemitoActual = c;
    // Update form fields
    if (updates.dir) { const el = document.getElementById('f-dir'); if (el) el.value = updates.dir; }
    if (updates.loc) { const el = document.getElementById('f-loc'); if (el) el.value = updates.loc; }
    if (updates.tel) { const el = document.getElementById('f-tel'); if (el) el.value = updates.tel; }
    // Hide warning
    const warn = document.getElementById('r-cs-badge-warn');
    if (warn) warn.style.display = 'none';
    // Invalidate cache
    _cache = null;
    cerrarEdicionRapidaRemito();
    toast('✓ Datos actualizados en la base');
  } catch(e) {
    toast('Error al guardar: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar y actualizar'; }
  }
}

function limpiarClienteRemito() {
  ['f-nombre','f-dir','f-loc','f-tel'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const rci = document.getElementById('r-cs-input'); if (rci) rci.value = '';
  const rcbh = document.getElementById('r-cs-badge'); if (rcbh) rcbh.style.display = 'none';
  const rcw = document.getElementById('r-cs-badge-warn'); if (rcw) rcw.style.display = 'none';
  const rcd = document.getElementById('r-cs-deuda-warn'); if (rcd) { rcd.style.display = 'none'; rcd.innerHTML = ''; }
  window._clienteRemitoActual = null;
}

document.addEventListener('click', function(e) {
  const res = document.getElementById('r-cs-results');
  if (!res) return;
  // Only hide if clicking completely outside both the input and results
  const inp = document.getElementById('r-cs-input');
  if (inp && (inp.contains(e.target) || res.contains(e.target))) return;
  res.style.display = 'none';
});


var _remitoLoaded = false;

/* ── CARGAR REMITO EN TAB ── */

function cargarRemito() {
  if (_remitoLoaded) {
    // Stock puede haberse cargado después — refrescar lista de productos
    if (_stockCache && _stockCache.length) renderRows();
    return;
  }
  // Cargar stock en background para que los productos estén disponibles
  if (!_stockCache) {
    // Primero intentar usar el caché local (instantáneo, funciona offline)
    const stockLocal = leerStockLocal();
    if (stockLocal && stockLocal.length) {
      _stockCache = stockLocal;
      sincronizarCategorias();
      renderRows();
    }
    // Luego intentar actualizar desde Supabase (si hay internet)
    sbStockFetch().then(items => {
      _stockCache = items;
      guardarStockLocal(items); // guardar para uso offline futuro
      sincronizarCategorias();
      renderRows(); // refrescar con productos actualizados
    }).catch(() => {
      // Sin internet: si no teníamos caché local, mostrar mensaje
      if (!_stockCache || !_stockCache.length) {
        toast('⚠️ Sin conexión — mostrando productos del último caché');
      }
    });
  }
  const wrap = document.getElementById('remito-frame-wrap');
  if (!wrap) return;

  // Inject scoped style
  const styleEl = document.createElement('style');
  styleEl.textContent = `#remito-frame-wrap 
  
  
  .remito-card{
  background:#fff;border-radius:16px;border:1px solid #ead8e4;max-width:660px;margin:0 auto;overflow:hidden;box-shadow:0 4px 32px rgba(180,80,140,0.10)
}
  
  /* HEADER */
  .remito-header{
  background:#fff;padding:1.1rem 1.2rem 0.9rem;display:flex;align-items:center;gap:1rem;border-bottom:2px solid #f0d6e8
}
  .logo-wrap{
  width:56px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  border-radius:12px;overflow:hidden;background:transparent
}
  .logo-wrap img{
  display:block;width:56px;height:56px;object-fit:contain;background:transparent
}
  .brand-name{
  font-family:'Playfair Display',serif;font-size:21px;font-weight:600;color:#1a0a12;letter-spacing:3px;text-transform:uppercase;line-height:1
}
  .brand-divider{
  width:26px;height:1.5px;background:#d6539a;margin:5px 0
}
  .brand-sub{
  font-size:8px;color:#b06090;letter-spacing:3px;text-transform:uppercase
}
  
  /* SECCIONES */
  .section{
  padding:0.9rem 1.1rem;border-bottom:1px solid #f5eaf0
}
  .section-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:10px
}
  .field-group{
  display:flex;flex-direction:column;gap:3px
}
  .field-label{
  font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500
}
  .field-wrap{
  position:relative;display:flex;align-items:center
}
  .field-input{
  border:none;border-bottom:1px solid #ead8e4;padding:7px 24px 7px 0;font-size:15px;color:#1a0a12;background:transparent;font-family:'DM Sans',sans-serif;width:100%;-webkit-appearance:none;text-transform:capitalize
}
  .field-input:focus{
  outline:none;border-bottom-color:#d6539a
}
  .field-input::placeholder{
  color:#ccc;font-size:13px
}
  .field-clear{
  position:absolute;right:0;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#e0c8d0;font-size:18px;line-height:1;padding:4px 2px;display:block;-webkit-tap-highlight-color:transparent;opacity:.35;transition:opacity .15s,color .15s
}
  .field-clear.visible{opacity:1;color:#e05580}
  .field-clear:active{color:#c0355a}
  
  /* ALIAS */
  .alias-section{
  padding:0.8rem 1.1rem;border-bottom:1px solid #f5eaf0;background:#fdf7fb
}
  .alias-label{
  font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500;margin-bottom:10px
}
  .alias-opts{
  display:flex;gap:10px;flex-wrap:wrap
}
  .alias-btn{
  border:1.5px solid #ead8e4;border-radius:12px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer;background:#fff;font-family:'DM Sans',sans-serif;color:#b099a8;-webkit-tap-highlight-color:transparent;min-height:44px;display:inline-flex;align-items:center;justify-content:center;transition:all .12s;flex:1
}
  .alias-btn.active{
  background:#fdf2f8;border-color:#d6539a;color:#d6539a;font-weight:700;box-shadow:0 0 0 3px rgba(214,83,154,.15)
}
  .alias-btn:active{
  transform:scale(.97)
}
  .alias-input-wrap{
  display:none;margin-top:10px;flex-direction:column;gap:4px
}
  .alias-input-wrap.visible{
  display:flex
}
  .alias-input{
  border:none;border-bottom:1px solid #ead8e4;padding:7px 0;font-size:15px;color:#1a0a12;background:transparent;font-family:'DM Sans',sans-serif;width:100%;-webkit-appearance:none
}
  .alias-input:focus{
  outline:none;border-bottom-color:#d6539a
}
  
  /* TABLA PRODUCTOS */
  .productos-title{
  font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500;margin-bottom:8px
}
  .productos-table{
  width:100%;border-collapse:collapse;table-layout:auto
}
  .productos-table th{
  text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#c0a8b8;font-weight:500;padding:5px 0;border-bottom:1px solid #f5eaf0
}
  .productos-table td{
  padding:8px 2px;border-bottom:1px solid #faf4f8;color:#1a0a12;vertical-align:middle
}
  .col-prod{
  width:40%;white-space:normal;word-break:break-word
}
  .col-cant{
  width:13%;text-align:center
}
  .col-precio{
  width:19%;text-align:right
}
  .col-sub{
  width:19%;text-align:right;font-weight:500;white-space:nowrap
}
  .col-del{
  width:9%;text-align:center
}
  
  /* Controles en tabla */
  .prod-wrap{
  display:flex;align-items:center;gap:3px;overflow:visible
}
  .prod-select{
  border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a0a12;flex:1;padding:2px 0;-webkit-appearance:none;white-space:normal;overflow:visible;min-width:0;text-transform:capitalize
}
  .prod-input{
  border:none;border-bottom:1px solid #ead8e4;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a0a12;flex:1;padding:2px 0;-webkit-appearance:none;text-transform:capitalize
}
  .prod-select:focus,.prod-input:focus{
  outline:none;border-bottom-color:#d6539a
}
  .edit-btn{
  background:none;border:1px solid #ead8e4;border-radius:6px;padding:1px 5px;font-size:10px;color:#c0a8b8;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;line-height:1.4
}
  .cant-input{
  border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a0a12;width:100%;text-align:center;padding:2px 0;-webkit-appearance:none
}
  .precio-input{
  border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a0a12;width:100%;text-align:right;padding:2px 0;-webkit-appearance:none
}
  .remove-btn{
  background:#fff0f5;border:1px solid #f9c8d8;cursor:pointer;color:#e05580;font-size:16px;font-weight:700;padding:3px 8px;line-height:1;-webkit-tap-highlight-color:transparent;border-radius:6px;transition:background .12s;flex-shrink:0
}
  .remove-btn:hover,.remove-btn:active{
  background:#ffe0ec;color:#c0355a
}
  .add-btn{
  margin-top:10px;background:transparent;border:1px dashed #ead8e4;border-radius:8px;padding:10px 16px;font-size:13px;color:#c0a8b8;cursor:pointer;width:100%;font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent
}
  
  /* PAGO */
  .pago-section{
  padding:0.9rem 1.1rem;display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;background:#fdf7fb;border-bottom:1px solid #f5eaf0
}
  .pago-opciones{
  display:flex;gap:8px;flex-wrap:wrap
}
  .pago-btn{
  border:1px solid #ead8e4;border-radius:20px;padding:7px 13px;font-size:12px;cursor:pointer;background:#fff;font-family:'DM Sans',sans-serif;color:#b099a8;-webkit-tap-highlight-color:transparent
}
  .pago-btn.active-efectivo{
  background:#fdf2f8;border-color:#d6539a;color:#d6539a;font-weight:500
}
  .pago-btn.active-transferencia{
  background:#f0f4ff;border-color:#5563de;color:#5563de;font-weight:500
}
  .pago-btn.active-deuda{
  background:#fff7ed;border-color:#d97706;color:#d97706;font-weight:500
}
  .total-area{
  display:flex;align-items:baseline;gap:8px
}
  .total-label{
  font-size:10px;color:#b099a8;text-transform:uppercase;letter-spacing:1.5px
}
  .total-val{
  font-size:24px;font-weight:600;font-family:'Playfair Display',serif;color:#1a0a12
}
  
  /* DEUDA */
  .deuda-aviso{
  display:none;padding:0.9rem 1.1rem;background:#fffbf2;border-bottom:1px solid #fde8b8
}
  .deuda-aviso.visible{
  display:block
}
  .deuda-aviso p{
  font-size:12.5px;color:#92600a;line-height:1.7
}
  
  /* NOTAS */
  .notas-input{
  border:none;border-bottom:1px solid #f0e4ec;background:transparent;font-size:14px;color:#888;width:100%;font-family:'DM Sans',sans-serif;padding:7px 0;-webkit-appearance:none
}
  .notas-input:focus{
  outline:none;border-bottom-color:#d6539a
}
  
  /* PIE */
  .no-factura{
  text-align:center;padding:0.5rem;background:#f9f4f7;border-top:1px dashed #ead8e4
}
  .no-factura p{
  font-size:10px;color:#c0a0b8;letter-spacing:1px;text-transform:uppercase
}
  .remito-footer{
  padding:1rem 1.1rem;background:#fff;border-top:2px solid #f0d6e8;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px
}
  .footer-gracias{
  font-family:'Playfair Display',serif;font-style:italic;font-size:12px;color:#c0a0b8
}
  .btn-group{
  display:flex;gap:8px;width:100%
}
  .share-btn{
  flex:2;background:#059669;color:#fff;border:none;border-radius:12px;padding:14px 16px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700;-webkit-tap-highlight-color:transparent;min-height:50px;text-transform:uppercase;letter-spacing:.6px
}
  .share-btn:active{
  background:#047857
}
  .new-btn{
  flex:1;background:#fdf2f8;color:#c84b8c;border:1.5px solid rgba(200,75,140,.3);border-radius:12px;padding:14px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent;min-height:50px;text-transform:uppercase;letter-spacing:.6px
}
  .new-btn:active{
  background:#f5e0ef
}
  
  /* LOADING */
  .loading{
  display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.93);z-index:9999;align-items:center;justify-content:center;flex-direction:column;gap:12px
}
  .loading.visible{
  display:flex
}
  .loading p{
  font-size:14px;color:#b06090;font-family:'DM Sans',sans-serif
}
  .spinner{
  width:36px;height:36px;border:3px solid #f0d6e8;border-top-color:#d6539a;border-radius:50%;animation:spin 0.8s linear infinite
}
  
  /* CLIENT SEARCH */
  .client-search-section{
  padding:0.9rem 1.2rem;border-bottom:1px solid #f5eaf0;background:#fdf7fb
}
  .client-search-label{
  font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500;margin-bottom:8px
}
  .client-search-wrap{
  position:relative
}
  .client-search-input{
  width:100%;border:1px solid #ead8e4;border-radius:10px;padding:10px 14px 10px 36px;font-size:15px;font-family:"DM Sans",sans-serif;color:#1a0a12;background:#fff;-webkit-appearance:none
}
  .client-search-input:focus{
  outline:none;border-color:#d6539a
}
  .client-search-icon{
  position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#c0a8b8;font-size:14px;pointer-events:none
}
  .client-results{
  position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #ead8e4;border-radius:12px;box-shadow:0 8px 24px rgba(180,80,140,0.12);z-index:100;max-height:240px;overflow-y:auto;display:none
}
  .client-results.open{
  display:block
}
  .client-result-item{
  padding:10px 14px;cursor:pointer;border-bottom:1px solid #f5eaf0;-webkit-tap-highlight-color:transparent
}
  .client-result-item:last-child{
  border-bottom:none
}
  .client-result-item:active{
  background:#fdf2f8
}
  .client-result-name{
  font-size:14px;font-weight:500;color:#1a0a12
}
  .client-result-detail{
  font-size:11px;color:#b099a8;margin-top:2px
}
  .client-loaded-badge{
  display:none;align-items:center;gap:8px;margin-top:8px;background:#fdf2f8;border:1px solid #f0c8e0;border-radius:8px;padding:8px 12px
}
  .client-loaded-badge.visible{
  display:flex
}
  .client-loaded-name{
  font-size:13px;color:#d6539a;font-weight:500;flex:1
}
  .client-loaded-warn{
  font-size:11px;color:#d97706;background:#fff7ed;border:1px solid #fde8b8;border-radius:6px;padding:3px 8px;margin-top:6px
}
  .client-clear-btn{
  background:none;border:none;color:#c0a8b8;font-size:18px;cursor:pointer;padding:0;line-height:1;-webkit-tap-highlight-color:transparent
}
  @keyframes spin{
  to{
  transform:rotate(360deg)
}
}
  
  /* ===== RESPONSIVE MÓVIL ===== */
  @media(max-width:600px){
  
    .section-grid{
  grid-template-columns:1fr
}
    .pago-section{
  flex-direction:column;align-items:flex-start
}
  
    /* Ocultar cabecera de tabla */
    .productos-table thead{
  display:none
}
  
    /* Cada fila = tarjeta */
    .productos-table tbody tr{
  
      display:block;
      padding:10px 0;
      border-bottom:1px solid #f0e4ec;
    
}
  
    /* Fila 1: producto (ancho completo) */
    .productos-table td.td-prod{
  
      display:block;
      width:100%;
      padding-bottom:6px;
    
}
  
    /* Fila 2: cantidad + precio + subtotal + eliminar */
    .productos-table td.td-cant,
    .productos-table td.td-precio,
    .productos-table td.td-sub,
    .productos-table td.td-del{
  
      display:inline-block;
      vertical-align:middle;
      padding:0;
    
}
    .productos-table td.td-cant{
  width:22%
}
    .productos-table td.td-precio{
  width:32%
}
    .productos-table td.td-sub{
  width:30%;text-align:right;font-size:15px;font-weight:600
}
    .productos-table td.td-del{
  width:12%;text-align:right
}
  
    .td-cant::before{
  content:"Cant ";font-size:9px;color:#b099a8;text-transform:uppercase;display:block;margin-bottom:2px
}
    .td-precio::before{
  content:"P.Unit ";font-size:9px;color:#b099a8;text-transform:uppercase;display:block;margin-bottom:2px
}
  
    .cant-input{
  font-size:15px;width:90%
}
    .precio-input{
  font-size:15px;width:100%
}
    .prod-select,.prod-input{
  font-size:15px
}
  
}
  `;
  document.head.appendChild(styleEl);

  // Inject search bar + remito card
  wrap.innerHTML = `
    <div style="padding:10px 1.2rem 0">
      <div style="position:relative;margin-bottom:10px;min-height:36px">
        <button onclick="showPage('inicio',document.getElementById('nav-inicio'))" style="display:inline-flex;align-items:center;gap:8px;background:var(--subtle,#fbf2f7);border:1.5px solid rgba(200,75,140,.25);border-radius:10px;color:#c84b8c;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:700;cursor:pointer;padding:8px 14px;letter-spacing:.3px;text-transform:uppercase;-webkit-tap-highlight-color:transparent"><span style="font-size:15px;line-height:1">←</span> Inicio</button>
        <button onclick="limpiarTodoRemito()" style="position:absolute;right:0;top:0;display:inline-flex;align-items:center;gap:5px;background:transparent;border:1.5px solid #f0c8d8;border-radius:10px;color:#e05580;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:700;cursor:pointer;padding:8px 12px;letter-spacing:.3px;text-transform:uppercase;-webkit-tap-highlight-color:transparent">${ic('trash')} Borrar</button>
      </div>
      <div style="font-size:9px;color:#b099a8;text-transform:uppercase;letter-spacing:1.8px;font-weight:500;margin-bottom:6px">Buscar cliente de la base</div>
      <div style="position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#c0a8b8;font-size:14px;pointer-events:none">${ic('search')}</span>
        <input id="r-cs-input" type="text" placeholder="Nombre o N° de cliente..."
          oninput="buscarClienteRemito(this.value)" autocomplete="off"
          style="width:100%;border:1px solid #ead8e4;border-radius:10px;padding:10px 14px 10px 36px;font-size:15px;font-family:'DM Sans',sans-serif;color:#1a0a12;background:#fff;-webkit-appearance:none;box-sizing:border-box"/>
        <div id="r-cs-results" style="position:absolute;top:calc(100%+4px);left:0;right:0;background:#fff;border:1px solid #ead8e4;border-radius:12px;box-shadow:0 8px 24px rgba(180,80,140,.12);z-index:200;max-height:220px;overflow-y:auto"></div>
      </div>
      <div id="r-cs-badge" style="display:none;align-items:center;gap:8px;margin-top:8px;background:#fdf2f8;border:1px solid #f0c8e0;border-radius:8px;padding:8px 12px">
        <div style="flex:1">
          <div id="r-cs-badge-name" style="font-size:13px;color:#d6539a;font-weight:500"></div>
          <div id="r-cs-badge-warn" style="display:none;font-size:11px;color:#d97706;background:#fff7ed;border:1px solid #fde8b8;border-radius:6px;padding:3px 8px;margin-top:6px"></div>
          <div id="r-cs-deuda-warn" style="display:none;font-size:11px;color:#b91c1c;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:4px 8px;margin-top:6px;line-height:1.5"></div>
          <div id="r-cs-aumento-warn" style="display:none"></div>
        </div>
        <button onclick="limpiarClienteRemito()" style="background:none;border:none;color:#c0a8b8;font-size:20px;cursor:pointer;padding:0">×</button>
      </div>
    </div>
    <div class="remito-card" id="remito-card">

  <div class="remito-header" style="position:relative">
    <div class="logo-wrap">
      <img src="data:image/png;base64,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" style="width:56px;height:56px;object-fit:contain;display:block;background:transparent" alt="Intencional"/>
    </div>
    <div>
      <div class="brand-name">Intencional</div>
      <div class="brand-divider"></div>
      <div class="brand-sub">Esmaltes · Cremas · Belleza</div>
    </div>
  </div>


  <div class="section section-grid">
    <div class="field-group" style="grid-column:1/-1">
      <div class="field-label">Nombre del local / cliente</div>
      <div class="field-wrap">
        <input class="field-input" placeholder="Ej: Centro de Estética Luna" type="text" id="f-nombre" autocapitalize="words" autocorrect="off" oninput="toggleClear('f-nombre-clear',this.value)"/>
        <button class="field-clear" id="f-nombre-clear" onclick="clearField('f-nombre','f-nombre-clear')" type="button">×</button>
      </div>
    </div>
    <div class="field-group">
      <div class="field-label">Dirección</div>
      <div class="field-wrap">
        <input class="field-input" placeholder="Calle y número" type="text" id="f-dir" oninput="toggleClear('f-dir-clear',this.value)"/>
        <button class="field-clear" id="f-dir-clear" onclick="clearField('f-dir','f-dir-clear')" type="button">×</button>
      </div>
    </div>
    <div class="field-group">
      <div class="field-label">Localidad</div>
      <div class="field-wrap">
        <input class="field-input" placeholder="Ciudad / Partido" type="text" id="f-loc" oninput="toggleClear('f-loc-clear',this.value)"/>
        <button class="field-clear" id="f-loc-clear" onclick="clearField('f-loc','f-loc-clear')" type="button">×</button>
      </div>
    </div>
    <div class="field-group">
      <div class="field-label">Fecha (dd/mm/aa)</div>
      <input class="field-input" placeholder="08/04/26" type="text" id="f-fecha" maxlength="8" inputmode="numeric"/>
    </div>
    <div class="field-group">
      <div class="field-label">Teléfono / Contacto</div>
      <div class="field-wrap">
        <input class="field-input" placeholder="Opcional" type="text" id="f-tel" oninput="toggleClear('f-tel-clear',this.value)"/>
        <button class="field-clear" id="f-tel-clear" onclick="clearField('f-tel','f-tel-clear')" type="button">×</button>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="productos-title">Detalle de productos</div>
    <table class="productos-table">
      <thead>
        <tr>
          <th class="col-prod">Producto</th>
          <th class="col-cant" style="text-align:center">Cant.</th>
          <th class="col-precio" style="text-align:right">P. Unit. $</th>
          <th class="col-sub" style="text-align:right">Subtotal $</th>
          <th class="col-del"></th>
        </tr>
      </thead>
      <tbody id="productos-body"></tbody>
    </table>
    <button class="add-btn" onclick="addRow()">+ Agregar producto</button>
  </div>

  <div class="section">
    <div class="field-group">
      <div class="field-label">Notas u observaciones</div>
      <input class="notas-input" placeholder="Ej: Pedido especial, cambio de producto..." type="text"/>
    </div>
  </div>

  <div class="pago-section">
    <div>
      <div class="productos-title" style="margin-bottom:8px">Estado de pago</div>
      <div class="pago-opciones">
        <button class="pago-btn" onclick="setPago(this,'active-efectivo')">Efectivo</button>
        <button class="pago-btn" onclick="setPago(this,'active-transferencia')">Transferencia</button>
        <button class="pago-btn" onclick="setPago(this,'active-deuda')">Deuda pendiente</button>
      </div>
    </div>
    <div class="total-area">
      <div class="total-label">Total</div>
      <div class="total-val" id="total-val">$0,00</div>
    </div>
  </div>

  <!-- Desglose de pago (aparece cuando hay dos medios) — SÍ sale en la imagen -->
  <div id="pago-desglose" style="display:none;margin:0 16px 12px"></div>

  <!-- Alias — aparece solo con Transferencia o Deuda -->
  <div class="alias-section" id="alias-section" style="display:none">
    <div class="alias-label">Alias para transferencia</div>
    <div class="alias-opts">
      <button class="alias-btn" id="alias-btn-1" onclick="setAlias(this,1)" style="display:none">Alias 1</button>
      <button class="alias-btn" id="alias-btn-2" onclick="setAlias(this,2)" style="display:none">Alias 2</button>
    </div>
    <input type="hidden" id="alias1-val"/>
    <input type="hidden" id="alias2-val"/>
  </div>

  <div class="deuda-aviso" id="deuda-aviso">
    <p id="deuda-msg"></p>
  </div>

  <!-- Segundo medio de pago (opcional) -->
  <div style="padding:0 16px 12px">
    <button class="toggle-seg-pago" onclick="toggleSegundoPago(this)" style="font-size:12px;color:var(--rose);background:none;border:none;cursor:pointer;font-family:DM Sans,sans-serif;font-weight:600;padding:4px 0;text-decoration:underline">+ Agregar segundo medio de pago</button>
    <div id="segundo-pago-wrap" style="display:none;margin-top:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Segundo pago parcial</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <button class="pago-btn2" onclick="setPago2(this,'efectivo')" style="border:1.5px solid #ead8e4;border-radius:20px;padding:7px 12px;font-size:12px;cursor:pointer;background:#fff;font-family:DM Sans,sans-serif;color:#b099a8;font-weight:600">${ic('cash')} Efectivo</button>
        <button class="pago-btn2" onclick="setPago2(this,'transferencia')" style="border:1.5px solid #ead8e4;border-radius:20px;padding:7px 12px;font-size:12px;cursor:pointer;background:#fff;font-family:DM Sans,sans-serif;color:#b099a8;font-weight:600">${ic('smartphone')} Transferencia</button>
        <button class="pago-btn2" onclick="setPago2(this,'deuda')" style="border:1.5px solid #ead8e4;border-radius:20px;padding:7px 12px;font-size:12px;cursor:pointer;background:#fff;font-family:DM Sans,sans-serif;color:#b099a8;font-weight:600">${ic('clock')} Queda en deuda</button>
      </div>
      <input id="pago2-monto" type="number" min="0" step="0.01" placeholder="Monto del segundo pago $" inputmode="decimal"
        oninput="renderDesglosePago()"
        style="border:1.5px solid #ead8e4;border-radius:10px;padding:9px 12px;font-size:14px;width:100%;box-sizing:border-box;font-family:DM Sans,sans-serif;color:#1a0a12;background:#fff;margin-bottom:6px"/>
      <div id="pago2-resto" style="font-size:11px;color:var(--muted);margin-bottom:6px"></div>
      <div id="pago2-alias-wrap" style="display:none">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Alias para la transferencia parcial</div>
        <div style="display:flex;gap:6px">
          <button class="alias-btn pago2-alias-btn" id="alias-btn2-1" onclick="setAlias2(this,1)" style="display:none">Alias 1</button>
          <button class="alias-btn pago2-alias-btn" id="alias-btn2-2" onclick="setAlias2(this,2)" style="display:none">Alias 2</button>
        </div>
      </div>
    </div>
  </div>

  <div class="no-factura">
    <p>Documento no válido como factura</p>
  </div>

  <div class="remito-footer">
    <div class="footer-gracias">¡Gracias por elegirnos!</div>
    <div class="btn-group">
      <button class="new-btn" onclick="showPage('historial-remitos',document.getElementById('nav-historial-remitos'))">${ic('clipboard')} Ver hechos</button>
      <button class="new-btn" onclick="abrirCrearClienteDesdeRemito()" style="background:var(--subtle);color:var(--rose);border:1.5px solid var(--rose-border)">${ic('user')} Crear cliente</button>
      <button class="share-btn" onclick="compartirRemito()">${ic('check')} Confirmar</button>
    </div>
  </div>

</div>`;

  // Init remito state after DOM update
  setTimeout(async () => {
    rows = [];
    addRow('Esmalte en Gel', 1, '');
    // Reset segundo medio de pago
    _pago2Activo = null; _alias2Activo = 0;
    const _sp2 = document.getElementById('segundo-pago-wrap');
    if (_sp2) { _sp2.style.display = 'none'; }
    const _sp2m = document.getElementById('pago2-monto'); if (_sp2m) _sp2m.value = '';
    document.querySelectorAll('.pago-btn2').forEach(b=>{ b.style.background='#fff'; b.style.color='#b099a8'; b.style.borderColor='#ead8e4'; });
    const _tb2 = document.querySelector('[onclick*="toggleSegundoPago"]');
    if (_tb2) _tb2.textContent = '+ Agregar segundo medio de pago';
    updateDeudaMsg();
    const fEl = document.getElementById('f-fecha');
    if (fEl) fEl.value = todayStr();
    // Precargar alias guardados (DB primero, fallback localStorage)
    try {
      const cfg = await cargarAliasDesdeDB().catch(() => leerAliasConfig());
      const a1 = document.getElementById('alias1-val');
      const a2 = document.getElementById('alias2-val');
      if (a1) a1.value = cfg.alias1 || '';
      if (a2) a2.value = cfg.alias2 || '';
    } catch(e) {
      const cfg = leerAliasConfig();
      const a1 = document.getElementById('alias1-val');
      const a2 = document.getElementById('alias2-val');
      if (a1) a1.value = cfg.alias1 || '';
      if (a2) a2.value = cfg.alias2 || '';
    }
    actualizarBotonesAlias();
  }, 50);

  _remitoLoaded = true;
}

/* ══════════════════════════════════════
   MÓDULO DE STOCK
══════════════════════════════════════ */

// ── Supabase helpers de stock
async function sbStockFetch()  { return sbFetch('stock?select=*&order=categoria.asc,variante.asc'); }
async function sbStockInsert(r){ return sbFetch('stock', { method:'POST', body:JSON.stringify(r) }); }
async function sbStockUpdate(id,d){ return sbFetch('stock?id=eq.'+id, { method:'PATCH', body:JSON.stringify(d) }); }
async function sbStockDelete(id){ return sbFetch('stock?id=eq.'+id, { method:'DELETE', headers:{'Prefer':''} }); }

// ── Helpers Supabase para categorías
async function sbCatsFetch() {
  return sbFetch('stock_categorias?select=*&order=orden.asc,created_at.asc');
}
async function sbCatsInsert(data) {
  return sbFetch('stock_categorias', { method:'POST', body:JSON.stringify(data) });
}
async function sbCatsUpdate(id, data) {
  return sbFetch('stock_categorias?id=eq.'+encodeURIComponent(id), { method:'PATCH', body:JSON.stringify(data) });
}
async function sbCatsDelete(id) {
  return sbFetch('stock_categorias?id=eq.'+encodeURIComponent(id), { method:'DELETE', headers:{'Prefer':''} });
}

// Categorías en memoria — se cargan desde Supabase
let STOCK_CATS = [
  { id:'esmalte', label:'Esmaltes',         icon:'sparkles', unidad:'unid', precio:0, orden:1  },
  { id:'crema',   label:'Cremas de Ordeñe', icon:'droplet',  unidad:'unid', precio:0, orden:2  },
  { id:'otro',    label:'Otros',            icon:'box',      unidad:'unid', precio:0, orden:99 },
];

/* ═══════════ ÍCONOS DE CATEGORÍAS ═══════════
   cat.icon guarda la CLAVE del ícono (ej: 'droplet'), nunca SVG ni emoji.
   catIcon() renderiza cualquier valor legado sin romper, y
   migrarIconosCats() convierte los valores viejos a claves. */

// Render seguro del ícono de una categoría (acepta clave, SVG legado o emoji legado)
function catIcon(cat, size) {
  const v = (cat && cat.icon) || '';
  if (_ICONS[v]) return ic(v, size);
  if (v && v.indexOf('<svg') !== -1) return v;      // SVG crudo legado
  if (v) return esc(v);                              // emoji legado
  return ic('box', size);
}

// Emojis históricos → clave de ícono
const _EMOJI_A_ICONO = {
  '💅':'sparkles', '🧴':'droplet', '💄':'tag', '📦':'box', '🧪':'droplet',
  '🎁':'bag', '🛒':'cart', '💊':'pill', '✂️':'scissors', '🏷️':'tag', '⭐':'sparkles'
};

// Convierte un valor legado (SVG crudo o emoji) a clave. Devuelve la clave o null si ya es clave.
function _iconoLegadoAClave(v) {
  if (!v) return 'box';
  if (_ICONS[v]) return null; // ya es clave, nada que migrar
  if (v.indexOf('<svg') !== -1) {
    for (const k in _ICONS) { if (ic(k) === v) return k; }
    return 'box';
  }
  return _EMOJI_A_ICONO[v.trim()] || 'box';
}

// Migra los íconos legados de STOCK_CATS a claves y persiste solo los que cambian
function migrarIconosCats() {
  STOCK_CATS.forEach(cat => {
    const nueva = _iconoLegadoAClave(cat.icon);
    if (nueva !== null && nueva !== cat.icon) {
      cat.icon = nueva;
      guardarCatEnDB(cat);
    }
  });
  guardarCatsLocal(STOCK_CATS.map(c => ({...c})));
}

// ── Selector visual de íconos ──
// idx = índice en STOCK_CATS, o -1 para el formulario de nueva categoría
function abrirSelectorIcono(idx) {
  let sel = g('icono-selector-modal');
  if (sel) sel.remove();
  const actual = idx >= 0 ? (STOCK_CATS[idx] && STOCK_CATS[idx].icon) : (window._newCatIcon || 'box');
  sel = document.createElement('div');
  sel.id = 'icono-selector-modal';
  sel.style.cssText = 'position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)';
  sel.addEventListener('click', e => { if (e.target === sel) sel.remove(); });
  const grid = Object.keys(_ICONS).map(k =>
    '<button onclick="elegirIcono(' + idx + ',\'' + k + '\')" title="' + k + '" ' +
      'style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;cursor:pointer;' +
      (k === actual
        ? 'background:var(--subtle);border:1.5px solid var(--rose);color:var(--rose)'
        : 'background:var(--surface);border:1px solid var(--border);color:var(--text)') +
    '">' + ic(k, 20) + '</button>'
  ).join('');
  sel.innerHTML =
    '<div style="background:var(--bg);border-radius:16px;max-width:340px;width:90%;max-height:70vh;overflow-y:auto;padding:16px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;color:var(--text)">Elegí un ícono</div>' +
        '<button onclick="g(\'icono-selector-modal\').remove()" style="background:none;border:none;font-size:22px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:8px">' + grid + '</div>' +
    '</div>';
  document.body.appendChild(sel);
}

function elegirIcono(idx, key) {
  const sel = g('icono-selector-modal');
  if (sel) sel.remove();
  if (idx >= 0 && STOCK_CATS[idx]) {
    STOCK_CATS[idx].icon = key;
    guardarCatEnDB(STOCK_CATS[idx]);
    guardarCatsLocal(STOCK_CATS.map(c => ({...c})));
    renderModalCategorias();
    if (typeof renderStock === 'function') renderStock();
  } else {
    window._newCatIcon = key;
    const btn = g('newcat-icon-btn');
    if (btn) btn.innerHTML = ic(key, 20);
  }
}

// Cargar categorías desde Supabase (llamado al cargar stock)
async function cargarCategorias() {
  // Sin internet: usar caché local
  if (!navigator.onLine) {
    const catsLocal = leerCatsLocal();
    if (catsLocal && catsLocal.length) {
      STOCK_CATS.splice(0, STOCK_CATS.length, ...catsLocal);
    }
    migrarIconosCats();
    return;
  }
  try {
    const cats = await sbCatsFetch();
    if (cats && cats.length) {
      STOCK_CATS = cats.map(c => ({
        id:     c.id,
        label:  c.label,
        icon:   c.icon || 'box',
        unidad: c.unidad || 'unid',
        precio: +c.precio || 0,
        orden:  +c.orden  || 99
      }));
      const otro = STOCK_CATS.find(c => c.id === 'otro');
      if (otro) otro.orden = 999;
      STOCK_CATS.sort((a,b) => a.orden - b.orden);
      guardarCatsLocal(STOCK_CATS.map(c => ({...c}))); // guardar para offline
    }
  } catch(e) {
    // Intentar con caché local
    const catsLocal = leerCatsLocal();
    if (catsLocal && catsLocal.length) STOCK_CATS.splice(0, STOCK_CATS.length, ...catsLocal);
    else console.warn('stock_categorias no disponible, usando categorías base:', e.message);
  }
  migrarIconosCats();
}

// Guardar cambios de una categoría en Supabase
async function guardarCatEnDB(cat) {
  try {
    await sbCatsUpdate(cat.id, {
      label:  cat.label,
      icon:   cat.icon,
      precio: cat.precio,
      unidad: cat.unidad,
      orden:  cat.orden
    });
  } catch(e) { console.warn('Error guardando categoría:', e.message); }
}

// Compatibilidad — ya no usamos localStorage
function guardarCatsEnStorage() {
  // Guardamos en Supabase en cambio
  STOCK_CATS.forEach(c => guardarCatEnDB(c));
}

// PRODUCTS dinámico — lee del stock
function getProductsParaRemito() {
  const SIN_VENTA = 'Sin Venta';
  if (_stockCache && _stockCache.length) {
    const prods = [...new Set(_stockCache.map(s => s.nombre))];
    // Agregar "Sin Venta" al final si no está ya
    if (!prods.includes(SIN_VENTA)) prods.push(SIN_VENTA);
    return prods;
  }
  return [SIN_VENTA]; // al menos "Sin Venta" siempre disponible
}

let _stockCache = null;
let _stockCatActiva = 'esmalte';

// Íconos por defecto para categorías desconocidas
const ICONOS_DEFAULT = ['box','tag','bag','folder','sparkles','droplet','pill','store','cart','zap'];
let _iconosIdx = 0;

function sincronizarCategorias() {
  // Detectar categorías en el stock que no están en STOCK_CATS
  const catIds = [...new Set((_stockCache||[]).map(s => s.categoria).filter(Boolean))];
  catIds.forEach(id => {
    if (!STOCK_CATS.find(c => c.id === id)) {
      const label = id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g,' ');
      const icon  = ICONOS_DEFAULT[_iconosIdx++ % ICONOS_DEFAULT.length];
      const orden = STOCK_CATS.length; // antes de "otro"
      const newCat = { id, label, icon, unidad:'unid', precio:0, orden };
      // Insertar antes de "otro"
      const idxOtro = STOCK_CATS.findIndex(c => c.id === 'otro');
      if (idxOtro !== -1) STOCK_CATS.splice(idxOtro, 0, newCat);
      else STOCK_CATS.push(newCat);
      // Guardar en Supabase
      sbCatsInsert({ id, label, icon, unidad:'unid', precio:0, orden }).catch(()=>{});
    }
  });
  // Asegurar "otro" al final
  const idxOtro = STOCK_CATS.findIndex(c => c.id === 'otro');
  if (idxOtro !== -1 && idxOtro !== STOCK_CATS.length - 1) {
    const otro = STOCK_CATS.splice(idxOtro, 1)[0];
    STOCK_CATS.push(otro);
  }
}

/* ── CARGAR Y RENDERIZAR ── */
async function cargarStock() {
  const el = id => document.getElementById(id);
  const resumen = el('stock-resumen');
  const lista   = el('stock-lista');
  const alertas = el('stock-alertas');
  if (resumen) resumen.innerHTML = ['','',''].map(()=>'<div class="stat-card" style="opacity:.4"><div class="stat-label">···</div><div class="stat-value" style="font-size:1.5rem">—</div><div class="stat-sub">cargando...</div></div>').join('');
  if (lista)   lista.innerHTML   = '';
  if (alertas) alertas.innerHTML = '';
  // Sin internet: usar caché local si existe
  if (!navigator.onLine) {
    const stockLocal = leerStockLocal();
    const catsLocal  = leerCatsLocal();
    if (stockLocal && stockLocal.length) {
      _stockCache = stockLocal;
      if (catsLocal && catsLocal.length) STOCK_CATS.splice(0, STOCK_CATS.length, ...catsLocal);
      sincronizarCategorias();
      renderStock();
      toast('📦 Mostrando stock guardado (sin conexión)');
      return;
    }
    if (lista) lista.innerHTML = '<div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">' + ic('signal') + ' Sin conexión y sin datos guardados localmente.</div>';
    return;
  }
  try {
    loading(true);
    await cargarCategorias();
    _stockCache = await sbStockFetch();
    guardarStockLocal(_stockCache);
    guardarCatsLocal(STOCK_CATS.map(c => ({...c})));
    loading(false);
    sincronizarCategorias();
    renderStock();
  } catch(e) {
    loading(false);
    const stockLocal = leerStockLocal();
    if (stockLocal && stockLocal.length) {
      _stockCache = stockLocal;
      sincronizarCategorias();
      renderStock();
      toast('📦 Mostrando stock guardado (error de conexión)');
      return;
    }
    if (resumen) resumen.innerHTML = '';
    if (lista) lista.innerHTML =
      '<div style="background:#fff3cd;border:1px solid #fcd97a;border-radius:var(--radius);padding:12px 14px;font-size:13px;color:#7a5200">'+
      '' + ic('alert') + ' No se pudo cargar el stock. Verificá que la tabla <strong>stock</strong> exista en Supabase.</div>';
  }
}

function renderStock() {
  const items = _stockCache || [];
  const el = id => document.getElementById(id);

  // ── Resumen por categoría
  const resumenEl = el('stock-resumen');
  if (resumenEl) {
    resumenEl.innerHTML = STOCK_CATS.map(cat=>{
      const catItems = items.filter(i=>i.categoria===cat.id);
      const total = catItems.reduce((s,i)=>s+(+i.cantidad||0),0);
      const bajos = catItems.filter(i=>+i.cantidad <= +i.alerta_min && +i.alerta_min > 0).length;
      const activa = cat.id === _stockCatActiva;
      return '<div class="stat-card" style="cursor:pointer;'+(activa?'border-color:var(--rose);box-shadow:0 0 0 2px var(--rose-border)':'')+'" onclick="filtrarStockCat(\''+cat.id+'\')">' +
        '<div class="stat-label">'+catIcon(cat)+' '+cat.label+'</div>'+
        '<div class="stat-value" style="font-size:1.5rem;color:'+(activa?'var(--rose)':'var(--text)')+'">'+total+'</div>'+
        '<div class="stat-sub">'+(bajos>0?'<span style="color:#dc2626">' + ic('alert') + ' '+bajos+' bajo stock</span>':catItems.length+' variantes')+'</div>'+
      '</div>';
    }).join('');
  }

  // ── Alertas
  const alertasEl = el('stock-alertas');
  if (alertasEl) {
    const bajos = items.filter(i=>+i.cantidad <= +i.alerta_min && +i.alerta_min > 0);
    const altos = items.filter(i=>+i.alerta_max > 0 && +i.cantidad >= +i.alerta_max);
    alertasEl.innerHTML =
      bajos.map(i=>'<div class="stock-alerta-item stock-alerta-bajo">⬇ <strong>'+esc(i.nombre+(i.variante?' — '+i.variante:''))+'</strong>: quedan '+i.cantidad+' '+i.unidad+' (mín: '+i.alerta_min+')</div>').join('')+
      altos.map(i=>'<div class="stock-alerta-item stock-alerta-alto">⬆ <strong>'+esc(i.nombre+(i.variante?' — '+i.variante:''))+'</strong>: '+i.cantidad+' '+i.unidad+' (máx: '+i.alerta_max+')</div>').join('');
  }

  // ── Lista filtrada directamente, sin tabs
  const listaWrap = el('stock-lista');
  if (listaWrap) listaWrap.innerHTML = '<div id="stock-lista-inner"></div>';
  renderStockLista();
}

function filtrarStockCat(cat) {
  _stockCatActiva = cat;
  renderStock();
}

function renderStockLista() {
  const items = (_stockCache||[]).filter(i=>i.categoria===_stockCatActiva);
  const el = document.getElementById('stock-lista-inner') || document.getElementById('stock-lista');
  if (!el) return;

  if (!items.length) {
    el.innerHTML = '<div class="card" style="margin-top:4px"><div class="empty-state"><div class="icon">' + ic('box') + '</div><p>No hay productos en esta categoría.<br>Tocá "Agregar producto" para empezar.</p></div></div>';
    return;
  }

  const fp = n => (+n||0).toLocaleString('es-AR');

  // Ordenar: para esmaltes por número de variante, resto por nombre
  const sorted = [...items].sort((a,b)=>{
    const na = parseInt(a.variante), nb = parseInt(b.variante);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return (a.nombre||'').localeCompare(b.nombre||'') || (a.variante||'').localeCompare(b.variante||'');
  });

  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">'+
    sorted.map(i=>{
      const qty  = +i.cantidad||0;
      const bajo = i.alerta_min>0 && qty<=i.alerta_min;
      const alto = i.alerta_max>0 && qty>=i.alerta_max;
      const qColor = bajo?'#dc2626':alto?'#d97706':'var(--text)';
      const catIconHTML = catIcon(STOCK_CATS.find(c=>c.id===i.categoria));
      return '<div class="stock-item" onclick="abrirEditarStock('+i.id+')" style="cursor:pointer">'+
        '<div class="stock-color-badge">'+catIconHTML+'</div>'+
        '<div class="stock-info">'+
          '<div class="stock-nombre">'+esc(i.nombre)+(i.variante?' — '+esc(i.variante):'')+'</div>'+
          '<div class="stock-variante" style="display:flex;gap:8px;align-items:center">'+
            (bajo?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;border-radius:4px;padding:1px 6px;font-weight:700">' + ic('alert') + ' BAJO STOCK</span>':'') +
            (alto?'<span style="font-size:10px;background:#fff7ed;color:#c2410c;border-radius:4px;padding:1px 6px;font-weight:700">SOBRESTOCK</span>':'') +
            ((!bajo&&!alto)&&(i.alerta_min||i.alerta_max)?'<span style="font-size:10px;color:var(--muted)">'+(i.alerta_min?'↓'+i.alerta_min+' ':''+(i.alerta_max?'↑'+i.alerta_max:''))+'</span>':'') +
          '</div>'+
        '</div>'+
        '<div class="stock-qty" style="color:'+qColor+'">'+fp(qty)+'</div>'+
        '<div style="font-size:10px;color:var(--muted);margin-left:-4px">'+esc(i.unidad)+'</div>'+
        '<div class="stock-actions">'+
          '<button class="stock-btn" onclick="event.stopPropagation();ajustarStock('+i.id+',-1)" title="Restar">−</button>'+
          '<button class="stock-btn" onclick="event.stopPropagation();ajustarStock('+i.id+',+1)" title="Sumar">+</button>'+
        '</div>'+
      '</div>';
    }).join('')+
  '</div>';
}

/* ── AJUSTE RÁPIDO (+/-) ── */
async function ajustarStock(id, delta) {
  const item = (_stockCache||[]).find(i=>i.id===id);
  if (!item) return;
  const nuevaQty = Math.max(0, (+item.cantidad||0) + delta);
  try {
    await sbStockUpdate(id, {cantidad: nuevaQty});
    item.cantidad = nuevaQty;
    renderStock();
  } catch(e) { toast('Error: '+e.message); }
}

/* ── MODAL AGREGAR PRODUCTO ── */
function abrirModalCategorias() {
  let modal = g('cats-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cats-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal) cerrarModalCategorias(); });
    document.body.appendChild(modal);
  }
  renderModalCategorias(modal);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function renderModalCategorias(modal) {
  if (!modal) modal = g('cats-modal');
  if (!modal) return;
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('settings') + ' Categorías de productos</div>'+
        '<button onclick="cerrarModalCategorias()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="padding:1rem 1.2rem">'+
        '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">Asigná un precio general por categoría. Se usará para autocompletar en remitos y pedidos cuando el producto no tenga precio individual.</div>'+

        // Lista de categorías
        STOCK_CATS.map((cat, i) => {
          const prodsCat = (_stockCache||[]).filter(s => s.categoria === cat.id);
          const conPrecio = prodsCat.filter(s => +s.precio > 0).length;
          const sinPrecio = prodsCat.length - conPrecio;
          return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;overflow:hidden">'+
            '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px">'+
              '<div>'+
                '<button id="caticon-'+cat.id+'" '+
                  'onclick="abrirSelectorIcono('+i+')" title="Cambiar ícono" '+
                  'style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:var(--surface);cursor:pointer;color:var(--text)">'+
                  catIcon(cat, 20)+
                '</button>'+
              '</div>'+
              '<div style="flex:1;min-width:0">'+
                '<input type="text" value="'+esc(cat.label)+'" '+
                  'onchange="STOCK_CATS['+i+'].label=this.value.trim()||STOCK_CATS['+i+'].label;guardarCatEnDB(STOCK_CATS['+i+'])" '+
                  'style="font-size:13px;font-weight:600;color:var(--text);border:none;background:transparent;width:100%;font-family:Inter,sans-serif;padding:2px 0;border-bottom:1px solid transparent;outline:none" '+
                  'onfocus="this.style.borderBottomColor=\'var(--rose)\'" '+
                  'onblur="this.style.borderBottomColor=\'transparent\'"/>'+
                '<div style="font-size:11px;color:var(--muted)">'+
                  prodsCat.length+' producto'+(prodsCat.length!==1?'s':'')+
                  (sinPrecio > 0 ? ' · <span style="color:#d97706">'+sinPrecio+' sin precio</span>' : ' · <span style="color:#059669">todos con precio</span>')+
                '</div>'+
              '</div>'+
              '<div style="display:flex;align-items:center;gap:6px">'+
                '<span style="font-size:12px;color:var(--muted);font-weight:500">$</span>'+
                '<input type="number" min="0" value="'+(+cat.precio||0)+'" '+
                  'id="catprecio-'+cat.id+'" '+
                  'placeholder="0" inputmode="decimal" '+
                  'onchange="STOCK_CATS['+i+'].precio=+this.value;guardarCatEnDB(STOCK_CATS['+i+'])" '+
                  'style="width:90px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:14px;font-family:Montserrat,sans-serif;font-weight:600;color:var(--rose);background:var(--bg);text-align:right"/>'+
              '</div>'+
              (i >= 3 ?
                '<button onclick="eliminarCategoria(\''+cat.id+'\')" style="background:none;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:5px 8px;font-size:12px;cursor:pointer">' + ic('x') + '</button>'
              : '') +
            '</div>'+
            // Botón aplicar a todos
            (prodsCat.length > 0 ?
              '<div style="border-top:1px solid var(--border);padding:8px 12px;background:var(--bg);display:flex;align-items:center;justify-content:space-between">'+
                '<span style="font-size:11px;color:var(--muted)">Aplicar este precio a todos los productos de esta categoría</span>'+
                '<button onclick="aplicarPrecioCat(\''+cat.id+'\')" '+
                  'style="background:var(--subtle);border:1.5px solid var(--rose-border);color:var(--rose);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:8px">'+
                  '' + ic('check') + ' Aplicar a todos'+
                '</button>'+
              '</div>'
            : '') +
          '</div>';
        }).join('')+

        // Nueva categoría
        '<div style="border:1.5px dashed var(--rose-border);border-radius:var(--radius);padding:12px 14px;margin-top:8px">'+
          '<div style="font-size:12px;font-weight:600;color:var(--rose);margin-bottom:10px">' + ic('plus') + ' Nueva categoría</div>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr 60px;gap:8px;margin-bottom:8px">'+
            '<div><div class="field-label">Nombre</div><input class="field-input" id="newcat-nombre" placeholder="Ej: Perfumes" style="padding:7px 10px;font-size:13px"/></div>'+
            '<div><div class="field-label">Precio general $</div><input class="field-input" id="newcat-precio" type="number" min="0" placeholder="0" style="padding:7px 10px;font-size:13px"/></div>'+
            '<div><div class="field-label">Ícono</div><button id="newcat-icon-btn" onclick="abrirSelectorIcono(-1)" '+
              'style="width:100%;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:var(--surface);cursor:pointer;color:var(--text)">'+
              ic(window._newCatIcon||'box', 18)+'</button></div>'+
          '</div>'+
          '<button onclick="agregarCategoria()" class="btn-primary" style="width:100%;padding:10px;font-size:13px">Agregar categoría</button>'+
        '</div>'+

      '</div>'+
    '</div>';
}

async function aplicarPrecioCat(catId) {
  const cat = STOCK_CATS.find(c => c.id === catId);
  if (!cat) return;
  // Leer el precio actual del input (por si lo acaba de cambiar sin hacer onchange)
  const inputEl = document.getElementById('catprecio-' + catId);
  const precio = inputEl ? Math.max(0, parseFloat(inputEl.value)||0) : (+cat.precio||0);
  if (precio <= 0) { toast('Ingresá un precio mayor a 0 antes de aplicar'); return; }

  const prodsCat = (_stockCache||[]).filter(s => s.categoria === catId);
  if (!prodsCat.length) { toast('No hay productos en esta categoría'); return; }

  const ok = confirm('¿Aplicar $' + precio.toLocaleString('es-AR') + ' a los ' + prodsCat.length + ' producto' + (prodsCat.length !== 1 ? 's' : '') + ' de "' + cat.label + '"?');
  if (!ok) return;

  // Guardar el precio en la categoría
  cat.precio = precio;
  guardarCatsEnStorage();

  // Actualizar en Supabase todos los productos de esta categoría
  try {
    loading(true);
    for (const prod of prodsCat) {
      await sbStockUpdate(prod.id, { precio });
    }
    // Refrescar cache
    _stockCache = await sbStockFetch();
    loading(false);
    toast('✓ Precio $' + precio.toLocaleString('es-AR') + ' aplicado a ' + prodsCat.length + ' producto' + (prodsCat.length !== 1 ? 's' : ''));
    renderModalCategorias(); // refrescar el modal con los nuevos conteos
    renderStock();
  } catch(e) {
    loading(false);
    toast('Error: ' + e.message);
  }
}

function cerrarModalCategorias() {
  const modal = g('cats-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  // Refrescar el stock para mostrar las nuevas categorías
  renderStock();
}

async function agregarCategoria() {
  const nombre = (document.getElementById('newcat-nombre')?.value||'').trim();
  const precio = parseFloat(document.getElementById('newcat-precio')?.value)||0;
  const icon   = _ICONS[window._newCatIcon] ? window._newCatIcon : 'box';
  if (!nombre) { toast('Ingresá el nombre de la categoría'); return; }
  const id = nombre.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  if (STOCK_CATS.find(c => c.id === id)) { toast('Ya existe una categoría con ese nombre'); return; }
  const orden = STOCK_CATS.length;
  const nuevaCat = { id, label: nombre, icon, unidad: 'unid', precio, orden };
  const idxOtro = STOCK_CATS.findIndex(c => c.id === 'otro');
  if (idxOtro !== -1) STOCK_CATS.splice(idxOtro, 0, nuevaCat);
  else STOCK_CATS.push(nuevaCat);
  // Guardar en Supabase
  try {
    await sbCatsInsert({ id, label: nombre, icon, unidad: 'unid', precio, orden });
  } catch(e) { toast('Error guardando en base de datos: ' + e.message); return; }
  window._newCatIcon = null;
  guardarCatsEnStorage();
  renderModalCategorias();
  toast('✓ Categoría "' + nombre + '" agregada');
}

async function eliminarCategoria(id) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  STOCK_CATS = STOCK_CATS.filter(c => c.id !== id);
  try { await sbCatsDelete(id); } catch(e) {}
  renderModalCategorias();
  toast('Categoría eliminada');
}

function abrirModalAgregarProducto() {
  abrirModalStock(null);
}
function abrirEditarStock(id) {
  const item = (_stockCache||[]).find(i=>i.id===id);
  abrirModalStock(item||null);
}

function abrirModalStock(item) {
  let modal = g('stock-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'stock-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal) cerrarStockModal(); });
    document.body.appendChild(modal);
  }

  const esNuevo = !item;
  const catDef = item?.categoria || _stockCatActiva || 'esmalte';
  // Precio del item, o precio de la categoría como default
  const precioDef = item ? (+item.precio||0) : (STOCK_CATS.find(c=>c.id===catDef)?.precio||0);

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">'+(esNuevo?'Agregar producto':'Editar producto')+'</div>'+
        '<button onclick="cerrarStockModal()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="padding:1rem 1.2rem;display:flex;flex-direction:column;gap:14px">'+

        // Categoría
        '<div>'+
          '<div class="field-label">Categoría</div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">'+
            STOCK_CATS.map(cat=>
              '<button id="scat-'+cat.id+'" onclick="selStockCat(\''+cat.id+'\')" class="rubro-chip'+(catDef===cat.id?' selected':'')+'">'+
                catIcon(cat)+' '+cat.label+'</button>'
            ).join('')+
          '</div>'+
        '</div>'+

        // Nombre
        '<div>'+
          '<div class="field-label">Nombre del producto</div>'+
          '<input class="field-input" id="s-nombre" value="'+(item?esc(item.nombre||''):'').replace(/"/g,'&quot;')+'" placeholder="Ej: Esmalte en Gel, Crema de Ordeñe..."/>'+
        '</div>'+

        // Variante (N° de color para esmaltes)
        '<div id="s-variante-wrap">'+
          '<div class="field-label" id="s-variante-label">'+(catDef==='esmalte'?'N° de color':'Variante (opcional)')+'</div>'+
          '<input class="field-input" id="s-variante" value="'+(item?esc(item.variante||''):'').replace(/"/g,'&quot;')+'" placeholder="'+(catDef==='esmalte'?'Ej: 45, 102, Rojo Cereza...':'Ej: 500ml, Grande...')+'"/>'+
        '</div>'+

        // Unidad
        '<div>'+
          '<div class="field-label">Unidad</div>'+
          '<select class="field-input" id="s-unidad">'+
            ['unid','caja','pack','kg','litro'].map(u=>'<option value="'+u+'"'+(item?.unidad===u?' selected':(!item&&u==='unid'?' selected':''))+'>'+u+'</option>').join('')+
          '</select>'+
        '</div>'+

        // Cantidad + Precio + Costo
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">'+
          '<div>'+
            '<div class="field-label">Cantidad</div>'+
            '<input class="field-input" id="s-cantidad" type="number" min="0" value="'+(item?+item.cantidad:0)+'" inputmode="numeric"/>'+
          '</div>'+
          '<div>'+
            '<div class="field-label">Precio venta $</div>'+
            '<input class="field-input" id="s-precio" type="number" min="0" step="0.01" value="'+precioDef+'" inputmode="decimal" placeholder="0"/>'+
          '</div>'+
          '<div>'+
            '<div class="field-label">Costo $</div>'+
            '<input class="field-input" id="s-costo" type="number" min="0" step="0.01" value="'+(item?(+item.costo||0):0)+'" inputmode="decimal" placeholder="0"/>'+
          '</div>'+
        '</div>'+

        // Alertas
        '<div style="background:var(--surface);border-radius:var(--radius);padding:12px 14px;border:1px solid var(--border)">'+
          '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:10px">' + ic('alert') + ' Alertas de stock</div>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
            '<div>'+
              '<div class="field-label" style="color:#dc2626">Mínimo (bajo stock)</div>'+
              '<input class="field-input" id="s-alerta-min" type="number" min="0" value="'+(item?+item.alerta_min:5)+'" inputmode="numeric" placeholder="Ej: 5"/>'+
            '</div>'+
            '<div>'+
              '<div class="field-label" style="color:#d97706">Máximo (sobrestock)</div>'+
              '<input class="field-input" id="s-alerta-max" type="number" min="0" value="'+(item?+item.alerta_max:50)+'" inputmode="numeric" placeholder="Ej: 50"/>'+
            '</div>'+
          '</div>'+
        '</div>'+

      '</div>'+
      '<div style="padding:.8rem 1.2rem;border-top:1px solid var(--border);display:flex;gap:8px;position:sticky;bottom:0;background:var(--bg)">'+
        (!esNuevo?'<button onclick="eliminarStockItem('+item.id+')" style="background:none;border:1px solid #fecaca;color:#dc2626;border-radius:var(--radius);padding:12px 14px;font-size:13px;font-family:Inter,sans-serif;cursor:pointer">Eliminar</button>':'')+
        '<button onclick="cerrarStockModal()" class="modal-cancel-btn" style="flex:1">Cancelar</button>'+
        '<button onclick="guardarStockItem('+(item?item.id:'null')+')" class="modal-save-btn" style="flex:2">Guardar</button>'+
      '</div>'+
    '</div>';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  window._stockCatSeleccionada = catDef;
}

function selStockCat(cat) {
  window._stockCatSeleccionada = cat;
  document.querySelectorAll('[id^="scat-"]').forEach(b=>b.classList.remove('selected'));
  const btn = document.getElementById('scat-'+cat);
  if (btn) btn.classList.add('selected');
  const lbl = document.getElementById('s-variante-label');
  const inp = document.getElementById('s-variante');
  if (lbl) lbl.textContent = cat==='esmalte' ? 'N° de color' : 'Variante (opcional)';
  if (inp) inp.placeholder = cat==='esmalte' ? 'Ej: 45, 102, Rojo Cereza...' : 'Ej: 500ml, Grande...';
  const nom = document.getElementById('s-nombre');
  if (nom && !nom.value) {
    const catObj = STOCK_CATS.find(c=>c.id===cat);
    if (catObj && catObj.label !== 'Otros') nom.value = catObj.label;
  }
  // Autocompletar precio de la categoría si el campo precio está vacío o en 0
  const precioEl = document.getElementById('s-precio');
  if (precioEl && (!precioEl.value || +precioEl.value === 0)) {
    const catObj = STOCK_CATS.find(c=>c.id===cat);
    if (catObj && +catObj.precio > 0) precioEl.value = catObj.precio;
  }
}

function cerrarStockModal() {
  const modal = g('stock-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function guardarStockItem(id) {
  const nombre    = (g('s-nombre')?.value||'').trim();
  const variante  = (g('s-variante')?.value||'').trim();
  const unidad    = g('s-unidad')?.value || 'unid';
  const cantidad  = Math.max(0, parseInt(g('s-cantidad')?.value)||0);
  const precio    = Math.max(0, parseFloat(g('s-precio')?.value)||0);
  const costo    = Math.max(0, parseFloat(g('s-costo')?.value)||0);
  const alertaMin = Math.max(0, parseInt(g('s-alerta-min')?.value)||0);
  const alertaMax = Math.max(0, parseInt(g('s-alerta-max')?.value)||0);
  const categoria = window._stockCatSeleccionada || 'otro';

  if (!nombre) { toast('Ingresá el nombre del producto'); return; }

  const btn = document.querySelector('#stock-modal .modal-save-btn');
  if (btn) { btn.disabled=true; btn.textContent='Guardando...'; }

  const datos = { nombre, variante, unidad, cantidad, precio, costo, alerta_min: alertaMin, alerta_max: alertaMax, categoria };
  try {
    if (id) {
      await sbStockUpdate(id, datos);
      toast('✓ Producto actualizado');
    } else {
      await sbStockInsert(datos);
      toast('✓ Producto agregado');
    }
    cerrarStockModal();
    _stockCache = null;
    await cargarStock();
  } catch(e) {
    toast('Error: '+e.message);
    if (btn) { btn.disabled=false; btn.textContent='Guardar'; }
  }
}

async function eliminarStockItem(id) {
  if (!confirm('¿Eliminar este producto del stock?')) return;
  try {
    await sbStockDelete(id);
    cerrarStockModal();
    _stockCache = null;
    await cargarStock();
    toast('Producto eliminado');
  } catch(e) { toast('Error: '+e.message); }
}

/* ── ARRANQUE ── */
async function iniciarApp() {
  loading(true);
  try {
    await actualizarCounter();
    actualizarPreview();
    await actualizarBadgeIncompletos();
    actualizarDashboard();
    // Cargar pedidos en background para que el mosaico tenga los badges
    sbPedidosFetch('select=*').then(peds => {
      _pedidosCache = peds;
      const pedPorCliente = {};
      peds.filter(p=>p.estado==='pendiente').forEach(p=>{
        if(p.cliente_nombre) pedPorCliente[p.cliente_nombre]=(pedPorCliente[p.cliente_nombre]||0)+1;
      });
      window._pedPorCliente = pedPorCliente;
      actualizarBadgePedidos();
    }).catch(()=>{});
  } catch(e) {
    console.error('Arranque error:', e);
    g('counter-badge').textContent = 'Error';
    mostrarErrorConexion(e.message || 'No se pudo conectar');
  } finally {
    loading(false);
  }
}

// Se llama desde el HTML una vez que la sesión está verificada
// Si _authSession ya existe cuando este script carga, arranca solo
if (typeof _authSession !== 'undefined' && _authSession) {
  iniciarApp();
}

/* ═══════════════════════════════════════
   MÓDULO PEDIDOS
═══════════════════════════════════════ */

var _pedidosCache = [];
var _pedidosEstado = 'pendiente';
var _pedidoClienteActual = null;

// ── Supabase helpers
async function sbPedidosFetch(qs) {
  return sbFetch('pedidos?' + qs + '&order=created_at.desc');
}
async function sbPedidosInsert(data) {
  return sbFetch('pedidos', { method:'POST', body:JSON.stringify(data) });
}
async function sbPedidosUpdate(id, data) {
  return sbFetch('pedidos?id=eq.' + id, { method:'PATCH', body:JSON.stringify(data) });
}
async function sbPedidosDelete(id) {
  return sbFetch('pedidos?id=eq.' + id, { method:'DELETE' });
}

// ── Cargar pedidos
async function cargarPedidos() {
  const lista = document.getElementById('pedidos-lista');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando pedidos...</div>';
  try {
    _pedidosCache = await sbPedidosFetch('select=*');
    // Actualizar mapa de pedidos por cliente (para hojas de ruta)
    const pedPorCliente = {};
    _pedidosCache.filter(p => p.estado === 'pendiente').forEach(p => {
      if (p.cliente_nombre) pedPorCliente[p.cliente_nombre] = (pedPorCliente[p.cliente_nombre]||0) + 1;
    });
    window._pedPorCliente = pedPorCliente;
    renderPedidos();
    actualizarBadgePedidos();
  } catch(e) {
    if (lista) lista.innerHTML = '<div style="background:#fff3cd;border:1px solid #fcd97a;border-radius:var(--radius);padding:12px 14px;font-size:13px;color:#7a5200">' + ic('alert') + ' No se pudieron cargar los pedidos. Verificá que la tabla <strong>pedidos</strong> exista en Supabase.</div>';
  }
}

function actualizarBadgePedidos() {
  const pendientes = _pedidosCache.filter(p => p.estado === 'pendiente').length;
  const badge = document.getElementById('nav-badge-pedidos');
  const badgePend = document.getElementById('badge-pendientes');
  if (badge) { badge.textContent = pendientes; badge.style.display = pendientes ? '' : 'none'; }
  if (badgePend) { badgePend.textContent = pendientes; badgePend.style.display = pendientes ? '' : 'none'; }
}

function filtrarPedidos(estado) {
  _pedidosEstado = estado;
  const btnP = document.getElementById('tab-pendientes');
  const btnE = document.getElementById('tab-entregados');
  if (btnP && btnE) {
    if (estado === 'pendiente') {
      btnP.style.cssText = 'border:1.5px solid var(--rose);background:var(--subtle);color:var(--rose);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;-webkit-tap-highlight-color:transparent;transition:all .12s';
      btnE.style.cssText = 'border:1.5px solid var(--border);background:var(--bg);color:var(--muted);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all .12s';
    } else {
      btnE.style.cssText = 'border:1.5px solid var(--rose);background:var(--subtle);color:var(--rose);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all .12s';
      btnP.style.cssText = 'border:1.5px solid var(--border);background:var(--bg);color:var(--muted);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;-webkit-tap-highlight-color:transparent;transition:all .12s';
    }
  }
  renderPedidos();
}

function renderPedidos() {
  const lista = document.getElementById('pedidos-lista');
  if (!lista) return;
  const filtrados = _pedidosCache.filter(p => p.estado === _pedidosEstado);
  if (!filtrados.length) {
    lista.innerHTML =
      '<div class="card" style="padding:2rem;text-align:center">'+
        '<div style="font-size:32px;margin-bottom:10px">'+(_pedidosEstado==='pendiente'?'' + ic('clock') + '':'' + ic('check') + '')+'</div>'+
        '<div style="font-size:14px;color:var(--muted)">'+
          (_pedidosEstado==='pendiente'?'No hay pedidos pendientes':'No hay pedidos entregados')+
        '</div>'+
      '</div>';
    return;
  }
  lista.innerHTML = filtrados.map(p => pedidoCard(p)).join('');
}

function pedidoCard(p) {
  const esPendiente = p.estado === 'pendiente';
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

  // Parsear productos
  let filas = [];
  try { filas = JSON.parse(p.descripcion||'[]'); } catch(e) { filas = []; }
  const esJSON = Array.isArray(filas) && filas.length;

  // Tabla de productos
  const productosHTML = esJSON
    ? '<div style="margin:8px 0 6px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">'+
        '<div style="display:grid;grid-template-columns:1fr .8fr .6fr .7fr;background:var(--surface);padding:6px 10px;gap:6px">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Producto</div>'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Variante</div>'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:center">Cant.</div>'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:right">Subtotal</div>'+
        '</div>'+
        filas.map(f =>
          '<div style="display:grid;grid-template-columns:1fr .8fr .6fr .7fr;padding:7px 10px;gap:6px;border-top:1px solid var(--border)">'+
            '<div style="font-size:13px;color:var(--text)">'+esc(f.nombre||'')+'</div>'+
            '<div style="font-size:13px;color:var(--muted)">'+esc(f.variante||'—')+'</div>'+
            '<div style="font-size:13px;color:var(--muted);text-align:center">'+esc(String(f.cantidad||1))+'</div>'+
            '<div style="font-size:13px;font-weight:500;color:var(--text);text-align:right">'+fp(f.monto||0)+'</div>'+
          '</div>'
        ).join('')+
      '</div>'
    : '<div style="font-size:13px;color:var(--text2);margin:6px 0">'+esc(p.descripcion||'')+'</div>';

  return '<div class="card" style="margin-bottom:10px;padding:14px 16px">'+
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px">'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-size:14px;font-weight:600;color:var(--text)">'+esc(p.cliente_nombre||'Sin cliente')+'</div>'+
        (p.cliente_loc?'<div style="font-size:11px;color:var(--muted)">' + ic('pin') + ' '+esc(p.cliente_loc)+(p.cliente_ruta?' · Ruta '+esc(p.cliente_ruta):'')+'</div>':'')+
      '</div>'+
      '<div style="display:flex;gap:6px;flex-shrink:0">'+
        (esPendiente
          ? '<button onclick="marcarEntregado('+p.id+')" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:5px 10px;font-size:12px;color:#15803d;cursor:pointer;font-family:Inter,sans-serif;font-weight:600;white-space:nowrap">' + ic('check') + ' Entregar</button>'
          : '<button onclick="marcarPendiente('+p.id+')" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:5px 10px;font-size:12px;color:#c2410c;cursor:pointer;font-family:Inter,sans-serif;font-weight:600;white-space:nowrap">↩ Reabrir</button>'
        )+
        '<button onclick="abrirEditarPedido('+p.id+')" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 8px;font-size:13px;cursor:pointer">' + ic('edit') + '</button>'+
        '<button onclick="eliminarPedido('+p.id+')" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 8px;font-size:13px;cursor:pointer">' + ic('trash') + '</button>'+
      '</div>'+
    '</div>'+
    productosHTML +
    (p.notas?'<div style="font-size:12px;color:var(--muted);font-style:italic;margin-top:4px">' + ic('message') + ' '+esc(p.notas)+'</div>':'')+
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">'+
      '<div style="font-size:11px;color:var(--muted)">' + ic('calendar') + ' '+esc(p.fecha_pedido||'')+'</div>'+
      (p.total ? '<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:700;color:var(--rose)">'+fp(p.total)+'</div>' : '')+
      (p.fecha_entrega?'<div style="font-size:11px;color:#059669;font-weight:500">Entregado: '+esc(p.fecha_entrega)+'</div>':'')+
    '</div>'+
  '</div>';
}

// ── Modal nuevo pedido
var _pmFilas = []; // [{producto, variante, monto}]

function pmFilaVacia() { return { stockId: null, nombre:'', variante:'', cantidad:1, precio:'', monto:0 }; }

function pmAgregarFila(data) {
  _pmFilas.push(data || pmFilaVacia());
  pmRenderFilas();
}

function pmEliminarFila(idx) {
  _pmFilas.splice(idx, 1);
  pmRenderFilas();
}

// ── Render filas con selector de stock
function pmGetStockOpciones() {
  return (_stockCache||[]).map(s => ({
    id: s.id,
    nombre: s.nombre,
    variante: s.variante || '',
    cantidad: +s.cantidad || 0,
    unidad: s.unidad || 'unid'
  }));
}

// Devuelve variantes únicas de un nombre de producto
function pmGetVariantes(nombreProd) {
  return (_stockCache||[])
    .filter(s => s.nombre === nombreProd && s.variante)
    .map(s => ({ id: s.id, variante: s.variante, cantidad: +s.cantidad||0, unidad: s.unidad||'unid' }));
}

// Devuelve nombres únicos de productos del stock
function pmGetNombres() {
  const names = [...new Set((_stockCache||[]).map(s => s.nombre))];
  return names;
}

function pmActualizarSubtotal(i) {
  const f = _pmFilas[i];
  const cant = parseFloat(f.cantidad)||0;
  const precio = parseFloat(f.precio)||0;
  f.monto = cant * precio;
  pmActualizarTotal();
  // Actualizar el display del subtotal
  const el = document.getElementById('pm-sub-'+i);
  if (el) el.textContent = '$' + f.monto.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
}

function pmRenderFilas() {
  const wrap = document.getElementById('pm-productos-wrap');
  if (!wrap) return;
  if (!_pmFilas.length) {
    wrap.innerHTML = '<div style="font-size:13px;color:var(--muted);text-align:center;padding:10px 0">No hay productos. Tocá "Agregar producto".</div>';
    pmActualizarTotal();
    return;
  }
  const opciones = pmGetStockOpciones();
  const nombres = pmGetNombres();

  wrap.innerHTML = _pmFilas.map((f, i) => {
    // Variantes del producto seleccionado
    const variantesDisp = f.nombre ? pmGetVariantes(f.nombre) : [];

    // Stock del item actual
    let stockInfo = '';
    if (f.stockId && f.stockId !== '__custom__') {
      const item = opciones.find(o => o.id === f.stockId);
      if (item) {
        const cant = parseFloat(f.cantidad)||1;
        if (item.cantidad <= 0)
          stockInfo = '<span style="font-size:11px;color:#dc2626">' + ic('alert') + ' Sin stock</span>';
        else if (cant > item.cantidad)
          stockInfo = '<span style="font-size:11px;color:#d97706">' + ic('alert') + ' Hay solo '+item.cantidad+' '+item.unidad+'</span>';
        else
          stockInfo = '<span style="font-size:11px;color:#059669">' + ic('check') + ' '+item.cantidad+' '+item.unidad+' disp.</span>';
      }
    }

    const isCustom = f.stockId === '__custom__';
    const subtotal = (parseFloat(f.cantidad)||0) * (parseFloat(f.precio)||0);

    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-bottom:8px">'+

      // Fila 1: Producto + Variante + botón eliminar
      '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">'+

        // Columna producto
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">Producto</div>'+
          (isCustom
            ? '<input class="field-input" value="'+esc(f.nombre||'')+'" placeholder="Nombre del producto" '+
                'oninput="_pmFilas['+i+'].nombre=this.value" style="padding:7px 10px;font-size:13px"/>'
            : '<select class="field-input" style="padding:7px 10px;font-size:13px" '+
                'onchange="pmCambiarNombre('+i+',this.value)">'+
                '<option value="">— Elegir producto —</option>'+
                nombres.map(n=>'<option value="'+esc(n)+'"'+(f.nombre===n?' selected':'')+'>'+esc(n)+'</option>').join('')+
                '<option value="__custom__">Personalizado...</option>'+
              '</select>'
          )+
        '</div>'+

        // Columna variante (solo si hay variantes o es custom)
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">Variante</div>'+
          (isCustom
            ? '<input class="field-input" value="'+esc(f.variante||'')+'" placeholder="Ej: N°24, 1L..." '+
                'oninput="_pmFilas['+i+'].variante=this.value" style="padding:7px 10px;font-size:13px"/>'
            : variantesDisp.length
              ? '<!-- buscador variante -->'+
                '<input class="field-input" id="pm-var-search-'+i+'" '+
                  'value="'+esc(f.variante||'')+'" placeholder="Buscar variante..." '+
                  'oninput="pmBuscarVariante('+i+',this.value)" '+
                  'onfocus="pmMostrarVariantes('+i+')" '+
                  'style="padding:7px 10px;font-size:13px"/>'+
                '<div id="pm-var-list-'+i+'" style="display:none;position:absolute;z-index:50;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 16px rgba(0,0,0,.1);max-height:160px;overflow-y:auto;min-width:160px">'+
                  variantesDisp.map(v=>
                    '<div onclick="pmSeleccionarVariante('+i+','+v.id+',\''+esc(v.variante)+'\')" '+
                      'style="padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border)" '+
                      'onmouseover="this.style.background=\'var(--subtle)\'" onmouseout="this.style.background=\'\'">'+
                      esc(v.variante)+
                      '<span style="font-size:11px;color:var(--muted);margin-left:6px">'+v.cantidad+' '+v.unidad+'</span>'+
                    '</div>'
                  ).join('')+
                '</div>'
              : '<input class="field-input" value="'+esc(f.variante||'')+'" placeholder="—" '+
                  'oninput="_pmFilas['+i+'].variante=this.value" style="padding:7px 10px;font-size:13px"/>'
          )+
        '</div>'+

        // Botón eliminar
        '<button onclick="pmEliminarFila('+i+')" style="margin-top:18px;background:none;border:1px solid var(--border);border-radius:8px;width:32px;height:32px;font-size:14px;cursor:pointer;color:var(--muted);flex-shrink:0">×</button>'+
      '</div>'+

      // Fila 2: Cant × Precio = Subtotal + alerta stock
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
        '<div style="flex:1;min-width:60px">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">Cant.</div>'+
          '<input class="field-input" value="'+esc(String(f.cantidad||1))+'" type="number" min="1" placeholder="1" '+
            'oninput="_pmFilas['+i+'].cantidad=this.value;pmActualizarSubtotal('+i+')" '+
            'style="padding:7px 10px;font-size:13px"/>'+
        '</div>'+
        '<div style="color:var(--muted);font-size:16px;margin-top:14px">×</div>'+
        '<div style="flex:1;min-width:80px">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">Precio unit.</div>'+
          '<input class="field-input" value="'+esc(String(f.precio||''))+'" type="number" min="0" placeholder="0" '+
            'oninput="_pmFilas['+i+'].precio=this.value;pmActualizarSubtotal('+i+')" '+
            'style="padding:7px 10px;font-size:13px"/>'+
        '</div>'+
        '<div style="color:var(--muted);font-size:16px;margin-top:14px">=</div>'+
        '<div style="flex:1;min-width:80px">'+
          '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">Subtotal</div>'+
          '<div id="pm-sub-'+i+'" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--rose);padding:7px 4px">'+
            '$'+subtotal.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0})+
          '</div>'+
        '</div>'+
        (stockInfo ? '<div style="margin-top:14px;white-space:nowrap">'+stockInfo+'</div>' : '')+
      '</div>'+

    '</div>';
  }).join('');

  pmActualizarTotal();
}

function pmCambiarNombre(i, val) {
  if (val === '__custom__') {
    _pmFilas[i].stockId = '__custom__';
    _pmFilas[i].nombre = '';
    _pmFilas[i].variante = '';
    _pmFilas[i].precio = '';
    _pmFilas[i].monto = 0;
  } else {
    _pmFilas[i].nombre = val;
    _pmFilas[i].variante = '';
    _pmFilas[i].stockId = null;
    _pmFilas[i].precio = '';
    _pmFilas[i].monto = 0;
    // Si solo hay una variante, seleccionarla y autocompletar precio
    const vars = pmGetVariantes(val);
    if (vars.length === 1) {
      _pmFilas[i].stockId = vars[0].id;
      _pmFilas[i].variante = vars[0].variante;
      const item = (_stockCache||[]).find(s => s.id === vars[0].id);
      if (item && item.precio && +item.precio > 0) {
        _pmFilas[i].precio = +item.precio;
        _pmFilas[i].monto = (_pmFilas[i].cantidad||1) * +item.precio;
      }
    }
  }
  pmRenderFilas();
}

function pmMostrarVariantes(i) {
  const list = document.getElementById('pm-var-list-'+i);
  if (list) list.style.display = 'block';
  // Cerrar al hacer click fuera
  setTimeout(() => {
    const handler = (e) => {
      if (!list) return;
      if (!list.contains(e.target) && e.target.id !== 'pm-var-search-'+i) {
        list.style.display = 'none';
        document.removeEventListener('click', handler);
      }
    };
    document.addEventListener('click', handler);
  }, 10);
}

function pmBuscarVariante(i, q) {
  const list = document.getElementById('pm-var-list-'+i);
  if (!list) return;
  const vars = pmGetVariantes(_pmFilas[i].nombre||'');
  const filtradas = q
    ? vars.filter(v => v.variante.toLowerCase().includes(q.toLowerCase()))
    : vars;
  list.innerHTML = filtradas.map(v=>
    '<div onclick="pmSeleccionarVariante('+i+','+v.id+',\''+esc(v.variante)+'\')" '+
      'style="padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border)" '+
      'onmouseover="this.style.background=\'var(--subtle)\'" onmouseout="this.style.background=\'\'">'+
      esc(v.variante)+
      '<span style="font-size:11px;color:var(--muted);margin-left:6px">'+v.cantidad+' '+v.unidad+'</span>'+
    '</div>'
  ).join('') || '<div style="padding:8px 12px;font-size:13px;color:var(--muted)">Sin resultados</div>';
  list.style.display = 'block';
}

function pmSeleccionarVariante(i, stockId, variante) {
  _pmFilas[i].stockId = stockId;
  _pmFilas[i].variante = variante;
  // Autocompletar precio desde stock
  const item = (_stockCache||[]).find(s => s.id === stockId);
  if (item && item.precio && +item.precio > 0) {
    _pmFilas[i].precio = +item.precio;
    _pmFilas[i].monto = (_pmFilas[i].cantidad||1) * +item.precio;
  }
  const list = document.getElementById('pm-var-list-'+i);
  if (list) list.style.display = 'none';
  const input = document.getElementById('pm-var-search-'+i);
  if (input) input.value = variante;
  pmRenderFilas();
}

function pmSeleccionarProducto(idx, val) {
  pmCambiarNombre(idx, val);
}

function pmActualizarTotal() {
  const total = _pmFilas.reduce((s, f) => s + (f.monto||0), 0);
  const el = document.getElementById('pm-total-display');
  if (el) el.textContent = '$' + total.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:0});
  return total;
}

async function abrirModalNuevoPedido() {
  _pedidoClienteActual = null;
  _pmFilas = [pmFilaVacia()];
  document.getElementById('pm-id').value = '';
  document.getElementById('pm-cliente-search').value = '';
  document.getElementById('pm-cliente-search').style.display = '';
  document.getElementById('pm-cliente-results').style.display = 'none';
  document.getElementById('pm-cliente-badge').style.display = 'none';
  document.getElementById('pm-notas').value = '';
  document.getElementById('pm-fecha').value = todayStr();
  document.getElementById('pedido-modal-title').textContent = 'Nuevo pedido';
  document.getElementById('pm-save-btn').textContent = 'Guardar pedido';
  document.getElementById('pedido-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Asegurar stock cargado
  if (!_stockCache || !_stockCache.length) {
    try { _stockCache = await sbStockFetch(); } catch(e) {}
  }
  pmRenderFilas();
  setTimeout(() => document.getElementById('pm-cliente-search').focus(), 100);
}

function abrirEditarPedido(id) {
  const p = _pedidosCache.find(x => x.id === id);
  if (!p) return;
  _pedidoClienteActual = { local: p.cliente_nombre, tel: p.cliente_tel, loc: p.cliente_loc, ruta: p.cliente_ruta, num_str: p.cliente_num };
  // Parsear productos guardados
  try {
    _pmFilas = JSON.parse(p.descripcion||'[]');
    if (!Array.isArray(_pmFilas) || !_pmFilas.length) throw new Error();
    // Compatibilidad con pedidos viejos que usaban 'producto'
    _pmFilas = _pmFilas.map(f => ({
      stockId: f.stockId||null,
      nombre: f.nombre||f.producto||'',
      variante: f.variante||'',
      cantidad: f.cantidad||1,
      precio: f.precio||'',
      monto: f.monto||0
    }));
  } catch(e) {
    _pmFilas = [{ stockId:null, nombre:p.descripcion||'', variante:'', cantidad:1, precio:'', monto:0 }];
  }
  document.getElementById('pm-id').value = id;
  document.getElementById('pm-cliente-search').value = '';
  document.getElementById('pm-cliente-search').style.display = 'none';
  const badge = document.getElementById('pm-cliente-badge');
  badge.style.display = 'flex';
  document.getElementById('pm-cliente-badge-name').textContent = (p.cliente_num ? p.cliente_num + ' — ' : '') + (p.cliente_nombre||'');
  document.getElementById('pm-notas').value = p.notas || '';
  document.getElementById('pm-fecha').value = p.fecha_pedido || '';
  document.getElementById('pm-cliente-results').style.display = 'none';
  document.getElementById('pedido-modal-title').textContent = 'Editar pedido';
  document.getElementById('pm-save-btn').textContent = 'Guardar cambios';
  document.getElementById('pedido-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  pmRenderFilas();
}

function cerrarModalPedido() {
  document.getElementById('pedido-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// ── Buscar cliente en el modal
async function buscarClientePedido(q) {
  const results = document.getElementById('pm-cliente-results');
  if (!q || q.length < 2) { results.style.display = 'none'; return; }
  const todos = await cargarDB();
  const ql = q.toLowerCase();
  const filtrados = todos.filter(c =>
    (c.local||'').toLowerCase().includes(ql) ||
    (c.num_str||'').toLowerCase().includes(ql)
  ).slice(0, 6);
  if (!filtrados.length) { results.style.display = 'none'; return; }
  results.innerHTML = filtrados.map((c,i) =>
    '<div onclick="seleccionarClientePedido('+i+')" data-idx="'+i+'" '+
      'style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border);font-size:13px" '+
      'onmouseover="this.style.background=\'var(--subtle)\'" onmouseout="this.style.background=\'\'">'+
      '<div style="font-weight:600;color:var(--text)">'+esc(c.num_str||'')+(c.num_str?' — ':'')+esc(c.local||'')+'</div>'+
      '<div style="font-size:11px;color:var(--muted)">'+[c.loc,c.tel].filter(Boolean).map(esc).join(' · ')+'</div>'+
    '</div>'
  ).join('');
  results._data = filtrados;
  results.style.display = 'block';
}

function seleccionarClientePedido(idx) {
  const results = document.getElementById('pm-cliente-results');
  const c = (results._data||[])[idx];
  if (!c) return;
  _pedidoClienteActual = c;
  document.getElementById('pm-cliente-search').value = '';
  document.getElementById('pm-cliente-search').style.display = 'none';
  results.style.display = 'none';
  const badge = document.getElementById('pm-cliente-badge');
  badge.style.display = 'flex';
  document.getElementById('pm-cliente-badge-name').textContent = (c.num_str||'') + ' — ' + (c.local||'');
  const ruta = parseRuta(c.ruta);
  _pedidoClienteActual._ruta = ruta.orden || '';
}

function limpiarClientePedido() {
  _pedidoClienteActual = null;
  document.getElementById('pm-cliente-badge').style.display = 'none';
  document.getElementById('pm-cliente-search').style.display = '';
  document.getElementById('pm-cliente-search').value = '';
  document.getElementById('pm-cliente-search').focus();
}

// ── Guardar pedido
async function guardarPedido() {
  const filas = _pmFilas.filter(f => f.nombre && f.nombre.trim());
  if (!filas.length) { toast('Agregá al menos un producto'); return; }

  // Verificar stock — avisar si hay problemas pero permitir guardar
  const opciones = pmGetStockOpciones();
  const alertas = [];
    filas.forEach(f => {
      if (f.stockId && f.stockId !== '__custom__') {
        const item = (_stockCache||[]).find(o => o.id === f.stockId);
        if (item) {
          const cant = parseFloat(f.cantidad)||1;
          if (item.cantidad <= 0) alertas.push(f.nombre + ': sin stock');
          else if (cant > item.cantidad) alertas.push(f.nombre + ': pedís ' + cant + ' pero hay ' + item.cantidad);
        }
      }
    });
  if (alertas.length) {
    const ok = confirm('Problema de stock:\n' + alertas.join('\n') + '\n\n¿Guardás el pedido igual?');
    if (!ok) return;
  }

  const btn = document.getElementById('pm-save-btn');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const id = document.getElementById('pm-id').value;
    const c = _pedidoClienteActual;
    const total = _pmFilas.reduce((s, f) => s + (parseFloat(f.monto)||0), 0);
    const datos = {
      cliente_num:    c ? (c.num_str||'') : '',
      cliente_nombre: c ? (c.local||'')   : '',
      cliente_tel:    c ? (c.tel||'')     : '',
      cliente_loc:    c ? (c.loc||'')     : '',
      cliente_ruta:   c ? (c._ruta||parseRuta(c.ruta||'').orden||'') : '',
      descripcion:    JSON.stringify(filas),
      notas:          (document.getElementById('pm-notas').value||'').trim(),
      fecha_pedido:   (document.getElementById('pm-fecha').value||'').trim(),
      total:          total,
      estado:         'pendiente'
    };
    if (id) {
      delete datos.estado;
      await sbPedidosUpdate(parseInt(id), datos);
    } else {
      await sbPedidosInsert(datos);
    }
    cerrarModalPedido();
    await cargarPedidos();
    toast(id ? '✓ Pedido actualizado' : '✓ Pedido registrado');
  } catch(e) {
    toast('Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar pedido';
  }
}

// ── Marcar entregado — descuenta stock automáticamente
async function marcarEntregado(id) {
  const p = _pedidosCache.find(x => x.id === id);
  if (!p) return;
  try {
    // Descontar del stock
    let filas = [];
    try { filas = JSON.parse(p.descripcion||'[]'); } catch(e){}
    const stockActual = await sbStockFetch();
    for (const f of filas) {
      if (!f.stockId || f.stockId === '__custom__') continue;
      const item = stockActual.find(s => s.id === f.stockId);
      if (!item) continue;
      const cant = parseFloat(f.cantidad)||1;
      const nuevaCant = Math.max(0, (+item.cantidad||0) - cant);
      await sbFetch('stock?id=eq.' + f.stockId, {
        method: 'PATCH',
        body: JSON.stringify({ cantidad: nuevaCant })
      });
    }
    // Marcar entregado
    await sbPedidosUpdate(id, { estado:'entregado', fecha_entrega: todayStr() });
    // Refrescar stock cache
    _stockCache = await sbStockFetch();
    await cargarPedidos();
    toast('✅ Pedido entregado — stock actualizado');
  } catch(e) { toast('Error: ' + e.message); }
}

async function marcarPendiente(id) {
  try {
    await sbPedidosUpdate(id, { estado:'pendiente', fecha_entrega: null });
    await cargarPedidos();
    toast('↩ Pedido reabierto');
  } catch(e) { toast('Error: ' + e.message); }
}

// ── Eliminar pedido
async function eliminarPedido(id) {
  if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
  try {
    await sbPedidosDelete(id);
    await cargarPedidos();
    toast('Pedido eliminado');
  } catch(e) { toast('Error: ' + e.message); }
}

/* ═══════════════════════════════════════
   MÓDULO GASTOS
═══════════════════════════════════════ */

// Categorías de gastos predefinidas
const GASTO_CATS = [
  { id:'combustible', label:'Combustible',   icon:'' + ic('fuel') + '' },
  { id:'patente',     label:'Patente',        icon:'' + ic('file') + '' },
  { id:'seguro',      label:'Seguro',         icon:'' + ic('shield') + '' },
  { id:'mantenimiento',label:'Mantenimiento', icon:'' + ic('tool') + '' },
  { id:'publicidad',  label:'Publicidad',     icon:'' + ic('megaphone') + '' },
  { id:'insumos',     label:'Insumos',        icon:'' + ic('droplet') + '' },
  { id:'impuestos',   label:'Impuestos',      icon:'' + ic('building') + '' },
  { id:'otro',        label:'Otro',           icon:'' + ic('box') + '' },
];

let _gastosCache = [];

async function sbGastosFetch(qs) {
  // Intentar con order=fecha.desc primero, fallback sin order si falla
  try {
    return await sbFetch('gastos?' + (qs||'select=*') + '&order=fecha.desc');
  } catch(e) {
    // Si falla por el order, intentar sin él
    if (e.message && (e.message.includes('fecha') || e.message.includes('order') || e.message.includes('column'))) {
      try {
        return await sbFetch('gastos?' + (qs||'select=*'));
      } catch(e2) { throw e2; }
    }
    throw e;
  }
}
async function sbGastosInsert(data) {
  return sbFetch('gastos', { method:'POST', body:JSON.stringify(data) });
}
async function sbGastosUpdate(id, data) {
  return sbFetch('gastos?id=eq.' + id, { method:'PATCH', body:JSON.stringify(data) });
}
async function sbGastosDelete(id) {
  return sbFetch('gastos?id=eq.' + id, { method:'DELETE', headers:{'Prefer':''} });
}

async function cargarGastos() {
  const lista   = document.getElementById('gastos-lista');
  const resumen = document.getElementById('gastos-resumen');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando gastos...</div>';
  try {
    _gastosCache = await sbGastosFetch('select=*');
    renderFiltrosGastos();
    renderGastos();
  } catch(e) {
    const msg = e.message || String(e);
    let detalle = '';
    // Detectar error de tabla inexistente
    if (msg.includes('relation') || msg.includes('does not exist') || msg.includes('42P01')) {
      detalle = 'La tabla <strong>gastos</strong> no existe en Supabase. Creala con el SQL de abajo.';
    } else if (msg.includes('permission') || msg.includes('policy') || msg.includes('RLS') || msg.includes('42501')) {
      detalle = 'Sin permiso para acceder a la tabla <strong>gastos</strong>. Revisá las políticas RLS en Supabase.';
    } else if (msg.includes('AbortError') || msg.includes('agotado') || msg.includes('fetch')) {
      detalle = 'Error de conexión. Revisá tu internet e intentá de nuevo.';
    } else {
      detalle = 'Error: ' + esc(msg);
    }
    if (lista) lista.innerHTML =
      '<div style="background:#fff3cd;border:1px solid #fcd97a;border-radius:var(--radius);padding:14px;font-size:13px;color:#7a5200">' +
        '<div style="font-weight:700;margin-bottom:8px">' + ic('alert') + ' No se pudieron cargar los gastos</div>' +
        '<div style="margin-bottom:12px">' + detalle + '</div>' +
        '<details style="cursor:pointer">' +
          '<summary style="font-size:11px;color:#9a6700;font-weight:600">SQL para crear la tabla</summary>' +
          '<pre style="background:#fef3c7;border-radius:6px;padding:10px;font-size:11px;margin-top:8px;overflow-x:auto;white-space:pre-wrap">CREATE TABLE IF NOT EXISTS gastos (\n  id bigserial primary key,\n  descripcion text,\n  monto numeric,\n  categoria text,\n  fecha text,\n  notas text,\n  created_at timestamptz default now()\n);\nALTER TABLE gastos ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "allow_all" ON gastos FOR ALL USING (true);</pre>' +
        '</details>' +
        '<button onclick="cargarGastos()" style="margin-top:12px;background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif;font-weight:600">' + ic('refresh') + ' Reintentar</button>' +
      '</div>';
  }
}

// Estado de filtros de gastos
var _gastosFiltro = { tipo: 'mes', desde: '', hasta: '' }; // 'dia'|'semana'|'mes'|'rango'

function renderFiltrosGastos() {
  let wrap = g('gastos-filtros');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'gastos-filtros';
    wrap.style.cssText = 'margin-bottom:1.25rem';
    const resumen = g('gastos-resumen');
    if (resumen && resumen.parentNode) resumen.parentNode.insertBefore(wrap, resumen);
  }
  const f = _gastosFiltro;
  const tipos = [
    { id:'dia',    label:'Hoy' },
    { id:'semana', label:'Esta semana' },
    { id:'mes',    label:'Este mes' },
    { id:'rango',  label:'Rango' },
  ];
  wrap.innerHTML =
    '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">' +
    tipos.map(t =>
      '<button onclick="_setGastosFiltro(\'' + t.id + '\')" style="' +
        'border:1.5px solid ' + (f.tipo===t.id?'var(--rose)':'var(--border)') + ';' +
        'background:' + (f.tipo===t.id?'var(--subtle)':'var(--bg)') + ';' +
        'color:' + (f.tipo===t.id?'var(--rose)':'var(--muted)') + ';' +
        'border-radius:20px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;font-weight:' + (f.tipo===t.id?'600':'500') + ';-webkit-tap-highlight-color:transparent;transition:all .12s">' +
        t.label + '</button>'
    ).join('') +
    '</div>' +
    // Fila de mes
    (_getMesesDisponiblesGastos().length ?
      '<div style="margin-bottom:8px">' +
        '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:6px">Mes</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          chipFiltro(!f.mesEspecifico, 'Todos', '_gastosFiltro.mesEspecifico=null;renderFiltrosGastos();renderGastos()') +
          _getMesesDisponiblesGastos().map(m => {
            const [mm, aa] = m.split('/');
            const mNom = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const label = (mNom[parseInt(mm,10)]||mm) + " '" + aa;
            return chipFiltro(f.mesEspecifico===m, label, '_gastosFiltro.mesEspecifico=_gastosFiltro.mesEspecifico===\''+m+'\'?null:\''+m+'\';renderFiltrosGastos();renderGastos()');
          }).join('') +
        '</div>' +
      '</div>'
    : '') +
    (f.tipo === 'rango' ?
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px">' +
        '<label style="font-size:12px;color:var(--muted);font-weight:500">Desde:</label>' +
        '<input type="text" id="gasto-desde" value="' + esc(f.desde) + '" placeholder="DD/MM/AA" maxlength="8" inputmode="numeric" ' +
          'style="border:1.5px solid var(--border);border-radius:8px;padding:7px 12px;font-size:14px;font-family:Inter,sans-serif;width:110px;text-align:center;transition:border-color .15s" ' +
          'onfocus="this.style.borderColor=\'var(--rose)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
          'oninput="fmtFechaInput(this);_gastosFiltro.desde=this.value;renderGastos()"/>' +
        '<label style="font-size:12px;color:var(--muted);font-weight:500">Hasta:</label>' +
        '<input type="text" id="gasto-hasta" value="' + esc(f.hasta) + '" placeholder="DD/MM/AA" maxlength="8" inputmode="numeric" ' +
          'style="border:1.5px solid var(--border);border-radius:8px;padding:7px 12px;font-size:14px;font-family:Inter,sans-serif;width:110px;text-align:center;transition:border-color .15s" ' +
          'onfocus="this.style.borderColor=\'var(--rose)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
          'oninput="fmtFechaInput(this);_gastosFiltro.hasta=this.value;renderGastos()"/>' +
        '<button onclick="_gastosFiltro.hasta=todayStr();if(g(\'gasto-hasta\'))g(\'gasto-hasta\').value=todayStr();renderGastos()" ' +
          'style="background:var(--subtle);border:1px solid var(--rose-border);border-radius:8px;padding:6px 12px;font-size:12px;color:var(--rose);cursor:pointer;font-family:Inter,sans-serif;font-weight:600">Hoy →</button>' +
      '</div>'
    : '');
}

function _setGastosFiltro(tipo) {
  _gastosFiltro.tipo = tipo;
  _gastosFiltro.mesEspecifico = null; // limpiar mes al cambiar tipo
  if (tipo !== 'rango') { _gastosFiltro.desde = ''; _gastosFiltro.hasta = ''; }
  renderFiltrosGastos();
  renderGastos();
}

function _filtrarGastosPorPeriodo(lista) {
  const hoy = todayStr();
  const f = _gastosFiltro;

  // Filtro por mes específico (tiene prioridad sobre tipo de período)
  if (f.mesEspecifico) {
    const [mm, aa] = f.mesEspecifico.split('/');
    return lista.filter(g => {
      if (!g.fecha) return false;
      const p = g.fecha.split('/');
      return p[1] === mm && p[2] === aa;
    });
  }

  if (f.tipo === 'dia') return lista.filter(g => g.fecha === hoy);
  if (f.tipo === 'semana') {
    const hoyDate = parseFechaAR(hoy);
    const lunes = new Date(hoyDate);
    lunes.setDate(hoyDate.getDate() - ((hoyDate.getDay()+6)%7));
    return lista.filter(g => {
      const d = parseFechaAR(g.fecha);
      return d && d >= lunes && d <= hoyDate;
    });
  }
  if (f.tipo === 'mes') {
    const [d,m,a] = hoy.split('/');
    return lista.filter(g => {
      if (!g.fecha) return false;
      const p = g.fecha.split('/');
      return p[1] === m && p[2] === a;
    });
  }
  if (f.tipo === 'rango' && (f.desde || f.hasta)) {
    const desde = parseFechaAR(f.desde), hasta = parseFechaAR(f.hasta);
    return lista.filter(g => {
      const d = parseFechaAR(g.fecha);
      if (!d) return false;
      if (desde && d < desde) return false;
      if (hasta && d > hasta) return false;
      return true;
    });
  }
  return lista;
}

function renderGastos() {
  const lista   = document.getElementById('gastos-lista');
  const resumen = document.getElementById('gastos-resumen');
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

  const filtrados = _filtrarGastosPorPeriodo(_gastosCache);
  const totalPer = filtrados.reduce((s,g) => s + (+g.monto||0), 0);

  const porCat = {};
  filtrados.forEach(g => { const cat = g.categoria||'otro'; porCat[cat]=(porCat[cat]||0)+(+g.monto||0); });
  const topCats = Object.entries(porCat).sort((a,b)=>b[1]-a[1]).slice(0,4);

  const labelPeriodo = {dia:'hoy', semana:'esta semana', mes:'este mes', rango:'en el rango'}[_gastosFiltro.tipo] || '';

  if (resumen) {
    resumen.innerHTML =
      '<div class="stat-card"><div class="stat-label">' + ic('wallet') + ' Total ' + labelPeriodo + '</div><div class="stat-value" style="color:#dc2626">' + fp(totalPer) + '</div><div class="stat-sub">' + filtrados.length + ' gastos</div></div>' +
      topCats.map(([catId, monto]) => {
        const cat = GASTO_CATS.find(c=>c.id===catId) || {icon:'' + ic('box') + '', label:catId};
        return '<div class="stat-card"><div class="stat-label">' + catIcon(cat) + ' ' + esc(cat.label) + '</div><div class="stat-value" style="font-size:1.2rem;color:#dc2626">' + fp(monto) + '</div></div>';
      }).join('');
  }

  if (!filtrados.length) {
    if (lista) lista.innerHTML = '<div class="card" style="padding:2rem;text-align:center"><div style="font-size:32px;margin-bottom:10px">' + ic('wallet') + '</div><div style="font-size:14px;color:var(--muted)">No hay gastos para este período.</div></div>';
    return;
  }

  // Agrupar por fecha descendente
  const grupos = {};
  filtrados.forEach(g => {
    const key = g.fecha || 'Sin fecha';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(g);
  });
  const keysOrdenados = Object.keys(grupos).sort((a,b) => {
    const da = parseFechaAR(a), db = parseFechaAR(b);
    if (!da || !db) return 0;
    return db - da;
  });

  if (lista) lista.innerHTML = keysOrdenados.map(fechaKey => {
    const items = grupos[fechaKey];
    const total = items.reduce((s,g)=>s+(+g.monto||0),0);
    return '<div style="margin-bottom:1.25rem">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)">' + esc(fechaKey) + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#dc2626">' + fp(total) + '</div>' +
      '</div>' +
      items.map(g => {
        const cat = GASTO_CATS.find(c=>c.id===g.categoria) || {icon:'' + ic('box') + '',label:g.categoria||'Otro'};
        return '<div class="card" style="margin-bottom:8px;padding:12px 14px">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="width:36px;text-align:center;flex-shrink:0">' + catIcon(cat, 20) + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:14px;font-weight:600;color:var(--text)">' + esc(g.descripcion||'') + '</div>' +
              '<div style="font-size:11px;color:var(--muted)">' + esc(cat.label) + (g.notas?' · '+esc(g.notas):'') + '</div>' +
            '</div>' +
            '<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:700;color:#dc2626;flex-shrink:0">' + fp(g.monto) + '</div>' +
            '<div style="display:flex;gap:4px;flex-shrink:0">' +
              '<button onclick="abrirEditarGasto(' + g.id + ')" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 7px;font-size:12px;cursor:pointer">' + ic('edit') + '</button>' +
              '<button onclick="eliminarGasto(' + g.id + ')" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 7px;font-size:12px;cursor:pointer">' + ic('trash') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }).join('');
}

// ── Modal gastos
function abrirModalGasto(item) {
  let modal = g('gasto-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gasto-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal) cerrarModalGasto(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">'+(item?'Editar gasto':'Nuevo gasto')+'</div>'+
        '<button onclick="cerrarModalGasto()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="padding:1rem 1.2rem;display:flex;flex-direction:column;gap:14px">'+
        '<input type="hidden" id="gm-id" value="'+(item?item.id:'')+'"/>'+
        '<div>'+
          '<div class="field-label">Descripción *</div>'+
          '<input class="field-input" id="gm-desc" value="'+esc(item?.descripcion||'')+'" placeholder="Ej: Carga de combustible YPF"/>'+
        '</div>'+
        '<div>'+
          '<div class="field-label">Categoría</div>'+
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">'+
            GASTO_CATS.map(cat =>
              '<button id="gcat-'+cat.id+'" onclick="selGastoCat(\''+cat.id+'\')" '+
                'class="rubro-chip'+((!item&&cat.id==='combustible')||(item?.categoria===cat.id)?' selected':'')+'" '+
                'style="font-size:12px;padding:6px 12px">'+catIcon(cat)+' '+cat.label+'</button>'
            ).join('')+
          '</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
          '<div>'+
            '<div class="field-label">Monto $</div>'+
            '<input class="field-input" id="gm-monto" type="number" min="0" step="0.01" value="'+(+item?.monto||'')+'" placeholder="0" inputmode="decimal"/>'+
          '</div>'+
          '<div>'+
            '<div class="field-label">Fecha</div>'+
            '<input class="field-input" id="gm-fecha" value="'+esc(item?.fecha||todayStr())+'" placeholder="DD/MM/AA"/>'+
          '</div>'+
        '</div>'+
        '<div>'+
          '<div class="field-label">Notas <span style="font-size:9px;color:var(--muted)">(opcional)</span></div>'+
          '<input class="field-input" id="gm-notas" value="'+esc(item?.notas||'')+'" placeholder="Ej: Factura N°1234"/>'+
        '</div>'+
        '<div style="display:flex;gap:10px;padding-top:4px">'+
          '<button class="btn-secondary" onclick="cerrarModalGasto()" style="flex:1">Cancelar</button>'+
          '<button class="btn-primary" id="gm-save-btn" onclick="guardarGasto()" style="flex:2">Guardar gasto</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  window._gastoCatSel = item?.categoria || 'combustible';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function abrirEditarGasto(id) {
  const item = _gastosCache.find(g => g.id === id);
  if (item) abrirModalGasto(item);
}

function cerrarModalGasto() {
  const modal = g('gasto-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function selGastoCat(id) {
  window._gastoCatSel = id;
  document.querySelectorAll('[id^="gcat-"]').forEach(b => b.classList.remove('selected'));
  const btn = document.getElementById('gcat-'+id);
  if (btn) btn.classList.add('selected');
}

async function guardarGasto() {
  const desc  = (g('gm-desc')?.value||'').trim();
  if (!desc) { toast('Ingresá una descripción'); return; }
  const btn = g('gm-save-btn');
  if (btn) { btn.disabled=true; btn.textContent='Guardando...'; }
  try {
    const id = g('gm-id')?.value;
    const datos = {
      descripcion: desc,
      categoria:   window._gastoCatSel || 'otro',
      monto:       Math.max(0, parseFloat(g('gm-monto')?.value)||0),
      fecha:       (g('gm-fecha')?.value||'').trim(),
      notas:       (g('gm-notas')?.value||'').trim(),
    };
    if (id) await sbGastosUpdate(parseInt(id), datos);
    else    await sbGastosInsert(datos);
    cerrarModalGasto();
    await cargarGastos();
    toast(id ? '✓ Gasto actualizado' : '✓ Gasto registrado');
  } catch(e) { toast('Error: ' + e.message); }
  finally { if (btn) { btn.disabled=false; btn.textContent='Guardar gasto'; } }
}

async function eliminarGasto(id) {
  if (!confirm('¿Eliminar este gasto?')) return;
  try {
    await sbGastosDelete(id);
    await cargarGastos();
    toast('Gasto eliminado');
  } catch(e) { toast('Error: ' + e.message); }
}

/* ═══════════════════════════════════════
   GRÁFICO TORTA — INGRESOS vs GASTOS
═══════════════════════════════════════ */
async function renderGraficoResultados(totalIngresos, nomMes) {
  const wrap = document.getElementById('dash-resultados-wrap');
  if (!wrap) return;

  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const hoy = todayStr();
  const [dHoy, mes, anio] = hoy.split('/');

  // Cargar gastos del mes
  let gastosData = [];
  try {
    gastosData = await sbGastosFetch('select=monto,fecha');
    window._dashGastosMes = gastosData;
  } catch(e) { gastosData = []; }

  const totalGastosMes = gastosData
    .filter(g => { const p=(g.fecha||'').split('/'); return p[1]===mes&&p[2]===anio; })
    .reduce((s,g)=>s+(+g.monto||0), 0);

  const totalGastosHoy = gastosData
    .filter(g => g.fecha===hoy)
    .reduce((s,g)=>s+(+g.monto||0), 0);

  // Ingresos del día (ya los tenemos en window._dashRemitosHoy)
  const ingresosHoy = (window._dashRemitosHoy||[]).reduce((s,r)=>s+(+r.total||0), 0);

  // ── Función auxiliar para generar un gráfico de torta 2 segmentos ──
  function buildDonut(ingresos, gastos, cx, cy, r) {
    const ganancia = ingresos - gastos;
    const base = ingresos || 1;
    const angGastos = ingresos === 0 ? 0 : Math.min((gastos / base) * 360, 359.99);
    const pct = ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0;
    const color = ganancia >= 0 ? '#059669' : '#dc2626';

    function polar(angle) {
      const rad = (angle - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
    function arc(start, end, fill) {
      if (Math.abs(end - start) < 0.01) return '';
      if (end - start >= 360) end = start + 359.99;
      const s = polar(start), e = polar(end);
      const large = end - start > 180 ? 1 : 0;
      return `<path d="M${cx},${cy} L${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${large},1 ${e.x.toFixed(2)},${e.y.toFixed(2)} Z" fill="${fill}"/>`;
    }

    let svg;
    if (ingresos === 0 && gastos === 0) {
      svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--border)"/>`;
    } else if (ingresos === 0) {
      svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#dc2626"/>`;
    } else {
      svg = arc(angGastos, 360, '#059669') + arc(0, angGastos, '#dc2626');
    }
    return { svg, ganancia, pct, color };
  }

  // ── Tarjeta genérica ──
  function tarjeta(titulo, ingresos, gastos, nomPeriodo) {
    const ri = 70, cx = 80, cy = 80;
    const { svg, ganancia, pct, color } = buildDonut(ingresos, gastos, cx, cy, ri);
    return '<div class="card" style="margin-bottom:1rem">'+
      '<div style="padding:.85rem 1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text)">'+titulo+' '+esc(nomPeriodo)+'</div>'+
        '<button onclick="showPage(\'gastos\',document.getElementById(\'nav-gastos\'))" style="font-size:11px;color:var(--rose);background:none;border:none;cursor:pointer;font-family:Inter,sans-serif;font-weight:600">Ver gastos →</button>'+
      '</div>'+
      '<div style="padding:1rem 1.25rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">'+
        '<div style="flex-shrink:0">'+
          '<svg width="160" height="160" viewBox="0 0 160 160">'+
            svg+
            `<circle cx="${cx}" cy="${cy}" r="40" fill="var(--bg)"/>`+
            `<text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="12" font-weight="700" fill="${color}" font-family="Montserrat,sans-serif">${ganancia>=0?'+':''}${pct}%</text>`+
            `<text x="${cx}" y="${cy+9}" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="Inter,sans-serif">balance</text>`+
          '</svg>'+
        '</div>'+
        '<div style="flex:1;min-width:160px">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">'+
            '<div style="display:flex;align-items:center;gap:7px"><div style="width:10px;height:10px;border-radius:50%;background:#059669;flex-shrink:0"></div><span style="font-size:12px;color:var(--text)">Ingresos</span></div>'+
            '<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:#059669">'+fp(ingresos)+'</span>'+
          '</div>'+
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">'+
            '<div style="display:flex;align-items:center;gap:7px"><div style="width:10px;height:10px;border-radius:50%;background:#dc2626;flex-shrink:0"></div><span style="font-size:12px;color:var(--text)">Gastos</span></div>'+
            '<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:#dc2626">−'+fp(gastos)+'</span>'+
          '</div>'+
          '<div style="display:flex;align-items:center;justify-content:space-between;background:'+(ganancia>=0?'#f0fdf4':'#fff1f1')+';border-radius:8px;padding:8px 10px;margin-top:8px">'+
            '<span style="font-size:13px;font-weight:700;color:var(--text)">Balance</span>'+
            '<span style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:'+color+'">'+(ganancia>=0?'+':'')+fp(ganancia)+'</span>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  // Mostrar gráfico del día + del mes
  wrap.innerHTML =
    tarjeta('' + ic('calendar') + ' Hoy —', ingresosHoy, totalGastosHoy, hoy) +
    tarjeta('' + ic('chart') + ' Mes —', totalIngresos, totalGastosMes, nomMes);
}

/* ═══════════════════════════════════════
   MÓDULO PEDIDO PDF
═══════════════════════════════════════ */

let _pedidoPDFItems = []; // [{stockId, nombre, variante, categoria, precio, costo, unidad, cantPedido}]

function abrirModalPedidoPDF() {
  // Inicializar con todos los productos del stock, cantidad 0
  _pedidoPDFItems = (_stockCache||[]).map(s => ({
    id:         s.id,
    nombre:     s.nombre,
    variante:   s.variante || '',
    categoria:  s.categoria || 'otro',
    precio:     +s.precio  || 0,
    costo:      +s.costo   || 0,
    unidad:     s.unidad   || 'unid',
    cantidad:   +s.cantidad || 0,
    alerta_min: +s.alerta_min || 0,
    cantPedido: 0
  }));

  let modal = g('pedido-pdf-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pedido-pdf-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarModalPedidoPDF(); });
    document.body.appendChild(modal);
  }
  renderModalPedidoPDF(modal);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Mostrar alerta si hay productos con bajo stock
  const bajoStock = _pedidoPDFItems.filter(i => i.alerta_min > 0 && i.cantidad <= i.alerta_min);
  if (bajoStock.length) {
    setTimeout(() => {
      const lista = document.getElementById('ppdf-lista');
      if (!lista) return;
      const alertaHTML = '<div style="background:#fff1f1;border:1.5px solid #fecaca;border-radius:var(--radius);padding:10px 14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:10px">'+
        '<div style="font-size:18px;flex-shrink:0">' + ic('alert') + '</div>'+
        '<div>'+
          '<div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:4px">Productos con bajo stock</div>'+
          bajoStock.map(i =>
            '<div style="font-size:12px;color:#991b1b">'+esc(i.nombre)+(i.variante?' — '+esc(i.variante):'')+
            ' <span style="font-weight:600">(quedan '+i.cantidad+' '+i.unidad+')</span></div>'
          ).join('')+
        '</div>'+
      '</div>';
      lista.insertAdjacentHTML('afterbegin', alertaHTML);
    }, 50);
  }
}

function cerrarModalPedidoPDF() {
  const modal = g('pedido-pdf-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function renderModalPedidoPDF(modal) {
  if (!modal) modal = g('pedido-pdf-modal');
  if (!modal) return;

  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

  // Agrupar por categoría
  const grupos = {};
  _pedidoPDFItems.forEach(item => {
    const cat = STOCK_CATS.find(c => c.id === item.categoria) || { label: item.categoria, icon: '' + ic('box') + '' };
    const key = item.categoria;
    if (!grupos[key]) grupos[key] = { cat, items: [] };
    grupos[key].items.push(item);
  });

  // Calcular total seleccionado
  const seleccionados = _pedidoPDFItems.filter(i => i.cantPedido > 0);
  const totalMonto = seleccionados.reduce((s,i) => s + i.cantPedido * i.precio, 0);
  const totalUnidades = seleccionados.reduce((s,i) => s + i.cantPedido, 0);

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:94vh;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)">'+
      // Header fijo
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('file') + ' Generar pedido PDF</div>'+
        '<button onclick="cerrarModalPedidoPDF()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+

      // Buscador
      '<div style="padding:.75rem 1.2rem;border-bottom:1px solid var(--border);flex-shrink:0">'+
        '<input class="field-input" id="ppdf-search" placeholder="Buscar producto o variante..." '+
          'oninput="filtrarPedidoPDF(this.value)" '+
          'style="padding:8px 12px;font-size:13px"/>'+
      '</div>'+

      // Lista scrolleable
      '<div id="ppdf-lista" style="overflow-y:auto;flex:1;padding:.75rem 1.2rem">'+
        renderPedidoPDFLista(grupos)+
      '</div>'+

      // Footer fijo con totales y botones
      '<div style="border-top:1px solid var(--border);padding:.875rem 1.2rem;flex-shrink:0;background:var(--bg)">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'+
          '<div style="font-size:13px;color:var(--muted)">'+
            (totalUnidades > 0
              ? '<span style="font-weight:600;color:var(--text)">'+totalUnidades+' unid.</span> seleccionadas'
              : 'Seleccioná los productos y cantidades')+
          '</div>'+
          '<div style="font-family:Montserrat,sans-serif;font-size:20px;font-weight:800;color:var(--rose)">'+fp(totalMonto)+'</div>'+
        '</div>'+
        '<div style="display:flex;gap:8px">'+
          '<button onclick="limpiarPedidoPDF()" class="btn-secondary" style="flex:1;font-size:13px">' + ic('trash') + ' Limpiar</button>'+
          '<button onclick="abrirNuestrosPedidos()" class="btn-secondary" style="flex:1;font-size:13px">' + ic('clipboard') + ' Historial</button>'+
          '<button onclick="generarPedidoPDF()" class="btn-primary" style="flex:2;font-size:13px" '+(totalUnidades===0?'disabled style="flex:2;font-size:13px;opacity:.5"':'')+'>' + ic('camera') + ' Generar imagen</button>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function renderPedidoPDFLista(grupos, filtro) {
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  let html = '';

  // Orden de categorías (sin "otro" primero)
  const cats = STOCK_CATS.filter(c => c.id !== 'otro');
  cats.push(STOCK_CATS.find(c => c.id === 'otro') || { id:'otro', label:'Otros', icon:'' + ic('box') + '' });

  cats.forEach(cat => {
    const grupo = grupos[cat.id];
    if (!grupo) return;
    const itemsVisibles = filtro
      ? grupo.items.filter(i =>
          (i.nombre+' '+i.variante).toLowerCase().includes(filtro.toLowerCase()))
      : grupo.items;
    if (!itemsVisibles.length) return;

    html +=
      '<div style="margin-bottom:4px">'+
        '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);padding:8px 0 4px">'+
          catIcon(cat)+' '+esc(cat.label)+
        '</div>'+
        itemsVisibles.map(item => {
          const idx = _pedidoPDFItems.indexOf(item);
          const seleccionado = item.cantPedido > 0;
          const bajStock = item.alerta_min > 0 && item.cantidad <= item.alerta_min;
          return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius);background:'+(seleccionado?'var(--subtle)':bajStock?'#fff8f8':'var(--surface)')+';border:1px solid '+(seleccionado?'var(--rose-border)':bajStock?'#fecaca':'var(--border)')+';margin-bottom:5px;transition:all .12s">'+
            '<div style="flex:1;min-width:0">'+
              '<div style="font-size:13px;font-weight:'+(seleccionado?'600':'500')+';color:var(--text)">'+esc(item.nombre)+'</div>'+
              '<div style="display:flex;gap:6px;align-items:center;margin-top:1px">'+
                (item.variante ? '<span style="font-size:11px;color:var(--muted)">'+esc(item.variante)+'</span>' : '')+
                (bajStock ? '<span style="font-size:10px;background:#fee2e2;color:#dc2626;border-radius:4px;padding:1px 5px;font-weight:700">' + ic('alert') + ' '+item.cantidad+' en stock</span>' : '')+
              '</div>'+
            '</div>'+
            '<div style="font-size:12px;color:var(--rose);font-weight:600;min-width:60px;text-align:right">'+fp(item.precio)+'</div>'+
            '<div style="display:flex;align-items:center;gap:5px;flex-shrink:0">'+
              '<button onclick="_pedidoPDFItems['+idx+'].cantPedido=Math.max(0,_pedidoPDFItems['+idx+'].cantPedido-1);renderModalPedidoPDF()" '+
                'style="width:28px;height:28px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted)">−</button>'+
              '<input type="number" min="0" value="'+item.cantPedido+'" '+
                'onchange="_pedidoPDFItems['+idx+'].cantPedido=Math.max(0,+this.value);renderModalPedidoPDF()" '+
                'style="width:44px;text-align:center;border:1px solid var(--border);border-radius:8px;padding:4px;font-size:13px;font-weight:600;font-family:Montserrat,sans-serif;background:var(--bg);color:'+(seleccionado?'var(--rose)':'var(--text)')+'" '+
                'inputmode="numeric"/>'+
              '<button onclick="_pedidoPDFItems['+idx+'].cantPedido=_pedidoPDFItems['+idx+'].cantPedido+1;renderModalPedidoPDF()" '+
                'style="width:28px;height:28px;border-radius:8px;border:1px solid var(--rose-border);background:var(--subtle);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--rose)">+</button>'+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>';
  });

  return html || '<div style="text-align:center;padding:2rem;color:var(--muted)">Sin resultados</div>';
}

function filtrarPedidoPDF(q) {
  const lista = document.getElementById('ppdf-lista');
  if (!lista) return;
  const grupos = {};
  _pedidoPDFItems.forEach(item => {
    const cat = STOCK_CATS.find(c => c.id === item.categoria) || { label: item.categoria, icon: '' + ic('box') + '', id: item.categoria };
    if (!grupos[item.categoria]) grupos[item.categoria] = { cat, items: [] };
    grupos[item.categoria].items.push(item);
  });
  lista.innerHTML = renderPedidoPDFLista(grupos, q);
}

function limpiarPedidoPDF() {
  _pedidoPDFItems.forEach(i => i.cantPedido = 0);
  renderModalPedidoPDF();
}

async function generarPedidoPDF() {
  const seleccionados = _pedidoPDFItems.filter(i => i.cantPedido > 0);
  if (!seleccionados.length) { toast('Seleccioná al menos un producto'); return; }

  const fp  = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const hoy = todayStr();
  const totalMonto    = seleccionados.reduce((s,i) => s + i.cantPedido * i.precio, 0);
  const totalUnidades = seleccionados.reduce((s,i) => s + i.cantPedido, 0);

  // Agrupar por categoría
  const grupos = {};
  seleccionados.forEach(item => {
    const cat = STOCK_CATS.find(c => c.id === item.categoria) || { label: item.categoria, icon: '' + ic('box') + '' };
    if (!grupos[item.categoria]) grupos[item.categoria] = { cat, items: [] };
    grupos[item.categoria].items.push(item);
  });

  // ── Construir HTML de la imagen (SIN precios)
  const filasImagen = Object.values(grupos).map(({ cat, items }) =>
    // Encabezado de categoría
    `<div style="background:linear-gradient(135deg,#9b6bb5,#c84b8c);color:#fff;padding:6px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:10px">${catIcon(cat)} ${cat.label}</div>` +
    // Encabezado de columnas
    `<div style="display:grid;grid-template-columns:1fr auto auto;gap:0;border-bottom:1px solid #f0d6e8;padding:5px 14px;background:#fdf5fb">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b06090">Producto</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b06090;text-align:center;width:80px">Variante</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b06090;text-align:center;width:60px">Cant.</div>
    </div>` +
    items.map((i, idx) =>
      `<div style="display:grid;grid-template-columns:1fr auto auto;gap:0;padding:9px 14px;border-bottom:1px solid #f5eaf2;background:${idx%2===0?'#fff':'#fdf8fc'}">
        <div style="font-size:14px;font-weight:600;color:#1e1a1a;line-height:1.2">${esc(i.nombre)}</div>
        <div style="font-size:13px;color:#5a4e4c;text-align:center;width:80px;line-height:1.2">${esc(i.variante)||'—'}</div>
        <div style="font-size:18px;font-weight:800;color:#c84b8c;text-align:center;width:60px;font-family:Montserrat,sans-serif;line-height:1">${i.cantPedido}</div>
      </div>`
    ).join('')
  ).join('');

  const htmlImagen = `<div id="pedido-img-wrap" style="background:#fff;width:480px;font-family:Inter,sans-serif;overflow:hidden">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#9b6bb5,#c84b8c);padding:20px 24px;text-align:center">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;letter-spacing:5px;text-transform:uppercase;color:#fff;font-weight:600">INTENCIONAL</div>
      <div style="width:36px;height:1.5px;background:rgba(255,255,255,.6);margin:7px auto"></div>
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.8)">Esmaltes · Cremas · Belleza</div>
    </div>
    <!-- Meta -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#fdf5fb;border-bottom:2px solid #f0d6e8">
      <div style="font-size:13px;font-weight:800;color:#c84b8c;letter-spacing:.5px">${ic('box')} PEDIDO DE PRODUCTOS</div>
      <div style="font-size:11px;color:#9c8b88;font-weight:500">${hoy}</div>
    </div>
    <!-- Productos -->
    <div style="background:#fff">${filasImagen}</div>
    <!-- Footer -->
    <div style="padding:12px 14px;background:#f8f0f5;border-top:2px solid #f0d6e8;display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <div style="font-size:11px;color:#9c8b88">Total unidades</div>
      <div style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:#c84b8c">${totalUnidades} unid.</div>
    </div>
  </div>`;

  // Crear elemento temporal para html2canvas
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1';
  tempDiv.innerHTML = htmlImagen;
  document.body.appendChild(tempDiv);

  const btn = document.querySelector('#pedido-pdf-modal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }

  try {
    await new Promise(r => setTimeout(r, 150));

    const canvas = await html2canvas(tempDiv.querySelector('#pedido-img-wrap'), {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Generar imagen y compartir
    const fileName = 'pedido_intencional_' + hoy.replace(/\//g,'-') + '.png';
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    const fileImg = new File([blob], fileName, { type: 'image/png' });

    // Guardar en Supabase
    try {
      await sbFetch('pedidos_propios', {
        method: 'POST',
        body: JSON.stringify({
          fecha:     hoy,
          productos: JSON.stringify(seleccionados.map(i=>({nombre:i.nombre,variante:i.variante,cantidad:i.cantPedido,precio:i.precio}))),
          total:     totalMonto,
          notas:     ''
        })
      });
    } catch(e) { console.warn('No se pudo guardar el pedido:', e.message); }

    // Compartir imagen (sin precios)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [fileImg] })) {
      try {
        await navigator.share({ files: [fileImg], title: 'Pedido Intencional' });
      } catch(e) {
        if (e.name !== 'AbortError') descargarImagen(canvas.toDataURL('image/png'), fileName);
      }
    } else {
      descargarImagen(canvas.toDataURL('image/png'), fileName);
    }

    cerrarModalPedidoPDF();
    toast('✓ Pedido guardado y compartido');

    // Si la sección de nuestros pedidos está abierta, refrescar
    if (document.getElementById('nuestros-pedidos-lista')) cargarNuestrosPedidos();

  } catch(e) {
    alert('Error al generar imagen: ' + e.message);
  } finally {
    tempDiv.remove();
    if (btn) { btn.disabled = false; btn.textContent = 'Generar imagen'; }
  }
}

/* ═══════════════════════════════════════
   NUESTROS PEDIDOS (historial con montos)
═══════════════════════════════════════ */
async function abrirNuestrosPedidos() {
  let modal = g('nuestros-pedidos-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'nuestros-pedidos-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal){ modal.style.display='none'; document.body.style.overflow=''; } });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:92vh;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('box') + ' Nuestros pedidos</div>'+
        '<button onclick="document.getElementById(\'nuestros-pedidos-modal\').style.display=\'none\';document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div id="nuestros-pedidos-lista" style="overflow-y:auto;flex:1;padding:.75rem 1.2rem">'+
        '<div style="font-size:13px;color:var(--muted)">Cargando...</div>'+
      '</div>'+
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  cargarNuestrosPedidos();
}

async function cargarNuestrosPedidos() {
  const lista = document.getElementById('nuestros-pedidos-lista');
  if (!lista) return;
  try {
    const pedidos = await sbFetch('pedidos_propios?select=*&order=created_at.desc');
    if (!pedidos.length) {
      lista.innerHTML = '<div style="text-align:center;padding:2rem"><div style="font-size:32px;margin-bottom:10px">' + ic('box') + '</div><div style="font-size:14px;color:var(--muted)">No hay pedidos registrados todavía</div></div>';
      return;
    }
    const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
    lista.innerHTML = pedidos.map(p => {
      let prods = [];
      try { prods = JSON.parse(p.productos||'[]'); } catch(e){}
      const totalUnid = prods.reduce((s,i)=>s+(+i.cantidad||0),0);
      return '<div class="card" style="margin-bottom:10px;padding:12px 14px">'+
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px">'+
          '<div>'+
            '<div style="font-size:13px;font-weight:600;color:var(--text)">' + ic('calendar') + ' '+esc(p.fecha||'')+'</div>'+
            '<div style="font-size:11px;color:var(--muted)">'+totalUnid+' unidades · '+prods.length+' producto'+(prods.length!==1?'s':'')+'</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0">'+
            '<div style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:var(--rose)">'+fp(p.total)+'</div>'+
            '<button onclick="eliminarNuestroPedido('+p.id+')" style="background:none;border:none;font-size:11px;color:var(--muted);cursor:pointer;font-family:Inter,sans-serif;padding:2px 0">eliminar</button>'+
          '</div>'+
        '</div>'+
        // Lista de productos
        '<div style="border-top:1px solid var(--border);padding-top:8px;display:flex;flex-direction:column;gap:4px">'+
          prods.map(i =>
            '<div style="display:flex;align-items:center;justify-content:space-between">'+
              '<span style="font-size:12px;color:var(--text2)">'+esc(i.nombre)+(i.variante?' · '+esc(i.variante):'')+' × '+i.cantidad+'</span>'+
              '<span style="font-size:12px;font-weight:600;color:var(--rose)">'+fp((+i.cantidad||0)*(+i.precio||0))+'</span>'+
            '</div>'
          ).join('')+
        '</div>'+
      '</div>';
    }).join('');
  } catch(e) {
    lista.innerHTML = '<div style="color:#dc2626;font-size:13px">Error al cargar pedidos: '+esc(e.message)+'</div>';
  }
}

async function eliminarNuestroPedido(id) {
  if (!confirm('¿Eliminar este pedido del historial?')) return;
  try {
    await sbFetch('pedidos_propios?id=eq.'+id, { method:'DELETE', headers:{'Prefer':''} });
    cargarNuestrosPedidos();
    toast('Pedido eliminado');
  } catch(e) { toast('Error: '+e.message); }
}

/* ═══════════════════════════════════════
   HISTORIAL DE REMITOS
═══════════════════════════════════════ */

let _historialCache = [];
let _historialFiltro = 'todos'; // todos | efectivo | transferencia | deuda


function renderHistorialRemitos() {
  const lista  = document.getElementById('historial-remitos-lista');
  const stats  = document.getElementById('historial-remitos-stats');
  const filtros = document.getElementById('historial-remitos-filtros');
  if (!lista) return;

  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

  // Stats totales
  const total     = _historialCache.reduce((s,r)=>s+(+r.total||0),0);
  const efectivo  = _historialCache.filter(r=>r.pago==='efectivo').reduce((s,r)=>s+(+r.total||0),0);
  const transfer  = _historialCache.filter(r=>r.pago==='transferencia').reduce((s,r)=>s+(+r.total||0),0);
  const deuda     = _historialCache.filter(r=>r.pago==='deuda').reduce((s,r)=>s+(+r.total||0),0);
  if (stats) stats.innerHTML =
    '<div class="stat-card"><div class="stat-label">' + ic('clipboard') + ' Total remitos</div><div class="stat-value" style="font-size:1.3rem">'+_historialCache.length+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">' + ic('coins') + ' Total facturado</div><div class="stat-value" style="font-size:1.1rem;color:var(--violet)">'+fp(total)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">' + ic('cash') + ' Efectivo</div><div class="stat-value" style="font-size:1.1rem;color:#059669">'+fp(efectivo)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">' + ic('smartphone') + ' Transferencia</div><div class="stat-value" style="font-size:1.1rem;color:#2563eb">'+fp(transfer)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">' + ic('clock') + ' Deuda</div><div class="stat-value" style="font-size:1.1rem;color:#d97706">'+fp(deuda)+'</div></div>';

  // Filtros
  const filtroOpts = [
    {id:'todos',label:'Todos',color:'var(--rose)'},
    {id:'efectivo',label:'' + ic('cash') + ' Efectivo',color:'#059669'},
    {id:'transferencia',label:'' + ic('smartphone') + ' Transferencia',color:'#2563eb'},
    {id:'deuda',label:'' + ic('clock') + ' Deuda',color:'#d97706'},
  ];
  if (filtros) filtros.innerHTML = filtroOpts.map(f=>
    '<button onclick="_historialFiltro=\''+f.id+'\';renderHistorialRemitos()" '+
    'style="border:1.5px solid '+(f.id===_historialFiltro?f.color:'var(--border)')+';background:'+(f.id===_historialFiltro?'var(--subtle)':'var(--bg)')+';color:'+(f.id===_historialFiltro?f.color:'var(--muted)')+';border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer">'+f.label+'</button>'
  ).join('');

  // Filtrar
  const filtrados = _historialFiltro === 'todos'
    ? _historialCache
    : _historialCache.filter(r => r.pago === _historialFiltro);

  if (!filtrados.length) {
    lista.innerHTML = '<div class="card" style="padding:2rem;text-align:center"><div style="font-size:32px;margin-bottom:10px">' + ic('receipt') + '</div><div style="font-size:14px;color:var(--muted)">No hay remitos en esta categoría</div></div>';
    return;
  }

  const pagoColor = {efectivo:'#059669', transferencia:'#2563eb', deuda:'#d97706', sin_definir:'#9ca3af'};
  const pagoLabel = {efectivo:'Efectivo', transferencia:'Transferencia', deuda:'Deuda', sin_definir:'Sin definir'};

  lista.innerHTML = filtrados.map(r => {
    let prods = [];
    try { prods = JSON.parse(r.productos||'[]'); } catch(e){}
    const color = pagoColor[r.pago] || '#9ca3af';
    return '<div class="card" style="margin-bottom:10px;padding:0;overflow:hidden">'+
      '<div style="display:flex;align-items:stretch">'+
        '<div style="width:4px;background:'+color+';flex-shrink:0"></div>'+
        '<div style="flex:1;padding:12px 14px">'+
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">'+
            '<div>'+
              '<div style="font-size:14px;font-weight:700;color:var(--text)">'+esc(r.cliente_nombre||'Sin nombre')+'</div>'+
              '<div style="font-size:11px;color:var(--muted)">'+
                [r.cliente_loc, r.fecha].filter(Boolean).map(esc).join(' · ')+
              '</div>'+
              (r.alias && r.pago !== 'efectivo' ? '<div style="font-size:11px;color:#d6539a;margin-top:2px">' + ic('card') + ' '+esc(r.alias)+'</div>' : '')+
            '</div>'+
            '<div style="text-align:right;flex-shrink:0">'+
              '<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:var(--rose)">'+fp(r.total)+'</div>'+
              '<div style="font-size:10px;font-weight:600;color:'+color+';background:'+color+'18;border-radius:6px;padding:1px 7px;display:inline-block;margin-top:2px">'+esc(({efectivo:'Efectivo',transferencia:'Transferencia',deuda:'Deuda'})[r.pago]||r.pago||'')+'</div>'+
            '</div>'+
          '</div>'+
          // Productos
          (prods.length ? '<div style="font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.6">'+
            prods.map(p=>esc(p.prod||'')+(p.cant>1?' ×'+p.cant:'')).join(' · ')+'</div>' : '')+
          // Botones
          '<div style="display:flex;gap:6px">'+
            '<button onclick="verRemitoCompleto('+r.id+')" style="background:var(--subtle);border:1px solid var(--border);border-radius:8px;padding:5px 10px;font-size:12px;color:var(--rose);cursor:pointer;font-family:Inter,sans-serif;font-weight:600">' + ic('eye') + ' Ver</button>'+
            '<button onclick="editarRemito('+r.id+')" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer">' + ic('edit') + ' Editar</button>'+
            '<button onclick="eliminarRemito('+r.id+')" style="background:var(--surface);border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer">' + ic('trash') + '</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

function verRemitoCompleto(id) {
  const r = _historialCache.find(x=>x.id===id);
  if (!r) return;
  let prods = [];
  try { prods = JSON.parse(r.productos||'[]'); } catch(e){}
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const pagoLabel = {efectivo:'' + ic('cash') + ' Efectivo', transferencia:'' + ic('smartphone') + ' Transferencia', deuda:'' + ic('clock') + ' Deuda'};

  let modal = g('remito-ver-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'remito-ver-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal){ modal.style.display='none'; document.body.style.overflow=''; } });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('receipt') + ' Remito</div>'+
        '<button onclick="document.getElementById(\'remito-ver-modal\').style.display=\'none\';document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="padding:1.2rem">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'+
          '<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Cliente</div><div style="font-size:14px;font-weight:600;color:var(--text)">'+esc(r.cliente_nombre||'—')+'</div></div>'+
          '<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Fecha</div><div style="font-size:14px;font-weight:600;color:var(--text)">'+esc(r.fecha||'—')+'</div></div>'+
          '<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Localidad</div><div style="font-size:13px;color:var(--text2)">'+esc(r.cliente_loc||'—')+'</div></div>'+
          '<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Pago</div><div style="font-size:13px;font-weight:600;color:var(--text2)">'+esc(({efectivo:'Efectivo',transferencia:'Transferencia',deuda:'Deuda'})[r.pago]||r.pago||'—')+'</div></div>'+
          (r.alias && r.pago !== 'efectivo' ?'<div style="grid-column:1/-1"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Alias de transferencia</div><div style="font-size:13px;font-weight:600;color:#d6539a;background:#fdf2f8;border-radius:6px;padding:3px 10px;display:inline-block;margin-top:2px">' + ic('card') + ' '+esc(r.alias)+'</div></div>':'')+
          (r.cliente_tel?'<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Teléfono</div><div style="font-size:13px;color:var(--text2)">'+esc(r.cliente_tel)+'</div></div>':'')+''+
          (r.cliente_dir?'<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Dirección</div><div style="font-size:13px;color:var(--text2)">'+esc(r.cliente_dir)+'</div></div>':'')+
        '</div>'+
        '<table style="width:100%;border-collapse:collapse;margin-bottom:16px">'+
          '<thead><tr style="background:var(--subtle)">'+
            '<th style="padding:7px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:left">Producto</th>'+
            '<th style="padding:7px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:center">Cant.</th>'+
            '<th style="padding:7px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:right">Precio</th>'+
            '<th style="padding:7px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:right">Subtotal</th>'+
          '</tr></thead>'+
          '<tbody>'+prods.map((p,i)=>
            '<tr style="border-bottom:1px solid var(--border);background:'+(i%2===0?'var(--bg)':'var(--surface)')+'">'+
              '<td style="padding:8px 10px;font-size:13px;color:var(--text)">'+esc(p.prod||'')+'</td>'+
              '<td style="padding:8px 10px;font-size:13px;text-align:center;color:var(--text)">'+p.cant+'</td>'+
              '<td style="padding:8px 10px;font-size:13px;text-align:right;color:var(--muted)">'+fp(p.precio)+'</td>'+
              '<td style="padding:8px 10px;font-size:13px;font-weight:600;text-align:right;color:var(--text)">'+fp(p.cant*p.precio)+'</td>'+
            '</tr>'
          ).join('')+'</tbody>'+
        '</table>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--subtle);border-radius:var(--radius)">'+
          '<div style="font-size:13px;font-weight:600;color:var(--text)">Total</div>'+
          '<div style="font-family:Montserrat,sans-serif;font-size:20px;font-weight:800;color:var(--rose)">'+fp(r.total)+'</div>'+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button onclick="document.getElementById(\'remito-ver-modal\').style.display=\'none\';document.body.style.overflow=\'\';editarRemito('+r.id+')" class="btn-secondary" style="flex:1">' + ic('edit') + ' Editar</button>'+
          '<button onclick="compartirRemitoGuardado('+r.id+')" style="flex:2;background:#059669;color:#fff;border:none;border-radius:var(--radius);padding:12px 16px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;text-transform:uppercase;letter-spacing:.6px;display:flex;align-items:center;justify-content:center;gap:6px">' + ic('smartphone') + ' Compartir remito</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function editarRemito(id) {
  const r = _historialCache.find(x=>x.id===id);
  if (!r) return;
  let prods = [];
  try { prods = JSON.parse(r.productos||'[]'); } catch(e){}
  const fp = n => (+n||0);

  let modal = g('remito-edit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'remito-edit-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e=>{ if(e.target===modal){ modal.style.display='none'; document.body.style.overflow=''; } });
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">'+
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">'+
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('edit') + ' Editar remito</div>'+
        '<button onclick="document.getElementById(\'remito-edit-modal\').style.display=\'none\';document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="padding:1.2rem;display:flex;flex-direction:column;gap:12px">'+
        '<input type="hidden" id="re-id" value="'+r.id+'"/>'+
        '<div class="field-group"><div class="field-label">Cliente</div><input class="field-input" id="re-nombre" value="'+esc(r.cliente_nombre||'')+'"/></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
          '<div class="field-group"><div class="field-label">Localidad</div><input class="field-input" id="re-loc" value="'+esc(r.cliente_loc||'')+'"/></div>'+
          '<div class="field-group"><div class="field-label">Fecha</div><input class="field-input" id="re-fecha" value="'+esc(r.fecha||'')+'"/></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
          '<div class="field-group"><div class="field-label">Teléfono</div><input class="field-input" id="re-tel" value="'+esc(r.cliente_tel||'')+'"/></div>'+
          '<div class="field-group"><div class="field-label">Dirección</div><input class="field-input" id="re-dir" value="'+esc(r.cliente_dir||'')+'"/></div>'+
        '</div>'+
        '<div class="field-group">'+
          '<div class="field-label">Método de pago</div>'+
          '<div style="display:flex;gap:8px;margin-top:4px">'+
            ['efectivo','transferencia','deuda'].map(p=>
              '<button id="re-pago-'+p+'" onclick="selReEditPago(\''+p+'\')" '+
              'style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;border:1.5px solid '+(r.pago===p?'var(--rose)':'var(--border)')+';background:'+(r.pago===p?'var(--subtle)':'var(--bg)')+';color:'+(r.pago===p?'var(--rose)':'var(--muted)')+'">'+
              (p==='efectivo'?'' + ic('cash') + ' Efectivo':p==='transferencia'?'' + ic('smartphone') + ' Transfer.':'' + ic('clock') + ' Deuda')+'</button>'
            ).join('')+
          '</div>'+
        '</div>'+
        '<div id="re-alias-wrap" style="display:'+(r.pago==='efectivo'?'none':'block')+'">'+
          '<div class="field-group">'+
            '<div class="field-label">' + ic('card') + ' Alias de transferencia</div>'+
            '<select class="field-input" id="re-alias" style="background:var(--bg);padding:9px 12px">'+
              '<option value="">— Sin alias —</option>'+
            '</select>'+
          '</div>'+
        '</div>'+
        '<div class="field-group">'+
          '<div class="field-label">Total $</div>'+
          '<input class="field-input" id="re-total" type="number" value="'+(+r.total||0)+'" inputmode="decimal"/>'+
        '</div>'+
        '<div style="display:flex;gap:8px;padding-top:4px">'+
          '<button onclick="document.getElementById(\'remito-edit-modal\').style.display=\'none\';document.body.style.overflow=\'\'" class="btn-secondary" style="flex:1">Cancelar</button>'+
          '<button onclick="guardarEdicionRemito()" class="btn-primary" style="flex:2">Guardar cambios</button>'+
        '</div>'+
      '</div>'+
    '</div>';

  window._reEditPago = r.pago || 'efectivo';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Poblar el select de alias con los configurados
  const selectAlias = document.getElementById('re-alias');
  if (selectAlias) {
    const cfg = leerAliasConfig();
    selectAlias.innerHTML = '<option value="">— Sin alias —</option>';
    if (cfg.alias1) {
      const opt = document.createElement('option');
      opt.value = cfg.alias1; opt.textContent = cfg.alias1;
      if (r.alias === cfg.alias1) opt.selected = true;
      selectAlias.appendChild(opt);
    }
    if (cfg.alias2) {
      const opt = document.createElement('option');
      opt.value = cfg.alias2; opt.textContent = cfg.alias2;
      if (r.alias === cfg.alias2) opt.selected = true;
      selectAlias.appendChild(opt);
    }
    // Si el alias guardado no está en la lista, agregarlo igual
    if (r.alias && r.alias !== cfg.alias1 && r.alias !== cfg.alias2) {
      const opt = document.createElement('option');
      opt.value = r.alias; opt.textContent = r.alias; opt.selected = true;
      selectAlias.appendChild(opt);
    }
  }
}

function selReEditPago(p) {
  window._reEditPago = p;
  ['efectivo','transferencia','deuda'].forEach(pp => {
    const btn = document.getElementById('re-pago-'+pp);
    if (!btn) return;
    const activo = pp === p;
    btn.style.borderColor = activo ? 'var(--rose)' : 'var(--border)';
    btn.style.background  = activo ? 'var(--subtle)' : 'var(--bg)';
    btn.style.color       = activo ? 'var(--rose)' : 'var(--muted)';
  });
  // Mostrar/ocultar alias según el método de pago
  const wrap = document.getElementById('re-alias-wrap');
  if (wrap) wrap.style.display = (p === 'efectivo') ? 'none' : 'block';
}

async function guardarEdicionRemito() {
  const id     = parseInt(document.getElementById('re-id')?.value||'0');
  const datos  = {
    cliente_nombre: (document.getElementById('re-nombre')?.value||'').trim(),
    cliente_loc:    (document.getElementById('re-loc')?.value||'').trim(),
    cliente_tel:    (document.getElementById('re-tel')?.value||'').trim(),
    cliente_dir:    (document.getElementById('re-dir')?.value||'').trim(),
    fecha:          (document.getElementById('re-fecha')?.value||'').trim(),
    pago:           window._reEditPago || 'efectivo',
    alias:          (window._reEditPago === 'efectivo') ? null : (document.getElementById('re-alias')?.value || null),
    total:          Math.max(0, parseFloat(document.getElementById('re-total')?.value)||0),
  };
  const btn = document.querySelector('#remito-edit-modal .btn-primary');
  if (btn) { btn.disabled=true; btn.textContent='Guardando...'; }
  try {
    await sbFetch('remitos?id=eq.'+id, { method:'PATCH', body:JSON.stringify(datos) });
    document.getElementById('remito-edit-modal').style.display = 'none';
    document.body.style.overflow = '';
    await cargarHistorialRemitos();
    toast('✓ Remito actualizado');
  } catch(e) { toast('Error: '+e.message); }
  finally { if (btn) { btn.disabled=false; btn.textContent='Guardar cambios'; } }
}

async function eliminarRemito(id) {
  if (!confirm('¿Eliminar este remito? Esta acción no se puede deshacer.')) return;
  try {
    await sbFetch('remitos?id=eq.'+id, { method:'DELETE', headers:{'Prefer':''} });
    await cargarHistorialRemitos();
    toast('Remito eliminado');
  } catch(e) { toast('Error: '+e.message); }
}

/* ═══════════════════════════════════════════════════════════════
   NUEVAS FUNCIONALIDADES — BLOQUE ADICIONAL
═══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   HELPERS GLOBALES
────────────────────────────────────────────── */
function normalizarTexto(s) {
  return String(s||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,' ').trim();
}

/* ══════════════════════════════════════════════
   1. CLIENTES — NUMERACIÓN MASIVA EN RUTA
══════════════════════════════════════════════ */
function abrirModalNumeracionMasiva() {
  const rutaActual = _rutaFiltro && _rutaFiltro !== '__sin__' ? _rutaFiltro : null;

  let modal = g('modal-numeracion-masiva');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-numeracion-masiva';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarModalNumeracionMasiva(); });
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:600px;max-height:88vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">' +
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('hash') + ' Numeración masiva de ruta</div>' +
        '<button onclick="cerrarModalNumeracionMasiva()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="padding:1.2rem;display:flex;flex-direction:column;gap:14px">' +
        '<div class="field-group">' +
          '<div class="field-label">Hoja de ruta</div>' +
          '<input class="field-input" id="nm-ruta" type="text" inputmode="numeric" value="' + (rutaActual||'') + '" placeholder="Ej: 1 (vacío = Sin ruta)"/>' +
        '</div>' +
        '<div style="background:var(--subtle);border:1px solid var(--rose-border);border-radius:var(--radius);padding:12px 14px;font-size:12px;color:var(--text2);line-height:1.6">' +
          '' + ic('alert') + ' Esta acción reasignará el número de cliente a <strong>todos los clientes</strong> de la ruta indicada, comenzando desde el número que definas, en el orden de las tarjetas.' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div class="field-group">' +
            '<div class="field-label">Número inicial</div>' +
            '<input class="field-input" id="nm-inicio" type="number" min="1" placeholder="Ej: 101"/>' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Prefijo (opcional)</div>' +
            '<input class="field-input" id="nm-prefijo" placeholder="Ej: C- (default)"/>' +
          '</div>' +
        '</div>' +
        '<div id="nm-preview" style="background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);padding:12px 14px;min-height:60px;font-size:12px;color:var(--muted)">Completá los campos para ver la previsualización…</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button onclick="cerrarModalNumeracionMasiva()" class="btn-secondary" style="flex:1">Cancelar</button>' +
          '<button onclick="previewNumeracionMasiva()" class="btn-secondary" style="flex:1">' + ic('eye') + ' Preview</button>' +
          '<button onclick="ejecutarNumeracionMasiva()" class="btn-primary" style="flex:2">' + ic('check') + ' Aplicar</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModalNumeracionMasiva() {
  const m = g('modal-numeracion-masiva');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

async function previewNumeracionMasiva() {
  const ruta  = (g('nm-ruta')?.value||'').trim(); // vacío = sin ruta
  const inicio = parseInt(g('nm-inicio')?.value||'0');
  const pref   = (g('nm-prefijo')?.value||'C-').trim() || 'C-';
  const prevEl = g('nm-preview');
  if (!ruta || !inicio || inicio < 1) {
    if (prevEl) prevEl.innerHTML = '<span style="color:#d97706">' + ic('alert') + ' Completá ruta y número inicial.</span>';
    return;
  }
  const todos = await cargarDB();
  const lista = todos.filter(c => { const r = parseRuta(c.ruta); return String(r.orden) === ruta; });
  if (!lista.length) {
    if (prevEl) prevEl.innerHTML = '<span style="color:#d97706">' + ic('alert') + ' No hay clientes en esta ruta.</span>';
    return;
  }
  const preview = lista.slice(0, 10).map((c, i) => {
    const nuevo = pref + String(inicio + i).padStart(4, '0');
    return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px">' +
      '<span style="color:var(--muted)">' + esc(c.num_str||'') + '</span>' +
      '<span style="color:var(--muted)">→</span>' +
      '<span style="color:var(--rose);font-weight:600">' + nuevo + '</span>' +
      '<span style="flex:1;margin-left:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.local) + '</span>' +
    '</div>';
  }).join('') + (lista.length > 10 ? '<div style="font-size:11px;color:var(--muted);padding-top:6px">… y ' + (lista.length-10) + ' más</div>' : '');
  if (prevEl) prevEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:6px">Preview (' + lista.length + ' clientes de Ruta ' + ruta + '):</div>' + preview;
}

async function ejecutarNumeracionMasiva() {
  const ruta   = (g('nm-ruta')?.value||'').trim();
  const inicio = parseInt(g('nm-inicio')?.value||'0');
  const pref   = (g('nm-prefijo')?.value||'C-').trim() || 'C-';
  if (!ruta || !inicio || inicio < 1) { toast('Completá ruta y número inicial'); return; }
  if (!confirm('¿Aplicar nueva numeración a TODOS los clientes de Ruta ' + ruta + '? Esta acción no se puede deshacer.')) return;
  const todos = await cargarDB();
  const lista = todos.filter(c => { const r = parseRuta(c.ruta); return String(r.orden) === ruta; });
  if (!lista.length) { toast('No hay clientes en esa ruta'); return; }
  const btn = document.querySelector('#modal-numeracion-masiva .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Aplicando...'; }
  loading(true);
  let ok = 0, err = 0;
  for (let i = 0; i < lista.length; i++) {
    const c = lista[i];
    const nuevo_str = pref + String(inicio + i).padStart(4, '0');
    try {
      await sbUpdate(c.num, { num_str: nuevo_str });
      ok++;
    } catch(e) { err++; }
  }
  _cache = null;
  loading(false);
  cerrarModalNumeracionMasiva();
  toast('✓ ' + ok + ' clientes renumerados' + (err ? ' | ' + err + ' errores' : ''));
  renderListaDetalle();
}

/* ══════════════════════════════════════════════
   2. CLIENTES — LISTADO ORDENADO POR NÚMERO
══════════════════════════════════════════════ */
async function abrirListadoPorNumero() {
  let modal = g('modal-listado-numero');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-listado-numero';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarListadoPorNumero(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">' +
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('clipboard') + ' Clientes por número</div>' +
        '<button onclick="cerrarListadoPorNumero()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="padding:1rem 1.2rem">' +
        '<div id="listado-numero-body" style="font-size:13px;color:var(--muted)">Cargando…</div>' +
      '</div>' +
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const todos = await cargarDB();
  const sorted = [...todos].sort((a, b) => {
    const na = parseInt(a.num_str?.replace(/\D/g,'')) || a.num || 0;
    const nb = parseInt(b.num_str?.replace(/\D/g,'')) || b.num || 0;
    return na - nb;
  });
  const body = g('listado-numero-body');
  if (!body) return;
  if (!sorted.length) { body.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted)">No hay clientes.</div>'; return; }
  body.innerHTML =
    '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">' + sorted.length + ' clientes</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px">' +
    sorted.map(c => {
      const ruta = parseRuta(c.ruta);
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<span style="font-size:11px;background:rgba(200,75,140,.1);color:var(--rose);border-radius:5px;padding:2px 8px;font-weight:700;white-space:nowrap;min-width:60px;text-align:center">' + esc(c.num_str||'') + '</span>' +
        '<span style="flex:1;font-size:13px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.local) + '</span>' +
        (ruta.orden ? '<span style="font-size:11px;color:var(--violet);background:rgba(155,107,181,.1);border-radius:5px;padding:2px 7px;white-space:nowrap">R' + esc(ruta.orden) + '</span>' : '') +
        (c.loc ? '<span style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px">' + esc(c.loc) + '</span>' : '') +
      '</div>';
    }).join('') +
    '</div>';
}

function cerrarListadoPorNumero() {
  const m = g('modal-listado-numero');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════
   3. CLIENTES — DETECCIÓN DE DUPLICADOS MEJORADA
══════════════════════════════════════════════ */

// Persistencia de pares ignorados
const _DUP_IGNORADOS_KEY = 'intencional_dup_ignorados';
function _leerIgnorados() {
  try { return new Set(JSON.parse(localStorage.getItem(_DUP_IGNORADOS_KEY)||'[]')); } catch(e) { return new Set(); }
}
function _guardarIgnorado(hashPar) {
  const s = _leerIgnorados(); s.add(hashPar);
  try { localStorage.setItem(_DUP_IGNORADOS_KEY, JSON.stringify([...s])); } catch(e) {}
}
function _hashPar(a, b) {
  // Hash estable para un par de clientes (orden independiente)
  const ids = [String(a.num||a.id||a.local), String(b.num||b.id||b.local)].sort();
  return ids.join('||');
}

function calcularSimilitud(a, b) {
  if (!a || !b) return 0;
  const na = normalizarTexto(a), nb = normalizarTexto(b);
  if (na === nb) return 1;
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (longer.includes(shorter) && shorter.length >= 4) return 0.85;
  const tA = new Set(na.split(/\s+/)), tB = new Set(nb.split(/\s+/));
  let comun = 0;
  tA.forEach(t => { if (tB.has(t) && t.length > 2) comun++; });
  const union = new Set([...tA, ...tB]).size;
  return union ? comun / union : 0;
}

function detectarDuplicados(clientes) {
  const ignorados = _leerIgnorados();
  const pares = [];
  for (let i = 0; i < clientes.length; i++) {
    for (let j = i + 1; j < clientes.length; j++) {
      const a = clientes[i], b = clientes[j];
      // Saltar pares ignorados
      if (ignorados.has(_hashPar(a, b))) continue;

      const scores = [];
      const simNombre = calcularSimilitud(a.local, b.local);
      scores.push({ campo: 'Nombre', sim: simNombre });
      if (a.dir && b.dir) scores.push({ campo: 'Dirección', sim: calcularSimilitud(a.dir, b.dir) });
      if (a.tel && b.tel) {
        const tA = a.tel.replace(/\D/g,''), tB = b.tel.replace(/\D/g,'');
        if (tA.length >= 7 && tA === tB) scores.push({ campo: 'Teléfono', sim: 1 });
      }
      // Número de cliente igual
      if (a.num_str && b.num_str && normalizarTexto(a.num_str) === normalizarTexto(b.num_str)) {
        scores.push({ campo: 'N° cliente', sim: 1 });
      }
      const maxSim = Math.max(...scores.map(s => s.sim));
      if (maxSim >= 0.8) pares.push({ a, b, scores, maxSim });
    }
  }
  return pares.sort((x, y) => y.maxSim - x.maxSim);
}

async function abrirPestañaDuplicados() {
  let modal = g('modal-duplicados');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-duplicados';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarModalDuplicados(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:92vh;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)">' +
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('search') + ' Duplicados detectados</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<button onclick="_limpiarIgnorados()" style="font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:8px;padding:4px 10px;cursor:pointer;font-family:Inter,sans-serif">Resetear ignorados</button>' +
          '<button onclick="cerrarModalDuplicados()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
        '</div>' +
      '</div>' +
      '<div id="duplicados-body" style="padding:1rem 1.2rem;overflow-y:auto;flex:1"><div style="font-size:13px;color:var(--muted)">Analizando clientes…</div></div>' +
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  await _renderDuplicadosBody();
}

async function _renderDuplicadosBody() {
  const todos = await cargarDB();
  const pares = detectarDuplicados(todos);
  const body = g('duplicados-body');
  if (!body) return;
  if (!pares.length) {
    body.innerHTML = '<div style="text-align:center;padding:2rem;font-size:14px;color:var(--muted)">' + ic('check') + ' No se detectaron posibles duplicados.<br><span style="font-size:12px">Los pares ignorados no aparecen aquí.</span></div>';
    return;
  }
  body.innerHTML =
    '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">' + pares.length + ' posible' + (pares.length===1?'':'s') + ' duplicado' + (pares.length===1?'':'s') + '</div>' +
    pares.map((par, idx) => {
      const camposSim = par.scores.filter(s=>s.sim>=0.8).map(s=>s.campo).join(', ');
      return '<div id="dup-par-' + idx + '" style="background:var(--surface);border:1px solid #fde8b8;border-radius:var(--radius);margin-bottom:12px;overflow:hidden">' +
        '<div style="background:#fff7ed;padding:8px 12px;font-size:11px;font-weight:700;color:#d97706;display:flex;justify-content:space-between;align-items:center">' +
          '<span>' + ic('alert') + ' ' + camposSim + ' similares</span>' +
          '<span style="font-size:10px;background:#fde8b8;border-radius:10px;padding:1px 8px">' + Math.round(par.maxSim*100) + '% sim.</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">' +
          [par.a, par.b].map((c, ci) =>
            '<div style="padding:10px 12px;' + (ci===0?'border-right:1px solid var(--border)':'') + '">' +
              '<span style="font-size:10px;background:rgba(200,75,140,.1);color:var(--rose);border-radius:5px;padding:1px 7px;font-weight:700">' + esc(c.num_str||'') + '</span>' +
              '<div style="font-size:13px;font-weight:600;color:var(--text);margin:4px 0 3px">' + esc(c.local) + '</div>' +
              (c.dir ? '<div style="font-size:11px;color:var(--muted)">' + ic('pin') + ' ' + esc(c.dir) + '</div>' : '') +
              (c.tel ? '<div style="font-size:11px;color:var(--muted)">' + ic('phone') + ' ' + esc(c.tel) + '</div>' : '') +
              (c.loc ? '<div style="font-size:11px;color:var(--muted)">' + esc(c.loc) + '</div>' : '') +
              '<div style="display:flex;gap:5px;margin-top:8px">' +
                '<button onclick="eliminarClienteDuplicado(' + c.num + ',' + idx + ')" style="flex:1;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;padding:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">' + ic('trash') + ' Eliminar</button>' +
                '<button onclick="editarDesdeDuplicados(' + c.num + ')" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px;font-size:11px;color:var(--muted);cursor:pointer;font-family:Inter,sans-serif">' + ic('edit') + ' Editar</button>' +
              '</div>' +
            '</div>'
          ).join('') +
        '</div>' +
        '<div style="padding:8px 12px;border-top:1px solid var(--border);background:var(--bg);display:flex;justify-content:flex-end">' +
          '<button onclick="ignorarDuplicado(' + idx + ',\'' + _hashPar(par.a, par.b).replace(/'/g,"\\'") + '\')" ' +
            'style="background:none;border:none;font-size:12px;color:var(--muted);cursor:pointer;font-family:Inter,sans-serif;padding:4px 8px;display:flex;align-items:center;gap:4px">' + ic('check') + ' No es duplicado — Ignorar siempre</button>' +
        '</div>' +
      '</div>';
    }).join('');
}

function cerrarModalDuplicados() {
  const m = g('modal-duplicados');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

function ignorarDuplicado(idx, hashPar) {
  _guardarIgnorado(hashPar);
  const par = g('dup-par-' + idx);
  if (par) {
    par.style.transition = 'opacity .3s';
    par.style.opacity = '0';
    setTimeout(() => { if(par) par.style.display = 'none'; }, 300);
  }
}

function _limpiarIgnorados() {
  if (!confirm('¿Resetear todos los pares ignorados? Volverán a aparecer.')) return;
  try { localStorage.removeItem(_DUP_IGNORADOS_KEY); } catch(e) {}
  _renderDuplicadosBody();
  toast('✓ Ignorados reseteados');
}

// Editar desde duplicados — abre el modal de edición SIN cerrar el modal de duplicados
function editarDesdeDuplicados(numCliente) {
  // Abrir modal de edición encima del modal de duplicados (z-index mayor)
  if (typeof abrirEdicion === 'function') {
    abrirEdicion(numCliente);
    // El modal de edición tiene z-index 1100, el de duplicados 1200
    // Subimos el de edición para que sea visible
    setTimeout(() => {
      const editModal = g('edit-modal');
      if (editModal) editModal.style.zIndex = '1300';
    }, 30);
  }
}

async function eliminarClienteDuplicado(num, parIdx) {
  if (!confirm('¿Eliminar este cliente? No se puede deshacer.')) return;
  try {
    await sbDelete(num);
    _cache = null;
    const par = g('dup-par-' + parIdx);
    if (par) par.style.display = 'none';
    toast('✓ Cliente eliminado');
    renderMosaico();
  } catch(e) { toast('Error: ' + e.message); }
}

/* ══════════════════════════════════════════════
   4. REMITOS — DETECCIÓN DE DUPLICADOS AL CARGAR
══════════════════════════════════════════════ */
var _hashRemitosRecientes = new Set();

async function cargarHashsRemitosRecientes() {
  try {
    const recientes = await sbFetchRemitos('select=cliente_nombre,fecha,total&limit=200');
    _hashRemitosRecientes.clear();
    recientes.forEach(r => {
      const h = normalizarTexto(r.cliente_nombre) + '|' + r.fecha + '|' + String(+r.total||0);
      _hashRemitosRecientes.add(h);
    });
  } catch(e) {}
}

function esRemitoDuplicado(nombre, fecha, total) {
  const h = normalizarTexto(nombre) + '|' + fecha + '|' + String(+total||0);
  return _hashRemitosRecientes.has(h);
}

/* ── guardarRemitoEnDB ya incluye anti-duplicado (definida arriba) ── */

// Hook: también anti-duplicado en sincronización
const _sbInsertRemito_original = sbInsertRemito;
const _hashesEnviadosSync = new Set();
async function sbInsertRemitoConCheck(r) {
  const h = normalizarTexto(r.cliente_nombre) + '|' + r.fecha + '|' + String(+r.total||0);
  if (_hashesEnviadosSync.has(h)) {
    console.warn('[Anti-dup] Remito ya enviado en esta sesión, se omite:', h);
    return;
  }
  _hashesEnviadosSync.add(h);
  return _sbInsertRemito_original(r);
}

/* ══════════════════════════════════════════════
   5. REMITOS — FILTROS POR FECHA EN HISTORIAL
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   HISTORIAL REMITOS — SISTEMA DE FILTROS COMPLETO
══════════════════════════════════════════════ */

// Estado de filtros del historial
var _hFiltros = {
  q: '',
  pago: null,        // null = todos | 'efectivo' | 'transferencia' | 'deuda'
  alias: null,       // null = todos | string alias
  fechaTipo: null,   // null | 'dia' | 'rango'
  fechaDia: '',
  fechaDesde: '',
  fechaHasta: '',
};

async function cargarHistorialRemitos() {
  const lista = g('historial-remitos-lista');
  const stats = g('historial-remitos-stats');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando...</div>';
  try {
    const todos = await sbFetchRemitos('select=*');
    _historialCache = todos;
    window._historialCache = todos;
    renderHistorialFiltros();
    renderHistorialConFiltros();
    if (stats) renderHistorialStats(todos);
  } catch(e) {
    if (lista) lista.innerHTML = '<div style="background:#fff3cd;border:1px solid #fcd97a;border-radius:var(--radius);padding:12px 14px;font-size:13px;color:#7a5200">' + ic('alert') + ' Error cargando remitos: ' + esc(e.message) + '</div>';
  }
}

function parseFechaAR(s) {
  if (!s) return null;
  const parts = s.split('/');
  if (parts.length < 3) return null;
  const [d, m, y] = parts.map(Number);
  const anio = y < 100 ? 2000 + y : y;
  return new Date(anio, m - 1, d);
}

/* ── Chip de filtro activo reutilizable ── */
function chipFiltro(activo, label, onclick) {
  return '<button onclick="' + onclick + '" style="' +
    'display:inline-flex;align-items:center;gap:5px;' +
    'border:1.5px solid ' + (activo ? 'var(--rose)' : 'var(--border)') + ';' +
    'background:' + (activo ? 'var(--subtle)' : 'var(--bg)') + ';' +
    'color:' + (activo ? 'var(--rose)' : 'var(--muted)') + ';' +
    'border-radius:20px;padding:6px 13px;font-size:12px;cursor:pointer;' +
    'font-family:Inter,sans-serif;font-weight:' + (activo ? '600' : '500') + ';' +
    '-webkit-tap-highlight-color:transparent;white-space:nowrap;transition:all .12s">' +
    label + '</button>';
}

function renderHistorialFiltros() {
  const wrap = g('historial-remitos-filtros');
  if (!wrap) return;
  const f = _hFiltros;

  // Extraer alias únicos de las transferencias/deudas
  const aliasDisponibles = [...new Set(
    (_historialCache||[])
      .filter(r => (r.pago==='transferencia'||r.pago==='deuda') && r.alias)
      .map(r => r.alias)
  )];

  const mostrarAlias = f.pago === 'transferencia' || f.pago === 'deuda';

  wrap.innerHTML =
    /* ─ Fila 0: Mes ─ */
    (_getMesesDisponiblesHistorial().length ?
      '<div style="width:100%;margin-bottom:8px">' +
        '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:6px">Mes</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          chipFiltro(!f.mes, 'Todos', '_hFiltros.mes=null;renderHistorialFiltros();renderHistorialConFiltros()') +
          _getMesesDisponiblesHistorial().map(m => {
            const [mm, aa] = m.split('/');
            const mNom = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const label = (mNom[parseInt(mm,10)]||mm) + " '" + aa;
            return chipFiltro(f.mes===m, label, '_hFiltros.mes=_hFiltros.mes===\''+m+'\'?null:\''+m+'\';renderHistorialFiltros();renderHistorialConFiltros()');
          }).join('') +
        '</div>' +
      '</div>'
    : '') +

    /* ─ Buscador ─ */
    '<div style="width:100%;margin-bottom:10px">' +
      '<div style="position:relative">' +
        '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;color:var(--muted)">' + ic('search') + '</span>' +
        '<input id="historial-search" value="' + esc(f.q) + '" placeholder="Buscar por local, localidad, alias, monto..." ' +
          'style="width:100%;border:1.5px solid var(--border);border-radius:var(--radius);padding:10px 14px 10px 38px;font-size:14px;font-family:Inter,sans-serif;color:var(--text);background:var(--surface);box-sizing:border-box;transition:border-color .15s" ' +
          'onfocus="this.style.borderColor=\'rgba(200,75,140,.6)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
          'oninput="_hFiltros.q=this.value;renderHistorialConFiltros()"/>' +
      '</div>' +
    '</div>' +

    /* ─ Fila 1: Tipo de pago ─ */
    '<div style="width:100%;margin-bottom:8px">' +
      '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:6px">Tipo de pago</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        chipFiltro(!f.pago, 'Todos', '_hFiltros.pago=null;_hFiltros.alias=null;renderHistorialFiltros();renderHistorialConFiltros()') +
        chipFiltro(f.pago==='efectivo', '' + ic('cash') + ' Efectivo', '_hFiltros.pago=_hFiltros.pago===\'efectivo\'?null:\'efectivo\';_hFiltros.alias=null;renderHistorialFiltros();renderHistorialConFiltros()') +
        chipFiltro(f.pago==='transferencia', '' + ic('smartphone') + ' Transferencia', '_hFiltros.pago=_hFiltros.pago===\'transferencia\'?null:\'transferencia\';_hFiltros.alias=null;renderHistorialFiltros();renderHistorialConFiltros()') +
        chipFiltro(f.pago==='deuda', '' + ic('clock') + ' Deuda', '_hFiltros.pago=_hFiltros.pago===\'deuda\'?null:\'deuda\';_hFiltros.alias=null;renderHistorialFiltros();renderHistorialConFiltros()') +
      '</div>' +
    '</div>' +

    /* ─ Fila 2: Alias (solo si pago es transferencia o deuda) ─ */
    (mostrarAlias && aliasDisponibles.length ?
      '<div style="width:100%;margin-bottom:8px">' +
        '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:6px">Alias</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          chipFiltro(!f.alias, 'Todos los alias', '_hFiltros.alias=null;renderHistorialFiltros();renderHistorialConFiltros()') +
          aliasDisponibles.map(a =>
            chipFiltro(f.alias===a, '' + ic('card') + ' ' + esc(a), '_hFiltros.alias=_hFiltros.alias===\'' + a.replace(/'/g,"\\'") + '\'?null:\'' + a.replace(/'/g,"\\'") + '\';renderHistorialFiltros();renderHistorialConFiltros()')
          ).join('') +
        '</div>' +
      '</div>'
    : '') +

    /* ─ Fila 4: Filtro de fecha ─ */
    '<div style="width:100%;margin-bottom:4px">' +
      '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:6px">Fecha</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
        chipFiltro(!f.fechaTipo, 'Todas las fechas', '_hFiltros.fechaTipo=null;_hFiltros.fechaDia=\'\';_hFiltros.fechaDesde=\'\';_hFiltros.fechaHasta=\'\';renderHistorialFiltros();renderHistorialConFiltros()') +
        '<button onclick="abrirPanelFecha(\'dia\')" style="display:inline-flex;align-items:center;gap:5px;border:1.5px solid ' + (f.fechaTipo==='dia'?'var(--rose)':'var(--border)') + ';background:' + (f.fechaTipo==='dia'?'var(--subtle)':'var(--bg)') + ';color:' + (f.fechaTipo==='dia'?'var(--rose)':'var(--muted)') + ';border-radius:20px;padding:6px 13px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;font-weight:' + (f.fechaTipo==='dia'?'600':'500') + ';-webkit-tap-highlight-color:transparent;white-space:nowrap">' + ic('calendar') + ' ' + (f.fechaTipo==='dia' && f.fechaDia ? f.fechaDia : 'Día') + '</button>' +
        '<button onclick="abrirPanelFecha(\'rango\')" style="display:inline-flex;align-items:center;gap:5px;border:1.5px solid ' + (f.fechaTipo==='rango'?'var(--rose)':'var(--border)') + ';background:' + (f.fechaTipo==='rango'?'var(--subtle)':'var(--bg)') + ';color:' + (f.fechaTipo==='rango'?'var(--rose)':'var(--muted)') + ';border-radius:20px;padding:6px 13px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;font-weight:' + (f.fechaTipo==='rango'?'600':'500') + ';-webkit-tap-highlight-color:transparent;white-space:nowrap">' + ic('calendar') + ' ' + (f.fechaTipo==='rango' && f.fechaDesde ? f.fechaDesde + ' — ' + f.fechaHasta : 'Rango') + '</button>' +
      '</div>' +
      /* Panel de fecha inline */
      '<div id="panel-fecha-inline" style="margin-top:8px;' + (f.fechaTipo ? '' : 'display:none') + '">' +
        renderPanelFechaInline() +
      '</div>' +
    '</div>';
}

function renderPanelFechaInline() {
  const f = _hFiltros;
  if (!f.fechaTipo) return '';
  if (f.fechaTipo === 'dia') {
    return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px">' +
      '<label style="font-size:12px;color:var(--muted);font-weight:500;white-space:nowrap">' + ic('calendar') + ' Día:</label>' +
      '<input type="text" id="input-fecha-dia" value="' + esc(f.fechaDia) + '" placeholder="DD/MM/AA" ' +
        'maxlength="8" inputmode="numeric" ' +
        'style="border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-size:14px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);width:110px;text-align:center;transition:border-color .15s" ' +
        'onfocus="this.style.borderColor=\'var(--rose)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
        'oninput="fmtFechaInput(this);_hFiltros.fechaDia=this.value;renderHistorialConFiltros()"/>' +
      '<button onclick="_hFiltros.fechaDia=todayStr();g(\'input-fecha-dia\').value=todayStr();renderHistorialConFiltros()" ' +
        'style="background:var(--subtle);border:1px solid var(--rose-border);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--rose);cursor:pointer;font-family:Inter,sans-serif;font-weight:600;white-space:nowrap">Hoy</button>' +
    '</div>';
  }
  if (f.fechaTipo === 'rango') {
    return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px">' +
      '<label style="font-size:12px;color:var(--muted);font-weight:500;white-space:nowrap">' + ic('calendar') + ' Desde:</label>' +
      '<input type="text" id="input-fecha-desde" value="' + esc(f.fechaDesde) + '" placeholder="DD/MM/AA" ' +
        'maxlength="8" inputmode="numeric" ' +
        'style="border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-size:14px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);width:110px;text-align:center;transition:border-color .15s" ' +
        'onfocus="this.style.borderColor=\'var(--rose)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
        'oninput="fmtFechaInput(this);_hFiltros.fechaDesde=this.value;renderHistorialConFiltros()"/>' +
      '<label style="font-size:12px;color:var(--muted);font-weight:500;white-space:nowrap">Hasta:</label>' +
      '<input type="text" id="input-fecha-hasta" value="' + esc(f.fechaHasta) + '" placeholder="DD/MM/AA" ' +
        'maxlength="8" inputmode="numeric" ' +
        'style="border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-size:14px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);width:110px;text-align:center;transition:border-color .15s" ' +
        'onfocus="this.style.borderColor=\'var(--rose)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
        'oninput="fmtFechaInput(this);_hFiltros.fechaHasta=this.value;renderHistorialConFiltros()"/>' +
      '<button onclick="_hFiltros.fechaHasta=todayStr();if(g(\'input-fecha-hasta\'))g(\'input-fecha-hasta\').value=todayStr();renderHistorialConFiltros()" ' +
        'style="background:var(--subtle);border:1px solid var(--rose-border);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--rose);cursor:pointer;font-family:Inter,sans-serif;font-weight:600;white-space:nowrap">Hoy →</button>' +
    '</div>';
  }
  return '';
}

function fmtFechaInput(el) {
  // Auto-format DD/MM/AA mientras escribe
  let v = el.value.replace(/\D/g,'');
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5,7);
  el.value = v;
}

function abrirPanelFecha(tipo) {
  const f = _hFiltros;
  if (f.fechaTipo === tipo) {
    // Toggle off
    _hFiltros.fechaTipo = null;
    _hFiltros.fechaDia = '';
    _hFiltros.fechaDesde = '';
    _hFiltros.fechaHasta = '';
  } else {
    _hFiltros.fechaTipo = tipo;
  }
  renderHistorialFiltros();
  renderHistorialConFiltros();
  // Foco en el primer input del panel
  setTimeout(() => {
    const inp = g('input-fecha-dia') || g('input-fecha-desde');
    if (inp) inp.focus();
  }, 50);
}

function renderHistorialConFiltros() {
  const lista = g('historial-remitos-lista');
  if (!lista) return;
  const f = _hFiltros;

  let filtrados = [...(_historialCache || [])];

  // Filtro por mes
  if (f.mes) {
    const [mm, aa] = f.mes.split('/');
    filtrados = filtrados.filter(r => {
      if (!r.fecha) return false;
      const p = r.fecha.split('/');
      return p[1] === mm && p[2] === aa;
    });
  }

  // Filtro por tipo de pago
  if (f.pago) {
    filtrados = filtrados.filter(r => r.pago === f.pago);
  }

  // Filtro por alias
  if (f.alias) {
    filtrados = filtrados.filter(r => r.alias === f.alias);
  }

  // Filtro por fecha
  if (f.fechaTipo === 'dia' && f.fechaDia) {
    filtrados = filtrados.filter(r => r.fecha === f.fechaDia);
  } else if (f.fechaTipo === 'rango' && (f.fechaDesde || f.fechaHasta)) {
    const desde = parseFechaAR(f.fechaDesde);
    const hasta = parseFechaAR(f.fechaHasta);
    filtrados = filtrados.filter(r => {
      const fecha = parseFechaAR(r.fecha);
      if (!fecha) return false;
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      return true;
    });
  }

  // Búsqueda de texto
  if (f.q && f.q.length >= 2) {
    const palabras = normalizarTexto(f.q).split(/\s+/).filter(p => p.length >= 2);
    filtrados = filtrados.filter(r => {
      const haystack = normalizarTexto([
        r.cliente_nombre, r.cliente_loc, r.cliente_dir, r.fecha,
        r.pago, r.alias, String(+r.total||0)
      ].join(' '));
      return palabras.every(p => haystack.includes(p));
    });
  }

  if (!filtrados.length) {
    lista.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)"><div style="font-size:32px;margin-bottom:10px">' + ic('search') + '</div><div>Sin resultados.</div></div>';
    return;
  }
  renderHistorialLista(filtrados);
}

function renderHistorialStats(todos) {
  const stats = g('historial-remitos-stats');
  if (!stats) return;
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const total = todos.reduce((s,r)=>s+(+r.total||0),0);
  stats.innerHTML =
    '<div class="stat-card"><div class="stat-label">Total registrado</div><div class="stat-value" style="font-size:1.5rem;color:var(--violet)">' + fp(total) + '</div><div class="stat-sub">' + todos.length + ' remitos</div></div>' +
    '<div class="stat-card"><div class="stat-label">Efectivo</div><div class="stat-value" style="font-size:1.5rem;color:var(--violet)">' + fp(sumarTipo(todos,'efectivo')) + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">Transferencia</div><div class="stat-value" style="font-size:1.5rem;color:var(--violet)">' + fp(sumarTipo(todos,'transferencia')) + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">Deuda pendiente</div><div class="stat-value" style="font-size:1.5rem;color:var(--violet)">' + fp(sumarTipo(todos,'deuda')) + '</div></div>' +
    renderTotalesAliasHTML(todos);
}

function renderHistorialLista(lista) {
  const el = g('historial-remitos-lista');
  if (!el) return;
  const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const pagoColor = {efectivo:'var(--violet)',transferencia:'var(--violet)',deuda:'var(--violet)',sin_definir:'var(--muted)'};
  const pagoLabel = {efectivo:'' + ic('cash') + ' Efectivo',transferencia:'' + ic('smartphone') + ' Transfer.',deuda:'' + ic('clock') + ' Deuda',sin_definir:'— Sin def.'};
  el.innerHTML =
    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">' + lista.length + ' remito' + (lista.length===1?'':'s') + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    lista.map(r => {
      let prods=[]; try{prods=JSON.parse(r.productos||'[]');}catch(_){}
      const prodStr = prods.filter(p=>p.prod).map(p=>esc(p.prod)+' ×'+p.cant).join(', ');
      const color = pagoColor[r.pago]||'#9c8b88';
      const badge = badgePagoHTML(r);
      const esDeudaPend = tieneDeudaPendiente(r);
      const esTransDeuda = r.pago==='transferencia'||r.pago==='deuda';
      return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;position:relative;overflow:hidden">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--grad-h)"></div>' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(r.cliente_nombre||'—') + '</div>' +
            (r.cliente_loc?'<div style="font-size:11px;color:var(--muted)">' + esc(r.cliente_loc) + '</div>':'') +
            (r.alias && esTransDeuda ?'<div style="font-size:11px;color:#d6539a">' + ic('card') + ' ' + esc(r.alias) + '</div>':'') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:5px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">' +
            '<span style="font-size:11px;font-weight:600;color:' + color + '">' + badge + '</span>' +
            (esDeudaPend ? '<button onclick="abrirCobrarDeuda(' + r.id + ')" style="background:var(--grad);color:#fff;border:none;border-radius:7px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent">Cobrar</button>' : '') +
            '<button onclick="abrirEditarPago(' + r.id + ')" title="Editar forma de pago" style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:4px 8px;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('coins') + '</button>' +
            '<button onclick="verDetalleRemito(' + r.id + ')" style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:4px 8px;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('eye') + '</button>' +
            '<button onclick="editarRemito(' + r.id + ')" style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:4px 8px;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('edit') + '</button>' +
            '<button onclick="eliminarRemito(' + r.id + ')" style="background:var(--surface);border:1px solid #fecaca;border-radius:7px;padding:4px 8px;font-size:12px;color:#dc2626;cursor:pointer;-webkit-tap-highlight-color:transparent">' + ic('trash') + '</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px">' +
          '<div style="font-size:1.2rem;font-weight:700;font-family:Montserrat,sans-serif;color:var(--violet)">' + fp(+r.total||0) + '</div>' +
          '<div style="font-size:11px;color:var(--muted)">' + esc(r.fecha||'') + (r.unidades?' · '+r.unidades+' u':'') + '</div>' +
        '</div>' +
        (prodStr?'<div style="font-size:11px;color:var(--muted);margin-top:5px;border-top:1px solid var(--border);padding-top:5px">' + prodStr + '</div>':'') +
      '</div>';
    }).join('') +
    '</div>';
}

/* ══════════════════════════════════════════════
   6. REMITOS — CREAR CLIENTE DESDE REMITO
      + AUTO-CREAR CLIENTE NO REGISTRADO
══════════════════════════════════════════════ */
function abrirCrearClienteDesdeRemito() {
  // Pre-completar con los datos que ya están en el formulario del remito
  const nombre = (g('f-nombre')?.value||'').trim();
  const dir    = (g('f-dir')?.value||'').trim();
  const loc    = (g('f-loc')?.value||'').trim();
  const tel    = (g('f-tel')?.value||'').trim();

  if (typeof openCrearCliente === 'function') openCrearCliente();
  setTimeout(() => {
    if (nombre && g('m-local')) g('m-local').value = nombre;
    if (dir    && g('m-dir'))   g('m-dir').value   = dir;
    if (loc    && g('m-loc'))   g('m-loc').value   = loc;
    if (tel    && g('m-tel'))   g('m-tel').value   = tel;
  }, 60);
}

async function autoCrearClienteNoRegistrado(nombre, dir, loc, tel) {
  // Buscar si ya existe
  const todos = await cargarDB();
  const existe = todos.find(c => normalizarTexto(c.local) === normalizarTexto(nombre));
  if (existe) return existe;

  // Crear en ruta "Clientes sin registrar" (orden: 99)
  const num = incrementarNum();
  const numStr = numFmt(num);
  const cliente = {
    num, num_str: numStr,
    fecha: new Date().toLocaleDateString('es-AR'),
    local: nombre, rubro: '', duenio: '',
    cuit: '', tel: tel || '', tel2: '',
    dir: dir || '', loc: loc || '',
    doc_tipo: 'CUIT', regimen: '',
    probador_cremas: false,
    ruta: JSON.stringify({ horarios: [], orden: '99', notas: 'Auto-creado desde remito' })
  };
  try {
    await sbInsert(cliente);
    _cache = null;
    toast('✓ Cliente "' + nombre + '" creado en Clientes sin registrar');
    return cliente;
  } catch(e) {
    localStorage.setItem(NUM_KEY, String(num - 1));
    console.warn('Error al auto-crear cliente:', e.message);
    return null;
  }
}

/* ══════════════════════════════════════════════
   8. DASHBOARD — BOTÓN DIRECTO A REMITOS HECHOS
      Ya existe el botón "Ver hechos" en el remito,
      pero agregamos acceso desde el dashboard via
      el botón en la sección de stats de hoy
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   9. BUSCADOR EN CREAR REMITO — IGNORAR TILDES Y ORDEN
══════════════════════════════════════════════ */
// Sobreescribir buscarClienteRemito con versión mejorada
async function buscarClienteRemito(q) {
  const res = document.getElementById('r-cs-results');
  if (!res) return;

  if (!q || q.length < 2) {
    res.innerHTML = '';
    res.style.cssText = (res.getAttribute('style')||'').replace(/display:[^;]+;?/g,'') + ';display:none';
    return;
  }

  const todos = await cargarDB();
  const qNorm = normalizarTexto(q);
  const palabras = qNorm.split(/\s+/).filter(p => p.length >= 2);
  const isNum = /^\d+$/.test(qNorm);
  const numVal = isNum ? parseInt(qNorm, 10) : null;

  const filtrados = todos.filter(c => {
    if (numVal !== null && (c.num === numVal || c.num_str === q.trim())) return true;
    const haystack = normalizarTexto([c.local, c.num_str, c.loc, c.duenio].join(' '));
    // Orden de palabras independiente
    return palabras.every(p => haystack.includes(p));
  }).sort((a,b) => {
    // Exactos primero
    const na = normalizarTexto(a.local), nb = normalizarTexto(b.local);
    const eq_a = na.startsWith(qNorm) ? 0 : 1;
    const eq_b = nb.startsWith(qNorm) ? 0 : 1;
    if (eq_a !== eq_b) return eq_a - eq_b;
    return (a.num||0) - (b.num||0);
  }).slice(0, 8);

  if (!filtrados.length) {
    res.innerHTML = '';
    res.style.cssText = (res.getAttribute('style')||'').replace(/display:[^;]+;?/g,'') + ';display:none';
    return;
  }

  window._remitoSearchResults = filtrados;
  res.innerHTML = filtrados.map((c, i) => {
    const detalle = [c.loc, c.tel].filter(Boolean).join(' · ');
    const ruta = parseRuta(c.ruta);
    const rutaChip = ruta.orden ? '<span style="font-size:10px;background:#f0d6e8;color:#b03a7a;border-radius:5px;padding:1px 6px;font-weight:600;margin-right:5px">Ruta ' + esc(ruta.orden) + '</span>' : '';
    return '<div style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #f5eaf0;font-family:DM Sans,sans-serif;background:#fff" ' +
      'onmousedown="event.preventDefault();seleccionarClienteRemito(' + i + ')">' +
      '<div style="font-size:14px;font-weight:500;color:#1a0a12">' + rutaChip + esc(c.num_str||'') + ' — ' + esc(c.local||'') + '</div>' +
      (detalle ? '<div style="font-size:11px;color:#b099a8;margin-top:2px">' + esc(detalle) + '</div>' : '') +
    '</div>';
  }).join('');

  res.setAttribute('style', (res.getAttribute('style')||'').replace(/display:[^;]+;?/g,'') + ';display:block !important');
}

/* ══════════════════════════════════════════════
   10. INICIALIZACIÓN — cargar hashes al iniciar
══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function() {
  // Cargar hashes de remitos recientes para anti-duplicado
  if (navigator.onLine) {
    setTimeout(cargarHashsRemitosRecientes, 3500);
  }
});

/* ══════════════════════════════════════════════
   PATCH: guardarRemitoEnDB con check de duplicados
   y auto-creación de cliente (ver función abajo)
══════════════════════════════════════════════ */
// Monkey-patch de sbInsertRemito para anti-dup en sincronización offline
window.sbInsertRemito = sbInsertRemitoConCheck;

/* ── NOTA: guardarRemitoEnDB ya incluye anti-duplicado y auto-creación de cliente ── */

/* ══════════════════════════════════════════════
   BALANCEO DE ALIAS EN TRANSFERENCIAS
══════════════════════════════════════════════ */

// Inyectar div de sugerencia en la sección de alias cuando se carga el remito
function inyectarSugerenciaAlias() {
  if (g('alias-sugerencia')) return;
  const aliasSec = g('alias-section');
  if (!aliasSec) return;
  const div = document.createElement('div');
  div.id = 'alias-sugerencia';
  div.style.display = 'none';
  aliasSec.appendChild(div);
}

// Hook en setPago para mostrar sugerencia cuando se selecciona transferencia/deuda
const _setPago_orig = window.setPago;
window.setPago = function(btn, cls) {
  if (_setPago_orig) _setPago_orig(btn, cls);
  const isTransDeuda = cls === 'active-transferencia' || cls === 'active-deuda';
  if (isTransDeuda) {
    setTimeout(() => {
      inyectarSugerenciaAlias();
      mostrarSugerenciaAlias();
    }, 50);
  } else {
    const wrap = g('alias-sugerencia');
    if (wrap) wrap.style.display = 'none';
  }
};

/* ══════════════════════════════════════════════
   TOTALES POR ALIAS EN HISTORIAL
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   NAVEGACIÓN CON ESTADO RECORDADO
══════════════════════════════════════════════ */
var _navHistory = []; // stack de estados

function _capturarEstadoActual(nombre) {
  const estado = { page: nombre };
  // Capturar estado específico de cada página
  if (nombre === 'clientes') {
    estado.rutaFiltro = _rutaFiltro;
    estado.rubroFiltro = _rubroFiltro;
    estado.rutaDetalle = typeof _rutaDetalleActual !== 'undefined' ? _rutaDetalleActual : null;
    estado.search = g('search-input')?.value || '';
    estado.mosaico = g('ruta-mosaico')?.style.display !== 'none';
  }
  if (nombre === 'historial-remitos') {
    estado.filtros = { ..._hFiltros };
    estado.scrollY = g('page-historial-remitos')?.scrollTop || 0;
  }
  if (nombre === 'gastos') {
    estado.gastosFiltro = { ..._gastosFiltro };
    estado.scrollY = g('page-gastos')?.scrollTop || 0;
  }
  if (nombre === 'dashboard') {
    estado.mesOffset = _dashMesOffset;
  }
  return estado;
}

function _restaurarEstado(estado) {
  if (!estado) return;
  if (estado.page === 'clientes') {
    _rutaFiltro = estado.rutaFiltro;
    _rubroFiltro = estado.rubroFiltro;
    if (estado.search && g('search-input')) g('search-input').value = estado.search;
    if (estado.rutaDetalle && !estado.mosaico) {
      // Volver al detalle de ruta
      if (typeof _rutaDetalleActual !== 'undefined') _rutaDetalleActual = estado.rutaDetalle;
      if (g('ruta-mosaico')) g('ruta-mosaico').style.display = 'none';
      if (g('ruta-detalle')) g('ruta-detalle').style.display = '';
      renderListaDetalle();
    } else {
      if (g('ruta-detalle')) g('ruta-detalle').style.display = 'none';
      if (g('ruta-mosaico')) g('ruta-mosaico').style.display = '';
      renderMosaico();
    }
  }
  if (estado.page === 'historial-remitos' && estado.filtros) {
    Object.assign(_hFiltros, estado.filtros);
    renderHistorialFiltros();
    renderHistorialConFiltros();
    if (estado.scrollY) setTimeout(() => { const p = g('page-historial-remitos'); if(p) p.scrollTop = estado.scrollY; }, 100);
  }
  if (estado.page === 'gastos' && estado.gastosFiltro) {
    Object.assign(_gastosFiltro, estado.gastosFiltro);
    renderFiltrosGastos();
    renderGastos();
    if (estado.scrollY) setTimeout(() => { const p = g('page-gastos'); if(p) p.scrollTop = estado.scrollY; }, 100);
  }
  if (estado.page === 'dashboard' && estado.mesOffset !== undefined) {
    actualizarDashboard(estado.mesOffset);
  }
}

// Override de showPage para guardar estado antes de navegar
// Se llama desde index.html, así que patching via wrapper
const _showPage_orig = window.showPage;
window.showPage = function(name, navEl) {
  // Guardar estado de la página actual antes de salir
  const currentPage = document.querySelector('.page.active');
  if (currentPage) {
    const currentName = currentPage.id.replace('page-', '');
    if (currentName !== name) {
      const estado = _capturarEstadoActual(currentName);
      // Agregar al historial
      if (_navHistory.length === 0 || _navHistory[_navHistory.length-1].page !== currentName) {
        _navHistory.push(estado);
        if (_navHistory.length > 10) _navHistory.shift();
      }
    }
  }
  if (_showPage_orig) _showPage_orig(name, navEl);
};

function volverConEstado() {
  if (_navHistory.length === 0) {
    // Fallback: ir al dashboard
    if (window._showPage_orig) window._showPage_orig('inicio', document.getElementById('nav-inicio'));
    else if (window.showPage) window.showPage('inicio', document.getElementById('nav-inicio'));
    return;
  }
  const prev = _navHistory.pop();
  // Navegar sin guardar el estado de vuelta
  if (_showPage_orig) _showPage_orig(prev.page, document.getElementById('nav-' + prev.page));
  setTimeout(() => _restaurarEstado(prev), 80);
}


/* ══════════════════════════════════════════════════════════
   BLOQUE NUEVAS FUNCIONALIDADES v4
══════════════════════════════════════════════════════════ */

/* ── ALIAS guardarAliasEnDB — leer de configuraciones ── */
// Patch para que lea de las nuevas IDs en configuraciones también
const _guardarAliasEnDB_v4 = async function() {
  const alias1 = (document.getElementById('dash-alias1')?.value||'').trim();
  const alias2 = (document.getElementById('dash-alias2')?.value||'').trim();
  guardarAliasConfig(alias1, alias2);
  try {
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'alias1',value:alias1}) });
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'alias2',value:alias2}) });
    toast('✅ Alias guardados');
  } catch(e) { toast('⚠️ Guardado solo localmente'); }
};
window.guardarAliasEnDB = _guardarAliasEnDB_v4;

/* ── MÉTRICAS — actualizarDashboard v4 con deuda separada ── */
// Override del actualizarDashboard para nuevas reglas de cálculo
const _actualizarDashboard_v4_base = actualizarDashboard;
async function actualizarDashboard(mesOffset) {
  if (mesOffset !== undefined) _dashMesOffset = mesOffset;
  const el = id => document.getElementById(id);

  // Cargar alias desde configuraciones (no mostrar en dashboard)
  try {
    const cfg = await cargarAliasDesdeDB();
    const a1 = el('dash-alias1'); const a2 = el('dash-alias2');
    if (a1) a1.value = cfg.alias1 || '';
    if (a2) a2.value = cfg.alias2 || '';
    const dm = el('dash-deuda-msg');
    if (dm) dm.value = cfg.deudaMsg || leerMsgDeudaConfig() || '';
  } catch(e) {}

  // Cargar clientes
  try {
    const cs = _cache || await cargarDB();
    window._dashClientes = cs;
    try {
      const pedPend = (_pedidosCache && _pedidosCache.length)
        ? _pedidosCache.filter(p => p.estado === 'pendiente')
        : await sbPedidosFetch('select=*&estado=eq.pendiente');
      const pedEl = el('dash-pedidos-pendientes');
      if (pedEl) {
        pedEl.textContent = pedPend.length || '0';
        const card = pedEl.closest('.stat-card');
        if (card) { card.style.cursor = 'pointer'; card.onclick = () => showPage('pedidos', document.getElementById('nav-pedidos')); }
      }
    } catch(e) { if (el('dash-pedidos-pendientes')) el('dash-pedidos-pendientes').textContent = '0'; }
    if (el('dash-total')) el('dash-total').textContent = cs.length;
    const rutas = new Set(cs.map(c=>{ const r=parseRuta(c.ruta); return r.orden||''; }).filter(Boolean));
    if (el('dash-rutas')) {
      el('dash-rutas').textContent = rutas.size;
      const card = el('dash-rutas').closest('.stat-card');
      if (card) { card.style.cursor = 'pointer'; card.onclick = () => abrirModalDetalleDash('rutas', null); }
    }
    const probCount = cs.filter(c=>c.probador_cremas).length;
    if (el('dash-probadores')) {
      el('dash-probadores').textContent = probCount;
      const card = el('dash-probadores').closest('.stat-card');
      if (card) { card.style.cursor = 'pointer'; card.onclick = () => abrirModalDetalleDash('probadores', null); }
    }
    const inc = cs.filter(c=>camposFaltantes(c).length>0).length;
    if (el('dash-incompletos')) {
      el('dash-incompletos').textContent = inc;
      const card = el('dash-incompletos').closest('.stat-card');
      if (card) { card.style.cursor = 'pointer'; card.onclick = () => abrirModalDetalleDash('incompletos', null); }
    }
    const rubrosCount={};
    cs.forEach(c=>{ if(c.rubro) rubrosCount[c.rubro]=(rubrosCount[c.rubro]||0)+1; });
    const sorted=Object.entries(rubrosCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const rubrosEl = el('dash-rubros');
    if (rubrosEl) rubrosEl.innerHTML = sorted.length ? sorted.map(([r,n])=>
      '<div onclick="abrirModalDetalleDash(\'rubro\',\''+esc(r).replace(/'/g,"\\'")+'\')" '+
      'style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer;border-radius:6px;padding-left:4px;padding-right:4px" '+
      'onmouseover="this.style.background=\'var(--subtle)\'" onmouseout="this.style.background=\'\'">'+
        '<span style="font-size:13px;color:var(--text2)">'+esc(r)+'</span>'+
        '<div style="display:flex;align-items:center;gap:6px"><span class="badge badge-rose">'+n+'</span><span style="font-size:11px;color:var(--muted)">›</span></div>'+
      '</div>').join('') : '<div style="font-size:13px;color:var(--muted)">Sin datos aún</div>';
  } catch(e) {}

  const dashWrap = el('dash-remitos-wrap');
  if (!dashWrap) return;
  dashWrap.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando métricas...</div>';

  try {
    const hoy = todayStr();
    const todosR = await sbFetchRemitos('select=*');
    _historialCache = todosR; window._historialCache = todosR;

    // Calcular mes según offset
    const hoyParts = hoy.split('/');
    const hoyM = parseInt(hoyParts[1]), hoyA = 2000 + parseInt(hoyParts[2]);
    let targetM = hoyM + _dashMesOffset, targetA = hoyA;
    while (targetM < 1) { targetM += 12; targetA--; }
    while (targetM > 12) { targetM -= 12; targetA++; }
    const mesStr = String(targetM).padStart(2,'0');
    const anioStr = String(targetA).slice(-2);
    const esHoyMes = (targetM === hoyM && targetA === hoyA);

    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const nomMes = meses[targetM-1] + ' 20' + String(targetA).slice(-2);
    const fp = n => '$' + n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});

    // Remitos del mes
    const remMes = todosR.filter(r => {
      if (!r.fecha) return false;
      const p = r.fecha.split('/');
      return p[1] === mesStr && p[2] === anioStr;
    });
    window._dashRemMes = remMes;

    // Métricas con deuda separada
    // Cada remito puede sumar a más de un medio (pagos divididos)
    const efectMes = sumarTipo(remMes, 'efectivo');
    const transMes = sumarTipo(remMes, 'transferencia');
    const deudaMes = sumarTipo(remMes, 'deuda');
    const facturadoMes = efectMes + transMes; // sin deuda
    const totalConDeuda = facturadoMes + deudaMes;
    const visitasMes = remMes.length;
    const unidMes = remMes.reduce((s,r)=>s+(+r.unidades||0),0);

    // Totales históricos (desde el primer remito hasta hoy)
    const efectHist     = sumarTipo(todosR, 'efectivo');
    const transHist     = sumarTipo(todosR, 'transferencia');
    const deudaHist     = sumarTipo(todosR, 'deuda');
    const facturadoHist = efectHist + transHist;
    const visitasHist   = todosR.length;
    const unidHist      = todosR.reduce((s,r)=>s+(+r.unidades||0),0);
    window._dashRemHist = todosR;

    // Unidades por producto
    const unidPorProd = {}, unidProdLabel = {};
    remMes.forEach(r => {
      let prods=[]; try{prods=JSON.parse(r.productos||'[]');}catch(e){}
      prods.forEach(p => {
        if (!p.prod) return;
        const key = p.prod.trim().toLowerCase();
        unidPorProd[key] = (unidPorProd[key]||0) + (+p.cant||0);
        if (!unidProdLabel[key]) unidProdLabel[key] = p.prod.trim();
      });
    });
    const unidDesglose = Object.entries(unidPorProd).sort((a,b)=>b[1]-a[1])
      .map(([key,cant]) => `${unidProdLabel[key]}: <strong>${cant}</strong>`).join(' · ') || String(unidMes);

    // Remitos hoy
    const remHoy = esHoyMes ? todosR.filter(r => r.fecha === hoy) : [];
    window._dashRemitosHoy = remHoy;
    const efectHoy  = remHoy.filter(r=>r.pago==='efectivo').reduce((s,r)=>s+(+r.total||0),0);
    const transHoy  = remHoy.filter(r=>r.pago==='transferencia').reduce((s,r)=>s+(+r.total||0),0);
    const deudaHoy  = remHoy.filter(r=>r.pago==='deuda').reduce((s,r)=>s+(+r.total||0),0);
    const facturadoHoy = efectHoy + transHoy;

    renderGraficoResultados(facturadoMes, nomMes);

    // Navegador de meses
    const navMes =
      '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px">' +
        '<button onclick="actualizarDashboard(_dashMesOffset-1)" style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;font-size:13px;color:var(--muted);font-family:Inter,sans-serif;-webkit-tap-highlight-color:transparent">‹ Anterior</button>' +
        '<div style="text-align:center">' +
          '<div style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:var(--text)">' + nomMes + '</div>' +
          (!esHoyMes ? '<button onclick="actualizarDashboard(0)" style="font-size:11px;color:var(--rose);background:none;border:none;cursor:pointer;font-family:Inter,sans-serif;font-weight:600;margin-top:2px">Volver al mes actual</button>' : '<div style="font-size:11px;color:var(--muted)">Mes actual</div>') +
        '</div>' +
        '<button onclick="actualizarDashboard(_dashMesOffset+1)" style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;font-size:13px;color:' + (_dashMesOffset >= 0 ? 'var(--border)' : 'var(--muted)') + ';font-family:Inter,sans-serif;-webkit-tap-highlight-color:transparent"' + (_dashMesOffset >= 0 ? ' disabled' : '') + '>Siguiente ›</button>' +
      '</div>';

    dashWrap.innerHTML = navMes +
      (esHoyMes ? dashSection('FACTURACIÓN DE HOY — ' + hoy, [
        {label:'FACTURADO',     val:fp(facturadoHoy), color:'var(--violet)', icon:'' + ic('coins') + '', click:'abrirModalDetalleDash(\'total-hoy\',window._dashRemitosHoy)'},
        {label:'EFECTIVO',      val:fp(efectHoy),     color:'var(--violet)',       icon:'' + ic('cash') + '', click:'abrirModalDetalleDash(\'efectivo-hoy\',window._dashRemitosHoy)'},
        {label:'TRANSFERENCIA', val:fp(transHoy),     color:'var(--violet)',       icon:'' + ic('smartphone') + '', click:'abrirModalDetalleDash(\'transferencia-hoy\',window._dashRemitosHoy)'},
        {label:'DEUDA',         val:fp(deudaHoy),     color:'var(--violet)',       icon:'' + ic('clock') + '', click:'abrirModalDetalleDash(\'deuda-hoy\',window._dashRemitosHoy)'},
      ], 4) : '') +
      dashSection('Totales — ' + nomMes, [
        {label:'FACTURADO',     val:fp(facturadoMes),  color:'var(--violet)', icon:'' + ic('chart') + '', click:'abrirModalDetalleDash(\'total-mes\',window._dashRemMes)',
          subval: '<div style="font-size:10px;color:#d97706;margin-top:2px">Con deuda: ' + fp(totalConDeuda) + '</div>'},
        {label:'EFECTIVO',      val:fp(efectMes),      color:'var(--violet)', icon:'' + ic('cash') + '', click:'abrirModalDetalleDash(\'efectivo-mes\',window._dashRemMes)'},
        {label:'TRANSFERENCIA', val:fp(transMes),      color:'var(--violet)', icon:'' + ic('smartphone') + '', click:'abrirModalDetalleDash(\'transferencia-mes\',window._dashRemMes)'},
        {label:'DEUDA',         val:fp(deudaMes),      color:'var(--violet)', icon:'' + ic('clock') + '', click:'abrirModalDetalleDash(\'deuda-mes\',window._dashRemMes)'},
        {label:'VISITAS',       val:String(visitasMes),color:'var(--violet)', icon:'' + ic('truck') + '', click:'abrirModalDetalleDash(\'total-mes\',window._dashRemMes)'},
        {label:'UNIDADES',      val:String(unidMes),   color:'var(--violet)', icon:'' + ic('bag') + '', click:'abrirModalDetalleDash(\'unidades-mes\',window._dashRemMes)'},
      ], 3) +
      dashSection('Totales históricos — desde el inicio', [
        {label:'FACTURADO',     val:fp(facturadoHist),   color:'var(--violet)', icon:'' + ic('chart') + '', click:'abrirModalDetalleDash(\'total-hist\',window._dashRemHist)',
          subval: '<div style="font-size:10px;color:#d97706;margin-top:2px">Con deuda: ' + fp(facturadoHist + deudaHist) + '</div>'},
        {label:'EFECTIVO',      val:fp(efectHist),       color:'var(--violet)', icon:'' + ic('cash') + '', click:'abrirModalDetalleDash(\'efectivo-hist\',window._dashRemHist)'},
        {label:'TRANSFERENCIA', val:fp(transHist),       color:'var(--violet)', icon:'' + ic('smartphone') + '', click:'abrirModalDetalleDash(\'transferencia-hist\',window._dashRemHist)'},
        {label:'DEUDA',         val:fp(deudaHist),       color:'var(--violet)', icon:'' + ic('clock') + '', click:'abrirModalDetalleDash(\'deuda-hist\',window._dashRemHist)'},
        {label:'VISITAS',       val:String(visitasHist), color:'var(--violet)', icon:'' + ic('truck') + '', click:'abrirModalDetalleDash(\'total-hist\',window._dashRemHist)'},
        {label:'UNIDADES',      val:String(unidHist),    color:'var(--violet)', icon:'' + ic('bag') + '', click:'abrirModalDetalleDash(\'unidades-hist\',window._dashRemHist)'},
      ], 3) +
      '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:1.5rem">' +
        '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px">' + ic('box') + ' Unidades por producto — ' + nomMes + '</div>' +
        '<div style="font-size:13px;color:var(--text);line-height:1.8">' + unidDesglose + '</div>' +
      '</div>';

    // Rankings en contenedor separado (toggle)
    const rankingsContenido = document.getElementById('dash-rankings-contenido');
    if (rankingsContenido) {
      const clientes = await cargarDB();
      rankingsContenido.innerHTML = renderRankingsDash(remMes, clientes);
    }

  } catch(e) {
    if (dashWrap) dashWrap.innerHTML = '<div style="background:#fff3cd;border:1px solid #fcd97a;border-radius:var(--radius);padding:12px 14px;font-size:13px;color:#7a5200">' + ic('alert') + ' No se pudieron cargar las métricas.</div>';
    console.warn('Dashboard error:', e.message);
  }
}

// Override dashSection para soportar subval
const _dashSection_orig = dashSection;
function dashSection(titulo, items, cols) {
  return '<div style="margin-bottom:1.5rem">'+
    '<div class="dash-section-title">'+esc(titulo)+'</div>'+
    '<div class="dash-grid dash-cols-'+cols+'">'+
    items.map(item=>
      '<div class="dash-metric-card'+(item.click?' dash-metric-clickable':'')+'"'+
        (item.click?' onclick="'+item.click+'" style="cursor:pointer"':'')+'>'+
        '<div class="dash-metric-label">'+esc(item.label)+'<span class="dash-metric-icon">'+item.icon+'</span></div>'+
        '<div class="dash-metric-val" style="color:'+item.color+'">'+esc(item.val)+'</div>'+
        (item.subval ? item.subval : '')+
        (item.click?'<div style="font-size:9px;color:var(--muted);margin-top:4px;opacity:.7">ver detalle →</div>':'')+
      '</div>'
    ).join('')+
    '</div></div>';
}

/* ══════════════════════════════════════════════
   EXPORTAR CLIENTES CSV
══════════════════════════════════════════════ */
async function exportarClientesCSV() {
  const btn = document.querySelector('[onclick="exportarClientesCSV()"]');
  if (btn) { btn.textContent = 'Exportando...'; btn.disabled = true; }
  try {
    const todos = await cargarDB();
    const cabecera = ['N°','Nombre','Rubro','Dueño','CUIT/DNI','Teléfono','Teléfono2','Dirección','Localidad','Ruta','Régimen','Probador'];
    const filas = todos.map(c => {
      const ruta = parseRuta(c.ruta);
      return [
        c.num_str||'', c.local||'', c.rubro||'', c.duenio||'',
        c.cuit||'', c.tel||'', c.tel2||'', c.dir||'', c.loc||'',
        ruta.orden||'', c.regimen||'', c.probador_cremas?'Sí':'No'
      ].map(v => '"' + String(v).replace(/"/g,'""') + '"');
    });
    const csv = [cabecera.map(h=>'"'+h+'"').join(','), ...filas.map(f=>f.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clientes_intencional_' + todayStr().replace(/\//g,'-') + '.csv';
    a.click(); URL.revokeObjectURL(url);
    toast('✓ CSV exportado — ' + todos.length + ' clientes');
  } catch(e) { toast('Error: ' + e.message); }
  finally { if (btn) { btn.textContent = 'Exportar clientes (CSV)'; btn.disabled = false; } }
}

/* ══════════════════════════════════════════════
   EXPORTAR PDF MENSUAL
══════════════════════════════════════════════ */
function abrirExportarPDFMensual() {
  let modal = g('modal-pdf-mensual');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-pdf-mensual';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) modal.style.display='none'; document.body.style.overflow=''; });
    document.body.appendChild(modal);
  }
  const hoy = todayStr().split('/');
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:500px;padding:1.5rem;padding-bottom:calc(1.5rem + env(safe-area-inset-bottom))">' +
      '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;margin-bottom:1rem">' + ic('file') + ' Exportar resumen mensual</div>' +
      '<div class="field-group" style="margin-bottom:12px">' +
        '<div class="field-label">Mes</div>' +
        '<select class="field-input" id="pdf-mes">' +
          ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            .map((m,i) => '<option value="' + String(i+1).padStart(2,'0') + '"' + (String(i+1).padStart(2,'0')===hoy[1]?' selected':'') + '>' + m + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="field-group" style="margin-bottom:20px">' +
        '<div class="field-label">Año</div>' +
        '<input class="field-input" id="pdf-anio" type="number" value="20' + hoy[2] + '" min="2020" max="2030"/>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
        '<button onclick="this.closest(\'#modal-pdf-mensual\')||document.getElementById(\'modal-pdf-mensual\').style.display=\'none\'" class="btn-secondary" style="flex:1">Cancelar</button>' +
        '<button onclick="generarPDFMensual()" class="btn-primary" style="flex:2">Generar PDF</button>' +
      '</div>' +
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

async function generarPDFMensual() {
  const mesEl = document.getElementById('pdf-mes');
  const anioEl = document.getElementById('pdf-anio');
  if (!mesEl || !anioEl) return;
  const mes = mesEl.value;
  const anio = String(+anioEl.value).slice(-2);
  const anioFull = anioEl.value;
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const nomMes = meses[parseInt(mes,10)-1] + ' ' + anioFull;

  const modal = document.getElementById('modal-pdf-mensual');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }

  toast('Generando PDF...');

  try {
    const todosR = _historialCache.length ? _historialCache : await sbFetchRemitos('select=*');
    const remMes = todosR.filter(r => {
      if (!r.fecha) return false;
      const p = r.fecha.split('/');
      return p[1] === mes && p[2] === anio;
    });

    const fp = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
    const efectivo = sumarTipo(remMes, 'efectivo');
    const transfer = sumarTipo(remMes, 'transferencia');
    const deuda    = sumarTipo(remMes, 'deuda');
    const facturado = efectivo + transfer;

    const pagoColor = {efectivo:'#059669',transferencia:'#2563eb',deuda:'#d97706'};
    const pagoLabel = {efectivo:'Efectivo',transferencia:'Transferencia',deuda:'Deuda'};

    const filas = remMes.map(r => {
      const color = pagoColor[r.pago] || '#666';
      const label = pagoLabel[r.pago] || r.pago;
      return `<tr>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:12px">${esc(r.fecha||'')}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;font-weight:500">${esc(r.cliente_nombre||'—')}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:11px;color:#666">${esc(r.cliente_loc||'')}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;color:${color};font-weight:600">${label}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:right;font-weight:700;color:#6b21a8">${fp(+r.total||0)}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Resumen ${nomMes} — Intencional</title>
    <style>
      body{font-family:Arial,sans-serif;color:#1a0a12;margin:0;padding:24px;background:#fff}
      h1{font-size:22px;margin-bottom:4px;background:linear-gradient(135deg,#9b6bb5,#c84b8c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .sub{font-size:12px;color:#888;margin-bottom:20px}
      .resumen{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
      .card{background:#fafaf8;border:1px solid #ede8e8;border-radius:10px;padding:12px;text-align:center}
      .card-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9c8b88;margin-bottom:4px}
      .card-val{font-size:18px;font-weight:700}
      table{width:100%;border-collapse:collapse}
      thead th{background:#f5f0f5;padding:8px 10px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a4e4c}
      @media print{body{padding:12px}}
    </style></head><body>
    <h1>Intencional — Resumen ${nomMes}</h1>
    <div class="sub">Generado el ${new Date().toLocaleDateString('es-AR')}</div>
    <div class="resumen">
      <div class="card"><div class="card-label">Facturado</div><div class="card-val" style="color:#6b21a8">${fp(facturado)}</div></div>
      <div class="card"><div class="card-label">Efectivo</div><div class="card-val" style="color:#059669">${fp(efectivo)}</div></div>
      <div class="card"><div class="card-label">Transferencia</div><div class="card-val" style="color:#2563eb">${fp(transfer)}</div></div>
      <div class="card"><div class="card-label">Deuda</div><div class="card-val" style="color:#d97706">${fp(deuda)}</div></div>
    </div>
    <table>
      <thead><tr>
        <th>Fecha</th><th>Cliente</th><th>Localidad</th><th>Pago</th><th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div style="margin-top:16px;font-size:11px;color:#888;text-align:right">${remMes.length} movimientos · Intencional © ${anioFull}</div>
    <script>window.onload=function(){window.print();}<\/script>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('✓ PDF listo — se abrió para imprimir');
  } catch(e) { toast('Error: ' + e.message); }
}

/* ══════════════════════════════════════════════
   DEUDA MESSAGE EN compartirRemitoGuardado
══════════════════════════════════════════════ */
// Patch compartirRemitoGuardado para incluir mensaje deuda
const _compartirRemitoGuardado_orig = compartirRemitoGuardado;
async function compartirRemitoGuardado(id) {
  // Si el remito tiene deuda, mostrar el mensaje deuda en el card antes de compartir
  const r = (_historialCache||[]).find(x=>x.id===id);
  if (r && r.pago === 'deuda') {
    // Asegurarse de que el alias y el aviso de deuda se carguen antes de capturar
    await _compartirRemitoGuardado_orig(id);
    return;
  }
  await _compartirRemitoGuardado_orig(id);
}

/* ══════════════════════════════════════════════
   ESTABILIDAD — Refresco automático en inactividad
══════════════════════════════════════════════ */
var _ultimaActividad = Date.now();
var _inactivoAlertado = false;

document.addEventListener('touchstart', () => { _ultimaActividad = Date.now(); _inactivoAlertado = false; });
document.addEventListener('click', () => { _ultimaActividad = Date.now(); _inactivoAlertado = false; });

setInterval(async function _checkInactividad() {
  const inactivo = Date.now() - _ultimaActividad;
  // Si lleva más de 15 minutos inactivo y vuelve a activarse
  if (inactivo < 1000 && _inactivoAlertado) {
    // Revalidar sesión y refrescar cache
    _inactivoAlertado = false;
    try {
      const raw = localStorage.getItem('sb_session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.refresh_token && s.expires_at && Date.now() > s.expires_at - 300000) {
          const nuevo = await refrescarToken(s.refresh_token);
          if (nuevo) window._authSession = nuevo;
        }
      }
      // Limpiar caches para que se recarguen fresh
      _cache = null;
    } catch(e) {}
  }
  if (inactivo > 900000 && !_inactivoAlertado) { // 15 minutos
    _inactivoAlertado = true;
    _cache = null; // invalidar cache de clientes
  }
}, 5000);


/* ══════════════════════════════════════════════
   FIXES v4.1
══════════════════════════════════════════════ */

/* ── Fix: verDetalleRemito → alias de verRemitoCompleto ── */
function verDetalleRemito(id) { verRemitoCompleto(id); }

/* ══════════════════════════════════════════════
   FILTRO POR MES EN REMITOS HECHOS
   Agrega chip "Por mes" al sistema de filtros existente
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   FILTRO POR MES — REMITOS HECHOS
   Se integra directamente en renderHistorialFiltros
   y renderHistorialConFiltros (ya redefinidas abajo)
══════════════════════════════════════════════ */

// Extender _hFiltros con campo mes si no existe
if (typeof _hFiltros !== 'undefined' && !('mes' in _hFiltros)) {
  _hFiltros.mes = null;
}

// Helper: chips de mes disponibles para historial
function _getMesesDisponiblesHistorial() {
  return [...new Set(
    (_historialCache||[]).map(r => {
      if (!r.fecha) return null;
      const p = r.fecha.split('/');
      return p.length >= 3 ? p[1] + '/' + p[2] : null;
    }).filter(Boolean)
  )].sort((a,b) => {
    const [ma,aa] = a.split('/').map(Number);
    const [mb,ab] = b.split('/').map(Number);
    return (aa*12+ma) - (ab*12+mb);
  }).reverse().slice(0, 6);
}

// Helper: chips de mes disponibles para gastos
function _getMesesDisponiblesGastos() {
  return [...new Set(
    (_gastosCache||[]).map(g => {
      if (!g.fecha) return null;
      const p = g.fecha.split('/');
      return p.length >= 3 ? p[1] + '/' + p[2] : null;
    }).filter(Boolean)
  )].sort((a,b) => {
    const [ma,aa] = a.split('/').map(Number);
    const [mb,ab] = b.split('/').map(Number);
    return (aa*12+ma) - (ab*12+mb);
  }).reverse().slice(0, 6);
}

// Extender _gastosFiltro con mes si no existe
if (typeof _gastosFiltro !== 'undefined' && !('mesEspecifico' in _gastosFiltro)) {
  _gastosFiltro.mesEspecifico = null;
}

/* ══════════════════════════════════════════════
   EXHIBIDOR RETIRADO — campo en ficha de cliente
══════════════════════════════════════════════ */
function abrirModalExhibidorRetirado(num) {
  const c = (_cache||[]).find(x=>x.num===num);
  if (!c) { toast('Cliente no encontrado'); return; }

  let modal = g('modal-exhibidor');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-exhibidor';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1300;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) { modal.style.display='none'; document.body.style.overflow=''; } });
    document.body.appendChild(modal);
  }

  let exhibData = {};
  try { exhibData = JSON.parse(c.exhibidor_retirado||'{}'); } catch(e) {}

  const motivos = ['Pedido del cliente', 'Cierre del cliente', 'Decisión interna'];
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:1.25rem;padding-bottom:calc(1.25rem + env(safe-area-inset-bottom))">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('store') + ' Exhibidor retirado</div>' +
        '<button onclick="this.closest(\'#modal-exhibidor\').style.display=\'none\';document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer">×</button>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-bottom:14px">Cliente: <strong>' + esc(c.local) + '</strong></div>' +
      '<div class="field-group" style="margin-bottom:12px">' +
        '<div class="field-label">Motivo del retiro</div>' +
        '<select class="field-input" id="exhib-motivo">' +
          motivos.map(m => '<option value="' + m + '"' + (exhibData.motivo===m?' selected':'') + '>' + m + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="field-group" style="margin-bottom:12px">' +
        '<div class="field-label">Fecha de retiro</div>' +
        '<input class="field-input" id="exhib-fecha" type="text" placeholder="DD/MM/AA" maxlength="8" inputmode="numeric" value="' + esc(exhibData.fecha||'') + '" oninput="fmtFechaInput(this)"/>' +
      '</div>' +
      '<div class="field-group" style="margin-bottom:16px">' +
        '<div class="field-label">Comentario <span style="font-size:9px">(opcional)</span></div>' +
        '<textarea class="field-input" id="exhib-comentario" rows="2" placeholder="Detalle adicional...">' + esc(exhibData.comentario||'') + '</textarea>' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        (exhibData.motivo ? '<button onclick="limpiarExhibidor('+num+')" class="btn-secondary" style="flex:1">' + ic('trash') + ' Limpiar</button>' : '') +
        '<button onclick="guardarExhibidor('+num+')" class="btn-primary" style="flex:2">' + ic('save') + ' Guardar</button>' +
      '</div>' +
    '</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

async function guardarExhibidor(num) {
  const motivo   = g('exhib-motivo')?.value || '';
  const fecha    = g('exhib-fecha')?.value || '';
  const comentario = g('exhib-comentario')?.value || '';
  const data = { motivo, fecha, comentario, timestamp: Date.now() };
  try {
    await sbUpdate(num, { exhibidor_retirado: JSON.stringify(data) });
    _cache = null;
    g('modal-exhibidor').style.display = 'none';
    document.body.style.overflow = '';
    toast('✓ Exhibidor registrado');
    renderListaDetalle();
  } catch(e) { toast('Error: ' + e.message); }
}

async function limpiarExhibidor(num) {
  if (!confirm('¿Limpiar el registro de exhibidor retirado?')) return;
  try {
    await sbUpdate(num, { exhibidor_retirado: null });
    _cache = null;
    g('modal-exhibidor').style.display = 'none';
    document.body.style.overflow = '';
    toast('✓ Registro limpiado');
    renderListaDetalle();
  } catch(e) { toast('Error: ' + e.message); }
}

/* ══════════════════════════════════════════════
   FIX: deuda message al compartir remito guardado
   Inyectar el texto de deuda en el aviso antes de capturar
══════════════════════════════════════════════ */
// Re-patch compartirRemitoGuardado para mostrar aviso deuda
window.compartirRemitoGuardado = async function(id) {
  const r = (_historialCache||[]).find(x=>x.id===id);
  if (!r) { toast('⚠️ Remito no encontrado'); return; }

  const verModal = document.getElementById('remito-ver-modal');
  if (verModal) { verModal.style.display='none'; document.body.style.overflow=''; }

  let prods = [];
  try { prods = JSON.parse(r.productos||'[]'); } catch(e){}

  const spinner = document.createElement('div');
  spinner.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,.95);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px';
  spinner.innerHTML = '<div style="width:40px;height:40px;border:3px solid #f0d6e8;border-top-color:#d6539a;border-radius:50%;animation:spin .8s linear infinite"></div><div style="font-size:14px;color:#b06090;font-family:Inter,sans-serif;font-weight:500">Generando imagen...</div>';
  if (!document.getElementById('spin-style')) {
    const st = document.createElement('style'); st.id='spin-style';
    st.textContent='@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }
  document.body.appendChild(spinner);

  showPage('remitos', document.getElementById('nav-remitos'));
  await new Promise(res => setTimeout(res, typeof _remitoLoaded !== 'undefined' && _remitoLoaded ? 100 : 400));

  const card = document.getElementById('remito-card');
  if (!card) { spinner.remove(); toast('⚠️ No se pudo generar el remito'); return; }

  const setVal = (fieldId, val) => { const el = document.getElementById(fieldId); if(el) el.value = val||''; };
  setVal('f-nombre', r.cliente_nombre);
  setVal('f-dir',    r.cliente_dir);
  setVal('f-loc',    r.cliente_loc);
  setVal('f-tel',    r.cliente_tel);
  setVal('f-fecha',  r.fecha);

  rows = prods.map(p => ({ prod: p.prod||'', cant: +p.cant||1, precio: +p.precio||0, manual: false }));
  if (rows.length === 0) rows = [{ prod:'', cant:1, precio:0, manual:false }];
  renderRows();
  calcTotal();

  // Seleccionar pago y activar aviso de deuda si corresponde
  document.querySelectorAll('.pago-btn').forEach(b => b.className='pago-btn');
  const pagoTexto = { efectivo:'Efectivo', transferencia:'Transferencia', deuda:'Deuda pendiente' };
  const pagoClase = { efectivo:'active-efectivo', transferencia:'active-transferencia', deuda:'active-deuda' };
  const segPagoData = typeof getSegundoPago === 'function' ? getSegundoPago() : null;
  if (r.pago && pagoClase[r.pago]) {
    document.querySelectorAll('.pago-btn').forEach(b => {
      if (b.textContent.trim() === pagoTexto[r.pago]) b.classList.add(pagoClase[r.pago]);
    });
  }

  // Si es deuda → mostrar aviso con el mensaje configurado
  if (r.pago === 'deuda') {
    const deudaAviso = document.getElementById('deuda-aviso');
    if (deudaAviso) {
      deudaAviso.classList.add('visible');
      // Completar alias en el mensaje
      const cfg = leerAliasConfig();
      const aliasTexto = r.alias || cfg.alias1 || cfg.alias2 || '—';
      const msgTpl = leerMsgDeudaConfig() ||
        '' + ic('alert') + ' *Recordá realizarme la transferencia al alias {alias}* para saldar tu deuda pendiente. ¡Muchas gracias!';
      const msgEl = deudaAviso.querySelector('.deuda-msg-text') || deudaAviso;
      if (msgEl && msgEl !== deudaAviso) msgEl.textContent = msgTpl.replace(/\{alias\}/g, aliasTexto);
      else {
        // Buscar cualquier elemento de texto dentro del aviso
        const spans = deudaAviso.querySelectorAll('p, span, div');
        if (spans.length) spans[0].innerHTML = msgTpl.replace(/\{alias\}/g, aliasTexto);
      }
    }
    // Activar alias si está disponible
    if (r.alias) {
      document.querySelectorAll('.alias-btn').forEach(b => {
        if (b.textContent.trim() === r.alias) b.classList.add('active');
      });
    }
  }

  const btnGroup  = card.querySelector('.btn-group');
  const aliasSec  = document.getElementById('alias-section');
  const searchBar = document.getElementById('r-cs-badge');
  const rcsWrap   = document.querySelector('#remito-frame-wrap > div:first-child');
  if (btnGroup)  btnGroup.style.display  = 'none';
  if (aliasSec && r.pago !== 'deuda')  aliasSec.style.display  = 'none';
  if (searchBar) searchBar.style.display = 'none';
  if (rcsWrap)   rcsWrap.style.display   = 'none';

  await new Promise(res => setTimeout(res, 300));

  const cleanup = () => {
    spinner.remove();
    if (btnGroup)  btnGroup.style.display  = '';
    if (aliasSec)  aliasSec.style.display  = '';
    if (searchBar) searchBar.style.display = '';
    if (rcsWrap)   rcsWrap.style.display   = '';
    ['f-nombre','f-dir','f-loc','f-tel'].forEach(fid => { const el=document.getElementById(fid); if(el) el.value=''; });
    rows=[]; addRow('Esmalte en Gel',1,'');
    document.querySelectorAll('.pago-btn').forEach(b=>b.className='pago-btn');
    const _as=document.getElementById('alias-section'); if(_as) _as.style.display='none';
    const da=document.getElementById('deuda-aviso'); if(da) da.classList.remove('visible');
    window._clienteRemitoActual = null;
    showPage('historial-remitos', document.getElementById('nav-historial-remitos'));
  };

  try {
    const canvas = await capturarRemitoCard(card);
    const nombre   = r.cliente_nombre || 'remito';
    const fecha    = r.fecha || todayStr();
    const fileName = 'intencional_' + nombre.trim().replace(/\s+/g,'_') + '_' + fecha.replace(/\//g,'-') + '.png';
    const blob     = await new Promise(res => canvas.toBlob(res, 'image/png', 1.0));
    const fileImg  = new File([blob], fileName, { type:'image/png' });
    cleanup();
    const telLimpio = (r.cliente_tel||'').trim().replace(/[\s\-\.\(\)]/g,'');
    const telWA = telLimpio
      ? (telLimpio.startsWith('+') ? telLimpio.replace('+','') : '549'+(telLimpio.startsWith('0')?telLimpio.slice(1):telLimpio))
      : '';
    if (navigator.share && navigator.canShare && navigator.canShare({ files:[fileImg] })) {
      try { await navigator.share({ files:[fileImg], title: getTitleCompartir() }); }
      catch(e) { if(e.name!=='AbortError') descargarImagen(canvas.toDataURL('image/png'), fileName); }
    } else {
      descargarImagen(canvas.toDataURL('image/png'), fileName);
      if (telWA) {
        const msg = encodeURIComponent(getMsgCompartir(r.cliente_nombre));
        setTimeout(()=>window.open('https://wa.me/'+telWA+'?text='+msg,'_blank'), 400);
      }
    }
  } catch(e) {
    cleanup();
    toast('⚠️ No se pudo generar la imagen: ' + e.message);
  }
};


/* ══════════════════════════════════════════════
   MENSAJE DE COMPARTIR REMITO — configurable
══════════════════════════════════════════════ */
const _SHARE_MSG_KEY = 'intencional_share_msg';
const _SHARE_TITLE_KEY = 'intencional_share_title';

function leerMsgCompartir() {
  try { return localStorage.getItem(_SHARE_MSG_KEY) || ''; } catch(e) { return ''; }
}
function leerTitleCompartir() {
  try { return localStorage.getItem(_SHARE_TITLE_KEY) || ''; } catch(e) { return ''; }
}

function getMsgCompartir(nombreCliente) {
  const base = leerMsgCompartir() || 'Hola! Te mando el remito de Intencional ';
  return base.replace(/\{cliente\}/gi, nombreCliente || '');
}
function getTitleCompartir() {
  return leerTitleCompartir() || 'Remito Intencional';
}

async function guardarMsgCompartir() {
  const msg   = (document.getElementById('cfg-share-msg')?.value   || '').trim();
  const title = (document.getElementById('cfg-share-title')?.value || '').trim();
  try { localStorage.setItem(_SHARE_MSG_KEY,   msg);   } catch(e) {}
  try { localStorage.setItem(_SHARE_TITLE_KEY, title); } catch(e) {}
  try {
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'share_msg',   value: msg})   });
    await sbFetch('config', { method:'POST', headers:{'Prefer':'resolution=merge-duplicates'}, body: JSON.stringify({key:'share_title', value: title}) });
    toast('✅ Mensaje de compartir guardado');
  } catch(e) {
    toast('⚠️ Guardado localmente (sin conexión)');
  }
}


/* ══════════════════════════════════════════════════════════════
   EXPORTAR VCF — Contactos para iPhone / agenda masiva
══════════════════════════════════════════════════════════════ */

async function abrirExportarVCF() {
  // Cargar clientes si no están en cache
  const clientes = _cache || await cargarDB();

  // Obtener rutas disponibles
  const rutasDisp = [...new Set(clientes.map(c => {
    const r = parseRuta(c.ruta);
    return r.orden ? String(r.orden) : null;
  }).filter(Boolean))].sort((a,b) => parseInt(a)-parseInt(b));

  let modal = g('vcf-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'vcf-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.52);z-index:1200;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if(e.target===modal) cerrarVCFModal(); });
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">' +
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + ic('clipboard') + ' Exportar contactos .vcf</div>' +
        '<button onclick="cerrarVCFModal()" style="background:none;border:none;font-size:26px;color:var(--muted);cursor:pointer;line-height:1;padding:0 4px">×</button>' +
      '</div>' +
      '<div style="padding:1.2rem;display:flex;flex-direction:column;gap:14px">' +

        '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius);padding:11px 13px;font-size:12.5px;color:#15803d;line-height:1.6">' +
          '' + ic('smartphone') + ' El .vcf se importa desde <strong>Archivos</strong> en iPhone, o envialo por AirDrop / iCloud Mail para agregar todos los contactos de una vez.' +
        '</div>' +

        '<div>' +
          '<div class="field-label" style="margin-bottom:8px">¿Qué clientes exportar?</div>' +
          '<div style="display:flex;flex-direction:column;gap:7px">' +

            '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--rose);border-radius:var(--radius);cursor:pointer;background:var(--subtle)">' +
              '<input type="radio" name="vcf-tipo" value="todos" checked style="accent-color:var(--rose);width:16px;height:16px"/>' +
              '<div><div style="font-size:13px;font-weight:600;color:var(--text)">Todos los clientes</div>' +
              '<div style="font-size:11px;color:var(--muted)">' + clientes.length + ' contactos</div></div>' +
            '</label>' +

            '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius);cursor:pointer;background:var(--surface)">' +
              '<input type="radio" name="vcf-tipo" value="ruta" style="accent-color:var(--rose);width:16px;height:16px" onchange="document.getElementById(\'vcf-ruta-select\').style.display=this.checked?\'\':\'none\'"/>' +
              '<div style="flex:1">' +
                '<div style="font-size:13px;font-weight:600;color:var(--text)">Una hoja de ruta</div>' +
                '<div style="font-size:11px;color:var(--muted)">Solo los clientes de una ruta específica</div>' +
              '</div>' +
            '</label>' +
            '<select id="vcf-ruta-select" style="display:none;border:1.5px solid var(--rose);border-radius:var(--radius);padding:9px 12px;font-size:13px;font-family:Inter,sans-serif;color:var(--text);background:var(--bg);margin-left:26px">' +
              '<option value="">— Elegí una ruta —</option>' +
              rutasDisp.map(r => '<option value="' + r + '">Ruta ' + r + '</option>').join('') +
              '<option value="__sin__">Sin ruta (SR-)</option>' +
            '</select>' +

            '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius);cursor:pointer;background:var(--surface)">' +
              '<input type="radio" name="vcf-tipo" value="seleccion" style="accent-color:var(--rose);width:16px;height:16px" onchange="document.getElementById(\'vcf-seleccion-wrap\').style.display=this.checked?\'\':\'none\'"/>' +
              '<div>' +
                '<div style="font-size:13px;font-weight:600;color:var(--text)">Selección manual</div>' +
                '<div style="font-size:11px;color:var(--muted)">Marcá cliente por cliente</div>' +
              '</div>' +
            '</label>' +

          '</div>' +
        '</div>' +

        '<div id="vcf-seleccion-wrap" style="display:none;border:1.5px solid var(--border);border-radius:var(--radius);overflow:hidden">' +
          '<div style="padding:10px 12px;background:var(--subtle);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">' +
            '<span style="font-size:12px;font-weight:600;color:var(--text)">Elegí los clientes</span>' +
            '<button onclick="seleccionarTodosVCF()" style="font-size:11px;color:var(--rose);background:none;border:none;cursor:pointer;font-weight:700;font-family:Inter,sans-serif">Todos</button>' +
          '</div>' +
          '<input id="vcf-search" placeholder="Buscar..." oninput="filtrarListaVCF(this.value)" style="width:100%;box-sizing:border-box;border:none;border-bottom:1px solid var(--border);padding:8px 12px;font-size:13px;font-family:Inter,sans-serif;background:var(--bg);outline:none"/>' +
          '<div id="vcf-lista-clientes" style="max-height:220px;overflow-y:auto"></div>' +
          '<div id="vcf-sel-count" style="padding:7px 12px;font-size:11px;color:var(--muted);text-align:right;border-top:1px solid var(--border)">0 seleccionados</div>' +
        '</div>' +

        '<div>' +
          '<div class="field-label" style="margin-bottom:8px">Datos a incluir en cada contacto</div>' +
          ['telefono','direccion','empresa','notas'].map(campo => {
            const labels = { telefono:'Teléfono', direccion:'Dirección y localidad', empresa:'Rubro (como empresa)', notas:'N° de cliente y ruta (como notas)' };
            return '<label style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px;cursor:pointer">' +
              '<input type="checkbox" id="vcf-campo-' + campo + '" checked style="accent-color:var(--rose);width:15px;height:15px"/>' +
              '<span>' + labels[campo] + '</span></label>';
          }).join('') +
        '</div>' +

        '<button onclick="ejecutarExportVCF()" class="btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:14px;font-weight:700">' + ic('download') + ' Generar y descargar .vcf</button>' +

      '</div>' +
    '</div>';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Guardar clientes para selección manual
  window._vcfTodosClientes = clientes;
  window._vcfSeleccionados = new Set();
  renderListaVCF(clientes);
}

function cerrarVCFModal() {
  const m = g('vcf-modal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

function renderListaVCF(lista) {
  const wrap = g('vcf-lista-clientes');
  if (!wrap) return;
  if (!lista || !lista.length) {
    wrap.innerHTML = '<div style="padding:1rem;font-size:13px;color:var(--muted);text-align:center">Sin resultados</div>';
    return;
  }
  wrap.innerHTML = lista.map(c => {
    const ruta = parseRuta(c.ruta);
    const rutaLabel = ruta.orden ? 'Ruta ' + ruta.orden : 'Sin ruta';
    const checked = (window._vcfSeleccionados||new Set()).has(c.num);
    return '<label style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer;background:' + (checked?'var(--subtle)':'transparent') + '">' +
      '<input type="checkbox" value="' + c.num + '" ' + (checked?'checked':'') + ' onchange="toggleVCFSelect(' + c.num + ',this.checked)" style="accent-color:var(--rose);width:15px;height:15px;flex-shrink:0"/>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.local||'') + '</div>' +
        '<div style="font-size:11px;color:var(--muted)">' + esc(c.num_str||'') + ' · ' + esc(rutaLabel) + (c.loc?' · '+esc(c.loc):'') + '</div>' +
      '</div></label>';
  }).join('');
  actualizarContadorVCF();
}

function filtrarListaVCF(q) {
  const ql = (q||'').toLowerCase();
  const lista = window._vcfTodosClientes || [];
  const filtrados = ql.length < 2 ? lista : lista.filter(c => {
    const r = parseRuta(c.ruta);
    return [c.local, c.num_str, c.loc, r.orden ? 'ruta '+r.orden : 'sin ruta'].join(' ').toLowerCase().includes(ql);
  });
  renderListaVCF(filtrados);
}

function toggleVCFSelect(num, checked) {
  if (!window._vcfSeleccionados) window._vcfSeleccionados = new Set();
  if (checked) window._vcfSeleccionados.add(num);
  else window._vcfSeleccionados.delete(num);
  actualizarContadorVCF();
}

function seleccionarTodosVCF() {
  const lista = window._vcfTodosClientes || [];
  if (!window._vcfSeleccionados) window._vcfSeleccionados = new Set();
  lista.forEach(c => window._vcfSeleccionados.add(c.num));
  renderListaVCF(lista);
}

function actualizarContadorVCF() {
  const n = (window._vcfSeleccionados||new Set()).size;
  const el = g('vcf-sel-count');
  if (el) el.textContent = n + ' seleccionado' + (n!==1?'s':'');
}

function formatearTelArgentina(tel) {
  const limpio = (tel||'').replace(/[^\d+]/g,'');
  if (!limpio) return '';
  if (limpio.startsWith('+')) return limpio;
  if (limpio.startsWith('549')) return '+' + limpio;
  if (limpio.startsWith('54')) return '+549' + limpio.slice(2);
  // Número local: quitar 0 inicial si hay y agregar +549
  const num = limpio.startsWith('0') ? limpio.slice(1) : limpio;
  return '+549' + num;
}

function clienteAVCF(c) {
  const ruta = parseRuta(c.ruta);
  const inclTel = document.getElementById('vcf-campo-telefono')?.checked !== false;
  const inclDir = document.getElementById('vcf-campo-direccion')?.checked !== false;
  const inclEmp = document.getElementById('vcf-campo-empresa')?.checked !== false;
  const inclNot = document.getElementById('vcf-campo-notas')?.checked !== false;

  // Nombre limpio del local (sin punto y coma ni comas que rompen VCF)
  const nombre = (c.local||'').replace(/[;,]/g,' ').trim();
  const duenio = (c.duenio||'').replace(/[;,]/g,' ').trim();

  // Acortar num_str quitando ceros: R1-0001→R1-1, SR-0042→SR-42, R12-0255→R12-255
  const _m = (c.num_str||'').match(/^([A-Za-z0-9]+-)(\d+)$/);
  const numCorto = _m ? _m[1].toUpperCase() + parseInt(_m[2]) : (c.num_str||'');

  // El nombre visible en la agenda: "Farmacia Amor [R1-7]"
  // En VCF, N:apellido;nombre;;; → iPhone muestra "nombre apellido"
  // Para que quede "Farmacia Amor [R1-7]":
  //   N:;Farmacia Amor [R1-7];;;  (sin apellido separado, todo en el campo nombre)
  const nombreConNum = nombre + (numCorto ? ' [' + numCorto + ']' : '');

  let v = 'BEGIN:VCARD\n';
  v += 'VERSION:3.0\n';
  // FN = nombre completo de display
  v += 'FN:' + nombreConNum + '\n';
  // N: dejar apellido vacío, poner nombreConNum en campo nombre
  // Así iPhone muestra exactamente "Farmacia Amor [R1-7]" sin reordenar
  v += 'N:;' + nombreConNum + ';;;\n';

  // Rubro como empresa (aparece encima del nombre en la ficha, igual que en la imagen)
  if (inclEmp && c.rubro) {
    v += 'ORG:' + (c.rubro||'').replace(/[;,]/g,' ') + '\n';
  }

  // Teléfonos como celular (igual que en la imagen)
  if (inclTel) {
    const t1 = formatearTelArgentina(c.tel);
    const t2 = formatearTelArgentina(c.tel2);
    if (t1) v += 'TEL;TYPE=CELL,PREF:' + t1 + '\n';
    if (t2) v += 'TEL;TYPE=CELL:' + t2 + '\n';
  }

  // Dirección como trabajo (igual que en la imagen)
  if (inclDir) {
    const dir = (c.dir||'').replace(/;/g,' ').replace(/\n/g,' ').trim();
    const loc = (c.loc||'').replace(/;/g,' ').trim();
    if (dir || loc) {
      // ADR: PO Box; Extended; Street; City; Region; ZIP; Country
      v += 'ADR;TYPE=WORK:;;' + dir + ';' + loc + ';;;Argentina\n';
    }
  }

  // Notas: número completo, ruta, régimen, CUIT (igual que en la imagen)
  if (inclNot) {
    const rutaLabel = ruta.orden ? 'Ruta ' + ruta.orden : 'Sin ruta';
    const partes = [
      c.num_str ? 'Nro: ' + c.num_str : '',
      rutaLabel,
      c.regimen || '',
      c.cuit ? 'CUIT: ' + c.cuit : '',
      duenio ? 'Dueño: ' + duenio : ''
    ].filter(Boolean);
    if (partes.length) v += 'NOTE:' + partes.join(' | ').replace(/\n/g,' ') + '\n';
  }

  v += 'CATEGORIES:Intencional\n';
  v += 'END:VCARD\n';
  return v;
}

async function ejecutarExportVCF() {
  const tipo = document.querySelector('input[name="vcf-tipo"]:checked')?.value || 'todos';
  const btn = document.querySelector('#vcf-modal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }

  try {
    let lista = window._vcfTodosClientes || [];
    if (!lista.length) lista = await cargarDB();

    if (tipo === 'ruta') {
      const rutaId = document.getElementById('vcf-ruta-select')?.value || '';
      if (!rutaId) { toast('Seleccioná una hoja de ruta'); if(btn){btn.disabled=false;btn.textContent='📥 Generar y descargar .vcf';} return; }
      lista = lista.filter(c => {
        const r = parseRuta(c.ruta);
        if (rutaId === '__sin__') return !r.orden;
        return String(r.orden) === rutaId;
      });
    } else if (tipo === 'seleccion') {
      const sel = window._vcfSeleccionados || new Set();
      if (!sel.size) { toast('Seleccioná al menos un cliente'); if(btn){btn.disabled=false;btn.textContent='📥 Generar y descargar .vcf';} return; }
      lista = lista.filter(c => sel.has(c.num));
    }

    if (!lista.length) { toast('No hay clientes para exportar'); if(btn){btn.disabled=false;btn.textContent='📥 Generar y descargar .vcf';} return; }

    const contenido = lista.map(clienteAVCF).join('\n');
    const blob = new Blob([contenido], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = todayStr().replace(/\//g,'-');
    const rutaId = document.getElementById('vcf-ruta-select')?.value || '';
    const sufijo = tipo==='ruta' ? (rutaId==='__sin__'?'sin_ruta':'ruta'+rutaId) : tipo==='seleccion'?'seleccion':'todos';
    a.href = url;
    a.download = 'intencional_contactos_' + sufijo + '_' + fecha + '.vcf';
    a.click();
    URL.revokeObjectURL(url);
    toast('✓ ' + lista.length + ' contacto' + (lista.length!==1?'s':'') + ' exportado' + (lista.length!==1?'s':'') + ' a .vcf');
    cerrarVCFModal();
  } catch(e) {
    toast('Error al exportar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Generar y descargar .vcf'; }
  }
}



// Enganche: renderizar los pendientes cada vez que se entra al Home
(function () {
  function hook() {
    if (typeof window.showPage === 'function' && !window._tareasHooked) {
      const _orig = window.showPage;
      window.showPage = function (name, navEl) {
        _orig.apply(this, arguments);
        if (name === 'inicio') { try { renderTareas(); } catch (e) {} }
      };
      window._tareasHooked = true;
    }
    const pi = document.getElementById('page-inicio');
    if (pi && pi.classList.contains('active')) { try { renderTareas(); } catch (e) {} }
  }
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => setTimeout(hook, 400));
  } else {
    setTimeout(hook, 400);
  }
})();

/* ═══════════════════════════════════════════════════════
   PENDIENTES (to-do list) en el Home
   Tabla Supabase: tareas (id, texto, hecha, created_at)
═══════════════════════════════════════════════════════ */
async function sbTareasFetch() {
  return await sbFetch('tareas?select=*&order=hecha.asc,created_at.desc');
}
async function sbTareaInsert(texto) {
  return await sbFetch('tareas', { method: 'POST', body: JSON.stringify({ texto: texto, hecha: false }) });
}
async function sbTareaUpdate(id, hecha) {
  return await sbFetch('tareas?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ hecha: hecha }) });
}
async function sbTareaDelete(id) {
  return await sbFetch('tareas?id=eq.' + id, { method: 'DELETE' });
}

// Inserta la tarjeta de pendientes en el home (después del page-header)
function _tareasInject() {
  const page = document.getElementById('page-inicio');
  if (!page) return null;
  let card = document.getElementById('tareas-card');
  if (card) return card;
  card = document.createElement('div');
  card.id = 'tareas-card';
  card.style.cssText = 'background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-bottom:1.5rem';
  const header = page.querySelector('.page-header');
  if (header && header.nextSibling) page.insertBefore(card, header.nextSibling);
  else page.appendChild(card);
  return card;
}

function _tareaRow(t, hecha) {
  return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--border)">'
    + '<span onclick="toggleTarea(' + t.id + ',' + (!hecha) + ')" style="cursor:pointer;flex-shrink:0;color:' + (hecha ? '#059669' : 'var(--muted)') + ';-webkit-tap-highlight-color:transparent">' + (hecha ? ic('checkSquare',19) : ic('square',19)) + '</span>'
    + '<span style="flex:1;font-size:13px;line-height:1.35;color:' + (hecha ? 'var(--muted)' : 'var(--text)') + ';' + (hecha ? 'text-decoration:line-through' : '') + '">' + esc(t.texto) + '</span>'
    + '<span onclick="borrarTarea(' + t.id + ')" style="cursor:pointer;font-size:15px;color:var(--muted);flex-shrink:0;-webkit-tap-highlight-color:transparent" title="Eliminar">' + ic('trash',15) + '</span>'
    + '</div>';
}

async function renderTareas() {
  const card = _tareasInject();
  if (!card) return;
  let tareas = [];
  try {
    tareas = await sbTareasFetch();
  } catch (e) {
    card.innerHTML = '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px">' + ic('clipboard',12) + ' Pendientes</div>'
      + '<div style="font-size:13px;color:var(--muted)">No se pudieron cargar los pendientes.</div>';
    return;
  }
  const pend = tareas.filter(t => !t.hecha);
  const hechas = tareas.filter(t => t.hecha);

  let html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
    + '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)">' + ic('clipboard',12) + ' Pendientes</div>'
    + (pend.length ? '<span style="background:var(--rose-light);color:var(--rose);font-size:11px;font-weight:700;padding:2px 9px;border-radius:10px">' + pend.length + ' por hacer</span>' : '')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:6px">'
    + '<input id="tarea-input" type="text" placeholder="Agregar pendiente…" autocomplete="off" onkeydown="if(event.key===\'Enter\')agregarTarea()" '
    + 'style="flex:1;border:1.5px solid var(--border);border-radius:var(--radius);padding:10px 12px;font-size:13px;font-family:Inter,sans-serif;background:var(--surface);color:var(--text);outline:none">'
    + '<button onclick="agregarTarea()" style="background:var(--grad);color:#fff;border:none;border-radius:var(--radius);padding:0 18px;font-size:20px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent">+</button>'
    + '</div>';

  if (!pend.length && !hechas.length) {
    html += '<div style="font-size:13px;color:var(--muted);text-align:center;padding:14px 0">¡No tenés pendientes! </div>';
  }
  pend.forEach(t => { html += _tareaRow(t, false); });

  if (hechas.length) {
    html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:14px 0 2px">Hechas</div>';
    hechas.forEach(t => { html += _tareaRow(t, true); });
  }
  card.innerHTML = html;
}

async function agregarTarea() {
  const inp = document.getElementById('tarea-input');
  if (!inp) return;
  const texto = (inp.value || '').trim();
  if (!texto) return;
  inp.value = '';
  try { await sbTareaInsert(texto); await renderTareas();
        const ni = document.getElementById('tarea-input'); if (ni) ni.focus(); }
  catch (e) { toast('No se pudo agregar el pendiente'); }
}
async function toggleTarea(id, hecha) {
  try { await sbTareaUpdate(id, hecha); await renderTareas(); }
  catch (e) { toast('No se pudo actualizar'); }
}
async function borrarTarea(id) {
  try { await sbTareaDelete(id); await renderTareas(); }
  catch (e) { toast('No se pudo eliminar'); }
}

// Engancha renderTareas cada vez que se carga el home
(function () {
  if (typeof window.cargarInicio === 'function') {
    const _origCargarInicio = window.cargarInicio;
    window.cargarInicio = function () {
      const r = _origCargarInicio.apply(this, arguments);
      try { renderTareas(); } catch (e) {}
      return r;
    };
  }
  const home = document.getElementById('page-inicio');
  if (home && home.classList.contains('active')) {
    setTimeout(function () { try { renderTareas(); } catch (e) {} }, 400);
  }
})();

/* ───────────────────────────────────────────────────────
   Desactivar (ocultar) la alerta "Transferencias sin facturar"
   del inicio. La función que la genera queda intacta; para
   reactivarla en el futuro, borrá este bloque.
─────────────────────────────────────────────────────── */
(function () {
  try {
    var st = document.createElement('style');
    st.id = 'ocultar-alerta-trans';
    st.textContent = '#inicio-alerta-trans{display:none !important}';
    document.head.appendChild(st);
  } catch (e) {}
})();


/* ═══════════════════════════════════════════════════════
   CUENTA CORRIENTE POR CLIENTE
   - Tabla pagos (cobros de deuda) + remitos.saldado
   - Modal "Cobrar deuda" con comprobante adjuntable
   - Historial por cliente con "Ver remito" (imagen regenerada)
═══════════════════════════════════════════════════════ */

async function sbPagosFetch(filtro) {
  return await sbFetch('pagos?' + (filtro || 'select=*') + '&order=created_at.desc');
}
async function sbPagoInsert(p) {
  return await sbFetch('pagos', { method: 'POST', body: JSON.stringify(p) });
}
async function sbMarcarSaldado(remitoId, fecha) {
  return await sbFetch('remitos?id=eq.' + remitoId, {
    method: 'PATCH',
    body: JSON.stringify({ saldado: true, saldado_fecha: fecha })
  });
}

// Subir comprobante al bucket (Supabase Storage) — devuelve URL pública o null
async function subirComprobante(file) {
  if (!file) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = 'comp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext;
  const resp = await fetch(SB_URL + '/storage/v1/object/comprobantes/' + path, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + ((_authSession && _authSession.access_token) || SB_KEY) },
    body: file
  });
  if (!resp.ok) throw new Error('No se pudo subir el comprobante');
  return SB_URL + '/storage/v1/object/public/comprobantes/' + path;
}

function _diasEntre(fechaTxt, fechaISO) {
  // fechaTxt: DD/MM/YY del remito · fechaISO: YYYY-MM-DD del pago
  try {
    const p = fechaTxt.split('/');
    const d1 = new Date(2000 + (+p[2]), (+p[1]) - 1, +p[0]);
    const d2 = new Date(fechaISO + 'T12:00:00');
    return Math.max(0, Math.round((d2 - d1) / 86400000));
  } catch (e) { return null; }
}

// ── Ficha / historial del cliente ──────────────────────
async function abrirFichaCliente(nombre) {
  let modal = document.getElementById('ficha-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'ficha-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1150;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:18px 18px 0 0;padding:20px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<div style="font-size:16px;font-weight:700;font-family:Inter,sans-serif">' + esc(nombre) + '</div>' +
        '<div style="display:flex;align-items:center;gap:4px">' +
          '<button onclick="abrirMapaClientePorNombre(\'' + esc(nombre).replace(/'/g, "\\'") + '\')" title="Ubicación en el mapa" style="background:none;border:1px solid var(--border);border-radius:8px;padding:6px 9px;color:var(--rose);cursor:pointer;line-height:1">' + ic('pin', 16) + '</button>' +
          '<button onclick="document.getElementById(\'ficha-modal\').remove();document.body.style.overflow=\'\'" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Cuenta corriente</div>' +
      '<div id="ficha-body"><div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando...</div></div>' +
    '</div>';
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  try {
    const nombreEnc = encodeURIComponent(nombre);
    const [remitos, pagos] = await Promise.all([
      sbFetch('remitos?select=*&cliente_nombre=eq.' + nombreEnc + '&order=created_at.asc'),
      sbFetch('pagos?select=*&cliente_nombre=eq.' + nombreEnc + '&order=created_at.asc')
    ]);
    // guardar en cache global para verRemitoGuardado/compartir
    window._historialCache = window._historialCache || [];
    remitos.forEach(r => { if (!window._historialCache.find(x => x.id === r.id)) window._historialCache.push(r); });

    const fp = n => '$' + (+n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const deudaPend = sumarTipo(remitos, 'deuda');

    // Eventos del extracto: remitos + pagos intercalados por fecha de creación
    const evs = [];
    remitos.forEach(r => evs.push({ t: 'remito', ts: r.created_at, r }));
    pagos.forEach(p => evs.push({ t: 'pago', ts: p.created_at, p }));
    evs.sort((a, b) => new Date(b.ts) - new Date(a.ts)); // más nuevo arriba

    let html =
      '<div style="background:' + (deudaPend > 0 ? '#fdf6ec' : '#f0fdf4') + ';border:1px solid ' + (deudaPend > 0 ? '#f5dfb8' : '#bbf7d0') + ';border-radius:12px;padding:14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">' +
        '<div style="font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px">' + (deudaPend > 0 ? 'Debe' : 'Al día') + '</div>' +
        (deudaPend > 0 ? '<div style="font-size:1.4rem;font-weight:700;font-family:Montserrat,sans-serif;color:#b45309">' + fp(deudaPend) + '</div>' : '<div style="font-size:1.2rem">' + ic('check', 22) + '</div>') +
      '</div>';

    if (!evs.length) {
      html += '<div style="text-align:center;color:var(--muted);padding:2rem 0;font-size:13px">Sin movimientos registrados.</div>';
    }

    evs.forEach(ev => {
      if (ev.t === 'remito') {
        const r = ev.r;
        const esDeuda = r.pago === 'deuda';
        const estado = esDeuda
          ? (r.saldado
              ? '<span style="color:#15803d;font-weight:600">' + ic('check') + ' Saldada' + (r.saldado_fecha && r.fecha ? ' · ' + (_diasEntre(r.fecha, r.saldado_fecha) !== null ? _diasEntre(r.fecha, r.saldado_fecha) + ' días en deuda' : '') : '') + '</span>'
              : '<span style="color:#b45309;font-weight:600">' + ic('clock') + ' Deuda pendiente</span>')
          : '<span style="color:var(--muted)">' + (r.pago === 'efectivo' ? ic('cash') + ' Efectivo' : ic('smartphone') + ' Transferencia') + '</span>';
        html +=
          '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px;background:var(--surface)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
              '<div style="min-width:0">' +
                '<div style="font-size:13px;font-weight:600">Remito · ' + esc(r.fecha || '') + '</div>' +
                '<div style="font-size:12px;margin-top:2px">' + estado + '</div>' +
              '</div>' +
              '<div style="text-align:right;flex-shrink:0">' +
                '<div style="font-size:15px;font-weight:700;font-family:Montserrat,sans-serif;color:var(--violet)">' + fp(r.total) + '</div>' +
                '<button onclick="verRemitoGuardado(' + r.id + ')" style="margin-top:4px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:4px 10px;font-size:11px;color:var(--text2);cursor:pointer">' + ic('eye', 13) + ' Ver</button>' +
                (esDeuda && !r.saldado ? '<button onclick="abrirCobrarDeuda(' + r.id + ')" style="margin-top:4px;margin-left:4px;background:var(--grad);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer">Cobrar</button>' : '') +
              '</div>' +
            '</div>' +
          '</div>';
      } else {
        const p = ev.p;
        html +=
          '<div style="border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin-bottom:8px;background:#f0fdf4">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
              '<div>' +
                '<div style="font-size:13px;font-weight:600;color:#15803d">' + ic('check') + ' Pago recibido · ' + esc(String(p.fecha || '').split('-').reverse().join('/')) + '</div>' +
                '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + (p.medio === 'transferencia' ? ic('smartphone', 13) + ' Transferencia' : ic('cash', 13) + ' Efectivo') + (p.nota ? ' · ' + esc(p.nota) : '') + '</div>' +
              '</div>' +
              '<div style="text-align:right;flex-shrink:0">' +
                '<div style="font-size:15px;font-weight:700;font-family:Montserrat,sans-serif;color:#15803d">−' + fp(p.monto) + '</div>' +
                (p.comprobante_url ? '<a href="' + p.comprobante_url + '" target="_blank" style="display:inline-block;margin-top:4px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:4px 10px;font-size:11px;color:var(--text2);text-decoration:none">' + ic('file', 13) + ' Comprobante</a>' : '') +
              '</div>' +
            '</div>' +
          '</div>';
      }
    });

    const body = document.getElementById('ficha-body');
    if (body) body.innerHTML = html;
  } catch (e) {
    const body = document.getElementById('ficha-body');
    if (body) body.innerHTML = '<div style="color:var(--muted);font-size:13px">No se pudo cargar el historial.</div>';
  }
}
window.abrirFichaCliente = abrirFichaCliente;
window.abrirCobrarDeuda = abrirCobrarDeuda;
window.guardarCobroDeuda = guardarCobroDeuda;


/* ═══════════════════════════════════════════════════════════════
   MÓDULO COMPRAS — Pedidos a Intencional + stock inicial (jul 2026)
   ═══════════════════════════════════════════════════════════════
   Tabla Supabase: compras
   { id, fecha (DD/MM/YY), tipo ('pedido'|'inicial'), notas,
     items jsonb [{cat, prod, color, cant, costo}],
     total_unidades, total_costo, created_at }
   Cada ítem puede llevar detalle por producto y color (opcional):
   por ahora se carga solo cantidad por categoría. */

const _COMPRAS_SQL = `create table if not exists compras (
  id bigint generated by default as identity primary key,
  fecha text not null,
  tipo text not null default 'pedido',
  notas text,
  items jsonb not null default '[]',
  total_unidades integer default 0,
  total_costo numeric default 0,
  created_at timestamptz default now()
);
alter table compras enable row level security;
create policy "compras_all" on compras for all using (true) with check (true);`;

let _comprasCache = null;
let _compraRows = [];
let _vendidoPorCat = null; // {catId: unidades}

/* ── Capa Supabase ── */
async function sbComprasFetch()        { return sbFetch('compras?select=*&order=created_at.desc'); }
async function sbComprasInsert(data)   { return sbFetch('compras', { method:'POST', body:JSON.stringify(data) }); }
async function sbComprasUpdate(id,data){ return sbFetch('compras?id=eq.'+id, { method:'PATCH', body:JSON.stringify(data) }); }
async function sbComprasDelete(id)     { return sbFetch('compras?id=eq.'+id, { method:'DELETE', headers:{'Prefer':''} }); }

const _fpC = n => '$' + (+n||0).toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0});
const _fuC = n => (+n||0).toLocaleString('es-AR');

function _compraItems(c) {
  let it = c.items;
  if (typeof it === 'string') { try { it = JSON.parse(it); } catch(e) { it = []; } }
  return Array.isArray(it) ? it : [];
}

/* Mapea un nombre de producto de remito a una categoría de stock */
function _catDeProducto(nombre) {
  const n = (nombre||'').toLowerCase().trim();
  if (!n || n === 'sin venta') return null;
  const s = (_stockCache||[]).find(x => (x.nombre||'').toLowerCase().trim() === n);
  if (s && s.categoria) return s.categoria;
  if (n.includes('esmalte')) return 'esmalte';
  if (n.includes('crema'))   return 'crema';
  return 'otro';
}

/* Suma unidades vendidas por categoría leyendo los productos de todos los remitos */
async function _calcularVendidoPorCat() {
  try {
    const rems = await sbFetch('remitos?select=productos');
    const acc = {};
    (rems||[]).forEach(r => {
      let prods = r.productos;
      if (typeof prods === 'string') { try { prods = JSON.parse(prods); } catch(e) { prods = []; } }
      (prods||[]).forEach(p => {
        const cat = _catDeProducto(p.prod);
        if (!cat) return;
        acc[cat] = (acc[cat]||0) + (+p.cant||0);
      });
    });
    return acc;
  } catch(e) { console.warn('vendidoPorCat:', e.message); return null; }
}

/* ── Carga y render ── */
async function cargarCompras() {
  const lista   = g('compras-lista');
  const resumen = g('compras-resumen');
  if (lista) lista.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0">Cargando compras...</div>';
  if (resumen) resumen.innerHTML = '';
  // El balance necesita el stock para mapear productos → categorías
  if (!_stockCache) { try { _stockCache = await sbStockFetch(); } catch(e) {} }
  try {
    _comprasCache = await sbComprasFetch();
  } catch(e) {
    _comprasCache = null;
    if (lista) lista.innerHTML =
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem;text-align:center">' +
        '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">' + ic('alert') + ' Falta crear la tabla en Supabase</div>' +
        '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">Copiá el SQL, pegalo en Supabase → SQL Editor → Run, y volvé a intentar.</div>' +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn-secondary" onclick="copiarSQLCompras()" style="font-size:12px;padding:8px 14px">' + ic('clipboard') + ' Copiar SQL</button>' +
          '<button class="btn-primary" onclick="cargarCompras()" style="font-size:12px;padding:8px 14px">' + ic('refresh') + ' Reintentar</button>' +
        '</div>' +
      '</div>';
    return;
  }
  _vendidoPorCat = await _calcularVendidoPorCat();
  renderCompras();
}

function copiarSQLCompras() {
  const done = () => toast('✓ SQL copiado — pegalo en Supabase → SQL Editor');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(_COMPRAS_SQL).then(done).catch(() => prompt('Copiá el SQL:', _COMPRAS_SQL));
  } else { prompt('Copiá el SQL:', _COMPRAS_SQL); }
}

function renderCompras() {
  const resumen = g('compras-resumen');
  const balance = g('compras-balance');
  const lista   = g('compras-lista');
  const compras = _comprasCache || [];

  /* Totales generales */
  let totUnid = 0, totCosto = 0;
  const compradoPorCat = {};
  compras.forEach(c => {
    totUnid  += +c.total_unidades||0;
    totCosto += +c.total_costo||0;
    _compraItems(c).forEach(it => {
      const cat = it.cat || 'otro';
      compradoPorCat[cat] = (compradoPorCat[cat]||0) + (+it.cant||0);
    });
  });
  const totVendido = _vendidoPorCat ? Object.values(_vendidoPorCat).reduce((s,v)=>s+v,0) : null;

  if (resumen) resumen.innerHTML =
    '<div class="stat-card"><div class="stat-label">' + ic('cart') + ' Unidades compradas</div><div class="stat-value" style="font-size:1.4rem">' + _fuC(totUnid) + '</div><div class="stat-sub">' + compras.length + ' compra' + (compras.length!==1?'s':'') + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">' + ic('coins') + ' Costo total</div><div class="stat-value" style="font-size:1.4rem;color:var(--rose)">' + _fpC(totCosto) + '</div><div class="stat-sub">acumulado</div></div>' +
    (totVendido !== null
      ? '<div class="stat-card"><div class="stat-label">' + ic('bag') + ' Unidades vendidas</div><div class="stat-value" style="font-size:1.4rem">' + _fuC(totVendido) + '</div><div class="stat-sub">según remitos</div></div>' +
        '<div class="stat-card"><div class="stat-label">' + ic('box') + ' Stock teórico</div><div class="stat-value" style="font-size:1.4rem;color:' + (totUnid-totVendido<0?'#dc2626':'var(--violet)') + '">' + _fuC(totUnid-totVendido) + '</div><div class="stat-sub">comprado − vendido</div></div>'
      : '');

  /* Balance por categoría */
  if (balance) {
    const catIds = [...new Set([...Object.keys(compradoPorCat), ...Object.keys(_vendidoPorCat||{})])];
    if (!catIds.length) { balance.innerHTML = ''; }
    else {
      const filas = catIds.map(id => {
        const cat = STOCK_CATS.find(c => c.id === id) || { id, label: id, icon: 'box' };
        const comprado = compradoPorCat[id]||0;
        const vendido  = (_vendidoPorCat||{})[id]||0;
        const teorico  = comprado - vendido;
        const cargado  = (_stockCache||[]).filter(s => s.categoria === id).reduce((s,x)=>s+(+x.cantidad||0),0);
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-top:1px solid var(--border)">' +
          '<div style="width:26px;text-align:center">' + catIcon(cat, 16) + '</div>' +
          '<div style="flex:1;font-size:13px;font-weight:600;color:var(--text)">' + esc(cat.label) + '</div>' +
          '<div style="font-size:12px;color:var(--muted);text-align:right;min-width:70px">' + _fuC(comprado) + ' <span style="font-size:10px">comp.</span></div>' +
          '<div style="font-size:12px;color:var(--muted);text-align:right;min-width:70px">' + _fuC(vendido) + ' <span style="font-size:10px">vend.</span></div>' +
          '<div style="font-size:13px;font-weight:700;text-align:right;min-width:70px;color:' + (teorico<0?'#dc2626':'var(--violet)') + '">' + _fuC(teorico) + ' <span style="font-size:10px;font-weight:500">teór.</span></div>' +
          '<div style="font-size:12px;text-align:right;min-width:70px;color:' + (Math.abs(cargado-teorico)>0?'#d97706':'#059669') + '">' + _fuC(cargado) + ' <span style="font-size:10px">en stock</span></div>' +
        '</div>';
      }).join('');
      balance.innerHTML =
        '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">' +
          '<div style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)">Balance por categoría — comprado · vendido · teórico · cargado en stock</div>' +
          filas +
        '</div>';
    }
  }

  /* Lista de compras */
  if (!lista) return;
  if (!compras.length) {
    lista.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:1rem 0;text-align:center">Todavía no hay compras cargadas. Arrancá con el stock inicial de la deuda y después cargá cada pedido a Intencional.</div>';
    return;
  }
  lista.innerHTML = compras.map(c => {
    const items = _compraItems(c);
    const esInicial = c.tipo === 'inicial';
    const detalle = items.map(it => {
      const cat = STOCK_CATS.find(x => x.id === it.cat) || { label: it.cat||'—', icon:'box' };
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px dashed var(--border);font-size:12px">' +
        '<span style="width:22px;text-align:center">' + catIcon(cat, 14) + '</span>' +
        '<span style="flex:1;color:var(--text)">' + esc(cat.label) +
          (it.prod ? ' · ' + esc(it.prod) : '') +
          (it.color ? ' <span style="color:var(--muted)">(' + esc(it.color) + ')</span>' : '') +
        '</span>' +
        '<span style="color:var(--muted)">' + _fuC(it.cant) + ' u</span>' +
        (+it.costo>0 ? '<span style="color:var(--muted);min-width:80px;text-align:right">' + _fpC(it.costo) + ' c/u</span>' : '') +
      '</div>';
    }).join('');
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;padding:12px 14px">' +
      '<div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="const d=this.parentElement.querySelector(\'.compra-det\');d.style.display=d.style.display===\'none\'?\'block\':\'none\'">' +
        '<div style="width:30px;text-align:center">' + ic(esInicial ? 'box' : 'cart', 18) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:700;color:var(--text)">' +
            (esInicial ? 'Stock inicial (deuda)' : 'Pedido a Intencional') +
            '<span style="font-weight:500;color:var(--muted)"> · ' + esc(c.fecha||'') + '</span>' +
          '</div>' +
          (c.notas ? '<div style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.notas) + '</div>' : '') +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:14px;font-weight:700;color:var(--text)">' + _fuC(c.total_unidades) + ' u</div>' +
          (+c.total_costo>0 ? '<div style="font-size:12px;color:var(--rose);font-weight:600">' + _fpC(c.total_costo) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="compra-det" style="display:none;margin-top:8px">' +
        detalle +
        '<div style="display:flex;gap:8px;margin-top:10px">' +
          '<button class="btn-secondary" style="font-size:11px;padding:6px 12px" onclick="abrirModalCompra(' + c.id + ')">' + ic('edit') + ' Editar</button>' +
          '<button style="background:none;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;font-family:Inter,sans-serif;font-weight:600" onclick="eliminarCompra(' + c.id + ')">' + ic('trash') + ' Eliminar</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── Modal nueva/editar compra ── */
function abrirModalCompra(id) {
  const item = id ? (_comprasCache||[]).find(c => c.id === id) : null;
  _compraRows = item ? _compraItems(item).map(it => ({...it})) : [{ cat:'esmalte', prod:'', color:'', cant:'', costo:'' }];
  let modal = g('compra-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compra-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1100;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
    modal.addEventListener('click', e => { if (e.target === modal) cerrarModalCompra(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom)">' +
      '<div style="padding:1rem 1.2rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2">' +
        '<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:700;color:var(--text)">' + (item ? 'Editar compra' : 'Nueva compra') + '</div>' +
        '<button onclick="cerrarModalCompra()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="padding:1rem 1.2rem;display:flex;flex-direction:column;gap:14px">' +
        '<input type="hidden" id="cm-id" value="' + (item ? item.id : '') + '"/>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div><div class="field-label">Fecha</div><input class="field-input" id="cm-fecha" value="' + esc(item ? (item.fecha||'') : todayStr()) + '" placeholder="DD/MM/AA"/></div>' +
          '<div><div class="field-label">Tipo</div>' +
            '<select class="field-input" id="cm-tipo" style="cursor:pointer">' +
              '<option value="pedido"'  + (!item || item.tipo!=='inicial' ? ' selected' : '') + '>Pedido a Intencional</option>' +
              '<option value="inicial"' + (item && item.tipo==='inicial'  ? ' selected' : '') + '>Stock inicial (deuda)</option>' +
            '</select></div>' +
        '</div>' +
        '<div><div class="field-label">Notas (opcional)</div><input class="field-input" id="cm-notas" value="' + esc(item ? (item.notas||'') : '') + '" placeholder="Ej: pedido con 30% de devolución"/></div>' +
        '<div>' +
          '<div class="field-label" style="margin-bottom:6px">Detalle</div>' +
          '<div id="cm-items"></div>' +
          '<button onclick="agregarLineaCompra()" class="btn-secondary" style="width:100%;font-size:12px;padding:8px;margin-top:6px;justify-content:center">' + ic('plus') + ' Agregar línea</button>' +
        '</div>' +
        (!item ?
          '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);cursor:pointer">' +
            '<input type="checkbox" id="cm-sumar-stock" style="width:16px;height:16px;accent-color:var(--rose)"/>' +
            'Sumar estas unidades al stock del depósito (solo líneas con producto elegido). Para cargas históricas dejalo desmarcado.' +
          '</label>' : '') +
        '<div id="cm-total" style="text-align:right;font-size:13px;color:var(--muted)"></div>' +
        '<button class="btn-primary" style="width:100%;padding:13px" onclick="guardarCompra()">' + (item ? 'Guardar cambios' : 'Guardar compra') + '</button>' +
        (item ? '' : '') +
      '</div>' +
    '</div>';
  renderLineasCompra();
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModalCompra() {
  const m = g('compra-modal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

function renderLineasCompra() {
  const cont = g('cm-items');
  if (!cont) return;
  cont.innerHTML = _compraRows.map((r, i) => {
    const prodsCat = (_stockCache||[]).filter(s => s.categoria === r.cat);
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px">' +
        '<select class="field-input" style="font-size:12px;padding:7px;cursor:pointer" onchange="_compraRows[' + i + '].cat=this.value;_compraRows[' + i + '].prod=\'\';renderLineasCompra()">' +
          STOCK_CATS.map(c => '<option value="' + c.id + '"' + (r.cat===c.id?' selected':'') + '>' + esc(c.label) + '</option>').join('') +
        '</select>' +
        '<select class="field-input" style="font-size:12px;padding:7px;cursor:pointer" onchange="_compraRows[' + i + '].prod=this.value">' +
          '<option value="">— producto (opcional) —</option>' +
          prodsCat.map(p => {
            const nom = p.nombre + (p.variante ? ' — ' + p.variante : '');
            return '<option value="' + esc(p.nombre) + '"' + (r.prod===p.nombre?' selected':'') + '>' + esc(nom) + '</option>';
          }).join('') +
        '</select>' +
        '<button onclick="_compraRows.splice(' + i + ',1);renderLineasCompra()" style="background:none;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:0 10px;cursor:pointer">' + ic('x', 14) + '</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
        '<div><div class="field-label" style="font-size:9px">Color / detalle</div><input class="field-input" style="font-size:12px;padding:7px" value="' + esc(r.color||'') + '" placeholder="opcional" onchange="_compraRows[' + i + '].color=this.value.trim()"/></div>' +
        '<div><div class="field-label" style="font-size:9px">Cantidad</div><input class="field-input" type="number" min="0" inputmode="numeric" style="font-size:12px;padding:7px" value="' + (r.cant||'') + '" placeholder="0" onchange="_compraRows[' + i + '].cant=+this.value||0;actualizarTotalCompra()" oninput="_compraRows[' + i + '].cant=+this.value||0;actualizarTotalCompra()"/></div>' +
        '<div><div class="field-label" style="font-size:9px">Costo unit. $</div><input class="field-input" type="number" min="0" inputmode="decimal" style="font-size:12px;padding:7px" value="' + (r.costo||'') + '" placeholder="0" onchange="_compraRows[' + i + '].costo=+this.value||0;actualizarTotalCompra()" oninput="_compraRows[' + i + '].costo=+this.value||0;actualizarTotalCompra()"/></div>' +
      '</div>' +
    '</div>';
  }).join('');
  actualizarTotalCompra();
}

function agregarLineaCompra() {
  const ult = _compraRows[_compraRows.length-1];
  _compraRows.push({ cat: ult ? ult.cat : 'esmalte', prod:'', color:'', cant:'', costo: ult ? ult.costo : '' });
  renderLineasCompra();
}

function actualizarTotalCompra() {
  const el = g('cm-total');
  if (!el) return;
  const unid  = _compraRows.reduce((s,r)=>s+(+r.cant||0),0);
  const costo = _compraRows.reduce((s,r)=>s+(+r.cant||0)*(+r.costo||0),0);
  el.innerHTML = 'Total: <b style="color:var(--text)">' + _fuC(unid) + ' unidades</b>' + (costo>0 ? ' · <b style="color:var(--rose)">' + _fpC(costo) + '</b>' : '');
}

async function guardarCompra() {
  const id    = g('cm-id')?.value;
  const fecha = (g('cm-fecha')?.value||'').trim() || todayStr();
  const tipo  = g('cm-tipo')?.value || 'pedido';
  const notas = (g('cm-notas')?.value||'').trim();
  const items = _compraRows
    .map(r => ({ cat: r.cat||'otro', prod: r.prod||'', color: r.color||'', cant: +r.cant||0, costo: +r.costo||0 }))
    .filter(r => r.cant > 0);
  if (!items.length) { toast('Cargá al menos una línea con cantidad'); return; }
  const total_unidades = items.reduce((s,r)=>s+r.cant,0);
  const total_costo    = items.reduce((s,r)=>s+r.cant*r.costo,0);
  const datos = { fecha, tipo, notas, items, total_unidades, total_costo };
  const sumarStock = !id && g('cm-sumar-stock')?.checked;
  try {
    if (id) await sbComprasUpdate(parseInt(id), datos);
    else    await sbComprasInsert(datos);
  } catch(e) { toast('Error guardando: ' + e.message); return; }

  /* Sumar al stock (solo al crear, solo líneas con producto elegido) */
  if (sumarStock) {
    let sumadas = 0, sinProd = 0;
    for (const it of items) {
      if (!it.prod) { sinProd++; continue; }
      const s = (_stockCache||[]).find(x => x.nombre === it.prod && x.categoria === it.cat);
      if (!s) { sinProd++; continue; }
      try {
        const nueva = (+s.cantidad||0) + it.cant;
        await sbStockUpdate(s.id, { cantidad: nueva });
        s.cantidad = nueva;
        sumadas += it.cant;
      } catch(e) { console.warn('stock+:', e.message); }
    }
    if (sumadas) toast('✓ ' + _fuC(sumadas) + ' unidades sumadas al stock' + (sinProd ? ' (' + sinProd + ' línea/s sin producto, no sumadas)' : ''));
    else if (sinProd) toast('Ninguna línea tenía producto elegido: no se sumó stock');
  }

  cerrarModalCompra();
  toast(id ? '✓ Compra actualizada' : '✓ Compra guardada');
  await cargarCompras();
}

async function eliminarCompra(id) {
  if (!confirm('¿Eliminar esta compra? No modifica el stock cargado.')) return;
  try { await sbComprasDelete(id); } catch(e) { toast('Error: ' + e.message); return; }
  toast('Compra eliminada');
  await cargarCompras();
}


/* ═══════════════════════════════════════════════════════════════
   GEOLOCALIZACIÓN DE CLIENTES (jul 2026)
   ═══════════════════════════════════════════════════════════════
   Columnas en tabla clientes: lat, lng (double), geo_manual (bool).
   - Geocodificación automática masiva con Nominatim (OpenStreetMap),
     1 consulta/seg, solo clientes sin coordenadas.
   - Corrección manual: mapa Leaflet con pin arrastrable en la ficha.
     Al guardar a mano se marca geo_manual=true y la geocodificación
     automática NUNCA pisa esos puntos. */

const _GEO_SQL = `alter table clientes
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists geo_manual boolean default false;`;

const _GEO_CENTRO_GBA = [-34.52, -58.70]; // centro aproximado zona norte GBA

/* ── Carga dinámica de Leaflet (solo cuando se abre un mapa) ── */
let _leafletCargando = null;
function cargarLeaflet() {
  if (window.L) return Promise.resolve();
  if (_leafletCargando) return _leafletCargando;
  _leafletCargando = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = () => resolve();
    js.onerror = () => { _leafletCargando = null; reject(new Error('No se pudo cargar el mapa')); };
    document.head.appendChild(js);
  });
  return _leafletCargando;
}

/* ── Geocodificación con Nominatim ── */
async function geocodificarDireccion(dir, loc) {
  const q = [dir, loc, 'Buenos Aires', 'Argentina'].filter(Boolean).join(', ');
  if (!q.trim()) return null;
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=' + encodeURIComponent(q));
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length) return { lat: +data[0].lat, lng: +data[0].lon };
  } catch (e) { console.warn('geocode:', e.message); }
  return null;
}

/* ── Mapa con pin arrastrable para un cliente ── */
let _mapaClienteActual = null;

async function abrirMapaClientePorNombre(nombre) {
  if (!_cache) { try { _cache = await sbFetch('clientes?select=*'); } catch (e) { toast('Error cargando clientes'); return; } }
  const c = (_cache || []).find(x => (x.local || '') === nombre);
  if (!c) { toast('No encontré el cliente'); return; }
  abrirMapaCliente(c.num);
}

async function abrirMapaCliente(num) {
  if (!navigator.onLine) { toast('Necesitás internet para ver el mapa'); return; }
  if (!_cache) { try { _cache = await sbFetch('clientes?select=*'); } catch (e) { toast('Error cargando clientes'); return; } }
  const c = (_cache || []).find(x => x.num === num);
  if (!c) { toast('No encontré el cliente'); return; }

  let modal = g('mapa-cliente-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'mapa-cliente-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(30,26,26,.55);z-index:1250;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)';
  modal.addEventListener('click', e => { if (e.target === modal) cerrarMapaCliente(); });
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:16px;width:94%;max-width:560px;overflow:hidden;display:flex;flex-direction:column;max-height:92vh">' +
      '<div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px">' +
        '<div style="min-width:0">' +
          '<div style="font-size:14px;font-weight:700;color:var(--text);font-family:Inter,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + ic('pin') + ' ' + esc(c.local || '') + '</div>' +
          '<div style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc([c.dir, c.loc].filter(Boolean).join(', ')) + '</div>' +
        '</div>' +
        '<button onclick="cerrarMapaCliente()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1;flex-shrink:0">×</button>' +
      '</div>' +
      '<div id="mapa-cliente-canvas" style="height:52vh;min-height:280px;background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px">Cargando mapa...</div>' +
      '<div style="padding:10px 16px;display:flex;flex-direction:column;gap:8px">' +
        '<div id="mapa-cliente-estado" style="font-size:11px;color:var(--muted)">' +
          (c.lat ? (c.geo_manual ? '' + ic('check') + ' Ubicación corregida a mano' : 'Ubicación automática — arrastrá el pin al local exacto') : 'Sin ubicación — buscando aproximación...') +
        '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn-primary" style="flex:1;padding:11px;font-size:12px" onclick="guardarUbicacionCliente(' + c.num + ')">' + ic('save') + ' Guardar ubicación</button>' +
          '<a id="mapa-cliente-navegar" target="_blank" rel="noopener" class="btn-secondary" style="padding:11px 14px;font-size:12px;text-decoration:none">' + ic('map') + ' Cómo llegar</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  /* posición inicial: coordenadas guardadas > geocodificación > centro GBA */
  let pos = (c.lat && c.lng) ? [c.lat, c.lng] : null;
  let zoom = pos ? 17 : 11;
  if (!pos) {
    const geo = await geocodificarDireccion(c.dir, c.loc);
    if (geo) { pos = [geo.lat, geo.lng]; zoom = 16; }
    else pos = _GEO_CENTRO_GBA;
    const est = g('mapa-cliente-estado');
    if (est) est.innerHTML = geo
      ? 'Aproximación automática — arrastrá el pin al local exacto y guardá'
      : '' + ic('alert') + ' No pude aproximar la dirección — ubicá el pin a mano y guardá';
  }

  try { await cargarLeaflet(); } catch (e) { const cv = g('mapa-cliente-canvas'); if (cv) cv.textContent = 'No se pudo cargar el mapa. Probá de nuevo.'; return; }
  const canvas = g('mapa-cliente-canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  const map = L.map(canvas).setView(pos, zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  const marker = L.marker(pos, { draggable: true }).addTo(map);
  map.on('click', e => marker.setLatLng(e.latlng));
  _mapaClienteActual = { map, marker, num: c.num };
  actualizarLinkNavegar(c, pos);
  marker.on('move', () => { const p = marker.getLatLng(); actualizarLinkNavegar(c, [p.lat, p.lng]); });
  setTimeout(() => map.invalidateSize(), 150);
}

function actualizarLinkNavegar(c, pos) {
  const a = g('mapa-cliente-navegar');
  if (!a) return;
  a.href = pos
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + pos[0].toFixed(6) + ',' + pos[1].toFixed(6)
    : 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent([c.dir, c.loc].filter(Boolean).join(', '));
}

function cerrarMapaCliente() {
  const m = g('mapa-cliente-modal');
  if (_mapaClienteActual && _mapaClienteActual.map) { try { _mapaClienteActual.map.remove(); } catch (e) {} }
  _mapaClienteActual = null;
  if (m) m.remove();
  /* si la ficha sigue abierta abajo, no restaurar el scroll del body */
  if (!g('ficha-modal')) document.body.style.overflow = '';
}

async function guardarUbicacionCliente(num) {
  if (!_mapaClienteActual || _mapaClienteActual.num !== num) return;
  const p = _mapaClienteActual.marker.getLatLng();
  try {
    await sbUpdate(num, { lat: p.lat, lng: p.lng, geo_manual: true });
    const c = (_cache || []).find(x => x.num === num);
    if (c) { c.lat = p.lat; c.lng = p.lng; c.geo_manual = true; }
    toast('✓ Ubicación guardada');
    cerrarMapaCliente();
  } catch (e) {
    if ((e.message || '').includes('lat') || (e.message || '').includes('column')) {
      toast('Faltan las columnas lat/lng en Supabase — avisale a Franco');
    } else toast('Error guardando: ' + e.message);
  }
}

/* ── Geocodificación masiva (Configuraciones) ── */
let _geoBatchCorriendo = false;

function copiarSQLGeo() {
  const done = () => toast('✓ SQL copiado — pegalo en Supabase → SQL Editor');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(_GEO_SQL).then(done).catch(() => prompt('Copiá el SQL:', _GEO_SQL));
  } else { prompt('Copiá el SQL:', _GEO_SQL); }
}

async function geolocalizarClientesPendientes() {
  const estado = g('geo-batch-estado');
  const btn = g('geo-batch-btn');
  if (_geoBatchCorriendo) { _geoBatchCorriendo = false; if (btn) btn.innerHTML = ic('map') + ' Geolocalizar clientes'; return; }
  if (!navigator.onLine) { toast('Necesitás internet para geolocalizar'); return; }

  try { _cache = await sbFetch('clientes?select=*'); }
  catch (e) { toast('Error cargando clientes: ' + e.message); return; }

  const pendientes = (_cache || []).filter(c => (!c.lat || !c.lng) && ((c.dir || '').trim() || (c.loc || '').trim()));
  if (!pendientes.length) {
    if (estado) estado.innerHTML = '' + ic('check') + ' Todos los clientes con dirección ya tienen coordenadas.';
    return;
  }

  _geoBatchCorriendo = true;
  if (btn) btn.innerHTML = ic('ban') + ' Detener';
  let ok = 0, fallo = 0, procesados = 0;
  const total = pendientes.length;

  for (const c of pendientes) {
    if (!_geoBatchCorriendo) break;
    procesados++;
    if (estado) estado.innerHTML = 'Procesando ' + procesados + ' de ' + total + '... <b>' + esc(c.local || '') + '</b><br>Encontrados: ' + ok + ' · Sin resultado: ' + fallo + '<div style="font-size:10px;color:var(--muted)">Podés dejar esta pantalla abierta y seguir en otra pestaña. Aprox. ' + Math.ceil((total - procesados) * 1.2 / 60) + ' min restantes.</div>';
    const geo = await geocodificarDireccion(c.dir, c.loc);
    if (geo) {
      try {
        await sbUpdate(c.num, { lat: geo.lat, lng: geo.lng, geo_manual: false });
        c.lat = geo.lat; c.lng = geo.lng; c.geo_manual = false;
        ok++;
      } catch (e) {
        _geoBatchCorriendo = false;
        if (estado) estado.innerHTML = '' + ic('alert') + ' Error guardando: ' + esc(e.message) + '.<br>Si faltan las columnas, copiá el SQL y corrélo en Supabase.';
        if (btn) btn.innerHTML = ic('map') + ' Geolocalizar clientes';
        return;
      }
    } else fallo++;
    /* Nominatim: máx 1 consulta por segundo */
    await new Promise(r => setTimeout(r, 1200));
  }

  const detenido = !_geoBatchCorriendo && procesados < total;
  _geoBatchCorriendo = false;
  if (btn) btn.innerHTML = ic('map') + ' Geolocalizar clientes';
  if (estado) estado.innerHTML =
    (detenido ? '' + ic('ban') + ' Detenido. ' : '' + ic('check') + ' Terminado. ') +
    'Encontrados: <b>' + ok + '</b> · Sin resultado: <b>' + fallo + '</b> de ' + procesados + ' procesados.' +
    (fallo ? '<br><span style="font-size:10px">Los que quedaron sin resultado se corrigen a mano desde la ficha del cliente (botón de ubicación).</span>' : '');
}

/* ═══════════════════════════════════════════════════════════════
   PAGOS DIVIDIDOS (varios medios por remito) + BALANCE DE ALIAS
   ───────────────────────────────────────────────────────────────
   Modelo nuevo: remitos.pagos_detalle (jsonb)
     [{ tipo, monto, alias, era_deuda, saldado_fecha }]
   Un remito puede tener 1..n partes. Al cobrar una deuda, esa
   parte cambia de tipo (deuda → efectivo/transferencia), queda
   marcada con era_deuda:true y guarda saldado_fecha.

   Remitos viejos (sin pagos_detalle) se derivan al vuelo de
   pago/total/alias/pago2_*, así todo el historial sigue andando
   sin migración de datos.
═══════════════════════════════════════════════════════════════ */

const LBL_PAGO   = { efectivo:'Efectivo', transferencia:'Transferencia', deuda:'Deuda pendiente', sin_definir:'Sin definir' };
const LBL_PAGO_C = { efectivo:'Efectivo', transferencia:'Transferencia', deuda:'Deuda', sin_definir:'Sin definir' };
const COLOR_PAGO = { efectivo:'#059669', transferencia:'#2563eb', deuda:'#d97706', sin_definir:'#9c8b88' };
const ICON_PAGO  = { efectivo:'cash', transferencia:'smartphone', deuda:'clock' };

function _fpp(n) { return '$' + (+n || 0).toLocaleString('es-AR', { minimumFractionDigits:0, maximumFractionDigits:0 }); }

/* ── Devuelve SIEMPRE un array de partes normalizado ── */
function partesPago(r) {
  if (!r) return [];
  // Modelo nuevo
  if (r.pagos_detalle) {
    try {
      const arr = typeof r.pagos_detalle === 'string' ? JSON.parse(r.pagos_detalle) : r.pagos_detalle;
      if (Array.isArray(arr) && arr.length) {
        return arr.map(p => ({
          tipo: p.tipo || 'sin_definir',
          monto: +p.monto || 0,
          alias: p.alias || null,
          era_deuda: !!p.era_deuda,
          saldado_fecha: p.saldado_fecha || null,
          legacySaldado: false
        }));
      }
    } catch (e) { /* cae al modelo viejo */ }
  }
  // Modelo viejo
  const total = +r.total || 0;
  const m2 = +r.pago2_monto || 0;
  const partes = [];
  if (r.pago2_tipo && m2 > 0 && m2 < total) {
    partes.push({ tipo: r.pago || 'sin_definir', monto: total - m2, alias: r.alias || null,
                  era_deuda:false, saldado_fecha: r.saldado_fecha || null, legacySaldado: !!r.saldado });
    partes.push({ tipo: r.pago2_tipo, monto: m2, alias: r.pago2_alias || null,
                  era_deuda:false, saldado_fecha:null, legacySaldado:false });
  } else {
    partes.push({ tipo: r.pago || 'sin_definir', monto: total, alias: r.alias || null,
                  era_deuda:false, saldado_fecha: r.saldado_fecha || null, legacySaldado: !!r.saldado });
  }
  return partes;
}

/* ── Monto de un remito que corresponde a un tipo de pago ──
   Es la base de TODAS las métricas: un mismo remito puede sumar
   a efectivo y a deuda al mismo tiempo. */
function montoPorTipo(r, tipo) {
  return partesPago(r).reduce((s, p) => {
    if (p.tipo !== tipo) return s;
    // Deuda vieja ya saldada: no se cuenta como pendiente (igual que antes)
    if (tipo === 'deuda' && p.legacySaldado) return s;
    return s + (+p.monto || 0);
  }, 0);
}

function deudaPendienteRemito(r) { return montoPorTipo(r, 'deuda'); }
function tieneDeudaPendiente(r)  { return deudaPendienteRemito(r) > 0; }
function esPagoMixto(r)          { return partesPago(r).filter(p => p.monto > 0).length > 1; }

/* Suma de un tipo sobre una lista de remitos */
function sumarTipo(lista, tipo) {
  return (lista || []).reduce((s, r) => s + montoPorTipo(r, tipo), 0);
}

/* ── Etiqueta corta para listados ── */
function badgePagoHTML(r) {
  const partes = partesPago(r).filter(p => p.monto > 0);
  if (!partes.length) return '<span style="color:#9c8b88">—</span>';
  if (partes.length === 1) {
    const p = partes[0];
    if (p.tipo === 'deuda' && p.legacySaldado) {
      return '<span style="color:#15803d">' + ic('check') + ' Deuda saldada</span>';
    }
    if (p.tipo === 'deuda') return '<span style="color:#b45309">' + ic('clock') + ' Deuda</span>';
    if (p.era_deuda) {
      return '<span style="color:#15803d">' + ic('check') + ' Deuda cobrada en ' + esc(LBL_PAGO_C[p.tipo] || p.tipo).toLowerCase() + '</span>';
    }
    return '<span style="color:' + (COLOR_PAGO[p.tipo] || '#9c8b88') + '">' + esc(LBL_PAGO_C[p.tipo] || p.tipo) + '</span>';
  }
  // Mixto: mostrar cada parte
  return partes.map(p =>
    '<span style="color:' + (COLOR_PAGO[p.tipo] || '#9c8b88') + ';font-weight:600">' +
      esc(LBL_PAGO_C[p.tipo] || p.tipo) + ' ' + _fpp(p.monto) +
      (p.era_deuda ? ' ' + ic('check') : '') +
    '</span>'
  ).join('<span style="color:#d8c4d0"> + </span>');
}

/* ── Desglose visual (el que sale en la imagen del remito) ── */
function desglosePagoHTML(partes) {
  const vis = (partes || []).filter(p => p.monto > 0);
  if (vis.length < 2) return '';
  const filas = vis.map(p =>
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-family:DM Sans,sans-serif">' +
      '<span style="font-size:13px;color:' + (COLOR_PAGO[p.tipo] || '#6b5560') + ';font-weight:600">' +
        (ICON_PAGO[p.tipo] ? ic(ICON_PAGO[p.tipo], 13) + ' ' : '') + esc(LBL_PAGO[p.tipo] || p.tipo) +
        (p.alias ? ' <span style="font-weight:400;color:#b099a8;font-size:11px">(' + esc(p.alias) + ')</span>' : '') +
      '</span>' +
      '<span style="font-size:14px;font-weight:700;color:#1a0a12">' + _fpp(p.monto) + '</span>' +
    '</div>'
  ).join('');
  return '<div style="border:1.5px solid #ead8e4;border-radius:10px;padding:8px 12px;background:#fffafd">' +
    '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#b099a8;margin-bottom:2px">Forma de pago</div>' +
    filas +
  '</div>';
}

/* ── Partes que se están cargando en el remito abierto ── */
function partesDelFormulario() {
  const total = (typeof rows !== 'undefined' ? rows : []).reduce((s, r) => s + (r.cant * (+r.precio || 0)), 0);
  let pago = 'sin_definir';
  document.querySelectorAll('.pago-btn').forEach(b => {
    if (b.classList.contains('active-efectivo'))      pago = 'efectivo';
    if (b.classList.contains('active-transferencia')) pago = 'transferencia';
    if (b.classList.contains('active-deuda'))         pago = 'deuda';
  });
  const aliasVal = (typeof aliasActivo !== 'undefined' && aliasActivo === 1)
    ? (document.getElementById('alias1-val')?.value || '').trim()
    : (typeof aliasActivo !== 'undefined' && aliasActivo === 2)
      ? (document.getElementById('alias2-val')?.value || '').trim()
      : '';
  const seg = typeof getSegundoPago === 'function' ? getSegundoPago() : null;
  // m2Raw es lo que escribió el usuario (puede pasarse del total → se avisa);
  // m2 es el valor ya acotado que se usa para armar las partes.
  const m2Raw = seg ? (+seg.monto || 0) : 0;
  const m2 = Math.min(m2Raw, total);
  const partes = [{ tipo: pago, monto: Math.max(0, total - m2), alias: aliasVal || null }];
  if (seg && m2 > 0) partes.push({ tipo: seg.tipo, monto: m2, alias: seg.alias || null });
  return { partes, total, m2, m2Raw, hayseg: !!(seg && m2Raw > 0) };
}

/* ── Refresca el desglose dentro de la tarjeta + el texto del resto ── */
function renderDesglosePago() {
  const cont = document.getElementById('pago-desglose');
  if (!cont) return;
  const { partes, total, m2Raw, hayseg } = partesDelFormulario();
  const resto = document.getElementById('pago2-resto');
  if (resto) {
    if (hayseg) {
      const p1 = partes[0];
      resto.innerHTML = m2Raw > total + 0.5
        ? '<span style="color:#b91c1c;font-weight:600">' + ic('alert', 12) + ' El segundo pago supera el total del remito</span>'
        : 'Primer pago (' + esc(LBL_PAGO_C[p1.tipo] || 'sin definir') + '): <strong>' + _fpp(p1.monto) + '</strong> · Total: ' + _fpp(total);
    } else {
      resto.innerHTML = '';
    }
  }
  const html = desglosePagoHTML(partes);
  cont.innerHTML = html;
  cont.style.display = html ? '' : 'none';
}

/* ══════════════════════════════════════════════════════════════
   BALANCE POR ALIAS — sólo plata efectivamente recibida
══════════════════════════════════════════════════════════════ */

/* Suma por alias de las partes que son transferencia (incluye
   deudas cobradas por transferencia, porque al cobrarse la parte
   pasa a tipo 'transferencia' con su alias). */
/* Trae TODAS las filas paginando: sin esto PostgREST corta en la
   primera tanda y el balance se calcula sobre datos incompletos. */
async function sbFetchPaginado(pathBase, pageSize) {
  const size = pageSize || 1000;
  let off = 0, out = [];
  for (let i = 0; i < 30; i++) {
    const sep = pathBase.includes('?') ? '&' : '?';
    const pag = await sbFetch(pathBase + sep + 'limit=' + size + '&offset=' + off);
    if (!Array.isArray(pag) || !pag.length) break;
    out = out.concat(pag);
    if (pag.length < size) break;
    off += size;
  }
  return out;
}

/* Cobros de deuda registrados en la tabla pagos, por remito.
   Sirve para saber a qué alias entró una deuda vieja ya saldada. */
var _cobrosCache = null, _cobrosPromesa = null;

async function cargarCobrosPorRemito(force) {
  if (!force && _cobrosCache) return _cobrosCache;
  if (_cobrosPromesa) return _cobrosPromesa;
  _cobrosPromesa = (async () => {
    let mapa = {};
    try {
      const filas = await sbFetchPaginado('pagos?select=remito_id,monto,medio,alias,fecha');
      filas.forEach(p => {
        if (p.remito_id == null) return;
        (mapa[p.remito_id] = mapa[p.remito_id] || []).push(p);
      });
    } catch (e) { mapa = {}; }
    _cobrosCache = mapa;
    _cobrosPromesa = null;
    return mapa;
  })();
  return _cobrosPromesa;
}

/* Detalle por alias: transferencias directas + deudas ya cobradas.
   Las deudas viejas saldadas se atribuyen con la tabla pagos; si no
   hay registro (se saldaron antes de que existiera), se asume que
   fueron al alias que figuraba en el remito y se marcan aparte. */
function balanceAliasDetalle(lista, cobrosPorRemito) {
  const det = {};
  const add = (alias, monto, campo) => {
    if (!alias || !(+monto)) return;
    det[alias] = det[alias] || { transfer: 0, cobradas: 0, estimadas: 0, total: 0 };
    det[alias][campo] += (+monto || 0);
    det[alias].total   += (+monto || 0);
  };
  (lista || []).forEach(r => {
    partesPago(r).forEach(p => {
      if (p.tipo === 'transferencia') {
        // Incluye deudas cobradas con el sistema nuevo (era_deuda)
        add(p.alias, p.monto, p.era_deuda ? 'cobradas' : 'transfer');
        return;
      }
      if (p.tipo === 'deuda' && p.legacySaldado) {
        const cobros = (cobrosPorRemito || {})[r.id];
        if (cobros && cobros.length) {
          cobros.forEach(c => {
            if (c.medio === 'transferencia') add(c.alias || p.alias || r.alias, c.monto, 'cobradas');
          });
        } else {
          add(p.alias || r.alias, p.monto, 'estimadas');
        }
      }
    });
  });
  return det;
}

function balanceAlias(lista, cobrosPorRemito) {
  const det = balanceAliasDetalle(lista, cobrosPorRemito);
  const tot = {};
  Object.keys(det).forEach(a => { tot[a] = det[a].total; });
  return tot;
}

var _balAliasCache = null, _balAliasTs = 0, _balAliasDet = null;

/* Lista completa de remitos para el balance (paginada, sin tope) */
async function cargarRemitosParaBalance() {
  const sel = 'remitos?select=id,total,pago,alias,saldado,saldado_fecha,pagos_detalle,pago2_tipo,pago2_monto,pago2_alias&order=created_at.desc';
  try { return await sbFetchPaginado(sel); }
  catch (e) { return window._historialCache || window._dashRemHist || window._dashRemMes || []; }
}

async function cargarBalanceAlias(force) {
  const ahora = Date.now();
  if (!force && _balAliasCache && (ahora - _balAliasTs) < 600000) return _balAliasCache;
  const [lista, cobros] = await Promise.all([cargarRemitosParaBalance(), cargarCobrosPorRemito()]);
  _balAliasDet   = balanceAliasDetalle(lista, cobros);
  _balAliasCache = balanceAlias(lista, cobros);
  _balAliasTs    = ahora;
  return _balAliasCache;
}

function detalleBalanceAlias() { return _balAliasDet; }
function invalidarBalanceAlias() { _balAliasCache = null; _balAliasTs = 0; _balAliasDet = null; _cobrosCache = null; }

/* Sugiere el alias que queda más equilibrado DESPUÉS de sumarle
   el monto que va a entrar por este remito. */
async function sugerirAliasAsync(montoNuevo) {
  const cfg = leerAliasConfig();
  const a1 = (cfg.alias1 || '').trim(), a2 = (cfg.alias2 || '').trim();
  if (!a1 && !a2) return null;
  if (!a1) return { alias: a2, unico: true };
  if (!a2) return { alias: a1, unico: true };

  const tot = await cargarBalanceAlias();
  const t1 = tot[a1] || 0, t2 = tot[a2] || 0;
  const m  = +montoNuevo || 0;

  // Se sugiere SIEMPRE el que menos recibió.
  // (Antes se comparaba la diferencia resultante: con monto 0 las dos
  //  daban igual y el desempate caía siempre en el alias 1, sin mirar
  //  los totales. Por eso sugería el mismo aunque tuviera más.)
  const elegido = t1 <= t2 ? a1 : a2;
  const otro    = elegido === a1 ? a2 : a1;
  const totElegido = elegido === a1 ? t1 : t2;
  const totOtro    = elegido === a1 ? t2 : t1;

  return {
    alias: elegido, aliasOtro: otro,
    tot: { [a1]: t1, [a2]: t2 },
    totElegido, totOtro,
    monto: m,
    empate: t1 === t2,
    difActual: Math.abs(t1 - t2),
    difLuego: Math.abs((totElegido + m) - totOtro)
  };
}

/* Panel de sugerencia dentro del remito */
async function mostrarSugerenciaAlias() {
  const wrap = document.getElementById('alias-sugerencia');
  if (!wrap) return;
  const { total, partes } = partesDelFormulario();
  // El monto que realmente entraría por transferencia
  let montoTransfer = 0;
  partes.forEach(p => { if (p.tipo === 'transferencia' || p.tipo === 'deuda') montoTransfer += (+p.monto || 0); });
  if (!montoTransfer) montoTransfer = total;

  let sug = null;
  try { sug = await sugerirAliasAsync(montoTransfer); } catch (e) { return; }
  if (!sug) { wrap.style.display = 'none'; return; }

  wrap.style.display = '';
  if (sug.unico) {
    wrap.innerHTML = '<div style="font-size:10px;color:var(--muted);margin-top:6px">Único alias configurado</div>';
    return;
  }

  const nEl = sug.alias === (leerAliasConfig().alias1 || '').trim() ? 1 : 2;
  wrap.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;background:var(--subtle);border:1px solid var(--rose-border);border-radius:8px;padding:8px 12px;margin-top:6px">' +
      '<span style="font-size:16px">' + ic('scale') + '</span>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:11px;font-weight:700;color:var(--rose)">Alias sugerido: ' + esc(sug.alias) + '</div>' +
        '<div style="font-size:10px;color:var(--muted)">' +
          'Recibido — ' + esc(sug.alias) + ': <strong>' + _fpp(sug.totElegido) + '</strong> (menos) · ' +
          esc(sug.aliasOtro) + ': <strong>' + _fpp(sug.totOtro) + '</strong>' +
          (sug.empate ? '<br>Los dos están iguales' :
            (sug.monto ? '<br>Con este remito la diferencia pasa de ' + _fpp(sug.difActual) + ' a ' + _fpp(sug.difLuego) : '')) +
        '</div>' +
      '</div>' +
      '<button onclick="aplicarAliasSugerido(' + nEl + ')" style="background:var(--rose);color:#fff;border:none;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;flex-shrink:0">Usar</button>' +
    '</div>';
}

function aplicarAliasSugerido(num) {
  const btn = document.getElementById('alias-btn-' + num);
  if (btn && typeof setAlias === 'function') { setAlias(btn, num); toast('Alias seleccionado'); }
}

/* Tarjetas con la cuenta de cada alias (historial).
   Usa exactamente el mismo cálculo que la sugerencia para que los
   dos números nunca puedan diferir. */
function renderTotalesAliasHTML(lista) {
  const cfg = leerAliasConfig();
  const a1 = (cfg.alias1 || '').trim(), a2 = (cfg.alias2 || '').trim();
  if (!a1 && !a2) return '';
  // Si el balance global ya está calculado (paginado y con cobros), se usa ese.
  const det = detalleBalanceAlias() || balanceAliasDetalle(lista, _cobrosCache);
  if (!_cobrosCache) {
    // Falta la tabla de cobros: se carga y se repinta cuando llegue
    cargarCobrosPorRemito().then(() => {
      if (typeof renderHistorialStats === 'function' && window._historialCache) {
        try { renderHistorialStats(window._historialCache); } catch (e) {}
      }
    });
  }
  return [a1, a2].filter(Boolean).map(a => {
    const d = det[a] || { transfer:0, cobradas:0, estimadas:0, total:0 };
    const partes = [];
    if (d.transfer)  partes.push('Transferencias ' + _fpp(d.transfer));
    if (d.cobradas)  partes.push('Deudas cobradas ' + _fpp(d.cobradas));
    if (d.estimadas) partes.push('Deudas viejas ' + _fpp(d.estimadas));
    return '<div class="stat-card"><div class="stat-label">' + ic('card') + ' ' + esc(a) + '</div>' +
      '<div class="stat-value" style="font-size:1.3rem;color:var(--violet)">' + _fpp(d.total) + '</div>' +
      '<div class="stat-sub">' + (partes.join(' · ') || 'sin movimientos') + '</div></div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   EDITAR / COBRAR PAGOS DE UN REMITO GUARDADO
══════════════════════════════════════════════════════════════ */

async function sbGuardarPartes(remitoId, partes) {
  const quedaDeuda = partes.some(p => p.tipo === 'deuda' && +p.monto > 0);
  const fechaSaldo = partes.filter(p => p.saldado_fecha).map(p => p.saldado_fecha).sort().pop() || null;
  const body = {
    pagos_detalle: JSON.stringify(partes),
    pago: (partes.find(p => +p.monto > 0) || partes[0] || {}).tipo || 'sin_definir',
    alias: (partes.find(p => p.tipo === 'transferencia' && p.alias) || {}).alias || null,
    saldado: !quedaDeuda && partes.some(p => p.era_deuda),
    saldado_fecha: !quedaDeuda ? fechaSaldo : null
  };
  return await sbFetch('remitos?id=eq.' + remitoId, { method: 'PATCH', body: JSON.stringify(body) });
}

function _remitoDeCache(id) {
  return (window._historialCache || []).find(x => x.id === id) ||
         (window._dashRemHist || []).find(x => x.id === id) || null;
}

/* ── Modal: editar el desglose de pago de un remito ── */
function abrirEditarPago(remitoId) {
  const r = _remitoDeCache(remitoId);
  if (!r) { toast('Remito no encontrado'); return; }
  window._epPartes = partesPago(r).map(p => ({ ...p }));
  window._epRemito = r;
  let modal = document.getElementById('editpago-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'editpago-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1250;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:18px 18px 0 0;padding:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<div style="font-size:16px;font-weight:700;font-family:Inter,sans-serif">Editar pago</div>' +
        '<button onclick="document.getElementById(\'editpago-modal\').remove()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:13px">' +
        '<b>' + esc(r.cliente_nombre || '') + '</b> · ' + esc(r.fecha || '') +
        '<div style="color:var(--muted);margin-top:2px">Total del remito: <b>' + _fpp(r.total) + '</b></div>' +
      '</div>' +
      '<div id="ep-lista"></div>' +
      '<button onclick="epAgregarParte()" style="width:100%;background:var(--subtle);color:var(--rose);border:1.5px dashed var(--rose-border);border-radius:10px;padding:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;margin-bottom:10px">+ Agregar otro medio de pago</button>' +
      '<div id="ep-aviso" style="font-size:12px;margin-bottom:10px"></div>' +
      '<button id="ep-guardar" onclick="epGuardar(' + remitoId + ')" style="width:100%;background:var(--grad);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer">Guardar cambios</button>' +
    '</div>';
  document.body.appendChild(modal);
  epRender();
}

function epRender() {
  const cont = document.getElementById('ep-lista');
  if (!cont) return;
  const cfg = leerAliasConfig();
  const aliases = [cfg.alias1, cfg.alias2].filter(a => a && a.trim());
  cont.innerHTML = (window._epPartes || []).map((p, i) =>
    '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px;background:var(--surface)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Pago ' + (i + 1) +
          (p.era_deuda ? ' <span style="color:#15803d;text-transform:none;letter-spacing:0">· era deuda, cobrada' + (p.saldado_fecha ? ' el ' + esc(p.saldado_fecha) : '') + '</span>' : '') +
        '</div>' +
        ((window._epPartes.length > 1) ? '<button onclick="epQuitarParte(' + i + ')" style="background:none;border:none;color:#b91c1c;font-size:11px;cursor:pointer;font-weight:600">Quitar</button>' : '') +
      '</div>' +
      '<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">' +
        ['efectivo','transferencia','deuda'].map(t =>
          '<button onclick="epSetTipo(' + i + ',\'' + t + '\')" style="flex:1;min-width:96px;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;' +
          'border:1.5px solid ' + (p.tipo === t ? COLOR_PAGO[t] : 'var(--border)') + ';' +
          'background:' + (p.tipo === t ? '#fff' : 'var(--bg)') + ';color:' + (p.tipo === t ? COLOR_PAGO[t] : 'var(--muted)') + '">' +
          ic(ICON_PAGO[t]) + ' ' + LBL_PAGO_C[t] + '</button>'
        ).join('') +
      '</div>' +
      '<input class="field-input" type="number" inputmode="decimal" value="' + (+p.monto || 0) + '" ' +
        'oninput="epSetMonto(' + i + ',this.value)" placeholder="Monto $" style="margin-bottom:' + (p.tipo === 'efectivo' ? '0' : '8px') + '"/>' +
      (p.tipo !== 'efectivo' && aliases.length ?
        '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">Alias</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          aliases.map(a =>
            '<button onclick="epSetAlias(' + i + ',\'' + esc(a).replace(/'/g, "\\'") + '\')" style="flex:1;min-width:110px;padding:7px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;' +
            'border:1.5px solid ' + (p.alias === a ? 'var(--rose)' : 'var(--border)') + ';' +
            'background:' + (p.alias === a ? 'var(--subtle)' : 'var(--bg)') + ';color:' + (p.alias === a ? 'var(--rose)' : 'var(--muted)') + '">' + esc(a) + '</button>'
          ).join('') +
        '</div>'
      : '') +
    '</div>'
  ).join('');
  epValidar();
}

function epSetTipo(i, t) {
  const p = window._epPartes[i];
  const eraDeuda = p.tipo === 'deuda';
  p.tipo = t;
  if (t === 'efectivo') p.alias = null;
  // Pasar de deuda a cobrada deja registro
  if (eraDeuda && t !== 'deuda') {
    p.era_deuda = true;
    if (!p.saldado_fecha) p.saldado_fecha = new Date().toISOString().slice(0, 10);
  }
  if (t === 'deuda') { p.era_deuda = false; p.saldado_fecha = null; }
  epRender();
}
function epSetMonto(i, v) { window._epPartes[i].monto = +v || 0; epValidar(); }
function epSetAlias(i, a) { window._epPartes[i].alias = a; epRender(); }
function epQuitarParte(i) { window._epPartes.splice(i, 1); epRender(); }
function epAgregarParte() {
  const r = window._epRemito || {};
  const suma = window._epPartes.reduce((s, p) => s + (+p.monto || 0), 0);
  window._epPartes.push({ tipo:'efectivo', monto: Math.max(0, (+r.total || 0) - suma), alias:null, era_deuda:false, saldado_fecha:null });
  epRender();
}

function epValidar() {
  const av = document.getElementById('ep-aviso');
  const btn = document.getElementById('ep-guardar');
  if (!av) return true;
  const total = +(window._epRemito || {}).total || 0;
  const suma = (window._epPartes || []).reduce((s, p) => s + (+p.monto || 0), 0);
  const dif = Math.round((suma - total) * 100) / 100;
  const faltaAlias = (window._epPartes || []).some(p => p.tipo !== 'efectivo' && +p.monto > 0 && !p.alias && (leerAliasConfig().alias1 || leerAliasConfig().alias2));
  let ok = true, msg = '';
  if (Math.abs(dif) > 0.5) {
    ok = false;
    msg = '<span style="color:#b91c1c;font-weight:600">' + ic('alert', 12) + ' Los pagos suman ' + _fpp(suma) + ' y el total es ' + _fpp(total) +
          ' (' + (dif > 0 ? 'sobran ' : 'faltan ') + _fpp(Math.abs(dif)) + ')</span>';
  } else if (faltaAlias) {
    ok = false;
    msg = '<span style="color:#b91c1c;font-weight:600">' + ic('alert', 12) + ' Elegí el alias de cada transferencia o deuda</span>';
  } else {
    msg = '<span style="color:#15803d">' + ic('check', 12) + ' Los pagos suman el total del remito</span>';
  }
  av.innerHTML = msg;
  if (btn) { btn.disabled = !ok; btn.style.opacity = ok ? '1' : '.5'; btn.style.cursor = ok ? 'pointer' : 'not-allowed'; }
  return ok;
}

async function epGuardar(remitoId) {
  if (!epValidar()) return;
  const btn = document.getElementById('ep-guardar');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  const partes = (window._epPartes || []).filter(p => +p.monto > 0);
  try {
    await sbGuardarPartes(remitoId, partes);
    // Registrar los cobros de deuda nuevos en la tabla pagos
    const r = _remitoDeCache(remitoId);
    const antes = partesPago(r);
    const deudaAntes = antes.reduce((s, p) => s + (p.tipo === 'deuda' && !p.legacySaldado ? +p.monto || 0 : 0), 0);
    const deudaAhora = partes.reduce((s, p) => s + (p.tipo === 'deuda' ? +p.monto || 0 : 0), 0);
    const cobrado = deudaAntes - deudaAhora;
    if (cobrado > 0) {
      const cobro = partes.find(p => p.era_deuda) || {};
      try {
        await sbPagoInsert({
          cliente_nombre: r.cliente_nombre || '', remito_id: remitoId, monto: cobrado,
          medio: cobro.tipo || 'efectivo', alias: cobro.alias || null,
          fecha: cobro.saldado_fecha || new Date().toISOString().slice(0, 10),
          nota: 'Cobro registrado al editar el pago', comprobante_url: null
        });
      } catch (e) { /* el remito ya quedó bien; el registro en pagos es secundario */ }
    }
    // Reflejar en cache local
    if (r) {
      r.pagos_detalle = JSON.stringify(partes);
      r.pago = (partes[0] || {}).tipo || r.pago;
      r.alias = (partes.find(p => p.tipo === 'transferencia' && p.alias) || {}).alias || null;
      r.saldado = !partes.some(p => p.tipo === 'deuda');
    }
    invalidarBalanceAlias();
    const m = document.getElementById('editpago-modal'); if (m) m.remove();
    toast('✅ Pago actualizado');
    if (typeof renderHistorialConFiltros === 'function' && document.getElementById('historial-remitos-lista')) renderHistorialConFiltros();
    if (typeof cargarHistorialRemitos === 'function' && document.getElementById('historial-remitos-lista')) cargarHistorialRemitos();
  } catch (e) {
    toast('❌ No se pudo guardar: ' + (e.message || ''));
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar cambios'; }
  }
}

/* ── Cobrar deuda: ahora cobra la PARTE en deuda y la convierte ── */
function abrirCobrarDeuda(remitoId) {
  const r = _remitoDeCache(remitoId);
  if (!r) { toast('Remito no encontrado'); return; }
  const partes = partesPago(r);
  const idxDeuda = partes.findIndex(p => p.tipo === 'deuda' && !p.legacySaldado && +p.monto > 0);
  if (idxDeuda === -1) { toast('Este remito no tiene deuda pendiente'); return; }
  const montoDeuda = +partes[idxDeuda].monto || 0;

  window._cdRemito = r; window._cdIdx = idxDeuda; window._cdMedio = 'efectivo'; window._cdAlias = null;

  let modal = document.getElementById('cobrar-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'cobrar-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(30,26,26,.5);z-index:1200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)';
  const hoyISO = new Date().toISOString().slice(0, 10);
  const otras = partes.filter((p, i) => i !== idxDeuda && +p.monto > 0);
  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:18px 18px 0 0;padding:20px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<div style="font-size:16px;font-weight:700;font-family:Inter,sans-serif">Cobrar deuda</div>' +
        '<button onclick="document.getElementById(\'cobrar-modal\').remove()" style="background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:13px">' +
        '<b>' + esc(r.cliente_nombre || '') + '</b> · Remito del ' + esc(r.fecha || '') +
        '<div style="color:var(--muted);margin-top:2px">Deuda pendiente: <b style="color:#d97706">' + _fpp(montoDeuda) + '</b> · Total del remito: ' + _fpp(r.total) + '</div>' +
        (otras.length ? '<div style="color:var(--muted);margin-top:2px;font-size:12px">Ya cobrado: ' +
          otras.map(p => esc(LBL_PAGO_C[p.tipo] || p.tipo) + ' ' + _fpp(p.monto)).join(' · ') + '</div>' : '') +
      '</div>' +
      '<div class="field-group"><div class="field-label">Monto cobrado $</div>' +
        '<input class="field-input" id="cd-monto" type="number" inputmode="decimal" value="' + montoDeuda + '" oninput="_cdAvisoParcial()"/>' +
        '<div id="cd-parcial" style="font-size:11px;color:var(--muted);margin-top:4px"></div></div>' +
      '<div class="field-group"><div class="field-label">Medio</div>' +
        '<div style="display:flex;gap:8px;margin-top:4px">' +
          '<button id="cd-medio-efectivo" onclick="window._cdMedio=\'efectivo\';_cdPintarMedio()" style="flex:1;padding:9px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif"></button>' +
          '<button id="cd-medio-transferencia" onclick="window._cdMedio=\'transferencia\';_cdPintarMedio()" style="flex:1;padding:9px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif"></button>' +
        '</div></div>' +
      '<div class="field-group" id="cd-alias-wrap" style="display:none"><div class="field-label">¿A qué alias transfirió?</div>' +
        '<div id="cd-alias-btns" style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap"></div></div>' +
      '<div class="field-group"><div class="field-label">Fecha del cobro</div>' +
        '<input class="field-input" id="cd-fecha" type="date" value="' + hoyISO + '"/></div>' +
      '<div class="field-group" id="cd-comp-wrap" style="display:none"><div class="field-label">Comprobante (opcional)</div>' +
        '<input class="field-input" id="cd-comp" type="file" accept="image/*" style="padding:8px"/></div>' +
      '<div class="field-group"><div class="field-label">Nota (opcional)</div>' +
        '<input class="field-input" id="cd-nota" type="text" placeholder="Ej: pagó la mitad en mostrador"/></div>' +
      '<button id="cd-guardar" onclick="guardarCobroDeuda(' + remitoId + ')" style="width:100%;background:var(--grad);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;margin-top:6px">Registrar cobro</button>' +
    '</div>';
  document.body.appendChild(modal);

  window._cdPintarMedio = function () {
    ['efectivo', 'transferencia'].forEach(m => {
      const b = document.getElementById('cd-medio-' + m);
      if (!b) return;
      const on = window._cdMedio === m;
      b.style.border = '1.5px solid ' + (on ? 'var(--rose)' : 'var(--border)');
      b.style.background = on ? 'var(--subtle)' : 'var(--bg)';
      b.style.color = on ? 'var(--rose)' : 'var(--muted)';
      b.innerHTML = (m === 'efectivo' ? ic('cash') + ' Efectivo' : ic('smartphone') + ' Transferencia');
    });
    const cw = document.getElementById('cd-comp-wrap');
    if (cw) cw.style.display = window._cdMedio === 'transferencia' ? 'block' : 'none';
    const aw = document.getElementById('cd-alias-wrap');
    const cfg = leerAliasConfig();
    const aliases = [cfg.alias1, cfg.alias2].filter(a => a && a.trim());
    if (aw) {
      const mostrar = window._cdMedio === 'transferencia' && aliases.length > 0;
      aw.style.display = mostrar ? 'block' : 'none';
      if (mostrar) {
        if (!window._cdAlias) window._cdAlias = aliases[0];
        document.getElementById('cd-alias-btns').innerHTML = aliases.map(a =>
          '<button onclick="window._cdAlias=\'' + esc(a).replace(/'/g, "\\'") + '\';_cdPintarMedio()" style="flex:1;min-width:120px;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;' +
          'border:1.5px solid ' + (window._cdAlias === a ? 'var(--rose)' : 'var(--border)') + ';' +
          'background:' + (window._cdAlias === a ? 'var(--subtle)' : 'var(--bg)') + ';color:' + (window._cdAlias === a ? 'var(--rose)' : 'var(--muted)') + '">' + esc(a) + '</button>'
        ).join('');
      } else { window._cdAlias = null; }
    }
  };
  window._cdAvisoParcial = function () {
    const el = document.getElementById('cd-parcial');
    if (!el) return;
    const v = +(document.getElementById('cd-monto') || {}).value || 0;
    const rest = montoDeuda - v;
    el.innerHTML = rest > 0.5
      ? '<span style="color:#d97706">Queda en deuda: <strong>' + _fpp(rest) + '</strong></span>'
      : (rest < -0.5 ? '<span style="color:#b91c1c">Supera la deuda pendiente</span>' : '<span style="color:#15803d">Salda la deuda completa</span>');
  };
  window._cdPintarMedio();
  window._cdAvisoParcial();
}

async function guardarCobroDeuda(remitoId) {
  const r = _remitoDeCache(remitoId);
  if (!r) return;
  const monto = +(document.getElementById('cd-monto') || {}).value || 0;
  const fecha = (document.getElementById('cd-fecha') || {}).value || new Date().toISOString().slice(0, 10);
  const nota  = ((document.getElementById('cd-nota') || {}).value || '').trim();
  const medio = window._cdMedio || 'efectivo';
  const alias = medio === 'transferencia' ? (window._cdAlias || null) : null;
  const fileEl = document.getElementById('cd-comp');
  if (monto <= 0) { toast('Ingresá el monto cobrado'); return; }

  const partes = partesPago(r).map(p => ({ ...p }));
  const idx = window._cdIdx != null ? window._cdIdx : partes.findIndex(p => p.tipo === 'deuda' && +p.monto > 0);
  if (idx === -1) { toast('No hay deuda para cobrar'); return; }
  const montoDeuda = +partes[idx].monto || 0;
  if (monto > montoDeuda + 0.5) { toast('El monto supera la deuda pendiente'); return; }

  const cfg = leerAliasConfig();
  if (medio === 'transferencia' && (cfg.alias1 || cfg.alias2) && !alias) { toast('Elegí a qué alias transfirió'); return; }

  const btn = document.getElementById('cd-guardar');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    let compUrl = null;
    if (fileEl && fileEl.files && fileEl.files[0]) {
      if (btn) btn.textContent = 'Subiendo comprobante...';
      compUrl = await subirComprobante(fileEl.files[0]);
    }
    // La parte cobrada cambia de tipo; si es parcial, se parte en dos
    const resto = Math.round((montoDeuda - monto) * 100) / 100;
    const cobrada = { tipo: medio, monto: monto, alias: alias, era_deuda: true, saldado_fecha: fecha };
    if (resto > 0.5) {
      partes.splice(idx, 1, cobrada, { tipo:'deuda', monto: resto, alias: partes[idx].alias || null, era_deuda:false, saldado_fecha:null });
    } else {
      partes.splice(idx, 1, cobrada);
    }
    await sbGuardarPartes(remitoId, partes);
    try {
      await sbPagoInsert({
        cliente_nombre: r.cliente_nombre || '', remito_id: remitoId, monto: monto,
        medio: medio, alias: alias, fecha: fecha, nota: nota || null, comprobante_url: compUrl
      });
    } catch (e) { /* secundario */ }

    r.pagos_detalle = JSON.stringify(partes);
    r.saldado = !partes.some(p => p.tipo === 'deuda' && +p.monto > 0);
    if (r.saldado) r.saldado_fecha = fecha;
    if (alias) r.alias = alias;
    invalidarBalanceAlias();

    const m = document.getElementById('cobrar-modal'); if (m) m.remove();
    toast(resto > 0.5 ? '✅ Cobro parcial registrado' : '✅ Deuda saldada');
    if (typeof renderHistorialConFiltros === 'function' && document.getElementById('historial-remitos-lista')) renderHistorialConFiltros();
  } catch (e) {
    toast('❌ No se pudo registrar el cobro');
    if (btn) { btn.disabled = false; btn.textContent = 'Registrar cobro'; }
  }
}

/* ══════════════════════════════════════════════════════════════
   HOOKS — mantener el desglose y la sugerencia siempre al día
══════════════════════════════════════════════════════════════ */

(function () {
  const _calcTotal_prev = window.calcTotal;
  window.calcTotal = function () {
    if (_calcTotal_prev) _calcTotal_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };

  const _setPago_prev = window.setPago;
  window.setPago = function (btn, cls) {
    if (_setPago_prev) _setPago_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };

  const _setPago2_prev = window.setPago2;
  window.setPago2 = function (btn, tipo) {
    if (_setPago2_prev) _setPago2_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };

  const _setAlias_prev = window.setAlias;
  window.setAlias = function (btn, num) {
    if (_setAlias_prev) _setAlias_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };

  const _setAlias2_prev = window.setAlias2;
  window.setAlias2 = function (btn, num) {
    if (_setAlias2_prev) _setAlias2_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };

  const _toggleSeg_prev = window.toggleSegundoPago;
  window.toggleSegundoPago = function (btn) {
    if (_toggleSeg_prev) _toggleSeg_prev.apply(this, arguments);
    try { renderDesglosePago(); } catch (e) {}
  };
})();

/* Validación al confirmar: el segundo pago no puede pasarse del total */
(function () {
  const _compartir_prev = window.compartirRemito;
  window.compartirRemito = function () {
    const { total, m2Raw, hayseg } = partesDelFormulario();
    if (hayseg && m2Raw > total + 0.5) {
      toast('⚠️ El segundo pago (' + _fpp(m2Raw) + ') supera el total del remito (' + _fpp(total) + ')');
      return;
    }
    if (hayseg && m2Raw >= total - 0.5 && total > 0) {
      toast('⚠️ El segundo pago es igual al total: usá un solo medio de pago');
      return;
    }
    return _compartir_prev ? _compartir_prev.apply(this, arguments) : undefined;
  };
})();

/* Al reconstruir un remito guardado para compartirlo, rearmar el desglose
   desde los datos guardados (antes se leía el formulario en blanco). */
function pintarDesgloseDesdeRemito(r) {
  const cont = document.getElementById('pago-desglose');
  if (!cont) return;
  const html = desglosePagoHTML(partesPago(r).filter(p => p.monto > 0));
  cont.innerHTML = html;
  cont.style.display = html ? '' : 'none';
}

(function () {
  const _compartirGuardado_prev = window.compartirRemitoGuardado;
  window.compartirRemitoGuardado = async function (id) {
    const r = _remitoDeCache(id);
    // El original repinta la tarjeta de forma asíncrona; se inyecta el
    // desglose después para que quede incluido en la captura.
    let t1, t2, t3;
    if (r) {
      t1 = setTimeout(() => pintarDesgloseDesdeRemito(r), 450);
      t2 = setTimeout(() => pintarDesgloseDesdeRemito(r), 700);
      t3 = setTimeout(() => pintarDesgloseDesdeRemito(r), 1000);
    }
    try {
      return await (_compartirGuardado_prev ? _compartirGuardado_prev.apply(this, arguments) : undefined);
    } finally {
      [t1, t2, t3].forEach(t => t && clearTimeout(t));
      setTimeout(() => {
        const c = document.getElementById('pago-desglose');
        if (c) { c.innerHTML = ''; c.style.display = 'none'; }
      }, 1500);
    }
  };
})();

/* Limpiar el desglose cuando se resetea el remito */
(function () {
  const _nuevoRemito_prev = window.nuevoRemito;
  window.nuevoRemito = function () {
    const res = _nuevoRemito_prev ? _nuevoRemito_prev.apply(this, arguments) : undefined;
    const c = document.getElementById('pago-desglose');
    if (c) { c.innerHTML = ''; c.style.display = 'none'; }
    const rs = document.getElementById('pago2-resto'); if (rs) rs.innerHTML = '';
    return res;
  };
})();

/* El balance de alias se recalcula cuando cambia el historial */
(function () {
  const _cargarHist_prev = window.cargarHistorialRemitos;
  window.cargarHistorialRemitos = async function () {
    const res = _cargarHist_prev ? await _cargarHist_prev.apply(this, arguments) : undefined;
    invalidarBalanceAlias();
    return res;
  };
})();

/* ═══════════════════════════════════════════════════════════════
   AUMENTO DE PRECIOS — aviso por cliente
   ───────────────────────────────────────────────────────────────
   Cada cliente tiene una marca (clientes.aviso_aumento) que indica
   si ya se le comunicó el aumento. La regla es:
     · Ya avisado  → en esta visita se le cobra el precio NUEVO
     · Sin avisar  → se le cobra el precio VIEJO y recién se le avisa
   Por eso el casillero "le avisé hoy" NO cambia el precio de este
   remito: marca al cliente para la vuelta siguiente.
═══════════════════════════════════════════════════════════════ */

const AUMENTO_KEY = 'intencional_aumento_config';
const AUMENTO_DEFAULT = { activo: true, precioViejo: 2200, precioNuevo: 2400, producto: 'Esmalte en Gel' };

function leerAumentoConfig() {
  try {
    const d = localStorage.getItem(AUMENTO_KEY);
    return d ? { ...AUMENTO_DEFAULT, ...JSON.parse(d) } : { ...AUMENTO_DEFAULT };
  } catch (e) { return { ...AUMENTO_DEFAULT }; }
}
function guardarAumentoConfigLocal(cfg) {
  try { localStorage.setItem(AUMENTO_KEY, JSON.stringify(cfg)); } catch (e) {}
}

async function guardarAumentoEnDB() {
  const cfg = {
    activo: !!document.getElementById('cfg-aumento-activo')?.checked,
    precioViejo: +(document.getElementById('cfg-aumento-viejo')?.value || 0) || 0,
    precioNuevo: +(document.getElementById('cfg-aumento-nuevo')?.value || 0) || 0,
    producto: (document.getElementById('cfg-aumento-producto')?.value || '').trim() || AUMENTO_DEFAULT.producto
  };
  if (cfg.activo && (!cfg.precioViejo || !cfg.precioNuevo)) { toast('⚠️ Cargá los dos precios'); return; }
  guardarAumentoConfigLocal(cfg);
  try {
    await sbFetch('config', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: 'aumento_config', value: JSON.stringify(cfg) }) });
    toast('✅ Aumento guardado');
  } catch (e) { toast('⚠️ Guardado solo localmente (revisá la conexión)'); }
}

async function cargarAumentoDesdeDB() {
  try {
    const rows = await sbFetch('config?key=eq.aumento_config&select=key,value');
    if (rows && rows.length && rows[0].value) {
      const cfg = { ...AUMENTO_DEFAULT, ...JSON.parse(rows[0].value) };
      guardarAumentoConfigLocal(cfg);
      return cfg;
    }
  } catch (e) {}
  return leerAumentoConfig();
}

function pintarConfigAumento() {
  const cfg = leerAumentoConfig();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const chk = document.getElementById('cfg-aumento-activo');
  if (chk) chk.checked = !!cfg.activo;
  set('cfg-aumento-viejo', cfg.precioViejo || '');
  set('cfg-aumento-nuevo', cfg.precioNuevo || '');
  set('cfg-aumento-producto', cfg.producto || '');
}

/* ── Marca del cliente ── */
function clienteAvisadoAumento(c) { return !!(c && c.aviso_aumento); }

async function setAvisoAumento(num, valor, silencioso) {
  const hoy = new Date().toISOString().slice(0, 10);
  const datos = { aviso_aumento: !!valor, aviso_aumento_fecha: valor ? hoy : null };
  try {
    await sbUpdate(num, datos);
  } catch (e) {
    if (!silencioso) toast('❌ No se pudo guardar: ' + (e.message || ''));
    return false;
  }
  // Reflejar en el cache local para que la UI quede al día sin recargar
  const c = (_cache || []).find(x => +x.num === +num);
  if (c) { c.aviso_aumento = !!valor; c.aviso_aumento_fecha = datos.aviso_aumento_fecha; }
  if (window._clienteRemitoActual && +window._clienteRemitoActual.num === +num) {
    window._clienteRemitoActual.aviso_aumento = !!valor;
  }
  if (!silencioso) toast(valor ? '✅ Marcado como avisado' : '✅ Marcado como sin avisar');
  return true;
}

async function toggleAvisoAumento(num, ev) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  const c = (_cache || []).find(x => +x.num === +num);
  if (!c) return;
  const nuevo = !clienteAvisadoAumento(c);
  const ok = await setAvisoAumento(num, nuevo);
  if (!ok) return;
  if (typeof _rutaDetalleActual !== 'undefined' && _rutaDetalleActual !== null) renderListaDetalle();
  else if (typeof renderLista === 'function') renderLista();
}

/* Chip visual del estado del cliente */
function chipAvisoAumento(c) {
  const cfg = leerAumentoConfig();
  if (!cfg.activo) return '';
  const av = clienteAvisadoAumento(c);
  return '<button onclick="toggleAvisoAumento(' + c.num + ',event)" ' +
    'title="' + (av ? 'Ya se le avisó del aumento. Tocá para desmarcar.' : 'Todavía no se le avisó. Tocá para marcarlo.') + '" ' +
    'style="font-size:10px;border-radius:6px;padding:2px 8px;font-weight:600;cursor:pointer;white-space:nowrap;' +
      (av ? 'background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0' : 'background:#fff7ed;color:#d97706;border:1px solid #fed7aa') + '">' +
    (av ? ic('check', 11) + ' Aumento avisado' : ic('alert', 11) + ' Sin avisar') +
  '</button>';
}

/* ── Marcar toda una ruta de una (los que ya se visitaron) ── */
async function marcarRutaAviso(valor) {
  if (typeof _rutaFiltro === 'undefined' || _rutaFiltro === null) { toast('Abrí una ruta primero'); return; }
  const todos = _cache || await cargarDB();
  const lista = todos.filter(c => {
    const r = parseRuta(c.ruta);
    if (_rutaFiltro === '__sin__') return !r.orden;
    return String(r.orden) === String(_rutaFiltro);
  }).filter(c => clienteAvisadoAumento(c) !== !!valor);
  if (!lista.length) { toast('No hay clientes para cambiar en esta ruta'); return; }
  const txt = valor ? 'avisados' : 'SIN avisar';
  if (!confirm('¿Marcar ' + lista.length + ' cliente' + (lista.length > 1 ? 's' : '') + ' de esta ruta como ' + txt + '?\n\nDespués podés corregir uno por uno.')) return;
  let ok = 0;
  for (const c of lista) { if (await setAvisoAumento(c.num, valor, true)) ok++; }
  toast('✅ ' + ok + ' de ' + lista.length + ' actualizados');
  if (typeof _rutaDetalleActual !== 'undefined' && _rutaDetalleActual !== null) renderListaDetalle();
  else if (typeof renderLista === 'function') renderLista();
}

function barraAvisoRutaHTML() {
  const cfg = leerAumentoConfig();
  if (!cfg.activo) return '';
  if (typeof _rutaFiltro === 'undefined' || _rutaFiltro === null) return '';
  return '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:var(--subtle);border:1px solid var(--rose-border);border-radius:10px;padding:8px 12px;margin-bottom:10px">' +
    '<span style="font-size:11px;color:var(--muted);flex:1;min-width:140px">Aviso del aumento en esta ruta</span>' +
    '<button onclick="marcarRutaAviso(true)" style="font-size:11px;font-weight:600;border:1px solid #bbf7d0;background:#f0fdf4;color:#15803d;border-radius:7px;padding:5px 10px;cursor:pointer">Todos avisados</button>' +
    '<button onclick="marcarRutaAviso(false)" style="font-size:11px;font-weight:600;border:1px solid #fed7aa;background:#fff7ed;color:#d97706;border-radius:7px;padding:5px 10px;cursor:pointer">Ninguno</button>' +
  '</div>';
}

/* ══════════════════════════════════════════════════════════════
   AVISO EN EL REMITO + PRECIO SUGERIDO
══════════════════════════════════════════════════════════════ */

/* Precio que corresponde a este cliente HOY (según si ya se le avisó) */
function precioParaCliente(c) {
  const cfg = leerAumentoConfig();
  if (!cfg.activo) return null;
  return clienteAvisadoAumento(c) ? +cfg.precioNuevo || 0 : +cfg.precioViejo || 0;
}

function _esProductoDelAumento(nombreProd) {
  const cfg = leerAumentoConfig();
  const objetivo = (cfg.producto || '').trim().toLowerCase();
  if (!objetivo) return false;
  const n = (nombreProd || '').trim().toLowerCase();
  return n === objetivo || n.includes(objetivo) || objetivo.includes(n);
}

/* Aplica el precio sugerido a los renglones del producto en aumento.
   Sólo pisa el precio si está vacío o si tiene el precio del otro
   tramo: nunca toca un precio escrito a mano. */
function aplicarPrecioAumento(precio) {
  const cfg = leerAumentoConfig();
  if (!cfg.activo || !precio) return 0;
  const otros = [+cfg.precioViejo || 0, +cfg.precioNuevo || 0];
  let cambiados = 0;
  (typeof rows !== 'undefined' ? rows : []).forEach(r => {
    if (!_esProductoDelAumento(r.prod)) return;
    const actual = +r.precio || 0;
    if (actual === precio) return;
    if (!actual || otros.indexOf(actual) !== -1) { r.precio = precio; cambiados++; }
  });
  if (cambiados) { renderRows(); calcTotal(); }
  return cambiados;
}

/* Banner en el remito: estado del cliente + precio sugerido + casillero */
function renderAvisoAumentoRemito(c) {
  const el = document.getElementById('r-cs-aumento-warn');
  if (!el) return;
  const cfg = leerAumentoConfig();
  if (!cfg.activo || !c) { el.style.display = 'none'; el.innerHTML = ''; return; }

  const av = clienteAvisadoAumento(c);
  const precio = precioParaCliente(c);
  const cambiados = aplicarPrecioAumento(precio);

  const col = av ? { bg: '#f0fdf4', bd: '#bbf7d0', tx: '#15803d' } : { bg: '#fff7ed', bd: '#fed7aa', tx: '#b45309' };
  el.style.cssText = 'display:block;font-size:11px;border-radius:6px;padding:6px 9px;margin-top:6px;line-height:1.55;' +
    'background:' + col.bg + ';border:1px solid ' + col.bd + ';color:' + col.tx;
  el.innerHTML =
    (av
      ? ic('check', 13) + ' <strong>Ya se le avisó del aumento</strong>' +
        (c.aviso_aumento_fecha ? ' (' + esc(c.aviso_aumento_fecha) + ')' : '') +
        ' — cobrale <strong>' + _fpp(precio) + '</strong> por esmalte.'
      : ic('alert', 13) + ' <strong>Todavía no se le avisó del aumento</strong> — cobrale <strong>' + _fpp(precio) +
        '</strong> por esmalte y avisale del nuevo precio de ' + _fpp(cfg.precioNuevo) + '.') +
    (cambiados ? '<br><span style="opacity:.8">Se ajustó el precio de ' + cambiados + ' renglón' + (cambiados > 1 ? 'es' : '') + '.</span>' : '') +
    '<div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
      (av
        ? '<button onclick="cambiarAvisoDesdeRemito(false)" style="font-size:10px;font-weight:600;border:1px solid ' + col.bd + ';background:#fff;color:' + col.tx + ';border-radius:6px;padding:3px 9px;cursor:pointer">Marcar como sin avisar</button>'
        : '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-weight:600">' +
            '<input type="checkbox" id="r-aviso-check" style="width:15px;height:15px;accent-color:#d97706;cursor:pointer"/>' +
            'Le avisé del aumento en esta visita' +
          '</label>') +
    '</div>' +
    (av ? '' : '<div style="font-size:10px;opacity:.75;margin-top:3px">Si lo tildás, en la próxima vuelta ya le va a figurar ' + _fpp(cfg.precioNuevo) + '.</div>');
}

/* Cambio manual desde el propio remito */
async function cambiarAvisoDesdeRemito(valor) {
  const c = window._clienteRemitoActual;
  if (!c || !c.num) { toast('Elegí un cliente primero'); return; }
  const ok = await setAvisoAumento(c.num, valor);
  if (ok) renderAvisoAumentoRemito(window._clienteRemitoActual);
}

/* Al guardar el remito: si tildó el casillero, queda marcado para la próxima */
async function guardarAvisoAumentoSiCorresponde() {
  const chk = document.getElementById('r-aviso-check');
  if (!chk || !chk.checked) return;
  const c = window._clienteRemitoActual;
  if (!c || !c.num) return;
  await setAvisoAumento(c.num, true, true);
}

/* ── Enganches ── */
(function () {
  const _selCliente_prev = window.seleccionarClienteRemito;
  window.seleccionarClienteRemito = function (idx) {
    const res = _selCliente_prev ? _selCliente_prev.apply(this, arguments) : undefined;
    try { renderAvisoAumentoRemito(window._clienteRemitoActual); } catch (e) {}
    return res;
  };

  const _limpiar_prev = window.limpiarClienteRemito;
  window.limpiarClienteRemito = function () {
    const res = _limpiar_prev ? _limpiar_prev.apply(this, arguments) : undefined;
    const el = document.getElementById('r-cs-aumento-warn');
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
    return res;
  };

  const _guardarRemito_prev = window.guardarRemitoEnDB;
  window.guardarRemitoEnDB = async function () {
    // Se marca antes de guardar: si el remito falla, la marca igual es válida
    try { await guardarAvisoAumentoSiCorresponde(); } catch (e) {}
    return _guardarRemito_prev ? await _guardarRemito_prev.apply(this, arguments) : undefined;
  };
})();

/* Config del aumento al abrir Configuraciones */
(function () {
  const _dash_prev = window.actualizarDashboard;
  window.actualizarDashboard = async function () {
    const res = _dash_prev ? await _dash_prev.apply(this, arguments) : undefined;
    try { await cargarAumentoDesdeDB(); pintarConfigAumento(); } catch (e) {}
    return res;
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => { try { cargarAumentoDesdeDB().then(pintarConfigAumento); } catch (e) {} }, 1200);
});
