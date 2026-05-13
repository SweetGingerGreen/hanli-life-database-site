// src/lib/queries/timeline.ts - Timeline / Events DB queries.
import { getDb } from "../db";
import type { EventFlag, EventType, FlagCount, TimelineEvent, TimelineQuery, TimelineQueryResult } from "../types";

const EVENT_TYPES: EventType[] = [
  "treasure",
  "battle",
  "relationship",
  "secret_realm",
  "seclusion",
  "injury",
  "refining",
  "lifespan",
  "other",
];

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

type EventRow = {
  id: number;
  ch: number;
  chapterTitle: string;
  realm: string | null;
  age: string | null;
  loc: string | null;
  type: string | null;
  summary: string | null;
  conf: number | null;
  review: number | null;
  isBattle: number | null;
  isKill: number | null;
  isFlee: number | null;
  isInjured: number | null;
  isNearDeath: number | null;
  isSecretRealm: number | null;
  isLifespanGain: number | null;
  isRefining: number | null;
  isBetrayed: number | null;
  isTreasure: number | null;
  isRelationship: number | null;
  treasureName: string | null;
  newCharacter: string | null;
  battleTarget: string | null;
  extractionMethod: string | null;
};

function clampLimit(limit?: number) {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit ?? DEFAULT_LIMIT)));
}

function normalizeEventType(value: string | null | undefined): EventType {
  return EVENT_TYPES.includes(value as EventType) ? (value as EventType) : "other";
}

function yes(value: number | null | undefined) {
  return Number(value ?? 0) === 1;
}

function buildFlags(row: EventRow): EventFlag[] {
  const flags: EventFlag[] = [];
  if (yes(row.isBattle)) flags.push("battle");
  if (yes(row.isKill)) flags.push("kill");
  if (yes(row.isFlee)) flags.push("flee");
  if (yes(row.isNearDeath)) flags.push("near_death");
  if (yes(row.isBetrayed)) flags.push("betrayed");
  if (yes(row.isInjured)) flags.push("injury");
  if (yes(row.isTreasure)) flags.push("treasure");
  if (yes(row.isRefining)) flags.push("refining");
  if (yes(row.isLifespanGain) || row.type === "lifespan") flags.push("lifespan");
  if (yes(row.isSecretRealm)) flags.push("secret_realm");
  if (row.type === "seclusion") flags.push("seclusion");
  if (yes(row.isRelationship)) flags.push("relationship");
  return flags;
}

function toEvent(row: EventRow): TimelineEvent {
  return {
    id: row.id,
    ch: row.ch,
    chapterTitle: row.chapterTitle,
    realm: row.realm || "未知",
    age: row.age || "未标注",
    loc: row.loc || "未标注",
    type: normalizeEventType(row.type),
    summary: row.summary || "无摘要",
    flags: buildFlags(row),
    conf: Number((row.conf ?? 0).toFixed(3)),
    review: yes(row.review),
    treasureName: row.treasureName || "",
    newCharacter: row.newCharacter || "",
    battleTarget: row.battleTarget || "",
    extractionMethod: row.extractionMethod || "",
  };
}

