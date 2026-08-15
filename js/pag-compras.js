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
      '<button class="btn btn-primario btn-bloque" style="margin-bottom:14px" onclick="nuevaCompra()">' +
        ic('plus', 16) + ' Nuevo pedido</button>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">' +
        selectorMes('_mesCompra', _compras, 'pintarCompras') +
        '<span class="campo-ayuda" style="margin-left:auto">Tocá un pedido para verlo, editarlo o borrarlo</span>' +
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
            '<div class="fila-derecha">' +
              '<div class="fila-titulo">' + plata(costoCompra(c)) + '</div>' +
              '<div class="ir-a">Ver detalle ' + ic('chevron', 11) + '</div>' +
            '</div>' +
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
    id: null,
    producto: (prods[0] && prods[0].nombre) || 'Esmalte en Gel',
    fecha: hoyTexto(),
    notas: '',
    filas: [{ color: '', cant: 0 }],
    devolucion: +leerConfig('devolucion_pct', 30) || 30,
    pagado: false,
    medio1: 'transferencia', alias1: '', medio2: '', monto2: 0, alias2: ''
  };
  abrirModal('Nuevo pedido', cuerpoCompra(),
    '<button class="btn btn-primario btn-bloque" onclick="guardarCompra()">Guardar pedido</button>');
}

/* Editar uno guardado: se carga en el mismo formulario */
function editarCompra(id) {
  var c = _compras.find(function (x) { return String(x.id) === String(id); });
  if (!c) return;
  var its = itemsCompra(c);

  NC = {
    id: c.id,
    producto: (its[0] && its[0].prod) || productos()[0].nombre,
    fecha: c.fecha || hoyTexto(),
    notas: c.notas || '',
    filas: its.length ? its.map(function (i) { return { color: i.color || '', cant: +i.cant || 0 }; })
                      : [{ color: '', cant: 0 }],
    devolucion: +leerConfig('devolucion_pct', 30) || 30,
    pagado: true, medio1: 'transferencia', alias1: '', medio2: '', monto2: 0, alias2: ''
  };
  abrirModal('Editar pedido', cuerpoCompra(),
    '<button class="btn btn-primario btn-bloque" onclick="guardarCompra()">Guardar cambios</button>');
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
    '<div class="campo" style="margin-top:14px">' +
      '<div class="campo-etiq">Se puede devolver (%)</div>' +
      '<input class="campo-input" id="cmp-devol-input" type="number" min="0" max="100" inputmode="numeric" ' +
             'style="max-width:120px" value="' + t.pct + '" ' +
             'oninput="NC.devolucion=+this.value||0;refrescarTotalesCompra()"/>' +
    '</div>' +
    '<div id="cmp-devolucion">' + bloqueDevolucion() + '</div>' +

    '<div class="campo" style="margin-top:12px"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" value="' + esc(NC.notas) + '" oninput="NC.notas=this.value"/></div>' +

    (NC.id ? '' : bloquePagoCompra()) +

    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="copiarPedido()">' +
        ic('clipboard', 15) + ' Copiar como texto</button>' +
      '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="enviarPorWhatsApp()">' +
        ic('message', 15) + ' Mandar por WhatsApp</button>' +
    '</div>';
}

/* Cada color es una tarjetita: arriba los dos datos que se
   escriben, abajo el total de esa línea. Sin grilla: en el
   celular las columnas se descolocaban. */
/* ¿Se paga ahora o queda pendiente? El pedido se registra igual
   como gasto de insumos; lo que cambia es si ya salió la plata. */
