// src/lib/queries/overview.ts - Home KPI numbers from the real sqlite schema.
import { getDb } from "../db";
import type { EventTypeCount, Overview } from "../types";

type OverviewRow = Omit<Overview, "avgConfidence" | "numberingAnomalies"> & {
  avgConfidence: number | null;
  numberingAnomalies: string | number | null;
};

export function getOverview(): Overview {
  const db = getDb();
  const r = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM chapters) AS chapters,
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(DISTINCT CASE WHEN is_battle = 1 THEN chapter_id END) FROM events) AS battleChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_kill = 1 THEN chapter_id END) FROM events) AS killChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_treasure = 1 THEN chapter_id END) FROM events) AS treasureChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_flee = 1 THEN chapter_id END) FROM events) AS fleeChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_near_death = 1 THEN chapter_id END) FROM events) AS nearDeathChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_betrayed = 1 THEN chapter_id END) FROM events) AS betrayedChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_relationship = 1 THEN chapter_id END) FROM events) AS relationshipChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_relationship = 1 THEN chapter_id END) FROM events) AS socialChapters,
      (SELECT COUNT(DISTINCT CASE WHEN is_secret_realm = 1 THEN chapter_id END) FROM events) AS secretRealmChapters,
      (SELECT AVG(confidence_score) FROM events) AS avgConfidence,
      (SELECT COUNT(*) FROM events WHERE needs_review = 1) AS needsReview,
      (SELECT value FROM meta WHERE key = 'numbering_anomaly_count') AS numberingAnomalies
  `).get() as OverviewRow;

  return {
    ...r,
    avgConfidence: Number((r.avgConfidence ?? 0).toFixed(3)),
    numberingAnomalies: Number(r.numberingAnomalies ?? 0),
  };
}

export function getEventTypeBreakdown(): EventTypeCount[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      event_type AS type,
      COUNT(*) AS count,
      AVG(confidence_score) AS avgConfidence,
      SUM(needs_review) AS needsReview
    FROM events
    GROUP BY event_type
    ORDER BY count DESC
  `).all() as Array<EventTypeCount & { avgConfidence: number | null; needsReview: number | null }>;

  return rows.map((row) => ({
    ...row,
    avgConfidence: Number((row.avgConfidence ?? 0).toFixed(3)),
    needsReview: Number(row.needsReview ?? 0),
  }));
}

export function getMeta(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM meta").all() as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
