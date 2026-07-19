import { useState } from "react";
import { useSmoothScroll } from "./lib/useSmoothScroll.js";
import Backdrop from "./components/Backdrop.jsx";
import DoorIntro from "./components/DoorIntro.jsx";
import Hero from "./components/Hero.jsx";
import ScrubSequence from "./components/ScrubSequence.jsx";
import TripleClaim from "./components/TripleClaim.jsx";
import CinematicScrub from "./components/CinematicScrub.jsx";
import SystemHub from "./components/SystemHub.jsx";
import PhoneShowcase from "./components/PhoneShowcase.jsx";
import ConsoleShowcase from "./components/ConsoleShowcase.jsx";
import Compliance from "./components/Compliance.jsx";
import StickyFeature from "./components/StickyFeature.jsx";
import MediaFaq from "./components/MediaFaq.jsx";
import Footer from "./components/Footer.jsx";
import Reveal from "./components/Reveal.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";

const PAINS = [
  { h: "人工作業耗時", d: "查會籍、對堂數全靠櫃檯人工，尖峰時段大排長龍。" },
  { h: "會籍到期沒人追", d: "到期前無人提醒，續約全靠會員自己記得。" },
  { h: "沉睡會員默默流失", d: "一個月沒來也沒人發現，等發現已經退會。" },
  { h: "教練課數據一團亂", d: "剩幾堂、誰完課、薪資多少，全靠人工對帳。" },
  { h: "工具分散難整合", d: "門禁、LINE、報表各自為政，資料兜不起來。" },
];

const STEPS = ["免費諮詢", "盤點門市需求", "規劃導入時程"];

