import { useEffect } from 'react'

const SITIO = 'Control Red'
const ORIGEN = 'https://www.controlred.com.ar'
/* El mismo valor que index.html; las paginas de cuenta lo cambian a noindex */
const ROBOTS_BASE = 'index, follow, max-image-preview:large, max-snippet:-1'
const DESCRIPCION_BASE =
  'Tienda de seguridad electrónica en CABA: cámaras IP, DVR/NVR Hikvision, control de acceso, alarmas y automatización. Envíos a todo el país y retiro en Flores.'

function fijarMeta(nombre, valor, atributo = 'name') {
  let nodo = document.head.querySelector(`meta[${atributo}="${nombre}"]`)
  if (!nodo) {
    nodo = document.createElement('meta')
    nodo.setAttribute(atributo, nombre)
    document.head.appendChild(nodo)
  }
  nodo.setAttribute('content', valor)
}

/** Titulo, descripcion y canonica por ruta (SPA: lo leen navegadores y Google al renderizar). */
export function usePagina({ titulo, descripcion, indexar = true } = {}) {
  useEffect(() => {
    const tituloCompleto = titulo ? `${titulo} | ${SITIO}` : 'Cámaras de Seguridad y CCTV Hikvision | Control Red CABA'
    document.title = tituloCompleto
    fijarMeta('robots', indexar ? ROBOTS_BASE : 'noindex, nofollow')
    fijarMeta('description', descripcion || DESCRIPCION_BASE)
    fijarMeta('og:title', tituloCompleto, 'property')
    fijarMeta('og:description', descripcion || DESCRIPCION_BASE, 'property')
    const canonica = document.head.querySelector('link[rel="canonical"]')
    if (canonica) canonica.setAttribute('href', `${ORIGEN}${window.location.pathname}`)
  }, [titulo, descripcion, indexar])
}

/** Contenedor de pagina interior. La barra de la v1 es sticky (ocupa lugar), asi
    que alcanza un margen superior corto. */
export default function Pagina({ children, className = '' }) {
  /* .container es la grilla de la v1 (1240 px) y fija su propio padding: el
     espacio vertical va en un div aparte para que no lo pise. */
  return (
    <div className="container">
      <div className={`pb-10 pt-6 sm:pt-8 ${className}`}>{children}</div>
    </div>
  )
}
