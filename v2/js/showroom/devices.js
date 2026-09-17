/* =====================================================================
   devices — modelos low-poly fieles de los dispositivos Hikvision.
   Escala ~2x sobre el tamaño real para que se lean a 40 m de distancia.
   Convención: el lente mira hacia +z; origen en el punto de montaje.
   Cada builder devuelve un Group con userData.dynamic (no se fusiona) y
   sub-partes nombradas que usan las escenas: head, strobe, screen, led,
   arm, wingL/wingR, panel, cam, sweep, beam.
   ===================================================================== */
export function makeDevices(THREE, L) {
  const { box, rbox, cyl, sph, group, mat } = L;
  const WHITE = '#F2F3F5', WHITE2 = '#E4E6EA', BLACK = '#15181E', GLASS = '#0B1020', IRW = '#2A1418', LEDW = '#FFF6E0', STEEL = '#C9CDD3', DARK = '#2A2E3A', HIK = '#E2231A';
  const glass = (r, len = 0.02) => cyl(r, r, len, GLASS, 0, 0, 0, 16, { roughness: 0.08, metalness: 0.35, flat: false });
  const badge = (x, y, z, w = 0.05) => box(w, w * 0.36, 0.004, HIK, x, y, z);
  const emis = (color, w, h, d, x, y, z, intensity = 0.4) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 })); m.position.set(x, y, z); m.userData.noSwap = true; return m; };
  const dyn = (g, heat = 0.24) => { g.userData.dynamic = true; g.userData.heat = heat; return g; };
  const face = (obj, dir) => { obj.lookAt(obj.position.clone().add(dir)); return obj; }; // orienta +z local hacia dir

  /* Soporte de pared: placa + brazo + rótula. El brazo llega al punto (0, yJoint, 0). */
  const wallBracket = (yJoint = 0.12, len = 0.16) => {
    const g = group(rbox(0.13, 0.13, 0.02, WHITE, 0, yJoint - 0.065, -len - 0.01, { r: 0.02 }), cyl(0.018, 0.018, len, WHITE, 0, 0, 0, 10), sph(0.032, WHITE, 0, yJoint, 0));
    g.children[1].rotation.x = Math.PI / 2; g.children[1].position.set(0, yJoint, -len / 2); return g;
  };

  /* ---------- Bullet (2CD2xx7G2H / ColorVu / Hybrid) ---------- */
  const camBullet = (color = WHITE, { leds = 'hybrid' } = {}) => {
    const body = cyl(0.078, 0.082, 0.34, color, 0, 0, 0, 16); body.rotation.x = Math.PI / 2; body.position.set(0, 0, 0.03);
    const collar = cyl(0.09, 0.088, 0.07, color, 0, 0, 0, 16); collar.rotation.x = Math.PI / 2; collar.position.set(0, 0, 0.215);
    const front = cyl(0.08, 0.08, 0.012, BLACK, 0, 0, 0, 16); front.rotation.x = Math.PI / 2; front.position.set(0, 0, 0.255);
    const lens = glass(0.03, 0.02); lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.01, 0.265);
    const ring = cyl(0.04, 0.04, 0.006, '#3A3F48', 0, 0, 0, 16); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.01, 0.262);
    const ledL = emis(leds === 'ir' ? IRW : LEDW, 0.03, 0.05, 0.008, -0.05, 0.005, 0.263, leds === 'ir' ? 0 : 0.35), ledR = emis(leds === 'ir' ? IRW : LEDW, 0.03, 0.05, 0.008, 0.05, 0.005, 0.263, leds === 'ir' ? 0 : 0.35);
    const shade = rbox(0.19, 0.014, 0.24, color, 0, 0.085, 0.09, { r: 0.006 });
    const rear = cyl(0.07, 0.055, 0.045, color, 0, 0, 0, 16); rear.rotation.x = Math.PI / 2; rear.position.set(0, 0, -0.16);
    const g = group(body, collar, front, lens, ring, ledL, ledR, shade, rear, badge(0, 0.1, 0.2), wallBracket(0.12, 0.17));
    g.userData.leds = [ledL, ledR]; return dyn(g, 0.22);
  };
  /* ---------- Turret / eyeball (2CD23x7G2H) ---------- */
  const camTurret = (color = WHITE, { leds = 'colorvu' } = {}) => {
    const base = cyl(0.2, 0.21, 0.05, color, 0, -0.05, 0, 20);
    const ball = sph(0.175, color, 0, -0.12, 0, { seg: 16, flat: false });
    const dir = new THREE.Vector3(0, -0.4, 0.92).normalize();
    const faceG = group(cyl(0.115, 0.115, 0.018, BLACK, 0, 0, 0, 20), glass(0.036, 0.016), cyl(0.045, 0.045, 0.004, '#3A3F48', 0, 0, 0, 16), emis(leds === 'ir' ? IRW : LEDW, 0.05, 0.03, 0.006, -0.065, 0, 0.01, 0.35), emis(leds === 'ir' ? IRW : LEDW, 0.05, 0.03, 0.006, 0.065, 0, 0.01, 0.35), box(0.012, 0.012, 0.004, BLACK, 0, -0.07, 0.01));
    faceG.children[0].rotation.x = Math.PI / 2; faceG.children[1].rotation.x = Math.PI / 2; faceG.children[1].position.z = 0.012; faceG.children[2].rotation.x = Math.PI / 2; faceG.children[2].position.z = 0.01;
    faceG.position.copy(dir.clone().multiplyScalar(0.165)).add(new THREE.Vector3(0, -0.12, 0)); face(faceG, dir);
    const g = group(base, ball, faceG, badge(0, -0.05, 0.19, 0.04)); return dyn(g, 0.22);
  };
  /* ---------- Speed dome PTZ (2DE7A / DarkFighterX) y TandemVu (2SF8C / 2SE7C) ---------- */
  const camPTZ = (color = WHITE, r = 0.28, { tandem = false, wiper = false } = {}) => {
    const cap = cyl(r * 0.6, r * 0.62, r * 0.55, color, 0, r * 0.75, 0, 18);
    const neck = cyl(r * 0.5, r * 0.5, r * 0.25, DARK, 0, r * 0.55, 0, 18);
    const head = group(sph(r, color, 0, 0, 0, { seg: 18, flat: false }));
    const win = rbox(r * 1.15, r * 0.55, r * 0.35, BLACK, 0, -r * 0.05, r * 0.72, { r: r * 0.08 }); head.add(win);
    const lens = glass(r * 0.22, 0.02); lens.rotation.x = Math.PI / 2; lens.position.set(0, -r * 0.05, r * 0.9); head.add(lens);
    const ir1 = emis(IRW, r * 0.28, r * 0.28, 0.01, -r * 0.4, -r * 0.05, r * 0.9, 0), ir2 = emis(IRW, r * 0.28, r * 0.28, 0.01, r * 0.4, -r * 0.05, r * 0.9, 0); head.add(ir1, ir2);
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(r * 0.8, r * 0.14, 0.02), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0 })); strobe.position.set(0, -r * 0.38, r * 0.86); strobe.name = 'strobe'; strobe.userData.noSwap = true; head.add(strobe);
    head.add(badge(0, r * 0.45, r * 0.85, r * 0.16));
    if (wiper) { const w = box(0.012, r * 0.9, 0.012, DARK, 0, 0, 0); w.position.set(r * 0.5, -r * 0.05, r * 0.92); w.rotation.z = -0.5; head.add(w); }
    if (tandem) { // módulo panorámico fijo sobre el cabezal
      const pano = group(rbox(r * 1.7, r * 0.5, r * 1.0, color, 0, 0, 0, { r: r * 0.1 }), rbox(r * 1.7, r * 0.5, r * 0.02, BLACK, 0, 0, r * 0.5, { r: 0.01 }));
      [-r * 0.45, r * 0.45].forEach(x => { const l = glass(r * 0.16, 0.02); l.rotation.x = Math.PI / 2; l.position.set(x, 0, r * 0.52); pano.add(l); });
      pano.position.set(0, r * 0.95, r * 0.25); head.add(pano); cap.position.y = r * 1.35; neck.position.y = r * 1.15;
    }
    head.position.y = 0; head.name = 'head';
    const g = group(cap, neck, head); return dyn(g, 0.25);
  };
  /* ---------- HeatPro bullet biespectral (2TD2628 / 2TD2617) ---------- */
  const camThermal = (color = WHITE) => {
    const body = rbox(0.3, 0.15, 0.36, color, 0, -0.075, 0.02, { r: 0.05 });
    const front = rbox(0.28, 0.13, 0.012, BLACK, 0, -0.065, 0.2, { r: 0.02 });
    const tLens = glass(0.05, 0.024); tLens.rotation.x = Math.PI / 2; tLens.position.set(-0.07, 0, 0.212); const tRing = cyl(0.06, 0.06, 0.006, '#3A3F48', 0, 0, 0, 16); tRing.rotation.x = Math.PI / 2; tRing.position.set(-0.07, 0, 0.207);
    const oLens = glass(0.03, 0.02); oLens.rotation.x = Math.PI / 2; oLens.position.set(0.075, 0.015, 0.212);
    const led = emis(LEDW, 0.04, 0.025, 0.006, 0.075, -0.035, 0.208, 0.35);
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.06), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0 })); strobe.position.set(0, 0.012, 0.16); strobe.name = 'strobe'; strobe.userData.noSwap = true;
    const spk = box(0.1, 0.03, 0.006, DARK, 0, -0.14, 0.205);
    const shade = rbox(0.33, 0.014, 0.3, color, 0, 0.005, 0.06, { r: 0.006 });
    const g = group(body, front, tLens, tRing, oLens, led, strobe, spk, shade, badge(0, -0.02, 0.21), wallBracket(0.14, 0.18)); return dyn(g, 0.24);
  };
  /* ---------- Bullet ANPR DeepinView (iDS-2CD7A46G0/P) ---------- */
  const camANPR = (color = WHITE) => {
    const body = rbox(0.17, 0.16, 0.44, color, 0, -0.08, 0.02, { r: 0.02 });
    const front = rbox(0.15, 0.14, 0.012, BLACK, 0, -0.07, 0.245, { r: 0.015 });
    const lens = glass(0.048, 0.024); lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.015, 0.256);
    const ir = emis(IRW, 0.13, 0.03, 0.006, 0, -0.06, 0.252, 0);
    const shade = rbox(0.21, 0.014, 0.4, color, 0, 0.005, 0.1, { r: 0.006 });
    const g = group(body, front, lens, ir, shade, badge(0, -0.02, 0.25), wallBracket(0.14, 0.2)); return dyn(g, 0.24);
  };
  /* ---------- PanoVu 4 sensores (2CD6944) ---------- */
  const camPanoVu = (color = WHITE) => {
    const top = cyl(0.36, 0.36, 0.06, color, 0, -0.06, 0, 24); const body = cyl(0.34, 0.3, 0.2, color, 0, -0.26, 0, 24); const dome = sph(0.3, color, 0, -0.26, 0, { seg: 18, flat: false }); dome.scale.y = 0.55;
    const g = group(top, body, dome, badge(0, -0.12, 0.35, 0.05));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const dir = new THREE.Vector3(Math.sin(a), -0.5, Math.cos(a)).normalize(); const w = group(cyl(0.075, 0.075, 0.016, BLACK, 0, 0, 0, 16), glass(0.032, 0.016)); w.children[0].rotation.x = Math.PI / 2; w.children[1].rotation.x = Math.PI / 2; w.children[1].position.z = 0.012; w.position.copy(dir.clone().multiplyScalar(0.3)).add(new THREE.Vector3(0, -0.24, 0)); face(w, dir); g.add(w); }
    return dyn(g, 0.22);
  };
  /* ---------- PTZ térmica biespectral en horquilla (2TD4237) ---------- */
  const thermalPTZ = (color = WHITE) => {
    const base = cyl(0.24, 0.26, 0.24, color, 0, 0, 0, 20); const plate = cyl(0.2, 0.2, 0.05, DARK, 0, 0.24, 0, 20);
    const armL = rbox(0.05, 0.36, 0.24, color, -0.24, 0.29, 0, { r: 0.02 }), armR = rbox(0.05, 0.36, 0.24, color, 0.24, 0.29, 0, { r: 0.02 });
    const head = group(rbox(0.42, 0.26, 0.34, color, 0, 0, 0, { r: 0.03 }), rbox(0.4, 0.24, 0.012, BLACK, 0, 0, 0.17, { r: 0.02 }), rbox(0.44, 0.014, 0.3, color, 0, 0.14, 0.04, { r: 0.006 }), badge(0, 0.09, 0.18, 0.06));
    const tl = glass(0.065, 0.024); tl.rotation.x = Math.PI / 2; tl.position.set(-0.1, 0.01, 0.18); const tr = cyl(0.075, 0.075, 0.006, '#3A3F48', 0, 0, 0, 16); tr.rotation.x = Math.PI / 2; tr.position.set(-0.1, 0.01, 0.175);
    const ol = glass(0.04, 0.02); ol.rotation.x = Math.PI / 2; ol.position.set(0.1, 0.01, 0.18);
    head.add(tl, tr, ol); head.position.set(0, 0.47, 0); head.name = 'head';
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0 })); strobe.position.set(0, -0.09, 0.18); strobe.name = 'strobe'; strobe.userData.noSwap = true; head.add(strobe);
    const g = group(base, plate, armL, armR, head); return dyn(g, 0.25);
  };
  /* ---------- Radar de seguridad DS-PR1 ---------- */
  const radar = (x, z, h = 3) => {
    const body = rbox(0.4, 0.56, 0.1, WHITE, 0, h - 0.6, 0, { r: 0.06 }); body.rotation.x = -0.12; body.userData.heat = 0.2;
    const br = box(0.06, 0.2, 0.08, DARK, 0, h - 0.42, -0.08);
    const sweep = new THREE.Mesh(new THREE.CircleGeometry(1, 40, -0.55, 1.1), new THREE.MeshBasicMaterial({ color: '#344AB2', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })); sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.06; sweep.name = 'sweep'; sweep.userData.noSwap = true; sweep.visible = false;
    const beam = new THREE.Mesh(new THREE.CircleGeometry(1, 20, -0.09, 0.18), new THREE.MeshBasicMaterial({ color: '#8AA0FF', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })); beam.rotation.x = -Math.PI / 2; beam.position.y = 0.07; beam.name = 'beam'; beam.userData.noSwap = true; beam.visible = false;
    const g = group(cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8), body, br, sweep, beam, badge(0, h - 0.4, 0.052, 0.06)); g.position.set(x, 0, z); return dyn(g, 0.2);
  };
  /* ---------- Barrera vehicular DS-TMG4B0 ---------- */
  const barrier = (x, z, rot = 0, len = 4.2) => {
    const cab = rbox(0.4, 1.06, 0.34, WHITE, 0, 0, 0, { r: 0.03 }); const cap = rbox(0.44, 0.09, 0.38, DARK, 0, 1.06, 0, { r: 0.03 });
    const led = emis(HIK, 0.3, 0.03, 0.01, 0, 0.98, 0.175, 1.2); led.name = 'led';
    const door = box(0.3, 0.7, 0.004, WHITE2, 0, 0.45, 0.172);
    const arm = group(rbox(len, 0.11, 0.11, '#F4F4F4', len / 2, 0, 0, { r: 0.03 })); for (let i = 0; i < Math.floor(len / 1); i++) arm.add(box(0.45, 0.115, 0.115, HIK, 0.7 + i * 1.0, -0.002, 0)); arm.add(cyl(0.09, 0.09, 0.14, DARK, 0, 0.055, 0, 12)); arm.children[arm.children.length - 1].rotation.x = Math.PI / 2; arm.children[arm.children.length - 1].position.set(0.1, 0.055, 0);
    arm.position.set(0.22, 0.86, 0); arm.name = 'arm';
    const g = group(cab, cap, led, door, arm, badge(0, 0.8, 0.172, 0.08)); g.position.set(x, 0, z); g.rotation.y = rot; return dyn(g, 0.2);
  };
  /* ---------- Speed gate / swing barrier DS-K3B961TX ---------- */
  const speedGate = (x, z, rot = 0) => {
    const steel = { roughness: 0.35, metalness: 0.6, flat: false };
    const cab = (dx) => { const c = group(rbox(0.36, 1.0, 1.5, STEEL, dx, 0, 0, { r: 0.03, ...steel }), rbox(0.38, 0.05, 1.52, DARK, dx, 1.0, 0, { r: 0.02 }), box(0.34, 0.01, 1.3, '#2A2E3A', dx, 1.05, 0));
      const ok = emis('#3DD68C', 0.18, 0.012, 0.18, dx, 1.06, 0.55, 1.0), no = emis(HIK, 0.18, 0.012, 0.18, dx, 1.06, -0.55, 1.0); c.add(ok, no);
      const term = group(rbox(0.1, 0.16, 0.03, WHITE, 0, 0, 0, { r: 0.01 }), emis('#4A62D6', 0.08, 0.12, 0.004, 0, -0.01, 0.017, 0.5)); term.position.set(dx, 1.12, 0.62); term.rotation.x = -0.6; c.add(term);
      return c; };
    const wingMat = () => new THREE.MeshStandardMaterial({ color: '#BFE1F5', roughness: 0.12, transparent: true, opacity: 0.45 });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.9, 0.62), wingMat()); wingL.position.set(-0.5, 0.72, 0); wingL.name = 'wingL';
    const wingR = wingL.clone(); wingR.material = wingMat(); wingR.position.x = 0.5; wingR.name = 'wingR';
    const led = emis(HIK, 0.3, 0.02, 1.2, -0.68, 1.09, 0, 1.2); led.name = 'led';
    const g = group(cab(-0.68), cab(0.68), wingL, wingR, led, badge(-0.5, 0.6, 0.76, 0.06)); g.position.set(x, 0, z); g.rotation.y = rot; return dyn(g, 0.2);
  };
  /* ---------- Terminal MinMoe (DS-K1T671M) en pedestal ---------- */
  const minmoe = ({ stand = true, big = true } = {}) => {
    const w = big ? 0.28 : 0.22, h = big ? 0.46 : 0.36;
    const body = rbox(w, h, 0.05, WHITE, 0, 0, 0, { r: 0.02 }); const front = rbox(w - 0.02, h - 0.02, 0.008, BLACK, 0, 0.01, 0.026, { r: 0.015 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, h * 0.62, 0.004), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#4A62D6', emissiveIntensity: 0.5 })); screen.position.set(0, h * 0.42 - 0.02, 0.032); screen.name = 'screen'; screen.userData.noSwap = true;
    const cam1 = glass(0.012, 0.006), cam2 = glass(0.012, 0.006); [cam1, cam2].forEach((c, i) => { c.rotation.x = Math.PI / 2; c.position.set(-0.03 + i * 0.06, h * 0.9 - 0.02, 0.034); });
    const ir = emis(IRW, 0.05, 0.012, 0.004, 0, h * 0.9 - 0.02, 0.032, 0);
    const fp = big ? rbox(0.05, 0.04, 0.006, '#3A3F48', w * 0.28, 0.06, 0.03, { r: 0.01 }) : null;
    const dev = group(body, front, screen, cam1, cam2, ir, fp, badge(0, 0.02, 0.031, 0.05)); dev.position.y = stand ? 1.25 : 0; dev.rotation.x = -0.12;
    const g = group(dev); if (stand) g.add(cyl(0.035, 0.05, 1.05, WHITE2, 0, 0, 0, 12), cyl(0.16, 0.18, 0.02, DARK, 0, 0, 0, 20));
    g.name = 'minmoe'; return dyn(g, 0.3);
  };
  const totem = (x, z, rot = 0) => { const g = minmoe({ stand: true }); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
  /* ---------- Frente de calle TalkVu (DS-KD8003 modular / KV6113) ---------- */
  const intercom = ({ modular = true } = {}) => {
    const body = rbox(0.14, modular ? 0.42 : 0.28, 0.05, modular ? '#4A4F58' : WHITE, 0, 0, 0, { r: 0.015, roughness: 0.4, metalness: 0.5, flat: false });
    const camWin = rbox(0.1, 0.09, 0.008, BLACK, 0, (modular ? 0.13 : 0.08), 0.026, { r: 0.01 }); const lens = glass(0.02, 0.008); lens.rotation.x = Math.PI / 2; lens.position.set(0, (modular ? 0.13 : 0.08), 0.031);
    const btn = cyl(0.025, 0.025, 0.01, WHITE2, 0, modular ? -0.02 : -0.06, 0.03, 16); btn.rotation.x = Math.PI / 2;
    const scr = emis('#4A62D6', 0.09, 0.06, 0.004, 0, -0.12, 0.028, 0.5); scr.name = 'screen';
    const g = group(body, camWin, lens, btn, modular ? scr : null, badge(0, modular ? -0.18 : -0.11, 0.028, 0.045)); return dyn(g, 0.28);
  };
  /* ---------- AX PRO: sirena exterior, hub, PIR-Cam ---------- */
  const siren = (x, y, z) => {
    const m = new THREE.MeshStandardMaterial({ color: WHITE, emissive: HIK, emissiveIntensity: 0 });
    const s = new THREE.Mesh(L.geo ? L.geo('Rounded', 0.3, 0.3, 0.09, 2, 0.04) : new THREE.BoxGeometry(0.3, 0.3, 0.09), m); s.castShadow = true;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.01), m); strip.position.set(0.1, 0, 0.048); s.add(strip);
    const grille = box(0.16, 0.16, 0.006, WHITE2, -0.03, 0, 0.047); s.add(grille, badge(-0.03, -0.11, 0.05, 0.05));
    s.position.set(x, y, z); s.name = 'siren'; s.userData.noSwap = true; s.userData.dynamic = true; return s;
  };
  const axHub = () => dyn(group(rbox(0.32, 0.32, 0.05, WHITE, 0, 0, 0, { r: 0.04 }), emis('#3DD68C', 0.12, 0.006, 0.004, 0, 0.1, 0.027, 0.8), badge(0, -0.1, 0.027, 0.06)), 0.3);
  const pirCam = () => { const g = group(rbox(0.11, 0.16, 0.09, WHITE, 0, 0, 0, { r: 0.03 }), rbox(0.08, 0.1, 0.01, WHITE2, 0, -0.01, 0.046, { r: 0.02 })); const l = glass(0.012, 0.006); l.rotation.x = Math.PI / 2; l.position.set(0, 0.055, 0.05); g.add(l, badge(0, -0.065, 0.048, 0.035)); return dyn(g, 0.25); };
  /* ---------- NVR / DVR, switch, rack, monitor ---------- */
  const nvrBox = (x, y, z) => {
    const g = group(rbox(0.52, 0.09, 0.44, '#1B1E26', 0, 0, 0, { r: 0.01 }), rbox(0.52, 0.09, 0.02, '#23272F', 0, 0, 0.215, { r: 0.008 }));
    [['#3DD68C', 0.2], ['#3DD68C', 0.17], ['#4A62D6', 0.14]].forEach(([c, x]) => g.add(emis(c, 0.012, 0.012, 0.004, x, 0.06, 0.226, 1.5)));
    g.add(box(0.1, 0.03, 0.004, '#3A3F48', -0.15, 0.045, 0.226), badge(0.02, 0.045, 0.226, 0.05)); g.position.set(x, y, z); return dyn(g, 0.4);
  };
  const rack = (x, z) => {
    const g = group(rbox(0.72, 2.0, 0.66, '#23272F', 0, 0, 0, { r: 0.03 }), box(0.6, 1.8, 0.004, '#15181E', 0, 0.1, 0.331));
    const unit = (y, h, c) => { g.add(rbox(0.6, h, 0.02, c, 0, y, 0.33, { r: 0.006 })); };
    unit(1.55, 0.09, '#1B1E26'); for (let i = 0; i < 10; i++) g.add(emis(i < 8 ? '#3DD68C' : '#FFB703', 0.02, 0.014, 0.004, -0.22 + i * 0.045, 1.6, 0.345, 1.2)); // switch PoE
    unit(1.3, 0.12, '#1B1E26'); g.add(emis('#3DD68C', 0.012, 0.012, 0.004, 0.22, 1.36, 0.345, 1.5), badge(0.1, 1.36, 0.345, 0.05)); // NVR
    unit(1.05, 0.09, '#2E323B'); for (let i = 0; i < 12; i++) g.add(box(0.03, 0.03, 0.004, '#4A4F58', -0.25 + i * 0.045, 1.1, 0.345)); // patchera
    unit(0.4, 0.5, '#1B1E26'); g.add(emis('#4A62D6', 0.02, 0.02, 0.004, 0.2, 0.7, 0.345, 1)); // UPS
    g.position.set(x, 0, z); return dyn(g, 0.5);
  };
  const screenPanel = (x, y, z, rot = 0) => { const g = group(rbox(1.66, 0.96, 0.05, '#1B1E26', 0, -0.48, 0, { r: 0.02 })); const s = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.86, 0.01), new THREE.MeshStandardMaterial({ color: '#0E1424', emissive: '#2B47C4', emissiveIntensity: 0.6, roughness: 0.3 })); s.position.set(0, 0, 0.03); s.userData.noSwap = true; g.add(s, cyl(0.03, 0.03, 0.3, '#2A2E3A', 0, -0.78, -0.05, 8), box(0.4, 0.02, 0.2, '#2A2E3A', 0, -0.8, -0.05)); g.position.set(x, y, z); g.rotation.y = rot; return dyn(g, 0.35); };
  /* ---------- Kit solar 4G (DS-2XS…) ---------- */
  const camSolar = (x, z, h = 4.5, rot = 0, { ptz = false } = {}) => {
    const pole = cyl(0.07, 0.09, h, '#8A8F9C', 0, 0, 0, 8);
    const panel = group(rbox(1.5, 0.05, 1.0, WHITE2, 0, -0.03, 0, { r: 0.01 }), rbox(1.42, 0.03, 0.92, '#1B2A55', 0, 0.02, 0, { r: 0.005, roughness: 0.25, metalness: 0.35 }));
    for (let i = 1; i < 6; i++) panel.add(box(0.008, 0.01, 0.9, WHITE2, -0.71 + i * 0.237, 0.05, 0)); for (let i = 1; i < 4; i++) panel.add(box(1.4, 0.01, 0.008, WHITE2, 0, 0.05, -0.46 + i * 0.23));
    panel.rotation.x = -0.45; panel.position.set(0, h + 0.25, -0.25); panel.name = 'panel';
    const mast = box(0.06, 0.6, 0.06, '#8A8F9C', 0, h - 0.1, -0.2);
    const batt = group(rbox(0.4, 0.55, 0.28, WHITE, 0, 0, 0, { r: 0.03 }), emis('#3DD68C', 0.01, 0.01, 0.004, 0.12, 0.42, 0.142, 1.2), badge(0, 0.2, 0.142, 0.06)); batt.position.set(0, h - 1.5, 0.12); batt.name = 'batt';
    const cam = ptz ? camPTZ(WHITE, 0.2) : camBullet(WHITE); cam.position.set(0, h - 0.55, 0.28); cam.name = 'cam';
    const ant1 = cyl(0.012, 0.012, 0.45, DARK, 0.14, h - 1.0, 0.16, 6), ant2 = cyl(0.012, 0.012, 0.45, DARK, -0.14, h - 1.0, 0.16, 6);
    const g = group(pole, mast, panel, batt, cam, ant1, ant2); g.position.set(x, 0, z); g.rotation.y = rot; return dyn(g, 0.25);
  };
  /* ---------- Checkpoint velocidad: cámara box + radar (iDS-TCM403 + radar) ---------- */
  const checkpoint = () => {
    const camG = group(rbox(0.18, 0.16, 0.42, WHITE, 0, 0, 0, { r: 0.02 }), rbox(0.16, 0.14, 0.012, BLACK, 0, 0, 0.215, { r: 0.015 }), rbox(0.22, 0.014, 0.4, WHITE, 0, 0.09, 0.08, { r: 0.006 }), badge(0, 0.04, 0.22, 0.05));
    const lens = glass(0.05, 0.024); lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.01, 0.226); camG.add(lens); camG.position.x = -0.17;
    const rad = group(rbox(0.26, 0.34, 0.06, WHITE, 0, 0, 0, { r: 0.04 }), badge(0, -0.12, 0.032, 0.05)); rad.position.set(0.2, 0, 0.05); rad.rotation.x = -0.1;
    const bar = box(0.6, 0.05, 0.05, DARK, 0, 0.13, -0.1);
    const g = group(camG, rad, bar, wallBracket(0.16, 0.2)); return dyn(g, 0.24);
  };
  /* ---------- Dashcam (AE-DC5313) ---------- */
  const dashcam = () => { const g = group(rbox(0.16, 0.05, 0.05, BLACK, 0, 0, 0, { r: 0.012 })); const l = glass(0.02, 0.01); l.rotation.x = Math.PI / 2; l.position.set(0.03, 0, 0.028); g.add(l, emis('#4A62D6', 0.05, 0.02, 0.004, -0.04, 0, -0.026, 0.6)); return dyn(g, 0.3); };

  return { camBullet, camTurret, camPTZ, camThermal, camANPR, camPanoVu, thermalPTZ, radar, barrier, speedGate, minmoe, totem, intercom, siren, axHub, pirCam, nvrBox, rack, screenPanel, camSolar, checkpoint, dashcam, wallBracket };
}
