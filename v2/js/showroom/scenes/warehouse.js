/* =====================================================================
   Escena 3 — Depósitos, centros logísticos y playas de carga
   Identidad: logística de seguridad industrial — grises fríos, amarillo
   y naranja de señalización, azul Control Red en el galpón, contenedores
   de colores, camiones que llegan y salen, autoelevadores en movimiento.
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'warehouse',
  camera: { pos: [46, 30, 50], target: [0, 1, 6], maxDistance: 140 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(260, '#9BA38C', { color2: '#7E8A6C', amount: 0.2, scale: 0.05 }));
    add(L.plane(122, 92, '#5B5F68', 0, 0.02, 8)); // playa de maniobras
    const W = 40, H = 9, D = 24, Z = -14;

    /* ---- Galpón con frente abierto (docks) para ver el interior ---- */
    add(L.plane(W, D, '#7E838C', 0, 0.04, Z));
    add(L.rbox(W, H, 0.4, '#D2D6DC', 0, 0, Z - D / 2, { r: 0.05 }), L.rbox(0.4, H, D, '#D2D6DC', -W / 2, 0, Z, { r: 0.05 }), L.rbox(0.4, H, D, '#D2D6DC', W / 2, 0, Z, { r: 0.05 }));
    add(L.box(W + 0.4, 0.7, 0.42, '#344AB2', 0, H * 0.6, Z - D / 2), L.box(0.42, 0.7, D, '#344AB2', -W / 2, H * 0.6, Z), L.box(0.42, 0.7, D, '#344AB2', W / 2, H * 0.6, Z));
    add(L.rbox(W + 0.8, 0.5, D + 0.8, '#B4B9C2', 0, H, Z, { r: 0.06 }));
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2, W + 0.8, 3, 1, false, Math.PI / 2), L.mat('#B4B9C2')); ridge.rotation.z = Math.PI / 2; ridge.scale.set(0.2, 1, 1); ridge.position.set(0, H + 0.5 + D * 0.05, Z); ridge.castShadow = true; add(ridge);
    for (let x = -W / 2 + 5; x < W / 2; x += 10) add(L.box(0.5, H, 0.5, '#9EA3AC', x, 0, Z + D / 2 - 0.3));
    add(L.box(W, 2.2, 0.3, '#D2D6DC', 0, H - 2.2, Z + D / 2)); // dintel frontal
    add(L.rbox(9, 1.3, 0.25, '#344AB2', -8, H - 1.9, Z + D / 2 + 0.2, { r: 0.05 }), L.box(5.5, 0.32, 0.06, '#FFFFFF', -8.6, H - 1.35, Z + D / 2 + 0.36), L.box(1.4, 0.32, 0.06, '#E2231A', -4.4, H - 1.35, Z + D / 2 + 0.36));
    [-13, -4, 5, 14].forEach(x => { add(L.dockDoor(x, 0, Z + D / 2 + 0.05, x === 5)); add(L.box(3.6, 0.35, 1.2, '#FFB703', x, 0, Z + D / 2 + 0.7)); for (let k = 0; k < 4; k++) add(L.box(0.45, 0.36, 1.22, '#1E1E22', x - 1.35 + k * 0.9, 0, Z + D / 2 + 0.7)); add(L.rbox(0.4, 0.6, 0.6, '#1E1E22', x - 2.1, 0, Z + D / 2 + 0.5, { r: 0.05 }), L.rbox(0.4, 0.6, 0.6, '#1E1E22', x + 2.1, 0, Z + D / 2 + 0.5, { r: 0.05 })); }); // niveladores + topes
    const accessDoor = add(L.rbox(1.2, 2.3, 0.15, '#2A2E3A', 18.5, 0, Z + D / 2 + 0.05, { r: 0.03 })); accessDoor.userData.dynamic = true;
    add(L.plane(0.4, 62, '#FFB703', -W / 2 + 0.6, 0.05, 8), L.plane(0.4, 62, '#FFB703', W / 2 - 0.6, 0.05, 8)); // franjas de seguridad
    add(L.plane(W, 0.5, '#FFB703', 0, 0.05, Z + D / 2 + 1.6));

    /* ---- Interior: pallets, estanterías, tablero, luminarias colgantes ---- */
    const pallets = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) pallets.push(add(L.pallet(-15 + c * 3.2, Z - 8 + r * 4.2, ['#C8A060', '#B8926A', '#D2B27C'][(r + c) % 3])));
    for (let c = 0; c < 4; c++) { add(L.box(6, 5, 1.2, '#4A4F5C', 6 + c * 7 - 4, 0, Z - 10), L.box(6, 0.15, 1.3, '#F04E23', 6 + c * 7 - 4, 2.4, Z - 10), L.box(6, 0.15, 1.3, '#F04E23', 6 + c * 7 - 4, 4.6, Z - 10)); for (let k = 0; k < 3; k++) add(L.rbox(1.2, 0.9, 1.0, L.pick(['#C8A060', '#344AB2', '#F1F1F1']), 6 + c * 7 - 4 - 2 + k * 2, 2.55, Z - 10, { r: 0.04 })); }
    const board = add(L.rbox(1.2, 1.6, 0.25, '#8E97A8', -19.6, 1.2, Z - 4, { r: 0.03 })); board.userData.heat = 0.25;
    add(L.crateStack(16, Z + 6, 3), L.crateStack(13.5, Z + 4, 2, '#F1F1F1'), L.coneT(-8, Z + 9), L.coneT(2, Z + 9.5));
    const inner = [[-12, Z - 4], [0, Z - 4], [12, Z - 4], [-12, Z + 5], [12, Z + 5]].map(([x, z]) => { const bulb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.5), new THREE.MeshStandardMaterial({ color: '#F2F2F2', emissive: '#FFF1D6', emissiveIntensity: 0 })); bulb.position.set(x, H - 0.4, z); bulb.userData.lampMesh = true; add(bulb); return ctx.lamp(new THREE.Vector3(x, H - 0.9, z), { intensity: 3.5, distance: 18, color: '#FFF1D6' }); });

    /* ---- Predio: cerco, portón, oficina, contenedores, tanques ---- */
    add(L.fence(-60, -40, 60, -40, 2.4), L.fence(-60, -40, -60, 50, 2.4), L.fence(60, -40, 60, 50, 2.4), L.fence(-60, 50, 30, 50, 2.4), L.fence(42, 50, 60, 50, 2.4));
    add(L.guardBooth(45, 46, Math.PI)); add(L.canopy(10, 7, 36, 45.5, 4.6, '#EDE9E1')); const barrier = add(L.barrier(31, 47.5, 0, 8)); const arm = barrier.getObjectByName('arm');
    add(L.pole(41, 44.5, 4.2)); const speedCam = add(L.mount(41, 4.3, 44.5, L.checkpoint(), Math.PI * 0.5, -0.3));
    add(L.road(10, 34, 36, 62, Math.PI / 2, '#4A4D55'), L.road(10, 40, 36, 30, Math.PI / 2, '#4A4D55', { edge: false }));
    add(L.zebra(10, 36, 40, Math.PI / 2), L.sign(42, 41, -Math.PI / 2, '#E2231A'), L.coneT(31.5, 42), L.bollard(30.5, 44.4), L.bollard(41.5, 49.5));
    add(L.building(16, 4.2, 9, -48, -22, '#E9E5DD', { floors: 1, cols: 5, band: '#344AB2' })); add(L.plane(8, 10, '#CFCAC0', -36, 0.03, -22)); // oficina administrativa
    [['#DDDDDD', -37, -19], ['#2B2F3A', -37, -25]].forEach(([c, x, z]) => { const v = add(L.car(c)); v.position.set(x, 0, z); });
    add(L.flag(ctx, -42, -14, ['#344AB2', '#FFFFFF'], 7), L.flag(ctx, -39, -14, ['#E2231A', '#FFFFFF'], 7), L.flowerbed(3, 1.2, -48, -16.5), L.bench(-52, -16.5, 0), L.bin(-44, -17));
    add(L.cyl(2.2, 2.2, 5, '#DADDE3', -50, 0, 8, 14), L.cyl(2.4, 2.4, 0.3, '#E2231A', -50, 5, 8, 14), L.cyl(1.4, 1.4, 4, '#F1F1F1', -50, 0, 16, 12)); // silos / tanque
    for (let i = 0; i < 4; i++) add(L.plane(0.25, 30, '#E8E4D0', -14 + i * 9.4, 0.035, 20));
    add(L.plane(60, 0.3, '#F5B400', -2, 0.035, 34), L.plane(60, 0.3, '#F5B400', -2, 0.035, 6));
    add(L.container(-44, 30, '#344AB2', 0, 2), L.container(-44, 34.5, '#E2231A', 0, 1), L.container(-30, 30, '#6B6464', 0, 1), L.container(-30, 34.5, '#F5B400', 0, 2), L.container(52, 2, '#344AB2', Math.PI / 2, 1), L.container(56, 2, '#F04E23', Math.PI / 2, 2));
    add(L.crateStack(-20, 40, 4), L.crateStack(-17, 40, 2, '#F1F1F1'), L.pallet(-14, 41, '#C8A060'), L.pallet(-12.6, 41, '#B8926A'));
    [[-40, 30, 0], [-10, 30, 0], [20, 30, 0], [-45, -20, Math.PI / 2], [50, -20, -Math.PI / 2], [50, 20, -Math.PI / 2]].forEach(([x, z, r]) => add(L.lampPost(ctx, x, z, 7, r, { double: true })));
    for (let x = -70; x <= 70; x += 12) { add(L.tree(x, -48, 1.4)); add(L.tree(x + 6, 58, 1.2)); }
    for (let z = -40; z <= 60; z += 14) { add(L.pine(-70, z, 1.8)); add(L.pine(70, z, 1.8)); }
    // Vecino: otro galpón lejano
    add(L.warehouse(30, 8, 18, 40, -70, '#C9C3B4', '#F04E23'));

    /* ---- Cámaras / dispositivos ---- */
    const colorvu = add(L.mount(-14.6, H - 1.4, Z + D / 2 - 0.6, L.camTurret(), Math.PI * 0.85, -0.55)); colorvu.scale.setScalar(1.4);
    const thermal = add(L.mount(W / 2 - 0.6, H - 1.2, Z + D / 2 - 1, L.camThermal(), -Math.PI * 0.7, -0.5));
    const minmoe = add(L.minmoe({ stand: false, big: false })); minmoe.position.set(19.5, 1.5, Z + D / 2 + 0.1);
    add(L.mount(-W / 2 + 0.6, H - 1.2, Z + D / 2 - 1, L.camBullet(), Math.PI * 0.7, -0.5));
    add(L.mount(0, H - 0.6, Z - D / 2 + 0.6, L.camBullet(), 0, -0.5));
    const nvr = add(L.nvrBox(46.4, 1.0, 46.5)); nvr.rotation.y = Math.PI;

    /* ---- Vehículos y personas ---- */
    const truck = add(L.truck('#E2231A')); truck.position.set(58, 0, 20); truck.rotation.y = Math.PI;
    const truck2 = add(L.truck('#3A6BD8')); truck2.position.set(5, 0, Z + D / 2 + 6.5); truck2.rotation.y = Math.PI / 2;
    const fork = add(L.forklift()); fork.position.set(-6, 0, Z + 6); const forkCam = L.dashcam(); forkCam.position.set(0.55, 2.05, 0); forkCam.rotation.y = Math.PI / 2; fork.add(forkCam);
    const worker = add(L.person('#F5B400', '#2B2F3A')); worker.position.set(22, 0, 8);
    const worker2 = add(L.person('#F5B400', '#2B2F3A')); worker2.position.set(-8, 0, Z + 3);
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;
    const dog = add(L.dog()); dog.visible = false;
    const hotPallet = pallets[9]; hotPallet.userData.dynamic = true;

    /* ---- Vida ambiente ---- */
    L.loopPath(ctx, add(L.truck('#F1F1F1', '#344AB2')), [[36, 80], [36, 40], [36, 22], [-20, 22], [-20, 80]], { speed: 6, pause: 2.5 });
    L.loopPath(ctx, add(L.forklift('#F04E23')), [[12, Z + 3], [22, Z + 3], [22, 12], [12, 12]], { speed: 2.4, pause: 1.5 });
    const w3 = add(L.person('#F5B400', '#2B2F3A')); L.loopPath(ctx, w3, [[-18, 9], [0, 9], [0, 4], [-18, 4]], { speed: 1.4, bob: true, pause: 2 });
    const chief = add(L.person('#FFFFFF', '#2B2F3A')); chief.position.set(-3, 0, Z + D / 2 + 3); L.idle(ctx, chief);
    add(L.birds(ctx, 0, 0, 70, 34, 5));

    const setInner = (dim) => inner.forEach(l => { l.dim = dim; });
    const reset = () => { setInner(1); ctx.setHeat(hotPallet, 0.14); truck.position.set(58, 0, 20); truck.rotation.y = Math.PI; arm.rotation.z = 0; fork.position.set(-6, 0, Z + 6); fork.rotation.y = 0; worker.position.set(22, 0, 8); accessDoor.position.y = 1.15; intruder.visible = dog.visible = false; };

    return {
      hotspots: [
        { id: 'wh_colorvu', target: colorvu, offsetY: 0.8, offset: [6, 3, 7] },
        { id: 'wh_thermal', target: thermal, offsetY: 0.7, offset: [-6, 3, 7] },
        { id: 'wh_speed', target: speedCam, offsetY: 0.7, offset: [6, 3, 7] },
        { id: 'wh_mdvr', target: fork, offsetY: 2.4, offset: [5, 3, 7] },
        { id: 'wh_access', target: minmoe, offsetY: 0.6, offset: [4, 2.5, 6] },
        { id: 'wh_acusense', target: nvr, offsetY: 1.2, offset: [-4, 2.5, -6] },
      ],
      actions: [
        { id: 'dark', icon: S.split, label: 'Apagar luminarias: IR vs ColorVu', desc: 'Galpón a oscuras. Deslizá el comparador: IR clásico a la izquierda, ColorVu a color a la derecha.',
          async run() {
            reset(); ctx.night(1, 1.6); await wait(600); setInner(0);
            ctx.focus([-6, 1, Z + 2], [16, 9, 18], 1.6);
            ctx.feed({ from: colorvu, lookAt: [-4, 0.6, Z - 6], mode: 'split', fov: 64, label: 'CAM 03 · ColorVu 4K F1.0', split: 0.5 });
            ctx.tag(colorvu, tagHTML(S.eye, 'ColorVu F1.0', 'Color real a 0,0005 lux · sin reflectores', 'ok'), { ttl: 4200, offsetY: 1 });
            const w = path(ctx, worker2, [[-2, Z - 2], [8, Z - 3]], { speed: 1.8, bob: true }); await done(w);
            const b = path(ctx, worker2, [[-8, Z + 3]], { speed: 2.2, bob: true }); await done(b);
          } },
        { id: 'fire', icon: S.flame, label: 'Foco de sobrecalentamiento', desc: 'Un pallet sube a 65 °C: la térmica alerta antes de que aparezca la llama.',
          async run() {
            reset(); ctx.focus([hotPallet.position.x, 1, hotPallet.position.z], [8, 6, 10], 1.6);
            ctx.feed({ from: thermal, lookAt: hotPallet, mode: 'th', fov: 40, label: 'HeatPro · Termografía' });
            const st = { t: 24 }; const tg = ctx.tag(hotPallet, tagHTML(S.thermo, '24 °C', 'Temperatura de superficie', ''), { ttl: 0, offsetY: 1.8 });
            const b = tg.el.querySelector('b');
            const tw = ctx.gsap.to(st, { t: 65, duration: 4.5, ease: 'power1.in', onUpdate: () => { b.textContent = `${st.t.toFixed(0)} °C`; ctx.setHeat(hotPallet, 0.14 + (st.t - 24) / 41 * 0.86); } }); ctx.tween(tw);
            await wait(4600); tg.remove();
            ctx.tag(hotPallet, tagHTML(S.alert, 'Alerta preventiva · 65 °C', 'Umbral superado · gradiente +9 °C/min', 'danger'), { ttl: 4200, offsetY: 1.8 });
            ctx.tag(thermal, tagHTML(S.bell, 'Evento → HikCentral', 'Bomberos internos notificados', 'danger'), { ttl: 4200, offsetY: 0.9 });
            await wait(3800); ctx.setHeat(hotPallet, 0.14);
          } },
        { id: 'speed', icon: S.gauge, label: 'Camión en playa: radar de velocidad', desc: 'El radar mide la velocidad y proyecta la infracción con captura de patente.',
          async run() {
            reset(); ctx.focus([36, 1, 34], [-12, 9, 14], 1.6);
            ctx.feed({ from: speedCam, lookAt: [36, 0.8, 20], mode: 'color', fov: 45, label: 'Checkpoint · Radar + ANPR' });
            const sp = { v: 0 }; const tg = ctx.tag(truck, tagHTML(S.gauge, '0 km/h', 'Límite interno 20 km/h', ''), { ttl: 0, offsetY: 3.6 }); const b = tg.el.querySelector('b');
            const tw = ctx.gsap.to(sp, { v: 35, duration: 3.2, ease: 'power1.out', onUpdate: () => { b.textContent = `${sp.v.toFixed(0)} km/h`; if (sp.v > 20) tg.el.classList.add('danger-tag'); } }); ctx.tween(tw);
            const d = path(ctx, truck, [[36, 20], [36, -6]], { speed: 8, ease: 'power1.in' }); await wait(3400); tg.remove();
            ctx.tag(truck, `<span class="plate">AF 789 HJ</span><span class="tag-tx"><b>35 km/h · exceso</b><small>Infracción registrada · 11:02</small></span>`, { ttl: 3600, offsetY: 3.6, cls: 'plate-tag danger-tag' });
            await done(d); ctx.feedOff();
          } },
        { id: 'mdvr', icon: S.truck, label: 'Autoelevador con MDVR + DSM', desc: 'Vista desde la cabina: ADAS, telemetría y detección de fatiga del operador.',
          async run() {
            reset(); ctx.focus([-2, 1, Z + 2], [12, 7, 14], 1.5);
            ctx.feed({ from: forkCam, lookAt: [40, 1.2, Z + 6], mode: 'dash', fov: 95, label: 'MDVR · Autoelevador 02' });
            const d = path(ctx, fork, [[4, Z + 6], [10, Z + 2], [16, Z + 2]], { speed: 2.4, ease: 'power1.inOut' });
            await wait(1400); ctx.tag(fork, tagHTML(S.check, 'DSM: operador atento', 'GPS · 6 km/h · geocerca OK', 'ok'), { ttl: 2600, offsetY: 2.5 });
            await wait(2600); ctx.tag(fork, tagHTML(S.alert, 'ADAS: peatón adelante', 'Alerta sonora en cabina', 'warn'), { ttl: 2600, offsetY: 2.5 });
            await done(d); await wait(400); ctx.feedOff();
          } },
        { id: 'access', icon: S.face, label: 'Acceso de personal al depósito', desc: 'Solo personal del turno: rostro validado y la puerta se destraba.',
          async run() {
            reset(); ctx.focus([20, 1, Z + D / 2 + 1], [5, 3, 7], 1.4);
            const w = path(ctx, worker, [[21, 4], [20.6, Z + D / 2 + 2.2]], { speed: 2.4, bob: true }); await done(w);
            ctx.tag(worker, `<span class="face-ring"></span>`, { ttl: 1500, offsetY: 1.75, cls: 'bare' }); await wait(1000);
            ctx.tag(minmoe, tagHTML(S.check, 'Turno mañana · autorizado', 'Operario 117 · 0,2 s', 'ok'), { ttl: 3000, offsetY: 0.6 });
            ctx.gsap.to(accessDoor.position, { y: 3.4, duration: 0.8, ease: 'power2.inOut' }); await wait(700);
            const w2 = path(ctx, worker, [[18.5, Z + D / 2 - 2]], { speed: 2.2, bob: true }); await done(w2);
            ctx.gsap.to(accessDoor.position, { y: 1.15, duration: 0.8 });
          } },
        { id: 'acusense', icon: S.eye, label: 'AcuSense: humano vs. animal', desc: 'De noche, un perro en el patio se ignora; un humano dispara la alerta.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-30, 1, 30], [14, 7, 14], 1.5);
            ctx.feed({ from: [-40, 6.6, 30], lookAt: [-30, 0.5, 22], mode: 'ir', fov: 60, label: 'CAM patio · AcuSense' });
            dog.visible = true; dog.position.set(-42, 0, 18); const d = path(ctx, dog, [[-30, 24], [-18, 20]], { speed: 3 }); await wait(1400);
            ctx.tag(dog, tagHTML(S.check, 'Animal · ignorado', 'Sin falsa alarma', 'ok'), { ttl: 2600, offsetY: 1 }); await done(d); dog.visible = false;
            intruder.visible = true; intruder.position.set(-44, 0, 26); const w = path(ctx, intruder, [[-32, 26], [-26, 22]], { speed: 2.2, bob: true }); await wait(1800);
            ctx.tag(intruder, tagHTML(S.alert, 'Humano · alerta', 'Notificación push + grabación', 'danger'), { ttl: 3200, offsetY: 2.3 }); await done(w);
            const b = path(ctx, intruder, [[-46, 28]], { speed: 4.5, bob: true }); await done(b); intruder.visible = false; ctx.feedOff();
          } },
      ],
      reset,
    };
  },
};
