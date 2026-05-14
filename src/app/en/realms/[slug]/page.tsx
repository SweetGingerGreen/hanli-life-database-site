import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfPill, EventTypeTag, FlagChipLabel, SectionHeader } from "@/components/ui/atoms";
import { getAdjacentRealms, getRealmBySlug, getRealmEvents, getRealmStaticParams, slugify } from "@/lib/queries/realms";
import { ageLabel, eventHref, realmHref, realmLabel, valueLabel } from "@/lib/i18n";

export const revalidate = 604800;

export function generateStaticParams() {
  return getRealmStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const realm = getRealmBySlug(slug);
  if (!realm) return {};
  return {
    title: `${realmLabel(realm.realm, "en")} · Han Li Realm Profile`,
    alternates: {
      canonical: `/en/realms/${slug}`,
      languages: { "zh-CN": `/realms/${slug}`, en: `/en/realms/${slug}` },
    },
  };
}

export default async function EnglishRealmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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
          <h1 className="realm-name">{realmLabel(realm.realm, "en")}</h1>
          <div className="range">ch{realm.startChapter}-{realm.endChapter} · {realm.chapters} chapter span · {realm.eventChapters} event chapters</div>
          <div className="age">{ageLabel(realm.startAge, "en")} → {ageLabel(realm.endAge, "en")}</div>
        </div>
        <div className="realm-card__stats">
          <div className="rstat"><div className="n cinnabar tnum">{realm.battles}</div><div className="l">battle ch.</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.kills}</div><div className="l">kills</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.flees}</div><div className="l">escapes</div></div>
          <div className="rstat"><div className="n cinnabar tnum">{realm.nearDeaths}</div><div className="l">near-death</div></div>
          <div className="rstat"><div className="n gold tnum">{realm.treasures}</div><div className="l">treasure</div></div>
          <div className="rstat"><div className="n jade tnum">{realm.secretRealms}</div><div className="l">secret realms</div></div>
          <div className="rstat"><div className="n moss tnum">{realm.relationships}</div><div className="l">social</div></div>
          <div className="rstat"><div className="n gold tnum">{realm.refining + realm.lifespanGains}</div><div className="l">alchemy/life</div></div>
        </div>
        <div className="realm-card__foot">
          <div>Needs review <strong>{realm.needsReview}</strong> · avg confidence {realm.avgConfidence.toFixed(3)}</div>
          <div className="conf">
            <span>confidence {conf}%</span>
            <span className="bar"><div style={{ width: `${conf}%` }} /></span>
          </div>
        </div>
      </article>

      <SectionHeader
        kicker="Realm event stream"
        en="REALM EVENT STREAM"
        title={`${realmLabel(realm.realm, "en")} events`}
        meta={`ch${realm.startChapter}-${realm.endChapter}`}
      />
      <div className="timeline-feed">
        {events.map((event) => (
          <Link className="tl-row" href={eventHref(event, "en")} key={event.id}>
            <div className="ch">
              <span className="n">ch{event.ch}</span>
              <span>#{event.id}</span>
            </div>
            <div className="realm">{realmLabel(event.realm, "en")}<span className="age">{ageLabel(event.age, "en")}</span></div>
            <div className="loc">{valueLabel(event.loc, "en")}</div>
            <div className="summary">
              {event.summary}
              {event.flags.length > 0 ? (
                <div className="flag-list" style={{ marginTop: 6 }}>
                  {event.flags.map((flag) => <FlagChipLabel key={flag} flag={flag} locale="en" />)}
                </div>
              ) : null}
            </div>
            <div className="meta-end">
              <EventTypeTag type={event.type} locale="en" />
              <ConfPill conf={event.conf} review={event.review} locale="en" />
            </div>
          </Link>
        ))}
      </div>

      <nav className="pager" style={{ marginTop: 24 }}>
        {adjacent.previous ? (
          <Link className="kbd" href={realmHref(slugify(adjacent.previous.realm), "en")}>← Previous · {realmLabel(adjacent.previous.realm, "en")}</Link>
        ) : <span />}
        {adjacent.next ? (
          <Link className="kbd" href={realmHref(slugify(adjacent.next.realm), "en")}>{realmLabel(adjacent.next.realm, "en")} · Next →</Link>
        ) : null}
      </nav>
    </div>
  );
}
