/* =====================================================================
   Escena 4 — Agro, campos y parcelas remotas
   Identidad: campo argentino — lotes dorados y verdes, casco con galpón
   y molino, tanque australiano, vacas, rollos, tractor trabajando,
   pájaros y horizonte con arboledas.
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'agro',
  camera: { pos: [56, 32, 62], target: [2, 1, -4], maxDistance: 170 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(360, '#B2BE6E', { color2: '#8FA34F', amount: 0.28, scale: 0.035 }));

    /* ---- Lotes cultivados (franjas con colores de distintos cultivos) ---- */
    const crops = ['#8FA84E', '#BFCB6E', '#D9B65A', '#7E9C45', '#C9A64F'];
    for (let i = 0; i < 11; i++) add(L.plane(74, 3.4, crops[i % 2 ? 0 : 1], 32, 0.02, -56 + i * 4.6));
    for (let i = 0; i < 9; i++) add(L.plane(3.4, 64, crops[i % 2 ? 3 : 2], -68 + i * 4.6, 0.02, 22));
    for (let i = 0; i < 8; i++) add(L.plane(60, 3.4, crops[i % 2 ? 4 : 1], 36, 0.02, 34 + i * 4.6));
    // Lomas y arboledas en el horizonte
    [[-160, -150, 110], [140, -170, 130], [180, 80, 100], [-180, 120, 120]].forEach(([x, z, r]) => { const h = L.sph(r, '#8FB06A', x, -r * 0.84, z, { flat: false, seg: 14 }); h.castShadow = false; add(h); });
    for (let x = -100; x <= 100; x += 12) add(L.pine(x, -110, 2.4 + (Math.abs(x) % 3) * 0.4)); for (let z = -100; z <= 100; z += 12) add(L.pine(-125, z, 2.4));
    for (let x = -90; x <= 90; x += 16) add(L.tree(x + 4, 96, 2.0));

    /* ---- Camino de tierra, tranquera, alambrado ---- */
    add(L.road(6, 190, 10, 0, Math.PI / 2, '#B08D5E', { dashed: false, edge: false })); add(L.road(5, 60, -30, -20, 0, '#B08D5E', { dashed: false, edge: false }));
    add(L.fence(85, -80, 85, -4, 1.4, '#7A5A3A', { mesh: false }), L.fence(85, 4, 85, 80, 1.4, '#7A5A3A', { mesh: false }));
    const gate = add(L.fence(85, -4, 85, 4, 1.4, '#A88650', { mesh: false })); gate.userData.dynamic = true; add(L.sign(87, -6, -Math.PI / 2, '#6B6464'));
    add(L.fence(-70, 40, 70, 40, 1.3, '#7A5A3A', { mesh: false }));
    for (let i = 0; i < 12; i++) add(L.rock(L.rnd(-60, 80), L.rnd(-50, 30), L.rnd(0.6, 1.6)));

    /* ---- Casco: casa con galería, galpón, molino, tanque australiano ---- */
    add(L.house(-34, -22, 11, 9, '#F3EDE0', '#7A5A4A', Math.PI / 2)); add(L.plane(14, 12, '#CBB89A', -34, 0.025, -10));
    add(L.warehouse(18, 6, 12, -34, -2, '#C9C3B4', '#7A5A3A')); add(L.rbox(4.5, 4.5, 0.2, '#1B2030', -34, 0, 4.1, { r: 0.05 })); // portón abierto
    add(L.tractor('#E2231A')).position.set(-30, 0, 2.5); add(L.rbox(2.4, 1.4, 1.2, '#F5B400', -26, 0, 3, { r: 0.1 }), L.crateStack(-40, 5, 3), L.hayBale(-38, 8), L.hayBale(-40.5, 8.2));
    add(L.waterTank(-22, -26)); add(L.windmill(ctx, -16, -28, 9)); add(L.cyl(1.2, 1.2, 4.5, '#8A8F9C', -22, 0, -34, 10), L.cyl(1.4, 1.4, 1.4, '#B4B9C2', -22, 4.5, -34, 10));
    add(L.flag(ctx, -42, -14, ['#75AADB', '#FFFFFF'], 7)); add(L.bench(-30, -16, Math.PI), L.umbrella(-27, -16, '#E2231A'), L.flowerbed(3, 1.4, -38, -16), L.dog()).position.set(-28, 0, -13);
    [[-46, -30], [-46, -12], [-40, 10], [-28, 12], [-14, -30], [-48, 2], [-20, 14]].forEach(([x, z]) => add(L.tree(x, z, 1.7)));
    add(L.palm(-24, -8, 1.2), L.palm(-44, -6, 1.0));

    /* ---- Potrero con vacas, rollos y bebedero ---- */
    add(L.fence(-70, 44, -70, 90, 1.3, '#7A5A3A', { mesh: false }), L.fence(-70, 90, 0, 90, 1.3, '#7A5A3A', { mesh: false }), L.fence(0, 44, 0, 90, 1.3, '#7A5A3A', { mesh: false }));
    add(L.plane(70, 46, '#9DB562', -35, 0.02, 67));
    for (let i = 0; i < 8; i++) add(L.cow(L.rnd(-62, -8), L.rnd(50, 84), L.rnd(0, 6.28)));
    add(L.pond(3.5, 2.5, -20, 70), L.hayBale(-56, 52), L.hayBale(-53.5, 52.3), L.hayBale(-51, 52), L.hayBale(-54, 53.8), L.tree(-60, 80, 2.2), L.tree(-12, 86, 1.8));

    /* ---- Silobolsas + línea virtual ---- */
    const silos = [[22, 16, 0], [22, 22, 0], [22, 28, 0]].map(([x, z, r]) => add(L.silobolsa(x, z, 16, r)));
    add(L.plane(26, 20, '#B9A981', 22, 0.02, 22));
    const zone = add(L.zone(26, 0.3, 22, 11.5, '#FF3B30', 0.6)); zone.visible = false;

    /* ---- Dispositivos ---- */
    const solar = add(L.camSolar(8, 12, 4.6, Math.PI * 0.75)); const panel = solar.getObjectByName('panel'); const solarCam = solar.getObjectByName('cam');
    const sStrobe = L.siren(0, 3.5, 0.32); solar.add(sStrobe); const sLight = L.spot('#FFFFFF', 0, 0.5, 30); sLight.position.set(8, 4.2, 12); add(sLight, sLight.target); sLight.target.position.set(22, 0.5, 8);
    add(L.pole(-24, -8, 9)); const ptz = add(L.mount(-24, 9.1, -8, L.camPTZ('#F2F3F5', 0.36, { wiper: true }), 0, 0));
    add(L.cyl(0.4, 0.6, 12, '#8A8F9C', -40, 0, -34, 6), L.box(1.2, 0.2, 1.2, '#8A8F9C', -40, 12, -34)); const tptz = add(L.mount(-40, 12.2, -34, L.thermalPTZ(), 0, 0));
    const radar = add(L.radar(4, -22, 4)); const sweep = radar.getObjectByName('sweep'), beam = radar.getObjectByName('beam');
    const dish = (x, y, z, r) => { const d = L.rbox(0.6, 0.6, 0.08, '#F4F5F7', x, y, z, { r: 0.04 }); d.rotation.y = r; return d; };
    const link1 = add(dish(-26, 6.4, -2, Math.PI / 2)); add(dish(-40, 5.4, -22, -Math.PI / 2)); add(L.cyl(0.05, 0.05, 1.2, '#4A4F66', -26, 6, -2, 6), L.cyl(0.05, 0.05, 1.2, '#4A4F66', -40, 5, -22, 6));
    const smoke = add(L.smoke(70, -78, 8)); const fire = add(L.fire(70, -78));
    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE9A8', fog: false })); sunBall.userData.noSwap = true; sunBall.position.set(60, 70, -40); add(sunBall);
    add(L.lampPost(ctx, -30, -12, 5, Math.PI / 2));

    /* ---- Actores ---- */
    const pickup = add(L.car('#2B2F3A', 'AC 321 KL')); pickup.position.set(10, 0, 50); pickup.rotation.y = Math.PI / 2; pickup.visible = false;
    const farmer = add(L.person('#7A5A3A', '#2B2F3A')); farmer.position.set(-28, 0, 5); L.idle(ctx, farmer);
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;

    /* ---- Vida ambiente ---- */
    L.loopPath(ctx, add(L.tractor('#3E7A3A')), [[24, -56], [70, -56], [70, -44], [24, -44], [24, -35], [70, -35]], { speed: 2.2, pause: 1 });
    L.loopPath(ctx, add(L.car('#F1F1F1')), [[10, 92], [10, -20], [10, -92]], { speed: 6.5, pause: 3 });
    const gaucho = add(L.person('#FFB703', '#5B4636')); L.loopPath(ctx, gaucho, [[-40, 46], [-14, 46], [-14, 62], [-40, 62]], { speed: 1.2, bob: true, pause: 2 });
    add(L.birds(ctx, 0, 0, 80, 36, 7), L.birds(ctx, -30, 30, 50, 28, 4));

    let tracking = null, sweepAngle = 0, tptzTrack = null;
    ctx.tick((dt) => {
      if (sweep.visible) { sweepAngle += dt * 1.2; sweep.rotation.z = -sweepAngle; }
      if (tracking) { const p = tracking.getWorldPosition(new THREE.Vector3()); ptz.lookAt(p.x, 9, p.z); const r = radar.position; beam.rotation.z = Math.atan2(-(p.z - r.z), p.x - r.x); }
      if (tptzTrack) tptz.lookAt(tptzTrack.x, 12, tptzTrack.z);
    });
    const reset = () => { tracking = null; tptzTrack = null; sweep.visible = beam.visible = false; smoke.scale.setScalar(0.001); fire.scale.setScalar(0.001); pickup.visible = false; pickup.position.set(10, 0, 50); pickup.rotation.y = Math.PI / 2; intruder.visible = false; zone.visible = false; sStrobe.material.emissiveIntensity = 0; sLight.intensity = 0; ptz.rotation.set(0, 0, 0); tptz.rotation.set(0, 0, 0); ptz.getObjectByName('strobe').material.emissiveIntensity = 0; };

    return {
      hotspots: [
        { id: 'agro_solar', target: solar, offsetY: 5.4, offset: [6, 3, 6] },
        { id: 'agro_ptz', target: ptz, offsetY: 0.9, offset: [7, 3, 7] },
        { id: 'agro_fire', target: tptz, offsetY: 0.9, offset: [7, 3, 8] },
        { id: 'agro_line', target: silos[1], offsetY: 2.2, offset: [10, 5, 10] },
        { id: 'agro_radar', target: radar, offsetY: 4.6, offset: [6, 3, 6] },
        { id: 'agro_bridge', target: link1, offsetY: 0.8, offset: [6, 3, 6] },
      ],
      actions: [
        { id: 'solar', icon: S.sun, label: 'Monitoreo off-grid autónomo', desc: 'Panel 80 W + batería de litio + 4G: sin cables, sin red, con alertas al celular.',
          async run() {
            reset(); ctx.focus([8, 3, 12], [6, 3, 6], 1.5);
            ctx.step(1, 3, 'Kit solar autónomo: panel de 80 W, batería 360 Wh y cámara con 4G. Sin zanja, sin tendido eléctrico.');
            const st = { h: 7, b: 61 };
            const tg = ctx.tag(solar, `<span class="tag-ic ok">${S.battery}</span><span class="tag-tx"><b>Batería 61 % · 07:00</b><small>4G −71 dBm · consumo 1,9 W</small></span>`, { ttl: 0, offsetY: 5.6 });
            const b = tg.el.querySelector('b'), sm = tg.el.querySelector('small'); ctx.log('info', 'Cámara solar online · 4G', 'Batería 61 % · 07:00'); let mid = false;
            const tw = ctx.gsap.to(st, { h: 18, b: 96, duration: 7, ease: 'none', onUpdate: () => {
              const a = (st.h - 7) / 11; panel.rotation.x = -0.9 + a * 0.9; panel.rotation.z = (a - 0.5) * 0.8;
              sunBall.position.set(60 - a * 120, 40 + Math.sin(a * Math.PI) * 40, -40); ctx.viewer.sun.position.copy(sunBall.position).multiplyScalar(0.8);
              b.textContent = `Batería ${st.b.toFixed(0)} % · ${String(Math.floor(st.h)).padStart(2, '0')}:${String(Math.floor((st.h % 1) * 60)).padStart(2, '0')}`; sm.textContent = `4G −71 dBm · carga ${(a * 38 + 4).toFixed(0)} W · panel 80 W`;
              if (!mid && a > 0.45) { mid = true; ctx.step(2, 3, 'Bajo consumo: la cámara duerme y despierta por PIR o por pedido desde la app; el panel sigue al sol.'); ctx.log('ok', 'Carga máxima 42 W', 'Mediodía · batería 82 %'); }
            } }); ctx.tween(tw);
            await wait(7200); tg.remove(); ctx.viewer.sun.position.set(48, 56, 30); sunBall.position.set(60, 70, -40);
            ctx.step(3, 3, 'Autonomía de 7 días sin sol: aguanta una semana de lluvia sin apagarse.');
            ctx.tag(solar, tagHTML(S.check, 'Autonomía 7 días sin sol', 'Batería 360 Wh · modo bajo consumo', 'ok'), { ttl: 3200, offsetY: 5.6 }); ctx.log('ok', 'Batería 96 % al atardecer', 'Autonomía estimada: 7 días'); await wait(2600);
          } },
        { id: 'fire', icon: S.flame, label: 'Foco ígneo a gran distancia', desc: 'La PTZ térmica patrulla el horizonte, detecta el calor a 2,4 km y fija coordenadas.',
          async run() {
            reset(); ctx.focus([-40, 8, -34], [14, 8, 16], 1.6);
            ctx.step(1, 4, 'La PTZ térmica patrulla presets sobre el horizonte: detecta anomalías de calor hasta 3 km, de día o de noche.');
            const cone = ctx.cone(tptz, { fov: 12, aspect: 1.5, far: 90, color: '#FF6A00', opacity: 0.08 });
            ctx.log('info', 'PTZ térmica · patrulla preset 1–6', 'Detección de fuego a 3 km'); await wait(1200);
            ctx.gsap.to(smoke.scale, { x: 1, y: 1, z: 1, duration: 3, ease: 'power2.out' }); ctx.gsap.to(fire.scale, { x: 1, y: 1, z: 1, duration: 3, delay: 0.6 });
            await wait(1800);
            ctx.step(2, 4, 'Anomalía térmica detectada a 2,4 km en el lote vecino: la PTZ se orienta sola.');
            ctx.tag(tptz, tagHTML(S.thermo, 'Anomalía térmica · 2,4 km', 'Gradiente +14 °C · orientando…', 'warn'), { ttl: 3000, offsetY: 1 }); ctx.log('warn', 'Anomalía térmica · azimut 48°', '2,4 km · gradiente +14 °C');
            tptzTrack = new THREE.Vector3(70, 3, -78); cone.color('#FFB703');
            ctx.feed({ from: tptz, lookAt: [70, 3, -78], mode: 'th', fov: 40, label: 'PTZ térmica · 1x' });
            await wait(1400);
            ctx.step(3, 4, 'Zoom óptico 40x y confirmación del foco: fuego, no un motor caliente.');
            const z = { f: 40 }; const tw = ctx.gsap.to(z, { f: 2.2, duration: 2.2, ease: 'power2.inOut', onUpdate: () => ctx.feed({ from: tptz, lookAt: [70, 3, -78], mode: 'th', fov: z.f, label: `PTZ térmica · ${(40 / z.f).toFixed(0)}x` }) }); ctx.tween(tw);
            const fb = ctx.feedBox(fire, { label: 'FUEGO CONFIRMADO', cls: 'alert', w: 3, h: 6 });
            await wait(2400); cone.color('#FF3B30');
            ctx.step(4, 4, 'Coordenadas del foco a bomberos y al encargado: minutos de ventaja para actuar.');
            ctx.tag(fire, tagHTML(S.flame, 'Foco de incendio confirmado', '−34.6204, −58.4661 · alerta a bomberos', 'danger'), { ttl: 4800, offsetY: 6 }); ctx.log('danger', 'Incendio confirmado · coordenadas enviadas', '−34.6204, −58.4661 · bomberos + encargado');
            await wait(4000); ctx.gsap.to(smoke.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.2 }); ctx.gsap.to(fire.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1 }); await wait(1200); tptzTrack = null; fb.remove(); ctx.feedOff(); cone.color('#FF6A00');
          } },
        { id: 'line', icon: S.mic, label: 'Vehículo no autorizado en silobolsas', desc: 'Cruce de línea nocturno: la cámara solar habla, enciende strobe y avisa al celular.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([16, 1, 14], [14, 7, 16], 1.6); zone.visible = true;
            ctx.step(1, 4, 'Línea virtual alrededor de los silobolsas: la cámara solar ColorVu vigila a color aun de noche.');
            const cone = ctx.cone(solarCam, { fov: 62, aspect: 1.7, far: 20, color: '#6E85EE' });
            ctx.feed({ from: solarCam, lookAt: [22, 0.6, 18], mode: 'cv', fov: 62, label: 'Cámara solar · ColorVu 4G' }); ctx.log('info', 'Regla de cruce de línea armada', 'Silobolsas · 23:30'); await wait(1400);
            pickup.visible = true; pickup.position.set(10, 0, 46); pickup.rotation.y = Math.PI / 2;
            const d = path(ctx, pickup, [[14, 30], [20, 14]], { speed: 4.5, ease: 'power1.out' }); const fb = ctx.feedBox(pickup, { label: 'VEHÍCULO', cls: 'vehicle', w: 4.4, h: 2.2 }); await wait(2600);
            ctx.step(2, 4, 'Una camioneta cruza la línea de noche: AcuSense la clasifica como vehículo y dispara la regla.'); fb.set('CRUCE DE LÍNEA · VEHÍCULO', 'alert'); cone.color('#FF6B6B');
            ctx.tag(pickup, tagHTML(S.alert, 'Cruce de línea · vehículo', 'No autorizado · 23:41', 'danger'), { ttl: 3600, offsetY: 2 }); ctx.log('warn', 'Cruce de línea: vehículo', 'Silobolsas · 23:41');
            await wait(500);
            ctx.step(3, 4, 'Respuesta automática: audio bidireccional, luz estroboscópica y push por 4G con el clip.');
            ctx.tag(solar, tagHTML(S.mic, '"Zona privada, retírese"', 'Audio bidireccional + strobe · push 4G', 'danger'), { ttl: 3600, offsetY: 5.6 });
            strobe(ctx, sStrobe, { times: 14, period: 0.2, on: 3 }); ctx.gsap.to(sLight, { intensity: 200, duration: 0.2 }); ctx.log('danger', 'Strobe + audio · push 4G enviado', 'Clip 10 s al encargado');
            await done(d); await wait(500);
            ctx.step(4, 4, 'La camioneta se va; el encargado tiene patente, hora y video sin haber ido al lote.');
            const b = path(ctx, pickup, [[12, 34], [10, 52]], { speed: 6 }); await done(b); pickup.visible = false; fb.remove(); ctx.gsap.to(sLight, { intensity: 0, duration: 0.6 }); zone.visible = false; ctx.feedOff(); cone.color('#6E85EE'); ctx.log('ok', 'Vehículo se retira', 'Evento con clip guardado'); await wait(1600);
          } },
        { id: 'ptz', icon: S.zoom, label: 'PTZ DarkFighterX: tranquera a 480 m', desc: 'Zoom óptico 42x de noche y a color para vigilar accesos lejanos.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-24, 6, -8], [10, 5, 12], 1.5);
            ctx.step(1, 3, 'PTZ DarkFighterX en el mástil del casco: sensor dual (color + IR) y 42x óptico.');
            const cone = ctx.cone(ptz, { fov: 6, aspect: 1.7, far: 110, color: '#8B5CF6', opacity: 0.08 });
            tracking = null; ptz.lookAt(85, 8, 0); ctx.log('info', 'PTZ preset 3 · tranquera este', '480 m · 0,002 lux'); await wait(800);
            ctx.step(2, 3, 'Zoom a la tranquera a 480 m: a esta luz una cámara común sólo ve negro.');
            const z = { f: 50 }; const tw = ctx.gsap.to(z, { f: 1.6, duration: 3, ease: 'power2.inOut', onUpdate: () => ctx.feed({ from: ptz, lookAt: [85, 0.8, 0], mode: 'cv', fov: z.f, label: `DarkFighterX · ${(50 / z.f).toFixed(0)}x · 480 m` }) }); ctx.tween(tw);
            await wait(3200); ctx.tag(gate, tagHTML(S.eye, 'Tranquera este · 480 m', 'Color de noche · Rapid Focus', 'ok'), { ttl: 3600, offsetY: 2 }); ctx.log('ok', 'Tranquera cerrada · sin novedad', '42x · Rapid Focus');
            ctx.step(3, 3, 'Rondas automáticas por presets: tranquera, galpón, silobolsas y potrero, toda la noche.');
            await wait(3200); ctx.feedOff();
          } },
        { id: 'radar', icon: S.radar, label: 'Radar perimetral + PTZ', desc: 'Intruso a pie en el campo de noche: el radar lo detecta y la PTZ lo sigue.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([4, 1, -30], [16, 9, 16], 1.6);
            ctx.step(1, 4, 'Radar de 120 m en campo abierto: el pasto alto y los animales no generan falsas alarmas.');
            const sec = ctx.cone(radar, { sector: true, fov: 100, far: 34, color: '#6E85EE', opacity: 0.08, yaw: Math.PI });
            sweep.visible = true; sweep.scale.setScalar(24); sweep.rotation.set(-Math.PI / 2, 0, 0); ctx.log('info', 'Radar · sector norte', '120 m · 0 objetivos'); await wait(1400);
            intruder.visible = true; intruder.position.set(30, 0, -44); const w = path(ctx, intruder, [[16, -38], [4, -34]], { speed: 2.2, bob: true });
            await wait(2000); beam.visible = true; beam.scale.setScalar(26); beam.rotation.set(-Math.PI / 2, 0, 0); tracking = intruder; sec.color('#FFB703');
            ctx.step(2, 4, 'Objetivo a 96 m: tamaño y velocidad compatibles con un humano a pie.');
            ctx.tag(radar, tagHTML(S.radar, 'Radar: objetivo 96 m', 'Humano · 1,7 m/s · sin falsas alarmas por pasto', 'warn'), { ttl: 3600, offsetY: 4.8 }); ctx.log('warn', 'Radar: humano a 96 m', '1,7 m/s · rumbo al galpón'); await wait(800);
            ctx.step(3, 4, 'El radar entrega las coordenadas a la PTZ: gira, enfoca y sigue al objetivo con strobe.');
            strobe(ctx, ptz.getObjectByName('strobe'), { times: 16, period: 0.2, on: 4 });
            ctx.feed({ from: ptz, lookAt: intruder, mode: 'cv', fov: 14, label: 'PTZ · Auto-tracking' }); const fb = ctx.feedBox(intruder, { label: 'HUMANO · TRACKING', cls: 'alert' }); ctx.log('danger', 'PTZ: seguimiento automático', 'Strobe + clip al encargado');
            await done(w); await wait(600);
            ctx.step(4, 4, 'Con luz encima y sabiendo que lo ven, se retira. Ninguna persona salió a recorrer el campo.');
            const b = path(ctx, intruder, [[34, -46]], { speed: 4.5, bob: true }); await done(b);
            intruder.visible = false; tracking = null; fb.remove(); sweep.visible = beam.visible = false; ctx.feedOff(); sec.color('#6E85EE'); ctx.log('ok', 'Objetivo fuera de rango', 'Evento cerrado'); await wait(1600);
          } },
        { id: 'bridge', icon: S.wifi, label: 'Enlace inalámbrico casa ⟷ galpón', desc: 'Video del galpón a la casa principal sin tender fibra ni cobre.',
          async run() {
            reset(); ctx.focus([-33, 4, -12], [12, 8, 14], 1.4);
            ctx.step(1, 3, 'Dos puentes de 5 GHz con línea de vista: 4,8 km entre el galpón y la casa, sin zanja.'); await wait(1200);
            ctx.tag(link1, tagHTML(S.wifi, 'Enlace 5 GHz · 4,8 km', '−62 dBm · 310 Mbps · 3 ms', 'ok'), { ttl: 3600, offsetY: 0.9 }); ctx.log('ok', 'Enlace PtP: −62 dBm', '310 Mbps · latencia 3 ms');
            await wait(2600); ctx.step(2, 3, 'Seis cámaras del galpón llegan a HikCentral en la casa como si estuvieran cableadas.');
            ctx.tag(link1, tagHTML(S.check, '6 cámaras en HikCentral', 'Sin cableado · PoE pasivo', 'ok'), { ttl: 3000, offsetY: 0.9 }); ctx.log('ok', '6 canales en vivo', 'Uso del enlace: 38 %'); await wait(2400);
            ctx.step(3, 3, 'Alimentación por PoE pasivo desde el galpón; alarma si el enlace cae.'); ctx.log('info', 'Watchdog de enlace activo', 'Aviso si RSSI < −75 dBm'); await wait(2000);
          } },
      ],
      reset,
    };
  },
};
