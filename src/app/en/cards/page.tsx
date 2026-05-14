import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";
import { SHARE_CARDS } from "@/lib/cards";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li Share Cards · English",
  description: "Preview and open 1200x630 share-card images from the Han Li Life Database.",
  alternates: {
    canonical: "/en/cards",
    languages: { "zh-CN": "/cards", en: "/en/cards" },
  },
};

export default function EnglishCardsPage() {
  return (
    <div className="page">
      <SectionHeader
        kicker="Share cards" en="SHARE CARDS · 1200×630"
        title="One image for one life phase"
        meta="4 TEMPLATES · NEXT/OG"
      />
      <div className="cards-grid">
        {SHARE_CARDS.map(c => (
          <div className="share-card-frame" key={c.slug}>
            <div className="crumb">
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "var(--ink)" }}>{c.en}</span>
                <span>{c.sub}</span>
              </div>
              <div className="actions">
                <Link href={`/en/cards/${c.slug}`}>Details</Link>
                <Link href={`/cards/${c.slug}/opengraph-image`} target="_blank">Open PNG</Link>
              </div>
            </div>
            <div className="share-stage">
              <Image
                src={`/cards/${c.slug}/opengraph-image`}
                alt={c.en}
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
        Share cards are generated as 1200×630 PNG images. The English page links to the same image endpoints while the surrounding context is localized.
      </div>
    </div>
  );
}
