// src/app/cards/page.tsx — preview grid of the 4 share cards
import { SectionHeader } from "@/components/ui/atoms";
import { SHARE_CARDS } from "@/lib/cards";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 604800;

export default function CardsPage() {
  return (
    <div className="page">
      <SectionHeader
        kicker="分享卡" en="SHARE CARDS · 1200×630"
        title="一张图说清楚一段人生"
        meta="4 TEMPLATES · NEXT/OG"
      />
      <div className="cards-grid">
        {SHARE_CARDS.map(c => (
          <div className="share-card-frame" key={c.slug}>
            <div className="crumb">
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "var(--ink)" }}>{c.zh}</span>
                <span>{c.sub}</span>
              </div>
              <div className="actions">
                <Link href={`/cards/${c.slug}`}>详情</Link>
                <Link href={`/cards/${c.slug}/opengraph-image`} target="_blank">下载 PNG</Link>
              </div>
            </div>
            <div className="share-stage">
              <Image
                src={`/cards/${c.slug}/opengraph-image`}
                alt={c.zh}
                width={1200}
                height={630}
                unoptimized
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between",
                           fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>
              <span>{c.slug}.png</span>
              <span>1200 × 630 · next/og</span>
            </div>
          </div>
        ))}
      </div>
      <div className="note" style={{ marginTop: 28 }}>
        分享卡通过 <span className="mono">next/og</span> 在边缘运行时实时生成 1200×630 PNG，
        Twitter / 微博 / 小红书 的 OG 预览会自动抓取。
      </div>
    </div>
  );
}
