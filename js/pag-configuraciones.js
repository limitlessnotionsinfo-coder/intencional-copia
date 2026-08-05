/* ═══════════════════════════════════════════════════════════
   CONFIGURACIONES — lo que se cambia poco pero se cambia.
   ═══════════════════════════════════════════════════════════ */

registrarPagina({
  id: 'configuraciones',
  menu: 'Configuraciones',
  grupo: 'Ajustes',
  icono: 'settings',
  titulo: 'Configuraciones',
  subtitulo: 'Precios, aviso de aumento y datos de la cuenta',

  async montar(cont) {
    _prods = null;
    await cargarConfig().catch(function () {});
    await cargarFeriados().catch(function () {});
    var cfg = aumentoConfig();

    cont.innerHTML =
      '<details class="tarjeta">' +
        '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('megaphone', 16) + ' Aviso de aumento</summary>' +
        '<div class="tarjeta-cuerpo">' +
          '<div class="campo-ayuda" style="margin-bottom:14px">' +
            'El aviso sale dentro del remito solo para los clientes que todavía no fueron notificados. ' +
            'Al confirmar el remito, el cliente queda marcado con la fecha.' +
          '</div>' +

          '<label style="display:flex;align-items:center;gap:8px;margin-bottom:16px;cursor:pointer;font-size:13px">' +
            '<input type="checkbox" id="cfg-activo"' + (cfg.activo ? ' checked' : '') + ' onchange="previewAviso()"/> ' +
            'Mostrar el aviso en los remitos' +
          '</label>' +

          '<div class="campo"><div class="campo-etiq">Producto que aumenta</div>' +
            '<input class="campo-input" id="cfg-producto" list="opciones-prod" value="' + esc(cfg.producto) + '" oninput="previewAviso()"/>' +
            '<datalist id="opciones-prod">' +
              productos().map(function (p) { return '<option value="' + esc(p.nombre) + '">'; }).join('') +
            '</datalist>' +
          '</div>' +

          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="campo"><div class="campo-etiq">Precio actual</div>' +
              '<input class="campo-input" id="cfg-viejo" type="number" inputmode="decimal" min="0" ' +
                     'value="' + cfg.viejo + '" oninput="previewAviso()"/>' +
              '<div class="campo-ayuda">Para quien no fue avisado</div></div>' +
            '<div class="campo"><div class="campo-etiq">Precio nuevo</div>' +
              '<input class="campo-input" id="cfg-nuevo" type="number" inputmode="decimal" min="0" ' +
                     'value="' + cfg.nuevo + '" oninput="previewAviso()"/>' +
              '<div class="campo-ayuda">Para quien ya sabe</div></div>' +
          '</div>' +

          '<div id="preview-aviso"></div>' +
          '<button class="btn btn-primario btn-bloque" style="margin-top:14px" onclick="guardarAumento()">Guardar</button>' +
        '</div>' +
      '</details>' +

      tarjetaAvisos() +
      tarjetaEmpleado() +
      tarjetaProductos() +
      tarjetaRutas() +
      tarjetaFeriados() +
      tarjetaAlias() +
      tarjetaMensaje() +

      tarjetaConexion() +

      '<div class="tarjeta">' +
        '<div class="tarjeta-cab">' + ic('db', 16) + ' Sesión y datos</div>' +
        '<div class="tarjeta-cuerpo">' +
          '<div class="campo-ayuda" style="margin-bottom:12px">' +
            'Los datos se guardan en <strong>' + esc(refProyecto(SB_URL)) + '</strong>. ' +
            'Si algo se ve desactualizado, volvé a leer la base.' +
          '</div>' +
          '<button class="btn btn-secundario" onclick="invalidarCache();pintarRuta();toast(\'Datos actualizados\')">' +
            ic('refresh', 15) + ' Volver a leer la base</button> ' +
          (PEDIR_LOGIN ? '<button class="btn btn-secundario" onclick="salir()">' + ic('undo', 15) + ' Cerrar sesión</button>' : '') +
        '</div>' +
      '</div>';

    previewAviso();
    previewCalendario();
    previewMensaje();
    previewDeuda();
    ['cfg-alias', 'cfg-tel', 'cfg-horas'].forEach(function (id) {
      var el = porId(id); if (el) el.oninput = previewDeuda;
    });
  }
});

