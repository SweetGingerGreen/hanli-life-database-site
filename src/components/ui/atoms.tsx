// src/components/ui/atoms.tsx — shared atoms (server-safe, no state)

import type { EventType, EventFlag } from "@/lib/types";
import { TYPE_META, railVar } from "@/lib/labels";

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

export function EventTypeTag({ type }: { type: EventType }) {
  const m = TYPE_META[type] ?? TYPE_META.other;
  return (
    <span className={`event-tag ${type}`}>
      <span className="glyph" />
      {m.zh}
    </span>
  );
}

export function ConfPill({ conf, review }: { conf: number; review?: boolean }) {
  let level: "high" | "mid" | "low" = "high";
  let label = "高置信";
  if (conf < 0.6)       { level = "low";  label = "估算"; }
  else if (conf < 0.75) { level = "mid";  label = "中等"; }
  if (review) { level = "low"; label = "待复核"; }
  return (
    <span className={`pill ${level}`}>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{conf.toFixed(2)}</span>
      <span style={{ opacity: 0.8 }}>{label}</span>
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

export function FlagChipLabel({ flag }: { flag: EventFlag }) {
  const map: Record<EventFlag, [string, string]> = {
    battle: ["战", "cinnabar"], kill: ["杀", "cinnabar"], flee: ["逃", "cinnabar"],
    near_death: ["危", "cinnabar"], betrayed: ["叛", "cinnabar"], injury: ["伤", "cinnabar"],
    treasure: ["宝", "gold"], refining: ["丹", "gold"], lifespan: ["寿", "gold"],
    secret_realm: ["秘", "jade"], seclusion: ["闭", "ink"], relationship: ["友", "moss"],
  };
  const [zh, rail] = map[flag] ?? [flag, "ink"];
  return <span className={`chip ${rail}`} style={{ padding: "2px 6px" }}>{zh}</span>;
}

export function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}
export function rangeStr(a: number, b: number): string {
  return `ch${a}–ch${b}`;
}
