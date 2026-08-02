# Intencional

Sistema interno de Intencional: remitos, clientes, compras, gastos y métricas.

Es una web estática — HTML, CSS y JavaScript, sin build ni dependencias.
Vercel la sirve tal cual está en el repo.

## Estructura

```
index.html          armazón; carga los scripts en orden
css/estilo.css      sistema visual (colores, tipografías, componentes)
js/config.js        a qué base de Supabase apunta la app
js/logo.js          logotipo en base64, para que funcione offline
js/iconos.js        set de íconos de línea
js/ui.js            escapado, formatos de plata y fecha, toast, modal
js/api.js           única puerta a Supabase: paginación, caché, errores
js/dominio.js       reglas del negocio (pagos, precios, pendientes)
js/router.js        navegación por hash y armado del menú
js/paginas/*.js     una pantalla por archivo; cada una se registra sola
js/app.js           arranque: ingreso, armazón, service worker
sw.js               caché offline
sql/esquema.sql     esquema de la base, por si hay que recrearla
```

Para agregar una pantalla: un archivo nuevo en `js/paginas/`, un
`<script>` en `index.html` y otra línea en la lista de `sw.js`.
El menú se arma solo con las páginas registradas.

## Base de datos

La conexión vive en `js/config.js`. La clave es la **publishable**
de Supabase: es pública por diseño, lo que protege los datos son las
políticas RLS del proyecto.

Desde Configuraciones → Base de datos se puede apuntar la app a otro
proyecto sin tocar el código; queda guardado en ese navegador.

## Ingreso

La app usa Supabase Auth. Para crear un usuario:
Supabase → Authentication → Users → **Add user**, con email y contraseña.

Mientras las políticas RLS permitan la clave pública, también se puede
entrar con **Entrar sin cuenta**. Si la app va a estar en una URL
pública, conviene cerrar las políticas y usar login.

## Deploy

Vercel detecta que es un sitio estático: sin comando de build ni
directorio de salida. Cada push a `main` publica.

`vercel.json` solo evita que se cachee `index.html` y `sw.js`, para
que los cambios se vean al recargar.
