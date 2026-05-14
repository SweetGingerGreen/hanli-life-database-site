import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";
import { getRealmProfiles, slugify } from "@/lib/queries/realms";
import { ageLabel, realmHref, realmLabel } from "@/lib/i18n";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li Realm Profiles · English",
  description: "Cultivation-phase profiles for Han Li, with battle, treasure, secret realm, relationship, and confidence metrics.",
  alternates: {
    canonical: "/en/realms",
    languages: { "zh-CN": "/realms", en: "/en/realms" },
  },
};

export default function EnglishRealmsPage() {
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
        kicker="Realm profiles" en="REALM PROFILES"
        title={`${realms.length} cultivation phases · ${realms.length} dossiers`}
        meta="32 BREAKTHROUGH MARKERS"
      />

      <div className="realm-grid">
        {ordered.map((r, i) => {
          const isSpotlight = i === 0;
          const conf = (r.avgConfidence * 100).toFixed(0);
          return (
            <article key={r.realm} className={`realm-card ${isSpotlight ? "is-spotlight" : ""}`}>
              <div className="realm-card__head">
                <div className="stage-num">phase {String(realms.indexOf(r) + 1).padStart(2, "0")} / {realms.length}</div>
                <Link href={realmHref(slugify(r.realm), "en")} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 className="realm-name">{realmLabel(r.realm, "en")}</h3>
                </Link>
                <div className="range">ch{r.startChapter}–ch{r.endChapter} · {r.chapters} chapters</div>
                <div className="age">{ageLabel(r.startAge, "en")} → {ageLabel(r.endAge, "en")}</div>
              </div>
              <div className="realm-card__stats">
                <div className="rstat"><div className="n cinnabar tnum">{r.battles}</div><div className="l">battle ch.</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.kills}</div><div className="l">kills</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.flees}</div><div className="l">escapes</div></div>
                <div className="rstat"><div className="n cinnabar tnum">{r.nearDeaths}</div><div className="l">near-death</div></div>
                <div className="rstat"><div className="n gold tnum">{r.treasures}</div><div className="l">treasure</div></div>
                <div className="rstat"><div className="n jade tnum">{r.secretRealms}</div><div className="l">secret realms</div></div>
                <div className="rstat"><div className="n moss tnum">{r.relationships}</div><div className="l">social</div></div>
              </div>
              <div className="realm-card__foot">
                <div>Total events <strong style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>{r.events}</strong> · atomic</div>
                <div className="conf">
                  <span>confidence {conf}%</span>
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
