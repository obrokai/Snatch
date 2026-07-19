/**
 * 全站固定背景：整個網站＝一趟走進場館（Snowflake Virtual Office 式）。
 * 整頁捲動進度（0→1）直接對應第一人稱走入幀（public/walkthrough ×121）：
 * 捲多深＝走多深、停下就停在原地、倒捲＝往回走；內容區塊是走路途中的停留點。
 * 亮度沿路徑做站位曲線（中段深處最暗、CTA 走回光裡）。
 * 預載閘門：開門（snatch-entered）或 3.5s 後才抓幀，讓開場資源先行；
 * 幀未載齊時畫「最近已載幀」，首繪淡入。單一 rAF + lerp，靜止即停。
 */
import { useEffect, useRef } from "react";

const COUNT = 121;
const FRAME_MIN = 8; // 起點略過全黑門洞，Hero 就看得到走廊光

export default function Backdrop() {
  const canvasRef = useRef(null);
  const auroraA = useRef(null);
  const auroraB = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const imgs = [];
    let shown = false;
    let started = false;
    const startLoad = () => {
      if (started) return;
      started = true;
      for (let i = 1; i <= COUNT; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `${import.meta.env.BASE_URL}walkthrough/frame_${String(i).padStart(4, "0")}.jpg`;
        img.onload = () => { if (!shown) drawCam(); };
        imgs[i - 1] = img;
      }
    };
    const onEntered = () => startLoad();
    if (window.__snatchEntered) startLoad();
    else addEventListener("snatch-entered", onEntered, { once: true });
    const loadFallback = setTimeout(startLoad, 3500);

    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawnIdx = -1;
      drawCam();
    };

    // 亮度站位：入口亮 → 深處暗（內容可讀）→ CTA 回暖
    const BRI = [
      { p: 0.0, b: 1.04 }, { p: 0.2, b: 0.8 }, { p: 0.45, b: 0.6 },
      { p: 0.62, b: 0.56 }, { p: 0.8, b: 0.72 }, { p: 1.0, b: 1.0 },
    ];
    const briAt = (p) => {
      for (let i = 0; i < BRI.length - 1; i++) {
        if (p >= BRI[i].p && p <= BRI[i + 1].p) {
          let t = (p - BRI[i].p) / (BRI[i + 1].p - BRI[i].p || 1);
          t = t * t * (3 - 2 * t);
          return BRI[i].b + (BRI[i + 1].b - BRI[i].b) * t;
        }
      }
      return 1;
    };

    let drawnIdx = -1;
    const drawCam = () => {
      // 目標幀；未載到就往回找最近已載幀（走入途中漸進補幀）
      let idx = Math.round(FRAME_MIN + curP * (COUNT - 1 - FRAME_MIN));
      while (idx >= 0 && !(imgs[idx] && imgs[idx].complete && imgs[idx].naturalWidth)) idx--;
      if (idx < 0) return;
      // Safari 自癒：點陣與顯示框不合先重建
      const dpr = Math.min(devicePixelRatio, 2);
      if (canvas.width !== Math.max(1, Math.round(canvas.clientWidth * dpr))) { size(); return; }
      canvas.style.filter = `brightness(${briAt(curP).toFixed(3)}) saturate(${(1 + curP * 0.15).toFixed(3)})`;
      if (idx === drawnIdx) return;
      const img = imgs[idx];
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawnIdx = idx;
      if (!shown) { shown = true; canvas.style.opacity = "0.72"; }
    };

    let raf = 0;
    let running = false;
    const t = { x: 0, y: 0, cx: 0, cy: 0 };
    let curP = 0;

    const onMove = (e) => {
      t.x = e.clientX / innerWidth - 0.5;
      t.y = e.clientY / innerHeight - 0.5;
      kick();
    };
    const depthTarget = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };

    const tick = () => {
      const pT = reduced ? 0.3 : depthTarget();
      t.cx += (t.x - t.cx) * 0.06;
      t.cy += (t.y - t.cy) * 0.06;
      curP += (pT - curP) * 0.08;
      drawCam();
      if (auroraA.current)
        auroraA.current.style.transform = `translate3d(${t.cx * 60}px, ${t.cy * 50}px, 0)`;
      if (auroraB.current)
        auroraB.current.style.transform = `translate3d(${t.cx * -80}px, ${t.cy * -60}px, 0)`;
      const idle =
        Math.abs(pT - curP) < 0.0006 &&
        Math.abs(t.x - t.cx) < 0.001 &&
        Math.abs(t.y - t.cy) < 0.001;
      if (idle) { running = false; return; }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => kick();
    size();
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", size);
    const ro = new ResizeObserver(() => size());
    ro.observe(canvas);
    kick();

    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", size);
      removeEventListener("snatch-entered", onEntered);
      clearTimeout(loadFallback);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#08080b]" aria-hidden="true">
      {/* 場館走入幀（整頁捲動擦洗），首繪前透明、之後淡入 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      />
      {/* 可讀性壓暗：中央留光、邊緣收黑 */}
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_40%,rgba(8,8,11,0.38),rgba(8,8,11,0.88))]" />

      {/* 橘色極光暈 A / B（滑鼠視差 + 呼吸動畫） */}
      <div
        ref={auroraA}
        className="absolute -top-[20%] left-[8%] h-[70vh] w-[70vh] rounded-full blur-[120px] opacity-35 animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(255,107,26,0.55), transparent 62%)" }}
      />
      <div
        ref={auroraB}
        className="absolute bottom-[-25%] right-[2%] h-[80vh] w-[80vh] rounded-full blur-[140px] opacity-28 animate-aurora-slow"
        style={{ background: "radial-gradient(circle, rgba(255,138,71,0.42), transparent 60%)" }}
      />

      {/* 透視格線地板 */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] [perspective:600px] opacity-[0.12]">
        <div
          className="absolute inset-0 origin-bottom [transform:rotateX(72deg)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,107,26,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,26,0.35) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to top, #000 0%, transparent 82%)",
            WebkitMaskImage: "linear-gradient(to top, #000 0%, transparent 82%)",
          }}
        />
      </div>

      {/* 細點陣（科技感） */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* 顆粒噪點（質感） */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* 邊緣暗角 */}
      <div className="absolute inset-0 shadow-[inset_0_0_240px_60px_rgba(0,0,0,0.85)]" />
    </div>
  );
}
