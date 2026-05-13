// src/lib/queries/seclusion.ts - three counting modes for 闭关.
import { getDb } from "../db";
import type { SeclusionStats } from "../types";

type SeclusionRow = {
  highConfidenceYears: number | null;
  estimatedYears: number | null;
  conservativeYears: number | null;
  periods: number | null;
  continuationSuspects: number | null;
  needsReview: number | null;
  avgConfidence: number | null;
};

export function getSeclusionStats(): SeclusionStats {
  const db = getDb();
  const r = db.prepare(`
    SELECT
      SUM(CASE WHEN duration_confidence >= 0.85 THEN COALESCE(duration_years, 0) ELSE 0 END) AS highConfidenceYears,
      SUM(COALESCE(duration_years, 0)) AS estimatedYears,
      SUM(CASE WHEN is_continuation_suspect = 0 THEN COALESCE(duration_years, 0) ELSE 0 END) AS conservativeYears,
      COUNT(*) AS periods,
      SUM(COALESCE(is_continuation_suspect, 0)) AS continuationSuspects,
      SUM(COALESCE(needs_review, 0)) AS needsReview,
      AVG(duration_confidence) AS avgConfidence
    FROM seclusion_periods
  `).get() as SeclusionRow;

  return {
    highConfidenceYears: Number((r.highConfidenceYears ?? 0).toFixed(1)),
    estimatedYears: Number((r.estimatedYears ?? 0).toFixed(1)),
    conservativeYears: Number((r.conservativeYears ?? 0).toFixed(1)),
    periods: Number(r.periods ?? 0),
    continuationSuspects: Number(r.continuationSuspects ?? 0),
    needsReview: Number(r.needsReview ?? 0),
    avgConfidence: Number((r.avgConfidence ?? 0).toFixed(3)),
  };
}
