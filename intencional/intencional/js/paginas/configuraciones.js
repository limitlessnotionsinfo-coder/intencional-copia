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
    await cargarConfig().catch(function () {});
    var cfg = aumentoConfig();
    var stock = await traerCacheado('stock');

    cont.innerHTML =
      '<div class="tarjeta">' +
        '<div class="tarjeta-cab">' + ic('megaphone', 16) + ' Aviso de aumento</div>' +
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
            '<input class="campo-input" id="cfg-producto" list="lista-prods" value="' + esc(cfg.producto) + '" oninput="previewAviso()"/>' +
            '<datalist id="lista-prods">' +
              stock.map(function (s) { return '<option value="' + esc(s.nombre) + '">'; }).join('') +
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
      '</div>' +

      '<div class="tarjeta">' +
        '<div class="tarjeta-cab">' + ic('users', 16) + ' Clientes ya notificados</div>' +
        '<div class="tarjeta-cuerpo" id="cont-avisados">' + cargando() + '</div>' +
      '</div>' +

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
          '<button class="btn btn-secundario" onclick="salir()">' + ic('undo', 15) + ' Cerrar sesión</button>' +
        '</div>' +
      '</div>';

    previewAviso();
    pintarAvisados();
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

async function pintarAvisados() {
  var cont = porId('cont-avisados');
  if (!cont) return;
  try {
    var clientes = await traerCacheado('clientes');
    var avisados = clientes.filter(clienteAvisado);
    cont.innerHTML = avisados.length
      ? '<div class="campo-ayuda" style="margin-bottom:10px">' +
          plural(avisados.length, 'cliente') + ' de ' + clientes.length + ' ya sabe del aumento.</div>' +
        '<div class="lista">' + avisados.slice(0, 30).map(function (c) {
          return '<div class="fila" style="cursor:default">' +
            '<span class="num-cliente">' + esc(c.num_str || c.num) + '</span>' +
            '<div class="fila-principal"><div class="fila-titulo">' + esc(c.local) + '</div>' +
              '<div class="fila-sub">' + esc(c.loc || '') + '</div></div>' +
            '<span class="pin pin-ok">' + esc(fechaCorta(c.aviso_aumento_fecha) || 'sin fecha') + '</span>' +
          '</div>';
        }).join('') + '</div>' +
        (avisados.length > 30 ? '<div class="campo-ayuda" style="margin-top:10px">y ' + (avisados.length - 30) + ' más.</div>' : '')
      : '<div class="campo-ayuda">Todavía no se le avisó a nadie. Se van marcando solos al confirmar cada remito.</div>';
  } catch (e) {
    cont.innerHTML = '<div class="campo-ayuda">No se pudo leer la lista.</div>';
  }
}


/* ── Conexión: a qué base apunta la app ──────────────────── */
function tarjetaConexion() {
  var propia = SB_URL !== SB_BASE.url;
  return '<div class="tarjeta">' +
    '<div class="tarjeta-cab">' + ic('signal', 16) + ' Base de datos' +
      '<span style="margin-left:auto"><span class="pin pin-ok">' + esc(CONEXION.nombre) + '</span></span>' +
    '</div>' +
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
  '</div>';
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
