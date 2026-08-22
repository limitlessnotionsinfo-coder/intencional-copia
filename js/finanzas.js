/* ═══════════════════════════════════════════════════════════
   FINANZAS · la capa de cálculo
   Todas las cuentas del negocio viven acá. Las pantallas solo
   muestran: si un número aparece en dos lados, sale de la misma
   función y no puede dar distinto.

   Regla de la casa: si no hay datos suficientes, se devuelve
   null y la pantalla lo dice. Nunca un número inventado.
   ═══════════════════════════════════════════════════════════ */

/* ── Qué gasto es fijo y cuál variable ───────────────────────
   Fijo: se paga exista o no venta (sueldos, alquiler, servicios).
   Variable: acompaña a la actividad (nafta, insumos, envíos).
   ────────────────────────────────────────────────────────── */
var CATEGORIAS_FIJAS = ['empleado', 'alquiler', 'servicios', 'impuestos', 'seguros', 'contador', 'software'];

/* ── Monotributo ─────────────────────────────────────────────
   Uno por socio, una vez al mes. Tiene su propia configuración
   porque es el gasto fijo que más se repite y conviene tenerlo
   a un toque.
   ────────────────────────────────────────────────────────── */
function monotributos() {
  var guardado = {};
  try {
    var g = JSON.parse(leerConfig('monotributos', '{}') || '{}');
    if (g && typeof g === 'object') guardado = g;
  } catch (e) {}

  return socios().map(function (s) {
    return { socio: s, monto: +guardado[s] || 0 };
  });
}

function guardarMonotributos(lista) {
  var g = {};
  (lista || []).forEach(function (m) {
    if (+m.monto > 0) g[m.socio] = +m.monto;
  });
  return guardarConfig('monotributos', JSON.stringify(g));
}

function totalMonotributos() {
  return monotributos().reduce(function (a, m) { return a + m.monto; }, 0);
}

/* ── Los gastos fijos cargados a mano ────────────────────────
   Formato en config: "nombre|monto|frecuencia; ..."
   La frecuencia puede ser semanal, mensual o anual, y todo se
   lleva a un valor mensual para poder compararlo.
   ────────────────────────────────────────────────────────── */
var FRECUENCIAS = {
  semanal:  { etiqueta: 'Por semana', alMes: 4.33 },
  mensual:  { etiqueta: 'Por mes',    alMes: 1 },
  bimestral:{ etiqueta: 'Cada 2 meses', alMes: 0.5 },
  anual:    { etiqueta: 'Por año',    alMes: 1 / 12 }
};

/* nombre|monto|frecuencia|activo  ·  el activo permite apagar
   un gasto sin borrarlo, para cuando deja de pagarse un tiempo. */
function gastosFijosConfig(incluirApagados) {
  return String(leerConfig('gastos_fijos', '')).split(';')
    .map(function (t) { return t.trim(); }).filter(Boolean)
    .map(function (t) {
      var p = t.split('|');
      var frec = (p[2] || 'mensual').trim();
      return {
        nombre: (p[0] || '').trim(),
        monto: +p[1] || 0,
        frecuencia: FRECUENCIAS[frec] ? frec : 'mensual',
        activo: p[3] === undefined ? true : p[3].trim() !== 'no'
      };
    })
    .filter(function (g) { return g.nombre && (incluirApagados || g.activo); });
}

function guardarGastosFijosConfig(lista) {
  return guardarConfig('gastos_fijos', (lista || [])
    .filter(function (g) { return String(g.nombre || '').trim(); })
    .map(function (g) {
      return String(g.nombre).trim() + '|' + (+g.monto || 0) + '|' +
        (g.frecuencia || 'mensual') + '|' + (g.activo === false ? 'no' : 'si');
    }).join('; '));
}

/* Lo que suman todos los fijos en un mes */
function fijosMensuales() {
  return gastosFijosConfig().reduce(function (a, g) {
    return a + Math.round(g.monto * FRECUENCIAS[g.frecuencia].alMes);
  }, 0) + totalMonotributos();
}

/* Lo que corresponde a un período de tantos días */
function fijosDelPeriodo(dias) {
  return Math.round(fijosMensuales() / 30 * (dias || 30));
}

/* Un gasto anotado es fijo si su categoría lo es, o si su
   descripción coincide con uno de los fijos configurados. */
function esGastoFijo(g) {
  var cat = normalizar(g.categoria || 'otro');
  if (CATEGORIAS_FIJAS.indexOf(cat) !== -1) return true;

  var d = normalizar(g.descripcion);
  return gastosFijosConfig().some(function (f) {
    return d && d.indexOf(normalizar(f.nombre)) !== -1;
  });
}

/* ── El período ──────────────────────────────────────────── */
function rangoDe(modo, desde, hasta) {
  var hoy = hoyISO();
  if (modo === 'hoy')      return { desde: hoy, hasta: hoy, etiqueta: 'Hoy', dias: 1 };
  if (modo === 'semana')   return { desde: isoDe(sumarDias(-6)), hasta: hoy, etiqueta: 'Últimos 7 días', dias: 7 };
  if (modo === 'mes')      return { desde: isoDe(sumarDias(-29)), hasta: hoy, etiqueta: 'Últimos 30 días', dias: 30 };
  if (modo === 'trimestre')return { desde: isoDe(sumarDias(-89)), hasta: hoy, etiqueta: 'Últimos 3 meses', dias: 90 };
  if (modo === 'anio')     return { desde: isoDe(sumarDias(-364)), hasta: hoy, etiqueta: 'Último año', dias: 365 };
  if (modo === 'rango' && desde && hasta) {
    return { desde: desde, hasta: hasta, etiqueta: fechaCorta(desde) + ' a ' + fechaCorta(hasta),
             dias: Math.max(1, diasEntre(desde, hasta) + 1) };
  }
  return rangoDe('mes');
}

