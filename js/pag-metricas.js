/* ═══════════════════════════════════════════════════════════
   MÉTRICAS — tres cosas: cómo viene hoy, un período a elección
   y el acumulado de siempre. Todo sale de los remitos.
   ═══════════════════════════════════════════════════════════ */

var _datosMetricas = null;
var P = { modo: 'semana', desde: '', hasta: '' };   // período elegido
var _solapaMet = 'numeros';                          // numeros · crm

registrarPagina({
  id: 'metricas',
  menu: 'Métricas',
  grupo: 'Plata',
  icono: 'chart',
  titulo: 'Métricas',
  subtitulo: 'Los números del negocio y cómo viene cada cliente',

  async montar(cont) {
    var r = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('gastos').catch(function () { return []; }),
      traerCacheado('compras').catch(function () { return []; }),
      traerCacheado('clientes').catch(function () { return []; })
    ]);
    _datosMetricas = { remitos: r[0], gastos: r[1], compras: r[2], clientes: r[3] };

    cont.innerHTML =
      '<div style="display:flex;gap:8px;margin-bottom:16px" id="met-solapas"></div>' +
      '<div id="met-numeros">' +
      '<div id="met-hoy"></div>' +
      '<div class="eyebrow" style="margin-top:24px">' + ic('chart', 13) + ' Período</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="met-chips"></div>' +
      '<div id="met-rango"></div>' +
      '<div id="met-periodo"></div>' +
      '<div class="eyebrow" style="margin-top:24px">' + ic('db', 13) + ' Total histórico</div>' +
      '<div id="met-historico"></div>' +
      '</div>' +
      '<div id="met-crm" style="display:none"></div>';

    pintarSolapas();
    pintarMetricas();
  }
});

/* ── Qué remitos entran en el período elegido ────────────── */
function rangoElegido() {
  var hoy = hoyISO();
  if (P.modo === 'semana') return { desde: isoDe(sumarDias(-6)), hasta: hoy, etiqueta: 'Últimos 7 días' };
  if (P.modo === 'mes')    return { desde: isoDe(sumarDias(-29)), hasta: hoy, etiqueta: 'Últimos 30 días' };
  return {
    desde: P.desde || '0000-00-00',
    hasta: P.hasta || '9999-99-99',
    etiqueta: (P.desde ? fechaCorta(P.desde) : 'el principio') + ' a ' + (P.hasta ? fechaCorta(P.hasta) : 'hoy')
  };
}

function enRango(fila, r) {
  var k = claveFecha(fila.fecha || fila.created_at);
  return k && k >= r.desde && k <= r.hasta;
}

function setPeriodo(modo) { P.modo = modo; pintarMetricas(); }
function setFechaP(cual, valor) { P[cual] = valor; P.modo = 'rango'; pintarMetricas(); }

