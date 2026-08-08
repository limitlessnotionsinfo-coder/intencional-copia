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
    _subPush = await suscripcionActual();
    _filaPush = _subPush ? await filaDeEsteTelefono() : null;
    _avisosTel = leerAvisos(_filaPush);
    await cargarConfig().catch(function () {});
    if (!_feriadosCargados) cargarFeriados().catch(function () {});
    var cfg = aumentoConfig();

    cont.innerHTML =
      /* Cuatro grupos en vez de diez tarjetas sueltas: se entra a
         uno y adentro está todo lo de ese tema. */
      grupoConfig('negocio', 'Precios y productos', 'tag',
        tarjetaProductos() + tarjetaAumento()) +

      grupoConfig('plata', 'Cobranzas y gastos', 'wallet',
        tarjetaAlias() + tarjetaEmpleado() + tarjetaMensaje()) +

      /* El orden de las rutas vive en Clientes, donde se arrastra */
      grupoConfig('rutas', 'Feriados', 'calendar', tarjetaFeriados()) +

      grupoConfig('app', 'La app', 'settings',
        tarjetaNotificaciones() + tarjetaAvisos() + tarjetaTema() +
        tarjetaImportar() + tarjetaMantenimiento()) +

      (MOSTRAR_AVANZADO ? tarjetaConexion() : botonAvanzado());

    /* Las vistas previas se arman al abrir cada grupo: si el
       grupo está plegado, sus campos todavía no existen. */
    $$('.grupo-config').forEach(function (g) {
      g.addEventListener('toggle', function () {
        if (!g.open) return;
        previewAviso(); previewMensaje(); previewDeuda();
        ['cfg-alias', 'cfg-tel', 'cfg-horas'].forEach(function (id) {
          var el = porId(id); if (el) el.oninput = previewDeuda;
        });
      });
    });
  }
});

/* ── Aviso de aumento ────────────────────────────────────── */
function tarjetaAumento() {
  var cfg = aumentoConfig();
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('megaphone', 16) + ' Aviso de aumento' +
      '<span style="margin-left:auto"><span class="pin ' + (cfg.activo ? 'pin-warn' : 'pin-neutro') + '">' +
        (cfg.activo ? 'activo' : 'apagado') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:12px">' +
        '<input type="checkbox" id="cfg-activo"' + (cfg.activo ? ' checked' : '') + ' onchange="previewAviso()"/> ' +
        'Avisar del aumento en los remitos' +
      '</label>' +

      '<div class="campo"><div class="campo-etiq">Producto que aumenta</div>' +
        '<input class="campo-input" id="cfg-producto" list="opciones-prod" value="' + esc(cfg.producto) + '" oninput="previewAviso()"/>' +
        '<datalist id="opciones-prod">' +
          productos().map(function (p) { return '<option value="' + esc(p.nombre) + '">'; }).join('') +
        '</datalist>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div class="campo"><div class="campo-etiq">Precio actual</div>' +
          '<input class="campo-input" id="cfg-viejo" type="number" min="0" value="' + (cfg.viejo || '') + '" oninput="previewAviso()"/></div>' +
        '<div class="campo"><div class="campo-etiq">Precio nuevo</div>' +
          '<input class="campo-input" id="cfg-nuevo" type="number" min="0" value="' + (cfg.nuevo || '') + '" oninput="previewAviso()"/></div>' +
      '</div>' +

      '<div id="preview-aviso"></div>' +
      '<button class="btn btn-primario btn-bloque" style="margin-top:14px" onclick="guardarAumento()">Guardar</button>' +
    '</div>' +
  '</details>';
}

