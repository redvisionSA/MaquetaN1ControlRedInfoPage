/**
 * lineas.js
 * -----------------------------------------------------------------------
 * Las familias de producto de Control Red (las cuatro de la web v1 mas
 * energia y accesorios). Ya NO son la navegacion de la tienda: se navega por
 * las categorias del ERP (`categorias.js`, orden en `src/datos/categorias.js`).
 * Las lineas quedan como criterio tecnico interno (similares, compatibles,
 * venta cruzada del carrito, icono de respaldo) y no se muestran como menu.
 *
 * Cada categoria del ERP se ubica en una linea por palabras clave. Lo que no
 * encaja cae en "accesorios", nunca se pierde.
 */

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const IconoCamara = (p) => (
  <svg {...svg} {...p}>
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
)
const IconoAcceso = (p) => (
  <svg {...svg} {...p}>
    <path d="M2 12h20" />
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" />
    <path d="M12 6a6 6 0 0 1 0 12" />
  </svg>
)
const IconoAlarma = (p) => (
  <svg {...svg} {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
)
const IconoConectividad = (p) => (
  <svg {...svg} {...p}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
    <path d="M2 9a15 15 0 0 1 20 0" />
  </svg>
)
const IconoEnergia = (p) => (
  <svg {...svg} {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
  </svg>
)
const IconoAccesorio = (p) => (
  <svg {...svg} {...p}>
    <path d="m14.5 3.5 6 6-3 3-1.5-1.5L9 18l-4 1 1-4 7-7L11.5 6.5Z" />
  </svg>
)

export const LINEAS = [
  {
    id: 'cctv',
    Icono: IconoCamara,
    titulo: 'CCTV y videovigilancia',
    resumen: 'Cámaras, grabadores y almacenamiento.',
    texto: 'Cámaras IP, analógicas y HD, soportes, grabadores DVR/NVR y discos de vigilancia.',
  },
  {
    id: 'accesos',
    Icono: IconoAcceso,
    titulo: 'Control de acceso',
    resumen: 'RFID, biometría y controladores.',
    texto: 'Llaveros RFID, tarjetas de proximidad, lectoras de huella y rostro, y controladores para consorcios y oficinas.',
  },
  {
    id: 'alarmas',
    Icono: IconoAlarma,
    titulo: 'Alarmas y disuasión',
    resumen: 'Centrales, sensores, cercos y sirenas.',
    texto: 'Centrales de alarma, sensores de movimiento, cercos eléctricos y sirenas para la primera línea de defensa perimetral.',
  },
  {
    id: 'conectividad',
    Icono: IconoConectividad,
    titulo: 'Automatización y conectividad',
    resumen: 'Portones, placas y redes.',
    texto: 'Controles para portones automáticos, placas controladoras, switches, módulos de red y cableado.',
  },
  {
    id: 'energia',
    Icono: IconoEnergia,
    titulo: 'Energía',
    resumen: 'Fuentes, UPS y baterías.',
    texto: 'Fuentes de alimentación switching, sistemas de alimentación ininterrumpida y baterías de respaldo.',
  },
  {
    id: 'accesorios',
    Icono: IconoAccesorio,
    titulo: 'Accesorios',
    resumen: 'Soportes, conectores y herramienta.',
    texto: 'Soportes y cajas de conexión, conectores, herramienta e instrumental para la terminación de obra.',
  },
]

const REGLAS = [
  ['accesorios', /^accesorios\b|soporte|caja de (conexi|paso)|conector|ficha|balun|herramienta|crimp|canaliz|instrumental|tester|rotul/i],
  ['cctv', /c[aá]mara|domo|bullet|ptz|nvr|xvr|dvr|grabador|disco|video|cctv|lente|monitor|hdcvi|turbo ?hd|ip\b/i],
  /* acceso(?!ri): "accesorios" no es control de accesos */
  ['accesos', /acceso(?!ri)|lector|biom|facial|huella|rfid|proximidad|cerradura|molinete|portero|intercom|presentismo|tarjeta|llavero/i],
  ['alarmas', /alarma|intrusi|panel|sensor|detector|sirena|infrarroj|pir\b|magn[eé]tico|cerco|electrificador|boyero/i],
  ['conectividad', /port[oó]n|automatiz|placa|motor|control remoto|red(es)?\b|switch|router|enrutador|wifi|inal[aá]mbric|antena|enlace|utp|cable|fibra|patch|rack/i],
  ['energia', /fuente|ups|bater[ií]a|energ[ií]a|transformador|protector|estabilizador/i],
]

function clasificar(texto) {
  for (const [linea, regla] of REGLAS) {
    if (regla.test(texto)) return linea
  }
  return null
}

/* Manda la categoria del ERP; el nombre del producto solo desempata cuando la
   categoria no dice nada ("Soporte para domo" es accesorio, no camara). */
export function lineaDe(textoCategoria = '', nombre = '') {
  return clasificar(textoCategoria) || clasificar(nombre) || 'accesorios'
}

export function lineaPorId(id) {
  return LINEAS.find((l) => l.id === id) || null
}

/* Venta cruzada honesta: lo que una instalacion real necesita al lado del
   producto principal. No es "otros compraron", es criterio tecnico. */
export const COMPLEMENTOS = {
  cctv: ['conectividad', 'energia', 'accesorios'],
  accesos: ['energia', 'accesorios', 'conectividad'],
  alarmas: ['energia', 'accesorios'],
  conectividad: ['accesorios', 'energia'],
  energia: ['accesorios'],
  accesorios: ['cctv', 'conectividad'],
}
