import { useState } from "react";
import { useSmoothScroll } from "./lib/useSmoothScroll.js";
import DoorIntro from "./components/DoorIntro.jsx";
import Hero from "./components/Hero.jsx";
import ProductSequence from "./components/ProductSequence.jsx";
import StickyFeature from "./components/StickyFeature.jsx";
import Reveal from "./components/Reveal.jsx";

export default function App() {
  useSmoothScroll();
  const [entered, setEntered] = useState(false);

  return (
    <>
      <DoorIntro onOpen={() => setEntered(true)} />

      {/* 頂部品牌列 */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-10 py-5 transition-opacity duration-700"
        style={{ opacity: entered ? 1 : 0 }}
      >
        <a href="#top" className="font-mono tracking-[0.3em] text-sm">
          SNATCH<span className="text-accent">OS</span>
        </a>
        <a
          href="mailto:hello@snatch.tw?subject=預約免費諮詢"
          className="font-mono text-[0.72rem] tracking-[0.18em] text-white/70 border border-white/15 rounded-full px-4 py-2 transition hover:border-accent hover:text-accent"
        >
          預約諮詢
        </a>
      </header>

      <main id="top">
        <Hero start={entered} />

        {/* 過場短句 */}
        <section className="min-h-[80svh] flex items-center justify-center px-6">
          <Reveal className="max-w-3xl text-center">
            <h2 className="headline text-[8vw] md:text-[4.4vw] text-white/90">
              不是多一套系統。<br />是把該消失的麻煩，
              <span className="text-accent">一次拿掉</span>。
            </h2>
          </Reveal>
        </section>

        {/* 產品展示：幀序列偽 3D + pin（效果 #2、#4） */}
        <ProductSequence />

        {/* 中段一段段揭露（效果 #3） */}
        <section className="py-[18vh] px-6 max-w-4xl mx-auto space-y-[26vh]">
          {[
            { k: "會員體驗", t: "他要的一切，都在 LINE 裡。", d: "加官方 LINE 一鍵綁定，約課、購課、查會籍、收提醒——不必再下載一個新 App。" },
            { k: "櫃檯後台", t: "用「說的」，就能操作。", d: "自然語言查詢與指令，AI 即時把答案渲染成卡片、數字、圖表。把人力留給服務。" },
            { k: "老闆報表", t: "每天發生的事，變成能決策的數字。", d: "今日收入、新增會員、在場人數、流失名單——一個後台全看見，隨時問、隨時答。" },
          ].map((s, i) => (
            <Reveal key={i} className="text-center md:text-left">
              <span className="font-mono text-xs tracking-[0.3em] text-accent">{s.k}</span>
              <h3 className="headline mt-4 text-[9vw] md:text-[3.8vw]">{s.t}</h3>
              <p className="mt-6 mx-auto md:mx-0 max-w-xl text-white/55 font-light leading-loose">{s.d}</p>
            </Reveal>
          ))}
        </section>

        {/* Sticky 晶片式段落（效果 #4） */}
        <StickyFeature />

        {/* 收束 + CTA */}
        <section className="min-h-[100svh] flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-accent mb-6">下一步 · 免費諮詢</p>
            <h2 className="headline text-[9vw] md:text-[5vw] max-w-4xl">
              準備好讓系統<br />替你顧好每個環節了嗎？
            </h2>
            <a
              href="mailto:hello@snatch.tw?subject=預約免費諮詢"
              className="mt-12 inline-block rounded-full bg-accent px-9 py-4 text-[#0a0a0d] font-medium transition hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              預約免費諮詢
            </a>
            <p className="mt-8 font-mono text-xs tracking-[0.2em] text-white/40">
              SNATCH<span className="text-accent">OS</span> · hello@snatch.tw
            </p>
          </Reveal>
        </section>
      </main>
    </>
  );
}
