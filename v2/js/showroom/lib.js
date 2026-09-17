/* =====================================================================
   lib — constructores low-poly reutilizables para las 4 ciudades.
   Todo se arma con primitivas y materiales planos compartidos; cuando
   lleguen los GLB de Blender, las escenas solo cambian `build()`.
   userData.heat (0..1) alimenta el modo térmico del feed.
   ===================================================================== */
export function makeLib(THREE) {
  const matCache = new Map();
  const mat = (color, o = {}) => {
    const key = color + JSON.stringify(o);
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.9, metalness: o.metalness ?? 0.02, flatShading: true, emissive: o.emissive || '#000000', emissiveIntensity: o.emissiveIntensity ?? 0, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide });
    matCache.set(key, m); return m;
  };
  const shadow = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const geoCache = new Map();
  const geo = (kind, ...args) => { const k = kind + args.join(','); if (!geoCache.has(k)) geoCache.set(k, new THREE[kind](...args)); return geoCache.get(k); };

  /* Primitivas: origen en la base (y=0) para apoyar fácil */
  const box = (w, h, d, color, x = 0, y = 0, z = 0, o = {}) => { const m = shadow(new THREE.Mesh(geo('BoxGeometry', w, h, d), mat(color, o))); m.position.set(x, y + h / 2, z); return m; };
  const cyl = (rt, rb, h, color, x = 0, y = 0, z = 0, seg = 12, o = {}) => { const m = shadow(new THREE.Mesh(geo('CylinderGeometry', rt, rb, h, seg), mat(color, o))); m.position.set(x, y + h / 2, z); return m; };
  const sph = (r, color, x = 0, y = 0, z = 0, o = {}) => { const m = shadow(new THREE.Mesh(geo('SphereGeometry', r, 12, 10), mat(color, o))); m.position.set(x, y, z); return m; };
  const cone = (r, h, color, x = 0, y = 0, z = 0, seg = 8) => { const m = shadow(new THREE.Mesh(geo('ConeGeometry', r, h, seg), mat(color))); m.position.set(x, y + h / 2, z); return m; };
  const plane = (w, d, color, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo('PlaneGeometry', w, d), mat(color, o)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; return m; };
  const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };

  /* ---------- Entorno ---------- */
  const ground = (size, color) => plane(size, size, color, 0, 0, 0);
  const road = (w, l, x, z, rot = 0, color = '#3E4149') => { const g = group(plane(w, l, color, 0, 0.02, 0)); const n = Math.floor(l / 6); for (let i = 0; i < n; i++) g.add(plane(0.3, 2.4, '#E8E4D0', 0, 0.03, -l / 2 + 3 + i * 6)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  const sidewalk = (w, l, x, z, rot = 0) => { const s = box(w, 0.16, l, '#C9C5BB', x, 0, z); s.rotation.y = rot; return s; };
  const tree = (x, z, s = 1, color = '#4F8A3D') => { const g = group(cyl(0.16 * s, 0.22 * s, 1.4 * s, '#6B4B2A', 0, 0, 0, 6), sph(1.1 * s, color, 0, 2.1 * s, 0), sph(0.8 * s, color, 0.6 * s, 1.6 * s, 0.4 * s), sph(0.7 * s, color, -0.5 * s, 1.7 * s, -0.5 * s)); g.position.set(x, 0, z); g.userData.heat = 0.1; return g; };
  const pine = (x, z, s = 1) => { const g = group(cyl(0.14 * s, 0.2 * s, 1 * s, '#6B4B2A', 0, 0, 0, 6), cone(1.2 * s, 2.4 * s, '#3E7A3A', 0, 0.8 * s, 0, 7), cone(0.9 * s, 2 * s, '#4A8A44', 0, 2 * s, 0, 7)); g.position.set(x, 0, z); return g; };
  const bush = (x, z, s = 1) => { const b = sph(0.6 * s, '#5C9B48', x, 0.45 * s, z); b.scale.y = 0.7; return b; };
  const lampPost = (ctx, x, z, h = 5, rot = 0) => {
    const bulb = new THREE.Mesh(geo('BoxGeometry', 0.9, 0.22, 0.5), new THREE.MeshStandardMaterial({ color: '#F2F2F2', emissive: '#FFE7B8', emissiveIntensity: 0 }));
    bulb.position.set(1.1, h, 0); bulb.userData.lampMesh = true; bulb.userData.noSwap = false;
    const g = group(cyl(0.08, 0.12, h, '#4A4F66', 0, 0, 0, 8), box(2.2, 0.1, 0.12, '#4A4F66', 0.9, h - 0.1, 0), bulb);
    g.position.set(x, 0, z); g.rotation.y = rot;
    const wp = new THREE.Vector3(1.1, h - 0.4, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(g.position);
    ctx.lamp(wp, { intensity: 2.2, distance: 20 });
    return g;
  };
  const fence = (x1, z1, x2, z2, h = 2.2, color = '#8A8F9C') => {
    const g = group(); const dx = x2 - x1, dz = z2 - z1; const len = Math.hypot(dx, dz); const n = Math.max(1, Math.round(len / 3));
    const rot = Math.atan2(dx, dz);
    for (let i = 0; i <= n; i++) { const t = i / n; g.add(cyl(0.05, 0.06, h, color, x1 + dx * t, 0, z1 + dz * t, 6)); }
    const rail = (y) => { const r = box(0.05, 0.05, len, color, 0, y, 0); r.position.set(x1 + dx / 2, y, z1 + dz / 2); r.rotation.y = rot; return r; };
    g.add(rail(h - 0.1), rail(h * 0.55), rail(0.25));
    const mesh = box(0.02, h - 0.4, len, '#B9C0CC', 0, 0.2, 0, { transparent: true, opacity: 0.35 }); mesh.position.set(x1 + dx / 2, h / 2 - 0.1, z1 + dz / 2); mesh.rotation.y = rot; mesh.castShadow = false; g.add(mesh);
    return g;
  };
  const wall = (x1, z1, x2, z2, h = 2.4, color = '#D8D4CC', t = 0.3) => { const dx = x2 - x1, dz = z2 - z1; const len = Math.hypot(dx, dz); const w = box(t, h, len, color, 0, 0, 0); w.position.set(x1 + dx / 2, h / 2, z1 + dz / 2); w.rotation.y = Math.atan2(dx, dz); return w; };

  /* ---------- Edificios ---------- */
  const windows = (w, h, d, x, y, z, rows, cols, color = '#9FC3E6', glow = false) => {
    const g = group(); const m = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.1, emissive: '#FFE7B8', emissiveIntensity: 0 });
    const gw = w / cols, gh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const pane = new THREE.Mesh(geo('BoxGeometry', gw * 0.62, gh * 0.55, 0.06), m); pane.position.set(x - w / 2 + gw * (c + 0.5), y + gh * (r + 0.5), z); if (glow) pane.userData.lampMesh = 0.32; g.add(pane);
    }
    g.userData.depth = d; return g;
  };
  const building = (w, h, d, x, z, color = '#E6E2DA', { floors = 1, cols = 6, glow = true, roofColor = '#B9B5AD' } = {}) => {
    const g = group(box(w, h, d, color, 0, 0, 0), box(w + 0.6, 0.3, d + 0.6, roofColor, 0, h, 0), box(w * 0.3, 1, d * 0.3, '#A8A49C', -w * 0.2, h + 0.3, -d * 0.15));
    g.add(windows(w, h, d, 0, 0.4, d / 2 + 0.04, floors, cols, '#9FC3E6', glow));
    const back = windows(w, h, d, 0, 0.4, -d / 2 - 0.04, floors, cols, '#9FC3E6', glow); g.add(back);
    const side = windows(d, h, w, 0, 0.4, 0, floors, Math.max(2, Math.round(cols * d / w)), '#9FC3E6', glow); side.rotation.y = Math.PI / 2; side.position.x = w / 2 + 0.04; g.add(side);
    const side2 = side.clone(); side2.position.x = -w / 2 - 0.04; g.add(side2);
    g.position.set(x, 0, z); return g;
  };
  const house = (x, z, w = 9, d = 8, color = '#EFE7D8', roof = '#9B5B3C', rot = 0) => {
    const g = group(box(w, 3.2, d, color, 0, 0, 0), windows(w, 3.2, d, 0, 0.6, d / 2 + 0.03, 1, 3, '#A9CBE8', true));
    const r = new THREE.Mesh(geo('ConeGeometry', Math.max(w, d) * 0.78, 2.4, 4), mat(roof)); r.rotation.y = Math.PI / 4; r.position.y = 3.2 + 1.2; r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); shadow(r); g.add(r);
    g.add(box(1.4, 2.2, 0.1, '#5B4636', 0, 0, d / 2 + 0.06));
    g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const warehouse = (w, h, d, x, z, color = '#CFD3D8', stripe = '#344AB2') => {
    const g = group(box(w, h, d, color, 0, 0, 0), box(w + 0.1, 0.8, d + 0.1, stripe, 0, h * 0.55, 0), box(w + 0.6, 0.35, d + 0.6, '#B4B9C2', 0, h, 0));
    const ridge = new THREE.Mesh(geo('CylinderGeometry', d / 2, d / 2, w, 3, 1, false, Math.PI / 2), mat('#B4B9C2')); ridge.rotation.z = Math.PI / 2; ridge.scale.set(0.22, 1, 1); ridge.position.y = h + 0.35 + d * 0.055; shadow(ridge); g.add(ridge);
    g.position.set(x, 0, z); return g;
  };
  const dockDoor = (x, y, z, open = false) => { const d = box(3.4, 3.6, 0.15, open ? '#1B2030' : '#8E97A8', x, y, z); return d; };
  const guardBooth = (x, z, rot = 0) => { const g = group(box(2.6, 2.6, 2.6, '#E8E4DC', 0, 0, 0), box(2.9, 0.2, 2.9, '#344AB2', 0, 2.6, 0), windows(2.6, 2.6, 2.6, 0, 0.9, 1.34, 1, 2, '#A9CBE8', true)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };

  /* ---------- Vehículos y personas ---------- */
  const wheel = (x, z) => { const w = cyl(0.36, 0.36, 0.3, '#1E1E22', x, 0, z, 10); w.rotation.z = Math.PI / 2; w.position.y = 0.36; return w; };
  const car = (color = '#B8362E', plate = 'AE 123 CD') => {
    const g = group(box(4.2, 0.7, 1.9, color, 0, 0.35, 0), box(2.2, 0.7, 1.7, '#D8E8F4', -0.2, 1.05, 0, { roughness: 0.25 }), wheel(1.35, 0.85), wheel(1.35, -0.85), wheel(-1.35, 0.85), wheel(-1.35, -0.85));
    const pl = box(0.5, 0.16, 0.04, '#F4F4F4', 2.1, 0.55, 0); pl.name = 'plate'; g.add(pl);
    const hood = box(1.4, 0.05, 1.7, color, 1.3, 1.05, 0); hood.userData.heat = 0.55; g.add(hood);
    g.add(box(0.2, 0.2, 0.3, '#FFF3C4', 2.05, 0.75, 0.6, { emissive: '#FFF3C4', emissiveIntensity: 0.6 }), box(0.2, 0.2, 0.3, '#FFF3C4', 2.05, 0.75, -0.6, { emissive: '#FFF3C4', emissiveIntensity: 0.6 }));
    g.userData.heat = 0.4; g.userData.plate = plate; return g;
  };
  const truck = (color = '#E2231A') => {
    const g = group(box(2.6, 2.4, 2.4, color, 3.0, 0.7, 0), box(1.2, 1.2, 2.2, '#CFE3F2', 3.9, 1.8, 0, { roughness: 0.25 }), box(6.5, 3.0, 2.5, '#F1F1F1', -1.6, 0.9, 0), box(9.5, 0.7, 2.3, '#3A3F4A', 0, 0.35, 0),
      wheel(3.6, 1.2), wheel(3.6, -1.2), wheel(-1, 1.2), wheel(-1, -1.2), wheel(-3.2, 1.2), wheel(-3.2, -1.2));
    g.children[0].userData.heat = 0.6; g.userData.heat = 0.35; return g;
  };
  const forklift = (color = '#F5B400') => { const g = group(box(1.6, 0.9, 1.2, color, 0, 0.3, 0), box(0.8, 1.3, 1.1, '#2A2E3A', -0.2, 1.2, 0), box(0.1, 2.2, 1.0, '#555A66', 1.0, 0.2, 0), box(1.1, 0.06, 0.15, '#555A66', 1.5, 0.25, 0.35), box(1.1, 0.06, 0.15, '#555A66', 1.5, 0.25, -0.35), wheel(0.5, 0.65), wheel(0.5, -0.65), wheel(-0.5, 0.65), wheel(-0.5, -0.65)); g.userData.heat = 0.45; return g; };
  const person = (shirt = '#3A6BD8', pants = '#2B2F3A') => {
    const g = group(cyl(0.16, 0.16, 0.8, pants, 0, 0, 0, 8), cyl(0.24, 0.2, 0.7, shirt, 0, 0.8, 0, 8), sph(0.19, '#E3B28A', 0, 1.72, 0), cyl(0.07, 0.07, 0.6, shirt, 0.3, 0.85, 0, 6), cyl(0.07, 0.07, 0.6, shirt, -0.3, 0.85, 0, 6));
    g.userData.heat = 0.88; return g;
  };
  const dog = () => { const g = group(box(0.7, 0.3, 0.28, '#8B6B4A', 0, 0.3, 0), sph(0.14, '#8B6B4A', 0.42, 0.55, 0), cyl(0.05, 0.05, 0.3, '#8B6B4A', 0.25, 0, 0.1, 5), cyl(0.05, 0.05, 0.3, '#8B6B4A', 0.25, 0, -0.1, 5), cyl(0.05, 0.05, 0.3, '#8B6B4A', -0.25, 0, 0.1, 5), cyl(0.05, 0.05, 0.3, '#8B6B4A', -0.25, 0, -0.1, 5)); g.userData.heat = 0.62; return g; };
  const pallet = (x, z, color = '#C8A060') => { const g = group(box(1.2, 0.14, 1.0, '#9A7A48', 0, 0, 0), box(1.1, 1.0, 0.9, color, 0, 0.14, 0), box(0.5, 0.4, 0.45, '#344AB2', 0.2, 1.14, 0.1)); g.position.set(x, 0, z); g.userData.heat = 0.14; return g; };
  const silobolsa = (x, z, l = 14, rot = 0) => { const s = new THREE.Mesh(geo('CapsuleGeometry', 1.3, l, 4, 10), mat('#F2F2F2', { roughness: 0.6 })); s.rotation.z = Math.PI / 2; s.rotation.y = rot; s.position.set(x, 1.15, z); s.scale.y = 0.85; shadow(s); return s; };

  /* ---------- Dispositivos Hikvision ---------- */
  const DEV = '#F4F5F7', DEV2 = '#DADDE3', LENS = '#0E1424';
  const camBullet = (color = DEV) => { const g = group(cyl(0.11, 0.13, 0.42, color, 0, 0, 0, 10), cyl(0.09, 0.09, 0.05, LENS, 0, 0.42, 0, 12, { roughness: 0.15 }), box(0.06, 0.16, 0.06, DEV2, 0, -0.16, 0)); g.children[0].rotation.x = Math.PI / 2; g.children[0].position.set(0, 0, 0.21); g.children[1].rotation.x = Math.PI / 2; g.children[1].position.set(0, 0, 0.45); g.children[2].position.set(0, 0.12, 0.05); const m = box(0.18, 0.04, 0.18, DEV2, 0, 0.2, 0); g.add(m); g.userData.heat = 0.22; return g; };
  const camTurret = (color = DEV) => { const g = group(cyl(0.16, 0.18, 0.08, DEV2, 0, 0, 0, 12), sph(0.15, color, 0, -0.02, 0), cyl(0.07, 0.07, 0.04, LENS, 0, 0, 0, 12, { roughness: 0.15 })); g.children[2].rotation.x = Math.PI / 2; g.children[2].position.set(0, -0.06, 0.13); g.userData.heat = 0.22; return g; };
  const camPTZ = (color = DEV, r = 0.28) => { const head = group(sph(r, color, 0, 0, 0, { roughness: 0.4 }), box(r * 0.9, r * 0.9, r * 1.3, color, 0, -r * 0.45, 0), cyl(r * 0.28, r * 0.28, 0.05, LENS, 0, 0, 0, 12, { roughness: 0.15 })); head.children[2].rotation.x = Math.PI / 2; head.children[2].position.set(0, 0, r * 1.05);
    const strobe = new THREE.Mesh(geo('BoxGeometry', r * 0.9, r * 0.25, 0.06), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0 })); strobe.position.set(0, r * 0.45, r * 1.02); strobe.name = 'strobe'; head.add(strobe);
    const g = group(cyl(0.06, 0.06, 0.5, DEV2, 0, 0, 0, 8), head); head.position.y = -0.1; head.name = 'head'; g.userData.heat = 0.25; return g; };
  const camThermal = (color = DEV) => { const g = camBullet(color); const l2 = cyl(0.06, 0.06, 0.05, '#3A2A1A', 0, 0, 0, 12); l2.rotation.x = Math.PI / 2; l2.position.set(0, -0.14, 0.43); g.add(l2); g.userData.heat = 0.24; return g; };
  const camSolar = (x, z, h = 4.5, rot = 0) => {
    const pole = cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8);
    const panel = box(1.4, 0.05, 0.9, '#1B2A55', 0, 0, 0, { roughness: 0.3, metalness: 0.3 }); panel.rotation.x = -0.45; panel.position.set(0, h + 0.2, -0.2); panel.name = 'panel';
    const batt = box(0.4, 0.5, 0.25, DEV2, 0, h - 1.4, 0.15);
    const cam = camBullet(); cam.position.set(0, h - 0.5, 0.25); cam.name = 'cam';
    const ant = cyl(0.015, 0.015, 0.5, '#2A2E3A', 0.3, h + 0.3, 0.2, 5);
    const g = group(pole, panel, batt, cam, ant); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const pole = (x, z, h = 4, color = '#8A8F9C') => { const p = cyl(0.07, 0.09, h, color, x, 0, z, 8); return p; };
  const mount = (x, y, z, dev, yaw = 0, pitch = -0.35) => { dev.position.set(x, y, z); dev.rotation.set(pitch, yaw, 0); return dev; };
  const radar = (x, z, h = 3) => {
    const body = box(0.5, 0.7, 0.16, DEV, 0, h - 0.35, 0); body.userData.heat = 0.2;
    const sweep = new THREE.Mesh(new THREE.CircleGeometry(1, 40, -0.55, 1.1), new THREE.MeshBasicMaterial({ color: '#344AB2', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })); sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.06; sweep.name = 'sweep'; sweep.userData.noSwap = true; sweep.visible = false;
    const beam = new THREE.Mesh(new THREE.CircleGeometry(1, 20, -0.09, 0.18), new THREE.MeshBasicMaterial({ color: '#8AA0FF', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })); beam.rotation.x = -Math.PI / 2; beam.position.y = 0.07; beam.name = 'beam'; beam.userData.noSwap = true; beam.visible = false;
    const g = group(cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8), body, sweep, beam); g.position.set(x, 0, z); return g;
  };
  const barrier = (x, z, rot = 0, len = 4.2) => {
    const arm = group(box(len, 0.12, 0.12, '#F4F4F4', len / 2, 0, 0)); for (let i = 0; i < 4; i++) arm.add(box(0.5, 0.13, 0.13, '#E2231A', 0.6 + i * 1.0, -0.005, 0)); arm.position.set(0.25, 1.0, 0); arm.name = 'arm';
    const g = group(box(0.5, 1.1, 0.4, '#F4F4F4', 0, 0, 0), box(0.5, 0.15, 0.4, '#E2231A', 0, 0.75, 0), arm); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const speedGate = (x, z, rot = 0) => {
    const wingMat = () => new THREE.MeshStandardMaterial({ color: '#BFE1F5', roughness: 0.15, transparent: true, opacity: 0.5 });
    const cab = (dx) => group(box(0.35, 1.05, 1.6, '#DADDE3', dx, 0, 0), box(0.37, 0.04, 1.62, '#344AB2', dx, 1.05, 0));
    const wingL = new THREE.Mesh(geo('BoxGeometry', 0.04, 0.9, 0.62), wingMat()); wingL.position.set(-0.5, 0.75, 0); wingL.name = 'wingL'; wingL.userData.pivot = 1;
    const wingR = wingL.clone(); wingR.material = wingMat(); wingR.position.x = 0.5; wingR.name = 'wingR';
    const led = new THREE.Mesh(geo('BoxGeometry', 0.3, 0.02, 1.2), new THREE.MeshStandardMaterial({ color: '#E2231A', emissive: '#E2231A', emissiveIntensity: 1.2 })); led.position.set(-0.68, 1.1, 0); led.name = 'led'; led.userData.noSwap = true;
    const g = group(cab(-0.68), cab(0.68), wingL, wingR, led); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const totem = (x, z, rot = 0) => {
    const screen = new THREE.Mesh(geo('BoxGeometry', 0.24, 0.32, 0.02), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#4A62D6', emissiveIntensity: 0.5 })); screen.position.set(0, 1.35, 0.06); screen.name = 'screen'; screen.userData.noSwap = true;
    const g = group(cyl(0.07, 0.1, 1.15, DEV2, 0, 0, 0, 8), box(0.3, 0.45, 0.08, DEV, 0, 1.15, 0), screen); g.position.set(x, 0, z); g.rotation.y = rot; return g;
  };
  const siren = (x, y, z) => { const s = new THREE.Mesh(geo('BoxGeometry', 0.3, 0.42, 0.12), new THREE.MeshStandardMaterial({ color: '#F4F5F7', emissive: '#E2231A', emissiveIntensity: 0 })); s.position.set(x, y, z); s.name = 'siren'; s.userData.noSwap = true; return s; };
  const rack = (x, z) => { const g = group(box(0.7, 1.9, 0.6, '#2A2E3A', 0, 0, 0)); for (let i = 0; i < 5; i++) { const led = new THREE.Mesh(geo('BoxGeometry', 0.5, 0.05, 0.02), new THREE.MeshStandardMaterial({ color: '#9FE3B6', emissive: '#3DD68C', emissiveIntensity: 1 })); led.position.set(0, 0.3 + i * 0.32, 0.31); led.userData.noSwap = true; g.add(led); } g.position.set(x, 0, z); g.userData.heat = 0.5; return g; };
  const nvrBox = (x, y, z) => { const g = group(box(0.5, 0.1, 0.4, '#1E2230', 0, 0, 0)); const led = new THREE.Mesh(geo('BoxGeometry', 0.03, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: '#3DD68C', emissive: '#3DD68C', emissiveIntensity: 1.5 })); led.position.set(0.2, 0.06, 0.21); led.userData.noSwap = true; g.add(led); g.position.set(x, y, z); g.userData.heat = 0.4; return g; };
  const screenPanel = (x, y, z, rot = 0) => { const s = new THREE.Mesh(geo('BoxGeometry', 1.6, 0.9, 0.06), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#2B47C4', emissiveIntensity: 0.6, roughness: 0.3 })); s.position.set(x, y, z); s.rotation.y = rot; s.userData.noSwap = true; return s; };
  const spot = (color = '#FFFFFF', intensity = 0, angle = 0.55, dist = 30) => { const l = new THREE.SpotLight(color, intensity, dist, angle, 0.5, 1.2); l.castShadow = false; return l; };
  const smoke = (x, z, h = 6) => { const g = group(); for (let i = 0; i < 6; i++) { const s = sph(0.8 + i * 0.35, '#8E8E92', 0, 1 + i * 1.1, 0, { transparent: true, opacity: 0.55 }); s.castShadow = false; s.userData.noSwap = false; s.userData.heat = 0.45 + i * 0.02; g.add(s); } g.position.set(x, 0, z); g.scale.set(0.001, 0.001, 0.001); g.name = 'smoke'; g.userData.heat = 0.5; return g; };
  const fire = (x, z) => { const g = group(cone(0.6, 1.4, '#FF6A00', 0, 0, 0, 6), cone(0.35, 1.0, '#FFD13D', 0, 0.2, 0, 6)); g.children.forEach(c => { c.material = mat('#FF6A00', { emissive: '#FF6A00', emissiveIntensity: 1.2 }); c.castShadow = false; }); g.position.set(x, 0, z); g.userData.heat = 1; g.scale.set(0.001, 0.001, 0.001); g.name = 'fire'; return g; };
  const line = (a, b, color = '#FF3B30') => { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color })); return l; };
  const zone = (w, d, x, z, color = '#E2231A', opacity = 0.18) => { const m = plane(w, d, color, x, 0.05, z, { transparent: true, opacity }); m.material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }); m.receiveShadow = false; m.userData.noSwap = true; return m; };

  return { mat, box, cyl, sph, cone, plane, group, ground, road, sidewalk, tree, pine, bush, lampPost, fence, wall, windows, building, house, warehouse, dockDoor, guardBooth, car, truck, forklift, person, dog, pallet, silobolsa, camBullet, camTurret, camPTZ, camThermal, camSolar, pole, mount, radar, barrier, speedGate, totem, siren, rack, nvrBox, screenPanel, spot, smoke, fire, line, zone };
}
