import { useState } from "react";
import { useSmoothScroll } from "./lib/useSmoothScroll.js";
import Backdrop from "./components/Backdrop.jsx";
import DoorIntro from "./components/DoorIntro.jsx";
import Hero from "./components/Hero.jsx";
import PhoneShowcase from "./components/PhoneShowcase.jsx";
import ConsoleShowcase from "./components/ConsoleShowcase.jsx";
import StickyFeature from "./components/StickyFeature.jsx";
import Reveal from "./components/Reveal.jsx";

const PAINS = [
  { h: "人工作業耗時", d: "查會籍、對堂數全靠櫃檯人工，尖峰時段大排長龍。" },
  { h: "會籍到期沒人追", d: "到期前無人提醒，續約全靠會員自己記得。" },
  { h: "沉睡會員默默流失", d: "一個月沒來也沒人發現，等發現已經退會。" },
  { h: "工具分散難整合", d: "門禁、LINE、報表各自為政，資料兜不起來。" },
];

export default function App() {
  useSmoothScroll();
  const [entered, setEntered] = useState(false);

  return (
    <>
      <Backdrop />
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

        {/* 痛點（問題） */}
        <section className="py-[14vh] px-6 max-w-5xl mx-auto">
          <Reveal className="mb-14">
            <p className="font-mono text-xs tracking-[0.3em] text-accent">03 · 這些場景，你天天在過</p>
            <h2 className="headline mt-4 text-[8vw] md:text-[3.4vw]">傳統管理，卡在四個地方。</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAINS.map((p, i) => (
              <Reveal key={i} once className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm">
                <span className="font-mono text-[0.7rem] text-accent/80">0{i + 1}</span>
                <h4 className="mt-3 text-xl font-medium text-white/90">{p.h}</h4>
                <p className="mt-2 text-white/50 font-light leading-relaxed">{p.d}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 解法 A：會員端 LINE 一站式（保留手機畫面） */}
        <div id="member">
          <PhoneShowcase />
        </div>

        {/* 解法 B：櫃檯/老闆端 AI 對話式後台（保留桌機畫面） */}
        <ConsoleShowcase />

        {/* 成果：sticky 晶片式段落 */}
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
