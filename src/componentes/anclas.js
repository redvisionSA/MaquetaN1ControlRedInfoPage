/**
 * Ir a un ancla del inicio (#demos, #proyectos, #ubicacion...) desde cualquier
 * ruta, con la seccion bien ubicada debajo de la barra fija.
 *
 * Por que no alcanza con el comportamiento del navegador ni con un
 * scrollIntoView suelto:
 *  - React Router no hace scroll a los hashes, y el inicio es un chunk
 *    diferido: al venir de /productos (o al abrir el link directo) la seccion
 *    todavia no existe cuando cambia la URL. Se espera a que aparezca.
 *  - Arriba de la seccion el carrusel, las imagenes y la vitrina cambian de
 *    alto despues de llegar, y ScrollTrigger.refresh() (vitrina) hace
 *    scrollTo(0) y vuelve, lo que corta un desplazamiento suave a mitad de
 *    camino. Mientras la pagina se acomoda se vuelve a alinear cuando la
 *    seccion quedo corrida y el scroll esta quieto; se deja de corregir apenas
 *    la persona toca, hace scroll o teclea.
 *  - El margen de la barra lo da `scroll-margin-top: var(--chrome-h)` (index.css).
 *  - Con prefers-reduced-motion no hay desplazamiento suave; tampoco cuando se
 *    llega desde otra pagina (se "aterriza" en la seccion).
 */

/* Anclas viejas que siguen funcionando (links compartidos, buscadores) */
export const ALIAS_ANCLAS = { tecnologias: 'demos' }

const ESPERA_MAX_MS = 10000 // hasta que aparezca la seccion (chunk diferido)
const QUIETO_MS = 1200 // alineada y sin cambios de alto: la pagina ya se acomodo
const CORRECCION_MAX_MS = 8000
const PASO_MS = 150
const TOLERANCIA_PX = 4
const GESTOS = ['wheel', 'touchstart', 'keydown', 'pointerdown']

export function idDelAncla(hash) {
  let id
  try {
    id = decodeURIComponent(String(hash || '').replace(/^#/, ''))
  } catch {
    return null
  }
  if (!id) return null
  return ALIAS_ANCLAS[id] || id
}

/** Devuelve la funcion de limpieza (para el cleanup del efecto). */
export function irAlAncla(hash) {
  const id = idDelAncla(hash)
  if (!id) return () => {}

  const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  /* Suave solo si la seccion ya estaba en pantalla (misma pagina) */
  const suave = !reducir && Boolean(document.getElementById(id))
  const comportamiento = suave ? 'smooth' : 'instant'

  const inicio = performance.now()
  let cancelado = false
  let raf = 0
  let paso = 0
  let ro = null

  const terminar = () => {
    cancelado = true
    window.cancelAnimationFrame(raf)
    window.clearInterval(paso)
    ro?.disconnect()
    GESTOS.forEach((g) => window.removeEventListener(g, terminar, true))
  }
  GESTOS.forEach((g) => window.addEventListener(g, terminar, { capture: true, passive: true }))

  const desvio = (el) => el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)
  const ir = (el) => el.scrollIntoView({ behavior: comportamiento, block: 'start' })

  const alAparecer = (el) => {
    ir(el)
    const desde = performance.now()
    let ultimoCambio = desde
    let yPrevia = window.scrollY
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => {
        ultimoCambio = performance.now()
      })
      ro.observe(document.getElementById('contenido') || document.body)
    }
    paso = window.setInterval(() => {
      if (cancelado) return
      const ahora = performance.now()
      const quieto = Math.abs(window.scrollY - yPrevia) < 1
      yPrevia = window.scrollY
      const corrida = Math.abs(desvio(el)) > TOLERANCIA_PX
      /* Corrida y sin moverse: algo corto el desplazamiento o cambio el alto
         de arriba. En movimiento no se toca (un smooth sigue su curso). */
      if (corrida && quieto) {
        ir(el)
        ultimoCambio = ahora
      }
      if ((!corrida && ahora - ultimoCambio > QUIETO_MS) || ahora - desde > CORRECCION_MAX_MS) terminar()
    }, PASO_MS)
  }

  const buscar = () => {
    if (cancelado) return
    const el = document.getElementById(id)
    if (el) alAparecer(el)
    else if (performance.now() - inicio < ESPERA_MAX_MS) raf = window.requestAnimationFrame(buscar)
    else terminar()
  }
  buscar()

  return terminar
}
