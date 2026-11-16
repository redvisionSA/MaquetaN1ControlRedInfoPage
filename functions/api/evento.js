/**
 * POST /api/evento — cuenta un gesto de compra del navegador (Cloudflare Pages + D1).
 * -----------------------------------------------------------------------
 * Cuerpo: { tipo: 'busqueda' | 'carrito', ids: [id de producto] }.
 *
 * `pedido` NO se acepta desde el navegador: lo registra api/pedido.js en el
 * servidor, despues de enviar el pedido a ventas. Los ids se validan contra
 * el catalogo publico del ERP de Control Red y cada visitante (red /64) tiene
 * un tope diario. Detalle y privacidad: api/_popularidad.js.
 */

import { idsDelCatalogo, idsValidos, registrar } from '../../api/_popularidad.js'

const TIPOS_DEL_NAVEGADOR = new Set(['busqueda', 'carrito'])

export async function onRequestPost({ request, env }) {
  const sinContenido = new Response(null, { status: 204 })
  if (!env.DB) return sinContenido

  let cuerpo
  try {
    cuerpo = await request.json()
  } catch {
    return new Response(null, { status: 400 })
  }
  const tipo = String(cuerpo?.tipo || '')
  const pedidos = idsValidos(cuerpo?.ids, 10)
  if (!TIPOS_DEL_NAVEGADOR.has(tipo) || !pedidos.length) return new Response(null, { status: 400 })

  let catalogo
  try {
    catalogo = await idsDelCatalogo(env)
  } catch {
    /* Sin catalogo no se puede validar: no se cuenta nada (la compra sigue igual) */
    return sinContenido
  }
  const ids = pedidos.filter((id) => catalogo.has(id))
  if (!ids.length) return sinContenido

  await registrar(env, { tipo, ids, ip: request.headers.get('CF-Connecting-IP') })
  return sinContenido
}

export function onRequest() {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } })
}
