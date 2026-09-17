/* Utilidades compartidas por las escenas: recorridos, parpadeos, HUD. */
export const S = {
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
  face: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M9 10h.01M15 10h.01M9 15c.8.9 1.8 1.3 3 1.3s2.2-.4 3-1.3"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h2l1.5-5h11L19 17h2"/><rect x="5" y="17" width="14" height="3" rx="1"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-3-8-1 4-5 6-5 12 0 4 3 7 7 7Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18 6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14 14 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><rect x="5" y="10" width="9" height="4" fill="currentColor" stroke="none"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14 16 8"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/></svg>',
  split: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17"/><path d="M15 8h4v13"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6M11 8v6"/></svg>',
  net: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 12h.01M11 12h.01M15 12h.01"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0v6l2 3H4l2-3z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
};

/* Recorre puntos [x,z] orientando el objeto (frente local = +x). */
export function path(ctx, obj, pts, { speed = 3, y = null, bob = false, face = true, ease = 'none' } = {}) {
  const tl = ctx.gsap.timeline();
  let prev = [obj.position.x, obj.position.z];
  for (const p of pts) {
    const dx = p[0] - prev[0], dz = p[1] - prev[1]; const len = Math.hypot(dx, dz); const dur = Math.max(0.05, len / speed);
    if (face && len > 0.01) tl.to(obj.rotation, { y: Math.atan2(-dz, dx), duration: 0.35, ease: 'power2.out' }, '<');
    tl.to(obj.position, { x: p[0], z: p[1], duration: dur, ease }, face && len > 0.01 ? '<0.1' : '>');
    prev = p;
  }
  if (bob) { const bt = ctx.gsap.to(obj.position, { y: (y ?? obj.position.y) + 0.06, duration: 0.28, yoyo: true, repeat: -1, ease: 'sine.inOut' }); tl.call(() => { bt.kill(); obj.position.y = y ?? 0; }); ctx.tween(bt); }
  return ctx.tween(tl);
}

/* Parpadeo de un material emisivo (strobe / sirena). */
export function strobe(ctx, mesh, { times = 8, on = 2.5, period = 0.18 } = {}) {
  const tl = ctx.gsap.timeline();
  for (let i = 0; i < times; i++) tl.to(mesh.material, { emissiveIntensity: on, duration: period / 2, ease: 'steps(1)' }).to(mesh.material, { emissiveIntensity: 0, duration: period / 2, ease: 'steps(1)' });
  return ctx.tween(tl);
}

export const wait = (ms) => new Promise(r => setTimeout(r, ms));
export const done = (tl) => new Promise(r => tl.eventCallback('onComplete', r));

/* Tag HUD con icono y texto (estilo etiqueta de cámara) */
export const tagHTML = (icon, title, sub = '', kind = '') => `<span class="tag-ic ${kind}">${icon}</span><span class="tag-tx"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>`;
