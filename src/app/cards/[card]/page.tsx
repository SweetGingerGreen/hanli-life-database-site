import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/atoms";

export const revalidate = 604800;

const CARDS = [
  { slug: "resume-yuanying-mid", title: "阶段履历卡 · 元婴中期", sub: "LIFE-PHASE RESUME" },
  { slug: "profile-jiedan-1", title: "境界档案卡 · 结丹初期", sub: "REALM PROFILE" },
  { slug: "risk-annual", title: "风险年报卡 · 全局", sub: "RISK ANNUAL" },
  { slug: "seclusion-ledger", title: "资产清单卡 · 闭关年报", sub: "ASSET LEDGER" },
];

function getCard(slug: string) {
  return CARDS.find((card) => card.slug === slug) ?? null;
}

export function generateStaticParams() {
  return CARDS.map((card) => ({ card: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ card: string }> }): Promise<Metadata> {
  const { card } = await params;
  const item = getCard(card);
  if (!item) return {};
  return {
    title: `${item.title} · 韩立人生数据库`,
    openGraph: {
      title: item.title,
      description: item.sub,
      images: [`/cards/${item.slug}/opengraph-image`],
    },
  };
}

export default async function CardLandingPage({ params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const item = getCard(card);
  if (!item) notFound();

  return (
    <div className="page">
      <SectionHeader kicker="分享卡" en={item.sub} title={item.title} meta="1200 × 630 PNG" />
      <div className="share-card-frame">
        <div className="crumb">
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--ink)" }}>{item.title}</span>
            <span>{item.sub}</span>
          </div>
          <div className="actions">
            <Link href={`/cards/${item.slug}/opengraph-image`} target="_blank">打开 PNG</Link>
          </div>
        </div>
        <div className="share-stage">
          <Image
            src={`/cards/${item.slug}/opengraph-image`}
            alt={item.title}
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
