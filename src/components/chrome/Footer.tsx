// src/components/chrome/Footer.tsx — server component
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, background: "var(--ink)", color: "var(--paper)",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-display)", fontWeight: 900 }}>韩</span>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>韩立人生数据库</strong>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)", maxWidth: 380 }}>
            一份算得清楚的修仙履历。1324 章、1998 事件、22 段境界、3 套闭关口径，全部公开口径与置信度。
            本网站只读结构化数据，不公开原文全文。
          </p>
        </div>
        <div className="footer__col">
          <h4>导航</h4>
          <ul>
            <li><Link href="/">00 · 首页</Link></li>
            <li><Link href="/timeline">01 · 人生时间轴</Link></li>
            <li><Link href="/realms">02 · 境界档案</Link></li>
            <li><Link href="/events">03 · 事件库</Link></li>
            <li><Link href="/cards">04 · 分享卡</Link></li>
            <li><Link href="/methodology">05 · 数据口径</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>数据</h4>
          <ul>
            <li>schema · v1.1</li>
            <li>章节记录 · 1324</li>
            <li>事件原子 · 1998</li>
            <li>平均置信 · 0.593</li>
            <li>待复核 · 179</li>
            <li>章号异常 · 219</li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>引用</h4>
          <ul>
            <li>fanren-data-parser</li>
            <li>韩立人生事件数据库.csv</li>
            <li>han-li.sqlite</li>
            <li>generated · 2026-05-08</li>
          </ul>
        </div>
      </div>
      <div className="footer__bot">
        <span>© 凡修档案馆 · 非官方 · 引用请保留口径标注</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>HL-DB · v1.1</span>
      </div>
    </footer>
  );
}
