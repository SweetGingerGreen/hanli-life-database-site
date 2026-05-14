// src/components/ui/atoms.tsx — shared atoms (server-safe, no state)

import type { EventType, EventFlag } from "@/lib/types";
import { TYPE_META, railVar } from "@/lib/labels";
import { FLAG_LABELS, eventTypeLabel, label, type Locale } from "@/lib/i18n";

export function Eyebrow({ zh, en, rail }: { zh?: string; en?: string; rail?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {zh && (
        <span className={rail ? `eyebrow ${rail}` : "eyebrow"}
              style={{ fontFamily: "var(--font-display)", letterSpacing: 0, textTransform: "none", fontSize: 12, fontWeight: 700 }}>
          {zh}
        </span>
      )}
      {en && <span className={`eyebrow is-en ${rail ?? ""}`}>{en}</span>}
    </div>
  );
}

export function SectionHeader({
  kicker, title, en, meta, rail,
}: { kicker?: string; title: string; en?: string; meta?: string; rail?: string }) {
  return (
    <div className="section-bar">
      <div>
        {kicker && (
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span className={`eyebrow ${rail ?? ""}`}>{kicker}</span>
            {en && <span className="eyebrow is-en">{en}</span>}
          </div>
        )}
        <h2>{title}</h2>
      </div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

export function EventTypeTag({ type, locale = "zh" }: { type: EventType; locale?: Locale }) {
  const rail = (TYPE_META[type] ?? TYPE_META.other).rail;
  return (
    <span className={`event-tag ${type}`} data-rail={rail}>
      <span className="glyph" />
      {eventTypeLabel(type, locale)}
    </span>
  );
}

export function ConfPill({ conf, review, locale = "zh" }: { conf: number; review?: boolean; locale?: Locale }) {
  let level: "high" | "mid" | "low" = "high";
  let text = label(locale, "高置信", "high");
  if (conf < 0.6)       { level = "low";  text = label(locale, "估算", "estimated"); }
  else if (conf < 0.75) { level = "mid";  text = label(locale, "中等", "medium"); }
  if (review) { level = "low"; text = label(locale, "待复核", "review"); }
  return (
    <span className={`pill ${level}`}>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{conf.toFixed(2)}</span>
      <span style={{ opacity: 0.8 }}>{text}</span>
    </span>
  );
}

export function Dot({ rail = "ink" }: { rail?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: 6, height: 6, borderRadius: "50%", background: railVar(rail), display: "inline-block" }}
    />
  );
}

export function FlagChipLabel({ flag, locale = "zh" }: { flag: EventFlag; locale?: Locale }) {
  const meta = FLAG_LABELS[flag] ?? { shortZh: flag, shortEn: flag, rail: "ink" };
  return (
    <span className={`chip ${meta.rail}`} style={{ padding: "2px 6px" }}>
      {locale === "en" ? meta.shortEn : meta.shortZh}
    </span>
  );
}

export function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}
export function rangeStr(a: number, b: number): string {
  return `ch${a}–ch${b}`;
}
