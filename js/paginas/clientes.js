/* ═══════════════════════════════════════════════════════════
   CLIENTES — listado con el buscador único: número, nombre,
   zona, dirección o dueño, todo en el mismo campo.
   ═══════════════════════════════════════════════════════════ */

var _clientes = [];
var _terminoCliente = '';
var _mostrarInactivos = false;
var _topeVisible = 60;   // se pinta de a tandas: son casi mil filas

registrarPagina({
  id: 'clientes',
  menu: 'Clientes',
  grupo: 'Día a día',
  icono: 'users',
  titulo: 'Clientes',
  subtitulo: 'Buscá por número, nombre, zona o dirección',

  async montar(cont, params) {
    _terminoCliente = params.get('q') || '';
    _topeVisible = 60;
    _clientes = await traerCacheado('clientes');

    cont.innerHTML =
      '<div class="buscador" style="margin-bottom:14px">' +
        '<span class="ic-lupa">' + ic('search', 16) + '</span>' +
        '<input class="campo-input" id="q-clientes" type="search" autocomplete="off" ' +
               'placeholder="Ej: r14-0310, Farmacia Posik, chingolo, Belgrano 378" ' +
               'value="' + esc(_terminoCliente) + '" oninput="filtrarClientes(this.value)"/>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;flex-wrap:wrap">' +
        '<div id="cuenta-clientes" style="font-size:12px;color:var(--muted)"></div>' +
        '<label style="font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;cursor:pointer;margin-left:auto">' +
          '<input type="checkbox" onchange="alternarInactivos(this.checked)"' + (_mostrarInactivos ? ' checked' : '') + '/> Ver inactivos' +
        '</label>' +
      '</div>' +
      '<div id="lista-clientes"></div>';

    pintarClientes();
  }
});

function filtrarClientes(v) {
  _terminoCliente = v;
  _topeVisible = 60;
  pintarClientes();
}

function alternarInactivos(v) {
  _mostrarInactivos = v;
  _topeVisible = 60;
  pintarClientes();
}

function clientesFiltrados() {
  return _clientes.filter(function (c) {
    if (!_mostrarInactivos && !clienteActivo(c)) return false;
    return coincideCliente(c, _terminoCliente);
  });
}

function pintarClientes() {
  var lista = clientesFiltrados();
  var cuenta = porId('cuenta-clientes');
  if (cuenta) {
    cuenta.textContent = _terminoCliente
      ? plural(lista.length, 'resultado') + ' de ' + _clientes.length
      : plural(lista.length, 'cliente');
  }

  var cont = porId('lista-clientes');
  if (!cont) return;

  if (!lista.length) {
    cont.innerHTML = _terminoCliente
      ? vacio('search', 'Sin resultados para “' + _terminoCliente + '”', 'Probá con el número de cliente, la zona o parte de la dirección.')
      : vacio('users', 'Todavía no hay clientes', 'Cuando cargues el primero va a aparecer acá.');
    return;
  }

  var visibles = lista.slice(0, _topeVisible);
  cont.innerHTML =
    '<div class="lista">' + visibles.map(filaCliente).join('') + '</div>' +
    (lista.length > _topeVisible
      ? '<button class="btn btn-secundario btn-bloque" style="margin-top:12px" onclick="verMasClientes()">' +
          'Ver ' + Math.min(60, lista.length - _topeVisible) + ' más de ' + (lista.length - _topeVisible) +
        '</button>'
      : '');
}

function verMasClientes() { _topeVisible += 60; pintarClientes(); }

function filaCliente(c) {
  var ruta = rutaDe(c);
  return '<button class="fila" onclick="irA(\'cliente\',\'num=' + encodeURIComponent(c.num) + '\')">' +
    '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(c.local || 'Sin nombre') +
        (!clienteActivo(c) ? ' <span class="pin pin-neutro">Inactivo</span>' : '') +
      '</div>' +
      '<div class="fila-sub">' +
        [c.loc, c.dir, ruta ? 'Ruta ' + ruta : ''].filter(Boolean).map(esc).join(' · ') +
      '</div>' +
    '</div>' +
    (c.aviso_aumento
      ? '<span class="pin pin-ok">' + ic('check', 12) + ' Avisado</span>'
      : '') +
  '</button>';
}

/* ── Alta rápida de cliente ──────────────────────────────── */
function nuevoCliente() {
  abrirModal('Nuevo cliente',
    '<div class="campo"><div class="campo-etiq">Nombre del local</div>' +
      '<input class="campo-input" id="nc-local" placeholder="Ej: Perfumería Sol"/></div>' +
    '<div class="campo"><div class="campo-etiq">Dirección</div>' +
      '<input class="campo-input" id="nc-dir" placeholder="Calle y número"/></div>' +
    '<div class="campo"><div class="campo-etiq">Localidad / zona</div>' +
      '<input class="campo-input" id="nc-loc" placeholder="Ciudad o partido"/></div>' +
    '<div class="campo"><div class="campo-etiq">Teléfono</div>' +
      '<input class="campo-input" id="nc-tel" inputmode="tel" placeholder="11-1234-5678"/></div>' +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Dueño (opcional)</div>' +
      '<input class="campo-input" id="nc-duenio"/></div>',
    '<button class="btn btn-primario btn-bloque" onclick="guardarNuevoCliente()">Guardar cliente</button>');
}

async function guardarNuevoCliente() {
  var local = (porId('nc-local').value || '').trim();
  if (!local) { toast('Escribí el nombre del local', 'error'); return; }
  try {
    var todos = await traerCacheado('clientes');
    var siguiente = todos.reduce(function (m, c) { return Math.max(m, +c.num || 0); }, 0) + 1;
    await crear('clientes', {
      num: siguiente,
      num_str: String(siguiente),
      local: local,
      dir: (porId('nc-dir').value || '').trim() || null,
      loc: (porId('nc-loc').value || '').trim() || null,
      tel: (porId('nc-tel').value || '').trim() || null,
      duenio: (porId('nc-duenio').value || '').trim() || null,
      fecha: hoyTexto(),
      activo: true,
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Cliente guardado con el número ' + siguiente);
    irA('clientes');
  } catch (e) { toast(e.message, 'error'); }
}
