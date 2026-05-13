// Field provenance:
// - Direct SQLite fields come from chapters/events/realm_milestones/seclusion_periods.
// - Computed fields are aggregated in query helpers: overview counts, realm profiles,
//   flag arrays, pagination totals, seclusion rollups, and sitemap/event lists.
// - The real schema uses chapter_id/event_type/confidence_score; CODEX_TASKS.md
//   intentionally listed draft names that must not be used in SQL.

export type RealmKey = string;

export type EventType =
  | "treasure"
  | "battle"
  | "relationship"
  | "secret_realm"
  | "seclusion"
  | "injury"
  | "refining"
  | "lifespan"
  | "other";

export type EventFlag =
  | "battle"
  | "kill"
  | "flee"
  | "near_death"
  | "betrayed"
  | "treasure"
  | "secret_realm"
  | "seclusion"
  | "refining"
  | "lifespan"
  | "injury"
  | "relationship";

export interface Overview {
  chapters: number;
  events: number;
  battleChapters: number;
  killChapters: number;
  treasureChapters: number;
  fleeChapters: number;
  nearDeathChapters: number;
  betrayedChapters: number;
  relationshipChapters: number;
  socialChapters: number;
  secretRealmChapters: number;
  avgConfidence: number;
  needsReview: number;
  numberingAnomalies: number;
}

export interface RealmProfile {
  realm: RealmKey;
  startChapter: number;
  endChapter: number;
  chapters: number;
  eventChapters: number;
  startAge: string;
  endAge: string;
  events: number;
  battles: number;
  kills: number;
  flees: number;
  nearDeaths: number;
  betrayals: number;
  treasures: number;
  secretRealms: number;
  relationships: number;
  refining: number;
  lifespanGains: number;
  needsReview: number;
  avgConfidence: number;
}

export interface TimelineEvent {
  id: number;
  ch: number;
  chapterTitle: string;
  realm: RealmKey;
  age: string;
  loc: string;
  type: EventType;
  summary: string;
  flags: EventFlag[];
  conf: number;
  review: boolean;
  treasureName: string;
  newCharacter: string;
  battleTarget: string;
  extractionMethod: string;
}

export interface TimelineQuery {
  type?: EventType | "all";
  flags?: EventFlag[];
  search?: string;
  showReview?: boolean;
  realm?: RealmKey | "all";
  confidence?: "all" | "high" | "mid" | "low" | "review" | string;
  chapter?: number;
  limit?: number;
  offset?: number;
}

export interface TimelineQueryResult {
  events: TimelineEvent[];
  total: number;
  limit: number;
  offset: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SeclusionStats {
  highConfidenceYears: number;
  estimatedYears: number;
  conservativeYears: number;
  periods: number;
  continuationSuspects: number;
  needsReview: number;
  avgConfidence: number;
}

export interface EventTypeCount {
  type: EventType;
  count: number;
  avgConfidence: number;
  needsReview: number;
}

export interface FlagCount {
  flag: EventFlag;
  zh: string;
  rail: "cinnabar" | "gold" | "jade" | "moss" | "ink";
  count: number;
}
