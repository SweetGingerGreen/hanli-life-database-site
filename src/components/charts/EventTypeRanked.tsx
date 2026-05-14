// src/components/charts/EventTypeRanked.tsx — server component
import type { EventTypeCount, EventType } from "@/lib/types";
import { TYPE_META, railVar } from "@/lib/labels";
import { eventTypeLabel, type Locale } from "@/lib/i18n";

export function EventTypeRanked({ items, locale = "zh" }: { items: EventTypeCount[]; locale?: Locale }) {
  const visible = items.filter(t => t.count > 5);
  const max = Math.max(...visible.map(t => t.count), 1);
  return (
    <div className="types-list">
      {visible.map(t => {
        const meta = TYPE_META[t.type as EventType] ?? TYPE_META.other;
        const w = (t.count / max) * 100;
        return (
          <div key={t.type} className="type-row">
            <div className="label">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%",
                                background: railVar(meta.rail), display: "inline-block" }} />
                {eventTypeLabel(t.type as EventType, locale)}
              </span>
            </div>
            <div className="bar"><div style={{ width: `${w}%`, background: railVar(meta.rail) }} /></div>
            <div className="n tnum">{t.count}</div>
            <div className="conf">{t.avgConfidence.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}
