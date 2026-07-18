/** 頁尾：品牌 / 系統 / 導入 / 聯絡 四欄 + 版權列。 */
const COLS = [
  {
    h: "品牌",
    links: [
      { t: "Snatch OS", href: "#top" },
      { t: "Snatch Training", href: "https://snatch.training/training" },
      { t: "Blog", href: "https://snatch.training/blog" },
    ],
  },
  {
    h: "系統",
    links: [
      { t: "會員體驗", href: "#member" },
      { t: "櫃檯後台", href: "#desk" },
      { t: "系統全覽", href: "#system" },
    ],
  },
  {
    h: "導入",
    links: [
      { t: "預約諮詢", href: "#cta" },
      { t: "門市需求盤點", href: "#cta" },
      { t: "導入時程", href: "#cta" },
    ],
  },
  {
    h: "聯絡",
    links: [
      { t: "pojungho@gmail.com", href: "mailto:pojungho@gmail.com" },
      { t: "LINE 官方帳號", href: "https://lin.ee/Xa9Rbyw" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-14 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="font-mono tracking-[0.3em] text-sm">
              SNATCH<span className="text-accent">OS</span>
            </span>
            <p className="mt-4 max-w-xs text-[0.78rem] text-white/40 font-light leading-relaxed">
              健身房智慧管理系統。AI 整合 × LINE 學員綁定 × 一站式營運，讓會員、營運與經營，一次到位。
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.h}>
              <b className="block font-mono text-[0.66rem] tracking-[0.26em] text-white/35">{c.h}</b>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.t}>
                    <a
                      href={l.href}
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-[0.8rem] text-white/55 transition hover:text-accent"
                    >
                      {l.t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
          <span className="text-[0.7rem] text-white/30">© 2026 Snatch. 健身房智慧管理系統.</span>
          <div className="flex flex-wrap gap-3 font-mono text-[0.62rem] tracking-[0.12em] text-white/30">
            {["AI 智慧管理", "對話式後台", "LINE 綁定學員", "營運報表"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
