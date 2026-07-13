import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
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
// 螢幕發光面（會脈動）— 收集起來統一在 tick 動畫
const screenGlows = [];
function screenGlow(w, h) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending })
  );
  m.userData.glow = true;
  screenGlows.push(m);
  return m;
}
function smallCircle(r, color = "#0a0807", op = 0.95) {
  return new THREE.Mesh(
    new THREE.CircleGeometry(r, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op })
  );
}
function smallRing(rInner, rOuter, color = "#ffffff", op = 0.6) {
  return new THREE.Mesh(
    new THREE.RingGeometry(rInner, rOuter, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, side: THREE.DoubleSide })
  );
}
function darkPlate(w, h, color = "#08070b", op = 0.88) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op })
  );
}

/* ---- 手機（圓角機身 + 瀏海相機 + 聽筒 + Home 鍵） ---- */
function makePhone() {
  const g = new THREE.Group();
  const body = wfGroup(new RoundedBoxGeometry(1.1, 2.2, 0.14, 4, 0.14));
  g.add(body);
  // 螢幕暗色面（讓螢幕區看起來像玻璃下的內容）
  const screen = darkPlate(0.92, 1.78);
  screen.position.z = 0.073;
  g.add(screen);
  // 螢幕發光
  const glow = screenGlow(0.92, 1.78);
  glow.position.z = 0.078;
  g.add(glow);
  // 供 HTML UI 精準對位：記住螢幕面與尺寸
  g.userData.screen = { mesh: glow, w: 0.92, h: 1.78 };
  // 上方瀏海：聽筒長條 + 鏡頭點
  const ear = darkPlate(0.32, 0.04, "#000000", 0.95);
  ear.position.set(-0.08, 0.96, 0.082);
  const cam = smallCircle(0.04, "#000000");
  cam.position.set(0.18, 0.96, 0.082);
  const camRing = smallRing(0.045, 0.058, ACCENT.getStyle(), 0.85);
  camRing.position.set(0.18, 0.96, 0.085);
  g.add(ear, cam, camRing);
  // 下方 Home / 指示條
  const home = darkPlate(0.34, 0.04, "#1a1a1a", 0.85);
  home.position.set(0, -0.96, 0.082);
  g.add(home);
  return g;
}

/* ---- 平板（圓角 + 中央鏡頭 + 下方圓形 Home） ---- */
function makeTablet() {
  const g = new THREE.Group();
  const body = wfGroup(new RoundedBoxGeometry(2.6, 3.4, 0.18, 4, 0.16));
  g.add(body);
  const screen = darkPlate(2.2, 2.9);
  screen.position.z = 0.095;
  g.add(screen);
  const glow = screenGlow(2.2, 2.9);
  glow.position.z = 0.1;
  g.add(glow);
  // 頂部中央鏡頭
  const cam = smallCircle(0.055, "#000000");
  cam.position.set(0, 1.55, 0.105);
  const camRing = smallRing(0.06, 0.08, ACCENT.getStyle(), 0.85);
  camRing.position.set(0, 1.55, 0.108);
  g.add(cam, camRing);
  // 底部 Home 圓鍵
  const home = smallRing(0.1, 0.13, "#ffffff", 0.4);
  home.position.set(0, -1.55, 0.105);
  g.add(home);
  return g;
}

/* ---- 筆電（圓角底座 + 鍵盤 + 觸控板 + 鉸鏈 + 螢幕鏡頭） ---- */
function makeLaptop() {
  const g = new THREE.Group();
  // 底座
  const base = wfGroup(new RoundedBoxGeometry(3.4, 0.16, 2.3, 4, 0.05));
  base.position.y = 0;
  g.add(base);
  // 鍵盤面（暗色面）
  const keyboard = darkPlate(2.9, 1.4);
  keyboard.rotation.x = -Math.PI / 2;
  keyboard.position.set(0, 0.082, -0.1);
  g.add(keyboard);
  // 鍵盤格線（白色細線）
  const keysGeo = new THREE.PlaneGeometry(2.9, 1.4, 14, 5);
  const keysMat = new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.18 });
  const keys = new THREE.Mesh(keysGeo, keysMat);
  keys.rotation.x = -Math.PI / 2;
  keys.position.set(0, 0.085, -0.1);
  g.add(keys);
  // 觸控板
  const trackpad = darkPlate(1.0, 0.7, "#0c0a08", 0.9);
  trackpad.rotation.x = -Math.PI / 2;
  trackpad.position.set(0, 0.086, 0.78);
  g.add(trackpad);
  // 鉸鏈
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 3.2, 14),
    new THREE.MeshStandardMaterial({ color: "#22201d", roughness: 0.4, metalness: 0.8 })
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.18, -1.05);
  g.add(hinge);
  // 螢幕（向後仰，貼著鉸鏈）
  const screenAssy = new THREE.Group();
  const screenBody = wfGroup(new RoundedBoxGeometry(3.4, 2.1, 0.12, 4, 0.06));
  screenAssy.add(screenBody);
  const screenFace = darkPlate(2.9, 1.6);
  screenFace.position.z = 0.065;
  screenAssy.add(screenFace);
  const screenGlowM = screenGlow(2.9, 1.6);
  screenGlowM.position.z = 0.07;
  screenAssy.add(screenGlowM);
  // 供 HTML UI 精準對位：記住螢幕面與尺寸
  g.userData.screen = { mesh: screenGlowM, w: 2.9, h: 1.6 };
  // 螢幕上緣鏡頭
  const cam = smallCircle(0.03, "#000000");
  cam.position.set(0, 0.92, 0.07);
  const camRing = smallRing(0.035, 0.045, ACCENT.getStyle(), 0.85);
  camRing.position.set(0, 0.92, 0.073);
  screenAssy.add(cam, camRing);
  // 仰角
  screenAssy.position.set(0, 1.13, -1.04);
  screenAssy.rotation.x = -0.32;
  g.add(screenAssy);
  return g;
}
// 裝置註冊：捲動進度接近 station 時飛入並停留，遠離後飛出
const devices = [];
function placeDevice(group, pos, scale, spinY = 0.04, stationP = 0.5) {
  group.position.set(...pos);
  group.scale.setScalar(0); // 預設縮小，待飛入動畫顯示
  group.rotation.y = pos[0] > 0 ? -0.5 : 0.5;
  group.userData.spin = [0, spinY, 0];
  // 浮動幅度收小：鏡頭會停在螢幕正前方，避免畫面上下晃
  group.userData.float = { amp: 0.1, off: Math.random() * 6, baseY: pos[1] };
  group.userData.device = {
    baseX: pos[0],
    baseY: pos[1],
    baseZ: pos[2],
    baseRotY: group.rotation.y, // 螢幕朝向鏡頭的基準角
    scaleTarget: scale,
    stationP,
    fromDir: pos[0] >= 0 ? 1 : -1, // 從遠處側方飛入
  };
  scene.add(group);
  devices.push(group);
  return group;
}

/* ---- 入口閘門（掃描完成後自動開啟 → camera 自動穿過） ---- */
const gate = new THREE.Group();
gate.position.set(0, 0, 4);
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
gate.visible = false; // 改用滿版 CSS 門板過場，隱藏 3D 小閘門
scene.add(gate);

