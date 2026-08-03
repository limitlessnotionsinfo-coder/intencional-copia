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

    cont.innerHTML =
      '<details class="tarjeta" id="det-filtros-gastos">' +
        '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('shuffle', 16) + ' Filtros' +
          '<span style="margin-left:auto" id="g-chip-filtro"></span>' +
        '</summary>' +
        '<div class="tarjeta-cuerpo">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="g-chips"></div>' +
          '<div id="g-rango"></div>' +
          '<div id="g-categorias" style="display:flex;gap:6px;flex-wrap:wrap"></div>' +
        '</div>' +
      '</details>' +
      '<div id="g-cierre"></div>' +
      '<div id="g-balance"></div>' +
      '<div id="g-resumen"></div>' +
      '<div class="atajos" style="margin:14px 0">' + botonesRapidos() + '</div>' +
      '<div id="g-lista"></div>';

    pintarGastos();
  }
});

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

  botones.push('<button class="atajo atajo-rojo" onclick="gastoDeuda()">' + ic('clock', 17) +
    '<span>Deuda' + (deuda ? ' · ' + plata(deuda) : '') + '</span></button>');

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
    compartir: p.modo === 'empresa',
    entreSocios: p.modo === 'socios'
  });
}

function gastoNafta()        { desdePlantilla('combustible'); }
function pagarSueldo()       { desdePlantilla('sueldo_empleado'); }
function sueldoSocio(nombre) { desdePlantilla('sueldo_socio', nombre); }
function gastoDeuda()        { desdePlantilla('deuda'); }

/* ── Período ─────────────────────────────────────────────── */
function rangoGastos() {
  var hoy = hoyISO();
  if (G.periodo === 'dia')    return { desde: hoy, hasta: hoy, etiqueta: 'Hoy' };
  if (G.periodo === 'semana') return { desde: isoDe(sumarDias(-6)), hasta: hoy, etiqueta: 'Últimos 7 días' };
  if (G.periodo === 'mes')    return { desde: isoDe(sumarDias(-29)), hasta: hoy, etiqueta: 'Últimos 30 días' };
  return {
    desde: G.desde || '0000-00-00',
    hasta: G.hasta || '9999-99-99',
    etiqueta: (G.desde ? fechaCorta(G.desde) : 'el principio') + ' a ' + (G.hasta ? fechaCorta(G.hasta) : 'hoy')
  };
}

function setPeriodoGasto(p) { G.periodo = p; pintarGastos(); }
function setFechaGasto(cual, v) { G[cual] = v; G.periodo = 'rango'; pintarGastos(); }
function setCategoriaGasto(c) { G.categoria = c; pintarGastos(); }

function gastosFiltrados() {
  var r = rangoGastos();
  return _gastos.filter(function (g) {
    if (G.categoria && (g.categoria || 'otro') !== G.categoria) return false;
    var k = claveFecha(g.fecha || g.created_at);
    return k && k >= r.desde && k <= r.hasta;
  });
}

