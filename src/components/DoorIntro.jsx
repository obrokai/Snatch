import { useState, useRef, useEffect } from "react";

/**
 * 進站：臉部掃描 → 滿版開門 → 揭露主頁（React 版）。
 * onOpen() 在門開始開時呼叫，讓 Hero 開始 mask reveal。
 */
const STEPS = ["建立連線…", "偵測臉部…", "建立 3D 臉模…", "比對會員資料…", "授權核發", "ACCESS GRANTED"];

export default function DoorIntro({ onOpen }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | opening | done
  const [slid, setSlid] = useState(false);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState(STEPS[0]);
  const videoRef = useRef(null);

  const start = () => {
    if (phase !== "idle") return;
    setPhase("scanning");
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    const dur = 4200;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setPct(Math.round(p * 100));
      setStatus(STEPS[Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))]);
      if (p < 1) requestAnimationFrame(tick);
      else openDoors();
    };
    requestAnimationFrame(tick);
  };

  const openDoors = () => {
    setPhase("opening");
    onOpen?.();
    setTimeout(() => setSlid(true), 400); // 先關門一拍再滑開
    setTimeout(() => setPhase("done"), 3100);
  };

  useEffect(() => {
    if (phase === "done") document.body.style.cursor = "auto";
  }, [phase]);

  if (phase === "done") return null;

  const scanning = phase === "scanning";
  const opening = phase === "opening";

  return (
    <div className="fixed inset-0 z-[60]">
      {/* 肖像 / 轉頭影片 + 掃描 HUD（idle/scanning，opening 時淡出） */}
      <div
        className="absolute inset-0 z-20 transition-opacity duration-700"
        style={{ opacity: opening ? 0 : 1, pointerEvents: opening ? "none" : "auto" }}
      >
        <div
          className="absolute inset-0 transition-[filter] duration-700"
          style={{ filter: scanning ? "brightness(.5) contrast(1.1)" : "none" }}
        >
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}entry-switch.mov`}
            poster={`${import.meta.env.BASE_URL}entry-portrait.png`}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-mono tracking-[0.5em] text-white/85 text-sm">
            SNATCH<span className="text-accent">OS</span>
          </div>
          <div className="relative mt-8 w-[min(46vh,520px)] aspect-[0.82]">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <div
              className="absolute left-[6%] right-[6%] h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_16px] shadow-accent"
              style={{ animation: scanning ? "scanline 1.6s ease-in-out infinite" : "none", top: "8%", opacity: scanning ? 1 : 0.4 }}
            />
          </div>
        </div>

        <div className="absolute bottom-[7vh] left-1/2 -translate-x-1/2 text-center w-[min(90vw,32rem)]">
          {phase === "idle" ? (
            <>
              <p className="text-white/90 text-lg font-light">
                啟動你的場館。
                <span className="block text-sm text-white/55 mt-1">請點擊以開始臉部辨識，進入 Snatch OS。</span>
              </p>
              <button
                onClick={start}
                className="pointer-events-auto mt-6 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-[#0a0a0d] text-[1.02rem] shadow-[0_12px_40px_rgba(255,107,26,0.35)] transition hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                掃描臉孔 · 開始體驗 ↗
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-4 font-mono">
                <span className="text-accent text-sm tracking-[0.28em]">{status}</span>
                <span className="text-[0.72rem] tracking-[0.16em] text-white/50">{pct}%</span>
              </div>
              <div className="h-px w-full bg-white/15 overflow-hidden">
                <i className="block h-full bg-accent shadow-[0_0_10px] shadow-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 滿版門板：只在 opening 時出現（關門一拍 → 滑開露出主頁） */}
      {opening && (
        <div className="absolute inset-0 z-10">
          <div
            className="door-panel absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#07060a] to-[#0b0908] shadow-[inset_-1px_0_0_rgba(255,107,26,0.45)] flex items-center justify-end"
            style={{ transform: slid ? "translateX(-100%)" : "translateX(0)" }}
          >
            <span className="font-mono text-sm tracking-[0.42em] text-white/40 translate-x-10">
              SNATCH<span className="text-accent">OS</span>
            </span>
          </div>
          <div
            className="door-panel absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#07060a] to-[#0b0908] shadow-[inset_1px_0_0_rgba(255,107,26,0.45)]"
            style={{ transform: slid ? "translateX(100%)" : "translateX(0)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] bg-gradient-to-b from-transparent via-accent to-transparent shadow-[0_0_24px_4px_rgba(255,107,26,0.7)]"
            style={{ height: slid ? "120%" : "64%", opacity: slid ? 0 : 1, transition: "height 1s ease, opacity 1s ease" }}
          />
        </div>
      )}
    </div>
  );
}
