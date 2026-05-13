"use client";

// src/components/chrome/TopBar.tsx — client chrome for static export support
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForPath } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar({
  initialColorMode,
  initialFont,
}: {
  initialColorMode: "paper" | "ink";
  initialFont: "song" | "hei";
}) {
  const section = navForPath(usePathname() ?? "/");

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link href="/" className="brand" prefetch={false}>
          <span className="brand__seal" aria-hidden="true">韩</span>
          <span className="brand__name">
            韩立人生数据库
            <span className="en">Han Li · Life Database · v1.1</span>
          </span>
        </Link>
        <div className="topbar__crumbs">
          <span>{section.no}</span>
          <span style={{ color: "var(--rule-strong)" }}>/</span>
          <span style={{ color: "var(--ink-2)" }}>{section.zh}</span>
          <span style={{ color: "var(--rule-strong)" }}>/</span>
          <span>{section.en}</span>
        </div>
        <div className="topbar__meta">
          <span className="kbd">1324</span> 章
          <span style={{ margin: "0 8px" }}>·</span>
          <span className="kbd">1998</span> 事件
          <span style={{ margin: "0 8px" }}>·</span>
          <span className="kbd">22</span> 境界
        </div>
        <ThemeToggle initialColorMode={initialColorMode} initialFont={initialFont} />
      </div>
    </header>
  );
}
