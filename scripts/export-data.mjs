import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_PATH)
  : existsSync(path.resolve(projectRoot, "data/han-li.sqlite"))
    ? path.resolve(projectRoot, "data/han-li.sqlite")
    : path.resolve(projectRoot, "../data/han-li.sqlite");
const outputPath = path.resolve(projectRoot, "src/data/site-data.json");
const publicEventsPath = path.resolve(projectRoot, "public/data/events.json");

function query(sql) {
  const output = execFileSync("sqlite3", ["-json", dbPath, sql], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 24,
  }).trim();
  return output ? JSON.parse(output) : [];
}

function one(sql) {
  return query(sql)[0] ?? {};
}

function splitTreasureName(name) {
  const raw = String(name || "").trim();
  if (!raw || raw === "无") return [];

  return raw
    .split(/[\/+＋、，,；;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^和/, "").trim())
    .filter(Boolean);
}

function yes(value) {
  return Number(value ?? 0) === 1;
}

function normalizeEventType(value) {
  return [
    "treasure",
    "battle",
    "relationship",
    "secret_realm",
    "seclusion",
    "injury",
    "refining",
    "lifespan",
    "other",
  ].includes(value) ? value : "other";
}

function buildFlags(event) {
  const flags = [];
  if (yes(event.isBattle)) flags.push("battle");
  if (yes(event.isKill)) flags.push("kill");
  if (yes(event.isFlee)) flags.push("flee");
  if (yes(event.isNearDeath)) flags.push("near_death");
  if (yes(event.isBetrayed)) flags.push("betrayed");
  if (event.eventType === "injury") flags.push("injury");
  if (yes(event.isTreasure)) flags.push("treasure");
  if (event.eventType === "refining") flags.push("refining");
  if (event.eventType === "lifespan") flags.push("lifespan");
  if (yes(event.isSecretRealm)) flags.push("secret_realm");
  if (event.eventType === "seclusion") flags.push("seclusion");
  if (yes(event.isRelationship)) flags.push("relationship");
  return flags;
}

function toClientEvent(event) {
  return {
    id: event.eventId,
    ch: event.chapterId,
    chapterTitle: event.chapterTitle,
    realm: event.realm || "未知",
    age: event.ageText || "未标注",
    loc: event.location || "未标注",
    type: normalizeEventType(event.eventType),
    summary: event.rawText || "无摘要",
    flags: buildFlags(event),
    conf: Number((event.confidenceScore ?? 0).toFixed(3)),
    review: yes(event.needsReview),
    treasureName: event.treasureName || "",
    newCharacter: event.newCharacter || "",
    battleTarget: event.battleTarget || "",
    extractionMethod: event.extractionMethod || "",
  };
}

