/* ═══════════════════════════════════════════════════════════
   INICIO — pendientes, cómo viene el día y los atajos.
   Los dos bloques largos (pendientes y los remitos de hoy) se
   pliegan, así la pantalla entra de una en el celular.
   ═══════════════════════════════════════════════════════════ */

var _pendientes = [];
var _clientesInicio = [];

registrarPagina({
  id: 'inicio',
  menu: 'Inicio',
  grupo: 'Día a día',
  icono: 'home',
  titulo: 'Intencional',
  subtitulo: capitalizar(DIAS[new Date().getDay()]) + ', ' + new Date().getDate() + ' de ' + MESES[new Date().getMonth()],

  async montar(cont) {
    await cargarConfig().catch(function () {});
    await cargarFeriados().catch(function () {});
    var datos = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('tareas').catch(function () { return []; }),
      traerCacheado('clientes').catch(function () { return []; })
    ]);
    var remitos = datos[0];
    _pendientes = datos[1];
    var clientes = datos[2];
    _clientesInicio = clientes;

    var hoy = claveFecha(hoyTexto());
    var deHoy = remitos.filter(function (r) {
      return claveFecha(r.fecha) === hoy || claveFecha(r.created_at) === hoy;
    });
    var visitas = deHoy.filter(function (r) { return r.motivo !== 'cerrado'; });
    var cerrados = deHoy.filter(function (r) { return r.motivo === 'cerrado'; });
    var res = resumirRemitos(visitas);

    cont.innerHTML =
      /* Primero lo que hay que hacer, después con qué hacerlo,
         después el plan de rutas y al final los números. */
      bloquePendientes() +

      '<div class="eyebrow" style="margin-top:18px">' + ic('zap', 13) + ' Accesos rápidos</div>' +
      '<div class="atajos">' +
        atajo('receipt', 'Crear remito', "irA('remito')", 'grad') +
        atajo('clipboard', 'Remitos hechos', "irA('hechos')", 'violeta') +
        atajo('user', 'Nuevo cliente', 'nuevoCliente()', 'rosa') +
        atajo('wallet', 'Gastos', "irA('gastos')", 'rojo') +
        atajo('cart', 'Compras', "irA('compras')", 'neutro') +
        atajo('settings', 'Configuraciones', "irA('configuraciones')", 'neutro') +
      '</div>' +

      bloqueRuta(clientes, _pendientes) +

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

      bloqueRemitosHoy(deHoy);
  }
});

