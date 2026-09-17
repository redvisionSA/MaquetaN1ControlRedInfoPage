/* =====================================================================
   Escena 1 — Oficinas y edificios corporativos
   Identidad: parque empresarial prolijo — azul Control Red, blanco,
   veredas claras, canteros con flores, banderas, gente que entra y sale.
   ===================================================================== */
import { S, path, strobe, wait, done, tagHTML } from './common.js';

export default {
  id: 'office',
  camera: { pos: [36, 24, 44], target: [2, 1, 8], maxDistance: 120 },
  glb: null,
  build(ctx) {
    const { lib: L, add, THREE } = ctx;
    add(L.ground(240, '#8FBA78', { color2: '#6F9E5A', amount: 0.22, scale: 0.05 }));

    /* ---- Calle principal (z=30) con veredas, cordones, cebra y luminarias dobles ---- */
    add(L.road(10, 160, 0, 30), L.sidewalk(160, 3, 0, 23.5), L.sidewalk(160, 3, 0, 36.5));
    add(L.curb(160, 0, 25.1, 0), L.curb(160, 0, 34.9, 0));
    add(L.zebra(10, -8, 30, Math.PI / 2));
    add(L.road(6, 12, 16, 19.5, 0, '#4A4D55', { dashed: false, edge: false }));
    for (let x = -60; x <= 60; x += 15) { if (x > 8 && x < 26) continue; add(L.tree(x, 22.2, 1.1)); add(L.tree(x + 7, 38, 1.0)); }
    [[-30, 28.4], [-2, 28.4], [30, 28.4]].forEach(([x, z]) => add(L.lampPost(ctx, x, z, 6, Math.PI / 2, { double: true })));
    add(L.bin(-9.5, 24.5), L.bin(24, 24.5), L.sign(10.5, 24.6, Math.PI, '#344AB2'));
    // Edificios vecinos para dar escala (fondo)
    add(L.building(18, 8, 12, -46, 48, '#DCDFE6', { floors: 2, cols: 5, band: '#6B6464', roofColor: '#A8ACB5' }));
    add(L.building(22, 6, 12, 44, 48, '#E8E1D3', { floors: 1, cols: 6, band: null, roofColor: '#B9B5AD' }));
    add(L.building(14, 11, 12, 6, 50, '#CFD5E2', { floors: 3, cols: 4, band: '#344AB2', roofColor: '#A8ACB5' }));
    for (let x = -60; x <= 60; x += 9) add(L.pine(x, 60, 1.6 + (Math.abs(x) % 3) * 0.3));

    /* ---- Parking con dársenas, autos estacionados y canteros ---- */
    add(L.plane(36, 16, '#4E525B', 0, 0.02, 11));
    add(L.parkingLines(6, 0, 15, 0, 5, 5.2), L.parkingLines(2, -12, 6.6, 0, 5, 5.2), L.parkingLines(2, 12, 6.6, 0, 5, 5.2));
    add(L.curb(36, 0, 19.1, Math.PI / 2), L.curb(16, -18.2, 11, 0), L.curb(16, 18.2, 11, 0));
    add(L.plane(0.25, 16, '#FFB703', -17.6, 0.035, 11), L.plane(0.25, 16, '#FFB703', 17.6, 0.035, 11));
    [['#3A6BD8', -10], ['#DDDDDD', 5], ['#6B6464', 10], ['#E2231A', -15]].forEach(([c, x]) => { const car = add(L.car(c)); car.position.set(x, 0, 15.2); car.rotation.y = -Math.PI / 2; });
    const parked = add(L.car('#F5B400')); parked.position.set(-12, 0, 9.2); parked.rotation.y = Math.PI / 2;
    add(L.flowerbed(3, 1.4, -14, 2.6), L.flowerbed(3, 1.4, 14, 2.6));
    add(L.bikeRack(-16.5, 4.2, Math.PI / 2), L.bollard(-6.2, 8.4), L.bollard(6.2, 8.4));

    /* ---- Edificio de 1 planta + hall vidriado + cartel Control Red ---- */
    add(L.building(28, 5.2, 14, 0, -8, '#EDE9E1', { floors: 1, cols: 9, band: '#344AB2' }));
    add(L.rbox(10, 3.6, 4, '#DDE6F0', 0, 0, 1, { roughness: 0.15, transparent: true, opacity: 0.45, r: 0.1 }));
    add(L.rbox(11, 0.32, 4.6, '#B9B5AD', 0, 3.6, 1, { r: 0.05 }));
    add(L.rbox(7, 1.1, 0.25, '#344AB2', 0, 4.1, 3.3, { r: 0.05 }), L.box(4.2, 0.28, 0.06, '#FFFFFF', -0.6, 4.55, 3.44), L.box(1.2, 0.28, 0.06, '#E2231A', 2.3, 4.55, 3.44));
    add(L.plane(12, 6, '#D6D1C6', 0, 0.03, 4.9)); // explanada
    add(L.hedge(7, -9.8, 0.6, Math.PI / 2, 0.9), L.hedge(7, 9.8, 0.6, Math.PI / 2, 0.9));
    add(L.planter(-5.6, 3.2), L.planter(5.6, 3.2), L.bench(-7.6, 7.2, Math.PI), L.bench(7.6, 7.2, Math.PI));
    add(L.flag(ctx, -6.5, 1.3, ['#344AB2', '#FFFFFF'], 7), L.flag(ctx, 6.5, 1.3, ['#E2231A', '#FFFFFF'], 7));
    // Techo: equipos de aire y tanque
    add(L.rbox(2.2, 0.9, 1.6, '#C9CDD6', 6, 5.55, -10, { r: 0.05 }), L.rbox(2.2, 0.9, 1.6, '#C9CDD6', 9, 5.55, -10, { r: 0.05 }), L.cyl(1.1, 1.1, 1.4, '#DADDE3', -10, 5.55, -12, 12));
    // Patio trasero con mesas y sombrillas
    add(L.plane(16, 7, '#D6D1C6', -4, 0.03, -18.5), L.umbrella(-9, -18.5), L.umbrella(-3, -19, '#344AB2'), L.umbrella(3, -18, '#E2231A'), L.hedge(16, -4, -22.4, Math.PI / 2, 1.1), L.bench(-6, -17, 0), L.bench(0, -17, 0));
    for (let i = 0; i < 4; i++) add(L.tree(-22 + i * 2.2, -24, 0.9)); add(L.tree(24, -20, 1.3), L.tree(-24, -14, 1.2), L.rock(22, -14, 1.2), L.bush(20, -17), L.bush(-21, -8));

    /* ---- Sala técnica (rack + NVR + monitores) con frente de vidrio ---- */
    add(L.rbox(6, 3.2, 5, '#E1DDD5', -19, 0, 3, { r: 0.08 }), L.rbox(6.4, 0.3, 5.4, '#B9B5AD', -19, 3.2, 3, { r: 0.05 }), L.box(6.5, 0.4, 5.5, '#344AB2', -19, 2.6, 3));
    add(L.box(5.6, 2.6, 0.08, '#CFE3F2', -19, 0.3, 5.55, { roughness: 0.1, transparent: true, opacity: 0.35 }));
    const rack = add(L.rack(-20.6, 1.5)); const nvr = add(L.nvrBox(-18.4, 1.2, 1.6)); add(L.rbox(1.2, 1.1, 0.6, '#2A2E3A', -18.4, 0, 1.6, { r: 0.03 }));
    add(L.screenPanel(-17.6, 1.9, 1.2, 0.25), L.screenPanel(-19.3, 1.9, 1.0, -0.1)); const hub = add(L.axHub()); hub.position.set(-21.4, 2.0, 2.2); hub.rotation.y = Math.PI / 2;
    add(L.person('#344AB2', '#2B2F3A')).position.set(-18.4, 0, 3.6); // operador

    /* ---- Garita y barrera ---- */
    add(L.guardBooth(20, 21.5)); add(L.canopy(8, 6, 16, 20.5, 4.2, '#EDE9E1'));
    const barrier = add(L.barrier(13.2, 21, 0, 5.2)); const arm = barrier.getObjectByName('arm');
    add(L.coneT(19, 17.5), L.bollard(12.4, 17.6), L.bollard(19.6, 17.6), L.sign(21.8, 18.6, -Math.PI / 2, '#E2231A'));
    [[-26, 20], [-26, 8], [26, 8], [26, 2]].forEach(([x, z]) => add(L.tree(x, z, 1.25)));
    add(L.lampPost(ctx, -14, 19.3, 5, Math.PI / 2), L.lampPost(ctx, 6, 19.3, 5, Math.PI / 2), L.lampPost(ctx, -24, 3, 4.5, 0));

    /* ---- Acceso peatonal: tótem MinMoe + speed gate ---- */
    const gate = add(L.speedGate(2.4, 4.2, 0)); const wingL = gate.getObjectByName('wingL'), wingR = gate.getObjectByName('wingR'), led = gate.getObjectByName('led');
    const totem = add(L.totem(3.4, 5.3, 0)); const screen = totem.getObjectByName('screen');
    add(L.rbox(0.4, 1.0, 0.4, '#F4F5F7', -0.5, 0, 4.2, { r: 0.04 }));

    /* ---- Cámaras y alarma ---- */
    const hybrid = add(L.mount(14.2, 4.8, 0.2, L.camBullet(), -Math.PI / 4, -0.35));
    const hybridLight = L.spot('#FFFFFF', 0, 0.42, 32); hybridLight.position.set(14.2, 4.8, 0.2); hybridLight.target.position.set(6, 0.5, 8); add(hybridLight, hybridLight.target);
    const lpr = add(L.mount(15.7, 3.4, 24.5, L.camANPR(), 0, -0.25)); add(L.pole(15.7, 24.5, 3.5));
    add(L.mount(-14.3, 4.8, 0.2, L.camTurret(), Math.PI / 4, -0.4));
    add(L.mount(0, 5.5, -15.1, L.camTurret(), Math.PI, -0.5));
    add(L.mount(20, 2.7, 22.9, L.camBullet(), -Math.PI * 0.75, -0.3));
    const siren = add(L.siren(-12.5, 4.3, -0.9)); siren.userData.dynamic = true; const pir = add(L.mount(-6, 4.4, -15.1, L.pirCam(), Math.PI, -0.3));

    /* ---- Actores de las simulaciones ---- */
    const car = add(L.car('#B8362E', 'AE 123 CD')); car.position.set(16, 0, 42); car.rotation.y = Math.PI / 2;
    const employee = add(L.person('#3A6BD8')); employee.position.set(-4, 0, 13);
    const redJacket = add(L.person('#D92D20', '#2B2F3A')); redJacket.visible = false;
    const intruder = add(L.person('#2B2F3A', '#1A1C24')); intruder.visible = false;
    const intruder2 = add(L.person('#2B2F3A', '#1A1C24')); intruder2.visible = false;

    /* ---- Vida ambiente: tráfico, peatones, pájaros ---- */
    L.loopPath(ctx, add(L.car('#DDDDDD')), [[-80, 27.6], [80, 27.6], [80, 80], [-80, 80]], { speed: 9 });
    L.loopPath(ctx, add(L.car('#2B2F3A')), [[80, 32.4], [-80, 32.4], [-80, 80], [80, 80]], { speed: 8 });
    L.loopPath(ctx, add(L.truck('#344AB2', '#F1F1F1')), [[-90, 27.2], [90, 27.2], [90, 90], [-90, 90]], { speed: 6.5 });
    L.loopPath(ctx, add(L.person('#F5B400', '#4A4F66')), [[-40, 23.6], [12, 23.6], [12, 26], [-40, 26]], { speed: 1.5, bob: true });
    L.loopPath(ctx, add(L.person('#EE6FA5', '#2B2F3A')), [[40, 36.6], [-20, 36.6], [-20, 34.5], [40, 34.5]], { speed: 1.3, bob: true });
    L.loopPath(ctx, add(L.person('#6B6464', '#2B2F3A')), [[-9, 6.5], [-9, 12], [9, 12], [9, 6.5]], { speed: 1.2, bob: true, pause: 3 });
    const sitter = add(L.person('#4E8C3E', '#2B2F3A')); sitter.position.set(-6.8, 0, 6.6); L.idle(ctx, sitter);
    add(L.birds(ctx, 0, 0, 55, 30, 6));

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
        { id: 'hybrid', icon: S.moon, label: 'Intruso nocturno · Smart Hybrid Light', desc: 'IR invisible por defecto; al clasificar un humano enciende luz blanca y graba a color.',
          async run() {
            reset(); ctx.night(1, 1.6); ctx.focus([8, 1, 5], [15, 9, 14], 1.6);
            ctx.step(1, 4, 'De noche la cámara vigila en infrarrojo: luz invisible, imagen en blanco y negro.');
            const cone = ctx.cone(hybrid, { fov: 62, aspect: 1.7, far: 15, color: '#6E85EE' });
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'ir', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
            ctx.log('info', 'CAM 01 en modo IR', 'Luz IR 40 m · 0 lux'); await wait(1800);
            intruder.visible = true; intruder.position.set(24, 0, 4);
            const walk = path(ctx, intruder, [[12, 6], [2, 7]], { speed: 2.2, bob: true });
            await wait(2200);
            ctx.step(2, 4, 'AcuSense clasifica el objetivo: es un humano, no un auto, un perro ni una rama.');
            const fb = ctx.feedBox(intruder, { label: 'HUMANO 97 %', cls: 'human' });
            ctx.log('warn', 'AcuSense: humano en zona de intrusión', 'Regla: perímetro oficinas · fuera de horario'); await wait(1500);
            ctx.step(3, 4, 'Smart Hybrid Light: enciende luz blanca, el video pasa a color y disuade al intruso.');
            ctx.tag(hybrid, tagHTML(S.eye, 'Luz blanca ON', 'Grabando a todo color', 'warn'), { ttl: 3800, offsetY: 0.9 });
            ctx.gsap.to(hybridLight, { intensity: 140, duration: 0.25 }); cone.color('#FFE7B8');
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'cv', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
            fb.set('INTRUSIÓN · HUMANO', 'alert'); ctx.log('danger', 'Intrusión confirmada · clip a color', 'Push a Hik-Connect · sirena de la cámara');
            await done(walk); await wait(800);
            ctx.step(4, 4, 'Se retira: la luz se apaga sola y la cámara vuelve al IR discreto.');
            ctx.gsap.to(hybridLight, { intensity: 0, duration: 0.8 }); intruder.visible = false; fb.remove(); cone.color('#6E85EE');
            ctx.feed({ from: hybrid, lookAt: [6, 0.6, 8], mode: 'ir', fov: 62, label: 'CAM 01 · Smart Hybrid Light' });
            ctx.log('ok', 'Vuelve a modo IR', 'Evento cerrado · 00:42 de clip'); await wait(2200);
          } },
        { id: 'access', icon: S.face, label: 'Acceso peatonal MinMoe + speed gate', desc: 'Rostro vivo validado en 0,2 s; el molinete abre y registra la asistencia.',
          async run() {
            reset(); ctx.focus([2.6, 1, 4.4], [5, 3, 6.5], 1.4);
            ctx.step(1, 4, 'El empleado se acerca al terminal MinMoe: reconoce el rostro entre 0,3 y 2 m, incluso con barbijo.');
            const cone = ctx.cone(totem, { fov: 80, aspect: 1.3, far: 2.4, color: '#6E85EE' });
            const w = path(ctx, employee, [[3.4, 9], [3.4, 6.4]], { speed: 2.4, bob: true }); await done(w);
            ctx.step(2, 4, 'Detección de rostro vivo (anti-spoofing): descarta fotos, videos y máscaras.');
            ctx.tag(employee, `<span class="face-ring"></span>`, { ttl: 1600, offsetY: 1.75, cls: 'bare' }); ctx.log('info', 'MinMoe: rostro detectado', 'Liveness OK · lente dual 2 MP'); await wait(1100);
            ctx.step(3, 4, 'Comparación en 0,2 s contra 6.000 rostros locales: LED verde y las alas de vidrio se abren.');
            screen.material.emissive.set('#3DD68C'); screen.material.emissiveIntensity = 1.4; led.material.emissive.set('#3DD68C'); cone.color('#3DD68C');
            ctx.tag(totem, tagHTML(S.check, 'Rostro verificado · 0,2 s', 'Empleado 0042 · Anti-spoofing OK', 'ok'), { ttl: 3200, offsetY: 1.9 });
            ctx.log('ok', 'Acceso concedido · Empleado 0042', 'Speed gate: apertura 0,3 s');
            ctx.gsap.to(wingL.rotation, { y: -1.25, duration: 0.45, ease: 'power3.out' }); ctx.gsap.to(wingR.rotation, { y: 1.25, duration: 0.45, ease: 'power3.out' });
            await wait(400);
            const w2 = path(ctx, employee, [[2.4, 4.2], [1.4, 1.6], [0, -0.6]], { speed: 2.2, bob: true }); await done(w2);
            ctx.step(4, 4, 'Registro de asistencia en HikCentral; anti-tailgating por IR: sólo pasa una persona por validación.');
            ctx.gsap.to(wingL.rotation, { y: 0, duration: 0.5 }); ctx.gsap.to(wingR.rotation, { y: 0, duration: 0.5 });
            led.material.emissive.set('#E2231A'); screen.material.emissive.set('#4A62D6'); screen.material.emissiveIntensity = 0.5; cone.color('#6E85EE');
            ctx.log('ok', 'Asistencia registrada · 08:03', 'Turno mañana · HikCentral Access'); await wait(2200);
          } },
        { id: 'acuseek', icon: S.search, label: 'AcuSeek: "persona con campera roja"', desc: 'El NVR DeepinMind indexa atributos y devuelve el clip exacto con lenguaje natural.',
          async run() {
            reset(); ctx.focus([-18.4, 1.4, 1.6], [4, 2.6, 6], 1.4);
            ctx.step(1, 3, 'Escribís la búsqueda en lenguaje natural en el NVR DeepinMind, sin filtros ni horarios.');
            const t = ctx.tag(nvr, `<span class="tag-ic">${S.search}</span><span class="tag-tx"><b class="typed" data-text="persona con campera roja"></b><small>AcuSeek · NVR DeepinMind</small></span>`, { ttl: 4200, offsetY: 1.2 });
            const el = t.el.querySelector('.typed'); const txt = el.dataset.text; for (let i = 1; i <= txt.length; i++) { el.textContent = txt.slice(0, i); await wait(45); }
            ctx.log('info', 'Consulta AcuSeek', '"persona con campera roja" · 16 canales · últimas 24 h'); await wait(600);
            ctx.step(2, 3, 'El NVR ya indexó cada persona por color y tipo de ropa, sentido y hora: responde en segundos.');
            el.parentElement.querySelector('small').textContent = '3 coincidencias · 14:32 · 11:07 · 09:41'; ctx.log('ok', '3 coincidencias en 1,2 s', 'CAM 02 14:32 · CAM 05 11:07 · CAM 02 09:41');
            await wait(1400);
            ctx.step(3, 3, 'Reproducción del clip con el atributo resaltado; exportable con un click.');
            ctx.focus([-2, 1, 1], [8, 5, 10], 1.6);
            redJacket.visible = true; redJacket.position.set(-13, 0, 6.5);
            ctx.feed({ from: [-14.3, 4.8, 0.2], lookAt: [-2, 0.5, 6.5], mode: 'color', fov: 58, label: 'CAM 02 · Clip 14:32:07' });
            const fb = ctx.feedBox(redJacket, { label: 'CAMPERA ROJA · 98 %', cls: 'human' });
            const w = path(ctx, redJacket, [[-2, 6.5], [9, 6.5]], { speed: 2.4, bob: true });
            await wait(1200); ctx.tag(redJacket, tagHTML(S.check, 'Coincidencia 98 %', 'Campera roja · 14:32:07', 'ok'), { ttl: 3600, offsetY: 2.3 });
            await done(w); redJacket.visible = false; fb.remove(); ctx.feedOff(); ctx.log('ok', 'Clip exportado', '14:32:00–14:32:18 · marca de agua');
          } },
        { id: 'lpr', icon: S.car, label: 'Ingreso vehicular ANPR + barrera', desc: 'Lee la patente en <100 ms, valida lista blanca y abre la barrera sin frenar el auto.',
          async run() {
            reset(); ctx.focus([15, 1, 22], [9, 5, 9], 1.4);
            ctx.step(1, 4, 'Zona de lectura ANPR: la cámara DeepinView cubre el carril a 4–8 m del pórtico.');
            const cone = ctx.cone(lpr, { fov: 40, aspect: 1.7, far: 12, color: '#FFB703' });
            ctx.feed({ from: lpr, lookAt: [16, 0.6, 30], mode: 'color', fov: 40, label: 'CAM ANPR · Pórtico' }); await wait(1400);
            const drive = path(ctx, car, [[16, 26.5]], { speed: 5.5, ease: 'power1.out' });
            const fb = ctx.feedBox(car, { label: 'VEHÍCULO', cls: 'vehicle', w: 4.4, h: 2.2 });
            await wait(1100);
            ctx.step(2, 4, 'Patente leída en 98 ms con marca y color; se compara con la lista blanca del edificio.');
            fb.set('AE 123 CD · LISTA BLANCA', 'plate');
            ctx.tag(car, `<span class="plate">AE 123 CD</span><span class="tag-tx"><b>Lista blanca</b><small>Sedán · rojo · 98 ms</small></span>`, { ttl: 3800, offsetY: 1.9, cls: 'plate-tag' });
            ctx.log('ok', 'ANPR: AE 123 CD', 'Lista blanca · sedán rojo · 98 ms'); await wait(600);
            ctx.step(3, 4, 'La salida de relé de la cámara levanta la barrera: el auto no frena.');
            ctx.gsap.to(arm.rotation, { z: 1.45, duration: 1.1, ease: 'power2.inOut' }); ctx.log('ok', 'Barrera: apertura por relé', 'DS-TMG4B0 · 3 s');
            await done(drive);
            const drive2 = path(ctx, car, [[16, 14], [10, 13]], { speed: 5, ease: 'power1.inOut' });
            await wait(1400); ctx.step(4, 4, 'Ingreso registrado con foto y hora; la barrera baja por lazo de seguridad.');
            ctx.gsap.to(arm.rotation, { z: 0, duration: 1.2, ease: 'power2.inOut' }); ctx.log('info', 'Ingreso registrado · dársena 7', 'Foto + patente · HikCentral');
            await done(drive2); fb.remove(); ctx.feedOff(); await wait(600);
          } },
        { id: 'axpro', icon: S.bell, label: 'Intrusión fuera de turno · AX PRO', desc: 'Sistema armado: el PIR-Cam verifica con foto y dispara sirena + strobe antes de que entren.',
          async run() {
            reset(); ctx.night(1, 1.4); ctx.focus([-6, 1, -16], [-8, 5, -12], 1.5);
            ctx.step(1, 4, 'Fuera de horario el panel AX PRO queda armado en modo ausente: detectores, sirena y app conectados por Tri-X.');
            const cone = ctx.cone(pir, { fov: 90, aspect: 1.4, far: 12, color: '#8B5CF6' });
            ctx.log('info', 'AX PRO armado · modo ausente', '21:30 · 6 zonas · batería OK'); await wait(1600);
            intruder2.visible = true; intruder2.position.set(-14, 0, -24);
            const w = path(ctx, intruder2, [[-6, -18]], { speed: 2, bob: true }); await done(w);
            ctx.step(2, 4, 'El PIR-Cam detecta movimiento en la zona 3 y toma una foto de verificación.');
            ctx.tag(pir, tagHTML(S.eye, 'PIR-Cam: movimiento', 'Foto de verificación enviada a la app', 'warn'), { ttl: 3800, offsetY: 0.8 }); cone.color('#FFB703');
            ctx.log('warn', 'Zona 3 · PIR-Cam: movimiento', 'Foto enviada a Hik-Connect'); await wait(1500);
            ctx.step(3, 4, 'Verificación visual desde el celular: sirena 110 dB + strobe y aviso a la central de monitoreo.');
            ctx.tag(siren, tagHTML(S.bell, 'Sirena 110 dB + strobe', 'Evento a central y Hik-Connect', 'danger'), { ttl: 4200, offsetY: 0.8 });
            const st = strobe(ctx, siren, { times: 14, period: 0.22 }); cone.color('#FF6B6B');
            ctx.log('danger', 'Alarma de intrusión · sirena + strobe', 'Central de monitoreo notificada'); await wait(700);
            const run = path(ctx, intruder2, [[-16, -26]], { speed: 4.5, bob: true }); await done(run); intruder2.visible = false;
            ctx.step(4, 4, 'El intruso se retira sin entrar: queda el registro con fotos y horarios.'); ctx.log('ok', 'Evento cerrado', '2 fotos · sin daños'); await done(st);
          } },
        { id: 'network', icon: S.net, label: 'Diagnóstico de red PoE', desc: 'Topología, watchdog PoE y reinicio remoto desde Hik-Partner Pro.',
          async run() {
            ctx.focus([-20.6, 1.2, 1.5], [3.5, 2.2, 6], 1.3);
            ctx.step(1, 3, 'Un switch PoE gestionable alimenta las 8 cámaras y muestra la topología en Hik-Partner Pro.'); await wait(1200);
            ctx.tag(rack, tagHTML(S.net, 'Switch DS-3E1310P-SI', 'PoE 84 W / 110 W · 8 cámaras online', 'ok'), { ttl: 3200, offsetY: 2.2 }); ctx.log('ok', 'Switch PoE: 8/8 cámaras online', '84 W de 110 W');
            await wait(2200);
            ctx.step(2, 3, 'Watchdog PoE: si una cámara deja de responder, el puerto se reinicia solo.');
            ctx.tag(rack, tagHTML(S.alert, 'Watchdog: CAM 04 sin respuesta', 'Reinicio PoE automático…', 'warn'), { ttl: 2600, offsetY: 2.2 }); ctx.log('warn', 'CAM 04 sin respuesta', 'Watchdog: reinicio del puerto 4');
            await wait(2600);
            ctx.step(3, 3, 'Restablecida sin ir al sitio; el instalador recibe el aviso en la app.');
            ctx.tag(rack, tagHTML(S.check, 'CAM 04 restablecida', 'Sin intervención en sitio', 'ok'), { ttl: 2800, offsetY: 2.2 }); ctx.log('ok', 'CAM 04 online', 'Tiempo caído: 48 s'); await wait(2400);
          } },
      ],
      reset,
    };
  },
};
