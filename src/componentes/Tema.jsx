import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Tema claro / oscuro.
 *
 * Igual que la web v1: el primer renderizado SIEMPRE es claro (decision de
 * marca), el oscuro se elige con el boton y dura lo que dura la visita. El
 * estado vive en `data-theme` de <html>, que leen el CSS de la v1, Tailwind
 * (`dark:`) y los modulos de la vitrina; estos ultimos escuchan el evento
 * `themechange` para recolorear el hero 3D y el fondo de particulas.
 */
const TemaContext = createContext({ tema: 'light', oscuro: false, alternarTema: () => {} })

export function TemaProvider({ children }) {
  const [tema, setTema] = useState('light')

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'dark') raiz.setAttribute('data-theme', 'dark')
    else raiz.removeAttribute('data-theme')
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: tema } }))
  }, [tema])

  const alternarTema = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const valor = useMemo(() => ({ tema, oscuro: tema === 'dark', alternarTema }), [tema, alternarTema])
  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}

export function useTema() {
  return useContext(TemaContext)
}

/** Boton de la v1 (.theme-toggle): sol y luna que se cruzan. */
export function BotonTema({ className = '' }) {
  const { oscuro, alternarTema } = useTema()
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={alternarTema}
      aria-label={oscuro ? 'Cambiar a diseño claro' : 'Cambiar a diseño oscuro'}
      title="Cambiar tema"
    >
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  )
}