function stageStats(stage) {
  const row = one(`
    select
      count(distinct c.chapter_id) as chapters,
      count(e.event_id) as events,
      count(distinct case when e.is_battle = 1 then e.chapter_id end) as battles,
      count(distinct case when e.is_kill = 1 then e.chapter_id end) as kills,
      count(distinct case when e.is_flee = 1 then e.chapter_id end) as flees,
      count(distinct case when e.is_near_death = 1 then e.chapter_id end) as nearDeaths,
      count(distinct case when e.is_treasure = 1 then e.chapter_id end) as treasures,
      count(distinct case when e.is_relationship = 1 then e.chapter_id end) as relationships,
      count(distinct case when e.is_secret_realm = 1 then e.chapter_id end) as secretRealms,
      count(distinct case when e.is_betrayed = 1 then e.chapter_id end) as betrayals,
      count(distinct case when e.is_refining = 1 then e.chapter_id end) as refining,
      count(distinct case when e.is_lifespan_gain = 1 then e.chapter_id end) as lifespanGains,
      sum(e.needs_review) as needsReview,
      round(avg(e.confidence_score), 3) as avgConfidence
    from chapters c
    left join events e on e.chapter_id = c.chapter_id
    where c.chapter_id between ${stage.startChapter} and ${stage.endChapter};
  `);

  const eventTypes = query(`
    select
      e.event_type as type,
      count(*) as count,
      count(distinct e.chapter_id) as chapters,
      round(avg(e.confidence_score), 3) as avgConfidence
    from events e
    where e.chapter_id between ${stage.startChapter} and ${stage.endChapter}
      and e.event_type != 'other'
    group by e.event_type
    order by count desc;
  `);

  const realmMix = query(`
    select
      e.realm_canonical as realm,
      count(*) as events,
      count(distinct e.chapter_id) as chapters
    from events e
    where e.chapter_id between ${stage.startChapter} and ${stage.endChapter}
      and e.realm_canonical is not null
      and e.realm_canonical != ''
    group by e.realm_canonical
    order by min(e.chapter_id);
  `);

  const highlights = query(`
    select
      e.event_id as eventId,
      e.chapter_id as chapterId,
      c.chapter_title as chapterTitle,
      e.age_text as ageText,
      e.realm_canonical as realm,
      e.location,
      e.event_type as eventType,
      e.raw_text as rawText,
      e.confidence_score as confidenceScore,
      e.needs_review as needsReview
    from events e
    join chapters c on c.chapter_id = e.chapter_id
    where e.chapter_id between ${stage.startChapter} and ${stage.endChapter}
      and e.event_type in ('battle', 'treasure', 'secret_realm', 'relationship')
      and length(trim(e.raw_text)) > 0
    order by
      case e.event_type
        when 'treasure' then 1
        when 'battle' then 2
        when 'secret_realm' then 3
        when 'relationship' then 4
        else 9
      end,
      e.confidence_score desc,
      e.chapter_id asc
    limit 10;
  `);

  const assets = query(`
    select
      e.event_id as eventId,
      e.chapter_id as chapterId,
      c.chapter_title as chapterTitle,
      e.realm_canonical as realm,
      coalesce(nullif(e.treasure_name, ''), e.raw_text) as name,
      e.confidence_score as confidenceScore
    from events e
    join chapters c on c.chapter_id = e.chapter_id
    where e.chapter_id between ${stage.startChapter} and ${stage.endChapter}
      and e.is_treasure = 1
      and length(trim(coalesce(nullif(e.treasure_name, ''), e.raw_text))) > 0
    order by e.confidence_score desc, e.chapter_id asc
    limit 8;
  `);

  const contacts = query(`
    select
      e.event_id as eventId,
      e.chapter_id as chapterId,
      c.chapter_title as chapterTitle,
      e.realm_canonical as realm,
      coalesce(nullif(e.new_character, ''), e.raw_text) as name,
      e.confidence_score as confidenceScore
    from events e
    join chapters c on c.chapter_id = e.chapter_id
    where e.chapter_id between ${stage.startChapter} and ${stage.endChapter}
      and e.is_relationship = 1
      and length(trim(coalesce(nullif(e.new_character, ''), e.raw_text))) > 0
    order by e.confidence_score desc, e.chapter_id asc
    limit 8;
  `);

  const firstChapter = one(`
    select chapter_id as chapterId, chapter_title as chapterTitle
    from chapters
    where chapter_id = ${stage.startChapter};
  `);

  const lastChapter = one(`
    select chapter_id as chapterId, chapter_title as chapterTitle
    from chapters
    where chapter_id = ${stage.endChapter};
  `);

  return { ...stage, ...row, eventTypes, realmMix, highlights, assets, contacts, firstChapter, lastChapter };
}

const metaRows = query("select key, value from meta order by key;");
const meta = Object.fromEntries(metaRows.map((row) => [row.key, row.value]));

const overview = one(`
  select
    (select count(*) from chapters) as chapters,
    (select count(*) from events) as events,
    (select count(*) from realm_milestones) as realmMilestones,
    round(avg(confidence_score), 3) as avgConfidence,
    sum(needs_review) as needsReview,
    count(distinct case when is_battle = 1 then chapter_id end) as battleChapters,
    count(distinct case when is_kill = 1 then chapter_id end) as killChapters,
    count(distinct case when is_flee = 1 then chapter_id end) as fleeChapters,
    count(distinct case when is_near_death = 1 then chapter_id end) as nearDeathChapters,
    count(distinct case when is_treasure = 1 then chapter_id end) as treasureChapters,
    count(distinct case when is_relationship = 1 then chapter_id end) as relationshipChapters,
    count(distinct case when is_secret_realm = 1 then chapter_id end) as secretRealmChapters,
    count(distinct case when is_betrayed = 1 then chapter_id end) as betrayalChapters
  from events;
`);

