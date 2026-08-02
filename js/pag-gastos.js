/* ═══════════════════════════════════════════════════════════
   GASTOS — carga rápida y corte por mes.
   ═══════════════════════════════════════════════════════════ */

var CAT_GASTO = ['combustible','impuestos','insumos','mantenimiento','sueldos','otro'];
var _gastos = [], _mesGasto = '';

registrarPagina({
  id: 'gastos',
  menu: 'Gastos',
  grupo: 'Plata',
  icono: 'wallet',
  titulo: 'Gastos',
  subtitulo: 'Lo que sale, mes por mes',

  async montar(cont) {
    _gastos = (await traerCacheado('gastos')).slice().reverse();
    if (!_mesGasto) _mesGasto = claveMes(hoyTexto());
    cont.innerHTML =
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">' +
        selectorMes('_mesGasto', _gastos, 'pintarGastos') +
        '<button class="btn btn-primario" style="margin-left:auto" onclick="nuevoGasto()">' + ic('plus', 15) + ' Cargar gasto</button>' +
      '</div>' +
      '<div id="cont-gastos"></div>';
    pintarGastos();
  }
});

function pintarGastos() {
  var lista = _gastos.filter(function (g) { return claveMes(g.fecha || g.created_at) === _mesGasto; });
  var total = lista.reduce(function (s, g) { return s + (+g.monto || 0); }, 0);

  var porCat = {};
  lista.forEach(function (g) { porCat[g.categoria || 'otro'] = (porCat[g.categoria || 'otro'] || 0) + (+g.monto || 0); });

  porId('cont-gastos').innerHTML =
    '<div class="grilla-stats" style="margin-bottom:14px">' +
      stat('wallet', 'Total del mes', plata(total), plural(lista.length, 'gasto'), 'var(--danger)') +
      Object.keys(porCat).sort(function (a, b) { return porCat[b] - porCat[a]; }).slice(0, 3).map(function (c) {
        return stat('tag', capitalizar(c), plata(porCat[c]), '', 'var(--text2)');
      }).join('') +
    '</div>' +
    (lista.length
      ? '<div class="lista">' + lista.map(function (g) {
          return '<div class="fila" style="cursor:default">' +
            '<div class="fila-principal">' +
              '<div class="fila-titulo">' + esc(g.descripcion || '—') + '</div>' +
              '<div class="fila-sub">' + esc(fechaCorta(g.fecha)) + ' · ' + esc(capitalizar(g.categoria || 'otro')) +
                (g.notas ? ' · ' + esc(g.notas) : '') + '</div>' +
            '</div>' +
            '<div class="fila-derecha"><div class="fila-titulo">' + plata(g.monto) + '</div></div>' +
          '</div>';
        }).join('') + '</div>'
      : vacio('wallet', 'Sin gastos este mes', 'Cargá el primero para que aparezca acá.'));
}

function nuevoGasto() {
  abrirModal('Cargar gasto',
    '<div class="campo"><div class="campo-etiq">Descripción</div>' +
      '<input class="campo-input" id="g-desc" placeholder="Ej: nafta Scenic"/></div>' +
    '<div class="campo"><div class="campo-etiq">Monto</div>' +
      '<input class="campo-input" id="g-monto" type="number" inputmode="decimal" min="0" placeholder="0"/></div>' +
    '<div class="campo"><div class="campo-etiq">Categoría</div>' +
      '<select class="campo-input" id="g-cat">' +
        CAT_GASTO.map(function (c) { return '<option value="' + c + '">' + capitalizar(c) + '</option>'; }).join('') +
      '</select></div>' +
    '<div class="campo"><div class="campo-etiq">Fecha</div>' +
      '<input class="campo-input" id="g-fecha" value="' + hoyTexto() + '"/></div>' +
    '<div class="campo" style="margin:0"><div class="campo-etiq">Nota (opcional)</div>' +
      '<input class="campo-input" id="g-notas"/></div>',
    '<button class="btn btn-primario btn-bloque" onclick="guardarGasto()">Guardar gasto</button>');
}

async function guardarGasto() {
  var monto = +porId('g-monto').value || 0;
  var desc = (porId('g-desc').value || '').trim();
  if (!desc) { toast('Escribí una descripción', 'error'); return; }
  if (monto <= 0) { toast('El monto tiene que ser mayor a cero', 'error'); return; }
  try {
    await crear('gastos', {
      descripcion: desc, monto: monto,
      categoria: porId('g-cat').value,
      fecha: (porId('g-fecha').value || hoyTexto()).trim(),
      notas: (porId('g-notas').value || '').trim() || null,
      created_at: new Date().toISOString()
    });
    cerrarModal();
    toast('Gasto guardado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* Selector de mes compartido por Gastos, Compras y Métricas */
function selectorMes(nombreVar, filas, alCambiar) {
  var meses = {};
  (filas || []).forEach(function (f) {
    var m = claveMes(f.fecha || f.created_at);
    if (m) meses[m] = 1;
  });
  meses[claveMes(hoyTexto())] = 1;
  var ordenados = Object.keys(meses).sort().reverse();
  return '<select class="campo-input" style="width:auto" onchange="' + nombreVar + '=this.value;' + alCambiar + '()">' +
    ordenados.map(function (m) {
      var p = m.split('-');
      var sel = window[nombreVar] === m ? ' selected' : '';
      return '<option value="' + m + '"' + sel + '>' + capitalizar(MESES[+p[1] - 1]) + ' ' + p[0] + '</option>';
    }).join('') + '</select>';
}
