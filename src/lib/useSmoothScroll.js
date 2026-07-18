import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis 平滑捲動 + GSAP ScrollTrigger 同步。
 * 在 App 掛載一次。回傳 lenis 供需要時使用。
 */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      // Apple 式緩動
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Lenis 捲動 → ScrollTrigger 更新
    lenis.on("scroll", ScrollTrigger.update);

    // 用 gsap ticker 驅動 lenis（單一 rAF、與動畫同步）
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger 用 Lenis 的 scroll 值
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
