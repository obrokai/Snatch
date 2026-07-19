import { useRef, useEffect } from "react";

/**
 * 旋轉裝飾器材：捲動驅動、帶慣性緩動的旋轉。
 * 幀為去背 WebP（真 alpha）。捲動位置決定「目標角度」，實際顯示角度用 lerp
 * 平滑逼近目標 → 就算捲動更新是離散的，物件也會滑順地轉、停下時緩緩收住。
 * flightFrom：飛行路線——區塊接近視窗時從該側「小尺寸滑入 + 傾角」，
 * 到定位時放大到全尺寸（transform 疊在幀旋轉之上，形成 3D 進場感）。
 * 只有在視窗內才跑 rAF；prefers-reduced-motion 只畫單一幀、不做飛行。
 */
export default function RotatingProp({
  base,                 // e.g. `${BASE_URL}props/kettlebell/frame_`
  count = 72,
  pxPerRotation = 1600, // 捲動多少 px 轉一圈
  offset = 0,           // 起始角度（0–1）
  reverse = false,
  ease = 0.12,          // 緩動係數（越小越軟、慣性越長）
  flightFrom = null,    // null | "left" | "right"：滑入方向
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

    // 飛行路線：量「父容器」位置（canvas 自己有 transform，量自己會回饋失真）。
    // 區塊自視窗下緣進入 → t 0→1：由側邊 46% 外、0.45 倍、±14° 傾角滑入到定位。
    const flightDir = flightFrom === "left" ? -1 : flightFrom === "right" ? 1 : 0;
    const applyFlight = () => {
      if (!flightDir || reduced) return;
      const host = canvas.parentElement;
      if (!host) return;
      const top = host.getBoundingClientRect().top;
      let t = Math.max(0, Math.min(1, (innerHeight - top) / (innerHeight * 0.8)));
      t = t * t * (3 - 2 * t); // smoothstep
      canvas.style.transform =
        `translateX(${((1 - t) * flightDir * 46).toFixed(2)}%) ` +
        `scale(${(0.45 + t * 0.55).toFixed(4)}) ` +
        `rotate(${((1 - t) * flightDir * 14).toFixed(2)}deg)`;
      canvas.style.opacity = (0.25 + t * 0.75).toFixed(3);
    };

    // 延載：開門（snatch-entered）後才開始抓幀，避免開場時 96 張請求
    // 跟 poster / 轉頭影片搶頻寬（手機黑屏主因之一）；7s 後備援強制開載
    let started = false;
    const startLoad = () => {
      if (started) return;
      started = true;
      for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `${base}${String(i).padStart(3, "0")}.webp`;
        // 每張載入完成都嘗試補畫：drawFrame 對同幀是 no-op，成本極低；
        // 這樣就算靜止不捲動（例如剛開完門停在頁首），目標幀一載好就會出現
        img.onload = () => { loaded++; drawFrame(cur); };
        imgs[i - 1] = img;
      }
    };
    let fallback = 0;
    if (window.__snatchEntered) startLoad();
    else {
      addEventListener("snatch-entered", startLoad, { once: true });
      fallback = setTimeout(startLoad, 7000);
    }

    const size = () => {
      // 與 drawFrame 的自癒檢查用同一來源（clientWidth/Height），避免小數像素互踢
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      drawn = -1;
      drawFrame(cur);
    };

    function drawFrame(contFrame) {
      const idx = ((Math.round(contFrame) % count) + count) % count;
      const img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      // 自癒：Safari 可能在版面定稿前量到錯的盒子 → 點陣與顯示框比例不合會整張拉伸
      const dpr = Math.min(devicePixelRatio, 2);
      const bw = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const bh = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== bw || canvas.height !== bh) { size(); return; }
      if (idx === drawn) return;
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
      applyFlight();
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
    applyFlight();
    addEventListener("resize", size);
    addEventListener("scroll", onScroll, { passive: true });
    // Safari：aspect-ratio / 字型定稿常晚於 mount，盒子一變就重建點陣，否則整張被拉伸
    const ro = new ResizeObserver(() => size());
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      removeEventListener("resize", size);
      removeEventListener("scroll", onScroll);
      removeEventListener("snatch-entered", startLoad);
      clearTimeout(fallback);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [base, count, pxPerRotation, offset, reverse, ease, flightFrom]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    />
  );
}