/* El mismo período, corrido hacia atrás: sirve para comparar */
function rangoAnterior(r) {
  var largo = r.dias;
  var hasta = isoDe(new Date(Date.parse(r.desde + 'T12:00:00Z') - 86400000));
  var desde = isoDe(new Date(Date.parse(hasta + 'T12:00:00Z') - (largo - 1) * 86400000));
  return { desde: desde, hasta: hasta, dias: largo, etiqueta: 'período anterior' };
}

function enRangoFecha(fila, r) {
  var k = claveFecha(fila.fecha || fila.created_at);
  return !!k && k >= r.desde && k <= r.hasta;
}

/* ═══════════════════════════════════════════════════════════
   LO QUE ENTRA
   ═══════════════════════════════════════════════════════════ */
function ingresos(remitos, r) {
  var reales = (remitos || []).filter(function (x) { return x.motivo !== 'cerrado'; })
                              .filter(function (x) { return enRangoFecha(x, r); });

  var facturado = 0, cobrado = 0, pendiente = 0, unidades = 0, operaciones = 0;

  reales.forEach(function (x) {
    var t = +x.total || 0;
    if (t > 0) operaciones++;
    facturado += t;
    unidades += +x.unidades || 0;

    partesPago(x).forEach(function (p) {
      var m = +p.monto || 0;
      if (p.tipo === 'deuda' && !p.era_deuda) return;   // todavía no entró
      cobrado += m;
    });
    pendiente += deudaPendiente(x);
  });

  return {
    facturado: facturado,
    cobrado: cobrado,
    pendiente: pendiente,
    unidades: unidades,
    operaciones: operaciones,
    ticket: operaciones ? Math.round(facturado / operaciones) : 0,
    precioUnidad: unidades ? Math.round(facturado / unidades) : 0,
    remitos: reales
  };
}

/* ═══════════════════════════════════════════════════════════
   LO QUE SALE
   El costo de la mercadería sale de los productos del remito y
   del costo de cada uno en Configuraciones.
   ═══════════════════════════════════════════════════════════ */
function costoDeLoVendido(remitos, r) {
  var total = 0, conCosto = 0, sinCosto = 0;

  (remitos || []).filter(function (x) { return enRangoFecha(x, r) && x.motivo !== 'cerrado'; })
    .forEach(function (x) {
      var lineas = [];
      try {
        lineas = typeof x.productos === 'string' ? JSON.parse(x.productos || '[]') : (x.productos || []);
      } catch (e) { lineas = []; }

      lineas.forEach(function (l) {
        var cant = +l.cant || 0;
        if (!cant) return;
        var p = buscarProducto(l.prod);
        /* Si el producto ya no está en la lista, no se inventa un
           costo: se cuenta aparte para poder avisarlo. */
        if (!p || !p.costo) { sinCosto += cant; return; }
        var esMayor = p.desde && cant >= p.desde && p.costoMayor;
        total += cant * (esMayor ? p.costoMayor : p.costo);
        conCosto += cant;
      });
    });

  return { total: total, unidadesConCosto: conCosto, unidadesSinCosto: sinCosto };
}

function egresos(gastos, compras, r) {
  /* Los ingresos viven en la misma tabla pero no son gastos */
  var delRango = (gastos || [])
    .filter(function (g) { return !esIngreso(g) && enRangoFecha(g, r); });

  /* Solo lo que sale de la caja de la empresa: lo que ponen los
     dueños de su bolsillo no es un gasto de la empresa. */
  var fijos = 0, variables = 0;
  var porCategoria = {};

  delRango.forEach(function (g) {
    var m = montoEmpresa(g);
    if (!m) return;
    if (esGastoFijo(g)) fijos += m; else variables += m;
    var c = g.categoria || 'otro';
    porCategoria[c] = (porCategoria[c] || 0) + m;
  });

  /* A los fijos anotados se les suman los configurados que no
     aparecen anotados en el período: el alquiler existe aunque
     nadie lo haya cargado como gasto. */
  var anotados = {};
  delRango.forEach(function (g) {
    if (esGastoFijo(g)) anotados[normalizar(g.descripcion)] = true;
  });

  /* Los fijos configurados que no estén anotados se estiman por
     el largo del período. Se topea en un año: para un rango
     abierto como "desde siempre" el prorrateo daría un número
     sin sentido, y esa cuenta la usa la caja. */
  var diasEstimar = Math.min(r.dias || 30, 365);
  var estimados = [];

  gastosFijosConfig().forEach(function (f) {
    var yaEsta = Object.keys(anotados).some(function (d) {
      return d.indexOf(normalizar(f.nombre)) !== -1;
    });
    if (yaEsta) return;
    var monto = Math.round(f.monto * FRECUENCIAS[f.frecuencia].alMes / 30 * diasEstimar);
    if (monto > 0) {
      fijos += monto;
      estimados.push({ nombre: f.nombre, monto: monto });
    }
  });

  var reposicion = (compras || []).filter(function (c) { return enRangoFecha(c, r); })
    .reduce(function (a, c) { return a + (+c.total_costo || 0); }, 0);
  var unidadesRepuestas = (compras || []).filter(function (c) { return enRangoFecha(c, r); })
    .reduce(function (a, c) { return a + (+c.total_unidades || 0); }, 0);

  return {
    fijos: fijos,
    variables: variables,
    total: fijos + variables,
    porCategoria: porCategoria,
    /* Los que se contaron sin estar anotados, para poder decirlo */
    fijosEstimados: estimados,
    reposicion: reposicion,
    unidadesRepuestas: unidadesRepuestas,
    gastos: delRango
  };
}

