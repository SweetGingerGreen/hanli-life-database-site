import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";
import { StoragePouchClient } from "@/components/treasures/StoragePouchClient";
import { CATEGORY_META, getFeaturedInventory, getInventoryData } from "@/lib/inventory";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li's Storage Pouch · English",
  description: "A lifecycle view of Han Li's treasures, pills, manuals, materials, loot, acquisitions, losses, consumption, and regained items.",
  alternates: {
    canonical: "/en/treasures",
    languages: { "zh-CN": "/treasures", en: "/en/treasures" },
  },
};

export default function EnglishTreasuresPage() {
  const { items, stats } = getInventoryData();
  const featured = getFeaturedInventory(items);

  return (
    <div className="page">
      <section className="pouch-hero">
        <SectionHeader
          kicker="Storage pouch"
          en="HAN LI'S INVENTORY"
          title="What entered Han Li's pouch, and what later left?"
          meta={`${stats.total} ITEMS · ${stats.records} RECORDS`}
          rail="gold"
        />
        <div className="pouch-hero__grid">
          <div className="pouch-hero__copy">
            <p>
              This view turns <strong>{stats.records}</strong> treasure events into <strong>{stats.total}</strong> item threads.
              Each item keeps its acquisition chapter, realm, location, last sighting, and inferred lifecycle status.
            </p>
            <p>
              Greyed items have evidence of being consumed, refined, handed over, or lost. Regained items are kept separate so
              records such as chapter 1290 are not treated as simple losses.
            </p>
          </div>
          <div className="pouch-kpis">
            <div><strong>{stats.held + stats.regained}</strong><span>in pouch or regained</span></div>
            <div><strong>{stats.left + stats.consumed}</strong><span>left / consumed</span></div>
            <div><strong>{stats.unknown}</strong><span>uncertain</span></div>
          </div>
        </div>
      </section>

      <section className="pouch-featured">
        <div className="pouch-featured__head">
          <span className="eyebrow gold">Signature items</span>
          <span>Start with these threads; they read like Han Li&apos;s asset history.</span>
        </div>
        <div className="pouch-featured__grid">
          {featured.map((item) => (
            <Link href={`/en/events/${item.acquiredAt.eventId}`} className={`pouch-featured__item is-${item.status}`} key={item.id}>
              <span className={`seal ${CATEGORY_META[item.category].tone}`}>{CATEGORY_META[item.category].seal}</span>
              <strong>{item.name}</strong>
              <small>ch{item.acquiredAt.chapterId} · {item.acquiredAt.realm}</small>
            </Link>
          ))}
        </div>
      </section>

      <StoragePouchClient items={items} stats={stats} locale="en" />
    </div>
  );
}
