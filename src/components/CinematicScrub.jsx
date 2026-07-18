import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 捲動擦洗式電影片段（Apple 官網招牌手法）。
 * 區塊被 pin 住，捲動進度直接對應影片幀 → 觀眾用捲動「播放」這段運動影像。
 * frames: public/cinematic/frame_NNNN.jpg
 */
const FRAME_COUNT = 121;
const framePath = (i) =>
  `${import.meta.env.BASE_URL}cinematic/frame_${String(i).padStart(4, "0")}.jpg`;

const CAPTIONS = [
  { t: "每一次揮擺，", s: "都是一次消費、一次紀錄、一次留存機會。" },
  { t: "但這些訊號，", s: "過去全都散落在紙本、Excel 和店長的記憶裡。" },
  { t: "現在，它們自動變成資料。", s: "會員、金流、出席、留存——一次到位。" },
];

export default function CinematicScrub() {
  const wrap = useRef(null);
  const canvasRef = useRef(null);
  const capRefs = useRef([]);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const images = [];
    let ready = 0;
    const state = { frame: 0 };

    // 延後預載：接近視窗才開始抓幀，避免和 Hero 影片搶頻寬
    let started = false;
    const startPreload = () => {
      if (started) return;
      started = true;
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = framePath(i);
        img.onload = () => { ready++; setLoaded(ready); if (ready === 1) render(); };
        img.onerror = () => { ready++; setLoaded(ready); };
        images[i - 1] = img;
      }
    };
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { startPreload(); io.disconnect(); } },
      { rootMargin: "150% 0px" }
    );
    io.observe(wrap.current);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    };
    function render() {
      const img = images[Math.round(state.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      // cover-fit：滿版電影感
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    resize();
    addEventListener("resize", resize);

    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "+=340%",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        state.frame = self.progress * (FRAME_COUNT - 1);
        render();
        const seg = Math.min(CAPTIONS.length - 1, Math.floor(self.progress * CAPTIONS.length));
        capRefs.current.forEach((el, k) => {
          if (!el) return;
          gsap.to(el, { opacity: k === seg ? 1 : 0, y: k === seg ? 0 : 20, duration: 0.5, overwrite: true });
        });
      },
    });

    return () => { removeEventListener("resize", resize); io.disconnect(); st.kill(); };
  }, []);

  return (
    <section ref={wrap} className="relative h-[100svh] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 影像壓暗 + 上下融接，確保字可讀 */}
      <div className="pointer-events-none absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26vh] bg-gradient-to-b from-[#0a0a0d] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] bg-gradient-to-t from-[#0a0a0d] to-transparent" />

      {/* 隨進度切換的字幕（置於下三分之一，避開主體） */}
      <div className="absolute inset-x-0 bottom-[14vh] flex justify-center px-6">
        <div className="relative w-full max-w-3xl text-center min-h-[9rem]">
          {CAPTIONS.map((c, i) => (
            <div
              key={i}
              ref={(el) => (capRefs.current[i] = el)}
              className="absolute inset-x-0 top-0 opacity-0"
            >
              <h2 className="headline text-[9vw] md:text-[4vw] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                {c.t}
              </h2>
              {c.s && (
                <p className="mt-5 text-white/70 font-light leading-loose drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
                  {c.s}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {loaded < FRAME_COUNT && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] tracking-[0.2em] text-white/25">
          載入影像 {loaded}/{FRAME_COUNT}
        </div>
      )}
    </section>
  );
}
