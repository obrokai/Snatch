import Reveal from "./Reveal.jsx";

/** 媒體報導 + 常見問題（accordion）。 */
const FAQS = [
  { q: "會員一定要下載 App 嗎？", a: "不用。學員只要加你的官方 LINE，輸入手機與驗證碼就能綁定會員，之後查會籍、約課、購課、收提醒全部在 LINE 裡完成，不必再裝一個新的 App。" },
  { q: "現有的會員資料能轉進來嗎？", a: "可以。我們支援匯入你目前的會員名單與會籍、堂數資料，導入時會協助你把既有資料對應進系統，不必從零重建。" },
  { q: "導入大概需要多久？", a: "視門市規模與資料量而定。我們會在諮詢時盤點你的需求，規劃設定、資料匯入與教育訓練的時程，讓櫃檯能平順上手。" },
  { q: "真的不用花信託 / 履約保證的費用嗎？", a: "Snatch OS 的服務模式讓你能以合規方式經營預付會費，省去動輒十幾萬到幾十萬的信託、履約保證或質押成本。實際適用的合規方案，會在諮詢時依你的營運模式為你說明。" },
  { q: "支援多教練、多門市嗎？", a: "支援。多教練排課、月結薪資都在同一頁完成；若你有多門市的營運需求，也歡迎在諮詢時提出，我們會依規模提供合適的方案。" },
  { q: "怎麼收費？需要綁約嗎？", a: "方案與收費會依門市規模與功能需求量身規劃。預約免費諮詢後，我們會了解你的營運狀況，提供清楚的報價與合作方式。" },
];

export default function MediaFaq() {
  return (
    <>
      {/* 媒體報導 */}
      <section className="py-[12vh] px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal once>
            <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">08 · 媒體報導</p>
            <h2 className="headline mt-4 text-[8vw] md:text-[3vw]">媒體，怎麼看 Snatch OS</h2>
          </Reveal>
          <Reveal once className="mt-8">
            <a
              href="https://meet.bnext.com.tw/articles/view/53288"
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-7 md:p-9 transition hover:border-accent/60 hover:bg-accent/[0.05] hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(255,107,26,0.35)]"
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.68rem] tracking-[0.16em] text-white/40">
                <span className="text-accent">Meet 創業小聚 · 數位時代</span>
                <span>2026.06.10</span>
              </div>
              <h3 className="mt-4 text-lg md:text-2xl font-medium text-white/90 leading-relaxed">
                15 分鐘、300 元一堂運動教練課，你會買單嗎？冷杉科技開拓醫美減重新戰場
              </h3>
              <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.2em] text-accent">
                閱讀完整報導 <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* 常見問題 */}
      <section className="py-[12vh] px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal once>
            <p className="font-mono text-[0.65rem] md:text-xs tracking-[0.3em] text-accent">09 · 常見問題</p>
            <h2 className="headline mt-4 text-[8vw] md:text-[3vw]">導入前，你可能想知道的。</h2>
          </Reveal>
          <div className="mt-8 md:mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={i} once>
                <details className="faq group rounded-xl border border-white/10 bg-white/[0.02] transition open:border-accent/50 open:bg-accent/[0.04]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-white/85 font-medium text-sm md:text-base [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="faq-icon relative h-4 w-4 shrink-0 text-accent" aria-hidden="true">
                      <i className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                      <i className="faq-vert absolute left-1/2 top-1/2 h-4 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300" />
                    </span>
                  </summary>
                  <p className="px-5 md:px-6 pb-5 text-sm text-white/50 font-light leading-relaxed">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
