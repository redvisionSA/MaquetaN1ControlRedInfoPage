# Contrato del catálogo público (ERP → tienda controlred.com.ar)

La tienda no tiene base de datos propia. Lee el catálogo de Control Red desde el ERP
(`api-erp.redvision.com.ar`) en **modo solo lectura**, por un endpoint público que el ERP
expone para este fin. Es el mismo contrato que usa redvision.com.ar; la **ruta** elige la empresa
(`/storefront/controlred/catalog`), nunca un parámetro: la tienda de CR no puede pedir datos de
REDVISION ni al revés. En producción desde el 16/11/2026 (`erp-backend-00056-2bx`).

- Consumidores en la web: `src/tienda/catalogo.js` (navegador, `VITE_CATALOGO_URL`) y
  `api/pedido.js` (servidor, `CATALOGO_URL`, para poner precio a los pedidos).
- Sin `VITE_CATALOGO_URL`, `npm run dev` usa `src/tienda/demo.js` (marcado en pantalla como
  demostración); el build de producción no lo incluye y usa el endpoint de producción. Si el ERP no
  responde, la tienda muestra "catálogo en actualización".

## Endpoint

```
GET https://api-erp.redvision.com.ar/storefront/controlred/catalog   (VITE_CATALOGO_URL)
Accept: application/json
```

Respuesta `200`, `Content-Type: application/json`, `Cache-Control: public, max-age=300`.
CORS: `Access-Control-Allow-Origin` para `https://controlred.com.ar` y `https://www.controlred.com.ar`
(y `http://localhost:5173` / `5180` solo fuera de producción; en desarrollo contra producción se usa el
proxy `/erp` de `vite.config.js`). 60 pedidos/min por IP por tienda (429 con `Retry-After`); tienda
apagada → 404 `STOREFRONT_DISABLED`; empresa no cargada → 503.

```json
{
  "company": "CR",
  "currency": "ARS",
  "updatedAt": "2026-11-12T13:00:00-03:00",
  "brands": [{ "slug": "dahua", "name": "Dahua Technology" }],
  "categories": [{ "slug": "camaras-ip", "name": "Cámaras IP", "parent": null }],
  "products": [
    {
      "id": "uuid del producto",
      "slug": "camara-ip-bullet-4mp-dh-ipc-hfw2441s-s",
      "sku": "DH-IPC-HFW2441S-S",
      "name": "Cámara IP bullet 4 MP …",
      "description": "Texto plano, puede tener saltos de línea",
      "brand": "dahua",
      "category": "camaras-ip",
      "imageUrl": "https://… (URL pública directa, o null)",
      "price": "98500.00",
      "availability": "disponible",
      "featured": false,
      "specs": {
        "mp": 4,
        "technologies": ["Full-Color", "WizSense", "PoE"],
        "formFactor": "Bullet",
        "channels": null,
        "lensMm": 2.8,
        "irRangeM": 30,
        "environment": "exterior",
        "storageTb": null,
        "ports": null,
        "poe": true
      }
    }
  ]
}
```

### Campos de producto

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | Estable. Es lo único que el carrito guarda y lo que `api/pedido.js` busca. |
| `slug` | string | Estable y único; forma la URL `/producto/{slug}`. Cambiarlo rompe enlaces compartidos. |
| `sku` | string | Código visible al cliente (el que usa Ventas). |
| `name`, `description` | string | Sin HTML. |
| `brand`, `category` | slug | Deben existir en `brands` / `categories`. |
| `imageUrl` | string \| null | Sin foto = `null` (la web dibuja un ícono de la línea). |
| `price` | string decimal \| null | **Lista GREMIO de Control Red, en pesos, final con IVA** (decisión del 16/11: el precio público de la web es Gremio), convertida con la cotización del día que usa el ERP (BNA billete vendedor). `null` = "Consultar precio". Nunca `0`. |
| `availability` | enum | Disponible (físico − reservado) en los depósitos `MAIN` de CR: `disponible` (> 3) · `ultimas` (1 a 3) · `a_pedido` (0) · `sin_stock` (discontinuado). **No se publica la cantidad exacta.** |
| `featured` | bool | Opcional. Destacados del inicio (hoy siempre `false`: el inicio usa un criterio fijo, ver `seleccionDestacada` en `src/paginas/Inicio.jsx`). |
| `specs` | object | **Opcional**, alimenta los filtros de la tienda. Cada clave puede faltar o ser `null`. Ver abajo. |

