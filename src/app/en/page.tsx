import type { Metadata } from "next";
import Link from "next/link";
import { getOverview, getEventTypeBreakdown } from "@/lib/queries/overview";
import { getRealmProfiles } from "@/lib/queries/realms";
import { getSeclusionStats } from "@/lib/queries/seclusion";
import { SectionHeader } from "@/components/ui/atoms";
import { RealmProgression } from "@/components/charts/RealmProgression";
import { EventTypeRanked } from "@/components/charts/EventTypeRanked";
import { EventDensityHeatmap } from "@/components/charts/EventDensityHeatmap";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li Life Database · English",
  description: "A structured English guide to Han Li's cultivation timeline, events, realms, treasures, and data methodology.",
  alternates: {
    canonical: "/en",
    languages: {
      "zh-CN": "/",
      en: "/en",
    },
  },
};

export default async function EnglishHome() {
  const o = getOverview();
  const realms = getRealmProfiles();
  const eventTypes = getEventTypeBreakdown();
  const s = getSeclusionStats();

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__head">
          <div>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <span className="eyebrow">Structured fan database</span>
              <span className="eyebrow is-en">Han Li · Life Database · v1.1</span>
            </div>
            <h1 className="hero__title">
              What did Han Li do<br />
              across <em>{o.chapters} chapters</em>?
            </h1>
          </div>
          <div className="hero__lede">
            <p>
              A chapter-level, structured database for <strong>A Record of a Mortal&apos;s Journey to Immortality</strong>.
              This is not a novel reader. It is an analytical index of Han Li&apos;s cultivation life:
              <strong> battles, escapes, treasures, realms, relationships, and years spent in seclusion.</strong>
            </p>
            <p style={{ marginTop: 12, color: "var(--ink-faint)", fontSize: 12 }}>
              Method: chapter-level statistics · confidence-first extraction · estimated durations marked separately · {o.needsReview} review items kept visible.
            </p>
          </div>
        </div>

        <div className="kpiwall">
          <div className="kpiwall__cell">
            <div className="num tnum">{o.chapters}</div>
            <div className="label">Chapter records</div>
            <div className="en">SOURCE ROWS</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--cinnabar tnum">{o.battleChapters}</div>
            <div className="label">Battle chapters</div>
            <div className="en">BATTLE CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--cinnabar tnum">{o.killChapters}</div>
            <div className="label">Confirmed kill chapters</div>
            <div className="en">KILL CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--gold tnum">{o.treasureChapters}</div>
            <div className="label">Treasure chapters</div>
            <div className="en">TREASURE CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num tnum">{s.estimatedYears.toFixed(0)}<span className="unit">yr</span></div>
            <div className="label">Estimated seclusion</div>
            <div className="en">SECLUSION YR</div>
          </div>
        </div>

        <div className="sub-strip">
          <div><div className="n tnum">{s.highConfidenceYears.toFixed(1)}</div><div className="l">Seclusion · high-confidence years</div></div>
          <div><div className="n tnum">{s.estimatedYears.toFixed(0)}</div><div className="l">Seclusion · estimated years</div></div>
          <div><div className="n tnum">{s.conservativeYears.toFixed(0)}</div><div className="l">Seclusion · conservative ledger</div></div>
          <div><div className="n tnum">{o.events}</div><div className="l">Atomic events</div></div>
        </div>
      </section>

      <SectionHeader
        kicker="Life overview" en="THREE-CHART OVERVIEW"
        title="Realm progression / event distribution / density"
        meta="REALM × EVENT × DENSITY"
      />

      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card__head">
          <div>
            <span className="eyebrow">Realm progression</span>
            <h3 className="chart-card__title">From age 10 to 900+ in one curve</h3>
            <div className="chart-card__sub" style={{ marginTop: 6 }}>
              X-axis is chapter number; Y-axis is cultivation realm; cinnabar markers indicate major breakthroughs.
            </div>
          </div>
          <span className="chip ink">{realms.length} phases</span>
        </div>
        <RealmProgression realms={realms} locale="en" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <span className="eyebrow cinnabar">Event-density heatmap</span>
              <h3 className="chart-card__title">When was Han Li busiest?</h3>
              <div className="chart-card__sub" style={{ marginTop: 6 }}>
                Aggregated by chapter bucket. Darker cells mean denser event activity.
              </div>
            </div>
          </div>
          <EventDensityHeatmap realms={realms} locale="en" />
        </div>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <span className="eyebrow gold">Event type ranking</span>
              <h3 className="chart-card__title">What does Han Li actually do?</h3>
              <div className="chart-card__sub" style={{ marginTop: 6 }}>
                Counts are based on atomic event extraction and include estimated records.
              </div>
            </div>
          </div>
          <EventTypeRanked items={eventTypes} locale="en" />
        </div>
      </div>

      <SectionHeader kicker="Start here" en="ENTRY POINTS" title="Explore the database" />
      <div className="entries">
        <Link className="entry" href="/en/timeline">
          <span className="eyebrow">Life timeline</span>
          <div className="num tnum">{o.chapters}</div>
          <div className="h">Browse by chapter</div>
          <div className="d">A structured event stream with filters for battles, treasures, danger, maps, relationships, and review state.</div>
          <div className="go">Open timeline</div>
        </Link>
        <Link className="entry cinnabar" href="/en/realms">
          <span className="eyebrow cinnabar">Realm profiles</span>
          <div className="num num--cinnabar tnum">{realms.length}</div>
          <div className="h">Read by cultivation phase</div>
          <div className="d">Each realm profile aggregates battles, kills, escapes, treasures, secret realms, relationships, and confidence.</div>
          <div className="go">Open realms</div>
        </Link>
        <Link className="entry jade" href="/en/events">
          <span className="eyebrow jade">Events database</span>
          <div className="num num--gold tnum">{o.events}</div>
          <div className="h">Search atomic records</div>
          <div className="d">Trace individual records back to chapter number, realm, event type, linked fields, and extraction quality.</div>
          <div className="go">Open events</div>
        </Link>
      </div>

      <div className="note" style={{ marginTop: 32 }}>
        <div className="h">About this database</div>
        The event table is generated from structured extraction over a local source text and contains <strong>{o.events}</strong> atomic events.
        It exposes summaries, metadata, confidence, and methodology, but does not publish the original chapter text.
        See <Link href="/en/methodology" style={{ borderBottom: "1px solid currentColor" }}>methodology</Link> and <Link href="/en/privacy" style={{ borderBottom: "1px solid currentColor" }}>privacy & ads</Link>.
      </div>
    </div>
  );
}
