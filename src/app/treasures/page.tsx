import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";
import { StoragePouchClient } from "@/components/treasures/StoragePouchClient";
import { CATEGORY_META, getFeaturedInventory, getInventoryData } from "@/lib/inventory";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "韩老魔的储物袋 · 韩立人生数据库",
  description: "按章节展示韩立获得、持有、消耗、失去和取回的法宝、丹药、功法、材料与战利品。",
  alternates: {
    canonical: "/treasures",
    languages: { "zh-CN": "/treasures", en: "/en/treasures" },
  },
};

export default function TreasuresPage() {
  const { items, stats } = getInventoryData();
  const featured = getFeaturedInventory(items);

  return (
    <div className="page">
      <section className="pouch-hero">
        <SectionHeader
          kicker="韩老魔的储物袋"
          en="STORAGE POUCH"
          title="一眼看清：韩立袋里进了什么，又离开过什么"
          meta={`${stats.total} ITEMS · ${stats.records} RECORDS`}
          rail="gold"
        />
        <div className="pouch-hero__grid">
          <div className="pouch-hero__copy">
            <p>
              这里不是普通法宝表，而是把 <strong>{stats.records}</strong> 条得宝事件整理成
              <strong>{stats.total}</strong> 条物品线索。每件物品都保留入袋章节、境界、地点、最后出现章节和状态判断。
            </p>
            <p>
              灰显项目表示已有“消耗、炼化、交付、失去”等离袋线索；“失而复得”单独标出，避免把第 1290 章这类重得宝物误判为丢失。
            </p>
          </div>
          <div className="pouch-kpis">
            <div><strong>{stats.held + stats.regained}</strong><span>仍在袋中或已取回</span></div>
            <div><strong>{stats.left + stats.consumed}</strong><span>已离袋 / 已消耗</span></div>
            <div><strong>{stats.unknown}</strong><span>状态不明</span></div>
          </div>
        </div>
      </section>

      <section className="pouch-featured">
        <div className="pouch-featured__head">
          <span className="eyebrow gold">名物线索</span>
          <span>优先看这些东西，最像韩立资产流动的主线。</span>
        </div>
        <div className="pouch-featured__grid">
          {featured.map((item) => (
            <Link href={`/events/${item.acquiredAt.eventId}`} className={`pouch-featured__item is-${item.status}`} key={item.id}>
              <span className={`seal ${CATEGORY_META[item.category].tone}`}>{CATEGORY_META[item.category].seal}</span>
              <strong>{item.name}</strong>
              <small>ch{item.acquiredAt.chapterId} · {item.acquiredAt.realm}</small>
            </Link>
          ))}
        </div>
      </section>

      <StoragePouchClient items={items} stats={stats} />
    </div>
  );
}
