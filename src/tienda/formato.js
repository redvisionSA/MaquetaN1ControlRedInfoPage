const ARS_ENTERO = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const ARS_CENTAVOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Precio para mostrar. El calculo real lo hace siempre el servidor. */
export function formatoPrecio(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null
  return Number.isInteger(valor) ? ARS_ENTERO.format(valor) : ARS_CENTAVOS.format(valor)
}

/**
 * Precio que la tienda muestra, filtra y ordena: el sin IVA que calcula el ERP
 * (`netPrice` -> `precioSinIva`), con «+ IVA» al lado. Si el ERP no lo manda
 * (version vieja o cache), el final con IVA, con «IVA incluido». El navegador
 * nunca divide por 1,21 ni aplica alicuotas (varian: 10,5 % y 21 %).
 */
export function precioVisible(p) {
  if (!p || p.precio === null || p.precio === undefined) return null
  return p.precioSinIva ?? p.precio
}

/** Texto plano para buscar: sin mayusculas ni tildes. */
export function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function slugify(texto = '') {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
