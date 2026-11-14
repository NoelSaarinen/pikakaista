import { NextResponse } from "next/server";
import counties from "@/data/counties.json";
import { regionSlotsPerWeek, runBooking, slotsPerWeek, store } from "@/lib/store";
import type { County } from "@/lib/types";

export const dynamic = "force-dynamic";

function state() {
  const b = store.booking;
  return {
    regionId: b.regionId,
    slotsOverride: b.slotsOverride,
    slotsPerWeek: slotsPerWeek(),
    slotsTotal: b.slotsTotal,
    ranAt: b.ranAt,
    booked: Object.keys(b.bookings).length,
    queued: b.queue.length,
    lateBookings: Object.values(b.bookings).filter((x) => !x.withinTarget).length,
    cancelled: b.cancelled.length,
    regions: (counties as County[])
      .map((c) => ({ id: c.id, name: c.name, slotsPerWeek: Math.round(regionSlotsPerWeek(c.id)) }))
      .sort((a, b) => a.name.localeCompare(b.name, "fi")),
  };
}

// Simulated booking state and the regions with their fast-lane capacity.
export function GET() {
  return NextResponse.json(state());
}

// Books simulated physician appointments for high-risk people in priority order.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { regionId?: string; slotsOverride?: number | null };
  const regionId = (counties as County[]).some((c) => c.id === body.regionId) ? body.regionId! : store.booking.regionId;
  const override = body.slotsOverride === null || body.slotsOverride === undefined ? null : Math.min(500, Math.max(0, Math.round(Number(body.slotsOverride) || 0)));
  runBooking(regionId, override);
  return NextResponse.json(state());
}
