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
    /* Los filtros solo se reinician si vienen en la URL o si se
       entra de limpio; si no, se conservan entre repintados. */
    if (params.get('q') !== null) F.q = params.get('q');
    if (params.get('filtro') !== null) F.estado = params.get('filtro');
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
      '<div id="chips-estado" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"></div>' +
      panelFiltros() +
      '<div id="resumen-hechos"></div>' +
      '<div id="lista-hechos"></div>';

    pintarChips();
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
      '<div class="grilla-filtros">' +
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
          inputMonto('f-min', F.min, 'setF(\'min\',String(leerMonto(this)||\'\'))') + '</div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Monto hasta</div>' +
          inputMonto('f-max', F.max, 'setF(\'max\',String(leerMonto(this)||\'\'))') + '</div>' +
      '</div>' +
      '<button class="btn btn-secundario btn-bloque" style="margin-top:12px" onclick="limpiarFiltros()">' +
        ic('undo', 15) + ' Limpiar filtros</button>' +
    '</div>' +
  '</details>';
}

function setF(campo, valor) {
  F[campo] = valor;
  _topeHechos = 40;
  pintarChips();
  pintarHechos();
}

function limpiarFiltros() {
  Object.keys(F).forEach(function (k) { F[k] = ''; });
  var det = porId('det-filtros');
  var abierto = det && det.open;
  irA('hechos', 'q=&filtro=');
  if (abierto) setTimeout(function () { var d = porId('det-filtros'); if (d) d.open = true; }, 30);
}

function cuantosFiltros() {
  return ['pago', 'desde', 'hasta', 'min', 'max', 'loc'].filter(function (k) { return F[k]; }).length;
}

function chipFiltro(campo, valor, etiqueta) {
  return '<button class="btn ' + (F[campo] === valor ? 'btn-primario' : 'btn-secundario') + '" ' +
    'style="padding:7px 13px" onclick="setF(\'' + campo + '\',\'' + valor + '\')">' + esc(etiqueta) + '</button>';
}

/* Los chips se redibujan solos: nada de remontar la pantalla,
   que era lo que borraba los filtros. */
function pintarChips() {
  var cont = porId('chips-estado');
  if (!cont) return;
  cont.innerHTML =
    chipFiltro('estado', '', 'Todos') +
    chipFiltro('estado', 'deuda', 'Con deuda') +
    chipFiltro('estado', 'cobrado', 'Deudas cobradas') +
    chipFiltro('estado', 'cerrado', 'Estaban cerrados');
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
    if (F.estado === 'retiro'  && r.motivo !== 'retiro_exhibidor') return false;
    if (F.estado === 'sinventas' && r.motivo !== 'sin_ventas') return false;

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
    /* La deuda que se muestra es la que sigue sin cobrarse, no la
       que quedó anotada en su momento. */
    var pendiente = lista.reduce(function (a, r) { return a + deudaPendiente(r); }, 0);
    var deudores = {};
    lista.forEach(function (r) { if (deudaPendiente(r) > 0) deudores[normalizar(r.cliente_nombre)] = 1; });

    resumen.innerHTML = '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('clipboard', 'Remitos', String(res.cantidad), plural(res.unidades, 'unidad', 'unidades'), 'var(--violet)',
           'detalleRemitos()') +
      stat('clock', 'Deuda por cobrar', plata(pendiente),
           pendiente > 0 ? plural(Object.keys(deudores).length, 'cliente') : 'todo cobrado',
           pendiente > 0 ? 'var(--warn)' : 'var(--ok)',
           pendiente > 0 ? 'detalleDeuda()' : '') +
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
  var retiro = r.motivo === 'retiro_exhibidor';
  var sinVentas = r.motivo === 'sin_ventas';
  var demora = demoraDePago(r);
  return '<button class="fila" onclick="verRemito(' + r.id + ')">' +
    (c ? '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' : '') +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(r.cliente_nombre || 'Sin cliente') +
        (cerrado ? ' <span class="pin pin-neutro">' + ic('ban', 12) + ' Cerrado</span>' : '') +
        (retiro ? ' <span class="pin pin-warn">' + ic('box', 12) + ' Exhibidor retirado</span>' : '') +
        (sinVentas ? ' <span class="pin pin-neutro">' + ic('minus', 12) + ' No vendió</span>' : '') + '</div>' +
      '<div class="fila-sub">' + [fechaCorta(r.fecha), r.cliente_loc, r.cliente_dir].filter(Boolean).map(esc).join(' · ') + '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(r.total) + '</div>' +
      '<div class="pagos" style="margin-top:4px">' + pagoHTML(r) +
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
        ? '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="abrirCobro()">' +
          ic('cash', 15) + ' Cobrar ' + plata(deuda) + '</button>'
        : '') +
      (deuda > 0 && enlaceReclamo(r)
        ? '<a class="btn btn-secundario" href="' + esc(enlaceReclamo(r)) + '" ' +
          'target="_blank" rel="noopener">' + ic('phone', 15) + ' Reclamar</a>'
        : '') +
      '<button class="btn btn-secundario" onclick="verImagenRemito()">' +
        ic('eye', 15) + ' Ver imagen</button>' +
      '<button class="btn btn-secundario" onclick="enviarRemito()">' +
        ic('upload', 15) + ' Enviar</button>' +
      '<button class="btn btn-secundario" onclick="editarRemito()">' + ic('edit', 15) + ' Editar</button>' +
      '<button class="btn btn-peligro" onclick="borrarRemito()">' + ic('trash', 15) + ' Borrar</button>' +
    '</div>');
}

