# Control Red v2 — Landing + Playground 3D + Tienda

Segunda versión del sitio. Estática, sin build: se despliega igual que la v1 (Vercel, preset *Other*).
Abrí `v2/index.html` desde cualquier servidor estático (`python -m http.server`), no desde `file://` (los ES modules lo requieren).

## Páginas
| Archivo | Qué es |
|---|---|
| `index.html` | Landing con hero 3D en vivo, escenarios, tecnologías, tienda destacada, nosotros, contacto |
| `showroom.html` | **Playground 3D**: 4 mapas, acciones causa→efecto, feed de cámara PiP, modal de productos |
| `tienda.html` | Catálogo filtrable con el mismo carrito (localStorage) |

## Stack
- Three.js r170 + GSAP 3 desde CDN (import map). Sin framework, sin bundler.
- `css/base.css` — tokens de marca (`#344AB2`, `#6B6464`, rojo Hik `#E2231A`), light/dark, material **Liquid Glass**, botones, nav, carrito.
- `js/catalog.js` — **única fuente de verdad**: productos (SKUs oficiales Hikvision), escenas y hotspots (`hotspot_id → tecnología → productos`). El modal ordena de mayor a menor precio.
- `js/core.js` — tema, header compartido, carrito, toasts, card de producto.
- `js/showroom/viewer.js` — `ShowroomViewer`: un solo canvas, hotspots HTML proyectados (sin raycasting), feed PiP con modos `color | ir | cv | th | split | zoom | dash` (swap de materiales por malla), día/noche, `dispose()` de VRAM al cambiar de mapa.
- `js/showroom/lib.js` — constructores low-poly (edificios, vehículos, personas, cámaras, barreras, radar, etc.).
- `js/showroom/scenes/*.js` — cada mapa exporta `{ id, camera, glb, build(ctx) → { hotspots, actions, reset } }`.

## Cómo agregar un dispositivo / producto
1. Producto: agregá el SKU en `PRODUCTS` (catalog.js) con `cat`, `tier`, `price_usd`, `specs`.
2. Hotspot: agregá una entrada en `HOTSPOTS` con `scene` y `skus`.
3. En la escena, devolvé `{ id, target: <Object3D>, offsetY, offset }` en `hotspots`.

## Reemplazar las escenas procedurales por modelos de Blender
Las escenas hoy se construyen en código para que todo funcione sin assets. El loader GLB/Draco ya está:
1. En Blender nombrá los objetos: `HOTSPOT_<id>` (empties donde va el botón), `ANIM_<nombre>` (mallas a animar: brazo de barrera, alas de molinete), `LAMP_<n>` (empties que se vuelven luces de noche). Horneá luz/AO en la textura base y uní la geometría estática.
2. Optimizá: `npm i -g @gltf-transform/cli` y `gltf-transform optimize mapa.glb mapa_prod.glb --compress draco --texture-compress webp`.
3. En la escena poné `glb: 'models/mapa_prod.glb'` y en `build(ctx, gltf)` buscá los objetos por nombre (`gltf.scene.getObjectByName('ANIM_BarrierArm')`) para las acciones. Las mallas conservan `userData.heat` si lo exportás como custom property.

## Pendientes conocidos
- Precios referenciales; conectar a la lista real / MercadoLibre.
- Número de WhatsApp placeholder en `core.js` e `index.html`.
- Fotos reales de producto en `productCard` (hoy usa iconos por categoría).
