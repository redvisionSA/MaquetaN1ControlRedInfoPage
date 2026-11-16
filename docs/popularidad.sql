-- Base D1 de la tienda (binding `DB` del proyecto Pages controlred-web).
-- Crear una sola vez:
--   npx wrangler d1 create controlred-web
--   npx wrangler d1 execute controlred-web --remote --file docs/popularidad.sql
-- y vincularla en Pages -> Settings -> Bindings -> D1 database: nombre `DB`.
CREATE TABLE IF NOT EXISTS eventos (
  dia      TEXT NOT NULL,  -- AAAA-MM-DD, hora de Argentina
  producto TEXT NOT NULL,  -- id del producto en el ERP
  tipo     TEXT NOT NULL,  -- busqueda | carrito | pedido
  origen   TEXT NOT NULL,  -- hash del visitante del dia (no permite recuperar la IP)
  PRIMARY KEY (dia, producto, tipo, origen)
);
CREATE INDEX IF NOT EXISTS eventos_dia ON eventos (dia);

-- Topes diarios de /api/pedido (api/_limites.js): pedidos por red y copias al
-- cliente por red y por correo. `clave` es un hash recortado, nunca la IP ni
-- el correo en claro. Se puede vaciar sin perder nada (solo cuenta el dia).
CREATE TABLE IF NOT EXISTS limites (
  dia   TEXT NOT NULL,     -- AAAA-MM-DD, hora de Argentina
  clave TEXT NOT NULL,     -- tipo:red|correo:hash
  n     INTEGER NOT NULL,  -- intentos del dia
  PRIMARY KEY (dia, clave)
);
