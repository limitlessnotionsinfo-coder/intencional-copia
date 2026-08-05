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
         /* "r4 10" o "r4-10" también encuentran a R4-0010 */
         normalizar(c.num_str).replace(/[-0]+/g, '').indexOf(t.replace(/[\s\-0]+/g, '')) !== -1 ||
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
   La lista de precios sale de la configuración. El aumento tiene
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

/* ── Productos, precios y ganancia ───────────────────────────
   Viven en la configuración: son pocos y cambian de precio.
   Formato: "nombre|costo|venta", separados por punto y coma.
   Se acepta el formato viejo de dos campos (nombre|venta).
   ────────────────────────────────────────────────────────── */
var PRODUCTOS_DEFAULT = 'Esmalte en Gel|1217|2200; Crema de Ordeñe|4200|6900';

function productos() {
  var crudo = leerConfig('productos', PRODUCTOS_DEFAULT);
  /* El formato viejo separaba con coma; el nuevo con punto y coma */
  var partes = String(crudo).indexOf(';') !== -1 ? String(crudo).split(';') : String(crudo).split(',');
  return partes.map(function (t) {
    var c = t.split('|');
    var nombre = (c[0] || '').trim();
    if (c.length >= 3) return { nombre: nombre, costo: +c[1] || 0, precio: +c[2] || 0 };
    return { nombre: nombre, costo: 0, precio: +(c[1] || 0) || 0 };   // formato viejo
  }).filter(function (p) { return p.nombre; });
}

function guardarProductosConfig(lista) {
  return guardarConfig('productos', lista.map(function (p) {
    return p.nombre + '|' + (+p.costo || 0) + '|' + (+p.precio || 0);
  }).join('; '));
}

function buscarProducto(nombre) {
  return productos().find(function (p) { return normalizar(p.nombre) === normalizar(nombre); }) || null;
}

function precioDeLista(nombre) {
  var p = buscarProducto(nombre);
  return p ? p.precio : 0;
}

function costoDeLista(nombre) {
  var p = buscarProducto(nombre);
  return p ? p.costo : 0;
}

