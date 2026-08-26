/* ═══════════════════════════════════════════════════════════
   GASTOS — lo que sale, de dónde salió la plata y cuánto de
   eso te tiene que devolver la empresa.
   ═══════════════════════════════════════════════════════════ */

var _gastos = [];
var G = { periodo: 'semana', desde: '', hasta: '', categoria: '' };

registrarPagina({
  id: 'gastos',
  menu: 'Gastos',
  grupo: 'Plata',
  icono: 'wallet',
  titulo: 'Gastos',
  subtitulo: 'Lo que sale y quién lo puso',

  async montar(cont) {
    await cargarConfig().catch(function () {});
    _gastos = (await traerCacheado('gastos')).slice().reverse();

    /* Si el período por defecto no tiene gastos pero sí los hay en
       el último año (típico al importar historial viejo), se abre
       mostrando el año así no queda la pantalla vacía. */
    try {
      var hayEn = function (modo) {
        var r = rangoDe(modo);
        return _gastos.some(function (g) {
          if (esIngreso(g)) return false;
          var k = claveFecha(g.fecha || g.created_at);
          return k && k >= r.desde && k <= r.hasta;
        });
      };
      if (!hayEn(G.periodo) && hayEn('anio')) G.periodo = 'anio';
    } catch (e) {}

    cont.innerHTML =
      /* De arriba abajo, por lo que se mira más seguido:
         cómo venimos, en qué se fue, con qué cargar, y recién
         después el detalle. */
      '<div id="g-avisos"></div>' +
      '<div id="g-cierre"></div>' +

      /* Selector de período SIEMPRE visible: antes vivía dentro de
         "Todos los gastos", que no se dibuja cuando el período está
         vacío, y entonces no había forma de cambiar el rango. */
      '<div class="tarjeta" style="margin:12px 0"><div class="tarjeta-cuerpo" style="padding:12px 14px">' +
        '<div class="campo-etiq" style="margin:0 0 8px">Período</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap" id="g-chips-top"></div>' +
        '<div id="g-rango-top"></div>' +
      '</div></div>' +

      '<div id="g-resumen"></div>' +
      '<div class="atajos" style="margin:14px 0">' + botonesRapidos() + '</div>' +

      '<div id="g-pagar"></div>' +
      '<div id="g-cuentas"></div>' +
      '<div id="g-ingresos"></div>' +

      /* El período vive adentro de la lista completa: es lo único
         que lo usa, y arriba distraía. */
      '<div id="g-todos"></div>';

    pintarGastos();
  }
});

/* El selector de período. Se dibuja en el de arriba (siempre visible)
   y también en el de abajo, dentro de "Todos los gastos", si existe. */
