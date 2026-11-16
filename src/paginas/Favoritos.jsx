import { Link } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import ProductoCard from '../tienda/ProductoCard.jsx'
import { Migas } from '../tienda/piezas.jsx'
import Pagina, { usePagina } from './Pagina.jsx'

export default function Favoritos() {
  usePagina({ titulo: 'Favoritos' })
  const { favoritos, catalogo } = useTienda()
  const productos = favoritos.map((id) => catalogo.datos.porId.get(id)).filter(Boolean)

  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Favoritos' }]} />
      <h1 className="text-onglass mb-2 px-1 font-display text-3xl font-bold sm:text-4xl">Tus favoritos</h1>
      <p className="cr-muted mb-6 px-1 text-sm">Quedan guardados en este dispositivo para retomarlos cuando quiera.</p>
      {productos.length === 0 ? (
        <div className="cr-solido mx-auto max-w-xl p-8 text-center">
          <p className="text-onglass font-display text-lg font-semibold">Todavía no guardó productos.</p>
          <p className="cr-muted mt-2 text-sm">Tocá el corazón de cualquier producto para guardarlo acá.</p>
          <Link to="/productos" className="cr-btn-primary mt-5">
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {productos.map((p) => (
            <li key={p.id}>
              <ProductoCard producto={p} />
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  )
}
