/* =====================================================================
   Escena 2 — Barrios cerrados y countries
   Identidad: barrio residencial cálido — terracota, cremas, mucho verde,
   piletas, plaza con laguna, gente paseando al perro, palmeras al sol.
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'country',
  camera: { pos: [50, 30, 66], target: [0, 1, 6], maxDistance: 150 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(280, '#8CBB70', { color2: '#6E9F55', amount: 0.24, scale: 0.045 }));
    const F = 42, Fz = 32;

    /* ---- Perímetro: cerco + seto interior + pinos exteriores ---- */
    add(L.fence(-F, -Fz, F, -Fz, 2.4), L.fence(-F, Fz, -6, Fz, 2.4), L.fence(6, Fz, F, Fz, 2.4), L.fence(-F, -Fz, -F, Fz, 2.4), L.fence(F, -Fz, F, Fz, 2.4));
    add(L.hedge(2 * F - 4, 0, -Fz + 1.2, Math.PI / 2, 1.3), L.hedge(2 * Fz - 4, -F + 1.2, 0, 0, 1.3), L.hedge(2 * Fz - 4, F - 1.2, 0, 0, 1.3));
    for (let x = -60; x <= 60; x += 11) { add(L.pine(x, -50, 1.8 + (Math.abs(x) % 4) * 0.25)); add(L.tree(x + 5, 52, 1.5)); }
    for (let z = -40; z <= 40; z += 12) { add(L.pine(-62, z, 2)); add(L.pine(62, z + 6, 1.9)); }
    // Lomas suaves en el horizonte
    [[-120, -120, 90], [110, -130, 110], [140, 60, 80], [-140, 90, 100]].forEach(([x, z, r]) => { const h = L.sph(r, '#7FAE63', x, -r * 0.82, z, { flat: false, seg: 14 }); h.castShadow = false; add(h); });

    /* ---- Calles internas con cordones y veredas ---- */
    add(L.road(8, 84, 0, 8, 0, '#4A4E57'), L.road(8, 70, 0, -8, Math.PI / 2, '#4A4E57'), L.road(8, 70, 0, 20, Math.PI / 2, '#4A4E57'));
    add(L.curb(84, -4.3, 8, 0), L.curb(84, 4.3, 8, 0), L.curb(70, 0, -12.3, Math.PI / 2), L.curb(70, 0, -3.7, Math.PI / 2), L.curb(70, 0, 15.7, Math.PI / 2), L.curb(70, 0, 24.3, Math.PI / 2));
    add(L.zebra(8, 0, -16, 0), L.zebra(8, 0, 28, 0));
    [[-14, 12, Math.PI / 2], [14, 12, -Math.PI / 2], [-14, -4, Math.PI / 2], [14, -4, -Math.PI / 2], [-30, 24, 0], [30, 24, Math.PI], [-30, -12, 0], [30, -12, Math.PI]].forEach(([x, z, r]) => add(L.lampPost(ctx, x, z, 5, r)));

    /* ---- Plaza central: laguna, bancos, juegos, canteros ---- */
    add(L.plane(16, 12, '#9CCB88', 0, 0.03, 6)); add(L.pond(3.2, 2.2, -3, 5));
    add(L.tree(4.5, 3, 1.3), L.palm(5, 9.5, 1.1), L.bush(2, 3), L.bush(-6.5, 8.8), L.flowerbed(2.4, 1.2, 4, 11.2), L.bench(1, 9.6, 0), L.bench(-6.5, 3, Math.PI / 2), L.bin(6.8, 9.6));
    add(L.rbox(0.3, 1.8, 0.3, '#FFB703', 3, 0, 6.2, { r: 0.05 }), L.rbox(0.3, 1.8, 0.3, '#FFB703', 5, 0, 6.2, { r: 0.05 }), L.box(2.4, 0.1, 0.1, '#E2231A', 4, 1.8, 6.2)); // hamacas
    const slide = L.box(0.5, 0.1, 2.4, '#3A6BD8', 6.5, 0, 4.2); slide.rotation.x = -0.5; slide.position.y = 0.6; add(slide, L.rbox(0.6, 1.2, 0.6, '#FFB703', 6.5, 0, 3.2, { r: 0.05 }));

    /* ---- Casas con jardines, piletas, autos en entradas ---- */
    const houses = [[-22, -22], [-8, -22], [10, -22], [24, -22], [-22, 0], [22, 0], [-22, 10], [-8, 14], [12, 14], [24, 10]];
    const pal = [['#F1E6D2', '#9B5B3C'], ['#E8DCC8', '#7A5A4A'], ['#F4EFE6', '#B3573E'], ['#EADFCF', '#8A6A5A'], ['#F3EAD9', '#A0522D']];
    houses.forEach(([x, z], i) => {
      const [wc, rc] = pal[i % pal.length]; const front = z < 0 ? 0 : Math.PI;
      add(L.house(x, z, 9 + (i % 3), 8 + (i % 2) * 2, wc, rc, front));
      const dzF = z < 0 ? 6.5 : -6.5; // frente → calle
      add(L.plane(3.2, 5, '#CFCAC0', x + 3.5, 0.03, z + dzF * 0.75)); // entrada de auto
      if (i % 2 === 0) { const c = add(L.car(L.pick(['#DDDDDD', '#2B2F3A', '#B8362E', '#3A6BD8', '#F5B400']))); c.position.set(x + 3.5, 0, z + dzF * 0.75); c.rotation.y = Math.PI / 2; }
      add(L.tree(x + 6, z - dzF * 0.9, 1 + (i % 2) * 0.3), L.bush(x - 4.5, z + dzF * 0.7, 0.9), L.flowerbed(2, 1, x - 2.5, z + dzF * 0.72));
      if (i % 3 === 1) { add(L.pond(2.4, 1.4, x - 1, z - dzF * 0.95)); add(L.palm(x + 3, z - dzF * 1.1, 0.9), L.umbrella(x - 3.5, z - dzF * 0.95, L.pick(['#E2231A', '#344AB2', '#FFB703']))); }
      add(L.hedge(8, x + 6.3, z, 0, 0.8));
    });

    /* ---- Pórtico de acceso (sur): garita, barrera, ANPR, intercom, banderas ---- */
    add(L.guardBooth(6.5, 34.5, Math.PI)); add(L.wall(-6, 31.8, -6, 37, 2.6, '#E1DDD5'), L.wall(6, 31.8, 6, 37, 2.6, '#E1DDD5'));
    add(L.rbox(14, 0.5, 5.5, '#B9B5AD', 0, 5.2, 34.4, { r: 0.06 }), L.cyl(0.25, 0.3, 5.2, '#B9B5AD', -6.5, 0, 36.8), L.cyl(0.25, 0.3, 5.2, '#B9B5AD', 6.5, 0, 36.8));
    add(L.rbox(5, 0.9, 0.2, '#344AB2', 0, 5.75, 37.2, { r: 0.05 }), L.box(3, 0.24, 0.05, '#FFFFFF', 0, 6.1, 37.32));
    const barrier = add(L.barrier(-3.6, 34, 0, 7)); const arm = barrier.getObjectByName('arm');
    const lpr = add(L.mount(-5.6, 4.6, 36.9, L.camBullet(), 0, -0.3));
    const intercom = add(L.totem(5.2, 32.2, Math.PI)); add(L.mount(6.6, 4.6, 36.9, L.camTurret(), -Math.PI * 0.85, -0.45));
    add(L.flag(ctx, -8, 38.5, ['#344AB2', '#FFFFFF'], 6), L.flag(ctx, 8, 38.5, ['#FFB703', '#FFFFFF'], 6), L.planter(-7.2, 33), L.planter(7.6, 36.5), L.bollard(-1, 38.5), L.bollard(1, 38.5));
    add(L.road(8, 30, -2, 47, 0, '#4A4E57'), L.curb(30, -6.3, 47, 0), L.curb(30, 2.3, 47, 0), L.sidewalk(3, 30, 4, 47, 0));

    /* ---- Dispositivos perimetrales ---- */
    add(L.pole(-38, -28, 6)); const tandem = add(L.mount(-38, 6.1, -28, L.camPTZ('#F4F5F7', 0.34), 0, 0)); const tHead = tandem.getObjectByName('head'); const tStrobe = tandem.getObjectByName('strobe');
    const tLight = L.spot('#FFFFFF', 0, 0.35, 60); tLight.position.set(-38, 6, -28); add(tLight, tLight.target); tLight.target.position.set(-20, 0.5, -34);
    const radar = add(L.radar(-28, -28.5, 3.6)); const sweep = radar.getObjectByName('sweep'), beam = radar.getObjectByName('beam');
    add(L.pole(12, -30.5, 4)); const heat = add(L.mount(12, 4.1, -30.5, L.camThermal(), -Math.PI / 2, -0.28));
    const vline = add(L.zone(28, 0.25, -4, -31.2, '#FF3B30', 0.55)); vline.visible = false;
    add(L.pole(0, 1.5, 6.5)); const pano = add(L.mount(0, 6.6, 1.5, L.camTurret('#F4F5F7'), 0, -0.9)); pano.scale.setScalar(1.6);
    const deter = add(L.mount(16, 3.3, 5.2, L.camBullet(), Math.PI, -0.4)); const dStrobe = L.siren(16.6, 3.3, 5.2); add(dStrobe);

    /* ---- Actores ---- */
    const car = add(L.car('#2B2F3A', 'AD 456 FG')); car.position.set(-2, 0, 52); car.rotation.y = Math.PI / 2;
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;
    const walker = add(L.person('#5B7A2B', '#2B2F3A')); walker.visible = false;
    const dog = add(L.dog()); dog.visible = false;
    const guest = add(L.person('#D19A3A', '#2B2F3A')); guest.visible = false;
    const resident = add(L.person('#3A6BD8')); resident.position.set(-10, 0, 12);

    /* ---- Vida ambiente ---- */
    L.loopPath(ctx, add(L.car('#F1F1F1')), [[-30, 6], [30, 6], [30, 22], [-30, 22]], { speed: 6 });
    L.loopPath(ctx, add(L.car('#3A6BD8')), [[-2, 44], [-2, -10], [-30, -10], [-30, 10], [-2, 10]], { speed: 5 });
    const stroller = add(L.person('#EE6FA5', '#2B2F3A')); L.loopPath(ctx, stroller, [[-3, 14.6], [14, 14.6], [14, 26], [-3, 26]], { speed: 1.4, bob: true });
    const pet = add(L.dog()); L.loopPath(ctx, pet, [[-1.5, 15.4], [15.5, 15.4], [15.5, 25.2], [-1.5, 25.2]], { speed: 1.4 });
    const jogger = add(L.person('#FFB703', '#1A1C24')); L.loopPath(ctx, jogger, [[-20, -14.6], [20, -14.6], [20, -2], [-20, -2]], { speed: 3.2, bob: true });
    const kid = add(L.person('#E2231A', '#3A6BD8')); kid.scale.setScalar(0.7); kid.position.set(4, 0, 7.4); L.idle(ctx, kid, 0.12);
    const reader = add(L.person('#6B6464', '#2B2F3A')); reader.position.set(1, 0, 9.0); L.idle(ctx, reader);
    add(L.birds(ctx, 0, 0, 60, 32, 7));

    let tracking = null; let sweepAngle = 0;
    ctx.tick((dt) => {
      if (sweep.visible) { sweepAngle += dt * 1.4; sweep.rotation.z = -sweepAngle; }
      if (tracking) { const p = tracking.getWorldPosition(new THREE.Vector3()); tHead.parent.lookAt(p.x, 6, p.z); tLight.target.position.copy(p); const r = radar.position; beam.rotation.z = Math.atan2(-(p.z - r.z), p.x - r.x); }
    });
    const reset = () => { tracking = null; sweep.visible = false; beam.visible = false; sweep.scale.setScalar(1); tStrobe.material.emissiveIntensity = 0; tLight.intensity = 0; car.position.set(-2, 0, 52); car.rotation.y = Math.PI / 2; arm.rotation.z = 0; intruder.visible = walker.visible = dog.visible = guest.visible = false; vline.visible = false; dStrobe.material.emissiveIntensity = 0; tandem.rotation.set(0, 0, 0); };

    return {
      hotspots: [
        { id: 'country_tandemvu', target: tandem, offsetY: 0.9, offset: [7, 3, 7] },
        { id: 'country_radar', target: radar, offsetY: 4.2, offset: [6, 3, 6] },
        { id: 'country_heatpro', target: heat, offsetY: 0.7, offset: [5, 2.5, 6] },
        { id: 'country_lpr', target: lpr, offsetY: 0.7, offset: [6, 3, 7] },
        { id: 'country_panovu', target: pano, offsetY: 0.9, offset: [5, 3, 6] },
        { id: 'country_deter', target: deter, offsetY: 0.7, offset: [-5, 2.5, 5] },
        { id: 'country_intercom', target: intercom, offsetY: 1.9, offset: [4, 2, -5] },
      ],
      actions: [
        { id: 'radar', icon: S.radar, label: 'Intrusión nocturna: radar + TandemVu', desc: 'El radar barre 120 m, detecta el vector y la PTZ gira, enciende strobe y sigue al objetivo.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([-28, 1, -30], [16, 9, 14], 1.6);
            sweep.visible = true; sweep.scale.setScalar(18); sweep.rotation.set(-Math.PI / 2, 0, 0);
            intruder.visible = true; intruder.position.set(-4, 0, -36);
            const w = path(ctx, intruder, [[-16, -35], [-26, -34.5]], { speed: 2.2, bob: true });
            await wait(2200);
            beam.visible = true; beam.scale.setScalar(20); beam.rotation.set(-Math.PI / 2, 0, 0);
            ctx.tag(radar, tagHTML(S.radar, 'Radar: objetivo 74 m', 'Vector 1,9 m/s · regla perímetro N', 'warn'), { ttl: 3600, offsetY: 4.3 });
            tracking = intruder;
            await wait(900);
            ctx.gsap.to(tLight, { intensity: 320, duration: 0.3 }); strobe(ctx, tStrobe, { times: 16, period: 0.2, on: 4 });
            ctx.feed({ from: tandem, lookAt: intruder, mode: 'color', fov: 18, label: 'TandemVu · Smart tracking' });
            ctx.tag(intruder, tagHTML(S.alert, 'Humano · seguimiento activo', 'TandemVu: PTZ 42x + panorámica', 'danger'), { ttl: 4200, offsetY: 2.3 });
            await done(w); await wait(700);
            const back = path(ctx, intruder, [[-2, -38]], { speed: 4.5, bob: true }); await done(back);
            intruder.visible = false; tracking = null; ctx.gsap.to(tLight, { intensity: 0, duration: 0.8 }); sweep.visible = beam.visible = false; ctx.feedOff();
          } },
        { id: 'lpr', icon: S.car, label: 'Pórtico vehicular ANPR', desc: 'Patente, marca y color en <100 ms; la barrera sube con el auto en movimiento.',
          async run() {
            reset(); ctx.focus([-2, 1, 36], [12, 6, 10], 1.5);
            ctx.feed({ from: lpr, lookAt: [-2, 0.5, 46], mode: 'color', fov: 40, label: 'CAM ANPR · Pórtico' });
            const d = path(ctx, car, [[-2, 40.5]], { speed: 5, ease: 'power1.out' }); await wait(1200);
            ctx.tag(car, `<span class="plate">AD 456 FG</span><span class="tag-tx"><b>Residente · lote 14</b><small>SUV · gris · 92 ms</small></span>`, { ttl: 3800, offsetY: 1.9, cls: 'plate-tag' });
            ctx.gsap.to(arm.rotation, { z: 1.45, duration: 1.1, ease: 'power2.inOut' }); await done(d);
            const d2 = path(ctx, car, [[-2, 24], [-2, 14]], { speed: 5, ease: 'power1.inOut' }); await wait(1800); ctx.gsap.to(arm.rotation, { z: 0, duration: 1.2 }); await done(d2); ctx.feedOff();
          } },
        { id: 'thermal', icon: S.thermo, label: 'Filtro térmico HeatPro', desc: 'Un perro no dispara la alarma; un humano cruza la línea virtual y sí.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-2, 1, -31], [10, 5, 12], 1.5); vline.visible = true;
            ctx.feed({ from: heat, lookAt: [-8, 0.6, -32], mode: 'th', fov: 40, label: 'HeatPro · Perímetro norte' });
            dog.visible = true; dog.position.set(-14, 0, -36);
            const d = path(ctx, dog, [[-6, -31], [2, -27]], { speed: 3 }); await wait(1500);
            ctx.tag(dog, tagHTML(S.check, 'Animal · sin alarma', 'Clasificación térmica + IA', 'ok'), { ttl: 2800, offsetY: 1 });
            await done(d); dog.visible = false;
            walker.visible = true; walker.position.set(-20, 0, -36);
            const w = path(ctx, walker, [[-10, -31], [-6, -28]], { speed: 2.2, bob: true }); await wait(2000);
            ctx.tag(walker, tagHTML(S.alert, 'Cruce de línea · humano', 'VCA HeatPro → alarma a guardia', 'danger'), { ttl: 3600, offsetY: 2.3 });
            ctx.tag(heat, tagHTML(S.bell, 'Alarma perimetral', 'Strobe + audio de disuasión', 'danger'), { ttl: 3200, offsetY: 0.9 });
            await done(w); await wait(600); const b = path(ctx, walker, [[-22, -37]], { speed: 4, bob: true }); await done(b); walker.visible = false; ctx.feedOff(); vline.visible = false;
          } },
        { id: 'pano', icon: S.eye, label: 'Vista PanoVu 180°', desc: 'Cuatro sensores en un domo cubren toda la plaza sin puntos ciegos.',
          async run() { reset(); ctx.focus([0, 1, 6], [8, 5, 12], 1.4); ctx.feed({ from: [0, 6.4, 1.5], lookAt: [0, 0.4, 14], mode: 'color', fov: 115, label: 'PanoVu 4 × 4 MP · Plaza' }); ctx.tag(pano, tagHTML(S.eye, 'Cobertura 180°', 'Conteo y mapa de calor en NVR', 'ok'), { ttl: 3600, offsetY: 1 }); const w = path(ctx, resident, [[-4, 10], [5, 3], [12, 6]], { speed: 2.2, bob: true }); await done(w); const b = path(ctx, resident, [[-10, 12]], { speed: 2.4, bob: true }); await done(b); } },
        { id: 'deter', icon: S.bell, label: 'Disuasión activa AcuSense', desc: 'Detecta humano en el patio de noche: luz estroboscópica y mensaje de voz.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([18, 1, 8], [-8, 5, 9], 1.5);
            ctx.feed({ from: deter, lookAt: [16, 0.5, 14], mode: 'cv', fov: 60, label: 'CAM patio · AcuSense' });
            intruder.visible = true; intruder.position.set(8, 0, 18); const w = path(ctx, intruder, [[15, 12]], { speed: 2, bob: true }); await done(w);
            ctx.tag(deter, tagHTML(S.mic, '"Zona privada, retírese"', 'Audio + strobe automáticos', 'danger'), { ttl: 3600, offsetY: 0.9 });
            strobe(ctx, dStrobe, { times: 12, period: 0.2, on: 3 }); await wait(900);
            const b = path(ctx, intruder, [[6, 20]], { speed: 4.5, bob: true }); await done(b); intruder.visible = false; ctx.feedOff();
          } },
        { id: 'intercom', icon: S.door, label: 'Visita en el pórtico (TalkVu)', desc: 'El residente atiende desde el celular y abre remoto; queda registro con foto.',
          async run() {
            reset(); ctx.focus([5.2, 1, 32.5], [5, 3, 7], 1.4); guest.visible = true; guest.position.set(9, 0, 40);
            const w = path(ctx, guest, [[6.4, 34.5]], { speed: 2.2, bob: true }); await done(w);
            ctx.tag(intercom, tagHTML(S.door, 'Llamada → Hik-Connect', 'Residente lote 14 · video 2 MP HDR', 'warn'), { ttl: 3200, offsetY: 1.9 });
            await wait(2400); ctx.tag(intercom, tagHTML(S.check, 'Apertura remota', 'Registro con foto · 18:42', 'ok'), { ttl: 3000, offsetY: 1.9 });
            const w2 = path(ctx, guest, [[6.4, 28], [8, 22]], { speed: 2.2, bob: true }); await done(w2); guest.visible = false;
          } },
      ],
      reset,
    };
  },
};
