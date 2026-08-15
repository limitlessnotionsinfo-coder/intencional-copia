/* ═══════════════════════════════════════════════════════════
   NÚMEROS DE LA EMPRESA
   Cuánto entra, cuánto sale, cuánto queda. Todo se calcula en
   finanzas.js: acá solo se muestra.
   ═══════════════════════════════════════════════════════════ */

var _dn = null;                                    // los datos crudos
var N = { modo: 'mes', desde: '', hasta: '' };     // período elegido
var _vista = 'simple';                             // simple · detalle · clientes

registrarPagina({
  id: 'numeros',
  menu: 'Números',
  grupo: 'Plata',
  icono: 'chart',
  titulo: 'Números',
  subtitulo: 'Cómo viene el negocio y cómo viene cada cliente',

  async montar(cont) {
    cont.innerHTML = cargando('Juntando los números…');

    var d = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('gastos').catch(function () { return []; }),
      traerCacheado('compras').catch(function () { return []; }),
      traerCacheado('clientes').catch(function () { return []; })
    ]);
    _dn = { remitos: d[0], gastos: d[1], compras: d[2], clientes: d[3] };
    _fichas = null;

    if (!_dn.remitos.length) {
      cont.innerHTML = vacio('chart', 'Todavía no hay números',
        'Cuando cargues los primeros remitos, acá vas a ver cómo viene el negocio.',
        '<button class="btn btn-primario" onclick="irA(\'remito\')">Cargar un remito</button>');
      return;
    }

    cont.innerHTML =
      '<div style="display:flex;gap:6px;margin-bottom:14px" id="n-vistas"></div>' +

      '<div id="n-plata">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px" id="n-chips"></div>' +
        '<div id="n-rango"></div>' +
        '<div id="n-alertas"></div>' +
        '<div id="n-salud"></div>' +
        '<div id="n-kpis"></div>' +
        '<div id="n-resultado"></div>' +
        '<div id="n-equilibrio"></div>' +
        '<div id="n-caja"></div>' +
        '<div id="n-stock"></div>' +
        '<div id="n-evolucion"></div>' +
        '<div id="n-proyeccion"></div>' +
      '</div>' +

      '<div id="n-crm" style="display:none"></div>';

    pintarVistas();
    pintarNumeros();
  }
});

/* ── Las tres vistas ─────────────────────────────────────────
   Simple es lo que se mira todos los días. Detalle abre las
   cuentas para cuando hay que entender algo. Clientes es el CRM.
   ────────────────────────────────────────────────────────── */
