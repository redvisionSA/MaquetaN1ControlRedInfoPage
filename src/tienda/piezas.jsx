import { Link } from 'react-router-dom'
import { DISPONIBILIDAD } from './catalogo.js'
import { medidaLogo } from './marcas.js'
import { formatoPrecio, precioVisible } from './formato.js'
import { lineaPorId } from './lineas.jsx'
import { useTienda } from './TiendaContext.jsx'
import { IconoCorazon } from './Iconos.jsx'
import { useCuenta } from '../cuenta/CuentaContext.jsx'

/* ------------------------------------------------------------- Precio */
/* Regla de precios (17/11): todo precio a la vista es el SIN IVA que calcula
   el ERP, con la etiqueta «+ IVA» pegada al numero (se lee como parte del
   precio, como la unidad en un display de tablero). Lo que se cobra es el
   final con IVA: se ve completo en el resumen del carrito. Si el ERP no manda
   el sin IVA, va el final con «IVA incluido» (respaldo honesto, sin calcular). */
const TAM_PRECIO = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl sm:text-4xl',
}

/** Etiqueta «+ IVA»: mini placa mono, misma tinta que el precio. */
export function EtiquetaIva({ grande = false, className = '' }) {
  return (
    <span className={`cr-iva ${grande ? 'cr-iva--grande' : ''} ${className}`}>
      <span aria-hidden="true">+ IVA</span>
      <span className="sr-only">más IVA</span>
    </span>
  )
}

/**
 * Un importe con su condicion de IVA. `masIva`: el valor es sin IVA y lleva
 * «+ IVA»; si no, es el final y dice «IVA incluido». `apilar`: en telefono la
 * etiqueta va debajo del numero (listas angostas como el buscador).
 */
export function Importe({ valor, masIva, tamano = 'md', apilar = false, className = '' }) {
  const texto = formatoPrecio(valor)
  if (!texto) return null
  return (
    <span
      className={`inline-flex max-w-full gap-x-1.5 gap-y-0.5 ${apilar ? 'flex-col items-end sm:flex-row sm:flex-wrap sm:items-baseline' : 'flex-wrap items-baseline'} ${className}`}
    >
      <span className={`num whitespace-nowrap font-display font-bold tracking-tight text-black dark:text-white ${TAM_PRECIO[tamano]}`}>{texto}</span>
      {masIva ? (
        <EtiquetaIva grande={tamano === 'lg'} />
      ) : (
        <span className={`whitespace-nowrap text-black/55 dark:text-white/55 ${tamano === 'lg' ? 'text-xs' : 'text-[11px]'}`}>IVA incluido</span>
      )}
    </span>
  )
}

/**
 * Precio de un producto, el unico componente de precio de la tienda: tarjeta,
 * ficha, barra fija, buscador, sugeridos. `canal`: lista del cliente con
 * sesion («Mayorista», «Distribuidor»); se indica junto al precio para que
 * nunca se confunda con el publico. `consultar`: texto sin precio.
 */
export function Precio({ producto, tamano = 'md', apilar = false, className = '', consultar = 'Consultar precio' }) {
  const valor = precioVisible(producto)
  const canal = producto?.canal || null
  const lista = canal ? (
    <span className={`block font-display font-semibold uppercase tracking-wide text-black/60 dark:text-white/65 ${tamano === 'lg' ? 'mt-1 text-xs' : 'text-[10px]'}`}>Precio {canal}</span>
  ) : null
  if (valor === null) {
    return (
      <span className={`inline-block font-display font-semibold text-black/80 dark:text-white/85 ${tamano === 'lg' ? 'text-xl' : 'text-sm'} ${className}`}>
        {consultar}
        {lista}
      </span>
    )
  }
  return (
    <span className={`inline-block max-w-full ${className}`}>
      <Importe valor={valor} masIva={producto.precioSinIva != null} tamano={tamano} apilar={apilar} />
      {lista}
    </span>
  )
}

/**
 * Resumen del carrito (cajon y pagina): subtotal sin IVA, IVA y el total con
 * IVA, que es lo que se paga. Todo viene de TiendaContext (`resumen`), que
 * suma lo que manda el ERP. Sin desglose (algun item sin el sin IVA), solo el
 * total con IVA. `filas`: lineas extra antes del total (envio).
 */