function previewAviso() {
  if (!porId('cfg-activo')) return;   // el grupo puede estar plegado
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

/* Un grupo: encabezado y adentro las tarjetas del tema */
function grupoConfig(id, titulo, icono, contenido) {
  return '<details class="tarjeta grupo-config" id="gc-' + id + '">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic(icono, 16) + ' ' + esc(titulo) + '</summary>' +
    '<div class="tarjeta-cuerpo" style="padding:10px">' + contenido + '</div>' +
  '</details>';
}

/* Lo que se hace de vez en cuando, junto */
function tarjetaMantenimiento() {
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('refresh', 16) + ' Datos y sesión</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<button class="btn btn-secundario btn-bloque" ' +
              'onclick="invalidarCache();pintarRuta();toast(\'Datos actualizados\')">' +
        ic('refresh', 15) + ' Volver a leer la base</button>' +
      '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="revisarEsquema()">' +
        ic('db', 15) + ' ¿La base está al día?</button>' +
      (PEDIR_LOGIN
        ? '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="salir()">' +
          ic('undo', 15) + ' Cerrar sesión</button>'
        : '') +
    '</div>' +
  '</details>';
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
        'Uno por línea, con el titular después de una barra: <code>intencional.f | Franco Pérez</code>. ' +
        'El titular sale impreso en el aviso de pago, así el cliente sabe a nombre de quién transfiere. ' +
        'Al elegir transferencia, la app sugiere el alias que viene recibiendo menos.' +
      '</div>' +
      '<div class="campo"><div class="campo-etiq">Alias</div>' +
        '<textarea class="campo-input" id="cfg-alias" rows="3" style="resize:vertical">' +
          esc(String(leerConfig('alias_transferencia', '')).split(',')
              .map(function (a) { return a.trim(); }).filter(Boolean).join('\n')) +
        '</textarea></div>' +
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


/* ── Claro, oscuro o el del teléfono ─────────────────────── */
function tarjetaTema() {
  var actual = temaGuardado();
  var opciones = [
    ['auto', 'Como el teléfono', 'smartphone'],
    ['claro', 'Siempre claro', 'droplet'],
    ['oscuro', 'Siempre oscuro', 'eye']
  ];

  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('droplet', 16) + ' Apariencia' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        esc((opciones.find(function (o) { return o[0] === actual; }) || opciones[0])[1]) + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        opciones.map(function (o) {
          return '<button class="btn ' + (actual === o[0] ? 'btn-primario' : 'btn-secundario') + '" ' +
            'style="flex:1;min-width:120px" onclick="cambiarTema(\'' + o[0] + '\')">' +
            ic(o[2], 15) + ' ' + esc(o[1]) + '</button>';
        }).join('') +
      '</div>' +
      '<div class="campo-ayuda" style="margin-top:10px">' +
        '“Como el teléfono” cambia solo cuando tu celular pasa a modo oscuro. ' +
        'El remito que se comparte sale siempre en claro, para que se lea bien impreso o reenviado.</div>' +
    '</div>' +
  '</details>';
}

function cambiarTema(t) {
  guardarTema(t);
  pintarRuta();
}

/* ═══════════════════════════════════════════════════════════
   MODO AVANZADO
   Cambiar de base de datos es algo que se hace una vez. Vive
   detrás de un botón para no tenerlo a mano por error.
   ═══════════════════════════════════════════════════════════ */
var MOSTRAR_AVANZADO = false;

function botonAvanzado() {
  return '<button class="btn btn-fantasma btn-bloque" style="margin-top:4px;font-size:12px" ' +
    'onclick="MOSTRAR_AVANZADO=true;pintarRuta()">Opciones avanzadas</button>';
}

/* ═══════════════════════════════════════════════════════════
   IMPORTAR Y EXPORTAR
   ═══════════════════════════════════════════════════════════ */
var IMP = null;

function tarjetaImportar() {
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('download', 16) + ' Importar y exportar</summary>' +
    '<div class="tarjeta-cuerpo">' +

      '<div class="eyebrow">Descargar</div>' +
      '<div class="campo-ayuda" style="margin-bottom:8px">' +
        'El CSV incluye un enlace al mapa de cada dirección. La agenda los deja como ' +
        'contactos del teléfono, con la dirección tocable.' +
        '<br>En iPhone se abre el menú de compartir: elegí “Contactos” o “Guardar en Archivos”.</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
        '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="bajarClientesCSV()">' +
          ic('download', 15) + ' Clientes en CSV</button>' +
        '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="bajarAgenda()">' +
          ic('phone', 15) + ' Agenda del teléfono</button>' +
      '</div>' +

      '<div class="eyebrow">Cargar clientes desde un archivo</div>' +
      '<div class="campo-ayuda" style="margin-bottom:8px">' +
        'Un CSV con una fila por cliente. Reconoce las columnas ' +
        '<code>local</code>, <code>direccion</code>, <code>localidad</code>, <code>telefono</code>, ' +
        '<code>rubro</code> y <code>ruta</code>, con esos nombres o los equivalentes.</div>' +
      '<input class="campo-input" type="file" id="imp-clientes" accept=".csv,text/csv,text/plain"/>' +
      '<button class="btn btn-secundario btn-bloque" style="margin:8px 0 16px" onclick="revisarArchivoClientes()">' +
        ic('search', 15) + ' Revisar el archivo</button>' +

      '<div class="eyebrow">Cargar hojas de ruta</div>' +
      '<div class="campo-ayuda" style="margin-bottom:8px">' +
        'Un CSV con el <code>codigo</code> o el <code>num</code> del cliente y su <code>ruta</code>. ' +
        'Solo cambia la hoja: no crea clientes ni toca el resto de los datos.</div>' +
      '<input class="campo-input" type="file" id="imp-rutas" accept=".csv,text/csv,text/plain"/>' +
      '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="revisarArchivoRutas()">' +
        ic('map', 15) + ' Revisar el archivo</button>' +
    '</div>' +
  '</details>';
}

/* ── Descargar ───────────────────────────────────────────── */
async function bajarClientesCSV() {
  try {
    var clientes = await traerCacheado('clientes');
    var ok = await descargar('clientes-intencional-' + hoyISO() + '.csv',
      armarCSV(clientes, COLUMNAS_CLIENTES), 'text/csv');
    if (ok) toast(plural(clientes.length, 'cliente') + ' listos');
  } catch (e) { toast(e.message, 'error'); }
}

async function bajarAgenda() {
  try {
    var clientes = (await traerCacheado('clientes')).filter(clienteActivo);
    var ok = await descargar('clientes-intencional-' + hoyISO() + '.vcf',
      armarVCard(clientes), 'text/vcard');
    if (ok) {
      toast(esIOS()
        ? 'Elegí "Guardar en Archivos" o "Contactos" en el menú'
        : 'Agenda con ' + plural(clientes.length, 'cliente'));
    }
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Cargar clientes ─────────────────────────────────────── */
async function revisarArchivoClientes() {
  try {
    var texto = await leerArchivo(porId('imp-clientes'));
    var clientes = await traerCacheado('clientes');
    IMP = revisarImportacion(texto, clientes);

    if (!IMP.total) { toast('El archivo no tiene filas', 'error'); return; }

    abrirModal('Revisar la importación',
      '<div class="grilla-stats" style="margin-bottom:12px">' +
        stat('plus', 'Se crean', String(IMP.listos.length), 'clientes nuevos', 'var(--ok)') +
        stat('users', 'Ya están', String(IMP.repetidos.length), 'no se tocan', 'var(--warn)') +
        (IMP.sinNombre.length
          ? stat('alert', 'Sin nombre', String(IMP.sinNombre.length), 'se saltean', 'var(--danger)')
          : '') +
      '</div>' +

      (IMP.listos.length
        ? '<div class="eyebrow">Los primeros que se van a crear</div>' +
          '<div class="lista" style="margin-bottom:12px">' +
            IMP.listos.slice(0, 8).map(function (f) {
              return '<div class="fila" style="cursor:default">' +
                '<div class="fila-principal">' +
                  '<div class="fila-titulo">' + esc(f.local) + '</div>' +
                  '<div class="fila-sub">' +
                    [f.dir, f.loc, f.ruta ? 'Ruta ' + f.ruta : ''].filter(Boolean).map(esc).join(' · ') +
                  '</div>' +
                '</div></div>';
            }).join('') +
          '</div>' +
          (IMP.listos.length > 8 ? '<div class="campo-ayuda">y ' + (IMP.listos.length - 8) + ' más.</div>' : '')
        : avisoHTML('warn', 'No hay clientes nuevos para crear en este archivo.', 'alert')) +

      (IMP.repetidos.length
        ? '<div class="campo-ayuda" style="margin-top:10px">' +
          'Los repetidos se detectan por número, o por nombre más dirección. No se modifican.</div>'
        : ''),

      IMP.listos.length
        ? '<button class="btn btn-primario btn-bloque" id="btn-imp" onclick="importarClientes()">' +
          'Crear ' + plural(IMP.listos.length, 'cliente') + '</button>'
        : '');
  } catch (e) { toast(e.message, 'error'); }
}

async function importarClientes() {
  var btn = porId('btn-imp');
  if (btn) { btn.disabled = true; btn.textContent = 'Creando…'; }

  var todos = await traerCacheado('clientes');
  var siguiente = todos.reduce(function (m, c) { return Math.max(m, +c.num || 0); }, 0);
  var creados = 0, fallos = 0;
  var enMemoria = todos.slice();

  for (var i = 0; i < IMP.listos.length; i++) {
    var f = IMP.listos[i];
    siguiente++;
    var ruta = f.ruta || '';
    var nuevo = {
      num: siguiente,
      num_str: ruta ? codigoCliente(ruta, siguienteEnRuta(enMemoria, ruta)) : String(siguiente),
      local: f.local,
      dir: f.dir || null,
      loc: f.loc || null,
      tel: f.tel || null,
      duenio: f.duenio || null,
      rubro: f.rubro || null,
      ruta: JSON.stringify({ orden: ruta, horarios: [], notas: '' }),
      exhibidores: +f.exhibidores || 0,
      avisar_antes: +f.avisar_antes || 0,
      activo: true,
      fecha: hoyTexto(),
      created_at: new Date().toISOString()
    };

    try {
      await crear('clientes', nuevo);
      enMemoria.push(nuevo);
      creados++;
    } catch (e) { fallos++; }

    if (btn) btn.textContent = 'Creando… ' + (i + 1) + ' de ' + IMP.listos.length;
  }

  invalidarCache('clientes');
  cerrarModal();
  toast(fallos ? creados + ' creados, ' + fallos + ' con error' : plural(creados, 'cliente') + ' creados');
  pintarRuta();
}

/* ── Cargar hojas de ruta ────────────────────────────────── */
var IMP_RUTAS = null;

async function revisarArchivoRutas() {
  try {
    var texto = await leerArchivo(porId('imp-rutas'));
    var clientes = await traerCacheado('clientes');
    var filas = csvAObjetos(texto).map(mapearFila);

    var cambios = [], sinEncontrar = [];
    filas.forEach(function (f) {
      if (!f.ruta) return;
      var c = clientes.find(function (x) {
        if (f.num && String(x.num) === String(f.num)) return true;
        if (f.num_str && normalizar(x.num_str) === normalizar(f.num_str)) return true;
        return f.local && normalizar(x.local) === normalizar(f.local);
      });
      if (!c) { sinEncontrar.push(f); return; }
      if (String(rutaDe(c)) === String(f.ruta)) return;   // ya está en esa hoja
      cambios.push({ cliente: c, rutaNueva: String(f.ruta) });
    });

    IMP_RUTAS = cambios;

    abrirModal('Cargar hojas de ruta',
      '<div class="grilla-stats" style="margin-bottom:12px">' +
        stat('map', 'Se mueven', String(cambios.length), 'clientes', 'var(--ok)') +
        (sinEncontrar.length
          ? stat('alert', 'Sin encontrar', String(sinEncontrar.length), 'no están en la base', 'var(--warn)')
          : '') +
      '</div>' +
      (cambios.length
        ? '<div class="lista">' + cambios.slice(0, 10).map(function (x) {
            return '<div class="fila" style="cursor:default">' +
              '<span class="num-cliente">' + esc(x.cliente.num_str || x.cliente.num) + '</span>' +
              '<div class="fila-principal">' +
                '<div class="fila-titulo">' + esc(x.cliente.local) + '</div>' +
                '<div class="fila-sub">' + (rutaDe(x.cliente) ? 'Ruta ' + esc(rutaDe(x.cliente)) : 'sin hoja') +
                  ' → Ruta ' + esc(x.rutaNueva) + '</div>' +
              '</div></div>';
          }).join('') + '</div>' +
          (cambios.length > 10 ? '<div class="campo-ayuda">y ' + (cambios.length - 10) + ' más.</div>' : '')
        : avisoHTML('ok', 'No hay nada que cambiar: ya están todos en esa hoja.', 'check')),

      cambios.length
        ? '<button class="btn btn-primario btn-bloque" id="btn-imp-rutas" onclick="importarRutas()">' +
          'Mover ' + plural(cambios.length, 'cliente') + '</button>'
        : '');
  } catch (e) { toast(e.message, 'error'); }
}

async function importarRutas() {
  var btn = porId('btn-imp-rutas');
  if (btn) btn.disabled = true;
  var clientes = await traerCacheado('clientes');
  var fallos = 0;

  for (var i = 0; i < IMP_RUTAS.length; i++) {
    var x = IMP_RUTAS[i];
    var actual = {};
    try { actual = typeof x.cliente.ruta === 'string' ? JSON.parse(x.cliente.ruta || '{}') : (x.cliente.ruta || {}); }
    catch (e) {}
    actual.orden = x.rutaNueva;

    var cambios = {
      ruta: JSON.stringify(actual),
      num_str: codigoParaRutaNueva(clientes, x.rutaNueva, x.cliente)
    };

    try {
      await actualizar('clientes', x.cliente.num, cambios);
      Object.assign(x.cliente, cambios);
    } catch (e) { fallos++; }

    if (btn) btn.textContent = 'Moviendo… ' + (i + 1) + ' de ' + IMP_RUTAS.length;
  }

  invalidarCache('clientes');
  cerrarModal();
  toast(fallos ? 'Quedaron ' + fallos + ' sin mover' : plural(IMP_RUTAS.length, 'cliente') + ' movidos');
  pintarRuta();
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICACIONES
   ═══════════════════════════════════════════════════════════ */
var _subPush = null;
var _filaPush = null;

function tarjetaNotificaciones() {
  var e = estadoNotificaciones();
  var activas = !!_subPush;

  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('megaphone', 16) + ' Notificaciones' +
      '<span style="margin-left:auto"><span class="pin ' + (activas ? 'pin-ok' : 'pin-neutro') + '">' +
        (activas ? 'activadas' : 'apagadas') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +

      (e.puede
        ? (activas
            ? bloqueAvisosDelTelefono() +
              '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
                '<button class="btn btn-secundario" style="flex:1;min-width:120px" onclick="probarNotificacion()">' +
                  ic('eye', 15) + ' Probar</button>' +
                '<button class="btn btn-secundario" onclick="apagarPush()">' + ic('ban', 15) + ' Apagar</button>' +
              '</div>' +
              '<button class="btn btn-fantasma btn-bloque" style="margin-top:6px;font-size:12px" ' +
                'onclick="verDiagnosticoPush()">¿No te llegan? Revisá qué falta</button>'
            : '<div class="campo-ayuda" style="margin-bottom:10px">' +
                'Avisos de deudas por cobrar, clientes a los que hay que avisar del aumento ' +
                'y gastos de la semana sin anotar.</div>' +
              '<button class="btn btn-primario btn-bloque" onclick="prenderPush()">' +
                ic('megaphone', 16) + ' Activar en este teléfono</button>')
        : avisoHTML(e.instalar ? 'info' : 'warn', esc(e.motivo), e.instalar ? 'download' : 'alert')) +

      /* La clave pública se pega una vez; la privada vive en el servidor */
      '<details style="margin-top:14px">' +
        '<summary style="cursor:pointer;font-size:12px;color:var(--rose);font-weight:600;padding:4px 0">' +
          'Configuración del servidor</summary>' +
        '<div style="margin-top:8px">' +
          '<div class="campo"><div class="campo-etiq">Clave pública (VAPID)</div>' +
            '<input class="campo-input" id="cfg-push-clave" value="' + esc(clavePublicaPush()) + '" ' +
                   'placeholder="BN..."/>' +
            '<div class="campo-ayuda">Es pública: puede estar en el código. La privada va en Supabase, ' +
              'nunca acá.</div>' +
          '</div>' +

          '<button class="btn btn-primario btn-bloque" style="margin-top:10px" onclick="guardarPush()">Guardar</button>' +
          '<button class="btn btn-secundario btn-bloque" style="margin-top:8px" onclick="crearClavesVapid()">' +
            ic('lock', 15) + ' Generar un par de claves</button>' +
          '<div class="campo-ayuda">Se generan en este dispositivo y no salen de acá.</div>' +
        '</div>' +
      '</details>' +
    '</div>' +
  '</details>';
}

async function prenderPush() {
  if (await activarNotificaciones()) {
    _subPush = await suscripcionActual();
    pintarRuta();
  }
}

async function apagarPush() {
  if (await desactivarNotificaciones()) {
    _subPush = null;
    pintarRuta();
  }
}

async function guardarPush() {
  var clave = (porId('cfg-push-clave').value || '').trim();
  if (clave && !/^[A-Za-z0-9_-]{80,}$/.test(clave)) {
    toast('Esa no parece una clave VAPID pública', 'error');
    return;
  }
  try {
    await guardarConfig('push_clave_publica', clave);

    toast('Guardado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Generar las claves sin salir de la app ──────────────── */
async function crearClavesVapid() {
  try {
    var par = await generarClavesVapid();

    abrirModal('Par de claves nuevo',
      avisoHTML('warn',
        'La <strong>privada</strong> se muestra una sola vez y no se guarda en ningún lado. ' +
        'Copiala ahora a Supabase → Edge Functions → Secrets. Si la perdés, generá otro par.', 'alert') +

      '<div class="campo"><div class="campo-etiq">Pública · va en la app</div>' +
        '<textarea class="campo-input" id="vp-publica" rows="3" readonly ' +
                  'style="font-family:ui-monospace,monospace;font-size:12px">' + esc(par.publica) + '</textarea>' +
        '<button class="btn btn-fantasma" style="padding:4px 0;text-decoration:underline;font-size:12px" ' +
                'onclick="copiarCampo(\'vp-publica\')">Copiar</button>' +
      '</div>' +

      '<div class="campo" style="margin:0"><div class="campo-etiq">Privada · va solo en Supabase</div>' +
        '<textarea class="campo-input" id="vp-privada" rows="2" readonly ' +
                  'style="font-family:ui-monospace,monospace;font-size:12px">' + esc(par.privada) + '</textarea>' +
        '<button class="btn btn-fantasma" style="padding:4px 0;text-decoration:underline;font-size:12px" ' +
                'onclick="copiarCampo(\'vp-privada\')">Copiar</button>' +
      '</div>',

      '<button class="btn btn-primario btn-bloque" onclick="usarClavePublica(\'' +
        esc(par.publica) + '\')">Usar la pública en la app</button>');
  } catch (e) { toast(e.message, 'error'); }
}

async function copiarCampo(id) {
  var el = porId(id);
  if (!el) return;
  try {
    await navigator.clipboard.writeText(el.value);
    toast('Copiado');
  } catch (e) {
    el.select();
    toast('Seleccionado: copialo a mano');
  }
}

async function usarClavePublica(publica) {
  try {
    await guardarConfig('push_clave_publica', publica);
    cerrarModal();
    toast('Clave pública guardada · ahora cargá la privada en Supabase');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}


/* ═══════════════════════════════════════════════════════════
   QUÉ AVISOS RECIBE ESTE TELÉFONO
   La configuración es de cada dispositivo: Franco y Augusto
   pueden tener distintas, y cada aviso su propio horario.
   ═══════════════════════════════════════════════════════════ */
var _avisosTel = null;

function bloqueAvisosDelTelefono() {
  if (!_avisosTel) _avisosTel = leerAvisos(_filaPush);

  return '<div class="campo-ayuda" style="margin-bottom:10px">' +
      'Esto vale solo para <strong>' + esc((_filaPush && _filaPush.dispositivo) || 'este teléfono') +
      '</strong>. Cada uno elige lo suyo.</div>' +

    TIPOS_AVISO.map(function (t) {
      var a = _avisosTel[t.id];
      return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">' +
        '<input type="checkbox" id="av-' + t.id + '"' + (a.on ? ' checked' : '') + ' ' +
               'onchange="cambiarAviso(\'' + t.id + '\',\'on\',this.checked)" ' +
               'style="width:20px;height:20px;flex:0 0 auto"/>' +
        '<label for="av-' + t.id + '" style="flex:1;min-width:0;cursor:pointer">' +
          '<div style="font-weight:600;font-size:13px">' + ic(t.icono, 13) + ' ' + esc(t.etiqueta) + '</div>' +
          '<div class="campo-ayuda" style="margin:0">' + esc(t.detalle) + '</div>' +
        '</label>' +
        '<input class="campo-input" type="time" value="' + esc(a.hora) + '" ' +
               (a.on ? '' : 'disabled ') +
               'style="width:auto;flex:0 0 auto;min-height:36px" ' +
               'onchange="cambiarAviso(\'' + t.id + '\',\'hora\',this.value)"/>' +
      '</div>';
    }).join('') +

    '<div class="campo-ayuda" style="margin-top:8px">' +
      'Los horarios son de 24 horas y aceptan minutos (13:30, 22:20). ' +
      'El servidor revisa cada media hora, así que el aviso llega en esa franja.</div>' +

    '<button class="btn btn-primario btn-bloque" style="margin-top:10px" onclick="guardarAvisosTel()">' +
      'Guardar mis avisos</button>';
}

function cambiarAviso(tipo, campo, valor) {
  if (!_avisosTel) _avisosTel = avisosPorDefecto();
  if (campo === 'hora') {
    var h = horaValida(valor);
    if (!h) { toast('Hora inválida', 'error'); return; }
    _avisosTel[tipo].hora = h;
  } else {
    _avisosTel[tipo].on = !!valor;
    pintarRuta();   // para habilitar o deshabilitar el reloj
  }
}

async function guardarAvisosTel() {
  var sub = await suscripcionActual();
  if (!sub) { toast('Este teléfono no está suscripto', 'error'); return; }
  if (!TIPOS_AVISO.some(function (t) { return _avisosTel[t.id].on; })) {
    toast('Elegí al menos un aviso, o apagá las notificaciones', 'error');
    return;
  }
  try {
    await guardarAvisos(sub.endpoint, _avisosTel);
    toast('Listo · así los va a recibir este teléfono');
  } catch (e) { toast(e.message, 'error'); }
}


/* ── Por qué no llegan las notificaciones ────────────────── */
async function verDiagnosticoPush() {
  abrirModal('Revisión de notificaciones', cargando('Revisando…'));
  var pasos = await diagnosticoPush();
  var fallan = pasos.filter(function (p) { return !p.ok; });

  abrirModal('Revisión de notificaciones',
    (fallan.length
      ? avisoHTML('warn', '<strong>' + plural(fallan.length, 'cosa') + ' por resolver.</strong> ' +
          'Los pasos en rojo son los que hay que arreglar, de arriba hacia abajo.', 'alert')
      : avisoHTML('ok', 'Del lado del teléfono está todo bien. Si igual no llegan, ' +
          'el problema está en el servidor: mirá los logs de la función <code>avisos</code> ' +
          'en Supabase.', 'check')) +

    '<div class="lista" style="margin-top:10px">' +
      pasos.map(function (p) {
        return '<div class="fila" style="cursor:default;align-items:flex-start">' +
          '<span style="flex:0 0 auto;color:' + (p.ok ? 'var(--ok)' : 'var(--danger)') + '">' +
            ic(p.ok ? 'check' : 'x', 16) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo" style="font-weight:' + (p.ok ? '500' : '700') + '">' +
              esc(p.titulo) + '</div>' +
            (p.detalle ? '<div class="fila-sub">' + esc(p.detalle) + '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="campo-ayuda" style="margin-top:12px">' +
      'Si cambiaste las claves VAPID, todas las suscripciones anteriores dejan de servir: ' +
      'hay que apagar y volver a activar las notificaciones en cada teléfono.</div>',

    '<button class="btn btn-secundario btn-bloque" onclick="probarNotificacion()">' +
      ic('eye', 15) + ' Probar una notificación local</button>');
}


/* ═══════════════════════════════════════════════════════════
   ¿LA BASE ESTÁ AL DÍA?
   Escribe y borra una fila de prueba para ver qué columnas
   existen. Es la forma de saberlo sin adivinar.
   ═══════════════════════════════════════════════════════════ */
var ESPERADO = [
  { tabla: 'remitos',   columna: 'cliente_num',   para: 'vincular el remito con su cliente' },
  { tabla: 'remitos',   columna: 'sin_cliente',   para: 'dejar un remito sin cliente a propósito' },
  { tabla: 'remitos',   columna: 'cobrado_deuda', para: 'cobrar una deuda vieja en un remito nuevo' },
  { tabla: 'gastos',    columna: 'reintegrado',   para: 'marcar lo que la empresa ya devolvió' },
  { tabla: 'clientes',  columna: 'num_str',       para: 'el código R14-0010' },
  { tabla: 'push_subs', columna: 'avisos',        para: 'los avisos de cada teléfono' }
];

async function revisarEsquema() {
  abrirModal('Revisión de la base', cargando('Consultando…'));
  var faltan = [], hay = [];

  for (var i = 0; i < ESPERADO.length; i++) {
    var e = ESPERADO[i];
    try {
      await rest(e.tabla + '?select=' + e.columna + '&limit=1');
      hay.push(e);
    } catch (err) {
      e.error = err.message || '';
      faltan.push(e);
    }
  }

  abrirModal('Revisión de la base',
    (faltan.length
      ? avisoHTML('warn',
          '<strong>Faltan ' + plural(faltan.length, 'columna') + '.</strong> ' +
          'Hasta que corras el SQL, esas funciones no guardan: la app avisa y sigue ' +
          'andando sin ellas.', 'alert')
      : avisoHTML('ok', 'La base tiene todo lo que la app necesita.', 'check')) +

    '<div class="lista" style="margin-top:10px">' +
      faltan.concat(hay).map(function (e) {
        var ok = hay.indexOf(e) !== -1;
        return '<div class="fila" style="cursor:default;align-items:flex-start">' +
          '<span style="flex:0 0 auto;color:' + (ok ? 'var(--ok)' : 'var(--danger)') + '">' +
            ic(ok ? 'check' : 'x', 16) + '</span>' +
          '<div class="fila-principal">' +
            '<div class="fila-titulo">' + esc(e.tabla) + '.' + esc(e.columna) + '</div>' +
            '<div class="fila-sub">' + esc(e.para) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    (faltan.length
      ? '<div class="campo-ayuda" style="margin-top:12px">' +
        'En Supabase → SQL Editor, corré <code>sql/al-dia.sql</code> del zip. ' +
        'Se puede correr las veces que quieras: no rompe nada de lo que ya está.</div>'
      : ''));
}