/* ── Pintado ─────────────────────────────────────────────── */
function pintarMetricas() {
  var d = _datosMetricas;
  var reales = function (r) { return r.motivo !== 'cerrado'; };

  /* Hoy */
  var hoy = claveFecha(hoyTexto());
  var deHoy = d.remitos.filter(reales).filter(function (r) {
    return claveFecha(r.fecha) === hoy || claveFecha(r.created_at) === hoy;
  });
  var h = resumirRemitos(deHoy);

  porId('met-hoy').innerHTML =
    '<div class="eyebrow">' + ic('calendar', 13) + ' Facturado hoy</div>' +
    '<div class="grilla-stats">' +
      stat('receipt', 'Facturado', plata(h.facturado), plural(h.cantidad, 'remito'), 'var(--rose)') +
      stat('cash', 'Efectivo', plata(h.efectivo), '', 'var(--ok)') +
      stat('smartphone', 'Transferencia', plata(h.transferencia), '', 'var(--info)') +
      stat('clock', 'Deuda', plata(h.deuda), '', 'var(--warn)') +
    '</div>';

  /* Chips del período */
  porId('met-chips').innerHTML = [['semana', 'Semana'], ['mes', 'Mes'], ['rango', 'Rango']].map(function (o) {
    return '<button class="btn ' + (P.modo === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
      'style="padding:7px 15px" onclick="setPeriodo(\'' + o[0] + '\')">' + o[1] + '</button>';
  }).join('');

  porId('met-rango').innerHTML = P.modo === 'rango'
    ? '<div class="grilla-fechas">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Desde</div>' +
          '<input class="campo-input" type="date" value="' + esc(P.desde) + '" onchange="setFechaP(\'desde\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Hasta</div>' +
          '<input class="campo-input" type="date" value="' + esc(P.hasta) + '" onchange="setFechaP(\'hasta\',this.value)"/></div>' +
      '</div>'
    : '';

  /* Período */
  var r = rangoElegido();
  var remitosP = d.remitos.filter(reales).filter(function (x) { return enRango(x, r); });
  var p = resumirRemitos(remitosP);
  /* Solo lo que pone la empresa: lo que ponen los dueños de su
     bolsillo no es un gasto de la empresa. */
  var gastosP = d.gastos.filter(function (x) { return enRango(x, r); })
    .reduce(function (s, g) { return s + montoEmpresa(g); }, 0);
  var comprasP = d.compras.filter(function (x) { return enRango(x, r); })
    .reduce(function (s, c) { return s + (+c.total_costo || +c.total || 0); }, 0);
  var dias = {};
  remitosP.forEach(function (x) { var k = claveFecha(x.fecha || x.created_at); if (k) dias[k] = 1; });
  var cantDias = Object.keys(dias).length;

  porId('met-periodo').innerHTML =
    '<div class="campo-ayuda" style="margin-bottom:10px">' + esc(r.etiqueta) + '</div>' +
    '<div class="grilla-stats">' +
      stat('receipt', 'Facturado', plata(p.facturado), plural(p.cantidad, 'remito'), 'var(--rose)') +
      stat('cash', 'Efectivo', plata(p.efectivo), '', 'var(--ok)') +
      stat('smartphone', 'Transferencia', plata(p.transferencia), '', 'var(--info)') +
      stat('clock', 'Deuda pendiente', plata(p.deuda), '', 'var(--warn)') +
      stat('wallet', 'Gastos', plata(gastosP), '', 'var(--danger)') +
      stat('cart', 'Compras', plata(comprasP), '', 'var(--violet)') +
      stat('chart', 'Neto', plata(p.facturado - gastosP - comprasP), 'facturado − gastos − compras',
           (p.facturado - gastosP - comprasP) >= 0 ? 'var(--ok)' : 'var(--danger)') +
      stat('box', 'Unidades', String(p.unidades),
           cantDias ? Math.round(p.cantidad / cantDias) + ' remitos por día' : '', 'var(--text2)') +
    '</div>';

  /* Histórico */
  var todos = d.remitos.filter(reales);
  var t = resumirRemitos(todos);
  var gastosT = d.gastos.reduce(function (s, g) { return s + montoEmpresa(g); }, 0);
  var comprasT = d.compras.reduce(function (s, c) { return s + (+c.total_costo || +c.total || 0); }, 0);
  var clientes = {};
  todos.forEach(function (x) { if (x.cliente_nombre) clientes[normalizar(x.cliente_nombre)] = 1; });
  var fechas = todos.map(function (x) { return claveFecha(x.fecha || x.created_at); })
    .filter(Boolean).sort();

  porId('met-historico').innerHTML =
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      (fechas.length ? 'Desde ' + esc(fechaCorta(fechas[0])) + ' hasta hoy' : 'Todavía no hay remitos') + '</div>' +
    '<div class="grilla-stats">' +
      stat('receipt', 'Facturado', plata(t.facturado), plural(t.cantidad, 'remito'), 'var(--rose)') +
      stat('cash', 'Efectivo', plata(t.efectivo), '', 'var(--ok)') +
      stat('smartphone', 'Transferencia', plata(t.transferencia), '', 'var(--info)') +
      stat('clock', 'Deuda pendiente', plata(t.deuda), '', 'var(--warn)') +
      stat('users', 'Clientes atendidos', String(Object.keys(clientes).length), '', 'var(--violet)') +
      stat('box', 'Unidades', String(t.unidades), '', 'var(--text2)') +
      stat('chart', 'Neto', plata(t.facturado - gastosT - comprasT),
           plata(gastosT) + ' en gastos · ' + plata(comprasT) + ' en compras',
           (t.facturado - gastosT - comprasT) >= 0 ? 'var(--ok)' : 'var(--danger)') +
    '</div>';
}


/* ═══════════════════════════════════════════════════════════
   CRM · CÓMO VIENE CADA CLIENTE
   ═══════════════════════════════════════════════════════════ */
var _fichas = null;
var _filtroCRM = '';
var _ordenCRM = 'total';
var _buscaCRM = '';

function pintarSolapas() {
  porId('met-solapas').innerHTML = [
    ['numeros', 'Números', 'chart'],
    ['crm', 'Clientes', 'users']
  ].map(function (o) {
    return '<button class="btn ' + (_solapaMet === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
      'style="flex:1" onclick="setSolapaMet(\'' + o[0] + '\')">' +
      ic(o[2], 15) + ' ' + o[1] + '</button>';
  }).join('');
}

function setSolapaMet(cual) {
  _solapaMet = cual;
  pintarSolapas();
  porId('met-numeros').style.display = cual === 'numeros' ? '' : 'none';
  porId('met-crm').style.display = cual === 'crm' ? '' : 'none';
  if (cual === 'crm') pintarCRM();
}

function pintarCRM() {
  var d = _datosMetricas;
  if (!_fichas) _fichas = fichasCRM(d.clientes, d.remitos);
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

  porId('met-crm').innerHTML =
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
