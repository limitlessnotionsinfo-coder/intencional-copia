/* ═══════════════════════════════════════════════════════════
   CLIENTES — listado con el buscador único: número, nombre,
   zona, dirección o dueño, todo en el mismo campo.
   ═══════════════════════════════════════════════════════════ */

var _clientes = [];
var _terminoCliente = '';
var _estadoCliente = 'activos';   // activos · inactivos · todos
var _topeVisible = 60;   // se pinta de a tandas: son casi mil filas
var _agrupar = true;     // por hoja de ruta
var _rutaFiltro = '';    // ver una sola hoja, desde el inicio

registrarPagina({
  id: 'clientes',
  menu: 'Clientes',
  grupo: 'Día a día',
  icono: 'users',
  titulo: 'Clientes',
  subtitulo: 'Buscá por número, nombre, zona o dirección',

  async montar(cont, params) {
    _rutaFiltro = params.get('ruta') || '';
    _terminoCliente = params.get('q') || '';
    _topeVisible = 60;
    _clientes = await traerCacheado('clientes');

    cont.innerHTML =
      (_rutaFiltro
        ? '<div class="aviso aviso-ok" style="margin-bottom:14px">' + ic('map', 15) +
          '<div>Estás viendo la <strong>hoja de ruta ' + esc(_rutaFiltro) + '</strong> ' +
          '<button class="btn btn-fantasma" style="padding:0 4px;text-decoration:underline" ' +
                  'onclick="verTodasLasHojas()">ver todas</button></div></div>'
        : '') +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
        '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="nuevoCliente()">' +
          ic('plus', 16) + ' Nuevo cliente</button>' +
        '<button class="btn btn-secundario" onclick="revisarDuplicados()">' +
          ic('users', 15) + ' Revisar duplicados</button>' +
      '</div>' +
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
      '</div>' +

      '<div id="chips-clientes" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"></div>' +
      '<div id="lista-clientes"></div>';

    pintarChipsClientes();
    pintarClientes();
  }
});

function filtrarClientes(v) {
  _terminoCliente = v;
  _topeVisible = 60;
  pintarClientes();
}

function verTodasLasHojas() { irA('clientes', 'ruta='); }

function alternarAgrupar(v) {
  _agrupar = v;
  _topeVisible = 60;
  pintarClientes();
}

/* Los inactivos tienen su propia vista: son los que se dieron de
   baja o a los que se les retiró el exhibidor. */
function setEstadoCliente(v) {
  _estadoCliente = v;
  _topeVisible = 60;
  pintarChipsClientes();
  pintarClientes();
}

