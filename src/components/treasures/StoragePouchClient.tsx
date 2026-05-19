"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORY_META,
  type InventoryCategory,
  type InventoryItem,
  type InventoryStats,
  type InventoryStatus,
} from "@/lib/inventory";
import { ageLabel, label, localizedPath, realmLabel, type Locale } from "@/lib/i18n";

const STATUS_COPY: Record<InventoryStatus, { zh: string; en: string }> = {
  held: { zh: "仍在袋中", en: "in pouch" },
  regained: { zh: "失而复得", en: "regained" },
  left: { zh: "已离袋", en: "left pouch" },
  consumed: { zh: "已消耗", en: "consumed" },
  unknown: { zh: "状态不明", en: "uncertain" },
};

const statusFilters = ["all", "active", "gone", "held", "regained", "left", "consumed", "unknown"] as const;

function statusFilterLabel(value: (typeof statusFilters)[number], locale: Locale) {
  const copy = {
    all: ["全部", "All"],
    active: ["第 N 章仍在袋中", "In pouch at chN"],
    gone: ["第 N 章已离袋", "Gone by chN"],
    held: ["仍在袋中", "In pouch"],
    regained: ["失而复得", "Regained"],
    left: ["已离袋", "Left"],
    consumed: ["已消耗", "Consumed"],
    unknown: ["状态不明", "Uncertain"],
  } as const;
  return locale === "en" ? copy[value][1] : copy[value][0];
}

function isGoneAt(item: InventoryItem, chapter: number) {
  return Boolean(item.lostAt && item.lostAt.chapterId <= chapter);
}

function statusClass(item: InventoryItem, chapter: number) {
  if (isGoneAt(item, chapter) || item.status === "left" || item.status === "consumed") return "is-gone";
  if (item.status === "unknown") return "is-unknown";
  if (item.status === "regained") return "is-regained";
  return "is-held";
}

function pointText(item: InventoryItem, locale: Locale) {
  const acquired = item.acquiredAt;
  return `${label(locale, "入袋", "acquired")}: ch${acquired.chapterId} · ${ageLabel(acquired.ageText, locale)} · ${realmLabel(acquired.realm, locale)}`;
}