/* ── Hojas de ruta: hoy, mañana y lo que hay que preparar ─── */
function bloqueRuta(clientes, pendientes) {
  var cola = colaRutas();
  if (!cola.length) return '';   // sin cola cargada, el bloque no aparece

  var hoyIso = hoyISO();
  var hoy = rutaDelDia();
  var man = rutaDeManana();
  var deHoy = clientesDeRuta(clientes, hoy);
  var deManana = clientesDeRuta(clientes, man.ruta);
  var exhibidores = exhibidoresDeRuta(clientes, man.ruta);
  var avisar = avisosAnticipados(clientes, man.ruta, 1);
  var pendMan = man.ruta ? pendientesParaRuta(pendientes, clientes, man.ruta) : [];
  var proximos = calendarioRutas(6);

  var html = '<div class="eyebrow" style="margin-top:18px">' + ic('map', 13) + ' Hojas de ruta</div>';

  /* Hoy no es hábil: se dice y listo */
  if (!esHabil(hoyIso)) {
    html += avisoHTML('ok',
      esFeriado(hoyIso)
        ? 'Hoy es feriado (' + esc(nombreFeriado(hoyIso)) + '), así que no cuenta como día de ruta.'
        : 'Fin de semana: las rutas siguen el lunes.', 'calendar');
  }

  html += '<div class="rutas-mini">' +
      '<div class="ruta-mini">' +
        '<span class="rm-etiq">' + ic('truck', 13) + ' Hoy</span>' +
        '<span class="rm-val" style="color:var(--rose)">' + (hoy ? esc(hoy) : '—') + '</span>' +
        '<span class="rm-sub">' + (hoy ? plural(deHoy.length, 'cliente') : 'sin ruta') + '</span>' +
      '</div>' +
      '<div class="ruta-mini">' +
        '<span class="rm-etiq">' + ic('calendar', 13) + ' Próxima</span>' +
        '<span class="rm-val" style="color:var(--violet)">' +
          (man.ruta ? esc(man.ruta) : (proximos[0] ? esc(proximos[0].ruta) : '—')) + '</span>' +
        '<span class="rm-sub">' + (man.ruta
          ? capitalizar(DIAS[man.fecha.getDay()]) + ' · ' + plural(deManana.length, 'cliente')
          : (proximos[0] ? esc(fechaCorta(proximos[0].iso)) : 'sin cola')) + '</span>' +
      '</div>' +
      /* La tercera va siempre, para que el renglón quede parejo */
      '<div class="ruta-mini">' +
        '<span class="rm-etiq">' + ic('box', 13) + ' Exhibidores</span>' +
        '<span class="rm-val" style="color:var(--info)">' + (man.ruta ? exhibidores : '—') + '</span>' +
        '<span class="rm-sub">' + (man.ruta ? 'para la salida' : 'sin ruta') + '</span>' +
      '</div>' +
    '</div>';

  /* Reorganizar sin salir del inicio */
  if (hoy) {
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
      '<button class="btn btn-primario" style="padding:6px 12px;font-size:12px" onclick="rutaHecha()">' +
        ic('check', 14) + ' Hecha</button>' +
      '<button class="btn btn-secundario" style="padding:6px 12px;font-size:12px" onclick="rutaNoSalio()">' +
        ic('clock', 14) + ' No salí</button>' +
      '<button class="btn btn-secundario" style="padding:6px 12px;font-size:12px" onclick="abrirAdelantar()">' +
        ic('shuffle', 14) + ' Adelantar</button>' +
    '</div>';
  }

  /* Las que vienen */
  html += '<details class="tarjeta" style="margin-bottom:12px">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('clipboard', 16) + ' Próximas salidas' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' + plural(cola.length, 'ruta') + ' en cola</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo" style="padding:0">' +
      '<div class="lista" style="border:none;border-radius:0">' +
        proximos.map(function (e) {
          var d = fechaDeIso(e.iso);
          var n = clientesDeRuta(clientes, e.ruta).length;
          return '<div class="fila" style="cursor:default">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">Ruta ' + esc(e.ruta) + '</div>' +
              '<div class="fila-sub">' + capitalizar(DIAS[d.getDay()]) + ' ' + esc(fechaCorta(e.iso)) +
                ' · ' + plural(n, 'cliente') + '</div>' +
            '</div>' +
            (e.indice > 0
              ? '<button class="btn btn-fantasma" style="padding:4px 8px;font-size:11px" ' +
                'onclick="adelantar(\'' + esc(e.ruta) + '\')">Adelantar</button>'
              : '') +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +
  '</details>';

  if (avisar.length) {
    html += avisoHTML('warn',
      '<strong>Avisar con anticipación:</strong> ' +
      avisar.map(function (c) { return esc(c.local) + ' (' + plural(+c.avisar_antes, 'día') + ')'; }).join(' · ') +
      '. Pronto toca su ruta.', 'phone');
  }

  var enRuta = pendMan.filter(function (p) { return p.enRuta; });
  var enZona = pendMan.filter(function (p) { return p.enZona; });

  function describir(p) {
    var d = tipoPendiente(p.pendiente);
    return ic(d.icono, 12) + ' ' + esc(p.pendiente.texto) +
      (p.pendiente.cliente_nombre ? ' — ' + esc(p.pendiente.cliente_nombre) : '') +
      (p.esNuevo ? ' (cliente nuevo)' : '');
  }

  if (enRuta.length) {
    html += avisoHTML('ok',
      '<strong>Para la próxima salida:</strong><br>' +
      enRuta.map(describir).join('<br>'), 'bag');
  }

  if (enZona.length) {
    html += avisoHTML('warn',
      '<strong>Caen en la zona de la próxima salida</strong> pero son de otra ruta:<br>' +
      enZona.map(function (p) { return describir(p) + ' (' + esc(p.loc) + ')'; }).join('<br>') +
      '<br>Fijate si conviene pasar igual.', 'map');
  }

  return html;
}

/* ── Reorganizar la cola ─────────────────────────────────── */
async function aplicarCola(nueva, mensaje) {
  try {
    await guardarCola(nueva.cola, nueva.inicio);
    toast(mensaje);
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

function rutaHecha()   { aplicarCola(colaAvanzada(), 'Ruta marcada como hecha'); }
function rutaNoSalio() { aplicarCola(colaAtrasada(), 'Todo corrió un día hábil'); }
function adelantar(r)  { aplicarCola(colaConAdelanto(r), 'Ruta ' + r + ' pasa a ser la próxima'); }

function abrirAdelantar() {
  var cola = colaRutas();
  abrirModal('Adelantar una hoja de ruta',
    '<div class="campo-ayuda" style="margin-bottom:12px">' +
      'La que elijas pasa a ser la próxima y el resto se corre un lugar hacia atrás.</div>' +
    '<div class="lista">' +
      cola.slice(1, 25).map(function (r) {
        var n = clientesDeRuta(_clientesInicio, r).length;
        return '<button class="fila" onclick="cerrarModal();adelantar(\'' + esc(r) + '\')">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">Ruta ' + esc(r) + '</div>' +
            '<div class="fila-sub">' + plural(n, 'cliente') + '</div>' +
          '</div></button>';
      }).join('') +
    '</div>');
}

/* ── Atajos ──────────────────────────────────────────────── */
function atajo(icono, texto, accion, estilo) {
  return '<button class="atajo atajo-' + estilo + '" onclick="' + accion + '">' +
    ic(icono, 17) + '<span>' + esc(texto) + '</span></button>';
}

/* ═══════════════════════════════════════════════════════════
   PENDIENTES
   Van arriba de todo: es lo que hay que hacer hoy.
   ═══════════════════════════════════════════════════════════ */
function bloquePendientes() {
  var abiertos = _pendientes.filter(function (t) { return !bool(t.hecha); });
  var hechas = _pendientes.filter(function (t) { return bool(t.hecha); });

  var porTipo = {};
  abiertos.forEach(function (t) {
    var k = t.tipo || 'otro';
    porTipo[k] = (porTipo[k] || 0) + 1;
  });
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
        '<select class="campo-input" id="pend-tipo" style="width:auto" onchange="alternarClientePendiente()">' +
          Object.keys(TIPOS_PENDIENTE).map(function (k) {
            return '<option value="' + k + '">' + esc(TIPOS_PENDIENTE[k].etiqueta) + '</option>';
          }).join('') +
        '</select>' +
        '<button class="btn btn-primario" onclick="agregarPendiente()" aria-label="Agregar">' + ic('plus', 17) + '</button>' +
      '</div>' +

      '<div id="pend-cliente-wrap" style="display:none;margin-bottom:12px">' +
        '<div class="campo-etiq">¿De qué cliente es?</div>' +
        '<div class="buscador">' +
          '<span class="ic-lupa">' + ic('search', 15) + '</span>' +
          '<input class="campo-input" id="pend-cliente" autocomplete="off" ' +
                 'placeholder="Número, nombre o zona" oninput="buscarClientePendiente(this.value)"/>' +
        '</div>' +
        '<div id="pend-cliente-res"></div>' +
        '<div id="pend-cliente-elegido"></div>' +
        '<button class="btn btn-fantasma" style="padding:4px 0;font-size:12px;text-decoration:underline" ' +
                'onclick="abrirClienteNuevo()">Es un cliente que todavía no está cargado</button>' +
        '<div id="pend-nuevo-wrap" style="display:none">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
            '<div class="campo" style="margin:0"><div class="campo-etiq">Nombre</div>' +
              '<input class="campo-input" id="pend-nuevo-nombre" placeholder="Nombre del local"/></div>' +
            '<div class="campo" style="margin:0"><div class="campo-etiq">Zona</div>' +
              '<input class="campo-input" id="pend-nuevo-loc" list="zonas-conocidas" placeholder="Localidad"/></div>' +
          '</div>' +
          '<datalist id="zonas-conocidas"></datalist>' +
          '<div class="campo-ayuda">Igual te va a avisar cuando la ruta pase por esa zona.</div>' +
        '</div>' +
        '<div class="campo-ayuda">Con esto la app sabe su ruta y su zona, y te avisa cuando toque.</div>' +
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
  var cli = t.cliente_nombre
    ? _clientesInicio.find(function (c) { return normalizar(c.local) === normalizar(t.cliente_nombre); })
    : null;
  var ruta = cli ? rutaDe(cli) : '';
  var esNuevo = !!t.cliente_nombre && !cli;
  var zona = (cli && cli.loc) || t.loc || '';

  return '<div class="fila" style="cursor:default;border-left:3px solid ' + (hecha ? 'var(--border)' : d.color) + '">' +
    '<input type="checkbox"' + (hecha ? ' checked' : '') +
           ' onchange="marcarPendiente(' + t.id + ',this.checked)" aria-label="Marcar como hecho"/>' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo"' + (hecha ? ' style="text-decoration:line-through;color:var(--muted);font-weight:500"' : '') + '>' +
        esc(t.texto) + '</div>' +
      (hecha ? '' :
        '<div class="fila-sub"><span class="pin ' + d.clase + '">' + ic(d.icono, 12) + ' ' + esc(d.etiqueta) + '</span>' +
        (t.cliente_nombre ? ' ' + esc(t.cliente_nombre) : '') +
        (esNuevo ? ' <span class="pin pin-ok">cliente nuevo</span>' : '') +
        (zona ? ' <span class="pin pin-neutro">' + esc(zona) + '</span>' : '') +
        (ruta ? ' <span class="pin pin-neutro">Ruta ' + esc(ruta) + '</span>' : '') +
        '</div>') +
    '</div>' +
    '<button class="btn btn-fantasma" style="padding:4px" aria-label="Borrar" onclick="borrarPendiente(' + t.id + ')">' +
      ic('trash', 15) + '</button>' +
  '</div>';
}

/* ── Cliente del pendiente ───────────────────────────────── */
var _clientePedido = null;

/* Pedidos y retiros necesitan saber de qué cliente son: con eso
   la app avisa cuando su ruta o su zona caiga en la próxima salida. */
function necesitaCliente(tipo) { return tipo === 'pedido' || tipo === 'retirar'; }

function alternarClientePendiente() {
  var wrap = porId('pend-cliente-wrap');
  if (wrap) wrap.style.display = necesitaCliente(porId('pend-tipo').value) ? '' : 'none';
}

function buscarClientePendiente(q) {
  var cont = porId('pend-cliente-res');
  if (!cont) return;
  if (!q || q.length < 2) { cont.innerHTML = ''; return; }
  var res = _clientesInicio.filter(clienteActivo)
    .filter(function (c) { return coincideCliente(c, q); }).slice(0, 6);

  cont.innerHTML = res.length
    ? '<div class="lista" style="margin-top:8px">' + res.map(function (c) {
        return '<button class="fila" onclick="elegirClientePedido(\'' + esc(c.num) + '\')">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(c.local) + '</div>' +
            '<div class="fila-sub">' + [c.loc, rutaDe(c) ? 'Ruta ' + rutaDe(c) : ''].filter(Boolean).map(esc).join(' · ') + '</div>' +
          '</div></button>';
      }).join('') + '</div>'
    : '<div class="campo-ayuda" style="margin-top:8px">Ningún cliente coincide con “' + esc(q) + '”.</div>';
}

function elegirClientePedido(num) {
  var c = _clientesInicio.find(function (x) { return String(x.num) === String(num); });
  if (!c) return;
  _clientePedido = c;
  porId('pend-cliente').value = '';
  porId('pend-cliente-res').innerHTML = '';
  var ruta = rutaDe(c);
  var cal = calendarioRutas().find(function (e) { return String(e.ruta) === String(ruta); });

  porId('pend-cliente-elegido').innerHTML =
    '<div class="aviso aviso-ok" style="margin-top:8px">' + ic('check', 15) +
      '<div><strong>' + esc(c.local) + '</strong>' +
        (c.loc ? ' · ' + esc(c.loc) : '') +
        (ruta ? ' · Ruta ' + esc(ruta) : ' · sin hoja de ruta') +
        (cal ? '<br>Le toca el ' + esc(fechaCorta(cal.iso)) : '') +
        ' <button class="btn btn-fantasma" style="padding:0 4px;text-decoration:underline" onclick="soltarClientePedido()">cambiar</button>' +
      '</div>' +
    '</div>';
}

function soltarClientePedido() {
  _clientePedido = null;
  porId('pend-cliente-elegido').innerHTML = '';
}

/* Cliente que todavía no está en la base: alcanza con nombre y zona */
function abrirClienteNuevo() {
  soltarClientePedido();
  var wrap = porId('pend-nuevo-wrap');
  if (!wrap) return;
  wrap.style.display = wrap.style.display === 'none' ? '' : 'none';

  var zonas = {};
  _clientesInicio.forEach(function (c) { if (c.loc) zonas[c.loc] = 1; });
  porId('zonas-conocidas').innerHTML = Object.keys(zonas).sort()
    .map(function (z) { return '<option value="' + esc(z) + '">'; }).join('');
}

async function agregarPendiente() {
  var inp = porId('pend-texto');
  var texto = (inp.value || '').trim();
  if (!texto) { toast('Escribí el pendiente', 'error'); return; }

  var tipo = porId('pend-tipo').value;
  var nuevoNombre = ((porId('pend-nuevo-nombre') || {}).value || '').trim();
  var nuevaLoc = ((porId('pend-nuevo-loc') || {}).value || '').trim();
  var esNuevo = !!nuevoNombre;

  if (necesitaCliente(tipo) && !_clientePedido && !esNuevo) {
    toast('Elegí el cliente o cargalo como nuevo', 'error');
    return;
  }
  if (esNuevo && !nuevaLoc) {
    toast('Poné la zona del cliente nuevo', 'error');
    return;
  }

  try {
    await crear('tareas', {
      texto: texto, hecha: false, tipo: tipo,
      cliente_nombre: esNuevo ? nuevoNombre : (_clientePedido ? _clientePedido.local : null),
      loc: esNuevo ? nuevaLoc : (_clientePedido ? _clientePedido.loc : null)
    });
    inp.value = '';
    _clientePedido = null;
    if (porId('pend-nuevo-nombre')) porId('pend-nuevo-nombre').value = '';
    if (porId('pend-nuevo-loc')) porId('pend-nuevo-loc').value = '';
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
    return '<div class="tarjeta" style="margin-top:18px"><div class="tarjeta-cuerpo">' +
      vacio('receipt', 'Todavía no hay remitos hoy', 'Cuando cargues el primero, acá vas a ver el detalle del día.',
            '<button class="btn btn-primario" onclick="irA(\'remito\')">' + ic('plus', 15) + ' Cargar el primero</button>') +
      '</div></div>';
  }
  return '<details class="tarjeta" style="margin-top:18px">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' +
      ic('receipt', 16) + ' Remitos de hoy' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' + plural(deHoy.length, 'remito') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo" style="padding:0">' +
      '<div class="lista" style="border:none;border-radius:0">' + deHoy.slice().reverse().map(filaRemitoHoy).join('') + '</div>' +
    '</div>' +
  '</details>';
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

/* ── Bloques compartidos con otras páginas ───────────────── */
function stat(icono, etiqueta, valor, sub, color) {
  return '<div class="stat">' +
    '<div class="stat-etiq">' + ic(icono, 14) + esc(etiqueta) + '</div>' +
    '<div class="stat-val" style="color:' + color + '">' + esc(valor) + '</div>' +
    (sub ? '<div class="stat-sub">' + esc(sub) + '</div>' : '') +
  '</div>';
}

function capitalizar(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }
