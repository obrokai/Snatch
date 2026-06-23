import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Lenis from "lenis";
import "./style.css";

/* =========================================================================
   SnatchOS — 七幕 3D 場景捲動體驗
   母題：該消失的都消失了。捲動 = 沿著健身房動線往前走。
   ========================================================================= */

// 永遠從店門外開始這趟動線
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);

const COLD_BG = new THREE.Color("#0a0a0d");
const ACCENT = new THREE.Color("#ff6b1a");

/* ---------------------------------------------------------------------- */
/* Renderer / Scene / Camera                                              */
/* ---------------------------------------------------------------------- */
const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = COLD_BG;
const fog = new THREE.FogExp2("#0a0a0d", 0.055);
scene.fog = fog;

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 120);

/* ---------------------------------------------------------------------- */
/* 真實環境光（CC0 HDRI · Poly Haven）— 提供 PBR 反射與基底光               */
/* 只當 environment（反射/IBL），背景仍維持暗色調，保留冷靜的高級感         */
/* ---------------------------------------------------------------------- */
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
new RGBELoader().load(
  `${import.meta.env.BASE_URL}hdri/venue_1k.hdr`,
  (hdr) => {
    const envMap = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 0.4; // 克制，避免洗掉暗調
    hdr.dispose();
    pmrem.dispose();
  }
);

/* ---------------------------------------------------------------------- */
/* Lights                                                                 */
/* ---------------------------------------------------------------------- */
const ambient = new THREE.AmbientLight("#c4bcb2", 0.35);
scene.add(ambient);

// 收束時才亮起的天空光（讓「整理後」像旗艦店一樣開闊明亮）
const hemi = new THREE.HemisphereLight("#ffe9d6", "#15110d", 0);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight("#fff1e6", 0.5);
keyLight.position.set(4, 9, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 45;
keyLight.shadow.camera.left = -14;
keyLight.shadow.camera.right = 14;
keyLight.shadow.camera.top = 14;
keyLight.shadow.camera.bottom = -14;
keyLight.shadow.bias = -0.0004;
keyLight.shadow.normalBias = 0.025;
scene.add(keyLight);

// 門口的辨識光暈（冷白 + 微青）
const doorGlow = new THREE.PointLight(ACCENT, 2.2, 16, 2);
doorGlow.position.set(0, 3, 4.4);
scene.add(doorGlow);

// 天花板燈帶
const ceilingLights = [];
for (let i = 0; i < 6; i++) {
  const z = 3 - i * 3;
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.08, 2.4),
    new THREE.MeshStandardMaterial({
      color: "#14110d",
      emissive: "#ffe8d4",
      emissiveIntensity: 1.4,
    })
  );
  strip.position.set(0, 4.4, z);
  scene.add(strip);
  const lp = new THREE.PointLight("#ffeada", 0.55, 9, 2);
  lp.position.set(0, 4.1, z);
  scene.add(lp);
  ceilingLights.push(lp);
}

// 櫃檯聚光
const counterSpot = new THREE.SpotLight("#fff3ea", 0, 14, Math.PI / 6, 0.5, 1.5);
counterSpot.position.set(-4, 4.2, -1);
counterSpot.target.position.set(-4, 0, -3);
counterSpot.castShadow = true;
counterSpot.shadow.mapSize.set(1024, 1024);
counterSpot.shadow.bias = -0.0005;
scene.add(counterSpot, counterSpot.target);

/* ---------------------------------------------------------------------- */
/* Materials                                                              */
/* ---------------------------------------------------------------------- */
const matFloor = new THREE.MeshStandardMaterial({
  color: "#0d0b0a",
  roughness: 0.26,
  metalness: 0.7,
  envMapIntensity: 0.8,
});
const matWall = new THREE.MeshStandardMaterial({
  color: "#0b0a09",
  roughness: 0.9,
  metalness: 0.1,
});
// 收束時把空間「打亮」：地板/牆面色調往乾淨暖灰（近 paper）過渡
const FLOOR_DARK = new THREE.Color("#0d0b0a");
const FLOOR_LIT = new THREE.Color("#34302b");
const WALL_DARK = new THREE.Color("#0b0a09");
const WALL_LIT = new THREE.Color("#2a2620");
const matMetal = new THREE.MeshStandardMaterial({
  color: "#22201d",
  roughness: 0.35,
  metalness: 0.8,
});
const matDark = new THREE.MeshStandardMaterial({
  color: "#14110e",
  roughness: 0.7,
  metalness: 0.4,
});

/* ---------------------------------------------------------------------- */
/* Build venue                                                            */
/* ---------------------------------------------------------------------- */
const world = new THREE.Group();
scene.add(world);

// 地板（含反射感）
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 40), matFloor);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, -5);
floor.receiveShadow = true;
world.add(floor);

// 地板格線
const grid = new THREE.GridHelper(40, 40, "#2a241e", "#181410");
grid.position.set(0, 0.01, -5);
grid.material.transparent = true;
grid.material.opacity = 0.35;
world.add(grid);

// 牆
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 9), matWall);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-6.5, 4.5, -5);
world.add(leftWall);

const rightWall = leftWall.clone();
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.set(6.5, 4.5, -5);
world.add(rightWall);
leftWall.receiveShadow = true;
rightWall.receiveShadow = true;

const backWall = new THREE.Mesh(new THREE.PlaneGeometry(13, 9), matWall);
backWall.position.set(0, 4.5, -15);
backWall.receiveShadow = true;
world.add(backWall);

/* ---- 鏡牆（健身房招牌元素 · 以 HDRI 環境反射呈現，穩定不閃爍） ---- */
const mirror = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 3.4),
  new THREE.MeshStandardMaterial({
    color: "#cfcabf",
    roughness: 0.08,
    metalness: 1,
    envMapIntensity: 2.2,
  })
);
mirror.rotation.y = -Math.PI / 2;
mirror.position.set(6.42, 1.85, -8.5);
world.add(mirror);
// 鏡框
const mirrorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 3.7, 7.3),
  new THREE.MeshStandardMaterial({ color: "#1b1916", roughness: 0.5, metalness: 0.6 })
);
mirrorFrame.position.set(6.46, 1.85, -8.5);
world.add(mirrorFrame);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(16, 40), matWall);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(0, 5, -5);
world.add(ceiling);

/* ---- 入口門框 + 自動門 ---- */
const doorGroup = new THREE.Group();
doorGroup.position.set(0, 0, 4);
world.add(doorGroup);

// 入口牆（中間開口）
const jambGeo = new THREE.BoxGeometry(2.2, 5, 0.3);
const jambL = new THREE.Mesh(jambGeo, matDark);
jambL.position.set(-2.6, 2.5, 0);
const jambR = jambL.clone();
jambR.position.x = 2.6;
const lintel = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1, 0.3), matDark);
lintel.position.set(0, 4.5, 0);
doorGroup.add(jambL, jambR, lintel);

// 自動門（兩扇玻璃，會在 act0 滑開）
const glassMat = new THREE.MeshStandardMaterial({
  color: "#b3ada3",
  roughness: 0.1,
  metalness: 0.2,
  transparent: true,
  opacity: 0.24,
});
const doorPanelL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 0.08), glassMat);
doorPanelL.position.set(-0.78, 2, 0.05);
const doorPanelR = doorPanelL.clone();
doorPanelR.position.x = 0.78;
doorGroup.add(doorPanelL, doorPanelR);

// 人臉辨識鏡頭（低調，門框上角）
const camHousing = new THREE.Mesh(
  new THREE.BoxGeometry(0.34, 0.18, 0.22),
  matMetal
);
camHousing.position.set(1.35, 3.85, 0.2);
doorGroup.add(camHousing);
const camLens = new THREE.Mesh(
  new THREE.CircleGeometry(0.05, 24),
  new THREE.MeshStandardMaterial({
    color: "#04201b",
    emissive: ACCENT,
    emissiveIntensity: 2,
  })
);
camLens.position.set(1.35, 3.85, 0.32);
doorGroup.add(camLens);

// 掃描環（辨識動態）
const scanRing = new THREE.Mesh(
  new THREE.RingGeometry(0.5, 0.56, 48),
  new THREE.MeshBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  })
);
scanRing.position.set(0, 2.4, 1.6);
doorGroup.add(scanRing);

/* ---- 閘門（turnstile）：母題第一個「消失」 ---- */
const gate = new THREE.Group();
gate.position.set(0, 0, 2.4);
world.add(gate);
const postMat = new THREE.MeshStandardMaterial({
  color: "#2c2925",
  roughness: 0.3,
  metalness: 0.85,
  transparent: true,
  opacity: 1,
});
const armMat = postMat.clone();
[-0.9, 0.9].forEach((x) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.05, 20), postMat);
  post.position.set(x, 0.55, 0);
  gate.add(post);
});
const armL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), armMat);
armL.position.set(-0.45, 0.95, 0);
const armR = armL.clone();
armR.position.x = 0.45;
gate.add(armL, armR);

/* ---- 櫃檯 ---- */
const counter = new THREE.Group();
counter.position.set(-4, 0, -2.5);
world.add(counter);
const counterBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 3.4), matMetal);
counterBody.position.y = 0.55;
const counterTop = new THREE.Mesh(
  new THREE.BoxGeometry(1.9, 0.12, 3.7),
  new THREE.MeshStandardMaterial({ color: "#33302b", roughness: 0.25, metalness: 0.7 })
);
counterTop.position.y = 1.16;
counter.add(counterBody, counterTop);

// 櫃檯螢幕（act4 會發亮）
const screenMat = new THREE.MeshStandardMaterial({
  color: "#0a0807",
  emissive: "#5a2c0c",
  emissiveIntensity: 0.6,
});
const screen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 1.1), screenMat);
screen.position.set(0.4, 1.7, 0.4);
screen.rotation.z = -0.04;
counter.add(screen);

// 櫃檯雜物（act3 後「消失」：象徵雜事被拿走）
const clutter = new THREE.Group();
const stack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.7), matDark);
stack.position.set(0.1, 1.36, -1);
clutter.add(stack);
counter.add(clutter);

/* ---- 店員（解放，不是取代：走向場上） ---- */
const staff = new THREE.Group();
staff.position.set(-4, 0, -3.2);
const bodyMat = new THREE.MeshStandardMaterial({
  color: "#4a443d",
  roughness: 0.7,
  metalness: 0.1,
  transparent: true,
  opacity: 1,
});
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.7, 6, 12), bodyMat);
torso.position.y = 1.05;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 20), bodyMat);
head.position.y = 1.62;
staff.add(torso, head);
world.add(staff);

/* ---- 場上器材剪影（讓「場上」有東西，店員走過去服務） ---- */
function addRack(x, z) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.1, 0.15), matMetal);
  frame.position.set(-0.6, 1.05, 0);
  const frame2 = frame.clone();
  frame2.position.x = 0.6;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.15), matMetal);
  top.position.y = 2;
  for (let i = 0; i < 3; i++) {
    const plate = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.07, 12, 24),
      matMetal
    );
    plate.position.set(-0.45 + i * 0.18, 0.35, 0);
    g.add(plate);
  }
  g.add(frame, frame2, top);
  g.traverse((m) => (m.castShadow = true));
  g.position.set(x, 0, z);
  return g;
}
function addBench(x, z) {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 1.7), matDark);
  pad.position.y = 0.55;
  const legA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), matMetal);
  legA.position.set(0, 0.25, 0.7);
  const legB = legA.clone();
  legB.position.z = -0.7;
  g.add(pad, legA, legB);
  g.traverse((m) => (m.castShadow = true));
  g.position.set(x, 0, z);
  return g;
}

