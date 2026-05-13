import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfPill, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { getRealmProfiles, slugify } from "@/lib/queries/realms";
import { getAllEventIds, getChapterEvents, getEventById } from "@/lib/queries/timeline";

export const revalidate = 604800;

export function generateStaticParams() {
  return getAllEventIds().map((id) => ({ id: String(id) }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(Number(id));
  if (!event) notFound();

  const chapterEvents = getChapterEvents(event.ch).filter((item) => item.id !== event.id);
  const realm = getRealmProfiles().find((item) => item.realm === event.realm);

  return (
    <div className="page">
      <SectionHeader
        kicker="事件详情"
        en="EVENT DETAIL"
        title={`#${event.id} · ch${event.ch}`}
        meta={event.chapterTitle}
      />

      <article className="chart-card event-detail">
        <div className="chart-card__head">
          <div>
            <span className="eyebrow">{event.realm}</span>
            <h1 className="chart-card__title">{event.summary}</h1>
            <div className="chart-card__sub" style={{ marginTop: 8 }}>
              {event.age} · {event.loc} · {event.extractionMethod}
            </div>
          </div>
          <div className="event-detail__meta">
            <EventTypeTag type={event.type} />
            <ConfPill conf={event.conf} review={event.review} />
          </div>
        </div>

        <div className="event-detail__grid">
          <div>
            <div className="eyebrow is-en">CHAPTER</div>
            <strong>ch{event.ch}</strong>
            <span>{event.chapterTitle}</span>
          </div>
          <div>
            <div className="eyebrow is-en">REALM</div>
            {realm ? (
              <Link href={`/realms/${slugify(realm.realm)}`}><strong>{realm.realm}</strong></Link>
            ) : <strong>{event.realm}</strong>}
            <span>{realm ? `ch${realm.startChapter}-${realm.endChapter}` : "境界档案待补"}</span>
          </div>
          <div>
            <div className="eyebrow is-en">LINKED FIELDS</div>
            <strong>{event.treasureName && event.treasureName !== "无" ? event.treasureName : event.newCharacter || event.battleTarget || "无"}</strong>
            <span>宝物 / 人物 / 战斗对象</span>
          </div>
        </div>

        {event.flags.length > 0 ? (
          <div className="flag-list" style={{ marginTop: 18 }}>
            {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} />)}
          </div>
        ) : null}
      </article>

      <SectionHeader kicker="同章上下文" en="SAME CHAPTER" title={`${chapterEvents.length} 条其他事件`} />
      <div className="timeline-feed">
        {chapterEvents.map((item) => (
          <Link className="tl-row" href={`/events/${item.id}`} key={item.id}>
            <div className="ch">
              <span className="n">#{item.id}</span>
              <span>ch{item.ch}</span>
            </div>
            <div className="realm">{item.realm}<span className="age">{item.age}</span></div>
            <div className="loc">{item.loc}</div>
            <div className="summary">{item.summary}</div>
            <div className="meta-end">
              <EventTypeTag type={item.type} />
              <ConfPill conf={item.conf} review={item.review} />
            </div>
          </Link>
        ))}
      </div>

      <div className="note" style={{ marginTop: 24 }}>
        <Link href={`/events?chapter=${event.ch}`}>查看 ch{event.ch} 的完整事件表</Link>
        <span style={{ margin: "0 10px" }}>·</span>
        <Link href="/events">返回事件库</Link>
      </div>
    </div>
  );
}
