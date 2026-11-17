import { Link } from 'react-router-dom'
import { usePagina } from './Pagina.jsx'
import { ALCANCE_IARED, AvisoRespaldo, BotonIared, IconoLinea, MarcaIared, useFuenteIared } from '../componentes/Iared.jsx'
import IARED from '../datos/iared.js'

/**
 * /iared: la pagina que deriva los proyectos a IARED. Control Red no ofrece
 * proyectos ni puesta en marcha; aca solo se explica que resuelve IARED y se
 * deriva al interesado. Sin cifras, clientes ni plazos (no hay datos todavia).
 * /proyectos y /macroproyectos redirigen aca (App.jsx).
 *
 * Toda la pagina es `.iared-zona`: colores, tipografia y logo del manual de
 * IARED, sin el azul de Control Red. La barra y el pie siguen siendo de la tienda.
 */

/* Por que confiar: solo lo que es cierto por como se organizan las marcas */
const CONFIANZA = [
  {
    titulo: 'Se dedica a proyectos',
    texto: 'Es su trabajo, no un agregado a una venta: el relevamiento, la ingeniería y la puesta en marcha son lo que hace.',
  },
  {
    titulo: 'Un solo interlocutor',
    texto: 'IARED te acompaña desde la primera visita hasta que el sistema queda funcionando.',
  },
  {
    titulo: 'Te la recomendamos nosotros',
    texto: 'Es a quien Control Red deriva los proyectos que nos piden.',
  },
]

const PASOS = [
  { n: '1', titulo: 'Contás qué necesitás', texto: 'Un lugar, qué querés cubrir y cualquier dato que ya tengas.' },
  { n: '2', titulo: 'IARED te contacta', texto: 'Para entender el caso y coordinar el relevamiento.' },
  { n: '3', titulo: 'Lo acuerdan entre ustedes', texto: 'Relevamiento, propuesta y condiciones los acordás directamente con IARED.' },
]

export default function Iared() {
  useFuenteIared()
  usePagina({
    titulo: 'Proyectos de seguridad electrónica con IARED',
    descripcion: `IARED, ${IARED.eslogan}: relevamiento, ingeniería, integración y puesta en marcha de proyectos de seguridad electrónica. Control Red te deriva.`,
  })

  return (
    <div className="iared-zona cr-iared-pagina">
      <section className="cr-iared" aria-labelledby="titulo-pagina-iared">
        <div className="container">
          <nav aria-label="Ruta" className="cr-iared-miga">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Proyectos</span>
          </nav>
          <MarcaIared grande />
          <h1 id="titulo-pagina-iared">Proyectos de seguridad electrónica, con IARED.</h1>
          <p className="cr-iared-lead">
            En Control Red vendemos equipamiento. Si lo que necesitás es un proyecto completo, desde el relevamiento hasta la puesta en marcha, te
            derivamos a <strong>IARED</strong>, que se dedica a proyectos e integración con inteligencia aplicada a la red.
          </p>
          <div className="cr-iared-acciones">
            <BotonIared />
            <Link to="/productos" className="iared-cta-sec">
              Solo necesito equipos
            </Link>
          </div>
          <AvisoRespaldo />
        </div>
      </section>

      {/* .container de la v1 fija su propio padding: el espacio vertical va adentro */}
      <div className="container">
        <div className="cr-iared-cuerpo">
          <section aria-labelledby="titulo-alcance">
            <p className="iared-etiqueta">Qué resuelve</p>
            <h2 id="titulo-alcance" className="iared-h2">
              Todo lo que va más allá de comprar el equipo
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ALCANCE_IARED.map((a) => (
                <li key={a.titulo} className="iared-tarjeta flex h-full flex-col gap-3 p-5">
                  <span className="iared-icono">
                    <IconoLinea d={a.icono} />
                  </span>
                  <span className="iared-h3">{a.titulo}</span>
                  <span className="iared-suave text-sm leading-relaxed">{a.texto}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="titulo-confianza" className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="iared-etiqueta">Por qué IARED</p>
              <h2 id="titulo-confianza" className="iared-h2">
                Un proyecto necesita a alguien que se ocupe solo de eso
              </h2>
              <p className="iared-suave mt-3 text-sm leading-relaxed">
                Separar la venta de equipos de los proyectos deja a cada uno en lo suyo. IARED es una marca nueva: cuando tenga sus propios canales,
                este botón te va a llevar directo a ellos.
              </p>
            </div>
            <ul className="grid gap-3">
              {CONFIANZA.map((c) => (
                <li key={c.titulo} className="iared-tarjeta flex items-start gap-3 p-4 sm:p-5">
                  <span className="iared-tilde" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </span>
                  <span>
                    <span className="iared-h3 block">{c.titulo}</span>
                    <span className="iared-suave mt-1 block text-sm leading-relaxed">{c.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="titulo-pasos">
            <p className="iared-etiqueta">Cómo sigue</p>
            <h2 id="titulo-pasos" className="iared-h2">
              Cómo es el contacto
            </h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {PASOS.map((p) => (
                <li key={p.n} className="iared-tarjeta p-5">
                  <span className="iared-numero" aria-hidden="true">
                    {p.n}
                  </span>
                  <span className="iared-h3 mt-2 block">{p.titulo}</span>
                  <span className="iared-suave mt-1 block text-sm leading-relaxed">{p.texto}</span>
                </li>
              ))}
            </ol>
            <div className="iared-tarjeta mt-6 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="iared-h3">¿Listo para contar tu proyecto?</p>
              <BotonIared />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