// 啞鈴架（左右各一排重量球）
function addDumbbellRack(x, z, rot = 0) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.5), matMetal);
  stand.position.y = 0.45;
  g.add(stand);
  for (let i = 0; i < 5; i++) {
    const r = 0.1 + i * 0.012;
    const db = new THREE.Mesh(
      new THREE.CapsuleGeometry(r, 0.12, 4, 10),
      new THREE.MeshStandardMaterial({ color: "#1a1816", roughness: 0.4, metalness: 0.7 })
    );
    db.rotation.z = Math.PI / 2;
    db.position.set(-0.7 + i * 0.34, 0.95, 0);
    g.add(db);
  }
  g.traverse((m) => (m.castShadow = true));
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  return g;
}

// 地墊（暖橘點綴 · 呼應品牌色）
function addMat(x, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.04, 2),
    new THREE.MeshStandardMaterial({ color: "#2a1206", roughness: 0.95, metalness: 0 })
  );
  m.position.set(x, 0.02, z);
  m.receiveShadow = true;
  return m;
}

world.add(
  addRack(4, -7),
  addRack(4.2, -10.5),
  addBench(2.6, -8.5),
  addBench(3.2, -11.5),
  addDumbbellRack(-4.6, -8, Math.PI / 2),
  addMat(1.5, -6),
  addMat(-1.4, -9.5)
);

// 櫃檯 / 店員 / 閘門投射陰影
[counter, staff, gate].forEach((grp) => grp.traverse((m) => {
  if (m.isMesh) m.castShadow = true;
}));

// 全貌時亮起的招牌（act5）
const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, 0.9),
  new THREE.MeshStandardMaterial({
    color: "#0a0807",
    emissive: ACCENT,
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.9,
  })
);
sign.position.set(0, 3.6, -14.6);
world.add(sign);