/* ═══════════════════════════════════════════════════════════
   RENTABILIDAD
   Tres ganancias distintas, cada una responde otra pregunta.
   ═══════════════════════════════════════════════════════════ */
function rentabilidad(remitos, gastos, compras, r) {
  var i = ingresos(remitos, r);
  var cmv = costoDeLoVendido(remitos, r);
  var e = egresos(gastos, compras, r);

  var bruta = i.facturado - cmv.total;
  var operativa = bruta - e.variables;
  var neta = operativa - e.fijos;

  var pct = function (n) { return i.facturado ? Math.round(n / i.facturado * 1000) / 10 : null; };

  return {
    facturado: i.facturado,
    costoMercaderia: cmv.total,
    gastosVariables: e.variables,
    gastosFijos: e.fijos,
    bruta: bruta,
    operativa: operativa,
    neta: neta,
    margenBruto: pct(bruta),
    margenOperativo: pct(operativa),
    margenNeto: pct(neta),
    porUnidad: i.unidades ? Math.round(neta / i.unidades) : null,
    porVenta: i.operaciones ? Math.round(neta / i.operaciones) : null,
    /* Para poder explicar de dónde sale cada número */
    detalle: { ingresos: i, costo: cmv, egresos: e }
  };
}

/* ═══════════════════════════════════════════════════════════
   PUNTO DE EQUILIBRIO
   Cuánto hay que facturar para no perder plata. Sale de dividir
   los costos fijos por el margen de contribución real.
   ═══════════════════════════════════════════════════════════ */
function puntoDeEquilibrio(remitos, gastos, compras, r) {
  var rent = rentabilidad(remitos, gastos, compras, r);
  if (!rent.facturado) return null;

  /* Lo que queda de cada peso vendido después de lo que cuesta
     producirlo y venderlo */
  var contribucion = rent.facturado - rent.costoMercaderia - rent.gastosVariables;
  var margenContribucion = contribucion / rent.facturado;

  if (margenContribucion <= 0) {
    return { imposible: true, motivo: 'Los costos variables se comen toda la facturación.' };
  }
  if (!rent.gastosFijos) {
    return { imposible: true, motivo: 'No hay gastos fijos cargados en el período.' };
  }

  var equilibrio = Math.round(rent.gastosFijos / margenContribucion);
  var i = rent.detalle.ingresos;

  return {
    monto: equilibrio,
    facturado: rent.facturado,
    diferencia: rent.facturado - equilibrio,
    porcentaje: Math.round((rent.facturado / equilibrio - 1) * 1000) / 10,
    alcanzado: rent.facturado >= equilibrio,
    margenContribucion: Math.round(margenContribucion * 1000) / 10,
    unidades: i.precioUnidad ? Math.ceil(equilibrio / i.precioUnidad) : null,
    unidadesVendidas: i.unidades
  };
}

/* ═══════════════════════════════════════════════════════════
   STOCK
   No hay inventario cargado: se estima con lo comprado menos lo
   vendido desde que hay registros. Es una aproximación y la
   pantalla lo dice.
   ═══════════════════════════════════════════════════════════ */
function stockEstimado(remitos, compras) {
  var comprado = (compras || []).reduce(function (a, c) { return a + (+c.total_unidades || 0); }, 0);
  var vendido = (remitos || []).filter(function (x) { return x.motivo !== 'cerrado'; })
    .reduce(function (a, x) { return a + (+x.unidades || 0); }, 0);

  if (!comprado) return null;   // sin compras cargadas no se puede estimar

  var unidades = comprado - vendido;
  var costoProm = costoPromedioDeCompra(compras);

  return {
    unidades: unidades,
    comprado: comprado,
    vendido: vendido,
    valor: costoProm ? Math.round(unidades * costoProm) : null,
    costoPromedio: costoProm,
    /* Un stock negativo significa que faltan compras por cargar */
    confiable: unidades >= 0,
    rotacion: unidades > 0 ? Math.round(vendido / unidades * 10) / 10 : null
  };
}

function costoPromedioDeCompra(compras) {
  var u = 0, c = 0;
  (compras || []).forEach(function (x) {
    u += +x.total_unidades || 0;
    c += +x.total_costo || 0;
  });
  return u ? Math.round(c / u) : null;
}

/* ── Cuánto va a hacer falta para la próxima reposición ───────
   Se mira a qué ritmo se vende y cada cuánto se repone, y se
   estima el costo de cubrir ese lapso.
   ────────────────────────────────────────────────────────── */
