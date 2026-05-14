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
    title: `${item.en} · Han Li Life Database`,
    openGraph: {
      title: item.en,
      description: item.sub,
      images: [`/cards/${item.slug}/opengraph-image`],
    },
    alternates: {
      canonical: `/en/cards/${item.slug}`,
      languages: { "zh-CN": `/cards/${item.slug}`, en: `/en/cards/${item.slug}` },
    },
  };
}

export default async function EnglishCardLandingPage({ params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const item = getShareCard(card);
  if (!item) notFound();

  return (
    <div className="page">
      <SectionHeader kicker="Share card" en={item.sub} title={item.en} meta="1200 × 630 PNG" />
      <div className="share-card-frame">
        <div className="crumb">
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--ink)" }}>{item.en}</span>
            <span>{item.sub}</span>
          </div>
          <div className="actions">
            <Link href={`/cards/${item.slug}/opengraph-image`} target="_blank">Open PNG</Link>
          </div>
        </div>
        <div className="share-stage">
          <Image
            src={`/cards/${item.slug}/opengraph-image`}
            alt={item.en}
            width={1200}
            height={630}
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
      <div className="note" style={{ marginTop: 24 }}>
        <Link href="/en/cards">Back to share cards</Link>
      </div>
    </div>
  );
}
