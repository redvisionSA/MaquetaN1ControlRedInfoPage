import { Link } from 'react-router-dom'
import Pagina, { usePagina } from './Pagina.jsx'
import { enlaceConsulta } from '../tienda/whatsapp.js'

export default function NoEncontrada() {
  usePagina({ titulo: 'Página no encontrada', indexar: false })
  return (
    <Pagina>
      <div className="cr-solido mx-auto max-w-xl p-8 text-center">
        <p className="cr-eyebrow mb-2 justify-center">Error 404</p>
        <h1 className="font-display text-2xl font-bold">No encontramos esta página</h1>
        <p className="cr-muted mt-2 text-sm">Puede que el enlace haya cambiado. Buscá el producto en la tienda o consultanos por WhatsApp.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/productos" className="cr-btn-primary">
            Ver productos
          </Link>
          <a href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer" className="cr-btn-glass">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </Pagina>
  )
}
