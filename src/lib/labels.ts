// src/lib/labels.ts — shared zh labels for event types
import type { EventType } from "./types";

export const TYPE_META: Record<EventType, { zh: string; rail: "cinnabar"|"gold"|"jade"|"moss"|"ink" }> = {
  battle:       { zh: "战斗",     rail: "cinnabar" },
  injury:       { zh: "受伤",     rail: "cinnabar" },
  relationship: { zh: "结识",     rail: "moss" },
  treasure:     { zh: "宝物",     rail: "gold" },
  secret_realm: { zh: "秘境",     rail: "jade" },
  seclusion:    { zh: "闭关",     rail: "ink" },
  refining:     { zh: "炼丹",     rail: "gold" },
  lifespan:     { zh: "寿元",     rail: "gold" },
  other:        { zh: "其他",     rail: "ink" },
};

export function railVar(rail: string): string {
  switch (rail) {
    case "gold":     return "var(--gold)";
    case "cinnabar": return "var(--cinnabar)";
    case "jade":     return "var(--jade)";
    case "moss":     return "var(--moss)";
    default:         return "var(--ink-faint)";
  }
}
