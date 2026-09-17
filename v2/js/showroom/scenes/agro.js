/* =====================================================================
   Escena 4 — Agro, campos y parcelas remotas
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'agro',
  camera: { pos: [52, 30, 58], target: [4, 1, -2], maxDistance: 160 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(320, '#A9B86A'));
    // Parcelas cultivadas (franjas)
    for (let i = 0; i < 9; i++) add(L.plane(70, 3.2, i % 2 ? '#8FA84E' : '#B7C36E', 30, 0.02, -50 + i * 4.4));
    for (let i = 0; i < 7; i++) add(L.plane(3.2, 60, i % 2 ? '#7E9C45' : '#A7B85F', -60 + i * 4.4, 0.02, 20));
    // Camino de tierra y tranquera al este
    add(L.road(6, 150, 10, 0, Math.PI / 2, '#B08D5E'));
    add(L.fence(85, -60, 85, -4, 1.4, '#7A5A3A'), L.fence(85, 4, 85, 60, 1.4, '#7A5A3A'));
    const gate = add(L.fence(85, -4, 85, 4, 1.4, '#A88650'));
    // Casco: casa + galpón de maquinaria + tanque
    add(L.house(-34, -22, 11, 9, '#F1EDE4', '#7A5A4A', Math.PI / 2)); add(L.warehouse(18, 6, 12, -34, -2, '#C9C3B4', '#7A5A3A'));
    add(L.cyl(1.4, 1.4, 5, '#8A8F9C', -22, 0, -24, 10), L.cyl(1.7, 1.7, 1.6, '#B4B9C2', -22, 5, -24, 10)); // tanque de agua
    add(L.box(3, 1.2, 1.6, '#3A6BD8', -30, 0, 2.5)); add(L.box(2.4, 1.4, 1.2, '#F5B400', -26, 0, 3)); // maquinaria
    [[-46, -30], [-46, -12], [-40, 10], [-28, 12], [-14, -30]].forEach(([x, z]) => add(L.tree(x, z, 1.6, '#4F8A3D')));
    for (let x = -80; x <= 80; x += 14) add(L.pine(x, -95, 2.2)); for (let z = -80; z <= 80; z += 14) add(L.pine(-110, z, 2.2));
    // Silobolsas
    const silos = [[22, 16, 0], [22, 22, 0], [22, 28, 0]].map(([x, z, r]) => add(L.silobolsa(x, z, 16, r)));
    const zone = add(L.zone(26, 0.3, 22, 11.5, '#FF3B30', 0.6)); zone.visible = false;
    // Cámara solar 4G junto a silobolsas
    const solar = add(L.camSolar(8, 12, 4.6, Math.PI * 0.75)); const panel = solar.getObjectByName('panel'); const solarCam = solar.getObjectByName('cam');
    const sStrobe = L.siren(0, 3.5, 0.32); solar.add(sStrobe); const sLight = L.spot('#FFFFFF', 0, 0.5, 30); sLight.position.set(8, 4.2, 12); add(sLight, sLight.target); sLight.target.position.set(22, 0.5, 8);
    // PTZ DarkFighterX en mástil del casco + PTZ térmica en torre
    add(L.pole(-24, -8, 9)); const ptz = add(L.mount(-24, 9.1, -8, L.camPTZ('#F4F5F7', 0.36), 0, 0));
    add(L.cyl(0.4, 0.6, 12, '#8A8F9C', -40, 0, -34, 6), L.box(1.2, 0.2, 1.2, '#8A8F9C', -40, 12, -34)); const tptz = add(L.mount(-40, 12.3, -34, L.camPTZ('#F4F5F7', 0.34), 0, 0));
    const radar = add(L.radar(4, -22, 4)); const sweep = radar.getObjectByName('sweep'), beam = radar.getObjectByName('beam');
    // Enlace inalámbrico: antenas en galpón y casa
    const dish = (x, y, z, r) => { const d = L.box(0.6, 0.6, 0.08, '#F4F5F7', x, y, z); d.rotation.y = r; return d; };
    const link1 = add(dish(-26, 6.4, -2, Math.PI / 2)); add(dish(-40, 5.4, -22, -Math.PI / 2)); add(L.cyl(0.05, 0.05, 1.2, '#4A4F66', -26, 6, -2, 6), L.cyl(0.05, 0.05, 1.2, '#4A4F66', -40, 5, -22, 6));
    // Foco de incendio lejano (humo + fuego) y sol
    const smoke = add(L.smoke(70, -78, 8)); const fire = add(L.fire(70, -78));
    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE9A8', fog: false })); sunBall.userData.noSwap = true; sunBall.position.set(60, 70, -40); add(sunBall);
    add(L.lampPost(ctx, -30, -12, 5, Math.PI / 2));
    // Actores
    const pickup = add(L.car('#2B2F3A', 'AC 321 KL')); pickup.position.set(10, 0, 50); pickup.rotation.y = Math.PI / 2; pickup.visible = false;
    const tractor = add(L.forklift('#3E7A3A')); tractor.position.set(30, 0, -30); tractor.rotation.y = Math.PI;
    const farmer = add(L.person('#7A5A3A', '#2B2F3A')); farmer.position.set(-28, 0, 5);
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;

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
        { id: 'solar', icon: S.sun, label: 'Monitoreo off-grid autónomo', desc: 'El panel sigue al sol simulado; batería, consumo y señal 4G en vivo.',
          async run() {
            reset(); ctx.focus([8, 3, 12], [6, 3, 6], 1.5);
            const st = { h: 7, b: 61 };
            const tg = ctx.tag(solar, `<span class="tag-ic ok">${S.battery}</span><span class="tag-tx"><b>Batería 61 % · 07:00</b><small>4G −71 dBm · consumo 1,9 W</small></span>`, { ttl: 0, offsetY: 5.6 });
            const b = tg.el.querySelector('b'), sm = tg.el.querySelector('small');
            const tw = ctx.gsap.to(st, { h: 18, b: 96, duration: 7, ease: 'none', onUpdate: () => {
              const a = (st.h - 7) / 11; panel.rotation.x = -0.9 + a * 0.9; panel.rotation.z = (a - 0.5) * 0.8;
              sunBall.position.set(60 - a * 120, 40 + Math.sin(a * Math.PI) * 40, -40); ctx.viewer.sun.position.copy(sunBall.position).multiplyScalar(0.8);
              b.textContent = `Batería ${st.b.toFixed(0)} % · ${String(Math.floor(st.h)).padStart(2, '0')}:${String(Math.floor((st.h % 1) * 60)).padStart(2, '0')}`; sm.textContent = `4G −71 dBm · carga ${(a * 38 + 4).toFixed(0)} W · panel 80 W`;
            } }); ctx.tween(tw);
            await wait(7200); tg.remove(); ctx.viewer.sun.position.set(40, 60, 25); sunBall.position.set(60, 70, -40);
            ctx.tag(solar, tagHTML(S.check, 'Autonomía 7 días sin sol', 'Batería 360 Wh · modo bajo consumo', 'ok'), { ttl: 3200, offsetY: 5.6 });
          } },
        { id: 'fire', icon: S.flame, label: 'Foco ígneo a gran distancia', desc: 'Columna de humo en el horizonte: la PTZ térmica la detecta, hace zoom 40x y fija coordenadas.',
          async run() {
            reset(); ctx.focus([-40, 8, -34], [14, 8, 16], 1.6);
            ctx.gsap.to(smoke.scale, { x: 1, y: 1, z: 1, duration: 3, ease: 'power2.out' }); ctx.gsap.to(fire.scale, { x: 1, y: 1, z: 1, duration: 3, delay: 0.6 });
            await wait(1800);
            ctx.tag(tptz, tagHTML(S.thermo, 'Anomalía térmica · 2,4 km', 'Gradiente +14 °C · orientando…', 'warn'), { ttl: 3000, offsetY: 1 });
            tptzTrack = new THREE.Vector3(70, 3, -78);
            ctx.feed({ from: tptz, lookAt: [70, 3, -78], mode: 'th', fov: 40, label: 'PTZ térmica · 1x' });
            await wait(1400);
            const z = { f: 40 }; const tw = ctx.gsap.to(z, { f: 2.2, duration: 2.2, ease: 'power2.inOut', onUpdate: () => ctx.feed({ from: tptz, lookAt: [70, 3, -78], mode: 'th', fov: z.f, label: `PTZ térmica · ${(40 / z.f).toFixed(0)}x` }) }); ctx.tween(tw);
            await wait(2400);
            ctx.tag(fire, tagHTML(S.flame, 'Foco de incendio confirmado', '−34.6204, −58.4661 · alerta a bomberos', 'danger'), { ttl: 4800, offsetY: 6 });
            await wait(4000); ctx.gsap.to(smoke.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.2 }); ctx.gsap.to(fire.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1 }); await wait(1200); tptzTrack = null; ctx.feedOff();
          } },
        { id: 'line', icon: S.mic, label: 'Vehículo no autorizado en silobolsas', desc: 'Cruce de línea nocturno: la cámara solar habla, enciende strobe y avisa al celular.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([16, 1, 14], [14, 7, 16], 1.6); zone.visible = true;
            ctx.feed({ from: solarCam, lookAt: [22, 0.6, 18], mode: 'cv', fov: 62, label: 'Cámara solar · ColorVu 4G' });
            pickup.visible = true; pickup.position.set(10, 0, 46); pickup.rotation.y = Math.PI / 2;
            const d = path(ctx, pickup, [[14, 30], [20, 14]], { speed: 4.5, ease: 'power1.out' }); await wait(2800);
            ctx.tag(pickup, tagHTML(S.alert, 'Cruce de línea · vehículo', 'No autorizado · 23:41', 'danger'), { ttl: 3600, offsetY: 2 });
            ctx.tag(solar, tagHTML(S.mic, '"Zona privada, retírese"', 'Audio bidireccional + strobe · push 4G', 'danger'), { ttl: 3600, offsetY: 5.6 });
            strobe(ctx, sStrobe, { times: 14, period: 0.2, on: 3 }); ctx.gsap.to(sLight, { intensity: 200, duration: 0.2 });
            await done(d); await wait(500);
            const b = path(ctx, pickup, [[12, 34], [10, 52]], { speed: 6 }); await done(b); pickup.visible = false; ctx.gsap.to(sLight, { intensity: 0, duration: 0.6 }); zone.visible = false; ctx.feedOff();
          } },
        { id: 'ptz', icon: S.zoom, label: 'PTZ DarkFighterX: tranquera a 480 m', desc: 'Zoom óptico 42x de noche y a color para vigilar accesos lejanos.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-24, 6, -8], [10, 5, 12], 1.5);
            tracking = null; ptz.lookAt(85, 8, 0);
            const z = { f: 50 }; const tw = ctx.gsap.to(z, { f: 1.6, duration: 3, ease: 'power2.inOut', onUpdate: () => ctx.feed({ from: ptz, lookAt: [85, 0.8, 0], mode: 'cv', fov: z.f, label: `DarkFighterX · ${(50 / z.f).toFixed(0)}x · 480 m` }) }); ctx.tween(tw);
            await wait(3200); ctx.tag(gate, tagHTML(S.eye, 'Tranquera este · 480 m', 'Color de noche · Rapid Focus', 'ok'), { ttl: 3600, offsetY: 2 });
            await wait(3600); ctx.feedOff();
          } },
        { id: 'radar', icon: S.radar, label: 'Radar perimetral + PTZ', desc: 'Intruso a pie en el campo de noche: el radar lo detecta y la PTZ lo sigue.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([4, 1, -30], [16, 9, 16], 1.6);
            sweep.visible = true; sweep.scale.setScalar(24); sweep.rotation.set(-Math.PI / 2, 0, 0);
            intruder.visible = true; intruder.position.set(30, 0, -44); const w = path(ctx, intruder, [[16, -38], [4, -34]], { speed: 2.2, bob: true });
            await wait(2000); beam.visible = true; beam.scale.setScalar(26); beam.rotation.set(-Math.PI / 2, 0, 0); tracking = intruder;
            ctx.tag(radar, tagHTML(S.radar, 'Radar: objetivo 96 m', 'Humano · 1,7 m/s · sin falsas alarmas por pasto', 'warn'), { ttl: 3600, offsetY: 4.8 });
            strobe(ctx, ptz.getObjectByName('strobe'), { times: 16, period: 0.2, on: 4 });
            ctx.feed({ from: ptz, lookAt: intruder, mode: 'cv', fov: 14, label: 'PTZ · Auto-tracking' });
            await done(w); await wait(600); const b = path(ctx, intruder, [[34, -46]], { speed: 4.5, bob: true }); await done(b);
            intruder.visible = false; tracking = null; sweep.visible = beam.visible = false; ctx.feedOff();
          } },
        { id: 'bridge', icon: S.wifi, label: 'Enlace inalámbrico casa ⟷ galpón', desc: 'Video del galpón a la casa principal sin tender fibra ni cobre.',
          async run() {
            reset(); ctx.focus([-33, 4, -12], [12, 8, 14], 1.4); await wait(1200);
            ctx.tag(link1, tagHTML(S.wifi, 'Enlace 5 GHz · 4,8 km', '−62 dBm · 310 Mbps · 3 ms', 'ok'), { ttl: 3600, offsetY: 0.9 });
            await wait(2600); ctx.tag(link1, tagHTML(S.check, '6 cámaras en HikCentral', 'Sin cableado · PoE pasivo', 'ok'), { ttl: 3000, offsetY: 0.9 });
          } },
      ],
      reset,
    };
  },
};
