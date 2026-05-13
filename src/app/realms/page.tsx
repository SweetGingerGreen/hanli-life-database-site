// src/app/realms/page.tsx — 14 realm profile cards
import { getRealmProfiles, slugify } from "@/lib/queries/realms";
import { SectionHeader } from "@/components/ui/atoms";
import Link from "next/link";

export const revalidate = 604800;

export default function RealmsPage() {
  const realms = getRealmProfiles();
  const spotlight = "结丹初";

  const ordered = (() => {
    const i = realms.findIndex(r => r.realm === spotlight);
    if (i < 0) return realms;
    return [realms[i], ...realms.slice(0, i), ...realms.slice(i + 1)];
  })();

  return (
    <div className="page">
      <SectionHeader
        kicker="境界档案" en="REALM PROFILES"
        title={`${realms.length} 段修为 · ${realms.length} 张档案`}
        meta="32 BREAKTHROUGH MARKERS"
      />

      <div className="realm-grid">
        {ordered.map((r, i) => {
          const isSpotlight = i === 0;
          const conf = (r.avgConfidence * 100).toFixed(0);
          return (
            <article key={r.realm} className={`realm-card ${isSpotlight ? "is-spotlight" : ""}`}>
              <div className="realm-card__head">
                <div className="stage-num">阶段 {String(realms.indexOf(r) + 1).padStart(2, "0")} / {realms.length}</div>
                <Link href={`/realms/${slugify(r.realm)}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 className="realm-name">{r.realm}</h3>
                </Link>
                <div className="range">ch{r.startChapter}–ch{r.endChapter} · {r.chapters} 章</div>
                <div className="age">{r.startAge} → {r.endAge}</div>
              </div>
              <div className="realm-card__stats">
                <div className="rstat"><div className="n cinnabar tnum">{r.battles}</div><div className="l">战斗章节</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.kills}</div><div className="l">明确击杀</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.flees}</div><div className="l">跑路</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.nearDeaths}</div><div className="l">濒死</div></div>
                <div className="rstat"><div className="n gold tnum">{r.treasures}</div><div className="l">得宝</div></div>
                <div className="rstat"><div className="n jade tnum">{r.secretRealms}</div><div className="l">秘境</div></div>
                <div className="rstat"><div className="n moss tnum">{r.relationships}</div><div className="l">结识</div></div>
              </div>
              <div className="realm-card__foot">
                <div>事件总数 <strong style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>{r.events}</strong> · 原子级</div>
                <div className="conf">
                  <span>置信度 {conf}%</span>
                  <span className="bar"><div style={{ width: `${conf}%` }} /></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