/* ---- 沿走廊佈置：閘門 → 裝置 + 少量抽象體（補景深氣氛） ---- */
/* ---- 健身器材構造物（橘色實體 + 白線框，取代抽象幾何） ---- */
function makeDumbbell() {
  const g = new THREE.Group();
  const bar = wfGroup(new THREE.CylinderGeometry(0.11, 0.11, 2.6, 16));
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  // 兩端各三片碟片，由大到小
  [-1, 1].forEach((s) => {
    [[0.62, 0], [0.52, 0.22], [0.42, 0.4]].forEach(([r, off]) => {
      const disc = wfGroup(new THREE.CylinderGeometry(r, r, 0.16, 24));
      disc.rotation.z = Math.PI / 2;
      disc.position.x = s * (0.9 + off);
      g.add(disc);
    });
  });
  return g;
}
function makeKettlebell() {
  const g = new THREE.Group();
  const body = wfGroup(new THREE.SphereGeometry(0.85, 24, 18));
  body.position.y = -0.15;
  const handle = wfGroup(new THREE.TorusGeometry(0.55, 0.13, 12, 28, Math.PI));
  handle.position.y = 0.55;
  const base = wfGroup(new THREE.CylinderGeometry(0.52, 0.58, 0.16, 20));
  base.position.y = -0.98;
  g.add(body, handle, base);
  return g;
}
function makeBarbell() {
  const g = new THREE.Group();
  const bar = wfGroup(new THREE.CylinderGeometry(0.07, 0.07, 5.4, 12));
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  // 兩端槓片組 + 卡扣
  [-1, 1].forEach((s) => {
    [[0.95, 0.18, 2.0], [0.75, 0.15, 2.22], [0.55, 0.13, 2.4]].forEach(([r, h, x]) => {
      const plate = wfGroup(new THREE.CylinderGeometry(r, r, h, 28));
      plate.rotation.z = Math.PI / 2;
      plate.position.x = s * x;
      g.add(plate);
    });
    const collar = wfGroup(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 14));
    collar.rotation.z = Math.PI / 2;
    collar.position.x = s * 1.82;
    g.add(collar);
  });
  return g;
}
function makeWeightPlate() {
  // 大槓片：環 + 內圈軸孔
  const g = new THREE.Group();
  const ring = wfGroup(new THREE.TorusGeometry(1.25, 0.45, 16, 40));
  const hub = wfGroup(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 18));
  hub.rotation.x = Math.PI / 2;
  g.add(ring, hub);
  return g;
}
function placeProp(group, pos, scale = 1, spin = [0.02, 0.04, 0.015]) {
  group.position.set(...pos);
  group.scale.setScalar(scale);
  group.rotation.set(
    Math.random() * 0.6 - 0.3,
    Math.random() * Math.PI * 2,
    Math.random() * 0.5 - 0.25
  );
  group.userData.spin = spin;
  group.userData.float = { amp: 0.55, off: Math.random() * 6, baseY: pos[1] };
  scene.add(group);
  forms.push(group);
  return group;
}

