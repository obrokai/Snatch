import { useRef, useEffect } from "react";

/**
 * 旋轉裝飾器材：捲動驅動、帶慣性緩動的旋轉。
 * 幀為去背 WebP（真 alpha）。捲動位置決定「目標角度」，實際顯示角度用 lerp
 * 平滑逼近目標 → 就算捲動更新是離散的，物件也會滑順地轉、停下時緩緩收住。
 * 只有在視窗內才跑 rAF；prefers-reduced-motion 只畫單一幀。
 */
export default function RotatingProp({
  base,                 // e.g. `${BASE_URL}props/kettlebell/frame_`
  count = 72,
  pxPerRotation = 1600, // 捲動多少 px 轉一圈
  offset = 0,           // 起始角度（0–1）
  reverse = false,
  ease = 0.12,          // 緩動係數（越小越軟、慣性越長）
  className = "",
  style,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.imageSmoothingQuality = "high";
    const imgs = [];
    let loaded = 0;
    let drawn = -1;
    let raf = 0;
    let running = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 連續（未取模）的目標與目前角度，單位＝圈數×count
    const targetFrames = () => {
      const turns = window.scrollY / pxPerRotation + offset;
      return (reverse ? -turns : turns) * count;
    };
    let cur = targetFrames();

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${base}${String(i).padStart(3, "0")}.webp`;
      // 每張載入完成都嘗試補畫：drawFrame 對同幀是 no-op，成本極低；
      // 這樣就算靜止不捲動（例如剛開完門停在頁首），目標幀一載好就會出現
      img.onload = () => { loaded++; drawFrame(cur); };
      imgs[i - 1] = img;
    }

    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      drawn = -1;
      drawFrame(cur);
    };

    function drawFrame(contFrame) {
      const idx = ((Math.round(contFrame) % count) + count) % count;
      if (idx === drawn) return;
      const img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      drawn = idx;
    }

    const tick = () => {
      const target = targetFrames();
      // 指數緩動逼近目標；接近到不足半幀就吸附，避免無限微抖
      const d = target - cur;
      if (Math.abs(d) < 0.35) cur = target;
      else cur += d * ease;
      drawFrame(cur);
      if (Math.abs(target - cur) > 0.01) raf = requestAnimationFrame(tick);
      else running = false; // 靜止時停掉 rAF，省電
    };
    const kick = () => {
      if (reduced || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    // 捲動時喚醒動畫迴圈（Lenis 也會派發原生 scroll 事件）
    const onScroll = () => kick();

    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) kick();
        else { cancelAnimationFrame(raf); running = false; }
      },
      { rootMargin: "15%" }
    );
    io.observe(canvas);

    size();
    addEventListener("resize", size);
    addEventListener("scroll", onScroll, { passive: true });

    return () => {
      removeEventListener("resize", size);
      removeEventListener("scroll", onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [base, count, pxPerRotation, offset, reverse, ease]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    />
  );
}
