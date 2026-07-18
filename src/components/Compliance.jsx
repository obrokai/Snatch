import Reveal from "./Reveal.jsx";

/**
 * 安全與合規：傳統三種做法（劃線作廢）對比 NT$0。
 * 卡片進場後劃線動畫掃過價格，NT$0 帶脈衝光暈。
 */
const OLD_WAYS = [
  { k: "信託", sub: "信託帳戶" },
  { k: "履約保障", sub: "銀行履約保證" },
  { k: "質押", sub: "質押擔保" },
];

const WINS = [
  "省下動輒十幾萬到幾十萬的費用",
  "安全、合規地經營每一筆會費",
  "把預算留給教練、設備與服務",
];

export default function Compliance() {
  return (
    <section className="relative py-[16vh] px-6 overflow-hidden">
      {/* 背景光暈 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_62%,rgba(255,107,26,0.10),transparent_70%)]" />

      <div className="relative max-w-5xl mx-auto">
        <Reveal once className="text-center">
          <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">07 · 安全與合規</p>
          <h2 className="headline mt-4 text-[8vw] md:text-[3.6vw]">
            合規經營，<br className="md:hidden" />一毛錢成本都不用。
          </h2>
          <p className="mt-5 mx-auto max-w-2xl text-sm md:text-base text-white/50 font-light leading-relaxed md:leading-loose">
            健身房收的預付會費，法規要求要有消費者保障機制。市面上的做法動輒十幾萬到幾十萬——導入 Snatch，這些通通不需要。
          </p>
        </Reveal>

        {/* 傳統做法三卡：價格被劃掉 + 蓋「不需要」章 */}
        <div className="mt-12 md:mt-16 grid sm:grid-cols-3 gap-4">
          {OLD_WAYS.map((w, i) => (
            <Reveal key={w.k} once className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
              <b className="block text-lg text-white/85">{w.k}</b>
              <span className="block mt-0.5 text-[0.7rem] font-mono tracking-[0.1em] text-white/35">{w.sub}</span>
              <div className="relative mt-5 inline-block">
                <span className="text-white/40 font-light">傳統合規做法 · NT$ 十幾萬起</span>
                <i
                  className="strike-line absolute left-0 top-1/2 h-[2px] bg-accent"
                  style={{ animationDelay: `${0.4 + i * 0.25}s` }}
                />
              </div>
              <span className="mt-4 inline-block rounded-full border border-accent/50 px-3 py-1 font-mono text-[0.68rem] tracking-[0.2em] text-accent">
                不需要
              </span>
            </Reveal>
          ))}
        </div>

        {/* NT$0 主視覺 */}
        <Reveal once className="mt-14 md:mt-20 text-center">
          <p className="font-mono text-[0.7rem] tracking-[0.3em] text-white/45">你的合規成本</p>
          <div className="zero-glow mt-2 inline-block headline text-[22vw] md:text-[10vw] leading-none text-accent">
            NT$0
          </div>
          <p className="mt-3 font-mono text-[0.68rem] tracking-[0.24em] text-white/40">
            安全 · 合規 · 零負擔
          </p>
          <ul className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
            {WINS.map((t) => (
              <li key={t} className="text-sm text-white/55 font-light flex items-center justify-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />{t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-base md:text-xl text-white/75 font-light">
            同樣合規，別人花<span className="text-white line-through decoration-accent/70 mx-1">十幾萬～幾十萬</span>，
            你花 <span className="text-accent font-medium">NT$0</span>。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
