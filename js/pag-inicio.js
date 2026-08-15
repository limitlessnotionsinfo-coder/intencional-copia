/* ═══════════════════════════════════════════════════════════
   INICIO — pendientes, cómo viene el día y los atajos.
   Los dos bloques largos (pendientes y los remitos de hoy) se
   pliegan, así la pantalla entra de una en el celular.
   ═══════════════════════════════════════════════════════════ */

var _pendientes = [];
var _clientesInicio = [];
var _gastosInicio = [];
var _remitosInicio = [];

registrarPagina({
  id: 'inicio',
  menu: 'Inicio',
  grupo: 'Día a día',
  icono: 'home',
  titulo: 'Intencional',
  subtitulo: capitalizar(DIAS[new Date().getDay()]) + ', ' + new Date().getDate() + ' de ' + MESES[new Date().getMonth()],

  async montar(cont) {
    await cargarConfig().catch(function () {});
    /* Los feriados se bajan de una API externa: si se esperan, la
       pantalla tarda lo que tarde internet. Se piden en segundo
       plano y cuando llegan se repinta. */
    if (!_feriadosCargados) cargarFeriados().then(function () { pintarRuta(); }).catch(function () {});
    var datos = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('tareas').catch(function () { return []; }),
      traerCacheado('clientes').catch(function () { return []; }),
      traerCacheado('gastos').catch(function () { return []; })
    ]);
    var remitos = datos[0];
    _pendientes = datos[1];
    var clientes = datos[2];
    _clientesInicio = clientes;
    _gastosInicio = datos[3] || [];
    _remitosInicio = remitos;

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
      bloqueAvisos(remitos, _gastosInicio) +
      '<div id="zona-pendientes">' + bloquePendientes() + '</div>' +

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

  /* Lo que quedó pendiente la última vez que se hizo esta hoja */
  var pend = clientesPendientesDeHoja(hoy || (man.ruta || ''), clientes);
  if (pend.length) {
    html += '<div class="aviso aviso-warn" style="align-items:flex-start;margin-bottom:10px">' +
      ic('alert', 15) +
      '<div><strong>' + plural(pend.length, 'cliente') + ' sin visitar la vez pasada</strong>' +
      '<br>' + esc(pend.slice(0, 3).map(function (x) { return x.cliente.local; }).join(', ')) +
      (pend.length > 3 ? ' y ' + (pend.length - 3) + ' más' : '') +
      ' · hace ' + plural(pend[0].dias, 'día') +
      '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
        'onclick="verPendientesDeHoja(\'' + esc(hoy || man.ruta || '') + '\')">Ver cuáles</button></div></div>';
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
            '<button class="fila-principal" style="background:none;border:none;text-align:left;padding:0;cursor:pointer" ' +
                    'onclick="irA(\'clientes\',\'ruta=' + encodeURIComponent(e.ruta) + '\')">' +
              '<div class="fila-titulo">Ruta ' + esc(e.ruta) + ' →</div>' +
              '<div class="fila-sub">' + capitalizar(DIAS[d.getDay()]) + ' ' + esc(fechaCorta(e.iso)) +
                ' · ' + plural(n, 'cliente') + '</div>' +
            '</button>' +
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

/* Antes de cerrar la hoja se mira quién quedó sin visitar: si
   falta alguien, se pregunta en vez de perder el dato. */
function rutaHecha() {
  var hoy = rutaDelDia();
  if (!hoy) { aplicarCola(colaAvanzada(), 'Ruta marcada como hecha'); return; }

  var b = balanceDeHoja(hoy, _clientesInicio, _remitosInicio, hoyISO());
  if (!b.faltan.length) {
    cerrarHoja(hoy, []);
    return;
  }

  abrirModal('Ruta ' + hoy + ' · faltan ' + plural(b.faltan.length, 'cliente'),
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Se atendieron ' + b.hechos.length + ' de ' + b.total + '. Estos no tienen ningún remito de hoy, ' +
      'ni siquiera “estaba cerrado”.</div>' +

    '<div class="lista">' +
      b.faltan.map(function (c) {
        return '<div class="fila" style="cursor:default">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(c.local) + '</div>' +
            '<div class="fila-sub">' + esc([c.dir, c.loc].filter(Boolean).join(' · ')) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="campo-ayuda" style="margin-top:10px">' +
      'Si los dejás pendientes, te los recuerdo la próxima vez que toque esta hoja.</div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" ' +
              'onclick="cerrarHoja(\'' + esc(hoy) + '\', true)">Dejarlos pendientes</button>' +
      '<button class="btn btn-secundario" onclick="cerrarHoja(\'' + esc(hoy) + '\', false)">' +
        'No hacía falta ir</button>' +
    '</div>');
}

async function cerrarHoja(ruta, dejarPendientes) {
  try {
    var b = balanceDeHoja(ruta, _clientesInicio, _remitosInicio, hoyISO());
    await anotarPendientesDeHoja(ruta, dejarPendientes ? b.faltan : [], hoyISO());
    cerrarModal();
    aplicarCola(colaAvanzada(),
      dejarPendientes && b.faltan.length
        ? plural(b.faltan.length, 'cliente') + ' anotados para la próxima'
        : 'Ruta marcada como hecha');
  } catch (e) { toast(e.message, 'error'); }
}
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
/* ═══════════════════════════════════════════════════════════
   PENDIENTES
   Arriba el alta, después los filtros y la lista.
   ═══════════════════════════════════════════════════════════ */
var _filtroPend = '';        // '' = todos
var _ordenPend = 'tipo';     // tipo · nuevos · viejos

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

  var visibles = ordenarPendientes(
    abiertos.filter(function (t) { return !_filtroPend || (t.tipo || 'otro') === _filtroPend; }));

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

      /* Filtros y orden, solo si hay algo que filtrar */
      (abiertos.length > 1
        ? '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">' +
            chipPend('', 'Todos', abiertos.length) +
            Object.keys(TIPOS_PENDIENTE).filter(function (k) { return porTipo[k]; })
              .map(function (k) { return chipPend(k, TIPOS_PENDIENTE[k].etiqueta, porTipo[k]); }).join('') +
            '<select class="campo-input" style="width:auto;margin-left:auto;font-size:12px;padding:5px 8px;min-height:0" ' +
                    'onchange="setOrdenPend(this.value)">' +
              [['tipo', 'Por tipo'], ['nuevos', 'Más nuevos'], ['viejos', 'Más viejos']].map(function (o) {
                return '<option value="' + o[0] + '"' + (_ordenPend === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
              }).join('') +
            '</select>' +
          '</div>'
        : '') +

      (visibles.length
        ? '<div class="lista">' + visibles.map(function (t) { return filaPendiente(t, false); }).join('') + '</div>'
        : '<div class="campo-ayuda">' +
          (abiertos.length ? 'No hay pendientes de ese tipo.' : 'No queda nada pendiente.') +
          '</div>') +

      /* El alta vive en su propia ventana: acá solo el botón */
      '<button class="btn btn-primario btn-bloque" style="margin-top:12px" onclick="abrirNuevoPendiente()">' +
        ic('plus', 16) + ' Agregar pendiente</button>' +

      (hechas.length
        ? '<div class="eyebrow" style="margin:16px 0 8px">Hechas</div>' +
          '<div class="lista">' + hechas.slice(0, 8).map(function (t) { return filaPendiente(t, true); }).join('') + '</div>'
        : '') +
    '</div>' +
  '</details>';
}

/* ── Alta de un pendiente, en una ventana aparte ─────────── */
function abrirNuevoPendiente() {
  _clientePedido = null;
  abrirModal('Nuevo pendiente',
    '<div class="campo"><div class="campo-etiq">¿Qué tipo de pendiente?</div>' +
      '<select class="campo-input" id="pend-tipo" onchange="alternarClientePendiente()">' +
        Object.keys(TIPOS_PENDIENTE).map(function (k) {
          return '<option value="' + k + '"' + (_tipoPend === k ? ' selected' : '') + '>' +
            esc(TIPOS_PENDIENTE[k].etiqueta) + '</option>';
        }).join('') +
      '</select></div>' +

    '<div id="pend-extra"></div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">¿Qué hay que hacer?</div>' +
      '<input class="campo-input" id="pend-texto" placeholder="' + esc(placeholderPendiente()) + '" ' +
             'onkeydown="if(event.key===\'Enter\')agregarPendiente()"/></div>',

    '<button class="btn btn-primario btn-bloque" onclick="agregarPendiente()">' +
      ic('plus', 16) + ' Agregar</button>');
  pintarExtraPendiente();
}

function chipPend(tipo, etiqueta, n) {
  return '<button class="btn ' + (_filtroPend === tipo ? 'btn-primario' : 'btn-secundario') + '" ' +
    'style="padding:5px 11px;font-size:12px" onclick="setFiltroPend(\'' + tipo + '\')">' +
    esc(etiqueta) + ' <span class="pin pin-neutro" style="margin-left:2px">' + n + '</span></button>';
}

/* Repinta solo la tarjeta de pendientes y la deja abierta: antes
   redibujaba toda la pantalla y el desplegable se cerraba solo. */
function pintarPendientes() {
  var z = porId('zona-pendientes');
  if (!z) { pintarRuta(); return; }
  z.innerHTML = bloquePendientes();
  var det = z.querySelector('details');
  if (det) det.open = true;
}

function setFiltroPend(t) {
  _filtroPend = t;
  pintarPendientes();
}

function setOrdenPend(v) {
  _ordenPend = v;
  pintarPendientes();
}

/* El orden por tipo agrupa: primero lo que hay que retirar, después
   los pedidos, después los clientes nuevos. */
function ordenarPendientes(lista) {
  var peso = { retirar: 0, pedido: 1, nuevo: 2, otro: 3 };
  var copia = lista.slice();

  if (_ordenPend === 'nuevos') {
    return copia.sort(function (a, b) { return (+b.id || 0) - (+a.id || 0); });
  }
  if (_ordenPend === 'viejos') {
    return copia.sort(function (a, b) { return (+a.id || 0) - (+b.id || 0); });
  }
  return copia.sort(function (a, b) {
    var pa = peso[a.tipo || 'otro'], pb = peso[b.tipo || 'otro'];
    if (pa !== pb) return pa - pb;
    return (+b.id || 0) - (+a.id || 0);
  });
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
    (hecha ? '' :
      '<button class="btn btn-fantasma" style="padding:4px" aria-label="Editar" onclick="editarPendiente(' + t.id + ')">' +
        ic('edit', 15) + '</button>') +
    '<button class="btn btn-fantasma" style="padding:4px" aria-label="Borrar" onclick="borrarPendiente(' + t.id + ')">' +
      ic('trash', 15) + '</button>' +
  '</div>';
}

/* ── Lo que hace falta según el tipo ─────────────────────────
   Un pedido o un retiro necesitan el cliente. Un cliente nuevo
   todavía no está en la base: alcanza con su zona.
   ────────────────────────────────────────────────────────── */
var _clientePedido = null;
var _tipoPend = 'nuevo';

function necesitaCliente(tipo) { return tipo === 'pedido' || tipo === 'retirar'; }

function placeholderPendiente() {
  if (_tipoPend === 'pedido')  return 'Ej: 2 cremas y 5 esmaltes';
  if (_tipoPend === 'retirar') return 'Ej: retirar el exhibidor viejo';
  if (_tipoPend === 'nuevo')   return 'Ej: perfumería nueva sobre la avenida';
  return 'Ej: llamar al contador';
}

function alternarClientePendiente() {
  _tipoPend = porId('pend-tipo').value;
  _clientePedido = null;
  var texto = porId('pend-texto');
  if (texto) texto.placeholder = placeholderPendiente();
  pintarExtraPendiente();
}

function pintarExtraPendiente() {
  var cont = porId('pend-extra');
  if (!cont) return;

  if (necesitaCliente(_tipoPend)) {
    cont.innerHTML =
      '<div class="campo-etiq">¿De qué cliente es?</div>' +
      '<div class="buscador">' +
        '<span class="ic-lupa">' + ic('search', 15) + '</span>' +
        '<input class="campo-input" id="pend-cliente" autocomplete="off" ' +
               'placeholder="Número, nombre o zona" oninput="buscarClientePendiente(this.value)"/>' +
      '</div>' +
      '<div id="pend-cliente-res"></div>' +
      '<div id="pend-cliente-elegido"></div>' +
      '<div class="campo-ayuda" style="margin-bottom:10px">' +
        'Con esto la app te avisa cuando su hoja de ruta o su zona caiga en la próxima salida.</div>';
    return;
  }

  if (_tipoPend === 'nuevo') {
    var zonas = {};
    _clientesInicio.forEach(function (c) { if (c.loc) zonas[c.loc] = 1; });
    cont.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Zona</div>' +
          '<input class="campo-input" id="pend-nuevo-loc" list="zonas-conocidas" placeholder="Localidad"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Dirección (opcional)</div>' +
          '<input class="campo-input" id="pend-nuevo-dir" placeholder="Calle y número"/></div>' +
      '</div>' +
      '<datalist id="zonas-conocidas">' +
        Object.keys(zonas).sort().map(function (z) { return '<option value="' + esc(z) + '">'; }).join('') +
      '</datalist>' +
      '<div class="campo-ayuda" style="margin-bottom:10px">' +
        'Con la zona te aviso cuando pases por ahí o por una cercana.</div>';
    return;
  }

  cont.innerHTML = '';
}

function buscarClientePendiente(q) {
  var cont = porId('pend-cliente-res');
  if (!cont) return;
  if (!q || q.length < 2) { cont.innerHTML = ''; return; }
  var res = _clientesInicio.filter(clienteActivo)
    .filter(function (c) { return coincideCliente(c, q); }).slice(0, 6);

  cont.innerHTML = res.length
    ? '<div class="lista" style="margin:8px 0">' + res.map(function (c) {
        return '<button class="fila" onclick="elegirClientePedido(\'' + esc(c.num) + '\')">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(c.local) + '</div>' +
            '<div class="fila-sub">' + [c.loc, rutaDe(c) ? 'Ruta ' + rutaDe(c) : ''].filter(Boolean).map(esc).join(' · ') + '</div>' +
          '</div></button>';
      }).join('') + '</div>'
    : '<div class="campo-ayuda" style="margin:8px 0">Ningún cliente coincide con “' + esc(q) + '”.</div>';
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
    '<div class="aviso aviso-ok" style="margin:8px 0">' + ic('check', 15) +
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
  var el = porId('pend-cliente-elegido');
  if (el) el.innerHTML = '';
}

async function agregarPendiente() {
  var inp = porId('pend-texto');
  var texto = ((inp || {}).value || '').trim();
  if (!texto) { toast('Escribí el pendiente', 'error'); return; }

  var tipo = porId('pend-tipo').value;
  var loc = ((porId('pend-nuevo-loc') || {}).value || '').trim();
  var dir = ((porId('pend-nuevo-dir') || {}).value || '').trim();

  if (necesitaCliente(tipo) && !_clientePedido) {
    toast('Elegí de qué cliente es', 'error');
    return;
  }
  if (tipo === 'nuevo' && !loc) {
    toast('Poné la zona del cliente nuevo', 'error');
    return;
  }

  try {
    await crear('tareas', {
      texto: dir ? texto + ' · ' + dir : texto,
      hecha: false,
      tipo: tipo,
      cliente_nombre: _clientePedido ? _clientePedido.local : null,
      loc: _clientePedido ? _clientePedido.loc : (loc || null)
    });
    _clientePedido = null;
    cerrarModal();
    toast('Pendiente agregado');
    invalidarCache('tareas');
    _pendientes = await traerCacheado('tareas');
    pintarPendientes();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Editar un pendiente ─────────────────────────────────── */
var EP = null;

function editarPendiente(id) {
  var t = _pendientes.find(function (x) { return String(x.id) === String(id); });
  if (!t) return;
  EP = t;

  abrirModal('Editar pendiente',
    '<div class="campo"><div class="campo-etiq">Tipo</div>' +
      '<select class="campo-input" id="ep-tipo">' +
        Object.keys(TIPOS_PENDIENTE).map(function (k) {
          return '<option value="' + k + '"' + ((t.tipo || 'otro') === k ? ' selected' : '') + '>' +
            esc(TIPOS_PENDIENTE[k].etiqueta) + '</option>';
        }).join('') +
      '</select></div>' +

    '<div class="campo"><div class="campo-etiq">Texto</div>' +
      '<input class="campo-input" id="ep-texto" value="' + esc(t.texto || '') + '"/></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Cliente</div>' +
        '<input class="campo-input" id="ep-cliente" list="ep-clientes" value="' + esc(t.cliente_nombre || '') + '" ' +
               'placeholder="Opcional"/>' +
        '<datalist id="ep-clientes">' +
          _clientesInicio.filter(clienteActivo).slice(0, 400).map(function (c) {
            return '<option value="' + esc(c.local) + '">';
          }).join('') +
        '</datalist></div>' +
      '<div class="campo"><div class="campo-etiq">Zona</div>' +
        '<input class="campo-input" id="ep-loc" value="' + esc(t.loc || '') + '" placeholder="Localidad"/></div>' +
    '</div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarPendiente()">Guardar</button>' +
      '<button class="btn btn-peligro" onclick="cerrarModal();borrarPendiente(' + t.id + ')">' +
        ic('trash', 15) + ' Borrar</button>' +
    '</div>');
}

async function guardarPendiente() {
  var t = EP;
  if (!t) return;
  var texto = (porId('ep-texto').value || '').trim();
  if (!texto) { toast('El pendiente necesita un texto', 'error'); return; }

  var cambios = {};
  if (texto !== (t.texto || '')) cambios.texto = texto;

  var tipo = porId('ep-tipo').value;
  if (tipo !== (t.tipo || 'otro')) cambios.tipo = tipo;

  var cliente = (porId('ep-cliente').value || '').trim();
  if (cliente !== (t.cliente_nombre || '')) cambios.cliente_nombre = cliente || null;

  var loc = (porId('ep-loc').value || '').trim();
  if (loc !== (t.loc || '')) cambios.loc = loc || null;

  if (!Object.keys(cambios).length) { cerrarModal(); return; }

  try {
    await actualizar('tareas', t.id, cambios);
    Object.assign(t, cambios);
    invalidarCache('tareas');
    cerrarModal();
    toast('Pendiente actualizado');
    pintarPendientes();
  } catch (e) { toast(e.message, 'error'); }
}

async function marcarPendiente(id, hecha) {
  var t = _pendientes.find(function (x) { return String(x.id) === String(id); });
  try {
    await actualizar('tareas', id, { hecha: hecha });
    if (t) t.hecha = hecha;
    invalidarCache('tareas');
    pintarPendientes();
  } catch (e) { toast(e.message, 'error'); }
}

async function borrarPendiente(id) {
  try {
    await borrar('tareas', id);
    _pendientes = _pendientes.filter(function (x) { return String(x.id) !== String(id); });
    invalidarCache('tareas');
    toast('Pendiente borrado');
    pintarPendientes();
  } catch (e) { toast(e.message, 'error'); }
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
      (cerrado ? '' : '<div class="pagos" style="margin-top:4px">' + pagoHTML(r) + '</div>') +
    '</div>' +
  '</button>';
}

/* ── Bloques compartidos con otras páginas ───────────────── */
/* Si se le pasa una acción, la tarjeta se vuelve un botón: tocarla
   abre el detalle de ese número. */
function stat(icono, etiqueta, valor, sub, color, accion) {
  var cuerpo =
    '<div class="stat-etiq">' + ic(icono, 14) + esc(etiqueta) +
      (accion ? '<span style="margin-left:auto;opacity:.5">' + ic('chevron', 12) + '</span>' : '') + '</div>' +
    '<div class="stat-val" style="color:' + color + '">' + esc(valor) + '</div>' +
    (sub ? '<div class="stat-sub">' + esc(sub) + '</div>' : '');

  return accion
    ? '<button class="stat stat-tocable" onclick="' + accion + '">' + cuerpo + '</button>'
    : '<div class="stat">' + cuerpo + '</div>';
}

function capitalizar(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }


/* ═══════════════════════════════════════════════════════════
   AVISOS
   Lo que hay que hacer y todavía no se hizo.
   ═══════════════════════════════════════════════════════════ */
function bloqueAvisos(remitos, gastos) {
  var html = '';

  /* Remitos que quedaron sin cliente de la base */
  var huerfanos = remitosSinCliente(remitos, _clientesInicio);
  if (huerfanos.length) {
    html += '<div class="aviso aviso-warn" style="align-items:flex-start">' + ic('alert', 16) +
      '<div style="flex:1">' +
        '<strong>' + plural(huerfanos.length, 'remito') + ' sin cliente asociado</strong>' +
        '<br>' + esc(huerfanos.slice(0, 3).map(function (r) { return r.cliente_nombre || 'sin nombre'; }).join(', ')) +
        (huerfanos.length > 3 ? ' y ' + (huerfanos.length - 3) + ' más' : '') +
        '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
          'onclick="verHuerfanos()">Vincularlos</button>' +
      '</div>' +
    '</div>';
  }

  /* Deudas por cobrar: los días elegidos y hasta que lo cierres */
  var d = resumenDeudas(remitos);
  if (d.items.length && tocaHoy('dias_aviso_deudas', '') && !avisoSilenciado('deudas')) {
    html += '<div class="aviso aviso-warn" style="align-items:flex-start">' + ic('clock', 16) +
      '<div style="flex:1">' +
        '<strong>' + plural(d.clientes, 'cliente') + ' con deuda</strong> · ' + plata(d.total) + ' por cobrar' +
        (d.masVieja ? '<br>La más vieja es de ' + esc(d.masVieja.cliente) + ', hace ' + plural(d.masVieja.dias, 'día') + '.' : '') +
        '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
          'onclick="verDeudas()">Ver el detalle</button>' +
      '</div>' +
      '<button class="btn btn-fantasma" style="padding:2px 6px" aria-label="No mostrar hoy" ' +
        'onclick="cerrarAviso(\'deudas\')">' + ic('x', 15) + '</button>' +
    '</div>';
  }

  /* Gastos sin anotar: solo el día que se configure */
  var desde = isoDe(sumarDias(-6));
  var faltan = faltaAnotarGastos(gastos, desde, hoyISO());
  if (faltan.length && tocaHoy('dia_aviso_gastos', '5') && !avisoSilenciado('gastos')) {
    html += '<div class="aviso aviso-info" style="align-items:flex-start">' + ic('wallet', 16) +
      '<div style="flex:1">' +
        '<strong>Faltan anotar gastos de esta semana:</strong> ' + esc(faltan.join(', ')) + '.' +
        '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
          'onclick="irA(\'gastos\')">Ir a Gastos</button>' +
      '</div>' +
      '<button class="btn btn-fantasma" style="padding:2px 6px" aria-label="No mostrar hoy" ' +
        'onclick="cerrarAviso(\'gastos\')">' + ic('x', 15) + '</button>' +
    '</div>';
  }

  return html;
}

function cerrarAviso(clave) {
  silenciarAviso(clave);
  pintarRuta();
}

/* ── Listado de deudas ───────────────────────────────────── */
function verDeudas() {
  var d = resumenDeudas(_remitosInicio);
  if (!d.items.length) { toast('No hay deudas pendientes'); return; }

  abrirModal('Deudas por cobrar',
    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('clock', 'Total', plata(d.total), plural(d.clientes, 'cliente'), 'var(--warn)') +
      stat('calendar', 'La más vieja', plural(d.masVieja.dias, 'día'), esc(d.masVieja.cliente), 'var(--danger)') +
    '</div>' +
    '<div class="lista">' +
      d.items.map(function (x) {
        return '<div class="fila" style="cursor:default;align-items:flex-start">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(x.cliente) + '</div>' +
            '<div class="fila-sub">' + esc(fechaCorta(x.fecha)) + ' · hace ' + plural(x.dias, 'día') +
              (x.alias ? '<br>' + ic('card', 12) + ' Iba a transferir a <strong>' + esc(x.alias) + '</strong>'
                       : '<br><span style="color:var(--muted)">sin alias anotado</span>') +
            '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(x.monto) + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>',
    '<button class="btn btn-secundario btn-bloque" onclick="cerrarModal();irA(\'hechos\',\'filtro=deuda&q=\')">' +
      ic('search', 15) + ' Abrirlas en Remitos hechos para cobrarlas</button>');
}


/* ═══════════════════════════════════════════════════════════
   REMITOS SIN CLIENTE
   Se pueden dejar así —el remito vale igual— o vincularlos, y
   ahí se completan los datos solos.
   ═══════════════════════════════════════════════════════════ */
var _huerfanoAbierto = null;

function verHuerfanos() {
  var lista = remitosSinCliente(_remitosInicio, _clientesInicio);
  if (!lista.length) { toast('No quedan remitos sin cliente'); return; }

  abrirModal('Remitos sin cliente',
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Se cargaron a las apuradas o sin señal. El remito vale igual: ' +
      'vincularlo sirve para que aparezca en la ficha del cliente y en su deuda.</div>' +
    '<div class="lista">' +
      lista.map(function (r) {
        return '<button class="fila" onclick="vincularHuerfano(' + r.id + ')">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(r.cliente_nombre || 'Sin nombre') + '</div>' +
            '<div class="fila-sub">' + esc(fechaCorta(r.fecha)) +
              (r.cliente_loc ? ' · ' + esc(r.cliente_loc) : '') +
              (r.cliente_dir ? ' · ' + esc(r.cliente_dir) : '') + '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(r.total) + '</div>' +
            '<div class="campo-ayuda">vincular →</div></div>' +
        '</button>';
      }).join('') +
    '</div>');
}

function vincularHuerfano(id) {
  var r = _remitosInicio.find(function (x) { return String(x.id) === String(id); });
  if (!r) return;
  _huerfanoAbierto = r;
  var cands = candidatosParaRemito(r, _clientesInicio, 5);

  abrirModal('Vincular remito de ' + (r.cliente_nombre || '—'),
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      esc(fechaCorta(r.fecha)) + ' · ' + plata(r.total) +
      (r.cliente_dir || r.cliente_loc
        ? '<br>' + esc([r.cliente_dir, r.cliente_loc].filter(Boolean).join(' · '))
        : '') + '</div>' +

    (cands.length
      ? '<div class="eyebrow">Puede ser alguno de estos</div>' +
        '<div class="lista" style="margin-bottom:12px">' +
          cands.map(function (x) {
            return '<button class="fila" onclick="confirmarVinculo(\'' + esc(x.cliente.num) + '\')">' +
              '<span class="num-cliente">' + esc(x.cliente.num_str || x.cliente.num) + '</span>' +
              '<div class="fila-principal">' +
                '<div class="fila-titulo">' + esc(x.cliente.local) + '</div>' +
                '<div class="fila-sub">' + [x.cliente.dir, x.cliente.loc].filter(Boolean).map(esc).join(' · ') + '</div>' +
              '</div>' +
              '<span class="pin pin-neutro">' + Math.round(x.puntaje * 100) + '%</span>' +
            '</button>';
          }).join('') +
        '</div>'
      : '<div class="campo-ayuda" style="margin-bottom:10px">Ningún cliente se parece. Buscalo a mano.</div>') +

    '<div class="campo-etiq">Buscar otro</div>' +
    '<div class="buscador">' +
      '<span class="ic-lupa">' + ic('search', 15) + '</span>' +
      '<input class="campo-input" id="hv-buscar" autocomplete="off" ' +
             'placeholder="Número, nombre o zona" oninput="buscarParaVincular(this.value)"/>' +
    '</div>' +
    '<div id="hv-res"></div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="altaDesdeRemito()">' +
        ic('user', 15) + ' Darlo de alta como cliente</button>' +
      '<button class="btn btn-secundario" onclick="dejarSinCliente()">Dejarlo así</button>' +
    '</div>');
}

function buscarParaVincular(q) {
  var cont = porId('hv-res');
  if (!cont) return;
  if (!q || q.length < 2) { cont.innerHTML = ''; return; }
  var res = _clientesInicio.filter(clienteActivo)
    .filter(function (c) { return coincideCliente(c, q); }).slice(0, 6);

  cont.innerHTML = res.length
    ? '<div class="lista" style="margin-top:8px">' + res.map(function (c) {
        return '<button class="fila" onclick="confirmarVinculo(\'' + esc(c.num) + '\')">' +
          '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(c.local) + '</div>' +
            '<div class="fila-sub">' + [c.dir, c.loc].filter(Boolean).map(esc).join(' · ') + '</div>' +
          '</div></button>';
      }).join('') + '</div>'
    : '<div class="campo-ayuda" style="margin-top:8px">Sin resultados.</div>';
}

/* Marcarlo como revisado: no vuelve a aparecer en la lista */
async function dejarSinCliente() {
  var r = _huerfanoAbierto;
  if (!r) return;
  try {
    await actualizar('remitos', r.id, { sin_cliente: true });
    r.sin_cliente = true;
    invalidarCache('remitos');
    cerrarModal();
    toast('Listo, no vuelve a aparecer');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* Dar de alta al cliente con los datos del propio remito y
   vincularlo en el mismo paso. */
function altaDesdeRemito() {
  var r = _huerfanoAbierto;
  if (!r) return;

  abrirModal('Nuevo cliente desde el remito',
    '<div class="campo"><div class="campo-etiq">Nombre del local</div>' +
      '<input class="campo-input" id="ar-local" value="' + esc(r.cliente_nombre || '') + '"/></div>' +
    '<div class="campo"><div class="campo-etiq">Dirección</div>' +
      '<input class="campo-input" id="ar-dir" value="' + esc(r.cliente_dir || '') + '"/></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Localidad</div>' +
        '<input class="campo-input" id="ar-loc" value="' + esc(r.cliente_loc || '') + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">Teléfono</div>' +
        '<input class="campo-input" id="ar-tel" inputmode="tel" value="' + esc(r.cliente_tel || '') + '"/></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Hoja de ruta</div>' +
        '<input class="campo-input" id="ar-ruta" type="number" inputmode="numeric" min="0" placeholder="Ej: 14"/></div>' +
      '<div class="campo"><div class="campo-etiq">Exhibidores</div>' +
        '<input class="campo-input" id="ar-exhib" type="number" inputmode="numeric" min="0" value="1"/></div>' +
    '</div>',

    '<button class="btn btn-primario btn-bloque" id="btn-ar" onclick="confirmarAltaDesdeRemito()">' +
      'Crear y vincular</button>');
}

async function confirmarAltaDesdeRemito() {
  var r = _huerfanoAbierto;
  var local = (porId('ar-local').value || '').trim();
  if (!local) { toast('Falta el nombre del local', 'error'); return; }

  var btn = porId('btn-ar');
  if (btn) { btn.disabled = true; btn.textContent = 'Creando…'; }

  try {
    var todos = await traerCacheado('clientes');
    var num = todos.reduce(function (m, c) { return Math.max(m, +c.num || 0); }, 0) + 1;
    var ruta = (porId('ar-ruta').value || '').trim();

    var nuevo = {
      num: num,
      num_str: ruta ? codigoCliente(ruta, siguienteEnRuta(todos, ruta)) : String(num),
      local: local,
      dir: (porId('ar-dir').value || '').trim() || null,
      loc: (porId('ar-loc').value || '').trim() || null,
      tel: (porId('ar-tel').value || '').trim() || null,
      ruta: JSON.stringify({ orden: ruta, horarios: [], notas: '' }),
      exhibidores: +porId('ar-exhib').value || 1,
      activo: true,
      fecha: hoyTexto(),
      created_at: new Date().toISOString()
    };

    await crear('clientes', nuevo);
    invalidarCache('clientes');
    _clientesInicio = await traerCacheado('clientes');

    /* Y el remito queda vinculado al cliente recién creado */
    var cambios = datosDeVinculo(nuevo);
    await actualizar('remitos', r.id, cambios);
    Object.assign(r, cambios);
    invalidarCache('remitos');

    cerrarModal();
    toast('Cliente creado y remito vinculado');
    pintarRuta();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear y vincular'; }
    toast(e.message, 'error');
  }
}

async function confirmarVinculo(num) {
  var r = _huerfanoAbierto;
  var c = _clientesInicio.find(function (x) { return String(x.num) === String(num); });
  if (!r || !c) return;

  try {
    var cambios = datosDeVinculo(c);
    await actualizar('remitos', r.id, cambios);
    Object.assign(r, cambios);
    invalidarCache('remitos');
    cerrarModal();
    toast('Vinculado a ' + c.local);
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Los que quedaron sin visitar ────────────────────────── */
function verPendientesDeHoja(ruta) {
  var pend = clientesPendientesDeHoja(ruta, _clientesInicio);
  if (!pend.length) { toast('No quedó nadie pendiente'); return; }

  abrirModal('Sin visitar en la hoja ' + ruta,
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'De la última vez que se hizo esta hoja, hace ' + plural(pend[0].dias, 'día') + '.</div>' +
    '<div class="lista">' +
      pend.map(function (x) {
        return '<button class="fila" onclick="cerrarModal();irA(\'remito\',\'cliente=' +
          esc(x.cliente.num) + '\')">' +
          '<span class="num-cliente">' + esc(x.cliente.num_str || x.cliente.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(x.cliente.local) + '</div>' +
            '<div class="fila-sub">' + esc([x.cliente.dir, x.cliente.loc].filter(Boolean).join(' · ')) + '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="campo-ayuda">hacerle el remito →</div></div>' +
        '</button>';
      }).join('') +
    '</div>',

    '<button class="btn btn-secundario btn-bloque" onclick="limpiarPendientesDeHoja(\'' + esc(ruta) + '\')">' +
      'Ya no hacen falta, borrarlos</button>');
}

async function limpiarPendientesDeHoja(ruta) {
  try {
    await anotarPendientesDeHoja(ruta, [], hoyISO());
    cerrarModal();
    toast('Listo');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