function previewAviso() {
  var activo = porId('cfg-activo').checked;
  var nuevo = +porId('cfg-nuevo').value || 0;
  porId('preview-aviso').innerHTML = activo && nuevo
    ? avisoHTML('warn', '<strong>Aviso:</strong> ' + esc(textoAviso(nuevo)), 'megaphone')
    : '<div class="campo-ayuda" style="margin-top:10px">Con el aviso apagado, los remitos salen sin ese texto.</div>';
}

async function guardarAumento() {
  var activo = porId('cfg-activo').checked;
  var producto = (porId('cfg-producto').value || '').trim();
  var viejo = +porId('cfg-viejo').value || 0;
  var nuevo = +porId('cfg-nuevo').value || 0;

  if (activo && (!viejo || !nuevo)) { toast('Cargá los dos precios', 'error'); return; }
  if (activo && !producto) { toast('Escribí qué producto aumenta', 'error'); return; }

  try {
    await guardarConfig(CFG_AUMENTO.activo, activo ? 'true' : 'false');
    await guardarConfig(CFG_AUMENTO.producto, producto);
    await guardarConfig(CFG_AUMENTO.viejo, viejo);
    await guardarConfig(CFG_AUMENTO.nuevo, nuevo);
    toast('Configuración guardada');
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Conexión: a qué base apunta la app ──────────────────── */
function tarjetaConexion() {
  var propia = SB_URL !== SB_BASE.url;
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('signal', 16) + ' Base de datos' +
      '<span style="margin-left:auto"><span class="pin pin-ok">' + esc(CONEXION.nombre) + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:14px">' +
        'Proyecto actual: <strong>' + esc(refProyecto(SB_URL)) + '</strong>. ' +
        'Solo cambialo si estás moviendo la app a otro proyecto de Supabase.' +
      '</div>' +

      '<div class="campo"><div class="campo-etiq">Nombre</div>' +
        '<input class="campo-input" id="cx-nombre" placeholder="Intencional" value="' + esc(CONEXION.nombre) + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">URL del proyecto</div>' +
        '<input class="campo-input" id="cx-url" placeholder="https://xxxxxxxx.supabase.co" value="' + esc(SB_URL) + '"/></div>' +
      '<div class="campo"><div class="campo-etiq">Clave publishable</div>' +
        '<input class="campo-input" id="cx-key" placeholder="sb_publishable_…" value="' + esc(SB_KEY) + '"/>' +
        '<div class="campo-ayuda">Está en Supabase → Project Settings → API Keys. Es la clave pública: no uses la secreta.</div>' +
      '</div>' +

      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-primario" onclick="conectarOtraBase()">' + ic('signal', 15) + ' Conectar y recargar</button>' +
        (propia ? '<button class="btn btn-secundario" onclick="restaurarBase()">' + ic('undo', 15) + ' Volver a la base de siempre</button>' : '') +
      '</div>' +
      '<div id="cx-estado" style="margin-top:12px"></div>' +
    '</div>' +
  '</details>';
}

async function conectarOtraBase() {
  var url = (porId('cx-url').value || '').trim().replace(/\/+$/, '');
  var key = (porId('cx-key').value || '').trim();
  var nombre = (porId('cx-nombre').value || '').trim() || 'Intencional';
  var estado = porId('cx-estado');

  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
    estado.innerHTML = avisoHTML('danger', 'La URL tiene que ser del tipo <code>https://xxxxxxxx.supabase.co</code>.');
    return;
  }
  if (!claveValida(key)) {
    estado.innerHTML = avisoHTML('danger', 'Esa no parece una clave de Supabase. Copiá entera la <strong>publishable</strong> (empieza con sb_publishable_) o la anon.');
    return;
  }

  estado.innerHTML = cargando('Probando la conexión…');
  try {
    var res = await fetch(url + '/rest/v1/config?select=key&limit=1', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    });
    var txt = await res.text();
    if (!res.ok) {
      estado.innerHTML = avisoHTML('danger',
        'La base respondió con error ' + res.status + '. ' +
        (res.status === 404 ? 'Falta la tabla <code>config</code>: corré primero el SQL del esquema.'
                            : 'Revisá la clave. Detalle: ' + esc(txt.slice(0, 140))));
      return;
    }
    guardarConexion(url, key, nombre);
    estado.innerHTML = avisoHTML('ok', 'Conectado. Recargando…', 'check');
    setTimeout(function () { location.reload(); }, 700);
  } catch (e) {
    estado.innerHTML = avisoHTML('danger', 'No se pudo llegar a esa URL: ' + esc(e.message));
  }
}

