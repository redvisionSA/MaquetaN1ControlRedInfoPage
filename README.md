# Control Red — tienda en línea

Tienda de seguridad electrónica de Control Red (controlred.com.ar): catálogo del ERP en solo lectura,
carrito que envía el pedido por correo o WhatsApp (sin cobro en línea), búsqueda tolerante con filtros,
disponibilidad visible y cuentas de clientes con precios de su lista. Conserva el hero 3D y el showroom
de tecnologías Hikvision de la web anterior.

## Comandos

```
npm install
npm run dev       # http://localhost:5190 (sin variables: catálogo de demostración)
npm run build     # dist/
npm run probar    # pruebas del pedido y la popularidad (servidor)
```

Stack: Vite + React + Tailwind; three r128 y GSAP solo en el inicio. Cloudflare Pages (proyecto
`controlred-web`) con Pages Functions en `functions/`. Variables: `.env.example`.

La memoria del proyecto (decisiones, reglas, cómo publicar) está en `CLAUDE.md`. La web anterior
(un solo `index.html`) quedó en `legado/index-v1.html`.
