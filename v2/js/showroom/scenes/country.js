/* =====================================================================
   Escena 2 — Barrios cerrados y countries
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'country',
  camera: { pos: [48, 30, 62], target: [0, 1, 4], maxDistance: 140 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(220, '#86B56F'));
    // Perímetro
    const F = 42, Fz = 32;
    add(L.fence(-F, -Fz, F, -Fz, 2.4), L.fence(-F, Fz, -6, Fz, 2.4), L.fence(6, Fz, F, Fz, 2.4), L.fence(-F, -Fz, -F, Fz, 2.4), L.fence(F, -Fz, F, Fz, 2.4));
    // Calles
    add(L.road(8, 84, 0, 8), L.road(8, 70, 0, -8, Math.PI / 2), L.road(8, 70, 0, 20, Math.PI / 2));
    // Plaza central
    add(L.plane(14, 10, '#9CC98A', 0, 0.03, 6)); add(L.tree(-4, 5, 1.3), L.tree(4, 7, 1.1), L.bush(2, 3), L.bush(-3, 8.5));
    // Casas
    const houses = [[-22, -22], [-8, -22], [10, -22], [24, -22], [-22, 0], [22, 0], [-22, 32 - 22], [-8, 32 - 22 + 4], [12, 30 - 22 + 6], [24, 32 - 22]];
    houses.forEach(([x, z], i) => { add(L.house(x, z, 9 + (i % 3), 8 + (i % 2) * 2, ['#EFE7D8', '#E8DCC8', '#F1EDE4'][i % 3], ['#9B5B3C', '#7A5A4A', '#8A6A5A'][i % 3], z < 0 ? 0 : Math.PI)); add(L.tree(x + 6, z + (z < 0 ? 5 : -5), 1 + (i % 2) * 0.3)); });
    for (let x = -38; x <= 38; x += 9) { add(L.tree(x, -29, 1.1)); add(L.tree(x, 29.5, 1.0)); }
    // Luminarias
    [[-14, 12, Math.PI / 2], [14, 12, -Math.PI / 2], [-14, -4, Math.PI / 2], [14, -4, -Math.PI / 2], [-30, 24, 0], [30, 24, Math.PI]].forEach(([x, z, r]) => add(L.lampPost(ctx, x, z, 5, r)));
    // Pórtico de acceso (sur): garita, barrera, ANPR, intercom
    add(L.guardBooth(6.5, 34.5, Math.PI)); add(L.wall(-6, 31.8, -6, 37, 2.6, '#E1DDD5'), L.wall(6, 31.8, 6, 37, 2.6, '#E1DDD5'));
    add(L.box(14, 0.5, 5.5, '#B9B5AD', 0, 5.2, 34.4)); add(L.cyl(0.25, 0.3, 5.2, '#B9B5AD', -6.5, 0, 36.8), L.cyl(0.25, 0.3, 5.2, '#B9B5AD', 6.5, 0, 36.8));
    const barrier = add(L.barrier(-3.6, 34, 0, 7)); const arm = barrier.getObjectByName('arm');
    const lpr = add(L.mount(-5.6, 4.6, 36.9, L.camBullet(), 0, -0.3));
    const intercom = add(L.totem(5.2, 32.2, Math.PI)); add(L.mount(6.6, 4.6, 36.9, L.camTurret(), -Math.PI * 0.85, -0.45));
    // TandemVu + radar en esquina NO
    add(L.pole(-38, -28, 6)); const tandem = add(L.mount(-38, 6.1, -28, L.camPTZ('#F4F5F7', 0.34), 0, 0)); const tHead = tandem.getObjectByName('head'); const tStrobe = tandem.getObjectByName('strobe');
    const tLight = L.spot('#FFFFFF', 0, 0.35, 60); tLight.position.set(-38, 6, -28); add(tLight, tLight.target); tLight.target.position.set(-20, 0.5, -34);
    const radar = add(L.radar(-28, -28.5, 3.6)); const sweep = radar.getObjectByName('sweep'), beam = radar.getObjectByName('beam');
    // HeatPro en cerco norte + línea virtual
    add(L.pole(12, -30.5, 4)); const heat = add(L.mount(12, 4.1, -30.5, L.camThermal(), -Math.PI / 2, -0.28));
    const vline = add(L.zone(28, 0.25, -4, -31.2, '#FF3B30', 0.55)); vline.visible = false;
    // PanoVu en plaza + cámara disuasiva en casa
    add(L.pole(0, 1.5, 6.5)); const pano = add(L.mount(0, 6.6, 1.5, L.camTurret('#F4F5F7'), 0, -0.9)); pano.scale.setScalar(1.6);
    const deter = add(L.mount(22 - 6, 3.3, 5.2, L.camBullet(), Math.PI, -0.4)); const dStrobe = L.siren(22 - 5.4, 3.3, 5.2); add(dStrobe);
    // Actores
    const car = add(L.car('#2B2F3A', 'AD 456 FG')); car.position.set(-3.6 + 1.6, 0, 52); car.rotation.y = Math.PI / 2;
    const car2 = add(L.car('#B8362E')); car2.position.set(-2, 0, 60); car2.rotation.y = Math.PI / 2;
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;
    const walker = add(L.person('#5B7A2B', '#2B2F3A')); walker.visible = false;
    const dog = add(L.dog()); dog.visible = false;
    const guest = add(L.person('#D19A3A', '#2B2F3A')); guest.position.set(8, 0, 31); guest.visible = false;
    const resident = add(L.person('#3A6BD8')); resident.position.set(-10, 0, 12);
    add(L.car('#DDDDDD')).position.set(20, 0, -14);

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
