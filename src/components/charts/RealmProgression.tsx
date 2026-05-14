// src/components/charts/RealmProgression.tsx — server component, SVG
import type { RealmProfile } from "@/lib/types";
import { realmLabel, type Locale } from "@/lib/i18n";

const TIER_MAP: Record<string, number> = {
  "凡人": 0,
  "炼气1": 1.05, "炼气3": 1.15, "炼气4": 1.2, "炼气5": 1.28,
  "炼气6": 1.36, "炼气7": 1.44, "炼气8": 1.52, "炼气9": 1.6,
  "炼气11": 1.76, "炼气13": 1.95, "未知": 1.7,
  "筑基初": 2, "筑基中": 2.3, "筑基后": 2.6,
  "结丹初": 3, "结丹中": 3.3, "结丹后": 3.6,
  "元婴初": 4, "元婴中": 4.3, "元婴后": 4.6,
  "化神": 5,
};
const TIER_LABELS = ["凡人", "炼气", "筑基", "结丹", "元婴", "化神"];
const TIER_LABELS_EN = ["Mortal", "Qi", "Foundation", "Core", "Soul", "Deity"];

const BREAKTHROUGHS = [
  { ch: 216, label: "筑基" },
  { ch: 398, label: "结丹" },
  { ch: 636, label: "元婴" },
  { ch: 1252, label: "化神" },
];

export function RealmProgression({ realms, locale = "zh" }: { realms: RealmProfile[]; locale?: Locale }) {
  const W = 900, H = 280;
  const pad = { l: 48, r: 24, t: 12, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxCh = 1324, maxTier = 5;

  const pts = realms.map(r => ({
    x: (r.startChapter / maxCh) * innerW + pad.l,
    x2: (r.endChapter / maxCh) * innerW + pad.l,
    y: H - pad.b - ((TIER_MAP[r.realm] ?? 0) / maxTier) * innerH,
  }));

  let d = "";
  pts.forEach((p, i) => {
    d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    d += `L ${p.x2.toFixed(1)} ${p.y.toFixed(1)} `;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
         style={{ width: "100%", height: "auto", display: "block" }}>
      {TIER_LABELS.map((tier, i) => {
        const y = H - pad.b - (i / maxTier) * innerH;
        const tierLabel = locale === "en" ? TIER_LABELS_EN[i] : tier;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--rule)" strokeDasharray="2 3" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11"
                  fontFamily="var(--font-display)" fill="var(--ink-faint)" fontWeight="700">{tierLabel}</text>
          </g>
        );
      })}
      {[0, 250, 500, 750, 1000, 1250].map(c => {
        const x = (c / maxCh) * innerW + pad.l;
        return (
          <g key={c}>
            <line x1={x} x2={x} y1={H - pad.b} y2={H - pad.b + 4} stroke="var(--rule-strong)" />
            <text x={x} y={H - pad.b + 18} textAnchor="middle" fontSize="10"
                  fontFamily="var(--font-mono)" fill="var(--ink-faint)">ch{c || 1}</text>
          </g>
        );
      })}
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="var(--rule-strong)" />
      <path d={d} stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {BREAKTHROUGHS.map((m, i) => {
        const x = (m.ch / maxCh) * innerW + pad.l;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={pad.t + 4} y2={H - pad.b - 4}
                  stroke="var(--cinnabar)" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
            <text x={x + 4} y={pad.t + 14} fontSize="11" fontFamily="var(--font-display)"
                  fontWeight="900" fill="var(--cinnabar)">{realmLabel(m.label, locale)}</text>
            <text x={x + 4} y={pad.t + 26} fontSize="9" fontFamily="var(--font-mono)"
                  fill="var(--cinnabar-deep)">ch{m.ch}</text>
          </g>
        );
      })}
    </svg>
  );
}
