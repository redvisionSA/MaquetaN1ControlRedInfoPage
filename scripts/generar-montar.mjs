import fs from 'node:fs'
const L = fs.readFileSync('legado/index-v1.html', 'utf8').replace(/\r\n/g, '\n').split('\n')
const tramo = (a, b) => L.slice(a - 1, b).join('\n') // lineas 1-based inclusivas
const spot = tramo(2047, 2069)
const reveal = tramo(2073, 2135)
const fondo = tramo(2139, 2257)
const hero = tramo(2261, 2597)
const showroom = tramo(2604, 3103)
let cuerpo = [spot, reveal, fondo, hero, showroom].join('\n\n')

const R = (a, b, todas = false) => {
  if (!cuerpo.includes(a)) throw new Error('No encontrado: ' + a)
  cuerpo = todas ? cuerpo.split(a).join(b) : cuerpo.replace(a, b)
}
R('window.addEventListener(', 'on(window, ', true)
R('document.addEventListener(', 'on(document, ', true)
R("if(reduceMotion || !window.gsap) return;", 'if(reduceMotion) return;')
R("if(!container || !anchor || !window.THREE) return;", 'if(!container || !anchor) return;')
R('window.gsap', 'gsap', true)
/* fondo: el lienzo se crea aca (en la v1 vivia fijo en <body>) */
R("var canvas = document.getElementById('bgParticles');\n  if(!canvas) return;",
  "var canvas = document.createElement('canvas');\n  canvas.id = 'bgParticles'; canvas.setAttribute('aria-hidden', 'true');\n  document.body.prepend(canvas);\n  limpiezas.push(function(){ canvas.remove(); });")
/* hero: liberar GPU al salir del inicio */
R("  document.addEventListener('themechange', function(e){\n    applyEnv(e.detail.theme === 'dark');".replace('document.addEventListener(', 'on(document, '),
  "  limpiezas.push(function(){\n    stopLoop();\n    scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });\n    [matGray, matBlue, orbitMat, dotMat, pMat].forEach(function(m){ m.dispose(); });\n    if(envRT) envRT.dispose();\n    pmrem.dispose();\n    renderer.dispose();\n    if(renderer.forceContextLoss) renderer.forceContextLoss();\n    renderer.domElement.remove();\n  });\n\n  on(document, 'themechange', function(e){\n    applyEnv(e.detail.theme === 'dark');")
/* showroom: en la SPA la carga ya ocurrio; las fuentes pueden llegar despues de desmontar */
R("  on(window, 'load', function(){ layout(false); });\n", '')
R("document.fonts.ready.then(function(){ layout(false); });", 'document.fonts.ready.then(function(){ if(vivo) layout(false); });')
R("  layout(false);\n})();", "  layout(false);\n  limpiezas.push(function(){ demos.forEach(function(d){ if(d) d.stop(); }); pauseFeed(); });\n})();")

const cabecera = `/* eslint-disable */
/**
 * montar.js — la vitrina de la web v1 (hero 3D + showroom de tecnologias).
 * -----------------------------------------------------------------------
 * GENERADO desde legado/index-v1.html (scripts de spotlight, revelado GSAP,
 * fondo de particulas, emblema 3D del hero y showroom Hikvision) con
 * scripts/generar-montar.mjs. El codigo es el de la v1 con cuatro cambios
 * para vivir dentro de la SPA:
 *   - three (r128, la misma version que la v1) y gsap vienen de npm y solo
 *     los descarga el inicio (WebGL solo en "/");
 *   - cada listener de window/document, observer y requestAnimationFrame se
 *     registra para soltarse al salir del inicio (montarVitrina devuelve la
 *     funcion de limpieza);
 *   - el lienzo de particulas se crea aca y se quita al salir;
 *   - el tema lo maneja React (Tema.jsx) y avisa con el evento 'themechange'.
 * Para cambiar la vitrina, editar este archivo directamente (la v1 queda
 * como referencia historica).
 */
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function montarVitrina(raiz) {
  var vivo = true
  var limpiezas = []
  function on(destino, evento, fn, opciones) {
    destino.addEventListener(evento, fn, opciones)
    limpiezas.push(function () { destino.removeEventListener(evento, fn, opciones) })
  }
  /* Observers y cuadros de animacion que se apagan solos al desmontar */
  var IO = window.IntersectionObserver
  var RO = window.ResizeObserver
  function IntersectionObserver(fn, op) { var o = new IO(fn, op); limpiezas.push(function () { o.disconnect() }); return o }
  function ResizeObserver(fn) { var o = new RO(fn); limpiezas.push(function () { o.disconnect() }); return o }
  function requestAnimationFrame(fn) { return vivo ? window.requestAnimationFrame(function (t) { if (vivo) fn(t) }) : 0 }
  function cancelAnimationFrame(id) { window.cancelAnimationFrame(id) }

  var ctx = gsap.context(function () {
`
  const pie = `
  }, raiz)

  /* El catalogo del inicio llega despues: las posiciones de ScrollTrigger se
     recalculan cuando cambia el alto de la pagina. */
  var refresco = null
  var altura = new RO(function () {
    clearTimeout(refresco)
    refresco = setTimeout(function () { if (vivo) ScrollTrigger.refresh() }, 200)
  })
  altura.observe(raiz)

  return function desmontar() {
    vivo = false
    clearTimeout(refresco)
    altura.disconnect()
    ctx.revert()
    limpiezas.reverse().forEach(function (f) { try { f() } catch (e) {} })
    limpiezas = []
  }
}
`
fs.writeFileSync('src/vitrina/montar.js', cabecera + cuerpo + pie)
console.log('ok', (cabecera + cuerpo + pie).split('\n').length, 'lineas')
