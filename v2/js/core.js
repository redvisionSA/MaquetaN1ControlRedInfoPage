/* =====================================================================
   Core compartido: tema, nav, carrito (localStorage), toasts, cards.
   ===================================================================== */
import { PRODUCTS, fmtUSD } from './catalog.js';

/* ---------- Iconos (SVG inline, sin emojis) ---------- */
export const ICON = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  sun: '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  burger: '<svg class="ic-burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></svg>',
  // Iconos por categoría de producto
  cctv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 15.5 5l1.3 3.8L4.3 13.3z"/><path d="M15.8 7.7 19 6.6l1.2 3.4-3.1 1.1"/><path d="M6 13.8 7.5 18H12"/><path d="M4 18h8"/></svg>',
  ptz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/><path d="M12 4v3"/><circle cx="12" cy="13" r="6"/><circle cx="12" cy="13" r="2.2"/></svg>',
  termica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7"/></svg>',
  acceso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c.8-1.8 2.3-2.5 4-2.5s3.2.7 4 2.5"/></svg>',
  anpr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h2l1.5-5h11L19 17h2"/><rect x="5" y="17" width="14" height="3" rx="1"/><path d="M7 9V6h10v3"/></svg>',
  radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18 6"/><circle cx="12" cy="12" r="1"/></svg>',
  alarma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0v6l2 3H4l2-3z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  nvr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="6" rx="1.5"/><rect x="3" y="13" width="18" height="6" rx="1.5"/><path d="M7 8h.01M7 16h.01"/></svg>',
  solar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16l2 8H2z"/><path d="M8 4v8M16 4v8M2 8h20"/><path d="M12 12v9M8 21h8"/></svg>',
  movil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  intercom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="8" r="2"/><path d="M9 14h6M9 17h6"/></svg>',
  red: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 12h.01M11 12h.01M15 12h.01"/><path d="M12 15v4M6 19h12"/></svg>',
};

/* ---------- Tema ---------- */
const THEME_KEY = 'cr-theme';
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefers ? 'dark' : 'light'));
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next); localStorage.setItem(THEME_KEY, next);
      document.dispatchEvent(new CustomEvent('cr:theme', { detail: next }));
    });
  });
}
export function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  document.querySelectorAll('.theme-toggle').forEach(b => b.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'));
}
export const isDark = () => document.documentElement.dataset.theme === 'dark';