function reposicionEstimada(remitos, compras) {
  var semanas = 8;
  var desde = isoDe(sumarDias(-semanas * 7));
  var r = { desde: desde, hasta: hoyISO(), dias: semanas * 7 };

  var vendidas = (remitos || []).filter(function (x) {
    return enRangoFecha(x, r) && x.motivo !== 'cerrado';
  }).reduce(function (a, x) { return a + (+x.unidades || 0); }, 0);

  var compradas = (compras || []).filter(function (c) { return enRangoFecha(c, r); });
  var costoProm = costoPromedioDeCompra(compras);

  if (!vendidas || !costoProm) return null;   // sin historia no se estima

  var porSemana = vendidas / semanas;

  /* Cada cuánto se repone, según las compras que hubo */
  var fechas = compradas.map(function (c) { return claveFecha(c.fecha || c.created_at); })
    .filter(Boolean).sort();
  var cadaDias = 0;
  if (fechas.length >= 2) {
    var huecos = [];
    for (var i = 1; i < fechas.length; i++) huecos.push(diasEntre(fechas[i - 1], fechas[i]));
    cadaDias = Math.round(huecos.reduce(function (a, b) { return a + b; }, 0) / huecos.length);
  }
  var cubre = cadaDias || 30;

  var unidades = Math.round(porSemana / 7 * cubre);
  var st = stockEstimado(remitos, compras);
  /* Si queda stock, hace falta comprar menos */
  var aComprar = st && st.confiable ? Math.max(0, unidades - st.unidades) : unidades;

  return {
    monto: Math.round(aComprar * costoProm),
    unidades: aComprar,
    cubreDias: cubre,
    porSemana: Math.round(porSemana),
    costoPromedio: costoProm,
    basadoEn: semanas + ' semanas',
    descontoStock: !!(st && st.confiable && st.unidades > 0),
    stockActual: st && st.confiable ? st.unidades : null
  };
}

/* ═══════════════════════════════════════════════════════════
   PLATA DISPONIBLE
   No es lo mismo lo que hay que lo que se puede sacar.
   ═══════════════════════════════════════════════════════════ */
/* ── Lo que había antes de la app ────────────────────────────
   Sin esto la caja arranca en cero y los gastos pagados con
   plata anterior dejan el saldo en negativo, aunque no falte
   nada. Es el punto de partida, no un ingreso.
   ────────────────────────────────────────────────────────── */
function capitalInicial() {
  return {
    monto: +leerConfig('caja_inicial', 0) || 0,
    fecha: leerConfig('caja_inicial_fecha', '')
  };
}

/* ── Lo que la empresa le debe a alguien ─────────────────────
   Sueldos atrasados, plata que puso un socio, un proveedor.
   No son gastos del período: son deudas que hay que cubrir.
   Formato: "concepto|monto|fecha|quien"
   ────────────────────────────────────────────────────────── */
function deudasPropias() {
  return String(leerConfig('deudas_propias', '')).split(';')
    .map(function (t) { return t.trim(); }).filter(Boolean)
    .map(function (t) {
      var p = t.split('|');
      return {
        concepto: (p[0] || '').trim(),
        monto: +p[1] || 0,
        fecha: (p[2] || '').trim(),          // cuándo hay que pagarla
        quien: (p[3] || '').trim()
      };
    })
    .filter(function (d) { return d.concepto && d.monto > 0; });
}

function guardarDeudasPropias(lista) {
  return guardarConfig('deudas_propias', (lista || [])
    .filter(function (d) { return String(d.concepto || '').trim() && +d.monto > 0; })
    .map(function (d) {
      return String(d.concepto).trim() + '|' + (+d.monto) + '|' +
        (d.fecha || '') + '|' + (d.quien || '');
    }).join('; '));
}

function totalDeudasPropias() {
  return deudasPropias().reduce(function (a, d) { return a + d.monto; }, 0);
}

function disponibleParaRetirar(remitos, gastos, compras) {
  /* Lo cobrado menos lo gastado, desde siempre */
  var todo = { desde: '2000-01-01', hasta: hoyISO(), dias: 99999 };
  var i = ingresos(remitos, todo);
  var e = egresos(gastos, compras, todo);

  /* La caja cuenta solo lo que realmente salió: los gastos fijos
     que la app estima para completar un período no se pagaron,
     así que no pueden descontarse de la plata que hay. */
  var estimado = (e.fijosEstimados || []).reduce(function (a, x) { return a + x.monto; }, 0);
  var salioDeVerdad = e.total - estimado + e.reposicion;

  /* Lo que entró sin ser una venta: capital inicial, aportes,
     devoluciones. Se cargan como movimientos, no en config. */
  var otrosIngresos = totalIngresosSueltos(gastos, todo);

  /* Se mantiene el capital de la configuración por si alguien lo
     había cargado ahí antes de que existieran los movimientos. */
  var inicial = capitalInicial().monto;
  var caja = inicial + otrosIngresos + i.cobrado - salioDeVerdad;

  /* Lo que ya está comprometido */
  var comp = compromisosSemana(true);
  var repo = reposicionEstimada(remitos, compras);
  var sinPagar = (gastos || []).filter(function (g) { return !gastoPagado(g); })
    .reduce(function (a, g) { return a + montoEmpresa(g); }, 0);
  var propias = totalDeudasPropias();

  var reservaPct = +leerConfig('reserva_seguridad', '15') || 0;
  var mes = rangoDe('mes');
  var gastoMensual = egresos(gastos, compras, mes).total;
  var reserva = Math.round(gastoMensual * reservaPct / 100);

  var reservado = (comp.total || 0) + (repo ? repo.monto : 0) + sinPagar + propias + reserva;

  return {
    caja: caja,
    inicial: inicial,
    otrosIngresos: otrosIngresos,
    cobrado: i.cobrado,
    gastado: salioDeVerdad,
    compromisos: comp.total || 0,
    reposicion: repo ? repo.monto : 0,
    sinPagar: sinPagar,
    deudasPropias: propias,
    reserva: reserva,
    reservaPct: reservaPct,
    reservado: reservado,
    disponible: caja - reservado,
    deudaPorCobrar: i.pendiente
  };
}

