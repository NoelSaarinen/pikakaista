import { NextResponse } from "next/server";
import { hasApiKey, MODEL } from "@/lib/llm";

export const dynamic = "force-dynamic";

// Whether the Claude API is configured. Never returns the key itself.
export function GET() {
  return NextResponse.json({ enabled: hasApiKey(), model: MODEL });
}
