/* Landing v2: shell compartido, grids desde el catálogo, hero con visor 3D en vivo. */
import { mountShell, productCard, ICON } from './core.js';
import { SCENES, HOTSPOTS, PRODUCTS, hotspotById } from './catalog.js';

mountShell('index.html#soluciones');
const $ = (s) => document.querySelector(s);

/* ---------- Escenarios ---------- */
const SCENE_ICON = {
  office: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="1.5"/><path d="M8 7V4h8v3M3 12h18M9 21v-4h6v4"/></svg>',
  country: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>',
  warehouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9 12 4l9 5v11H3z"/><path d="M7 20v-7h10v7M7 16h10"/></svg>',
  agro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 20c0-6 3-9 7-9s7 3 7 9"/><path d="M12 11V4M9 6l3-2 3 2"/></svg>',
};
$('#scenes').innerHTML = SCENES.map(s => {
  const techs = HOTSPOTS.filter(h => h.scene === s.id).slice(0, 4).map(h => `<span>${h.title}</span>`).join('');
  return `<a class="scene-card glass glow reveal" href="showroom.html#${s.id}" style="--c:${s.color}">
    <span class="ico">${SCENE_ICON[s.id]}</span><h3>${s.name}</h3><p>${s.objective}</p>
    <div class="techs">${techs}</div><span class="go">Entrar al escenario ${ICON.arrow}</span></a>`;
}).join('');

/* ---------- Tecnologías ---------- */
const TECHS = [
  ['ColorVu 3.0 · F1.0', 'Color real en oscuridad total, sin reflectores.', 'warehouse', '#F04E23'],
  ['AcuSense', 'Distingue humano y vehículo; cero falsas alarmas.', 'warehouse', '#0070BA'],
  ['Smart Hybrid Light', 'IR discreto que pasa a luz blanca ante un humano.', 'office', '#F04E23'],
  ['AcuSeek', 'Buscá video escribiendo "persona con campera roja".', 'office', '#344AB2'],
  ['MinMoe + TalkVu', 'Acceso facial en 0,2 s e intercom IP.', 'office', '#344AB2'],
  ['TandemVu', 'Panorámica y PTZ con tracking en una unidad.', 'country', '#FFB703'],
  ['Radar + PTZ', '120 m de detección que giran la cámara al objetivo.', 'country', '#FFB703'],
  ['HeatPro térmica', 'Perímetro e incendio temprano por temperatura.', 'country', '#FF6A00'],
  ['ANPR DeepinView', 'Patente, marca y color en <100 ms.', 'country', '#344AB2'],
  ['AX PRO', 'Alarma inalámbrica con PIR-Cam y strobe.', 'office', '#E2231A'],
  ['MDVR + DSM', 'Video móvil, fatiga del conductor y ADAS.', 'warehouse', '#6B6464'],
  ['Radar de velocidad', 'Infracciones en playa con captura de patente.', 'warehouse', '#6B6464'],
  ['Solar 4G/5G', 'Cámaras autónomas sin red ni energía fija.', 'agro', '#1F9D55'],
  ['DarkFighterX', 'PTZ 42x a color de noche para accesos lejanos.', 'agro', '#8B5CF6'],
  ['Térmica forestal', 'Detecta focos de fuego a hasta 3 km.', 'agro', '#FF6A00'],
];
$('#techs').innerHTML = TECHS.map(([n, d, sc, c]) => `<article class="tech-card glass glow reveal" style="--c:${c}"><div class="k"><h4>${n}</h4><span></span></div><p>${d}</p><a href="showroom.html#${sc}">Probar en ${SCENES.find(s => s.id === sc).name.toLowerCase()} →</a></article>`).join('');

/* ---------- Tienda destacada ---------- */
const FEATURED = ['DS-2CD2387G2H-LISU/SL', 'DS-K1T343MX', 'DS-2SE4C425MWG-E/26(F0)', 'DS-2XS2T47G1-LDH/4G/C18S40', 'DS-PWA96-M-WE', 'DS-7616NXI-K2/16P', 'DS-2TD1228-2/QA', 'iDS-2CD7A46G0/P-IZHSY'];
$('#featured').innerHTML = FEATURED.map(s => productCard(PRODUCTS[s])).join('');
document.querySelectorAll('#featured .pcard').forEach(c => c.classList.add('reveal'));

/* ---------- Reveal on scroll ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && window.gsap) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); gsap.to(e.target, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: (e.target.dataset.i || 0) * 0.06 }); });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.dataset.i = i % 5; io.observe(el); });
  // Red de seguridad: nada queda oculto si el observer no dispara
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => { if (getComputedStyle(el).opacity === '0') gsap.set(el, { opacity: 1, y: 0 }); }), 8000);
} else document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });

/* ---------- Hero: visor 3D en vivo (lazy, solo desktop) ---------- */
const heroVisual = $('#heroVisual');
const canWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (canWebGL && matchMedia('(min-width: 720px)').matches && !reduce) {
  import('./showroom/viewer.js').then(async ({ ShowroomViewer }) => {
    const office = (await import('./showroom/scenes/office.js')).default;
    const v = new ShowroomViewer({ container: heroVisual, layer: $('#heroLayer'), feedFrame: null });
    v.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    v.controls.autoRotate = true; v.controls.autoRotateSpeed = 0.5; v.controls.enableZoom = false; v.controls.enablePan = false;
    const built = await v.loadScene(office);
    v.camera.position.set(30, 20, 36); v.controls.target.set(2, 1, 6);
    built.hotspots.slice(0, 4).forEach(h => { const meta = hotspotById(h.id); const el = document.createElement('span'); el.className = 'hv-tag'; el.innerHTML = `<i></i>${meta.title}`; v.addProjected(h.target, el, h.offsetY || 0); });
    // Ciclo día/noche para mostrar el efecto sin tocar nada
    let night = false; setInterval(() => { night = !night; v.setNight(night ? 1 : 0, 2.5); }, 11000);
    // Pausar render cuando el hero no está en pantalla
    const io = new IntersectionObserver(([e]) => { v.controls.autoRotate = e.isIntersecting; }, { threshold: 0.05 }); io.observe(heroVisual);
  }).catch(err => { console.warn('Hero 3D no disponible', err); heroVisual.classList.add('static'); });
} else heroVisual.classList.add('static');
