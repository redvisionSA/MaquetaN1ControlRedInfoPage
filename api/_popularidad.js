/**
 * api/_popularidad.js — conteo de gestos de compra para «lo más buscado y cotizado».
 * -----------------------------------------------------------------------
 * Lo usan functions/api/evento.js (gestos del navegador: busqueda y carrito)
 * y api/pedido.js (el gesto pedido, que solo cuenta el servidor despues de
 * enviar el correo a ventas). Base D1 con binding `DB` (docs/popularidad.sql).
 *
 * Endurecido respecto de la version de REDVISION (hallazgo del 14/11):
 *   - el navegador ya no puede declarar `pedido` (pesa 5): lo registra el
 *     servidor con los ids que el pedido valido contra el catalogo;
 *   - los ids se validan contra el catalogo publico del ERP: un id inventado
 *     no entra al ranking;
 *   - el visitante se identifica por el prefijo /64 de su IPv6 (o la IPv4
 *     completa): rotar direcciones dentro de una misma red no multiplica votos;
 *   - tope de gestos por visitante y por dia.
 *
 * Sin datos personales: se guarda dia, producto, gesto y un hash recortado de
 * (red + dia + sal), que no permite recuperar la IP.
 */

export const PESOS = { busqueda: 1, carrito: 3, pedido: 5 }
export const TOPE_DIARIO = 40 // gestos por visitante y por dia (todos los tipos)
const ID = /^[A-Za-z0-9-]{1,64}$/
const CATALOGO_PRODUCCION = 'https://api-erp.redvision.com.ar/storefront/controlred/catalog'

/** Dia de Argentina (UTC-3, sin horario de verano) en formato AAAA-MM-DD. */
export function diaArgentina(ahora = Date.now()) {
  return new Date(ahora - 3 * 3600_000).toISOString().slice(0, 10)
}

/** IPv4 completa; IPv6 recortada a su /64 (los primeros 4 grupos). */
export function redDeIp(ip) {
  const limpia = String(ip || '').trim().toLowerCase()
  if (!limpia) return 'sin-ip'
  if (!limpia.includes(':')) return limpia
  /* Expande "::" para poder tomar los primeros cuatro grupos */
  const [cabeza, cola = ''] = limpia.split('::')
  const a = cabeza ? cabeza.split(':') : []
  const b = limpia.includes('::') ? (cola ? cola.split(':') : []) : []
  const grupos = limpia.includes('::') ? [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill('0'), ...b] : a
  return `${grupos.slice(0, 4).map((g) => g || '0').join(':')}::/64`
}

async function hash(texto) {
  const datos = new TextEncoder().encode(texto)
  const digest = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function idsValidos(ids, max = 30) {
  return Array.isArray(ids) ? [...new Set(ids.map(String))].filter((x) => ID.test(x)).slice(0, max) : []
}

/* Ids del catalogo publico, cacheados por instancia unos minutos (el ERP
   cachea 5 min de su lado; aca solo se evita pedirlo en cada gesto). */
let cacheIds = null
export async function idsDelCatalogo(env) {
  if (cacheIds && cacheIds.hasta > Date.now()) return cacheIds.ids
  const url = env?.CATALOGO_URL || env?.VITE_CATALOGO_URL || CATALOGO_PRODUCCION
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`Catálogo HTTP ${r.status}`)
  const json = await r.json()
  const ids = new Set((json.products || []).map((p) => String(p.id)))
  cacheIds = { ids, hasta: Date.now() + 5 * 60_000 }
  return ids
}

/**
 * Registra un gesto sobre productos ya validados. Devuelve cuantos se
 * intentaron guardar (0 si no hay base o si el visitante llego al tope).
 */
export async function registrar(env, { tipo, ids, ip }) {
  if (!env?.DB || !PESOS[tipo] || !ids.length) return 0
  const dia = diaArgentina()
  const origen = await hash(`${redDeIp(ip)}|${dia}|${env.POPULARIDAD_SAL || 'controlred-web'}`)

  const fila = await env.DB.prepare('SELECT COUNT(*) AS n FROM eventos WHERE dia = ?1 AND origen = ?2').bind(dia, origen).first()
  const libres = TOPE_DIARIO - Number(fila?.n || 0)
  if (libres <= 0) return 0

  const lote = ids.slice(0, libres)
  const sentencia = env.DB.prepare('INSERT OR IGNORE INTO eventos (dia, producto, tipo, origen) VALUES (?1, ?2, ?3, ?4)')
  await env.DB.batch(lote.map((id) => sentencia.bind(dia, id, tipo, origen)))
  return lote.length
}
