import { Link } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { enlaceCategoria } from '../tienda/categorias.js'
import { EN_LA_BARRA } from '../datos/categorias.js'
import EMPRESA from '../datos/empresa.js'
import { enlaceConsulta } from '../tienda/whatsapp.js'

/** Pie de la web v1 (footer azul noche), con las primeras categorias de la tienda. */
export default function Pie() {
  const { catalogo } = useTienda()
  const raices = catalogo.datos.categorias.raices.slice(0, EN_LA_BARRA)
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/img/controlred-oscuro.webp" alt="ControlRed" width="194" height="30" loading="lazy" style={{ height: 30, width: 'auto' }} />
            <p>
              Empresa argentina especializada en la comercialización, distribución y provisión de insumos de seguridad electrónica y
              tecnología. Hik Tech Ambassador oficial de Hikvision.
            </p>
          </div>
          <div className="footer-col">
            <p className="footer-h">Tienda</p>
            <ul>
              <li>
                <Link to="/productos">Todos los productos</Link>
              </li>
              {raices.map((c) => (
                <li key={c.slug}>
                  <Link to={enlaceCategoria(c.slug)}>{c.nombre}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-h">Control Red</p>
            <ul>
              <li>
                <Link to="/#tecnologias">Tecnologías 3D</Link>
              </li>
              <li>
                <Link to="/#proyectos">Macroproyectos</Link>
              </li>
              <li>
                <Link to="/#ubicacion">Ubicación</Link>
              </li>
              <li>
                <Link to="/#preguntas-frecuentes">Preguntas frecuentes</Link>
              </li>
              <li>
                <Link to="/cuenta/ingresar">Ingresar a mi cuenta</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="footer-h">Contacto</p>
            <ul>
              <li>
                <a href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer">
                  WhatsApp: {EMPRESA.telefono.corto}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>
              </li>
              <li>
                <a href={EMPRESA.redes.mercadoLibre} target="_blank" rel="noopener noreferrer">
                  Tienda en Mercado Libre
                </a>
              </li>
              <li>Comuna 11, {EMPRESA.direccion.calle}</li>
              <li>{EMPRESA.direccion.codigoPostal}, CABA — Argentina</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Control Red — {EMPRESA.lema}.
          </span>
          <span>Distribuidor oficial · Hik Tech Ambassador</span>
        </div>
      </div>
    </footer>
  )
}
