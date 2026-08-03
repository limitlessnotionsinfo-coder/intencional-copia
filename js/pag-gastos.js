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

function gastoNafta() {
  nuevoGasto({ descripcion: 'Nafta Etios', categoria: 'combustible', compartir: true });
}

/* El sueldo del empleado lo ponen los dos dueños */
function pagarSueldo() {
  var e = empleadoConfig();
  nuevoGasto({
    descripcion: 'Sueldo' + (e.nombre ? ' de ' + e.nombre : ''),
    monto: e.sueldo,
    categoria: 'empleado',
    compartir: true,
    entreSocios: true,
    pagadoPor: socios()[0] || 'empresa'
  });
}

function sueldoSocio(nombre) {
  nuevoGasto({
    descripcion: 'Sueldo ' + nombre,
    monto: sueldosSocios()[nombre] || 0,
    categoria: 'empleado',
    compartir: false,
    pagadoPor: 'empresa'
  });
}

function gastoDeuda() {
  nuevoGasto({
    descripcion: 'Pago de deuda',
    monto: +leerConfig('monto_deuda', 0) || 0,
    categoria: 'otro',
    compartir: false,
    pagadoPor: 'empresa'
  });
}

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
    ? '<div class="lista">' + lista.map(filaGasto).join('') + '</div>'
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
      (g.pagado_por
        ? '<div style="margin-top:4px"><span class="pin pin-neutro">puso ' + esc(g.pagado_por === 'empresa' ? 'la empresa' : g.pagado_por) + '</span>' +
          (saldo > 0 ? ' <span class="pin pin-ok">le deben ' + plata(saldo) + '</span>' : '') +
          '</div>'
        : '') +
    '</div>' +
    '<div class="fila-derecha">' +
      '<div class="fila-titulo">' + plata(g.monto) + '</div>' +
      '<button class="btn btn-fantasma" style="padding:2px 6px;font-size:11px" onclick="borrarGasto(' + g.id + ')">Borrar</button>' +
    '</div>' +
  '</div>';
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
      ? '<div class="campo"><div class="campo-etiq">Paga la empresa</div>' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<input type="range" min="0" max="100" step="5" value="' + rep.porcentaje + '" ' +
                   'style="flex:1" oninput="NG.porcentaje=+this.value;refrescarReparto()"/>' +
            '<span style="min-width:44px;text-align:right;font-weight:700" id="ng-pct">' + rep.porcentaje + '%</span>' +
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
  var pct = porId('ng-pct');
  if (pct) pct.textContent = repartirGasto(NG.monto, NG.porcentaje).porcentaje + '%';
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


