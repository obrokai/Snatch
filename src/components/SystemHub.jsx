import Reveal from "./Reveal.jsx";

/**
 * 系統全覽：中央 Snatch OS 核心 + 四個接觸點。
 * SVG 連線用 stroke-dash 脈衝動畫模擬「資料流進核心」，核心帶呼吸光環。
 */
const NODES = [
  { k: "學員綁定", d: "LINE 一鍵綁定會員", pos: "tl" },
  { k: "營運報表", d: "老闆 / 教練視角", pos: "tr" },
  { k: "前台管理", d: "對話式後台", pos: "bl" },
  { k: "LINE 會員", d: "查詢 · 預約 · 通知", pos: "br" },
];

const POS = {
  tl: "md:col-start-1 md:row-start-1 md:justify-self-start",
  tr: "md:col-start-3 md:row-start-1 md:justify-self-end",
  bl: "md:col-start-1 md:row-start-3 md:justify-self-start",
  br: "md:col-start-3 md:row-start-3 md:justify-self-end",
};

export default function SystemHub() {
  return (
    <section id="system" className="relative py-[16vh] px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <Reveal once className="text-center mb-12 md:mb-20">
          <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">04 · 系統全覽</p>
          <h2 className="headline mt-4 text-[8vw] md:text-[3.6vw]">
            一套系統，<br className="md:hidden" />串起四個接觸點
          </h2>
        </Reveal>

        <Reveal once>
          <div className="relative md:grid md:grid-cols-3 md:grid-rows-3 md:items-center gap-4 flex flex-col">
            {/* 連線層（桌機）：四條線從角落流向中心 */}
            <svg
              className="pointer-events-none absolute inset-0 hidden md:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[
                "M 18 16 L 50 50",
                "M 82 16 L 50 50",
                "M 18 84 L 50 50",
                "M 82 84 L 50 50",
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} stroke="rgba(255,107,26,0.18)" strokeWidth="0.3" fill="none" />
                  <path
                    d={d}
                    stroke="rgba(255,138,71,0.9)"
                    strokeWidth="0.4"
                    fill="none"
                    strokeDasharray="3 22"
                    className="hub-pulse"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                </g>
              ))}
            </svg>

            {/* 中央核心 */}
            <div className="relative md:col-start-2 md:row-start-2 justify-self-center order-first md:order-none">
              <div className="hub-core relative rounded-2xl border border-accent/40 bg-[#0d0b09]/90 px-8 py-6 text-center backdrop-blur-sm">
                <i className="not-italic font-mono tracking-[0.3em] text-lg text-white">
                  SNATCH<span className="text-accent">OS</span>
                </i>
                <span className="mt-2 block text-[0.68rem] font-mono tracking-[0.14em] text-white/45">
                  AI 自動化引擎 · Adaptive UI · LINE Webhook
                </span>
              </div>
            </div>

            {/* 四個節點 */}
            {NODES.map((n) => (
              <div
                key={n.k}
                className={`relative z-10 w-full md:w-56 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-4 backdrop-blur-sm transition hover:border-accent/60 hover:bg-accent/[0.06] ${POS[n.pos]}`}
              >
                <b className="block text-white/90 font-medium">{n.k}</b>
                <span className="mt-1 block text-[0.72rem] text-white/45 font-mono tracking-[0.08em]">{n.d}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
