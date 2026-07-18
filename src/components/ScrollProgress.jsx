import { useEffect, useRef } from "react";

/**
 * 頂部細捲動進度條（精緻收尾細節）。讀 rAF 的 scrollY，不新增重量。
 */
export default function ScrollProgress({ show }) {
  const bar = useRef(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 h-[2px] transition-opacity duration-700"
      style={{ opacity: show ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-accent-deep via-accent to-accent-soft shadow-[0_0_12px_rgba(255,107,26,0.7)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
