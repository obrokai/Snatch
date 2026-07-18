/**
 * 全站固定背景：深色底 + 橘色極光暈 + 透視格線 + 顆粒噪點。
 * 質感（grain/vignette）× 科技（grid/glow）× 運動（暖橘能量）。
 * 放在所有內容之下（fixed, -z）。滑鼠視差讓光暈微幅跟隨。
 */
import { useEffect, useRef } from "react";

export default function Backdrop() {
  const auroraA = useRef(null);
  const auroraB = useRef(null);

  useEffect(() => {
    let raf = 0;
    const t = { x: 0, y: 0, cx: 0, cy: 0 };
    const onMove = (e) => {
      t.x = (e.clientX / innerWidth - 0.5);
      t.y = (e.clientY / innerHeight - 0.5);
    };
    const loop = () => {
      t.cx += (t.x - t.cx) * 0.06;
      t.cy += (t.y - t.cy) * 0.06;
      if (auroraA.current)
        auroraA.current.style.transform = `translate3d(${t.cx * 60}px, ${t.cy * 50}px, 0)`;
      if (auroraB.current)
        auroraB.current.style.transform = `translate3d(${t.cx * -80}px, ${t.cy * -60}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#08080b]" aria-hidden="true">
      {/* 底層深色徑向漸層 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#141118_0%,#0a0a0d_45%,#060608_100%)]" />

      {/* 橘色極光暈 A / B（滑鼠視差 + 呼吸動畫） */}
      <div
        ref={auroraA}
        className="absolute -top-[20%] left-[8%] h-[70vh] w-[70vh] rounded-full blur-[120px] opacity-45 animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(255,107,26,0.55), transparent 62%)" }}
      />
      <div
        ref={auroraB}
        className="absolute bottom-[-25%] right-[2%] h-[80vh] w-[80vh] rounded-full blur-[140px] opacity-35 animate-aurora-slow"
        style={{ background: "radial-gradient(circle, rgba(255,138,71,0.42), transparent 60%)" }}
      />

      {/* 透視格線地板 */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] [perspective:600px] opacity-[0.16]">
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
