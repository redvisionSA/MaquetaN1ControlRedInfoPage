# Control Red Web — memoria del proyecto

Tienda en línea de **Control Red S.R.L.** (seguridad electrónica, Hikvision como marca de
referencia, local en Av. Gaona 3565, Flores, CABA). Rama `claude/tienda-cr` (16/11/2026): el sitio
pasó de un `index.html` vanilla a una tienda 100 % enfocada en vender, construida sobre los motores
de la tienda de REDVISION (repo `RedvisionWeb`, rama `claude/stock-sesion`). Se conservan el
**hero** (emblema 3D) y la sección **tecnologías** (`#tecnologias`, showroom Hikvision) de la web v1.

- Repo: `github.com/redvisionSA/MaquetaN1ControlRedInfoPage`. `main` local = v1 + v2 (`cb6f761`,
  lo publicado) ; `claude/tienda-cr` = `main` + `origin/main` (`355b83b`, teléfono 11 2480-2161) + la tienda.
- Producción: **Cloudflare Pages, proyecto `controlred-web`** (`controlred.com.ar` y `www`). Subida
  directa: **un push no publica**. No tocar `controlred-playground`, `controlred-info` ni `controlred-redirects`.
- Stack: Vite 5 + React 18 + Tailwind 3 + `react-router-dom` 6 (igual que RV, así los motores se
  comparten sin traducción). `three` **0.128** (la misma r128 de la v1: el emblema se ve idéntico) y
  `gsap` 3.12.5 desde npm, **solo en el chunk de la vitrina del inicio** (WebGL solo en `/`).
- Comandos: `npm run dev` (5190), `npm run build`, `npm run probar` (pedido + popularidad con fetch y
  D1 simulados). Las funciones no corren en `npm run dev`: `npx wrangler pages dev dist`.

## Reglas que no se negocian
- **No inventar cifras**: precios, stock, reseñas, plazos, garantías. Los textos de respaldo dicen
  solo lo que la v1 ya afirmaba (envíos a todo el país, retiro en Flores, MercadoLíder Platinum,
  asesoramiento por WhatsApp). La v1 no tenía reseñas: no hay sección de reseñas.
- **El navegador nunca manda un precio**: `api/pedido.js` vuelve a leer el ERP.
- **Límite entre empresas**: la tienda lee solo `/storefront/controlred/catalog` y `/shop/controlred`.
  Nunca datos, precios, stock ni marca de REDVISION.
- **WebGL solo en el inicio** (`src/vitrina/montar.js` se importa dinámicamente desde `Inicio.jsx`).
- Tono: **voseo** (como la v1: «podés», «Contanos»). RV trata de usted: al traer código de RV, pasar
  los textos a vos.
- Táctil ≥ 44 px, inputs a 16 px, `prefers-reduced-motion`/`-transparency`. Probado en 320 y 1366,
  claro y oscuro.
- Filtro de riesgo en cada cambio (seguridad, estabilidad, escala) y costo dentro de USD 350–450/mes
  (Pages, D1 y Resend gratis en este volumen).
- Commit, push y publicación solo con el OK del usuario. La base `rvcr_dev` del ERP no se toca.

## Mapa del código
| Qué | Dónde |
|---|---|
| Entrada, rutas | `index.html` (meta, OG y JSON-LD de la v1, FAQ alineada con la del inicio), `src/main.jsx`, `src/App.jsx` |
| Estilos | `src/index.css` (Tailwind + piezas `cr-*` de la tienda) y **después** `src/estilos/v1.css` (CSS de la v1: tokens `--bg/--accent/--glass-*`, barra, hero, showroom, ubicación, FAQ, pie). Tema oscuro = `data-theme="dark"` en `<html>` (Tailwind `darkMode: ['selector', ...]`). |
| Tema | `src/componentes/Tema.jsx`: arranca siempre claro; avisa `themechange` (lo escuchan hero y partículas). |
| Barra y pie | `src/componentes/Encabezado.jsx` (barra de confianza Hikvision + barra v1 + buscador, cuenta, favoritos, carrito; fila de departamentos desde 921 px; publica `--chrome-h` para el hero), `Pie.jsx` |
| Vitrina v1 | `src/vitrina/hero.html`, `tecnologias.html` (HTML de la v1, imágenes extraídas a `public/img/`) y `montar.js` (scripts de la v1 con limpieza de listeners/observers/RAF/GPU al salir del inicio; generado una vez con `scripts/generar-montar.mjs`, ahora se edita a mano). Video del showroom en `public/video/`. |
| Inicio | `src/paginas/Inicio.jsx`: hero → departamentos → carrusel → tecnologías (cada tarjeta enlaza a `/productos?q=…`) → marcas → respaldo → banda mayorista → proyectos/capacitaciones (reducido) → ubicación y canales → preguntas → banda CTA. |
| Tienda (motores de RV) | `src/tienda/*` (catálogo, búsqueda y facetas, buscador, líneas, marcas, similares/compatibles, disponibilidad, carrito, WhatsApp, popularidad), `src/cuenta/*`, `src/paginas/{Catalogo,Producto,Carrito,Favoritos,Cuenta}.jsx` |
| Datos de contacto | `src/datos/empresa.js` (fuente única; el JSON-LD de `index.html` es manual) |
| Servidor | `api/pedido.js` (Resend, número `CR-W-AAMMDD-XXXXX`), `api/_popularidad.js`, `api/_limites.js`, `functions/` (adaptador `_vercel.js`, `api/pedido`, `api/evento`, `api/populares`) |

