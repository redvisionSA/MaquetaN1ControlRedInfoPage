/* =====================================================================
   Playground 3D — UI: tabs de escena, acciones, hotspots, modal, feed
   ===================================================================== */
import { ShowroomViewer } from './viewer.js';
import { SCENES, hotspotById, productsFor, fmtUSD } from '../catalog.js';
import { ICON, initTheme, initCart, cart, productCard, toast, initNav } from '../core.js';
import office from './scenes/office.js';
import country from './scenes/country.js';
import warehouse from './scenes/warehouse.js';
import agro from './scenes/agro.js';

const MODS = { office, country, warehouse, agro };
const $ = (s, r = document) => r.querySelector(s);

initTheme(); initNav(); const cartUI = initCart();

const viewer = new ShowroomViewer({ container: $('#stage'), layer: $('#layer'), feedFrame: $('#feed') });
window.__viewer = viewer; // depuración en consola

/* ---------- Tabs ---------- */
const tabs = $('#tabs');
tabs.innerHTML = SCENES.map(s => `<button class="sr-tab" role="tab" data-scene="${s.id}" style="--c:${s.color}" aria-selected="false"><span class="dot"></span>${s.name}</button>`).join('');
tabs.addEventListener('click', e => { const b = e.target.closest('[data-scene]'); if (b) go(b.dataset.scene); });

/* ---------- Día / noche ---------- */
const nightBtn = $('#nightBtn');
nightBtn.addEventListener('click', () => { const to = viewer.night > 0.5 ? 0 : 1; viewer.setNight(to); });
setInterval(() => nightBtn.classList.toggle('night', viewer.night > 0.5), 300);

$('#resetView').addEventListener('click', () => { viewer.resetView(); viewer.setFeed(null); });
$('#feedClose').addEventListener('click', () => viewer.setFeed(null));
$('#splitRange').addEventListener('input', e => { viewer.feed.split = e.target.value / 100; $('#splitHandle').style.left = e.target.value + '%'; });

/* ---------- Carga de escena ---------- */
let current = null; let running = false;
async function go(id) {
  if (!MODS[id] || current === id) return;
  current = id; history.replaceState(null, '', '#' + id);
  const loader = $('#loader'); loader.classList.remove('off'); $('#loaderText').textContent = `Construyendo ${SCENES.find(s => s.id === id).name.toLowerCase()}…`;
  tabs.querySelectorAll('.sr-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.scene === id)));
  await new Promise(r => setTimeout(r, 60));
  const built = await viewer.loadScene(MODS[id]);
  mountHotspots(built.hotspots); mountActions(built.actions, built.reset);
  const meta = SCENES.find(s => s.id === id);
  $('#sceneName').textContent = `Soluciones para ${meta.name.toLowerCase()}`; $('#sceneObjective').textContent = meta.objective;
  $('#sceneEyebrow').textContent = meta.short;
  setTimeout(() => loader.classList.add('off'), 350);
}

function mountHotspots(list) {
  list.forEach(h => {
    const meta = hotspotById(h.id); if (!meta) return;
    const el = document.createElement('button'); el.className = 'hotspot glass glass-pill'; el.setAttribute('aria-label', `Ver ${meta.title}`);
    el.innerHTML = `<span class="pulse"></span><span class="lbl">${meta.title}</span>`;
    el.addEventListener('click', () => { const p = viewer.worldPos(h.target).clone(); viewer.focus([p.x, p.y + (h.offsetY || 0) * 0.5, p.z], h.offset || [5, 3, 5]); openModal(meta); });
    viewer.addProjected(h.target, el, h.offsetY || 0);
  });
}

function mountActions(actions, reset) {
  const list = $('#actions'); list.innerHTML = '';
  actions.forEach(a => {
    const b = document.createElement('button'); b.className = 'act'; b.innerHTML = `<span class="ic">${a.icon}</span><span><b>${a.label}</b><small>${a.desc}</small></span>`;
    b.addEventListener('click', async () => {
      if (running) return; running = true; list.querySelectorAll('.act').forEach(x => x.disabled = true); b.classList.add('running');
      try { await a.run(); } catch (err) { console.error(err); toast('La simulación se interrumpió', 'warn'); }
      finally { running = false; b.classList.remove('running'); list.querySelectorAll('.act').forEach(x => x.disabled = false); }
    });
    list.appendChild(b);
  });
}

/* ---------- Modal de producto ---------- */
const modal = $('#modal'), backdrop = $('#modalBackdrop'); let lastFocus = null;
function openModal(meta) {
  const products = productsFor(meta);
  $('#mTech').textContent = meta.technology_name; $('#mTitle').textContent = meta.title; $('#mHigh').textContent = meta.feature_highlight;
  $('#mTrack').innerHTML = products.map(p => productCard(p)).join('');
  $('#mKit').dataset.skus = products.map(p => p.sku).join('|');
  $('#mCount').textContent = `${products.length} productos · de mayor a menor precio`;
  lastFocus = document.activeElement; modal.classList.add('open'); backdrop.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  $('#mClose').focus();
}
function closeModal() { modal.classList.remove('open'); backdrop.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); lastFocus?.focus?.(); }
$('#mClose').addEventListener('click', closeModal); backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (modal.classList.contains('open')) closeModal(); } });
modal.addEventListener('keydown', e => { // trampa de foco
  if (e.key !== 'Tab') return; const f = [...modal.querySelectorAll('button,a[href],input')].filter(x => !x.disabled && x.offsetParent);
  const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
$('#mKit').addEventListener('click', e => { e.currentTarget.dataset.skus.split('|').forEach(s => cart.add(s)); closeModal(); cartUI.open(); });
$('#mPrev').addEventListener('click', () => $('#mTrack').scrollBy({ left: -300, behavior: 'smooth' }));
$('#mNext').addEventListener('click', () => $('#mTrack').scrollBy({ left: 300, behavior: 'smooth' }));

/* ---------- Arranque ---------- */
const start = location.hash.replace('#', '');
go(MODS[start] ? start : 'office');
window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (MODS[h]) go(h); });
