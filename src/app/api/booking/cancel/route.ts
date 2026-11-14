import { NextResponse } from "next/server";
import { cancelBooking, findResponse } from "@/lib/store";

export const dynamic = "force-dynamic";

// A physician cancels a simulated booking. The person stays on the list without a time.
export async function POST(request: Request) {
  const { id } = (await request.json()) as { id?: string };
  if (!id || !findResponse(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  cancelBooking(id);
  return NextResponse.json({ id, cancelled: true });
}
