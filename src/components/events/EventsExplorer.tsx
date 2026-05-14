"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConfPill, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { ageLabel, eventHref, eventTypeLabel, localizedPath, realmLabel, valueLabel, type Locale } from "@/lib/i18n";
import type { EventType, TimelineEvent, TimelineQueryResult } from "@/lib/types";

const confidenceFilters = [
  ["all", "全部质量", "All quality"],
  ["high", "高置信", "High confidence"],
  ["mid", "中置信", "Medium confidence"],
  ["low", "低置信", "Low confidence"],
  ["review", "待复核", "Needs review"],
] as const;

const PAGE_SIZE = 200;

function numberParam(value: string | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clean(value: string) {
  return value && value !== "无" && value !== "未标注" ? value : "";
}

function hrefWith(basePath: string, searchParams: URLSearchParams, updates: Record<string, string | number | null>) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "" || value === "all") params.delete(key);
    else params.set(key, String(value));
  }
  if (!("offset" in updates)) params.delete("offset");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function matchText(event: TimelineEvent, search: string) {
  if (!search) return true;
  const haystack = [
    event.summary,
    event.loc,
    event.realm,
    event.age,
    event.treasureName,
    event.newCharacter,
    event.battleTarget,
    event.chapterTitle,
    String(event.ch),
    String(event.id),
  ].join(" ");
  return haystack.includes(search);
}

function matchConfidence(event: TimelineEvent, confidence: string) {
  if (confidence === "high") return event.conf >= 0.85;
  if (confidence === "mid") return event.conf >= 0.65 && event.conf < 0.85;
  if (confidence === "low") return event.conf < 0.65;
  if (confidence === "review") return event.review;
  return true;
}

