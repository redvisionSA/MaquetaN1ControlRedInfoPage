import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Buscador from '../tienda/Buscador.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { useCuenta } from '../cuenta/CuentaContext.jsx'
import { cadenaDeCategoria, enlaceCategoria } from '../tienda/categorias.js'
import { EN_LA_BARRA } from '../datos/categorias.js'
import { IconoBuscar, IconoCarrito, IconoCorazon, IconoUsuario } from '../tienda/Iconos.jsx'
import { BotonTema } from './Tema.jsx'

/**
 * Encabezado de la tienda con la identidad de la web v1: barra de confianza
 * (Hikvision), barra de vidrio sticky con el logo de Control Red y el boton
 * de tema. Se le suman las herramientas de compra (buscador, cuenta,
 * favoritos, carrito) y, en escritorio, una fila de categorias del ERP
 * (las primeras a un clic; todas, con sus hijas, en el menu «Categorías»).
 *
 * Mide su alto y lo publica en --chrome-h: el hero de la v1 completa el
 * primer viewport con ese valor descontado.
 */

const SECCIONES = [
  { to: '/#demos', label: 'Demos en vivo' },
  { to: '/#proyectos', label: 'Proyectos' },
  { to: '/#ubicacion', label: 'Local de Flores' },
  { to: '/#preguntas-frecuentes', label: 'Preguntas frecuentes' },
]

function BotonCarrito() {
  const { resumen, setCarritoAbierto, ultimoAgregado } = useTienda()
  const [latido, setLatido] = useState(false)

  /* Pulso breve en cada agregado: confirma la accion donde el ojo la busca */
  useEffect(() => {
    if (!ultimoAgregado) return undefined
    setLatido(true)
    const id = window.setTimeout(() => setLatido(false), 650)
    return () => window.clearTimeout(id)
  }, [ultimoAgregado])

  return (
    <button
      type="button"
      onClick={() => setCarritoAbierto(true)}
      aria-label={`Abrir carrito (${resumen.unidades} ${resumen.unidades === 1 ? 'unidad' : 'unidades'})`}
      className={`cr-icono-nav cr-icono-nav--lleno ${latido ? 'scale-110' : ''}`}
    >
      <IconoCarrito className="h-5 w-5" />
      {resumen.unidades > 0 && (
        <span className="num absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-cr-red px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-[#0B0E1F]">
          {resumen.unidades > 99 ? '99+' : resumen.unidades}
        </span>
      )}
    </button>
  )
}

