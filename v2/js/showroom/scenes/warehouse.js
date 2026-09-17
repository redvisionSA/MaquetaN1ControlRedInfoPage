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
        { id: 'dark', icon: S.split, label: 'Apagar luminarias: IR vs ColorVu', desc: 'Galpón a oscuras. Deslizá el comparador: IR clásico a la izquierda, ColorVu F1.0 a color a la derecha.',
          async run() {
            reset(); ctx.night(1, 1.6);
            ctx.step(1, 3, 'Apagamos las luminarias del galpón: oscuridad total, como un turno noche sin actividad.'); await wait(700); setInner(0);
            ctx.focus([-6, 1, Z + 2], [16, 9, 18], 1.6); ctx.log('info', 'Luminarias del galpón apagadas', '0,001 lux en pasillos'); await wait(1200);
            ctx.step(2, 3, 'Comparador: a la izquierda una cámara IR clásica (blanco y negro); a la derecha ColorVu con apertura F1.0.');
            const cone = ctx.cone(colorvu, { fov: 64, aspect: 1.7, far: 16, color: '#F04E23' });
            ctx.feed({ from: colorvu, lookAt: [-4, 0.6, Z - 6], mode: 'split', fov: 64, label: 'CAM 03 · ColorVu 4K F1.0', split: 0.5 });
            ctx.tag(colorvu, tagHTML(S.eye, 'ColorVu F1.0', 'Color real a 0,0005 lux · sin reflectores', 'ok'), { ttl: 4200, offsetY: 1 });
            const fb = ctx.feedBox(worker2, { label: 'OPERARIO · CHALECO AMARILLO', cls: 'human' });
            const w = path(ctx, worker2, [[-2, Z - 2], [8, Z - 3]], { speed: 1.8, bob: true }); await wait(1600);
            ctx.step(3, 3, 'Con color real se distingue el uniforme, el color del paquete y la patente. Deslizá el comparador para verlo.');
            ctx.log('ok', 'ColorVu: identificación a color de noche', 'Sin reflectores ni luz ambiente'); await done(w);
            const b = path(ctx, worker2, [[-8, Z + 3]], { speed: 2.2, bob: true }); await done(b); fb.remove();
          } },
        { id: 'fire', icon: S.flame, label: 'Foco de sobrecalentamiento · térmica', desc: 'Un pallet sube a 65 °C: la termografía alerta antes de que aparezca la llama.',
          async run() {
            reset(); ctx.focus([hotPallet.position.x, 1, hotPallet.position.z], [10, 7, 12], 1.6);
            ctx.step(1, 4, 'La HeatPro hace termografía continua sobre pallets, tableros y motores: cada píxel es una temperatura.');
            const cone = ctx.cone(thermal, { fov: 40, aspect: 1.7, far: 16, color: '#FF6A00' });
            ctx.feed({ from: thermal, lookAt: hotPallet, mode: 'th', fov: 40, label: 'HeatPro · Termografía' }); ctx.log('info', 'Termografía activa · 18 zonas', 'Umbral 65 °C · gradiente 8 °C/min'); await wait(1600);
            const st = { t: 24 }; const tg = ctx.tag(hotPallet, tagHTML(S.thermo, '24 °C', 'Temperatura de superficie', ''), { ttl: 0, offsetY: 1.8 });
            const b = tg.el.querySelector('b'); const fb = ctx.feedBox(hotPallet, { label: '24 °C', cls: 'vehicle', w: 1.3, h: 1.4 }); let warned = false;
            ctx.step(2, 4, 'Un pallet con baterías empieza a calentarse: 24 → 65 °C en minutos, sin humo todavía.');
            const tw = ctx.gsap.to(st, { t: 65, duration: 4.5, ease: 'power1.in', onUpdate: () => { const T = st.t.toFixed(0); b.textContent = `${T} °C`; fb.set(`${T} °C`, st.t > 45 ? 'alert' : 'vehicle'); ctx.setHeat(hotPallet, 0.14 + (st.t - 24) / 41 * 0.86); if (!warned && st.t > 45) { warned = true; ctx.log('warn', 'Gradiente térmico +9 °C/min', 'Pallet B-09 · pre-alarma'); } } }); ctx.tween(tw);
            await wait(4600); tg.remove();
            ctx.step(3, 4, 'Umbral de 65 °C superado: alerta preventiva antes de que exista llama o humo.'); cone.color('#FF3B30');
            ctx.tag(hotPallet, tagHTML(S.alert, 'Alerta preventiva · 65 °C', 'Umbral superado · gradiente +9 °C/min', 'danger'), { ttl: 4200, offsetY: 1.8 }); ctx.log('danger', 'Alarma de temperatura · 65 °C', 'Pallet B-09 · pasillo 2');
            await wait(1800);
            ctx.step(4, 4, 'Evento a HikCentral y a la brigada interna con la imagen térmica: se retira el pallet antes del siniestro.');
            ctx.tag(thermal, tagHTML(S.bell, 'Evento → HikCentral', 'Bomberos internos notificados', 'danger'), { ttl: 4200, offsetY: 0.9 }); ctx.log('ok', 'Brigada notificada · pallet retirado', 'Sin incendio · 3 min');
            await wait(3000); ctx.setHeat(hotPallet, 0.14); fb.remove(); cone.color('#FF6A00'); ctx.feedOff();
          } },
        { id: 'speed', icon: S.gauge, label: 'Camión en playa: radar de velocidad', desc: 'El checkpoint mide la velocidad por radar y registra la infracción con patente.',
          async run() {
            reset(); ctx.focus([36, 1, 34], [-12, 9, 14], 1.6);
            ctx.step(1, 3, 'Checkpoint con radar en la playa: límite interno 20 km/h en la zona de docks.');
            const cone = ctx.cone(speedCam, { fov: 45, aspect: 1.7, far: 26, color: '#FFB703' });
            ctx.feed({ from: speedCam, lookAt: [36, 0.8, 20], mode: 'color', fov: 45, label: 'Checkpoint · Radar + ANPR' }); ctx.log('info', 'Checkpoint activo · límite 20 km/h', 'Radar 24 GHz + ANPR'); await wait(1200);
            const sp = { v: 0 }; const tg = ctx.tag(truck, tagHTML(S.gauge, '0 km/h', 'Límite interno 20 km/h', ''), { ttl: 0, offsetY: 3.6 }); const b = tg.el.querySelector('b');
            const fb = ctx.feedBox(truck, { label: 'CAMIÓN · 0 km/h', cls: 'vehicle', w: 9, h: 3.4 }); let over = false;
            ctx.step(2, 3, 'El camión acelera en la playa: el radar mide cada vehículo por separado.');
            const tw = ctx.gsap.to(sp, { v: 35, duration: 3.2, ease: 'power1.out', onUpdate: () => { const V = sp.v.toFixed(0); b.textContent = `${V} km/h`; fb.set(`CAMIÓN · ${V} km/h`, sp.v > 20 ? 'alert' : 'vehicle'); if (sp.v > 20) tg.el.classList.add('danger-tag'); if (!over && sp.v > 20) { over = true; cone.color('#FF3B30'); ctx.log('warn', 'Exceso de velocidad: 21 km/h', 'Playa de maniobras · carril 2'); } } }); ctx.tween(tw);
            const d = path(ctx, truck, [[36, 20], [36, -6]], { speed: 8, ease: 'power1.in' }); await wait(3400); tg.remove();
            ctx.step(3, 3, 'Infracción registrada con velocidad, patente y foto: auditoría de seguridad interna.');
            ctx.tag(truck, `<span class="plate">AF 789 HJ</span><span class="tag-tx"><b>35 km/h · exceso</b><small>Infracción registrada · 11:02</small></span>`, { ttl: 3600, offsetY: 3.6, cls: 'plate-tag danger-tag' });
            ctx.log('danger', 'Infracción: AF 789 HJ · 35 km/h', 'Foto + patente · aviso a supervisor');
            await done(d); fb.remove(); ctx.feedOff(); cone.color('#FFB703'); await wait(800);
          } },
        { id: 'mdvr', icon: S.truck, label: 'Autoelevador con MDVR + DSM', desc: 'Vista desde la cabina: ADAS, telemetría y detección de fatiga del operador.',
          async run() {
            reset(); ctx.focus([-2, 1, Z + 2], [12, 7, 14], 1.5);
            ctx.step(1, 3, 'MDVR a bordo con GPS y 4G: cámara frontal, cámara al operador (DSM) y grabación local.');
            ctx.feed({ from: forkCam, lookAt: [40, 1.2, Z + 6], mode: 'dash', fov: 95, label: 'MDVR · Autoelevador 02' }); ctx.log('info', 'Autoelevador 02 online', 'GPS · 4G · 4 canales'); await wait(1200);
            const d = path(ctx, fork, [[4, Z + 6], [10, Z + 2], [16, Z + 2]], { speed: 2.4, ease: 'power1.inOut' });
            await wait(1400); ctx.step(2, 3, 'DSM mira al operador: detecta fatiga, celular o distracción y avisa en cabina.');
            ctx.tag(fork, tagHTML(S.check, 'DSM: operador atento', 'GPS · 6 km/h · geocerca OK', 'ok'), { ttl: 2600, offsetY: 2.5 }); ctx.log('ok', 'DSM: operador atento', '6 km/h · dentro de geocerca');
            await wait(2600); ctx.step(3, 3, 'ADAS: peatón adelante → alarma sonora en cabina y evento a HikCentral Mobility.');
            ctx.tag(fork, tagHTML(S.alert, 'ADAS: peatón adelante', 'Alerta sonora en cabina', 'warn'), { ttl: 2600, offsetY: 2.5 }); ctx.log('warn', 'ADAS: peatón a 3 m', 'Alarma en cabina · velocidad reducida');
            await done(d); await wait(600); ctx.feedOff();
          } },
        { id: 'access', icon: S.face, label: 'Acceso de personal al depósito', desc: 'Solo personal del turno: rostro validado y la puerta se destraba.',
          async run() {
            reset(); ctx.focus([20, 1, Z + D / 2 + 1], [5, 3, 7], 1.4);
            ctx.step(1, 3, 'Terminal MinMoe en la puerta de personal: rostro, tarjeta o QR según el turno asignado.');
            const cone = ctx.cone(minmoe, { fov: 80, aspect: 1.3, far: 2.2, color: '#6E85EE' });
            const w = path(ctx, worker, [[21, 4], [20.6, Z + D / 2 + 2.2]], { speed: 2.4, bob: true }); await done(w);
            ctx.step(2, 3, 'Rostro vivo verificado en 0,2 s y turno vigente: la cerradura se libera.');
            ctx.tag(worker, `<span class="face-ring"></span>`, { ttl: 1500, offsetY: 1.75, cls: 'bare' }); await wait(1000);
            ctx.tag(minmoe, tagHTML(S.check, 'Turno mañana · autorizado', 'Operario 117 · 0,2 s', 'ok'), { ttl: 3000, offsetY: 0.6 }); cone.color('#3DD68C'); ctx.log('ok', 'Acceso: operario 117', 'Turno mañana · puerta personal');
            ctx.gsap.to(accessDoor.position, { y: 3.4, duration: 0.8, ease: 'power2.inOut' }); await wait(700);
            const w2 = path(ctx, worker, [[18.5, Z + D / 2 - 2]], { speed: 2.2, bob: true }); await done(w2);
            ctx.step(3, 3, 'Presentismo automático y control de aforo: quién está adentro en cada momento.');
            ctx.gsap.to(accessDoor.position, { y: 1.15, duration: 0.8 }); ctx.log('info', 'Presentismo: 23 personas en planta', 'Aforo máximo 40'); await wait(2000);
          } },
        { id: 'acusense', icon: S.eye, label: 'AcuSense: humano vs. animal', desc: 'De noche, un perro en el patio se ignora; un humano dispara la alerta.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-30, 1, 30], [14, 7, 14], 1.5);
            ctx.step(1, 4, 'Cámara AcuSense sobre el patio de contenedores con regla de intrusión nocturna.');
            ctx.feed({ from: [-40, 6.6, 30], lookAt: [-30, 0.5, 22], mode: 'ir', fov: 60, label: 'CAM patio · AcuSense' }); ctx.log('info', 'CAM patio · regla de intrusión', '22:00–06:00 · IR 60 m'); await wait(1400);
            dog.visible = true; dog.position.set(-42, 0, 18); const d = path(ctx, dog, [[-30, 24], [-18, 20]], { speed: 3 }); const fbd = ctx.feedBox(dog, { label: 'ANIMAL', cls: 'animal', w: 0.9, h: 0.7 }); await wait(1400);
            ctx.step(2, 4, 'Un perro cruza el patio: clasificado como animal, la alarma no se dispara.');
            ctx.tag(dog, tagHTML(S.check, 'Animal · ignorado', 'Sin falsa alarma', 'ok'), { ttl: 2600, offsetY: 1 }); ctx.log('ok', 'Movimiento: animal', 'Filtrado por AcuSense'); await done(d); dog.visible = false; fbd.remove();
            intruder.visible = true; intruder.position.set(-44, 0, 26); const w = path(ctx, intruder, [[-32, 26], [-26, 22]], { speed: 2.2, bob: true }); const fb = ctx.feedBox(intruder, { label: 'HUMANO', cls: 'human' }); await wait(1800);
            ctx.step(3, 4, 'Un humano entra a la zona: alerta inmediata con clip al guardia y al NVR.'); fb.set('INTRUSIÓN · HUMANO', 'alert');
            ctx.tag(intruder, tagHTML(S.alert, 'Humano · alerta', 'Notificación push + grabación', 'danger'), { ttl: 3200, offsetY: 2.3 }); ctx.log('danger', 'Intrusión: humano en patio', 'Push + grabación de evento'); await done(w);
            ctx.step(4, 4, 'El guardia interviene con la evidencia en mano; ninguna falsa alarma en toda la noche.');
            const b = path(ctx, intruder, [[-46, 28]], { speed: 4.5, bob: true }); await done(b); intruder.visible = false; fb.remove(); ctx.feedOff(); ctx.log('ok', 'Evento cerrado', '0 falsas alarmas esta noche'); await wait(1600);
          } },
      ],
      reset,
    };
  },
};
