/* ═══════════════════════════════════════════════════════════
   REMITO — la pantalla principal.
   Arriba, fuera del comprobante: el cliente, su última
   reposición, su deuda y los datos editables.
   Abajo: el remito propiamente dicho, que es lo que se comparte.
   ═══════════════════════════════════════════════════════════ */

var R = null;                                  // estado del remito en curso
var PRODUCTO_POR_DEFECTO = 'Esmalte en Gel';   // el 90% de los remitos arranca así

function remitoVacio() {
  return {
    cliente: null,                 // fila de la tabla clientes
    nombre: '', dir: '', loc: '', tel: '',
    fecha: hoyTexto(),
    filas: [{ prod: PRODUCTO_POR_DEFECTO, cant: 1, precio: 0 }],
    notas: '',
    pago1: '', alias1: '',
    pago2: '', monto1: 0, alias2: '',
    /* Deuda vieja que se cobra junto con este remito */
    cobrarDeuda: 0, deudasACobrar: [],
    forzarDuplicado: false,
    guardando: false
  };
}

registrarPagina({
  id: 'remito',
  menu: 'Nuevo remito',
  grupo: 'Día a día',
  icono: 'receipt',
  titulo: 'Nuevo remito',
  subtitulo: 'Buscá el cliente o cargalo a mano',

  async montar(cont, params) {
    R = remitoVacio();
    _clientesRemito = await traerCacheado('clientes');
    await cargarConfig().catch(function () {});
    try {
      _remitosAlias = await traerCacheado('remitos');
      _pagosAlias = await traerCacheado('pagos');
    } catch (e) { _remitosAlias = []; _pagosAlias = []; }

    var num = params.get('cliente');
    cont.innerHTML = '<div id="zona-cliente"></div><div id="zona-remito"></div>';
    pintarZonaCliente();
    precioInicial();
    pintarRemito();

    if (num) {
      var c = _clientesRemito.find(function (x) { return String(x.num) === String(num); });
      if (c) elegirCliente(c.num);
    }
  }
});

var _clientesRemito = [];
var _remitosAlias = [];
var _pagosAlias = [];
var _resultados = [];

/* ── Cliente ─────────────────────────────────────────────── */
function pintarZonaCliente() {
  var z = porId('zona-cliente');
  if (!z) return;

  if (!R.cliente) {
    z.innerHTML =
      '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
        '<div class="buscador">' +
          '<span class="ic-lupa">' + ic('search', 16) + '</span>' +
          '<input class="campo-input" id="q-cli" autocomplete="off" ' +
                 'placeholder="Número, nombre, zona o dirección" oninput="buscarClienteRemito(this.value)"/>' +
        '</div>' +
        '<div id="res-cli"></div>' +
        '<div class="campo-ayuda" style="margin-top:8px">Si no está en la base, escribí los datos directamente en el remito.</div>' +
      '</div></div>';
    return;
  }

  var c = R.cliente;
  var rep = _ultimaRep;
  var deuda = _deudaCliente;

  z.innerHTML =
    '<div class="tarjeta">' +
      '<div class="tarjeta-cab" style="justify-content:space-between">' +
        '<span style="display:flex;align-items:center;gap:8px">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' + esc(c.local) +
        '</span>' +
        '<button class="btn btn-fantasma" style="padding:2px 6px" onclick="soltarCliente()" aria-label="Quitar cliente">✕</button>' +
      '</div>' +
      '<div class="tarjeta-cuerpo">' +

        '<div class="grilla-stats" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:14px">' +
          '<div class="stat">' +
            '<div class="stat-etiq">' + ic('calendar', 14) + 'Última reposición</div>' +
            (rep
              ? '<div class="stat-val" style="font-size:17px">' + esc(fechaCorta(rep.fecha)) + '</div>' +
                '<div class="stat-sub">' + (rep.dias === 0 ? 'hoy' : rep.dias === 1 ? 'ayer' : 'hace ' + plural(rep.dias, 'día')) +
                  ' · ' + plata(rep.total) + ' · ' + plural(rep.unidades, 'unidad', 'unidades') + '</div>'
              : '<div class="stat-val" style="font-size:17px;color:var(--muted)">Primera vez</div>' +
                '<div class="stat-sub">no tiene remitos anteriores</div>') +
          '</div>' +
          (deuda > 0
            ? '<button class="stat stat-tocable" onclick="verDeudaCliente()">' +
                '<div class="stat-etiq">' + ic('clock', 14) + 'Deuda' +
                  '<span style="margin-left:auto;opacity:.5">' + ic('chevron', 12) + '</span></div>' +
                '<div class="stat-val" style="font-size:17px;color:var(--warn)">' + plata(deuda) + '</div>' +
                '<div class="stat-sub">' + plural(_remitosConDeuda, 'remito') + ' · tocá para cobrar</div>' +
              '</button>'
            : '<div class="stat">' +
                '<div class="stat-etiq">' + ic('clock', 14) + 'Deuda</div>' +
                '<div class="stat-val" style="font-size:17px;color:var(--ok)">Al día</div>' +
              '</div>') +
        '</div>' +

        (clienteAvisado(c)
          ? avisoHTML('ok', 'Ya se le avisó del aumento' +
              (c.aviso_aumento_fecha ? ' el <strong>' + esc(fechaCorta(c.aviso_aumento_fecha)) + '</strong>' : '') +
              '. Por eso el aviso no sale en el remito. ' +
              '<button class="btn btn-fantasma" style="padding:0;text-decoration:underline" onclick="volverAAvisar()">Volver a avisar</button>', 'check')
          : '') +

        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn btn-secundario" onclick="abrirEditarCliente()">' + ic('edit', 15) + ' Editar datos</button>' +
          '<button class="btn btn-secundario" onclick="marcarCerrado()">' + ic('ban', 15) + ' Estaba cerrado</button>' +
          '<button class="btn btn-secundario" onclick="marcarSinVentas()">' + ic('minus', 15) + ' No vendió</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function buscarClienteRemito(q) {
  var cont = porId('res-cli');
  if (!q || q.length < 2) { cont.innerHTML = ''; return; }
  _resultados = _clientesRemito.filter(clienteActivo)
    .filter(function (c) { return coincideCliente(c, q); })
    .slice(0, 8);

  cont.innerHTML = _resultados.length
    ? '<div class="lista" style="margin-top:10px">' + _resultados.map(function (c) {
        return '<button class="fila" onclick="elegirCliente(\'' + esc(c.num) + '\')">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(c.local) + '</div>' +
            '<div class="fila-sub">' + [c.loc, c.dir].filter(Boolean).map(esc).join(' · ') + '</div>' +
          '</div></button>';
      }).join('') + '</div>'
    : '<div class="campo-ayuda" style="margin-top:10px">Ningún cliente coincide con “' + esc(q) + '”.</div>';
}

var _ultimaRep = null, _deudaCliente = 0, _remitosConDeuda = 0;
var _deudasDelCliente = [];   // los remitos que quedaron sin saldar

