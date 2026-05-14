import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getEventTypes, getRealms, queryEventsWithTotal } from "@/lib/queries/timeline";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Han Li Events Database · English",
  description: "Search 1,998 structured Han Li life events by chapter, type, realm, confidence, treasure, character, or location.",
  alternates: {
    canonical: "/en/events",
    languages: { "zh-CN": "/events", en: "/en/events" },
  },
};

export default function EnglishEventsPage() {
  const eventTypes = getEventTypes();
  const realms = getRealms();
  const initialResult = queryEventsWithTotal({ limit: 200 });

  return (
    <Suspense fallback={null}>
      <EventsExplorer eventTypes={eventTypes} realms={realms} initialResult={initialResult} locale="en" />
    </Suspense>
  );
}
