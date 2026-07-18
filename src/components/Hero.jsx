import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RotatingProp from "./RotatingProp.jsx";

const LINES = ["健身房的每一步，", "都自動跑起來。"];

export default function Hero({ start }) {
  const root = useRef(null);
  const inners = useRef([]);
  const sub = useRef(null);

  useEffect(() => {
    // 進場 mask reveal：字由遮罩下方揭露
    const tl = gsap.timeline({ delay: start ? 0.2 : 0, paused: !start });
    tl.to(inners.current, {
      y: "0%",
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.12,
    }).to(sub.current, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.5");
    if (start) tl.play();

    // 捲動時整個 hero 淡出 + 輕微位移
    const st = gsap.to(root.current, {
      opacity: 0,
      y: -80,
      scale: 0.97,
      ease: "none",
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tl.kill();
      st.scrollTrigger?.kill();
    };
  }, [start]);

  return (
    <section className="relative h-[100svh] flex items-center justify-center overflow-hidden">
      {/* 電影感環境影片：暗場館 + 橘色體積光，緩慢推軌 */}
      <video
        src={`${import.meta.env.BASE_URL}hero-ambient.mp4`}
        autoPlay muted loop playsInline preload="auto"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.72]"
      />
      {/* 壓暗 + 暈邊，保住標題可讀性 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(78%_62%_at_50%_50%,rgba(8,8,11,0.42),rgba(8,8,11,0.93))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-[#08080b] to-transparent" />

      {/* 裝飾器材：捲動時旋轉的橘柄壺鈴 / 啞鈴，同時緩慢漂浮（手機縮小、避開文字） */}
      <div className="pointer-events-none absolute left-[-4%] top-[9%] w-[34vw] sm:left-[2%] sm:top-[16%] sm:w-[24vw] max-w-[300px] aspect-square animate-float opacity-80 sm:opacity-100">
        <RotatingProp base={`${import.meta.env.BASE_URL}props/kettlebell/frame_`} pxPerRotation={1500} className="w-full h-full" />
      </div>
      <div className="pointer-events-none absolute right-[-6%] bottom-[5%] w-[38vw] sm:right-[1%] sm:bottom-[10%] sm:w-[26vw] max-w-[340px] aspect-square animate-float-delayed opacity-80 sm:opacity-100">
        <RotatingProp base={`${import.meta.env.BASE_URL}props/dumbbell/frame_`} pxPerRotation={1800} offset={0.3} reverse className="w-full h-full" />
      </div>

      <div ref={root} className="relative z-10 text-center px-6 will-change-transform">
        <p className="font-mono text-[0.7rem] tracking-[0.4em] text-accent uppercase mb-8">
          Snatch OS · 健身房智慧管理系統
        </p>
        <h1 className="headline text-[11vw] md:text-[7.5vw] leading-[1.08] md:leading-[1.02]">
          {LINES.map((line, i) => (
            <span key={i} className="mask-line">
              <span
                ref={(el) => (inners.current[i] = el)}
                className="mask-inner"
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p
          ref={sub}
          className="mt-10 mx-auto max-w-xl text-base md:text-lg text-white/55 font-light leading-loose opacity-0 translate-y-6"
        >
          AI 整合 × LINE 綁定 × 一站式營運。學員加官方 LINE 就能綁定會員、約課、購課、收提醒，不必下載 App。
        </p>
        <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <a
            href="mailto:pojungho@gmail.com?subject=預約免費諮詢"
            className="rounded-full bg-accent px-7 py-3 text-[0.95rem] text-[#0a0a0d] font-medium transition hover:bg-accent-soft hover:-translate-y-0.5"
          >
            預約免費諮詢
          </a>
          <a
            href="#system"
            className="rounded-full border border-white/20 px-7 py-3 text-[0.95rem] text-white/85 transition hover:border-accent hover:text-accent"
          >
            看系統如何運作
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.62rem] tracking-[0.3em] text-white/35">
        向下捲動
      </div>
    </section>
  );
}
