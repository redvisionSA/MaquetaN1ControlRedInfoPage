import { Link } from 'react-router-dom'
import { usePagina } from './Pagina.jsx'
import { ALCANCE_IARED, AvisoRespaldo, BotonIared, IconoLinea, MarcaIared } from '../componentes/Iared.jsx'

/**
 * /iared: la pagina que deriva los proyectos a IARED. Control Red no ofrece
 * proyectos ni puesta en marcha; aca solo se explica que resuelve IARED y se
 * deriva al interesado. Sin cifras, clientes ni plazos (no hay datos todavia).
 * /proyectos y /macroproyectos redirigen aca (App.jsx).
 */

/* Por que confiar: solo lo que es cierto por como se organizan las empresas */
const CONFIANZA = [
  {
    titulo: 'Se dedica a proyectos',
    texto: 'Es su trabajo, no un agregado a una venta: el relevamiento, la ingeniería y la puesta en marcha son lo que hace.',
  },
  {
    titulo: 'Un solo interlocutor',
    texto: 'La misma empresa te acompaña desde la primera visita hasta que el sistema queda funcionando.',
  },
  {
    titulo: 'Te la recomendamos nosotros',
    texto: 'Es la empresa a la que Control Red deriva los proyectos de quienes nos los piden.',
  },
]

const PASOS = [
  { n: '1', titulo: 'Contás qué necesitás', texto: 'Un lugar, qué querés cubrir y cualquier dato que ya tengas.' },
  { n: '2', titulo: 'IARED te contacta', texto: 'Para entender el caso y coordinar el relevamiento.' },
  { n: '3', titulo: 'Lo acuerdan entre ustedes', texto: 'Relevamiento, propuesta y condiciones los acordás directamente con IARED.' },
]

export default function Iared() {
  usePagina({
    titulo: 'Proyectos de seguridad electrónica con IARED',
    descripcion:
      'Los proyectos de seguridad electrónica (relevamiento, ingeniería, integración y puesta en marcha) los resuelve IARED, una empresa independiente. Control Red te deriva.',
  })

  return (
    <div className="cr-iared-pagina">
      <section className="cr-iared v1-seccion" aria-labelledby="titulo-pagina-iared">
        <div className="container">
          <nav aria-label="Ruta" className="cr-iared-miga">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Proyectos</span>
          </nav>
          <div className="cr-iared-cabeza">
            <MarcaIared className="cr-iared-marca--grande" />
            <span className="cr-iared-chip">Empresa independiente</span>
          </div>
          <h1 id="titulo-pagina-iared">Proyectos de seguridad electrónica, con IARED.</h1>
          <p className="cr-iared-lead">
            En Control Red vendemos equipamiento. Si lo que necesitás es un proyecto completo, desde el relevamiento hasta la puesta en marcha, te
            derivamos a <strong>IARED</strong>: una empresa aparte, independiente de Control Red, especializada en proyectos e integración.
          </p>
          <div className="cr-iared-acciones">
            <BotonIared />
            <Link to="/productos" className="btn btn-ghost cr-btn-sobre-azul">
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
          <p className="cr-eyebrow mb-1.5">Qué resuelve</p>
          <h2 id="titulo-alcance" className="font-display text-xl font-bold sm:text-2xl">
            Todo lo que va más allá de comprar el equipo
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALCANCE_IARED.map((a) => (
              <li key={a.titulo} className="cr-solido flex h-full flex-col gap-3 p-5">
                <span className="cr-sutil inline-flex h-11 w-11 items-center justify-center rounded-2xl text-cr-blue dark:text-cr-blue-glow">
                  <IconoLinea d={a.icono} />
                </span>
                <span className="font-display text-base font-bold leading-tight">{a.titulo}</span>
                <span className="cr-muted text-sm leading-relaxed">{a.texto}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-confianza" className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="cr-eyebrow mb-1.5">Por qué IARED</p>
            <h2 id="titulo-confianza" className="font-display text-xl font-bold sm:text-2xl">
              Un proyecto necesita a alguien que se ocupe solo de eso
            </h2>
            <p className="cr-muted mt-3 text-sm leading-relaxed">
              Separar la venta de equipos de los proyectos deja a cada empresa en lo suyo. IARED es una marca nueva: cuando tenga sus propios
              canales, este botón te va a llevar directo a ellos.
            </p>
          </div>
          <ul className="grid gap-3">
            {CONFIANZA.map((c) => (
              <li key={c.titulo} className="cr-solido flex items-start gap-3 p-4 sm:p-5">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cr-blue text-white" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </span>
                <span>
                  <span className="block font-display text-sm font-bold">{c.titulo}</span>
                  <span className="cr-muted mt-1 block text-sm leading-relaxed">{c.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-pasos">
          <p className="cr-eyebrow mb-1.5">Cómo sigue</p>
          <h2 id="titulo-pasos" className="font-display text-xl font-bold sm:text-2xl">
            Cómo es el contacto
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {PASOS.map((p) => (
              <li key={p.n} className="cr-solido p-5">
                <span className="num font-display text-2xl font-extrabold text-cr-blue dark:text-cr-blue-glow" aria-hidden="true">
                  {p.n}
                </span>
                <span className="mt-2 block font-display text-base font-bold">{p.titulo}</span>
                <span className="cr-muted mt-1 block text-sm leading-relaxed">{p.texto}</span>
              </li>
            ))}
          </ol>
          <div className="cr-solido mt-6 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="font-display text-base font-semibold">¿Listo para contar tu proyecto?</p>
            <BotonIared className="cr-iared-cta--azul" />
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
