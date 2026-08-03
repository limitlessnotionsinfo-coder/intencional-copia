/* ═══════════════════════════════════════════════════════════
   COMPRAS — el pedido al proveedor, color por color.
   El costo sale de la configuración; el descuento contempla que
   una parte de los esmaltes se puede devolver.
   ═══════════════════════════════════════════════════════════ */

var _compras = [];
var _mesCompra = '';

registrarPagina({
  id: 'compras',
  menu: 'Compras',
  grupo: 'Plata',
  icono: 'cart',
  titulo: 'Compras',
  subtitulo: 'Lo que le pedimos al proveedor',

  async montar(cont) {
    await cargarConfig().catch(function () {});
    _compras = (await traerCacheado('compras')).slice().reverse();
    if (!_mesCompra) _mesCompra = claveMes(hoyTexto());
    cont.innerHTML =
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">' +
        selectorMes('_mesCompra', _compras, 'pintarCompras') +
        '<button class="btn btn-primario" style="margin-left:auto" onclick="nuevaCompra()">' +
          ic('plus', 15) + ' Nuevo pedido</button>' +
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
      stat('cart', 'Costo del mes', plata(costo), plural(lista.length, 'pedido'), 'var(--violet)') +
      stat('box', 'Unidades', String(unidades), unidades && costo ? plata(costo / unidades) + ' por unidad' : '', 'var(--text2)') +
    '</div>' +
    (lista.length
      ? '<div class="lista">' + lista.map(function (c) {
          var its = itemsCompra(c);
          return '<button class="fila" style="align-items:flex-start" onclick="verCompra(' + c.id + ')">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(its[0] ? its[0].prod : (c.tipo || 'Pedido')) + ' · ' + esc(fechaCorta(c.fecha)) + '</div>' +
              '<div class="fila-sub">' + plural(its.length, 'color', 'colores') + ' · ' +
                plural(+c.total_unidades || 0, 'unidad', 'unidades') +
                (c.notas ? '<br>' + esc(c.notas) : '') + '</div>' +
            '</div>' +
            '<div class="fila-derecha"><div class="fila-titulo">' + plata(costoCompra(c)) + '</div></div>' +
          '</button>';
        }).join('') + '</div>'
      : vacio('cart', 'Sin pedidos este mes', 'Cargá uno y lo podés mandar por WhatsApp.'));
}

/* ═══════════════════════════════════════════════════════════
   NUEVO PEDIDO
   ═══════════════════════════════════════════════════════════ */

var NC = null;

function nuevaCompra() {
  var prods = productos();
  NC = {
    producto: (prods[0] && prods[0].nombre) || 'Esmalte en Gel',
    fecha: hoyTexto(),
    notas: '',
    filas: [{ color: '', cant: 0 }],
    devolucion: +leerConfig('devolucion_pct', 30) || 30
  };
  abrirModal('Nuevo pedido', cuerpoCompra(),
    '<button class="btn btn-primario btn-bloque" onclick="guardarCompra()">Guardar pedido</button>');
}

function costoUnitario() { return costoDeLista(NC.producto); }

function totalesCompra() {
  var unidades = NC.filas.reduce(function (s, f) { return s + (+f.cant || 0); }, 0);
  var costo = costoUnitario();
  var total = unidades * costo;
  var pct = Math.max(0, Math.min(100, +NC.devolucion || 0));
  var aDevolver = Math.round(unidades * pct / 100);
  return {
    unidades: unidades,
    costo: costo,
    total: total,
    pct: pct,
    aDevolver: aDevolver,
    quedan: unidades - aDevolver,
    totalConDevolucion: (unidades - aDevolver) * costo
  };
}

function cuerpoCompra() {
  var prods = productos();
  var t = totalesCompra();

  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Producto</div>' +
        '<select class="campo-input" onchange="NC.producto=this.value;refrescarCompra()">' +
          prods.map(function (p) {
            return '<option' + (p.nombre === NC.producto ? ' selected' : '') + '>' + esc(p.nombre) + '</option>';
          }).join('') +
        '</select></div>' +
      '<div class="campo"><div class="campo-etiq">Fecha</div>' +
        '<input class="campo-input" value="' + esc(NC.fecha) + '" oninput="NC.fecha=this.value"/></div>' +
    '</div>' +

    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Costo por unidad: <strong>' + plata(t.costo) + '</strong>' +
      (t.costo ? '' : ' — cargalo en Configuraciones para que calcule solo') +
    '</div>' +

    '<div id="filas-compra">' + NC.filas.map(filaCompra).join('') + '</div>' +
    '<button class="btn btn-secundario" style="margin-top:8px" onclick="agregarFilaCompra()">' +
      ic('plus', 15) + ' Agregar color</button>' +

    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">' +
      '<div><div class="campo-etiq" style="margin:0">Total del pedido</div>' +
        '<div class="campo-ayuda" id="cmp-unidades">' + plural(t.unidades, 'unidad', 'unidades') + '</div></div>' +
      '<div class="stat-val" id="cmp-total" style="font-size:23px;color:var(--rose)">' + plata(t.total) + '</div>' +
    '</div>' +

    /* ── Devolución ── */
    '<div class="campo" style="margin-top:14px"><div class="campo-etiq">Se puede devolver</div>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<input type="range" min="0" max="50" step="5" value="' + t.pct + '" style="flex:1" ' +
               'oninput="NC.devolucion=+this.value;refrescarTotalesCompra()"/>' +
        '<span style="min-width:44px;text-align:right;font-weight:700" id="cmp-pct">' + t.pct + '%</span>' +
      '</div>' +
    '</div>' +
    '<div id="cmp-devolucion">' + bloqueDevolucion() + '</div>' +

    '<div class="campo" style="margin-top:12px"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" value="' + esc(NC.notas) + '" oninput="NC.notas=this.value"/></div>' +

    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button class="btn btn-secundario" style="flex:1;min-width:150px" onclick="copiarPedido()">' +
        ic('clipboard', 15) + ' Copiar como texto</button>' +
      '<button class="btn btn-secundario" style="flex:1;min-width:150px" onclick="enviarPorWhatsApp()">' +
        ic('message', 15) + ' Mandar por WhatsApp</button>' +
    '</div>';
}

/* Cada color es una tarjetita: los tres datos con su etiqueta,
   para que en el celular no queden inputs sueltos sin contexto. */
function filaCompra(f, i) {
  var sub = (+f.cant || 0) * costoUnitario();
  return '<div class="fila-color">' +
    '<div class="fc-color">' +
      '<div class="campo-etiq">Color</div>' +
      '<input class="campo-input" value="' + esc(f.color) + '" placeholder="Ej: 06" ' +
             'oninput="NC.filas[' + i + '].color=this.value"/>' +
    '</div>' +
    '<div class="fc-cant">' +
      '<div class="campo-etiq">Cantidad</div>' +
      '<input class="campo-input" type="number" min="0" inputmode="numeric" value="' + (+f.cant || 0) + '" ' +
             'oninput="NC.filas[' + i + '].cant=+this.value||0;refrescarTotalesCompra()"/>' +
    '</div>' +
    '<div class="fc-total">' +
      '<div class="campo-etiq">Total</div>' +
      '<div class="subtotal" id="csub-' + i + '">' + plata(sub) + '</div>' +
    '</div>' +
    (NC.filas.length > 1
      ? '<button class="btn btn-fantasma fc-quitar" aria-label="Quitar color" onclick="quitarFilaCompra(' + i + ')">✕</button>'
      : '<span class="fc-quitar"></span>') +
  '</div>';
}

function bloqueDevolucion() {
  var t = totalesCompra();
  if (!t.unidades || !t.pct) return '';
  return '<div class="aviso aviso-ok">' + ic('undo', 15) +
    '<div>Si devolvés el ' + t.pct + '%, son <strong>' + plural(t.aDevolver, 'unidad', 'unidades') + '</strong> ' +
    'y te quedan ' + plural(t.quedan, 'unidad', 'unidades') + '.' +
    '<br>El pedido te terminaría costando <strong>' + plata(t.totalConDevolucion) + '</strong> ' +
    'en vez de ' + plata(t.total) + '.</div></div>';
}

function refrescarTotalesCompra() {
  var t = totalesCompra();
  NC.filas.forEach(function (f, i) {
    var el = porId('csub-' + i);
    if (el) el.textContent = plata((+f.cant || 0) * t.costo);
  });
  var tot = porId('cmp-total'); if (tot) tot.textContent = plata(t.total);
  var uni = porId('cmp-unidades'); if (uni) uni.textContent = plural(t.unidades, 'unidad', 'unidades');
  var pct = porId('cmp-pct'); if (pct) pct.textContent = t.pct + '%';
  var dev = porId('cmp-devolucion'); if (dev) dev.innerHTML = bloqueDevolucion();
}

function refrescarCompra() {
  var caja = document.querySelector('.modal-cuerpo');
  if (caja) caja.innerHTML = cuerpoCompra();
}

function agregarFilaCompra() {
  NC.filas.push({ color: '', cant: 0 });
  porId('filas-compra').innerHTML = NC.filas.map(filaCompra).join('');
}

function quitarFilaCompra(i) {
  NC.filas.splice(i, 1);
  porId('filas-compra').innerHTML = NC.filas.map(filaCompra).join('');
  refrescarTotalesCompra();
}

/* ── Compartir el pedido ─────────────────────────────────── */
function textoPedido() {
  var t = totalesCompra();
  var filas = NC.filas.filter(function (f) { return f.color && f.cant > 0; });
  return 'Pedido Intencional — ' + NC.fecha + '\n' +
    NC.producto + '\n\n' +
    filas.map(function (f) { return f.color + ': ' + f.cant; }).join('\n') +
    '\n\nTotal: ' + t.unidades + ' unidades';
}

async function copiarPedido() {
  var texto = textoPedido();
  try {
    await navigator.clipboard.writeText(texto);
    toast('Pedido copiado');
  } catch (e) {
    /* Sin permiso de portapapeles: se muestra para copiar a mano */
    abrirModal('Copiar el pedido',
      '<textarea class="campo-input" rows="10" readonly style="font-family:ui-monospace,monospace;font-size:13px">' +
        esc(texto) + '</textarea>',
      '<button class="btn btn-secundario btn-bloque" onclick="cerrarModal()">Listo</button>');
  }
}

function enviarPorWhatsApp() {
  window.open('https://wa.me/?text=' + encodeURIComponent(textoPedido()), '_blank');
}

/* ── Guardar ─────────────────────────────────────────────── */
async function guardarCompra() {
  var filas = NC.filas.filter(function (f) { return f.color && f.cant > 0; });
  if (!filas.length) { toast('Cargá al menos un color con cantidad', 'error'); return; }

  var t = totalesCompra();
  try {
    await crear('compras', {
      fecha: NC.fecha.trim() || hoyTexto(),
      tipo: 'pedido',
      items: JSON.stringify(filas.map(function (f) {
        return { prod: NC.producto, color: f.color, cant: +f.cant || 0, costo: t.costo };
      })),
      total_unidades: t.unidades,
      total_costo: t.total,
      notas: (NC.notas.trim() || '') +
             (t.pct ? (NC.notas.trim() ? ' · ' : '') + 'Devolución ' + t.pct + '%: ' + t.aDevolver + ' u.' : '') || null,
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Pedido guardado');
    invalidarCache('compras');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Ver un pedido guardado ──────────────────────────────── */
function verCompra(id) {
  var c = _compras.find(function (x) { return String(x.id) === String(id); });
  if (!c) return;
  var its = itemsCompra(c);
  abrirModal('Pedido del ' + fechaCorta(c.fecha),
    '<table class="tabla"><thead><tr><th>Color</th><th class="num">Cant</th><th class="num">Subtotal</th></tr></thead><tbody>' +
      its.map(function (i) {
        return '<tr><td>' + esc(i.color || i.prod) + '</td>' +
          '<td class="num">' + (+i.cant || 0) + '</td>' +
          '<td class="num">' + plata((+i.cant || 0) * (+i.costo || 0)) + '</td></tr>';
      }).join('') +
    '</tbody></table>' +
    '<div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">' +
      '<strong>' + plural(+c.total_unidades || 0, 'unidad', 'unidades') + '</strong>' +
      '<strong style="color:var(--rose)">' + plata(costoCompra(c)) + '</strong>' +
    '</div>' +
    (c.notas ? '<div class="campo-ayuda" style="margin-top:10px">' + esc(c.notas) + '</div>' : ''),
    '<button class="btn btn-peligro btn-bloque" onclick="borrarCompra(' + c.id + ')">Borrar pedido</button>');
}

async function borrarCompra(id) {
  try {
    await borrar('compras', id);
    invalidarCache('compras');
    cerrarModal();
    toast('Pedido borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
