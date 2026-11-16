/* eslint-disable */
/**
 * montar.js — la vitrina de la web v1 (hero 3D + showroom de tecnologias).
 * -----------------------------------------------------------------------
 * GENERADO desde legado/index-v1.html (scripts de spotlight, revelado GSAP,
 * fondo de particulas, emblema 3D del hero y showroom Hikvision) con
 * scripts/generar-montar.mjs. El codigo es el de la v1 con cuatro cambios
 * para vivir dentro de la SPA:
 *   - three (r128, la misma version que la v1) y gsap vienen de npm y solo
 *     los descarga el inicio (WebGL solo en "/");
 *   - cada listener de window/document, observer y requestAnimationFrame se
 *     registra para soltarse al salir del inicio (montarVitrina devuelve la
 *     funcion de limpieza);
 *   - el lienzo de particulas se crea aca y se quita al salir;
 *   - el tema lo maneja React (Tema.jsx) y avisa con el evento 'themechange'.
 * Para cambiar la vitrina, editar este archivo directamente (la v1 queda
 * como referencia historica).
 */
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function montarVitrina(raiz) {
  var vivo = true
  var limpiezas = []
  function on(destino, evento, fn, opciones) {
    destino.addEventListener(evento, fn, opciones)
    limpiezas.push(function () { destino.removeEventListener(evento, fn, opciones) })
  }
  /* Observers y cuadros de animacion que se apagan solos al desmontar */
  var IO = window.IntersectionObserver
  var RO = window.ResizeObserver
  function IntersectionObserver(fn, op) { var o = new IO(fn, op); limpiezas.push(function () { o.disconnect() }); return o }
  function ResizeObserver(fn) { var o = new RO(fn); limpiezas.push(function () { o.disconnect() }); return o }
  function requestAnimationFrame(fn) { return vivo ? window.requestAnimationFrame(function (t) { if (vivo) fn(t) }) : 0 }
  function cancelAnimationFrame(id) { window.cancelAnimationFrame(id) }

  var ctx = gsap.context(function () {
/* ============ SPOTLIGHT DE CURSOR EN LOS GRIDS (.glow) ============
   Da vida a las tarjetas: el resplandor de color de marca sigue al mouse
   en vez de quedar fijo, y en touch simplemente no hace nada (CSS ya lo oculta). */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion || !window.matchMedia || !window.matchMedia('(hover:hover)').matches) return;

  var cards = document.querySelectorAll('.glow');
  if(!cards.length) return;

  var pending = null;
  cards.forEach(function(card){
    card.addEventListener('mousemove', function(e){
      if(pending) return;
      pending = requestAnimationFrame(function(){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        pending = null;
      });
    });
  });
})();

/* ============ SCROLL REVEAL + BOTONES MAGNÉTICOS (GSAP) ============
   Un único gesto coreografiado por sección al entrar en viewport (no un
   fade genérico repetido en cada card), más una pequeña respuesta
   magnética en los CTA principales. */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  // Evita que el show/hide de la barra de direcciones en mobile (que dispara
  // resize) recalcule innecesariamente todos los triggers.
  ScrollTrigger.config({ ignoreMobileResize:true });

  var hasHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;

  // Grupos que revelan en stagger al entrar en pantalla
  var groups = [
    '.pillar-grid .pillar',
    '.grid-2x2 .cat-card',
    '.contact-channels .channel-card',
    '.stat-list .stat-item',
    '.training-list li',
    '.faq-wrap .faq-item'
  ];
  groups.forEach(function(sel){
    var items = document.querySelectorAll(sel);
    if(!items.length) return;
    gsap.set(items, { opacity:0, y:22 });
    ScrollTrigger.batch(items, {
      start:'top 88%',
      once:true,
      onEnter:function(batch){
        gsap.to(batch, { opacity:1, y:0, duration:.7, ease:'power2.out', stagger:.08 });
      }
    });
  });

  // Encabezados y bloques de copy: un único desvanecimiento sutil
  // El escenario del showroom sólo se desliza: un fade (opacity < 1 en el ancestro)
  // aplanaría el vidrio de las tarjetas mientras dura la animación.
  gsap.from('.tech-stage', { y:36, duration:.9, ease:'power2.out', scrollTrigger:{ trigger:'.tech-stage', start:'top 88%', once:true } });
  document.querySelectorAll('.section-head, .macro-head, .about-copy, .mv-col, .tech-head, .tech-nav, .training-copy, .training-card, .location-card, .address-box, .cta-band .container').forEach(function(el){
    gsap.from(el, {
      opacity:0, y:16, duration:.8, ease:'power2.out',
      scrollTrigger:{ trigger:el, start:'top 85%', once:true }
    });
  });

  // Botones magnéticos: los CTA primarios se acercan levemente al cursor
  if(hasHover){
    document.querySelectorAll('.btn-primary').forEach(function(btn){
      var strength = 14;
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) / (r.width/2);
        var y = (e.clientY - r.top - r.height/2) / (r.height/2);
        gsap.to(btn, { x:x*strength, y:y*strength*.6, duration:.35, ease:'power2.out' });
      });
      btn.addEventListener('mouseleave', function(){
        gsap.to(btn, { x:0, y:0, duration:.5, ease:'elastic.out(1,.4)' });
      });
    });
  }
})();

/* ============ FONDO: MANCHAS LÍQUIDAS + CAMPO DE PARTÍCULAS 3D (canvas 2D, detrás de todo) ============
   Las partículas viven en un volumen (x,y,z) y se proyectan en perspectiva.
   Avanzan lentamente en Z hacia el espectador; las manchas líquidas se pintan
   en un canvas pequeño y se escalan (son borrosas por naturaleza), así el costo
   por frame no crece con la resolución de la pantalla. */
