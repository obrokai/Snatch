import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 櫃檯／老闆端 AI 對話式後台（保留原桌機/console 畫面內容）。
 * 真實 CSS 筆電外框 + 終端機式 console；pin 住區塊，捲動時：
 *   query 逐字打出 → 渲染 KPI 卡 → 第二題 → 渲染長條圖。
 * 橘柄壺鈴作為裝飾元件漂浮。
 */
const Q1 = "今天收了多少？";
const Q2 = "本月收入比上個月多多少？";
const BARS = [
  { n: "2月", h: 48 }, { n: "3月", h: 60 }, { n: "4月", h: 72 }, { n: "5月", h: 80 }, { n: "6月", h: 96 },
];

export default function ConsoleShowcase() {
  const wrap = useRef(null);
  const laptop = useRef(null);
  const deco = useRef(null);
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState(0); // 0 q1 typing,1 q1 result,2 q2 typing,3 q2 result

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (laptop.current) gsap.set(laptop.current, { y: -18 + p * 36, rotateX: 8 - p * 6 });
        if (deco.current) gsap.set(deco.current, { y: -30 + p * 140, rotate: 8 - p * 30 });

        if (p < 0.42) {
          const n = Math.floor((p / 0.34) * Q1.length);
          setTyped(Q1.slice(0, Math.min(n, Q1.length)));
          setStage(p > 0.36 ? 1 : 0);
        } else {
          const n = Math.floor(((p - 0.5) / 0.34) * Q2.length);
          setTyped(Q2.slice(0, Math.max(0, Math.min(n, Q2.length))));
          setStage(p > 0.86 ? 3 : 2);
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={wrap} className="relative h-[100svh] overflow-hidden">
      {/* 裝飾：橘柄壺鈴 */}
      <img
        ref={deco}
        src={`${import.meta.env.BASE_URL}deco-kettlebell.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[-4%] top-[12%] w-[24vw] max-w-[320px] opacity-90 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] hidden md:block"
      />

      <div className="relative h-full max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.25fr] items-center gap-10">
        {/* 左：文案 */}
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-accent">06 · 櫃檯 / 老闆端 · AI 後台</p>
          <h2 className="headline mt-5 text-[9vw] md:text-[3.6vw]">
            用「說的」，<br />就能<span className="text-accent">管理</span>健身房。
          </h2>
          <p className="mt-6 max-w-md text-white/55 font-light leading-loose">
            自然語言查詢與指令，AI 即時把答案渲染成看板、數字、圖表。不必學系統，系統聽你的話。
          </p>
          <div className="mt-7 flex flex-wrap gap-2 font-mono text-[0.68rem] tracking-[0.12em] text-white/45">
            {["自然語言查詢", "即時渲染 UI", "主動盯風險"].map((t) => (
              <span key={t} className="rounded-full border border-white/12 px-3 py-1.5">{t}</span>
            ))}
          </div>
        </div>

        {/* 右：筆電外框 + console */}
        <div className="grid place-items-center [perspective:1600px]">
          <div ref={laptop} className="laptop" style={{ transformStyle: "preserve-3d" }}>
            <div className="laptop-lid">
              <div className="laptop-screen">
                <div className="cns-bar">
                  <i /><i /><i /><span>app.starcore.fit · 即時看板</span>
                </div>
                <div className="cns-input">
                  <span className="cns-prompt">›</span>
                  <span className="cns-typed">{typed}</span>
                  <span className="cns-caret" />
                </div>

                <div className="cns-result">
                  {/* KPI 卡 */}
                  <div className="cns-card" style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "translateY(0)" : "translateY(14px)" }}>
                    <h4>今日 · 即時看板</h4>
                    <div className="cns-kpis">
                      <div><span>今日收入</span><b>NT$12,600</b><i>▲ +8% 昨日</i></div>
                      <div><span>本月新增</span><b>18 人</b><i>▲ +3 人</i></div>
                      <div><span>在場人數</span><b>24</b><i>尖峰時段</i></div>
                    </div>
                  </div>

                  {/* 長條圖 */}
                  <div className="cns-card" style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(14px)" }}>
                    <h4>本月收入 · 近 5 個月</h4>
                    <div className="cns-bars">
                      {BARS.map((b) => (
                        <div key={b.n} style={{ height: stage >= 3 ? `${b.h}%` : "6%" }} data-name={b.n} />
                      ))}
                    </div>
                    <div className="cns-note">本月 NT$284K · 較上月 <em>▲ +12%</em></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="laptop-base"><span className="laptop-notch" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
