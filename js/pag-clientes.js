/* ═══════════════════════════════════════════════════════════
   CLIENTES — listado con el buscador único: número, nombre,
   zona, dirección o dueño, todo en el mismo campo.
   ═══════════════════════════════════════════════════════════ */

var _clientes = [];
var _terminoCliente = '';
var _mostrarInactivos = false;
var _topeVisible = 60;   // se pinta de a tandas: son casi mil filas
var _agrupar = true;     // por hoja de ruta

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
      '<button class="btn btn-primario btn-bloque" style="margin-bottom:14px" onclick="nuevoCliente()">' +
        ic('plus', 16) + ' Nuevo cliente</button>' +
      '<div class="buscador" style="margin-bottom:14px">' +
        '<span class="ic-lupa">' + ic('search', 16) + '</span>' +
        '<input class="campo-input" id="q-clientes" type="search" autocomplete="off" ' +
               'placeholder="Ej: r14-0310, Farmacia Posik, chingolo, Belgrano 378" ' +
               'value="' + esc(_terminoCliente) + '" oninput="filtrarClientes(this.value)"/>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;flex-wrap:wrap">' +
        '<div id="cuenta-clientes" style="font-size:12px;color:var(--muted)"></div>' +
        '<label style="font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;cursor:pointer;margin-left:auto">' +
          '<input type="checkbox" onchange="alternarAgrupar(this.checked)"' + (_agrupar ? ' checked' : '') + '/> Por hoja de ruta' +
        '</label>' +
        '<label style="font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;cursor:pointer">' +
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