(function(){
  var canvas = document.createElement('canvas');
  canvas.id = 'bgParticles'; canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  limpiezas.push(function(){ canvas.remove(); });
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.25);   // puntos suaves y manchas escaladas: no necesitan 2x, y el canvas es full-screen
  var W, H, particles = [], proj = [];
  var bgColor = '#ffffff', dotColorA = '52,74,178', dotColorB = '107,100,100';
  var blobColorA = '52,74,178', blobColorB = '107,100,100';
  var running = true, lastT = null;
  var Z_NEAR = .16, Z_FAR = 2.4, FOCAL = .62, SPEED = .05;   // unidades Z por segundo
  var blobCv = document.createElement('canvas'), blobCtx = blobCv.getContext('2d'), BLOB_SCALE = 1/6;

  function readThemeColors(){
    var cs = getComputedStyle(document.documentElement);
    bgColor = cs.getPropertyValue('--bg').trim() || '#ffffff';
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if(isDark){
      dotColorA = '255,255,255';
      blobColorA = hexToRgb(cs.getPropertyValue('--accent').trim()) || dotColorA;
    } else {
      dotColorA = hexToRgb(cs.getPropertyValue('--accent').trim()) || '52,74,178';
      blobColorA = dotColorA;
    }
  }
  function hexToRgb(hex){
    var m = (hex||'').trim().match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if(!m) return null;
    var h = m[1]; if(h.length === 3){ h = h.split('').map(function(c){return c+c;}).join(''); }
    var n = parseInt(h,16); return [(n>>16)&255, (n>>8)&255, n&255].join(',');
  }

  function spawn(p, z){
    p.x = (Math.random()*2 - 1) * 1.4;
    p.y = (Math.random()*2 - 1) * 1.4;
    p.z = z;
    p.r = 1.2 + Math.random()*2.0;
    p.gray = Math.random() < 0.28;
    return p;
  }
  function resize(){
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W*dpr; canvas.height = H*dpr;
    canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    blobCv.width = Math.max(64, Math.round(W*BLOB_SCALE)); blobCv.height = Math.max(36, Math.round(H*BLOB_SCALE));
    var count = Math.max(30, Math.min(80, Math.round((W*H)/15000)));
    particles = []; proj = [];
    for(var i=0;i<count;i++){ particles.push(spawn({}, Z_NEAR + Math.random()*(Z_FAR-Z_NEAR))); proj.push({}); }
  }

  function drawBlobs(sec){
    var bw = blobCv.width, bh = blobCv.height, bc = blobCtx;
    bc.fillStyle = bgColor; bc.fillRect(0,0,bw,bh);
    var blobs = [
      { cx:.18+Math.sin(sec*0.04)*.07,  cy:.22+Math.cos(sec*0.05)*.06, r:.58, c:blobColorA, a:.30 },
      { cx:.82+Math.cos(sec*0.035)*.07, cy:.30+Math.sin(sec*0.045)*.07, r:.50, c:blobColorB, a:.19 },
      { cx:.55+Math.sin(sec*0.03)*.09,  cy:.85+Math.cos(sec*0.04)*.06, r:.62, c:blobColorA, a:.23 },
      { cx:.35+Math.cos(sec*0.028)*.10, cy:.55+Math.sin(sec*0.033)*.08, r:.42, c:blobColorA, a:.14 }
    ];
    for(var i=0;i<blobs.length;i++){
      var b = blobs[i], cx = b.cx*bw, cy = b.cy*bh, r = b.r*Math.max(bw,bh);
      var g = bc.createRadialGradient(cx,cy,0,cx,cy,r);
      g.addColorStop(0, 'rgba('+b.c+','+b.a+')'); g.addColorStop(1, 'rgba('+b.c+',0)');
      bc.fillStyle = g; bc.fillRect(0,0,bw,bh);
    }
    ctx.drawImage(blobCv, 0, 0, W, H);
  }

  function step(t){
    var sec = (t||performance.now())/1000;
    var dt = lastT === null ? 1/60 : Math.min(.05, (t - lastT)/1000); lastT = t;
    drawBlobs(sec);

    var cx = W/2, cy = H/2, span = Math.max(W,H)*.5;
    for(var i=0;i<particles.length;i++){
      var p = particles[i];
      if(!reduceMotion){
        p.z -= SPEED*dt;
        if(p.z < Z_NEAR) spawn(p, Z_FAR);
        else if(p.z > Z_FAR) spawn(p, Z_NEAR);
      }
      var k = FOCAL / p.z;
      var q = proj[i];
      q.x = cx + p.x*span*k; q.y = cy + p.y*span*k; q.r = p.r*Math.min(2.2, k*1.15); q.a = Math.min(1, k*.9);
    }
    // constelación entre puntos proyectados cercanos
    for(var a=0;a<proj.length;a++){
      for(var b=a+1;b<proj.length;b++){
        var dx = proj[a].x-proj[b].x, dy = proj[a].y-proj[b].y, dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 140){
          ctx.strokeStyle = 'rgba('+dotColorA+','+ (0.18*(1-dist/140)*Math.min(proj[a].a,proj[b].a)) +')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(proj[a].x,proj[a].y); ctx.lineTo(proj[b].x,proj[b].y); ctx.stroke();
        }
      }
    }
    for(var m=0;m<proj.length;m++){
      var s = proj[m], c = particles[m].gray ? dotColorB : dotColorA;
      ctx.fillStyle = 'rgba('+c+','+ (0.7*s.a) +')';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    if(!reduceMotion && running) requestAnimationFrame(step);
  }

  readThemeColors();
  resize();
  step(performance.now());
  on(window, 'resize', resize, {passive:true});
  on(document, 'themechange', function(){ readThemeColors(); if(reduceMotion) step(performance.now()); });
  on(document, 'visibilitychange', function(){
    running = !document.hidden; lastT = null;
    if(running && !reduceMotion) requestAnimationFrame(step);
  });
})();

