import { useCallback, useEffect, useRef, useState } from 'react'
import { useTienda } from './TiendaContext.jsx'
import { SimboloIso } from './piezas.jsx'

/**
 * Confirmación de «lo sumaste al carrito» como un ticket impreso (Aspecto 6,
 * «tablero de instalador»): papel con el borde de abajo dentado, cabecera en
 * mono con la hora y el código del producto. Solo confirma: los errores van en
 * una Placa dentro de la página. Si el agregado abre el cajón del carrito, no
 * hace falta ticket. 4 s, se pausa con el mouse o el foco encima.
 */
const DURA = 4000

export default function Ticket() {
  const { ultimoAgregado, catalogo, resumen, carritoAbierto, setCarritoAbierto } = useTienda()
  const [ticket, setTicket] = useState(null)
  const reloj = useRef(null)

  const cerrar = useCallback(() => {
    window.clearTimeout(reloj.current)
    setTicket(null)
  }, [])
  const programar = useCallback(() => {
    window.clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => setTicket(null), DURA)
  }, [])

  useEffect(() => {
    if (!ultimoAgregado) return
    const producto = catalogo.datos.porId?.get(ultimoAgregado.id)
    if (!producto) return
    setTicket({
      clave: ultimoAgregado.marca,
      nombre: producto.nombre,
      sku: producto.sku,
      hora: new Date(ultimoAgregado.marca).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    })
    programar()
  }, [ultimoAgregado, catalogo.datos.porId, programar])

  useEffect(() => () => window.clearTimeout(reloj.current), [])
  // Con el cajón abierto el carrito ya está a la vista: el ticket sobra.
  useEffect(() => {
    if (carritoAbierto) cerrar()
  }, [carritoAbierto, cerrar])

  if (!ticket) return null
  const items = resumen.unidades
  return (
    <div className="cr-ticket-lugar" onMouseEnter={() => window.clearTimeout(reloj.current)} onMouseLeave={programar} onFocus={() => window.clearTimeout(reloj.current)} onBlur={programar}>
      <div className="cr-ticket-sombra">
        <div key={ticket.clave} className="cr-ticket" role="status">
          <p className="cr-ticket__cab">
            <span>
              Carrito · {items} {items === 1 ? 'ítem' : 'ítems'}
            </span>
            <span className="num">{ticket.hora}</span>
          </p>
          <div className="cr-ticket__lin">
            <SimboloIso forma="ok" className="h-[18px] w-[18px] shrink-0 text-cr-blue dark:text-cr-blue-glow" />
            <div className="min-w-0">
              <p className="cr-ticket__tit">Lo sumaste al carrito</p>
              <p className="cr-ticket__cod">
                {ticket.sku ? `${ticket.sku} · ` : ''}
                <span className="line-clamp-1 inline">{ticket.nombre}</span>
              </p>
            </div>
          </div>
          <div className="cr-ticket__acc">
            <button
              type="button"
              className="cr-link font-bold text-cr-blue underline underline-offset-4 dark:text-cr-blue-glow"
              onClick={() => {
                cerrar()
                setCarritoAbierto(true)
              }}
            >
              Ver carrito
            </button>
            <button type="button" className="cr-link text-sm font-semibold" onClick={cerrar}>
              Seguir mirando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
