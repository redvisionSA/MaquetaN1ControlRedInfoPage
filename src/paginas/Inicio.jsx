import { memo, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { sePuedeComprar } from '../tienda/piezas.jsx'
import CarruselProductos from '../tienda/CarruselProductos.jsx'
import CarruselMarcas from '../tienda/CarruselMarcas.jsx'
import { usePopulares } from '../tienda/popularidad.js'
import { LINEAS } from '../tienda/lineas.jsx'
import { IconoCamion, IconoEstrella, IconoLocal, IconoTecnico, IconoWhatsapp } from '../tienda/Iconos.jsx'
import EMPRESA from '../datos/empresa.js'
import { enlaceConsulta } from '../tienda/whatsapp.js'
import { usePagina } from './Pagina.jsx'
import heroHtml from '../vitrina/hero.html?raw'
import tecnologiasHtml from '../vitrina/tecnologias.html?raw'


/**
 * Inicio = tienda con la vitrina de la web v1.
 *
 * Orden pensado para la decision de compra:
 *   1. Hero de la v1 (emblema 3D) con «Ver productos».
 *   2. Departamentos: el catalogo a un toque.
 *   3. Un solo carrusel: lo mas buscado y cotizado (o destacados).
 *   4. Tecnologias de la v1 (showroom Hikvision), cada una con su enlace a la tienda.
 *   5. Marcas, respaldo y canal mayorista.
 *   6. Lo institucional, reducido: proyectos, local de Flores y preguntas frecuentes.
 */

/* Respaldo: solo lo que la web v1 ya afirmaba de Control Red (sin cifras nuevas) */
const BENEFICIOS = [
  { Icono: IconoCamion, titulo: 'Envíos a todo el país', texto: 'Despachamos a todo el territorio argentino.' },
  { Icono: IconoLocal, titulo: 'Retiro en el local', texto: `${EMPRESA.direccion.calle}, Flores (CABA). Venta al mostrador.` },
  { Icono: IconoTecnico, titulo: 'Asesoramiento por WhatsApp', texto: 'Consultas de stock, precios mayoristas y soporte técnico.' },
  { Icono: IconoEstrella, titulo: 'MercadoLíder Platinum', texto: 'Máxima categoría de reputación en Mercado Libre.' },
]

/* Sin ranking ni destacados del ERP (hoy `featured` siempre llega en false):
   criterio fijo y verificable, sin inventar popularidad. Entrega inmediata,
   con precio y foto; primero la marca de referencia (Hikvision) y CCTV; a lo
   sumo dos por categoria para que el carrusel muestre variedad. */
function seleccionDestacada(productos, n = 12) {
  const candidatos = productos.filter(
    (p) => (p.disponibilidad === 'disponible' || p.disponibilidad === 'ultimas') && p.precio !== null && p.imagen
  )
  const puntaje = (p) => (p.marca?.identidad?.oficial ? 2 : 0) + (p.linea === 'cctv' ? 1 : 0)
  const ordenados = candidatos.map((p, i) => [p, i]).sort((a, b) => puntaje(b[0]) - puntaje(a[0]) || a[1] - b[1])
  const porCategoria = new Map()
  const out = []
  for (const [p] of ordenados) {
    const clave = p.categoria?.slug || p.linea
    const usados = porCategoria.get(clave) || 0
    if (usados >= 2) continue
    porCategoria.set(clave, usados + 1)
    out.push(p)
    if (out.length >= n) break
  }
  return out
}

/* El HTML de la v1 no cambia entre renders: memo evita que React lo toque */
const Html = memo(function Html({ html }) {
  return <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
})

function Departamentos() {
  return (
    <section aria-labelledby="titulo-deptos" className="cr-inicio-bloque">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="cr-eyebrow mb-1.5">Tienda</p>
          <h2 id="titulo-deptos" className="font-display text-xl font-bold sm:text-2xl">
            Comprá por departamento
          </h2>
        </div>
        <Link to="/productos" className="cr-link hidden text-sm font-semibold sm:inline">
          Ver todo el catálogo
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LINEAS.map((l) => (
          <li key={l.id}>
            <Link to={`/productos/${l.id}`} className="cr-solido cr-solido-hover group flex h-full flex-col gap-3 p-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cr-blue/10 text-cr-blue transition-colors group-hover:bg-cr-blue group-hover:text-white dark:bg-white/10 dark:text-cr-blue-glow">
                <l.Icono className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-sm font-bold leading-tight text-black group-hover:text-cr-blue dark:text-white dark:group-hover:text-cr-blue-glow">
                  {l.titulo}
                </span>
                <span className="cr-muted mt-1 block text-xs leading-snug">{l.resumen}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Beneficios() {
  return (
    <div className="cr-solido p-4 sm:p-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="cr-sutil inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cr-blue dark:text-cr-blue-glow">
              <Icono className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold">{titulo}</span>
              <span className="cr-muted mt-0.5 block text-xs leading-relaxed">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BandaMayorista() {
  return (
    <section className="cr-banda-mayorista" aria-labelledby="titulo-mayorista">
      <div>
        <p className="section-kicker">Ventas para gremios</p>
        <h2 id="titulo-mayorista">¿Sos instalador, integrador o empresa? Accedé a precios mayoristas.</h2>
        <p>
          Precios diferenciados por volumen para instaladores, gremios, consorcios y empresas. Con tu cuenta ves los precios de tu
          lista y el stock disponible.
        </p>
      </div>
      <div className="cr-banda-acciones">
        <a href={enlaceConsulta('mayorista')} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#fff', color: 'var(--blue-deep)' }}>
          Solicitar cuenta mayorista
        </a>
        <Link to="/cuenta/ingresar" className="btn btn-ghost cr-btn-sobre-azul">
          Ingresar a mi cuenta
        </Link>
      </div>
    </section>
  )
}

function SinCatalogo() {
  const { catalogo, reintentar } = useTienda()
  if (catalogo.estado !== 'error' && catalogo.estado !== 'sin-fuente') return null
  return (
    <div className="cr-solido p-6 text-center sm:p-8">
      <p className="font-display text-lg font-semibold">
        {catalogo.estado === 'error' ? 'No pudimos cargar el catálogo en este momento.' : 'Estamos actualizando el catálogo en línea.'}
      </p>
      <p className="cr-muted mx-auto mt-2 max-w-xl text-sm">Mientras tanto, un asesor te confirma precio y disponibilidad por WhatsApp.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer" className="cr-btn-primary">
          <IconoWhatsapp className="h-4 w-4" />
          Consultar por WhatsApp
        </a>
        {catalogo.estado === 'error' && (
          <button type="button" onClick={reintentar} className="cr-btn-glass">
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------ Institucional reducido */
function Proyectos() {
  return (
    <section className="macro v1-seccion cr-macro-corta" id="proyectos">
      <div className="container">
        <div className="macro-head">
          <span className="section-kicker">División de Proyectos</span>
          <h2>Macroproyectos de seguridad electrónica llave en mano</h2>
          <p>
            Además de la tienda, Control Red cuenta con una división propia de ingeniería que diseña, integra y ejecuta{' '}
            <strong style={{ color: '#fff' }}>macroproyectos de seguridad electrónica en todo el país</strong>: CCTV, control de acceso,
            alarmas y automatización en una sola solución, desde el relevamiento hasta la puesta en marcha y el soporte posterior.
          </p>
          <p>
            Y para el gremio, <strong style={{ color: '#fff' }}>capacitaciones técnicas sin costo</strong> en nuestro local de Flores. No hay
            fechas abiertas por el momento: escribinos y te avisamos de la próxima.
          </p>
          <div className="macro-cta">
            <a href={enlaceConsulta('proyecto')} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#fff', color: 'var(--blue-deep)' }}>
              Consultar por un proyecto
            </a>
            <a href={enlaceConsulta('capacitacion')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Avisame de la próxima capacitación
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const Flecha = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
)

function Ubicacion() {
  return (
    <section id="ubicacion" className="v1-seccion">
      <div className="container">
        <div className="section-head">
          <span className="section-kicker">Ubicación</span>
          <h2>Visitanos en nuestro local de Flores</h2>
          <p>Retirá tu pedido o consultanos en persona, en pleno corazón comercial de Av. Gaona.</p>
        </div>
        <div className="location-grid">
          <div className="location-card glow">
            <div className="loc-row">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div>
                <strong>Dirección</strong>
                <span>
                  {EMPRESA.direccion.calle}, CABA — {EMPRESA.direccion.referencia}
                </span>
              </div>
            </div>
            <div className="loc-row">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="7" width="15" height="13" rx="2" />
                  <path d="M16 11h3.5a1.5 1.5 0 0 1 1.5 1.5V17" />
                  <circle cx="7.5" cy="20" r="1.5" />
                  <circle cx="17.5" cy="20" r="1.5" />
                </svg>
              </div>
              <div>
                <strong>Forma de operación</strong>
                <span>Venta al por menor y mayorista, retiro en tienda física y envíos a todo el país.</span>
              </div>
            </div>
            <a href={EMPRESA.direccion.comoLlegar} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Cómo llegar
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
          <div className="map-frame">
            <iframe src={EMPRESA.direccion.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa Control Red - ${EMPRESA.direccion.calle}, CABA`} />
          </div>
        </div>

        <div className="contact-channels">
          <article className="channel-card glow wa">
            <div className="channel-icon">
              <IconoWhatsapp />
            </div>
            <h4>WhatsApp</h4>
            <p>Escribinos para consultas de stock, precios mayoristas o soporte técnico.</p>
            <a className="channel-link" href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer">
              {EMPRESA.telefono.display}
              <Flecha />
            </a>
          </article>
          <article className="channel-card glow ml">
            <div className="channel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h4>Mercado Libre</h4>
            <p>Visitá nuestra tienda oficial, calificada MercadoLíder Platinum.</p>
            <a className="channel-link" href={EMPRESA.redes.mercadoLibre} target="_blank" rel="noopener noreferrer">
              Ver tienda oficial
              <Flecha />
            </a>
          </article>
          <article className="channel-card glow mail">
            <div className="channel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
            </div>
            <h4>Ventas para gremios</h4>
            <p>Compras corporativas, consorcios y convenios gremiales.</p>
            <a className="channel-link" href={`mailto:${EMPRESA.email}`}>
              {EMPRESA.email}
              <Flecha />
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}

/* Preguntas de la v1, con las respuestas apuntando a la tienda (el JSON-LD
   de index.html repite estas preguntas: mantenerlos alineados). */
const PREGUNTAS = [
  {
    p: '¿Venden cámaras de seguridad al por mayor?',
    r: (
      <>
        Sí. Control Red opera como <strong>distribuidor mayorista y minorista</strong> de seguridad electrónica. Trabajamos con instaladores,
        integradores, gremios, consorcios y empresas, con precios diferenciados por volumen. Con tu cuenta de cliente ves los precios de tu lista
        en la tienda; para abrirla escribinos a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> o por{' '}
        <a href={enlaceConsulta('mayorista')} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        .
      </>
    ),
  },
  {
    p: '¿Cómo compro en la tienda?',
    r: (
      <>
        Armá el carrito y enviá el pedido: <strong>no se cobra nada en línea</strong>. Un asesor te confirma stock, precio final y envío, y te
        pasa los datos de pago. También podés mandar el pedido por WhatsApp.
      </>
    ),
  },
  {
    p: '¿Dónde queda el local de Control Red en CABA?',
    r: (
      <>
        Estamos en <strong>{EMPRESA.direccion.calle}</strong>, barrio de <strong>Flores</strong>, Ciudad Autónoma de Buenos Aires (
        {EMPRESA.direccion.codigoPostal}), a pocas cuadras del centro comercial de Av. Nazca. Podés comprar en el local y retirar tu pedido en el
        mostrador.
      </>
    ),
  },
  {
    p: '¿Hacen envíos a todo el país?',
    r: (
      <>
        Sí, realizamos <strong>envíos a todo el territorio argentino</strong> a través de nuestra tienda en línea y de Mercado Libre, donde somos
        vendedor <strong>MercadoLíder Platinum</strong>. También podés retirar el pedido en nuestro local de Flores, CABA.
      </>
    ),
  },
  {
    p: '¿Son distribuidores oficiales de Hikvision?',
    r: (
      <>
        Trabajamos con tecnología <strong>Hikvision</strong> como respaldo tecnológico de nuestro catálogo de CCTV y videovigilancia, incluyendo{' '}
        <strong>cámaras IP</strong>, cámaras analógicas y HD, y grabadores <strong>DVR y NVR</strong>.
      </>
    ),
  },
  {
    p: '¿Ofrecen capacitaciones técnicas?',
    r: (
      <>
        Sí. De forma periódica dictamos <strong>capacitaciones técnicas sin costo</strong> para instaladores, integradores, personal de
        mantenimiento de consorcios y equipos técnicos de empresas clientes, sobre configuración de NVR/DVR y cámaras IP, redes, control de acceso,
        biometría y centrales de alarma.
      </>
    ),
  },
]

function Preguntas() {
  return (
    <section id="preguntas-frecuentes" className="v1-seccion">
      <div className="container">
        <div className="section-head center">
          <span className="section-kicker">Preguntas frecuentes</span>
          <h2>Consultas habituales sobre compras y stock</h2>
          <p>Lo que más nos preguntan instaladores, consorcios y empresas antes de comprar.</p>
        </div>
        <div className="faq-wrap">
          {PREGUNTAS.map(({ p, r }) => (
            <details key={p} className="faq-item">
              <summary>{p}</summary>
              <div className="faq-answer">{r}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function BandaCta() {
  return (
    <section className="cta-band">
      <div className="container">
        <div>
          <h2>¿No encontrás lo que buscás? Te lo conseguimos.</h2>
          <div className="powered-mini">
            <img className="tsw-light" src="/marcas/hikvision.png" alt="Hikvision" width="127" height="17" loading="lazy" />
            <img className="tsw-dark logo-blanco" src="/marcas/hikvision.png" alt="Hikvision" width="127" height="17" loading="lazy" />
            <span>Tecnología respaldada por Hikvision</span>
          </div>
        </div>
        <a href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Escribinos por WhatsApp
        </a>
      </div>
    </section>
  )
}

export default function Inicio() {
  usePagina({})
  const { catalogo } = useTienda()
  const { productos, porId } = catalogo.datos
  const populares = usePopulares()

  /* Un solo carrusel: lo mas buscado y cotizado de la semana. Mientras no haya
     ranking (base sin datos o sin configurar), los destacados. El titulo dice
     la verdad sobre que se esta mostrando. */
  const ranking = useMemo(() => (populares || []).map((id) => porId.get(id)).filter((p) => p && sePuedeComprar(p)), [populares, porId])
  const hayRanking = ranking.length >= 4
  const carrusel = useMemo(() => {
    if (hayRanking) return ranking.slice(0, 12)
    const marcados = productos.filter((p) => p.destacado && sePuedeComprar(p))
    if (marcados.length >= 4) return marcados.slice(0, 12)
    return seleccionDestacada(productos)
  }, [hayRanking, ranking, productos])

  /* La vitrina de la v1 (three + gsap) es un chunk propio que solo pide el
     inicio, despues de pintar: la tienda no espera a WebGL. */
  const raiz = useRef(null)
  useEffect(() => {
    let desmontar = null
    let vivo = true
    import('../vitrina/montar.js').then(({ montarVitrina }) => {
      if (vivo && raiz.current) desmontar = montarVitrina(raiz.current)
    })
    return () => {
      vivo = false
      desmontar?.()
    }
  }, [])

  /* Los enlaces internos del HTML de la v1 ("/productos?q=...") navegan dentro de la SPA */
  const navigate = useNavigate()
  const alHacerClic = (e) => {
    const a = e.target.closest?.('a[href^="/"]')
    if (!a || a.target === '_blank' || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    navigate(a.getAttribute('href'))
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div ref={raiz} onClick={alHacerClic}>
        <Html html={heroHtml} />

        <div className="cr-inicio-tienda">
          <Departamentos />
          <SinCatalogo />
          <CarruselProductos
            eyebrow={hayRanking ? 'Tendencia' : 'Selección'}
            titulo={hayRanking ? 'Lo más buscado y cotizado de la semana' : 'Productos destacados'}
            productos={carrusel}
          />
        </div>

        <Html html={tecnologiasHtml} />

        <div className="cr-inicio-tienda">
          <CarruselMarcas />
          <Beneficios />
          <BandaMayorista />
        </div>

        <Proyectos />
        <Ubicacion />
        <Preguntas />
        <BandaCta />
    </div>
  )
}
