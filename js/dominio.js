/* ═══════════════════════════════════════════════════════════
   DOMINIO — las reglas del negocio, separadas de la pantalla.
   Acá vive la única verdad sobre cómo se reparte el pago de un
   remito, que es de donde salen TODAS las métricas.
   ═══════════════════════════════════════════════════════════ */

var TIPOS_PAGO = {
  efectivo:      { etiqueta: 'Efectivo',      corta: 'Efectivo',      color: '#059669', icono: 'cash' },
  transferencia: { etiqueta: 'Transferencia', corta: 'Transferencia', color: '#2563eb', icono: 'smartphone' },
  deuda:         { etiqueta: 'Deuda pendiente', corta: 'Deuda',       color: '#d97706', icono: 'clock' },
  sin_definir:   { etiqueta: 'Sin definir',   corta: 'Sin definir',   color: '#9c8b88', icono: 'alert' }
};

/* ── Partes de pago de un remito ──────────────────────────────
   Hay dos modelos conviviendo en la base:
   · nuevo → columna pagos_detalle, un array de partes
   · viejo → columnas pago / pago2_tipo / pago2_monto
   Un mismo remito puede sumar a efectivo y a deuda a la vez.
   ────────────────────────────────────────────────────────── */
function partesPago(r) {
  if (!r) return [];

  if (r.pagos_detalle) {
    try {
      var arr = typeof r.pagos_detalle === 'string' ? JSON.parse(r.pagos_detalle) : r.pagos_detalle;
      if (Array.isArray(arr) && arr.length) {
        return arr.map(function (p) {
          return {
            tipo: p.tipo || 'sin_definir',
            monto: +p.monto || 0,
            alias: p.alias || null,
            eraDeuda: bool(p.era_deuda),
            saldadoFecha: p.saldado_fecha || null,
            deudaVieja: false
          };
        });
      }
    } catch (e) { /* si el JSON está roto, cae al modelo viejo */ }
  }

  var total = +r.total || 0;
  var m2 = +r.pago2_monto || 0;
  var partes = [];
  if (r.pago2_tipo && m2 > 0 && m2 < total) {
    partes.push({ tipo: r.pago || 'sin_definir', monto: total - m2, alias: r.alias || null,
                  eraDeuda: false, saldadoFecha: r.saldado_fecha || null, deudaVieja: bool(r.saldado) });
    partes.push({ tipo: r.pago2_tipo, monto: m2, alias: r.pago2_alias || null,
                  eraDeuda: false, saldadoFecha: null, deudaVieja: false });
  } else {
    partes.push({ tipo: r.pago || 'sin_definir', monto: total, alias: r.alias || null,
                  eraDeuda: false, saldadoFecha: r.saldado_fecha || null, deudaVieja: bool(r.saldado) });
  }
  return partes;
}

/* Cuánto de un remito corresponde a un tipo de pago */
function montoPorTipo(r, tipo) {
  return partesPago(r).reduce(function (s, p) {
    if (p.tipo !== tipo) return s;
    if (tipo === 'deuda' && p.deudaVieja) return s;   // deuda vieja ya saldada
    return s + p.monto;
  }, 0);
}

function deudaPendiente(r)   { return montoPorTipo(r, 'deuda'); }
function tieneDeuda(r)       { return deudaPendiente(r) > 0; }
function esPagoMixto(r)      { return partesPago(r).filter(function (p) { return p.monto > 0; }).length > 1; }
function sumarTipo(lista, tipo) {
  return (lista || []).reduce(function (s, r) { return s + montoPorTipo(r, tipo); }, 0);
}

/* Etiqueta corta para listados */
function pagoHTML(r) {
  var partes = partesPago(r).filter(function (p) { return p.monto > 0; });
  if (!partes.length) return '<span class="pin pin-neutro">—</span>';
  return partes.map(function (p) {
    var t = TIPOS_PAGO[p.tipo] || TIPOS_PAGO.sin_definir;
    if (p.tipo === 'deuda' && p.deudaVieja) return '<span class="pin pin-ok">' + ic('check', 12) + ' Saldada</span>';
    var clase = p.tipo === 'deuda' ? 'pin-warn' : p.tipo === 'efectivo' ? 'pin-ok' : p.tipo === 'transferencia' ? 'pin-info' : 'pin-neutro';
    return '<span class="pin ' + clase + '">' + ic(t.icono, 12) + ' ' + esc(t.corta) +
           (partes.length > 1 ? ' ' + plata(p.monto) : '') + '</span>';
  }).join(' ');
}

/* ── Resumen de un conjunto de remitos ───────────────────── */
function resumirRemitos(remitos) {
  var r = {
    cantidad: remitos.length,
    unidades: 0,
    facturado: 0,
    efectivo: 0,
    transferencia: 0,
    deuda: 0
  };
  remitos.forEach(function (x) {
    r.unidades      += (+x.unidades || 0);
    r.facturado     += (+x.total || 0);
    r.efectivo      += montoPorTipo(x, 'efectivo');
    r.transferencia += montoPorTipo(x, 'transferencia');
    r.deuda         += montoPorTipo(x, 'deuda');
  });
  return r;
}

