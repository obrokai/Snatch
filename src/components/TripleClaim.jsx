import Reveal from "./Reveal.jsx";

/**
 * 三件 · 只有 SNATCH 做到的事：三句宣言逐句揭露。
 * 對標 snatch.training 的「綁定，就開始。開口，就操作。合規，零成本。」
 */
const CLAIMS = [
  { n: "01", t: ["綁定，", "就開始。"], d: "加 LINE 一鍵綁定會員，第一天就上線。" },
  { n: "02", t: ["開口，", "就操作。"], d: "自然語言指令，後台用「說的」就能跑。" },
  { n: "03", t: ["合規，", "零成本。"], d: "別人花十幾萬做信託履約，你花 NT$0。" },
];

export default function TripleClaim() {
  return (
    <section className="py-[16vh] px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal once>
          <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">
            三件 · 只有 SNATCH 做到的事
          </p>
        </Reveal>

        <div className="mt-10 md:mt-14 space-y-14 md:space-y-20">
          {CLAIMS.map((c, i) => (
            <Reveal key={c.n} once className="group">
              <div className="grid md:grid-cols-[auto_1fr] items-baseline gap-4 md:gap-10">
                <span className="font-mono text-sm md:text-base text-accent/70 tracking-[0.2em]">
                  {c.n}
                </span>
                <div>
                  <h3 className="headline text-[11vw] md:text-[5.6vw] leading-[1.05]">
                    <span className="text-white/95">{c.t[0]}</span>
                    <span className="text-accent">{c.t[1]}</span>
                  </h3>
                  <p className="mt-3 md:mt-4 text-sm md:text-base text-white/45 font-light">
                    {c.d}
                  </p>
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/50 via-white/10 to-transparent" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