function buildWhere(q: TimelineQuery, params: Record<string, unknown>) {
  const where: string[] = [];

  if (q.type && q.type !== "all") {
    where.push("e.event_type = @type");
    params.type = q.type;
  }
  if (q.realm && q.realm !== "all") {
    where.push("e.realm_canonical = @realm");
    params.realm = q.realm;
  }
  if (Number.isFinite(q.chapter) && Number(q.chapter) > 0) {
    where.push("e.chapter_id = @chapter");
    params.chapter = Math.floor(Number(q.chapter));
  }
  if (q.showReview === false) {
    where.push("COALESCE(e.needs_review, 0) = 0");
  }
  if (q.confidence === "high") {
    where.push("COALESCE(e.confidence_score, 0) >= 0.85");
  } else if (q.confidence === "mid") {
    where.push("COALESCE(e.confidence_score, 0) >= 0.65 AND COALESCE(e.confidence_score, 0) < 0.85");
  } else if (q.confidence === "low") {
    where.push("COALESCE(e.confidence_score, 0) < 0.65");
  } else if (q.confidence === "review") {
    where.push("COALESCE(e.needs_review, 0) = 1");
  }
  if (q.search?.trim()) {
    where.push(`(
      e.raw_text LIKE @search OR
      e.location LIKE @search OR
      e.realm_canonical LIKE @search OR
      e.age_text LIKE @search OR
      e.treasure_name LIKE @search OR
      e.new_character LIKE @search OR
      e.battle_target LIKE @search OR
      c.chapter_title LIKE @search OR
      CAST(e.chapter_id AS TEXT) LIKE @search
    )`);
    params.search = `%${q.search.trim()}%`;
  }
  if (q.flags && q.flags.length > 0) {
    for (const flag of q.flags) {
      if (flag === "battle") where.push("COALESCE(e.is_battle, 0) = 1");
      else if (flag === "kill") where.push("COALESCE(e.is_kill, 0) = 1");
      else if (flag === "flee") where.push("COALESCE(e.is_flee, 0) = 1");
      else if (flag === "near_death") where.push("COALESCE(e.is_near_death, 0) = 1");
      else if (flag === "betrayed") where.push("COALESCE(e.is_betrayed, 0) = 1");
      else if (flag === "treasure") where.push("COALESCE(e.is_treasure, 0) = 1");
      else if (flag === "secret_realm") where.push("COALESCE(e.is_secret_realm, 0) = 1");
      else if (flag === "seclusion") where.push("e.event_type = 'seclusion'");
      else if (flag === "refining") where.push("COALESCE(e.is_refining, 0) = 1");
      else if (flag === "lifespan") where.push("COALESCE(e.is_lifespan_gain, 0) = 1");
      else if (flag === "injury") where.push("COALESCE(e.is_injured, 0) = 1");
      else if (flag === "relationship") where.push("COALESCE(e.is_relationship, 0) = 1");
    }
  }

  return where.length ? `WHERE ${where.join(" AND ")}` : "";
}

function selectSql(whereSql: string) {
  return `
    SELECT
      e.event_id AS id,
      e.chapter_id AS ch,
      c.chapter_title AS chapterTitle,
      e.realm_canonical AS realm,
      e.age_text AS age,
      e.location AS loc,
      e.event_type AS type,
      e.raw_text AS summary,
      e.confidence_score AS conf,
      e.needs_review AS review,
      e.is_battle AS isBattle,
      e.is_kill AS isKill,
      e.is_flee AS isFlee,
      e.is_injured AS isInjured,
      e.is_near_death AS isNearDeath,
      e.is_secret_realm AS isSecretRealm,
      e.is_lifespan_gain AS isLifespanGain,
      e.is_refining AS isRefining,
      e.is_betrayed AS isBetrayed,
      e.is_treasure AS isTreasure,
      e.is_relationship AS isRelationship,
      e.treasure_name AS treasureName,
      e.new_character AS newCharacter,
      e.battle_target AS battleTarget,
      e.extraction_method AS extractionMethod
    FROM events e
    JOIN chapters c ON c.chapter_id = e.chapter_id
    ${whereSql}
  `;
}

export function queryEvents(q: TimelineQuery = {}): TimelineEvent[] {
  return queryEventsWithTotal(q).events;
}

export function queryEventsWithTotal(q: TimelineQuery = {}): TimelineQueryResult {
  const db = getDb();
  const params: Record<string, unknown> = {};
  const whereSql = buildWhere(q, params);
  const limit = clampLimit(q.limit);
  const offset = Math.max(0, Math.floor(q.offset ?? 0));

  const totalRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM events e
    JOIN chapters c ON c.chapter_id = e.chapter_id
    ${whereSql}
  `).get(params) as { total: number };

  const rows = db.prepare(`
    ${selectSql(whereSql)}
    ORDER BY e.chapter_id ASC, e.event_id ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset }) as EventRow[];

  return {
    events: rows.map(toEvent),
    total: Number(totalRow.total ?? 0),
    limit,
    offset,
    hasPrevious: offset > 0,
    hasNext: offset + limit < Number(totalRow.total ?? 0),
  };
}

