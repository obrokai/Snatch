import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Lenis from "lenis";
import "./style.css";

/* =========================================================================
   SnatchOS — 抽象品牌世界 · 3D 場景過境體驗
   捲動 = 在品牌空間裡向前飛行，穿過一座座線框構造物，內容隨之過境。
   風格：大膽單色 + 白色線框網格 + 強烈空間感（非寫實，但有臨場感）。
   ========================================================================= */

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);

const INK = new THREE.Color("#0b0a0c");
const ACCENT = new THREE.Color("#ff6b1a");
const ACCENT_DEEP = new THREE.Color("#e85d0a");

/* ---------------------------------------------------------------------- */
/* Renderer / Scene / Camera                                              */
/* ---------------------------------------------------------------------- */
const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const BG_DARK = new THREE.Color("#0b0a0c");
const BG_WARM = new THREE.Color("#1d0f06");
scene.background = BG_DARK.clone();
const fog = new THREE.FogExp2("#120a08", 0.018);
scene.fog = fog;

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 400);

/* 環境光（CC0 HDRI）：給實體面一點高級反射 */
const pmrem = new THREE.PMREMGenerator(renderer);
new RGBELoader().load(`${import.meta.env.BASE_URL}hdri/venue_1k.hdr`, (hdr) => {
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  scene.environmentIntensity = 0.25;
  hdr.dispose();
  pmrem.dispose();
});

/* ---------------------------------------------------------------------- */
/* Lights                                                                 */
/* ---------------------------------------------------------------------- */
scene.add(new THREE.AmbientLight("#ffffff", 0.55));
const keyLight = new THREE.DirectionalLight("#fff1e6", 0.7);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);
const glowA = new THREE.PointLight(ACCENT, 60, 60, 2);
glowA.position.set(-4, 3, -20);
scene.add(glowA);
const glowB = new THREE.PointLight("#ffd9bd", 40, 70, 2);
glowB.position.set(5, -2, -60);
scene.add(glowB);

/* ---------------------------------------------------------------------- */
/* 線框地平面（強空間感）                                                  */
/* ---------------------------------------------------------------------- */
const floorGeo = new THREE.PlaneGeometry(140, 320, 48, 110);
// 起伏，讓地面有有機呼吸感
{
  const p = floorGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(x * 0.12) * 1.1 + Math.cos(y * 0.08) * 1.4);
  }
  floorGeo.computeVertexNormals();
}
const floor = new THREE.Mesh(
  floorGeo,
  new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.07 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -6, -120);
scene.add(floor);

/* ---------------------------------------------------------------------- */
/* 構造物：實體單色面 + 白色線框 疊層（招牌外觀）                           */
/* ---------------------------------------------------------------------- */
const forms = [];
function deform(geo, amp) {
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 1.4 + v.y) * Math.cos(v.y * 1.3 + v.z) * Math.sin(v.z * 1.1 + v.x);
    const s = 1 + n * amp;
    p.setXYZ(i, v.x * s, v.y * s, v.z * s);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeForm(geo, opts) {
  const g = new THREE.Group();
  const orange = opts.orange !== false;
  const solid = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: orange ? ACCENT : "#11101a",
      emissive: orange ? ACCENT_DEEP : "#000000",
      emissiveIntensity: orange ? 0.35 : 0,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: orange ? 0.92 : 0.6,
      flatShading: false,
    })
  );
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: opts.wire || "#ffffff",
      wireframe: true,
      transparent: true,
      opacity: opts.wireOpacity ?? 0.5,
    })
  );
  wire.scale.setScalar(1.004);
  g.add(solid, wire);
  g.position.set(...opts.pos);
  g.scale.setScalar(opts.scale || 1);
  g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
  g.userData.spin = opts.spin || [0.02, 0.03, 0.01];
  g.userData.float = { amp: opts.floatAmp ?? 0.6, off: Math.random() * 6, baseY: opts.pos[1] };
  scene.add(g);
  forms.push(g);
  return g;
}

