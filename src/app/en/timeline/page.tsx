import type { Metadata } from "next";
import { Suspense } from "react";
import { TimelineExplorer } from "@/components/events/TimelineExplorer";
import { getFlagCounts, queryEvents } from "@/lib/queries/timeline";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li Timeline · English",
  description: "Filter Han Li's cultivation life by chapter, realm, battle, treasure, secret realm, and data quality.",
  alternates: {
    canonical: "/en/timeline",
    languages: { "zh-CN": "/timeline", en: "/en/timeline" },
  },
};

export default function EnglishTimelinePage() {
  const initialEvents = queryEvents({ limit: 500 });
  const flagCounts = getFlagCounts();

  return (
    <Suspense fallback={null}>
      <TimelineExplorer initialEvents={initialEvents} flagCounts={flagCounts} locale="en" />
    </Suspense>
  );
}
