// src/components/chrome/SideRail.tsx — client component (needs usePathname)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPath, localeFromPath, NAV_COPY, SITE_COPY } from "@/lib/i18n";

export function SideRail() {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPath(pathname);
  const site = SITE_COPY[locale];
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return (
    <nav className="siderail">
      <div className="siderail__head">
        <div>{site.navHead}</div>
        <div>{site.navHeadEn}</div>
      </div>
      <ul className="siderail__list">
        {NAV_COPY.map(n => {
          const active = n.href === "/" ? withoutLocale === "/" : withoutLocale.startsWith(n.href);
          return (
            <li key={n.href}>
              <Link className={`siderail__link ${active ? "is-active" : ""}`} href={localizedPath(locale, n.href)}>
                <span className="no">{n.no}</span>
                <span className="zh">{locale === "en" ? n.en : n.zh}</span>
                <span className="en">{n.eyebrow}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="siderail__foot">
        <div><span>{site.schema}</span><span className="v">v1.1</span></div>
        <div><span>{site.updated}</span><span className="v">2026·05·08</span></div>
        <div><span>{site.numbering}</span><span className="v">219 anomalies</span></div>
        <div><span>{site.license}</span><span className="v">{site.licenseValue}</span></div>
      </div>
    </nav>
  );
}
