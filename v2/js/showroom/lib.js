/* =====================================================================
   lib — vocabulario low-poly con identidad propia para las 4 ciudades.
   Formas redondeadas (RoundedBoxGeometry), materiales planos compartidos,
   props con sentido (cordones, canteros, bancos, tráfico, banderas…) y
   "vida ambiente" (loops de recorrido, idle, pájaros, molino).
   userData.heat (0..1) alimenta el modo térmico del feed.
   ===================================================================== */
export function makeLib(THREE, RoundedBoxGeometry) {
  const matCache = new Map();
  const mat = (color, o = {}) => {
    const key = color + JSON.stringify(o);
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.82, metalness: o.metalness ?? 0.02, flatShading: o.flat ?? true, emissive: o.emissive || '#000000', emissiveIntensity: o.emissiveIntensity ?? 0, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide });
    matCache.set(key, m); return m;
  };
  const shadow = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const geoCache = new Map();
  const geo = (kind, ...args) => { const k = kind + args.join(','); if (!geoCache.has(k)) geoCache.set(k, kind === 'Rounded' ? new RoundedBoxGeometry(...args) : new THREE[kind](...args)); return geoCache.get(k); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* Primitivas: origen en la base (y=0) para apoyar fácil */
  const box = (w, h, d, color, x = 0, y = 0, z = 0, o = {}) => { const m = shadow(new THREE.Mesh(geo('BoxGeometry', w, h, d), mat(color, o))); m.position.set(x, y + h / 2, z); return m; };
  const rbox = (w, h, d, color, x = 0, y = 0, z = 0, o = {}) => { const r = o.r ?? Math.min(w, h, d) * 0.12; const m = shadow(new THREE.Mesh(geo('Rounded', +w.toFixed(3), +h.toFixed(3), +d.toFixed(3), 2, +r.toFixed(3)), mat(color, o))); m.position.set(x, y + h / 2, z); return m; };
  const cyl = (rt, rb, h, color, x = 0, y = 0, z = 0, seg = 12, o = {}) => { const m = shadow(new THREE.Mesh(geo('CylinderGeometry', rt, rb, h, seg), mat(color, o))); m.position.set(x, y + h / 2, z); return m; };
  const sph = (r, color, x = 0, y = 0, z = 0, o = {}) => { const m = shadow(new THREE.Mesh(geo('SphereGeometry', r, o.seg ?? 10, o.seg ?? 8), mat(color, o))); m.position.set(x, y, z); return m; };
  const cone = (r, h, color, x = 0, y = 0, z = 0, seg = 8) => { const m = shadow(new THREE.Mesh(geo('ConeGeometry', r, h, seg), mat(color))); m.position.set(x, y + h / 2, z); return m; };
  const plane = (w, d, color, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo('PlaneGeometry', w, d), mat(color, o)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; return m; };
  const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };

  /* ---------- Terreno con variación de color por vértice ---------- */
  const noise2 = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
  const smoothNoise = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; const a = noise2(ix, iy), b = noise2(ix + 1, iy), c = noise2(ix, iy + 1), d = noise2(ix + 1, iy + 1); const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const ground = (size, color, { color2 = null, scale = 0.06, amount = 0.12, seg = 72 } = {}) => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg); const c1 = new THREE.Color(color), c2 = new THREE.Color(color2 || color).offsetHSL(0.02, 0.05, -0.08);
    const cols = new Float32Array(g.attributes.position.count * 3); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const n = smoothNoise(x * scale, y * scale) * 0.7 + smoothNoise(x * scale * 3.1, y * scale * 3.1) * 0.3; const c = c1.clone().lerp(c2, n * amount * 4); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: false })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.heat = 0.1; return m;
  };

  /* ---------- Entorno urbano ---------- */
  const road = (w, l, x, z, rot = 0, color = '#3F434C', { dashed = true, edge = true } = {}) => {
    const g = group(plane(w, l, color, 0, 0.02, 0));
    if (dashed) { const n = Math.floor(l / 6); for (let i = 0; i < n; i++) g.add(plane(0.28, 2.6, '#E9E4CF', 0, 0.035, -l / 2 + 3 + i * 6)); }
    if (edge) { g.add(plane(0.18, l, '#E9E4CF', -w / 2 + 0.35, 0.035, 0), plane(0.18, l, '#E9E4CF', w / 2 - 0.35, 0.035, 0)); }
    g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const zebra = (w, x, z, rot = 0) => { const g = group(); for (let i = 0; i < Math.floor(w / 1.1); i++) g.add(plane(0.6, 3, '#F2EFE4', -w / 2 + 0.6 + i * 1.1, 0.04, 0)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const curb = (l, x, z, rot = 0, color = '#D9D5CB') => { const c = box(0.35, 0.18, l, color, 0, 0, 0); c.position.set(x, 0.09, z); c.rotation.y = rot; return c; };
  const sidewalk = (w, l, x, z, rot = 0, color = '#CFCAC0') => { const g = group(box(w, 0.16, l, color, 0, 0, 0)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const parkingLines = (slots, x, z, rot = 0, pitch = 3, len = 5.2) => { const g = group(); for (let i = 0; i <= slots; i++) g.add(plane(0.12, len, '#E9E4CF', -slots * pitch / 2 + i * pitch, 0.035, 0)); g.add(plane(slots * pitch, 0.14, '#E9E4CF', 0, 0.035, len / 2)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const tree = (x, z, s = 1, color = null) => { const c = color || pick(['#4F8F3F', '#5B9A48', '#3F7F3A', '#6BA34A']); const g = group(cyl(0.16 * s, 0.24 * s, 1.5 * s, '#6B4B2A', 0, 0, 0, 6), sph(1.15 * s, c, 0, 2.2 * s, 0), sph(0.85 * s, c, 0.65 * s, 1.75 * s, 0.45 * s), sph(0.75 * s, c, -0.55 * s, 1.85 * s, -0.5 * s), sph(0.7 * s, c, 0.1 * s, 2.9 * s, -0.2 * s)); g.position.set(x, 0, z); g.rotation.y = rnd(0, 6.28); g.userData.heat = 0.1; g.userData.tree = true; return g; };
  const pine = (x, z, s = 1) => { const c = pick(['#3E7A3A', '#356E33', '#4A8A44']); const g = group(cyl(0.14 * s, 0.22 * s, 1 * s, '#6B4B2A', 0, 0, 0, 6), cone(1.25 * s, 2.4 * s, c, 0, 0.8 * s, 0, 7), cone(0.95 * s, 2 * s, c, 0, 2 * s, 0, 7), cone(0.6 * s, 1.5 * s, c, 0, 3.2 * s, 0, 7)); g.position.set(x, 0, z); g.userData.tree = true; return g; };
  const palm = (x, z, s = 1) => { const g = group(cyl(0.12 * s, 0.2 * s, 4 * s, '#8A6B45', 0, 0, 0, 6)); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const leaf = box(2.2 * s, 0.06, 0.5 * s, '#4E9A3C', 0, 0, 0); leaf.position.set(Math.cos(a) * 0.95 * s, 4 * s, -Math.sin(a) * 0.95 * s); leaf.rotation.y = a; leaf.rotation.z = -0.45; g.add(leaf); } g.position.set(x, 0, z); g.userData.tree = true; return g; };
  const bush = (x, z, s = 1, color = null) => { const b = sph(0.62 * s, color || pick(['#5C9B48', '#6AAE52', '#4E8C3E']), x, 0.42 * s, z); b.scale.y = 0.72; return b; };
  const hedge = (l, x, z, rot = 0, h = 1) => { const b = rbox(0.8, h, l, '#4E8C3E', 0, 0, 0, { r: 0.18 }); b.position.set(x, h / 2, z); b.rotation.y = rot; return b; };
  const flowerbed = (w, d, x, z, rot = 0) => { const g = group(box(w, 0.32, d, '#B8A48C', 0, 0, 0), plane(w - 0.3, d - 0.3, '#5A4030', 0, 0.33, 0)); const cols = ['#E2231A', '#FFB703', '#F04E23', '#EE6FA5', '#FFFFFF']; const n = Math.floor(w * d * 2.2); for (let i = 0; i < n; i++) g.add(sph(0.11, pick(cols), rnd(-w / 2 + 0.3, w / 2 - 0.3), 0.42, rnd(-d / 2 + 0.3, d / 2 - 0.3), { seg: 6 })); for (let i = 0; i < n / 2; i++) g.add(sph(0.18, '#5C9B48', rnd(-w / 2 + 0.3, w / 2 - 0.3), 0.4, rnd(-d / 2 + 0.3, d / 2 - 0.3), { seg: 6 })); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const planter = (x, z, color = '#344AB2') => { const g = group(rbox(0.9, 0.7, 0.9, color, 0, 0, 0, { r: 0.08 }), sph(0.5, '#5C9B48', 0, 0.95, 0), sph(0.35, '#6AAE52', 0.25, 1.15, 0.15)); g.position.set(x, 0, z); return g; };
  const bench = (x, z, rot = 0) => { const g = group(rbox(1.8, 0.08, 0.5, '#A87C4F', 0, 0.45, 0), rbox(1.8, 0.4, 0.06, '#A87C4F', 0, 0.55, -0.24), box(0.06, 0.45, 0.45, '#4A4F66', -0.8, 0, 0), box(0.06, 0.45, 0.45, '#4A4F66', 0.8, 0, 0)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const bin = (x, z, color = '#4A4F66') => { const g = group(cyl(0.28, 0.24, 0.85, color, 0, 0, 0, 10), cyl(0.3, 0.3, 0.06, '#2A2E3A', 0, 0.85, 0, 10)); g.position.set(x, 0, z); return g; };
  const bollard = (x, z, color = '#4A4F66') => { const g = group(cyl(0.09, 0.1, 0.9, color, 0, 0, 0, 8), cyl(0.1, 0.1, 0.05, '#F2F2F2', 0, 0.6, 0, 8)); g.position.set(x, 0, z); return g; };
  const coneT = (x, z) => { const g = group(box(0.5, 0.05, 0.5, '#F04E23', 0, 0, 0), cone(0.2, 0.7, '#F04E23', 0, 0.05, 0, 8), cyl(0.15, 0.17, 0.08, '#F2F2F2', 0, 0.32, 0, 8)); g.position.set(x, 0, z); return g; };
  const sign = (x, z, rot = 0, color = '#344AB2') => { const g = group(cyl(0.05, 0.05, 2.4, '#8A8F9C', 0, 0, 0, 6), rbox(0.9, 0.6, 0.06, color, 0, 2.0, 0, { r: 0.05 }), box(0.5, 0.1, 0.02, '#FFFFFF', 0, 2.3, 0.04)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const bikeRack = (x, z, rot = 0) => { const g = group(); for (let i = 0; i < 4; i++) g.add(box(0.05, 0.7, 0.9, '#8A8F9C', i * 0.6, 0, 0), box(0.05, 0.05, 0.9, '#8A8F9C', i * 0.6, 0.7, 0)); const bw = (dz) => { const w = cyl(0.3, 0.3, 0.05, '#2A2E3A', 0, 0, 0, 12); w.rotation.x = Math.PI / 2; w.position.set(1.2, 0.3, dz); return w; }; g.add(bw(-0.45), bw(0.45), box(0.05, 0.05, 0.9, '#E2231A', 1.2, 0.55, 0)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const umbrella = (x, z, color = '#E2231A') => { const g = group(cyl(0.03, 0.03, 2.3, '#8A8F9C', 0, 0, 0, 6), cone(1.3, 0.45, color, 0, 2.1, 0, 8), cyl(0.45, 0.45, 0.06, '#D9D5CB', 0, 0.7, 0, 10), cyl(0.05, 0.05, 0.7, '#8A8F9C', 0, 0, 0, 6)); g.position.set(x, 0, z); return g; };
  let flag = (ctx, x, z, colors = ['#344AB2', '#E2231A'], h = 6) => {
    const g = group(cyl(0.05, 0.07, h, '#DADDE3', 0, 0, 0, 8), sph(0.1, '#FFB703', 0, h + 0.05, 0, { seg: 6 }));
    const gg = new THREE.PlaneGeometry(1.6, 1.0, 10, 4); const m = new THREE.Mesh(gg, mat(colors[0], { side: THREE.DoubleSide, flat: false })); m.position.set(0.85, h - 0.6, 0); m.castShadow = true; g.add(m);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.34, 10, 2), mat(colors[1], { side: THREE.DoubleSide, flat: false })); stripe.position.set(0.85, h - 0.93, 0.005); g.add(stripe);
    const base = gg.attributes.position.array.slice(); const base2 = stripe.geometry.attributes.position.array.slice(); const ph = rnd(0, 6);
    ctx.tick((dt, t) => { for (const [mesh, src] of [[m, base], [stripe, base2]]) { const p = mesh.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const bx = src[i * 3] + 0.8; p.setZ(i, Math.sin(bx * 3.5 - t * 5 + ph) * 0.09 * bx + Math.sin(bx * 7 - t * 8) * 0.03 * bx); } p.needsUpdate = true; } });
    g.position.set(x, 0, z); return g;
  };
  const lampPost = (ctx, x, z, h = 5, rot = 0, { double = false } = {}) => {
    const bulb = (dx) => { const b = new THREE.Mesh(geo('Rounded', 0.9, 0.22, 0.5, 2, 0.06), new THREE.MeshStandardMaterial({ color: '#F2F2F2', emissive: '#FFE7B8', emissiveIntensity: 0 })); b.position.set(dx, h, 0); b.userData.lampMesh = true; return b; };
    const g = group(cyl(0.08, 0.13, h, '#3F4453', 0, 0, 0, 8), box(2.2, 0.1, 0.12, '#3F4453', 0.9, h - 0.1, 0), bulb(1.1));
    if (double) g.add(box(2.2, 0.1, 0.12, '#3F4453', -0.9, h - 0.1, 0), bulb(-1.1));
    g.position.set(x, 0, z); g.rotation.y = rot;
    const rec = (dx) => { const wp = new THREE.Vector3(dx, h - 0.4, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(g.position); return ctx.lamp(wp, { intensity: 2.4, distance: 22 }); };
    rec(1.1); if (double) rec(-1.1);
    return g;
  };
  const fence = (x1, z1, x2, z2, h = 2.2, color = '#8A8F9C', { mesh = true } = {}) => {
    const g = group(); const dx = x2 - x1, dz = z2 - z1; const len = Math.hypot(dx, dz); const n = Math.max(1, Math.round(len / 3)); const rot = Math.atan2(dx, dz);
    for (let i = 0; i <= n; i++) { const t = i / n; g.add(cyl(0.05, 0.06, h, color, x1 + dx * t, 0, z1 + dz * t, 6)); }
    const rail = (y) => { const r = box(0.05, 0.05, len, color, 0, 0, 0); r.position.set(x1 + dx / 2, y, z1 + dz / 2); r.rotation.y = rot; return r; };
    g.add(rail(h - 0.1), rail(h * 0.55), rail(0.25));
    if (mesh) { const mm = box(0.02, h - 0.4, len, '#B9C0CC', 0, 0, 0, { transparent: true, opacity: 0.32 }); mm.position.set(x1 + dx / 2, h / 2 - 0.1, z1 + dz / 2); mm.rotation.y = rot; mm.castShadow = false; g.add(mm); }
    return g;
  };
  const wall = (x1, z1, x2, z2, h = 2.4, color = '#D8D4CC', t = 0.3) => { const dx = x2 - x1, dz = z2 - z1; const len = Math.hypot(dx, dz); const w = rbox(t, h, len, color, 0, 0, 0, { r: 0.04 }); w.position.set(x1 + dx / 2, h / 2, z1 + dz / 2); w.rotation.y = Math.atan2(dx, dz); return w; };
  const pond = (rx, rz, x, z) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshStandardMaterial({ color: '#4FA3D8', roughness: 0.15, metalness: 0.1, flatShading: false, transparent: true, opacity: 0.85 })); m.rotation.x = -Math.PI / 2; m.scale.set(rx, rz, 1); m.position.set(x, 0.03, z); m.receiveShadow = true; const rim = new THREE.Mesh(new THREE.RingGeometry(1, 1.12, 28), mat('#B8A48C')); rim.rotation.x = -Math.PI / 2; rim.scale.set(rx, rz, 1); rim.position.set(x, 0.035, z); return group(m, rim); };
  const rock = (x, z, s = 1) => { const r = sph(0.6 * s, pick(['#8E8B84', '#9A968E', '#7C7973']), x, 0.3 * s, z, { seg: 5 }); r.scale.set(1.3, 0.7, 1); r.rotation.y = rnd(0, 3); return r; };
  const cloud = (x, y, z, s = 1) => { const c = '#FFFFFF'; const g = group(sph(1.6 * s, c, 0, 0, 0, { flat: false, seg: 8 }), sph(1.2 * s, c, 1.6 * s, -0.2 * s, 0.3 * s, { flat: false, seg: 8 }), sph(1.1 * s, c, -1.5 * s, -0.25 * s, -0.2 * s, { flat: false, seg: 8 }), sph(0.9 * s, c, 0.4 * s, 0.7 * s, -0.5 * s, { flat: false, seg: 8 })); g.children.forEach(m => { m.castShadow = false; m.receiveShadow = false; m.scale.y = 0.62; m.userData.noSwap = true; }); g.position.set(x, y, z); g.userData.cloud = true; return g; };

  /* ---------- Edificios ---------- */
  const windows = (w, h, d, x, y, z, rows, cols, color = '#9FC3E6', glow = false, frame = null) => {
    const g = group(); const m = new THREE.MeshStandardMaterial({ color, roughness: 0.18, metalness: 0.15, emissive: '#FFE7B8', emissiveIntensity: 0 });
    const gw = w / cols, gh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const pane = new THREE.Mesh(geo('BoxGeometry', gw * 0.62, gh * 0.55, 0.06), m); pane.position.set(x - w / 2 + gw * (c + 0.5), y + gh * (r + 0.5), z); if (glow) pane.userData.lampMesh = 0.32; g.add(pane);
      if (frame) { const f = box(gw * 0.7, gh * 0.62, 0.03, frame, 0, 0, 0); f.position.set(pane.position.x, pane.position.y, z - 0.02 * Math.sign(z || 1)); g.add(f); }
    }
    return g;
  };
  const building = (w, h, d, x, z, color = '#E9E5DD', { floors = 1, cols = 6, glow = true, roofColor = '#B9B5AD', band = '#344AB2' } = {}) => {
    const g = group(rbox(w, h, d, color, 0, 0, 0, { r: 0.12 }), rbox(w + 0.6, 0.35, d + 0.6, roofColor, 0, h, 0, { r: 0.06 }), rbox(w * 0.28, 1.1, d * 0.3, '#A8A49C', -w * 0.22, h + 0.3, -d * 0.15, { r: 0.06 }), cyl(0.35, 0.35, 1.6, '#DADDE3', w * 0.3, h + 0.3, d * 0.2, 10));
    if (band) g.add(box(w + 0.1, 0.5, d + 0.1, band, 0, h - 0.9, 0));
    g.add(windows(w, h - 1.2, d, 0, 0.5, d / 2 + 0.04, floors, cols, '#9FC3E6', glow, '#FFFFFF'));
    g.add(windows(w, h - 1.2, d, 0, 0.5, -d / 2 - 0.04, floors, cols, '#9FC3E6', glow, '#FFFFFF'));
    const side = windows(d, h - 1.2, w, 0, 0.5, 0, floors, Math.max(2, Math.round(cols * d / w)), '#9FC3E6', glow, '#FFFFFF'); side.rotation.y = Math.PI / 2; side.position.x = w / 2 + 0.04; g.add(side);
    const side2 = side.clone(); side2.position.x = -w / 2 - 0.04; g.add(side2);
    g.position.set(x, 0, z); return g;
  };
  const house = (x, z, w = 9, d = 8, color = '#EFE7D8', roof = '#9B5B3C', rot = 0) => {
    const g = group(rbox(w, 3.2, d, color, 0, 0, 0, { r: 0.1 }), windows(w, 3.2, d, 0, 0.7, d / 2 + 0.03, 1, 3, '#A9CBE8', true, '#FFFFFF'));
    const r = new THREE.Mesh(geo('ConeGeometry', Math.max(w, d) * 0.8, 2.6, 4), mat(roof)); r.rotation.y = Math.PI / 4; r.position.y = 3.2 + 1.3; r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); shadow(r); g.add(r);
    g.add(rbox(1.4, 2.3, 0.12, '#5B4636', 0, 0, d / 2 + 0.06, { r: 0.03 }), box(2.4, 0.12, 1.4, '#B9B5AD', 0, 2.5, d / 2 + 0.7), cyl(0.06, 0.06, 2.5, '#B9B5AD', -1, 0, d / 2 + 1.3, 6), cyl(0.06, 0.06, 2.5, '#B9B5AD', 1, 0, d / 2 + 1.3, 6));
    g.add(box(0.7, 1.2, 0.7, '#B9B5AD', w * 0.3, 3.9, -d * 0.2)); // chimenea
    g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const warehouse = (w, h, d, x, z, color = '#CFD3D8', stripe = '#344AB2') => {
    const g = group(rbox(w, h, d, color, 0, 0, 0, { r: 0.1 }), box(w + 0.1, 0.8, d + 0.1, stripe, 0, h * 0.55, 0), rbox(w + 0.6, 0.35, d + 0.6, '#B4B9C2', 0, h, 0, { r: 0.06 }));
    const ridge = new THREE.Mesh(geo('CylinderGeometry', d / 2, d / 2, w, 3, 1, false, Math.PI / 2), mat('#B4B9C2')); ridge.rotation.z = Math.PI / 2; ridge.scale.set(0.22, 1, 1); ridge.position.y = h + 0.35 + d * 0.055; shadow(ridge); g.add(ridge);
    g.position.set(x, 0, z); return g;
  };
  const dockDoor = (x, y, z, open = false) => { const d = rbox(3.4, 3.6, 0.15, open ? '#1B2030' : '#8E97A8', x, y, z, { r: 0.04 }); if (!open) for (let i = 0; i < 4; i++) d.add(box(3.3, 0.04, 0.02, '#6E7788', 0, -1.4 + i * 0.9, 0.08)); return d; };
  const guardBooth = (x, z, rot = 0) => { const g = group(rbox(2.6, 2.6, 2.6, '#E8E4DC', 0, 0, 0, { r: 0.08 }), rbox(3.0, 0.22, 3.0, '#344AB2', 0, 2.6, 0, { r: 0.05 }), windows(2.6, 2.6, 2.6, 0, 0.9, 1.34, 1, 2, '#A9CBE8', true, '#FFFFFF'), box(1.6, 0.05, 0.3, '#DADDE3', 0, 1.0, 1.4)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const container = (x, z, color = '#344AB2', rot = 0, stack = 1) => { const g = group(); for (let i = 0; i < stack; i++) { g.add(rbox(12, 2.6, 2.4, color, 0, i * 2.6, 0, { r: 0.05 })); for (let k = 0; k < 8; k++) g.add(box(0.08, 2.4, 0.06, color, -5.5 + k * 1.55, i * 2.6 + 0.1, 1.23, { roughness: 0.6 })); } g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const canopy = (w, d, x, z, h = 3.2, color = '#344AB2') => { const g = group(rbox(w, 0.25, d, color, 0, h, 0, { r: 0.05 }), box(w, 0.12, d, '#DADDE3', 0, h - 0.12, 0)); [[-w / 2 + 0.3, -d / 2 + 0.3], [w / 2 - 0.3, -d / 2 + 0.3], [-w / 2 + 0.3, d / 2 - 0.3], [w / 2 - 0.3, d / 2 - 0.3]].forEach(([a, b]) => g.add(cyl(0.08, 0.08, h, '#DADDE3', a, 0, b, 8))); g.position.set(x, 0, z); return g; };

  /* ---------- Vehículos y personas ---------- */
  const wheel = (x, z, r = 0.36) => { const w = cyl(r, r, 0.3, '#1E1E22', x, 0, z, 12); w.rotation.z = Math.PI / 2; w.position.y = r; const hub = cyl(r * 0.5, r * 0.5, 0.32, '#B9C0CC', 0, 0, 0, 8); hub.position.set(0, 0, 0); w.add(hub); return w; };
  let car = (color = '#B8362E', plate = 'AE 123 CD') => {
    const g = group(rbox(4.2, 0.75, 1.9, color, 0, 0.35, 0, { r: 0.18 }), rbox(2.3, 0.75, 1.75, '#DDEBF6', -0.2, 1.05, 0, { roughness: 0.2, r: 0.2 }), rbox(1.7, 0.08, 1.6, color, -0.2, 1.8, 0, { r: 0.03 }), wheel(1.35, 0.85), wheel(1.35, -0.85), wheel(-1.35, 0.85), wheel(-1.35, -0.85));
    const pl = box(0.5, 0.16, 0.04, '#F4F4F4', 2.1, 0.55, 0); pl.name = 'plate'; g.add(pl);
    const hood = box(1.4, 0.05, 1.7, color, 1.3, 1.08, 0); hood.userData.heat = 0.55; g.add(hood);
    g.add(box(0.2, 0.2, 0.3, '#FFF3C4', 2.05, 0.75, 0.6, { emissive: '#FFF3C4', emissiveIntensity: 0.6 }), box(0.2, 0.2, 0.3, '#FFF3C4', 2.05, 0.75, -0.6, { emissive: '#FFF3C4', emissiveIntensity: 0.6 }));
    g.add(box(0.12, 0.16, 0.3, '#E2231A', -2.08, 0.8, 0.6, { emissive: '#E2231A', emissiveIntensity: 0.5 }), box(0.12, 0.16, 0.3, '#E2231A', -2.08, 0.8, -0.6, { emissive: '#E2231A', emissiveIntensity: 0.5 }));
    g.userData.heat = 0.4; g.userData.plate = plate; return g;
  };
  let truck = (color = '#E2231A', boxColor = '#F1F1F1') => {
    const g = group(rbox(2.6, 2.4, 2.4, color, 3.0, 0.7, 0, { r: 0.15 }), rbox(1.2, 1.2, 2.2, '#CFE3F2', 3.9, 1.85, 0, { roughness: 0.2, r: 0.1 }), rbox(6.5, 3.0, 2.5, boxColor, -1.6, 0.9, 0, { r: 0.1 }), box(9.5, 0.7, 2.3, '#3A3F4A', 0, 0.35, 0), box(0.5, 0.5, 2.5, '#2A2E3A', 4.35, 0.25, 0),
      wheel(3.6, 1.2, 0.42), wheel(3.6, -1.2, 0.42), wheel(-1, 1.2, 0.42), wheel(-1, -1.2, 0.42), wheel(-3.2, 1.2, 0.42), wheel(-3.2, -1.2, 0.42));
    g.add(box(0.3, 0.8, 0.06, '#344AB2', -1.6, 2.0, 1.27));
    g.children[0].userData.heat = 0.6; g.userData.heat = 0.35; return g;
  };
  let forklift = (color = '#F5B400') => { const g = group(rbox(1.6, 0.9, 1.2, color, 0, 0.3, 0, { r: 0.1 }), rbox(0.8, 1.3, 1.1, '#2A2E3A', -0.2, 1.2, 0, { r: 0.05 }), box(0.1, 2.2, 1.0, '#555A66', 1.0, 0.2, 0), box(1.1, 0.06, 0.15, '#555A66', 1.5, 0.25, 0.35), box(1.1, 0.06, 0.15, '#555A66', 1.5, 0.25, -0.35), box(0.06, 0.06, 1.2, '#1E1E22', -0.2, 2.5, 0), wheel(0.5, 0.65, 0.3), wheel(0.5, -0.65, 0.3), wheel(-0.5, 0.65, 0.3), wheel(-0.5, -0.65, 0.3)); g.add(box(0.14, 0.14, 0.14, '#FFB703', 0, 2.6, 0, { emissive: '#FFB703', emissiveIntensity: 1 })); g.userData.heat = 0.45; return g; };
  let tractor = (color = '#3E7A3A') => { const g = group(rbox(2.2, 0.9, 1.3, color, 0.2, 0.55, 0, { r: 0.12 }), rbox(1.1, 1.2, 1.2, '#2A2E3A', -0.5, 1.45, 0, { r: 0.08 }), box(0.9, 0.9, 1.0, '#CFE3F2', -0.5, 1.6, 0, { roughness: 0.2 }), cyl(0.06, 0.06, 0.9, '#2A2E3A', 1.0, 1.45, 0.3, 6), wheel(1.0, 0.75, 0.38), wheel(1.0, -0.75, 0.38), wheel(-0.8, 0.85, 0.7), wheel(-0.8, -0.85, 0.7)); g.userData.heat = 0.45; return g; };
  let person = (shirt = '#3A6BD8', pants = '#2B2F3A', skin = null) => {
    const sk = skin || pick(['#E3B28A', '#C68B5B', '#8D5A3C', '#F1C9A5']);
    const g = group(cyl(0.16, 0.16, 0.8, pants, 0, 0, 0, 8), cyl(0.25, 0.21, 0.72, shirt, 0, 0.8, 0, 8), sph(0.19, sk, 0, 1.73, 0), cyl(0.07, 0.07, 0.6, shirt, 0.31, 0.85, 0, 6), cyl(0.07, 0.07, 0.6, shirt, -0.31, 0.85, 0, 6), sph(0.2, pick(['#2A2E3A', '#5B4636', '#1A1C24', '#8A6B45']), 0, 1.82, -0.02));
    g.children[5].scale.y = 0.6; g.userData.heat = 0.88; return g;
  };
  let dog = () => { const c = pick(['#8B6B4A', '#D9C7A8', '#2A2E3A']); const g = group(rbox(0.7, 0.3, 0.28, c, 0, 0.3, 0, { r: 0.08 }), sph(0.14, c, 0.42, 0.55, 0), cyl(0.05, 0.05, 0.3, c, 0.25, 0, 0.1, 5), cyl(0.05, 0.05, 0.3, c, 0.25, 0, -0.1, 5), cyl(0.05, 0.05, 0.3, c, -0.25, 0, 0.1, 5), cyl(0.05, 0.05, 0.3, c, -0.25, 0, -0.1, 5), box(0.05, 0.05, 0.25, c, -0.4, 0.5, 0)); g.userData.heat = 0.62; return g; };
  const cow = (x, z, rot = 0) => { const c = pick(['#F2F2F2', '#5B4636', '#2A2E3A']); const g = group(rbox(1.7, 0.9, 0.8, c, 0, 0.6, 0, { r: 0.2 }), rbox(0.55, 0.45, 0.45, c, 1.0, 0.95, 0, { r: 0.1 }), box(0.12, 0.6, 0.12, c, 0.6, 0, 0.25), box(0.12, 0.6, 0.12, c, 0.6, 0, -0.25), box(0.12, 0.6, 0.12, c, -0.6, 0, 0.25), box(0.12, 0.6, 0.12, c, -0.6, 0, -0.25), sph(0.1, '#E3B28A', 1.32, 1.05, 0)); if (c === '#F2F2F2') for (let i = 0; i < 3; i++) g.add(sph(0.18, '#2A2E3A', rnd(-0.6, 0.6), rnd(0.8, 1.3), rnd(-0.3, 0.3), { seg: 5 })); g.position.set(x, 0, z); g.rotation.y = rot; g.userData.heat = 0.7; return g; };
  let pallet = (x, z, color = '#C8A060') => { const g = group(box(1.2, 0.14, 1.0, '#9A7A48', 0, 0, 0), rbox(1.1, 1.0, 0.9, color, 0, 0.14, 0, { r: 0.04 }), rbox(0.5, 0.4, 0.45, '#344AB2', 0.2, 1.14, 0.1, { r: 0.03 })); for (let i = 0; i < 2; i++) g.add(box(1.12, 0.03, 0.04, '#8A7A60', 0, 0.4 + i * 0.4, 0.46)); g.position.set(x, 0, z); g.userData.heat = 0.14; return g; };
  const crateStack = (x, z, n = 3, color = '#C8A060') => { const g = group(); for (let i = 0; i < n; i++) g.add(rbox(1.0, 0.8, 1.0, color, rnd(-0.08, 0.08), i * 0.8, rnd(-0.08, 0.08), { r: 0.04 })); g.position.set(x, 0, z); g.rotation.y = rnd(0, 0.4); return g; };
  const silobolsa = (x, z, l = 14, rot = 0) => { const s = new THREE.Mesh(geo('CapsuleGeometry', 1.3, l, 4, 12), mat('#F2F2F2', { roughness: 0.55, flat: false })); s.rotation.z = Math.PI / 2; s.rotation.y = rot; s.position.set(x, 1.15, z); s.scale.y = 0.85; shadow(s); return s; };
  const hayBale = (x, z, rot = 0) => { const b = cyl(0.9, 0.9, 1.4, pick(['#D9B65A', '#E2C46A', '#C9A64F']), 0, 0, 0, 12); b.rotation.z = Math.PI / 2; b.position.set(x, 0.9, z); b.rotation.y = rot; return b; };
  let windmill = (ctx, x, z, h = 8) => { const g = group(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const leg = cyl(0.04, 0.05, h, '#8A8F9C', 0, 0, 0, 5); leg.position.set(Math.cos(a) * 0.9, h / 2, Math.sin(a) * 0.9); leg.rotation.z = Math.cos(a) * 0.1; leg.rotation.x = -Math.sin(a) * 0.1; g.add(leg); } const rotor = group(); for (let i = 0; i < 12; i++) { const w = group(box(0.25, 1.4, 0.03, '#DADDE3', 0, 0.5, 0)); w.rotation.z = i * Math.PI / 6; rotor.add(w); } rotor.add(cyl(0.2, 0.2, 0.3, '#8A8F9C', 0, -0.15, 0, 8)); rotor.position.set(0, h + 0.3, 0.6); rotor.rotation.x = Math.PI / 2; g.add(rotor, box(0.5, 0.15, 1.2, '#8A8F9C', 0, h, 0), box(0.6, 0.5, 0.05, '#DADDE3', 0, h + 0.2, -0.9)); ctx.tick((dt) => { rotor.rotation.z += dt * 1.6; }); g.position.set(x, 0, z); return g; };
  const waterTank = (x, z) => { const g = group(cyl(4, 4, 1.2, '#B4B9C2', 0, 0, 0, 20), cyl(3.8, 3.8, 0.1, '#4FA3D8', 0, 1.15, 0, 20, { roughness: 0.15 })); g.position.set(x, 0, z); return g; };
  let birds = (ctx, cx, cz, r = 40, y = 26, n = 5) => { const g = group(); const ph = rnd(0, 6); for (let i = 0; i < n; i++) { const b = group(box(0.5, 0.03, 0.12, '#2A2E3A', -0.25, 0, 0), box(0.5, 0.03, 0.12, '#2A2E3A', 0.25, 0, 0)); b.position.set(i * 1.2 - 2.4, -Math.abs(i - 2) * 0.4, -Math.abs(i - 2) * 1.2); b.children.forEach(c => { c.castShadow = false; c.userData.noSwap = true; }); g.add(b); } ctx.tick((dt, t) => { const a = t * 0.12 + ph; g.position.set(cx + Math.cos(a) * r, y + Math.sin(t * 0.7) * 1.2, cz + Math.sin(a) * r * 0.6); g.rotation.y = -a + Math.PI / 2; g.children.forEach((b, i) => { b.children[0].rotation.z = 0.35 + Math.sin(t * 9 + i) * 0.5; b.children[1].rotation.z = -0.35 - Math.sin(t * 9 + i) * 0.5; }); }); return g; };

  /* ---------- Vida ambiente: loops de recorrido e idle ---------- */
  const loopPath = (ctx, obj, pts, { speed = 4, bob = false, y = 0, pause = 0 } = {}) => {
    const P = pts.map(p => new THREE.Vector2(p[0], p[1])); const L = P.map((p, i) => p.distanceTo(P[(i + 1) % P.length])); const total = L.reduce((a, b) => a + b, 0);
    obj.userData.dynamic = true; let d = rnd(0, total); let wait = 0;
    ctx.tick((dt, t) => {
      if (wait > 0) { wait -= dt; return; }
      d = (d + dt * speed) % total; let acc = 0, i = 0; while (i < L.length - 1 && acc + L[i] < d) { acc += L[i]; i++; }
      const a = P[i], b = P[(i + 1) % P.length]; const k = L[i] > 0 ? (d - acc) / L[i] : 0;
      obj.position.set(a.x + (b.x - a.x) * k, y + (bob ? Math.abs(Math.sin(t * 9)) * 0.05 : 0), a.y + (b.y - a.y) * k);
      const target = Math.atan2(-(b.y - a.y), b.x - a.x); let dy = target - obj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); obj.rotation.y += dy * Math.min(1, dt * 6);
      if (pause && k > 0.995) wait = pause;
    });
    return obj;
  };
  const idle = (ctx, obj, amp = 0.03) => { obj.userData.dynamic = true; const ph = rnd(0, 6); const y0 = obj.position.y; ctx.tick((dt, t) => { obj.position.y = y0 + Math.sin(t * 2 + ph) * amp; }); return obj; };

  /* ---------- Dispositivos Hikvision (la fase 2 los refina) ---------- */
  const DEV = '#F4F5F7', DEV2 = '#DADDE3', LENS = '#0E1424';
  let camBullet = (color = DEV) => { const g = group(cyl(0.11, 0.13, 0.42, color, 0, 0, 0, 10), cyl(0.09, 0.09, 0.05, LENS, 0, 0.42, 0, 12, { roughness: 0.15 }), box(0.06, 0.16, 0.06, DEV2, 0, -0.16, 0)); g.children[0].rotation.x = Math.PI / 2; g.children[0].position.set(0, 0, 0.21); g.children[1].rotation.x = Math.PI / 2; g.children[1].position.set(0, 0, 0.45); g.children[2].position.set(0, 0.12, 0.05); const m = box(0.18, 0.04, 0.18, DEV2, 0, 0.2, 0); g.add(m); g.userData.heat = 0.22; return g; };
  let camTurret = (color = DEV) => { const g = group(cyl(0.16, 0.18, 0.08, DEV2, 0, 0, 0, 12), sph(0.15, color, 0, -0.02, 0), cyl(0.07, 0.07, 0.04, LENS, 0, 0, 0, 12, { roughness: 0.15 })); g.children[2].rotation.x = Math.PI / 2; g.children[2].position.set(0, -0.06, 0.13); g.userData.heat = 0.22; return g; };
  let camPTZ = (color = DEV, r = 0.28) => { const head = group(sph(r, color, 0, 0, 0, { roughness: 0.4 }), box(r * 0.9, r * 0.9, r * 1.3, color, 0, -r * 0.45, 0), cyl(r * 0.28, r * 0.28, 0.05, LENS, 0, 0, 0, 12, { roughness: 0.15 })); head.children[2].rotation.x = Math.PI / 2; head.children[2].position.set(0, 0, r * 1.05);
    const strobe = new THREE.Mesh(geo('BoxGeometry', r * 0.9, r * 0.25, 0.06), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0 })); strobe.position.set(0, r * 0.45, r * 1.02); strobe.name = 'strobe'; head.add(strobe);
    const g = group(cyl(0.06, 0.06, 0.5, DEV2, 0, 0, 0, 8), head); head.position.y = -0.1; head.name = 'head'; g.userData.heat = 0.25; return g; };
  let camThermal = (color = DEV) => { const g = camBullet(color); const l2 = cyl(0.06, 0.06, 0.05, '#3A2A1A', 0, 0, 0, 12); l2.rotation.x = Math.PI / 2; l2.position.set(0, -0.14, 0.43); g.add(l2); g.userData.heat = 0.24; return g; };
  let camSolar = (x, z, h = 4.5, rot = 0) => {
    const pole = cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8);
    const panel = box(1.4, 0.05, 0.9, '#1B2A55', 0, 0, 0, { roughness: 0.3, metalness: 0.3 }); panel.rotation.x = -0.45; panel.position.set(0, h + 0.2, -0.2); panel.name = 'panel';
    const batt = box(0.4, 0.5, 0.25, DEV2, 0, h - 1.4, 0.15);
    const cam = camBullet(); cam.position.set(0, h - 0.5, 0.25); cam.name = 'cam';
    const ant = cyl(0.015, 0.015, 0.5, '#2A2E3A', 0.3, h + 0.3, 0.2, 5);
    const g = group(pole, panel, batt, cam, ant); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const pole = (x, z, h = 4, color = '#8A8F9C') => cyl(0.07, 0.09, h, color, x, 0, z, 8);
  const mount = (x, y, z, dev, yaw = 0, pitch = -0.35) => { dev.position.set(x, y, z); dev.rotation.set(pitch, yaw, 0); return dev; };
  let radar = (x, z, h = 3) => {
    const body = box(0.5, 0.7, 0.16, DEV, 0, h - 0.35, 0); body.userData.heat = 0.2;
    const sweep = new THREE.Mesh(new THREE.CircleGeometry(1, 40, -0.55, 1.1), new THREE.MeshBasicMaterial({ color: '#344AB2', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })); sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.06; sweep.name = 'sweep'; sweep.userData.noSwap = true; sweep.visible = false;
    const beam = new THREE.Mesh(new THREE.CircleGeometry(1, 20, -0.09, 0.18), new THREE.MeshBasicMaterial({ color: '#8AA0FF', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })); beam.rotation.x = -Math.PI / 2; beam.position.y = 0.07; beam.name = 'beam'; beam.userData.noSwap = true; beam.visible = false;
    const g = group(cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8), body, sweep, beam); g.position.set(x, 0, z); return g;
  };
  let barrier = (x, z, rot = 0, len = 4.2) => {
    const arm = group(box(len, 0.12, 0.12, '#F4F4F4', len / 2, 0, 0)); for (let i = 0; i < 4; i++) arm.add(box(0.5, 0.13, 0.13, '#E2231A', 0.6 + i * 1.0, -0.005, 0)); arm.position.set(0.25, 1.0, 0); arm.name = 'arm';
    const g = group(rbox(0.5, 1.1, 0.4, '#F4F4F4', 0, 0, 0, { r: 0.04 }), box(0.5, 0.15, 0.4, '#E2231A', 0, 0.75, 0), arm); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  let speedGate = (x, z, rot = 0) => {
    const wingMat = () => new THREE.MeshStandardMaterial({ color: '#BFE1F5', roughness: 0.15, transparent: true, opacity: 0.5 });
    const cab = (dx) => group(rbox(0.35, 1.05, 1.6, '#DADDE3', dx, 0, 0, { r: 0.04 }), box(0.37, 0.04, 1.62, '#344AB2', dx, 1.05, 0));
    const wingL = new THREE.Mesh(geo('BoxGeometry', 0.04, 0.9, 0.62), wingMat()); wingL.position.set(-0.5, 0.75, 0); wingL.name = 'wingL';
    const wingR = wingL.clone(); wingR.material = wingMat(); wingR.position.x = 0.5; wingR.name = 'wingR';
    const led = new THREE.Mesh(geo('BoxGeometry', 0.3, 0.02, 1.2), new THREE.MeshStandardMaterial({ color: '#E2231A', emissive: '#E2231A', emissiveIntensity: 1.2 })); led.position.set(-0.68, 1.1, 0); led.name = 'led'; led.userData.noSwap = true;
    const g = group(cab(-0.68), cab(0.68), wingL, wingR, led); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  let totem = (x, z, rot = 0) => {
    const screen = new THREE.Mesh(geo('BoxGeometry', 0.24, 0.32, 0.02), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#4A62D6', emissiveIntensity: 0.5 })); screen.position.set(0, 1.35, 0.06); screen.name = 'screen'; screen.userData.noSwap = true;
    const g = group(cyl(0.07, 0.1, 1.15, DEV2, 0, 0, 0, 8), rbox(0.3, 0.45, 0.08, DEV, 0, 1.15, 0, { r: 0.02 }), screen); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const siren = (x, y, z) => { const s = new THREE.Mesh(geo('Rounded', 0.3, 0.42, 0.12, 2, 0.03), new THREE.MeshStandardMaterial({ color: '#F4F5F7', emissive: '#E2231A', emissiveIntensity: 0 })); s.position.set(x, y, z); s.name = 'siren'; s.userData.noSwap = true; return s; };
  let rack = (x, z) => { const g = group(rbox(0.7, 1.9, 0.6, '#2A2E3A', 0, 0, 0, { r: 0.03 })); for (let i = 0; i < 5; i++) { const led = new THREE.Mesh(geo('BoxGeometry', 0.5, 0.05, 0.02), new THREE.MeshStandardMaterial({ color: '#9FE3B6', emissive: '#3DD68C', emissiveIntensity: 1 })); led.position.set(0, 0.3 + i * 0.32, 0.31); led.userData.noSwap = true; g.add(led); } g.position.set(x, 0, z); g.userData.heat = 0.5; return g; };
  let nvrBox = (x, y, z) => { const g = group(rbox(0.5, 0.1, 0.4, '#1E2230', 0, 0, 0, { r: 0.01 })); const led = new THREE.Mesh(geo('BoxGeometry', 0.03, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: '#3DD68C', emissive: '#3DD68C', emissiveIntensity: 1.5 })); led.position.set(0.2, 0.06, 0.21); led.userData.noSwap = true; g.add(led); g.position.set(x, y, z); g.userData.heat = 0.4; return g; };
  const screenPanel = (x, y, z, rot = 0) => { const s = new THREE.Mesh(geo('Rounded', 1.6, 0.9, 0.06, 2, 0.02), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#2B47C4', emissiveIntensity: 0.6, roughness: 0.3 })); s.position.set(x, y, z); s.rotation.y = rot; s.userData.noSwap = true; return s; };
  const spot = (color = '#FFFFFF', intensity = 0, angle = 0.55, dist = 30) => { const l = new THREE.SpotLight(color, intensity, dist, angle, 0.5, 1.2); l.castShadow = false; return l; };
  let smoke = (x, z, h = 6) => { const g = group(); for (let i = 0; i < 6; i++) { const s = sph(0.8 + i * 0.35, '#8E8E92', 0, 1 + i * 1.1, 0, { transparent: true, opacity: 0.55 }); s.castShadow = false; s.userData.heat = 0.45 + i * 0.02; g.add(s); } g.position.set(x, 0, z); g.scale.set(0.001, 0.001, 0.001); g.name = 'smoke'; g.userData.heat = 0.5; return g; };
  let fire = (x, z) => { const g = group(cone(0.6, 1.4, '#FF6A00', 0, 0, 0, 6), cone(0.35, 1.0, '#FFD13D', 0, 0.2, 0, 6)); g.children.forEach(c => { c.material = mat('#FF6A00', { emissive: '#FF6A00', emissiveIntensity: 1.2 }); c.castShadow = false; }); g.position.set(x, 0, z); g.userData.heat = 1; g.scale.set(0.001, 0.001, 0.001); g.name = 'fire'; return g; };
  const line = (a, b, color = '#FF3B30') => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), new THREE.LineBasicMaterial({ color }));
  const zone = (w, d, x, z, color = '#E2231A', opacity = 0.18) => { const m = new THREE.Mesh(geo('PlaneGeometry', w, d), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); m.userData.noSwap = true; return m; };

  /* Objetos que se mueven / cambian de material: no se unen en el merge estático */
  const DYN = { car, truck, forklift, tractor, person, dog, flag, windmill, birds, camBullet, camTurret, camPTZ, camThermal, camSolar, radar, barrier, speedGate, totem, rack, nvrBox, smoke, fire };
  const wrapped = {}; for (const k in DYN) wrapped[k] = (...a) => { const o = DYN[k](...a); o.userData.dynamic = true; return o; };
  ({ car, truck, forklift, tractor, person, dog, flag, windmill, birds, camBullet, camTurret, camPTZ, camThermal, camSolar, radar, barrier, speedGate, totem, rack, nvrBox, smoke, fire } = wrapped);

  return { geo, mat, box, rbox, cyl, sph, cone, plane, group, rnd, pick, ground, road, zebra, curb, sidewalk, parkingLines, tree, pine, palm, bush, hedge, flowerbed, planter, bench, bin, bollard, coneT, sign, bikeRack, umbrella, flag, lampPost, fence, wall, pond, rock, cloud, windows, building, house, warehouse, dockDoor, guardBooth, container, canopy, car, truck, forklift, tractor, person, dog, cow, pallet, crateStack, silobolsa, hayBale, windmill, waterTank, birds, loopPath, idle, camBullet, camTurret, camPTZ, camThermal, camSolar, pole, mount, radar, barrier, speedGate, totem, siren, rack, nvrBox, screenPanel, spot, smoke, fire, line, zone };
}