/* ---- 沿走廊佈置：健身器材 + 裝置 ---- */
placeProp(makeDumbbell(), [-6, 2, -12], 1.35, [0.03, 0.05, 0.02]);
placeDevice(makeTablet(), [5.6, 1.6, -30], 1.0, 0.04, 3 / 10);      // 系統全覽 station 3
placeProp(makeKettlebell(), [-5.5, -1, -42], 1.5, [0.02, 0.06, 0.02]);
const devPhone = placeDevice(makePhone(), [4.8, 0.6, -52], 1.7, 0.06, 4 / 10); // LINE 一站式 station 4
placeProp(makeDumbbell(), [6.8, -1.6, -59], 0.85, [0.04, 0.05, 0.03]);
const devLaptop = placeDevice(makeLaptop(), [-5, 1, -66], 1.05, 0.03, 5 / 10); // AI 後台 station 5
placeProp(makeBarbell(), [6.5, 2, -82], 1.05, [0.015, 0.04, 0.02]);
placeDevice(makeTablet(), [-4.4, 1.2, -98], 1.15, 0.04, 8 / 10);    // FAQ station 8
placeProp(makeKettlebell(), [6, 1.6, -97], 1.1, [0.03, 0.05, 0.02]);
placeProp(makeWeightPlate(), [5, -1, -110], 1.3, [0.06, 0.03, 0.03]);

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
// 捲動路徑（p=0 已在閘門內側 = 自動過場的終點）
const HERO = { pos: [0, 1.1, 1], look: [0, 0.8, -11] };
const waypoints = [
  { p: 0.0, pos: HERO.pos, look: HERO.look },             // 進站完成，站在閘門內
  { p: 0.13, pos: [1.6, 1, -3], look: [-1, 0.5, -14] },
  { p: 0.22, pos: [-2.2, 0.2, -16], look: [1, 0.6, -28] },
  { p: 0.33, pos: [1.4, 1.2, -30], look: [-1.2, 0.4, -42] },
  // LINE 站：飛抵手機螢幕正前方，停住（畫面接在手機螢幕上）
  { p: 0.41, pos: [2.95, 0.75, -48.5], look: [4.8, 0.6, -52] },
  { p: 0.49, pos: [3.15, 0.7, -48.9], look: [4.8, 0.6, -52] },
  // AI 後台站：橫移到筆電螢幕正前方，停近一點（console 讀得清楚）
  { p: 0.53, pos: [-3.45, 2.28, -63.3], look: [-5, 2.05, -66] },
  { p: 0.61, pos: [-3.3, 2.22, -63.6], look: [-5, 2.05, -66] },
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
  phoneO = pO; // 位置交由 syncDeviceUI 每幀投影對位
  phone.style.opacity = pO.toFixed(3);
  const idx = Math.min(phoneMenuBtns.length - 1, Math.floor(aPh * phoneMenuBtns.length));
  if (aPh > 0 && aPh < 1 && idx !== activePhone) {
    activePhone = idx;
    phoneMenuBtns.forEach((b, k) => b.classList.toggle("is-active", k === idx));
  }

  // AI 對話式後台 console
  const aCon = actLocal(p, ACT_CONSOLE);
  const cO = bell(aCon);
  consoleO = cO; // 位置交由 syncDeviceUI 每幀投影對位
  consoleEl.style.opacity = cO.toFixed(3);
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
let lastT = 0;
let phoneO = 0; // LINE UI 可見度（由 applyProgress 更新）
let consoleO = 0; // console 可見度

// 3D 互動：滑鼠視差
let pointerX = 0, pointerY = 0, pointerTX = 0, pointerTY = 0;
addEventListener("pointermove", (e) => {
  pointerTX = (e.clientX / innerWidth) * 2 - 1;
  pointerTY = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });
// 離開視窗時回正
addEventListener("pointerleave", () => { pointerTX = 0; pointerTY = 0; }, { passive: true });

/* ---- HTML UI 精準對位：把 3D 螢幕面的四角投影到畫面座標 ---- */
const _corner = new THREE.Vector3();
function projectScreenQuad(device) {
  const scr = device.userData.screen;
  device.updateWorldMatrix(true, true);
  const hw = scr.w / 2;
  const hh = scr.h / 2;
  const pts = [];
  // TL, TR, BR, BL（局部 +y 朝上）
  [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].forEach(([x, y]) => {
    _corner.set(x, y, 0);
    scr.mesh.localToWorld(_corner);
    _corner.project(camera);
    pts.push({
      x: (_corner.x * 0.5 + 0.5) * innerWidth,
      y: (-_corner.y * 0.5 + 0.5) * innerHeight,
    });
  });
  return pts;
}
function syncDeviceUI() {
  // 確保投影矩陣是本幀鏡頭位置（render 前手動更新）
  camera.updateMatrixWorld();
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

  // 手機：LINE UI 以「高度」貼合 3D 螢幕、中心對中心
  if (phoneO > 0.01 && devPhone.visible) {
    const q = projectScreenQuad(devPhone);
    const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4;
    const cy = (q[0].y + q[1].y + q[2].y + q[3].y) / 4;
    const qh = (Math.hypot(q[3].x - q[0].x, q[3].y - q[0].y) + Math.hypot(q[2].x - q[1].x, q[2].y - q[1].y)) / 2;
    const s = qh / phone.offsetHeight;
    phone.style.left = "0";
    phone.style.top = "0";
    phone.style.transform =
      `translate(${cx.toFixed(1)}px, ${(cy + (1 - phoneO) * 26).toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(4)})`;
  }
  // 筆電：console 以「寬度」貼合 3D 螢幕、上緣對齊
  if (consoleO > 0.01 && devLaptop.visible) {
    const q = projectScreenQuad(devLaptop);
    const topX = (q[0].x + q[1].x) / 2;
    const topY = (q[0].y + q[1].y) / 2;
    const qw = (Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y) + Math.hypot(q[2].x - q[3].x, q[2].y - q[3].y)) / 2;
    const s = qw / consoleEl.offsetWidth;
    consoleEl.style.left = "0";
    consoleEl.style.top = "0";
    consoleEl.style.transformOrigin = "50% 0";
    consoleEl.style.transform =
      `translate(${topX.toFixed(1)}px, ${(topY + (1 - consoleO) * 26).toFixed(1)}px) translate(-50%,0) scale(${s.toFixed(4)})`;
  }
}

