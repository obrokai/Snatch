import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 捲動擦洗幀序列（Snowflake Virtual Office 式）：pin 住區塊，
 * 捲動進度直接對應影格 → 用捲動「播放」一段預渲染運鏡（走入場館／運動片段…）。
 * - 預載雙閘門：進入視窗附近（IO）且開門後（snatch-entered）才抓幀，
 *   不跟開場資源搶頻寬
 * - Safari：ResizeObserver + 點陣自癒，避免拉伸
 */
export default function ScrubSequence({
  base,            // e.g. `${BASE_URL}walkthrough/frame_`
  count,
  captions = [],   // [{ t, s }]，沿進度均分切換
  end = "+=340%",  // pin 的捲動長度
  loadLabel = "載入影像",
}) {
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

    // 預載雙閘門：靠近視窗（IO） + 已開門（snatch-entered）
    let nearViewport = false;
    let entered = !!window.__snatchEntered;
    let started = false;
    const maybeStart = () => {
      if (started || !nearViewport || !entered) return;
      started = true;
      for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `${base}${String(i).padStart(4, "0")}.jpg`;
        img.onload = () => { ready++; setLoaded(ready); render(); };
        img.onerror = () => { ready++; setLoaded(ready); };
        images[i - 1] = img;
      }
    };
    const onEntered = () => { entered = true; maybeStart(); };
    if (!entered) addEventListener("snatch-entered", onEntered, { once: true });
    const enteredFallback = setTimeout(onEntered, 8000);
    const io = new IntersectionObserver(
      (es) => { if (es.some((e) => e.isIntersecting)) { nearViewport = true; maybeStart(); io.disconnect(); } },
      { rootMargin: "150% 0px" }
    );
    io.observe(wrap.current);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    };
    function render() {
      const img = images[Math.round(state.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    resize();
    addEventListener("resize", resize);
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        state.frame = self.progress * (count - 1);
        render();
        if (!captions.length) return;
        const seg = Math.min(captions.length - 1, Math.floor(self.progress * captions.length));
        capRefs.current.forEach((el, k) => {
          if (!el) return;
          gsap.to(el, { opacity: k === seg ? 1 : 0, y: k === seg ? 0 : 20, duration: 0.5, overwrite: true });
        });
      },
    });

    return () => {
      removeEventListener("resize", resize);
      removeEventListener("snatch-entered", onEntered);
      clearTimeout(enteredFallback);
      ro.disconnect();
      io.disconnect();
      st.kill();
    };
  }, [base, count, end, captions.length]);

  return (
    <section ref={wrap} className="relative h-[100svh] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 影像壓暗 + 上下融接，確保字可讀、與前後區塊空間連續 */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24vh] bg-gradient-to-b from-[#0a0a0d] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32vh] bg-gradient-to-t from-[#0a0a0d] to-transparent" />

      {/* 隨進度切換的字幕（下三分之一） */}
      <div className="absolute inset-x-0 bottom-[13vh] flex justify-center px-6">
        <div className="relative w-full max-w-3xl text-center min-h-[9rem]">
          {captions.map((c, i) => (
            <div
              key={i}
              ref={(el) => (capRefs.current[i] = el)}
              className="absolute inset-x-0 top-0 opacity-0"
            >
              <h2 className="headline text-[9vw] md:text-[4vw] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                {c.t}
              </h2>
              {c.s && (
                <p className="mt-4 text-sm md:text-base text-white/70 font-light leading-relaxed drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
                  {c.s}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {loaded < count && loaded > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] tracking-[0.2em] text-white/25">
          {loadLabel} {loaded}/{count}
        </div>
      )}
    </section>
  );
}
