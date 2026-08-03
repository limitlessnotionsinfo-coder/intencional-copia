/* ═══════════════════════════════════════════════════════════
   UI — helpers que usa todo el resto: escapado, formatos,
   toast, atajos de DOM. Sin dependencias.
   ═══════════════════════════════════════════════════════════ */

/* ── DOM ─────────────────────────────────────────────────── */
function $(sel, raiz) { return (raiz || document).querySelector(sel); }
function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
function porId(id) { return document.getElementById(id); }

/* ── Escapado: TODO lo que venga de la base pasa por acá ─── */
function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ── Plata ───────────────────────────────────────────────── */
function plata(n) {
  return '$' + (+n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function plataCorta(n) {
  var v = +n || 0;
  if (Math.abs(v) >= 1000000) return '$' + (v / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + 'M';
  if (Math.abs(v) >= 10000)   return '$' + Math.round(v / 1000) + 'k';
  return plata(v);
}

/* ── Fechas ──────────────────────────────────────────────────
   La base guarda las fechas de remitos/gastos como texto en
   dd/mm/aa. Estas funciones aguantan ese formato, el de cuatro
   dígitos y el ISO, sin romperse con ninguno.
   ────────────────────────────────────────────────────────── */
function hoyTexto() {
  var d = new Date();
  return dosDig(d.getDate()) + '/' + dosDig(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2);
}
function hoyISO() {
  var d = new Date();
  return d.getFullYear() + '-' + dosDig(d.getMonth() + 1) + '-' + dosDig(d.getDate());
}
function dosDig(n) { return String(n).padStart(2, '0'); }

/* Devuelve {a,m,d} o null. Acepta 2026-08-02, 02/08/26 y 02/08/2026 */
function partesFecha(valor) {
  if (!valor) return null;
  var s = String(valor).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return { a: +m[1], m: +m[2], d: +m[3] };
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    var a = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
    return { a: a, m: +m[2], d: +m[1] };
  }
  return null;
}
/* Clave ordenable aaaa-mm-dd; sirve para comparar y agrupar */
function claveFecha(valor) {
  var p = partesFecha(valor);
  return p ? p.a + '-' + dosDig(p.m) + '-' + dosDig(p.d) : '';
}
function claveMes(valor) {
  var p = partesFecha(valor);
  return p ? p.a + '-' + dosDig(p.m) : '';
}
function fechaCorta(valor) {
  var p = partesFecha(valor);
  return p ? dosDig(p.d) + '/' + dosDig(p.m) + '/' + String(p.a).slice(2) : '';
}
var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function fechaLarga(valor) {
  var p = partesFecha(valor);
  return p ? p.d + ' de ' + MESES[p.m - 1] + ' de ' + p.a : '';
}
function diasEntre(desde, hasta) {
  var a = partesFecha(desde), b = partesFecha(hasta);
  if (!a || !b) return null;
  var ms = Date.UTC(b.a, b.m - 1, b.d) - Date.UTC(a.a, a.m - 1, a.d);
  return Math.round(ms / 86400000);
}

/* ── Montos con separador de miles ───────────────────────────
   Los inputs de plata son de texto, no de tipo number: así se
   pueden mostrar los puntos mientras se escribe.
   ────────────────────────────────────────────────────────── */
function soloDigitos(v) { return String(v == null ? '' : v).replace(/[^0-9]/g, ''); }

function conMiles(v) {
  var d = soloDigitos(v);
  if (!d) return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* Formatea mientras se escribe sin que salte el cursor al final */
function fmtMonto(input) {
  var antes = input.value;
  var pos = input.selectionStart;
  var digitosAntes = soloDigitos(antes.slice(0, pos)).length;

  var formateado = conMiles(antes);
  input.value = formateado;

  /* Reubica el cursor contando dígitos, no caracteres */
  var i = 0, vistos = 0;
  while (i < formateado.length && vistos < digitosAntes) {
    if (/[0-9]/.test(formateado[i])) vistos++;
    i++;
  }
  try { input.setSelectionRange(i, i); } catch (e) {}
  return formateado;
}

/* Devuelve el número que hay adentro de un input formateado */
function leerMonto(id) {
  var el = typeof id === 'string' ? porId(id) : id;
  return el ? (+soloDigitos(el.value) || 0) : 0;
}

/* Input de plata listo para usar */
function inputMonto(id, valor, extra) {
  return '<input class="campo-input" id="' + id + '" type="text" inputmode="numeric" ' +
    'value="' + conMiles(valor || '') + '" oninput="fmtMonto(this)' + (extra ? ';' + extra : '') + '"/>';
}

/* ── Texto ───────────────────────────────────────────────── */
/* Normaliza para buscar: sin tildes, sin mayúsculas, sin dobles espacios */
function normalizar(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function plural(n, singular, plural_) {
  return n + ' ' + (n === 1 ? singular : (plural_ || singular + 's'));
}

/* Booleano tolerante: Postgres devuelve true/false, pero un CSV
   reimportado o un jsonb pueden traer "false" como texto, que en
   JavaScript es verdadero. Todo lo que sea booleano pasa por acá. */
function bool(v) {
  if (v === true) return true;
  if (v === false || v === null || v === undefined) return false;
  var s = String(v).trim().toLowerCase();
  return s === 'true' || s === 't' || s === '1' || s === 'si' || s === 'sí';
}

/* ── Toast ───────────────────────────────────────────────── */
var _toastTimer = null;
function toast(mensaje, tipo) {
  var el = porId('toast');
  if (!el) return;
  el.textContent = mensaje;
  el.className = 'toast visible' + (tipo === 'error' ? ' error' : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function () { el.className = 'toast'; }, tipo === 'error' ? 4200 : 2600);
}

/* ── Bloques reutilizables ───────────────────────────────── */
function cargando(texto) {
  return '<div class="cargando"><span class="girador"></span>' + esc(texto || 'Cargando…') + '</div>';
}
function vacio(icono, titulo, texto, accionHTML) {
  return '<div class="vacio">' + ic(icono, 30) +
    '<div class="vacio-titulo">' + esc(titulo) + '</div>' +
    (texto ? '<p>' + esc(texto) + '</p>' : '') +
    (accionHTML || '') + '</div>';
}
function avisoHTML(tipo, contenidoHTML, icono) {
  return '<div class="aviso aviso-' + tipo + '">' + ic(icono || 'alert', 15) +
    '<div>' + contenidoHTML + '</div></div>';
}

/* ── Modal ───────────────────────────────────────────────── */
function abrirModal(titulo, cuerpoHTML, pieHTML) {
  var m = porId('modal');
  m.innerHTML =
    '<div class="modal-caja" role="dialog" aria-modal="true" aria-label="' + esc(titulo) + '">' +
      '<div class="modal-cab">' +
        '<div class="modal-titulo">' + esc(titulo) + '</div>' +
        '<button class="btn btn-fantasma" style="padding:2px 6px" aria-label="Cerrar" onclick="cerrarModal()">✕</button>' +
      '</div>' +
      '<div class="modal-cuerpo">' + cuerpoHTML + '</div>' +
      (pieHTML ? '<div class="modal-pie">' + pieHTML + '</div>' : '') +
    '</div>';
  m.className = 'modal visible';
  document.body.style.overflow = 'hidden';
  var primero = m.querySelector('input,select,textarea,button');
  if (primero) primero.focus();
}

function cerrarModal() {
  var m = porId('modal');
  m.className = 'modal';
  m.innerHTML = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') cerrarModal();
});

/* Selector de mes, compartido por las pantallas de plata */
function selectorMes(nombreVar, filas, alCambiar) {
  var meses = {};
  (filas || []).forEach(function (f) {
    var m = claveMes(f.fecha || f.created_at);
    if (m) meses[m] = 1;
  });
  meses[claveMes(hoyTexto())] = 1;
  return '<select class="campo-input" style="width:auto" onchange="' + nombreVar + '=this.value;' + alCambiar + '()">' +
    Object.keys(meses).sort().reverse().map(function (m) {
      var p = m.split('-');
      var sel = window[nombreVar] === m ? ' selected' : '';
      return '<option value="' + m + '"' + sel + '>' +
        MESES[+p[1] - 1].charAt(0).toUpperCase() + MESES[+p[1] - 1].slice(1) + ' ' + p[0] + '</option>';
    }).join('') + '</select>';
}
