/* ═══════════════════════════════════════════════════════════
   MÉTRICAS — el mes elegido, de dónde salió la plata y a dónde
   se fue. Todo se calcula de los remitos: no hay ningún total
   guardado aparte que se pueda desincronizar.
   ═══════════════════════════════════════════════════════════ */

var _mesMetricas = '';
var _datosMetricas = null;

registrarPagina({
  id: 'metricas',
  menu: 'Métricas',
  grupo: 'Plata',
  icono: 'chart',
  titulo: 'Métricas',
  subtitulo: 'Cómo viene el mes',

  async montar(cont) {
    var r = await Promise.all([traerCacheado('remitos'), traerCacheado('gastos'), traerCacheado('compras')]);
    _datosMetricas = { remitos: r[0], gastos: r[1], compras: r[2] };
    if (!_mesMetricas) _mesMetricas = claveMes(hoyTexto());

    cont.innerHTML =
      '<div style="margin-bottom:14px">' + selectorMes('_mesMetricas', r[0], 'pintarMetricas') + '</div>' +
      '<div id="cont-metricas"></div>';
    pintarMetricas();
  }
});

function pintarMetricas() {
  var d = _datosMetricas;
  var delMes = function (f) { return claveMes(f.fecha || f.created_at) === _mesMetricas; };

  var remitos = d.remitos.filter(delMes).filter(function (r) { return r.motivo !== 'cerrado'; });
  var cerrados = d.remitos.filter(delMes).filter(function (r) { return r.motivo === 'cerrado'; });
  var gastos = d.gastos.filter(delMes).reduce(function (s, g) { return s + (+g.monto || 0); }, 0);
  var compras = d.compras.filter(delMes).reduce(function (s, c) { return s + (+c.total_costo || +c.total || 0); }, 0);

  var res = resumirRemitos(remitos);
  var neto = res.facturado - gastos - compras;

  /* Clientes del mes, ordenados por lo que facturaron */
  var porCliente = {};
  remitos.forEach(function (r) {
    var n = r.cliente_nombre || 'Sin cliente';
    var c = porCliente[n] = porCliente[n] || { n: n, remitos: 0, facturado: 0, deuda: 0 };
    c.remitos++; c.facturado += (+r.total || 0); c.deuda += montoPorTipo(r, 'deuda');
  });
  var ranking = Object.keys(porCliente).map(function (k) { return porCliente[k]; })
    .sort(function (a, b) { return b.facturado - a.facturado; });

  /* Días con actividad */
  var porDia = {};
  remitos.forEach(function (r) { var k = claveFecha(r.fecha || r.created_at); if (k) porDia[k] = (porDia[k] || 0) + 1; });
  var dias = Object.keys(porDia).sort();

  porId('cont-metricas').innerHTML =
    '<div class="grilla-stats">' +
      stat('receipt', 'Facturado', plata(res.facturado), plural(res.cantidad, 'remito'), 'var(--rose)') +
      stat('cash', 'Efectivo', plata(res.efectivo), '', 'var(--ok)') +
      stat('smartphone', 'Transferencia', plata(res.transferencia), '', 'var(--info)') +
      stat('clock', 'Deuda pendiente', plata(res.deuda), '', 'var(--warn)') +
      stat('wallet', 'Gastos', plata(gastos), '', 'var(--danger)') +
      stat('cart', 'Compras', plata(compras), '', 'var(--violet)') +
      stat('chart', 'Neto', plata(neto), 'facturado − gastos − compras', neto >= 0 ? 'var(--ok)' : 'var(--danger)') +
      stat('box', 'Unidades', String(res.unidades), res.cantidad ? Math.round(res.unidades / res.cantidad) + ' por remito' : '', 'var(--text2)') +
    '</div>' +

    (cerrados.length
      ? avisoHTML('warn', plural(cerrados.length, 'visita') + ' a clientes que estaban cerrados. No suman a lo facturado.', 'ban')
      : '') +

    '<div class="eyebrow" style="margin-top:26px">Actividad</div>' +
    '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
      (dias.length
        ? '<div style="display:flex;align-items:flex-end;gap:3px;height:90px">' +
            dias.map(function (k) {
              var n = porDia[k];
              var max = Math.max.apply(null, dias.map(function (x) { return porDia[x]; }));
              var alto = Math.max(6, Math.round(n / max * 84));
              return '<div title="' + esc(fechaCorta(k)) + ': ' + plural(n, 'remito') + '" ' +
                'style="flex:1;height:' + alto + 'px;background:var(--grad);border-radius:3px 3px 0 0;min-width:4px"></div>';
            }).join('') +
          '</div>' +
          '<div class="campo-ayuda" style="margin-top:8px">' +
            plural(dias.length, 'día') + ' con actividad · ' +
            'promedio ' + Math.round(res.cantidad / dias.length) + ' remitos por día' +
          '</div>'
        : '<div class="campo-ayuda">Todavía no hay remitos este mes.</div>') +
    '</div></div>' +

    '<div class="eyebrow" style="margin-top:26px">Clientes del mes</div>' +
    (ranking.length
      ? '<div class="tarjeta"><div class="tarjeta-cuerpo" style="padding:0">' +
          '<table class="tabla"><thead><tr>' +
            '<th>Cliente</th><th class="num">Remitos</th><th class="num">Facturado</th><th class="num">Deuda</th>' +
          '</tr></thead><tbody>' +
          ranking.slice(0, 25).map(function (c) {
            return '<tr><td>' + esc(c.n) + '</td>' +
              '<td class="num">' + c.remitos + '</td>' +
              '<td class="num">' + plata(c.facturado) + '</td>' +
              '<td class="num" style="color:' + (c.deuda > 0 ? 'var(--warn)' : 'var(--muted)') + '">' +
                (c.deuda > 0 ? plata(c.deuda) : '—') + '</td></tr>';
          }).join('') +
          '</tbody></table>' +
        '</div></div>'
      : vacio('users', 'Sin clientes este mes', 'Cuando cargues remitos, el ranking aparece acá.'));
}