/* ============ FIGURA 3D DEL HERO — emblema "O" de ControlRed (Three.js) ============
   Geometría reconstruida con las medidas exactas del logotipo institucional:
   mitad izquierda = engranaje (8 dientes, hueco en C, núcleo); mitad derecha =
   7 pistas de microchip con quiebre en ángulo y nodo terminal.
   Gira 360° de forma uniforme y flota, sobre el fondo de partículas.
================================================================================== */
(function(){
  var container = document.getElementById('heroField');       // capa full-bleed: aquí vive el <canvas>
  var anchor    = document.getElementById('heroVisual');       // columna cuadrada: define dónde "vive" el emblema
  var fallback  = document.getElementById('heroVisualFallback');
  if(!container || !anchor) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Medidas del logo (normalizadas: punta de diente = 2.0) ---------- */
  var R_TIP=2.0, R_ROOT=1.623, C_OUT=1.038, C_IN=0.783;
  var TOOTH_ANGLES=[90,135,180,225,270], TOOTH_HALF=11, DEPTH=0.34;
  var NODE_R=1.887, START_X=0.09, TRACE_R=0.046, NODE_SPH=0.135;
  var ANGLES=[69.7,47.3,25.4,0,-25.4,-47.3,-69.7];
  var STUB_Y=[0.727,0.491,0.245,0,-0.245,-0.491,-0.727];
  var BEND_X=[0.377,0.557,0.765,null,0.765,0.557,0.377];

  var D2R = Math.PI/180;
  function px(d,r){ return [Math.cos(d*D2R)*r, Math.sin(d*D2R)*r]; }

  /* ---------- Renderer ---------- */
  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
  }catch(e){ return; }
  renderer.setClearColor(0x000000, 0);
  if(THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  /* ---------- Color de marca con conversión sRGB -> lineal ---------- */
  function brand(hex){
    var c = new THREE.Color(hex);
    if(c.convertSRGBToLinear) c.convertSRGBToLinear();
    return c;
  }
  function isDarkTheme(){ return document.documentElement.getAttribute('data-theme') === 'dark'; }
  var matGray = new THREE.MeshStandardMaterial({ color:brand(0x6B6464), metalness:0.55, roughness:0.24 });
  var matBlue = new THREE.MeshStandardMaterial({
    color:brand(0x344AB2), metalness:0.60, roughness:0.13,
    emissive:brand(0x344AB2), emissiveIntensity:0.16
  });

  /* ---------- Entorno procedural (da reflejo al metal, sin descargas) ---------- */
  var pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  var envRT = null;
  function applyEnv(isDark){
    var cv = document.createElement('canvas'); cv.width=64; cv.height=32;
    var g2 = cv.getContext('2d');
    var grd = g2.createLinearGradient(0,0,0,32);
    if(isDark){ grd.addColorStop(0,'#39427a'); grd.addColorStop(0.55,'#161c40'); grd.addColorStop(1,'#06080f'); }
    else      { grd.addColorStop(0,'#ffffff'); grd.addColorStop(0.55,'#e9ecf6'); grd.addColorStop(1,'#b9c0d8'); }
    g2.fillStyle = grd; g2.fillRect(0,0,64,32);
    var tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    var rt = pmrem.fromEquirectangular(tex);
    if(envRT) envRT.dispose();
    envRT = rt;
    scene.environment = rt.texture;
    tex.dispose();
  }
  applyEnv(document.documentElement.getAttribute('data-theme') === 'dark');

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  var dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(-3, 3.5, 5); scene.add(dir);
  var dir2 = new THREE.DirectionalLight(0x9fb0ff, 0.45); dir2.position.set(4, -2, 3); scene.add(dir2);

  /* ---------- Grupo raíz ---------- */
  var root = new THREE.Group();
  root.rotation.x = 0.10;            // leve inclinación fija: lee mejor en 3/4
  scene.add(root);

  /* ---------- Entorno orbital: evita que la figura flote "en la nada" ---------- */
  var orbitGroup = new THREE.Group();
  orbitGroup.rotation.x = 0.10;
  scene.add(orbitGroup);

  var orbitMat = new THREE.LineBasicMaterial({ color:brand(0x344AB2), transparent:true, opacity:0 });
  var dotMat   = new THREE.MeshBasicMaterial({ color:brand(0x344AB2), transparent:true, opacity:0 });
  var dotGeo   = new THREE.SphereGeometry(0.055, 10, 8);
  var rings    = [];

  function applyOrbitColors(isDark){
    var c = isDark ? brand(0xF3F5FF) : brand(0x344AB2);
    orbitMat.color.copy(c);
    dotMat.color.copy(c);
    pMat.color.copy(c);
  }

  function makeRing(radius, tiltX, tiltY, speed){
    var g = new THREE.Group();
    g.rotation.x = tiltX; g.rotation.y = tiltY;

    var pts = [], SEG = 84;
    for(var i=0;i<=SEG;i++){
      var a = (i/SEG) * Math.PI*2;
      pts.push(new THREE.Vector3(Math.cos(a)*radius, Math.sin(a)*radius, 0));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    g.add(new THREE.Line(geo, orbitMat));

    var dot = new THREE.Mesh(dotGeo, dotMat);       // punto que recorre la órbita
    dot.position.set(radius, 0, 0);
    g.add(dot);

    orbitGroup.add(g);
    rings.push({ g:g, speed:speed });
    return g;
  }
  makeRing(2.30,  1.22, 0.20,  0.22);
  makeRing(2.68, -0.95, 0.55, -0.15);
  makeRing(3.05,  1.45, -0.4,  0.11);

  /* Campo de partículas en una cáscara esférica (un solo draw call) */
  var P_COUNT = 150, pPos = new Float32Array(P_COUNT*3);
  for(var pi=0; pi<P_COUNT; pi++){
    var u = Math.random()*2 - 1, th = Math.random()*Math.PI*2;
    var rr = 2.10 + Math.random()*1.60;
    var sx = Math.sqrt(1-u*u);
    pPos[pi*3]   = Math.cos(th)*sx*rr;
    pPos[pi*3+1] = Math.sin(th)*sx*rr;
    pPos[pi*3+2] = u*rr*0.55;                        // achatado: acompaña el plano del emblema
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var pMat = new THREE.PointsMaterial({
    color:brand(0x344AB2), size:0.052, sizeAttenuation:true,
    transparent:true, opacity:0, depthWrite:false
  });
  var particles = new THREE.Points(pGeo, pMat);
  orbitGroup.add(particles);
  applyOrbitColors(isDarkTheme());

  /* ---------- Engranaje: mitad izquierda, con hueco en C y núcleo ---------- */
  function arcPts(d0, d1, rad, step){
    step = step || 3;
    var n = Math.max(2, Math.ceil(Math.abs(d1-d0)/step)), out=[];
    for(var i=0;i<=n;i++) out.push(px(d0 + (d1-d0)*i/n, rad));
    return out;
  }

  var outline = [];
  for(var i=0;i<TOOTH_ANGLES.length;i++){
    var tc = TOOTH_ANGLES[i];
    // los dientes de 90 y 270 quedan cortados por el diámetro vertical
    var aStart = Math.max(tc - TOOTH_HALF, 90);
    var aEnd   = Math.min(tc + TOOTH_HALF, 270);
    if(i > 0){
      outline.push(px(aStart, R_ROOT));
      outline.push(px(aStart, R_TIP));
    }
    outline = outline.concat(arcPts(aStart, aEnd, R_TIP));
    if(i < TOOTH_ANGLES.length-1){
      outline.push(px(aEnd, R_ROOT));
      outline = outline.concat(arcPts(aEnd, TOOTH_ANGLES[i+1]-TOOTH_HALF, R_ROOT));
    }
  }
  var ringPts = outline.concat([px(270, C_OUT)], arcPts(270, 90, C_OUT), [px(90, C_OUT)]);

  function shapeFrom(pts){
    var s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for(var k=1;k<pts.length;k++) s.lineTo(pts[k][0], pts[k][1]);
    s.closePath();
    return s;
  }
  var extrudeCfg = { depth:DEPTH, bevelEnabled:true, bevelThickness:0.012, bevelSize:0.012, bevelSegments:2, curveSegments:1 };

  var gearRing = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeFrom(ringPts), extrudeCfg), matGray);
  var gearCore = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeFrom(arcPts(90,270,C_IN)), extrudeCfg), matGray);
  gearRing.position.z = -DEPTH/2; gearCore.position.z = -DEPTH/2;
  root.add(gearRing, gearCore);

  /* ---------- Pistas: tramo horizontal + quiebre diagonal + nodo ---------- */
  var UP = new THREE.Vector3(0,1,0);
  function segment(a, b){
    var d = new THREE.Vector3().subVectors(b,a), len = d.length();
    var m = new THREE.Mesh(new THREE.CylinderGeometry(TRACE_R, TRACE_R, len, 10, 1), matBlue);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    return m;
  }
  var nodeGeo  = new THREE.SphereGeometry(NODE_SPH, 18, 12);
  var elbowGeo = new THREE.SphereGeometry(TRACE_R, 10, 8);

  for(var t=0;t<ANGLES.length;t++){
    var a = ANGLES[t]*D2R;
    var node  = new THREE.Vector3(Math.cos(a)*NODE_R, Math.sin(a)*NODE_R, 0);
    var p0    = new THREE.Vector3(START_X, STUB_Y[t], 0);
    if(BEND_X[t] === null){
      root.add(segment(p0, node));
    } else {
      var bend = new THREE.Vector3(BEND_X[t], STUB_Y[t], 0);
      root.add(segment(p0, bend));
      root.add(segment(bend, node));
      var el = new THREE.Mesh(elbowGeo, matBlue); el.position.copy(bend); root.add(el);   // redondea el codo
    }
    var nd = new THREE.Mesh(nodeGeo, matBlue); nd.position.copy(node); root.add(nd);
  }

  /* ---------- Encuadre responsive ----------
     El <canvas> ahora cubre el 100% del ancho del hero (container = #heroField),
     así las órbitas y la nube de partículas tienen todo ese espacio para
     desplegarse sin quedar recortadas en un cuadrado. El emblema, en cambio,
     debe seguir viéndose del mismo tamaño y en el mismo lugar de siempre: para
     eso el encuadre de cámara se calcula con las medidas del "ancla" (la
     columna cuadrada original, #heroVisual) y el conjunto entero se desplaza
     (offsetX/offsetY) hasta la posición que esa columna ocupa dentro del
     campo completo. */
  var FIG_HALF = 2.50;               // semi-extensión a encuadrar (emblema + aire para las órbitas)
  var offsetX = 0, offsetY = 0;
  function resize(){
    var fieldW = container.clientWidth || 320, fieldH = container.clientHeight || 320;
    var aRect = anchor.getBoundingClientRect();
    var fRect = container.getBoundingClientRect();
    var aw = aRect.width || Math.min(fieldW, fieldH), ah = aRect.height || aw;

    var aspect = aw / ah;
    camera.aspect = fieldW / fieldH;

    // margen: un poco mas de aire en pantallas chicas para que no toque los bordes
    var margin = aw < 360 ? 1.20 : (aw < 520 ? 1.14 : 1.10);
    var need = FIG_HALF * margin;
    var tan = Math.tan((camera.fov * D2R) / 2);
    // distancia que satisface alto Y ancho del ANCLA (no del campo completo),
    // así el emblema conserva su tamaño visual de siempre.
    var distZ = Math.max(need / tan, need / (tan * aspect));
    camera.position.z = distZ;
    camera.updateProjectionMatrix();

    // desplazamiento (en unidades de mundo) para que el conjunto quede
    // alineado con el centro del ancla dentro del campo completo
    var halfWorldH = distZ * tan;
    var halfWorldW = halfWorldH * camera.aspect;
    var anchorCx = (aRect.left - fRect.left) + aw / 2;
    var anchorCy = (aRect.top  - fRect.top)  + ah / 2;
    offsetX = ((anchorCx - fieldW / 2) / fieldW) * (halfWorldW * 2);
    offsetY = -((anchorCy - fieldH / 2) / fieldH) * (halfWorldH * 2);
    root.position.x = offsetX;
    orbitGroup.position.x = offsetX;
    orbitGroup.position.y = offsetY;

    var dpr = fieldW < 480 ? 1 : 1.5;   // el canvas cubre todo el ancho del hero: 2x en 1920px serían 3840px de ancho con antialias
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    renderer.setSize(fieldW, fieldH, true);
    if(!rafId) renderer.render(scene, camera);   // repinta si está pausado
  }
  resize();
  if(window.ResizeObserver){
    new ResizeObserver(resize).observe(container);
    new ResizeObserver(resize).observe(anchor);
  } else {
    on(window, 'resize', resize, {passive:true});
  }

  /* ---------- Animación: giro 360 uniforme + flotación ---------- */
  var REV_SECONDS = 18.3;                      // una vuelta completa cada 18.3s (20% más rápido)
  var SPIN = (Math.PI*2) / REV_SECONDS;
  var visible = true, rafId = null, t0 = null;

  /* Curvas de easing para la entrada */
  function easeOutBack(x){ var c=1.70158, c3=c+1; return 1 + c3*Math.pow(x-1,3) + c*Math.pow(x-1,2); }
  function easeOutCubic(x){ return 1 - Math.pow(1-x, 3); }
  function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x); }

  var INTRO_FIG = 1.15;   // s: el emblema se presenta
  var INTRO_ORB = 1.30;   // s: las órbitas entran algo después
  var ORB_DELAY = 0.30;

  function frame(now){
    if(t0 === null) t0 = now;
    var sec = (now - t0)/1000;

    if(reduceMotion){
      root.scale.setScalar(1);
      orbitMat.opacity = 0.26; dotMat.opacity = 0.85; pMat.opacity = 0.5;
      orbitGroup.scale.setScalar(1);
    } else {
      /* --- Animación de entrada (una vez por carga de página) --- */
      var pf = clamp01(sec / INTRO_FIG);
      var po = clamp01((sec - ORB_DELAY) / INTRO_ORB);
      var ef = easeOutBack(pf), eo = easeOutCubic(po);

      root.scale.setScalar(Math.max(ef, 0.001));
      orbitGroup.scale.setScalar(0.72 + 0.28*eo);
      orbitMat.opacity = 0.26 * eo;
      dotMat.opacity   = 0.85 * eo;
      pMat.opacity     = 0.50 * eo;

      /* --- Giro uniforme + flotación (la entrada se desvanece sobre el giro) --- */
      root.rotation.y = sec * SPIN + (1 - easeOutCubic(pf)) * -1.15;
      root.position.x = offsetX;
      root.position.y = offsetY + Math.sin(sec*0.85) * 0.11 * eo;

      for(var ri=0; ri<rings.length; ri++){
        rings[ri].g.rotation.z = sec * rings[ri].speed;
      }
      orbitGroup.rotation.y = sec * 0.06;
      particles.rotation.z  = sec * 0.035;
    }

    renderer.render(scene, camera);
    rafId = visible ? requestAnimationFrame(frame) : null;
  }
  function startLoop(){ if(rafId === null && visible) rafId = requestAnimationFrame(frame); }
  function stopLoop(){ if(rafId !== null){ cancelAnimationFrame(rafId); rafId = null; } }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ fallback.style.display = 'none'; });
  });
  startLoop();

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      visible = en[0].isIntersecting;
      if(visible){ startLoop(); } else { stopLoop(); }
    }, { threshold:0.05 }).observe(container);
  }
  on(document, 'visibilitychange', function(){
    if(document.hidden){ stopLoop(); } else { startLoop(); }
  });

  limpiezas.push(function(){
    stopLoop();
    scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
    [matGray, matBlue, orbitMat, dotMat, pMat].forEach(function(m){ m.dispose(); });
    if(envRT) envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
    if(renderer.forceContextLoss) renderer.forceContextLoss();
    renderer.domElement.remove();
  });

  on(document, 'themechange', function(e){
    applyEnv(e.detail.theme === 'dark');
    applyOrbitColors(e.detail.theme === 'dark');
    if(!rafId) renderer.render(scene, camera);   // refresca si está pausado
  });
})();

