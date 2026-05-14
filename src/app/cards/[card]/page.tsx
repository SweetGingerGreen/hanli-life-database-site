import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/atoms";
import { SHARE_CARDS, getShareCard } from "@/lib/cards";

export const revalidate = 604800;

export function generateStaticParams() {
  return SHARE_CARDS.map((card) => ({ card: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ card: string }> }): Promise<Metadata> {
  const { card } = await params;
  const item = getShareCard(card);
  if (!item) return {};
  return {
    title: `${item.zh} · 韩立人生数据库`,
    openGraph: {
      title: item.zh,
      description: item.sub,
      images: [`/cards/${item.slug}/opengraph-image`],
    },
  };
}

export default async function CardLandingPage({ params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const item = getShareCard(card);
  if (!item) notFound();

  return (
    <div className="page">
      <SectionHeader kicker="分享卡" en={item.sub} title={item.zh} meta="1200 × 630 PNG" />
      <div className="share-card-frame">
        <div className="crumb">
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--ink)" }}>{item.zh}</span>
            <span>{item.sub}</span>
          </div>
          <div className="actions">
            <Link href={`/cards/${item.slug}/opengraph-image`} target="_blank">打开 PNG</Link>
          </div>
        </div>
        <div className="share-stage">
          <Image
            src={`/cards/${item.slug}/opengraph-image`}
            alt={item.zh}
            width={1200}
            height={630}
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
      <div className="note" style={{ marginTop: 24 }}>
        <Link href="/cards">返回分享卡列表</Link>
      </div>
    </div>
  );
}
