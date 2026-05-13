import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfPill, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { getAdjacentRealms, getRealmBySlug, getRealmEvents, getRealmStaticParams, slugify } from "@/lib/queries/realms";

export const revalidate = 604800;

export function generateStaticParams() {
  return getRealmStaticParams();
}

export default async function RealmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const realm = getRealmBySlug(slug);
  if (!realm) notFound();

  const events = getRealmEvents(realm.realm, 1000);
  const adjacent = getAdjacentRealms(realm);
  const conf = (realm.avgConfidence * 100).toFixed(0);

  return (
    <div className="page">
      <article className="realm-card is-spotlight realm-detail-card">
        <div className="realm-card__head">
          <div className="stage-num">REALM PROFILE · {events.length} EVENTS</div>
          <h1 className="realm-name">{realm.realm}</h1>
          <div className="range">ch{realm.startChapter}-{realm.endChapter} · {realm.chapters} 章跨度 · {realm.eventChapters} 章有事件</div>
          <div className="age">{realm.startAge} → {realm.endAge}</div>
        </div>
        <div className="realm-card__stats">
          <div className="rstat"><div className="n cinnabar tnum">{realm.battles}</div><div className="l">战斗章节</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.kills}</div><div className="l">明确击杀</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.flees}</div><div className="l">跑路</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.nearDeaths}</div><div className="l">濒死</div></div>
          <div className="rstat"><div className="n gold tnum">{realm.treasures}</div><div className="l">得宝</div></div>
          <div className="rstat"><div className="n jade tnum">{realm.secretRealms}</div><div className="l">秘境</div></div>
          <div className="rstat"><div className="n moss tnum">{realm.relationships}</div><div className="l">结识</div></div>
          <div className="rstat"><div className="n gold tnum">{realm.refining + realm.lifespanGains}</div><div className="l">丹药/寿元</div></div>
        </div>
        <div className="realm-card__foot">
          <div>待复核 <strong>{realm.needsReview}</strong> · 平均置信 {realm.avgConfidence.toFixed(3)}</div>
          <div className="conf">
            <span>置信度 {conf}%</span>
            <span className="bar"><div style={{ width: `${conf}%` }} /></span>
          </div>
        </div>
      </article>

      <SectionHeader
        kicker="境界事件流"
        en="REALM EVENT STREAM"
        title={`${realm.realm} 全部事件`}
        meta={`ch${realm.startChapter}-${realm.endChapter}`}
      />
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
              {event.flags.length > 0 ? (
                <div className="flag-list" style={{ marginTop: 6 }}>
                  {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} />)}
                </div>
              ) : null}
            </div>
            <div className="meta-end">
              <EventTypeTag type={event.type} />
              <ConfPill conf={event.conf} review={event.review} />
            </div>
          </Link>
        ))}
      </div>

      <nav className="pager" style={{ marginTop: 24 }}>
        {adjacent.previous ? (
          <Link className="kbd" href={`/realms/${slugify(adjacent.previous.realm)}`}>← 上一境界 · {adjacent.previous.realm}</Link>
        ) : <span />}
        {adjacent.next ? (
          <Link className="kbd" href={`/realms/${slugify(adjacent.next.realm)}`}>{adjacent.next.realm} · 下一境界 →</Link>
        ) : null}
      </nav>
    </div>
  );
}