/* ---------------------------------------------------------------------- */
/* 鏡頭路徑（沿動線的關鍵幀）                                              */
/* p 為全站捲動進度 0..1                                                   */
/* ---------------------------------------------------------------------- */
const waypoints = [
  { p: 0.0, pos: [0, 1.72, 8], look: [0, 1.75, -2] },        // 00 進站（門內）
  { p: 0.1, pos: [0, 1.7, 5.5], look: [0, 1.65, -3] },       // 01 三件事·大廳
  { p: 0.22, pos: [0.5, 1.62, 3.2], look: [-1, 1.45, -5] },  // 02 痛點·深入
  { p: 0.34, pos: [0, 1.7, 1.6], look: [0, 1.6, -6] },       // 03 系統全覽·中軸
  { p: 0.45, pos: [0.3, 1.7, 0.6], look: [-1.5, 1.55, -4] }, // 04 LINE 一站式
  { p: 0.56, pos: [-1.9, 1.55, -1.2], look: [-4.2, 1.5, -4] }, // 05 AI 後台·櫃檯
  { p: 0.66, pos: [-0.5, 1.75, -2.2], look: [3, 1.6, -7] },  // 06 合規·轉向場上
  { p: 0.77, pos: [3.8, 4.3, 6.6], look: [-1.4, 1, -6] },    // 07 三個改變·拉遠全景
  { p: 0.88, pos: [2.4, 3.2, 7.6], look: [-0.4, 1.35, -5] }, // 08 FAQ·沉穩
  { p: 1.0, pos: [0, 2.1, 9], look: [0, 1.6, -3] },          // 09 出口
];

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function sampleCamera(p) {
  let a = waypoints[0];
  let b = waypoints[waypoints.length - 1];
  for (let i = 0; i < waypoints.length - 1; i++) {
    if (p >= waypoints[i].p && p <= waypoints[i + 1].p) {
      a = waypoints[i];
      b = waypoints[i + 1];
      break;
    }
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
/* 幕的工具                                                               */
/* ---------------------------------------------------------------------- */
const ACTS = 10;
const ACT_PHONE = 4; // LINE 一站式（會員端）
const ACT_CONSOLE = 5; // AI 對話式後台
const actEls = [...document.querySelectorAll(".ov")];
const dots = [...document.querySelectorAll(".progress li")];
const phone = document.getElementById("phone");
const phoneMenuBtns = [...document.querySelectorAll("#phone-menu button")];
const consoleEl = document.getElementById("console");
const consoleTyped = document.getElementById("console-typed");
const consoleResult = document.getElementById("console-result");
const progressNav = document.getElementById("progress");
const scrollHint = document.getElementById("scroll-hint");

// 每一站的局部進度
function actLocal(p, i) {
  return THREE.MathUtils.clamp(p * ACTS - i, 0, 1);
}
// 標準淡入淡出：進場 0..0.28，停留，退場 0.72..1
function bell(t) {
  if (t < 0.28) return t / 0.28;
  if (t > 0.72) return (1 - t) / 0.28;
  return 1;
}

let consoleStage = -1;
function setConsole(local) {
  // 兩段式：先問即時收入，再要本月營收看板
  if (local < 0.5) {
    const q = "今天收了多少？";
    const n = Math.floor((local / 0.4) * q.length);
    consoleTyped.textContent = q.slice(0, Math.min(n, q.length));
    if (consoleStage !== 0) {
      consoleStage = 0;
      consoleResult.innerHTML = "";
    }
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
    if (consoleStage !== 1) {
      consoleStage = 1;
      consoleResult.innerHTML = "";
    }
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
/* 主更新：把捲動進度灌進場景與所有幕                                       */
/* ---------------------------------------------------------------------- */
function applyProgress(p) {
  sampleCamera(p);

  // 全站「開闊度」：走到「三個改變／全景」時整個空間變亮、霧變薄
  const openness = smootherstep(THREE.MathUtils.clamp((p - 0.66) / 0.1, 0, 1));
  fog.density = THREE.MathUtils.lerp(0.055, 0.012, openness);
  ambient.intensity = THREE.MathUtils.lerp(0.35, 0.95, openness);
  hemi.intensity = openness * 0.85;
  keyLight.intensity = THREE.MathUtils.lerp(0.5, 1.15, openness);
  ceilingLights.forEach((l) => (l.intensity = THREE.MathUtils.lerp(0.55, 1.35, openness)));
  sign.material.emissiveIntensity = openness * 1.6;
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.45, openness);
  matFloor.color.lerpColors(FLOOR_DARK, FLOOR_LIT, openness);
  matWall.color.lerpColors(WALL_DARK, WALL_LIT, openness);
  grid.material.opacity = 0.35 + openness * 0.25;

  /* 進站：門禁掃描 → 閘門淡出、自動門滑開（前 ~1.5 站內完成） */
  const enter = smootherstep(THREE.MathUtils.clamp(p / 0.12, 0, 1));
  gate.children.forEach((c) => (c.material.opacity = 1 - enter));
  gate.scale.setScalar(1 - 0.4 * enter);
  doorPanelL.position.x = -0.78 - enter * 1.4;
  doorPanelR.position.x = 0.78 + enter * 1.4;
  const a0 = actLocal(p, 0);
  scanRing.material.opacity = bell(a0) * 0.9;
  scanRing.scale.setScalar(0.6 + a0 * 0.9);

  /* 櫃檯（AI 後台站）：店員走向場上 + 螢幕點亮 + 聚光 */
  const aCon = actLocal(p, ACT_CONSOLE);
  const walk = smootherstep(aCon);
  staff.position.x = -4 + walk * 2.6;
  staff.position.z = -3.2 - walk * 2.4;
  bodyMat.opacity = 1 - 0.45 * walk;
  clutter.children.forEach((c) => {
    c.position.y = 1.36 + walk * 1.2;
    if (!c.material.transparent) c.material.transparent = true;
    c.material.opacity = 1 - walk;
  });
  screenMat.emissiveIntensity = 0.6 + bell(aCon) * 2.4;
  counterSpot.intensity = bell(aCon) * 3.2;

  /* ---- HTML 疊層：文案 ---- */
  actEls.forEach((el, i) => {
    const local = actLocal(p, i);
    const o = bell(local);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${(1 - o) * 26}px)`;
    el.style.pointerEvents = o > 0.6 ? "auto" : "none";
  });

  /* ---- 會員 LINE 手機 ---- */
  const aPh = actLocal(p, ACT_PHONE);
  const pO = bell(aPh);
  phone.style.opacity = pO.toFixed(3);
  phone.style.transform = `translate(-50%,-50%) translateY(${(1 - pO) * 40}px) scale(${0.92 + pO * 0.08})`;
  const idx = Math.min(phoneMenuBtns.length - 1, Math.floor(aPh * phoneMenuBtns.length));
  if (aPh > 0 && aPh < 1 && idx !== activePhone) {
    activePhone = idx;
    phoneMenuBtns.forEach((b, k) => b.classList.toggle("is-active", k === idx));
  }

  /* ---- AI 對話式後台 console ---- */
  const cO = bell(aCon);
  consoleEl.style.opacity = cO.toFixed(3);
  consoleEl.style.transform = `translate(-50%,-50%) translateY(${(1 - cO) * 30}px)`;
  if (aCon > 0 && aCon < 1) setConsole(aCon);

  /* ---- 章節索引 ---- */
  const cur = Math.min(ACTS - 1, Math.floor(p * ACTS + 0.001));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === cur));
  progressNav.classList.toggle("is-visible", p > 0.02);
  scrollHint.classList.toggle("is-hidden", p > 0.015);
}

/* ---------------------------------------------------------------------- */
/* Lenis 平滑捲動                                                          */
/* ---------------------------------------------------------------------- */
const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
let scrollProgress = 0;
lenis.on("scroll", ({ scroll, limit }) => {
  scrollProgress = limit > 0 ? scroll / limit : 0;
});
lenis.stop(); // 進站序幕完成前先鎖住

// 章節索引／品牌列導覽
dots.forEach((li) => {
  const act = +li.dataset.act;
  li.addEventListener("click", () => lenis.scrollTo(((act + 0.5) / ACTS) * lenis.limit));
});
document.querySelector(".topbar__brand").addEventListener("click", (e) => {
  e.preventDefault();
  lenis.scrollTo(0);
});
// 站內跳轉（Hero「看系統如何運作」、媒體卡片等）
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const act = +el.dataset.goto;
    lenis.scrollTo(((act + 0.5) / ACTS) * lenis.limit);
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

  // 平滑跟進捲動進度
  renderProgress += (scrollProgress - renderProgress) * 0.08;
  applyProgress(renderProgress);

  // 鏡頭：在路徑點上加一點輕微呼吸感，讓畫面有生命
  camera.position.copy(_pos);
  camera.position.x += Math.sin(t * 0.4) * 0.04;
  camera.position.y += Math.sin(t * 0.55) * 0.03;
  camera.lookAt(_look);

  scanRing.rotation.z = t * 0.6;
  doorGlow.intensity = 2.2 + Math.sin(t * 2) * 0.3;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------------------------------------------------------------------- */
/* 進站序幕：人臉辨識（電影感模擬）                                          */
/* ---------------------------------------------------------------------- */
const boot = document.getElementById("boot");
const bootBar = document.getElementById("boot-bar");
const bootStatus = document.getElementById("boot-status");

function runBoot() {
  const steps = [
    [0, "偵測臉部…"],
    [35, "比對會員資料…"],
    [72, "辨識中…"],
    [100, "歡迎回來"],
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
// 等字體與第一幀就緒
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
