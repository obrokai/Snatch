import { useRef, useEffect } from "react";

/**
 * 旋轉裝飾器材：捲動時才轉。
 * 幀是去背後的 WebP（真 alpha，不再有黑底），用 canvas 依捲動位置切幀，
 * 停止捲動就停在該角度。離開視窗時暫停 rAF；prefers-reduced-motion 只畫單一幀。
 */
export default function RotatingProp({
  base,                 // e.g. `${BASE_URL}props/kettlebell/frame_`
  count = 48,
  pxPerRotation = 1600, // 捲動多少 px 轉一圈
  offset = 0,           // 起始角度（0–1），讓各物件不同步
  reverse = false,
  className = "",
  style,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imgs = [];
    let loaded = 0;
    let current = -1;
    let raf = 0;
    let visible = true;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      img.src = `${base}${String(i).padStart(3, "0")}.webp`;
      img.onload = () => { loaded++; if (loaded === 1) draw(frameFor(scrollY)); };
      imgs[i - 1] = img;
    }

    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      current = -1;
      draw(frameFor(scrollY));
    };

    const frameFor = (y) => {
      const turns = y / pxPerRotation + offset;
      const raw = Math.floor((reverse ? -turns : turns) * count);
      return ((raw % count) + count) % count;
    };

    function draw(idx) {
      const img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      current = idx;
    }

    const loop = () => {
      if (visible && !reduced) {
        const idx = frameFor(scrollY);
        if (idx !== current) draw(idx);
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; },
      { rootMargin: "20%" }
    );
    io.observe(canvas);

    size();
    addEventListener("resize", size);
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener("resize", size);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [base, count, pxPerRotation, offset, reverse]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    />
  );
}