export function ResumenIva({ resumen, compacto = false, filas = null, tituloTotal = 'Total con IVA' }) {
  const desglose = resumen.subtotalSinIva !== null && resumen.iva !== null
  return (
    <div>
      <dl className={`${compacto ? 'space-y-1' : 'space-y-2'} text-sm`}>
        {desglose && (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="cr-muted">Subtotal sin IVA{resumen.unidades ? ` (${resumen.unidades} ${resumen.unidades === 1 ? 'unidad' : 'unidades'})` : ''}</dt>
              <dd className="num font-semibold text-black dark:text-white">{formatoPrecio(resumen.subtotalSinIva)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="cr-muted">IVA</dt>
              <dd className="num font-semibold text-black dark:text-white">{formatoPrecio(resumen.iva)}</dd>
            </div>
          </>
        )}
        {filas}
      </dl>
      <div className={`cr-total ${compacto ? 'mt-2.5' : 'mt-4'}`}>
        <span className="cr-total__cab">{tituloTotal}</span>
        <span className={`num font-display font-bold text-black dark:text-white ${compacto ? 'text-2xl' : 'text-3xl'}`}>{formatoPrecio(resumen.total) || '$ 0'}</span>
      </div>
    </div>
  )
}

/* ----------------------------------------------------- Disponibilidad */
/* Señal de dos paneles (Aspecto 6, «tablero de instalador»): como una
   etiqueta ANSI Z535 / ISO 3864, un panel de símbolo con la forma normalizada
   y al lado el texto. Cuadrado = información (disponible), triángulo =
   cuidado (últimas unidades), cuadrado con reloj = a pedido, círculo tachado =
   no se puede (sin stock). El estado nunca depende solo del color, y el rojo
   queda para lo que apura o frena. Piezas propias de Control Red: la tienda de
   REDVISION habla otro idioma («OSD / visor»); al portar código, traducir. */
export function SimboloIso({ forma, className = 'h-3.5 w-3.5' }) {
  const p = { viewBox: '0 0 16 16', className, 'aria-hidden': 'true' }
  if (forma === 'ok')
    return (
      <svg {...p}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="currentColor" />
        <path d="m4.6 8.2 2.3 2.3 4.5-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (forma === 'alerta')
    return (
      <svg {...p}>
        <path d="M8 1.6 15 14H1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 6v3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="11.8" r="1" fill="currentColor" />
      </svg>
    )
  if (forma === 'neutro')
    return (
      <svg {...p}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  if (forma === 'apagado')
    return (
      <svg {...p}>
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M3.7 3.7l8.6 8.6" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  /* info: cuadrado con «i» (encabezado de placa) */
  return (
    <svg {...p}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7v4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="4.8" r="1" fill="currentColor" />
    </svg>
  )
}

/**
 * Texto de la cantidad que el ERP da a un cliente con sesion
 * (`{ unidades, mas }`, topeada en 10): «3 en stock», «Última en stock»,
 * «+10 en stock». Sin sesion no hay cantidad: null.
 */
export function textoStock(stock) {
  if (!stock || !(stock.unidades > 0)) return null
  if (stock.mas) return `+${stock.unidades} en stock`
  if (stock.unidades === 1) return 'Última en stock'
  return `${stock.unidades} en stock`
}

/**
 * Disponibilidad de un producto. `producto.stock` (solo con sesion) cambia el
 * tramo por la cantidad; sin el, el tramo publico. `grande` para la ficha.
 */
export function Disponibilidad({ producto, className = '', grande = false }) {
  const valor = producto?.disponibilidad
  const info = DISPONIBILIDAD[valor] || DISPONIBILIDAD.a_pedido
  const texto = textoStock(producto?.stock) || info.etiqueta
  return (
    <span className={`cr-senal cr-senal--${info.tono} ${grande ? 'cr-senal--grande' : ''} ${className}`}>
      <span className="cr-senal__sim">
        <SimboloIso forma={info.tono} className={grande ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      </span>
      {/* En tarjetas angostas (320 px, dos columnas) el texto pasa a dos lineas: cortarlo escondia el estado */}
      <span className="cr-senal__txt">{texto}</span>
    </span>
  )
}

/**
 * Sin sesion la tienda da tramos; la cantidad, solo a clientes que ingresaron.
 * Lo que esta sin stock no tiene cantidad que mostrar: no se invita.
 */
export function InvitacionStock({ producto, className = '' }) {
  const { cuenta } = useCuenta()
  if (cuenta || producto?.disponibilidad === 'sin_stock') return null
  return (
    <Link
      to="/cuenta"
      className={`flex min-h-[24px] w-max max-w-full items-center gap-1 text-[11px] font-semibold text-black/70 underline decoration-black/25 underline-offset-2
                  hover:text-cr-blue hover:decoration-cr-blue dark:text-white/75 dark:decoration-white/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3 w-3 shrink-0">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      Ingresá para ver el stock
    </Link>
  )
}

export function sePuedeComprar(producto) {
  return Boolean(producto) && producto.disponibilidad !== 'sin_stock'
}

/* ------------------------------------------------------ Imagen o icono */
/* Sin stock: la foto queda desenfocada y atenuada detras de una etiqueta roja,
   para que el estado mande en la jerarquia antes que el producto. En las
   miniaturas de 48 px (`tamano="xs"`: buscador, carrito) no entra el texto:
   queda solo la foto atenuada. */
/* Sin stock: placa roja al pie de la foto, con el círculo tachado (antes,
   píldora con resplandor rojo en el centro). */
const ETIQUETA_SIN_STOCK = {
  lg: 'inset-x-4 bottom-4 gap-2 py-2.5 text-base',
  md: 'inset-x-2.5 bottom-2.5 gap-1.5 py-1.5 text-xs sm:text-sm',
  sm: 'inset-x-1 bottom-1 gap-1 py-0.5 text-[10px] leading-tight',
}

function CapaSinStock({ tamano }) {
  if (!ETIQUETA_SIN_STOCK[tamano]) return null
  return (
    <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-black/25">
      <span className={`absolute flex items-center justify-center rounded-[2px] bg-cr-red font-display font-bold text-white ${ETIQUETA_SIN_STOCK[tamano]}`}>
        {tamano !== 'sm' && <SimboloIso forma="apagado" className="h-4 w-4 shrink-0" />}
        Sin stock
      </span>
    </div>
  )
}

export function ImagenProducto({ producto, className = '', tamano = 'md' }) {
  const linea = lineaPorId(producto?.linea)
  const Icono = linea?.Icono
  const sinStock = producto?.disponibilidad === 'sin_stock'
  const atenuar = sinStock ? 'scale-105 blur-[3px] opacity-60 grayscale' : ''
  if (producto?.imagen) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img
          src={producto.imagen}
          alt={sinStock ? `${producto.nombre} (sin stock)` : producto.nombre}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-contain p-[8%] transition-transform duration-500 ease-apple ${sinStock ? atenuar : 'group-hover:scale-105'}`}
        />
        {sinStock && <CapaSinStock tamano={tamano} />}
      </div>
    )
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'radial-gradient(120% 90% at 30% 10%, var(--surface-strong), var(--surface) 70%)',
      }}
      role="img"
      aria-label={`${producto?.nombre || 'Producto'} (imagen no disponible${sinStock ? ', sin stock' : ''})`}
    >
      {Icono && (
        <Icono
          className={`text-black/25 transition-transform dark:text-white/25 duration-500 ease-apple ${sinStock ? atenuar : 'group-hover:scale-110'} ${
            tamano === 'lg' ? 'h-28 w-28' : 'h-14 w-14'
          }`}
        />
      )}
      {sinStock && <CapaSinStock tamano={tamano} />}
    </div>
  )
}

/* ------------------------------------------------------------ Favorito */
export function BotonFavorito({ id, className = '' }) {
  const { favoritos, alternarFavorito } = useTienda()
  const activo = favoritos.includes(id)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        alternarFavorito(id)
      }}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      title={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[4px] border border-black/10 bg-white/90
                  transition-all duration-200 ease-apple active:scale-90
                  ${activo ? 'text-cr-blue' : 'text-black/60 hover:text-cr-blue'} ${className}`}
    >
      <IconoCorazon lleno={activo} className="h-[18px] w-[18px]" />
    </button>
  )
}

/* ------------------------------------------------- Franja de demostracion */
export function AvisoDemo() {
  const { catalogo } = useTienda()
  if (!catalogo.datos.demo) return null
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[60] max-w-[calc(100%-6rem)] rounded-[4px] bg-black px-3.5 py-1.5 font-display text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-white sm:text-[10px] sm:tracking-[0.16em] dark:bg-white dark:text-black">
      Datos de demostración · sin conexión al ERP
    </div>
  )
}

/* ---------------------------------------------------------- Formularios */
export function Campo({ id, label, error, ayuda, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-black/80 dark:text-white/85">
        {label}
      </label>
      {children}
      {ayuda && !error && <p className="cr-muted mt-1 text-xs">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-cr-red dark:text-cr-red-glow">
          {error}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ Placa */
/* Aviso como placa troquelada (Aspecto 6, «tablero de instalador»): borde de
   1,5 px, esquina superior derecha cortada a 45° y encabezado en mono con la
   palabra de señal (INFO, LISTO, ATENCIÓN, FRENO) y su símbolo ISO. Las
   acciones van después de una línea de troquel. FRENO = role="alert". */
const SIMBOLO_PLACA = { info: 'info', listo: 'ok', atencion: 'alerta', freno: 'apagado' }
const PALABRA_PLACA = { info: 'Info', listo: 'Listo', atencion: 'Atención', freno: 'Freno' }

export function Placa({ tono = 'info', cabecera, titulo, children, acciones, className = '', role }) {
  return (
    <div className={`cr-placa cr-placa--${tono} ${className}`} role={role || (tono === 'freno' ? 'alert' : 'status')}>
      <div className="cr-placa__in">
        <p className="cr-placa__cab">
          <SimboloIso forma={SIMBOLO_PLACA[tono]} className="h-3.5 w-3.5 shrink-0" />
          <span>
            {PALABRA_PLACA[tono]}
            {cabecera ? ` · ${cabecera}` : ''}
          </span>
        </p>
        <div className="cr-placa__cuerpo">
          {titulo && <p className="cr-placa__tit">{titulo}</p>}
          {children && <div>{children}</div>}
          {acciones && <div className="cr-placa__pie">{acciones}</div>}
        </div>
      </div>
    </div>
  )
}

/** Error de un envio: placa FRENO con role=alert para lectores de pantalla. */
export function AvisoError({ children, className = '' }) {
  if (!children) return null
  return (
    <Placa tono="freno" cabecera="no se pudo" className={className}>
      <p className="font-semibold">{children}</p>
    </Placa>
  )
}

/* ---------------------------------------------------------- Migas */
export function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <ol className="cr-muted flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="cr-link">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-black/80 dark:text-white/85">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------- Logo de marca
   Logo oficial si esta cargado en public/marcas/; si no, el nombre en texto
   neutro (nunca un dibujo propio ni un logo viejo de la marca).
   Medida optica (`medidaLogo`): todas las marcas pesan lo mismo a la vista,
   sea cual sea la proporcion de su archivo. El alt es siempre el nombre
   oficial de la marca (no la grafia que traiga el ERP). Sin pastilla, en el
   tema oscuro el logo va sobre una placa blanca (`.cr-logo-marca`): los
   logotipos negros o grises no se leerian sobre el fondo oscuro. */
function ImagenLogo({ id, alto, anchoMax }) {
  const m = medidaLogo(id, alto, anchoMax)
  return (
    <img
      src={id.logo}
      alt={id.nombre}
      width={m.ancho}
      height={m.alto}
      loading="lazy"
      decoding="async"
      className="block max-w-full object-contain"
      style={{ width: m.ancho, height: m.alto }}
    />
  )
}

function NombreMarca({ nombre, alto, className = '' }) {
  return (
    <span
      className={`truncate font-display font-bold uppercase tracking-[0.08em] ${className}`}
      style={{ fontSize: Math.max(10, Math.round(alto * 0.72)), lineHeight: 1 }}
    >
      {nombre}
    </span>
  )
}

export function LogoMarca({ marca, alto = 16, className = '', conChip = false, uniforme = false, anchoMax, caja = '' }) {
  if (!marca) return null
  const id = marca.identidad
  const nombre = id?.nombre || marca.nombre
  /* Pastilla de tamaño fijo (tarjetas de producto): todas las marcas ocupan lo
     mismo, sea cual sea la proporcion de su logo. */
  if (uniforme) {
    return (
      <span className={`cr-chip-marca inline-flex h-7 w-[96px] items-center justify-center overflow-hidden px-2 ${className}`}>
        {id?.logo ? <ImagenLogo id={id} alto={15} anchoMax={80} /> : <NombreMarca nombre={nombre} alto={14} className="text-black/75" />}
      </span>
    )
  }
  if (conChip) {
    return (
      <span className={`cr-chip-marca px-2.5 py-1.5 ${caja} ${className}`}>
        {id?.logo ? <ImagenLogo id={id} alto={alto} anchoMax={anchoMax} /> : <NombreMarca nombre={nombre} alto={alto} className="text-black/75" />}
      </span>
    )
  }
  if (id?.logo) {
    return (
      <span className={`cr-logo-marca inline-flex items-center ${className}`} style={{ '--logo-aire': `${Math.max(3, Math.round(alto * 0.22))}px` }}>
        <ImagenLogo id={id} alto={alto} anchoMax={anchoMax} />
      </span>
    )
  }
  return <NombreMarca nombre={nombre} alto={alto} className={`text-black/75 dark:text-white/80 ${className}`} />
}
