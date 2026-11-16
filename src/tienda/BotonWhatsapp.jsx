import { useLocation } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { CONSULTAS, enlaceWhatsapp, mensajeProducto } from './whatsapp.js'
import { IconoWhatsapp } from './Iconos.jsx'

/**
 * Acceso flotante a un asesor, con el boton verde de la web v1 (.wa-float).
 * En la ficha de producto el mensaje ya trae el producto: quien escribe no
 * tiene que explicar que estaba mirando. En telefono, en la ficha, sube para
 * no tapar la barra fija de compra.
 */
export default function BotonWhatsapp() {
  const { pathname } = useLocation()
  const { catalogo } = useTienda()

  const slug = pathname.startsWith('/producto/') ? decodeURIComponent(pathname.slice('/producto/'.length)) : null
  const producto = slug ? catalogo.datos.porSlug.get(slug) : null
  const texto = producto ? mensajeProducto(producto) : CONSULTAS.asesor

  if (pathname === '/carrito') return null

  return (
    <a
      className={`wa-float ${producto ? 'max-lg:!bottom-[88px]' : ''}`}
      href={enlaceWhatsapp(texto)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
    >
      <span className="wa-ping" aria-hidden="true" />
      <IconoWhatsapp />
    </a>
  )
}