/* ---- 裝置構造物（手機 / 平板 / 筆電）：同風格線框，承載「跨裝置」意象 ---- */
function wfGroup(geo, { orange = true, wireOpacity = 0.55 } = {}) {
  const g = new THREE.Group();
  const solid = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: orange ? ACCENT : "#100e16",
      emissive: orange ? ACCENT_DEEP : "#000000",
      emissiveIntensity: orange ? 0.32 : 0,
      roughness: 0.5, metalness: 0.2, transparent: true, opacity: orange ? 0.9 : 0.55,
    })
  );
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: wireOpacity })
  );
  wire.scale.setScalar(1.005);
  g.add(solid, wire);
  return g;
}
function screenGlow(w, h, z) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 })
  );
  m.position.set(0, 0, z);
  return m;
}
function makePhone() {
  const g = wfGroup(new THREE.BoxGeometry(1.0, 2.0, 0.12, 3, 6, 1));
  g.add(screenGlow(0.82, 1.7, 0.07));
  return g;
}
function makeTablet() {
  const g = wfGroup(new THREE.BoxGeometry(2.4, 3.2, 0.16, 4, 6, 1));
  g.add(screenGlow(2.0, 2.7, 0.09));
  return g;
}
function makeLaptop() {
  const g = new THREE.Group();
  const base = wfGroup(new THREE.BoxGeometry(3.2, 0.14, 2.2, 6, 1, 4));
  const screen = wfGroup(new THREE.BoxGeometry(3.2, 2.0, 0.12, 6, 5, 1));
  screen.position.set(0, 1.02, -1.04);
  screen.rotation.x = -0.34;
  const glow = screenGlow(2.8, 1.7, 0.07);
  glow.position.set(0, 1.05, -0.97);
  glow.rotation.x = -0.34;
  g.add(base, screen, glow);
  return g;
}
function placeDevice(group, pos, scale, spinY = 0.04) {
  group.position.set(...pos);
  group.scale.setScalar(scale);
  group.rotation.y = pos[0] > 0 ? -0.5 : 0.5;
  group.userData.spin = [0, spinY, 0];
  group.userData.float = { amp: 0.45, off: Math.random() * 6, baseY: pos[1] };
  scene.add(group);
  forms.push(group);
  return group;
}

/* ---- 臉部辨識頭像（閘門上方，掃描中） ---- */
const scanHeadGroup = new THREE.Group();
scanHeadGroup.position.set(0, 6.8, 0);
// 線框頭部
const scanHead = new THREE.Mesh(
  deform(new THREE.IcosahedronGeometry(0.85, 4), 0.05),
  new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.55 })
);
scanHeadGroup.add(scanHead);
// 四角辨識框
function reticleCorner(x, y) {
  const g = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.95 });
  const armA = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.35 * x, 0, 0)
  ]), lineMat);
  const armB = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.35 * y, 0)
  ]), lineMat);
  g.add(armA, armB);
  g.position.set(x * 1.15, y * 1.15, 0);
  return g;
}
scanHeadGroup.add(reticleCorner(-1, 1), reticleCorner(1, 1), reticleCorner(-1, -1), reticleCorner(1, -1));
// 掃描橫線（在頭部上下掃）
const scanBeam = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 0.04),
  new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })
);
scanBeam.position.set(0, 0, 0.01);
scanHeadGroup.add(scanBeam);
scene.add(scanHeadGroup);

/* ---- 入口閘門（掃描臉部 → 進場）：camera 開場即穿過 ---- */
const gate = new THREE.Group();
gate.position.set(0, 0, 2.6);
const jambGeo = new THREE.BoxGeometry(0.5, 5.2, 0.5, 1, 8, 1);
const jambL = wfGroup(jambGeo, { wireOpacity: 0.45 }); jambL.position.set(-2.6, 2.4, 0);
const jambR = wfGroup(jambGeo, { wireOpacity: 0.45 }); jambR.position.set(2.6, 2.4, 0);
const lintel = wfGroup(new THREE.BoxGeometry(5.7, 0.5, 0.5, 8, 1, 1)); lintel.position.set(0, 5.0, 0);
const panelGeo = new THREE.BoxGeometry(1.7, 4.4, 0.12, 4, 9, 1);
const panelL = wfGroup(panelGeo, { wireOpacity: 0.5 }); panelL.position.set(-0.95, 2.4, 0);
const panelR = wfGroup(panelGeo, { wireOpacity: 0.5 }); panelR.position.set(0.95, 2.4, 0);
const gateScan = new THREE.Mesh(
  new THREE.PlaneGeometry(3.4, 0.07),
  new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })
);
gateScan.position.set(0, 2.4, 0.25);
gate.add(jambL, jambR, lintel, panelL, panelR, gateScan);
scene.add(gate);

