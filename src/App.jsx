import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TemaProvider } from './componentes/Tema.jsx'
import Encabezado from './componentes/Encabezado.jsx'
import Pie from './componentes/Pie.jsx'
import { TiendaProvider } from './tienda/TiendaContext.jsx'
import { CuentaProvider } from './cuenta/CuentaContext.jsx'
import CarritoDrawer from './tienda/CarritoDrawer.jsx'
import BotonWhatsapp from './tienda/BotonWhatsapp.jsx'
import { AvisoDemo } from './tienda/piezas.jsx'
import { irAlAncla } from './componentes/anclas.js'

/* Cada pagina es un chunk propio. El inicio pide la vitrina (three + gsap)
   aparte: quien entra directo a un producto no descarga WebGL. */
const Inicio = lazy(() => import('./paginas/Inicio.jsx'))
const Catalogo = lazy(() => import('./paginas/Catalogo.jsx'))
const Producto = lazy(() => import('./paginas/Producto.jsx'))
const Carrito = lazy(() => import('./paginas/Carrito.jsx'))
const Favoritos = lazy(() => import('./paginas/Favoritos.jsx'))
const NoEncontrada = lazy(() => import('./paginas/NoEncontrada.jsx'))
const Iared = lazy(() => import('./paginas/Iared.jsx'))
const cuenta = (nombre) => lazy(() => import('./paginas/Cuenta.jsx').then((m) => ({ default: m[nombre] })))
const Ingresar = cuenta('Ingresar')
const Activar = cuenta('Activar')
const ActivarCodigo = cuenta('ActivarCodigo')
const Registrarse = cuenta('Registrarse')
const Olvide = cuenta('Olvide')
const Restablecer = cuenta('Restablecer')
const MiCuenta = cuenta('MiCuenta')

/* Al cambiar de pagina se vuelve arriba (salvo que la URL traiga un ancla);
   cambiar filtros (?q=, ?marca=) no mueve el scroll. */
function AlCambiarDePagina() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    const tienda = /^\/(productos|producto|carrito|favoritos|cuenta)(\/|$)/.test(pathname)
    if (tienda) document.documentElement.dataset.zona = 'tienda'
    else delete document.documentElement.dataset.zona
  }, [pathname])
  /* Con ancla: espera a que la seccion exista (el inicio es diferido) y la deja
     debajo de la barra. `key` cambia aunque el ancla sea la misma: tocar otra
     vez «Demos en vivo» despues de scrollear vuelve a llevar. */
  useEffect(() => (hash ? irAlAncla(hash) : undefined), [pathname, hash, key])
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <TemaProvider>
      <CuentaProvider>
        <TiendaProvider>
          <AlCambiarDePagina />
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-cr-blue focus:px-5 focus:py-2.5 focus:text-white"
          >
            Saltar al contenido principal
          </a>

          <Encabezado />

          <main id="contenido" className="relative min-h-[70vh]">
            <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/productos" element={<Catalogo />} />
                <Route path="/productos/:categoria" element={<Catalogo />} />
                <Route path="/producto/:slug" element={<Producto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/favoritos" element={<Favoritos />} />
                {/* Los proyectos los hace IARED (empresa aparte): las rutas viejas van ahi */}
                <Route path="/iared" element={<Iared />} />
                <Route path="/proyectos" element={<Navigate to="/iared" replace />} />
                <Route path="/macroproyectos" element={<Navigate to="/iared" replace />} />
                <Route path="/cuenta" element={<MiCuenta />} />
                <Route path="/cuenta/ingresar" element={<Ingresar />} />
                <Route path="/cuenta/activar" element={<Activar />} />
                <Route path="/cuenta/activar-codigo" element={<ActivarCodigo />} />
                <Route path="/cuenta/registrarse" element={<Registrarse />} />
                <Route path="/cuenta/olvide" element={<Olvide />} />
                <Route path="/cuenta/restablecer" element={<Restablecer />} />
                <Route path="*" element={<NoEncontrada />} />
              </Routes>
            </Suspense>
          </main>

          <Pie />

          <CarritoDrawer />
          <BotonWhatsapp />
          <AvisoDemo />
        </TiendaProvider>
      </CuentaProvider>
    </TemaProvider>
  )
}
