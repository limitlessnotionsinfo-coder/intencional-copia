/* ═══════════════════════════════════════════════════════════
   REMITOS HECHOS — historial con el buscador ampliado:
   número de cliente, zona, nombre y dirección en un solo campo.
   ═══════════════════════════════════════════════════════════ */

var _hechos = [];
var _porNombre = {};      // nombre normalizado → cliente, para poder buscar por número
var _topeHechos = 40;

/* Todos los filtros en un solo objeto: así se limpian de una */
var F = {
  q: '', estado: '', pago: '', desde: '', hasta: '', min: '', max: '', loc: ''
};

registrarPagina({
  id: 'hechos',
  menu: 'Remitos hechos',
  grupo: 'Día a día',
  icono: 'clipboard',
  titulo: 'Remitos hechos',
  subtitulo: 'Buscá por número de cliente, nombre, zona o dirección',

  async montar(cont, params) {
    F.q = params.get('q') || '';
    F.estado = params.get('filtro') || '';
    _topeHechos = 40;

    var res = await Promise.all([traerCacheado('remitos'), traerCacheado('clientes')]);
    _hechos = res[0].slice().reverse();

    /* El remito guarda el nombre del cliente pero no su número.
       Este índice permite igual buscar por número: se resuelve
       contra la tabla de clientes por nombre. */
    _porNombre = {};
    res[1].forEach(function (c) { _porNombre[normalizar(c.local)] = c; });

    cont.innerHTML =
      '<div class="buscador" style="margin-bottom:12px">' +
        '<span class="ic-lupa">' + ic('search', 16) + '</span>' +
        '<input class="campo-input" id="q-hechos" type="search" autocomplete="off" ' +
               'placeholder="Número, nombre, zona o dirección" ' +
               'value="' + esc(F.q) + '" oninput="setF(\'q\',this.value)"/>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
        chipFiltro('estado', '', 'Todos') +
        chipFiltro('estado', 'deuda', 'Con deuda') +
        chipFiltro('estado', 'cobrado', 'Deudas cobradas') +
        chipFiltro('estado', 'cerrado', 'Estaban cerrados') +
      '</div>' +
      panelFiltros() +
      '<div id="resumen-hechos"></div>' +
      '<div id="lista-hechos"></div>';

    pintarHechos();
  }
});

