import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RotatingProp from "./RotatingProp.jsx";

/**
 * 會員端 LINE 一站式（保留原手機畫面內容）。
 * 真實 CSS 手機外框 + LINE UI；pin 住區塊，捲動時圖文選單依序點亮、手機浮動視差。
 * 橘柄啞鈴作為裝飾元件漂浮於一側。
 */
const MENU = [
  { k: "m1", i: "◎", t: "我的會籍" },
  { k: "m2", i: "✦", t: "我的教練" },
  { k: "m3", i: "＋", t: "預約課程" },
  { k: "m4", i: "◇", t: "線上購課" },
  { k: "m5", i: "≋", t: "通知中心" },
  { k: "m6", i: "☎", t: "聯絡櫃檯" },
];

const POINTS = [
  { b: "加 LINE 一鍵綁定", d: "輸入手機與驗證碼即啟用，不必下載 App。" },
  { b: "約課、購課、查會籍", d: "圖文選單點了就到，剩餘堂數、綁定教練都在一頁。" },
  { b: "自動提醒不流失", d: "到期、堂數不足、沉睡喚回，透過 LINE 主動推播。" },
];

export default function PhoneShowcase() {
  const wrap = useRef(null);
  const phone = useRef(null);
  const deco = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "+=260%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        setActive(Math.min(MENU.length - 1, Math.floor(p * MENU.length)));
        if (phone.current) {
          gsap.set(phone.current, { y: -30 + p * 60, rotateY: 14 - p * 16, rotateX: 4 - p * 4 });
        }
        if (deco.current) gsap.set(deco.current, { y: 40 - p * 120, rotate: -12 + p * 24 });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={wrap} className="relative h-[100svh] overflow-hidden">
      {/* 裝飾：旋轉中的橘柄啞鈴 */}
      <div
        ref={deco}
        className="pointer-events-none absolute -left-12 top-[14%] w-[28vw] max-w-[360px] aspect-square hidden md:block"
      >
        <RotatingProp base={`${import.meta.env.BASE_URL}props/dumbbell/frame_`} pxPerRotation={1400} offset={0.15} className="w-full h-full opacity-85" />
      </div>

      <div className="relative h-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-4 md:gap-10 content-center">
        {/* 左：文案 */}
        <div className="order-2 md:order-1">
          <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">差異化 01 · 會員端 · LINE 綁定學員</p>
          <h2 className="headline mt-3 md:mt-5 text-[7vw] md:text-[3.6vw]">
            會員的一切，<br className="hidden md:block" />都在熟悉的 <span className="text-accent">LINE</span> 裡。
          </h2>
          <ul className="mt-4 md:mt-8 space-y-2.5 md:space-y-5 max-w-md">
            {POINTS.map((p, i) => (
              <li
                key={i}
                className="flex gap-3 md:gap-4 transition-all duration-500"
                style={{ opacity: active >= i * 2 ? 1 : 0.32 }}
              >
                <span className="mt-0.5 md:mt-1 h-5 w-5 md:h-6 md:w-6 shrink-0 rounded-full grid place-items-center text-[0.62rem] md:text-[0.7rem] font-mono border border-accent/50 text-accent">
                  {i + 1}
                </span>
                <div>
                  <b className="font-medium text-white/90 text-sm md:text-base">{p.b}</b>
                  <p className="text-xs md:text-sm text-white/50 mt-0.5 md:mt-1 leading-relaxed hidden sm:block">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 右：手機外框 + LINE UI */}
        <div className="order-1 md:order-2 grid place-items-center [perspective:1400px]">
          <div ref={phone} className="phone-device" style={{ transformStyle: "preserve-3d" }}>
            <div className="phone-glare" />
            <div className="phone-island" />
            <div className="phone-screen">
              <div className="line-head">
                <span className="line-avatar" />
                <div>
                  <b>星核健身房</b>
                  <i>LINE 官方帳號 · 已綁定</i>
                </div>
              </div>

              <div className="line-card">
                <span className="line-card__label">會籍狀態 · 有效</span>
                <b className="line-card__date">2026 / 12 / 31</b>
                <span className="line-card__sub">有效期限 · 剩餘 211 天</span>
                <span className="line-card__chip">星核 · 全時段會員</span>
              </div>

              <div className="line-menu">
                {MENU.map((m, i) => (
                  <button key={m.k} className={i === active ? "is-active" : ""}>
                    <span>{m.i}</span>
                    {m.t}
                  </button>
                ))}
              </div>

              <div className="line-bind">綁定手機 · 立即啟用</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
