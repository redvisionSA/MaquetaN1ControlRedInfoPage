// npm run probar — prueba de api/pedido.js, api/_popularidad.js y functions/api/evento.js con fetch y D1 simulados.
import assert from 'node:assert/strict'
const RAIZ = new URL('../', import.meta.url).href
const { redDeIp, idsValidos, registrar, TOPE_DIARIO } = await import(RAIZ + 'api/_popularidad.js')
const { default: pedido } = await import(RAIZ + 'api/pedido.js')
const { onRequestPost: evento } = await import(RAIZ + 'functions/api/evento.js')

// --- redDeIp: IPv6 recortada a /64, IPv4 entera
assert.equal(redDeIp('2800:810:4a5:1234:aaaa:bbbb:cccc:dddd'), '2800:810:4a5:1234::/64')
assert.equal(redDeIp('2800:810:4a5:1234::1'), '2800:810:4a5:1234::/64')
assert.equal(redDeIp('2800:810::1'), '2800:810:0:0::/64')
assert.equal(redDeIp('190.2.3.4'), '190.2.3.4')
assert.deepEqual(idsValidos(['a-1', 'a-1', '../x', 'b2']), ['a-1', 'b2'])

// --- D1 simulada
function d1() {
  const filas = []
  return {
    filas,
    prepare(sql) {
      return {
        bind(...v) {
          return {
            sql, v,
            async first() { return { n: filas.filter((f) => f.dia === v[0] && f.origen === v[1]).length } },
          }
        },
      }
    },
    async batch(sentencias) {
      for (const s of sentencias) {
        const [dia, producto, tipo, origen] = s.v
        if (!filas.some((f) => f.dia === dia && f.producto === producto && f.tipo === tipo && f.origen === origen)) filas.push({ dia, producto, tipo, origen })
      }
    },
  }
}

// --- fetch simulado: catalogo de CR y Resend
const correos = []
const pedidosUrl = []
globalThis.fetch = async (url, op = {}) => {
  pedidosUrl.push(String(url))
  if (String(url).includes('/storefront/controlred/catalog')) {
    return new Response(JSON.stringify({ products: [
      { id: 'p1', name: 'Cámara ColorVu', sku: 'DS-1', price: '100000.00' },
      { id: 'p2', name: 'NVR 8', sku: 'DS-2', price: '250000.50' },
    ] }), { status: 200 })
  }
  if (String(url).includes('api.resend.com')) { correos.push(JSON.parse(op.body)); return new Response('{}', { status: 200 }) }
  throw new Error('URL inesperada ' + url)
}
function res() {
  const r = { code: 200, body: null, headers: {} }
  return { r, setHeader(k, v) { r.headers[k] = v; return this }, status(c) { r.code = c; return this }, json(b) { r.body = b; return this } }
}
const cliente = { nombre: 'Ana', telefono: '1122334455', email: 'ana@ejemplo.com' }

// 1) Sin RESEND_API_KEY: error controlado con WhatsApp, sin correo
{
  const x = res()
  await pedido({ method: 'POST', headers: {}, env: {}, body: JSON.stringify({ cliente, items: [{ id: 'p1', cantidad: 1 }] }) }, x)
  assert.equal(x.r.code, 500)
  assert.match(x.r.body.error, /Envialo por WhatsApp/)
  assert.equal(correos.length, 0)
}

// 2) Pedido valido: precio del ERP (el que manda el navegador se ignora), numero CR-W-, popularidad en servidor
{
  const DB = d1()
  const x = res()
  await pedido({
    method: 'POST',
    headers: { 'cf-connecting-ip': '2800:810:4a5:1234::9' },
    env: { RESEND_API_KEY: 'test', DB },
    body: JSON.stringify({ cliente, items: [{ id: 'p1', cantidad: 2, precio: 1 }, { id: 'inventado', cantidad: 1 }] }),
  }, x)
  assert.equal(x.r.code, 200, JSON.stringify(x.r.body))
  assert.match(x.r.body.numero, /^CR-W-\d{6}-[0-9A-F]{5}$/)
  assert.equal(x.r.body.total, null) // hay una linea sin precio (no figura en el catalogo)
  const correo = correos.at(-1)
  assert.equal(correo.to[0], 'ventasgremio@controlred.com.ar')
  assert.match(correo.html, /\$\s?200\.000,00/)
  assert.match(correo.html, /No figura en el catálogo actual/)
  assert.ok(pedidosUrl.some((u) => u.includes('/storefront/controlred/catalog')))
  assert.ok(!pedidosUrl.some((u) => /\/storefront\/catalog|\/shop\/redvision/.test(u)), 'nunca lee datos de RV')
  assert.deepEqual(DB.filas.map((f) => [f.producto, f.tipo]), [['p1', 'pedido']])
}

// 3) evento: el navegador no puede declarar "pedido"; ids fuera del catalogo no cuentan
{
  const DB = d1()
  const req = (cuerpo, ip = '190.2.3.4') => new Request('https://x/api/evento', { method: 'POST', body: JSON.stringify(cuerpo), headers: { 'CF-Connecting-IP': ip } })
  assert.equal((await evento({ request: req({ tipo: 'pedido', ids: ['p1'] }), env: { DB } })).status, 400)
  assert.equal((await evento({ request: req({ tipo: 'carrito', ids: ['p1', 'falso'] }), env: { DB } })).status, 204)
  assert.deepEqual(DB.filas.map((f) => [f.producto, f.tipo]), [['p1', 'carrito']])
  // misma red /64 con otra direccion = mismo visitante (no duplica)
  await evento({ request: req({ tipo: 'carrito', ids: ['p1'] }, '2800:810:4a5:1234::1'), env: { DB } })
  await evento({ request: req({ tipo: 'carrito', ids: ['p1'] }, '2800:810:4a5:1234:ffff::2'), env: { DB } })
  assert.equal(DB.filas.filter((f) => f.origen !== DB.filas[0].origen).length, 1)
}

// 4) tope diario por visitante
{
  const DB = d1()
  const env = { DB }
  for (let i = 0; i < 6; i++) await registrar(env, { tipo: 'busqueda', ids: Array.from({ length: 10 }, (_, k) => `x${i}-${k}`), ip: '1.1.1.1' })
  assert.equal(DB.filas.length, TOPE_DIARIO)
}
console.log('OK: pedido, evento y popularidad')