async function elegirCliente(num) {
  var c = _clientesRemito.find(function (x) { return String(x.num) === String(num); });
  if (!c) return;
  R.cliente = c;
  R.nombre = c.local || '';
  R.dir = c.dir || '';
  R.loc = c.loc || '';
  R.tel = c.tel || '';

  _ultimaRep = null; _deudaCliente = 0; _remitosConDeuda = 0; _deudasDelCliente = [];
  pintarZonaCliente();
  pintarRemito();

  try {
    var suyos = await traerTodo('remitos', 'cliente_nombre=eq.' + encodeURIComponent(c.local));
    if (!R.cliente || R.cliente.num !== c.num) return;   // cambió mientras cargaba
    _ultimaRep = ultimaReposicion(c.local, suyos);
    var conDeuda = suyos.filter(function (r) { return deudaPendiente(r) > 0; });
    _deudasDelCliente = conDeuda;
    _remitosConDeuda = conDeuda.length;
    _deudaCliente = conDeuda.reduce(function (a, r) { return a + deudaPendiente(r); }, 0);
  } catch (e) { console.warn('historial del cliente:', e.message); }

  aplicarPrecioSugerido();
  pintarZonaCliente();
  pintarRemito();
}

function soltarCliente() {
  R.cliente = null; _ultimaRep = null; _deudaCliente = 0; _deudasDelCliente = [];
  R.cobrarDeuda = 0; R.deudasACobrar = [];
  pintarZonaCliente(); pintarRemito();
}

/* ── Editar datos del cliente sin salir del remito ────────── */
function abrirEditarCliente() {
  var c = R.cliente; if (!c) return;
  var campos = [
    { k: 'local', et: 'Nombre del local' },
    { k: 'dir',   et: 'Dirección' },
    { k: 'loc',   et: 'Localidad / zona' },
    { k: 'tel',   et: 'Teléfono' }
  ];
  abrirModal('Datos de ' + (c.local || 'el cliente'),
    campos.map(function (f) {
      return '<div class="campo"><div class="campo-etiq">' + esc(f.et) + '</div>' +
        '<input class="campo-input" id="ec-' + f.k + '" value="' + esc(c[f.k] || '') + '"/></div>';
    }).join(''),
    '<button class="btn btn-primario btn-bloque" onclick="guardarEditarCliente()">Guardar en la base</button>');
}

