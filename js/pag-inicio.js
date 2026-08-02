/* ═══════════════════════════════════════════════════════════
   INICIO — pendientes, cómo viene el día y los atajos.
   Los dos bloques largos (pendientes y los remitos de hoy) se
   pliegan, así la pantalla entra de una en el celular.
   ═══════════════════════════════════════════════════════════ */

var _pendientes = [];

registrarPagina({
  id: 'inicio',
  menu: 'Inicio',
  grupo: 'Día a día',
  icono: 'home',
  titulo: 'Intencional',
  subtitulo: capitalizar(DIAS[new Date().getDay()]) + ', ' + new Date().getDate() + ' de ' + MESES[new Date().getMonth()],

  async montar(cont) {
    await cargarConfig().catch(function () {});
    var datos = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('tareas').catch(function () { return []; }),
      traerCacheado('clientes').catch(function () { return []; }),
      traerCacheado('pedidos').catch(function () { return []; })
    ]);
    var remitos = datos[0];
    _pendientes = datos[1];
    var clientes = datos[2];
    var pedidos = datos[3];

    var hoy = claveFecha(hoyTexto());
    var deHoy = remitos.filter(function (r) {
      return claveFecha(r.fecha) === hoy || claveFecha(r.created_at) === hoy;
    });
    var visitas = deHoy.filter(function (r) { return r.motivo !== 'cerrado'; });
    var cerrados = deHoy.filter(function (r) { return r.motivo === 'cerrado'; });
    var res = resumirRemitos(visitas);

    cont.innerHTML =
      bloquePendientes() +

      '<div class="eyebrow" style="margin-top:18px">' + ic('calendar', 13) + ' Métricas de hoy</div>' +
      '<div class="grilla-stats">' +
        stat('users', 'Clientes de hoy', String(visitas.length),
             plural(res.unidades, 'unidad', 'unidades') + (cerrados.length ? ' · ' + cerrados.length + ' cerrados' : ''),
             'var(--rose)') +
        stat('db', 'Total (c/deuda)', plata(res.facturado),
             'Sin deuda: ' + plata(res.efectivo + res.transferencia), 'var(--violet)') +
        stat('cash', 'Efectivo', plata(res.efectivo), '', 'var(--ok)') +
        stat('smartphone', 'Transferencia', plata(res.transferencia), '', 'var(--info)') +
        stat('clock', 'Deuda', plata(res.deuda), '', 'var(--warn)') +
      '</div>' +

      '<div class="eyebrow" style="margin-top:18px">' + ic('zap', 13) + ' Accesos rápidos</div>' +
      '<div class="atajos">' +
        atajo('receipt', 'Crear remito', "irA('remito')", 'grad') +
        atajo('clipboard', 'Remitos hechos', "irA('hechos')", 'violeta') +
        atajo('user', 'Nuevo cliente', 'nuevoCliente()', 'rosa') +
        atajo('wallet', 'Gastos', "irA('gastos')", 'rojo') +
        atajo('settings', 'Configuraciones', "irA('configuraciones')", 'neutro') +
      '</div>' +

      bloqueRemitosHoy(deHoy);
  }
});

/* ── Atajos ──────────────────────────────────────────────── */
function atajo(icono, texto, accion, estilo) {
  return '<button class="atajo atajo-' + estilo + '" onclick="' + accion + '">' +
    ic(icono, 17) + '<span>' + esc(texto) + '</span></button>';
}