/* ── Filtros finos, plegados para no ocupar lugar ────────── */
function panelFiltros() {
  var opcionesPago = [['', 'Cualquiera'], ['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['deuda', 'Deuda']];
  return '<details class="tarjeta" id="det-filtros">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('shuffle', 16) + ' Más filtros' +
      '<span style="margin-left:auto" id="chip-filtros"></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Medio de pago</div>' +
          '<select class="campo-input" onchange="setF(\'pago\',this.value)">' +
            opcionesPago.map(function (o) {
              return '<option value="' + o[0] + '"' + (F.pago === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Localidad</div>' +
          '<input class="campo-input" value="' + esc(F.loc) + '" placeholder="Ej: chascomus" oninput="setF(\'loc\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Desde</div>' +
          '<input class="campo-input" type="date" value="' + esc(F.desde) + '" onchange="setF(\'desde\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Hasta</div>' +
          '<input class="campo-input" type="date" value="' + esc(F.hasta) + '" onchange="setF(\'hasta\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Monto desde</div>' +
          '<input class="campo-input" type="number" inputmode="decimal" value="' + esc(F.min) + '" oninput="setF(\'min\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Monto hasta</div>' +
          '<input class="campo-input" type="number" inputmode="decimal" value="' + esc(F.max) + '" oninput="setF(\'max\',this.value)"/></div>' +
      '</div>' +
      '<button class="btn btn-secundario btn-bloque" style="margin-top:12px" onclick="limpiarFiltros()">' +
        ic('undo', 15) + ' Limpiar filtros</button>' +
    '</div>' +
  '</details>';
}

function setF(campo, valor) {
  F[campo] = valor;
  _topeHechos = 40;
  pintarHechos();
}

function limpiarFiltros() {
  Object.keys(F).forEach(function (k) { F[k] = ''; });
  pintarRuta();
}

function cuantosFiltros() {
  return ['pago', 'desde', 'hasta', 'min', 'max', 'loc'].filter(function (k) { return F[k]; }).length;
}

function chipFiltro(campo, valor, etiqueta) {
  return '<button class="btn ' + (F[campo] === valor ? 'btn-primario' : 'btn-secundario') + '" ' +
    'style="padding:7px 13px" onclick="setF(\'' + campo + '\',\'' + valor + '\');pintarChips()">' + esc(etiqueta) + '</button>';
}

/* Repinta los chips de estado sin rearmar toda la pantalla */
function pintarChips() {
  var cont = porId('lista-hechos');
  if (cont) pintarRuta();
}

function filtrarHechos(v) { setF('q', v); }
function verMasHechos() { _topeHechos += 40; pintarHechos(); }

/* Un remito coincide si coincide su propio texto o el del cliente
   al que pertenece (por eso el índice por nombre). */
function coincideRemito(r, termino) {
  var t = normalizar(termino);
  if (!t) return true;
  if (normalizar(r.cliente_nombre).indexOf(t) !== -1) return true;
  if (normalizar(r.cliente_loc).indexOf(t) !== -1) return true;
  if (normalizar(r.cliente_dir).indexOf(t) !== -1) return true;
  var c = _porNombre[normalizar(r.cliente_nombre)];
  if (c && (normalizar(c.num_str).indexOf(t) !== -1 || String(c.num || '').indexOf(t) !== -1)) return true;
  return false;
}

function hechosFiltrados() {
  var min = F.min === '' ? null : +F.min;
  var max = F.max === '' ? null : +F.max;

  return _hechos.filter(function (r) {
    if (F.estado === 'deuda'   && !tieneDeuda(r)) return false;
    if (F.estado === 'cobrado' && !bool(r.saldado)) return false;
    if (F.estado === 'cerrado' && r.motivo !== 'cerrado') return false;

    if (F.pago && !partesPago(r).some(function (p) { return p.tipo === F.pago && p.monto > 0; })) return false;
    if (F.loc && normalizar(r.cliente_loc).indexOf(normalizar(F.loc)) === -1) return false;

    var k = claveFecha(r.fecha || r.created_at);
    if (F.desde && (!k || k < F.desde)) return false;
    if (F.hasta && (!k || k > F.hasta)) return false;

    var total = +r.total || 0;
    if (min !== null && total < min) return false;
    if (max !== null && total > max) return false;

    return coincideRemito(r, F.q);
  });
}

function pintarHechos() {
  var lista = hechosFiltrados();
  var res = resumirRemitos(lista);

  var resumen = porId('resumen-hechos');
  if (resumen) {
    resumen.innerHTML = '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('clipboard', 'Remitos', String(res.cantidad), plural(res.unidades, 'unidad', 'unidades'), 'var(--violet)') +
      stat('receipt', 'Facturado', plata(res.facturado), '', 'var(--rose)') +
      stat('cash', 'Cobrado', plata(res.efectivo + res.transferencia), '', 'var(--ok)') +
      (res.deuda > 0 ? stat('clock', 'En deuda', plata(res.deuda), '', 'var(--warn)') : '') +
    '</div>';
  }

  var cont = porId('lista-hechos');
  if (!cont) return;
  var chip = porId('chip-filtros');
  if (chip) {
    var n = cuantosFiltros();
    chip.innerHTML = n ? '<span class="pin pin-info">' + plural(n, 'filtro') + '</span>' : '';
  }

  if (!lista.length) {
    cont.innerHTML = vacio('search', 'Sin resultados',
      'Probá aflojando los filtros o buscando por el número de cliente.',
      '<button class="btn btn-secundario" onclick="limpiarFiltros()">Limpiar filtros</button>');
    return;
  }

  cont.innerHTML =
    '<div class="lista">' + lista.slice(0, _topeHechos).map(filaHecho).join('') + '</div>' +
    (lista.length > _topeHechos
      ? '<button class="btn btn-secundario btn-bloque" style="margin-top:12px" onclick="verMasHechos()">Ver más</button>'
      : '');
}

function filaHecho(r) {
  var c = _porNombre[normalizar(r.cliente_nombre)];
  var cerrado = r.motivo === 'cerrado';
  var demora = demoraDePago(r);
  return '<button class="fila" onclick="verRemito(' + r.id + ')">' +
    (c ? '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' : '') +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(r.cliente_nombre || 'Sin cliente') +
        (cerrado ? ' <span class="pin pin-neutro">' + ic('ban', 12) + ' Cerrado</span>' : '') + '</div>' +
      '<div class="fila-sub">' + [fechaCorta(r.fecha), r.cliente_loc, r.cliente_dir].filter(Boolean).map(esc).join(' · ') + '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(r.total) + '</div>' +
      '<div style="margin-top:4px">' + pagoHTML(r) +
        (demora !== null ? ' <span class="pin pin-ok">cobrado en ' + plural(demora, 'día') + '</span>' : '') +
      '</div>' +
    '</div>' +
  '</button>';
}

var _remitoAbierto = null;

function verRemito(id) {
  var r = _hechos.find(function (x) { return String(x.id) === String(id); });
  if (!r) return;
  _remitoAbierto = r;

  var deuda = deudaPendiente(r);
  var demora = demoraDePago(r);

  abrirModal('Remito de ' + (r.cliente_nombre || '—'),
    /* Arriba, el remito tal cual se envió */
    '<div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:14px">' +
      remitoParaImagen(r) +
    '</div>' +

    (demora !== null
      ? avisoHTML('ok', 'Deuda cobrada el <strong>' + esc(fechaCorta(r.saldado_fecha)) + '</strong>, ' +
          plural(demora, 'día') + ' después del remito.', 'check')
      : '') +

    (deuda > 0
      ? avisoHTML('warn', 'Quedan <strong>' + plata(deuda) + '</strong> sin cobrar.', 'clock')
      : ''),

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      (deuda > 0
        ? '<button class="btn btn-primario" style="flex:1;min-width:140px" onclick="abrirCobro()">' +
          ic('cash', 15) + ' Cobrar ' + plata(deuda) + '</button>'
        : '') +
      '<button class="btn btn-secundario" onclick="editarRemito()">' + ic('edit', 15) + ' Editar</button>' +
      '<button class="btn btn-secundario" onclick="reenviarRemito()">' + ic('upload', 15) + ' Reenviar</button>' +
      '<button class="btn btn-peligro" onclick="borrarRemito()">' + ic('trash', 15) + ' Borrar</button>' +
    '</div>');
}

/* ── Cobrar una deuda ────────────────────────────────────── */
function abrirCobro() {
  var r = _remitoAbierto; if (!r) return;
  var deuda = deudaPendiente(r);
  var sugerido = aliasSugerido(_hechos, []);

  abrirModal('Cobrar ' + plata(deuda),
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'De <strong>' + esc(r.cliente_nombre) + '</strong>, del remito del ' + esc(fechaCorta(r.fecha)) + '.</p>' +
    '<div class="campo" style="margin-top:14px"><div class="campo-etiq">¿Cómo pagó?</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn btn-secundario cobro-medio" id="cm-efectivo" onclick="setMedioCobro(\'efectivo\')">' +
          ic('cash', 15) + ' Efectivo</button>' +
        '<button class="btn btn-secundario cobro-medio" id="cm-transferencia" onclick="setMedioCobro(\'transferencia\')">' +
          ic('smartphone', 15) + ' Transferencia</button>' +
      '</div>' +
    '</div>' +
    '<div id="cobro-alias"></div>' +
    '<div class="campo"><div class="campo-etiq">Fecha del cobro</div>' +
      '<input class="campo-input" type="date" id="cobro-fecha" value="' + hoyISO() + '"/></div>' +
    '<div id="cobro-estado"></div>',
    '<button class="btn btn-primario btn-bloque" id="btn-cobrar" onclick="confirmarCobro()" disabled>Registrar el cobro</button>');

  window._medioCobro = '';
  window._aliasCobro = sugerido || '';
}

function setMedioCobro(medio) {
  window._medioCobro = medio;
  ['efectivo', 'transferencia'].forEach(function (m) {
    var b = porId('cm-' + m);
    if (b) b.className = 'btn cobro-medio ' + (m === medio ? 'btn-primario' : 'btn-secundario');
  });

  var cont = porId('cobro-alias');
  if (medio === 'transferencia') {
    var lista = aliasConfigurados();
    cont.innerHTML = '<div class="campo"><div class="campo-etiq">¿A qué alias entró?</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        lista.map(function (a) {
          return '<button class="btn ' + (mismoAlias(a, window._aliasCobro) ? 'btn-primario' : 'btn-secundario') + '" ' +
            'onclick="window._aliasCobro=\'' + esc(a).replace(/'/g, "\\'") + '\';setMedioCobro(\'transferencia\')">' +
            esc(a) + '</button>';
        }).join('') +
      '</div></div>';
  } else {
    cont.innerHTML = '';
    window._aliasCobro = '';
  }
  var btn = porId('btn-cobrar');
  if (btn) btn.disabled = false;
}

async function confirmarCobro() {
  var r = _remitoAbierto;
  var medio = window._medioCobro;
  if (!r || !medio) { toast('Elegí cómo pagó', 'error'); return; }

  var fecha = porId('cobro-fecha').value || hoyISO();
  var monto = deudaPendiente(r);
  var btn = porId('btn-cobrar');
  if (btn) { btn.disabled = true; btn.textContent = 'Registrando…'; }

  try {
    var cambios = remitoCobrado(r, medio, window._aliasCobro, fecha);
    await actualizar('remitos', r.id, cambios);

    /* Queda también como movimiento suelto, para el balance de alias */
    await crear('pagos', {
      cliente_nombre: r.cliente_nombre,
      remito_id: r.id,
      monto: monto,
      medio: medio,
      alias: window._aliasCobro || null,
      fecha: fecha,
      created_at: new Date().toISOString()
    });

    cerrarModal();
    toast('Cobro registrado: ' + plata(monto));
    pintarRuta();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Registrar el cobro'; }
    toast(e.message, 'error');
  }
}

/* ── Editar ──────────────────────────────────────────────── */
function editarRemito() {
  var r = _remitoAbierto; if (!r) return;
  var prods = [];
  try { prods = JSON.parse(r.productos || '[]'); } catch (e) {}

  abrirModal('Editar remito',
    '<div class="campo"><div class="campo-etiq">Cliente</div>' +
      '<input class="campo-input" id="ed-nombre" value="' + esc(r.cliente_nombre || '') + '"/></div>' +
    '<div class="campo"><div class="campo-etiq">Fecha</div>' +
      '<input class="campo-input" id="ed-fecha" value="' + esc(r.fecha || '') + '"/></div>' +
    '<div class="campo"><div class="campo-etiq">Dirección</div>' +
      '<input class="campo-input" id="ed-dir" value="' + esc(r.cliente_dir || '') + '"/></div>' +
    '<div class="campo"><div class="campo-etiq">Localidad</div>' +
      '<input class="campo-input" id="ed-loc" value="' + esc(r.cliente_loc || '') + '"/></div>' +
    '<div class="campo"><div class="campo-etiq">Teléfono</div>' +
      '<input class="campo-input" id="ed-tel" value="' + esc(r.cliente_tel || '') + '"/></div>' +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Notas</div>' +
      '<input class="campo-input" id="ed-notas" value="' + esc(r.notas || '') + '"/></div>' +
    '<div class="campo-ayuda" style="margin-top:10px">' +
      'Los productos (' + plural(prods.length, 'renglón', 'renglones') + ', ' + plata(r.total) + ') no se editan acá: ' +
      'si cambió lo que llevó, conviene borrar el remito y cargarlo de nuevo.</div>',
    '<button class="btn btn-primario btn-bloque" onclick="guardarEdicionRemito()">Guardar cambios</button>');
}

async function guardarEdicionRemito() {
  var r = _remitoAbierto; if (!r) return;
  var cambios = {};
  var campos = { nombre: 'cliente_nombre', fecha: 'fecha', dir: 'cliente_dir', loc: 'cliente_loc', tel: 'cliente_tel', notas: 'notas' };
  Object.keys(campos).forEach(function (k) {
    var el = porId('ed-' + k); if (!el) return;
    var v = el.value.trim();
    if (v !== (r[campos[k]] || '')) cambios[campos[k]] = v || null;
  });
  if (!Object.keys(cambios).length) { cerrarModal(); return; }
  try {
    await actualizar('remitos', r.id, cambios);
    cerrarModal();
    toast('Remito actualizado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Borrar ──────────────────────────────────────────────── */
function borrarRemito() {
  var r = _remitoAbierto; if (!r) return;
  abrirModal('Borrar el remito',
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se borra el remito de <strong>' + esc(r.cliente_nombre) + '</strong> del ' + esc(fechaCorta(r.fecha)) +
      ' por ' + plata(r.total) + '. No se puede deshacer.</p>',
    '<button class="btn btn-peligro btn-bloque" onclick="confirmarBorrado()">Sí, borrarlo</button>');
}

async function confirmarBorrado() {
  var r = _remitoAbierto; if (!r) return;
  try {
    await borrar('remitos', r.id);
    cerrarModal();
    toast('Remito borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Reenviar: misma imagen que se mandó la primera vez ──── */
async function reenviarRemito() {
  var r = _remitoAbierto; if (!r) return;
  cerrarModal();
  await compartirRemito(r);
}

function dato(etiqueta, valor) {
  return '<div><div class="campo-etiq">' + esc(etiqueta) + '</div>' +
    '<div style="font-size:13px;font-weight:600">' + esc(valor) + '</div></div>';
}
