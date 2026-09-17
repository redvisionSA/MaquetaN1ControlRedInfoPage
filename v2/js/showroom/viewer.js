/* =====================================================================
   ShowroomViewer — un solo canvas para toda la vida de la página.
   - Carga mapas (procedurales hoy; GLB/Draco cuando existan los de Blender)
   - Proyecta hotspots y tags HUD (HTML) al espacio 2D sin raycasting
   - Feed de cámara PiP renderizado desde el dispositivo con modos
     color / IR / ColorVu / térmica / split (swap de materiales)
   - Día/noche real: sol, hemisferio, cielo, niebla y luminarias
   - Libera VRAM al cambiar de mapa
   ===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { makeLib } from './lib.js';

const gsap = window.gsap;

const SKY_DAY = new THREE.Color('#BFD9F5');
const SKY_NIGHT = new THREE.Color('#060A18');
const FOG_DAY = new THREE.Color('#C9DEF3');
const FOG_NIGHT = new THREE.Color('#070B1A');
const SUN_DAY = new THREE.Color('#FFF4E0');
const SUN_NIGHT = new THREE.Color('#5C74C8');

/* Paleta Ironbow para el modo térmico */
const IRONBOW = ['#000004', '#1B0C41', '#4A0C6B', '#781C6D', '#A52C60', '#CF4446', '#ED6925', '#FB9B06', '#F7D13D', '#FCFFA4'].map(c => new THREE.Color(c));
export function ironbow(t) {
  t = Math.min(1, Math.max(0, t)); const f = t * (IRONBOW.length - 1); const i = Math.floor(f); const k = f - i;
  return IRONBOW[Math.min(i, IRONBOW.length - 1)].clone().lerp(IRONBOW[Math.min(i + 1, IRONBOW.length - 1)], k);
}