/* ---- 沿走廊佈置：閘門 → 裝置 + 少量抽象體（補景深氣氛） ---- */
makeForm(deform(new THREE.IcosahedronGeometry(3, 6), 0.18), { pos: [-6, 2, -12], scale: 1.1, spin: [0.04, 0.06, 0.03] });
placeDevice(makeTablet(), [5.6, 1.6, -30], 1.0);                    // 系統全覽附近
makeForm(new THREE.TorusKnotGeometry(2.2, 0.6, 180, 18), { pos: [-5.5, -1, -42], scale: 0.9, spin: [0.04, 0.08, 0.03] });
placeDevice(makePhone(), [4.8, 0.6, -52], 1.7);                     // LINE 一站式附近
placeDevice(makeLaptop(), [-5, 1, -66], 1.05);                     // AI 後台附近
makeForm(deform(new THREE.IcosahedronGeometry(4, 7), 0.2), { pos: [6.5, 2, -82], scale: 1, spin: [0.03, 0.05, 0.03] });
placeDevice(makeTablet(), [-4.4, 1.2, -98], 1.15);                 // FAQ 附近
makeForm(new THREE.TorusGeometry(3.4, 0.9, 18, 80), { pos: [5, -1, -110], scale: 1, spin: [0.1, 0.03, 0.04] });

// 細小漂浮碎塊（近景，增加臨場感）
const shardGeo = new THREE.OctahedronGeometry(0.35, 0);
const shardMat = new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.35 });
const shards = new THREE.Group();
for (let i = 0; i < 26; i++) {
  const s = new THREE.Mesh(shardGeo, shardMat);
  s.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, -Math.random() * 110);
  s.scale.setScalar(0.4 + Math.random() * 1.4);
  s.userData.r = Math.random() * 0.04 + 0.01;
  shards.add(s);
}
scene.add(shards);

/* ---------------------------------------------------------------------- */
/* 粒子塵埃（大氣感）                                                      */
/* ---------------------------------------------------------------------- */
const dustN = 700;
const dustPos = new Float32Array(dustN * 3);
for (let i = 0; i < dustN; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 50;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
  dustPos[i * 3 + 2] = 12 - Math.random() * 130;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({ color: "#ffd9bd", size: 0.07, transparent: true, opacity: 0.6, depthWrite: false })
);
scene.add(dust);

/* ---------------------------------------------------------------------- */
/* 鏡頭路徑：向前飛行、輕微擺盪，穿過構造物                                 */
/* ---------------------------------------------------------------------- */
const waypoints = [
  { p: 0.0, pos: [0, 1.6, 16], look: [0, 2.6, 2.6] },     // 站在閘門前，看著掃描頭
  { p: 0.04, pos: [0, 1.5, 10], look: [0, 2.0, 2.6] },    // 逼近，閘門開始開
  { p: 0.09, pos: [0, 1.5, 2], look: [0, 1.2, -6] },      // 穿過閘門
  { p: 0.13, pos: [1.6, 1, -3], look: [-1, 0.5, -14] },
  { p: 0.22, pos: [-2.2, 0.2, -16], look: [1, 0.6, -28] },
  { p: 0.33, pos: [1.4, 1.2, -30], look: [-1.2, 0.4, -42] },
  { p: 0.44, pos: [-1.6, -0.4, -44], look: [1.2, 0.4, -56] },
  { p: 0.55, pos: [2, 0.8, -58], look: [-0.6, 0.2, -70] },
  { p: 0.66, pos: [-1.4, 1.2, -72], look: [0.8, 0.4, -84] },
  { p: 0.77, pos: [1.8, 0.2, -86], look: [-1, 0.4, -98] },
  { p: 0.88, pos: [-1.2, 0.8, -100], look: [0.6, 0.3, -112] },
  { p: 1.0, pos: [0, 0.8, -114], look: [0, 0.6, -126] },
];
const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function sampleCamera(p) {
  let a = waypoints[0], b = waypoints[waypoints.length - 1];
  for (let i = 0; i < waypoints.length - 1; i++) {
    if (p >= waypoints[i].p && p <= waypoints[i + 1].p) { a = waypoints[i]; b = waypoints[i + 1]; break; }
  }
  const span = b.p - a.p || 1;
  const t = smootherstep(THREE.MathUtils.clamp((p - a.p) / span, 0, 1));
  _pos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], t)
  );
  _look.set(
    THREE.MathUtils.lerp(a.look[0], b.look[0], t),
    THREE.MathUtils.lerp(a.look[1], b.look[1], t),
    THREE.MathUtils.lerp(a.look[2], b.look[2], t)
  );
}

/* ---------------------------------------------------------------------- */
/* 站台工具                                                               */
/* ---------------------------------------------------------------------- */
const ACTS = 10;
const ACT_PHONE = 4;
const ACT_CONSOLE = 5;
const actEls = [...document.querySelectorAll(".ov")];
const dots = [...document.querySelectorAll(".progress li")];
const phone = document.getElementById("phone");
const phoneMenuBtns = [...document.querySelectorAll("#phone-menu button")];
const consoleEl = document.getElementById("console");
const consoleTyped = document.getElementById("console-typed");
const consoleResult = document.getElementById("console-result");
const progressNav = document.getElementById("progress");
const scrollHint = document.getElementById("scroll-hint");

