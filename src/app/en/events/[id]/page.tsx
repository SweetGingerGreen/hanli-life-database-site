import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfPill, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { getRealmProfiles, slugify } from "@/lib/queries/realms";
import { getAllEventIds, getChapterEvents, getEventById } from "@/lib/queries/timeline";
import { ageLabel, eventHref, realmHref, realmLabel, valueLabel } from "@/lib/i18n";

export const revalidate = 604800;

export function generateStaticParams() {
  return getAllEventIds().map((id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Event #${id} · Han Li Life Database`,
    alternates: {
      canonical: `/en/events/${id}`,
      languages: { "zh-CN": `/events/${id}`, en: `/en/events/${id}` },
    },
  };
}

export default async function EnglishEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(Number(id));
  if (!event) notFound();

  const chapterEvents = getChapterEvents(event.ch).filter((item) => item.id !== event.id);
  const realm = getRealmProfiles().find((item) => item.realm === event.realm);

  return (
    <div className="page">
      <SectionHeader
        kicker="Event detail"
        en="EVENT DETAIL"
        title={`#${event.id} · ch${event.ch}`}
        meta={event.chapterTitle}
      />

      <article className="chart-card event-detail">
        <div className="chart-card__head">
          <div>
            <span className="eyebrow">{realmLabel(event.realm, "en")}</span>
            <h1 className="chart-card__title">{event.summary}</h1>
            <div className="chart-card__sub" style={{ marginTop: 8 }}>
              {ageLabel(event.age, "en")} · {valueLabel(event.loc, "en")} · {event.extractionMethod}
            </div>
          </div>
          <div className="event-detail__meta">
            <EventTypeTag type={event.type} locale="en" />
            <ConfPill conf={event.conf} review={event.review} locale="en" />
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
              <Link href={realmHref(slugify(realm.realm), "en")}><strong>{realmLabel(realm.realm, "en")}</strong></Link>
            ) : <strong>{realmLabel(event.realm, "en")}</strong>}
            <span>{realm ? `ch${realm.startChapter}-${realm.endChapter}` : "realm profile pending"}</span>
          </div>
          <div>
            <div className="eyebrow is-en">LINKED FIELDS</div>
            <strong>{event.treasureName && event.treasureName !== "无" ? event.treasureName : event.newCharacter || event.battleTarget || "none"}</strong>
            <span>treasure / character / battle target</span>
          </div>
        </div>

        {event.flags.length > 0 ? (
          <div className="flag-list" style={{ marginTop: 18 }}>
            {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} locale="en" />)}
          </div>
        ) : null}
      </article>

      <SectionHeader kicker="Same chapter" en="SAME CHAPTER" title={`${chapterEvents.length} other events`} />
      <div className="timeline-feed">
        {chapterEvents.map((item) => (
          <Link className="tl-row" href={eventHref(item, "en")} key={item.id}>
            <div className="ch">
              <span className="n">#{item.id}</span>
              <span>ch{item.ch}</span>
            </div>
            <div className="realm">{realmLabel(item.realm, "en")}<span className="age">{ageLabel(item.age, "en")}</span></div>
            <div className="loc">{valueLabel(item.loc, "en")}</div>
            <div className="summary">{item.summary}</div>
            <div className="meta-end">
              <EventTypeTag type={item.type} locale="en" />
              <ConfPill conf={item.conf} review={item.review} locale="en" />
            </div>
          </Link>
        ))}
      </div>

      <div className="note" style={{ marginTop: 24 }}>
        <Link href={`/en/events?chapter=${event.ch}`}>View full ch{event.ch} event table</Link>
        <span style={{ margin: "0 10px" }}>·</span>
        <Link href="/en/events">Back to events database</Link>
      </div>
    </div>
  );
}
