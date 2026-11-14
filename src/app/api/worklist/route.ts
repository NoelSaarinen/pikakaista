import { NextResponse } from "next/server";
import { worklist } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(worklist());
}
