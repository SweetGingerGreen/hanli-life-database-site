import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/atoms";
import { getOverview } from "@/lib/queries/overview";
import { getSeclusionStats } from "@/lib/queries/seclusion";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Methodology · Han Li Life Database",
  description: "How the Han Li Life Database counts chapters, atomic events, confidence, seclusion duration, and review records.",
  alternates: {
    canonical: "/en/methodology",
    languages: { "zh-CN": "/methodology", en: "/en/methodology" },
  },
};

export default function EnglishMethodologyPage() {
  const overview = getOverview();
  const seclusion = getSeclusionStats();
  const highRate = Math.round((seclusion.highConfidenceYears / seclusion.estimatedYears) * 100);
  const conservativeRate = Math.round((seclusion.conservativeYears / seclusion.estimatedYears) * 100);

  return (
    <div className="page">
      <SectionHeader
        kicker="Methodology"
        en="METHODOLOGY"
        title="Not a novel reader, but a traceable life ledger"
        meta="SCHEMA v1.1"
      />

      <div className="methodology-grid">
        <div>
          <section className="mt-section">
            <h3>Three counting layers</h3>
            <div className="sub">CHAPTER · EVENT · SECLUSION</div>
            <p>
              Homepage metrics use chapter-level counting: if multiple fights happen in one chapter, that still counts as one battle chapter.
              The events database uses atomic event records, which is better for tracing people, treasures, places, and extraction confidence.
            </p>
            <div className="code-block">
              <span className="k">chapters</span> = <span className="v">{overview.chapters}</span> <span className="c"># source rows</span><br />
              <span className="k">events</span> = <span className="v">{overview.events}</span> <span className="c"># atomic events</span><br />
              <span className="k">numbering_anomaly_count</span> = <span className="v">{overview.numberingAnomalies}</span><br />
              <span className="k">needs_review</span> = <span className="v">{overview.needsReview}</span>
            </div>
          </section>

          <section className="mt-section">
            <h3>Why seclusion has three numbers</h3>
            <div className="sub">HIGH CONFIDENCE · ESTIMATED · CONSERVATIVE</div>
            <p>
              The source often describes time with phrases such as &quot;several years&quot; or &quot;after some months&quot;.
              To avoid false precision, this site keeps three ledgers: high-confidence years, full estimated years, and a conservative total that removes likely continuation duplicates.
            </p>
            <div className="quality-bars">
              <div className="row">
                <span>High</span>
                <div className="b high"><div style={{ width: `${highRate}%` }} /></div>
                <strong>{seclusion.highConfidenceYears.toFixed(1)} yr</strong>
              </div>
              <div className="row">
                <span>Estimated</span>
                <div className="b mid"><div style={{ width: "100%" }} /></div>
                <strong>{seclusion.estimatedYears.toFixed(1)} yr</strong>
              </div>
              <div className="row">
                <span>Conservative</span>
                <div className="b low"><div style={{ width: `${conservativeRate}%` }} /></div>
                <strong>{seclusion.conservativeYears.toFixed(1)} yr</strong>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <section className="mt-section qa-list">
            <div className="qa-item">
              <div className="q">Why not show the original text?</div>
              <div className="a">The site presents structured fields and extracted summaries only. It is an index and analysis layer, not a replacement for the novel.</div>
            </div>
            <div className="qa-item">
              <div className="q">How are review records handled?</div>
              <div className="a">They remain visible. Low-confidence and needs-review records are marked so the statistics do not look more certain than the data really is.</div>
            </div>
            <div className="qa-item">
              <div className="q">Why are there {overview.events} events instead of a small fixed realm list?</div>
              <div className="a">The real data includes detailed Qi Condensation stages, unknown spans, and temporary state shifts, so the site follows the database rather than forcing a simplified taxonomy.</div>
            </div>
          </section>

          <section className="note">
            <div className="h">Quality snapshot</div>
            Average confidence <strong>{overview.avgConfidence.toFixed(3)}</strong>.
            Needs review <strong>{overview.needsReview}</strong>.
            Seclusion continuation suspects <strong>{seclusion.continuationSuspects}</strong>.
          </section>
        </aside>
      </div>
    </div>
  );
}
