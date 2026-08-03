/* ═══════════════════════════════════════════════════════════
   MÉTRICAS — tres cosas: cómo viene hoy, un período a elección
   y el acumulado de siempre. Todo sale de los remitos.
   ═══════════════════════════════════════════════════════════ */

var _datosMetricas = null;
var P = { modo: 'semana', desde: '', hasta: '' };   // período elegido

registrarPagina({
  id: 'metricas',
  menu: 'Métricas',
  grupo: 'Plata',
  icono: 'chart',
  titulo: 'Métricas',
  subtitulo: 'Lo de hoy, el período que elijas y el total histórico',

  async montar(cont) {
    var r = await Promise.all([
      traerCacheado('remitos'),
      traerCacheado('gastos').catch(function () { return []; }),
      traerCacheado('compras').catch(function () { return []; })
    ]);
    _datosMetricas = { remitos: r[0], gastos: r[1], compras: r[2] };

    cont.innerHTML =
      '<div id="met-hoy"></div>' +
      '<div class="eyebrow" style="margin-top:24px">' + ic('chart', 13) + ' Período</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="met-chips"></div>' +
      '<div id="met-rango"></div>' +
      '<div id="met-periodo"></div>' +
      '<div class="eyebrow" style="margin-top:24px">' + ic('db', 13) + ' Total histórico</div>' +
      '<div id="met-historico"></div>';

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
  var gastosP = d.gastos.filter(function (x) { return enRango(x, r); })
    .reduce(function (s, g) { return s + (+g.monto || 0); }, 0);
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
  var gastosT = d.gastos.reduce(function (s, g) { return s + (+g.monto || 0); }, 0);
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