export function EventsExplorer({
  eventTypes,
  realms,
  initialResult,
  locale = "zh",
}: {
  eventTypes: EventType[];
  realms: string[];
  initialResult: TimelineQueryResult;
  locale?: Locale;
}) {
  const searchParams = useSearchParams();
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const isEn = locale === "en";
  const basePath = localizedPath(locale, "/events");

  useEffect(() => {
    let mounted = true;
    fetch("/data/events.json")
      .then((response) => response.json())
      .then((events: TimelineEvent[]) => {
        if (mounted) setAllEvents(events);
      })
      .catch(() => {
        if (mounted) setAllEvents([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const search = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";
  const realm = searchParams.get("realm") ?? "all";
  const confidence = searchParams.get("confidence") ?? "all";
  const view = searchParams.get("view") === "card" ? "card" : "table";
  const offset = Math.max(0, numberParam(searchParams.get("offset")));
  const chapter = numberParam(searchParams.get("chapter"));
  const hasClientData = allEvents.length > 0;

  const result = useMemo<TimelineQueryResult>(() => {
    if (!hasClientData && searchParams.toString() === "") return initialResult;

    const source = hasClientData ? allEvents : initialResult.events;
    const filtered = source.filter((event) => {
      if (type !== "all" && event.type !== type) return false;
      if (realm !== "all" && event.realm !== realm) return false;
      if (chapter > 0 && event.ch !== chapter) return false;
      if (!matchConfidence(event, confidence)) return false;
      return matchText(event, search.trim());
    });
    const events = filtered.slice(offset, offset + PAGE_SIZE);
    return {
      events,
      total: filtered.length,
      limit: PAGE_SIZE,
      offset,
      hasPrevious: offset > 0,
      hasNext: offset + PAGE_SIZE < filtered.length,
    };
  }, [allEvents, chapter, confidence, hasClientData, initialResult, offset, realm, search, searchParams, type]);

  return (
    <div className="page">
      <SectionHeader
        kicker={isEn ? "Events DB" : "事件库"}
        en="EVENTS DATABASE"
        title={isEn ? "1,998 atomic events · traceable records" : "1998 条事件原子 · 可反查出处"}
        meta={`${result.total} MATCHED`}
      />

      <form className="events-toolbar" action={basePath}>
        <div className="search event-search">
          <span className="glyph">⌕</span>
          <input name="q" defaultValue={search} placeholder={isEn ? "Search chapter, person, treasure, location, note" : "搜章节、人物、法宝、地点、摘要"} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="realm" value={realm} />
          <input type="hidden" name="confidence" value={confidence} />
          <input type="hidden" name="view" value={view} />
          {chapter > 0 ? <input type="hidden" name="chapter" value={chapter} /> : null}
        </div>
        <div className="right">
          <button className="kbd" type="submit">{isEn ? "Search" : "检索"}</button>
          <div className="toggle-row" aria-label={isEn ? "View switcher" : "视图切换"}>
            <Link className={view === "table" ? "is-active" : ""} href={hrefWith(basePath, searchParams, { view: "table" })}>TABLE</Link>
            <Link className={view === "card" ? "is-active" : ""} href={hrefWith(basePath, searchParams, { view: "card" })}>CARD</Link>
          </div>
        </div>
      </form>

      <div className="event-filter-row" aria-label={isEn ? "Event type filters" : "事件类型筛选"}>
        <Link className={`event-tag other ${type === "all" ? "is-active" : ""}`} href={hrefWith(basePath, searchParams, { type: "all" })}>
          {isEn ? "All types" : "全部类型"}
        </Link>
        {eventTypes.map((item) => (
          <Link className={`event-tag ${item} ${type === item ? "is-active" : ""}`} href={hrefWith(basePath, searchParams, { type: item })} key={item}>
            {eventTypeLabel(item, locale)}
          </Link>
        ))}
      </div>

      <div className="event-filter-row" aria-label={isEn ? "Realm filters" : "境界与质量筛选"}>
        <Link className={`event-tag other ${realm === "all" ? "is-active" : ""}`} href={hrefWith(basePath, searchParams, { realm: "all" })}>
          {isEn ? "All realms" : "全部境界"}
        </Link>
        {realms.map((item) => (
          <Link className={`event-tag other ${realm === item ? "is-active" : ""}`} href={hrefWith(basePath, searchParams, { realm: item })} key={item}>
            {realmLabel(item, locale)}
          </Link>
        ))}
      </div>

      <div className="event-filter-row" aria-label={isEn ? "Confidence filters" : "置信度筛选"}>
        {confidenceFilters.map(([value, zh, en]) => (
          <Link
            className={`event-tag other ${confidence === value ? "is-active" : ""}`}
            href={hrefWith(basePath, searchParams, { confidence: value })}
            key={value}
          >
            {isEn ? en : zh}
          </Link>
        ))}
      </div>

      <div className="note" style={{ margin: "16px 0" }}>
        {isEn ? (
          <>
            Showing <strong>{result.total === 0 ? 0 : result.offset + 1}</strong>-
            <strong>{Math.min(result.offset + result.events.length, result.total)}</strong> /
            <strong>{result.total}</strong> records. Treasures, characters, and battle targets are expanded in the table; open an event id for same-chapter context.
            {!hasClientData && searchParams.toString() ? " Loading the full client index." : ""}
          </>
        ) : (
          <>
            当前显示 <strong>{result.total === 0 ? 0 : result.offset + 1}</strong>-
            <strong>{Math.min(result.offset + result.events.length, result.total)}</strong> /
            <strong>{result.total}</strong> 条。法宝、人物、战斗对象会在表格中直接展开；点事件编号进入同章节上下文。
            {!hasClientData && searchParams.toString() ? " 正在载入完整索引。" : ""}
          </>
        )}
      </div>

      {view === "card" ? (
        <div className="event-card-grid">
          {result.events.map((event) => (
            <Link className="event-card" href={eventHref(event, locale)} key={event.id}>
              <div className="event-card__meta">
                <EventTypeTag type={event.type} locale={locale} />
                <ConfPill conf={event.conf} review={event.review} locale={locale} />
              </div>
              <h3>ch{event.ch} · {event.chapterTitle}</h3>
              <p>{event.summary}</p>
              <small>{ageLabel(event.age, locale)} · {realmLabel(event.realm, locale)} · {valueLabel(event.loc, locale)}</small>
            </Link>
          ))}
        </div>
      ) : (
        <div className="events-table-wrap">
          <table className="events-table">
            <thead>
              <tr>
                <th>{isEn ? "Chapter" : "章回"}</th>
                <th>{isEn ? "Type" : "类型"}</th>
                <th>{isEn ? "Age / realm" : "年龄 / 境界"}</th>
                <th>{isEn ? "Location" : "地点"}</th>
                <th>{isEn ? "Source note" : "摘要"}</th>
                <th>{isEn ? "Linked fields" : "关联字段"}</th>
                <th>{isEn ? "Flags" : "标记"}</th>
                <th>{isEn ? "Quality" : "质量"}</th>
              </tr>
            </thead>
            <tbody>
              {result.events.map((event) => (
                <tr key={event.id}>
                  <td className="ch">
                    <Link href={eventHref(event, locale)}>#{event.id}</Link>
                    <div>ch{event.ch}</div>
                    <small>{event.chapterTitle}</small>
                  </td>
                  <td className="type"><EventTypeTag type={event.type} locale={locale} /></td>
                  <td className="realm">
                    {ageLabel(event.age, locale)}
                    <small>{realmLabel(event.realm, locale)}</small>
                  </td>
                  <td className="loc">{valueLabel(event.loc, locale)}</td>
                  <td>{event.summary}</td>
                  <td>
                    {clean(event.treasureName) ? <small>{isEn ? "Treasure" : "宝物"}：{event.treasureName}</small> : null}
                    {clean(event.newCharacter) ? <small>{isEn ? "Character" : "人物"}：{event.newCharacter}</small> : null}
                    {clean(event.battleTarget) ? <small>{isEn ? "Target" : "对象"}：{event.battleTarget}</small> : null}
                  </td>
                  <td>
                    <div className="flag-list">
                      {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} locale={locale} />)}
                    </div>
                  </td>
                  <td className="conf">
                    <ConfPill conf={event.conf} review={event.review} locale={locale} />
                    <small>{event.extractionMethod}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="pager" aria-label="事件分页">
        {result.hasPrevious ? (
          <Link className="kbd" href={hrefWith(basePath, searchParams, { offset: Math.max(0, result.offset - result.limit) })}>{isEn ? "Previous" : "上一页"}</Link>
        ) : <span />}
        {result.hasNext ? (
          <Link className="kbd" href={hrefWith(basePath, searchParams, { offset: result.offset + result.limit })}>{isEn ? "Next" : "下一页"}</Link>
        ) : null}
      </nav>
    </div>
  );
}
