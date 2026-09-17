/* =====================================================================
   Escena 1 — Oficinas y edificios corporativos
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'office',
  camera: { pos: [34, 22, 40], target: [2, 1, 6], maxDistance: 110 },
  glb: null, // → '/v2/models/oficinas_prod.glb' cuando exista el modelo de Blender
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(180, '#8FB77A'));
    // Calle y veredas
    add(L.road(9, 120, 0, 30), L.sidewalk(120, 2.2, 0, 24.4), L.sidewalk(120, 2.2, 0, 35.6));
    add(L.road(6, 12, 16, 19.5, 0, '#4A4D55'));
    // Parking
    add(L.plane(34, 15, '#4E5159', 0, 0.02, 11));
    for (let i = 0; i < 7; i++) add(L.plane(0.12, 5, '#E8E4D0', -15 + i * 5, 0.03, 15));
    add(L.plane(34, 0.14, '#E8E4D0', 0, 0.03, 17.5));
    // Edificio de 1 planta + hall de acceso
    add(L.building(28, 5.2, 14, 0, -8, '#E9E5DD', { floors: 1, cols: 9 }));
    add(L.box(10, 3.6, 4, '#DDE6F0', 0, 0, 1, { roughness: 0.15, transparent: true, opacity: 0.45 })); // hall vidriado
    add(L.box(11, 0.3, 4.6, '#B9B5AD', 0, 3.6, 1));
    add(L.plane(10, 5, '#C9C5BB', 0, 0.03, 4.5)); // explanada
    // Sala técnica (rack + NVR + monitores) con frente de vidrio
    add(L.box(6, 3.2, 5, '#E1DDD5', -19, 0, 3), L.box(6.4, 0.3, 5.4, '#B9B5AD', -19, 3.2, 3));
    add(L.box(5.6, 2.6, 0.08, '#CFE3F2', -19, 0.3, 5.55, { roughness: 0.1, transparent: true, opacity: 0.35 }));
    const rack = add(L.rack(-20.6, 1.5)); const nvr = add(L.nvrBox(-18.4, 1.2, 1.6)); add(L.box(1.2, 1.1, 0.6, '#2A2E3A', -18.4, 0, 1.6));
    add(L.screenPanel(-17.6, 2.1, 1.2, 0.25), L.screenPanel(-19.3, 2.1, 1.0, -0.1));
    // Garita y barrera
    add(L.guardBooth(20, 21.5));
    const barrier = add(L.barrier(13.2, 21, 0, 5.2)); const arm = barrier.getObjectByName('arm');
    // Vegetación y luminarias
    [[-26, 20], [-26, 8], [26, 8], [26, 2], [-8, 22], [8, 22]].forEach(([x, z]) => add(L.tree(x, z, 1.2)));
    for (let x = -30; x <= 30; x += 12) add(L.tree(x, 40, 1));
    add(L.lampPost(ctx, -14, 19, 5, Math.PI / 2), L.lampPost(ctx, 6, 19, 5, Math.PI / 2), L.lampPost(ctx, 23, 27, 5, Math.PI));
    add(L.lampPost(ctx, -24, 3, 4.5, 0));
    // Acceso peatonal: totem MinMoe + speed gate
    const gate = add(L.speedGate(2.4, 4.2, 0)); const wingL = gate.getObjectByName('wingL'), wingR = gate.getObjectByName('wingR'), led = gate.getObjectByName('led');
    const totem = add(L.totem(3.4, 5.3, 0)); const screen = totem.getObjectByName('screen');
    add(L.box(0.4, 1.0, 0.4, '#F4F5F7', -0.5, 0, 4.2)); // cabina secundaria / intercom
    // Cámaras
    const hybrid = add(L.mount(14.2, 4.8, 0.2, L.camBullet(), -Math.PI / 4, -0.35));
    const hybridLight = L.spot('#FFFFFF', 0, 0.42, 32); hybridLight.position.set(14.2, 4.8, 0.2); hybridLight.target.position.set(6, 0.5, 8); add(hybridLight, hybridLight.target);
    const lpr = add(L.mount(15.7, 3.4, 24.5, L.camBullet(), 0, -0.25)); add(L.pole(15.7, 24.5, 3.4));
    add(L.mount(-14.3, 4.8, 0.2, L.camTurret(), Math.PI / 4, -0.4));
    add(L.mount(0, 5.5, -15.1, L.camTurret(), Math.PI, -0.5));
    add(L.mount(20, 2.7, 22.9, L.camBullet(), -Math.PI * 0.75, -0.3));
    // AX PRO: sirena exterior + PIR-Cam trasero
    const siren = add(L.siren(-12.5, 4.3, -0.9)); const pir = add(L.mount(-6, 4.6, -15.1, L.camTurret('#F4F5F7'), Math.PI, -0.6));
    // Actores
    const car = add(L.car('#B8362E', 'AE 123 CD')); car.position.set(16, 0, 42); car.rotation.y = Math.PI / 2;
    const car2 = add(L.car('#3A6BD8')); car2.position.set(-10, 0, 13); car2.rotation.y = -Math.PI / 2;
    const car3 = add(L.car('#DDDDDD')); car3.position.set(5, 0, 13); car3.rotation.y = -Math.PI / 2;
    const employee = add(L.person('#3A6BD8')); employee.position.set(-4, 0, 13);
    const redJacket = add(L.person('#D92D20', '#2B2F3A')); redJacket.position.set(-13, 0, 0.6); redJacket.visible = false;
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.position.set(22, 0, 2); intruder.visible = false;
    const intruder2 = add(L.person('#2B2F3A', '#1A1C24')); intruder2.position.set(-10, 0, -22); intruder2.visible = false;

    const reset = () => {
      car.position.set(16, 0, 42); car.rotation.y = Math.PI / 2; arm.rotation.z = 0;
      employee.position.set(-4, 0, 13); wingL.rotation.y = 0; wingR.rotation.y = 0; led.material.emissive.set('#E2231A'); screen.material.emissive.set('#4A62D6'); screen.material.emissiveIntensity = 0.5;
      redJacket.visible = false; intruder.visible = false; intruder2.visible = false; hybridLight.intensity = 0; siren.material.emissiveIntensity = 0;
    };

    return {
      hotspots: [
        { id: 'office_minmoe', target: totem, offsetY: 1.9, offset: [4, 2.2, 5] },
        { id: 'office_speedgate', target: gate, offsetY: 1.6, offset: [-4, 2.2, 5] },
        { id: 'office_hybrid', target: hybrid, offsetY: 0.6, offset: [5, 2, 5] },
        { id: 'office_nvr', target: nvr, offsetY: 1.6, offset: [3, 2, 6] },
        { id: 'office_axpro', target: siren, offsetY: 0.6, offset: [-4, 2, 5] },
        { id: 'office_lpr', target: lpr, offsetY: 0.6, offset: [5, 2.5, 7] },
        { id: 'office_network', target: rack, offsetY: 2.4, offset: [-3, 2, 6] },
      ],
      actions: [
        { id: 'hybrid', icon: S.moon, label: 'Simular intruso nocturno', desc: 'Smart Hybrid Light: IR discreto → luz blanca y color al detectar un humano.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([8, 1, 5], [15, 9, 14], 1.6);
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'ir', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
            intruder.visible = true; intruder.position.set(24, 0, 4);
            const walk = path(ctx, intruder, [[12, 6], [2, 7]], { speed: 2.2, bob: true });
            await wait(2600);
            ctx.tag(hybrid, tagHTML(S.eye, 'Humano detectado', 'Luz blanca ON · grabando a color', 'warn'), { ttl: 4200, offsetY: 0.9 });
            ctx.gsap.to(hybridLight, { intensity: 140, duration: 0.25 });
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'cv', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
            ctx.tag(intruder, tagHTML(S.alert, 'Alerta AcuSense', 'Intrusión · perímetro oficinas', 'danger'), { ttl: 4000, offsetY: 2.3 });
            await done(walk); await wait(800);
            ctx.gsap.to(hybridLight, { intensity: 0, duration: 0.8 }); intruder.visible = false;
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'ir', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
          } },
        { id: 'access', icon: S.face, label: 'Acceso peatonal MinMoe', desc: 'Rostro validado en 0,2 s, luz verde y las alas de vidrio se abren.',
          async run() {
            reset(); ctx.focus([2.6, 1, 4.4], [5, 3, 6.5], 1.4);
            const w = path(ctx, employee, [[3.4, 9], [3.4, 6.4]], { speed: 2.4, bob: true }); await done(w);
            const ring = ctx.tag(employee, `<span class="face-ring"></span>`, { ttl: 1600, offsetY: 1.75, cls: 'bare' });
            await wait(900);
            screen.material.emissive.set('#3DD68C'); screen.material.emissiveIntensity = 1.4; led.material.emissive.set('#3DD68C');
            ctx.tag(totem, tagHTML(S.check, 'Rostro verificado · 0,2 s', 'Empleado 0042 · Anti-spoofing OK', 'ok'), { ttl: 3200, offsetY: 1.9 });
            ctx.gsap.to(wingL.rotation, { y: -1.25, duration: 0.45, ease: 'power3.out' }); ctx.gsap.to(wingR.rotation, { y: 1.25, duration: 0.45, ease: 'power3.out' });
            await wait(400);
            const w2 = path(ctx, employee, [[2.4, 4.2], [1.4, 1.6], [0, -0.6]], { speed: 2.2, bob: true }); await done(w2);
            ctx.gsap.to(wingL.rotation, { y: 0, duration: 0.5 }); ctx.gsap.to(wingR.rotation, { y: 0, duration: 0.5 });
            led.material.emissive.set('#E2231A'); screen.material.emissive.set('#4A62D6'); screen.material.emissiveIntensity = 0.5;
          } },
        { id: 'acuseek', icon: S.search, label: 'Buscar: "persona con campera roja"', desc: 'AcuSeek: el NVR entiende lenguaje natural y devuelve el clip exacto.',
          async run() {
            reset(); ctx.focus([-18.4, 1.4, 1.6], [4, 2.6, 6], 1.4);
            const t = ctx.tag(nvr, `<span class="tag-ic">${S.search}</span><span class="tag-tx"><b class="typed" data-text="persona con campera roja"></b><small>AcuSeek · NVR DeepinMind</small></span>`, { ttl: 4200, offsetY: 1.2 });
            const el = t.el.querySelector('.typed'); const txt = el.dataset.text; for (let i = 1; i <= txt.length; i++) { el.textContent = txt.slice(0, i); await wait(45); }
            await wait(600); el.parentElement.querySelector('small').textContent = '3 coincidencias · 14:32 · 11:07 · 09:41';
            await wait(1400);
            ctx.focus([-2, 1, 1], [8, 5, 10], 1.6);
            redJacket.visible = true; redJacket.position.set(-13, 0, 6.5);
            ctx.feed({ from: [-14.3, 4.8, 0.2], lookAt: [-2, 0.5, 6.5], mode: 'color', fov: 58, label: 'CAM 02 · Clip 14:32:07' });
            const w = path(ctx, redJacket, [[-2, 6.5], [9, 6.5]], { speed: 2.4, bob: true });
            await wait(1200);
            ctx.tag(redJacket, tagHTML(S.check, 'Coincidencia 98 %', 'Campera roja · 14:32:07', 'ok'), { ttl: 3600, offsetY: 2.3 });
            await done(w); redJacket.visible = false; ctx.feedOff();
          } },
        { id: 'lpr', icon: S.car, label: 'Ingreso vehicular ANPR', desc: 'Lee la patente en <100 ms y la barrera sube sin frenar el auto.',
          async run() {
            reset(); ctx.focus([15, 1, 22], [9, 5, 9], 1.4);
            ctx.feed({ from: lpr, lookAt: [16, 0.6, 30], mode: 'color', fov: 40, label: 'CAM ANPR · Pórtico' });
            const drive = path(ctx, car, [[16, 26.5]], { speed: 5.5, ease: 'power1.out' });
            await wait(1300);
            ctx.tag(car, `<span class="plate">AE 123 CD</span><span class="tag-tx"><b>Lista blanca</b><small>Sedán · rojo · 98 ms</small></span>`, { ttl: 3800, offsetY: 1.9, cls: 'plate-tag' });
            ctx.gsap.to(arm.rotation, { z: 1.45, duration: 1.1, ease: 'power2.inOut' });
            await done(drive);
            const drive2 = path(ctx, car, [[16, 14], [10, 13]], { speed: 5, ease: 'power1.inOut' });
            await wait(1800); ctx.gsap.to(arm.rotation, { z: 0, duration: 1.2, ease: 'power2.inOut' });
            await done(drive2); ctx.feedOff();
          } },
        { id: 'axpro', icon: S.bell, label: 'Intrusión fuera de turno (AX PRO)', desc: 'PIR-Cam verifica con foto y dispara sirena + strobe antes de que entren.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-6, 1, -16], [-8, 5, -12], 1.5);
            intruder2.visible = true; intruder2.position.set(-14, 0, -24);
            const w = path(ctx, intruder2, [[-6, -18]], { speed: 2, bob: true }); await done(w);
            ctx.tag(pir, tagHTML(S.eye, 'PIR-Cam: movimiento', 'Foto de verificación enviada a la app', 'warn'), { ttl: 3800, offsetY: 0.8 });
            await wait(1300);
            ctx.tag(siren, tagHTML(S.bell, 'Sirena 110 dB + strobe', 'Evento a central y Hik-Connect', 'danger'), { ttl: 4200, offsetY: 0.8 });
            const st = strobe(ctx, siren, { times: 14, period: 0.22 });
            await wait(700);
            const run = path(ctx, intruder2, [[-16, -26]], { speed: 4.5, bob: true }); await done(run); intruder2.visible = false; await done(st);
          } },
        { id: 'network', icon: S.net, label: 'Diagnóstico de red PoE', desc: 'Topología, watchdog PoE y reinicio remoto desde Hik-Partner Pro.',
          async run() {
            ctx.focus([-20.6, 1.2, 1.5], [3.5, 2.2, 6], 1.3); await wait(1200);
            ctx.tag(rack, tagHTML(S.net, 'Switch DS-3E1310P-SI', 'PoE 84 W / 110 W · 8 cámaras online', 'ok'), { ttl: 3200, offsetY: 2.2 });
            await wait(2200);
            ctx.tag(rack, tagHTML(S.alert, 'Watchdog: CAM 04 sin respuesta', 'Reinicio PoE automático…', 'warn'), { ttl: 2600, offsetY: 2.2 });
            await wait(2600);
            ctx.tag(rack, tagHTML(S.check, 'CAM 04 restablecida', 'Sin intervención en sitio', 'ok'), { ttl: 2800, offsetY: 2.2 });
          } },
      ],
      reset,
    };
  },
};