const seclusion = one(`
  select
    count(*) as periods,
    round(avg(duration_confidence), 3) as avgConfidence,
    sum(needs_review) as needsReview,
    sum(is_continuation_suspect) as continuationSuspects,
    round(sum(case when duration_confidence >= 0.85 then duration_years else 0 end), 1) as highConfidenceYears,
    round(sum(duration_years), 1) as estimatedYears,
    round(sum(case when is_continuation_suspect = 0 then duration_years else 0 end), 1) as conservativeYears
  from seclusion_periods;
`);

const eventTypes = query(`
  select
    event_type as type,
    count(*) as count,
    round(avg(confidence_score), 3) as avgConfidence,
    sum(needs_review) as needsReview
  from events
  group by event_type
  order by count desc;
`);

const realmProfiles = query(`
  select
    e.realm_canonical as realm,
    min(e.chapter_id) as startChapter,
    max(e.chapter_id) as endChapter,
    (select age_text from events x where x.realm_canonical = e.realm_canonical order by chapter_id asc, event_id asc limit 1) as startAge,
    (select age_text from events x where x.realm_canonical = e.realm_canonical order by chapter_id desc, event_id desc limit 1) as endAge,
    count(*) as events,
    count(distinct e.chapter_id) as chapters,
    count(distinct case when e.is_battle = 1 then e.chapter_id end) as battles,
    count(distinct case when e.is_kill = 1 then e.chapter_id end) as kills,
    count(distinct case when e.is_flee = 1 then e.chapter_id end) as flees,
    count(distinct case when e.is_near_death = 1 then e.chapter_id end) as nearDeaths,
    count(distinct case when e.is_treasure = 1 then e.chapter_id end) as treasures,
    count(distinct case when e.is_relationship = 1 then e.chapter_id end) as relationships,
    count(distinct case when e.is_secret_realm = 1 then e.chapter_id end) as secretRealms,
    count(distinct case when e.is_betrayed = 1 then e.chapter_id end) as betrayals,
    round(avg(e.confidence_score), 3) as avgConfidence
  from events e
  where e.realm_canonical is not null and e.realm_canonical != ''
  group by e.realm_canonical
  order by min(e.chapter_id);
`);

const milestones = query(`
  select
    m.id,
    m.chapter_id as chapterId,
    c.chapter_title as chapterTitle,
    m.realm_canonical as realm,
    m.age_text as ageText,
    m.is_breakthrough as isBreakthrough
  from realm_milestones m
  join chapters c on c.chapter_id = m.chapter_id
  order by m.chapter_id, m.id;
`);

const timelineEvents = query(`
  select
    e.event_id as eventId,
    e.chapter_id as chapterId,
    c.chapter_title as chapterTitle,
    e.event_type as eventType,
    e.age_text as ageText,
    e.realm_canonical as realm,
    e.location,
    e.raw_text as rawText,
    e.confidence_score as confidenceScore,
    e.extraction_method as extractionMethod,
    e.needs_review as needsReview,
    e.is_battle as isBattle,
    e.battle_target as battleTarget,
    e.is_kill as isKill,
    e.is_flee as isFlee,
    e.is_near_death as isNearDeath,
    e.is_treasure as isTreasure,
    e.treasure_name as treasureName,
    e.is_relationship as isRelationship,
    e.new_character as newCharacter,
    e.is_secret_realm as isSecretRealm,
    e.is_betrayed as isBetrayed
  from events e
  join chapters c on c.chapter_id = e.chapter_id
  order by e.chapter_id asc, e.event_id asc;
`);

const chapters = query(`
  select
    chapter_id as chapterId,
    chapter_num as chapterNum,
    chapter_title as chapterTitle,
    is_numbering_anomaly as isNumberingAnomaly
  from chapters
  order by chapter_id asc;
`);