/* ── Clientes ────────────────────────────────────────────── */
/* Un cliente entra en la búsqueda por número, nombre, zona o
   dirección. Es la búsqueda que se usa en toda la app. */
function coincideCliente(c, termino) {
  var t = normalizar(termino);
  if (!t) return true;
  return normalizar(c.local).indexOf(t) !== -1 ||
         normalizar(c.num_str).indexOf(t) !== -1 ||
         String(c.num || '').indexOf(t) !== -1 ||
         normalizar(c.loc).indexOf(t) !== -1 ||
         normalizar(c.dir).indexOf(t) !== -1 ||
         normalizar(c.duenio).indexOf(t) !== -1;
}

/* Número de ruta guardado en la columna jsonb `ruta` */
function rutaDe(c) {
  if (!c || !c.ruta) return '';
  try {
    var r = typeof c.ruta === 'string' ? JSON.parse(c.ruta) : c.ruta;
    return (r && r.orden) ? String(r.orden) : '';
  } catch (e) { return ''; }
}

function clienteActivo(c) { return c.activo === undefined || c.activo === null || bool(c.activo); }

/* ═══════════════════════════════════════════════════════════
   PRECIOS Y AUMENTO
   La lista de precios sale de la tabla `stock`. El aumento tiene
   dos tramos: el precio viejo se le cobra a quien todavía no fue
   notificado, el nuevo a quien ya lo fue.
   ═══════════════════════════════════════════════════════════ */

var CFG_AUMENTO = {
  activo:  'aumento_activo',
  producto:'aumento_producto',
  viejo:   'aumento_precio_viejo',
  nuevo:   'aumento_precio_nuevo'
};

function aumentoConfig() {
  return {
    activo:   leerConfig(CFG_AUMENTO.activo, 'true') === 'true',
    producto: leerConfig(CFG_AUMENTO.producto, 'Esmalte en Gel'),
    viejo:   +leerConfig(CFG_AUMENTO.viejo, 2200) || 0,
    nuevo:   +leerConfig(CFG_AUMENTO.nuevo, 2400) || 0
  };
}

function textoAviso(precio) {
  return 'A partir de la próxima reposición se aplicará un aumento. El nuevo costo será de ' + plata(precio) + '.';
}

function clienteAvisado(c) { return !!c && bool(c.aviso_aumento); }

/* Qué precio le corresponde hoy a este cliente por el producto en aumento */
function precioParaCliente(c) {
  var cfg = aumentoConfig();
  if (!cfg.activo) return null;
  return clienteAvisado(c) ? cfg.nuevo : cfg.viejo;
}

function esProductoEnAumento(nombre) {
  var obj = normalizar(aumentoConfig().producto);
  if (!obj) return false;
  var n = normalizar(nombre);
  return n === obj || n.indexOf(obj) !== -1 || obj.indexOf(n) !== -1;
}

/* Precio de lista de un producto, según la tabla stock */
function precioDeLista(nombre, stock) {
  var item = (stock || []).find(function (s) { return normalizar(s.nombre) === normalizar(nombre) && +s.precio > 0; });
  return item ? +item.precio : 0;
}

/* ── Última reposición ───────────────────────────────────── */
function ultimaReposicion(nombreCliente, remitos) {
  var suyos = (remitos || []).filter(function (r) {
    return normalizar(r.cliente_nombre) === normalizar(nombreCliente) && r.motivo !== 'cerrado';
  });
  if (!suyos.length) return null;
  suyos.sort(function (a, b) { return claveFecha(b.created_at || b.fecha).localeCompare(claveFecha(a.created_at || a.fecha)); });
  var u = suyos[0];
  return {
    remito: u,
    fecha: u.fecha || fechaCorta(u.created_at),
    dias: diasEntre(u.fecha || u.created_at, hoyTexto()),
    total: +u.total || 0,
    unidades: +u.unidades || 0
  };
}

/* ── Pendientes (tabla tareas) ───────────────────────────── */
var TIPOS_PENDIENTE = {
  nuevo:   { etiqueta: 'Cliente nuevo', clase: 'pin-ok',     icono: 'user',  color: 'var(--ok)' },
  pedido:  { etiqueta: 'Pedido',        clase: 'pin-info',   icono: 'bag',   color: 'var(--info)' },
  retirar: { etiqueta: 'A retirar',     clase: 'pin-danger', icono: 'truck', color: 'var(--danger)' },
  otro:    { etiqueta: 'Otro',          clase: 'pin-neutro', icono: 'clipboard', color: 'var(--muted)' }
};
function tipoPendiente(t) { return TIPOS_PENDIENTE[(t && t.tipo) || 'otro'] || TIPOS_PENDIENTE.otro; }