### Diferencias con la tienda de RV
- **Líneas** (`lineas.jsx`): las cuatro familias de la v1 + energía + accesorios: `cctv`, `accesos`,
  `alarmas`, `conectividad` (portones, placas, redes), `energia`, `accesorios`.
- **Marcas**: Hikvision `oficial: true` (sello «Hik Tech Ambassador oficial» en su ficha, `SelloHikvision.jsx`);
  Dahua es una marca más. Tecnologías nuevas en `specs.js`: TandemVu, DarkFighter, **Turbo HD**
  (los compatibles comparan IP contra analógico HD, Turbo HD o HDCVI).
- **Rojo** `cr-red` (#E2231A) solo para lo que frena o apura (sin stock, últimas unidades, errores);
  el azul `cr-blue` (#344AB2) es el de los botones.
- **Destacados del inicio**: el ERP manda `featured: false`; sin ranking de popularidad, el carrusel
  usa `seleccionDestacada` (entrega inmediata + precio + foto, Hikvision y CCTV primero, ≤ 2 por
  categoría) y se titula «Productos destacados», nunca «lo más buscado».
- **Popularidad endurecida** (hallazgo de RV del 14/11, resuelto acá de entrada): el navegador solo
  manda `busqueda`/`carrito`; `pedido` lo registra `api/pedido.js` tras enviar el correo y solo con ids
  que el catálogo confirmó; `evento.js` valida ids contra el catálogo; el visitante es el /64 de su
  IPv6 (o su IPv4) y tiene un tope de 40 gestos por día.
- **Pedidos sin relevo de correo** (`api/_limites.js`, tabla `limites` de D1): tope de 20 pedidos por
  red y por día (429 → WhatsApp). La copia al cliente (solo con `RESEND_FROM`) es completa únicamente
  si hay sesión del ERP con el mismo correo de la cuenta; si no, plantilla fija con solo el número
  (nada del texto libre), a lo sumo 5 por red y 3 por correo por día, y sin D1 no sale. Turnstile
  queda como mejora si aparece abuso.

## ERP
- Catálogo: `GET https://api-erp.redvision.com.ar/storefront/controlred/catalog`, **en producción**
  desde el 16/11 (1574 productos al probar; precio = Gremio de CR con IVA; disponibilidad de los
  depósitos MAIN de CR). Contrato: `docs/CATALOGO_API.md`. CORS solo para controlred.com.ar/www.
- Cuentas: `/shop/controlred` (encendidas: `me` responde 401 sin token).
- **Combos de MercadoLibre** (17/11, contrato v2, aditivo): el catálogo trae `combos[]` (los aprobó una persona en el ERP, «Ofertas en la web»; precio = suma de sus productos a Gremio con IVA, calculado por el ERP). `catalogo.js` los suma como productos con `combo.componentes` (carrito, favoritos, búsqueda, categoría); la ficha lista lo que trae; `api/pedido.js` los busca en `combos` y el correo detalla el combo. Sin enlace a ML.
- En desarrollo: `.env.development.local` (no versionado, solo lo lee `npm run dev`) con
  `VITE_CATALOGO_URL=/erp/storefront/controlred/catalog` y `VITE_CUENTAS_URL=/erp/shop/controlred`
  usa el proxy `/erp` de `vite.config.js` contra **producción** (ojo con las cuentas: son reales).
  Sin ese archivo, `npm run dev` usa `src/tienda/demo.js` con la franja «Datos de demostración».

## Publicar (solo con OK explícito del usuario)
1. `npx wrangler pages deployment list --project-name controlred-web` y mirar la columna Source
   (hoy en vivo: `cb6f761`, la v1).
2. Desde un worktree limpio de la rama aprobada: `npm ci && npm run build`.
3. Variables del proyecto en Pages: `RESEND_API_KEY` (sin ella los pedidos ofrecen WhatsApp),
   opcionales `RESEND_FROM`, `PEDIDOS_EMAIL_DESTINO`; D1 `DB` con `docs/popularidad.sql` (tablas
   `eventos` y `limites`) y `POPULARIDAD_SAL` (sin la base el carrusel cae a destacados, los pedidos
   no tienen tope y no sale la copia a correos sin sesión).
4. `npx wrangler pages deploy dist --project-name controlred-web --branch main --commit-hash <sha>`.
5. Para volver atrás: Cloudflare → `controlred-web` → Deployments → «Rollback» al deploy de `cb6f761`.

## Pendientes y a confirmar
- **Medios de pago** del carrito (transferencia, efectivo, link de Mercado Pago) vienen de RV:
  confirmar que CR los ofrece.
- `og:image` apunta a `/assets/og-image.jpg`, que no existe en la web publicada (ya pasaba en la v1).
- El catálogo del ERP viaja **sin compresión** (~800 KB por visita): pedir gzip/br en el ERP.
- Popularidad: crear la D1 de CR y vincularla; Resend: key y dominio de CR.
- SEO por producto (prerender o SSR y `sitemap.xml`): la tienda es SPA, como la de RV.
- `v2/` (playground 3D y tienda estática con precios inventados) queda como referencia de diseño:
  no se publica ni se mezcla con la tienda.

## Herramientas
- Capturas: Edge headless + `puppeteer-core` (el panel del navegador a veces devuelve en blanco).
- Git en Windows avisa LF→CRLF; es inocuo. `legado/index-v1.html` tiene CRLF.
