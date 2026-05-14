// src/lib/labels.ts — shared color rails
export { TYPE_LABELS as TYPE_META } from "./i18n";

export function railVar(rail: string): string {
  switch (rail) {
    case "gold":     return "var(--gold)";
    case "cinnabar": return "var(--cinnabar)";
    case "jade":     return "var(--jade)";
    case "moss":     return "var(--moss)";
    default:         return "var(--ink-faint)";
  }
}
