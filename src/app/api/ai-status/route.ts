import { NextResponse } from "next/server";
import { activeModel, hasApiKey, providerLabel } from "@/lib/llm";

export const dynamic = "force-dynamic";

// Which AI provider is configured (Verda or Claude). Never returns the key itself.
export function GET() {
  return NextResponse.json({ enabled: hasApiKey(), provider: providerLabel(), model: activeModel() });
}
