import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 幀序列「偽 3D 旋轉」（效果 #2）+ sticky/pinned（效果 #4）。
 * 區塊被 pin 住，捲動進度對應到 canvas 上切換的圖片幀。
 * frames 圖放 /public/sequence/，命名 frame_0001.jpg ... frame_00NN.jpg
 */
const FRAME_COUNT = 121;
const framePath = (i) =>
  `${import.meta.env.BASE_URL}sequence/frame_${String(i).padStart(4, "0")}.jpg`;

export default function ProductSequence() {
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

    // 預載幀
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        ready++;
        setLoaded(ready);
        if (ready === 1) render();
      };
      img.onerror = () => { ready++; setLoaded(ready); };
      images[i - 1] = img;
    }

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
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      // cover-fit（studio 灰底鋪滿，產品置中、不留黑邊）
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    resize();
    addEventListener("resize", resize);

    // Pin + scrub：捲動進度 → 幀
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "+=320%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        state.frame = self.progress * (FRAME_COUNT - 1);
        render();
        // 三段字幕隨進度切換
        const seg = Math.min(2, Math.floor(self.progress * 3));
        capRefs.current.forEach((el, k) => {
          if (!el) return;
          gsap.to(el, { opacity: k === seg ? 1 : 0, y: k === seg ? 0 : 16, duration: 0.4, overwrite: true });
        });
      },
    });

    return () => {
      removeEventListener("resize", resize);
      st.kill();
    };
  }, []);

  const captions = [
    { t: "360° 看清每個細節", d: "捲動即旋轉——真實質感、真實光影。" },
    { t: "為場館而生", d: "耐用、俐落、專業級——就像你的系統。" },
    { t: "一切都連上 SnatchOS", d: "從器材到會員，串成同一套營運。" },
  ];

  return (
    <section id="showcase" ref={wrap} className="relative h-[100svh] overflow-hidden bg-[#0a0a0d]">
      <div className="absolute inset-0 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {/* 上下漸層：把 studio 灰底融進上下的深色區塊 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-[#0a0a0d] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/80 to-transparent" />
      {/* 背景光暈 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,107,26,0.10),transparent_70%)]" />

      {/* 隨進度切換的字幕 */}
      <div className="absolute left-1/2 bottom-[12vh] -translate-x-1/2 text-center w-[90vw] max-w-xl">
        {captions.map((c, i) => (
          <div
            key={i}
            ref={(el) => (capRefs.current[i] = el)}
            className="absolute inset-x-0 opacity-0"
            style={{ transform: "translateY(16px)" }}
          >
            <h3 className="text-2xl md:text-3xl font-medium tracking-tight">{c.t}</h3>
            <p className="mt-3 text-white/55 font-light">{c.d}</p>
          </div>
        ))}
      </div>

      {loaded < FRAME_COUNT && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] tracking-[0.2em] text-white/25">
          載入產品幀 {loaded}/{FRAME_COUNT}
        </div>
      )}
    </section>
  );
}