function alternarAgrupar(v) {
  _agrupar = v;
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

  if (_agrupar && !_terminoCliente) {
    cont.innerHTML = porHojaDeRuta(lista);
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
  return '<button class="fila" onclick="abrirFicha(\'' + esc(c.num) + '\')">' +
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
    '<div class="campo"><div class="campo-etiq">Rubro</div>' +
      '<select class="campo-input" id="nc-rubro">' +
        RUBROS.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') +
      '</select></div>' +
    '<div class="campo"><div class="campo-etiq">Localidad / zona</div>' +
      '<input class="campo-input" id="nc-loc" placeholder="Ciudad o partido"/></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Hoja de ruta</div>' +
        '<input class="campo-input" id="nc-ruta" type="number" min="0" placeholder="Ej: 14"/></div>' +
      '<div class="campo"><div class="campo-etiq">Exhibidores</div>' +
        '<input class="campo-input" id="nc-exhib" type="number" min="0" value="0"/></div>' +
    '</div>' +
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
      rubro: porId('nc-rubro').value,
      ruta: JSON.stringify({ orden: (porId('nc-ruta').value || '').trim(), horarios: [], notas: '' }),
      exhibidores: +porId('nc-exhib').value || 0,
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


/* ── Agrupado por hoja de ruta ───────────────────────────── */
function porHojaDeRuta(lista) {
  var grupos = {};
  lista.forEach(function (c) {
    var r = rutaDe(c) || 'sin';
    (grupos[r] = grupos[r] || []).push(c);
  });

  var claves = Object.keys(grupos).sort(function (a, b) {
    if (a === 'sin') return 1;
    if (b === 'sin') return -1;
    return (+a || 0) - (+b || 0);
  });

  /* Cuándo le toca a cada ruta, según el calendario */
  var proximaDe = {};
  calendarioRutas().forEach(function (e) {
    if (!proximaDe[e.ruta]) proximaDe[e.ruta] = e.iso;
  });
  var hoy = rutaDelDia();

  return claves.map(function (r) {
    var g = grupos[r];
    var exhibidores = g.reduce(function (s, c) { return s + (+c.exhibidores || 0); }, 0);
    var proxima = proximaDe[r];
    var esHoy = r !== 'sin' && String(r) === String(hoy);

    return '<details class="tarjeta"' + (esHoy ? ' open' : '') + '>' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' +
        ic('map', 16) + ' ' + (r === 'sin' ? 'Sin hoja de ruta' : 'Ruta ' + esc(r)) +
        (proxima && !esHoy ? ' <span class="campo-ayuda" style="font-weight:500;margin-left:6px">' + esc(fechaCorta(proxima)) + '</span>' : '') +
        '<span style="margin-left:auto;display:inline-flex;gap:6px;align-items:center">' +
          (esHoy ? '<span class="pin pin-ok">hoy</span>' : '') +
          (exhibidores ? '<span class="pin pin-info">' + exhibidores + ' exhib.</span>' : '') +
          '<span class="pin pin-neutro">' + plural(g.length, 'cliente') + '</span>' +
        '</span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo" style="padding:0">' +
        (r !== 'sin'
          ? '<div style="padding:10px 14px;border-bottom:1px solid var(--border)">' +
              '<button class="btn btn-secundario" style="font-size:12px;padding:6px 12px" ' +
                'onclick="editarHoja(\'' + esc(r) + '\')">' + ic('edit', 14) + ' Editar la hoja ' + esc(r) + '</button>' +
            '</div>'
          : '') +
        '<div class="lista" style="border:none;border-radius:0">' + g.map(filaCliente).join('') + '</div>' +
      '</div>' +
    '</details>';
  }).join('');
}


/* ═══════════════════════════════════════════════════════════
   EDITAR UNA HOJA DE RUTA
   Renumerarla o mandar todos sus clientes a otra hoja. Es lo que
   evita tener que abrir cliente por cliente.
   ═══════════════════════════════════════════════════════════ */
function editarHoja(ruta) {
  var g = _clientes.filter(function (c) { return String(rutaDe(c)) === String(ruta); });
  var exhib = g.reduce(function (a, c) { return a + (+c.exhibidores || 0); }, 0);
  var enCola = colaRutas().indexOf(String(ruta)) !== -1;
  var proxima = calendarioRutas().find(function (e) { return String(e.ruta) === String(ruta); });

  abrirModal('Hoja de ruta ' + ruta,
    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('users', 'Clientes', String(g.length), '', 'var(--rose)') +
      stat('box', 'Exhibidores', String(exhib), 'para toda la hoja', 'var(--info)') +
    '</div>' +

    (proxima
      ? avisoHTML('ok', 'En el calendario le toca el <strong>' + esc(fechaCorta(proxima.iso)) + '</strong>.', 'calendar')
      : avisoHTML('warn', 'Esta hoja no está en la cola de rutas. Se agrega en ' +
          '<a href="#/configuraciones">Configuraciones</a>.', 'map')) +

    '<div class="campo"><div class="campo-etiq">Número de la hoja</div>' +
      '<input class="campo-input" id="eh-numero" type="number" min="0" value="' + esc(ruta) + '"/>' +
      '<div class="campo-ayuda">Si lo cambiás, los ' + plural(g.length, 'cliente') + ' pasan a la hoja nueva.</div>' +
    '</div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">Exhibidores para todos</div>' +
      '<input class="campo-input" id="eh-exhib" type="number" min="0" placeholder="dejar como está"/>' +
      '<div class="campo-ayuda">Solo si querés ponerles a todos el mismo número.</div>' +
    '</div>' +
    '<div id="eh-estado"></div>',

    '<button class="btn btn-primario btn-bloque" onclick="guardarHoja(\'' + esc(ruta) + '\')">Guardar</button>');
}

async function guardarHoja(rutaVieja) {
  var nueva = (porId('eh-numero').value || '').trim();
  var exhibTxt = (porId('eh-exhib').value || '').trim();
  var exhib = exhibTxt === '' ? null : (+exhibTxt || 0);
  var estado = porId('eh-estado');

  if (!nueva) { toast('Poné el número de la hoja', 'error'); return; }
  if (nueva === String(rutaVieja) && exhib === null) { cerrarModal(); return; }

  var g = _clientes.filter(function (c) { return String(rutaDe(c)) === String(rutaVieja); });
  estado.innerHTML = cargando('Actualizando ' + plural(g.length, 'cliente') + '…');

  var fallos = 0;
  for (var i = 0; i < g.length; i++) {
    var c = g[i];
    var cambios = {};

    if (nueva !== String(rutaVieja)) {
      var actual = {};
      try { actual = typeof c.ruta === 'string' ? JSON.parse(c.ruta || '{}') : (c.ruta || {}); } catch (e) {}
      actual.orden = nueva;
      cambios.ruta = JSON.stringify(actual);
    }
    if (exhib !== null) cambios.exhibidores = exhib;

    try {
      await actualizar('clientes', c.num, cambios);
      Object.assign(c, cambios);
    } catch (e) { fallos++; }
  }

  invalidarCache('clientes');
  cerrarModal();
  toast(fallos ? 'Se actualizaron ' + (g.length - fallos) + ' de ' + g.length : 'Hoja actualizada');
  pintarRuta();
}

/* ═══════════════════════════════════════════════════════════
   FICHA DEL CLIENTE
   Todo lo que se puede cambiar, en una sola pantalla: en el
   celular no hay lugar para ir y venir entre menús.
   ═══════════════════════════════════════════════════════════ */
var FC = null;

function abrirFicha(num) {
  var c = _clientes.find(function (x) { return String(x.num) === String(num); });
  if (!c) return;
  FC = { ruta: rutaDe(c), original: c };

  abrirModal((c.num_str || c.num) + ' · ' + (c.local || 'Cliente'), cuerpoFicha(c),
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:150px" onclick="guardarFicha()">Guardar cambios</button>' +
      '<button class="btn btn-secundario" onclick="cerrarModal();irA(\'remito\',\'cliente=' + esc(c.num) + '\')">' +
        ic('receipt', 15) + ' Remito</button>' +
    '</div>');
}

function cuerpoFicha(c) {
  var proxima = calendarioRutas().find(function (e) { return String(e.ruta) === String(FC.ruta); });

  return '<div class="campo"><div class="campo-etiq">Nombre del local</div>' +
      '<input class="campo-input" id="fc-local" value="' + esc(c.local || '') + '"/></div>' +

    '<div class="campo"><div class="campo-etiq">Dirección</div>' +
      '<input class="campo-input" id="fc-dir" value="' + esc(c.dir || '') + '"/></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Localidad</div>' +
        '<input class="campo-input" id="fc-loc" value="' + esc(c.loc || '') + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">Teléfono</div>' +
        '<input class="campo-input" id="fc-tel" inputmode="tel" value="' + esc(c.tel || '') + '"/></div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Dueño</div>' +
        '<input class="campo-input" id="fc-duenio" value="' + esc(c.duenio || '') + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">Rubro</div>' +
        '<select class="campo-input" id="fc-rubro">' +
          '<option value="">—</option>' +
          RUBROS.map(function (r) {
            return '<option' + (normalizar(r) === normalizar(c.rubro) ? ' selected' : '') + '>' + esc(r) + '</option>';
          }).join('') +
        '</select></div>' +
    '</div>' +

    '<div class="campo-etiq" style="margin-top:6px">Hoja de ruta</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
      '<div class="campo" style="margin:0"><div class="campo-etiq">Ruta</div>' +
        '<input class="campo-input" id="fc-ruta" type="number" min="0" value="' + esc(FC.ruta) + '" ' +
               'oninput="FC.ruta=this.value;refrescarProxima()"/></div>' +
      '<div class="campo" style="margin:0"><div class="campo-etiq">Exhibidores</div>' +
        '<input class="campo-input" id="fc-exhib" type="number" min="0" value="' + (+c.exhibidores || 0) + '"/></div>' +
      '<div class="campo" style="margin:0"><div class="campo-etiq">Avisar antes</div>' +
        '<input class="campo-input" id="fc-avisar" type="number" min="0" value="' + (+c.avisar_antes || 0) + '"/></div>' +
    '</div>' +
    '<div class="campo-ayuda" id="fc-proxima" style="margin-bottom:12px">' + textoProxima(proxima) + '</div>' +

    '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px">' +
      '<input type="checkbox" id="fc-activo"' + (clienteActivo(c) ? ' checked' : '') + '/> Cliente activo' +
    '</label>' +

    '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">' +
      '<input type="checkbox" id="fc-aviso"' + (clienteAvisado(c) ? ' checked' : '') + '/> ' +
      'Ya se le avisó del aumento' +
      (c.aviso_aumento_fecha ? ' <span class="campo-ayuda">(' + esc(fechaCorta(c.aviso_aumento_fecha)) + ')</span>' : '') +
    '</label>';
}

function textoProxima(p) {
  return (p ? 'Le toca el ' + esc(fechaCorta(p.iso)) : 'Esa hoja no está en el calendario') +
    ' · avisar antes: días de anticipación, 0 = no hace falta';
}

function refrescarProxima() {
  var el = porId('fc-proxima');
  if (!el) return;
  el.innerHTML = textoProxima(calendarioRutas().find(function (e) { return String(e.ruta) === String(FC.ruta); }));
}

async function guardarFicha() {
  var c = FC.original;
  var cambios = {};
  var texto = { local: 'fc-local', dir: 'fc-dir', loc: 'fc-loc', tel: 'fc-tel', duenio: 'fc-duenio' };

  Object.keys(texto).forEach(function (k) {
    var v = (porId(texto[k]).value || '').trim();
    if (v !== (c[k] || '')) cambios[k] = v || null;
  });

  var rubro = porId('fc-rubro').value;
  if (rubro !== (c.rubro || '')) cambios.rubro = rubro || null;

  var exhib = +porId('fc-exhib').value || 0;
  if (exhib !== (+c.exhibidores || 0)) cambios.exhibidores = exhib;

  var avisar = +porId('fc-avisar').value || 0;
  if (avisar !== (+c.avisar_antes || 0)) cambios.avisar_antes = avisar;

  var activo = porId('fc-activo').checked;
  if (activo !== clienteActivo(c)) cambios.activo = activo;

  var aviso = porId('fc-aviso').checked;
  if (aviso !== clienteAvisado(c)) {
    cambios.aviso_aumento = aviso;
    cambios.aviso_aumento_fecha = aviso ? hoyISO() : null;
  }

  /* La ruta vive adentro del jsonb: se reescribe conservando el resto */
  var rutaNueva = (porId('fc-ruta').value || '').trim();
  if (rutaNueva !== rutaDe(c)) {
    var actual = {};
    try { actual = typeof c.ruta === 'string' ? JSON.parse(c.ruta || '{}') : (c.ruta || {}); } catch (e) {}
    actual.orden = rutaNueva;
    cambios.ruta = JSON.stringify(actual);
  }

  if (!Object.keys(cambios).length) { cerrarModal(); return; }

  try {
    await actualizar('clientes', c.num, cambios);
    Object.assign(c, cambios);
    invalidarCache('clientes');
    cerrarModal();
    toast('Cliente actualizado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
