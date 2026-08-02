/* ═══════════════════════════════════════════════════════════
   COMPRAS — la mercadería que entra.
   ═══════════════════════════════════════════════════════════ */

var _compras = [], _mesCompra = '';

registrarPagina({
  id: 'compras',
  menu: 'Compras',
  grupo: 'Plata',
  icono: 'cart',
  titulo: 'Compras',
  subtitulo: 'Mercadería que entra y lo que costó',

  async montar(cont) {
    _compras = (await traerCacheado('compras')).slice().reverse();
    if (!_mesCompra) _mesCompra = claveMes(hoyTexto());
    cont.innerHTML =
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">' +
        selectorMes('_mesCompra', _compras, 'pintarCompras') +
        '<button class="btn btn-primario" style="margin-left:auto" onclick="nuevaCompra()">' + ic('plus', 15) + ' Cargar compra</button>' +
      '</div>' +
      '<div id="cont-compras"></div>';
    pintarCompras();
  }
});

function itemsCompra(c) {
  try { return typeof c.items === 'string' ? JSON.parse(c.items || '[]') : (c.items || []); }
  catch (e) { return []; }
}
function costoCompra(c) { return +c.total_costo || +c.total || 0; }

function pintarCompras() {
  var lista = _compras.filter(function (c) { return claveMes(c.fecha || c.created_at) === _mesCompra; });
  var costo = lista.reduce(function (s, c) { return s + costoCompra(c); }, 0);
  var unidades = lista.reduce(function (s, c) { return s + (+c.total_unidades || 0); }, 0);

  porId('cont-compras').innerHTML =
    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('cart', 'Costo del mes', plata(costo), plural(lista.length, 'compra'), 'var(--violet)') +
      stat('box', 'Unidades', String(unidades), unidades && costo ? 'costo unitario ' + plata(costo / unidades) : '', 'var(--text2)') +
    '</div>' +
    (lista.length
      ? '<div class="lista">' + lista.map(function (c) {
          var its = itemsCompra(c);
          return '<div class="fila" style="cursor:default;align-items:flex-start">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(capitalizar(c.tipo || 'compra')) + ' · ' + esc(fechaCorta(c.fecha)) + '</div>' +
              '<div class="fila-sub">' +
                (its.length
                  ? its.map(function (i) { return esc(i.prod || i.cat) + (i.color ? ' ' + esc(i.color) : '') + ' ×' + (+i.cant || 0); }).join(' · ')
                  : '—') +
                (c.notas ? '<br>' + esc(c.notas) : '') +
              '</div>' +
            '</div>' +
            '<div class="fila-derecha">' +
              '<div class="fila-titulo">' + plata(costoCompra(c)) + '</div>' +
              '<div class="stat-sub">' + plural(+c.total_unidades || 0, 'unidad', 'unidades') + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>'
      : vacio('cart', 'Sin compras este mes', 'Cuando cargues una, aparece acá con su costo.'));
}

function nuevaCompra() {
  abrirModal('Cargar compra',
    '<div class="campo"><div class="campo-etiq">Producto</div>' +
      '<input class="campo-input" id="c-prod" placeholder="Ej: Esmalte En Gel"/></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Unidades</div>' +
        '<input class="campo-input" id="c-cant" type="number" inputmode="numeric" min="0"/></div>' +
      '<div class="campo"><div class="campo-etiq">Costo por unidad</div>' +
        '<input class="campo-input" id="c-costo" type="number" inputmode="decimal" min="0" oninput="previewCompra()"/></div>' +
    '</div>' +
    '<div class="campo"><div class="campo-etiq">Fecha</div>' +
      '<input class="campo-input" id="c-fecha" value="' + hoyTexto() + '"/></div>' +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" id="c-notas" oninput="previewCompra()"/></div>' +
    '<div class="campo-ayuda" id="c-preview" style="margin-top:10px"></div>',
    '<button class="btn btn-primario btn-bloque" onclick="guardarCompra()">Guardar compra</button>');
  previewCompra();
}

function previewCompra() {
  var cant = +porId('c-cant').value || 0;
  var costo = +porId('c-costo').value || 0;
  porId('c-preview').textContent = cant && costo ? 'Total: ' + plata(cant * costo) : '';
}

async function guardarCompra() {
  var prod = (porId('c-prod').value || '').trim();
  var cant = +porId('c-cant').value || 0;
  var costo = +porId('c-costo').value || 0;
  if (!prod) { toast('Escribí qué producto compraste', 'error'); return; }
  if (cant <= 0 || costo <= 0) { toast('Cargá unidades y costo', 'error'); return; }
  try {
    await crear('compras', {
      fecha: (porId('c-fecha').value || hoyTexto()).trim(),
      tipo: 'pedido',
      items: JSON.stringify([{ cat: 'esmalte', prod: prod, color: '', cant: cant, costo: costo }]),
      total_unidades: cant,
      total_costo: cant * costo,
      notas: (porId('c-notas').value || '').trim() || null,
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Compra guardada');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
