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
      '</details>' +

      tarjetaRutas() +
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
          '<button class="btn btn-secundario" onclick="salir()">' + ic('undo', 15) + ' Cerrar sesión</button>' +
        '</div>' +
      '</div>';

    previewAviso();
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


/* ── Plan semanal de hojas de ruta ───────────────────────── */
function tarjetaRutas() {
  var plan = planRutas();
  var cargadas = Object.keys(plan).filter(function (d) { return plan[d]; }).length;
  return '<details class="tarjeta">' +
    '<summary class="tarjeta-cab" style="cursor:pointer">' + ic('map', 16) + ' Hojas de ruta' +
      '<span style="margin-left:auto"><span class="pin pin-neutro">' +
        (cargadas ? plural(cargadas, 'día') + ' con ruta' : 'sin cargar') + '</span></span>' +
    '</summary>' +
    '<div class="tarjeta-cuerpo">' +
      '<div class="campo-ayuda" style="margin-bottom:12px">' +
        'Qué ruta recorrés cada día. Con esto el inicio te dice qué toca hoy y mañana, ' +
        'cuántos exhibidores preparar y si hay pedidos que caen en esa zona. Dejá vacío el día que no salís.' +
      '</div>' +
      [1, 2, 3, 4, 5, 6, 0].map(function (d) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          '<span style="width:90px;font-size:13px;color:var(--text2)">' + capitalizar(DIAS[d]) + '</span>' +
          '<input class="campo-input plan-dia" data-dia="' + d + '" type="number" min="0" ' +
                 'style="max-width:110px" placeholder="—" value="' + esc(plan[String(d)] || '') + '"/>' +
        '</div>';
      }).join('') +
      '<button class="btn btn-primario btn-bloque" style="margin-top:8px" onclick="guardarPlanRutas()">Guardar</button>' +
    '</div>' +
  '</details>';
}

async function guardarPlanRutas() {
  var plan = {};
  $$('.plan-dia').forEach(function (el) {
    var v = (el.value || '').trim();
    if (v) plan[el.dataset.dia] = v;
  });
  try {
    await guardarConfig('plan_rutas', JSON.stringify(plan));
    toast('Plan de rutas guardado');
    pintarRuta();
  } catch (e) { toast(e.message, 'error'); }
}
