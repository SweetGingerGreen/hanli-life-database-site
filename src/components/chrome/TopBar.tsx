"use client";

// src/components/chrome/TopBar.tsx — client chrome for static export support
import Link from "next/link";
import { usePathname } from "next/navigation";
import { alternatePath, localizedPath, localeFromPath, navForPath, SITE_COPY } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar({
  initialColorMode,
  initialFont,
}: {
  initialColorMode: "paper" | "ink";
  initialFont: "song" | "hei";
}) {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPath(pathname);
  const site = SITE_COPY[locale];
  const section = navForPath(pathname);
  const alternateLocale = locale === "en" ? "zh" : "en";

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link href={localizedPath(locale, "/")} className="brand" prefetch={false}>
          <span className="brand__seal" aria-hidden="true">{site.seal}</span>
          <span className="brand__name">
            {site.name}
            <span className="en">{site.enName}</span>
          </span>
        </Link>
        <div className="topbar__crumbs">
          <span>{section.no}</span>
          <span style={{ color: "var(--rule-strong)" }}>/</span>
          <span style={{ color: "var(--ink-2)" }}>{locale === "en" ? section.en : section.zh}</span>
          <span style={{ color: "var(--rule-strong)" }}>/</span>
          <span>{section.eyebrow}</span>
        </div>
        <div className="topbar__meta">
          <span className="kbd">1324</span> {site.chapters}
          <span style={{ margin: "0 8px" }}>·</span>
          <span className="kbd">1998</span> {site.events}
          <span style={{ margin: "0 8px" }}>·</span>
          <span className="kbd">22</span> {site.realms}
        </div>
        <Link className="kbd lang-switch" href={alternatePath(pathname, alternateLocale)} prefetch={false}>
          {site.languageLabel}
        </Link>
        <ThemeToggle initialColorMode={initialColorMode} initialFont={initialFont} />
      </div>
    </header>
  );
}
