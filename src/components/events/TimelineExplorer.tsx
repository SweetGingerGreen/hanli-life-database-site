"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConfPill, Dot, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import type { EventFlag, EventType, FlagCount, TimelineEvent } from "@/lib/types";

type SP = {
  type?: string;
  flags?: string;
  search?: string;
  hideReview?: string;
};

function hrefWith(searchParams: URLSearchParams, patch: Partial<SP>) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `/timeline?${query}` : "/timeline";
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
}: {
  initialEvents: TimelineEvent[];
  flagCounts: FlagCount[];
}) {
  const searchParams = useSearchParams();
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);

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
    return hrefWith(searchParams, { flags: next.join(",") });
  }

  const railFlags = (rail: string) => flagCounts.filter((item) => item.rail === rail);

  return (
    <div className="page">
      <SectionHeader
        kicker="人生时间轴"
        en="LIFE TIMELINE"
        title="从韩家村到化神 · 逐条筛选"
        meta={`${events.length} 条样本`}
      />

      <div className="timeline-layout">
        <aside className="filter-panel">
          <h3>筛选</h3>
          <form className="search" action="/timeline">
            <span className="glyph">⌕</span>
            <input name="search" placeholder="搜索摘要 / 地点 / 境界" defaultValue={search} />
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            {flags.length ? <input type="hidden" name="flags" value={flags.join(",")} /> : null}
          </form>

          <div className="filter-group">
            <div className="label"><span>风险标记</span><span className="count">章节</span></div>
            <div className="filter-row">
              {railFlags("cinnabar").map((item) => (
                <Link
                  key={item.flag}
                  prefetch={false}
                  href={toggleFlag(item.flag)}
                  className={`filter-chip ${flags.includes(item.flag) ? "is-active" : ""}`}
                >
                  <Dot rail="cinnabar" />
                  <span>{item.zh}</span>
                  <span className="cnt">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="label"><span>资产 / 地图</span><span className="count">章节</span></div>
            <div className="filter-row">
              {[...railFlags("gold"), ...railFlags("jade"), ...railFlags("moss")].map((item) => (
                <Link
                  key={item.flag}
                  prefetch={false}
                  href={toggleFlag(item.flag)}
                  className={`filter-chip ${flags.includes(item.flag) ? "is-active" : ""}`}
                >
                  <Dot rail={item.rail} />
                  <span>{item.zh}</span>
                  <span className="cnt">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="label"><span>数据质量</span><span className="count">条</span></div>
            <div className="filter-row">
              <Link
                prefetch={false}
                href={hrefWith(searchParams, { hideReview: hideReview ? undefined : "1" })}
                className={`filter-chip ${hideReview ? "is-active" : ""}`}
              >
                <span>{hideReview ? "已隐藏待复核" : "隐藏待复核"}</span>
              </Link>
            </div>
          </div>
        </aside>

        <div>
          <div className="timeline-feed">
            {events.map((event) => (
              <Link className="tl-row" href={`/events/${event.id}`} key={event.id}>
                <div className="ch">
                  <span className="n">ch{event.ch}</span>
                  <span>#{event.id}</span>
                </div>
                <div className="realm">{event.realm}<span className="age">{event.age}</span></div>
                <div className="loc">{event.loc}</div>
                <div className="summary">
                  {event.summary}
                  {event.flags.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} />)}
                    </div>
                  )}
                </div>
                <div className="meta-end">
                  <EventTypeTag type={event.type} />
                  <ConfPill conf={event.conf} review={event.review} />
                </div>
              </Link>
            ))}
          </div>
          {events.length === 0 && (
            <div className="note" style={{ marginTop: 16 }}>
              当前筛选下没有事件。<Link href="/timeline">重置筛选</Link>。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
