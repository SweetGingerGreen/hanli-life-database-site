import { Suspense } from "react";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getEventTypes, getRealms, queryEventsWithTotal } from "@/lib/queries/timeline";

export const revalidate = 604800;

export default function EventsPage() {
  const eventTypes = getEventTypes();
  const realms = getRealms();
  const initialResult = queryEventsWithTotal({ limit: 200 });

  return (
    <Suspense fallback={null}>
      <EventsExplorer eventTypes={eventTypes} realms={realms} initialResult={initialResult} />
    </Suspense>
  );
}
