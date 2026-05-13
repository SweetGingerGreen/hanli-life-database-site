// src/components/chrome/SideRail.tsx — client component (needs usePathname)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";

export function SideRail() {
  const pathname = usePathname();
  return (
    <nav className="siderail">
      <div className="siderail__head">
        <div>导航</div>
        <div>NAV</div>
      </div>
      <ul className="siderail__list">
        {NAV.map(n => {
          const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
          return (
            <li key={n.href}>
              <Link className={`siderail__link ${active ? "is-active" : ""}`} href={n.href}>
                <span className="no">{n.no}</span>
                <span className="zh">{n.zh}</span>
                <span className="en">{n.en}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="siderail__foot">
        <div><span>schema</span><span className="v">v1.1</span></div>
        <div><span>updated</span><span className="v">2026·05·08</span></div>
        <div><span>numbering</span><span className="v">219 anomalies</span></div>
        <div><span>license</span><span className="v">非商用引用</span></div>
      </div>
    </nav>
  );
}