export function StoragePouchClient({
  items,
  stats,
  locale = "zh",
}: {
  items: InventoryItem[];
  stats: InventoryStats;
  locale?: Locale;
}) {
  const [chapter, setChapter] = useState(stats.maxChapter);
  const [category, setCategory] = useState<"all" | InventoryCategory>("all");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [query, setQuery] = useState("");

  const categoryOptions = stats.categorySummary;

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (item.acquiredAt.chapterId > chapter) return false;
      if (category !== "all" && item.category !== category) return false;
      const goneAtCursor = isGoneAt(item, chapter);
      if (status === "active" && goneAtCursor) return false;
      if (status === "gone" && !goneAtCursor) return false;
      if (status !== "all" && status !== "active" && status !== "gone" && item.status !== status) return false;
      if (keyword) {
        const haystack = [
          item.name,
          item.aliases.join(" "),
          item.events.map((event) => event.sourceName).join(" "),
          item.events.map((event) => event.rawText).join(" "),
          item.acquiredAt.chapterTitle,
          item.acquiredAt.realm,
          item.acquiredAt.location,
          `ch${item.acquiredAt.chapterId}`,
        ].join(" ").toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [category, chapter, items, query, status]);

  const heldAtCursor = visible.filter((item) => !isGoneAt(item, chapter)).length;
  const goneAtCursor = visible.length - heldAtCursor;
  const recent = [...visible].sort((a, b) => b.acquiredAt.chapterId - a.acquiredAt.chapterId).slice(0, 8);

  return (
    <div className="pouch-client">
      <section className="pouch-console" aria-label={label(locale, "储物袋筛选", "Storage pouch filters")}>
        <div className="pouch-slider">
          <div>
            <span className="eyebrow gold">{label(locale, "时间视角", "Time view")}</span>
            <strong>ch{chapter}</strong>
            <small>
              {label(locale, "查看这一章时，哪些物品已经入袋，哪些已经离袋。", "See which items have entered or left the pouch by this chapter.")}
            </small>
          </div>
          <input
            aria-label={label(locale, "章节滑杆", "Chapter slider")}
            type="range"
            min={1}
            max={stats.maxChapter}
            value={chapter}
            onChange={(event) => setChapter(Number(event.target.value))}
          />
        </div>

        <div className="pouch-controls">
          <label>
            <span>{label(locale, "分类", "Category")}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as "all" | InventoryCategory)}>
              <option value="all">{label(locale, "全部分类", "All categories")}</option>
              {categoryOptions.map((item) => (
                <option key={item.category} value={item.category}>
                  {locale === "en" ? CATEGORY_META[item.category].en : CATEGORY_META[item.category].zh}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label(locale, "状态", "Status")}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as (typeof statusFilters)[number])}>
              {statusFilters.map((item) => (
                <option key={item} value={item}>{statusFilterLabel(item, locale)}</option>
              ))}
            </select>
          </label>
          <label className="pouch-search">
            <span>{label(locale, "搜索", "Search")}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label(locale, "小瓶、虚天鼎、筑基丹、ch398", "bottle, cauldron, pill, ch398")}
            />
          </label>
        </div>
      </section>

      <section className="pouch-cross-section">
        {categoryOptions.map((item) => (
          <button
            className={`pouch-bin ${category === item.category ? "is-active" : ""}`}
            key={item.category}
            type="button"
            onClick={() => setCategory(item.category)}
          >
            <span className={`seal ${CATEGORY_META[item.category].tone}`}>{CATEGORY_META[item.category].seal}</span>
            <strong>{locale === "en" ? CATEGORY_META[item.category].en : CATEGORY_META[item.category].zh}</strong>
            <small>
              {item.count} · {label(locale, "仍在", "held")} {item.held} · {label(locale, "离袋", "gone")} {item.gone}
            </small>
          </button>
        ))}
      </section>

      <div className="pouch-summary">
        <div><strong>{visible.length}</strong><span>{label(locale, "条物品线索", "item threads")}</span></div>
        <div><strong>{heldAtCursor}</strong><span>{label(locale, "此章仍在袋中", "still in pouch")}</span></div>
        <div><strong>{goneAtCursor}</strong><span>{label(locale, "此章已灰显", "greyed by chN")}</span></div>
      </div>

      <section className="pouch-recent" aria-label={label(locale, "最近入袋", "Recent acquisitions")}>
        <div className="pouch-recent__head">
          <span className="eyebrow">{label(locale, "入袋时间线", "Acquisition line")}</span>
          <span>{label(locale, "随章节滑杆变化", "changes with the chapter slider")}</span>
        </div>
        <div className="pouch-recent__rail">
          {recent.map((item) => (
            <Link href={localizedPath(locale, `/events/${item.acquiredAt.eventId}`)} key={`${item.id}-recent`} className={statusClass(item, chapter)}>
              <strong>ch{item.acquiredAt.chapterId}</strong>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="pouch-grid">
        {visible.slice(0, 180).map((item) => {
          const gone = isGoneAt(item, chapter);
          const meta = CATEGORY_META[item.category];
          return (
            <article className={`pouch-item ${statusClass(item, chapter)}`} key={item.id}>
              <div className="pouch-item__top">
                <span className={`seal ${meta.tone}`}>{meta.seal}</span>
                <span className="pouch-item__status">
                  {gone ? label(locale, "已离袋", "gone") : STATUS_COPY[item.status][locale]}
                </span>
              </div>
              <h3>{item.name}</h3>
              <p>{pointText(item, locale)}</p>
              {item.lostAt ? (
                <p className="pouch-item__lost">
                  {label(locale, "离袋", "left")}: ch{item.lostAt.chapterId} · {item.statusReason}
                </p>
              ) : (
                <p className="pouch-item__lost">{item.statusReason}</p>
              )}
              <div className="pouch-item__meta">
                <span>{locale === "en" ? meta.en : meta.zh}</span>
                <span>{item.confidence.toFixed(2)}{item.needsReview ? ` · ${label(locale, "待复核", "review")}` : ""}</span>
              </div>
              <div className="pouch-item__links">
                <Link href={localizedPath(locale, `/events/${item.acquiredAt.eventId}`)}>{label(locale, "入袋出处", "source")}</Link>
                <Link href={`${localizedPath(locale, "/events")}?type=treasure&q=${encodeURIComponent(item.name)}`}>{label(locale, "相关记录", "related")}</Link>
              </div>
            </article>
          );
        })}
      </div>

      {visible.length > 180 ? (
        <div className="note" style={{ marginTop: 18 }}>
          {label(locale, `当前筛选命中 ${visible.length} 条，先展示前 180 条。可以缩小分类、状态或搜索关键词。`, `Current filters match ${visible.length} items; showing the first 180. Narrow by category, status, or search.`)}
        </div>
      ) : null}
    </div>
  );
}
