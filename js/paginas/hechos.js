/* ═══════════════════════════════════════════════════════════
   REMITOS HECHOS — historial con el buscador ampliado:
   número de cliente, zona, nombre y dirección en un solo campo.
   ═══════════════════════════════════════════════════════════ */

var _hechos = [];
var _porNombre = {};      // nombre normalizado → cliente, para poder buscar por número
var _qHechos = '';
var _filtroHechos = '';
var _topeHechos = 40;

registrarPagina({
  id: 'hechos',
  menu: 'Remitos hechos',
  grupo: 'Día a día',
  icono: 'clipboard',
  titulo: 'Remitos hechos',
  subtitulo: 'Buscá por número de cliente, nombre, zona o dirección',

  async montar(cont, params) {
    _qHechos = params.get('q') || '';
    _filtroHechos = params.get('filtro') || '';
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
               'placeholder="Ej: r14-0310, Farmacia Posik, chingolo, Belgrano 378" ' +
               'value="' + esc(_qHechos) + '" oninput="filtrarHechos(this.value)"/>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
        chipFiltro('', 'Todos') +
        chipFiltro('deuda', 'Con deuda') +
        chipFiltro('cerrado', 'Estaban cerrados') +
      '</div>' +
      '<div id="resumen-hechos"></div>' +
      '<div id="lista-hechos"></div>';

    pintarHechos();
  }
});

function chipFiltro(valor, etiqueta) {
  return '<button class="btn ' + (_filtroHechos === valor ? 'btn-primario' : 'btn-secundario') + '" ' +
    'style="padding:7px 13px" onclick="setFiltroHechos(\'' + valor + '\')">' + esc(etiqueta) + '</button>';
}

function setFiltroHechos(v) { _filtroHechos = v; _topeHechos = 40; irA('hechos', 'filtro=' + v + (_qHechos ? '&q=' + encodeURIComponent(_qHechos) : '')); }
function filtrarHechos(v) { _qHechos = v; _topeHechos = 40; pintarHechos(); }
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
  return _hechos.filter(function (r) {
    if (_filtroHechos === 'deuda' && !tieneDeuda(r)) return false;
    if (_filtroHechos === 'cerrado' && r.motivo !== 'cerrado') return false;
    return coincideRemito(r, _qHechos);
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
  if (!lista.length) {
    cont.innerHTML = vacio('search', 'Sin resultados',
      _qHechos ? 'Probá con el número de cliente, la zona o parte de la dirección.' : 'Todavía no hay remitos con este filtro.');
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
  return '<button class="fila" onclick="verRemito(' + r.id + ')">' +
    (c ? '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' : '') +
    '<div class="fila-principal">' +
      '<div class="fila-titulo">' + esc(r.cliente_nombre || 'Sin cliente') +
        (cerrado ? ' <span class="pin pin-neutro">' + ic('ban', 12) + ' Cerrado</span>' : '') + '</div>' +
      '<div class="fila-sub">' + [fechaCorta(r.fecha), r.cliente_loc, r.cliente_dir].filter(Boolean).map(esc).join(' · ') + '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(r.total) + '</div>' +
      '<div style="margin-top:4px">' + pagoHTML(r) + '</div>' +
    '</div>' +
  '</button>';
}

function verRemito(id) {
  var r = _hechos.find(function (x) { return String(x.id) === String(id); });
  if (!r) return;
  var prods = [];
  try { prods = typeof r.productos === 'string' ? JSON.parse(r.productos || '[]') : (r.productos || []); } catch (e) {}

  abrirModal('Remito de ' + (r.cliente_nombre || '—'),
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">' +
      dato('Fecha', fechaCorta(r.fecha)) +
      dato('Localidad', r.cliente_loc || '—') +
      dato('Dirección', r.cliente_dir || '—') +
      dato('Teléfono', r.cliente_tel || '—') +
    '</div>' +
    (prods.length
      ? '<table class="tabla"><thead><tr><th>Producto</th><th class="num">Cant</th><th class="num">Precio</th><th class="num">Subtotal</th></tr></thead><tbody>' +
        prods.map(function (p) {
          return '<tr><td>' + esc(p.prod) + '</td><td class="num">' + (+p.cant || 0) + '</td>' +
            '<td class="num">' + plata(p.precio) + '</td><td class="num">' + plata((+p.cant || 0) * (+p.precio || 0)) + '</td></tr>';
        }).join('') + '</tbody></table>'
      : '<div class="campo-ayuda">Sin productos: se registró como visita.</div>') +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">' +
      '<span class="campo-etiq" style="margin:0">Total</span>' +
      '<strong style="font-size:19px;color:var(--rose)">' + plata(r.total) + '</strong>' +
    '</div>' +
    '<div style="margin-top:10px">' + pagoHTML(r) + '</div>' +
    (r.notas ? '<div class="aviso aviso-warn" style="margin-top:14px">' + ic('edit', 15) + '<div>' + esc(r.notas) + '</div></div>' : ''),
    '');
}

function dato(etiqueta, valor) {
  return '<div><div class="campo-etiq">' + esc(etiqueta) + '</div>' +
    '<div style="font-size:13px;font-weight:600">' + esc(valor) + '</div></div>';
}