function actLocal(p, i) {
  return THREE.MathUtils.clamp(p * ACTS - i, 0, 1);
}
function bell(t) {
  if (t < 0.28) return t / 0.28;
  if (t > 0.72) return (1 - t) / 0.28;
  return 1;
}

let consoleStage = -1;
function setConsole(local) {
  if (local < 0.5) {
    const q = "今天收了多少？";
    const n = Math.floor((local / 0.4) * q.length);
    consoleTyped.textContent = q.slice(0, Math.min(n, q.length));
    if (consoleStage !== 0) { consoleStage = 0; consoleResult.innerHTML = ""; }
    if (local > 0.38 && !consoleResult.children.length) {
      consoleResult.innerHTML = `
        <div class="console__card">
          <h4>今日 · 即時看板</h4>
          <div class="console__kpis">
            <div><span>今日收入</span><b>NT$12,600</b><i>▲ +8% 昨日</i></div>
            <div><span>本月新增</span><b>18 人</b><i>▲ +3 人</i></div>
            <div><span>在場人數</span><b>24</b><i>尖峰時段</i></div>
          </div>
        </div>`;
    }
  } else {
    const q = "本月收入比上個月多多少？";
    const n = Math.floor(((local - 0.5) / 0.4) * q.length);
    consoleTyped.textContent = q.slice(0, Math.min(n, q.length));
    if (consoleStage !== 1) { consoleStage = 1; consoleResult.innerHTML = ""; }
    if (local > 0.84 && !consoleResult.children.length) {
      consoleResult.innerHTML = `
        <div class="console__card">
          <h4>本月收入 · 近 5 個月</h4>
          <div class="console__bars">
            <div data-name="2月" style="height:48%"></div>
            <div data-name="3月" style="height:60%"></div>
            <div data-name="4月" style="height:72%"></div>
            <div data-name="5月" style="height:80%"></div>
            <div data-name="6月" style="height:96%"></div>
          </div>
          <div class="console__note">本月 NT$284K · 較上月 ▲ +12%</div>
        </div>`;
    }
  }
}

let activePhone = -1;