/* ═══════════════════════════════════════════════════════════
   COMPARAR CON EL PERÍODO ANTERIOR
   ═══════════════════════════════════════════════════════════ */
function variacion(actual, anterior) {
  if (!anterior) return null;                       // sin base no hay porcentaje
  return Math.round((actual / anterior - 1) * 1000) / 10;
}

function conVariacion(remitos, gastos, compras, r) {
  var ant = rangoAnterior(r);
  var a = rentabilidad(remitos, gastos, compras, r);
  var b = rentabilidad(remitos, gastos, compras, ant);
  var ia = a.detalle.ingresos, ib = b.detalle.ingresos;

  return {
    actual: a, anterior: b, rangoAnterior: ant,
    var: {
      facturado: variacion(ia.facturado, ib.facturado),
      neta: variacion(a.neta, b.neta),
      unidades: variacion(ia.unidades, ib.unidades),
      ticket: variacion(ia.ticket, ib.ticket),
      fijos: variacion(a.gastosFijos, b.gastosFijos),
      variables: variacion(a.gastosVariables, b.gastosVariables),
      reposicion: variacion(a.detalle.egresos.reposicion, b.detalle.egresos.reposicion),
      margen: (a.margenNeto !== null && b.margenNeto !== null)
        ? Math.round((a.margenNeto - b.margenNeto) * 10) / 10 : null
    }
  };
}

/* ═══════════════════════════════════════════════════════════
   EVOLUCIÓN
   La serie por semana o por mes, para ver la tendencia.
   ═══════════════════════════════════════════════════════════ */
function serie(remitos, gastos, compras, cuantos, paso) {
  var puntos = [];
  var dias = paso === 'mes' ? 30 : 7;

  for (var i = cuantos - 1; i >= 0; i--) {
    var hasta = isoDe(sumarDias(-i * dias));
    var desde = isoDe(sumarDias(-(i * dias + dias - 1)));
    var r = { desde: desde, hasta: hasta, dias: dias };
    var rent = rentabilidad(remitos, gastos, compras, r);
    puntos.push({
      desde: desde, hasta: hasta,
      etiqueta: fechaCorta(hasta),
      facturado: rent.facturado,
      neta: rent.neta,
      unidades: rent.detalle.ingresos.unidades,
      operaciones: rent.detalle.ingresos.operaciones,
      gastos: rent.gastosFijos + rent.gastosVariables
    });
  }
  return puntos;
}

/* ═══════════════════════════════════════════════════════════
   PROYECCIÓN
   Con el promedio de las últimas semanas, no con la última:
   una semana excepcional no debería mover la estimación.
   ═══════════════════════════════════════════════════════════ */
function proyeccion(remitos, gastos, compras) {
  var semanas = +leerConfig('semanas_proyeccion', '8') || 8;
  var s = serie(remitos, gastos, compras, semanas, 'semana');
  var conVentas = s.filter(function (p) { return p.facturado > 0; });

  if (conVentas.length < 3) return null;   // menos de 3 semanas no alcanza

  var prom = function (campo) {
    return conVentas.reduce(function (a, p) { return a + p[campo]; }, 0) / conVentas.length;
  };

  /* La tendencia: primera mitad contra segunda */
  var mitad = Math.floor(conVentas.length / 2);
  var vieja = conVentas.slice(0, mitad).reduce(function (a, p) { return a + p.facturado; }, 0) / (mitad || 1);
  var nueva = conVentas.slice(mitad).reduce(function (a, p) { return a + p.facturado; }, 0) /
              (conVentas.length - mitad);

  return {
    semanas: conVentas.length,
    facturado: Math.round(prom('facturado') * 4.3),
    unidades: Math.round(prom('unidades') * 4.3),
    gastos: Math.round(prom('gastos') * 4.3),
    neta: Math.round(prom('neta') * 4.3),
    tendencia: vieja ? Math.round((nueva / vieja - 1) * 1000) / 10 : null,
    reposicion: reposicionEstimada(remitos, compras)
  };
}

/* ═══════════════════════════════════════════════════════════
   SALUD FINANCIERA
   Un número de 0 a 100 que se puede explicar: cada factor suma
   o resta y la pantalla muestra cuáles pesaron.
   ═══════════════════════════════════════════════════════════ */
