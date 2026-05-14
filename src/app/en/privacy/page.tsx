import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Privacy & Ads · Han Li Life Database",
  description: "Privacy, advertising, data boundary, and third-party service notes for the Han Li Life Database.",
  alternates: {
    canonical: "/en/privacy",
    languages: { "zh-CN": "/privacy", en: "/en/privacy" },
  },
};

export default function EnglishPrivacyPage() {
  return (
    <div className="page">
      <SectionHeader kicker="Privacy & ads" en="PRIVACY & ADS" title="Privacy, advertising, and data boundaries" meta="AD-READY" />
      <div className="methodology-grid">
        <div>
          <section className="mt-section">
            <h3>What this site collects</h3>
            <p>
              This site does not provide user accounts, comments, payments, or upload forms. It displays structured event fields,
              statistics, and methodology notes. Visitors are not asked to submit personal information.
            </p>
          </section>
          <section className="mt-section">
            <h3>Advertising and analytics services</h3>
            <p>
              The codebase is prepared for Google AdSense and Google tag. Third-party scripts load only when deployment
              environment variables such as <span className="mono">NEXT_PUBLIC_ADSENSE_CLIENT</span> or
              <span className="mono"> NEXT_PUBLIC_GOOGLE_TAG_ID</span> are present. These services may use cookies or similar
              technologies for ad delivery, frequency capping, measurement, and analytics.
            </p>
          </section>
          <section className="mt-section">
            <h3>Content boundary</h3>
            <p>
              This is an unofficial fan data project. It publishes extracted summaries, chapter numbers, event types,
              characters, treasures, locations, confidence scores, and methodology. It does not publish the full original
              chapter text or act as a substitute novel reader.
            </p>
          </section>
        </div>
        <aside>
          <section className="note">
            <div className="h">Ad review readiness</div>
            <span className="mono">/ads.txt</span> is wired. After obtaining an AdSense publisher id, deploy with
            <span className="mono"> NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-...</span>.
          </section>
          <section className="note" style={{ marginTop: 16 }}>
            <div className="h">Chinese edition</div>
            The Chinese edition is available at <Link href="/">/</Link>. Both editions share the same structured database.
          </section>
        </aside>
      </div>
    </div>
  );
}