/* ---------------------------------------------------------------------- */
/* 主更新                                                                 */
/* ---------------------------------------------------------------------- */
function applyProgress(p) {
  sampleCamera(p);

  // 入口閘門：開場即向兩側滑開，camera 穿過進場
  const enter = smootherstep(THREE.MathUtils.clamp(p / 0.06, 0, 1));
  panelL.position.x = -0.95 - enter * 2.4;
  panelR.position.x = 0.95 + enter * 2.4;

  // 色彩過境：靠近構造物群（中段、收束）讓世界更橘、更暖；空檔回到暗
  const warm = 0.5 - 0.5 * Math.cos(p * Math.PI * 2 * 1.5);
  scene.background.copy(BG_DARK).lerp(BG_WARM, warm * 0.7);
  fog.color.copy(BG_DARK).lerp(ACCENT_DEEP, warm * 0.25);
  fog.density = THREE.MathUtils.lerp(0.02, 0.014, warm);
  glowA.intensity = 45 + warm * 60;

  // 文案疊層
  actEls.forEach((el, i) => {
    const local = actLocal(p, i);
    const o = bell(local);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${(1 - o) * 26}px)`;
    el.style.pointerEvents = o > 0.6 ? "auto" : "none";
  });

  // 會員 LINE 手機
  const aPh = actLocal(p, ACT_PHONE);
  const pO = bell(aPh);
  phone.style.opacity = pO.toFixed(3);
  phone.style.transform = `translate(-50%,-50%) translateY(${(1 - pO) * 40}px) scale(${0.92 + pO * 0.08})`;
  const idx = Math.min(phoneMenuBtns.length - 1, Math.floor(aPh * phoneMenuBtns.length));
  if (aPh > 0 && aPh < 1 && idx !== activePhone) {
    activePhone = idx;
    phoneMenuBtns.forEach((b, k) => b.classList.toggle("is-active", k === idx));
  }

  // AI 對話式後台 console
  const aCon = actLocal(p, ACT_CONSOLE);
  const cO = bell(aCon);
  consoleEl.style.opacity = cO.toFixed(3);
  consoleEl.style.transform = `translate(-50%,-50%) translateY(${(1 - cO) * 30}px)`;
  if (aCon > 0 && aCon < 1) setConsole(aCon);

  // 章節索引
  const cur = Math.min(ACTS - 1, Math.floor(p * ACTS + 0.001));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === cur));
  progressNav.classList.toggle("is-visible", p > 0.02);
  scrollHint.classList.toggle("is-hidden", p > 0.015);
}

/* ---------------------------------------------------------------------- */
/* Lenis 平滑捲動 + 導覽                                                   */
/* ---------------------------------------------------------------------- */
const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
let scrollProgress = 0;
lenis.on("scroll", ({ scroll, limit }) => {
  scrollProgress = limit > 0 ? scroll / limit : 0;
});
lenis.stop();

dots.forEach((li) => {
  const act = +li.dataset.act;
  li.addEventListener("click", () => lenis.scrollTo(((act + 0.5) / ACTS) * lenis.limit));
});
document.querySelector(".topbar__brand").addEventListener("click", (e) => {
  e.preventDefault();
  lenis.scrollTo(0);
});
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    lenis.scrollTo(((+el.dataset.goto + 0.5) / ACTS) * lenis.limit);
  });
});

/* ---------------------------------------------------------------------- */
/* 渲染迴圈                                                               */
/* ---------------------------------------------------------------------- */
const clock = new THREE.Clock();
let renderProgress = 0;
function tick(time) {
  lenis.raf(time);
  const t = clock.getElapsedTime();

  renderProgress += (scrollProgress - renderProgress) * 0.08;
  applyProgress(renderProgress);

  forms.forEach((g) => {
    g.rotation.x += g.userData.spin[0] * 0.01;
    g.rotation.y += g.userData.spin[1] * 0.01;
    g.rotation.z += g.userData.spin[2] * 0.01;
    const f = g.userData.float;
    g.position.y = f.baseY + Math.sin(t * 0.5 + f.off) * f.amp;
  });
  shards.children.forEach((s, i) => {
    s.rotation.x += s.userData.r;
    s.rotation.y += s.userData.r * 0.7;
    s.position.y += Math.sin(t * 0.6 + i) * 0.002;
  });
  dust.rotation.y = t * 0.01;

  // 閘門掃描光束：上下掃描、進場後淡出
  const entered = THREE.MathUtils.clamp(renderProgress / 0.09, 0, 1);
  gateScan.position.y = 2.4 + Math.sin(t * 1.6) * 2.0;
  gateScan.material.opacity = (1 - entered) * (0.5 + 0.4 * Math.abs(Math.sin(t * 1.6)));

  // 頭像掃描：beam 上下掃描、頭部緩慢轉動、進場後整組淡出
  scanBeam.position.y = Math.sin(t * 2) * 0.9;
  scanBeam.material.opacity = (1 - entered) * 0.9;
  scanHead.rotation.y = t * 0.4;
  scanHeadGroup.children.forEach((c) => {
    if (c.material) c.material.opacity = (1 - entered) * (c === scanHead ? 0.55 : 0.95);
  });

  camera.position.copy(_pos);
  camera.position.x += Math.sin(t * 0.35) * 0.12;
  camera.position.y += Math.sin(t * 0.5) * 0.08;
  camera.lookAt(_look);
  // 飛行傾斜，增加速度／臨場感
  camera.rotation.z = Math.sin(t * 0.3) * 0.012;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------------------------------------------------------------------- */
/* 進站序幕                                                               */
/* ---------------------------------------------------------------------- */
const boot = document.getElementById("boot");
const bootBar = document.getElementById("boot-bar");
const bootStatus = document.getElementById("boot-status");

function runBoot() {
  const steps = [
    [0, "建立連線…"],
    [38, "載入模組…"],
    [74, "同步資料…"],
    [100, "SNATCH OS"],
  ];
  let pct = 0;
  const iv = setInterval(() => {
    pct = Math.min(100, pct + 2 + Math.random() * 3);
    bootBar.style.width = pct + "%";
    const step = steps.filter((s) => pct >= s[0]).pop();
    if (step) bootStatus.textContent = step[1];
    if (pct >= 100) {
      clearInterval(iv);
      bootStatus.classList.add("is-ok");
      setTimeout(() => {
        boot.classList.add("is-done");
        document.getElementById("topbar").classList.add("is-visible");
        lenis.start();
      }, 650);
    }
  }, 70);
}
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => setTimeout(runBoot, 400));
} else {
  setTimeout(runBoot, 600);
}

/* ---------------------------------------------------------------------- */
/* Resize                                                                 */
/* ---------------------------------------------------------------------- */
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