// 自動進場過場（掃描完成後觸發）
let introPlaying = false;
let introT = 0;
const INTRO_DUR = 3.2; // 配合 2.6s 開門，鏡頭緩慢推進
const INTRO_START = { pos: [0, 1.2, 7], look: [0, 0.9, -9] }; // 門開時鏡頭緩緩推進
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

  // 裝置：按 station 進度飛入、停留、飛出
  devices.forEach((g) => {
    const d = g.userData.device;
    // 與站台中心的距離：提早飛入、整站停留、離站才飛出
    const delta = renderProgress - d.stationP;
    let visibility;
    if (delta < -0.07) visibility = 0;
    else if (delta < -0.01) visibility = smootherstep((delta + 0.07) / 0.06);
    else if (delta < 0.11) visibility = 1;
    else if (delta < 0.17) visibility = 1 - smootherstep((delta - 0.11) / 0.06);
    else visibility = 0;
    // 縮放與位置偏移：未顯示時隱形，飛入過程從遠處彈跳出來
    const offset = 1 - visibility;
    g.scale.setScalar(d.scaleTarget * visibility);
    g.visible = visibility > 0.001;
    g.position.x = d.baseX + d.fromDir * offset * 7;
    g.position.y = d.baseY + Math.sin(t * 0.5 + g.userData.float.off) * g.userData.float.amp + offset * 4;
    g.position.z = d.baseZ + offset * 12;
    // 旋轉：不累積自轉，繞著「螢幕朝向鏡頭」的基準角輕輕擺動
    // 飛入過程帶一點入場旋轉（offset 越大轉越多）
    g.rotation.y = d.baseRotY + Math.sin(t * 0.45 + g.userData.float.off) * 0.05 + d.fromDir * offset * 0.9;
    g.rotation.x = Math.sin(t * 0.3 + g.userData.float.off) * 0.02;
  });

  // 螢幕脈動發光
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.5);
  screenGlows.forEach((m) => { m.material.opacity = 0.22 + pulse * 0.22; });

  // 閘門掃描光束：上下掃描
  gateScan.position.y = 2.4 + Math.sin(t * 1.6) * 2.0;

  const dt = Math.min(0.05, t - lastT);
  lastT = t;

  // 自動進場過場：飛越閘門 → 抵達 HERO，期間閘門自動開啟
  if (introPlaying) {
    introT = Math.min(1, introT + dt / INTRO_DUR);
    const e = smootherstep(introT);
    _pos.set(
      THREE.MathUtils.lerp(INTRO_START.pos[0], HERO.pos[0], e),
      THREE.MathUtils.lerp(INTRO_START.pos[1], HERO.pos[1], e),
      THREE.MathUtils.lerp(INTRO_START.pos[2], HERO.pos[2], e)
    );
    _look.set(
      THREE.MathUtils.lerp(INTRO_START.look[0], HERO.look[0], e),
      THREE.MathUtils.lerp(INTRO_START.look[1], HERO.look[1], e),
      THREE.MathUtils.lerp(INTRO_START.look[2], HERO.look[2], e)
    );
    const go = smootherstep(THREE.MathUtils.clamp((introT - 0.12) / 0.5, 0, 1));
    panelL.position.x = -0.95 - go * 2.8;
    panelR.position.x = 0.95 + go * 2.8;
    gateScan.material.opacity = (1 - go) * 0.85;
    if (introT >= 1) {
      introPlaying = false;
      lenis.start();
      // 直接帶入標題：輕輕捲到 hero 文案顯示處
      if (!window.__titleShown) {
        window.__titleShown = true;
        setTimeout(() => lenis.scrollTo(lenis.limit * 0.05, { duration: 1.6 }), 120);
      }
    }
  } else if (introT === 0) {
    // 進場前：閘門掃描光束待機脈動
    gateScan.material.opacity = 0.55 + 0.35 * Math.abs(Math.sin(t * 1.6));
  }

  // 滑鼠視差：平滑跟進（進場過場時不介入）
  const par = introPlaying ? 0 : 1;
  pointerX += (pointerTX * par - pointerX) * 0.06;
  pointerY += (pointerTY * par - pointerY) * 0.06;

  camera.position.copy(_pos);
  camera.position.x += Math.sin(t * 0.35) * 0.12 + pointerX * 0.9;
  camera.position.y += Math.sin(t * 0.5) * 0.08 - pointerY * 0.6;
  // 看向點也隨滑鼠偏移 → 產生「在空間裡看向四周」的 3D 視差
  camera.lookAt(_look.x + pointerX * 0.5, _look.y - pointerY * 0.35, _look.z);
  // 飛行傾斜，增加速度／臨場感
  camera.rotation.z = Math.sin(t * 0.3) * 0.012 + pointerX * 0.012;

  // HTML UI 精準貼上 3D 螢幕（投影對位，跟著鏡頭一起動）
  syncDeviceUI();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------------------------------------------------------------------- */
