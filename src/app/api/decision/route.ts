import { NextResponse } from "next/server";
import { findResponse, markChanged, store } from "@/lib/store";
import type { Placement } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: Placement[] = ["direct_ct", "physician_fast", "normal_route"];

// The physician approves or changes the proposed placement. Only the physician decides.
export async function POST(request: Request) {
  const { id, placement } = (await request.json()) as { id?: string; placement?: Placement };
  if (!id || !findResponse(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!placement || !ALLOWED.includes(placement)) return NextResponse.json({ error: "invalid placement" }, { status: 400 });
  store.decisions[id] = placement;
  markChanged("decision", `Lääkäri päätti: ${id}`, id);
  return NextResponse.json({ id, placement });
}