/* ── Pendientes ──────────────────────────────────────────── */
function bloquePendientes() {
  var abiertos = _pendientes.filter(function (t) { return !bool(t.hecha); });
  var hechas = _pendientes.filter(function (t) { return bool(t.hecha); });

  var porTipo = {};
  abiertos.forEach(function (t) { var k = t.tipo || 'otro'; porTipo[k] = (porTipo[k] || 0) + 1; });
  var resumen = Object.keys(TIPOS_PENDIENTE)
    .filter(function (k) { return porTipo[k]; })
    .map(function (k) {
      var d = TIPOS_PENDIENTE[k];
      return '<span class="pin ' + d.clase + '">' + ic(d.icono, 12) + ' ' + porTipo[k] + '</span>';
    }).join(' ');

  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' +
      ic('clipboard', 16) + ' Pendientes' +
      '<span style="margin-left:auto;display:inline-flex;gap:5px;align-items:center">' +
        resumen +
        '<span class="pin pin-neutro">' +
          (abiertos.length ? abiertos.length + ' por hacer' : 'todo listo') +
        '</span>' +
      '</span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
        '<input class="campo-input" id="pend-texto" style="flex:1;min-width:170px" ' +
               'placeholder="Agregar pendiente…" onkeydown="if(event.key===\'Enter\')agregarPendiente()"/>' +
        '<select class="campo-input" id="pend-tipo" style="width:auto">' +
          Object.keys(TIPOS_PENDIENTE).map(function (k) {
            return '<option value="' + k + '">' + esc(TIPOS_PENDIENTE[k].etiqueta) + '</option>';
          }).join('') +
        '</select>' +
        '<button class="btn btn-primario" onclick="agregarPendiente()" aria-label="Agregar">' + ic('plus', 17) + '</button>' +
      '</div>' +

      (abiertos.length
        ? '<div class="lista">' + abiertos.map(function (t) { return filaPendiente(t, false); }).join('') + '</div>'
        : '<div class="campo-ayuda">No queda nada pendiente. Agregá uno arriba si te acordás de algo.</div>') +

      (hechas.length
        ? '<div class="eyebrow" style="margin:16px 0 8px">Hechas</div>' +
          '<div class="lista">' + hechas.slice(0, 8).map(function (t) { return filaPendiente(t, true); }).join('') + '</div>'
        : '') +
    '</div>' +
  '</details>';
}

function filaPendiente(t, hecha) {
  var d = tipoPendiente(t);
  return '<div class="fila" style="cursor:default;border-left:3px solid ' + (hecha ? 'var(--border)' : d.color) + '">' +
    '<input type="checkbox"' + (hecha ? ' checked' : '') +
           ' onchange="marcarPendiente(' + t.id + ',this.checked)" aria-label="Marcar como hecho"/>' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo"' + (hecha ? ' style="text-decoration:line-through;color:var(--muted);font-weight:500"' : '') + '>' +
        esc(t.texto) + '</div>' +
      (hecha ? '' : '<div class="fila-sub"><span class="pin ' + d.clase + '">' + ic(d.icono, 12) + ' ' + esc(d.etiqueta) + '</span></div>') +
    '</div>' +
    '<button class="btn btn-fantasma" style="padding:4px" aria-label="Borrar" onclick="borrarPendiente(' + t.id + ')">' + ic('trash', 15) + '</button>' +
  '</div>';
}