export function getEventById(id: number): TimelineEvent | null {
  const db = getDb();
  const row = db.prepare(`
    ${selectSql("WHERE e.event_id = @id")}
    LIMIT 1
  `).get({ id }) as EventRow | undefined;
  return row ? toEvent(row) : null;
}

export function getChapterEvents(chapterId: number): TimelineEvent[] {
  return queryEvents({ chapter: chapterId, limit: 1000 });
}

export function getEventTypes(): EventType[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT event_type AS type
    FROM events
    GROUP BY event_type
    ORDER BY COUNT(*) DESC
  `).all() as Array<{ type: string }>;
  return rows.map((row) => normalizeEventType(row.type));
}

export function getRealms(): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT realm_canonical AS realm, MIN(chapter_id) AS firstChapter
    FROM events
    WHERE realm_canonical IS NOT NULL AND realm_canonical <> ''
    GROUP BY realm_canonical
    ORDER BY firstChapter ASC
  `).all() as Array<{ realm: string }>;
  return rows.map((row) => row.realm);
}

export function getAllEventIds(): number[] {
  const db = getDb();
  const rows = db.prepare("SELECT event_id AS id FROM events ORDER BY event_id ASC").all() as Array<{ id: number }>;
  return rows.map((row) => row.id);
}

/** Counts for filter chips. */
export function getFlagCounts(): FlagCount[] {
  const db = getDb();
  const r = db.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN is_battle = 1 THEN chapter_id END) AS battle,
      COUNT(DISTINCT CASE WHEN is_kill = 1 THEN chapter_id END) AS kill,
      COUNT(DISTINCT CASE WHEN is_flee = 1 THEN chapter_id END) AS flee,
      COUNT(DISTINCT CASE WHEN is_near_death = 1 THEN chapter_id END) AS near_death,
      COUNT(DISTINCT CASE WHEN is_betrayed = 1 THEN chapter_id END) AS betrayed,
      COUNT(DISTINCT CASE WHEN is_injured = 1 THEN chapter_id END) AS injury,
      COUNT(DISTINCT CASE WHEN is_treasure = 1 THEN chapter_id END) AS treasure,
      COUNT(DISTINCT CASE WHEN is_refining = 1 THEN chapter_id END) AS refining,
      COUNT(DISTINCT CASE WHEN is_lifespan_gain = 1 THEN chapter_id END) AS lifespan,
      COUNT(DISTINCT CASE WHEN is_secret_realm = 1 THEN chapter_id END) AS secret_realm,
      COUNT(DISTINCT CASE WHEN is_relationship = 1 THEN chapter_id END) AS relationship,
      COUNT(DISTINCT CASE WHEN event_type = 'seclusion' THEN chapter_id END) AS seclusion
    FROM events
  `).get() as Record<EventFlag, number>;

  const labels: Array<{ flag: EventFlag; zh: string; rail: FlagCount["rail"] }> = [
    { flag: "battle", zh: "战斗", rail: "cinnabar" },
    { flag: "kill", zh: "击杀", rail: "cinnabar" },
    { flag: "flee", zh: "跑路", rail: "cinnabar" },
    { flag: "near_death", zh: "濒死", rail: "cinnabar" },
    { flag: "betrayed", zh: "被骗", rail: "cinnabar" },
    { flag: "injury", zh: "受伤", rail: "cinnabar" },
    { flag: "treasure", zh: "得宝", rail: "gold" },
    { flag: "refining", zh: "炼丹", rail: "gold" },
    { flag: "lifespan", zh: "寿元", rail: "gold" },
    { flag: "secret_realm", zh: "秘境", rail: "jade" },
    { flag: "relationship", zh: "结识", rail: "moss" },
    { flag: "seclusion", zh: "闭关", rail: "ink" },
  ];
  return labels.map((label) => ({ ...label, count: Number(r[label.flag] ?? 0) }));
}