/* ---------- Nav ---------- */
export function initNav() {
  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.nav-mobile');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    mobile.addEventListener('click', e => { if (e.target.tagName === 'A') { mobile.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }
  // Spotlight que sigue al cursor
  document.addEventListener('pointermove', e => {
    const el = e.target.closest?.('.glow'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

/* ---------- Toasts ---------- */
let toastHost;
export function toast(msg, kind = 'ok', ms = 2600) {
  if (!toastHost) { toastHost = document.createElement('div'); toastHost.className = 'toast-host'; toastHost.setAttribute('aria-live', 'polite'); document.body.appendChild(toastHost); }
  const t = document.createElement('div');
  t.className = `toast glass glass-pill ${kind}`;
  t.innerHTML = (kind === 'ok' ? ICON.check : ICON.alert) + `<span>${msg}</span>`;
  toastHost.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, ms);
}

/* ---------- Carrito ---------- */
const CART_KEY = 'cr-cart';
const listeners = new Set();
export const cart = {
  items: JSON.parse(localStorage.getItem(CART_KEY) || '{}'), // { sku: qty }
  save() { localStorage.setItem(CART_KEY, JSON.stringify(this.items)); listeners.forEach(f => f(this)); },
  add(sku, qty = 1) { if (!PRODUCTS[sku]) return; this.items[sku] = (this.items[sku] || 0) + qty; this.save(); toast(`${PRODUCTS[sku].name} agregado al carrito`); },
  set(sku, qty) { if (qty <= 0) delete this.items[sku]; else this.items[sku] = qty; this.save(); },
  clear() { this.items = {}; this.save(); },
  count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
  total() { return Object.entries(this.items).reduce((a, [s, q]) => a + (PRODUCTS[s]?.price_usd || 0) * q, 0); },
  on(f) { listeners.add(f); f(this); },
};

export function initCart() {
  const backdrop = document.createElement('div'); backdrop.className = 'cart-backdrop';
  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer glass glass-strong'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', 'Carrito de compras'); drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="cart-head"><h3>Tu carrito</h3><button class="icon-btn" data-cart-close aria-label="Cerrar carrito">${ICON.close}</button></div>
    <div class="cart-body"></div>
    <div class="cart-foot">
      <div class="cart-total"><span>Total estimado</span><strong data-cart-total>US$ 0</strong></div>
      <a class="btn btn-primary" style="width:100%" href="https://wa.me/5491100000000?text=Hola%20Control%20Red%2C%20quiero%20cotizar%20mi%20carrito" target="_blank" rel="noopener">Cotizar por WhatsApp ${ICON.arrow}</a>
      <p class="cart-note">Precios referenciales en USD sin IVA. Retiro en Flores (CABA) o envío a todo el país.</p>
    </div>`;
  document.body.append(backdrop, drawer);
  const body = drawer.querySelector('.cart-body');
  const open = () => { drawer.classList.add('open'); backdrop.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); drawer.querySelector('[data-cart-close]').focus(); };
  const close = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };
  backdrop.addEventListener('click', close);
  drawer.querySelector('[data-cart-close]').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
  document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', open));

  cart.on(c => {
    const n = c.count();
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = n; el.classList.toggle('on', n > 0); });
    drawer.querySelector('[data-cart-total]').textContent = fmtUSD(c.total());
    const entries = Object.entries(c.items);
    if (!entries.length) { body.innerHTML = `<div class="cart-empty"><p>Todavía no agregaste productos.</p><p style="margin-top:8px;font-size:.85rem">Entrá al <a href="showroom.html" style="color:var(--accent-strong);font-weight:600">Playground 3D</a> y probá las tecnologías.</p></div>`; return; }
    body.innerHTML = entries.map(([sku, qty]) => {
      const p = PRODUCTS[sku];
      return `<div class="cart-item">
        <div class="thumb">${ICON[p.cat] || ICON.cube}</div>
        <div><div class="name">${p.name}</div><div class="sku">${p.sku}</div></div>
        <div class="right">
          <div class="price">${fmtUSD(p.price_usd * qty)}</div>
          <div class="qty"><button data-dec="${sku}" aria-label="Restar">−</button><span>${qty}</span><button data-inc="${sku}" aria-label="Sumar">+</button></div>
        </div></div>`;
    }).join('');
  });
  body.addEventListener('click', e => {
    const dec = e.target.closest('[data-dec]'), inc = e.target.closest('[data-inc]');
    if (dec) cart.set(dec.dataset.dec, (cart.items[dec.dataset.dec] || 0) - 1);
    if (inc) cart.set(inc.dataset.inc, (cart.items[inc.dataset.inc] || 0) + 1);
  });
  document.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) cart.add(b.dataset.add); });
  return { open, close };
}

/* ---------- Card de producto ---------- */
export function productCard(p, { glass = true } = {}) {
  const tierClass = p.tier === 'Gama Pro' ? 'chip-red' : '';
  return `<article class="pcard ${glass ? 'glass glow' : ''}" data-sku="${p.sku}">
    <div class="tier"><span class="chip ${tierClass}">${p.tier}</span><span class="sku">${p.sku}</span></div>
    <div class="pimg" aria-hidden="true">${ICON[p.cat] || ICON.cube}</div>
    <h4>${p.name}</h4>
    <ul class="specs">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>
    <div class="buy">
      <div class="price">${fmtUSD(p.price_usd)}<small>+ IVA · referencial</small></div>
      <button class="btn btn-primary btn-sm" data-add="${p.sku}">${ICON.cart} Agregar</button>
    </div>
    <div class="links"><a href="${p.datasheet_url}" target="_blank" rel="noopener">${ICON.doc} Datasheet oficial</a></div>
  </article>`;
}

/* ---------- Header compartido ---------- */
export function headerHTML(active) {
  const link = (href, label, extra = '') => `<a href="${href}" ${active === href ? 'aria-current="page"' : ''} ${extra}>${label}</a>`;
  const links = [
    link('index.html#soluciones', 'Soluciones'),
    link('showroom.html', `${ICON.play} Playground 3D`, 'class="is-play"'),
    link('tienda.html', 'Tienda'),
    link('index.html#nosotros', 'Nosotros'),
    link('index.html#contacto', 'Contacto'),
  ].join('');
  return `<header class="nav"><div class="container">
    <div class="nav-inner glass glass-pill">
      <a class="brand" href="index.html" aria-label="Control Red — inicio">
        <img class="tsw-light" src="assets/logo-light.webp" alt="Control Red" width="260" height="43">
        <img class="tsw-dark" src="assets/logo-dark.webp" alt="" width="260" height="43">
      </a>
      <nav class="nav-links" aria-label="Principal">${links}</nav>
      <div class="nav-actions">
        <button class="icon-btn theme-toggle" aria-label="Cambiar tema">${ICON.sun}${ICON.moon}</button>
        <button class="icon-btn" data-cart-open aria-label="Abrir carrito">${ICON.cart}<span class="count" data-cart-count>0</span></button>
        <a class="btn btn-primary nav-cta" href="showroom.html">${ICON.cube} Entrar al Playground</a>
        <button class="icon-btn nav-burger" aria-label="Abrir menú" aria-expanded="false">${ICON.burger}${ICON.close}</button>
      </div>
    </div>
    <nav class="nav-mobile glass" aria-label="Menú móvil">${links}</nav>
  </div></header>`;
}

export function mountShell(active) {
  const slot = document.getElementById('site-header');
  if (slot) slot.outerHTML = headerHTML(active);
  initTheme(); initNav(); return initCart();
}