export default function App() {
  useSmoothScroll();
  const [entered, setEntered] = useState(false);

  return (
    <>
      <Backdrop />
      <DoorIntro
        onOpen={() => {
          setEntered(true);
          // 通知延載資源（旋轉器材幀）：開門後才開始抓，別跟開場 poster/影片搶頻寬
          window.__snatchEntered = true;
          dispatchEvent(new Event("snatch-entered"));
        }}
      />
      <ScrollProgress show={entered} />

      {/* 頂部品牌列（進站後淡入 + 霧面底） */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-700 border-b border-white/[0.06] bg-[#08080b]/60 backdrop-blur-md"
        style={{ opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(-100%)" }}
      >
        <a href="#top" className="font-mono tracking-[0.3em] text-sm">
          SNATCH<span className="text-accent">OS</span>
        </a>
        <a
          href="mailto:pojungho@gmail.com?subject=預約免費諮詢"
          className="font-mono text-[0.72rem] tracking-[0.18em] text-white/70 border border-white/15 rounded-full px-4 py-2 transition hover:border-accent hover:text-accent hover:bg-accent/5"
        >
          預約諮詢
        </a>
      </header>

      <main id="top">
        <Hero start={entered} />

        {/* 走進場館：捲動＝第一人稱走入（Snowflake Virtual Office 式），
            與 Hero 的場館背景空間連續 */}
        <ScrubSequence
          base={`${import.meta.env.BASE_URL}walkthrough/frame_`}
          count={121}
          end="+=380%"
          loadLabel="載入場館"
          captions={[
            { t: "跟著走進來。", s: "這是你的場館——也是系統的入口。" },
            { t: "會員刷臉的那一刻，", s: "報到、扣堂、通知，已經同時發生。" },
            { t: "你看到的是器材，", s: "系統看到的是每一筆正在累積的營運數據。" },
          ]}
        />

        {/* 02 三件事宣言 */}
        <TripleClaim />

        {/* 過場短句 */}
        <section className="min-h-[70svh] flex items-center justify-center px-6">
          <Reveal className="max-w-3xl text-center">
            <h2 className="headline text-[8vw] md:text-[4.4vw] text-white/90">
              不是多一套系統。<br />是把該消失的麻煩，
              <span className="text-accent">一次拿掉</span>。
            </h2>
          </Reveal>
        </section>

        {/* 03 痛點（問題） */}
        <section className="py-[14vh] px-6 max-w-5xl mx-auto">
          <Reveal className="mb-14">
            <p className="font-mono text-xs tracking-[0.3em] text-accent">03 · 這些場景，你天天在過</p>
            <h2 className="headline mt-4 text-[8vw] md:text-[3.4vw]">
              現在的健身房，<br className="md:hidden" />每天都在漏掉什麼？
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAINS.map((p, i) => (
              <Reveal key={i} once className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm">
                <span className="font-mono text-[0.7rem] text-accent/80">0{i + 1}</span>
                <h4 className="mt-3 text-xl font-medium text-white/90">{p.h}</h4>
                <p className="mt-2 text-white/50 font-light leading-relaxed">{p.d}</p>
              </Reveal>
            ))}
            {/* 收束卡：一套系統補起缺口 */}
            <Reveal once className="relative rounded-2xl border border-accent/50 bg-accent/[0.07] p-7 overflow-hidden shadow-[0_0_50px_-16px_rgba(255,107,26,0.5)]">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
              <span className="font-mono text-[0.7rem] text-accent">SNATCH OS</span>
              <h4 className="mt-3 text-xl font-medium text-white">
                一套系統，把這些缺口<span className="text-accent">一次補起來</span>。
              </h4>
              <a href="#system" className="mt-4 inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.2em] text-accent">
                看系統如何運作 →
              </a>
            </Reveal>
          </div>
        </section>

        {/* 電影感轉場：捲動擦洗運動影像 */}
        <CinematicScrub />

        {/* 04 系統全覽 hub */}
        <SystemHub />

        {/* 競爭定位：為什麼是 SNATCH */}
        <section className="py-[14vh] px-6">
          <Reveal className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-accent">為什麼是 SNATCH</p>
            <h2 className="headline mt-5 text-[8vw] md:text-[3.8vw]">
              競爭者能做的，我們都能做。<br />
              真正的差距，在<span className="text-accent">這兩件事</span>。
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/50 font-light leading-relaxed md:leading-loose">
              市面上系統有的功能，Snatch 一樣不少。但有兩件事，只有我們做得到——也正是健身房最「有感」的地方。
            </p>
          </Reveal>
        </section>

        {/* 差異化 01：會員端 LINE 一站式（保留手機畫面） */}
        <div id="member">
          <PhoneShowcase />
        </div>

        {/* 差異化 02：櫃檯/老闆端 AI 對話式後台（保留桌機畫面） */}
        <div id="desk">
          <ConsoleShowcase />
        </div>

        {/* 07 安全與合規 */}
        <Compliance />

        {/* 成果：sticky 晶片式段落（三個改變） */}
        <StickyFeature />

        {/* 08 媒體報導 + 09 常見問題 */}
        <MediaFaq />

        {/* 收束 + CTA */}
        <section id="cta" className="min-h-[100svh] flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-accent mb-6">下一步 · 免費諮詢</p>
            <h2 className="headline text-[9vw] md:text-[5vw] max-w-4xl">
              準備好讓系統<br />替你顧好每個環節了嗎？
            </h2>

            {/* 導入三步驟 */}
            <ol className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center">
                  <span className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2">
                    <i className="not-italic grid h-5 w-5 place-items-center rounded-full bg-accent/15 font-mono text-[0.62rem] text-accent">
                      {i + 1}
                    </i>
                    <span className="text-[0.8rem] text-white/70">{s}</span>
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden sm:block mx-2 h-px w-6 bg-gradient-to-r from-accent/60 to-transparent" />
                  )}
                </li>
              ))}
            </ol>

            <a
              href="mailto:pojungho@gmail.com?subject=預約免費諮詢"
              className="mt-10 inline-block rounded-full bg-accent px-9 py-4 text-[#0a0a0d] font-medium transition hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              預約免費諮詢
            </a>
            <p className="mt-8 font-mono text-xs tracking-[0.2em] text-white/40">
              SNATCH<span className="text-accent">OS</span> · pojungho@gmail.com
            </p>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
