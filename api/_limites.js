/**
 * api/_limites.js — topes diarios del envio de pedidos (D1, binding `DB`).
 * -----------------------------------------------------------------------
 * /api/pedido no pide sesion: cualquiera puede mandar un pedido. Para que no
 * sirva para inundar la casilla de ventas ni para mandar correos a terceros:
 *   - pedidos por red (IPv4 o /64 de IPv6) y por dia;
 *   - copias al cliente por red y por correo destino y por dia.
 * Tabla `limites` en docs/popularidad.sql. Se guarda un hash recortado de la
 * red o del correo con la sal POPULARIDAD_SAL, nunca el dato en claro.
 *
 * Sin base no hay como contar: `consumir` devuelve null y quien llama decide
 * (el pedido a ventas sigue; la copia a un correo no verificado no sale).
 */

import { diaArgentina, hashCorto, redDeIp } from './_popularidad.js'

export const LIMITES = {
  pedidosPorRed: 20,
  copiasPorRed: 5,
  copiasPorCorreo: 3,
}

const sal = (env) => env?.POPULARIDAD_SAL || 'controlred-web'

export async function claveDeRed(env, tipo, ip) {
  return `${tipo}:red:${await hashCorto(`${redDeIp(ip)}|${sal(env)}`)}`
}

export async function claveDeCorreo(env, tipo, correo) {
  return `${tipo}:correo:${await hashCorto(`${String(correo || '').trim().toLowerCase()}|${sal(env)}`)}`
}

/**
 * Suma un intento al contador del dia. true si sigue dentro del tope, false
 * si lo paso, null si no hay base para contar.
 */
export async function consumir(env, clave, tope) {
  if (!env?.DB) return null
  const fila = await env.DB.prepare(
    'INSERT INTO limites (dia, clave, n) VALUES (?1, ?2, 1) ON CONFLICT (dia, clave) DO UPDATE SET n = n + 1 RETURNING n'
  )
    .bind(diaArgentina(), clave)
    .first()
  return Number(fila?.n || 0) <= tope
}
