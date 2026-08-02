-- ═══════════════════════════════════════════════════════════
-- Intencional — esquema de la base
-- Ya está aplicado en el proyecto actual. Queda versionado acá
-- para poder levantar la misma base en otro proyecto Supabase.
-- ═══════════════════════════════════════════════════════════

-- ── Clientes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id                  bigserial PRIMARY KEY,
  num                 bigint UNIQUE NOT NULL,
  num_str             text,
  fecha               text,
  local               text,
  rubro               text,
  duenio              text,
  cuit                text,
  tel                 text,
  tel2                text,
  dir                 text,
  loc                 text,
  probador_cremas     boolean DEFAULT false,
  ruta                jsonb,
  doc_tipo            text,
  regimen             text,
  activo              boolean DEFAULT true,
  lat                 double precision,
  lng                 double precision,
  geo_manual          boolean DEFAULT false,
  aviso_aumento       boolean DEFAULT false,
  aviso_aumento_fecha date,
  created_at          timestamptz DEFAULT now()
);

-- ── Remitos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS remitos (
  id             bigserial PRIMARY KEY,
  fecha          text,
  cliente_nombre text,
  cliente_tel    text,
  cliente_dir    text,
  cliente_loc    text,
  total          numeric DEFAULT 0,
  unidades       integer DEFAULT 0,
  productos      jsonb,
  pago           text,
  alias          text,
  pagos_detalle  jsonb,
  pago2_tipo     text,
  pago2_monto    numeric,
  pago2_alias    text,
  facturado      boolean DEFAULT false,
  saldado        boolean DEFAULT false,
  saldado_fecha  text,
  notas          text,     -- observaciones que salen en el comprobante
  motivo         text,     -- vacío = normal · 'cerrado' = se pasó y estaba cerrado
  created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS remitos_cliente_idx ON remitos (cliente_nombre);
CREATE INDEX IF NOT EXISTS remitos_creado_idx  ON remitos (created_at DESC);

-- ── Pagos (cobros de deuda) ───────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id              bigserial PRIMARY KEY,
  cliente_nombre  text,
  remito_id       bigint,
  monto           numeric DEFAULT 0,
  medio           text,
  alias           text,
  fecha           text,
  nota            text,
  comprobante_url text,
  created_at      timestamptz DEFAULT now()
);

-- ── Gastos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
  id          bigserial PRIMARY KEY,
  descripcion text,
  categoria   text,
  monto       numeric DEFAULT 0,
  fecha       text,
  notas       text,
  created_at  timestamptz DEFAULT now()
);

-- ── Compras ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras (
  id             bigserial PRIMARY KEY,
  fecha          text,
  tipo           text,
  items          jsonb,
  total_unidades integer DEFAULT 0,
  total_costo    numeric DEFAULT 0,
  notas          text,
  created_at     timestamptz DEFAULT now()
);

-- ── Stock ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_categorias (
  id     text PRIMARY KEY,
  nombre text,
  icono  text
);

CREATE TABLE IF NOT EXISTS stock (
  id         bigserial PRIMARY KEY,
  nombre     text,
  categoria  text,
  precio     numeric DEFAULT 0,
  cant       integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ── Pendientes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas (
  id         bigserial PRIMARY KEY,
  texto      text,
  hecha      boolean DEFAULT false,
  tipo       text DEFAULT 'otro',   -- nuevo · pedido · retirar · otro
  created_at timestamptz DEFAULT now()
);

-- ── Pedidos ───────────────────────────────────────────────
-- Estas dos las armé con lo mínimo que usa la app: si en
-- producción tienen más columnas, agregalas después.
CREATE TABLE IF NOT EXISTS pedidos (
  id             bigserial PRIMARY KEY,
  cliente_nombre text,
  detalle        text,
  estado         text DEFAULT 'pendiente',
  fecha          text,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos_propios (
  id         bigserial PRIMARY KEY,
  detalle    text,
  estado     text DEFAULT 'pendiente',
  fecha      text,
  created_at timestamptz DEFAULT now()
);

-- ── Configuración (clave/valor) ───────────────────────────
CREATE TABLE IF NOT EXISTS config (
  key   text PRIMARY KEY,
  value text
);

INSERT INTO config (key, value) VALUES
  ('aumento_activo',       'true'),
  ('aumento_producto',     'Esmalte en Gel'),
  ('aumento_precio_viejo', '2200'),
  ('aumento_precio_nuevo', '2400')
ON CONFLICT (key) DO NOTHING;

-- ── Datos mínimos para que la app tenga qué mostrar ────────
INSERT INTO stock_categorias (id, nombre) VALUES
  ('esmalte', 'Esmaltes'), ('cremas', 'Cremas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stock (nombre, categoria, precio, cant) VALUES
  ('Esmalte en Gel',  'esmalte', 2200, 0),
  ('Crema de Ordeñe', 'cremas',  6900, 0);

-- ── Permisos ──────────────────────────────────────────────
-- En una base de pruebas conviene dejarla abierta para la clave
-- anon: si no, la app entra pero no ve nada. NO hagas esto en
-- producción.
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_propios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE config           ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clientes','remitos','pagos','gastos','compras',
                           'stock','stock_categorias','tareas','pedidos',
                           'pedidos_propios','config']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS pruebas_todo ON %I', t);
    EXECUTE format('CREATE POLICY pruebas_todo ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ── Verificación ──────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