async function agregarPendiente() {
  var inp = porId('pend-texto');
  var texto = (inp.value || '').trim();
  if (!texto) { toast('Escribí el pendiente', 'error'); return; }
  try {
    await crear('tareas', { texto: texto, hecha: false, tipo: porId('pend-tipo').value });
    inp.value = '';
    toast('Pendiente agregado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

async function marcarPendiente(id, hecha) {
  try { await actualizar('tareas', id, { hecha: hecha }); pintarRuta(); }
  catch (e) { toast(e.message, 'error'); }
}

async function borrarPendiente(id) {
  try { await borrar('tareas', id); toast('Pendiente borrado'); pintarRuta(); }
  catch (e) { toast(e.message, 'error'); }
}

/* ── Remitos de hoy ──────────────────────────────────────── */
function bloqueRemitosHoy(deHoy) {
  if (!deHoy.length) {
    return '<div class="tarjeta" style="margin-top:22px"><div class="tarjeta-cuerpo">' +
      vacio('receipt', 'Todavía no hay remitos hoy', 'Cuando cargues el primero, acá vas a ver el detalle del día.',
            '<button class="btn btn-primario" onclick="irA(\'remito\')">' + ic('plus', 15) + ' Cargar el primero</button>') +
      '</div></div>';
  }
  return '<details class="tarjeta" style="margin-top:22px">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' +
      ic('receipt', 16) + ' Remitos de hoy' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' + plural(deHoy.length, 'remito') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo" style="padding:0">' +
      '<div class="lista" style="border:none;border-radius:0">' + deHoy.slice().reverse().map(filaRemitoHoy).join('') + '</div>' +
    '</div>' +
  '</details>';
}

/* ── Bloques compartidos con otras páginas ───────────────── */
function stat(icono, etiqueta, valor, sub, color) {
  return '<div class="stat">' +
    '<div class="stat-etiq">' + ic(icono, 14) + esc(etiqueta) + '</div>' +
    '<div class="stat-val" style="color:' + color + '">' + esc(valor) + '</div>' +
    (sub ? '<div class="stat-sub">' + esc(sub) + '</div>' : '') +
  '</div>';
}

function filaRemitoHoy(r) {
  var cerrado = r.motivo === 'cerrado';
  return '<button class="fila" onclick="irA(\'hechos\',\'q=' + encodeURIComponent(r.cliente_nombre || '') + '\')">' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(r.cliente_nombre || 'Sin cliente') +
        (cerrado ? ' <span class="pin pin-neutro">' + ic('ban', 12) + ' Cerrado</span>' : '') + '</div>' +
      '<div class="fila-sub">' +
        [r.cliente_loc, r.unidades ? plural(+r.unidades, 'unidad', 'unidades') : ''].filter(Boolean).map(esc).join(' · ') +
      '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(r.total) + '</div>' +
      (cerrado ? '' : '<div style="margin-top:4px">' + pagoHTML(r) + '</div>') +
    '</div>' +
  '</button>';
}

function capitalizar(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }


/* ── Hoja de ruta: hoy, mañana y lo que hay que preparar ──── */
function bloqueRuta(clientes, pedidos) {
  var plan = planRutas();
  if (!Object.keys(plan).length) {
    return avisoHTML('warn',
      'Todavía no cargaste el plan de rutas. Se arma en ' +
      '<a href="#/configuraciones">Configuraciones</a> y con eso el inicio te avisa qué toca cada día.', 'map');
  }

  var hoy = rutaDelDia();
  var man = rutaDeManana();
  var deHoy = clientesDeRuta(clientes, hoy);
  var deManana = clientesDeRuta(clientes, man.ruta);
  var exhibidores = exhibidoresDeRuta(clientes, man.ruta);
  var avisar = avisosAnticipados(clientes, man.ruta, 1);
  var pedidosMan = pedidosParaRuta(pedidos, clientes, man.ruta);

  var html = '<div class="eyebrow">' + ic('map', 13) + ' Hojas de ruta</div>' +
    '<div class="grilla-stats" style="margin-bottom:12px">' +
      stat('truck', 'Hoy', hoy ? 'Ruta ' + hoy : 'Sin ruta',
           hoy ? plural(deHoy.length, 'cliente') : 'no hay ruta asignada', 'var(--rose)') +
      stat('calendar', 'Mañana', man.ruta ? 'Ruta ' + man.ruta : 'Sin ruta',
           capitalizar(DIAS[man.fecha.getDay()]) + (man.ruta ? ' · ' + plural(deManana.length, 'cliente') : ''), 'var(--violet)') +
      (man.ruta
        ? stat('box', 'Exhibidores', String(exhibidores), 'para la ruta de mañana', 'var(--info)')
        : '') +
    '</div>';

  if (avisar.length) {
    html += avisoHTML('warn',
      '<strong>Avisar con anticipación:</strong> ' +
      avisar.map(function (c) { return esc(c.local) + ' (' + plural(+c.avisar_antes, 'día') + ')'; }).join(' · ') +
      '. Mañana toca su ruta.', 'phone');
  }

  var enRuta = pedidosMan.filter(function (p) { return p.enRuta; });
  var enZona = pedidosMan.filter(function (p) { return p.enZona; });

  if (enRuta.length) {
    html += avisoHTML('ok',
      '<strong>' + plural(enRuta.length, 'pedido') + ' para llevar mañana:</strong> ' +
      enRuta.map(function (p) {
        return esc(p.pedido.cliente_nombre) + (p.pedido.detalle ? ' — ' + esc(p.pedido.detalle) : '');
      }).join(' · '), 'bag');
  }

  if (enZona.length) {
    html += avisoHTML('warn',
      '<strong>Están en la zona de mañana</strong> pero son de otra ruta: ' +
      enZona.map(function (p) {
        return esc(p.pedido.cliente_nombre) + ' (' + esc(p.loc) + ')';
      }).join(' · ') + '. Fijate si conviene llevarlos igual.', 'map');
  }

  return html;
}
