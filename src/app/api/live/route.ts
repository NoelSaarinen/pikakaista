import { NextResponse } from "next/server";
import { store, worklist } from "@/lib/store";

export const dynamic = "force-dynamic";

// Small, cheap status for live updates: the data version, the newest changes and
// the current totals. Every view polls this and refetches its own data on change.
export function GET() {
  const w = worklist();
  return NextResponse.json({
    version: store.version,
    events: store.events.slice(0, 5),
    totals: {
      responses: w.total,
      live: store.live.length,
      onList: w.items.length,
      redFlags: w.items.filter((x) => x.rule.redFlag).length,
      symptomReview: w.items.filter((x) => x.rule.symptomReviewRequired).length,
      fastLane: w.counts.direct_ct + w.counts.physician_fast,
      booked: Object.keys(store.booking.bookings).length,
      queued: store.booking.queue.length,
    },
  });
}