function BotonCuenta({ className = '' }) {
  const { cuenta } = useCuenta()
  const { pathname } = useLocation()
  return (
    <Link
      to={cuenta ? '/cuenta' : '/cuenta/ingresar'}
      aria-label={cuenta ? `Mi cuenta: ${cuenta.name}` : 'Ingresar a mi cuenta'}
      title={cuenta ? cuenta.name : 'Ingresar'}
      aria-current={pathname.startsWith('/cuenta') ? 'page' : undefined}
      className={`cr-icono-nav cr-icono-nav--texto ${className}`}
    >
      <IconoUsuario className="h-5 w-5 shrink-0" />
      {cuenta ? (
        <>
          <span className="hidden max-w-[130px] truncate xl:inline">{cuenta.name}</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cr-blue ring-2 ring-white dark:ring-[#0B0E1F] xl:hidden" aria-hidden="true" />
        </>
      ) : (
        <span className="hidden pr-1 xl:inline">Ingresar</span>
      )}
    </Link>
  )
}

function BotonFavoritos({ className = '' }) {
  const { favoritos } = useTienda()
  return (
    <Link to="/favoritos" aria-label={`Favoritos (${favoritos.length})`} title="Favoritos" className={`cr-icono-nav ${className}`}>
      <IconoCorazon className="h-5 w-5" lleno={favoritos.length > 0} />
    </Link>
  )
}

/* Menu «Categorías»: todas las raices del ERP con sus primeras hijas */
const HIJAS_EN_MENU = 5

function MenuCategorias({ raices, onElegir }) {
  return (
    <div id="cr-menu-categorias" className="cr-menu-categorias">
      <div className="container">
        <ul className="cr-menu-cat-cols">
          {raices.map((r) => (
            <li key={r.slug} className="cr-menu-cat-grupo">
              <Link to={enlaceCategoria(r.slug)} onClick={onElegir} className="cr-menu-cat-raiz">
                {r.nombre}
              </Link>
              {r.hijos.length > 0 && (
                <ul>
                  {r.hijos.slice(0, HIJAS_EN_MENU).map((h) => (
                    <li key={h.slug}>
                      <Link to={enlaceCategoria(h.slug)} onClick={onElegir} className="cr-menu-cat-hija">
                        {h.nombre}
                      </Link>
                    </li>
                  ))}
                  {r.hijos.length > HIJAS_EN_MENU && (
                    <li>
                      <Link to={enlaceCategoria(r.slug)} onClick={onElegir} className="cr-menu-cat-hija cr-menu-cat-mas">
                        Ver las {r.hijos.length} de {r.nombre}
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Encabezado() {
  const location = useLocation()
  const raiz = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [buscarAbierto, setBuscarAbierto] = useState(false)
  const [categoriasAbierto, setCategoriasAbierto] = useState(false)
  const filaCategorias = useRef(null)
  const { catalogo } = useTienda()
  const arbol = catalogo.datos.categorias
  const raices = arbol.raices

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuAbierto(false)
    setBuscarAbierto(false)
    setCategoriasAbierto(false)
  }, [location.pathname, location.search, location.hash, location.key])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false)
        setBuscarAbierto(false)
        setCategoriasAbierto(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Alto real de la barra de confianza + la barra (sin la hoja movil): el
     hero lo descuenta del primer viewport, como en la v1. */
  useLayoutEffect(() => {
    const nodo = raiz.current
    if (!nodo) return undefined
    const medir = () => {
      const confianza = nodo.querySelector('.trust-bar')
      const barra = nodo.querySelector('.cr-barra')
      const alto = (confianza?.offsetHeight || 0) + (barra?.offsetHeight || 0) + 2
      document.documentElement.style.setProperty('--chrome-h', `${alto}px`)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(nodo)
    return () => ro.disconnect()
  }, [])

  /* Fuera del menu «Categorías», un toque lo cierra */
  useEffect(() => {
    if (!categoriasAbierto) return undefined
    const fuera = (e) => {
      if (!filaCategorias.current?.contains(e.target)) setCategoriasAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [categoriasAbierto])

  const enCatalogo = location.pathname.startsWith('/producto')
  /* Raiz de la categoria que se esta mirando (`/productos/<slug>`), para marcarla en la fila */
  const slugActual = location.pathname.match(/^\/productos\/([a-z0-9-]+)/)?.[1] || ''
  const raizActual = slugActual ? cadenaDeCategoria(arbol, slugActual)[0]?.slug : null

  return (
    <div ref={raiz} className="contents">
      <div className="trust-bar">
        <div className="container">
          <span>Distribuidor oficial de tecnología</span>
          <div className="trust-divider" />
          <img className="tsw-light" src="/img/hikvision-claro.webp" alt="Hikvision" width="110" height="14" />
          <img className="tsw-dark" src="/img/hikvision-oscuro.webp" alt="Hikvision" width="110" height="14" />
          <div className="trust-divider" />
          <span>Hik Tech Ambassador oficial</span>
        </div>
      </div>

      <header className={`nav ${scrolled ? 'scrolled' : ''} ${menuAbierto ? 'menu-open' : ''}`} id="siteNav">
        <div className="cr-barra">
          <div className="container nav-inner cr-nav-inner">
            <Link to="/" className="brand shrink-0" aria-label="Control Red - Inicio">
              <img className="tsw-light" src="/img/controlred-claro.webp" alt="ControlRed — seguridad electrónica y tecnología" width="220" height="34" fetchpriority="high" />
              <img className="tsw-dark" src="/img/controlred-oscuro.webp" alt="ControlRed — seguridad electrónica y tecnología" width="220" height="34" />
            </Link>

            <Buscador atajo className="mx-2 hidden min-w-0 flex-1 lg:block" />

            <div className="nav-actions cr-acciones">
              <button
                type="button"
                onClick={() => setBuscarAbierto((v) => !v)}
                aria-expanded={buscarAbierto}
                aria-label="Buscar productos"
                className="cr-icono-nav lg:hidden"
              >
                <IconoBuscar className="h-5 w-5" />
              </button>
              <BotonCuenta className="hidden xs:inline-flex" />
              <BotonFavoritos className="hidden sm:inline-flex" />
              <span className="hidden sm:contents">
                <BotonTema />
              </span>
              <BotonCarrito />
              <button
                type="button"
                className="nav-toggle-mobile"
                onClick={() => setMenuAbierto((v) => !v)}
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuAbierto}
                aria-controls="navLinksMobile"
              >
                <svg className="icon-burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Categorias (escritorio): el catalogo a un clic */}
          <nav className="cr-deptos" aria-label="Categorías" ref={filaCategorias}>
            <div className="container cr-deptos-fila">
              <NavLink to="/productos" end className={({ isActive }) => `cr-depto cr-depto--todos ${isActive || enCatalogo ? 'is-active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                </svg>
                Todos los productos
              </NavLink>
              {raices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoriasAbierto((v) => !v)}
                  aria-expanded={categoriasAbierto}
                  aria-controls="cr-menu-categorias"
                  className={`cr-depto ${categoriasAbierto ? 'is-active' : ''}`}
                >
                  Categorías
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`h-3.5 w-3.5 transition-transform ${categoriasAbierto ? 'rotate-180' : ''}`} aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              )}
              {/* En el DOM justo despues del boton: el Tab entra al menu abierto */}
              {categoriasAbierto && <MenuCategorias raices={raices} onElegir={() => setCategoriasAbierto(false)} />}
              {raices.slice(0, EN_LA_BARRA).map((c) => (
                <Link
                  key={c.slug}
                  to={enlaceCategoria(c.slug)}
                  aria-current={raizActual === c.slug ? 'page' : undefined}
                  className={`cr-depto ${raizActual === c.slug ? 'is-active' : ''}`}
                >
                  {c.nombre}
                </Link>
              ))}
              <span className="cr-deptos-sep" aria-hidden="true" />
              {SECCIONES.slice(0, 2).map((s) => (
                <Link key={s.to} to={s.to} className="cr-depto cr-depto--suave">
                  {s.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Buscador en telefono y tablet: se despliega desde la lupa */}
        {buscarAbierto && (
          <div className="container pb-3 lg:hidden">
            <Buscador autoFocus onBuscar={() => setBuscarAbierto(false)} />
          </div>
        )}

        {/* Hoja movil (estilo .nav-links-mobile de la v1) */}
        <nav className="nav-links-mobile container" id="navLinksMobile" aria-label="Menú">
          <Link to="/productos" className="btn btn-primary">
            Ver todos los productos
          </Link>
          {raices.slice(0, EN_LA_BARRA).map((c) => (
            <Link key={c.slug} to={enlaceCategoria(c.slug)} className="cr-hoja-linea">
              {c.nombre}
            </Link>
          ))}
          {raices.length > EN_LA_BARRA && (
            <details className="cr-hoja-mas">
              <summary>Más categorías</summary>
              {raices.slice(EN_LA_BARRA).map((c) => (
                <Link key={c.slug} to={enlaceCategoria(c.slug)} className="cr-hoja-linea">
                  {c.nombre}
                </Link>
              ))}
            </details>
          )}
          <Link to="/favoritos">Mis favoritos</Link>
          <Link to="/cuenta">Mi cuenta</Link>
          {SECCIONES.map((s) => (
            <Link key={s.to} to={s.to}>
              {s.label}
            </Link>
          ))}
          <div className="cr-hoja-tema">
            <span>Tema claro / oscuro</span>
            <BotonTema />
          </div>
        </nav>
      </header>
    </div>
  )
}
