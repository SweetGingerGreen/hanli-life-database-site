// src/components/charts/EventDensityHeatmap.tsx — server component
import type { RealmProfile } from "@/lib/types";
import { railVar } from "@/lib/labels";

const BUCKETS = 20;
const LANES = [
  { key: "battles",       label: "战斗", rail: "cinnabar" },
  { key: "treasures",     label: "宝物", rail: "gold" },
  { key: "relationships", label: "结识", rail: "moss" },
  { key: "secretRealms",  label: "秘境", rail: "jade" },
] as const;

export function EventDensityHeatmap({ realms }: { realms: RealmProfile[] }) {
  function bucketValue(laneKey: keyof RealmProfile, b: number) {
    const start = (b / BUCKETS) * 1324 + 1;
    const end = ((b + 1) / BUCKETS) * 1324;
    let sum = 0;
    for (const r of realms) {
      const overlap = Math.max(0, Math.min(r.endChapter, end) - Math.max(r.startChapter, start));
      const span = r.endChapter - r.startChapter + 1;
      if (overlap > 0 && span > 0) {
        sum += (Number(r[laneKey]) || 0) * (overlap / span);
      }
    }
    return sum;
  }

  const lanes = LANES.map(l => ({
    ...l,
    values: Array.from({ length: BUCKETS }, (_, b) => bucketValue(l.key as keyof RealmProfile, b)),
  }));
  const max = Math.max(...lanes.flatMap(l => l.values), 1);

  function bg(rail: string, v: number) {
    const t = v / max;
    if (t < 0.04) return "var(--rule-faint)";
    return `color-mix(in oklab, ${railVar(rail)} ${Math.min(100, t * 110).toFixed(0)}%, transparent)`;
  }

  return (
    <div>
      <div className="heat">
        {lanes.map(lane => (
          <div key={lane.key} className="heat__row">
            <div className="heat__label" style={{ color: railVar(lane.rail) }}>{lane.label}</div>
            <div className="heat__cells">
              {lane.values.map((v, i) => (
                <div key={i} className="heat__cell"
                     style={{ background: bg(lane.rail, v) }}
                     title={`bucket ${i + 1}: ~${v.toFixed(0)} 事件`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 12, marginTop: 8 }}>
        <div />
        <div style={{ display: "flex", justifyContent: "space-between",
                       fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-faint)" }}>
          <span>ch1</span><span>ch330</span><span>ch660</span><span>ch990</span><span>ch1324</span>
        </div>
      </div>
    </div>
  );
}
