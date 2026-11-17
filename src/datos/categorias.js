/**
 * categorias.js (configuracion)
 * -----------------------------------------------------------------------
 * La tienda se navega por las CATEGORIAS del ERP (arbol padre -> hijas ->
 * nietas que trae `GET /storefront/controlred/catalog`). Este archivo es el
 * unico lugar donde se decide su ORDEN y como se muestran; los nombres y la
 * jerarquia los manda el ERP.
 *
 * Regla de orden (en cada nivel del arbol, por separado):
 *   1. Las de PRIORIDAD, en el orden de la lista.
 *   2. El resto, alfabetico (castellano, sin distinguir tildes ni mayusculas).
 *   3. Al final, las de AL_FINAL (en ese orden) y cualquier «...-outlet».
 * Una categoria sin productos (contando sus hijas) no se muestra nunca.
 */

/* Prioridad: raices primero, despues hijas (cada nivel usa solo las suyas) */
export const PRIORIDAD = [
  /* raices */
  'cctv',
  'almacenamiento',
  'control-de-accesos',
  'porteria',
  'alarmas',
  'conectividad',
  'fuentes',
  'ups',
  'cables',
  'accesorios',
  'herramientas',
  /* hijas de CCTV: camaras, despues grabadores */
  'cctv-camaras-ip',
  'cctv-camaras-analogicas',
  'cctv-camaras-ip-wireless',
  'cctv-camaras-wi-fi-free-cable',
  'cctv-domos-ptz',
  'cctv-nvr',
  'cctv-dvr',
  /* hijas de Almacenamiento */
  'almacenamiento-discos-rigidos',
  'almacenamiento-tarjetas-micro-sd',
  /* hijas de Control de accesos */
  'control-de-accesos-controladoras',
  'control-de-accesos-lectoras',
  'control-de-accesos-kits',
]

export const AL_FINAL = ['outlet', 'por-clasificar-planilla-cr']

/* Toda «...-outlet» (CCTV > Outlet, Herramientas > Outlet...) va al final de su nivel */
export const esAlFinal = (slug) => AL_FINAL.includes(slug) || /(^|-)outlet$/.test(slug)

/* Nombre en pantalla cuando el del ERP es interno. Solo para esos casos. */
export const NOMBRE_VISIBLE = {
  'por-clasificar-planilla-cr': 'Otros productos',
}

/* Cuantas raices se ven a un clic: fila del encabezado, inicio y pie */
export const EN_LA_BARRA = 6

/* Links viejos de la tienda (`/productos/<linea>`, `?linea=`) -> categoria
   equivalente del ERP. Si algun dia el ERP crea una categoria con el mismo
   slug, manda la categoria. */
export const LINEAS_VIEJAS = {
  cctv: 'cctv',
  accesos: 'control-de-accesos',
  alarmas: 'alarmas',
  conectividad: 'conectividad',
  energia: 'fuentes',
  accesorios: 'accesorios',
}

/* Icono de la tarjeta del inicio: id de linea de `src/tienda/lineas.jsx`.
   Sin entrada, se deduce del nombre de la categoria. */
export const ICONO = {
  almacenamiento: 'cctv',
  porteria: 'accesos',
  'control-de-accesos': 'accesos',
  ups: 'energia',
  fuentes: 'energia',
}
