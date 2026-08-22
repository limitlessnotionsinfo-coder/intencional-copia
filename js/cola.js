/* ═══════════════════════════════════════════════════════════
   COLA DE ENVÍO
   En la calle el señal se corta. Lo que no se pudo subir queda
   guardado en el teléfono y se manda solo cuando vuelve.
   ═══════════════════════════════════════════════════════════ */

var CLAVE_COLA = 'intencional_cola';
var _sincronizando = false;

function leerCola() {
  try {
    var c = JSON.parse(localStorage.getItem(CLAVE_COLA) || '[]');
    return Array.isArray(c) ? c : [];
  } catch (e) { return []; }
}

function escribirCola(cola) {
  try { localStorage.setItem(CLAVE_COLA, JSON.stringify(cola)); } catch (e) {}
}

function pendientesDeSubir() { return leerCola().length; }

/* Guarda una fila que no se pudo subir */
/* Guarda algo que no se pudo subir. `pk` viene solo cuando es una
   modificación: sin él es un alta. */
function encolar(tabla, fila, pk) {
  var cola = leerCola();
  cola.push({
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    tabla: tabla,
    fila: fila,
    pk: pk === undefined ? null : pk,
    intentos: 0,
    guardado: new Date().toISOString()
  });
  escribirCola(cola);
  actualizarBandaCola();
  return cola[cola.length - 1].id;
}

function sacarDeCola(id) {
  escribirCola(leerCola().filter(function (x) { return x.id !== id; }));
  actualizarBandaCola();
}

/* ── Subir lo que quedó pendiente ─────────────────────────────
   Se llama al arrancar, cuando vuelve la conexión y después de
   guardar algo. Nunca corre dos veces a la vez.
   ────────────────────────────────────────────────────────── */
async function sincronizarCola(silencioso) {
  if (_sincronizando) return { subidos: 0, quedan: pendientesDeSubir() };
  var cola = leerCola();
  if (!cola.length) return { subidos: 0, quedan: 0 };

  if (navigator.onLine === false) {
    if (!silencioso) toast('El teléfono está sin conexión', 'error');
    return { subidos: 0, quedan: cola.length };
  }

  _sincronizando = true;
  if (!silencioso) actualizarBandaCola('Subiendo…');

  var subidos = 0, fallados = 0, ultimoError = '';

  try {
    for (var i = 0; i < cola.length; i++) {
      var item = cola[i];
      try {
        /* Con pk es una modificación; sin pk, un alta */
        if (item.pk === null || item.pk === undefined) {
          await crearDirecto(item.tabla, item.fila);
        } else {
          await actualizarDirecto(item.tabla, item.pk, item.fila);
        }
        sacarDeCola(item.id);
        subidos++;
      } catch (e) {
        item.intentos++;
        item.ultimoError = e.message;
        ultimoError = e.message;
        fallados++;
        /* Si el error no es de red, no se arregla insistiendo:
           se marca para que se vea qué pasó. */
        if (!esErrorDeRed(e) || item.intentos >= 8) item.trabado = true;
        var actual = leerCola();
        var j = actual.findIndex(function (x) { return x.id === item.id; });
        if (j !== -1) { actual[j] = item; escribirCola(actual); }
      }
    }
  } finally {
    _sincronizando = false;
    actualizarBandaCola();
  }

  if (!silencioso) {
    if (subidos) {
      toast(subidos === 1 ? 'Se subió el remito que había quedado pendiente'
                          : 'Se subieron ' + subidos + ' remitos');
    } else if (fallados) {
      toast('No se pudo subir: ' + (ultimoError || 'error desconocido'), 'error');
    }
  }
  if (subidos && typeof pintarRuta === 'function') pintarRuta();

  return { subidos: subidos, quedan: pendientesDeSubir(), fallados: fallados };
}

/* Qué pasó con lo que no se pudo subir */
function verDetalleCola() {
  var cola = leerCola();
  if (!cola.length) { toast('No queda nada por subir'); return; }

  abrirModal(plural(cola.length, 'remito') + ' sin subir',
    '<div class="campo-ayuda" style="margin-bottom:10px">' +
      (navigator.onLine === false
        ? 'El teléfono está sin conexión. Se suben solos en cuanto vuelva.'
        : 'Se reintentan solos cada dos minutos y al volver la conexión.') + '</div>' +

    '<div class="lista">' +
      cola.map(function (x) {
        var f = x.fila || {};
        return '<div class="fila" style="cursor:default;align-items:flex-start">' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(f.cliente_nombre || x.tabla) +
              (x.pk !== null && x.pk !== undefined ? ' <span class="pin pin-neutro">cambio</span>' : '') +
            '</div>' +
            '<div class="fila-sub">' + esc(f.fecha || '') +
              (x.intentos ? ' · ' + plural(x.intentos, 'intento') : '') +
              (x.trabado
                ? '<br><span style="color:var(--danger)">Trabado: ' + esc(x.ultimoError || '') + '</span>'
                : '') +
            '</div>' +
          '</div>' +
          '<div class="fila-derecha">' +
            (f.total != null ? '<div class="fila-titulo">' + plata(f.total) + '</div>' : '') +
            (x.trabado
              ? '<button class="btn btn-fantasma" style="padding:2px 6px;font-size:11px" ' +
                'onclick="descartarDeCola(\'' + esc(x.id) + '\')">Descartar</button>'
              : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>',

    '<button class="btn btn-primario btn-bloque" onclick="cerrarModal();sincronizarCola()">' +
      ic('upload', 15) + ' Reintentar ahora</button>');
}

function descartarDeCola(id) {
  sacarDeCola(id);
  cerrarModal();
  toast('Descartado');
}

/* ── La banda de arriba ──────────────────────────────────── */
/* La banda va abajo, sobre la barra de navegación: arriba tapaba
   el botón de configuraciones. */
function actualizarBandaCola(texto) {
  var n = pendientesDeSubir();
  var b = porId('banda-cola');

  if (!n) { if (b) b.remove(); document.body.classList.remove('con-banda'); return; }

  if (!b) {
    b = document.createElement('button');
    b.id = 'banda-cola';
    b.className = 'banda-cola';
    b.onclick = verDetalleCola;
    document.body.appendChild(b);
    document.body.classList.add('con-banda');
  }

  var trabados = leerCola().filter(function (x) { return x.trabado; }).length;
  b.innerHTML = ic('upload', 14) + ' ' + (texto ||
    ((n === 1 ? '1 remito sin subir' : n + ' remitos sin subir') +
     (navigator.onLine === false ? ' · sin conexión'
      : trabados ? ' · ' + trabados + ' con error, tocá para ver'
      : ' · subiendo solos')));
  b.classList.toggle('con-error', trabados > 0);
}

/* ── Arranque ────────────────────────────────────────────── */
function arrancarCola() {
  actualizarBandaCola();
  sincronizarCola(true);

  window.addEventListener('online', function () {
    actualizarBandaCola();
    sincronizarCola();
  });
  window.addEventListener('offline', actualizarBandaCola);

  /* Al volver a la app desde segundo plano */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) sincronizarCola(true);
  });
  window.addEventListener('focus', function () { sincronizarCola(true); });

  /* Y por las dudas, cada minuto */
  setInterval(function () { sincronizarCola(true); }, 60000);
}
