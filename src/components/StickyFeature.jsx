import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sticky / pinned 區塊（效果 #4）：畫面固定，內容隨捲動一段段切換。
 * 仿 Apple 晶片介紹那段的節奏。
 */
const STEPS = [
  {
    k: "01",
    big: "用「說的」\n就能操作後台",
    d: "「這個月哪些會員快流失了？」直接問，AI 當場長出名單與圖表。不必學系統，系統聽你的話。",
    stat: "0",
    unit: "學習成本",
  },
  {
    k: "02",
    big: "LINE 一鍵綁定\n零下載門檻",
    d: "學員加官方 LINE，輸入手機驗證碼即綁定會員。查會籍、約課、購課、收提醒，全在最熟悉的 App 裡。",
    stat: "1",
    unit: "步就綁定",
  },
  {
    k: "03",
    big: "合規經營\n一毛都不用",
    d: "同樣合規，別人花十幾萬到幾十萬做信託／履約保證，用 SnatchOS 的服務模式，你花 NT$0。",
    stat: "NT$0",
    unit: "合規成本",
  },
];

export default function StickyFeature() {
  const wrap = useRef(null);
  const panels = useRef([]);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const seg = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
        panels.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === seg ? 1 : 0,
            y: i === seg ? 0 : 30,
            duration: 0.5,
            overwrite: true,
            ease: "power2.out",
          });
        });
      },
    });
    // 初始顯示第一段
    gsap.set(panels.current[0], { opacity: 1, y: 0 });
    panels.current.slice(1).forEach((el) => gsap.set(el, { opacity: 0, y: 30 }));

    return () => st.kill();
  }, []);

  return (
    <section ref={wrap} className="relative h-[100svh] overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(255,107,26,0.16),transparent_70%)]" />
      <div className="relative h-full mx-auto max-w-5xl px-6 flex flex-col justify-center">
        {STEPS.map((s, i) => (
          <div
            key={i}
            ref={(el) => (panels.current[i] = el)}
            className="absolute inset-x-6 md:inset-x-0 md:left-1/2 md:-translate-x-1/2 md:max-w-5xl w-auto"
          >
            <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
              <div>
                <span className="font-mono text-xs tracking-[0.3em] text-accent">{s.k}</span>
                <h2 className="headline mt-4 text-[10vw] md:text-[4.6vw] whitespace-pre-line">
                  {s.big}
                </h2>
                <p className="mt-6 max-w-md text-white/55 font-light leading-loose">{s.d}</p>
              </div>
              <div className="text-right md:text-left">
                <div className="text-[16vw] md:text-[7vw] font-extralight text-accent leading-none tracking-tighter">
                  {s.stat}
                </div>
                <div className="mt-2 font-mono text-xs tracking-[0.2em] text-white/45">{s.unit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 進度點 */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {STEPS.map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/25" />
        ))}
      </div>
    </section>
  );
}