/* ── Cobrar una deuda ────────────────────────────────────── */
/* ── El teléfono del cliente ─────────────────────────────────
   El remito guarda el teléfono del día que se emitió, pero 180
   de los 1029 quedaron sin él. Si falta, se busca en la ficha
   del cliente: el número es del cliente, no del remito.
   ────────────────────────────────────────────────────────── */
function telDelRemito(r) {
  if (!r) return '';
  if (enlaceWhatsapp(r.cliente_tel, '')) return r.cliente_tel;

  var c = _porNombre[normalizar(r.cliente_nombre)];
  if (c && enlaceWhatsapp(c.tel, '')) return c.tel;
  if (c && enlaceWhatsapp(c.tel2, '')) return c.tel2;
  return '';
}

/* El enlace para reclamar una deuda, o vacío si no hay teléfono */
function enlaceReclamo(r) {
  var tel = telDelRemito(r);
  return tel ? enlaceWhatsapp(tel, mensajeCobroDeuda(r)) : '';
}

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
    '<div id="cobro-estado"></div>' +

    /* Antes de cobrar, la opción de reclamarlo */
    (enlaceReclamo(r)
      ? '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">' +
          '<div class="campo-etiq" style="margin:0 0 6px">¿Todavía no pagó?</div>' +
          '<a class="btn btn-secundario btn-bloque" href="' + esc(enlaceReclamo(r)) + '" ' +
             'target="_blank" rel="noopener">' +
            ic('phone', 15) + ' Reclamarle por WhatsApp</a>' +
          '<div class="campo-ayuda">Con el alias al que se le pidió transferir y hace cuántos días.</div>' +
        '</div>'
      : '<div class="campo-ayuda" style="margin-top:12px">' +
        'Para reclamarle por WhatsApp hace falta el teléfono: cargalo en su ficha.</div>'),

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
    await recargarHechos();
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
    await recargarHechos();
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
    await recargarHechos();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Reenviar: misma imagen que se mandó la primera vez ──── */
/* Copia el remito y abre el chat, igual que al crearlo */
/* ── Ver el comprobante en pantalla ──────────────────────────
   En la computadora no hay menú de compartir, así que sin esto
   no había forma de ver la imagen.
   ────────────────────────────────────────────────────────── */
function verImagenRemito() {
  var r = _remitoAbierto;
  if (!r) return;

  abrirModal('Remito de ' + (r.cliente_nombre || ''),
    '<div class="visor-remito" id="visor-remito">' + remitoParaImagen(r) + '</div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:130px" onclick="enviarRemito()">' +
        ic('upload', 15) + ' Enviar</button>' +
      '<button class="btn btn-secundario" onclick="bajarImagenRemito()">' +
        ic('download', 15) + ' Descargar</button>' +
    '</div>');

  ajustarVisor();
}

/* El comprobante se dibuja a 520px de ancho. Se escala para que
   entre, y se le fija el alto: si no, queda un hueco abajo del
   tamaño de lo que se achicó. */