function saludFinanciera(remitos, gastos, compras) {
  var mes = rangoDe('mes');
  var c = conVariacion(remitos, gastos, compras, mes);
  var a = c.actual;

  /* Sin ventas en el período no se puntúa nada: los sueldos
     configurados alcanzarían para dar una nota pésima aunque el
     negocio recién arranque, y eso no informa. */
  if (!a.facturado) return null;
  var factores = [];
  var puntos = 0, maximo = 0;

  function medir(nombre, valor, escala, ayuda) {
    if (valor === null || valor === undefined) return;   // sin datos, no puntúa
    maximo += escala;
    var gana = Math.max(0, Math.min(escala, valor));
    puntos += gana;
    factores.push({
      nombre: nombre, puntos: Math.round(gana), sobre: escala,
      bueno: gana >= escala * 0.6, ayuda: ayuda
    });
  }

  /* Margen neto: 25% o más es muy bueno */
  if (a.margenNeto !== null) {
    medir('Margen neto', a.margenNeto / 25 * 25, 25,
      'Está en ' + a.margenNeto + '%. Desde 25% se considera saludable.');
  }

  /* Crecimiento de la facturación */
  if (c.var.facturado !== null) {
    medir('Crecimiento de ventas', (c.var.facturado + 10) / 30 * 20, 20,
      c.var.facturado >= 0
        ? 'La facturación subió ' + c.var.facturado + '% contra el período anterior.'
        : 'La facturación bajó ' + Math.abs(c.var.facturado) + '%.');
  }

  /* Que la caja alcance para los compromisos */
  var disp = disponibleParaRetirar(remitos, gastos, compras);
  if (disp.reservado > 0) {
    medir('Caja contra compromisos', disp.caja / disp.reservado * 20, 20,
      disp.disponible >= 0
        ? 'Queda ' + plata(disp.disponible) + ' libre después de cubrir todo.'
        : 'Faltan ' + plata(-disp.disponible) + ' para cubrir lo comprometido.');
  }

  /* Punto de equilibrio */
  var pe = puntoDeEquilibrio(remitos, gastos, compras, mes);
  if (pe && !pe.imposible) {
    medir('Punto de equilibrio', (pe.porcentaje + 20) / 70 * 15, 15,
      pe.alcanzado
        ? 'Estás ' + pe.porcentaje + '% por encima del punto de equilibrio.'
        : 'Falta ' + plata(-pe.diferencia) + ' para llegar al punto de equilibrio.');
  }

  /* Que la deuda por cobrar no sea desproporcionada */
  if (a.facturado > 0) {
    var pesoDeuda = disp.deudaPorCobrar / a.facturado * 100;
    medir('Cobranza', (25 - pesoDeuda) / 25 * 10, 10,
      'La deuda sin cobrar equivale al ' + Math.round(pesoDeuda) + '% de lo facturado en el mes.');
  }

  /* Capital dormido en stock */
  var st = stockEstimado(remitos, compras);
  if (st && st.confiable && st.valor && a.facturado > 0) {
    var pesoStock = st.valor / a.facturado * 100;
    medir('Capital en stock', (150 - pesoStock) / 150 * 10, 10,
      'Hay ' + plata(st.valor) + ' inmovilizados en mercadería.');
  }

  if (!maximo) return null;   // sin datos suficientes no se puntúa

  var nota = Math.round(puntos / maximo * 100);
  return {
    nota: nota,
    estado: nota >= 80 ? 'Muy bien' : nota >= 60 ? 'Bien' : nota >= 40 ? 'Para mirar' : 'Preocupante',
    color: nota >= 80 ? 'var(--ok)' : nota >= 60 ? 'var(--info)' : nota >= 40 ? 'var(--warn)' : 'var(--danger)',
    factores: factores.sort(function (x, y) { return (x.puntos / x.sobre) - (y.puntos / y.sobre); }),
    aFavor: factores.filter(function (f) { return f.bueno; }),
    enContra: factores.filter(function (f) { return !f.bueno; })
  };
}

/* ═══════════════════════════════════════════════════════════
   ALERTAS
   Solo cuando el cambio es grande de verdad: si avisa de todo,
   se deja de mirar.
   ═══════════════════════════════════════════════════════════ */