export class ShowroomViewer {
  constructor({ container, layer, feedFrame }) {
    this.container = container; this.layer = layer; this.feedFrame = feedFrame;
    this.projected = [];   // { obj|pos, el, offsetY }
    this.meshes = [];      // meshes del mapa actual (para swap de materiales)
    this.lamps = [];       // { light, mesh, intensity }
    this.ticks = [];       // callbacks por frame del mapa actual
    this.tweens = [];      // tweens gsap a matar al cambiar de mapa
    this.night = 0;
    this.feed = { active: false, mode: 'color', camera: new THREE.PerspectiveCamera(50, 16 / 9, 0.2, 300), split: 0.5, follow: null };
    this.clock = new THREE.Clock();
    this._tmp = new THREE.Vector3();
    this.initCore(); this.initLoaders();
    this.lib = makeLib(THREE);
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCore() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.scene = new THREE.Scene();
    this.scene.background = SKY_DAY.clone();
    this.scene.fog = new THREE.Fog(FOG_DAY.clone(), 60, 190);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.3, 600);
    this.camera.position.set(38, 26, 38);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.prepend(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.06;
    this.controls.minDistance = 3; this.controls.maxDistance = 110;
    this.controls.enablePan = true; this.controls.screenSpacePanning = false;

    this.hemi = new THREE.HemisphereLight('#DCEBFF', '#6E7A5A', 0.75);
    this.scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight('#FFFFFF', 0.18);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(SUN_DAY.clone(), 2.4);
    this.sun.position.set(40, 60, 25);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 5, far: 200 });
    this.sun.shadow.bias = -0.0008; this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun, this.sun.target);

    this.world = new THREE.Group(); this.scene.add(this.world);
    this.ro = new ResizeObserver(() => this.onResize()); this.ro.observe(this.container);
  }

  initLoaders() {
    this.gltf = new GLTFLoader();
    const draco = new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.gltf.setDRACOLoader(draco);
  }

  /* ---------- Contexto que reciben las escenas ---------- */
  ctx() {
    const v = this;
    return {
      THREE, gsap, lib: v.lib, world: v.world, viewer: v,
      add: (...o) => { v.world.add(...o); return o[0]; },
      lamp: (pos, { color = '#FFD9A0', intensity = 1.6, distance = 18, mesh = null } = {}) => {
        const light = new THREE.PointLight(color, 0, distance, 1.6); light.position.copy(pos); v.world.add(light);
        const rec = { light, mesh, intensity, dim: 1 }; v.lamps.push(rec); return rec;
      },
      tick: (fn) => v.ticks.push(fn),
      tween: (t) => { v.tweens.push(t); return t; },
      tag: (target, html, { ttl = 3000, cls = '', offsetY = 0 } = {}) => v.addTag(target, html, ttl, cls, offsetY),
      feed: (o) => v.setFeed(o), feedOff: () => v.setFeed(null),
      setHeat: (obj, heat) => v.setHeat(obj, heat),
      night: (val, dur) => v.setNight(val, dur),
      focus: (pos, off, dur) => v.focus(pos, off, dur),
      get nightLevel() { return v.night; },
    };
  }

  /* ---------- Carga / descarga de mapas ---------- */
  async loadScene(mod, onProgress) {
    this.dispose();
    this.sceneMod = mod;
    const ctx = this.ctx();
    let built;
    if (mod.glb) {
      // Pipeline GLB (Blender → gltf-transform → aquí). Nombres: HOTSPOT_*, ANIM_*, LAMP_*
      const g = await this.gltf.loadAsync(mod.glb, onProgress);
      g.scene.traverse(c => { if (c.isMesh) { c.castShadow = c.receiveShadow = true; } if (c.name.startsWith('LAMP_')) ctx.lamp(c.getWorldPosition(new THREE.Vector3())); });
      this.world.add(g.scene);
      built = mod.build ? mod.build(ctx, g) : { hotspots: [], actions: [] };
    } else {
      built = mod.build(ctx);
    }
    this.built = built;
    this.collectMeshes();
    this.setNight(mod.startNight ?? 0, 0);
    const c = mod.camera;
    this.camera.position.set(...c.pos); this.controls.target.set(...c.target); this.controls.update();
    this.controls.maxDistance = c.maxDistance || 110;
    this.setFeed(null);
    return built;
  }

  dispose() {
    this.tweens.forEach(t => t.kill?.()); this.tweens = [];
    gsap.killTweensOf(this.camera.position); gsap.killTweensOf(this.controls.target);
    this.ticks = []; this.lamps = [];
    this.projected.forEach(p => p.el.remove()); this.projected = [];
    this.world.traverse(o => {
      if (o.isMesh) {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose(); });
        if (o.userData.mats) Object.values(o.userData.mats).forEach(m => m.dispose());
      }
    });
    this.world.clear(); this.meshes = []; this.built = null;
  }

  collectMeshes() {
    this.meshes = [];
    this.world.traverse(o => { if (o.isMesh && !o.userData.noSwap) this.meshes.push(o); });
    // Variantes de material por malla: IR (mono), ColorVu (color sin luz), térmica (ironbow por calor)
    this.meshes.forEach(m => {
      const base = m.material; const col = base.color ? base.color.clone() : new THREE.Color('#888');
      const lum = 0.299 * col.r + 0.587 * col.g + 0.114 * col.b;
      const irL = Math.min(1, 0.18 + lum * 0.95);
      const heat = m.userData.heat ?? (m.parent?.userData.heat ?? 0.12);
      m.userData.mats = {
        ir: new THREE.MeshBasicMaterial({ color: new THREE.Color(irL, irL, irL), fog: false }),
        cv: new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.05), fog: false }),
        th: new THREE.MeshBasicMaterial({ color: ironbow(heat), fog: false }),
      };
      m.userData.heat = heat;
    });
  }

  setHeat(obj, heat) {
    obj.traverse(o => { if (o.isMesh && o.userData.mats) { o.userData.heat = heat; o.userData.mats.th.color.copy(ironbow(heat)); } });
  }

  /* ---------- Día / noche ---------- */
  setNight(val, dur = 2.2) {
    const v = this; const from = { n: v.night };
    const apply = () => {
      const n = v.night;
      v.sun.intensity = THREE.MathUtils.lerp(2.4, 0.06, n);
      v.sun.color.copy(SUN_DAY).lerp(SUN_NIGHT, n);
      v.hemi.intensity = THREE.MathUtils.lerp(0.75, 0.06, n);
      v.ambient.intensity = THREE.MathUtils.lerp(0.18, 0.05, n);
      v.scene.background.copy(SKY_DAY).lerp(SKY_NIGHT, n);
      v.scene.fog.color.copy(FOG_DAY).lerp(FOG_NIGHT, n);
      v.renderer.toneMappingExposure = THREE.MathUtils.lerp(1.05, 0.9, n);
      const lampOn = THREE.MathUtils.smoothstep(n, 0.35, 0.75);
      v.lamps.forEach(l => { l.light.intensity = l.intensity * lampOn * (l.dim ?? 1); if (l.mesh) l.mesh.material.emissiveIntensity = 1.8 * lampOn * (l.dim ?? 1); });
      v.world.traverse(o => { if (o.userData.lampMesh) o.material.emissiveIntensity = 1.6 * lampOn * (typeof o.userData.lampMesh === 'number' ? o.userData.lampMesh : 1); });
    };
    if (dur === 0) { v.night = val; apply(); return; }
    gsap.to(from, { n: val, duration: dur, ease: 'power2.inOut', onUpdate: () => { v.night = from.n; apply(); } });
  }

  /* ---------- Cámara cinemática ---------- */
  focus(pos, offset = [5, 3, 5], dur = 1.4) {
    const t = new THREE.Vector3(...pos); const p = t.clone().add(new THREE.Vector3(...offset));
    gsap.to(this.camera.position, { x: p.x, y: p.y, z: p.z, duration: dur, ease: 'power3.inOut' });
    gsap.to(this.controls.target, { x: t.x, y: t.y, z: t.z, duration: dur, ease: 'power3.inOut' });
  }
  resetView(dur = 1.2) {
    const c = this.sceneMod?.camera; if (!c) return;
    gsap.to(this.camera.position, { x: c.pos[0], y: c.pos[1], z: c.pos[2], duration: dur, ease: 'power3.inOut' });
    gsap.to(this.controls.target, { x: c.target[0], y: c.target[1], z: c.target[2], duration: dur, ease: 'power3.inOut' });
  }

  /* ---------- Elementos HTML proyectados ---------- */
  addProjected(target, el, offsetY = 0) { this.layer.appendChild(el); const p = { target, el, offsetY }; this.projected.push(p); return p; }
  removeProjected(p) { p.el.remove(); this.projected = this.projected.filter(x => x !== p); }
  addTag(target, html, ttl, cls, offsetY) {
    const el = document.createElement('div'); el.className = `hud-tag ${cls}`; el.innerHTML = html;
    const p = this.addProjected(target, el, offsetY);
    if (ttl > 0) setTimeout(() => { el.classList.add('out'); setTimeout(() => this.removeProjected(p), 350); }, ttl);
    return { el, remove: () => this.removeProjected(p) };
  }
  worldPos(target) {
    if (target.isObject3D) return target.getWorldPosition(this._tmp);
    if (target.isVector3) return this._tmp.copy(target);
    return this._tmp.set(target[0], target[1], target[2]);
  }
  project() {
    const W = this.container.clientWidth, H = this.container.clientHeight;
    const camPos = this.camera.position;
    for (const p of this.projected) {
      const wp = this.worldPos(p.target); wp.y += p.offsetY;
      const dist = wp.distanceTo(camPos);
      wp.project(this.camera);
      if (wp.z > 1 || Math.abs(wp.x) > 1.2 || Math.abs(wp.y) > 1.2) { p.el.style.display = 'none'; continue; }
      p.el.style.display = '';
      const x = (wp.x * 0.5 + 0.5) * W, y = (-wp.y * 0.5 + 0.5) * H;
      const s = p.el.classList.contains('hotspot') ? Math.max(0.72, Math.min(1, 34 / dist)) : 1;
      p.el.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
      p.el.style.zIndex = String(Math.round(1000 - dist));
    }
  }

  /* ---------- Feed de cámara (PiP) ---------- */
  setFeed(o) {
    if (!this.feedFrame) return;
    if (!o) { this.feed.active = false; this.feedFrame.classList.remove('on'); return; }
    const f = this.feed; f.active = true; f.mode = o.mode || 'color'; f.split = o.split ?? 0.5;
    f.from = o.from; f.lookAt = o.lookAt; f.camera.fov = o.fov ?? 50; f.camera.updateProjectionMatrix();
    f.label = o.label || ''; this.feedFrame.classList.add('on');
    this.feedFrame.dataset.mode = f.mode;
    const lbl = this.feedFrame.querySelector('[data-feed-label]'); if (lbl) lbl.textContent = f.label;
    const md = this.feedFrame.querySelector('[data-feed-mode]'); if (md) md.textContent = ({ color: 'VISIBLE', ir: 'IR · B/N', cv: 'COLORVU', th: 'TÉRMICA · IRONBOW', split: 'IR ⟷ COLORVU', zoom: 'ÓPTICO', dash: 'DASHCAM · DSM' })[f.mode] || f.mode.toUpperCase();
  }
  swapMaterials(key) { for (const m of this.meshes) { if (!m.userData.mats) continue; if (key) { m.userData.orig = m.material; m.material = m.userData.mats[key]; } else if (m.userData.orig) { m.material = m.userData.orig; } } }
  renderFeed() {
    const f = this.feed; if (!f.active || !this.feedFrame) return;
    const fr = this.feedFrame.querySelector('.feed-view').getBoundingClientRect();
    const cr = this.container.getBoundingClientRect();
    // setViewport/setScissor reciben px CSS (Three multiplica por pixelRatio)
    const x = fr.left - cr.left, y = cr.bottom - fr.bottom, w = fr.width, h = fr.height;
    if (w < 8 || h < 8) return;
    const cam = f.camera; cam.aspect = fr.width / fr.height; cam.updateProjectionMatrix();
    const from = this.worldPos(f.from).clone(); cam.position.copy(from);
    const look = this.worldPos(f.lookAt).clone(); cam.lookAt(look);
    const r = this.renderer; r.setScissorTest(true);
    const draw = (key, x0, w0) => {
      r.setViewport(x, y, w, h); r.setScissor(x0, y, w0, h);
      const fog = this.scene.fog; const bg = this.scene.background;
      if (key === 'ir') { this.scene.background = new THREE.Color('#0B0B0B'); this.scene.fog = null; }
      if (key === 'cv') { this.scene.background = new THREE.Color('#1B2340'); this.scene.fog = null; }
      if (key === 'th') { this.scene.background = IRONBOW[0]; this.scene.fog = null; }
      this.swapMaterials(key === 'color' ? null : key);
      const shadows = r.shadowMap.enabled; if (key !== 'color') r.shadowMap.enabled = false;
      r.render(this.scene, cam);
      r.shadowMap.enabled = shadows;
      this.swapMaterials(null); this.scene.background = bg; this.scene.fog = fog;
    };
    if (f.mode === 'split') { const sx = Math.round(w * f.split); draw('ir', x, sx); draw('cv', x + sx, w - sx); }
    else draw((f.mode === 'zoom' || f.mode === 'dash') ? 'color' : f.mode, x, w);
    r.setScissorTest(false); r.setViewport(0, 0, this.container.clientWidth, this.container.clientHeight);
  }

  /* ---------- Loop ---------- */
  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05); const t = this.clock.elapsedTime;
    this.controls.update();
    for (const fn of this.ticks) fn(dt, t);
    this.project();
    this.renderer.render(this.scene, this.camera);
    this.renderFeed();
  }
  onResize() {
    const w = this.container.clientWidth, h = this.container.clientHeight; if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.fov = w / h < 1 ? 60 : 42; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
  }
}