/* Stage 0：肖像入口 → 掃描（大型 3D 頭，往右轉）→ 自動開門進場            */
/* ---------------------------------------------------------------------- */
const entry = document.getElementById("entry");
const entryCta = document.getElementById("entry-cta");
const bootBar = document.getElementById("boot-bar");
const bootStatus = document.getElementById("boot-status");
const bootMetric = document.getElementById("boot-metric");
const bootPulse = document.getElementById("boot-pulse");

// 掃描階段：播放「轉正」影片 + 狀態列推進；影片結束 → 碎裂進場 + 自動開門
function runScan() {
  const video = document.getElementById("entry-video");
  const steps = [
    [0,   "建立連線…",       () => "—— pts"],
    [14,  "偵測臉部…",       (pct) => `${Math.floor(pct * 1.2)} pts`],
    [34,  "建立 3D 臉模…",   (pct) => `${Math.floor(pct * 1.8)} / 168 pts`],
    [60,  "比對會員資料…",   () => `MATCH · 99.${Math.floor(Math.random() * 8)}%`],
    [85,  "授權核發中…",     () => "GRANTED"],
    [100, "通過 · 開啟閘門",  () => "ACCESS GRANTED"],
  ];
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    bootBar.style.width = "100%";
    bootStatus.textContent = "通過 · 開啟閘門";
    bootStatus.classList.add("is-ok");
    bootMetric.textContent = "ACCESS GRANTED";
    bootPulse.classList.add("is-flash");
    enterWorld();
  };

  let pct = 0;
  const iv = setInterval(() => {
    // 進度跟著影片時間走（影片就是臉轉正的過程）
    if (video && video.duration) {
      pct = Math.min(100, (video.currentTime / video.duration) * 100);
    } else {
      pct = Math.min(100, pct + 0.8);
    }
    bootBar.style.width = pct.toFixed(0) + "%";
    const step = steps.filter((s) => pct >= s[0]).pop();
    if (step) { bootStatus.textContent = step[1]; bootMetric.textContent = step[2](pct); }
    if (pct >= 99.5 || (video && video.ended)) { clearInterval(iv); finish(); }
  }, 80);

  if (video) {
    video.currentTime = 0;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
    video.addEventListener("ended", () => { clearInterval(iv); finish(); }, { once: true });
    // 保險：影片若無法播放，最長 5 秒後仍進場
    setTimeout(finish, 5200);
  } else {
    setTimeout(finish, 4200);
  }
}

function enterWorld() {
  const portal = document.getElementById("portal");
  // 1) 柔光 bloom + 影像順放大淡出；門板就位（接縫亮線蓄勢）
  entry.classList.add("is-entering");
  bootPulse.classList.add("is-flash");
  portal.classList.add("is-armed");
  // 2) entry 淡出，露出關閉的滿版門（停一拍，讓接縫脈動讀得到）
  setTimeout(() => {
    entry.classList.add("is-done");
    document.getElementById("topbar").classList.add("is-visible");
  }, 850);
  // 3) 滿版開門（門板緩緩左右滑開 2.6s）+ 鏡頭同步緩推
  setTimeout(() => {
    portal.classList.add("is-open");
    introPlaying = true;
  }, 2100);
  // 4) 門完全開啟後收起 portal
  setTimeout(() => portal.classList.remove("is-armed"), 5200);
}

entryCta.addEventListener("click", () => {
  if (entry.classList.contains("is-scanning") || entry.classList.contains("is-entering")) return;
  entry.classList.add("is-scanning");
  // 更新 HUD：FACE → SCANNING
  const faceHud = [...document.querySelectorAll(".entry__hud--right li span")][1];
  if (faceHud) faceHud.textContent = "SCANNING…";
  runScan();
});

/* ---------------------------------------------------------------------- */
/* Resize                                                                 */
/* ---------------------------------------------------------------------- */
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