/* ── Pintado ─────────────────────────────────────────────── */
function pintarGastos() {
  porId('g-chips').innerHTML = [['dia', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes'], ['rango', 'Rango']]
    .map(function (o) {
      return '<button class="btn ' + (G.periodo === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
        'style="padding:7px 15px" onclick="setPeriodoGasto(\'' + o[0] + '\')">' + o[1] + '</button>';
    }).join('');

  porId('g-rango').innerHTML = G.periodo === 'rango'
    ? '<div class="grilla-fechas">' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Desde</div>' +
          '<input class="campo-input" type="date" value="' + esc(G.desde) + '" onchange="setFechaGasto(\'desde\',this.value)"/></div>' +
        '<div class="campo" style="margin:0"><div class="campo-etiq">Hasta</div>' +
          '<input class="campo-input" type="date" value="' + esc(G.hasta) + '" onchange="setFechaGasto(\'hasta\',this.value)"/></div>' +
      '</div>'
    : '';

  porId('g-categorias').innerHTML =
    '<button class="btn ' + (!G.categoria ? 'btn-primario' : 'btn-secundario') + '" ' +
      'style="padding:5px 12px;font-size:12px" onclick="setCategoriaGasto(\'\')">Todas</button>' +
    CATEGORIAS_GASTO.map(function (c) {
      return '<button class="btn ' + (G.categoria === c.id ? 'btn-primario' : 'btn-secundario') + '" ' +
        'style="padding:5px 12px;font-size:12px" onclick="setCategoriaGasto(\'' + c.id + '\')">' +
        ic(c.icono, 13) + ' ' + esc(c.etiqueta) + '</button>';
    }).join('');

  var lista = gastosFiltrados();
  var total = lista.reduce(function (s, g) { return s + (+g.monto || 0); }, 0);
  var r = rangoGastos();

  pintarCierre(lista, r);

  /* Balance: cuánto le corresponde a cada uno al cerrar */
  var balances = balancesTodos(lista);
  porId('g-balance').innerHTML = balances.length
    ? '<div class="tarjeta"><div class="tarjeta-cuerpo">' +
        '<div class="campo-etiq" style="margin-bottom:8px">Al cerrar ' + esc(r.etiqueta.toLowerCase()) + '</div>' +
        balances.map(function (x) {
          var b = x.balance;
          return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0">' +
            '<div>' +
              '<strong>' + esc(x.quien) + '</strong>' +
              '<div class="campo-ayuda">' +
                (b.neto > 0 ? 'puso de más' : b.neto < 0 ? 'le cubrieron de más' : 'está a mano') +
                (b.aCobrar && b.aDevolver ? ' · puso ' + plata(b.aCobrar) + ', le tocaba ' + plata(b.aDevolver) : '') +
              '</div>' +
            '</div>' +
            '<span style="font-weight:700;font-size:17px;color:' +
              (b.neto > 0 ? 'var(--ok)' : b.neto < 0 ? 'var(--warn)' : 'var(--muted)') + '">' +
              (b.neto > 0 ? '+' : '') + plata(b.neto) + '</span>' +
          '</div>';
        }).join('') +
        '<div class="campo-ayuda" style="margin-top:8px">Positivo: hay que devolverle. Negativo: tiene que poner.</div>' +
      '</div></div>'
    : '';

  var chipF = porId('g-chip-filtro');
  if (chipF) {
    chipF.innerHTML = '<span class="pin pin-neutro">' + esc(r.etiqueta) +
      (G.categoria ? ' · ' + esc(categoriaGasto(G.categoria).etiqueta) : '') + '</span>';
  }

  var porCat = {};
  lista.forEach(function (g) {
    var c = g.categoria || 'otro';
    porCat[c] = (porCat[c] || 0) + (+g.monto || 0);
  });

  porId('g-resumen').innerHTML =
    '<div class="campo-ayuda" style="margin-bottom:8px">' + esc(r.etiqueta) + '</div>' +
    '<div class="grilla-stats">' +
      stat('wallet', 'Total', plata(total), plural(lista.length, 'gasto'), 'var(--danger)') +
      Object.keys(porCat).sort(function (a, b2) { return porCat[b2] - porCat[a]; }).slice(0, 3)
        .map(function (c) {
          var cat = categoriaGasto(c);
          return stat(cat.icono, cat.etiqueta, plata(porCat[c]), '', 'var(--text2)');
        }).join('') +
    '</div>';

  porId('g-lista').innerHTML = lista.length
    ? porGrupo(lista)
    : vacio('wallet', 'Sin gastos en este período', 'Cambiá el filtro o cargá el primero.');
}

function filaGasto(g) {
  var cat = categoriaGasto(g.categoria);
  var partes = partesGasto(g).filter(function (p) { return +p.monto > 0; });
  var saldo = g.pagado_por && g.pagado_por !== 'empresa' ? saldoDeGasto(g, g.pagado_por) : 0;

  return '<div class="fila" style="cursor:default;align-items:flex-start">' +
    '<div class="fila-principal">' +
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
          ? '<span class="pin pin-neutro">puso ' + esc(g.pagado_por === 'empresa' ? 'la empresa' : g.pagado_por) + '</span>'
          : '') +
        (saldo > 0 ? ' <span class="pin pin-ok">le deben ' + plata(saldo) + '</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(g.monto) + '</div>' +
      (!gastoPagado(g)
        ? '<button class="btn btn-primario" style="padding:4px 10px;font-size:11px;margin-top:4px" ' +
          'onclick="abrirPago(' + g.id + ')">' + ic('cash', 13) + ' Pagar</button>'
        : '') +
      '<button class="btn btn-fantasma" style="padding:2px 6px;font-size:11px" onclick="borrarGasto(' + g.id + ')">Borrar</button>' +
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
  if (g.categoria === 'empleado') {
    var esDueno = nombres.some(function (n) { return desc.indexOf(n) !== -1; });
    return esDueno ? 'duenos' : 'empleado';
  }
  return 'otros';
}

var GRUPOS = [
  { id: 'duenos',      etiqueta: 'Sueldos de los dueños', icono: 'wallet' },
  { id: 'empleado',    etiqueta: 'Sueldo del empleado',   icono: 'user' },
  { id: 'combustible', etiqueta: 'Combustible',           icono: 'fuel' },
  { id: 'deuda',       etiqueta: 'Deuda',                 icono: 'clock' },
  { id: 'insumos',     etiqueta: 'Insumos y pedidos',     icono: 'box' },
  { id: 'otros',       etiqueta: 'Otros gastos',          icono: 'tag' }
];

function porGrupo(lista) {
  var grupos = {};
  lista.forEach(function (g) { (grupos[grupoDe(g)] = grupos[grupoDe(g)] || []).push(g); });

  return GRUPOS.filter(function (gr) { return grupos[gr.id]; }).map(function (gr) {
    var items = grupos[gr.id];
    var total = items.reduce(function (a, g) { return a + (+g.monto || 0); }, 0);
    return '<details class="tarjeta" open>' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic(gr.icono, 16) + ' ' + esc(gr.etiqueta) +
        '<span style="margin-left:auto;display:inline-flex;gap:6px;align-items:center">' +
          '<span class="pin pin-neutro">' + plural(items.length, 'gasto') + '</span>' +
          '<strong>' + plata(total) + '</strong>' +
        '</span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo" style="padding:0">' +
        '<div class="lista" style="border:none;border-radius:0">' + items.map(filaGasto).join('') + '</div>' +
      '</div>' +
    '</details>';
  }).join('');
}

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
    pagadoPor: 'empresa', porcentaje: porcentajeEmpresa(),
    compartir: false,      // se reparte entre la empresa y quien lo pagó
    entreSocios: false     // se reparte entre los dueños, sin la empresa
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
    '<div class="campo-etiq">¿Cómo se reparte el costo?</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      [['solo', 'Lo cubre entero quien lo pagó'],
       ['empresa', 'Entre la empresa y ' + esc(NG.pagadoPor === 'empresa' ? 'un socio' : NG.pagadoPor)],
       ['socios', 'Entre los dueños']].map(function (o) {
        var activo = (o[0] === 'solo' && !NG.compartir && !NG.entreSocios) ||
                     (o[0] === 'empresa' && NG.compartir && !NG.entreSocios) ||
                     (o[0] === 'socios' && NG.entreSocios);
        return '<button class="btn ' + (activo ? 'btn-primario' : 'btn-secundario') + '" ' +
          'style="padding:6px 12px;font-size:12px" onclick="setModoReparto(\'' + o[0] + '\')">' + o[1] + '</button>';
      }).join('') +
      (cat.compartido && !NG.compartir && !NG.entreSocios ? ' <span class="pin pin-warn">suele repartirse</span>' : '') +
    '</div>' +

    (NG.compartir && !NG.entreSocios
      ? '<div class="campo"><div class="campo-etiq">Paga la empresa (%)</div>' +
          '<input class="campo-input" type="number" min="0" max="100" inputmode="numeric" ' +
                 'style="max-width:120px" value="' + rep.porcentaje + '" ' +
                 'oninput="NG.porcentaje=Math.max(0,Math.min(100,+this.value||0));refrescarReparto()"/>' +
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

  if (NG.entreSocios) {
    var lista = socios();
    var cada = Math.floor(total / (lista.length || 1));
    lista.forEach(function (s2, i) {
      r[s2] = i === lista.length - 1 ? total - cada * (lista.length - 1) : cada;
    });
    return r;
  }

  if (NG.compartir) {
    var rep = repartirGasto(total, NG.porcentaje);
    r.empresa = rep.empresa;
    r[NG.pagadoPor === 'empresa' ? (socios()[0] || 'Socio') : NG.pagadoPor] = rep.personal;
    return r;
  }

  r[NG.pagadoPor] = total;
  return r;
}

function bloqueReparto() {
  var r = repartoActual();
  var claves = Object.keys(r).filter(function (k) { return r[k]; });
  if (claves.length < 2) return '';

  var puso = NG.pagadoPor;
  var deben = claves.filter(function (k) { return k !== puso; })
    .map(function (k) { return esc(k === 'empresa' ? 'la empresa' : k) + ' ' + plata(r[k]); });

  return '<div class="aviso aviso-ok">' + ic('scale', 15) +
    '<div>' + claves.map(function (k) {
      return '<strong>' + esc(k === 'empresa' ? 'Empresa' : k) + '</strong> ' + plata(r[k]);
    }).join(' · ') +
    (deben.length && puso
      ? '<br>Lo puso ' + esc(puso === 'empresa' ? 'la empresa' : puso) + ', así que le deben: ' + deben.join(' · ')
      : '') +
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
  NG.compartir = modo === 'empresa';
  NG.entreSocios = modo === 'socios';
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
  if (categoriaGasto(c).compartido && !NG.compartir) NG.compartir = true;
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
    '<details class="tarjeta">' +
      '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('scale', 16) + ' Cierre de ' + esc(rango.etiqueta.toLowerCase()) +
        '<span style="margin-left:auto"><span class="pin ' + (c.alcanza ? 'pin-ok' : 'pin-danger') + '">' +
          (c.alcanza ? 'alcanza' : 'faltan ' + plata(c.falta)) + '</span></span>' +
      '</summary>' +
      '<div class="tarjeta-cuerpo">' +

        '<div class="campo-etiq">Entró</div>' +
        '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">' +
          '<span>Cobrado en ' + plural(c.entradas.remitos, 'remito') + '</span>' +
          '<strong>' + plata(c.entradas.cobrado) + '</strong></div>' +
        (c.entradas.deuda
          ? '<div class="campo-ayuda">Además quedaron ' + plata(c.entradas.deuda) + ' en deuda, que todavía no entraron.</div>'
          : '') +
        '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:var(--danger)">' +
          '<span>Ya se gastó</span><strong>− ' + plata(c.yaGastado) + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);font-size:13px">' +
          '<span>Queda disponible</span>' +
          '<strong style="color:' + (c.disponible >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + plata(c.disponible) + '</strong></div>' +

        '<div class="campo-etiq" style="margin-top:14px">Falta pagar</div>' +
        c.compromisos.items.map(function (i) {
          return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">' +
            '<span>' + esc(i.concepto) + ' <span class="campo-ayuda">· cada ' + esc(i.cada) + '</span></span>' +
            '<strong>' + plata(i.monto) + '</strong></div>';
        }).join('') +
        '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border);font-size:13px">' +
          '<span>Total a pagar</span><strong>' + plata(c.compromisos.total) + '</strong></div>' +

        '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);margin:10px 0;cursor:pointer">' +
          '<input type="checkbox"' + (conDeuda ? ' checked' : '') + ' onchange="alternarDeuda()"/> ' +
          'Incluir la deuda de este mes' +
        '</label>' +

        avisoHTML(c.alcanza ? 'ok' : 'danger',
          c.alcanza
            ? '<strong>Alcanza.</strong> Después de pagar todo quedan ' + plata(c.sobra) + '.'
            : '<strong>No alcanza:</strong> faltan ' + plata(c.falta) + '. ' +
              (c.entradas.deuda ? 'Cobrar las deudas pendientes cubriría ' + plata(Math.min(c.falta, c.entradas.deuda)) + '.' : ''),
          c.alcanza ? 'check' : 'alert') +
      '</div>' +
    '</details>';
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
