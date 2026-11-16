/**
 * empresa.js
 * -----------------------------------------------------------------------
 * Fuente unica de verdad de los datos de contacto de Control Red. Si cambia
 * un telefono o una direccion, se cambia aca y se propaga a la barra, al pie,
 * a la ubicacion, a los mensajes de WhatsApp y al carrito.
 *
 * Datos tomados de la web publicada (index.html v1, con el telefono nuevo del
 * commit 355b83b). El JSON-LD de index.html se mantiene a mano: si cambia algo
 * aca, revisarlo tambien alla.
 */

export const EMPRESA = {
  nombre: 'Control Red',
  lema: 'Innovación en Tecnología',
  dominio: 'controlred.com.ar',

  telefono: {
    display: '+54 9 11 2480-2161',
    corto: '11 2480-2161',
    tel: '+5491124802161',
    whatsapp: 'https://wa.me/5491124802161',
  },

  email: 'ventasgremio@controlred.com.ar',

  direccion: {
    calle: 'Av. Gaona 3565',
    barrio: 'Flores',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    codigoPostal: 'C1416DSK',
    pais: 'Argentina',
    completa: 'Comuna 11, Av. Gaona 3565, C1416DSK, Ciudad Autónoma de Buenos Aires',
    referencia: 'Barrio de Flores, cerca de la intersección con Av. Nazca.',
    embed: 'https://www.google.com/maps?q=Av.+Gaona+3565,+CABA,+Argentina&output=embed',
    comoLlegar: 'https://www.google.com/maps/dir/?api=1&destination=Av.+Gaona+3565,+C1416DSK,+Buenos+Aires,+Argentina',
  },

  redes: {
    mercadoLibre: 'https://www.mercadolibre.com.ar/pagina/control_red',
  },
}

export default EMPRESA
