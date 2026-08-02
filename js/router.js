/* ═══════════════════════════════════════════════════════════
   RUTAS — navegación por hash (#/clientes). Cada página se
   registra sola con registrarPagina() y el router se encarga
   del resto: pintar, marcar el menú, manejar errores.
   ═══════════════════════════════════════════════════════════ */

var PAGINAS = {};
var rutaActual = '';

/* def = { id, titulo, subtitulo, icono, menu, grupo, montar(cont, params) } */
function registrarPagina(def) { PAGINAS[def.id] = def; }

function irA(id, params) {
  var hash = '#/' + id + (params ? '?' + params : '');
  if (location.hash === hash) pintarRuta();
  else location.hash = hash;
}

function leerRuta() {
  var h = (location.hash || '').replace(/^#\/?/, '');
  var i = h.indexOf('?');
  return {
    id: (i === -1 ? h : h.slice(0, i)) || 'inicio',
    params: new URLSearchParams(i === -1 ? '' : h.slice(i + 1))
  };
}

async function pintarRuta() {
  var r = leerRuta();
  var pagina = PAGINAS[r.id] || PAGINAS.inicio;
  rutaActual = pagina.id;

  marcarMenu(pagina.id);

  var cont = porId('contenido');
  cont.innerHTML =
    '<div class="contenido-ancho">' +
      '<div class="cabecera">' +
        '<h1>' + esc(pagina.titulo) + '</h1>' +
        (pagina.subtitulo ? '<p>' + esc(pagina.subtitulo) + '</p>' : '') +
      '</div>' +
      '<div id="cuerpo-pagina">' + cargando() + '</div>' +
    '</div>';

  var cuerpo = porId('cuerpo-pagina');
  window.scrollTo(0, 0);

  try {
    await pagina.montar(cuerpo, r.params);
  } catch (e) {
    console.error('[' + pagina.id + ']', e);
    cuerpo.innerHTML = avisoHTML('danger',
      '<strong>No se pudo cargar esta pantalla.</strong><br>' + esc(e.message) +
      '<br><button class="btn btn-secundario" style="margin-top:10px" onclick="pintarRuta()">Reintentar</button>');
  }
}

function marcarMenu(id) {
  $$('.nav-item, .tab-inferior').forEach(function (b) {
    if (b.dataset.pagina === id) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}

/* En el celular, las cinco pantallas de todos los días quedan
   siempre a un toque, sin abrir el menú lateral. */
var TABS_INFERIORES = ['inicio', 'remito', 'hechos', 'clientes', 'metricas'];

function construirBarraInferior() {
  var cont = porId('barra-inferior');
  if (!cont) return;
  cont.innerHTML = TABS_INFERIORES.map(function (id) {
    var p = PAGINAS[id];
    if (!p) return '';
    return '<button class="tab-inferior" data-pagina="' + id + '" onclick="irA(\'' + id + '\')">' +
      ic(p.icono, 20) + '<span>' + esc(p.menu) + '</span></button>';
  }).join('');
}

function construirMenu() {
  var grupos = {};
  Object.keys(PAGINAS).forEach(function (id) {
    var p = PAGINAS[id];
    if (!p.menu) return;
    (grupos[p.grupo || 'General'] = grupos[p.grupo || 'General'] || []).push(p);
  });
  var html = '';
  Object.keys(grupos).forEach(function (g) {
    html += '<div class="nav-grupo">' + esc(g) + '</div>';
    grupos[g].forEach(function (p) {
      html += '<button class="nav-item" data-pagina="' + p.id + '" onclick="irA(\'' + p.id + '\')">' +
                '<span class="nav-ic">' + ic(p.icono, 17) + '</span>' + esc(p.menu) +
              '</button>';
    });
  });
  porId('nav').innerHTML = html;
}

window.addEventListener('hashchange', pintarRuta);