function pintarChipsClientes() {
  var cont = porId('chips-clientes');
  if (!cont) return;
  var inactivos = _clientes.filter(function (c) { return !clienteActivo(c); }).length;

  cont.innerHTML = [
    ['activos', 'Activos', _clientes.length - inactivos],
    ['inactivos', 'Inactivos', inactivos],
    ['todos', 'Todos', _clientes.length]
  ].map(function (o) {
    return '<button class="btn ' + (_estadoCliente === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
      'style="padding:6px 13px;font-size:12.5px" onclick="setEstadoCliente(\'' + o[0] + '\')">' +
      esc(o[1]) + ' <span class="pin pin-neutro" style="margin-left:2px">' + o[2] + '</span></button>';
  }).join('');
}

function clientesFiltrados() {
  return _clientes.filter(function (c) {
    if (_estadoCliente === 'activos' && !clienteActivo(c)) return false;
    if (_estadoCliente === 'inactivos' && clienteActivo(c)) return false;
    if (_rutaFiltro && String(rutaDe(c)) !== String(_rutaFiltro)) return false;
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

  if (_agrupar && !_terminoCliente && _estadoCliente !== 'inactivos') {
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
function nuevoCliente(rutaFija) {
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
        '<input class="campo-input" id="nc-ruta" type="number" min="0" placeholder="Ej: 14" ' +
               'value="' + esc(rutaFija || '') + '"/></div>' +
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
    var ruta = (porId('nc-ruta').value || '').trim();
    /* El código identifica al cliente dentro de su hoja: R4-0010 */
    var codigo = ruta ? codigoCliente(ruta, siguienteEnRuta(todos, ruta)) : String(siguiente);
    await crear('clientes', {
      num: siguiente,
      num_str: codigo,
      local: local,
      dir: (porId('nc-dir').value || '').trim() || null,
      loc: (porId('nc-loc').value || '').trim() || null,
      rubro: porId('nc-rubro').value,
      ruta: JSON.stringify({ orden: ruta, horarios: [], notas: '' }),
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

    return '<details class="tarjeta">' +
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
          ? '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid var(--border)">' +
              '<button class="btn btn-secundario" style="font-size:12px;padding:6px 12px" ' +
                'onclick="editarHoja(\'' + esc(r) + '\')">' + ic('edit', 14) + ' Editar hoja</button>' +
              '<button class="btn btn-secundario" style="font-size:12px;padding:6px 12px" ' +
                'onclick="nuevoCliente(\'' + esc(r) + '\')">' + ic('plus', 14) + ' Cliente acá</button>' +
              '<button class="btn btn-secundario" style="font-size:12px;padding:6px 12px" ' +
                'onclick="moverClientes(\'' + esc(r) + '\')">' + ic('shuffle', 14) + ' Mover clientes</button>' +
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

    '<div class="campo"><div class="campo-etiq">Exhibidores para todos</div>' +
      '<input class="campo-input" id="eh-exhib" type="number" min="0" placeholder="dejar como está"/>' +
      '<div class="campo-ayuda">Solo si querés ponerles a todos el mismo número.</div>' +
    '</div>' +

    '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:6px">' +
      '<input type="checkbox" id="eh-renumerar"/> Renumerar los códigos de 1 en adelante' +
    '</label>' +
    '<div class="campo-ayuda" style="margin-bottom:8px">' +
      'Quedarían ' + esc(codigoCliente(ruta, 1)) + ' … ' + esc(codigoCliente(ruta, g.length)) + ', ' +
      'en el orden en que están listados. Sirve cuando quedaron huecos por bajas.' +
    '</div>' +
    '<div id="eh-estado"></div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarHoja(\'' + esc(ruta) + '\')">Guardar</button>' +
      '<button class="btn btn-peligro" onclick="cerrarModal();borrarHoja(\'' + esc(ruta) + '\')">' +
        ic('trash', 15) + ' Borrar hoja</button>' +
    '</div>');
}

async function guardarHoja(rutaVieja) {
  var nueva = (porId('eh-numero').value || '').trim();
  var exhibTxt = (porId('eh-exhib').value || '').trim();
  var exhib = exhibTxt === '' ? null : (+exhibTxt || 0);
  var renumerar = porId('eh-renumerar').checked;
  var estado = porId('eh-estado');

  if (!nueva) { toast('Poné el número de la hoja', 'error'); return; }
  if (nueva === String(rutaVieja) && exhib === null && !renumerar) { cerrarModal(); return; }

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

    /* El código sigue a la hoja: cambia el prefijo o se renumera */
    var codigo = renumerar
      ? codigoCliente(nueva, i + 1)
      : codigoCliente(nueva, correlativoDe(c) || i + 1);
    if (codigo && codigo !== c.num_str) cambios.num_str = codigo;

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

  abrirModal((c.num_str || c.num) + ' · ' + (c.local || 'Cliente'),
    cuerpoFicha(c) + '<div id="fc-remitos" style="margin-top:16px">' + cargando('Buscando sus remitos…') + '</div>',
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarFicha()">Guardar cambios</button>' +
      '<button class="btn btn-secundario" onclick="cerrarModal();irA(\'remito\',\'cliente=' + esc(c.num) + '\')">' +
        ic('receipt', 15) + ' Remito</button>' +
      '<button class="btn btn-secundario" onclick="alternarBaja()">' +
        ic(clienteActivo(c) ? 'ban' : 'undo', 15) + ' ' + (clienteActivo(c) ? 'Dar de baja' : 'Reactivar') + '</button>' +
      '<button class="btn btn-peligro" onclick="confirmarBorrarCliente()">' + ic('trash', 15) + ' Borrar</button>' +
    '</div>');

  cargarRemitosDeFicha(c);
}

function cuerpoFicha(c) {
  var proxima = calendarioRutas().find(function (e) { return String(e.ruta) === String(FC.ruta); });

  return '<div class="aviso aviso-ok" style="margin-bottom:14px">' + ic('tag', 15) +
      '<div>Código <strong>' + esc(c.num_str || '—') + '</strong>' +
      (leerCodigo(c.num_str) ? '' : ' <span class="campo-ayuda">— se arma solo al ponerle una hoja de ruta</span>') +
      '</div></div>' +

    '<div class="campo"><div class="campo-etiq">Nombre del local</div>' +
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

/* Los remitos del cliente se buscan aparte: la ficha se abre al
   toque y el historial llega un segundo después. */
async function cargarRemitosDeFicha(c) {
  var cont = porId('fc-remitos');
  if (!cont) return;
  try {
    var suyos = await traerTodo('remitos', 'cliente_nombre=eq.' + encodeURIComponent(c.local || ''));
    if (!porId('fc-remitos') || !FC || FC.original.num !== c.num) return;   // cerró o cambió de cliente
    cont.innerHTML = bloqueRemitosFicha(c, suyos);
  } catch (e) {
    cont.innerHTML = '<div class="campo-ayuda">No se pudieron cargar los remitos: ' + esc(e.message) + '</div>';
  }
}

function bloqueRemitosFicha(c, suyos) {
  if (!suyos.length) {
    return '<div class="campo-ayuda">Todavía no tiene remitos cargados.</div>';
  }

  /* Los más nuevos primero */
  var lista = suyos.slice().sort(function (a, b) {
    return claveFecha(b.fecha || b.created_at).localeCompare(claveFecha(a.fecha || a.created_at));
  });

  var visitas = lista.filter(function (r) { return r.motivo !== 'cerrado'; });
  var cerrados = lista.filter(function (r) { return r.motivo === 'cerrado'; });
  var res = resumirRemitos(visitas);
  var demora = demoraPromedio(lista);
  var rep = ultimaReposicion(c.local, lista);

  return '<details class="tarjeta" style="margin:0">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('clipboard', 16) + ' Remitos' +
      '<span style="margin-left:auto;display:inline-flex;gap:6px;align-items:center">' +
        '<span class="pin pin-neutro">' + plural(visitas.length, 'remito') + '</span>' +
        '<strong>' + plata(res.facturado) + '</strong>' +
      '</span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +

      '<div class="grilla-stats" style="margin-bottom:12px">' +
        stat('receipt', 'Facturado', plata(res.facturado), plural(res.unidades, 'unidad', 'unidades'), 'var(--rose)') +
        (res.deuda > 0
          ? stat('clock', 'Debe', plata(res.deuda), '', 'var(--warn)')
          : stat('check', 'Deuda', 'Al día', '', 'var(--ok)')) +
        (rep
          ? stat('calendar', 'Última', fechaCorta(rep.fecha),
                 rep.dias === 0 ? 'hoy' : rep.dias === 1 ? 'ayer' : 'hace ' + plural(rep.dias, 'día'), 'var(--violet)')
          : '') +
        (demora
          ? stat('scale', 'Tarda en pagar', plural(demora.promedio, 'día'),
                 'promedio de ' + plural(demora.veces, 'deuda') + ' · peor: ' + plural(demora.peor, 'día'), 'var(--text2)')
          : '') +
      '</div>' +

      (cerrados.length
        ? '<div class="campo-ayuda" style="margin-bottom:8px">' +
          plural(cerrados.length, 'vez', 'veces') + ' estaba cerrado.</div>'
        : '') +

      '<div class="lista">' +
        lista.slice(0, 25).map(function (r) {
          var d = demoraDePago(r);
          return '<div class="fila" style="cursor:default">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(fechaCorta(r.fecha)) +
                (r.motivo === 'cerrado' ? ' <span class="pin pin-neutro">cerrado</span>' : '') + '</div>' +
              '<div class="fila-sub">' +
                (r.unidades ? plural(+r.unidades, 'unidad', 'unidades') : '—') +
                (r.notas ? ' · ' + esc(r.notas) : '') + '</div>' +
            '</div>' +
            '<div class="fila-derecha">' +
              '<div class="fila-titulo">' + plata(r.total) + '</div>' +
              '<div style="margin-top:4px">' + pagoHTML(r) +
                (d !== null ? ' <span class="pin pin-ok">pagó en ' + plural(d, 'día') + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      (lista.length > 25
        ? '<div class="campo-ayuda" style="margin-top:8px">Se muestran los últimos 25 de ' + lista.length + '.</div>'
        : '') +

      '<button class="btn btn-secundario btn-bloque" style="margin-top:12px" ' +
        'onclick="cerrarModal();irA(\'hechos\',\'q=' + encodeURIComponent(c.local || '') + '\')">' +
        ic('search', 15) + ' Abrirlos en Remitos hechos</button>' +
    '</div>' +
  '</details>';
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

/* Dar de baja no borra nada: el cliente deja de aparecer en las
   listas pero sus remitos y su historial quedan intactos. */
async function alternarBaja() {
  var c = FC.original;
  var nuevo = !clienteActivo(c);
  try {
    await actualizar('clientes', c.num, { activo: nuevo });
    c.activo = nuevo;
    invalidarCache('clientes');
    cerrarModal();
    toast(nuevo ? 'Cliente reactivado' : 'Cliente dado de baja');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

function confirmarBorrarCliente() {
  var c = FC.original;
  abrirModal('Borrar ' + (c.local || 'el cliente'),
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se borra la ficha de <strong>' + esc(c.local) + '</strong> (' + esc(c.num_str || c.num) + '). ' +
      'No se puede deshacer.</p>' +
    avisoHTML('warn',
      'Sus remitos <strong>no</strong> se borran: quedan en el historial con el nombre del local. ' +
      'Si solo querés que deje de aparecer en las listas, conviene darlo de baja.', 'alert'),
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-peligro" style="flex:1;min-width:120px" onclick="borrarCliente()">Sí, borrarlo</button>' +
      '<button class="btn btn-secundario" onclick="abrirFicha(\'' + esc(c.num) + '\')">Volver</button>' +
    '</div>');
}

async function borrarCliente() {
  var c = FC.original;
  try {
    await borrar('clientes', c.num);
    invalidarCache('clientes');
    cerrarModal();
    toast('Cliente borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
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
    /* Al mudarse de hoja le toca un lugar nuevo en esa hoja */
    if (rutaNueva) cambios.num_str = codigoParaRutaNueva(_clientes, rutaNueva, c);
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


/* ═══════════════════════════════════════════════════════════
   DUPLICADOS
   El nombre no alcanza: hay varias perfumerías con el mismo
   nombre y hay clientes con más de una sucursal. Lo que decide
   es la dirección, la localidad y el teléfono.
   ═══════════════════════════════════════════════════════════ */
function revisarDuplicados() {
  var pares = buscarDuplicados(_clientes);
  var seguros = pares.filter(function (p) { return p.nivel === 'seguro'; });
  var posibles = pares.filter(function (p) { return p.nivel === 'posible'; });
  var sucursales = pares.filter(function (p) { return p.nivel === 'sucursal'; });

  if (!pares.length) {
    abrirModal('Revisar duplicados',
      avisoHTML('ok', 'No encontré clientes repetidos entre los ' + _clientes.length + ' cargados.', 'check'));
    return;
  }

  abrirModal('Revisar duplicados',
    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('alert', 'Repetidos', String(seguros.length), 'misma dirección', 'var(--danger)') +
      stat('search', 'Para revisar', String(posibles.length), 'faltan datos', 'var(--warn)') +
      stat('store', 'Sucursales', String(sucursales.length), 'mismo dueño', 'var(--info)') +
    '</div>' +

    grupoDuplicados('Seguramente repetidos', seguros,
      'Misma dirección en la misma localidad: es el mismo local cargado dos veces.') +
    grupoDuplicados('Para revisar a mano', posibles,
      'Coinciden en algo pero faltan datos para estar seguro.') +
    grupoDuplicados('Parecen sucursales', sucursales,
      'Mismo teléfono pero direcciones distintas: probablemente el mismo dueño con dos locales. No conviene borrarlos.'));
}

function grupoDuplicados(titulo, pares, ayuda) {
  if (!pares.length) return '';
  return '<div class="eyebrow" style="margin-top:14px">' + esc(titulo) + '</div>' +
    '<div class="campo-ayuda" style="margin-bottom:8px">' + esc(ayuda) + '</div>' +
    '<div class="lista">' +
      pares.slice(0, 30).map(function (p) {
        return '<div class="fila" style="cursor:default;flex-direction:column;align-items:stretch;gap:6px">' +
          [p.a, p.b].map(function (c) {
            return '<button class="fila" style="padding:6px 0;border:none;background:none" ' +
              'onclick="cerrarModal();abrirFicha(\'' + esc(c.num) + '\')">' +
              '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
              '<div class="fila-principal">' +
                '<div class="fila-titulo">' + esc(c.local) +
                  (clienteActivo(c) ? '' : ' <span class="pin pin-neutro">inactivo</span>') + '</div>' +
                '<div class="fila-sub">' +
                  [c.dir, c.loc, c.tel].filter(Boolean).map(esc).join(' · ') + '</div>' +
              '</div></button>';
          }).join('') +
          '<div class="campo-ayuda" style="margin:0">' + ic('alert', 12) + ' ' + esc(p.motivo) + '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    (pares.length > 30 ? '<div class="campo-ayuda">Se muestran 30 de ' + pares.length + '.</div>' : '');
}

/* ═══════════════════════════════════════════════════════════
   MOVER Y BORRAR HOJAS DE RUTA
   ═══════════════════════════════════════════════════════════ */
var MC = { origen: '', elegidos: {} };

function moverClientes(ruta) {
  MC = { origen: String(ruta), elegidos: {} };
  var g = _clientes.filter(function (c) { return String(rutaDe(c)) === MC.origen; });

  abrirModal('Mover clientes de la hoja ' + ruta,
    '<div class="campo"><div class="campo-etiq">¿A qué hoja pasan?</div>' +
      '<input class="campo-input" id="mc-destino" type="number" min="0" placeholder="Número de la hoja"/>' +
      '<div class="campo-ayuda">Dejalo vacío para sacarlos de toda hoja de ruta.</div>' +
    '</div>' +

    '<div style="display:flex;gap:8px;margin-bottom:8px">' +
      '<button class="btn btn-secundario" style="flex:1;font-size:12px;padding:6px" onclick="elegirTodosMC(true)">Todos</button>' +
      '<button class="btn btn-secundario" style="flex:1;font-size:12px;padding:6px" onclick="elegirTodosMC(false)">Ninguno</button>' +
    '</div>' +

    '<div class="lista" id="mc-lista">' + g.map(filaMover).join('') + '</div>' +
    '<div class="campo-ayuda" id="mc-cuenta" style="margin-top:8px"></div>',

    '<button class="btn btn-primario btn-bloque" id="btn-mc" onclick="confirmarMover()">Mover los elegidos</button>');
  actualizarCuentaMC();
}

function filaMover(c) {
  return '<label class="fila" style="cursor:pointer">' +
    '<input type="checkbox" data-num="' + esc(c.num) + '" class="mc-check" onchange="marcarMC(this)"/>' +
    '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(c.local) + '</div>' +
      '<div class="fila-sub">' + [c.dir, c.loc].filter(Boolean).map(esc).join(' · ') + '</div>' +
    '</div>' +
  '</label>';
}

function marcarMC(inp) {
  if (inp.checked) MC.elegidos[inp.dataset.num] = 1;
  else delete MC.elegidos[inp.dataset.num];
  actualizarCuentaMC();
}

function elegirTodosMC(todos) {
  MC.elegidos = {};
  $$('.mc-check').forEach(function (inp) {
    inp.checked = todos;
    if (todos) MC.elegidos[inp.dataset.num] = 1;
  });
  actualizarCuentaMC();
}

function actualizarCuentaMC() {
  var el = porId('mc-cuenta');
  if (!el) return;
  var n = Object.keys(MC.elegidos).length;
  el.textContent = n ? plural(n, 'cliente') + ' elegido' + (n === 1 ? '' : 's') : 'No elegiste ninguno todavía.';
}

async function confirmarMover() {
  var nums = Object.keys(MC.elegidos);
  if (!nums.length) { toast('Elegí al menos un cliente', 'error'); return; }

  var destino = (porId('mc-destino').value || '').trim();
  var btn = porId('btn-mc');
  if (btn) { btn.disabled = true; btn.textContent = 'Moviendo…'; }

  var fallos = 0;
  for (var i = 0; i < nums.length; i++) {
    var c = _clientes.find(function (x) { return String(x.num) === nums[i]; });
    if (!c) continue;

    var actual = {};
    try { actual = typeof c.ruta === 'string' ? JSON.parse(c.ruta || '{}') : (c.ruta || {}); } catch (e) {}
    actual.orden = destino;

    var cambios = { ruta: JSON.stringify(actual) };
    /* En la hoja nueva le toca un lugar libre */
    if (destino) cambios.num_str = codigoParaRutaNueva(_clientes, destino, c);

    try {
      await actualizar('clientes', c.num, cambios);
      Object.assign(c, cambios);
    } catch (e) { fallos++; }
  }

  invalidarCache('clientes');
  cerrarModal();
  toast(fallos
    ? 'Quedaron ' + fallos + ' sin mover'
    : nums.length + (destino ? ' clientes pasaron a la hoja ' + destino : ' quedaron sin hoja'));
  pintarRuta();
}

/* ── Borrar una hoja de ruta ─────────────────────────────────
   La hoja no es una tabla: es el número que tienen sus clientes.
   Borrarla es sacárselo a todos, no borrar a nadie.
   ────────────────────────────────────────────────────────── */
function borrarHoja(ruta) {
  var g = _clientes.filter(function (c) { return String(rutaDe(c)) === String(ruta); });
  var enCola = colaRutas().indexOf(String(ruta)) !== -1;

  abrirModal('Borrar la hoja ' + ruta,
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Sus <strong>' + plural(g.length, 'cliente') + '</strong> quedan sin hoja de ruta. ' +
      'No se borra ningún cliente ni ningún remito.</p>' +
    (enCola
      ? avisoHTML('warn', 'La hoja ' + ruta + ' está en la cola de rutas: también se saca de ahí.', 'map')
      : '') +
    '<div class="campo-ayuda">Después podés asignarlos a otra hoja desde “Mover clientes”.</div>',

    '<button class="btn btn-peligro btn-bloque" id="btn-bh" onclick="confirmarBorrarHoja(\'' + esc(ruta) + '\')">' +
      'Sí, borrar la hoja</button>');
}

async function confirmarBorrarHoja(ruta) {
  var g = _clientes.filter(function (c) { return String(rutaDe(c)) === String(ruta); });
  var btn = porId('btn-bh');
  if (btn) { btn.disabled = true; btn.textContent = 'Borrando…'; }

  var fallos = 0;
  for (var i = 0; i < g.length; i++) {
    var c = g[i];
    var actual = {};
    try { actual = typeof c.ruta === 'string' ? JSON.parse(c.ruta || '{}') : (c.ruta || {}); } catch (e) {}
    actual.orden = '';
    try {
      await actualizar('clientes', c.num, { ruta: JSON.stringify(actual) });
      Object.assign(c, { ruta: JSON.stringify(actual) });
    } catch (e) { fallos++; }
  }

  /* Y se saca de la cola, si estaba */
  try {
    var cola = colaRutas().filter(function (x) { return x !== String(ruta); });
    if (cola.length !== colaRutas().length) await guardarCola(cola);
  } catch (e) {}

  invalidarCache('clientes');
  cerrarModal();
  toast(fallos ? 'Quedaron ' + fallos + ' clientes con la hoja vieja' : 'Hoja ' + ruta + ' borrada');
  pintarRuta();
}