### `specs` (filtros facetados)

| Clave | Tipo | Ejemplo | Filtro en la tienda |
|---|---|---|---|
| `mp` | número | `4` | Resolución |
| `technologies` | string[] | `["ColorVu","AcuSense"]` | Tecnología. Nombres de la marca tal cual (ColorVu, AcuSense, TandemVu, DarkFighter, Turbo HD, Full-Color, WizSense, HDCVI, IP, Wi-Fi, PoE, ePoE, H.265+…). |
| `formFactor` | string | `"Domo"` | Tipo de equipo (Domo, Bullet, PTZ, Turret / eyeball, Fisheye, NVR, XVR / DVR, Switch, Lector, Panel, Sensor, Fuente, UPS, Disco). |
| `channels` | número | `8` | Canales (grabadores). |
| `lensMm` | número | `2.8` | Lente. |
| `irRangeM` | número | `30` | Alcance de visión nocturna (la web lo agrupa en tramos). |
| `environment` | `"interior"` \| `"exterior"` | | Instalación. |
| `storageTb` | número | `4` | Capacidad (discos). |
| `ports` | número | `8` | Puertos (switches). |
| `poe` | bool | `true` | Alimentación PoE. |

Si el ERP no manda `specs` (o manda solo algunas claves), la web completa lo que falta leyendo el
nombre y la descripción (`src/tienda/specs.js`): "4 MP", "Full-Color", "8 canales", "2,8 mm",
"IR 30 m". Solo extrae lo escrito; nunca deduce. Lo que manda el ERP gana siempre.

### Marcas

- Marcas de dispositivos con identidad propia en la tienda (logo y color), con **Hikvision como marca
  de referencia** (sello «Hik Tech Ambassador oficial» en su ficha) (`src/tienda/marcas.js`). Se reconocen por slug o nombre; los logos oficiales van en
  `public/marcas/` (`dahua.svg`, `hikvision.png`, `imou.png`, `ezviz.webp`, `tp-link.png`, `tenda.webp`). También EZVIZ, TP-Link y Tenda.
- **Marcas genéricas o alternativas** (slug o nombre con "genérico", "sin marca", "alternativa",
  "OEM", "varios", "otras marcas", "importado"…): la tienda **no muestra la marca**; el producto va a
  la línea de su categoría, como cualquier otro (13/11). Si el ERP tiene un nombre distinto para estas marcas,
  sumarlo al patrón `GENERICA` de `marcas.js`.



## Lo que el endpoint nunca expone

Costo, rentabilidad, otras listas (Mayorista, Distribuidor, ECOMMERCE), stock exacto, datos de
REDVISION, proveedores, datos de clientes. Solo productos habilitados con precio vigente > 0 de la
lista GREMIO de CR. Las listas del canal y la cantidad en stock llegan solo con sesión de cliente
(`/shop/controlred/me/prices` y `me/stock`).

### Categorías

`parent` es el slug del padre o `null`. La web no replica el árbol: ubica cada categoría en una de
sus seis líneas (CCTV, control de acceso, alarmas, automatización y conectividad, energía,
accesorios) por palabras clave (`src/tienda/lineas.jsx`). Lo que no encaja cae en accesorios.

## Pedidos

El navegador manda a `api/pedido.js` solo `{ id, cantidad }`. El servidor vuelve a leer este
endpoint y pone el precio. Si el endpoint no responde, el pedido se registra igual con "precio a
confirmar". Fase 1: el pedido llega a ventas por correo; no hay cobro en línea ni escritura en el
ERP.

## Evolución prevista

1. Endpoint en el ERP (este contrato).
2. Pedido web → presupuesto en el ERP (en lugar del correo), por un endpoint propio con
   `Idempotency-Key`.
3. Mercado Pago (Checkout Pro) con webhook verificado (Pages Function).
4. ~~Precio por perfil con inicio de sesión~~: hecho (`/shop/controlred/me/prices`).