function ajustarVisor() {
  var visor = porId('visor-remito');
  if (!visor || !visor.firstElementChild) return;

  var ancho = visor.clientWidth || 520;
  var escala = Math.min(1, ancho / 520);
  visor.style.setProperty('--escala-remito', escala);
  visor.style.height = Math.ceil(visor.firstElementChild.offsetHeight * escala) + 'px';
}

async function bajarImagenRemito() {
  var r = _remitoAbierto;
  if (!r) return;
  try {
    var img = await imagenDelRemito(r);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(img.blob);
    a.download = img.nombre;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Descargado');
  } catch (e) { toast(e.message, 'error'); }
}

/* Un solo camino de envío: antes "Reenviar" y "WhatsApp"
   terminaban los dos acá y hacían exactamente lo mismo. */
async function enviarRemito() {
  var r = _remitoAbierto; if (!r) return;
  cerrarModal();
  await compartirRemito(r);
}

function dato(etiqueta, valor) {
  return '<div><div class="campo-etiq">' + esc(etiqueta) + '</div>' +
    '<div style="font-size:13px;font-weight:600">' + esc(valor) + '</div></div>';
}


/* Vuelve a leer los remitos sin perder los filtros puestos */
async function recargarHechos() {
  invalidarCache('remitos');
  _hechos = (await traerCacheado('remitos')).slice().reverse();
  pintarChips();
  pintarHechos();
}


/* ── Detalle de las tarjetas ─────────────────────────────── */
function detalleRemitos() {
  var lista = hechosFiltrados();
  var res = resumirRemitos(lista);
  var porTipo = {};
  lista.forEach(function (r) {
    partesPago(r).forEach(function (p) {
      if (p.monto > 0) porTipo[p.tipo] = (porTipo[p.tipo] || 0) + p.monto;
    });
  });

  abrirModal('Resumen de ' + plural(lista.length, 'remito'),
    '<div class="grilla-stats" style="margin-bottom:12px">' +
      stat('receipt', 'Facturado', plata(res.facturado), '', 'var(--rose)') +
      stat('box', 'Unidades', String(res.unidades), '', 'var(--text2)') +
      stat('users', 'Clientes', String(Object.keys(lista.reduce(function (a, r) {
        a[normalizar(r.cliente_nombre)] = 1; return a;
      }, {})).length), '', 'var(--violet)') +
    '</div>' +
    '<div class="eyebrow">Cómo pagaron</div>' +
    Object.keys(porTipo).map(function (t) {
      var d = TIPOS_PAGO[t] || TIPOS_PAGO.sin_definir;
      return '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px">' +
        '<span style="color:' + d.color + ';font-weight:600">' + esc(d.etiqueta) + '</span>' +
        '<strong>' + plata(porTipo[t]) + '</strong></div>';
    }).join(''));
}

function detalleDeuda() {
  var conDeuda = hechosFiltrados().filter(function (r) { return deudaPendiente(r) > 0; });
  var d = resumenDeudas(conDeuda);

  abrirModal('Deuda por cobrar',
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      plural(d.clientes, 'cliente') + ' · <strong>' + plata(d.total) + '</strong></div>' +
    '<div class="lista">' +
      d.items.map(function (x) {
        var reclamo = enlaceReclamo(x.remito);
        return '<div class="fila" style="cursor:default">' +
          '<button class="fila-principal" style="background:none;border:none;text-align:left;padding:0;cursor:pointer" ' +
                  'onclick="cerrarModal();verRemito(' + x.remito.id + ')">' +
            '<div class="fila-titulo">' + esc(x.cliente) + '</div>' +
            '<div class="fila-sub">' + esc(fechaCorta(x.fecha)) + ' · hace ' + plural(x.dias, 'día') +
              (x.alias ? ' · a ' + esc(x.alias) : '') + '</div>' +
          '</button>' +
          '<div class="fila-derecha">' +
            '<div class="fila-titulo">' + plata(x.monto) + '</div>' +
            (reclamo
              ? '<a class="ir-a" href="' + esc(reclamo) + '" target="_blank" rel="noopener">' +
                ic('phone', 11) + ' Reclamar</a>'
              : '<span class="ir-a" style="color:var(--muted)">sin teléfono</span>') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>');
}


/* Si se gira el teléfono, el visor se recalcula */
window.addEventListener('resize', function () {
  if (porId('visor-remito')) ajustarVisor();
});