const treasureRecords = query(`
  select
    e.event_id as eventId,
    e.chapter_id as chapterId,
    c.chapter_title as chapterTitle,
    e.age_text as ageText,
    e.realm_canonical as realm,
    e.location,
    coalesce(nullif(e.treasure_name, ''), e.raw_text) as treasureName,
    e.raw_text as rawText,
    e.confidence_score as confidenceScore,
    e.extraction_method as extractionMethod,
    e.needs_review as needsReview
  from events e
  join chapters c on c.chapter_id = e.chapter_id
  where e.is_treasure = 1
  order by e.chapter_id asc, e.event_id asc;
`);

const treasureItems = treasureRecords.flatMap((record) => {
  const parts = splitTreasureName(record.treasureName);
  const names = parts.length ? parts : [record.treasureName || record.rawText || "未命名宝物"];

  return names.map((itemName, index) => ({
    itemId: `${record.eventId}-${index + 1}`,
    itemName,
    sourceName: record.treasureName || record.rawText || "",
    ...record,
  }));
});

const milestonesByChapter = new Map();
for (const milestone of milestones) {
  const list = milestonesByChapter.get(milestone.chapterId) ?? [];
  list.push(milestone);
  milestonesByChapter.set(milestone.chapterId, list);
}

const eventsByChapter = new Map();
for (const event of timelineEvents) {
  const list = eventsByChapter.get(event.chapterId) ?? [];
  list.push(event);
  eventsByChapter.set(event.chapterId, list);
}

const chapterTimeline = chapters.map((chapter) => {
  const events = eventsByChapter.get(chapter.chapterId) ?? [];
  const realm = events.find((event) => event.realm)?.realm ?? "";
  const ageText = events.find((event) => event.ageText)?.ageText ?? "";
  const location = events.find((event) => event.location)?.location ?? "";
  const eventTypes = [...new Set(events.map((event) => event.eventType))];

  return {
    ...chapter,
    ageText,
    realm,
    location,
    eventCount: events.length,
    eventTypes,
    events,
    milestones: milestonesByChapter.get(chapter.chapterId) ?? [],
  };
});

const stages = [
  {
    slug: "bottle-origin",
    artifact: "掌天瓶",
    seal: "瓶",
    title: "凡人入道",
    range: "10-25 岁",
    startChapter: 1,
    endChapter: 215,
    tone: "从山村少年到炼气圆满",
  },
  {
    slug: "bamboo-sword-foundation",
    artifact: "青竹蜂云剑",
    seal: "剑",
    title: "筑基游走",
    range: "25-133 岁",
    startChapter: 216,
    endChapter: 397,
    tone: "谨慎发育，开始形成自己的战斗资产",
  },
  {
    slug: "puppet-core-formation",
    artifact: "傀儡",
    seal: "傀",
    title: "结丹成局",
    range: "约 133-202 岁",
    startChapter: 398,
    endChapter: 635,
    tone: "资源、秘境、风险一起放大",
  },
  {
    slug: "wind-thunder-wings",
    artifact: "风雷翅",
    seal: "翼",
    title: "元婴初启",
    range: "约 202-247 岁",
    startChapter: 636,
    endChapter: 854,
    tone: "机动性和保命能力进入新阶段",
  },
  {
    slug: "gold-devouring-insects",
    artifact: "噬金虫",
    seal: "虫",
    title: "元婴中盘",
    range: "约 247-350 岁",
    startChapter: 855,
    endChapter: 1124,
    tone: "事件密度和危险等级同时抬升",
  },
  {
    slug: "teleport-ascension",
    artifact: "传送阵",
    seal: "阵",
    title: "化神远行",
    range: "约 350-500 岁",
    startChapter: 1125,
    endChapter: 1324,
    tone: "从人界尾声走向更大地图",
  },
].map(stageStats);

const data = {
  generatedAt: new Date().toISOString(),
  meta,
  overview,
  seclusion,
  eventTypes,
  realmProfiles,
  milestones,
  timelineEvents,
  chapters,
  chapterTimeline,
  treasureRecords,
  treasureItems,
  stages,
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(path.dirname(publicEventsPath), { recursive: true });
writeFileSync(publicEventsPath, `${JSON.stringify(timelineEvents.map(toClientEvent))}\n`);
console.log(`Exported ${outputPath}`);
console.log(`Exported ${publicEventsPath}`);
