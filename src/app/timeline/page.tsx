import { Suspense } from "react";
import { TimelineExplorer } from "@/components/events/TimelineExplorer";
import { getFlagCounts, queryEvents } from "@/lib/queries/timeline";

export const revalidate = 604800;

export default function TimelinePage() {
  const initialEvents = queryEvents({ limit: 500 });
  const flagCounts = getFlagCounts();

  return (
    <Suspense fallback={null}>
      <TimelineExplorer initialEvents={initialEvents} flagCounts={flagCounts} />
    </Suspense>
  );
}