async function guardarEditarCliente() {
  var c = R.cliente; if (!c) return;
  var cambios = {};
  ['local', 'dir', 'loc', 'tel'].forEach(function (k) {
    var el = porId('ec-' + k); if (!el) return;
    var v = el.value.trim();
    if (v !== (c[k] || '')) cambios[k] = v || null;
  });
  if (!Object.keys(cambios).length) { cerrarModal(); return; }

  try {
    await actualizar('clientes', c.num, cambios);
    Object.assign(c, cambios);
    R.nombre = c.local || ''; R.dir = c.dir || ''; R.loc = c.loc || ''; R.tel = c.tel || '';
    cerrarModal();
    pintarZonaCliente(); pintarRemito();
    toast('Datos actualizados');
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ── Cliente cerrado: queda registrado como un remito más ── */
/* ── Retiro del exhibidor ────────────────────────────────────
   Se deja constancia en el remito y el cliente queda inactivo:
   no se borra, así el historial sigue estando.
   ────────────────────────────────────────────────────────── */
/* Qué le falta al remito para poder confirmarse */
function faltanDatosDelRemito() {
  var faltan = [];
  if (!((R.cliente && R.cliente.local) || R.nombre.trim())) faltan.push('el cliente');
  if (!R.filas.some(function (f) { return f.prod && +f.cant > 0; })) faltan.push('la cantidad de algún producto');
  if (!R.pago1) faltan.push('el medio de pago');
  return faltan;
}

function marcarRetiro() {
  /* El retiro cierra la cuenta del cliente: el remito tiene que
     estar completo antes, o queda un cierre a medias. */
  var faltan = faltanDatosDelRemito();
  if (faltan.length) {
    toast('Antes de retirar el exhibidor falta cargar ' + faltan.join(', '), 'error');
    return;
  }

  var nombre = (R.cliente && R.cliente.local) || R.nombre.trim();

  var total = totalRemito();
  abrirModal('Retirar el exhibidor',
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se guarda el remito de <strong>' + esc(nombre) + '</strong> dejando constancia de que ' +
      'se retiró el exhibidor' + (total > 0 ? ', junto con los ' + plata(total) + ' cargados' : '') + '.</p>' +
    avisoHTML('warn',
      '<strong>' + esc(nombre) + '</strong> queda dado de baja y deja de aparecer en las listas y en su hoja de ruta. ' +
      'Se puede reactivar desde su ficha en Clientes.', 'alert') +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Motivo (opcional)</div>' +
      '<input class="campo-input" id="retiro-nota" placeholder="Ej: cerró el local, no vendía"/></div>',
    '<button class="btn btn-primario btn-bloque" id="btn-retiro" onclick="confirmarRetiro()">' +
      ic('check', 16) + ' Confirmar el retiro</button>');
}

async function confirmarRetiro() {
  var c = R.cliente;
  var nombre = (c && c.local) || R.nombre.trim();
  if (!nombre) return;

  var nota = (porId('retiro-nota').value || '').trim();
  var btn = porId('btn-retiro');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  var total = totalRemito();
  var partes = partesDelFormulario();

  try {
    var remito = {
      fecha: hoyTexto(),
      cliente_nombre: nombre,
      cliente_dir: (c && c.dir) || R.dir || null,
      cliente_loc: (c && c.loc) || R.loc || null,
      cliente_tel: (c && c.tel) || R.tel || null,
      total: total,
      unidades: unidadesRemito(),
      productos: JSON.stringify(R.filas.filter(function (f) { return f.prod && f.cant > 0; })),
      pago: R.pago1 || null,
      alias: aliasDeDeuda() || null,
      pagos_detalle: JSON.stringify(partes),
      notas: ['Se retiró el exhibidor', nota].filter(Boolean).join(' · '),
      motivo: 'retiro_exhibidor',
      created_at: new Date().toISOString()
    };

    await crear('remitos', remito);

    /* El cliente queda inactivo y sin exhibidores asignados */
    if (c) {
      await actualizar('clientes', c.num, { activo: false, exhibidores: 0 });
      c.activo = false; c.exhibidores = 0;
      invalidarCache('clientes');
    }

    cerrarModal();
    toast('Exhibidor retirado · ' + nombre + ' quedó dado de baja');
    await compartirRemito(remito);
    R = remitoVacio();
    irA('inicio');
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar el retiro'; }
    toast(e.message, 'error');
  }
}

/* ═══════════════════════════════════════════════════════════
   REMITO RÁPIDO
   Para cuando no hay tiempo ni señal: nombre y monto. Si el
   nombre coincide sin ambigüedad con un cliente, se vincula
   solo; si no, queda avisado en el inicio para completarlo.
   ═══════════════════════════════════════════════════════════ */
function remitoRapido() {
  abrirModal('Anotarlo rápido',
    '<div class="campo-ayuda" style="margin-bottom:12px">' +
      'Se guarda con lo mínimo. Si no hay señal queda en el teléfono y se sube solo. ' +
      'Después lo podés completar desde Remitos hechos.</div>' +

    '<div class="campo"><div class="campo-etiq">Local</div>' +
      '<input class="campo-input" id="rr-nombre" value="' + esc(R.nombre || (R.cliente ? R.cliente.local : '')) + '" ' +
             'placeholder="Nombre del local"/></div>' +

    '<div class="campo"><div class="campo-etiq">Monto</div>' +
      inputMonto('rr-monto', totalProductos() || '') + '</div>' +

    '<div class="campo"><div class="campo-etiq">Cómo pagó</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap" id="rr-pagos">' +
        ['efectivo', 'transferencia', 'deuda'].map(function (t) {
          var d = TIPOS_PAGO[t];
          return '<button class="btn btn-secundario rr-pago" data-tipo="' + t + '" ' +
            'onclick="setPagoRapido(\'' + t + '\')">' + ic(d.icono, 15) + ' ' + esc(d.corta) + '</button>';
        }).join('') +
      '</div></div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" id="rr-nota" placeholder="Ej: zona de Lanús"/></div>',

    '<button class="btn btn-primario btn-bloque" id="btn-rr" onclick="guardarRemitoRapido()">' +
      ic('check', 16) + ' Guardar</button>');
  window._pagoRapido = '';
}

function setPagoRapido(t) {
  window._pagoRapido = t;
  $$('.rr-pago').forEach(function (b) {
    b.className = 'btn rr-pago ' + (b.dataset.tipo === t ? 'btn-primario' : 'btn-secundario');
  });
}

async function guardarRemitoRapido() {
  var nombre = (porId('rr-nombre').value || '').trim();
  var monto = leerMonto('rr-monto');
  var pago = window._pagoRapido;

  if (!nombre) { toast('Falta el nombre del local', 'error'); return; }
  if (!monto) { toast('Falta el monto', 'error'); return; }
  if (!pago) { toast('Elegí cómo pagó', 'error'); return; }

  var btn = porId('btn-rr');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  /* Si el nombre no deja lugar a dudas, se vincula solo */
  var seguro = clienteSeguroPara({ cliente_nombre: nombre }, _clientesRemito);
  var c = seguro ? seguro.cliente : null;
  var nota = (porId('rr-nota').value || '').trim();

  try {
    await crear('remitos', {
      fecha: hoyTexto(),
      cliente_nombre: c ? c.local : nombre,
      cliente_num: c ? c.num : null,
      cliente_dir: c ? (c.dir || null) : null,
      cliente_loc: c ? (c.loc || null) : null,
      cliente_tel: c ? (c.tel || null) : null,
      total: monto,
      unidades: 0,
      productos: '[]',
      pago: pago,
      pagos_detalle: JSON.stringify([{ tipo: pago, monto: monto }]),
      notas: ['Cargado rápido', nota].filter(Boolean).join(' · '),
      created_at: new Date().toISOString()
    });

    cerrarModal();
    if (pendientesDeSubir()) {
      toast('Guardado en el teléfono · se sube cuando haya señal');
    } else if (c) {
      toast('Guardado y vinculado a ' + c.local);
    } else {
      toast('Guardado · quedó sin cliente, avisado en el inicio');
    }
    R = remitoVacio();
    irA('inicio');
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
    toast(e.message, 'error');
  }
}

/* ── Dar de alta al cliente sin salir del remito ──────────────
   Toma los datos que ya escribiste: no hay que cargarlos dos veces.
   ────────────────────────────────────────────────────────── */
function guardarComoCliente() {
  var nombre = R.nombre.trim();
  if (!nombre) { toast('Escribí el nombre del local', 'error'); return; }

  abrirModal('Guardar como cliente',
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se da de alta <strong>' + esc(nombre) + '</strong> con lo que ya cargaste en el remito.</p>' +
    '<div class="campo"><div class="campo-etiq">Dirección</div>' +
      '<input class="campo-input" id="gc-dir" value="' + esc(R.dir) + '"/></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Localidad</div>' +
        '<input class="campo-input" id="gc-loc" value="' + esc(R.loc) + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">Teléfono</div>' +
        '<input class="campo-input" id="gc-tel" inputmode="tel" value="' + esc(R.tel) + '"/></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Hoja de ruta</div>' +
        '<input class="campo-input" id="gc-ruta" type="number" min="0" placeholder="Ej: 14"/></div>' +
      '<div class="campo"><div class="campo-etiq">Rubro</div>' +
        '<select class="campo-input" id="gc-rubro">' +
          RUBROS.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') +
        '</select></div>' +
    '</div>',
    '<button class="btn btn-primario btn-bloque" id="btn-gc" onclick="confirmarAltaCliente()">Guardar cliente</button>');
}

async function confirmarAltaCliente() {
  var btn = porId('btn-gc');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  try {
    var todos = await traerCacheado('clientes');
    var num = todos.reduce(function (m, c) { return Math.max(m, +c.num || 0); }, 0) + 1;
    var ruta = (porId('gc-ruta').value || '').trim();
    var codigo = ruta ? codigoCliente(ruta, siguienteEnRuta(todos, ruta)) : String(num);

    var nuevo = {
      num: num,
      num_str: codigo,
      local: R.nombre.trim(),
      dir: (porId('gc-dir').value || '').trim() || null,
      loc: (porId('gc-loc').value || '').trim() || null,
      tel: (porId('gc-tel').value || '').trim() || null,
      rubro: porId('gc-rubro').value,
      ruta: JSON.stringify({ orden: ruta, horarios: [], notas: '' }),
      exhibidores: 1,
      activo: true,
      /* Se lleva el exhibidor hoy con el precio nuevo: no hay aumento que avisarle */
      aviso_aumento: true,
      aviso_aumento_fecha: hoyISO(),
      fecha: hoyTexto(),
      created_at: new Date().toISOString()
    };

    await crear('clientes', nuevo);
    invalidarCache('clientes');
    _clientesRemito = await traerCacheado('clientes');

    /* Queda seleccionado, así el remito sigue sin repetir nada */
    R.cliente = nuevo;
    R.dir = nuevo.dir || ''; R.loc = nuevo.loc || ''; R.tel = nuevo.tel || '';

    cerrarModal();
    toast('Cliente creado' + (ruta ? ' · ' + codigo : ''));
    pintarZonaCliente();
    pintarRemito();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar cliente'; }
    toast(e.message, 'error');
  }
}

/* ── El cliente no vendió ────────────────────────────────────
   Queda el registro de la visita, sin reposición ni plata.
   ────────────────────────────────────────────────────────── */
function marcarSinVentas() {
  var nombre = (R.cliente && R.cliente.local) || R.nombre.trim();
  if (!nombre) { toast('Elegí el cliente o escribí su nombre', 'error'); return; }

  abrirModal('El cliente no vendió',
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se guarda la visita a <strong>' + esc(nombre) + '</strong> con fecha de hoy y ' + plata(0) + '. ' +
      'Queda en el historial como visita hecha, pero no suma a lo facturado.</p>' +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" id="sinventas-nota" placeholder="Ej: le quedó stock de la vez pasada"/></div>',
    '<button class="btn btn-primario btn-bloque" onclick="confirmarSinVentas()">Guardar la visita</button>');
}

async function confirmarSinVentas() {
  var c = R.cliente;
  var nombre = (c && c.local) || R.nombre.trim();
  if (!nombre) return;
  var nota = (porId('sinventas-nota').value || '').trim();

  try {
    await crear('remitos', {
      fecha: hoyTexto(),
      cliente_nombre: nombre,
      cliente_dir: (c && c.dir) || R.dir || null,
      cliente_loc: (c && c.loc) || R.loc || null,
      cliente_tel: (c && c.tel) || R.tel || null,
      total: 0, unidades: 0, productos: '[]',
      pagos_detalle: '[]',
      notas: ['No vendió', nota].filter(Boolean).join(' · '),
      motivo: 'sin_ventas',
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Visita guardada · ' + nombre + ' no vendió');
    R = remitoVacio();
    irA('inicio');
  } catch (e) { toast(e.message, 'error'); }
}

function marcarCerrado() {
  var nombre = (R.cliente && R.cliente.local) || R.nombre.trim();
  if (!nombre) { toast('Elegí el cliente o escribí su nombre', 'error'); return; }
  abrirModal('Marcar como cerrado',
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">Se guarda un remito de ' + plata(0) +
    ' para <strong>' + esc(nombre) + '</strong> con fecha de hoy. Queda en el historial como visita, ' +
    'pero no suma a lo facturado.</p>' +
    '<div class="campo" style="margin-top:12px"><div class="campo-etiq">Nota (opcional)</div>' +
    '<input class="campo-input" id="cerrado-nota" placeholder="Ej: cerrado por vacaciones"/></div>',
    '<button class="btn btn-primario btn-bloque" onclick="confirmarCerrado()">Registrar la visita</button>');
}

async function confirmarCerrado() {
  var c = R.cliente;
  var nombre = (c && c.local) || R.nombre.trim();
  if (!nombre) return;
  var nota = (porId('cerrado-nota').value || '').trim();
  try {
    await crear('remitos', {
      fecha: hoyTexto(),
      cliente_nombre: nombre,
      cliente_dir: (c && c.dir) || R.dir || null,
      cliente_loc: (c && c.loc) || R.loc || null,
      cliente_tel: (c && c.tel) || R.tel || null,
      total: 0, unidades: 0, pago: 'sin_definir',
      productos: '[]', pagos_detalle: JSON.stringify([{ tipo: 'sin_definir', monto: 0 }]),
      motivo: 'cerrado', notas: nota || null,
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Visita registrada: estaba cerrado');
    irA('inicio');
  } catch (e) { toast(e.message, 'error'); }
}

async function volverAAvisar() {
  var c = R.cliente; if (!c) return;
  try {
    await actualizar('clientes', c.num, { aviso_aumento: false, aviso_aumento_fecha: null });
    c.aviso_aumento = false; c.aviso_aumento_fecha = null;
    aplicarPrecioSugerido();
    pintarZonaCliente(); pintarRemito();
    toast('El aviso vuelve a salir en el remito');
  } catch (e) { toast(e.message, 'error'); }
}

/* Deja la primera fila con el precio que corresponda hoy */
function precioInicial() {
  R.filas.forEach(function (f) {
    if (!f.prod || f.precio) return;
    f.precio = (esProductoEnAumento(f.prod) ? precioParaCliente(R.cliente) : 0) || precioDeLista(f.prod);
  });
}

/* ── El remito ───────────────────────────────────────────── */
/* El precio de caja solo se aplica si el renglón tiene el precio
   de lista. Si se escribió otro a mano, o si es el precio nuevo
   por el aumento, manda ese: no queremos que la caja lo pise. */
function usaPrecioDeCaja(f) {
  var p = buscarProducto(f.prod);
  if (!p || !p.porCaja || (+f.cant || 0) < p.porCaja) return false;
  if (f.precioManual) return false;
  return (+f.precio || 0) === p.precio;
}

function totalFila(f) {
  if (usaPrecioDeCaja(f)) return cotizar(f.prod, f.cant).total;
  return (+f.cant || 0) * (+f.precio || 0);
}

function totalProductos() {
  return R.filas.reduce(function (s, f) { return s + totalFila(f); }, 0);
}
/* Lo que se cobra hoy: los productos más la deuda que se salda */
function totalRemito() {
  return totalProductos() + (+R.cobrarDeuda || 0);
}

function unidadesRemito() {
  return R.filas.reduce(function (s, f) { return s + (+f.cant || 0); }, 0);
}

function pintarRemito() {
  var z = porId('zona-remito'); if (!z) return;
  var total = totalRemito();
  /* Solo cuando hay un cliente elegido y todavía no se le avisó:
     sin cliente no se sabe a quién avisar, y el cartel molestaba. */
  var mostrarAviso = aumentoConfig().activo && !!R.cliente &&
    !clienteAvisado(R.cliente) && !clienteReciente(R.cliente);

  z.innerHTML =
    /* Los casos en que no se carga nada van arriba: si la visita
       no dio reposición, no hace falta bajar hasta el final. */
    '<div class="tarjeta" id="remito-card">' +
      '<div style="padding:18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">' +
        '<img src="' + LOGO_INTENCIONAL + '" style="width:44px;height:44px;object-fit:contain" alt=""/>' +
        '<div>' +
          '<div class="marca-nombre">Intencional</div>' +
          '<div class="marca-sub">Esmaltes · Cremas · Belleza</div>' +
        '</div>' +
        '<div style="margin-left:auto;text-align:right">' +
          '<div class="campo-etiq" style="margin:0">Fecha</div>' +
          '<div style="font-weight:600">' + esc(R.fecha) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="tarjeta-cuerpo">' +
        /* El nombre a lo ancho y los otros tres de a dos: en el
           celular, uno por renglón obligaba a bajar demasiado. */
        '<div class="datos-cliente">' +
          '<div class="dc-ancho">' + campoTexto('Cliente', 'r-nombre', R.nombre, 'Nombre del local') + '</div>' +
          '<div class="dc-ancho">' + campoTexto('Dirección', 'r-dir', R.dir, 'Calle y número') + '</div>' +
          campoTexto('Localidad', 'r-loc', R.loc, 'Ciudad / partido') +
          campoTexto('Teléfono', 'r-tel', R.tel, 'Opcional') +
        '</div>' +

        '<div class="eyebrow" style="margin-top:18px">Productos</div>' +
        '<div class="fila-prod cab-prod">' +
          '<span>Producto</span><span>Cant</span><span>Precio</span><span>Subtotal</span><span></span>' +
        '</div>' +
        '<div id="filas-remito">' + R.filas.map(filaProducto).join('') + '</div>' +
        '<button class="btn btn-secundario" style="margin-top:8px" onclick="agregarFila()">' + ic('plus', 15) + ' Agregar producto</button>' +

        /* Cómo se paga: arriba de las notas y adentro del remito,
           así entra en la imagen que se comparte */
        '<div class="eyebrow" style="margin-top:20px">Cómo se paga</div>' +
        botonesPago(1) +
        selectorAlias(1) +
        '<details class="segundo-pago"' + (R.pago2 ? ' open' : '') + ' style="margin-top:14px">' +
          '<summary style="cursor:pointer;font-size:12px;color:var(--rose);font-weight:600;padding:4px 0">' +
            'Dividir en dos medios de pago' +
          '</summary>' +
          '<div style="margin-top:10px">' +
            botonesPago(2) +
            (R.pago2
              ? '<div class="campo" style="margin-top:10px">' +
                  '<div class="campo-etiq">¿Cuánto paga con ' + esc((TIPOS_PAGO[R.pago1] || {}).corta || 'el primero') + '?</div>' +
                  inputMonto('r-monto1', R.monto1, 'R.monto1=leerMonto(this);pintarDesglose()') +
                  '<div class="campo-ayuda" id="resto-pago"></div>' +
                '</div>' +
                selectorAlias(2)
              : '') +
          '</div>' +
        '</details>' +
        '<div id="desglose"></div>' +

        '<div class="campo" style="margin-top:18px">' +
          '<div class="campo-etiq">Notas u observaciones</div>' +
          '<input class="campo-input" id="r-notas" value="' + esc(R.notas) + '" ' +
                 'placeholder="Ej: pidió reponer crema la semana que viene" oninput="R.notas=this.value"/>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">' +
          '<div>' +
            '<div class="campo-etiq" style="margin:0">Total</div>' +
            '<div class="campo-ayuda" id="detalle-total" style="margin-top:2px">' + resumenFilas() + '</div>' +
            (R.cobrarDeuda
              ? '<div class="campo-ayuda" style="color:var(--warn)">' +
                plata(totalProductos()) + ' del remito + ' + plata(R.cobrarDeuda) + ' de deuda</div>'
              : '') +
          '</div>' +
          '<div class="stat-val" id="total-remito" style="font-size:26px;color:var(--rose)">' + plata(total) + '</div>' +
        '</div>' +

        (hayDeuda()
          ? '<div class="aviso aviso-warn" style="margin-top:16px">' + ic('alert', 15) +
            '<div><strong>Pago pendiente</strong> — ' +
            esc(textoPagoPendiente(aliasDeDeuda()).replace('Pago pendiente — ', '')) + '</div></div>'
          : '') +

        (mostrarAviso
          ? '<div class="aviso aviso-warn" id="bloque-aviso" style="margin-top:16px">' + ic('megaphone', 15) +
            '<div><strong>Aviso:</strong> ' + esc(textoAviso(aumentoConfig().nuevo)) + '</div></div>'
          : '') +
      '</div>' +
    '</div>' +

    /* Mientras no haya un cliente de la base elegido, se ofrece darlo
       de alta. Al elegir uno existente el botón desaparece solo. */
    (!R.cliente
      ? '<button class="btn btn-secundario btn-bloque" style="margin-bottom:8px" onclick="guardarComoCliente()">' +
        ic('user', 15) + ' Guardar como cliente nuevo</button>'
      : '') +

    '<button class="btn btn-fantasma btn-bloque" style="margin-bottom:8px;font-size:12.5px" ' +
      'onclick="remitoRapido()">' + ic('zap', 14) + ' Anotarlo rápido: solo nombre y monto</button>' +

    '<button class="btn btn-primario btn-bloque" id="btn-confirmar" onclick="confirmarRemito()">' +
      ic('check', 16) + ' Confirmar y compartir' +
    '</button>' +
    '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="marcarRetiro()">' +
      ic('box', 15) + ' Retiré el exhibidor' +
    '</button>';

  pintarDesglose();
}

function campoTexto(etiqueta, id, valor, ph) {
  return '<div class="campo" style="margin:0">' +
    '<div class="campo-etiq">' + esc(etiqueta) + '</div>' +
    '<input class="campo-input" id="' + id + '" value="' + esc(valor) + '" placeholder="' + esc(ph) + '" ' +
           'oninput="R.' + id.slice(2) + '=this.value"/>' +
  '</div>';
}

function filaProducto(f, i) {
  var opciones = ['<option value="">— elegir —</option>'].concat(
    productos().map(function (p) {
      return '<option' + (normalizar(p.nombre) === normalizar(f.prod) ? ' selected' : '') + '>' + esc(p.nombre) + '</option>';
    })).join('');

  var conCaja = usaPrecioDeCaja(f);
  var subtotal = totalFila(f);

  return '<div class="fila-prod">' +
    '<select class="campo-input prod" aria-label="Producto" onchange="cambiarProducto(' + i + ',this.value)">' + opciones + '</select>' +
    '<input class="campo-input" type="number" min="0" inputmode="numeric" value="' + (+f.cant || 0) + '" ' +
           'aria-label="Cantidad" oninput="R.filas[' + i + '].cant=+this.value||0;pintarTotales()"/>' +
    '<input class="campo-input" type="number" min="0" inputmode="decimal" value="' + (+f.precio || 0) + '" ' +
           'aria-label="Precio por unidad" ' +
      'oninput="R.filas[' + i + '].precio=+this.value||0;R.filas[' + i + '].precioManual=true;pintarTotales()"/>' +
    '<div class="subtotal" id="sub-' + i + '">' + plata(subtotal) + '</div>' +
    (R.filas.length > 1
      ? '<button class="btn btn-fantasma" style="padding:4px" aria-label="Quitar producto" onclick="quitarFila(' + i + ')">✕</button>'
      : '<span></span>') +
    (conCaja
      ? '<div class="campo-ayuda" style="grid-column:1/-1;margin:2px 0 0;color:var(--ok)">' +
        ic('box', 11) + ' ' + esc(textoCotizacion(f.prod, f.cant)) + '</div>'
      : '') +
  '</div>';
}

function cambiarProducto(i, nombre) {
  R.filas[i].prod = nombre;
  var sugerido = R.cliente && esProductoEnAumento(nombre) ? precioParaCliente(R.cliente) : 0;
  R.filas[i].precio = sugerido || precioDeLista(nombre) || R.filas[i].precio || 0;
  pintarRemito();
}

function agregarFila() { R.filas.push({ prod: '', cant: 1, precio: 0 }); pintarRemito(); }
function quitarFila(i) { R.filas.splice(i, 1); pintarRemito(); }

/* Cuando cambia el cliente, se actualiza el precio del producto en aumento,
   pero nunca se pisa un precio escrito a mano. */
function aplicarPrecioSugerido() {
  var cfg = aumentoConfig();
  if (!cfg.activo) return;
  var nuevo = precioParaCliente(R.cliente);
  R.filas.forEach(function (f) {
    if (!esProductoEnAumento(f.prod)) return;
    var actual = +f.precio || 0;
    if (!actual || actual === cfg.viejo || actual === cfg.nuevo) f.precio = nuevo;
  });
}

function resumenFilas() {
  var cargadas = R.filas.filter(function (f) { return f.prod && f.cant > 0; });
  if (!cargadas.length) return 'Sin productos cargados';
  return plural(unidadesRemito(), 'unidad', 'unidades') + ' en ' + plural(cargadas.length, 'producto');
}

function pintarTotales() {
  R.filas.forEach(function (f, i) {
    var el = porId('sub-' + i);
    if (el) el.textContent = plata(totalFila(f));
  });
  var t = porId('total-remito');
  if (t) t.textContent = plata(totalRemito());
  var d = porId('detalle-total');
  if (d) d.textContent = resumenFilas();
  pintarDesglose();
}

function botonesPago(cual) {
  var actual = cual === 1 ? R.pago1 : R.pago2;
  var etiqueta = cual === 1 ? 'Medio de pago' : 'Con qué se paga la otra parte';
  return '<div class="campo-etiq">' + etiqueta + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      ['efectivo', 'transferencia', 'deuda'].map(function (t) {
        var d = TIPOS_PAGO[t];
        var activo = actual === t;
        return '<button class="btn ' + (activo ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setPago(' + cual + ',\'' + t + '\')">' + ic(d.icono, 15) + ' ' + esc(d.corta) + '</button>';
      }).join('') +

    '</div>';
}

/* Los alias solo aparecen cuando el medio elegido es transferencia */
function selectorAlias(cual) {
  var tipo = cual === 1 ? R.pago1 : R.pago2;
  /* En deuda también hace falta: es el alias al que va a transferir
     cuando pague, y el que sale impreso en el aviso del remito. */
  if (tipo !== 'transferencia' && tipo !== 'deuda') return '';
  var esDeuda = tipo === 'deuda';

  var lista = aliasConfigurados();
  if (!lista.length) {
    return '<div class="campo-ayuda" style="margin-top:10px">' +
      'No hay alias cargados. Se agregan en <a href="#/configuraciones">Configuraciones</a>.</div>';
  }

  var sugerido = aliasSugerido(_remitosAlias, _pagosAlias);
  var elegido = cual === 1 ? R.alias1 : R.alias2;
  var totales = totalesPorAlias(_remitosAlias, _pagosAlias);

  return '<div style="margin-top:12px">' +
    '<div class="campo-etiq">' + (esDeuda ? 'Alias donde va a pagar' : 'Alias para la transferencia') + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      lista.map(function (a) {
        var activo = mismoAlias(a, elegido);
        return '<button class="btn ' + (activo ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setAlias(' + cual + ',\'' + esc(a).replace(/'/g, "\\'") + '\')">' +
          ic('card', 15) + ' ' + esc(a) +
          (mismoAlias(a, sugerido) && !activo ? ' <span class="pin pin-ok" style="margin-left:4px">sugerido</span>' : '') +
        '</button>';
      }).join('') +
    '</div>' +
    '<div class="campo-ayuda" style="margin-top:6px">' +
      lista.map(function (a) { return esc(a) + ': ' + plata(totales[a] || 0); }).join(' · ') +
      (sugerido ? ' — conviene ' + esc(sugerido) + ', que viene recibiendo menos' : '') +
      (esDeuda ? '<br>Es el que se le imprime en el aviso de pago pendiente.' : '') +
    '</div>' +
  '</div>';
}

function setAlias(cual, alias) {
  if (cual === 1) R.alias1 = alias; else R.alias2 = alias;
  pintarRemito();
}

/* ¿Alguna parte del pago queda en deuda? */
function hayDeuda() {
  return partesDelFormulario().some(function (p) { return p.tipo === 'deuda' && p.monto > 0; });
}

/* El alias al que tiene que transferir quien quedó debiendo:
   primero el elegido junto a la parte en deuda, si no el otro. */
function aliasDeDeuda() {
  if (R.pago1 === 'deuda' && R.alias1) return R.alias1;
  if (R.pago2 === 'deuda' && R.alias2) return R.alias2;
  return R.alias1 || R.alias2 || aliasSugerido(_remitosAlias, _pagosAlias) || '';
}

function setPago(cual, tipo) {
  if (cual === 1) {
    R.pago1 = tipo;                       // elegir el primero no toca el segundo
    if ((tipo === 'transferencia' || tipo === 'deuda') && !R.alias1) {
      R.alias1 = aliasSugerido(_remitosAlias, _pagosAlias) || '';
    }
    if (tipo !== 'transferencia' && tipo !== 'deuda') R.alias1 = '';
  } else {
    R.pago2 = (R.pago2 === tipo) ? '' : tipo;   // volver a tocarlo lo saca
    if (!R.pago2) { R.monto1 = 0; R.alias2 = ''; }
    /* Al abrir el segundo medio, el primero arranca con el total:
       así se escribe cuánto se paga ahora y el resto se calcula. */
    if (R.pago2 && !R.monto1) R.monto1 = totalRemito();
    if ((R.pago2 === 'transferencia' || R.pago2 === 'deuda') && !R.alias2) {
      R.alias2 = aliasSugerido(_remitosAlias, _pagosAlias) || '';
    }
  }
  pintarRemito();
}

/* El desglose entra en la imagen: si hay dos medios, el cliente
   tiene que ver cuánto pagó de cada forma. */
function pintarDesglose() {
  var partes = partesDelFormulario();
  var cont = porId('desglose');
  var resto = porId('resto-pago');
  if (resto) {
    var total = totalRemito();
    var m1 = Math.min(Math.max(0, +R.monto1 || 0), total);
    var d = TIPOS_PAGO[R.pago2] || {};
    resto.textContent = 'El resto, ' + plata(total - m1) + ', queda en ' +
      ((d.corta || 'el segundo medio').toLowerCase()) + '.';
  }
  if (!cont) return;

  var visibles = partes.filter(function (p) { return p.monto > 0; });
  if (visibles.length < 2) { cont.innerHTML = ''; return; }
  cont.innerHTML =
    '<div class="tarjeta" style="margin:14px 0 0;box-shadow:none">' +
      '<div class="tarjeta-cuerpo" style="padding:12px 14px">' +
        '<div class="campo-etiq">Forma de pago</div>' +
        visibles.map(function (p) {
          var d = TIPOS_PAGO[p.tipo] || TIPOS_PAGO.sin_definir;
          return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">' +
            '<span style="color:' + d.color + ';font-weight:600">' + ic(d.icono, 13) + ' ' + esc(d.etiqueta) + '</span>' +
            '<strong>' + plata(p.monto) + '</strong></div>';
        }).join('') +
      '</div>' +
    '</div>';
}

/* Se escribe cuánto se paga con el primer medio; lo que falta
   para el total va al segundo, sin tener que hacer la cuenta. */
function partesDelFormulario() {
  var total = totalRemito();
  if (!R.pago2) {
    return [{ tipo: R.pago1 || 'sin_definir', monto: total, alias: R.alias1 || null }];
  }
  var m1 = Math.min(Math.max(0, +R.monto1 || 0), total);
  var partes = [{ tipo: R.pago1 || 'sin_definir', monto: m1, alias: R.alias1 || null }];
  if (total - m1 > 0) partes.push({ tipo: R.pago2, monto: total - m1, alias: R.alias2 || null });
  return partes.filter(function (p) { return p.monto > 0; });
}

/* ── Confirmar ───────────────────────────────────────────── */
async function confirmarRemito() {
  var btn = porId('btn-confirmar');
  var total = totalRemito();

  if (!R.nombre.trim()) { toast('Falta el nombre del cliente', 'error'); return; }
  if (!R.filas.some(function (f) { return f.prod && f.cant > 0; })) { toast('Agregá al menos un producto', 'error'); return; }
  if (!R.pago1) { toast('Elegí cómo se paga', 'error'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
  var partes = partesDelFormulario();
  var segunda = partes[1];

  var remito = {
    fecha: R.fecha,
    cliente_nombre: R.nombre.trim(),
    cliente_dir: R.dir || null,
    cliente_loc: R.loc || null,
    cliente_tel: R.tel || null,
    total: total,
    unidades: unidadesRemito(),
    pago: R.pago1,
    alias: aliasDeDeuda() || R.alias1 || null,
    notas: R.notas.trim() || null,
    productos: JSON.stringify(R.filas.filter(function (f) { return f.prod; })
      .map(function (f) {
        var c = usaPrecioDeCaja(f) ? cotizar(f.prod, f.cant) : null;
        return {
          prod: f.prod, cant: +f.cant || 0,
          precio: c ? c.unitario : (+f.precio || 0),
          cajas: c ? c.cajas : 0
        };
      })),
    pagos_detalle: JSON.stringify(partes),
    cobrado_deuda: +R.cobrarDeuda || 0,
    /* El vínculo con el cliente, que no cambia aunque se renombre */
    cliente_num: R.cliente ? R.cliente.num : null,
    created_at: new Date().toISOString()
  };
  if (segunda) {
    remito.pago2_tipo = R.pago2;
    remito.pago2_monto = segunda.monto;
    remito.pago2_alias = R.alias2 || null;
  }

  try {
    /* Antes de escribir: ¿ya hay uno igual hoy? Pasa al tocar dos
       veces confirmar o al recargar el mismo remito sin querer. */
    if (!R.forzarDuplicado) {
      var igual = buscarRemitoIgual(await traerCacheado('remitos'), remito);
      if (igual) {
        if (btn) { btn.disabled = false; btn.innerHTML = ic('check', 16) + ' Confirmar y compartir'; }
        avisarDuplicado(igual);
        return;
      }
    }

    await crear('remitos', remito);
    await saldarDeudasCobradas();
    await marcarAvisoSiSalio();
    toast('Remito guardado');
    await compartirRemito(remito);
    R = remitoVacio();
    irA('inicio');
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerHTML = ic('check', 16) + ' Confirmar y compartir'; }
    toast(e.message, 'error');
  }
}

/* ── Compartir ───────────────────────────────────────────────
   Se dibuja una versión limpia del remito (sin inputs ni botones)
   fuera de pantalla y se captura en alta resolución. Después se
   abre el menú de compartir del celular; si el navegador no lo
   soporta, se descarga la imagen.
   ────────────────────────────────────────────────────────── */
async function compartirRemito(remito) {
  var caja = document.createElement('div');
  caja.style.cssText = 'position:fixed;left:-9999px;top:0;width:520px;background:#fff';
  caja.innerHTML = remitoParaImagen(remito);
  document.body.appendChild(caja);

  try {
    if (typeof html2canvas !== 'function') throw new Error('No se pudo cargar el generador de imágenes');
    var lienzo = await html2canvas(caja.firstChild, {
      scale: 3,                 // alta resolución para que se lea en el celular
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });
    var blob = await new Promise(function (r) { lienzo.toBlob(r, 'image/png'); });
    var nombre = 'remito-' + normalizar(remito.cliente_nombre).replace(/\s+/g, '-') + '-' +
                 claveFecha(remito.fecha) + '.png';
    var archivo = new File([blob], nombre, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Remito de ' + remito.cliente_nombre,
        text: mensajeCompartir(remito)
      });
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Imagen descargada');
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;   // cerró el menú de compartir: no es un error
    console.warn('compartir:', e.message);
    toast('El remito se guardó, pero no se pudo generar la imagen', 'error');
  } finally {
    caja.remove();
  }
}

/* Versión estática del remito, solo para la foto */
function remitoParaImagen(r) {
  var prods = [];
  try { prods = JSON.parse(r.productos || '[]'); } catch (e) {}
  var partes = [];
  try { partes = JSON.parse(r.pagos_detalle || '[]'); } catch (e) {}
  var visibles = partes.filter(function (p) { return p.monto > 0; });

  return '<div style="font-family:Inter,Arial,sans-serif;color:#1e1a1a;background:#fff;padding:26px">' +
    '<div style="display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #ede8e8">' +
      '<img src="' + LOGO_INTENCIONAL + '" style="width:46px;height:46px;object-fit:contain"/>' +
      '<div>' +
        '<div style="font-family:Georgia,serif;font-size:21px;font-weight:600">Intencional</div>' +
        '<div style="font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:#9c8b88;margin-top:2px">Esmaltes · Cremas · Belleza</div>' +
      '</div>' +
      '<div style="margin-left:auto;text-align:right">' +
        '<div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88">Fecha</div>' +
        '<div style="font-weight:600;font-size:14px">' + esc(r.fecha) + '</div>' +
      '</div>' +
    '</div>' +

    '<div style="padding:16px 0;border-bottom:1px solid #ede8e8">' +
      '<div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88">Cliente</div>' +
      '<div style="font-size:17px;font-weight:600;margin-top:2px">' + esc(r.cliente_nombre) + '</div>' +
      '<div style="font-size:13px;color:#5a4e4c;margin-top:3px">' +
        [r.cliente_dir, r.cliente_loc, r.cliente_tel].filter(Boolean).map(esc).join(' · ') + '</div>' +
    '</div>' +

    '<table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:13px">' +
      '<thead><tr>' +
        '<th style="text-align:left;padding:7px 0;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88;border-bottom:1px solid #ede8e8">Producto</th>' +
        '<th style="text-align:right;padding:7px 0;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88;border-bottom:1px solid #ede8e8">Cant</th>' +
        '<th style="text-align:right;padding:7px 0;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88;border-bottom:1px solid #ede8e8">Precio</th>' +
        '<th style="text-align:right;padding:7px 0;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88;border-bottom:1px solid #ede8e8">Subtotal</th>' +
      '</tr></thead><tbody>' +
      prods.map(function (p) {
        return '<tr>' +
          '<td style="padding:8px 0;border-bottom:1px solid #f5f0f0">' + esc(p.prod) + '</td>' +
          '<td style="padding:8px 0;text-align:right;border-bottom:1px solid #f5f0f0">' + (+p.cant || 0) + '</td>' +
          '<td style="padding:8px 0;text-align:right;border-bottom:1px solid #f5f0f0">' + plata(p.precio) + '</td>' +
          '<td style="padding:8px 0;text-align:right;border-bottom:1px solid #f5f0f0;font-weight:600">' +
            plata((+p.cant || 0) * (+p.precio || 0)) + '</td>' +
        '</tr>';
      }).join('') +
    '</tbody></table>' +

    (+r.cobrado_deuda > 0
      ? '<div style="margin-top:12px;border:1px solid #cde9d5;background:#f2fbf5;border-radius:10px;padding:10px 13px;font-size:13px;color:#1c6b3f">' +
        '<div style="display:flex;justify-content:space-between"><span>Productos de hoy</span>' +
          '<strong>' + plata((+r.total || 0) - (+r.cobrado_deuda || 0)) + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between"><span>Deuda anterior que se paga hoy</span>' +
          '<strong>' + plata(r.cobrado_deuda) + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:4px;padding-top:4px;border-top:1px solid #cde9d5">' +
          '<strong>Total a pagar</strong><strong>' + plata(r.total) + '</strong></div>' +
        '<div style="text-align:center;margin-top:5px">✓ Con esto la deuda anterior queda saldada</div>' +
      '</div>'
      : '') +

    (r.motivo === 'sin_ventas'
      ? '<div style="margin-top:14px;border:1px solid #ead8e4;background:#fbf2f7;border-radius:10px;padding:10px 12px;font-size:13px;color:#8a2f68;text-align:center">' +
        '<strong>Visita sin reposición</strong> — el cliente no vendió</div>'
      : '') +

    (r.motivo === 'retiro_exhibidor'
      ? '<div style="margin-top:14px;border:1px solid #ead8e4;background:#fbf2f7;border-radius:10px;padding:10px 13px;font-size:13px;color:#8a2f68">' +
        '<div style="text-align:center;font-weight:700;margin-bottom:4px">Se retiró el exhibidor</div>' +
        '<div style="text-align:center">' +
          (deudaPendiente(r) > 0
            ? 'Queda una deuda pendiente de <strong>' + plata(deudaPendiente(r)) + '</strong>.'
            : 'La cuenta queda saldada: el cliente no tiene deuda.') +
        '</div></div>'
      : '') +

    (r.notas
      ? '<div style="margin-top:14px;background:#fbf2f7;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#5a4e4c">' +
        '<strong>Notas:</strong> ' + esc(r.notas) + '</div>'
      : '') +

    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid #ede8e8">' +
      '<div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#9c8b88">Total</div>' +
      '<div style="font-size:27px;font-weight:700;color:#c84b8c">' + plata(r.total) + '</div>' +
    '</div>' +

    (visibles.length
      ? '<div style="margin-top:12px;border:1px solid #ead8e4;border-radius:10px;padding:10px 13px;background:#fffafd">' +
        '<div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#b099a8;margin-bottom:4px">Forma de pago</div>' +
        visibles.map(function (p) {
          var d = TIPOS_PAGO[p.tipo] || TIPOS_PAGO.sin_definir;
          return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px">' +
            '<span style="color:' + d.color + ';font-weight:600">' + esc(d.etiqueta) + '</span>' +
            '<strong>' + plata(p.monto) + '</strong></div>';
        }).join('') +
      '</div>'
      : '') +

    (visibles.some(function (p) { return p.tipo === 'deuda'; })
      ? '<div style="margin-top:12px;border:1px solid #fed7aa;background:#fff7ed;border-radius:10px;padding:10px 13px;font-size:12.5px;color:#9a3412;line-height:1.5">' +
        '⚠️ <strong>Pago pendiente</strong> — ' +
        esc(textoPagoPendiente(r.alias || r.pago2_alias).replace('Pago pendiente — ', '')) + '</div>'
      : '') +

    (aumentoConfig().activo && !!R.cliente && !clienteAvisado(R.cliente) && !clienteReciente(R.cliente)
      ? '<div style="margin-top:12px;border:1px solid #fed7aa;background:#fff7ed;border-radius:10px;padding:10px 13px;font-size:12.5px;color:#9a3412;line-height:1.5">' +
        '<strong>Aviso:</strong> ' + esc(textoAviso(aumentoConfig().nuevo)) + '</div>'
      : '') +

    '<div style="margin-top:18px;text-align:center;font-size:11px;color:#9c8b88">Documento no válido como factura</div>' +
    '<div style="margin-top:4px;text-align:center;font-family:Georgia,serif;font-size:13px;color:#c84b8c">¡Gracias por elegirnos!</div>' +
  '</div>';
}

/* Si el aviso salió impreso en el remito, queda registrado con la fecha */
async function marcarAvisoSiSalio() {
  var c = R.cliente;
  if (!c || !c.num || clienteAvisado(c)) return;
  if (!aumentoConfig().activo) return;
  try {
    await actualizar('clientes', c.num, { aviso_aumento: true, aviso_aumento_fecha: hoyISO() });
    c.aviso_aumento = true;
    c.aviso_aumento_fecha = hoyISO();
  } catch (e) { console.warn('no se pudo marcar el aviso:', e.message); }
}


/* Ya existe uno igual: se pregunta en vez de duplicar en silencio */
function avisarDuplicado(igual) {
  abrirModal('¿Seguro que no está cargado?',
    avisoHTML('warn',
      'Hoy ya hay un remito de <strong>' + esc(igual.cliente_nombre) + '</strong> por ' +
      plata(igual.total) + ' con las mismas unidades. ' +
      'Puede que se haya guardado al tocar confirmar dos veces.', 'alert') +
    '<div class="campo-ayuda">Si es otra reposición del mismo día, se puede guardar igual.</div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="cerrarModal()">' +
        'Cancelar</button>' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarIgual()">' +
        'Guardar igual</button>' +
    '</div>');
}

async function guardarIgual() {
  R.forzarDuplicado = true;
  cerrarModal();
  await confirmarRemito();
}

/* Los remitos viejos que se cobraron en este quedan saldados */
async function saldarDeudasCobradas() {
  if (!R.cobrarDeuda || !R.deudasACobrar.length) return;
  var hoy = hoyISO();

  for (var i = 0; i < R.deudasACobrar.length; i++) {
    var viejo = _deudasDelCliente.find(function (r) { return r.id === R.deudasACobrar[i]; });
    if (!viejo) continue;
    try {
      await actualizar('remitos', viejo.id, remitoCobrado(viejo, R.pago1 || 'efectivo', R.alias1, hoy));
    } catch (e) { console.warn('saldar deuda:', e.message); }
  }
  invalidarCache('remitos');
}

/* ═══════════════════════════════════════════════════════════
   COBRAR LA DEUDA EN ESTE REMITO
   Se suma al total y, al confirmar, los remitos viejos quedan
   saldados con la fecha de hoy.
   ═══════════════════════════════════════════════════════════ */
function verDeudaCliente() {
  if (!_deudasDelCliente.length) { toast('No tiene deuda pendiente'); return; }
  var d = remitosConDeuda(_deudasDelCliente);

  abrirModal('Deuda de ' + (R.cliente ? R.cliente.local : ''),
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      plural(d.length, 'remito') + ' sin saldar · <strong>' + plata(_deudaCliente) + '</strong></div>' +
    '<div class="lista">' +
      d.map(function (x) {
        return '<div class="fila" style="cursor:default;align-items:flex-start">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(fechaCorta(x.fecha)) + '</div>' +
            '<div class="fila-sub">hace ' + plural(x.dias, 'día') +
              (x.alias ? ' · iba a transferir a ' + esc(x.alias) : '') +
              (x.remito.notas ? '<br>' + esc(x.remito.notas) : '') + '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(x.monto) + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>',

    (R.cobrarDeuda
      ? '<button class="btn btn-secundario btn-bloque" onclick="sacarDeudaDelRemito()">' +
        ic('undo', 15) + ' Sacarla de este remito</button>'
      : '<button class="btn btn-primario btn-bloque" onclick="cobrarDeudaEnRemito()">' +
        ic('cash', 16) + ' Cobrar ' + plata(_deudaCliente) + ' en este remito</button>'));
}

function cobrarDeudaEnRemito() {
  R.cobrarDeuda = _deudaCliente;
  R.deudasACobrar = _deudasDelCliente.map(function (r) { return r.id; });
  cerrarModal();
  toast('Se sumó ' + plata(_deudaCliente) + ' al remito');
  pintarRemito();
}

function sacarDeudaDelRemito() {
  R.cobrarDeuda = 0;
  R.deudasACobrar = [];
  cerrarModal();
  pintarRemito();
}