/* ═══════════════════════════════════════════════════════════
   ALIAS DE TRANSFERENCIA
   Se configuran desde Configuraciones. La app sugiere el que
   viene recibiendo menos, para que los dos queden parejos.
   ═══════════════════════════════════════════════════════════ */

function aliasConfigurados() {
  var crudo = leerConfig('alias_transferencia', 'intencional.f, intencional.a');
  return String(crudo).split(',')
    .map(function (a) { return a.trim(); })
    .filter(Boolean);
}

/* Los alias se comparan sin distinguir mayúsculas */
function mismoAlias(a, b) { return normalizar(a) === normalizar(b); }

/* Cuánto entró por cada alias, mirando remitos y cobros de deuda */
function totalesPorAlias(remitos, pagos) {
  var t = {};
  aliasConfigurados().forEach(function (a) { t[a] = 0; });

  function sumar(alias, monto) {
    if (!alias || !monto) return;
    var conocido = aliasConfigurados().find(function (a) { return mismoAlias(a, alias); });
    var clave = conocido || alias;
    t[clave] = (t[clave] || 0) + monto;
  }

  (remitos || []).forEach(function (r) {
    partesPago(r).forEach(function (p) {
      if (p.tipo === 'transferencia') sumar(p.alias, p.monto);
    });
  });
  (pagos || []).forEach(function (p) {
    if (p.medio === 'transferencia') sumar(p.alias, +p.monto || 0);
  });
  return t;
}

/* El alias que menos recibió: es el que conviene usar ahora */
function aliasSugerido(remitos, pagos) {
  var lista = aliasConfigurados();
  if (!lista.length) return null;
  var t = totalesPorAlias(remitos, pagos);
  return lista.slice().sort(function (a, b) { return (t[a] || 0) - (t[b] || 0); })[0];
}

/* ═══════════════════════════════════════════════════════════
   COBRO DE DEUDAS
   Cobrar no borra la deuda: la convierte. La parte que estaba
   en deuda pasa al medio con el que se cobró, marcada con
   era_deuda y la fecha, así queda registrado cuánto tardó.
   ═══════════════════════════════════════════════════════════ */

function remitoCobrado(r, medio, alias, fechaISO) {
  var partes = partesPago(r).map(function (p) {
    if (p.tipo !== 'deuda' || p.deudaVieja) {
      return { tipo: p.tipo, monto: p.monto, alias: p.alias, era_deuda: p.eraDeuda, saldado_fecha: p.saldadoFecha };
    }
    return { tipo: medio, monto: p.monto, alias: alias || null, era_deuda: true, saldado_fecha: fechaISO };
  });
  return {
    pagos_detalle: JSON.stringify(partes),
    saldado: true,
    saldado_fecha: fechaISO
  };
}

/* Días que tardó en pagar, si se puede saber */
function demoraDePago(r) {
  if (!r || !r.saldado || !r.saldado_fecha) return null;
  return diasEntre(r.fecha || r.created_at, r.saldado_fecha);
}

/* Promedio de demora de un cliente, para saber si es de los que estiran */
function demoraPromedio(remitosDelCliente) {
  var demoras = (remitosDelCliente || []).map(demoraDePago).filter(function (d) { return d !== null && d >= 0; });
  if (!demoras.length) return null;
  return {
    promedio: Math.round(demoras.reduce(function (s, d) { return s + d; }, 0) / demoras.length),
    peor: Math.max.apply(null, demoras),
    veces: demoras.length
  };
}

/* ── Mensaje que acompaña al remito al compartirlo ────────── */
function mensajeCompartir(remito) {
  var plantilla = leerConfig('mensaje_compartir',
    '¡Hola! Te dejo el remito de la reposición de hoy por {total}. ¡Gracias por elegirnos!');
  return String(plantilla)
    .replace(/\{cliente\}/g, remito.cliente_nombre || '')
    .replace(/\{total\}/g, plata(remito.total))
    .replace(/\{fecha\}/g, remito.fecha || '')
    .replace(/\{unidades\}/g, String(remito.unidades || 0));
}

/* ── Aviso de pago pendiente que va al pie del remito ─────── */
function textoPagoPendiente(alias) {
  var tel = leerConfig('tel_comprobantes', '11-7904-7745');
  var horas = leerConfig('horas_pago', '72');
  var dias = Math.round(+horas / 24) || 3;
  return 'Pago pendiente — Por favor, realizá la transferencia dentro de las ' + horas +
    ' horas (' + dias + ' días) al alias ' + (alias || '[alias no seleccionado]') +
    ' (no distingue entre mayúsculas y minúsculas) y enviá el comprobante al ' + tel +
    '. Si el comprobante se envía desde un número o una cuenta distintos, aclarar el nombre del local.';
}
