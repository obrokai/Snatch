import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 捲入視窗時淡入 + 輕微上移；捲出時淡出。
 * 做出「一段一段揭露」的節奏感（效果 #3）。
 */
export default function Reveal({ children, className = "", y = 40, once = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    gsap.set(el, { opacity: 0, y });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 15%",
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }),
      onLeave: once ? undefined : () => gsap.to(el, { opacity: 0, y: -y, duration: 0.6, ease: "power2.in" }),
      onEnterBack: once ? undefined : () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }),
      onLeaveBack: once ? undefined : () => gsap.to(el, { opacity: 0, y, duration: 0.6, ease: "power2.in" }),
    });

    return () => st.kill();
  }, [y, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
