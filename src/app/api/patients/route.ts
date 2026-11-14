import { NextResponse } from "next/server";
import { patients } from "@/lib/store";

export const dynamic = "force-dynamic";

// Every synthetic person with engagement and current care-pathway stage.
export function GET() {
  return NextResponse.json({ items: patients() });
}
