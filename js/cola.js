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
function encolar(tabla, fila) {
  var cola = leerCola();
  cola.push({
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    tabla: tabla,
    fila: fila,
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
  if (navigator.onLine === false) return { subidos: 0, quedan: cola.length };

  _sincronizando = true;
  var subidos = 0, fallados = 0;

  for (var i = 0; i < cola.length; i++) {
    var item = cola[i];
    try {
      await crearDirecto(item.tabla, item.fila);
      sacarDeCola(item.id);
      invalidarCache(item.tabla);
      subidos++;
    } catch (e) {
      /* Si el error es de red, se reintenta después. Si es de datos,
         no tiene sentido insistir para siempre. */
      item.intentos++;
      item.ultimoError = e.message;
      fallados++;
      if (item.intentos >= 8) item.trabado = true;
      var actual = leerCola();
      var j = actual.findIndex(function (x) { return x.id === item.id; });
      if (j !== -1) { actual[j] = item; escribirCola(actual); }
    }
  }

  _sincronizando = false;
  actualizarBandaCola();

  if (subidos && !silencioso) {
    toast(subidos === 1 ? 'Se subió 1 remito que había quedado pendiente'
                        : 'Se subieron ' + subidos + ' guardados sin conexión');
    if (typeof pintarRuta === 'function') pintarRuta();
  }
  return { subidos: subidos, quedan: pendientesDeSubir(), fallados: fallados };
}

/* ── La banda de arriba ──────────────────────────────────── */
function actualizarBandaCola() {
  var n = pendientesDeSubir();
  var b = porId('banda-cola');

  if (!n) { if (b) b.remove(); document.body.classList.remove('con-banda'); return; }

  if (!b) {
    b = document.createElement('button');
    b.id = 'banda-cola';
    b.className = 'banda-cola';
    b.onclick = function () { sincronizarCola(); };
    document.body.insertBefore(b, document.body.firstChild);
    document.body.classList.add('con-banda');
  }
  b.innerHTML = ic('upload', 14) + ' ' +
    (n === 1 ? '1 remito sin subir' : n + ' remitos sin subir') +
    (navigator.onLine === false ? ' · sin conexión' : ' · tocá para reintentar');
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

  /* Por si el evento no llega: se reintenta cada dos minutos */
  setInterval(function () { sincronizarCola(true); }, 120000);
}