function restaurarBase() {
  restaurarConexion();
  location.reload();
}


/* ── Alias de transferencia ──────────────────────────────── */
function tarjetaAlias() {
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('card', 16) + ' Alias de transferencia' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        plural(aliasConfigurados().length, 'alias', 'alias') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'Uno por línea. Al elegir transferencia, la app sugiere el que viene recibiendo menos ' +
        'para que los dos queden parejos.' +
      '</div>' +
      '<div class="campo"><div class="campo-etiq">Alias</div>' +
        '<textarea class="campo-input" id="cfg-alias" rows="3" style="resize:vertical">' +
          esc(aliasConfigurados().join('\n')) + '</textarea></div>' +
      '<div class="campo"><div class="campo-etiq">Teléfono para comprobantes</div>' +
        '<input class="campo-input" id="cfg-tel" value="' + esc(leerConfig('tel_comprobantes', '11-7904-7745')) + '"/></div>' +
      '<div class="campo" style="margin:0"><div class="campo-etiq">Plazo de pago (horas)</div>' +
        '<input class="campo-input" id="cfg-horas" type="number" min="1" value="' + esc(leerConfig('horas_pago', '72')) + '"/></div>' +
      '<div class="campo-ayuda" style="margin-top:10px">Así queda el aviso en el remito con deuda:</div>' +
      '<div class="aviso aviso-warn" id="preview-deuda" style="margin-top:6px"></div>' +
      '<button class="btn btn-primario btn-bloque" onclick="guardarAlias()">Guardar</button>' +
    '</div>' +
  '</details>';
}

function previewDeuda() {
  var el = porId('preview-deuda');
  if (!el) return;
  var primero = (porId('cfg-alias').value || '').split('\n').map(function (a) { return a.trim(); }).filter(Boolean)[0];
  var tel = porId('cfg-tel').value;
  var horas = porId('cfg-horas').value;
  var dias = Math.round(+horas / 24) || 3;
  el.innerHTML = ic('alert', 15) + '<div><strong>Pago pendiente</strong> — Por favor, realizá la transferencia dentro de las ' +
    esc(horas) + ' horas (' + dias + ' días) al alias ' + esc(primero || '[alias no seleccionado]') +
    ' (no distingue entre mayúsculas y minúsculas) y enviá el comprobante al ' + esc(tel) +
    '. Si el comprobante se envía desde un número o una cuenta distintos, aclarar el nombre del local.</div>';
}

