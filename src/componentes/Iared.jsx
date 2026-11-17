import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import IARED, { contactoIared } from '../datos/iared.js'

/**
 * Piezas de IARED en la tienda de Control Red: la marca, el boton que deriva
 * y el bloque destacado del inicio. Los proyectos (relevamiento, ingenieria,
 * integracion, puesta en marcha) los hace IARED; la tienda solo le da
 * visibilidad. Datos en `src/datos/iared.js`.
 *
 * Marca invitada con su propio manual (v1.0): verdes, Tinta/Noche, Sora en
 * los titulos y el logo oficial. Nada del azul de Control Red dentro de
 * `.iared-zona` (el manual lo prohibe como color de apoyo de IARED).
 */

/* Lo que resuelve IARED: alcance, sin cifras, plazos ni clientes.
   Iconos de linea, trazo 2, extremos redondeados (manual: estilo Lucide). */
export const ALCANCE_IARED = [
  {
    titulo: 'Relevamiento y diseño',
    texto: 'Visita al lugar, análisis de lo que hay que cubrir y un proyecto pensado para ese sitio.',
    icono: 'M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z M9 4v13 M15 7v13',
  },
  {
    titulo: 'Integración con IA aplicada',
    texto: 'CCTV, control de acceso, alarmas y redes trabajando juntos, con analítica que detecta y avisa.',
    icono: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z M10 7h4 M7 10v4 M17 10v4 M10 17h4',
  },
  {
    titulo: 'Puesta en marcha',
    texto: 'Instalación, configuración y verificación del sistema funcionando, punto por punto.',
    icono: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    titulo: 'Capacitación en la obra',
    texto: 'Entrega del sistema a quien lo va a usar, con la explicación de cada parte.',
    icono: 'M3 9l9-5 9 5-9 5-9-5Z M7 11.5V16c0 1.2 2.2 3 5 3s5-1.8 5-3v-4.5',
  },
]

/* Sora (tipografia del manual) solo cuando aparece IARED: el resto de la
   tienda no la descarga. Mismo proveedor que las fuentes de index.html. */
const SORA = 'https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap'
export function useFuenteIared() {
  useEffect(() => {
    if (document.getElementById('fuente-iared')) return
    const link = document.createElement('link')
    link.id = 'fuente-iared'
    link.rel = 'stylesheet'
    link.href = SORA
    document.head.appendChild(link)
  }, [])
}

export function IconoLinea({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/** Logo oficial: a color en tema claro, negativo en oscuro (manual, «Fondos compatibles»). */
export function MarcaIared({ grande = false, className = '' }) {
  const { logo, nombre, eslogan } = IARED
  if (!logo) {
    return (
      <span className={`iared-marca-texto ${className}`} role="img" aria-label={nombre}>
        {nombre}
      </span>
    )
  }
  const ancho = grande ? 260 : 210
  const alto = Math.round((ancho * logo.alto) / logo.ancho)
  const alt = `${nombre} — ${eslogan}`
  return (
    <span className={`iared-logo ${grande ? 'iared-logo--grande' : ''} ${className}`}>
      <img className="tsw-light" src={logo.claro} alt={alt} width={ancho} height={alto} decoding="async" />
      <img className="tsw-dark" src={logo.oscuro} alt={alt} width={ancho} height={alto} decoding="async" />
    </span>
  )
}

/** Boton que deriva a IARED (o al respaldo temporal, ver datos/iared.js). */
export function BotonIared({ className = '', children = 'Quiero que IARED me contacte' }) {
  const c = contactoIared()
  return (
    <a href={c.href} {...(c.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`iared-cta ${className}`}>
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  )
}

/** Aviso honesto mientras IARED no tiene canales propios. */
export function AvisoRespaldo({ className = '' }) {
  if (!contactoIared().respaldo) return null
  return (
    <p className={`iared-nota ${className}`}>
      Mientras IARED termina de armar sus canales, la consulta entra por nuestro WhatsApp y se la pasamos.
    </p>
  )
}

/** Bloque destacado del inicio: reemplaza a la vieja division de proyectos. */
export function BloqueIared() {
  useFuenteIared()
  return (
    <section className="iared-zona cr-iared v1-seccion" id="iared" aria-labelledby="titulo-iared">
      {/* Los enlaces viejos a /#proyectos caen aca */}
      <span id="proyectos" className="cr-iared-ancla" aria-hidden="true" />
      <div className="container cr-iared-grid">
        <div>
          <MarcaIared />
          <p className="iared-etiqueta">Proyectos e integración</p>
          <h2 id="titulo-iared">¿Necesitás un proyecto completo? Lo resuelve IARED.</h2>
          <p>
            Control Red se dedica a vender equipamiento. Los proyectos de seguridad electrónica, del relevamiento a la puesta en marcha, los lleva
            adelante <strong>IARED</strong>: proyectos e integración con inteligencia aplicada a la red.
          </p>
          <div className="cr-iared-acciones">
            <BotonIared />
            <Link to="/iared" className="iared-cta-sec">
              Conocé IARED
            </Link>
          </div>
          <AvisoRespaldo />
        </div>
        <ul className="cr-iared-alcance" aria-label="Qué resuelve IARED">
          {ALCANCE_IARED.map((a) => (
            <li key={a.titulo}>
              <span className="iared-icono">
                <IconoLinea d={a.icono} />
              </span>
              <span>
                <strong>{a.titulo}</strong>
                <span>{a.texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