function pintarPeriodo() {
  var chipsHTML = [['hoy', 'Hoy'], ['semana', '7 días'], ['mes', '30 días'],
                   ['trimestre', '3 meses'], ['anio', 'Año'], ['rango', 'Elegir']]
    .map(function (o) {
      return '<button class="btn ' + (G.periodo === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
        'style="padding:6px 13px;font-size:12.5px" onclick="setPeriodoGasto(\'' + o[0] + '\')">' +
        o[1] + '</button>';
    }).join('');

  var rangoHTML = G.periodo === 'rango'
    ? '<div class="grilla-fechas" style="margin-top:8px">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Desde</div>' +
          '<input class="campo-input" type="date" value="' + esc(G.desde) + '" onchange="setFechaGasto(\'desde\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Hasta</div>' +
          '<input class="campo-input" type="date" value="' + esc(G.hasta) + '" onchange="setFechaGasto(\'hasta\',this.value)"/></div>' +
      '</div>'
    : '';

  ['g-chips-top', 'g-chips'].forEach(function (id) {
    var el = porId(id); if (el) el.innerHTML = chipsHTML;
  });
  ['g-rango-top', 'g-rango'].forEach(function (id) {
    var el = porId(id); if (el) el.innerHTML = rangoHTML;
  });
}

/* ── Botones rápidos ─────────────────────────────────────────
   Los gastos que se repiten siempre iguales: un toque y queda
   el formulario prellenado, listo para ajustar el monto.
   ────────────────────────────────────────────────────────── */
function botonesRapidos() {
  var e = empleadoConfig();
  var sueldos = sueldosSocios();
  var deuda = +leerConfig('monto_deuda', 0) || 0;

  var botones = [
    '<button class="atajo atajo-grad" onclick="nuevoGasto()">' + ic('plus', 17) + '<span>Cargar gasto</span></button>',
    '<button class="atajo atajo-verde" onclick="nuevoIngreso()">' + ic('cash', 17) +
      '<span>Entró plata</span></button>',
    '<button class="atajo atajo-rojo" onclick="nuevaDeuda()">' + ic('alert', 17) +
      '<span>Quedó debiendo</span></button>',
    '<button class="atajo atajo-neutro" onclick="gastoNafta()">' + ic('fuel', 17) + '<span>Nafta Etios</span></button>'
  ];

  if (e.sueldo) {
    botones.push('<button class="atajo atajo-neutro" onclick="pagarSueldo()">' + ic('user', 17) +
      '<span>Sueldo' + (e.nombre ? ' ' + esc(e.nombre) : ' empleado') + '</span></button>');
  }

  socios().forEach(function (s2) {
    botones.push('<button class="atajo atajo-neutro" onclick="sueldoSocio(\'' + esc(s2).replace(/'/g, "\\'") + '\')">' +
      ic('wallet', 17) + '<span>Sueldo ' + esc(s2) + '</span></button>');
  });

  /* El monotributo de cada socio, siempre presente. El monto sale
     de Configuraciones; si todavía no se cargó, el botón lo pide. */
  monotributos().forEach(function (m) {
    botones.push('<button class="atajo atajo-neutro" onclick="gastoMonotributo(\'' +
      esc(m.socio).replace(/'/g, "\\'") + '\')">' + ic('file', 17) +
      '<span>Monotributo ' + esc(m.socio) +
      (m.monto ? ' · ' + plata(m.monto) : '') + '</span></button>');
  });

  /* Y los demás gastos fijos que estén configurados */
  gastosFijosConfig().forEach(function (f) {
    botones.push('<button class="atajo atajo-neutro" onclick="gastoFijoRapido(\'' +
      esc(f.nombre).replace(/'/g, "\\'") + '\')">' + ic('file', 17) +
      '<span>' + esc(f.nombre) + (f.monto ? ' · ' + plata(f.monto) : '') + '</span></button>');
  });

  /* El pago de la deuda del mes, solo si hay un monto cargado */
  if (deuda) {
    botones.push('<button class="atajo atajo-neutro" onclick="gastoDeuda()">' + ic('clock', 17) +
      '<span>Pagar deuda · ' + plata(deuda) + '</span></button>');
  }

  return botones.join('');
}

/* Las plantillas viven en dominio.js: acá solo se abren */
function desdePlantilla(tipo, nombre) {
  var p = plantillaGasto(tipo, nombre);
  nuevoGasto({
    descripcion: p.descripcion,
    monto: p.monto,
    categoria: p.categoria,
    pagadoPor: p.pagadoPor,
    modo: p.modo,
    socio: p.socio || socios()[socios().length - 1] || ''
  });
}

function gastoNafta()        { desdePlantilla('combustible'); }
function pagarSueldo()       { desdePlantilla('sueldo_empleado'); }
function sueldoSocio(nombre) { desdePlantilla('sueldo_socio', nombre); }
function gastoDeuda()        { desdePlantilla('deuda'); }

/* El monotributo de un socio, con el monto de Configuraciones */
function gastoMonotributo(socio) {
  var m = monotributos().find(function (x) { return x.socio === socio; });

  if (!m || !m.monto) {
    abrirModal('Monotributo de ' + socio,
      avisoHTML('warn', 'Todavía no cargaste de cuánto es. Se pone una vez y queda.', 'alert') +
      '<div class="campo" style="margin-top:12px"><div class="campo-etiq">Cuánto paga por mes</div>' +
        inputMonto('mono-rapido', '') + '</div>',
      '<button class="btn btn-primario btn-bloque" onclick="guardarMonotributoRapido(\'' +
        esc(socio).replace(/'/g, "\\'") + '\')">Guardar y anotar el pago</button>');
    return;
  }

  nuevoGasto({
    descripcion: 'Monotributo ' + socio,
    monto: m.monto,
    categoria: 'impuestos',
    pagadoPor: 'empresa',
    modo: 'empresa'
  });
}

async function guardarMonotributoRapido(socio) {
  var monto = leerMonto('mono-rapido');
  if (!monto) { toast('Falta el monto', 'error'); return; }
  try {
    var lista = monotributos().map(function (m) {
      return m.socio === socio ? { socio: m.socio, monto: monto } : m;
    });
    await guardarMonotributos(lista);
    cerrarModal();
    gastoMonotributo(socio);
  } catch (e) { toast(e.message, 'error'); }
}

/* Un gasto fijo de los configurados, con el monto ya puesto */
function gastoFijoRapido(nombre) {
  var f = gastosFijosConfig().find(function (x) { return x.nombre === nombre; });
  if (!f) { toast('Ese gasto fijo ya no está configurado', 'error'); return; }

  nuevoGasto({
    descripcion: f.nombre,
    monto: f.monto,
    categoria: categoriaDeGastoFijo(f.nombre),
    pagadoPor: 'empresa',
    modo: 'empresa'
  });
}

/* Se adivina la categoría por el nombre, para no pedirla cada vez */
function categoriaDeGastoFijo(nombre) {
  var n = normalizar(nombre);
  if (/monotributo|afip|ingresos brutos|impuesto|arca/.test(n)) return 'impuestos';
  if (/sueldo|jornal/.test(n)) return 'empleado';
  if (/alquiler|luz|gas|agua|internet|telefono|servicio/.test(n)) return 'otro';
  return 'otro';
}

/* ── Período ─────────────────────────────────────────────── */
/* Los mismos períodos que en Números, calculados por la misma
   función: si cada pantalla hiciera su cuenta, los totales
   podrían no coincidir. */
function rangoGastos() {
  if (G.periodo === 'rango' && !(G.desde && G.hasta)) {
    /* Rango a medio completar: se muestra todo en vez de nada */
    return {
      desde: G.desde || '0000-00-00',
      hasta: G.hasta || '9999-99-99',
      dias: 9999,
      etiqueta: (G.desde ? fechaCorta(G.desde) : 'el principio') + ' a ' +
                (G.hasta ? fechaCorta(G.hasta) : 'hoy')
    };
  }
  return rangoDe(G.periodo, G.desde, G.hasta);
}

function setPeriodoGasto(p) {
  G.periodo = p;
  var abierto = porId('det-todos') && porId('det-todos').open;
  pintarGastos();
  if (abierto) { var d = porId('det-todos'); if (d) { d.open = true; pintarListaTodos(); } }
}
function setFechaGasto(cual, v) { G[cual] = v; G.periodo = 'rango'; pintarGastos(); }
function setCategoriaGasto(c) { G.categoria = c; pintarGastos(); }

function gastosFiltrados() {
  var r = rangoGastos();
  return _gastos.filter(function (g) {
    /* Los ingresos comparten tabla con los gastos pero no son
       gastos: tienen su propia tarjeta y no suman acá. */
    if (esIngreso(g)) return false;
    if (G.categoria && (g.categoria || 'otro') !== G.categoria) return false;
    var k = claveFecha(g.fecha || g.created_at);
    return k && k >= r.desde && k <= r.hasta;
  });
}

/* ── Pintado ─────────────────────────────────────────────── */
function pintarGastos() {
  pintarFijosDeLaSemana();
  pintarAPagar();
  pintarIngresosSueltos();

  /* La lista completa crea los contenedores del período, así que
     va antes de pintarlos. */
  pintarTodosLosGastos();
  pintarPeriodo();

  var lista = gastosFiltrados();
  /* Lo que sale de la caja de la empresa. Un gasto que ponen los
     dueños de su bolsillo no es plata de la empresa. */
  var total = lista.reduce(function (s, g) { return s + montoEmpresa(g); }, 0);
  var deSocios = lista.reduce(function (s, g) { return s + montoDeSocios(g); }, 0);
  var r = rangoGastos();

  pintarCierre(lista, r);
  pintarCuentas(lista, r);


  var porCat = {};
  lista.forEach(function (g) {
    var c = g.categoria || 'otro';
    porCat[c] = (porCat[c] || 0) + montoEmpresa(g);
  });

  /* Una tarjeta por grupo, todas tocables: al abrirlas se ve el
     detalle con los mismos botones que tenía el desplegable. */
  var grupos = {};
  lista.forEach(function (g) { (grupos[grupoDe(g)] = grupos[grupoDe(g)] || []).push(g); });

  porId('g-resumen').innerHTML =
    '<div class="grilla-stats" style="margin-top:12px">' +
      stat('wallet', 'Paga la empresa', plata(total), plural(lista.length, 'gasto'), 'var(--danger)',
           "detalleGastos('empresa')") +
      (deSocios > 0
        ? stat('users', 'Ponen los dueños', plata(deSocios), resumenPorSocio(lista), 'var(--violet)',
               "detalleGastos('socios')")
        : '') +
      GRUPOS.filter(function (gr) { return grupos[gr.id]; }).map(function (gr) {
        var items = grupos[gr.id];
        return stat(gr.icono, gr.etiqueta,
          plata(items.reduce(function (a, g) { return a + montoEmpresa(g); }, 0)),
          plural(items.length, 'gasto'), 'var(--text2)',
          "detalleGrupo('" + gr.id + "')");
      }).join('') +
    '</div>' +
    (lista.length ? '' :
      '<div class="tarjeta" style="margin-top:12px"><div class="tarjeta-cuerpo">' +
      vacio('wallet', 'Sin gastos en este período', 'Cambiá el período arriba o cargá el primero.') +
      (_gastos.some(function (g) { return !esIngreso(g); }) && G.periodo !== 'anio'
        ? '<div style="text-align:center;margin-top:4px">' +
          '<button class="btn btn-secundario" onclick="setPeriodoGasto(\'anio\')">Ver el último año</button></div>'
        : '') +
      '</div></div>');

  /* La lista ya no va suelta: cada tarjeta de arriba la abre */
}

function filaGasto(g) {
  var cat = categoriaGasto(g.categoria);
  var partes = partesGasto(g).filter(function (p) { return +p.monto > 0; });
  /* Si lo pusieron entre varios, se muestra el saldo del que más puso */
  var puestos = puestoPorCadaUno(g);
  var quienMas = Object.keys(puestos).filter(function (k) { return k !== 'empresa'; })
    .sort(function (a, b) { return puestos[b] - puestos[a]; })[0];
  var saldo = quienMas ? saldoDeGasto(g, quienMas) : 0;

  return '<div class="fila" style="align-items:flex-start">' +
    '<button class="fila-principal" style="background:none;border:none;text-align:left;' +
            'padding:0;cursor:pointer;min-width:0" onclick="editarGasto(' + g.id + ')">' +
      '<div class="fila-titulo">' + esc(g.descripcion || '—') + '</div>' +
      '<div class="fila-sub">' +
        esc(fechaCorta(g.fecha)) + ' · ' + esc(cat.etiqueta) +
        (partes.length
          ? ' · ' + partes.map(function (p) {
              return (TIPOS_PAGO[p.tipo] || {}).corta || p.tipo;
            }).join(' + ')
          : '') +
        (g.notas ? '<br>' + esc(g.notas) : '') +
      '</div>' +
      '<div style="margin-top:4px">' +
        (!gastoPagado(g)
          ? '<span class="pin pin-danger">' + ic('clock', 12) + ' pago pendiente</span> '
          : '') +
        (g.pagado_por
          ? '<span class="pin pin-neutro">' + esc(verboPuso(g.pagado_por)) + ' ' +
            esc(nombreDePagador(g.pagado_por)) + '</span>'
          : '') +
        (saldo > 0 ? ' <span class="pin pin-ok">le deben ' + plata(saldo) + ' a ' + esc(quienMas) + '</span>' : '') +
      '</div>' +
    '</button>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(g.monto) + '</div>' +
      (!gastoPagado(g)
        ? '<button class="btn btn-primario" style="padding:4px 10px;font-size:11px;margin-top:4px" ' +
          'onclick="abrirPago(' + g.id + ')">' + ic('cash', 13) + ' Pagar</button>'
        : '') +
      '<div style="display:flex;gap:4px;justify-content:flex-end;margin-top:2px">' +
        '<button class="btn btn-fantasma" style="padding:2px 6px" aria-label="Editar" onclick="editarGasto(' + g.id + ')">' +
          ic('edit', 14) + '</button>' +
        '<button class="btn btn-fantasma" style="padding:2px 6px" aria-label="Borrar" onclick="borrarGasto(' + g.id + ')">' +
          ic('trash', 14) + '</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* Los gastos se agrupan por lo que son: sueldos de los dueños,
   sueldo del empleado, combustible, deuda y el resto. */
function grupoDe(g) {
  var desc = normalizar(g.descripcion);
  var nombres = socios().map(normalizar);

  if (g.categoria === 'deuda') return 'deuda';
  if (g.categoria === 'insumos' || g.compra_id) return 'insumos';
  if (g.categoria === 'combustible') return 'combustible';
  /* Los monotributos tienen su tarjeta: antes caían en "otros"
     y no se veían por separado. */
  if (g.categoria === 'impuestos' || /monotributo|afip|arca|ingresos brutos/.test(desc)) {
    return 'impuestos';
  }
  if (g.categoria === 'empleado') {
    var esDueno = nombres.some(function (n) { return desc.indexOf(n) !== -1; });
    return esDueno ? 'duenos' : 'empleado';
  }
  return 'otros';
}

var GRUPOS = [
  { id: 'duenos',      etiqueta: 'Sueldos de los dueños', icono: 'wallet' },
  { id: 'empleado',    etiqueta: 'Sueldo del empleado',   icono: 'user' },
  { id: 'impuestos',   etiqueta: 'Monotributos e impuestos', icono: 'file' },
  { id: 'combustible', etiqueta: 'Combustible',           icono: 'fuel' },
  { id: 'deuda',       etiqueta: 'Deuda',                 icono: 'clock' },
  { id: 'insumos',     etiqueta: 'Insumos y pedidos',     icono: 'box' },
  { id: 'otros',       etiqueta: 'Otros gastos',          icono: 'tag' }
];

async function borrarGasto(id) {
  try {
    await borrar('gastos', id);
    invalidarCache('gastos');
    toast('Gasto borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ═══════════════════════════════════════════════════════════
   CARGAR UN GASTO
   Tres cosas además del monto: de qué es, con qué se pagó y
   quién puso la plata. Lo tercero es lo que después arma el
   balance de fin de semana.
   ═══════════════════════════════════════════════════════════ */

var NG = null;   // gasto que se está cargando

function nuevoGasto(prellenado) {
  NG = Object.assign({
    descripcion: '', monto: 0, categoria: 'combustible', fecha: hoyTexto(), notas: '',
    medio1: 'efectivo', alias1: '', medio2: '', monto2: 0, alias2: '',
    pagadoPor: 'empresa',
    porcentaje: porcentajeEmpresa(),
    /* Quién se hace cargo del costo:
       'empresa'       → lo absorbe la empresa
       'empresa_socio' → una parte la empresa y otra un dueño
       'socios'        → entre los dueños, sin la empresa */
    modo: 'empresa',
    socio: socios()[socios().length - 1] || ''
  }, prellenado || {});

  abrirModal('Cargar gasto', cuerpoGasto(),
    '<button class="btn btn-primario btn-bloque" onclick="guardarGasto()">Guardar gasto</button>');
}

function cuerpoGasto() {
  var cat = categoriaGasto(NG.categoria);
  var rep = repartirGasto(NG.monto, NG.porcentaje);

  return '<div class="campo"><div class="campo-etiq">Descripción</div>' +
      '<input class="campo-input" id="ng-desc" value="' + esc(NG.descripcion) + '" ' +
             'placeholder="Ej: nafta del Etios" oninput="NG.descripcion=this.value"/></div>' +

    '<div class="campo"><div class="campo-etiq">Categoría</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        CATEGORIAS_GASTO.map(function (c) {
          return '<button class="btn ' + (NG.categoria === c.id ? 'btn-primario' : 'btn-secundario') + '" ' +
            'style="padding:6px 12px;font-size:12px" onclick="setCatNuevo(\'' + c.id + '\')">' +
            ic(c.icono, 13) + ' ' + esc(c.etiqueta) + '</button>';
        }).join('') +
      '</div></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Monto total</div>' +
        inputMonto('ng-monto', NG.monto, 'NG.monto=leerMonto(this);refrescarReparto()') + '</div>' +
      '<div class="campo"><div class="campo-etiq">Fecha</div>' +
        '<input class="campo-input" id="ng-fecha" value="' + esc(NG.fecha) + '" oninput="NG.fecha=this.value"/></div>' +
    '</div>' +

    /* ── Con qué se pagó ── */
    '<div class="campo-etiq" style="margin-top:6px">Con qué se pagó</div>' +
    botonesMedio(1) +
    aliasGasto(1) +
    '<details class="segundo-pago"' + (NG.medio2 ? ' open' : '') + ' style="margin:10px 0">' +
      '<summary style="cursor:pointer;font-size:12px;color:var(--rose);font-weight:600;padding:4px 0">' +
        'Se pagó con dos medios' +
      '</summary>' +
      '<div style="margin-top:8px">' +
        botonesMedio(2) +
        (NG.medio2
          ? '<div class="campo" style="margin-top:8px"><div class="campo-etiq">Monto del segundo medio</div>' +
            inputMonto('ng-monto2', NG.monto2, 'NG.monto2=leerMonto(this);refrescarReparto()') +
            '<div class="campo-ayuda">Con el primero quedan ' + plata(Math.max(0, (+NG.monto || 0) - (+NG.monto2 || 0))) + '.</div>' +
            '</div>' + aliasGasto(2)
          : '') +
      '</div>' +
    '</details>' +

    /* ── Quién puso la plata ── */
    '<div class="campo-etiq">¿Quién puso la plata?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      quienesPagan().map(function (q) {
        return '<button class="btn ' + (NG.pagadoPor === q.id ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setPagadoPor(\'' + esc(q.id).replace(/'/g, "\\'") + '\')">' + esc(q.etiqueta) + '</button>';
      }).join('') +
    '</div>' +

    /* ── Reparto ── */
    '<div class="campo-etiq">¿Quién se hace cargo del costo?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      [['empresa', 'La empresa'],
       ['empresa_socio', 'La empresa y un socio'],
       ['socios', 'Los socios']].map(function (o) {
        return '<button class="btn ' + (NG.modo === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
          'style="padding:6px 12px;font-size:12px" onclick="setModoReparto(\'' + o[0] + '\')">' + o[1] + '</button>';
      }).join('') +
      (cat.compartido && NG.modo === 'empresa' ? ' <span class="pin pin-warn">suele repartirse</span>' : '') +
    '</div>' +

    (NG.modo === 'empresa_socio'
      ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div class="campo"><div class="campo-etiq">Qué socio</div>' +
            '<select class="campo-input" onchange="NG.socio=this.value;refrescarReparto()">' +
              socios().map(function (s2) {
                return '<option' + (NG.socio === s2 ? ' selected' : '') + '>' + esc(s2) + '</option>';
              }).join('') +
            '</select></div>' +
          '<div class="campo"><div class="campo-etiq">Paga la empresa (%)</div>' +
            '<input class="campo-input" type="number" min="0" max="100" inputmode="numeric" ' +
                   'value="' + rep.porcentaje + '" ' +
                   'oninput="NG.porcentaje=Math.max(0,Math.min(100,+this.value||0));refrescarReparto()"/>' +
          '</div>' +
        '</div>'
      : '') +

    '<div id="ng-reparto">' + bloqueReparto() + '</div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" id="ng-notas" value="' + esc(NG.notas) + '" oninput="NG.notas=this.value"/></div>';
}

/* Cómo queda repartido el gasto, en plata */
function repartoActual() {
  var total = +NG.monto || 0;
  var r = {};

  if (NG.modo === 'socios') {
    var lista = socios();
    var cada = Math.floor(total / (lista.length || 1));
    lista.forEach(function (s2, i) {
      r[s2] = i === lista.length - 1 ? total - cada * (lista.length - 1) : cada;
    });
    return r;
  }

  if (NG.modo === 'empresa_socio') {
    var rep = repartirGasto(total, NG.porcentaje);
    r.empresa = rep.empresa;
    r[NG.socio || socios()[0] || 'Socio'] = rep.personal;
    return r;
  }

  r.empresa = total;   // 'empresa': lo absorbe entero
  return r;
}

function bloqueReparto() {
  var r = repartoActual();
  var claves = Object.keys(r).filter(function (k) { return r[k]; });
  if (claves.length < 2) return '';

  var puestos = puestoPorCadaUno({ monto: +NG.monto || 0, pagado_por: NG.pagadoPor });
  var saldos = [];
  Object.keys(r).concat(Object.keys(puestos)).forEach(function (k) {
    if (saldos.indexOf(k) === -1) saldos.push(k);
  });

  var lineas = saldos.map(function (k) {
    var neto = (+puestos[k] || 0) - (+r[k] || 0);
    if (!neto) return '';
    var nombre = k === 'empresa' ? 'la empresa' : k;
    return neto > 0
      ? 'A <strong>' + esc(nombre) + '</strong> le deben ' + plata(neto)
      : '<strong>' + esc(nombre) + '</strong> debe ' + plata(-neto);
  }).filter(Boolean);

  return '<div class="aviso aviso-ok">' + ic('scale', 15) +
    '<div>Se lo cargan: ' + claves.map(function (k) {
      return '<strong>' + esc(k === 'empresa' ? 'Empresa' : k) + '</strong> ' + plata(r[k]);
    }).join(' · ') +
    (lineas.length ? '<br>' + lineas.join('<br>') : '') +
    '</div></div>';
}

/* Refresca solo la parte del reparto: así no se pierde el foco
   ni el cursor mientras se escribe el monto. */
function refrescarReparto() {
  var el = porId('ng-reparto');
  if (el) el.innerHTML = bloqueReparto();
  var resto = document.querySelector('#ng-monto2');
  if (resto) {
    var ayuda = resto.parentNode.querySelector('.campo-ayuda');
    if (ayuda) ayuda.textContent = 'Con el primero quedan ' +
      plata(Math.max(0, (+NG.monto || 0) - (+NG.monto2 || 0))) + '.';
  }
}

function setModoReparto(modo) {
  NG.modo = modo;
  if (modo === 'empresa_socio' && !NG.socio) NG.socio = socios()[socios().length - 1] || '';
  refrescarGasto();
}

function botonesMedio(cual) {
  var actual = cual === 1 ? NG.medio1 : NG.medio2;
  return '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['efectivo', 'transferencia'].map(function (t) {
      var d = TIPOS_PAGO[t];
      return '<button class="btn ' + (actual === t ? 'btn-primario' : 'btn-secundario') + '" ' +
        'onclick="setMedioGasto(' + cual + ',\'' + t + '\')">' + ic(d.icono, 15) + ' ' + esc(d.corta) + '</button>';
    }).join('') +
  '</div>';
}

function aliasGasto(cual) {
  var medio = cual === 1 ? NG.medio1 : NG.medio2;
  if (medio !== 'transferencia') return '';
  var elegido = cual === 1 ? NG.alias1 : NG.alias2;
  var lista = aliasConfigurados();
  if (!lista.length) return '<div class="campo-ayuda" style="margin-top:8px">No hay alias cargados.</div>';

  return '<div style="margin-top:10px">' +
    '<div class="campo-etiq">¿De qué alias salió?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      lista.map(function (a) {
        return '<button class="btn ' + (mismoAlias(a, elegido) ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setAliasGasto(' + cual + ',\'' + esc(a).replace(/'/g, "\\'") + '\')">' +
          ic('card', 14) + ' ' + esc(a) + '</button>';
      }).join('') +
    '</div>' +
  '</div>';
}

function refrescarGasto() {
  var caja = document.querySelector('.modal-cuerpo');
  if (!caja) return;
  var foco = document.activeElement;
  var id = foco && foco.id;
  var pos = foco && foco.selectionStart;
  caja.innerHTML = cuerpoGasto();
  if (id) {
    var nuevo = porId(id);
    if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(pos, pos); } catch (e) {} }
  }
}

function setCatNuevo(c) {
  NG.categoria = c;
  /* Combustible y mantenimiento se suelen repartir con un socio */
  if (categoriaGasto(c).compartido && NG.modo === 'empresa') {
    NG.modo = 'empresa_socio';
    if (!NG.socio) NG.socio = quienPagaCombustible();
  }
  refrescarGasto();
}
function setMedioGasto(cual, t) {
  if (cual === 1) { NG.medio1 = t; if (t !== 'transferencia') NG.alias1 = ''; }
  else { NG.medio2 = (NG.medio2 === t) ? '' : t; if (NG.medio2 !== 'transferencia') NG.alias2 = ''; }
  refrescarGasto();
}
function setAliasGasto(cual, a) { if (cual === 1) NG.alias1 = a; else NG.alias2 = a; refrescarGasto(); }
function setPagadoPor(k) { NG.pagadoPor = k; refrescarGasto(); }


async function guardarGasto() {
  if (!NG.descripcion.trim()) { toast('Escribí de qué es el gasto', 'error'); return; }
  if (!(+NG.monto)) { toast('El monto tiene que ser mayor a cero', 'error'); return; }

  var total = +NG.monto;
  var m2 = Math.min(+NG.monto2 || 0, total);
  var partes = [{ tipo: NG.medio1, monto: NG.medio2 && m2 > 0 ? total - m2 : total, alias: NG.alias1 || null }];
  if (NG.medio2 && m2 > 0) partes.push({ tipo: NG.medio2, monto: m2, alias: NG.alias2 || null });

  var reparto = repartoActual();

  try {
    await crear('gastos', {
      descripcion: NG.descripcion.trim(),
      monto: total,
      categoria: NG.categoria,
      fecha: NG.fecha.trim() || hoyTexto(),
      notas: NG.notas.trim() || null,
      pagos_detalle: JSON.stringify(partes),
      pagado_por: NG.pagadoPor,
      reparto: JSON.stringify(reparto),
      parte_empresa: +reparto.empresa || 0,
      parte_personal: total - (+reparto.empresa || 0),
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Gasto guardado');
    invalidarCache('gastos');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}




/* ═══════════════════════════════════════════════════════════
   CIERRE DE SEMANA
   Qué hay que pagar, qué entró y si alcanza. Los sueldos son
   semanales; la deuda, una vez al mes.
   ═══════════════════════════════════════════════════════════ */
var _conDeuda = null;   // null = todavía no lo decidió el usuario

function tocaDeudaEsteMes(gastos) {
  if (_conDeuda !== null) return _conDeuda;
  /* Por defecto: se incluye si este mes todavía no se pagó */
  var mes = claveMes(hoyTexto());
  return !(gastos || []).some(function (g) {
    return g.categoria === 'deuda' && claveMes(g.fecha || g.created_at) === mes;
  });
}

function alternarDeuda() {
  _conDeuda = !tocaDeudaEsteMes(_gastos);
  pintarGastos();
}

async function pintarCierre(lista, rango) {
  var cont = porId('g-cierre');
  if (!cont) return;

  var conDeuda = tocaDeudaEsteMes(_gastos);
  var remitos = [];
  try { remitos = await traerCacheado('remitos'); } catch (e) {}

  var c = cierreSemana(remitos, _gastos, rango.desde, rango.hasta, conDeuda);
  if (!c.compromisos.items.length && !c.entradas.remitos) { cont.innerHTML = ''; return; }

  cont.innerHTML =
    '<div class="tarjeta" style="border-color:' + (c.alcanza ? 'var(--ok-border)' : 'var(--danger-border)') + '">' +
      '<div class="tarjeta-cuerpo">' +

        /* El veredicto primero: es lo que se viene a mirar */
        '<div class="campo-etiq" style="margin:0">Cierre de ' + esc(rango.etiqueta.toLowerCase()) + '</div>' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:4px 0 10px">' +
          '<div class="stat-val" style="font-size:26px;color:' +
            (c.alcanza ? 'var(--ok)' : 'var(--danger)') + '">' +
            (c.alcanza ? 'Alcanza' : 'Faltan ' + plata(c.falta)) + '</div>' +
          '<div class="campo-ayuda" style="margin:0;text-align:right;max-width:52%">' +
            (c.alcanza
              ? 'sobran ' + plata(c.sobra)
              : (c.compromisos.total
                  ? 'para cubrir ' + plata(c.compromisos.total) + ' de compromisos'
                  : 'se gastó más de lo que entró')) + '</div>' +
        '</div>' +

        '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px">' +
          '<span>Cobrado en ' + plural(c.entradas.remitos, 'remito') + '</span>' +
          '<strong>' + plata(c.entradas.cobrado) + '</strong></div>' +
        (c.otrosIngresos
          ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:var(--ok)">' +
            '<span>Otra plata que entró</span><strong>+ ' + plata(c.otrosIngresos) + '</strong></div>'
          : '') +
        '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:var(--danger)">' +
          '<span>Ya se gastó</span><strong>− ' + plata(c.yaGastado) + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--border);font-size:13px">' +
          '<span>Disponible</span>' +
          '<strong style="color:' + (c.disponible >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + plata(c.disponible) + '</strong></div>' +
        (c.entradas.deuda
          ? '<div class="campo-ayuda">Además hay ' + plata(c.entradas.deuda) + ' en deuda sin cobrar.</div>'
          : '') +

        '<details style="margin-top:10px">' +
        '<summary style="cursor:pointer;font-size:12.5px;color:var(--rose);font-weight:600;padding:4px 0">' +
          'Falta pagar ' + plata(c.compromisos.total) + '</summary>' +
        '<div class="campo-ayuda" style="padding:4px 0 8px">' +
          'El detalle está abajo, en <strong>Lo que hay que pagar</strong>: ahí ' +
          'están los sueldos, los impuestos del mes y las deudas, todo junto.</div>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);margin:0;cursor:pointer">' +
          '<input type="checkbox"' + (conDeuda ? ' checked' : '') + ' onchange="alternarDeuda()"/> ' +
          'Incluir la deuda de este mes' +
        '</label>' +
      '</details>' +

        (!c.alcanza && c.entradas.deuda
          ? '<div class="campo-ayuda" style="margin-top:8px">' +
            'Cobrar las deudas pendientes cubriría ' + plata(Math.min(c.falta, c.entradas.deuda)) + '.</div>'
          : '') +
      '</div>' +
    '</div>';
}


/* ═══════════════════════════════════════════════════════════
   PAGAR UN GASTO PENDIENTE
   ═══════════════════════════════════════════════════════════ */
var PG = null;

function abrirPago(id) {
  var g = _gastos.find(function (x) { return String(x.id) === String(id); });
  if (!g) return;
  PG = { gasto: g, medio1: 'transferencia', alias1: '', medio2: '', monto2: 0, alias2: '', fecha: hoyISO() };
  abrirModal('Pagar ' + plata(g.monto), cuerpoPago(),
    '<button class="btn btn-primario btn-bloque" onclick="confirmarPago()">Registrar el pago</button>');
}

function cuerpoPago() {
  var g = PG.gasto;
  return '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      esc(g.descripcion) + ' · ' + esc(fechaCorta(g.fecha)) + '</p>' +

    '<div class="campo-etiq" style="margin-top:12px">Con qué se pagó</div>' +
    medioPago(1) + aliasPago(1) +

    '<details class="segundo-pago"' + (PG.medio2 ? ' open' : '') + ' style="margin-top:10px">' +
      '<summary style="cursor:pointer;font-size:12px;color:var(--rose);font-weight:600;padding:4px 0">' +
        'Se pagó con dos medios</summary>' +
      '<div style="margin-top:8px">' +
        medioPago(2) +
        (PG.medio2
          ? '<div class="campo" style="margin-top:8px"><div class="campo-etiq">Monto del segundo medio</div>' +
            inputMonto('pg-monto2', PG.monto2, 'PG.monto2=leerMonto(this);refrescarPago()') +
            '<div class="campo-ayuda">Con el primero quedan ' +
              plata(Math.max(0, (+g.monto || 0) - (+PG.monto2 || 0))) + '.</div></div>' +
            aliasPago(2)
          : '') +
      '</div>' +
    '</details>' +

    '<div class="campo" style="margin-top:12px"><div class="campo-etiq">Fecha del pago</div>' +
      '<input class="campo-input" type="date" value="' + esc(PG.fecha) + '" onchange="PG.fecha=this.value"/></div>';
}

function medioPago(cual) {
  var actual = cual === 1 ? PG.medio1 : PG.medio2;
  return '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['efectivo', 'transferencia'].map(function (t) {
      var d = TIPOS_PAGO[t];
      return '<button class="btn ' + (actual === t ? 'btn-primario' : 'btn-secundario') + '" ' +
        'onclick="setMedioPago(' + cual + ',\'' + t + '\')">' + ic(d.icono, 15) + ' ' + esc(d.corta) + '</button>';
    }).join('') + '</div>';
}

function aliasPago(cual) {
  var medio = cual === 1 ? PG.medio1 : PG.medio2;
  if (medio !== 'transferencia') return '';
  var elegido = cual === 1 ? PG.alias1 : PG.alias2;
  var lista = aliasConfigurados();
  if (!lista.length) return '';
  return '<div style="margin-top:8px"><div class="campo-etiq">¿De qué alias salió?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      lista.map(function (a) {
        return '<button class="btn ' + (mismoAlias(a, elegido) ? 'btn-primario' : 'btn-secundario') + '" ' +
          'onclick="setAliasPago(' + cual + ',\'' + esc(a).replace(/'/g, "\\'") + '\')">' +
          ic('card', 14) + ' ' + esc(a) + '</button>';
      }).join('') + '</div></div>';
}

function setMedioPago(cual, t) {
  if (cual === 1) { PG.medio1 = t; if (t !== 'transferencia') PG.alias1 = ''; }
  else { PG.medio2 = (PG.medio2 === t) ? '' : t; if (PG.medio2 !== 'transferencia') PG.alias2 = ''; }
  refrescarPago();
}
function setAliasPago(cual, a) { if (cual === 1) PG.alias1 = a; else PG.alias2 = a; refrescarPago(); }

function refrescarPago() {
  var caja = document.querySelector('.modal-cuerpo');
  if (caja) caja.innerHTML = cuerpoPago();
}

async function confirmarPago() {
  var g = PG.gasto;
  var total = +g.monto || 0;
  var m2 = Math.min(+PG.monto2 || 0, total);
  var partes = [{ tipo: PG.medio1, monto: PG.medio2 && m2 > 0 ? total - m2 : total, alias: PG.alias1 || null }];
  if (PG.medio2 && m2 > 0) partes.push({ tipo: PG.medio2, monto: m2, alias: PG.alias2 || null });

  try {
    await actualizar('gastos', g.id, {
      pagado: true,
      pagado_fecha: PG.fecha || hoyISO(),
      pagos_detalle: JSON.stringify(partes)
    });
    cerrarModal();
    toast('Pago registrado');
    invalidarCache('gastos');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ═══════════════════════════════════════════════════════════
   CUENTAS ENTRE NOSOTROS
   Todo lo que no es plata de la empresa, junto en un solo lugar:
   lo que se le debe a cada dueño, lo que cuesta el empleado y
   cómo va el balance entre los socios.
   ═══════════════════════════════════════════════════════════ */
function pintarCuentas(lista, rango) {
  var cont = porId('g-cuentas');
  if (!cont) return;

  /* Los reintegros miran todos los gastos, no solo los del filtro:
     una nafta de la semana pasada sigue sin devolverse. */
  var grupos = reintegrosPorSocio(_gastos);
  var aDevolver = grupos.reduce(function (a, x) { return a + x.total; }, 0);
  var emp = gastoEnEmpleado(lista);
  var balances = balancesTodos(lista);

  if (!grupos.length && !emp.total && !balances.length) { cont.innerHTML = ''; return; }

  cont.innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('users', 16) + ' Cuentas entre nosotros' +
        '<span style="margin-left:auto">' +
          (aDevolver
            ? '<span class="pin pin-warn">a devolver ' + plata(aDevolver) + '</span>'
            : '<span class="pin pin-ok">al día</span>') +
        '</span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +

        (grupos.length ? seccionReintegros(grupos) : '') +
        (emp.total ? seccionEmpleado(emp, rango) : '') +
        (balances.length ? seccionBalance(balances, rango) : '') +

      '</div>' +
    '</details>';
}

function seccionReintegros(grupos) {
  return '<div class="eyebrow">' + ic('fuel', 13) + ' A devolverle a los dueños</div>' +
    '<div class="campo-ayuda" style="margin-bottom:8px">' +
      'Plata que pusieron de su bolsillo por algo que le toca a la empresa.</div>' +
    grupos.map(function (x) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div style="min-width:0">' +
          '<strong>' + esc(x.quien) + '</strong>' +
          '<div class="campo-ayuda">' + plural(x.items.length, 'gasto') + ' · ' +
            esc(x.items.slice(0, 2).map(function (i) { return fechaCorta(i.gasto.fecha); }).join(', ')) +
            (x.items.length > 2 ? '…' : '') + '</div>' +
        '</div>' +
        '<div style="text-align:right;white-space:nowrap">' +
          '<div style="font-weight:700;color:var(--warn)">' + plata(x.total) + '</div>' +
          '<button class="btn btn-primario" style="padding:4px 11px;font-size:11.5px;margin-top:3px" ' +
            'onclick="pagarReintegro(\'' + esc(x.quien).replace(/'/g, "\\'") + '\')">' +
            ic('cash', 12) + ' Cobrar</button>' +
        '</div>' +
      '</div>';
    }).join('');
}

function seccionEmpleado(emp, rango) {
  var e = empleadoConfig();
  var porSocio = Object.keys(emp.porSocio);
  return '<div class="eyebrow" style="margin-top:14px">' + ic('user', 13) + ' ' + esc(e.nombre || 'Empleado') + '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0">' +
      '<div class="campo-ayuda" style="margin:0">' + esc(rango.etiqueta) + ' · ' + plural(emp.items.length, 'pago') + '</div>' +
      '<strong style="color:var(--violet)">' + plata(emp.total) + '</strong>' +
    '</div>' +
    (porSocio.length
      ? '<div class="campo-ayuda">Puso ' +
        porSocio.map(function (k) { return esc(k) + ' ' + plata(emp.porSocio[k]); }).join(' · ') +
        ' — no sale de la empresa.</div>'
      : '');
}

function seccionBalance(balances, rango) {
  return '<div class="eyebrow" style="margin-top:14px">' + ic('scale', 13) + ' Balance de ' + esc(rango.etiqueta.toLowerCase()) + '</div>' +
    balances.map(function (x) {
      var b = x.balance;
      return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0">' +
        '<div>' + esc(x.quien) +
          '<span class="campo-ayuda"> · ' +
            (b.neto > 0 ? 'puso de más' : b.neto < 0 ? 'le cubrieron de más' : 'está a mano') + '</span>' +
        '</div>' +
        '<strong style="color:' + (b.neto > 0 ? 'var(--ok)' : b.neto < 0 ? 'var(--warn)' : 'var(--muted)') + '">' +
          (b.neto > 0 ? '+' : '') + plata(b.neto) + '</strong>' +
      '</div>';
    }).join('') +
    '<div class="campo-ayuda">Positivo: hay que devolverle. Negativo: tiene que poner.</div>';
}

function pagarReintegro(quien) {
  var grupo = reintegrosPorSocio(_gastos).find(function (x) { return x.quien === quien; });
  if (!grupo) return;

  abrirModal('Devolverle a ' + quien,
    '<p style="font-size:13px;color:var(--text2);line-height:1.6">' +
      'Se marcan como devueltos ' + plural(grupo.items.length, 'gasto') + ' por un total de ' +
      '<strong>' + plata(grupo.total) + '</strong>.</p>' +
    '<div class="lista">' +
      grupo.items.map(function (i) {
        return '<div class="fila" style="cursor:default">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(i.gasto.descripcion) + '</div>' +
            '<div class="fila-sub">' + esc(fechaCorta(i.gasto.fecha)) + '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(i.monto) + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>',
    '<button class="btn btn-primario btn-bloque" id="btn-reint" onclick="confirmarReintegro(\'' +
      esc(quien).replace(/'/g, "\\'") + '\')">Marcar como devuelto</button>');
}

async function confirmarReintegro(quien) {
  var grupo = reintegrosPorSocio(_gastos).find(function (x) { return x.quien === quien; });
  if (!grupo) return;
  var btn = porId('btn-reint');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  var fallos = 0;
  for (var i = 0; i < grupo.items.length; i++) {
    try {
      await actualizar('gastos', grupo.items[i].gasto.id, {
        reintegrado: true,
        reintegrado_fecha: hoyISO()
      });
      grupo.items[i].gasto.reintegrado = true;
    } catch (e) { fallos++; }
  }

  invalidarCache('gastos');
  cerrarModal();
  toast(fallos ? 'Quedaron ' + fallos + ' sin marcar' : 'Devuelto a ' + quien + ': ' + plata(grupo.total));
  pintarRuta();
}


/* ═══════════════════════════════════════════════════════════
   EDITAR UN GASTO
   ═══════════════════════════════════════════════════════════ */
var EG = null;

function editarGasto(id) {
  var g = _gastos.find(function (x) { return String(x.id) === String(id); });
  if (!g) return;
  EG = g;

  abrirModal('Editar gasto',
    '<div class="campo"><div class="campo-etiq">Descripción</div>' +
      '<input class="campo-input" id="eg-desc" value="' + esc(g.descripcion || '') + '"/></div>' +

    '<div class="campo"><div class="campo-etiq">Categoría</div>' +
      '<select class="campo-input" id="eg-cat">' +
        CATEGORIAS_GASTO.map(function (c) {
          return '<option value="' + c.id + '"' + ((g.categoria || 'otro') === c.id ? ' selected' : '') + '>' +
            esc(c.etiqueta) + '</option>';
        }).join('') +
      '</select></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">Monto</div>' + inputMonto('eg-monto', g.monto) + '</div>' +
      '<div class="campo"><div class="campo-etiq">Fecha</div>' +
        '<input class="campo-input" id="eg-fecha" value="' + esc(g.fecha || '') + '"/></div>' +
    '</div>' +

    '<div class="campo"><div class="campo-etiq">¿Quién puso la plata?</div>' +
      '<select class="campo-input" id="eg-quien">' +
        '<option value="">— sin anotar —</option>' +
        quienesPagan().map(function (q) {
          return '<option value="' + esc(q.id) + '"' + (g.pagado_por === q.id ? ' selected' : '') + '>' +
            esc(q.etiqueta) + '</option>';
        }).join('') +
      '</select>' +
      '<div class="campo-ayuda">El reparto del costo no se toca acá: si cambió, conviene borrarlo y cargarlo de nuevo.</div>' +
    '</div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota</div>' +
      '<input class="campo-input" id="eg-notas" value="' + esc(g.notas || '') + '"/></div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarGastoEditado()">Guardar</button>' +
      '<button class="btn btn-peligro" onclick="cerrarModal();borrarGasto(' + g.id + ')">' +
        ic('trash', 15) + ' Borrar</button>' +
    '</div>');
}

async function guardarGastoEditado() {
  var g = EG;
  if (!g) return;

  var desc = (porId('eg-desc').value || '').trim();
  if (!desc) { toast('El gasto necesita una descripción', 'error'); return; }
  var monto = leerMonto('eg-monto');
  if (!monto) { toast('El monto tiene que ser mayor a cero', 'error'); return; }

  var cambios = {};
  if (desc !== (g.descripcion || '')) cambios.descripcion = desc;
  if (monto !== (+g.monto || 0)) cambios.monto = monto;

  var cat = porId('eg-cat').value;
  if (cat !== (g.categoria || 'otro')) cambios.categoria = cat;

  var fecha = (porId('eg-fecha').value || '').trim();
  if (fecha !== (g.fecha || '')) cambios.fecha = fecha || null;

  var quien = porId('eg-quien').value;
  if (quien !== (g.pagado_por || '')) cambios.pagado_por = quien || null;

  var notas = (porId('eg-notas').value || '').trim();
  if (notas !== (g.notas || '')) cambios.notas = notas || null;

  /* Si cambió el monto, el reparto se recalcula con la misma
     proporción: si no, quedarían partes que no suman el total. */
  if (cambios.monto) {
    var rep = repartoDeGasto(g);
    var viejo = +g.monto || 0;
    if (viejo > 0 && Object.keys(rep).length) {
      var nuevo = {};
      var acumulado = 0;
      var claves = Object.keys(rep);
      claves.forEach(function (k, i) {
        if (i === claves.length - 1) nuevo[k] = monto - acumulado;
        else { nuevo[k] = Math.round((+rep[k] || 0) * monto / viejo); acumulado += nuevo[k]; }
      });
      cambios.reparto = JSON.stringify(nuevo);
      cambios.parte_empresa = +nuevo.empresa || 0;
      cambios.parte_personal = monto - (+nuevo.empresa || 0);
    }
  }

  if (!Object.keys(cambios).length) { cerrarModal(); return; }

  try {
    await actualizar('gastos', g.id, cambios);
    Object.assign(g, cambios);
    invalidarCache('gastos');
    cerrarModal();
    toast('Gasto actualizado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* Quién pone cuánto, para que se vea que la nafta es de uno solo */
function resumenPorSocio(lista) {
  var por = {};
  lista.forEach(function (g) {
    var rep = repartoDeGasto(g);
    Object.keys(rep).forEach(function (k) {
      if (k === 'empresa' || !rep[k]) return;
      por[k] = (por[k] || 0) + (+rep[k] || 0);
    });
  });
  var claves = Object.keys(por).sort(function (a, b) { return por[b] - por[a]; });
  return claves.map(function (k) { return k + ' ' + plata(por[k]); }).join(' · ');
}

/* ── Detalle de un grupo, con las mismas acciones de siempre ── */
function detalleGrupo(id) {
  var gr = GRUPOS.find(function (x) { return x.id === id; });
  var items = gastosFiltrados().filter(function (g) { return grupoDe(g) === id; });
  var r = rangoGastos();
  var suma = items.reduce(function (a, g) { return a + montoEmpresa(g); }, 0);
  var totalReal = items.reduce(function (a, g) { return a + (+g.monto || 0); }, 0);

  abrirModal(gr.etiqueta,
    '<div class="campo-ayuda" style="margin-bottom:10px">' + esc(r.etiqueta) + ' · ' +
      plural(items.length, 'gasto') + ' · <strong>' + plata(suma) + '</strong>' +
      (totalReal !== suma ? ' de la empresa, sobre ' + plata(totalReal) + ' en total' : '') + '</div>' +
    (items.length
      ? '<div class="lista">' + items.map(filaGasto).join('') + '</div>'
      : '<div class="campo-ayuda">No hay gastos de este tipo en el período.</div>'),

    '<button class="btn btn-primario btn-bloque" onclick="cerrarModal();nuevoGasto({categoria:\'' +
      (items[0] ? items[0].categoria : 'otro') + '\'})">' + ic('plus', 15) + ' Cargar uno nuevo</button>');
}

/* ── Detalle de una tarjeta ──────────────────────────────── */
function detalleGastos(que) {
  var lista = gastosFiltrados();
  var r = rangoGastos();
  var titulo, items;

  if (que === 'empresa') {
    titulo = 'Gastos de la empresa';
    items = lista.filter(function (g) { return montoEmpresa(g) > 0; });
  } else if (que === 'socios') {
    detalleSocios(lista, rangoGastos());
    return;
  } else {
    var cat = categoriaGasto(que.slice(4));
    titulo = cat.etiqueta;
    items = lista.filter(function (g) { return (g.categoria || 'otro') === cat.id; });
  }

  var suma = items.reduce(function (a, g) {
    return a + (que === 'socios' ? montoDeSocios(g) : montoEmpresa(g));
  }, 0);

  abrirModal(titulo,
    '<div class="campo-ayuda" style="margin-bottom:10px">' + esc(r.etiqueta) + ' · ' +
      plural(items.length, 'gasto') + ' · <strong>' + plata(suma) + '</strong></div>' +
    (items.length
      ? '<div class="lista">' + items.map(function (g) {
          var m = que === 'socios' ? montoDeSocios(g) : montoEmpresa(g);
          return '<div class="fila" style="cursor:default">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(g.descripcion || '—') + '</div>' +
              '<div class="fila-sub">' + esc(fechaCorta(g.fecha)) + ' · ' +
                esc(categoriaGasto(g.categoria).etiqueta) +
                (g.pagado_por ? ' · ' + esc(verboPuso(g.pagado_por)) + ' ' + esc(nombreDePagador(g.pagado_por)) : '') +
                (gastoPagado(g) ? '' : ' · <strong>sin pagar</strong>') + '</div>' +
            '</div>' +
            '<div class="fila-derecha"><div class="fila-titulo">' + plata(m) + '</div>' +
              (m !== (+g.monto || 0) ? '<div class="campo-ayuda">de ' + plata(g.monto) + '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('') + '</div>'
      : '<div class="campo-ayuda">No hay gastos de ese tipo en el período.</div>'));
}


/* Lo que pone cada dueño, separado por concepto: la nafta la pone
   siempre uno solo y no tiene sentido mezclarla con los sueldos. */
function detalleSocios(lista, r) {
  var porSocio = {};
  lista.forEach(function (g) {
    var rep = repartoDeGasto(g);
    Object.keys(rep).forEach(function (k) {
      if (k === 'empresa' || !rep[k]) return;
      (porSocio[k] = porSocio[k] || { total: 0, porCat: {} });
      porSocio[k].total += +rep[k] || 0;
      var cat = g.categoria || 'otro';
      (porSocio[k].porCat[cat] = porSocio[k].porCat[cat] || { total: 0, items: [] });
      porSocio[k].porCat[cat].total += +rep[k] || 0;
      porSocio[k].porCat[cat].items.push({ gasto: g, monto: +rep[k] || 0 });
    });
  });

  var nombres = Object.keys(porSocio).sort(function (a, b) { return porSocio[b].total - porSocio[a].total; });

  abrirModal('Lo que ponen los dueños',
    '<div class="campo-ayuda" style="margin-bottom:12px">' + esc(r.etiqueta) +
      ' · esto no sale de la caja de la empresa.</div>' +
    nombres.map(function (n) {
      var d = porSocio[n];
      return '<div class="eyebrow">' + esc(n) + ' · ' + plata(d.total) + '</div>' +
        '<div class="lista" style="margin-bottom:14px">' +
          Object.keys(d.porCat).sort(function (a, b) { return d.porCat[b].total - d.porCat[a].total; })
            .map(function (c) {
              var cat = categoriaGasto(c);
              return '<div class="fila" style="cursor:default">' +
                '<span class="nav-ic">' + ic(cat.icono, 16) + '</span>' +
                '<div class="fila-principal">' +
                  '<div class="fila-titulo">' + esc(cat.etiqueta) + '</div>' +
                  '<div class="fila-sub">' + plural(d.porCat[c].items.length, 'gasto') + '</div>' +
                '</div>' +
                '<div class="fila-derecha"><div class="fila-titulo">' + plata(d.porCat[c].total) + '</div></div>' +
              '</div>';
            }).join('') +
        '</div>';
    }).join(''));
}


/* ═══════════════════════════════════════════════════════════
   LOS GASTOS FIJOS DE LA SEMANA
   Los viernes aparece el recordatorio. No se anota nada solo:
   se pregunta cuáles se pagaron y los que no quedan pendientes.
   ═══════════════════════════════════════════════════════════ */
function pintarFijosDeLaSemana() {
  var cont = porId('g-avisos');
  if (!cont) return;

  if (!tocaPreguntarFijos(_gastos)) { cont.innerHTML = ''; return; }

  var pendientes = fijosPendientes(_gastos).filter(function (f) { return !f.yaAnotado; });

  cont.innerHTML =
    '<div class="aviso aviso-warn" style="align-items:flex-start">' + ic('calendar', 16) +
      '<div style="flex:1">' +
        '<strong>Gastos fijos sin anotar</strong>' +
        '<br>' + plural(pendientes.length, 'gasto fijo', 'gastos fijos') + ': ' +
        esc(pendientes.slice(0, 3).map(function (f) { return f.nombre; }).join(', ')) +
        (pendientes.length > 3 ? ' y ' + (pendientes.length - 3) + ' más' : '') +
        '<br><button class="btn btn-fantasma" style="padding:2px 0;text-decoration:underline;font-size:12.5px" ' +
          'onclick="revisarFijosSemana()">Revisarlos</button>' +
      '</div>' +
    '</div>';
}

var _fijosRevision = null;

function revisarFijosSemana() {
  _fijosRevision = fijosPendientes(_gastos).map(function (f) {
    /* Por defecto se marcan como pagados los que no estén anotados:
       es lo más común, pero se puede desmarcar uno por uno. */
    return Object.assign({}, f, { pagado: !f.yaAnotado });
  });

  abrirModal('Gastos fijos',
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Marcá los que pagaste. Los que dejes sin marcar se anotan igual, ' +
      'pero como <strong>pendientes de pago</strong>, así no se pierden ' +
      'y aparecen en lo que falta pagar.</div>' +
    '<div id="lista-fijos-semana"></div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:140px" id="btn-fijos" ' +
              'onclick="confirmarFijosSemana()">Anotarlos</button>' +
      '<button class="btn btn-secundario" onclick="saltearFijosSemana()">Esta semana no</button>' +
    '</div>');

  pintarListaFijosSemana();
}

function pintarListaFijosSemana() {
  var cont = porId('lista-fijos-semana');
  if (!cont) return;

  var aAnotar = _fijosRevision.filter(function (f) { return !f.yaAnotado; });
  var total = aAnotar.filter(function (f) { return f.pagado; })
    .reduce(function (a, f) { return a + f.monto; }, 0);
  var pend = aAnotar.filter(function (f) { return !f.pagado; })
    .reduce(function (a, f) { return a + f.monto; }, 0);

  cont.innerHTML =
    '<div class="lista">' +
      _fijosRevision.map(function (f, i) {
        if (f.yaAnotado) {
          return '<div class="fila" style="cursor:default;opacity:.55">' +
            '<span style="flex:0 0 auto;color:var(--ok)">' + ic('check', 16) + '</span>' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(f.nombre) + '</div>' +
              '<div class="fila-sub">ya anotado ' + esc(f.cada) + '</div>' +
            '</div>' +
            '<div class="fila-derecha"><div class="fila-titulo">' +
              plata(montoEmpresa(f.gasto)) + '</div></div>' +
          '</div>';
        }
        return '<label class="fila" style="cursor:pointer">' +
          '<input type="checkbox"' + (f.pagado ? ' checked' : '') + ' ' +
                 'style="width:20px;height:20px;flex:0 0 auto" ' +
                 'onchange="marcarFijoPagado(' + i + ',this.checked)"/>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(f.nombre) + '</div>' +
            '<div class="fila-sub">' +
              (f.pagado ? 'pagado' : '<span style="color:var(--warn)">queda pendiente</span>') +
              ' · ' + esc(FRECUENCIAS[f.frecuencia].etiqueta.toLowerCase()) +
            '</div>' +
          '</div>' +
          '<div class="fila-derecha"><div class="fila-titulo">' + plata(f.monto) + '</div></div>' +
        '</label>';
      }).join('') +
    '</div>' +

    '<div class="campo-ayuda" style="margin-top:10px;text-align:right">' +
      (total ? 'Pagado: <strong>' + plata(total) + '</strong>' : '') +
      (total && pend ? ' · ' : '') +
      (pend ? '<span style="color:var(--warn)">Pendiente: <strong>' + plata(pend) + '</strong></span>' : '') +
    '</div>';
}

function marcarFijoPagado(i, valor) {
  if (!_fijosRevision[i]) return;
  _fijosRevision[i].pagado = !!valor;
  pintarListaFijosSemana();
}

async function confirmarFijosSemana() {
  var aAnotar = _fijosRevision.filter(function (f) { return !f.yaAnotado; });
  if (!aAnotar.length) { await saltearFijosSemana(); return; }

  var btn = porId('btn-fijos');
  if (btn) { btn.disabled = true; btn.textContent = 'Anotando…'; }

  try {
    for (var i = 0; i < aAnotar.length; i++) {
      var f = aAnotar[i];
      await crear('gastos', {
        descripcion: f.nombre,
        categoria: categoriaDeGastoFijo(f.nombre),
        monto: f.monto,
        fecha: hoyTexto(),
        pagado: f.pagado,
        pagado_fecha: f.pagado ? hoyTexto() : null,
        pagado_por: 'empresa',
        reparto: JSON.stringify({ empresa: f.monto }),
        parte_empresa: f.monto,
        notas: 'Gasto fijo',
        created_at: new Date().toISOString()
      });
    }

    await marcarFijosPreguntados();
    invalidarCache('gastos');
    cerrarModal();

    var pagados = aAnotar.filter(function (x) { return x.pagado; }).length;
    var pend = aAnotar.length - pagados;
    toast(plural(aAnotar.length, 'gasto') + ' anotados' +
      (pend ? ' · ' + pend + ' sin pagar' : ''));
    pintarRuta();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Anotarlos'; }
    toast(e.message, 'error');
  }
}

/* No anotar nada, pero no volver a preguntar hasta la semana que viene */
async function saltearFijosSemana() {
  try {
    await marcarFijosPreguntados();
    cerrarModal();
    toast('Listo · se vuelve a preguntar la semana que viene');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ═══════════════════════════════════════════════════════════
   LO QUE HAY QUE JUNTAR PARA EL MES
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   TODO LO QUE HAY QUE PAGAR
   Antes esto estaba repartido en dos lugares: los sueldos de la
   semana en el cierre y los monotributos en otra tarjeta. Ahora
   está junto, ordenado por cuándo vence.
   ═══════════════════════════════════════════════════════════ */
function pintarAPagar() {
  var cont = porId('g-pagar');
  if (!cont) return;

  var lista = todoLoQueHayQuePagar();
  if (!lista.items.length) { cont.innerHTML = ''; return; }

  var urgente = lista.diasParaVencer <= 5 && lista.pendiente > 0;

  cont.innerHTML =
    '<details class="tarjeta"' + (urgente ? ' open' : '') + '>' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('calendar', 16) + ' Lo que hay que pagar' +
        '<span style="margin-left:auto"><span class="pin ' +
          (lista.pendiente ? (urgente ? 'pin-danger' : 'pin-warn') : 'pin-ok') + '">' +
          (lista.pendiente ? plata(lista.pendiente) : 'todo pago') + '</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +

        (lista.pendiente
          ? '<div class="campo-ayuda" style="margin-bottom:10px">' +
              'Falta juntar <strong>' + plata(lista.pendiente) + '</strong>. ' +
              'Lo primero vence ' + esc(fechaCorta(lista.vence)) +
              (lista.diasParaVencer >= 0
                ? ' · ' + (lista.diasParaVencer === 0 ? 'hoy' : 'en ' + plural(lista.diasParaVencer, 'día'))
                : '') + '.</div>'
          : '<div class="campo-ayuda" style="margin-bottom:10px">Está todo pago.</div>') +

        ['semana', 'mes', 'deuda'].map(function (bloque) {
          var items = lista.items.filter(function (x) { return x.bloque === bloque; });
          if (!items.length) return '';
          var titulo = bloque === 'semana' ? 'Esta semana'
                     : bloque === 'mes' ? 'Este mes' : 'Deudas atrasadas';
          return '<div class="eyebrow" style="margin-top:10px">' + esc(titulo) + '</div>' +
            '<div class="lista">' +
              items.map(function (x) {
                var editable = x.bloque === 'deuda';
                return '<' + (editable ? 'button' : 'div') + ' class="fila" style="' +
                  (editable ? 'text-align:left;width:100%' : 'cursor:default') +
                  (x.pagado ? ';opacity:.5' : '') + '"' +
                  (editable ? ' onclick="editarDeudaDesdeGastos(' + x.indice + ')"' : '') + '>' +
                  '<span style="flex:0 0 auto;color:' +
                    (x.pagado ? 'var(--ok)' : x.vencida ? 'var(--danger)' : 'var(--muted)') + '">' +
                    ic(x.pagado ? 'check' : 'clock', 15) + '</span>' +
                  '<div class="fila-principal">' +
                    '<div class="fila-titulo">' + esc(x.concepto) + '</div>' +
                    '<div class="fila-sub">' +
                      (x.pagado ? 'pagado'
                        : (x.vence ? (x.vencida ? 'venció ' : 'vence ') + esc(fechaCorta(x.vence)) : x.cada)) +
                      (x.quien ? ' · a ' + esc(x.quien) : '') +
                      (x.loPonenLosDuenos ? ' · lo ponen ustedes' : '') +
                    '</div>' +
                  '</div>' +
                  '<div class="fila-derecha"><div class="fila-titulo">' + plata(x.monto) + '</div>' +
                    (editable ? '<div class="ir-a">Editar ' + ic('chevron', 11) + '</div>' : '') +
                  '</div>' +
                '</' + (editable ? 'button' : 'div') + '>';
              }).join('') +
            '</div>';
        }).join('') +

        '<div style="display:flex;justify-content:space-between;padding:9px 0;margin-top:6px;' +
             'border-top:2px solid var(--border)">' +
          '<strong>Todo junto</strong><strong>' + plata(lista.total) + '</strong></div>' +

        '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="nuevaDeuda()">' +
          ic('plus', 15) + ' Anotar una deuda</button>' +
      '</div>' +
    '</details>';
}

/* Sueldos de la semana, impuestos del mes y deudas atrasadas,
   todo en una sola lista. */
function todoLoQueHayQuePagar() {
  var hoy = hoyISO();
  var vence = proximoVencimiento(hoy);
  var items = [];

  /* Lo de la semana: sueldos y demás compromisos */
  var r = rangoGastos();
  var delRango = _gastos.filter(function (g) {
    if (esIngreso(g)) return false;
    var k = claveFecha(g.fecha || g.created_at);
    return k && k >= r.desde && k <= r.hasta;
  });

  compromisosSemana(tocaDeudaEsteMes(_gastos)).items.forEach(function (i) {
    /* La deuda de configuración se muestra con los impuestos */
    if (i.concepto === 'Deuda') return;
    items.push({
      concepto: i.concepto,
      monto: i.monto,
      pagado: compromisoPagado(i, delRango),
      cada: 'cada ' + i.cada,
      loPonenLosDuenos: i.loPonenLosDuenos,
      bloque: 'semana'
    });
  });

  /* Lo del mes: monotributos e impuestos fijos */
  fijosPendientes(_gastos, hoy).forEach(function (f) {
    items.push({
      concepto: f.nombre,
      monto: f.monto,
      pagado: f.yaAnotado,
      vence: vence,
      bloque: 'mes'
    });
  });

  /* Y lo que le debemos a alguien. Se guarda el índice para
     poder editarla desde acá. */
  deudasPropias().forEach(function (d, idx) {
    items.push({
      concepto: d.concepto,
      monto: d.monto,
      pagado: false,
      vence: d.fecha || vence,
      vencida: d.fecha && d.fecha < hoy,
      quien: d.quien,
      indice: idx,
      bloque: 'deuda'
    });
  });

  var falta = items.filter(function (x) { return !x.pagado; });
  var proxima = falta.map(function (x) { return x.vence; }).filter(Boolean).sort()[0] || vence;

  return {
    items: items,
    total: items.reduce(function (a, x) { return a + x.monto; }, 0),
    pendiente: falta.reduce(function (a, x) { return a + x.monto; }, 0),
    vence: proxima,
    diasParaVencer: diasEntre(hoy, proxima)
  };
}

/* ── Anotar una deuda ────────────────────────────────────── */
function nuevaDeuda(datos) {
  var d = datos || {};
  var i = d.indice;

  abrirModal(i !== undefined ? 'Editar la deuda' : 'Anotar una deuda',
    '<div class="campo-ayuda" style="margin-bottom:12px">' +
      'Algo que quedó sin pagar: un sueldo atrasado, plata que puso alguno de ustedes, ' +
      'un proveedor. Se descuenta de lo disponible hasta que la saques.</div>' +

    '<div class="campo"><div class="campo-etiq">Qué se debe</div>' +
      '<input class="campo-input" id="nd-concepto" value="' + esc(d.concepto || '') + '" ' +
             'placeholder="Sueldo de Nacho, semana pasada"/></div>' +

    '<div class="campo"><div class="campo-etiq">Cuánto</div>' +
      inputMonto('nd-monto', d.monto || '') + '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="campo"><div class="campo-etiq">A quién</div>' +
        '<input class="campo-input" id="nd-quien" value="' + esc(d.quien || '') + '" ' +
               'placeholder="Nacho"/></div>' +
      '<div class="campo"><div class="campo-etiq">Para cuándo</div>' +
        '<input class="campo-input" type="date" id="nd-fecha" value="' + esc(d.fecha || '') + '"/></div>' +
    '</div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:130px" id="btn-nd" ' +
              'onclick="guardarDeudaNueva(' + (i !== undefined ? i : 'null') + ')">' +
        ic('check', 16) + ' Guardar</button>' +
      (i !== undefined
        ? '<button class="btn btn-peligro" onclick="quitarDeudaDesdeGastos(' + i + ')">' +
          ic('trash', 15) + ' Ya se pagó</button>'
        : '') +
    '</div>');
}

async function guardarDeudaNueva(indice) {
  var concepto = (porId('nd-concepto').value || '').trim();
  var monto = leerMonto('nd-monto');
  if (!concepto) { toast('Falta qué se debe', 'error'); return; }
  if (!monto) { toast('Falta el monto', 'error'); return; }

  var btn = porId('btn-nd');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  var nueva = {
    concepto: concepto,
    monto: monto,
    quien: (porId('nd-quien').value || '').trim(),
    fecha: porId('nd-fecha').value || ''
  };

  try {
    var lista = deudasPropias();
    if (indice !== null && indice !== undefined) lista[indice] = nueva;
    else lista.push(nueva);

    await guardarDeudasPropias(lista);
    invalidarCache('config');
    cerrarModal();
    toast(indice !== null && indice !== undefined ? 'Deuda actualizada' : 'Anotada');
    pintarRuta();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
    toast(e.message, 'error');
  }
}

async function quitarDeudaDesdeGastos(indice) {
  try {
    var lista = deudasPropias();
    lista.splice(indice, 1);
    await guardarDeudasPropias(lista);
    invalidarCache('config');
    cerrarModal();
    toast('Listo');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ═══════════════════════════════════════════════════════════
   PLATA QUE ENTRÓ SIN SER UNA VENTA
   Lo que había al empezar, un aporte, una devolución. Se cargan
   como movimientos y se pueden editar o borrar, en vez de ser un
   número suelto en la configuración.
   ═══════════════════════════════════════════════════════════ */
function nuevoIngreso(datos) {
  var d = datos || {};

  abrirModal(d.id ? 'Editar el ingreso' : 'Entró plata',
    '<div class="campo-ayuda" style="margin-bottom:12px">' +
      'Para la plata que no viene de un remito: lo que tenían en caja antes de ' +
      'usar la app, un aporte de alguno de ustedes, una devolución.</div>' +

    '<div class="campo"><div class="campo-etiq">Cuánto entró</div>' +
      inputMonto('ni-monto', d.monto || '') + '</div>' +

    '<div class="campo"><div class="campo-etiq">De qué</div>' +
      '<select class="campo-input" id="ni-motivo" onchange="sugerirDescripcionIngreso()">' +
        MOTIVOS_INGRESO.map(function (m) {
          return '<option value="' + m.id + '"' +
            (d.motivo === m.id ? ' selected' : '') + '>' + esc(m.etiqueta) + '</option>';
        }).join('') +
      '</select></div>' +

    '<div class="campo"><div class="campo-etiq">Detalle</div>' +
      '<input class="campo-input" id="ni-desc" value="' + esc(d.descripcion || '') + '" ' +
             'placeholder="Ej: caja al arrancar con la app"/></div>' +

    '<div class="campo" style="margin:0"><div class="campo-etiq">Fecha</div>' +
      '<input class="campo-input" type="date" id="ni-fecha" value="' +
        esc(d.fechaISO || hoyISO()) + '"/></div>',

    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primario" style="flex:1;min-width:130px" id="btn-ni" ' +
              'onclick="guardarIngreso(' + (d.id || 'null') + ')">' +
        ic('check', 16) + ' Guardar</button>' +
      (d.id
        ? '<button class="btn btn-peligro" onclick="borrarIngreso(' + d.id + ')">' +
          ic('trash', 15) + ' Borrar</button>'
        : '') +
    '</div>');

  if (!d.id) sugerirDescripcionIngreso();
}

function sugerirDescripcionIngreso() {
  var sel = porId('ni-motivo');
  var desc = porId('ni-desc');
  if (!sel || !desc || desc.value.trim()) return;

  var m = MOTIVOS_INGRESO.find(function (x) { return x.id === sel.value; });
  desc.placeholder = m ? m.etiqueta : '';
}

async function guardarIngreso(id) {
  var monto = leerMonto('ni-monto');
  if (!monto) { toast('Falta el monto', 'error'); return; }

  var motivo = porId('ni-motivo').value;
  var m = MOTIVOS_INGRESO.find(function (x) { return x.id === motivo; });
  var desc = (porId('ni-desc').value || '').trim() || (m ? m.etiqueta : 'Ingreso');
  var iso = porId('ni-fecha').value || hoyISO();

  var btn = porId('btn-ni');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  var fila = {
    descripcion: desc,
    categoria: 'ingreso',
    monto: monto,
    fecha: fechaCorta(iso),
    pagado: true,
    pagado_por: 'empresa',
    notas: motivo
  };

  try {
    if (id) await actualizar('gastos', id, fila);
    else await crear('gastos', Object.assign({ created_at: new Date().toISOString() }, fila));

    invalidarCache('gastos');
    cerrarModal();
    toast(id ? 'Ingreso actualizado' : 'Anotado · ' + plata(monto) + ' entraron a la caja');
    pintarRuta();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
    toast(e.message, 'error');
  }
}

async function borrarIngreso(id) {
  try {
    await borrar('gastos', id);
    invalidarCache('gastos');
    cerrarModal();
    toast('Borrado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* La lista, para poder revisarlos y corregirlos */
function pintarIngresosSueltos() {
  var cont = porId('g-ingresos');
  if (!cont) return;

  var lista = ingresosSueltos(_gastos);
  if (!lista.length) { cont.innerHTML = ''; return; }

  var total = lista.reduce(function (a, g) { return a + (+g.monto || 0); }, 0);

  cont.innerHTML =
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('cash', 16) + ' Plata que entró' +
        '<span style="margin-left:auto"><span class="pin pin-ok">' + plata(total) + '</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +
        '<div class="campo-ayuda" style="margin-bottom:8px">' +
          'Ingresos que no vienen de un remito. Suman a la caja.</div>' +
        '<div class="lista">' +
          lista.map(function (g) {
            return '<button class="fila" onclick="editarIngreso(' + g.id + ')">' +
              '<span style="flex:0 0 auto;color:var(--ok)">' + ic('cash', 15) + '</span>' +
              '<div class="fila-principal">' +
                '<div class="fila-titulo">' + esc(g.descripcion) + '</div>' +
                '<div class="fila-sub">' + esc(fechaCorta(g.fecha)) + '</div>' +
              '</div>' +
              '<div class="fila-derecha">' +
                '<div class="fila-titulo" style="color:var(--ok)">+' + plata(g.monto) + '</div>' +
              '</div>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</details>';
}

function editarIngreso(id) {
  var g = _gastos.find(function (x) { return String(x.id) === String(id); });
  if (!g) return;
  nuevoIngreso({
    id: g.id,
    monto: +g.monto || 0,
    descripcion: g.descripcion,
    motivo: g.notas || 'otro',
    fechaISO: claveFecha(g.fecha) || hoyISO()
  });
}


/* ═══════════════════════════════════════════════════════════
   TODOS LOS GASTOS DEL PERÍODO
   Las tarjetas de arriba agrupan, pero para corregir algo hay
   que poder encontrarlo sin adivinar en qué grupo cayó.
   ═══════════════════════════════════════════════════════════ */
var _buscaGasto = '';

function setBuscaGasto(q) {
  _buscaGasto = q;
  pintarListaTodos();
}

function pintarTodosLosGastos() {
  var cont = porId('g-todos');
  if (!cont) return;

  var lista = gastosFiltrados();
  if (!lista.length) { cont.innerHTML = ''; return; }

  cont.innerHTML =
    '<details class="tarjeta" id="det-todos" ontoggle="if(this.open){pintarPeriodo();pintarListaTodos();}">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('db', 16) + ' Todos los gastos' +
        '<span style="margin-left:auto"><span class="pin pin-neutro">' +
          plural(lista.length, 'gasto') + '</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px" id="g-chips"></div>' +
        '<div id="g-rango"></div>' +
        '<div class="campo-ayuda" style="margin-bottom:8px">' +
          'Tocá cualquiera para corregirlo o borrarlo.</div>' +
        '<div class="buscador" style="margin-bottom:10px">' +
          '<span class="ic-lupa">' + ic('search', 15) + '</span>' +
          '<input class="campo-input" value="' + esc(_buscaGasto) + '" ' +
                 'placeholder="Buscar por descripción" oninput="setBuscaGasto(this.value)"/>' +
        '</div>' +
        '<div id="lista-todos"></div>' +
      '</div>' +
    '</details>';

  pintarListaTodos();
}

function pintarListaTodos() {
  var cont = porId('lista-todos');
  if (!cont) return;

  var lista = gastosFiltrados()
    .filter(function (g) {
      if (!_buscaGasto) return true;
      var q = normalizar(_buscaGasto);
      return normalizar(g.descripcion).indexOf(q) !== -1 ||
             normalizar(categoriaGasto(g.categoria).etiqueta).indexOf(q) !== -1;
    })
    .sort(function (a, b) {
      return (claveFecha(b.fecha || b.created_at) || '')
        .localeCompare(claveFecha(a.fecha || a.created_at) || '');
    });

  if (!lista.length) {
    cont.innerHTML = '<div class="campo-ayuda">Ninguno coincide con la búsqueda.</div>';
    return;
  }

  var total = lista.reduce(function (a, g) { return a + montoEmpresa(g); }, 0);

  cont.innerHTML =
    '<div class="lista">' + lista.map(filaGasto).join('') + '</div>' +
    '<div style="display:flex;justify-content:space-between;padding:9px 0;margin-top:4px;' +
         'border-top:2px solid var(--border)">' +
      '<strong>' + (_buscaGasto ? 'Lo que se ve' : 'Total del período') + '</strong>' +
      '<strong>' + plata(total) + '</strong></div>';
}


/* Editar una deuda desde la lista */
function editarDeudaDesdeGastos(indice) {
  var d = deudasPropias()[indice];
  if (!d) return;
  nuevaDeuda(Object.assign({ indice: indice }, d));
}