function bloquePagoCompra() {
  return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">' +
    '<div class="campo-etiq">¿Ya lo pagaste?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      '<button class="btn ' + (NC.pagado ? 'btn-primario' : 'btn-secundario') + '" ' +
        'onclick="NC.pagado=true;refrescarCompra()">' + ic('check', 15) + ' Sí, ya está pago</button>' +
      '<button class="btn ' + (!NC.pagado ? 'btn-primario' : 'btn-secundario') + '" ' +
        'onclick="NC.pagado=false;refrescarCompra()">' + ic('clock', 15) + ' Queda pendiente</button>' +
    '</div>' +

    (NC.pagado
      ? '<div class="campo-etiq">Con qué se pagó</div>' +
        medioCompra(1) + aliasCompra(1) +
        '<details class="segundo-pago"' + (NC.medio2 ? ' open' : '') + ' style="margin-top:10px">' +
          '<summary style="cursor:pointer;font-size:12px;color:var(--rose);font-weight:600;padding:4px 0">' +
            'Se pagó con dos medios</summary>' +
          '<div style="margin-top:8px">' +
            medioCompra(2) +
            (NC.medio2
              ? '<div class="campo" style="margin-top:8px"><div class="campo-etiq">Monto del segundo medio</div>' +
                inputMonto('nc-monto2', NC.monto2, 'NC.monto2=leerMonto(this)') + '</div>' + aliasCompra(2)
              : '') +
          '</div>' +
        '</details>'
      : '<div class="campo-ayuda">Va a quedar en Gastos como <strong>pago pendiente</strong>, ' +
        'con un botón para registrarlo cuando lo pagues.</div>') +
  '</div>';
}

function medioCompra(cual) {
  var actual = cual === 1 ? NC.medio1 : NC.medio2;
  return '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['efectivo', 'transferencia'].map(function (t) {
      var d = TIPOS_PAGO[t];
      return '<button class="btn ' + (actual === t ? 'btn-primario' : 'btn-secundario') + '" ' +
        'onclick="setMedioCompra(' + cual + ',\'' + t + '\')">' + ic(d.icono, 15) + ' ' + esc(d.corta) + '</button>';
    }).join('') + '</div>';
}

