/* Tienda: catálogo filtrable por categoría y texto, mismo carrito que el showroom. */
import { mountShell, productCard } from './core.js';
import { allProducts, CATEGORIES } from './catalog.js';

mountShell('tienda.html');
const grid = document.getElementById('grid'), filters = document.getElementById('filters'), q = document.getElementById('q'), empty = document.getElementById('empty');
let cat = location.hash.replace('#', '') || 'all';
const all = allProducts();

filters.innerHTML = [{ id: 'all', name: 'Todo' }, ...CATEGORIES].map(c => `<button data-cat="${c.id}" aria-pressed="${c.id === cat}">${c.name}</button>`).join('');
filters.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); history.replaceState(null, '', cat === 'all' ? ' ' : '#' + cat); render(); });
q.addEventListener('input', render);

function render() {
  const t = q.value.trim().toLowerCase();
  const list = all.filter(p => (cat === 'all' || p.cat === cat) && (!t || [p.sku, p.name, p.tier, ...p.specs].join(' ').toLowerCase().includes(t)));
  grid.innerHTML = list.map(p => productCard(p)).join('');
  empty.hidden = list.length > 0;
}
render();