function alertasFinancieras(remitos, gastos, compras) {
  var mes = rangoDe('mes');
  var c = conVariacion(remitos, gastos, compras, mes);
  var av = [];

  /* Sin movimiento no hay nada que avisar */
  if (!c.actual.facturado && !c.anterior.facturado) return av;

  var agregar = function (nivel, texto) { av.push({ nivel: nivel, texto: texto }); };

  if (c.var.margen !== null && c.var.margen <= -5) {
    agregar('mal', 'El margen neto cayó de ' + c.anterior.margenNeto + '% a ' + c.actual.margenNeto + '%.');
  }
  if (c.var.variables !== null && c.var.variables >= 25) {
    agregar('mal', 'Los gastos variables aumentaron ' + c.var.variables + '% contra el período anterior.');
  }
  if (c.var.reposicion !== null && c.var.facturado !== null &&
      c.var.reposicion > c.var.facturado + 20) {
    agregar('mal', 'El gasto en reposición crece más rápido que las ventas: ' +
      c.var.reposicion + '% contra ' + c.var.facturado + '%.');
  }
  if (c.var.unidades !== null && c.var.ticket !== null &&
      c.var.unidades >= 10 && c.var.ticket <= -5) {
    agregar('mirar', 'Se vendieron ' + c.var.unidades + '% más unidades, pero el ticket promedio cayó ' +
      Math.abs(c.var.ticket) + '%.');
  }
  if (c.var.facturado !== null && c.var.facturado >= 20) {
    agregar('bien', 'La facturación subió ' + c.var.facturado + '% contra el período anterior.');
  }

  var disp = disponibleParaRetirar(remitos, gastos, compras);
  if (disp.disponible < 0) {
    agregar('mal', 'Lo comprometido supera la caja en ' + plata(-disp.disponible) + '.');
  }

  var repo = reposicionEstimada(remitos, compras);
  if (repo && repo.monto > 0) {
    agregar('mirar', 'Al ritmo actual, la próxima reposición necesitaría unos ' + plata(repo.monto) + '.');
  }

  var st = stockEstimado(remitos, compras);
  if (st && !st.confiable) {
    agregar('mirar', 'Se vendieron más unidades de las compradas: faltan compras por cargar.');
  }

  return av;
}

/* ═══════════════════════════════════════════════════════════
   LOS GASTOS FIJOS DE LA SEMANA
   Los viernes se ofrece anotarlos, pero nunca se anotan solos:
   un gasto que aparece sin que nadie lo confirme es un número
   en el que después no se confía. Se pregunta cuáles se pagaron
   y los que no quedan pendientes.
   ═══════════════════════════════════════════════════════════ */

var DIA_CIERRE_FIJOS = 5;   // viernes

/* ¿Ya se preguntó esta semana? Se anota el lunes de la semana
   para que valga aunque se conteste en otro día. */
function lunesDeLaSemana(iso) {
  var d = fechaDeIso(iso || hoyISO());
  var dia = d.getUTCDay();
  var atras = dia === 0 ? 6 : dia - 1;
  d.setUTCDate(d.getUTCDate() - atras);
  return isoDe(d);
}

function semanasFijosCerradas() {
  return String(leerConfig('fijos_cerrados', '')).split(',')
    .map(function (x) { return x.trim(); }).filter(Boolean);
}

function fijosYaPreguntados(iso) {
  return semanasFijosCerradas().indexOf(lunesDeLaSemana(iso)) !== -1;
}

async function marcarFijosPreguntados(iso) {
  var l = semanasFijosCerradas();
  var semana = lunesDeLaSemana(iso);
  if (l.indexOf(semana) === -1) l.push(semana);
  /* Se guardan las últimas 12 semanas: alcanza y no crece */
  await guardarConfig('fijos_cerrados', l.slice(-12).join(','));
}

/* ── Qué toca pagar ahora ────────────────────────────────────
   Cada gasto se ofrece por su monto completo cuando le toca, no
   prorrateado: el monotributo se paga entero una vez al mes, no
   una cuarta parte cada viernes.
   ────────────────────────────────────────────────────────── */
function periodoDeLaFrecuencia(frecuencia, iso) {
  var hasta = iso || hoyISO();
  if (frecuencia === 'semanal') {
    return { desde: lunesDeLaSemana(hasta), hasta: hasta, etiqueta: 'esta semana' };
  }
  if (frecuencia === 'anual') {
    return { desde: hasta.slice(0, 4) + '-01-01', hasta: hasta, etiqueta: 'este año' };
  }
  if (frecuencia === 'bimestral') {
    var d = fechaDeIso(hasta);
    d.setUTCMonth(d.getUTCMonth() - 1, 1);
    return { desde: isoDe(d), hasta: hasta, etiqueta: 'en estos dos meses' };
  }
  return { desde: hasta.slice(0, 7) + '-01', hasta: hasta, etiqueta: 'este mes' };
}

/* Lo que hay que anotar, con lo ya cargado marcado para no
   duplicar. Incluye los monotributos, que van aparte. */
function fijosPendientes(gastos, iso) {
  var hoy = iso || hoyISO();

  var lista = gastosFijosConfig().map(function (f) {
    return { nombre: f.nombre, monto: f.monto, frecuencia: f.frecuencia };
  });

  /* Los monotributos: uno por socio, mensuales */
  monotributos().forEach(function (m) {
    if (m.monto > 0) {
      lista.push({
        nombre: 'Monotributo ' + m.socio,
        monto: m.monto,
        frecuencia: 'mensual',
        socio: m.socio
      });
    }
  });

  return lista.map(function (f) {
    var r = periodoDeLaFrecuencia(f.frecuencia, hoy);
    var yaAnotado = (gastos || []).find(function (g) {
      return enRangoFecha(g, r) &&
             normalizar(g.descripcion).indexOf(normalizar(f.nombre)) !== -1;
    });
    return Object.assign({}, f, {
      cada: r.etiqueta,
      yaAnotado: !!yaAnotado,
      gasto: yaAnotado || null
    });
  });
}

/* Se mantiene el nombre viejo para no romper nada */
function fijosDeLaSemana(gastos, iso) { return fijosPendientes(gastos, iso); }

