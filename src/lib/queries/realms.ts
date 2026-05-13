// src/lib/queries/realms.ts - realm aggregations derived from events.
import { getDb } from "../db";
import type { RealmKey, RealmProfile } from "../types";
import { queryEvents } from "./timeline";

const REALM_ORDER: RealmKey[] = [
  "凡人",
  "炼气1",
  "炼气3",
  "炼气4",
  "炼气5",
  "炼气6",
  "炼气7",
  "炼气8",
  "炼气9",
  "炼气11",
  "未知",
  "炼气13",
  "筑基初",
  "筑基中",
  "筑基后",
  "结丹初",
  "结丹中",
  "结丹后",
  "元婴初",
  "元婴中",
  "元婴后",
  "化神",
];

const REALM_SLUGS: Record<string, string> = {
  凡人: "fanren",
  炼气1: "lianqi-1",
  炼气3: "lianqi-3",
  炼气4: "lianqi-4",
  炼气5: "lianqi-5",
  炼气6: "lianqi-6",
  炼气7: "lianqi-7",
  炼气8: "lianqi-8",
  炼气9: "lianqi-9",
  炼气11: "lianqi-11",
  未知: "unknown",
  炼气13: "lianqi-13",
  筑基初: "zhuji-chu",
  筑基中: "zhuji-zhong",
  筑基后: "zhuji-hou",
  结丹初: "jiedan-chu",
  结丹中: "jiedan-zhong",
  结丹后: "jiedan-hou",
  元婴初: "yuanying-chu",
  元婴中: "yuanying-zhong",
  元婴后: "yuanying-hou",
  化神: "huashen",
};

type RealmRow = Omit<
  RealmProfile,
  "chapters" | "startAge" | "endAge" | "avgConfidence"
> & {
  startAge: string | null;
  endAge: string | null;
  avgConfidence: number | null;
};

export function getRealmProfiles(): RealmProfile[] {
  const db = getDb();
  const rows = db.prepare(`
    WITH base AS (
      SELECT
        COALESCE(NULLIF(realm_canonical, ''), '未知') AS realm,
        MIN(chapter_id) AS startChapter,
        MAX(chapter_id) AS endChapter,
        COUNT(*) AS events,
        COUNT(DISTINCT chapter_id) AS eventChapters,
        COUNT(DISTINCT CASE WHEN is_battle = 1 THEN chapter_id END) AS battles,
        COUNT(DISTINCT CASE WHEN is_kill = 1 THEN chapter_id END) AS kills,
        COUNT(DISTINCT CASE WHEN is_flee = 1 THEN chapter_id END) AS flees,
        COUNT(DISTINCT CASE WHEN is_near_death = 1 THEN chapter_id END) AS nearDeaths,
        COUNT(DISTINCT CASE WHEN is_betrayed = 1 THEN chapter_id END) AS betrayals,
        COUNT(DISTINCT CASE WHEN is_treasure = 1 THEN chapter_id END) AS treasures,
        COUNT(DISTINCT CASE WHEN is_secret_realm = 1 THEN chapter_id END) AS secretRealms,
        COUNT(DISTINCT CASE WHEN is_relationship = 1 THEN chapter_id END) AS relationships,
        COUNT(DISTINCT CASE WHEN is_refining = 1 THEN chapter_id END) AS refining,
        COUNT(DISTINCT CASE WHEN is_lifespan_gain = 1 THEN chapter_id END) AS lifespanGains,
        SUM(COALESCE(needs_review, 0)) AS needsReview,
        AVG(confidence_score) AS avgConfidence
      FROM events
      GROUP BY COALESCE(NULLIF(realm_canonical, ''), '未知')
    )
    SELECT
      b.*,
      (
        SELECT e.age_text
        FROM events e
        WHERE COALESCE(NULLIF(e.realm_canonical, ''), '未知') = b.realm
          AND COALESCE(e.age_text, '') <> ''
        ORDER BY e.chapter_id ASC, e.event_id ASC
        LIMIT 1
      ) AS startAge,
      (
        SELECT e.age_text
        FROM events e
        WHERE COALESCE(NULLIF(e.realm_canonical, ''), '未知') = b.realm
          AND COALESCE(e.age_text, '') <> ''
        ORDER BY e.chapter_id DESC, e.event_id DESC
        LIMIT 1
      ) AS endAge
    FROM base b
  `).all() as RealmRow[];

  const idx = (realm: RealmKey) => {
    const i = REALM_ORDER.indexOf(realm);
    return i < 0 ? 999 : i;
  };

  return rows
    .sort((a, b) => idx(a.realm) - idx(b.realm) || a.startChapter - b.startChapter)
    .map((row) => ({
      ...row,
      chapters: row.endChapter - row.startChapter + 1,
      startAge: row.startAge || "未标注",
      endAge: row.endAge || "未标注",
      avgConfidence: Number((row.avgConfidence ?? 0).toFixed(3)),
      needsReview: Number(row.needsReview ?? 0),
    }));
}

export function slugify(realm: RealmKey): string {
  return REALM_SLUGS[realm] ?? encodeURIComponent(realm).replace(/%/g, "~").toLowerCase();
}

export function getRealmBySlug(slug: string) {
  return getRealmProfiles().find((realm) => slugify(realm.realm) === slug) ?? null;
}

export function getRealmEvents(realm: string, limit = 1000) {
  return queryEvents({ realm, limit });
}

export function getAdjacentRealms(realm: RealmProfile) {
  const realms = getRealmProfiles();
  const index = realms.findIndex((item) => item.realm === realm.realm);
  return {
    previous: index > 0 ? realms[index - 1] : null,
    next: index >= 0 && index < realms.length - 1 ? realms[index + 1] : null,
  };
}

export function getRealmStaticParams() {
  return getRealmProfiles().map((realm) => ({ slug: slugify(realm.realm) }));
}
