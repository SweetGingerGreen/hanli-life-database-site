"use client";

// src/components/chrome/Footer.tsx — client footer so locale follows /en paths
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPath, localeFromPath, NAV_COPY } from "@/lib/i18n";

export function Footer() {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPath(pathname);
  const isEn = locale === "en";

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, background: "var(--ink)", color: "var(--paper)",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-display)", fontWeight: 900 }}>
              {isEn ? "HL" : "韩"}
            </span>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
              {isEn ? "Han Li Life Database" : "韩立人生数据库"}
            </strong>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)", maxWidth: 380 }}>
            {isEn
              ? "A structured cultivation biography: 1,324 chapter records, 1,998 events, 22 realm phases, and three seclusion-duration ledgers. The site presents database fields and summaries, not the novel text."
              : "一份算得清楚的修仙履历。1324 章、1998 事件、22 段境界、3 套闭关口径，全部公开口径与置信度。本网站只读结构化数据，不公开原文全文。"}
          </p>
        </div>
        <div className="footer__col">
          <h4>{isEn ? "Navigation" : "导航"}</h4>
          <ul>
            {NAV_COPY.map((item) => (
              <li key={item.href}>
                <Link href={localizedPath(locale, item.href)}>
                  {item.no} · {isEn ? item.en : item.zh}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__col">
          <h4>{isEn ? "Data" : "数据"}</h4>
          <ul>
            <li>schema · v1.1</li>
            <li>{isEn ? "chapter records" : "章节记录"} · 1324</li>
            <li>{isEn ? "atomic events" : "事件原子"} · 1998</li>
            <li>{isEn ? "avg confidence" : "平均置信"} · 0.593</li>
            <li>{isEn ? "needs review" : "待复核"} · 179</li>
            <li>{isEn ? "numbering anomalies" : "章号异常"} · 219</li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>{isEn ? "Citation" : "引用"}</h4>
          <ul>
            <li>fanren-data-parser</li>
            <li>han-li.sqlite</li>
            <li>generated · 2026-05-08</li>
            <li><Link href={localizedPath(locale, "/privacy")}>{isEn ? "Privacy & Ads" : "隐私与广告"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__bot">
        <span>{isEn ? "Unofficial fan data project · cite methodology when quoting" : "© 凡修档案馆 · 非官方 · 引用请保留口径标注"}</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>HL-DB · v1.1</span>
      </div>
    </footer>
  );
}
