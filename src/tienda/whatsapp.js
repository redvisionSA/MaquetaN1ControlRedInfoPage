import EMPRESA from '../datos/empresa.js'
import { formatoPrecio } from './formato.js'

const NUMERO = EMPRESA.telefono.tel.replace(/\D/g, '')

export function enlaceWhatsapp(texto) {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`
}

export function mensajeProducto(producto) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/producto/${producto.slug}` : ''
  return `Hola Control Red, quería consultar por: ${producto.nombre}${producto.sku ? ` (código ${producto.sku})` : ''}. ${url}`.trim()
}

/** Pedido como texto: sirve de respaldo si el envio por correo falla. */
export function mensajePedido({ numero, lineas, cliente, lista }) {
  const filas = lineas
    .filter((l) => l.producto)
    .map((l) => {
      /* Como en la tienda: sin IVA «+ IVA»; si el ERP no mando el sin IVA, el final con IVA */
      const precio =
        l.subtotal === null
          ? ' — precio a confirmar'
          : l.subtotalSinIva != null
            ? ` — ${formatoPrecio(l.subtotalSinIva)} + IVA`
            : ` — ${formatoPrecio(l.subtotal)} IVA incluido`
      return `• ${l.cantidad} x ${l.producto.nombre}${l.producto.sku ? ` [${l.producto.sku}]` : ''}${precio}`
    })
  /* Total con IVA (lo que se paga), solo si todas las lineas tienen precio */
  const conProducto = lineas.filter((l) => l.producto)
  const total =
    conProducto.length && conProducto.every((l) => l.subtotal !== null)
      ? conProducto.reduce((s, l) => s + Math.round(l.subtotal * 100), 0) / 100
      : null
  return [
    `Hola Control Red, quiero confirmar el pedido${numero ? ` ${numero}` : ''} hecho en ${EMPRESA.dominio}:`,
    ...filas,
    total !== null ? `Total con IVA: ${formatoPrecio(total)}` : null,
    lista ? `Precios de mi lista ${lista} (cuenta de la tienda).` : null,
    cliente?.nombre ? `Nombre: ${cliente.nombre}` : null,
    cliente?.entrega ? `Entrega: ${cliente.entrega}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/* Mensajes armados para cada consulta: reemplazan al formulario de contacto */
export const CONSULTAS = {
  asesor: 'Hola Control Red, quería hacer una consulta.',
  mayorista: 'Hola Control Red, soy instalador / empresa y quiero abrir una cuenta mayorista.',
  capacitacion: 'Hola Control Red, quiero que me avisen de la próxima capacitación técnica.',
}

export const enlaceConsulta = (tipo) => enlaceWhatsapp(CONSULTAS[tipo] || CONSULTAS.asesor)