function pintarVistas() {
  porId('n-vistas').innerHTML = [
    ['simple', 'Resumen', 'chart'],
    ['detalle', 'Detalle', 'db'],
    ['clientes', 'Clientes', 'users']
  ].map(function (o) {
    return '<button class="btn ' + (_vista === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
      'style="flex:1;padding:8px 6px;font-size:12.5px" onclick="setVista(\'' + o[0] + '\')">' +
      ic(o[2], 15) + ' ' + o[1] + '</button>';
  }).join('');
}

function setVista(v) {
  _vista = v;
  pintarVistas();
  porId('n-plata').style.display = v === 'clientes' ? 'none' : '';
  porId('n-crm').style.display = v === 'clientes' ? '' : 'none';
  if (v === 'clientes') pintarCRM();
  else pintarNumeros();
}

function setPeriodoN(modo) { N.modo = modo; pintarNumeros(); }
function setFechaN(cual, v) { N[cual] = v; N.modo = 'rango'; pintarNumeros(); }

function pintarNumeros() {
  var r = rangoDe(N.modo, N.desde, N.hasta);
  var d = _dn;

  porId('n-chips').innerHTML =
    [['hoy', 'Hoy'], ['semana', '7 días'], ['mes', '30 días'],
     ['trimestre', '3 meses'], ['anio', 'Año'], ['rango', 'Elegir']]
    .map(function (o) {
      return '<button class="btn ' + (N.modo === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
        'style="padding:6px 12px;font-size:12px" onclick="setPeriodoN(\'' + o[0] + '\')">' + o[1] + '</button>';
    }).join('');

  porId('n-rango').innerHTML = N.modo === 'rango'
    ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Desde</div>' +
          '<input class="campo-input" type="date" value="' + esc(N.desde) + '" ' +
                 'onchange="setFechaN(\'desde\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Hasta</div>' +
          '<input class="campo-input" type="date" value="' + esc(N.hasta) + '" ' +
                 'onchange="setFechaN(\'hasta\',this.value)"/></div>' +
      '</div>'
    : '';

  var completo = _vista === 'detalle';

  pintarAlertasN();
  pintarSaludN();
  pintarKpis(r, completo);
  pintarResultado(r);
  pintarCaja();

  /* Lo que solo aparece en el detalle */
  ['n-equilibrio', 'n-stock', 'n-evolucion', 'n-proyeccion'].forEach(function (id) {
    porId(id).innerHTML = '';
  });
  if (completo) {
    pintarEquilibrio(r);
    pintarStockN();
    pintarEvolucion();
    pintarProyeccionN();
  }
}

/* ── Lo primero: qué habría que mirar ────────────────────── */
function pintarAlertasN() {
  var av = alertasFinancieras(_dn.remitos, _dn.gastos, _dn.compras)
    .filter(function (a) { return a.nivel !== 'bien'; })
    .slice(0, 3);

  porId('n-alertas').innerHTML = av.length
    ? av.map(function (a) {
        return '<div class="aviso ' + (a.nivel === 'mal' ? 'aviso-danger' : 'aviso-warn') + '">' +
          ic('alert', 15) + '<div>' + esc(a.texto) + '</div></div>';
      }).join('')
    : '';
}

/* ── La nota general ─────────────────────────────────────── */
function pintarSaludN() {
  var s = saludFinanciera(_dn.remitos, _dn.gastos, _dn.compras);
  if (!s) {
    porId('n-salud').innerHTML = '';
    return;
  }

  porId('n-salud').innerHTML =
    '<button class="tarjeta" style="width:100%;text-align:left;cursor:pointer;border:none;padding:0" ' +
            'onclick="verSalud()">' +
      '<div class="tarjeta-cuerpo" style="display:flex;align-items:center;gap:14px">' +
        '<div style="flex:0 0 auto;text-align:center">' +
          '<div style="font-family:var(--acento);font-size:38px;font-weight:700;line-height:1;color:' +
            s.color + '">' + s.nota + '</div>' +
          '<div class="campo-ayuda" style="margin:2px 0 0">de 100</div>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="campo-etiq" style="margin:0">Salud financiera</div>' +
          '<div style="font-weight:700;font-size:15px;color:' + s.color + '">' + esc(s.estado) + '</div>' +
          '<div class="campo-ayuda">' +
            (s.enContra.length
              ? 'Lo que más pesa en contra: ' + esc(s.enContra[0].nombre.toLowerCase())
              : 'Todos los indicadores en verde') +
            ' · tocá para ver por qué</div>' +
        '</div>' +
        '<span style="opacity:.4">' + ic('chevron', 16) + '</span>' +
      '</div>' +
    '</button>';
}

function verSalud() {
  var s = saludFinanciera(_dn.remitos, _dn.gastos, _dn.compras);
  if (!s) return;

  abrirModal('Salud financiera · ' + s.nota + '/100',
    '<div class="campo-ayuda" style="margin-bottom:12px">' +
      'Cada factor aporta hasta cierto puntaje. Los de abajo son los que más ' +
      'lugar tienen para mejorar.</div>' +

    s.factores.map(function (f) {
      var pct = Math.round(f.puntos / f.sobre * 100);
      return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">' +
          '<strong style="font-size:13.5px">' + esc(f.nombre) + '</strong>' +
          '<span style="font-weight:700;color:' + (f.bueno ? 'var(--ok)' : 'var(--warn)') + '">' +
            f.puntos + '/' + f.sobre + '</span>' +
        '</div>' +
        '<div style="height:5px;border-radius:99px;background:var(--subtle);margin:5px 0">' +
          '<div style="height:100%;width:' + pct + '%;border-radius:99px;background:' +
            (f.bueno ? 'var(--ok)' : 'var(--warn)') + '"></div>' +
        '</div>' +
        '<div class="campo-ayuda" style="margin:0">' + esc(f.ayuda) + '</div>' +
      '</div>';
    }).join(''));
}

/* ── Los números grandes ─────────────────────────────────── */
function flecha(v) {
  if (v === null || v === undefined) return '';
  var color = v > 0 ? 'var(--ok)' : v < 0 ? 'var(--danger)' : 'var(--muted)';
  var signo = v > 0 ? '+' : '';
  return '<span style="color:' + color + ';font-weight:600">' + signo + v + '%</span>';
}

function pintarKpis(r, completo) {
  var c = conVariacion(_dn.remitos, _dn.gastos, _dn.compras, r);
  var a = c.actual, i = a.detalle.ingresos, e = a.detalle.egresos;

  var tarjeta = function (etiqueta, valor, variacion, sub, color, accion) {
    return '<button class="stat stat-tocable" onclick="' + (accion || '') + '"' +
             (accion ? '' : ' disabled style="cursor:default"') + '>' +
      '<div class="stat-etiq">' + esc(etiqueta) +
        (accion ? '<span style="margin-left:auto;opacity:.5">' + ic('chevron', 12) + '</span>' : '') +
      '</div>' +
      '<div class="stat-val" style="color:' + color + '">' + esc(valor) + '</div>' +
      '<div class="stat-sub">' + (variacion !== undefined ? flecha(variacion) + ' ' : '') + esc(sub || '') + '</div>' +
    '</button>';
  };

  porId('n-kpis').innerHTML =
    '<div class="eyebrow" style="margin-top:14px">' + ic('chart', 13) + ' ' + esc(r.etiqueta) + '</div>' +
    '<div class="grilla-stats">' +
      tarjeta('Facturación', plata(i.facturado), c.var.facturado, 'vs antes', 'var(--rose)',
              "detalleN('facturacion')") +
      tarjeta('Ganancia neta', plata(a.neta), c.var.neta, 'vs antes',
              a.neta >= 0 ? 'var(--ok)' : 'var(--danger)', "detalleN('neta')") +
      tarjeta('Margen neto', a.margenNeto === null ? '—' : a.margenNeto + '%',
              undefined,
              c.var.margen !== null ? (c.var.margen > 0 ? '+' : '') + c.var.margen + ' puntos' : '',
              'var(--violet)') +
      tarjeta('Costos totales', plata(a.costoMercaderia + a.gastosFijos + a.gastosVariables),
              undefined, 'mercadería y gastos', 'var(--danger)', "detalleN('costos')") +
      tarjeta('Deuda por cobrar', plata(i.pendiente), undefined,
              i.pendiente ? 'sin cobrar' : 'todo cobrado',
              i.pendiente ? 'var(--warn)' : 'var(--ok)') +
      tarjeta('Unidades vendidas', String(i.unidades), c.var.unidades,
              plural(i.operaciones, 'venta'), 'var(--text2)') +

      (completo
        ? tarjeta('Gastos fijos', plata(a.gastosFijos), c.var.fijos, 'vs antes', 'var(--text2)',
                  "detalleN('fijos')") +
          tarjeta('Gastos variables', plata(a.gastosVariables), c.var.variables, 'vs antes', 'var(--text2)',
                  "detalleN('variables')") +
          tarjeta('Reposición', plata(e.reposicion), c.var.reposicion,
                  plural(e.unidadesRepuestas, 'unidad', 'unidades'), 'var(--info)') +
          tarjeta('Ticket promedio', plata(i.ticket), c.var.ticket,
                  plata(i.precioUnidad) + ' por unidad', 'var(--rose)')
        : '') +
    '</div>';
}

/* ── De dónde sale cada número ───────────────────────────── */
function detalleN(cual) {
  var r = rangoDe(N.modo, N.desde, N.hasta);
  var a = rentabilidad(_dn.remitos, _dn.gastos, _dn.compras, r);
  var i = a.detalle.ingresos, e = a.detalle.egresos, cmv = a.detalle.costo;

  var linea = function (t, v, negativo, ayuda) {
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;font-size:13.5px' +
      (negativo ? ';color:var(--danger)' : '') + '">' +
      '<span>' + (negativo ? '− ' : '') + esc(t) +
        (ayuda ? '<br><span class="campo-ayuda">' + esc(ayuda) + '</span>' : '') + '</span>' +
      '<strong style="white-space:nowrap">' + plata(v) + '</strong></div>';
  };
  var total = function (t, v, color) {
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:9px 0;margin-top:4px;' +
      'border-top:2px solid var(--border);font-size:14.5px">' +
      '<strong>' + esc(t) + '</strong>' +
      '<strong style="color:' + (color || 'var(--text)') + '">' + plata(v) + '</strong></div>';
  };

  if (cual === 'neta') {
    abrirModal('Cómo se llega a la ganancia neta',
      '<div class="campo-ayuda" style="margin-bottom:8px">' + esc(r.etiqueta) + '</div>' +
      linea('Facturación', a.facturado, false, plural(i.operaciones, 'venta')) +
      linea('Costo de la mercadería', a.costoMercaderia, true,
            'lo que costó comprar lo que se vendió') +
      total('Ganancia bruta', a.bruta, 'var(--text2)') +
      linea('Gastos variables', a.gastosVariables, true, 'nafta, insumos, envíos') +
      total('Ganancia operativa', a.operativa, 'var(--text2)') +
      linea('Gastos fijos', a.gastosFijos, true, 'sueldos y demás, se pagan igual') +
      total('Ganancia neta', a.neta, a.neta >= 0 ? 'var(--ok)' : 'var(--danger)') +
      (a.margenNeto !== null
        ? '<div class="aviso aviso-ok" style="margin-top:12px">' + ic('chart', 15) +
          '<div>De cada ' + plata(100) + ' facturados, <strong>' + plata(Math.round(a.margenNeto)) +
          '</strong> quedan de ganancia.</div></div>'
        : '') +
      (cmv.unidadesSinCosto
        ? avisoHTML('warn', plural(cmv.unidadesSinCosto, 'unidad', 'unidades') +
            ' sin costo cargado: su producto ya no está en la lista, así que no entran en el cálculo. ' +
            'Se arregla en Configuraciones → Precios y productos.', 'alert')
        : ''));
    return;
  }

  if (cual === 'facturacion') {
    abrirModal('Facturación · ' + r.etiqueta,
      linea('Cobrado en el momento', i.cobrado) +
      linea('Todavía en deuda', i.pendiente) +
      total('Facturado', i.facturado, 'var(--rose)') +
      '<div class="campo-ayuda" style="margin-top:10px">' +
        plural(i.operaciones, 'venta') + ' · ' + plural(i.unidades, 'unidad', 'unidades') + ' · ' +
        'ticket promedio ' + plata(i.ticket) + '</div>');
    return;
  }

  if (cual === 'costos') {
    abrirModal('Costos · ' + r.etiqueta,
      linea('Mercadería vendida', a.costoMercaderia) +
      linea('Gastos variables', a.gastosVariables) +
      linea('Gastos fijos', a.gastosFijos) +
      total('Total', a.costoMercaderia + a.gastosVariables + a.gastosFijos, 'var(--danger)') +
      '<div class="campo-ayuda" style="margin-top:10px">' +
        'La reposición de stock (' + plata(e.reposicion) + ') no está acá: es plata que se ' +
        'convierte en mercadería, no un costo del período.</div>');
    return;
  }

  /* fijos o variables: el detalle por categoría */
  var esFijo = cual === 'fijos';
  var items = e.gastos.filter(function (g) { return esGastoFijo(g) === esFijo && montoEmpresa(g) > 0; })
    .sort(function (x, y) { return montoEmpresa(y) - montoEmpresa(x); });

  abrirModal((esFijo ? 'Gastos fijos' : 'Gastos variables') + ' · ' + r.etiqueta,
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      (esFijo
        ? 'Se pagan haya o no ventas.'
        : 'Acompañan a la actividad: más ventas, más gasto.') + '</div>' +
    (items.length
      ? '<div class="lista">' + items.map(function (g) {
          return '<button class="fila" onclick="cerrarModal();irA(\'gastos\')">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(g.descripcion || '—') + '</div>' +
              '<div class="fila-sub">' + esc(fechaCorta(g.fecha)) + ' · ' +
                esc(categoriaGasto(g.categoria).etiqueta) + '</div>' +
            '</div>' +
            '<div class="fila-derecha"><div class="fila-titulo">' + plata(montoEmpresa(g)) + '</div></div>' +
          '</button>';
        }).join('') + '</div>'
      : '<div class="campo-ayuda">Sin gastos de este tipo en el período.</div>'));
}

/* ── Punto de equilibrio ─────────────────────────────────── */
function pintarEquilibrio(r) {
  var pe = puntoDeEquilibrio(_dn.remitos, _dn.gastos, _dn.compras, r);
  var cont = porId('n-equilibrio');

  if (!pe) { cont.innerHTML = ''; return; }

  if (pe.imposible) {
    cont.innerHTML = '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
      '<div class="campo-etiq" style="margin:0">Punto de equilibrio</div>' +
      '<div class="campo-ayuda">No se puede calcular: ' + esc(pe.motivo) + '</div>' +
    '</div></div>';
    return;
  }

  cont.innerHTML =
    '<div class="tarjeta" style="border-color:' + (pe.alcanzado ? 'var(--ok-border)' : 'var(--danger-border)') + '">' +
      '<div class="tarjeta-cuerpo">' +
        '<div class="campo-etiq" style="margin:0">Punto de equilibrio</div>' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:4px 0 10px">' +
          '<div class="stat-val" style="font-size:24px">' + plata(pe.monto) + '</div>' +
          '<div style="text-align:right;font-weight:700;color:' +
            (pe.alcanzado ? 'var(--ok)' : 'var(--danger)') + '">' +
            (pe.alcanzado ? pe.porcentaje + '% por encima' : plata(-pe.diferencia) + ' por debajo') +
          '</div>' +
        '</div>' +
        '<div class="campo-ayuda">' +
          'Es lo que hay que facturar para cubrir los ' + plata(rentabilidad(_dn.remitos, _dn.gastos, _dn.compras, r).gastosFijos) +
          ' de gastos fijos. De cada peso vendido quedan ' + pe.margenContribucion + ' centavos ' +
          'después de la mercadería y los gastos variables.' +
          (pe.unidades ? '<br>En unidades, son unas ' + pe.unidades + ' (vendiste ' + pe.unidadesVendidas + ').' : '') +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── Ganancias, una debajo de la otra ────────────────────── */
function pintarResultado(r) {
  var a = rentabilidad(_dn.remitos, _dn.gastos, _dn.compras, r);
  var fila = function (t, v, m, color) {
    return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:7px 0">' +
      '<div><strong style="font-size:13.5px">' + esc(t) + '</strong>' +
        (m !== null ? '<span class="campo-ayuda"> · ' + m + '% de la facturación</span>' : '') + '</div>' +
      '<strong style="color:' + color + ';white-space:nowrap">' + plata(v) + '</strong></div>';
  };

  porId('n-resultado').innerHTML =
    '<button class="tarjeta" style="width:100%;text-align:left;border:none;padding:0;cursor:pointer" ' +
            'onclick="detalleN(\'neta\')">' +
      '<div class="tarjeta-cuerpo">' +
        '<div class="campo-etiq" style="margin:0 0 4px">Resultado del período' +
          '<span style="float:right;opacity:.4">' + ic('chevron', 14) + '</span></div>' +
        fila('Ganancia bruta', a.bruta, a.margenBruto, 'var(--text2)') +
        fila('Ganancia operativa', a.operativa, a.margenOperativo, 'var(--text2)') +
        fila('Ganancia neta', a.neta, a.margenNeto, a.neta >= 0 ? 'var(--ok)' : 'var(--danger)') +
      '</div>' +
    '</button>';
}

/* ── Con qué plata se cuenta ─────────────────────────────── */
function pintarCaja() {
  var c = disponibleParaRetirar(_dn.remitos, _dn.gastos, _dn.compras);

  porId('n-caja').innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('wallet', 16) + ' Plata disponible' +
        '<span style="margin-left:auto"><span class="pin ' +
          (c.disponible >= 0 ? 'pin-ok' : 'pin-danger') + '">' + plata(c.disponible) + '</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +
        '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px">' +
          '<span>En caja</span><strong>' + plata(c.caja) + '</strong></div>' +
        '<div class="campo-etiq" style="margin:10px 0 2px">Comprometido</div>' +
        [['Gastos de la semana', c.compromisos],
         ['Próxima reposición', c.reposicion],
         ['Gastos sin pagar', c.sinPagar],
         ['Reserva de seguridad (' + c.reservaPct + '%)', c.reserva]]
          .filter(function (x) { return x[1] > 0; })
          .map(function (x) {
            return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:var(--danger)">' +
              '<span>− ' + esc(x[0]) + '</span><strong>' + plata(x[1]) + '</strong></div>';
          }).join('') +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:4px;' +
             'border-top:2px solid var(--border)">' +
          '<strong>Se puede usar</strong>' +
          '<strong style="color:' + (c.disponible >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' +
            plata(c.disponible) + '</strong></div>' +
        (c.deudaPorCobrar > 0
          ? '<div class="campo-ayuda">Además hay ' + plata(c.deudaPorCobrar) +
            ' en deuda sin cobrar, que no está contado acá.</div>'
          : '') +
        '<div class="campo-ayuda" style="margin-top:8px">' +
          'La reserva se configura en Configuraciones → Finanzas.</div>' +
      '</div>' +
    '</details>';
}

/* ── Stock ───────────────────────────────────────────────── */
function pintarStockN() {
  var st = stockEstimado(_dn.remitos, _dn.compras);
  var repo = reposicionEstimada(_dn.remitos, _dn.compras);
  var cont = porId('n-stock');

  if (!st && !repo) {
    cont.innerHTML = '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
      '<div class="campo-etiq" style="margin:0">Stock y reposición</div>' +
      '<div class="campo-ayuda">Datos insuficientes: hacen falta compras cargadas para estimarlo.</div>' +
    '</div></div>';
    return;
  }

  cont.innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('box', 16) + ' Stock y reposición' +
        (repo ? '<span style="margin-left:auto"><span class="pin pin-neutro">próxima ' +
                plata(repo.monto) + '</span></span>' : '') +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +

        (st
          ? (st.confiable
              ? '<div class="grilla-stats" style="margin-bottom:10px">' +
                  stat('box', 'Unidades', String(st.unidades), 'estimadas', 'var(--text2)') +
                  (st.valor ? stat('wallet', 'Capital inmovilizado', plata(st.valor),
                                   plata(st.costoPromedio) + ' por unidad', 'var(--violet)') : '') +
                  (st.rotacion ? stat('refresh', 'Rotación', st.rotacion + '×',
                                      'veces que se renovó', 'var(--info)') : '') +
                '</div>'
              : avisoHTML('warn', 'Se vendieron ' + Math.abs(st.unidades) + ' unidades más de las ' +
                  'compradas: faltan compras por cargar y el stock no se puede estimar.', 'alert'))
          : '') +

        (repo
          ? '<div class="campo-etiq" style="margin-top:6px">Próxima reposición</div>' +
            '<div class="stat-val" style="font-size:23px;color:var(--rose)">' + plata(repo.monto) + '</div>' +
            '<div class="campo-ayuda">' +
              'Unas ' + plural(repo.unidades, 'unidad', 'unidades') + ' para cubrir ' + repo.cubreDias +
              ' días, al ritmo de ' + repo.porSemana + ' por semana. ' +
              'Estimado con las últimas ' + esc(repo.basadoEn) + '.' +
              (repo.descontoStock ? ' Ya se descontaron las ' + repo.stockActual + ' que quedarían en stock.' : '') +
            '</div>'
          : '<div class="campo-ayuda">Todavía no hay ventas suficientes para estimar la próxima reposición.</div>') +

        '<div class="campo-ayuda" style="margin-top:10px">' +
          'El stock se estima con lo comprado menos lo vendido: la app no lleva inventario, ' +
          'así que es una aproximación.</div>' +
      '</div>' +
    '</details>';
}

/* ── Cómo viene evolucionando ────────────────────────────── */
var _verSerie = 'facturado';

function setVerSerie(v) { _verSerie = v; pintarEvolucion(); }

function pintarEvolucion() {
  var s = serie(_dn.remitos, _dn.gastos, _dn.compras, 8, 'semana');
  var conDatos = s.filter(function (p) { return p.facturado > 0 || p.gastos > 0; });

  if (conDatos.length < 2) {
    porId('n-evolucion').innerHTML = '';
    return;
  }

  var max = Math.max.apply(null, s.map(function (p) { return Math.abs(p[_verSerie]) || 0; })) || 1;
  var formato = _verSerie === 'facturado' || _verSerie === 'neta' ? plata : String;

  porId('n-evolucion').innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('chart', 16) + ' Últimas 8 semanas</summary>' +
      '<div class="tarjeta-cuerpo">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
          [['facturado', 'Facturado'], ['unidades', 'Unidades'], ['operaciones', 'Ventas'], ['neta', 'Ganancia']]
          .map(function (o) {
            return '<button class="btn ' + (_verSerie === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
              'style="padding:5px 11px;font-size:12px" onclick="setVerSerie(\'' + o[0] + '\')">' + o[1] + '</button>';
          }).join('') +
        '</div>' +

        '<div style="display:flex;align-items:flex-end;gap:5px;height:120px;margin-bottom:6px">' +
          s.map(function (p) {
            var v = p[_verSerie] || 0;
            var alto = Math.max(2, Math.abs(v) / max * 100);
            var negativo = v < 0;
            return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;' +
                   'align-items:center;height:100%;gap:3px" title="' + esc(p.etiqueta) + ': ' + formato(v) + '">' +
              '<div style="font-size:8.5px;color:var(--muted);white-space:nowrap">' +
                (Math.abs(v) >= 1000 ? Math.round(Math.abs(v) / 1000) + 'k' : Math.abs(v) || '') + '</div>' +
              '<div style="width:100%;height:' + alto + '%;border-radius:4px 4px 0 0;background:' +
                (negativo ? 'var(--danger)' : 'var(--rose)') + ';opacity:' +
                (v ? '1' : '.25') + '"></div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div style="display:flex;gap:5px">' +
          s.map(function (p) {
            return '<div style="flex:1;text-align:center;font-size:8.5px;color:var(--muted)">' +
              esc(p.etiqueta.slice(0, 5)) + '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</details>';
}

/* ── Lo que viene ────────────────────────────────────────── */
function pintarProyeccionN() {
  var p = proyeccion(_dn.remitos, _dn.gastos, _dn.compras);
  var cont = porId('n-proyeccion');

  if (!p) {
    cont.innerHTML = '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
      '<div class="campo-etiq" style="margin:0">Proyección</div>' +
      '<div class="campo-ayuda">Datos insuficientes: hacen falta al menos 3 semanas con ventas.</div>' +
    '</div></div>';
    return;
  }

  cont.innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('calendar', 16) + ' El mes que viene' +
        '<span style="margin-left:auto"><span class="pin pin-neutro">estimado</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +
        '<div class="campo-ayuda" style="margin-bottom:10px">' +
          'Con el promedio de las últimas ' + p.semanas + ' semanas, no con la última: ' +
          'así una semana excepcional no distorsiona la cuenta.</div>' +
        '<div class="grilla-stats">' +
          stat('receipt', 'Facturación', plata(p.facturado),
               p.tendencia !== null ? (p.tendencia > 0 ? 'viene subiendo' : 'viene bajando') : '',
               'var(--rose)') +
          stat('box', 'Unidades', String(p.unidades), '', 'var(--text2)') +
          stat('wallet', 'Gastos', plata(p.gastos), '', 'var(--danger)') +
          stat('chart', 'Ganancia', plata(p.neta), '', p.neta >= 0 ? 'var(--ok)' : 'var(--danger)') +
        '</div>' +
        (p.reposicion
          ? '<div class="campo-ayuda" style="margin-top:10px">' +
            'Reposición estimada: <strong>' + plata(p.reposicion.monto) + '</strong>.</div>'
          : '') +
      '</div>' +
    '</details>';
}

/* ═══════════════════════════════════════════════════════════
   CRM · CÓMO VIENE CADA CLIENTE
   ═══════════════════════════════════════════════════════════ */
var _fichas = null;
var _filtroCRM = '';
var _ordenCRM = 'total';
var _buscaCRM = '';

function pintarCRM() {
  if (!_fichas) _fichas = fichasCRM(_dn.clientes, _dn.remitos);
  var r = resumenCRM(_fichas);

  var visibles = _fichas
    .filter(function (f) { return !_filtroCRM || f.estado === _filtroCRM; })
    .filter(function (f) { return !_buscaCRM || coincideCliente(f.cliente, _buscaCRM); });

  if (_ordenCRM === 'olvidados') {
    visibles = visibles.slice().sort(function (a, b) { return b.dias - a.dias; });
  } else if (_ordenCRM === 'frecuentes') {
    visibles = visibles.slice().sort(function (a, b) {
      return (a.ritmo || 999) - (b.ritmo || 999);
    });
  } else if (_ordenCRM === 'deuda') {
    visibles = visibles.slice().sort(function (a, b) { return b.deuda - a.deuda; });
  }

  porId('n-crm').innerHTML =
    /* Lo que hay que hacer hoy, antes que cualquier número */
    (r.enPeligro.length
      ? '<div class="aviso aviso-warn" style="align-items:flex-start">' + ic('alert', 16) +
        '<div><strong>' + plural(r.enPeligro.length, 'cliente') + ' se ' +
        (r.enPeligro.length === 1 ? 'está atrasando' : 'están atrasando') + '</strong>' +
        (r.plataEnPeligro > 0
          ? '<br>' + plata(r.plataEnPeligro) + ' de facturación en riesgo de perderse.'
          : '') +
        '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
          'onclick="setFiltroCRM(\'enRiesgo\')">Ver a quiénes llamar</button></div></div>'
      : '') +

    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('users', 'Clientes que compran', String(r.conCompras),
           'de ' + r.total + ' activos', 'var(--violet)') +
      stat('receipt', 'Promedio por cliente', plata(r.promedio),
           'en toda la relación', 'var(--rose)') +
      (r.ritmoTipico
        ? stat('calendar', 'Ritmo habitual', 'cada ' + r.ritmoTipico + ' días',
               'el cliente del medio', 'var(--info)')
        : '') +
      (r.concentracion
        ? stat('chart', 'Los mejores ' + r.cuantosSonElTop, r.concentracion + '%',
               'de todo lo facturado', 'var(--text2)',
               "detalleConcentracion()")
        : '') +
    '</div>' +

    /* Un chip por estado, con cuántos hay en cada uno */
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
      chipCRM('', 'Todos', _fichas.length) +
      Object.keys(ESTADOS_CRM)
        .filter(function (k) { return r.porEstado[k].length; })
        .map(function (k) { return chipCRM(k, ESTADOS_CRM[k].etiqueta, r.porEstado[k].length); })
        .join('') +
    '</div>' +

    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<div class="buscador" style="flex:1;min-width:120px">' +
        '<span class="ic-lupa">' + ic('search', 15) + '</span>' +
        '<input class="campo-input" value="' + esc(_buscaCRM) + '" ' +
               'placeholder="Buscar cliente" oninput="setBuscaCRM(this.value)"/>' +
      '</div>' +
      '<select class="campo-input" style="width:auto" onchange="setOrdenCRM(this.value)">' +
        [['total', 'Los que más facturan'], ['olvidados', 'Hace más que no compran'],
         ['frecuentes', 'Los más frecuentes'], ['deuda', 'Los que más deben']]
        .map(function (o) {
          return '<option value="' + o[0] + '"' + (_ordenCRM === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') +
      '</select>' +
    '</div>' +

    (_filtroCRM
      ? '<div class="campo-ayuda" style="margin-bottom:8px">' +
        esc(ESTADOS_CRM[_filtroCRM].ayuda) + '</div>'
      : '') +

    (visibles.length
      ? '<div class="lista">' + visibles.slice(0, 60).map(filaCRM).join('') + '</div>' +
        (visibles.length > 60
          ? '<div class="campo-ayuda">Se muestran 60 de ' + visibles.length + '. Usá el buscador.</div>'
          : '')
      : '<div class="campo-ayuda">Ningún cliente en este grupo.</div>');
}

function chipCRM(estado, etiqueta, n) {
  return '<button class="btn ' + (_filtroCRM === estado ? 'btn-primario' : 'btn-secundario') + '" ' +
    'style="padding:5px 11px;font-size:12px" onclick="setFiltroCRM(\'' + estado + '\')">' +
    esc(etiqueta) + ' <span class="pin pin-neutro" style="margin-left:2px">' + n + '</span></button>';
}

function filaCRM(f) {
  var e = ESTADOS_CRM[f.estado];
  return '<button class="fila" onclick="verFichaCRM(\'' + esc(f.cliente.num) + '\')">' +
    '<span class="num-cliente">' + esc(f.cliente.num_str || f.cliente.num) + '</span>' +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(f.cliente.local) + '</div>' +
      '<div class="fila-sub">' +
        '<span class="pin ' + e.clase + '">' + esc(e.etiqueta) + '</span> ' +
        (f.compras
          ? plural(f.compras, 'compra') + ' · ' +
            (f.dias === 0 ? 'compró hoy' : 'hace ' + plural(f.dias, 'día')) +
            (f.ritmo ? ' · cada ' + f.ritmo + ' días' : '')
          : 'nunca compró') +
        (f.deuda > 0 ? ' · <strong>debe ' + plata(f.deuda) + '</strong>' : '') +
      '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(f.total) + '</div>' +
      (f.promedio ? '<div class="campo-ayuda">' + plata(f.promedio) + ' c/u</div>' : '') +
    '</div>' +
  '</button>';
}

function setFiltroCRM(e) { _filtroCRM = e; pintarCRM(); }
function setOrdenCRM(o)  { _ordenCRM = o;  pintarCRM(); }
function setBuscaCRM(q)  { _buscaCRM = q;  pintarCRM(); }

/* ── La ficha de un cliente ──────────────────────────────── */
function verFichaCRM(num) {
  var f = _fichas.find(function (x) { return String(x.cliente.num) === String(num); });
  if (!f) return;
  var e = ESTADOS_CRM[f.estado];
  var sug = sugerenciaCRM(f);

  abrirModal(f.cliente.local,
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      '<span class="pin ' + e.clase + '">' + esc(e.etiqueta) + '</span> ' +
      esc([f.cliente.dir, f.cliente.loc].filter(Boolean).join(' · ')) +
      (rutaDe(f.cliente) ? ' · Ruta ' + esc(rutaDe(f.cliente)) : '') +
    '</div>' +

    (sug ? avisoHTML(f.estado === 'enRiesgo' || f.estado === 'perdido' ? 'warn' : 'ok',
                     esc(sug), f.estado === 'fiel' ? 'check' : 'alert') : '') +

    '<div class="grilla-stats" style="margin:12px 0">' +
      stat('receipt', 'Facturado', plata(f.total), plural(f.compras, 'compra'), 'var(--rose)') +
      stat('chart', 'Promedio', plata(f.promedio), 'por reposición', 'var(--violet)') +
      (f.ritmo ? stat('calendar', 'Compra cada', f.ritmo + ' días', '', 'var(--info)') : '') +
      stat('clock', 'Última', f.dias === 0 ? 'hoy' : 'hace ' + f.dias + ' d',
           f.ultima ? fechaCorta(f.ultima) : '', f.dias > f.esperado ? 'var(--warn)' : 'var(--ok)') +
      (f.deuda > 0 ? stat('alert', 'Debe', plata(f.deuda), '', 'var(--danger)') : '') +
      (f.unidades ? stat('box', 'Unidades', String(f.unidades), 'en total', 'var(--text2)') : '') +
    '</div>' +

    (f.remitos.length
      ? '<div class="eyebrow">Sus últimas compras</div>' +
        '<div class="lista">' +
          f.remitos.slice(0, 10).map(function (r) {
            return '<div class="fila" style="cursor:default">' +
              '<div class="fila-principal">' +
                '<div class="fila-titulo">' + esc(fechaCorta(r.fecha)) + '</div>' +
                '<div class="fila-sub">' + plural(+r.unidades || 0, 'unidad', 'unidades') +
                  (deudaPendiente(r) > 0 ? ' · <strong>debe ' + plata(deudaPendiente(r)) + '</strong>' : '') +
                '</div>' +
              '</div>' +
              '<div class="fila-derecha"><div class="fila-titulo">' + plata(r.total) + '</div></div>' +
            '</div>';
          }).join('') +
        '</div>'
      : ''),

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" ' +
              'onclick="cerrarModal();irA(\'remito\',\'cliente=' + esc(f.cliente.num) + '\')">' +
        ic('receipt', 15) + ' Hacerle un remito</button>' +
      (f.cliente.tel
        ? '<button class="btn btn-secundario" onclick="llamarCliente(\'' + esc(f.cliente.tel) + '\')">' +
          ic('phone', 15) + ' Llamar</button>'
        : '') +
    '</div>');
}

function llamarCliente(tel) {
  var limpio = String(tel).replace(/[^0-9+]/g, '');
  if (limpio) window.open('tel:' + limpio);
}

/* Por qué importa la concentración */
function detalleConcentracion() {
  var r = resumenCRM(_fichas);
  var mejores = _fichas.filter(function (f) { return f.compras > 0; })
    .sort(function (a, b) { return b.total - a.total; })
    .slice(0, r.cuantosSonElTop);

  abrirModal('De dónde viene la facturación',
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Los ' + r.cuantosSonElTop + ' mejores clientes aportan el <strong>' + r.concentracion + '%</strong> ' +
      'de todo lo facturado.' +
      (r.concentracion > 50
        ? ' Es una concentración alta: perder uno de estos se siente enseguida.'
        : ' La facturación está bien repartida.') +
    '</div>' +
    '<div class="lista">' +
      mejores.map(function (f) {
        var e = ESTADOS_CRM[f.estado];
        return '<button class="fila" onclick="cerrarModal();verFichaCRM(\'' + esc(f.cliente.num) + '\')">' +
          '<span class="num-cliente">' + esc(f.cliente.num_str || f.cliente.num) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(f.cliente.local) + '</div>' +
            '<div class="fila-sub"><span class="pin ' + e.clase + '">' + esc(e.etiqueta) + '</span> ' +
              plural(f.compras, 'compra') + '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(f.total) + '</div></div>' +
        '</button>';
      }).join('') +
    '</div>');
}
