"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConfPill, Dot, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { FLAG_LABELS, ageLabel, eventHref, localizedPath, realmLabel, valueLabel, type Locale } from "@/lib/i18n";
import type { EventFlag, EventType, FlagCount, TimelineEvent } from "@/lib/types";

type SP = {
  type?: string;
  flags?: string;
  search?: string;
  hideReview?: string;
};

function hrefWith(basePath: string, searchParams: URLSearchParams, patch: Partial<SP>) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function eventMatches(event: TimelineEvent, search: string) {
  if (!search) return true;
  return [
    event.summary,
    event.loc,
    event.realm,
    event.age,
    event.treasureName,
    event.newCharacter,
    event.battleTarget,
    event.chapterTitle,
    String(event.ch),
  ].join(" ").includes(search);
}

export function TimelineExplorer({
  initialEvents,
  flagCounts,
  locale = "zh",
}: {
  initialEvents: TimelineEvent[];
  flagCounts: FlagCount[];
  locale?: Locale;
}) {
  const searchParams = useSearchParams();
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const isEn = locale === "en";
  const basePath = localizedPath(locale, "/timeline");

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

  const flags = (searchParams.get("flags") ?? "").split(",").filter(Boolean) as EventFlag[];
  const type = (searchParams.get("type") as EventType | "all" | null) || "all";
  const search = searchParams.get("search") ?? "";
  const hideReview = searchParams.get("hideReview") === "1";
  const hasClientData = allEvents.length > 0;

  const events = useMemo(() => {
    if (!hasClientData && searchParams.toString() === "") return initialEvents;
    const source = hasClientData ? allEvents : initialEvents;
    return source
      .filter((event) => {
        if (type !== "all" && event.type !== type) return false;
        if (hideReview && event.review) return false;
        if (flags.some((flag) => !event.flags.includes(flag))) return false;
        return eventMatches(event, search.trim());
      })
      .slice(0, 500);
  }, [allEvents, flags, hasClientData, hideReview, initialEvents, search, searchParams, type]);

  function toggleFlag(flag: EventFlag) {
    const next = flags.includes(flag) ? flags.filter((item) => item !== flag) : [...flags, flag];
    return hrefWith(basePath, searchParams, { flags: next.join(",") });
  }

  const railFlags = (rail: string) => flagCounts.filter((item) => item.rail === rail);
  const flagText = (flag: EventFlag, zh: string) => isEn ? (FLAG_LABELS[flag]?.en ?? flag.replace(/_/g, " ")) : zh;

  return (
    <div className="page">
      <SectionHeader
        kicker={isEn ? "Life timeline" : "人生时间轴"}
        en="LIFE TIMELINE"
        title={isEn ? "From Han Village to Deity Transformation" : "从韩家村到化神 · 逐条筛选"}
        meta={isEn ? `${events.length} records` : `${events.length} 条样本`}
      />

      <div className="timeline-layout">
        <aside className="filter-panel">
          <h3>{isEn ? "Filters" : "筛选"}</h3>
          <form className="search" action={basePath}>
            <span className="glyph">⌕</span>
            <input name="search" placeholder={isEn ? "Search notes / location / realm" : "搜索摘要 / 地点 / 境界"} defaultValue={search} />
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            {flags.length ? <input type="hidden" name="flags" value={flags.join(",")} /> : null}
          </form>

          <div className="filter-group">
            <div className="label"><span>{isEn ? "Risk flags" : "风险标记"}</span><span className="count">{isEn ? "chapters" : "章节"}</span></div>
            <div className="filter-row">
              {railFlags("cinnabar").map((item) => (
                <Link
                  key={item.flag}
                  prefetch={false}
                  href={toggleFlag(item.flag)}
                  className={`filter-chip ${flags.includes(item.flag) ? "is-active" : ""}`}
                >
                  <Dot rail="cinnabar" />
                  <span>{flagText(item.flag, item.zh)}</span>
                  <span className="cnt">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="label"><span>{isEn ? "Assets / maps" : "资产 / 地图"}</span><span className="count">{isEn ? "chapters" : "章节"}</span></div>
            <div className="filter-row">
              {[...railFlags("gold"), ...railFlags("jade"), ...railFlags("moss")].map((item) => (
                <Link
                  key={item.flag}
                  prefetch={false}
                  href={toggleFlag(item.flag)}
                  className={`filter-chip ${flags.includes(item.flag) ? "is-active" : ""}`}
                >
                  <Dot rail={item.rail} />
                  <span>{flagText(item.flag, item.zh)}</span>
                  <span className="cnt">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="label"><span>{isEn ? "Data quality" : "数据质量"}</span><span className="count">{isEn ? "records" : "条"}</span></div>
            <div className="filter-row">
              <Link
                prefetch={false}
                href={hrefWith(basePath, searchParams, { hideReview: hideReview ? undefined : "1" })}
                className={`filter-chip ${hideReview ? "is-active" : ""}`}
              >
                <span>{isEn ? (hideReview ? "Review hidden" : "Hide review") : (hideReview ? "已隐藏待复核" : "隐藏待复核")}</span>
              </Link>
            </div>
          </div>
        </aside>

        <div>
          <div className="timeline-feed">
            {events.map((event) => (
              <Link className="tl-row" href={eventHref(event, locale)} key={event.id}>
                <div className="ch">
                  <span className="n">ch{event.ch}</span>
                  <span>#{event.id}</span>
                </div>
                <div className="realm">{realmLabel(event.realm, locale)}<span className="age">{ageLabel(event.age, locale)}</span></div>
                <div className="loc">{valueLabel(event.loc, locale)}</div>
                <div className="summary">
                  {event.summary}
                  {event.flags.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} locale={locale} />)}
                    </div>
                  )}
                </div>
                <div className="meta-end">
                  <EventTypeTag type={event.type} locale={locale} />
                  <ConfPill conf={event.conf} review={event.review} locale={locale} />
                </div>
              </Link>
            ))}
          </div>
          {events.length === 0 && (
            <div className="note" style={{ marginTop: 16 }}>
              {isEn ? "No events match the current filters." : "当前筛选下没有事件。"}
              <Link href={basePath}>{isEn ? " Reset filters" : "重置筛选"}</Link>。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
