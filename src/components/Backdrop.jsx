/**
 * 全站固定背景：整個網站「住進場館裡」。
 * 底層是 Hero 的場館環境影片（同一支 330KB、同一次解碼，零新增資產），
 * 捲動驅動「深度攝影機」：越往下捲影片緩慢 scale 推進（像鏡頭往場館深處走）、
 * 亮度中段下沉、尾段回暖——空間感的轉換堆疊。
 * 只動 transform / filter:brightness（GPU 合成），一個 rAF + lerp，靜止即停。
 * 其上仍疊：橘色極光暈（滑鼠視差）＋透視格線＋點陣＋顆粒＋暗角。
 */
import { useEffect, useRef } from "react";

export default function Backdrop() {
  const videoRef = useRef(null);
  const auroraA = useRef(null);
  const auroraB = useRef(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced && videoRef.current) videoRef.current.pause();

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

    // 多站位攝影機：沿捲動在場館裡「換空間」——左右橫移 + 推近 + 明暗。
    // x 為 % 橫移（安全範圍 ≈ (s-1)/2*100，避免露出影片邊緣），s 縮放，b 亮度。
    const CAM = [
      { p: 0.0,  x: 0,  s: 1.0,  b: 1.0 },   // 入口
      { p: 0.16, x: -4, s: 1.1,  b: 0.82 },  // 往左：三件事
      { p: 0.34, x: 6,  s: 1.16, b: 0.6 },   // 換到右側深處：痛點/電影段
      { p: 0.55, x: -7, s: 1.22, b: 0.55 },  // 再往左：裝置區
      { p: 0.76, x: 5,  s: 1.27, b: 0.7 },   // 右側：合規/成果
      { p: 1.0,  x: 0,  s: 1.32, b: 0.96 },  // 回到中軸、走回光裡：CTA
    ];
    const camAt = (p) => {
      let a = CAM[0], z = CAM[CAM.length - 1];
      for (let i = 0; i < CAM.length - 1; i++)
        if (p >= CAM[i].p && p <= CAM[i + 1].p) { a = CAM[i]; z = CAM[i + 1]; break; }
      let t = (p - a.p) / ((z.p - a.p) || 1);
      t = t * t * (3 - 2 * t); // smoothstep：站與站之間有到站/離站的緩急
      return { x: a.x + (z.x - a.x) * t, s: a.s + (z.s - a.s) * t, b: a.b + (z.b - a.b) * t };
    };

    const apply = () => {
      const p = curP;
      if (videoRef.current) {
        const c = camAt(p);
        videoRef.current.style.transform =
          `translate3d(${c.x.toFixed(2)}%, ${(p * -3.5).toFixed(2)}%, 0) scale(${c.s.toFixed(4)})`;
        videoRef.current.style.filter =
          `brightness(${c.b.toFixed(3)}) saturate(${(1 + p * 0.18).toFixed(3)})`;
      }
      if (auroraA.current)
        auroraA.current.style.transform = `translate3d(${t.cx * 60}px, ${t.cy * 50}px, 0)`;
      if (auroraB.current)
        auroraB.current.style.transform = `translate3d(${t.cx * -80}px, ${t.cy * -60}px, 0)`;
    };

    const tick = () => {
      const pT = depthTarget();
      t.cx += (t.x - t.cx) * 0.06;
      t.cy += (t.y - t.cy) * 0.06;
      curP += (pT - curP) * 0.07;
      apply();
      const idle =
        Math.abs(pT - curP) < 0.0008 &&
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
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    kick();

    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#08080b]" aria-hidden="true">
      {/* 場館環境影片（與 Hero 共用同一支，整站的「空間」） */}
      <video
        ref={videoRef}
        src={`${import.meta.env.BASE_URL}hero-ambient.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.6] will-change-transform"
      />
      {/* 可讀性壓暗：中央留光、邊緣收黑 */}
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_38%,rgba(8,8,11,0.45),rgba(8,8,11,0.9))]" />

      {/* 橘色極光暈 A / B（滑鼠視差 + 呼吸動畫） */}
      <div
        ref={auroraA}
        className="absolute -top-[20%] left-[8%] h-[70vh] w-[70vh] rounded-full blur-[120px] opacity-40 animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(255,107,26,0.55), transparent 62%)" }}
      />
      <div
        ref={auroraB}
        className="absolute bottom-[-25%] right-[2%] h-[80vh] w-[80vh] rounded-full blur-[140px] opacity-30 animate-aurora-slow"
        style={{ background: "radial-gradient(circle, rgba(255,138,71,0.42), transparent 60%)" }}
      />

      {/* 透視格線地板 */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] [perspective:600px] opacity-[0.14]">
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