/* ¿Toca preguntar hoy? */
function tocaPreguntarFijos(gastos) {
  var d = fechaDeIso(hoyISO()).getUTCDay();
  /* Viernes o después, para que no se pierda si no se abre el viernes */
  if (d !== DIA_CIERRE_FIJOS && d !== 6 && d !== 0) return false;
  if (fijosYaPreguntados()) return false;
  return fijosPendientes(gastos).some(function (f) { return !f.yaAnotado; });
}

/* ═══════════════════════════════════════════════════════════
   LO QUE HAY QUE JUNTAR PARA EL MES
   Monotributos, gastos fijos y deudas propias, con su fecha de
   vencimiento. Sirve para saber cuánto apartar y para cuándo.
   ═══════════════════════════════════════════════════════════ */

/* El día del mes en que se pagan los impuestos y las deudas */
function diaDePago() {
  var d = +leerConfig('dia_pago_mes', 15) || 15;
  return Math.max(1, Math.min(28, d));
}

/* La próxima fecha de vencimiento, en ISO */
function proximoVencimiento(iso) {
  var hoy = iso || hoyISO();
  var dia = diaDePago();
  var d = fechaDeIso(hoy);

  /* Si ya pasó el día de este mes, es el del mes que viene */
  if (d.getUTCDate() > dia) d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(dia);
  return isoDe(d);
}

/* Todo lo que vence este mes, pagado y sin pagar */
function aPagarEsteMes(gastos) {
  var hoy = hoyISO();
  var vence = proximoVencimiento(hoy);
  var items = [];

  /* Los monotributos */
  fijosPendientes(gastos, hoy).forEach(function (f) {
    items.push({
      concepto: f.nombre,
      monto: f.monto,
      pagado: f.yaAnotado,
      vence: vence,
      tipo: f.socio ? 'monotributo' : 'fijo'
    });
  });

  /* Y lo que le debemos a alguien */
  deudasPropias().forEach(function (d) {
    items.push({
      concepto: d.concepto,
      monto: d.monto,
      pagado: false,
      vence: d.fecha || vence,
      quien: d.quien,
      tipo: 'deuda'
    });
  });

  var falta = items.filter(function (x) { return !x.pagado; });
  var dias = diasEntre(hoy, vence);

  return {
    items: items.sort(function (a, b) { return (a.vence || '').localeCompare(b.vence || ''); }),
    falta: falta,
    total: items.reduce(function (a, x) { return a + x.monto; }, 0),
    pendiente: falta.reduce(function (a, x) { return a + x.monto; }, 0),
    pagado: items.filter(function (x) { return x.pagado; })
      .reduce(function (a, x) { return a + x.monto; }, 0),
    vence: vence,
    diasParaVencer: dias
  };
}

/* ═══════════════════════════════════════════════════════════
   LO QUE ENTRÓ A CADA ALIAS
   Sirve para dos cosas: ver si el reparto entre los socios está
   parejo, y cruzar contra el resumen del banco.
   ═══════════════════════════════════════════════════════════ */
function ingresosPorAlias(remitos, r) {
  var lista = aliasConfigurados();
  var detalle = {};

  lista.forEach(function (a) {
    detalle[a] = { alias: a, titular: titularDeAlias(a), cobrado: 0, pendiente: 0, operaciones: 0, remitos: [] };
  });

  /* Un alias que aparece en un remito pero ya no está configurado
     igual se muestra: la plata entró. */
  var caja = function (alias) {
    var conocido = lista.find(function (a) { return mismoAlias(a, alias); });
    var clave = conocido || alias;
    if (!detalle[clave]) {
      detalle[clave] = { alias: clave, titular: titularDeAlias(clave), cobrado: 0,
                         pendiente: 0, operaciones: 0, remitos: [], viejo: true };
    }
    return detalle[clave];
  };

  (remitos || [])
    .filter(function (x) { return x.motivo !== 'cerrado' && (!r || enRangoFecha(x, r)); })
    .forEach(function (x) {
      var yaContado = false;
      partesPago(x).forEach(function (p) {
        var m = +p.monto || 0;
        if (!m || !p.alias) return;

        if (p.tipo === 'transferencia') {
          var d = caja(p.alias);
          d.cobrado += m;
          if (!yaContado) { d.operaciones++; d.remitos.push(x); yaContado = true; }
        } else if (p.tipo === 'deuda' && !p.era_deuda && !bool(x.saldado)) {
          /* Todavía no entró, pero está pedida a ese alias */
          caja(p.alias).pendiente += m;
        }
      });
    });

  var arr = Object.keys(detalle).map(function (k) { return detalle[k]; })
    .filter(function (d) { return d.cobrado || d.pendiente || !d.viejo; });

  var total = arr.reduce(function (a, d) { return a + d.cobrado; }, 0);
  arr.forEach(function (d) {
    d.porcentaje = total ? Math.round(d.cobrado / total * 1000) / 10 : 0;
  });
  arr.sort(function (a, b) { return b.cobrado - a.cobrado; });

  /* Cuánto se aparta del reparto parejo: con dos alias, lo justo
     sería 50 y 50. */
  var parejo = arr.length ? 100 / arr.length : 0;
  var desvio = arr.length && total
    ? Math.round(Math.max.apply(null, arr.map(function (d) { return Math.abs(d.porcentaje - parejo); })) * 10) / 10
    : 0;

  return { alias: arr, total: total, parejo: Math.round(parejo * 10) / 10, desvio: desvio };
}