/* ==========================================================================
   SHOWROOM HIKVISION — carrusel 3D Liquid Glass + simuladores interactivos
   Un runtime de canvas compartido (tamaño, DPR, puntero, loop sólo cuando la
   tarjeta está activa y visible) y cuatro demos que dibujan la misma escena
   nocturna vectorial con distintos "sensores".
   ========================================================================== */
(function(){
  var section = document.getElementById('tecnologias');
  var stage   = document.getElementById('techStage');
  var track   = document.getElementById('techTrack');
  if(!section || !stage || !track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll('.tech-card'));
  var dots  = Array.prototype.slice.call(document.querySelectorAll('#techDots .tech-dot'));
  var tabs  = Array.prototype.slice.call(section.querySelectorAll('.tech-tab'));
  var total = cards.length;
  var active = 0;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  var stageVisible = !('IntersectionObserver' in window);

  /* ---------------------------------------------------------------- */
  /* Carrusel                                                          */
  /* ---------------------------------------------------------------- */
  /* Jerarquía: la tarjeta activa ocupa el escenario; las vecinas se reducen a
     miniaturas (~40 %) que asoman detrás, y al avanzar crecen/encogen. */
  function metrics(){
    var narrow = window.innerWidth < 820, cw = cards[0].offsetWidth || 900;
    var sc = narrow ? .34 : .4;
    return { off: cw*.5 + cw*sc*.5 + (narrow ? 6 : 18), z: -240, rot: narrow ? 16 : 22, sc: sc };
  }

  function layout(animate){
    var m = metrics();
    cards.forEach(function(card, i){
      var d = i - active;
      if(d < -Math.floor(total/2)) d += total;
      if(d >  Math.floor(total/2)) d -= total;
      var t;
      if(d === 0)       t = { x:0,               z:40,  rotationY:0,          scale:1,    opacity:1,   zIndex:10 };
      else if(d === -1) t = { x:-m.off,          z:m.z, rotationY:m.rot,      scale:m.sc, opacity:.55, zIndex:5 };
      else if(d === 1)  t = { x:m.off,           z:m.z, rotationY:-m.rot,     scale:m.sc, opacity:.55, zIndex:5 };
      else              t = { x:(d>0?1:-1)*m.off*1.4, z:-420, rotationY:(d>0?-1:1)*30, scale:.3, opacity:0, zIndex:0 };
      t.rotationX = 0; t.xPercent = -50;
      t.y = d === 0 ? 0 : (cards[active].offsetHeight - card.offsetHeight)/2;
      card.classList.toggle('is-active', d === 0);
      card.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      // las vecinas siguen siendo clicables (traen la tarjeta al frente) pero sus
      // controles salen del orden de tabulación: un foco ahí desplazaría el escenario
      Array.prototype.forEach.call(card.querySelectorAll('a, button'), function(el){
        if(d === 0) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1');
      });
      if(gsap){
        if(animate && !reduceMotion){ t.duration = .75; t.ease = 'power3.out'; t.overwrite = 'auto'; gsap.to(card, t); }
        else gsap.set(card, t);
      } else {
        card.style.transform = 'translate3d(calc(-50% + '+t.x+'px),'+t.y+'px,'+t.z+'px) rotateY('+t.rotationY+'deg) scale('+t.scale+')';
        card.style.opacity = t.opacity; card.style.zIndex = t.zIndex;
      }
    });
    dots.forEach(function(d,i){ d.classList.toggle('is-active', i === active); });
    tabs.forEach(function(t,i){ t.classList.toggle('is-active', i === active); t.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
    section.style.setProperty('--tech', 'var(--hik-' + cards[active].getAttribute('data-tech') + ')');
    // el escenario mide exactamente lo que mide la tarjeta activa (las vecinas son absolutas)
    stage.style.height = cards[active].offsetHeight + 'px';
    syncDemos();
  }

  function setActive(i, animate){
    active = (i % total + total) % total;
    layout(animate !== false);
  }

  document.getElementById('techPrev').addEventListener('click', function(){ setActive(active - 1); });
  document.getElementById('techNext').addEventListener('click', function(){ setActive(active + 1); });
  dots.forEach(function(d){ d.addEventListener('click', function(){ setActive(+d.getAttribute('data-index')); }); });
  tabs.forEach(function(t){ t.addEventListener('click', function(){ setActive(+t.getAttribute('data-target')); }); });
  cards.forEach(function(card){
    card.addEventListener('click', function(e){
      if(card.classList.contains('is-active')) return;
      if(e.target.closest('a, button')) return;
      setActive(+card.getAttribute('data-index'));
    });
  });
  stage.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ e.preventDefault(); setActive(active - 1); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); setActive(active + 1); }
  });

  /* Tilt suave de la tarjeta activa (no dentro del demo: ahí el puntero manda) */
  if(hasHover && gsap && !reduceMotion){
    cards.forEach(function(card){
      card.addEventListener('mousemove', function(e){
        if(!card.classList.contains('is-active') || e.target.closest('.tc-demo')) return;
        var r = card.getBoundingClientRect();
        var mx = (e.clientX - r.left)/r.width - .5, my = (e.clientY - r.top)/r.height - .5;
        gsap.to(card, { rotationX: -my*6, rotationY: mx*6, z: 48, xPercent:-50, duration:.35, ease:'power2.out', overwrite:'auto' });
      });
      card.addEventListener('mouseleave', function(){
        if(!card.classList.contains('is-active')) return;
        gsap.to(card, { rotationX:0, rotationY:0, z:40, xPercent:-50, duration:.6, ease:'power3.out', overwrite:'auto' });
      });
    });
  }

  /* Swipe táctil sobre el escenario (el demo se reserva sus propios gestos) */
  var sw = null;
  stage.addEventListener('touchstart', function(e){
    if(e.touches.length !== 1 || e.target.closest('.tc-demo, a, button')) { sw = null; return; }
    sw = { x:e.touches[0].clientX, y:e.touches[0].clientY, dx:0 };
  }, {passive:true});
  stage.addEventListener('touchmove', function(e){
    if(!sw || e.touches.length !== 1) return;
    sw.dx = e.touches[0].clientX - sw.x;
    var dy = e.touches[0].clientY - sw.y;
    if(Math.abs(sw.dx) > Math.abs(dy) && gsap) gsap.to(track, { x: sw.dx*.4, duration:.1, overwrite:'auto' });
  }, {passive:true});
  stage.addEventListener('touchend', function(){
    if(!sw) return;
    if(gsap) gsap.to(track, { x:0, duration:.35, ease:'power2.out' });
    if(sw.dx < -45) setActive(active + 1);
    else if(sw.dx > 45) setActive(active - 1);
    sw = null;
  });

  on(window, 'resize', function(){ layout(false); }, {passive:true});
  if(window.ResizeObserver) new ResizeObserver(function(){ stage.style.height = cards[active].offsetHeight + 'px'; }).observe(cards[0]);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if(vivo) layout(false); });

  /* ---------------------------------------------------------------- */
  /* Feed de cámara compartido: un <video> en loop + tracks de personas */
  /* (YOLO11 + ByteTrack, precalculados fotograma a fotograma)           */
  /* ---------------------------------------------------------------- */
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var video = document.getElementById('showroomFeed');
  // CanvasRenderingContext2D.filter (Chrome, Edge, Firefox, Safari ≥ 17.4); si no está, se emula con composiciones
  var hasCtxFilter = (function(){ var c = document.createElement('canvas').getContext('2d'); return !!c && typeof c.filter === 'string'; })();
  /* "Realce" de imagen: exposición, contraste y saturación sobre el recorte del feed */
  function drawEnhanced(ctx, dx, dy, dw, dh, r, exposure, contrast, sat){
    if(hasCtxFilter){
      ctx.save(); ctx.filter = 'brightness(' + exposure + ') contrast(' + contrast + ') saturate(' + sat + ')';
      drawFeed(ctx, dx, dy, dw, dh, r); ctx.restore(); return;
    }
    drawFeed(ctx, dx, dy, dw, dh, r);
    ctx.save(); ctx.beginPath(); ctx.rect(dx,dy,dw,dh); ctx.clip();
    ctx.globalCompositeOperation = 'screen';  ctx.globalAlpha = Math.min(1, (exposure - 1) * .9); drawFeed(ctx, dx, dy, dw, dh, r);   // exposición
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = Math.min(1, (contrast - 1) * 2 + (sat - 1) * .3); drawFeed(ctx, dx, dy, dw, dh, r); // contraste/saturación
    ctx.restore();
  }
  var poster = new Image(); poster.src = video.getAttribute('poster');
  var feedW = 1280, feedH = 720;          // se actualiza con loadedmetadata
  var tracks = null;                      // { fps, frames:[ [ [id,x,y,w,h,conf], ... ], ... ] } (x,y,w,h en 0..1000)
  var feedLoaded = false;

  video.addEventListener('loadedmetadata', function(){ feedW = video.videoWidth || feedW; feedH = video.videoHeight || feedH; });
  function loadFeed(){
    if(feedLoaded) return; feedLoaded = true;
    video.preload = 'auto'; video.load();
    fetch(video.getAttribute('data-tracks')).then(function(r){ return r.json(); }).then(function(j){ tracks = j; }).catch(function(){});
  }
  function playFeed(){ if(reduceMotion) return; var p = video.play(); if(p && p.catch) p.catch(function(){}); }
  function pauseFeed(){ if(!video.paused) video.pause(); }
  function feedReady(){ return video.readyState >= 2; }

  /* Recorte "cover" del feed en un rectángulo destino; devuelve el mapeo para las cajas */
  function coverRect(dw, dh, cy){
    var s = Math.max(dw/feedW, dh/feedH);
    var sw = dw/s, sh = dh/s;
    var sx = (feedW - sw)/2, sy = (feedH - sh)*(cy === undefined ? .5 : cy);
    return { sx:sx, sy:sy, sw:sw, sh:sh, s:s };
  }
  function drawFeed(ctx, dx, dy, dw, dh, r){
    var src = feedReady() ? video : (poster.complete && poster.naturalWidth ? poster : null);
    if(!src){ ctx.fillStyle = '#0b0f1e'; ctx.fillRect(dx,dy,dw,dh); return; }
    ctx.drawImage(src, r.sx, r.sy, r.sw, r.sh, dx, dy, dw, dh);
  }
  /* Cajas de personas en el instante actual del video, interpoladas entre fotogramas */
  function people(){
    if(!tracks || !tracks.frames.length) return [];
    var f = video.currentTime * tracks.fps, i0 = Math.floor(f) % tracks.frames.length, i1 = (i0+1) % tracks.frames.length, k = f - Math.floor(f);
    var a = tracks.frames[i0], b = tracks.frames[i1], out = [], byId = {};
    for(var j=0;j<b.length;j++) byId[b[j][0]] = b[j];
    for(var m=0;m<a.length;m++){
      var p = a[m], q = byId[p[0]] || p;
      out.push({ id:p[0], x:(p[1]+(q[1]-p[1])*k)/1000, y:(p[2]+(q[2]-p[2])*k)/1000, w:(p[3]+(q[3]-p[3])*k)/1000, h:(p[4]+(q[4]-p[4])*k)/1000, c:p[5] });
    }
    return out;
  }
  /* proyecta una caja (0..1 del feed) al destino recortado */
  function project(p, r, dx, dy, dw, dh){
    return { x: dx + (p.x*feedW - r.sx)*r.s, y: dy + (p.y*feedH - r.sy)*r.s, w: p.w*feedW*r.s, h: p.h*feedH*r.s, id:p.id, c:p.c };
  }

  // Grano compartido: un mosaico de ruido que se reposiciona cada frame
  var noise = document.createElement('canvas'); noise.width = 160; noise.height = 160;
  (function(){
    var nctx = noise.getContext('2d'), img = nctx.createImageData(160,160), d = img.data;
    for(var i=0;i<d.length;i+=4){ var v = Math.random()*255|0; d[i]=v; d[i+1]=v; d[i+2]=v; d[i+3]=255; }
    nctx.putImageData(img,0,0);
  })();
  function grain(ctx, x, y, w, h, alpha, t){
    if(alpha <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
    var ox = -(((t*1730)|0) % 160), oy = -(((t*990)|0) % 160);
    for(var yy=oy; yy<h+160; yy+=160) for(var xx=ox; xx<w+160; xx+=160) ctx.drawImage(noise, x+xx, y+yy);
    ctx.restore();
  }
  function desaturate(ctx, x, y, w, h, tint){
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#000'; ctx.fillRect(x,y,w,h);
    if(tint){ ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = tint; ctx.fillRect(x,y,w,h); }
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r){
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function mono(px, family){ return (px||10) + 'px ' + (family || "'JetBrains Mono', monospace"); }

  /* Caja de detección estilo HUD */
  function hudBox(ctx, x, y, w, h, color, label, dashed){
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1.4;
    if(dashed) ctx.setLineDash([4,4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    var c = Math.min(7, w*.3); ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y+c); ctx.lineTo(x,y); ctx.lineTo(x+c,y);
    ctx.moveTo(x+w-c, y); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+c);
    ctx.moveTo(x+w, y+h-c); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w-c,y+h);
    ctx.moveTo(x+c, y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+h-c);
    ctx.stroke();
    if(label){
      ctx.font = mono(9); var tw = ctx.measureText(label).width + 10;
      ctx.fillStyle = color; rr(ctx, x, y-15, tw, 13, 3); ctx.fill();
      ctx.fillStyle = '#0a0d18'; ctx.textBaseline = 'middle'; ctx.fillText(label, x+5, y-8.5);
    }
    ctx.restore();
  }

  /* ---------- runtime ---------- */
  function createDemo(box, def){
    var canvas = box.querySelector('canvas'), ctx = canvas.getContext('2d');
    var W = 0, H = 0, running = false, raf = null, t0 = performance.now();
    var ptr = { x:.5, y:.5, active:false, down:false, moved:false, dx:0, dy:0 };
    var hud = box.querySelectorAll('.tc-demo-hud span');
    var state = def.init ? def.init() : {};
    function now(){ return (performance.now() - t0)/1000; }
    function draw(){ if(W && H) def.draw(ctx, W, H, now(), ptr, state, hud); }
    function resize(){
      W = box.clientWidth; H = box.clientHeight;
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      draw();
    }
    function loop(){ if(!running) return; draw(); raf = requestAnimationFrame(loop); }
    function start(){ if(running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
    function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }
    function updatePtr(e){
      var r = box.getBoundingClientRect();
      ptr.x = Math.min(1, Math.max(0, (e.clientX - r.left)/r.width));
      ptr.y = Math.min(1, Math.max(0, (e.clientY - r.top)/r.height));
    }
    box.addEventListener('pointerdown', function(e){
      if(e.button !== undefined && e.button !== 0) return;
      box.setPointerCapture && box.setPointerCapture(e.pointerId);
      ptr.down = true; ptr.active = true; ptr.moved = false; ptr.dx = e.clientX; ptr.dy = e.clientY; updatePtr(e);
      box.classList.add('is-touched');
      if(def.onDown) def.onDown(state, ptr);
      if(reduceMotion) draw();
    });
    box.addEventListener('pointermove', function(e){
      if(!ptr.down && e.pointerType !== 'mouse') return;
      ptr.active = true; updatePtr(e);
      // un tap real tolera el temblor del dedo/mouse: sólo cuenta como arrastre a partir de 8 px
      if(ptr.down && Math.hypot(e.clientX - ptr.dx, e.clientY - ptr.dy) > 8) ptr.moved = true;
      if(e.pointerType === 'mouse') box.classList.add('is-touched');
      if(reduceMotion) draw();
    });
    function up(){
      if(ptr.down && !ptr.moved && def.onTap) def.onTap(state, ptr);
      ptr.down = false;
      if(reduceMotion) draw();
    }
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    box.addEventListener('pointerleave', function(){ if(!ptr.down) ptr.active = false; });
    if(window.ResizeObserver) new ResizeObserver(resize).observe(box); else on(window, 'resize', resize, {passive:true});
    poster.addEventListener('load', draw);
    resize();
    return { start:start, stop:stop, draw:draw };
  }

  /* ---------------------------------------------------------------- */
  /* Demo 1 · ColorVu: divisor IR convencional | ColorVu sobre el feed  */
  /* ---------------------------------------------------------------- */
  var demoDefs = {};
  demoDefs.colorvu = {
    init: function(){ return { split:.5 }; },
    draw: function(ctx, w, h, t, ptr, st, hud){
      var target = ptr.active ? ptr.x : (.5 + Math.sin(t*.45)*.22);
      st.split += (target - st.split) * (ptr.down ? .55 : .08);
      var sx = st.split * w, r = coverRect(w, h, .55);
      // derecha: ColorVu 3.0 = exposición casi diurna, color saturado y limpio, sin grano
      ctx.save(); ctx.beginPath(); ctx.rect(sx, 0, w-sx, h); ctx.clip();
      drawEnhanced(ctx, 0, 0, w, h, r, 1.5, 1.1, 1.75);
      ctx.restore();
      // izquierda: cámara convencional a la misma luz = oscura, desaturada, con ruido y dominante fría
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sx, h); ctx.clip();
      drawFeed(ctx, 0, 0, w, h, r);
      ctx.fillStyle = 'rgba(3,5,14,.72)'; ctx.fillRect(0,0,sx,h);
      ctx.globalAlpha = .6; desaturate(ctx, 0, 0, sx, h, null); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(40,60,120,.10)'; ctx.fillRect(0,0,sx,h); ctx.globalCompositeOperation = 'source-over';
      grain(ctx, 0, 0, sx, h, .42, t);
      ctx.restore();
      // divisor
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
      ctx.fillStyle = '#F04E23'; ctx.beginPath(); ctx.arc(sx, h*.5, 17, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(sx-8, h*.5); ctx.lineTo(sx-3, h*.5-5); ctx.moveTo(sx-8, h*.5); ctx.lineTo(sx-3, h*.5+5);
      ctx.moveTo(sx+8, h*.5); ctx.lineTo(sx+3, h*.5-5); ctx.moveTo(sx+8, h*.5); ctx.lineTo(sx+3, h*.5+5); ctx.stroke();
      ctx.restore();
      if(hud[0]) hud[0].textContent = 'Cámara convencional · 0.005 lx';
      if(hud[1]) hud[1].textContent = 'ColorVu 3.0 · F1.0 · 0.0005 lx';
    }
  };

  /* ---------------------------------------------------------------- */
  /* Demo 2 · AcuSense: personas reales del feed vs. "movimiento"        */
  /* ---------------------------------------------------------------- */
  demoDefs.acusense = {
    init: function(){ return { on:true, alarms:0, lastBeat:0, scan:0, seen:{}, noiseBoxes:[] }; },
    onTap: function(st){ st.on = !st.on; st.alarms = 0; st.seen = {}; },
    draw: function(ctx, w, h, t, ptr, st, hud){
      var r = coverRect(w, h, .55);
      drawFeed(ctx, 0, 0, w, h, r);
      // grilla de análisis (leve), más visible al pasar el puntero
      st.scan += ((ptr.active ? .35 : .12) - st.scan) * .08;
      ctx.save(); ctx.strokeStyle = 'rgba(56,189,248,'+st.scan+')'; ctx.lineWidth = 1;
      for(var gx=0; gx<w; gx+=30){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
      for(var gy=0; gy<h; gy+=30){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
      ctx.restore();
      var list = people(), liveIds = {};
      for(var i=0;i<list.length;i++){
        var p = list[i]; if(p.c < 35) continue;
        var b = project(p, r, 0, 0, w, h);
        if(b.x + b.w < 0 || b.x > w || b.y + b.h < 0 || b.y > h) continue;
        liveIds[p.id] = true;
        if(st.on){
          hudBox(ctx, b.x, b.y, b.w, b.h, '#38bdf8', 'PERSONA ' + p.c + '%');
          if(!st.seen[p.id]){ st.seen[p.id] = true; st.alarms++; }
        } else {
          // sin IA: el "movimiento" incluye la sombra larga (abajo-izquierda) y parpadea
          var blink = Math.sin(t*14 + p.id) > 0;
          hudBox(ctx, b.x - b.w*1.6, b.y + b.h*.3, b.w*2.6, b.h*.9, blink ? '#ff3b30' : '#ff8a80', 'MOVIMIENTO');
          if(!st.seen[p.id]){ st.seen[p.id] = true; st.alarms++; }
        }
      }
      if(!st.on){
        // falsas alarmas espurias sobre el suelo (textura, cambios de luz)
        if(t - st.lastBeat > .55){
          st.lastBeat = t; st.alarms++;
          st.noiseBoxes.push({ x: Math.random()*(w-60), y: h*.25 + Math.random()*(h*.7), w: 26+Math.random()*40, h: 16+Math.random()*24, until: t + .5 });
        }
        st.noiseBoxes = st.noiseBoxes.filter(function(nb){ return nb.until > t; });
        st.noiseBoxes.forEach(function(nb){ hudBox(ctx, nb.x, nb.y, nb.w, nb.h, '#ff8a80', 'MOVIMIENTO', true); });
      } else {
        st.noiseBoxes.length = 0;
      }
      // etiqueta de estado
      ctx.save(); ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif"; ctx.textBaseline = 'middle';
      var label = st.on ? 'ACUSENSE ON · filtrando' : 'ACUSENSE OFF · detección de movimiento';
      var tw = ctx.measureText(label).width + 22;
      ctx.fillStyle = st.on ? 'rgba(0,112,186,.85)' : 'rgba(255,59,48,.85)'; rr(ctx, w-tw-12, h-34, tw, 22, 11); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(label, w-tw-1, h-23);
      ctx.restore();
      if(hud[0]) hud[0].textContent = st.on ? 'AcuSense · ON' : 'AcuSense · OFF';
      if(hud[1]) hud[1].textContent = (st.on ? 'Alertas reales: ' : 'Falsas alarmas: ') + st.alarms;
    }
  };

  /* ---------------------------------------------------------------- */
  /* Demo 3 · TandemVu: panorámica arriba, PTZ con zoom sobre una       */
  /* persona real (auto-tracking) o donde apunte el puntero             */
  /* ---------------------------------------------------------------- */
  demoDefs.tandemvu = {
    init: function(){ return { tx:.5, ty:.6, targetId:null, targetSince:0 }; },
    draw: function(ctx, w, h, t, ptr, st, hud){
      var panoH = Math.round(h*.5), ptzY = panoH + 4, ptzH = h - ptzY;
      var r = coverRect(w, panoH, .55);
      var list = people(), gx, gy, target = null;
      if(ptr.active && ptr.y*h < panoH + 8){
        gx = ptr.x; gy = Math.min(.95, Math.max(.05, ptr.y*h/panoH)); st.targetId = null;
      } else {
        // auto-tracking: mantener el objetivo mientras siga en cuadro; si no, elegir el de mayor confianza
        for(var i=0;i<list.length;i++){ if(list[i].id === st.targetId){ target = list[i]; break; } }
        if(!target || t - st.targetSince > 6){
          var best = null;
          for(var j=0;j<list.length;j++){ var p = list[j]; if(p.c < 45 || p.id === st.targetId) continue; if(!best || p.c > best.c) best = p; }
          if(best){ target = best; st.targetId = best.id; st.targetSince = t; }
        }
        if(target){ var b = project(target, r, 0, 0, w, panoH); gx = (b.x + b.w/2)/w; gy = (b.y + b.h/2)/panoH; }
        else { gx = .5 + Math.sin(t*.3)*.3; gy = .6; }
      }
      st.tx += (gx - st.tx) * (ptr.active ? .18 : .12); st.ty += (gy - st.ty) * (ptr.active ? .18 : .12);
      var cx = st.tx*w, cy = st.ty*panoH;
      // panorámica
      ctx.save(); ctx.beginPath(); ctx.rect(0,0,w,panoH); ctx.clip();
      drawFeed(ctx, 0, 0, w, panoH, r);
      var zoom = 2.2, fw = w/zoom, fh = ptzH/zoom;
      if(target){ var tb = project(target, r, 0, 0, w, panoH); hudBox(ctx, tb.x, tb.y, tb.w, tb.h, '#38bdf8', 'TRACK ' + target.c + '%'); }
      hudBox(ctx, cx-fw/2, cy-fh/2, fw, fh, '#FFB703', 'PTZ');
      ctx.restore();
      // PTZ: recorte ampliado del feed alrededor del objetivo (misma escena, misma cámara)
      var srcX = r.sx + (cx - fw/2)/r.s, srcY = r.sy + (cy - fh/2)/r.s, srcW = fw/r.s, srcH = fh/r.s;
      srcX = Math.max(0, Math.min(feedW - srcW, srcX)); srcY = Math.max(0, Math.min(feedH - srcH, srcY));
      ctx.save(); ctx.beginPath(); ctx.rect(0,ptzY,w,ptzH); ctx.clip();
      drawFeed(ctx, 0, ptzY, w, ptzH, { sx:srcX, sy:srcY, sw:srcW, sh:srcH, s:w/srcW });
      ctx.restore();
      grain(ctx, 0, ptzY, w, ptzH, .06, t);
      // separador + retícula
      ctx.save();
      ctx.fillStyle = 'rgba(255,183,3,.9)'; ctx.fillRect(0, panoH, w, 4);
      ctx.strokeStyle = 'rgba(255,183,3,.9)'; ctx.lineWidth = 1.2;
      var rx = w/2, ry = ptzY + ptzH/2, rad = 22 + Math.sin(t*3)*2;
      ctx.beginPath(); ctx.arc(rx, ry, rad, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx-rad-8, ry); ctx.lineTo(rx-rad+6, ry); ctx.moveTo(rx+rad-6, ry); ctx.lineTo(rx+rad+8, ry);
      ctx.moveTo(rx, ry-rad-8); ctx.lineTo(rx, ry-rad+6); ctx.moveTo(rx, ry+rad-6); ctx.lineTo(rx, ry+rad+8); ctx.stroke();
      ctx.font = mono(10); ctx.fillStyle = '#FFB703'; ctx.textBaseline = 'bottom';
      ctx.fillText(target && !ptr.active ? 'PTZ · 25× · AUTO-TRACKING ID ' + target.id : 'PTZ · 25× · MANUAL', 12, h-10);
      ctx.textAlign = 'right'; ctx.fillText('PAN ' + Math.round((st.tx-.5)*180) + '° · TILT ' + Math.round((st.ty-.5)*-40) + '°', w-12, h-10);
      ctx.restore();
      if(hud[1]) hud[1].textContent = ptr.active ? 'PTZ · control manual' : 'PTZ · 25× auto-tracking';
    }
  };

  /* ---------------------------------------------------------------- */
  /* Demo 4 · DarkFighterX: visible | IR | fusión, con luz variable      */
  /* ---------------------------------------------------------------- */
  demoDefs.darkfighter = {
    init: function(){ return { lx:.5, ly:.55, full:false, sweep:0 }; },
    onTap: function(st){ st.full = !st.full; },
    draw: function(ctx, w, h, t, ptr, st, hud){
      var r = coverRect(w, h, .55);
      // 1 · lo que ve una cámara común a 0.0005 lx: casi negro, ruido, color perdido
      drawFeed(ctx, 0, 0, w, h, r);
      ctx.fillStyle = 'rgba(2,4,12,.88)'; ctx.fillRect(0,0,w,h);
      ctx.globalAlpha = .7; desaturate(ctx, 0, 0, w, h, null); ctx.globalAlpha = 1;
      grain(ctx, 0, 0, w, h, .5, t);
      // 2 · la "lente" DarkFighterX sigue al puntero (o recorre sola la escena); al tocar, abarca todo
      var gx = ptr.active ? ptr.x : (.5 + Math.sin(t*.5)*.32), gy = ptr.active ? ptr.y : (.55 + Math.cos(t*.37)*.22);
      st.lx += (gx - st.lx) * (ptr.active ? .25 : .05); st.ly += (gy - st.ly) * (ptr.active ? .25 : .05);
      st.sweep += ((st.full ? 1 : 0) - st.sweep) * .07;
      var cx = st.lx*w, cy = st.ly*h;
      var base = Math.min(w, h) * .34 + Math.sin(t*2.2)*3, rad = base + (Math.hypot(w, h) - base) * st.sweep;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2); ctx.clip();
      drawEnhanced(ctx, 0, 0, w, h, r, 1.4, 1.08, 1.55);     // fusión IR (luminancia) + visible (color)
      grain(ctx, 0, 0, w, h, .04, t);
      ctx.restore();
      // 3 · aro del sensor dual: halo, anillo y marcas
      ctx.save();
      var halo = ctx.createRadialGradient(cx, cy, rad*.92, cx, cy, rad*1.25);
      halo.addColorStop(0, 'rgba(139,92,246,.35)'); halo.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, rad*1.25, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(196,181,253,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(139,92,246,.7)'; ctx.lineWidth = 1; ctx.setLineDash([3,9]); ctx.lineDashOffset = -t*30;
      ctx.beginPath(); ctx.arc(cx, cy, rad + 8, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      if(st.sweep < .9){
        ctx.font = mono(9); ctx.fillStyle = '#c4b5fd'; ctx.textBaseline = 'middle';
        var lbl = 'DARKFIGHTERX · IR + VISIBLE', tw = ctx.measureText(lbl).width + 12, lx = Math.min(w - tw - 8, Math.max(8, cx - tw/2)), ly = cy + rad + 22 < h - 12 ? cy + rad + 22 : cy - rad - 22;
        ctx.fillStyle = 'rgba(5,8,18,.7)'; rr(ctx, lx, ly - 9, tw, 18, 9); ctx.fill();
        ctx.fillStyle = '#c4b5fd'; ctx.fillText(lbl, lx + 6, ly);
      }
      ctx.restore();
      if(hud[0]) hud[0].textContent = st.full ? 'Bi-Spectrum · escena completa' : 'Luz ambiente: 0.0005 lx';
      if(hud[1]) hud[1].textContent = st.full ? 'Tocá para volver a la lente' : 'DarkFighterX · fusión';
    }
  };

  /* ---------------------------------------------------------------- */
  /* Alta de demos y sincronización con la tarjeta activa               */
  /* ---------------------------------------------------------------- */
  var demos = cards.map(function(card){
    var box = card.querySelector('.tc-demo');
    var def = demoDefs[box.getAttribute('data-demo')];
    return def ? createDemo(box, def) : null;
  });
  function syncDemos(){
    if(stageVisible) playFeed(); else pauseFeed();
    demos.forEach(function(d, i){ if(!d) return; if(i === active && stageVisible) d.start(); else d.stop(); });
  }
  if('IntersectionObserver' in window){
    // el feed se descarga cuando el showroom se acerca al viewport, y corre sólo mientras se ve
    new IntersectionObserver(function(en){ if(en[0].isIntersecting){ loadFeed(); } }, { rootMargin:'900px 0px' }).observe(stage);
    new IntersectionObserver(function(en){ stageVisible = en[0].isIntersecting; syncDemos(); }, { threshold:.05 }).observe(stage);
  } else { loadFeed(); }
  on(document, 'visibilitychange', function(){ stageVisible = !document.hidden; syncDemos(); });
  layout(false);
  limpiezas.push(function(){ demos.forEach(function(d){ if(d) d.stop(); }); pauseFeed(); });
})();
  }, raiz)

  /* El catalogo del inicio llega despues: las posiciones de ScrollTrigger se
     recalculan cuando cambia el alto de la pagina. */
  var refresco = null
  var altura = new RO(function () {
    clearTimeout(refresco)
    refresco = setTimeout(function () { if (vivo) ScrollTrigger.refresh() }, 200)
  })
  altura.observe(raiz)

  return function desmontar() {
    vivo = false
    clearTimeout(refresco)
    altura.disconnect()
    ctx.revert()
    limpiezas.reverse().forEach(function (f) { try { f() } catch (e) {} })
    limpiezas = []
  }
}