async function guardarAlias() {
  var alias = (porId('cfg-alias').value || '').split('\n')
    .map(function (a) { return a.trim(); }).filter(Boolean);
  if (!alias.length) { toast('Cargá al menos un alias', 'error'); return; }
  try {
    await guardarConfig('alias_transferencia', alias.join(', '));
    await guardarConfig('tel_comprobantes', (porId('cfg-tel').value || '').trim());
    await guardarConfig('horas_pago', (porId('cfg-horas').value || '72').trim());
    toast('Alias guardados');
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Mensaje que acompaña al remito ──────────────────────── */
function tarjetaMensaje() {
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('message', 16) + ' Mensaje al compartir</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'Es el texto que acompaña a la imagen del remito. Podés usar ' +
        '<code>{cliente}</code>, <code>{total}</code>, <code>{fecha}</code> y <code>{unidades}</code>.' +
      '</div>' +
      '<div class="campo"><div class="campo-etiq">Mensaje</div>' +
        '<textarea class="campo-input" id="cfg-mensaje" rows="3" style="resize:vertical" oninput="previewMensaje()">' +
          esc(leerConfig('mensaje_compartir', '¡Hola! Te dejo el remito de la reposición de hoy por {total}. ¡Gracias por elegirnos!')) +
        '</textarea></div>' +
      '<div class="campo-ayuda">Vista previa:</div>' +
      '<div id="preview-mensaje" style="background:var(--subtle);border-radius:var(--radius);padding:10px 12px;font-size:13px;margin:6px 0 12px"></div>' +
      '<button class="btn btn-primario btn-bloque" onclick="guardarMensaje()">Guardar</button>' +
    '</div>' +
  '</details>';
}

function previewMensaje() {
  var el = porId('preview-mensaje');
  if (!el) return;
  var texto = porId('cfg-mensaje').value || '';
  el.textContent = texto
    .replace(/\{cliente\}/g, 'Farmacia Posik')
    .replace(/\{total\}/g, plata(24000))
    .replace(/\{fecha\}/g, hoyTexto())
    .replace(/\{unidades\}/g, '10');
}

async function guardarMensaje() {
  try {
    await guardarConfig('mensaje_compartir', (porId('cfg-mensaje').value || '').trim());
    toast('Mensaje guardado');
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Productos, precios y ganancia ───────────────────────── */
var _prods = null;   // se edita en memoria y se guarda de una

function tarjetaProductos() {
  if (!_prods) _prods = productos().map(function (p) { return { nombre: p.nombre, costo: p.costo, precio: p.precio }; });
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('tag', 16) + ' Productos y precios' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        plural(_prods.length, 'producto') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'Lo que te cuesta cada unidad y a cuánto se la vendés al cliente. ' +
        'La ganancia se calcula sola.' +
      '</div>' +
      '<div id="lista-prods">' + _prods.map(filaProductoConfig).join('') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
        '<button class="btn btn-secundario" onclick="agregarProducto()">' + ic('plus', 15) + ' Agregar producto</button>' +
        '<button class="btn btn-primario" style="flex:1;min-width:120px" onclick="guardarProductos()">Guardar</button>' +
      '</div>' +
    '</div>' +
  '</details>';
}

function filaProductoConfig(p, i) {
  var g = ganancia(p);
  return '<div class="prod-editor">' +
    '<div class="prod-nombre">' +
      '<div class="campo-etiq">Producto</div>' +
      '<input class="campo-input" value="' + esc(p.nombre) + '" placeholder="Nombre" ' +
             'oninput="editarProducto(' + i + ',\'nombre\',this.value)"/>' +
    '</div>' +
    '<div>' +
      '<div class="campo-etiq">Nos cuesta</div>' +
      '<input class="campo-input" type="number" min="0" inputmode="decimal" value="' + (+p.costo || 0) + '" ' +
             'oninput="editarProducto(' + i + ',\'costo\',this.value)"/>' +
    '</div>' +
    '<div>' +
      '<div class="campo-etiq">Lo cobramos</div>' +
      '<input class="campo-input" type="number" min="0" inputmode="decimal" value="' + (+p.precio || 0) + '" ' +
             'oninput="editarProducto(' + i + ',\'precio\',this.value)"/>' +
    '</div>' +
    '<button class="btn btn-fantasma" style="padding:4px;align-self:end;margin-bottom:6px" ' +
            'aria-label="Quitar" onclick="quitarProducto(' + i + ')">✕</button>' +
    '<div class="prod-ganancia" id="gan-' + i + '">' + textoGanancia(g) + '</div>' +
  '</div>';
}

function textoGanancia(g) {
  if (!g.monto && g.margenSobreCosto === null) return '<span style="color:var(--muted)">Cargá el costo para ver la ganancia</span>';
  var color = g.monto > 0 ? 'var(--ok)' : g.monto < 0 ? 'var(--danger)' : 'var(--muted)';
  return '<span style="color:' + color + ';font-weight:600">Ganancia ' + plata(g.monto) + '</span>' +
    (g.margenSobreCosto !== null
      ? ' <span style="color:var(--muted)">· ' + Math.round(g.margenSobreCosto) + '% sobre el costo' +
        (g.margenSobreVenta !== null ? ' · ' + Math.round(g.margenSobreVenta) + '% de lo que cobrás' : '') + '</span>'
      : '');
}

function editarProducto(i, campo, valor) {
  _prods[i][campo] = campo === 'nombre' ? valor : (+valor || 0);
  var el = porId('gan-' + i);
  if (el) el.innerHTML = textoGanancia(ganancia(_prods[i]));
}

function agregarProducto() {
  _prods.push({ nombre: '', costo: 0, precio: 0 });
  porId('lista-prods').innerHTML = _prods.map(filaProductoConfig).join('');
}

function quitarProducto(i) {
  _prods.splice(i, 1);
  porId('lista-prods').innerHTML = _prods.map(filaProductoConfig).join('');
}

async function guardarProductos() {
  var limpios = _prods.filter(function (p) { return (p.nombre || '').trim(); });
  if (!limpios.length) { toast('Cargá al menos un producto', 'error'); return; }
  var sinPrecio = limpios.filter(function (p) { return !(+p.precio); });
  if (sinPrecio.length) { toast('Falta el precio de venta de ' + sinPrecio[0].nombre, 'error'); return; }
  try {
    await guardarProductosConfig(limpios);
    _prods = null;
    toast('Productos guardados');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Calendario de rutas ─────────────────────────────────── */
function tarjetaRutas() {
  var cola = colaRutas();
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('map', 16) + ' Calendario de rutas' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        (cola.length ? plural(cola.length, 'ruta') + ' en cola' : 'sin cargar') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'El orden en que vas a recorrer las hojas, una por día hábil. ' +
        'La app saltea sábados, domingos y feriados sola. Si un día no salís, ' +
        'todo corre un lugar desde el inicio.' +
      '</div>' +
      '<div class="campo"><div class="campo-etiq">Orden de las hojas</div>' +
        '<textarea class="campo-input" id="cfg-cola" rows="4" style="resize:vertical;font-family:ui-monospace,monospace;font-size:13px" ' +
          'placeholder="14, 12, 5, 8">' + esc(cola.join(', ')) + '</textarea>' +
        '<div class="campo-ayuda">Separadas por coma, en el orden en que las hacés.</div>' +
      '</div>' +
      '<div class="campo"><div class="campo-etiq">Arranca el</div>' +
        '<input class="campo-input" type="date" id="cfg-inicio" value="' + esc(inicioCola()) + '"/></div>' +
      '<button class="btn btn-primario btn-bloque" onclick="guardarColaRutas()">Guardar</button>' +
      '<div id="preview-cal" style="margin-top:14px"></div>' +
    '</div>' +
  '</details>';
}

function previewCalendario() {
  var el = porId('preview-cal');
  if (!el) return;
  var cal = calendarioRutas(10);
  if (!cal.length) { el.innerHTML = '<div class="campo-ayuda">Cargá el orden de las hojas para ver el calendario.</div>'; return; }
  el.innerHTML = '<div class="campo-ayuda" style="margin-bottom:6px">Así quedan los próximos días:</div>' +
    '<div class="lista">' + cal.map(function (e) {
      var d = fechaDeIso(e.iso);
      return '<div class="fila" style="cursor:default;padding:8px 14px">' +
        '<div class="fila-principal">' +
          '<div class="fila-titulo">Ruta ' + esc(e.ruta) + '</div>' +
          '<div class="fila-sub">' + capitalizar(DIAS[d.getDay()]) + ' ' + esc(fechaCorta(e.iso)) + '</div>' +
        '</div></div>';
    }).join('') + '</div>';
}

async function guardarColaRutas() {
  var cola = (porId('cfg-cola').value || '').split(',')
    .map(function (r) { return r.trim(); }).filter(Boolean);
  var inicio = porId('cfg-inicio').value || hoyISO();
  try {
    await guardarCola(cola, inicio);
    toast('Calendario guardado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Feriados ────────────────────────────────────────────── */
function tarjetaFeriados() {
  var deEsteAnio = Object.keys(FERIADOS)
    .filter(function (f) { return f >= hoyISO(); }).sort().slice(0, 8);

  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('calendar', 16) + ' Feriados' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        Object.keys(FERIADOS).length + ' cargados</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'Se bajan solos de la API pública de feriados de Argentina y quedan guardados ' +
        'para funcionar sin internet. Acá podés sumar los tuyos: vacaciones, días que no salís.' +
      '</div>' +
      (deEsteAnio.length
        ? '<div class="campo-ayuda" style="margin-bottom:10px">Próximos: ' +
          deEsteAnio.map(function (f) { return fechaCorta(f) + ' ' + esc(nombreFeriado(f)); }).join(' · ') + '</div>'
        : '<div class="campo-ayuda" style="margin-bottom:10px">Todavía no se bajaron los feriados.</div>') +
      '<div class="campo"><div class="campo-etiq">Días propios</div>' +
        '<textarea class="campo-input" id="cfg-feriados" rows="3" style="resize:vertical;font-family:ui-monospace,monospace;font-size:13px" ' +
          'placeholder="2026-12-24, 2026-12-31">' + esc(feriadosManuales().join(', ')) + '</textarea>' +
        '<div class="campo-ayuda">Formato aaaa-mm-dd, separados por coma.</div>' +
      '</div>' +
      '<button class="btn btn-primario btn-bloque" onclick="guardarFeriados()">Guardar</button>' +
    '</div>' +
  '</details>';
}

async function guardarFeriados() {
  var lista = (porId('cfg-feriados').value || '').split(',')
    .map(function (f) { return f.trim(); }).filter(Boolean);
  var malas = lista.filter(function (f) { return !/^\d{4}-\d{2}-\d{2}$/.test(f); });
  if (malas.length) { toast('Fecha mal escrita: ' + malas[0], 'error'); return; }
  try {
    await guardarConfig('feriados_extra', lista.join(', '));
    aplicarFeriados(JSON.parse(localStorage.getItem('intencional_feriados') || '[]'), lista);
    toast('Feriados guardados');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Empleado y reparto de gastos ────────────────────────── */
function tarjetaEmpleado() {
  var e = empleadoConfig();
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('user', 16) + ' Dueños, empleado y gastos compartidos' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        (e.sueldo ? plata(e.sueldo) : 'sin cargar') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo"><div class="campo-etiq">Dueños</div>' +
        '<input class="campo-input" id="cfg-socios" value="' + esc(socios().join(', ')) + '" placeholder="Franco, Augusto"/>' +
        '<div class="campo-ayuda">Separados por coma. Son las opciones de “quién puso la plata”.</div></div>' +
      socios().map(function (s2) {
        return '<div class="campo"><div class="campo-etiq">Sueldo de ' + esc(s2) + '</div>' +
          inputMonto('cfg-sueldo-' + normalizar(s2).replace(/\s+/g, '-'), sueldosSocios()[s2] || 0) +
        '</div>';
      }).join('') +
      '<div class="campo-ayuda" style="margin:-6px 0 14px">Los sueldos de los dueños los paga la empresa. ' +
        'Cada uno tiene su botón rápido en Gastos.</div>' +

      '<div class="campo"><div class="campo-etiq">Quién adelanta el combustible</div>' +
        '<select class="campo-input" id="cfg-combustible">' +
          socios().map(function (s2) {
            return '<option' + (quienPagaCombustible() === s2 ? ' selected' : '') + '>' + esc(s2) + '</option>';
          }).join('') +
        '</select>' +
        '<div class="campo-ayuda">Lo paga de su bolsillo y la empresa le devuelve su parte al cerrar la semana.</div></div>' +
      '<div class="campo"><div class="campo-etiq">Monto del botón “Deuda”</div>' +
        inputMonto('cfg-deuda', +leerConfig('monto_deuda', 0) || 0) +
        '<div class="campo-ayuda">Al usarlo se puede cambiar.</div></div>' +
      '<div class="campo"><div class="campo-etiq">Devolución de esmaltes (%)</div>' +
        '<input class="campo-input" id="cfg-devolucion" type="number" min="0" max="100" inputmode="numeric" ' +
               'style="max-width:120px" value="' + (+leerConfig('devolucion_pct', 30) || 30) + '"/>' +
        '<div class="campo-ayuda">Cuánto del pedido de esmaltes se puede devolver.</div></div>' +
      '<div class="campo-etiq" style="margin-top:6px">Empleado</div>' +
      '<div class="campo-ayuda" style="margin-bottom:8px">Su sueldo sale mitad y mitad del de los dueños.</div>' +
      '<div class="campo"><div class="campo-etiq">Nombre</div>' +
        '<input class="campo-input" id="cfg-emp-nombre" value="' + esc(e.nombre) + '" placeholder="Opcional"/></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div class="campo"><div class="campo-etiq">Sueldo del empleado</div>' +
          inputMonto('cfg-emp-sueldo', e.sueldo) + '</div>' +
        '<div class="campo"><div class="campo-etiq">Cada cuánto</div>' +
          '<select class="campo-input" id="cfg-emp-frec">' +
            ['semanal', 'quincenal', 'mensual'].map(function (f) {
              return '<option value="' + f + '"' + (e.frecuencia === f ? ' selected' : '') + '>' + capitalizar(f) + '</option>';
            }).join('') +
          '</select></div>' +
      '</div>' +
      '<div class="campo-ayuda" style="margin-bottom:14px">' +
        'Con el sueldo cargado, en Gastos aparece un botón para registrarlo con un toque.' +
      '</div>' +

      '<div class="campo"><div class="campo-etiq">Gastos compartidos: paga la empresa (%)</div>' +
        '<input class="campo-input" id="cfg-reparto" type="number" min="0" max="100" inputmode="numeric" ' +
               'style="max-width:120px" value="' + porcentajeEmpresa() + '"/>' +
        '<div class="campo-ayuda">Es el reparto que se propone por defecto en la nafta y el mantenimiento del auto. ' +
          'En cada gasto se puede cambiar.</div>' +
      '</div>' +

      '<button class="btn btn-primario btn-bloque" onclick="guardarEmpleado()">Guardar</button>' +
    '</div>' +
  '</details>';
}

async function guardarEmpleado() {
  try {
    await guardarConfig('socios', (porId('cfg-socios').value || '').trim() || 'Franco, Augusto');
    await guardarConfig('sueldos_socios', socios().map(function (s2) {
      return s2 + '|' + leerMonto('cfg-sueldo-' + normalizar(s2).replace(/\s+/g, '-'));
    }).join(', '));
    await guardarConfig('combustible_lo_pone', porId('cfg-combustible').value);
    await guardarConfig('monto_deuda', leerMonto('cfg-deuda'));
    await guardarConfig('devolucion_pct', +porId('cfg-devolucion').value || 30);
    await guardarConfig('empleado_nombre', (porId('cfg-emp-nombre').value || '').trim());
    await guardarConfig('empleado_sueldo', leerMonto('cfg-emp-sueldo'));
    await guardarConfig('empleado_frecuencia', porId('cfg-emp-frec').value);
    await guardarConfig('reparto_empresa', +porId('cfg-reparto').value || 50);
    toast('Guardado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Cuándo aparecen los avisos del inicio ───────────────── */
function tarjetaAvisos() {
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('megaphone', 16) + ' Avisos del inicio</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-etiq">Recordar anotar los gastos</div>' +
      selectorDias('gastos', 'dia_aviso_gastos', '5') +
      '<div class="campo-ayuda" style="margin-bottom:14px">' +
        'El día que cerrás la semana. Si no elegís ninguno, aparece todos los días.</div>' +

      '<div class="campo-etiq">Avisar de las deudas por cobrar</div>' +
      selectorDias('deudas', 'dias_aviso_deudas', '') +
      '<div class="campo-ayuda" style="margin-bottom:14px">' +
        'En el inicio se puede cerrar con la cruz y no vuelve hasta el día siguiente.</div>' +

      '<button class="btn btn-primario btn-bloque" onclick="guardarAvisos()">Guardar</button>' +
    '</div>' +
  '</details>';
}

function selectorDias(id, clave, porDefecto) {
  var elegidos = diasDeAviso(clave, porDefecto);
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px" id="dias-' + id + '">' +
    [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var activo = elegidos.indexOf(d) !== -1;
      return '<button class="btn ' + (activo ? 'btn-primario' : 'btn-secundario') + ' dia-' + id + '" ' +
        'data-dia="' + d + '" data-activo="' + (activo ? '1' : '0') + '" ' +
        'style="padding:6px 11px;font-size:12px" onclick="alternarDia(this)">' +
        capitalizar(DIAS_CORTOS[d]) + '</button>';
    }).join('') +
  '</div>';
}

function alternarDia(btn) {
  var activo = btn.dataset.activo === '1';
  btn.dataset.activo = activo ? '0' : '1';
  btn.className = 'btn ' + (activo ? 'btn-secundario' : 'btn-primario') + ' ' +
    btn.className.split(' ').filter(function (c) { return c.indexOf('dia-') === 0; }).join(' ');
  btn.style.padding = '6px 11px';
  btn.style.fontSize = '12px';
}

function diasElegidos(id) {
  return $$('.dia-' + id)
    .filter(function (b) { return b.dataset.activo === '1'; })
    .map(function (b) { return b.dataset.dia; })
    .join(',');
}

async function guardarAvisos() {
  try {
    await guardarConfig('dia_aviso_gastos', diasElegidos('gastos'));
    await guardarConfig('dias_aviso_deudas', diasElegidos('deudas'));
    toast('Avisos guardados');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