function aliasCompra(cual) {
  var medio = cual === 1 ? NC.medio1 : NC.medio2;
  if (medio !== 'transferencia') return '';
  var elegido = cual === 1 ? NC.alias1 : NC.alias2;
  var lista = aliasConfigurados();
  if (!lista.length) return '';
  return '<div style="margin-top:8px"><div class="campo-etiq">¿De qué alias salió?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      lista.map(function (a) {
        return '<button class="btn ' + (mismoAlias(a, elegido) ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setAliasCompra(' + cual + ',\'' + esc(a).replace(/'/g, "\\'") + '\')">' +
          ic('card', 14) + ' ' + esc(a) + '</button>';
      }).join('') +
    '</div></div>';
}

function setMedioCompra(cual, t) {
  if (cual === 1) { NC.medio1 = t; if (t !== 'transferencia') NC.alias1 = ''; }
  else { NC.medio2 = (NC.medio2 === t) ? '' : t; if (NC.medio2 !== 'transferencia') NC.alias2 = ''; }
  refrescarCompra();
}
function setAliasCompra(cual, a) { if (cual === 1) NC.alias1 = a; else NC.alias2 = a; refrescarCompra(); }

function filaCompra(f, i) {
  var sub = (+f.cant || 0) * costoUnitario();
  return '<div class="fila-color">' +
    '<div class="fc-arriba">' +
      '<div class="fc-campo fc-color">' +
        '<div class="campo-etiq">Color</div>' +
        '<input class="campo-input" value="' + esc(f.color) + '" placeholder="Ej: 06" ' +
               'oninput="NC.filas[' + i + '].color=this.value"/>' +
      '</div>' +
      '<div class="fc-campo fc-cant">' +
        '<div class="campo-etiq">Cantidad</div>' +
        '<input class="campo-input" type="number" min="0" inputmode="numeric" value="' + (+f.cant || 0) + '" ' +
               'oninput="NC.filas[' + i + '].cant=+this.value||0;refrescarTotalesCompra()"/>' +
      '</div>' +
      (NC.filas.length > 1
        ? '<button class="btn btn-fantasma fc-quitar" aria-label="Quitar color" ' +
          'onclick="quitarFilaCompra(' + i + ')">✕</button>'
        : '') +
    '</div>' +
    '<div class="fc-abajo">' +
      '<span class="campo-etiq" style="margin:0">Total</span>' +
      '<strong class="subtotal" id="csub-' + i + '">' + plata(sub) + '</strong>' +
    '</div>' +
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
/* El mensaje para el proveedor: los números con su cantidad y
   el total. Nada más: es lo que se pega en WhatsApp. */
function textoPedido() {
  var t = totalesCompra();
  var filas = NC.filas.filter(function (f) { return f.color && f.cant > 0; });
  return 'Pedido:\n' +
    filas.map(function (f) { return f.color + ': ' + f.cant; }).join('\n') +
    '\n\nTotal: ' + t.unidades;
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
  var fecha = NC.fecha.trim() || hoyTexto();
  var datos = {
    fecha: fecha,
    tipo: 'pedido',
    items: JSON.stringify(filas.map(function (f) {
      return { prod: NC.producto, color: f.color, cant: +f.cant || 0, costo: t.costo };
    })),
    total_unidades: t.unidades,
    total_costo: t.total,
    notas: (NC.notas.trim() || '') +
           (t.pct ? (NC.notas.trim() ? ' · ' : '') + 'Devolución ' + t.pct + '%: ' + t.aDevolver + ' u.' : '') || null
  };

  try {
    if (NC.id) {
      await actualizar('compras', NC.id, datos);
      await sincronizarGastoDeCompra(NC.id, datos, t);
      toast('Pedido actualizado');
    } else {
      datos.created_at = new Date().toISOString();
      var creada = await crear('compras', datos);
      var idNueva = (creada && creada[0] && creada[0].id) || null;
      await crearGastoDeCompra(idNueva, datos, t);
      toast(NC.pagado ? 'Pedido guardado y pagado' : 'Pedido guardado — queda el pago pendiente');
    }
    cerrarModal();
    invalidarCache('compras');
    invalidarCache('gastos');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* Toda compra queda también en Gastos, como insumos: es plata
   que sale, y así aparece en el cierre de la semana. */
function descripcionCompra(datos, t) {
  return 'Pedido ' + NC.producto + ' — ' + plural(t.unidades, 'unidad', 'unidades');
}

async function crearGastoDeCompra(compraId, datos, t) {
  var partes = null;
  if (NC.pagado) {
    var m2 = Math.min(+NC.monto2 || 0, t.total);
    partes = [{ tipo: NC.medio1, monto: NC.medio2 && m2 > 0 ? t.total - m2 : t.total, alias: NC.alias1 || null }];
    if (NC.medio2 && m2 > 0) partes.push({ tipo: NC.medio2, monto: m2, alias: NC.alias2 || null });
  }

  await crear('gastos', {
    descripcion: descripcionCompra(datos, t),
    monto: t.total,
    categoria: 'insumos',
    fecha: datos.fecha,
    notas: datos.notas,
    compra_id: compraId,
    pagado: !!NC.pagado,
    pagado_fecha: NC.pagado ? hoyISO() : null,
    pagos_detalle: partes ? JSON.stringify(partes) : null,
    pagado_por: 'empresa',
    reparto: JSON.stringify({ empresa: t.total }),
    created_at: new Date().toISOString()
  });
}

/* Si se edita la compra, el gasto asociado tiene que seguirla */
async function sincronizarGastoDeCompra(compraId, datos, t) {
  try {
    var gastos = await traerTodo('gastos', 'compra_id=eq.' + encodeURIComponent(compraId));
    if (!gastos.length) return;
    await actualizar('gastos', gastos[0].id, {
      descripcion: descripcionCompra(datos, t),
      monto: t.total,
      fecha: datos.fecha,
      notas: datos.notas
    });
  } catch (e) { console.warn('gasto de la compra:', e.message); }
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
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="editarCompra(' + c.id + ')">' +
        ic('edit', 15) + ' Editar</button>' +
      '<button class="btn btn-peligro" onclick="borrarCompra(' + c.id + ')">' + ic('trash', 15) + ' Borrar</button>' +
    '</div>');
}

async function borrarCompra(id) {
  try {
    /* El gasto asociado se va con la compra */
    try {
      var gs = await traerTodo('gastos', 'compra_id=eq.' + encodeURIComponent(id));
      for (var i = 0; i < gs.length; i++) await borrar('gastos', gs[i].id);
    } catch (e) { console.warn('gasto de la compra:', e.message); }

    await borrar('compras', id);
    invalidarCache('compras');
    invalidarCache('gastos');
    cerrarModal();
    toast('Pedido borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