/* Cuánto queda por unidad y qué porcentaje representa */
function ganancia(producto) {
  var costo = +producto.costo || 0;
  var venta = +producto.precio || 0;
  var g = venta - costo;
  return {
    monto: g,
    /* Sobre el costo: cuánto se multiplica lo que pusiste */
    margenSobreCosto: costo > 0 ? (g / costo) * 100 : null,
    /* Sobre la venta: qué parte de lo que cobrás es ganancia */
    margenSobreVenta: venta > 0 ? (g / venta) * 100 : null
  };
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

/* ═══════════════════════════════════════════════════════════
   HOJAS DE RUTA
   Qué ruta se recorre cada día de la semana. Se configura desde
   Configuraciones: es la base de los avisos del inicio.
   ═══════════════════════════════════════════════════════════ */

var RUBROS = ['Perfumería', 'Farmacia', 'Supermercado', 'Almacén', 'Kiosco', 'Química', 'Otro'];

/* ═══════════════════════════════════════════════════════════
   CALENDARIO DE RUTAS
   Son 56 hojas que no se repiten semana a semana, así que no hay
   plan fijo: hay una cola ordenada y la app la reparte sobre los
   días hábiles. Sábados, domingos y feriados se saltean solos.
   Si un día no se salió, todo corre un lugar; si se adelanta una
   ruta, el resto se reacomoda atrás.
   ═══════════════════════════════════════════════════════════ */

var FERIADOS = {};        // { "2026-05-01": "Día del Trabajador" }
var _feriadosCargados = false;

/* ── Días hábiles ────────────────────────────────────────── */
function fechaDeIso(iso) {
  /* El mediodía evita que el navegador la corra un día por zona horaria */
  return new Date(String(iso) + 'T12:00:00');
}

function esFinDeSemana(iso) {
  var d = fechaDeIso(iso).getDay();
  return d === 0 || d === 6;
}

function esFeriado(iso) { return !!FERIADOS[iso]; }
function nombreFeriado(iso) { return FERIADOS[iso] || ''; }

function esHabil(iso) { return !esFinDeSemana(iso) && !esFeriado(iso); }

/* El primer día hábil desde una fecha, incluyéndola */
function proximoHabil(iso) {
  var d = fechaDeIso(iso);
  for (var i = 0; i < 400; i++) {
    if (esHabil(isoDe(d))) return isoDe(d);
    d.setDate(d.getDate() + 1);
  }
  return iso;
}

function isoDe(fecha) {
  var d = fecha || new Date();
  return d.getFullYear() + '-' + dosDig(d.getMonth() + 1) + '-' + dosDig(d.getDate());
}

function sumarDias(dias, desde) {
  var d = desde ? new Date(desde) : new Date();
  d.setDate(d.getDate() + dias);
  return d;
}

/* ── Feriados ────────────────────────────────────────────────
   Se bajan de la API pública de ArgentinaDatos y quedan
   guardados. Si no hay internet o el año todavía no está
   publicado, se usan los que estén cargados a mano.
   ────────────────────────────────────────────────────────── */
function feriadosManuales() {
  return String(leerConfig('feriados_extra', '')).split(',')
    .map(function (f) { return f.trim(); })
    .filter(function (f) { return /^\d{4}-\d{2}-\d{2}$/.test(f); });
}

function aplicarFeriados(lista, manuales) {
  FERIADOS = {};
  (lista || []).forEach(function (f) {
    if (f && f.fecha) FERIADOS[f.fecha] = f.nombre || 'Feriado';
  });
  (manuales || feriadosManuales()).forEach(function (f) {
    FERIADOS[f] = FERIADOS[f] || 'Feriado propio';
  });
}

async function cargarFeriados() {
  if (_feriadosCargados) return FERIADOS;

  var anios = [new Date().getFullYear(), new Date().getFullYear() + 1];
  var guardados = [];
  try { guardados = JSON.parse(localStorage.getItem('intencional_feriados') || '[]'); } catch (e) {}
  aplicarFeriados(guardados);

  var traidos = [];
  for (var i = 0; i < anios.length; i++) {
    try {
      var r = await fetch('https://api.argentinadatos.com/v1/feriados/' + anios[i]);
      if (r.ok) {
        var d = await r.json();
        if (Array.isArray(d)) traidos = traidos.concat(d);
      }
    } catch (e) { /* sin internet: quedan los guardados */ }
  }

  if (traidos.length) {
    try { localStorage.setItem('intencional_feriados', JSON.stringify(traidos)); } catch (e) {}
    aplicarFeriados(traidos);
  }
  _feriadosCargados = true;
  return FERIADOS;
}

/* ── La cola ─────────────────────────────────────────────── */
function colaRutas() {
  return String(leerConfig('cola_rutas', '')).split(',')
    .map(function (r) { return r.trim(); })
    .filter(Boolean);
}

function inicioCola() {
  var g = leerConfig('cola_inicio', '');
  var hoy = hoyISO();
  return proximoHabil(!g || g < hoy ? hoy : g);
}

async function guardarCola(cola, inicio) {
  await guardarConfig('cola_rutas', cola.join(', '));
  if (inicio) await guardarConfig('cola_inicio', inicio);
}

/* Reparte la cola sobre los días hábiles: esto es el calendario */
function calendarioRutas(cuantas) {
  var cola = colaRutas();
  var tope = Math.min(cola.length, cuantas || cola.length);
  var cal = [];
  var d = fechaDeIso(inicioCola());

  for (var i = 0; i < tope; i++) {
    while (!esHabil(isoDe(d))) d.setDate(d.getDate() + 1);
    cal.push({ iso: isoDe(d), ruta: cola[i], indice: i });
    d.setDate(d.getDate() + 1);
  }
  return cal;
}

function rutaDelDia(fecha) {
  var iso = isoDe(fecha || new Date());
  var e = calendarioRutas().find(function (x) { return x.iso === iso; });
  return e ? e.ruta : '';
}

function rutaDeManana() {
  var m = sumarDias(1);
  return { ruta: rutaDelDia(m), fecha: m, iso: isoDe(m) };
}

/* ── Reorganizar ─────────────────────────────────────────────
   Todas devuelven la cola nueva, no tocan nada por su cuenta.
   ────────────────────────────────────────────────────────── */

/* No se salió: todo corre un día hábil hacia adelante */
function colaAtrasada() {
  var siguiente = proximoHabil(isoDe(sumarDias(1, fechaDeIso(inicioCola()))));
  return { cola: colaRutas(), inicio: siguiente };
}

/* La primera ya se hizo: sale de la cola y el resto arranca mañana */
function colaAvanzada() {
  var cola = colaRutas().slice(1);
  var siguiente = proximoHabil(isoDe(sumarDias(1, fechaDeIso(inicioCola()))));
  return { cola: cola, inicio: siguiente };
}

/* Adelantar una ruta: se pone primera y las demás corren atrás */
function colaConAdelanto(ruta) {
  var cola = colaRutas();
  var i = cola.indexOf(String(ruta));
  if (i <= 0) return { cola: cola, inicio: inicioCola() };
  cola.splice(i, 1);
  cola.unshift(String(ruta));
  return { cola: cola, inicio: inicioCola() };
}

/* Posponer una ruta un lugar */
function colaConAtraso(ruta) {
  var cola = colaRutas();
  var i = cola.indexOf(String(ruta));
  if (i === -1 || i === cola.length - 1) return { cola: cola, inicio: inicioCola() };
  cola.splice(i, 1);
  cola.splice(i + 1, 0, String(ruta));
  return { cola: cola, inicio: inicioCola() };
}

function clientesDeRuta(clientes, ruta) {
  if (!ruta) return [];
  return (clientes || []).filter(function (c) {
    return clienteActivo(c) && String(rutaDe(c)) === String(ruta);
  });
}

/* Las zonas que toca una ruta, para cruzarlas con los pedidos */
function zonasDeRuta(clientes, ruta) {
  var z = {};
  clientesDeRuta(clientes, ruta).forEach(function (c) {
    if (c.loc) z[normalizar(c.loc)] = c.loc;
  });
  return z;
}

/* Exhibidores que hay que llevar para una ruta */
function exhibidoresDeRuta(clientes, ruta) {
  return clientesDeRuta(clientes, ruta)
    .reduce(function (s, c) { return s + (+c.exhibidores || 0); }, 0);
}

/* Clientes de esa ruta que piden aviso previo, y si ya hay que llamarlos */
function avisosAnticipados(clientes, ruta, diasFalta) {
  return clientesDeRuta(clientes, ruta).filter(function (c) {
    var dias = +c.avisar_antes || 0;
    return dias > 0 && diasFalta <= dias;
  });
}

/* Pedidos abiertos: son pendientes de tipo "pedido", con el
   cliente resuelto por nombre contra la tabla de clientes */
function pedidosAbiertos(pendientes, clientes) {
  var porNombre = {};
  (clientes || []).forEach(function (c) { porNombre[normalizar(c.local)] = c; });
  return (pendientes || [])
    .filter(function (t) { return t.tipo === 'pedido' && !bool(t.hecha); })
    .map(function (t) {
      var c = t.cliente_nombre ? porNombre[normalizar(t.cliente_nombre)] : null;
      return {
        pedido: t,
        cliente: c || null,
        ruta: c ? rutaDe(c) : '',
        loc: (c && c.loc) || ''
      };
    });
}

/* ═══════════════════════════════════════════════════════════
   GASTOS — categorías, de dónde salió la plata y el reparto
   ═══════════════════════════════════════════════════════════ */

var CATEGORIAS_GASTO = [
  { id: 'combustible',   etiqueta: 'Combustible', icono: 'fuel',    compartido: true },
  { id: 'empleado',      etiqueta: 'Empleado',    icono: 'user',    compartido: false },
  { id: 'deuda',         etiqueta: 'Deuda',       icono: 'clock',   compartido: false },
  { id: 'impuestos',     etiqueta: 'Impuestos',   icono: 'file',    compartido: false },
  { id: 'insumos',       etiqueta: 'Insumos',     icono: 'box',     compartido: false },
  { id: 'mantenimiento', etiqueta: 'Mantenimiento', icono: 'tool',  compartido: true },
  { id: 'otro',          etiqueta: 'Otro',        icono: 'tag',     compartido: false }
];

function categoriaGasto(id) {
  return CATEGORIAS_GASTO.find(function (c) { return c.id === id; }) || CATEGORIAS_GASTO[CATEGORIAS_GASTO.length - 1];
}

/* ── Socios ──────────────────────────────────────────────────
   La plata de un gasto puede salir de la empresa o del bolsillo
   de cualquiera de los dueños. El sueldo del empleado, por
   ejemplo, lo ponen los dos.
   ────────────────────────────────────────────────────────── */
function socios() {
  return String(leerConfig('socios', 'Franco, Augusto')).split(',')
    .map(function (s2) { return s2.trim(); }).filter(Boolean);
}

function quienesPagan() {
  var lista = [{ id: 'empresa', etiqueta: 'La empresa' }];
  socios().forEach(function (s2) { lista.push({ id: s2, etiqueta: s2 }); });
  /* El sueldo del empleado, por ejemplo, lo ponen los dos dueños */
  if (socios().length > 1) lista.push({ id: 'socios', etiqueta: 'Entre los dueños' });
  return lista;
}

/* Cuánto puso cada uno. Es un mapa, no un solo nombre: hay gastos
   que se pagan entre varios. */
function puestoPorCadaUno(g) {
  var total = +g.monto || 0;
  var quien = g.pagado_por;
  if (!quien) return {};

  if (quien === 'socios') {
    var lista = socios();
    var cada = Math.floor(total / (lista.length || 1));
    var r = {};
    lista.forEach(function (s2, i) {
      r[s2] = i === lista.length - 1 ? total - cada * (lista.length - 1) : cada;
    });
    return r;
  }

  var uno = {};
  uno[quien] = total;
  return uno;
}

/* Sueldo de cada socio: "Franco|400000, Augusto|400000" */
function sueldosSocios() {
  var r = {};
  String(leerConfig('sueldos_socios', '')).split(',').forEach(function (t) {
    var p = t.split('|');
    var n = (p[0] || '').trim();
    if (n) r[n] = +(p[1] || 0) || 0;
  });
  return r;
}

/* Quién pone el combustible: lo adelanta uno de los dueños y la
   empresa le devuelve su parte al cerrar la semana. */
function quienPagaCombustible() {
  return leerConfig('combustible_lo_pone', socios()[socios().length - 1] || 'Augusto');
}

/* ── Cómo se arma cada gasto según de qué sea ────────────────
   Esto es lo que evita tener que acordarse del reparto cada vez.
   ────────────────────────────────────────────────────────── */
function plantillaGasto(tipo, nombre) {
  var lista = socios();
  var total;

  if (tipo === 'sueldo_socio') {
    /* Los sueldos de los dueños los paga la empresa, enteros */
    return {
      descripcion: 'Sueldo ' + nombre,
      monto: sueldosSocios()[nombre] || 0,
      categoria: 'empleado',
      pagadoPor: 'empresa',
      modo: 'empresa'
    };
  }

  if (tipo === 'sueldo_empleado') {
    /* El del empleado sale mitad y mitad del sueldo de los dueños */
    var e = empleadoConfig();
    return {
      descripcion: 'Sueldo' + (e.nombre ? ' ' + e.nombre : ''),
      monto: e.sueldo,
      categoria: 'empleado',
      pagadoPor: 'socios',    // la plata la ponen los dos dueños
      modo: 'socios'
    };
  }

  if (tipo === 'combustible') {
    /* Lo adelanta un dueño; la empresa le devuelve su parte */
    return {
      descripcion: 'Nafta Etios',
      monto: 0,
      categoria: 'combustible',
      pagadoPor: quienPagaCombustible(),
      modo: 'empresa_socio',
      socio: quienPagaCombustible()
    };
  }

  if (tipo === 'deuda') {
    return {
      descripcion: 'Pago de deuda',
      monto: +leerConfig('monto_deuda', 0) || 0,
      categoria: 'deuda',
      pagadoPor: 'empresa',
      modo: 'empresa'
    };
  }

  return { descripcion: '', monto: 0, categoria: 'otro', pagadoPor: 'empresa', modo: 'empresa' };
}

/* ── Cierre de semana ────────────────────────────────────────
   Qué hay que pagar, qué entró y si alcanza.
   Los sueldos son semanales; la deuda, una vez al mes.
   ────────────────────────────────────────────────────────── */
function compromisosSemana(hayQuePagarDeuda) {
  var items = [];
  var sueldos = sueldosSocios();

  socios().forEach(function (s2) {
    if (sueldos[s2]) items.push({ concepto: 'Sueldo ' + s2, monto: sueldos[s2], cada: 'semana' });
  });

  var e = empleadoConfig();
  if (e.sueldo) {
    /* Si el empleado cobra por mes, para la semana se prorratea */
    var monto = e.frecuencia === 'semanal' ? e.sueldo
              : e.frecuencia === 'quincenal' ? Math.round(e.sueldo / 2)
              : Math.round(e.sueldo / 4);
    /* Lo ponen los dueños de su bolsillo: hay que pagarlo igual,
       pero no sale de la caja de la empresa. */
    items.push({
      concepto: 'Sueldo' + (e.nombre ? ' ' + e.nombre : ' empleado'),
      monto: monto,
      cada: e.frecuencia === 'semanal' ? 'semana' : e.frecuencia + ' (prorrateado)',
      loPonenLosDuenos: true
    });
  }

  if (hayQuePagarDeuda) {
    var d = +leerConfig('monto_deuda', 0) || 0;
    if (d) items.push({ concepto: 'Deuda', monto: d, cada: 'mes' });
  }

  return {
    items: items,
    /* El total es lo que tiene que salir de la empresa */
    total: items.reduce(function (a, i) { return a + (i.loPonenLosDuenos ? 0 : i.monto); }, 0),
    totalConDuenos: items.reduce(function (a, i) { return a + i.monto; }, 0)
  };
}

/* Lo que entró en el período: lo cobrado de verdad, sin la deuda */
function cobradoEnRango(remitos, desde, hasta) {
  var enRango = (remitos || []).filter(function (r) {
    var k = claveFecha(r.fecha || r.created_at);
    return k && k >= desde && k <= hasta;
  });
  return {
    remitos: enRango.length,
    efectivo: sumarTipo(enRango, 'efectivo'),
    transferencia: sumarTipo(enRango, 'transferencia'),
    cobrado: sumarTipo(enRango, 'efectivo') + sumarTipo(enRango, 'transferencia'),
    deuda: sumarTipo(enRango, 'deuda')
  };
}

/* El veredicto: ¿alcanza para pagar todo? */
function cierreSemana(remitos, gastos, desde, hasta, conDeuda) {
  var entradas = cobradoEnRango(remitos, desde, hasta);
  var delRango = (gastos || []).filter(function (g) {
    var k = claveFecha(g.fecha || g.created_at);
    return k && k >= desde && k <= hasta;
  });

  /* Lo que ya salió de la caja y lo que todavía se debe */
  /* Solo lo que salió de la caja de la empresa */
  var yaGastado = delRango.filter(gastoPagado)
    .reduce(function (a, g) { return a + montoEmpresa(g); }, 0);
  var pendientes = delRango.filter(function (g) { return !gastoPagado(g); });

  var comp = compromisosSemana(conDeuda);
  pendientes.forEach(function (g) {
    comp.items.push({ concepto: g.descripcion || 'Gasto sin pagar', monto: montoEmpresa(g), cada: 'pendiente' });
    comp.total += montoEmpresa(g);
  });

  var disponible = entradas.cobrado - yaGastado;

  return {
    entradas: entradas,
    yaGastado: yaGastado,
    pendientes: pendientes,
    compromisos: comp,
    disponible: disponible,
    alcanza: disponible >= comp.total,
    falta: Math.max(0, comp.total - disponible),
    sobra: Math.max(0, disponible - comp.total)
  };
}

/* ── Reparto de un gasto compartido ──────────────────────────
   La nafta del auto la pagan a medias entre la empresa y vos.
   El porcentaje se configura y el monto sale de ahí.
   ────────────────────────────────────────────────────────── */
function porcentajeEmpresa() {
  var p = +leerConfig('reparto_empresa', 50);
  return isNaN(p) ? 50 : Math.max(0, Math.min(100, p));
}

function repartirGasto(monto, porcentaje) {
  var total = +monto || 0;
  var pct = porcentaje === undefined || porcentaje === null ? porcentajeEmpresa() : +porcentaje;
  var empresa = Math.round(total * pct) / 100;
  return { empresa: empresa, personal: Math.round((total - empresa) * 100) / 100, porcentaje: pct };
}

/* Cómo se reparte el costo de un gasto entre la empresa y los socios.
   Formato: { empresa: 12000, Augusto: 8000 } */
function repartoDeGasto(g) {
  if (g.reparto) {
    try {
      var r = typeof g.reparto === 'string' ? JSON.parse(g.reparto) : g.reparto;
      if (r && typeof r === 'object') return r;
    } catch (e) {}
  }
  /* Gastos viejos, con las dos columnas de antes */
  var total = +g.monto || 0;
  var emp = (g.parte_empresa === null || g.parte_empresa === undefined) ? total : +g.parte_empresa;
  var per = +g.parte_personal || 0;
  var r2 = { empresa: emp };
  if (per) r2[socios()[socios().length - 1] || 'Augusto'] = per;
  return r2;
}

/* Saldo de un gasto para una persona.
   Positivo = le deben. Negativo = debe. */
function saldoDeGasto(g, quien) {
  var puso = +puestoPorCadaUno(g)[quien] || 0;
  var leToca = +repartoDeGasto(g)[quien] || 0;
  return puso - leToca;
}

/* Balance de un conjunto de gastos, persona por persona */
function balanceGastos(gastos, quien) {
  var b = { aCobrar: 0, aDevolver: 0, neto: 0, items: [] };
  (gastos || []).forEach(function (g) {
    if (!g.pagado_por) return;                 // sin ese dato no se puede saber
    var s = saldoDeGasto(g, quien);
    if (!s) return;
    if (s > 0) b.aCobrar += s; else b.aDevolver += -s;
    b.items.push({ gasto: g, saldo: s });
  });
  b.neto = b.aCobrar - b.aDevolver;
  return b;
}

/* Balance de todos los que participan */
function balancesTodos(gastos) {
  return socios().map(function (s2) {
    return { quien: s2, balance: balanceGastos(gastos, s2) };
  }).filter(function (x) { return x.balance.items.length; });
}

/* Cuánto de un gasto le toca a la empresa. Si lo pagan los dueños
   de su bolsillo y se lo reparten entre ellos, la empresa no puso
   nada: no puede contarse como gasto de la empresa. */
function montoEmpresa(g) {
  var r = repartoDeGasto(g);
  /* Sin reparto anotado se asume que era todo de la empresa */
  if (!r || !Object.keys(r).length) return +g.monto || 0;
  return +r.empresa || 0;
}

/* El que sale del bolsillo de los dueños */
function montoDeSocios(g) {
  return (+g.monto || 0) - montoEmpresa(g);
}

/* Un gasto puede quedar registrado sin pagar todavía */
function gastoPagado(g) {
  return g.pagado === undefined || g.pagado === null ? true : bool(g.pagado);
}

/* Partes de pago de un gasto: mismo formato que los remitos */
function partesGasto(g) {
  if (!g) return [];
  if (g.pagos_detalle) {
    try {
      var arr = typeof g.pagos_detalle === 'string' ? JSON.parse(g.pagos_detalle) : g.pagos_detalle;
      if (Array.isArray(arr) && arr.length) return arr;
    } catch (e) {}
  }
  return [{ tipo: g.medio || 'efectivo', monto: +g.monto || 0, alias: g.alias || null }];
}

/* ── Empleado ────────────────────────────────────────────── */
function empleadoConfig() {
  return {
    nombre: leerConfig('empleado_nombre', ''),
    sueldo: +leerConfig('empleado_sueldo', 0) || 0,
    frecuencia: leerConfig('empleado_frecuencia', 'mensual')   // semanal · quincenal · mensual
  };
}

/* ── Pendientes con cliente o zona ───────────────────────────
   Un pedido o un retiro puede ser de un cliente de la base o de
   uno nuevo que todavía no está cargado; en ese caso se anota
   la zona a mano.
   ────────────────────────────────────────────────────────── */
function pendienteEsDeClienteNuevo(t, clientes) {
  if (!t.cliente_nombre) return false;
  return !(clientes || []).some(function (c) { return normalizar(c.local) === normalizar(t.cliente_nombre); });
}

/* Pendientes de pedido o retiro que caen en una ruta o en su zona */
function pendientesParaRuta(pendientes, clientes, ruta) {
  var zonas = zonasDeRuta(clientes, ruta);
  var porNombre = {};
  (clientes || []).forEach(function (c) { porNombre[normalizar(c.local)] = c; });

  return (pendientes || [])
    .filter(function (t) { return !bool(t.hecha) && (t.tipo === 'pedido' || t.tipo === 'retirar'); })
    .map(function (t) {
      var c = t.cliente_nombre ? porNombre[normalizar(t.cliente_nombre)] : null;
      var loc = (c && c.loc) || t.loc || '';
      var rutaT = c ? rutaDe(c) : '';
      return {
        pendiente: t,
        cliente: c || null,
        esNuevo: !!t.cliente_nombre && !c,
        loc: loc,
        ruta: rutaT,
        enRuta: !!(ruta && rutaT && String(rutaT) === String(ruta)),
        enZona: !!(loc && zonas[normalizar(loc)] && !(rutaT && String(rutaT) === String(ruta)))
      };
    })
    .filter(function (x) { return x.enRuta || x.enZona; });
}

/* ═══════════════════════════════════════════════════════════
   CÓDIGO DEL CLIENTE
   R + número de hoja + guion + su lugar dentro de la hoja, con
   cuatro dígitos: R1-0001, R4-0010. Vive en la columna num_str.
   ═══════════════════════════════════════════════════════════ */

function codigoCliente(ruta, correlativo) {
  var r = String(ruta == null ? '' : ruta).trim();
  if (!r) return '';
  return 'R' + r + '-' + String(Math.max(1, +correlativo || 1)).padStart(4, '0');
}

/* Devuelve { ruta, correlativo } o null si no tiene ese formato */
function leerCodigo(str) {
  var m = /^R(\d+)-(\d+)$/i.exec(String(str || '').trim());
  return m ? { ruta: m[1], correlativo: +m[2] } : null;
}

function correlativoDe(c) {
  var p = leerCodigo(c && c.num_str);
  return p ? p.correlativo : 0;
}

/* El próximo lugar libre en una hoja */
function siguienteEnRuta(clientes, ruta) {
  var usados = (clientes || [])
    .filter(function (c) { return String(rutaDe(c)) === String(ruta); })
    .map(correlativoDe);
  return (usados.length ? Math.max.apply(null, usados) : 0) + 1;
}

/* Al mover un cliente de hoja hay que darle un lugar en la nueva */
function codigoParaRutaNueva(clientes, ruta, elMismo) {
  var otros = (clientes || []).filter(function (c) {
    return !elMismo || String(c.num) !== String(elMismo.num);
  });
  return codigoCliente(ruta, siguienteEnRuta(otros, ruta));
}

/* Renumera una hoja entera de 1 en adelante, respetando el orden
   en que vienen los clientes. Devuelve solo los que cambian. */
function renumerarRuta(clientesDeLaRuta, ruta) {
  return (clientesDeLaRuta || []).map(function (c, i) {
    return { cliente: c, codigo: codigoCliente(ruta, i + 1) };
  }).filter(function (x) { return x.codigo !== x.cliente.num_str; });
}


/* ═══════════════════════════════════════════════════════════
   DEUDAS POR COBRAR
   ═══════════════════════════════════════════════════════════ */

/* Los remitos con saldo pendiente, del más viejo al más nuevo */
function remitosConDeuda(remitos) {
  return (remitos || [])
    .filter(function (r) { return deudaPendiente(r) > 0; })
    .map(function (r) {
      var alias = r.alias || r.pago2_alias || null;
      partesPago(r).forEach(function (p) {
        if (p.tipo === 'deuda' && p.alias) alias = p.alias;
      });
      return {
        remito: r,
        cliente: r.cliente_nombre || '—',
        monto: deudaPendiente(r),
        fecha: r.fecha || r.created_at,
        dias: diasEntre(r.fecha || r.created_at, hoyISO()),
        alias: alias
      };
    })
    .sort(function (a, b) { return b.dias - a.dias; });
}

/* Resumen para el aviso del inicio */
function resumenDeudas(remitos) {
  var items = remitosConDeuda(remitos);
  var porCliente = {};
  items.forEach(function (d) { porCliente[normalizar(d.cliente)] = 1; });
  return {
    items: items,
    clientes: Object.keys(porCliente).length,
    total: items.reduce(function (a, d) { return a + d.monto; }, 0),
    masVieja: items.length ? items[0] : null
  };
}

/* ── Recordatorio semanal de gastos fijos ────────────────────
   Al cierre de la semana hay que anotar sueldos y demás. Se
   considera hecho si esta semana ya se cargó un gasto de ese tipo.
   ────────────────────────────────────────────────────────── */
function faltaAnotarGastos(gastos, desde, hasta) {
  var delRango = (gastos || []).filter(function (g) {
    var k = claveFecha(g.fecha || g.created_at);
    return k && k >= desde && k <= hasta;
  });
  var hay = function (test) { return delRango.some(test); };

  var faltan = [];
  var sueldos = sueldosSocios();

  socios().forEach(function (s2) {
    if (!sueldos[s2]) return;
    if (!hay(function (g) { return normalizar(g.descripcion).indexOf(normalizar(s2)) !== -1; })) {
      faltan.push('el sueldo de ' + s2);
    }
  });

  var e = empleadoConfig();
  if (e.sueldo && e.frecuencia === 'semanal' &&
      !hay(function (g) { return g.categoria === 'empleado' && normalizar(g.descripcion).indexOf(normalizar(e.nombre || 'sueldo')) !== -1; })) {
    faltan.push('el sueldo de ' + (e.nombre || 'el empleado'));
  }

  if (!hay(function (g) { return g.categoria === 'combustible'; })) faltan.push('la nafta');

  return faltan;
}


/* ═══════════════════════════════════════════════════════════
   AVISOS DEL INICIO
   Cada uno aparece los días que se configuren, y el de deudas
   se puede silenciar por el resto del día.
   ═══════════════════════════════════════════════════════════ */

var DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/* "5" o "1,3,5" — vacío quiere decir todos los días */
function diasDeAviso(clave, porDefecto) {
  var crudo = leerConfig(clave, porDefecto);
  if (crudo === '' || crudo === null || crudo === undefined) return [];
  return String(crudo).split(',')
    .map(function (d) { return parseInt(d, 10); })
    .filter(function (d) { return !isNaN(d) && d >= 0 && d <= 6; });
}

function tocaHoy(clave, porDefecto, fecha) {
  var dias = diasDeAviso(clave, porDefecto);
  if (!dias.length) return true;                    // sin días elegidos: siempre
  return dias.indexOf((fecha || new Date()).getDay()) !== -1;
}

/* Silenciar un aviso hasta mañana */
function silenciarAviso(clave) {
  try { localStorage.setItem('intencional_silencio_' + clave, hoyISO()); } catch (e) {}
}

function avisoSilenciado(clave) {
  try { return localStorage.getItem('intencional_silencio_' + clave) === hoyISO(); }
  catch (e) { return false; }
}

/* ═══════════════════════════════════════════════════════════
   CLIENTES DUPLICADOS
   No alcanza con el nombre: hay muchas perfumerías "Burbujas" y
   hay clientes con varias sucursales. Lo que delata un duplicado
   es la misma dirección en la misma localidad, o el mismo teléfono
   con la misma dirección.
   ═══════════════════════════════════════════════════════════ */

function soloDigitosTel(t) { return String(t || '').replace(/[^0-9]/g, '').slice(-8); }

/* Normaliza una dirección para poder compararla: saca "calle",
   abreviaturas y espacios de más. */
function claveDireccion(dir) {
  return normalizar(dir)
    .replace(/\b(calle|av|avda|avenida|ruta|km|nro|n|no|numero|piso|local|depto|dpto)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Compara dos clientes y dice qué tan probable es que sean el mismo */
function comparar(a, b) {
  var dirA = claveDireccion(a.dir), dirB = claveDireccion(b.dir);
  var locA = normalizar(a.loc), locB = normalizar(b.loc);
  var telA = soloDigitosTel(a.tel), telB = soloDigitosTel(b.tel);
  var nomA = normalizar(a.local), nomB = normalizar(b.local);

  var mismaDir = !!dirA && dirA === dirB;
  var mismaLoc = !!locA && locA === locB;
  var mismoTel = telA.length >= 6 && telA === telB;
  var mismoNombre = !!nomA && nomA === nomB;

  /* Misma dirección y misma localidad: es el mismo local */
  if (mismaDir && mismaLoc) {
    return { nivel: 'seguro', motivo: 'misma dirección en ' + (a.loc || b.loc) };
  }
  /* Mismo teléfono y misma dirección, aunque cambie el nombre */
  if (mismoTel && mismaDir) {
    return { nivel: 'seguro', motivo: 'mismo teléfono y misma dirección' };
  }
  /* Mismo teléfono en distinta dirección: suele ser otra sucursal
     del mismo dueño, no un duplicado. */
  if (mismoTel && dirA && dirB && dirA !== dirB) {
    return { nivel: 'sucursal', motivo: 'mismo teléfono, direcciones distintas' };
  }
  if (mismoTel && (!dirA || !dirB)) {
    return { nivel: 'posible', motivo: 'mismo teléfono, falta la dirección de alguno' };
  }
  /* Mismo nombre y misma localidad, sin dirección cargada */
  if (mismoNombre && mismaLoc && (!dirA || !dirB)) {
    return { nivel: 'posible', motivo: 'mismo nombre y misma zona, sin dirección para confirmar' };
  }
  return null;
}

/* Busca duplicados agrupando por dirección, teléfono y nombre:
   comparar todos contra todos con mil clientes sería un millón de
   comparaciones, así que solo se comparan los que comparten algo. */
function buscarDuplicados(clientes) {
  var lista = (clientes || []).filter(function (c) { return c.local; });
  var candidatos = {};

  function agrupar(clave, c) {
    if (!clave) return;
    (candidatos[clave] = candidatos[clave] || []).push(c);
  }

  lista.forEach(function (c) {
    var dir = claveDireccion(c.dir);
    if (dir) agrupar('d:' + dir + '|' + normalizar(c.loc), c);
    var tel = soloDigitosTel(c.tel);
    if (tel.length >= 6) agrupar('t:' + tel, c);
    agrupar('n:' + normalizar(c.local) + '|' + normalizar(c.loc), c);
  });

  var vistos = {};
  var pares = [];

  Object.keys(candidatos).forEach(function (k) {
    var g = candidatos[k];
    if (g.length < 2) return;
    for (var i = 0; i < g.length; i++) {
      for (var j = i + 1; j < g.length; j++) {
        var par = [g[i], g[j]].sort(function (x, y) { return (+x.num || 0) - (+y.num || 0); });
        var id = par[0].num + '-' + par[1].num;
        if (vistos[id]) continue;
        var r = comparar(par[0], par[1]);
        if (!r) continue;
        vistos[id] = 1;
        pares.push({ a: par[0], b: par[1], nivel: r.nivel, motivo: r.motivo });
      }
    }
  });

  var orden = { seguro: 0, posible: 1, sucursal: 2 };
  return pares.sort(function (x, y) { return orden[x.nivel] - orden[y.nivel]; });
}
