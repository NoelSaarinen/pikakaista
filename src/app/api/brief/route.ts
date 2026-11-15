import { NextResponse } from "next/server";
import counties from "@/data/counties.json";
import { writeBrief, type BriefMode } from "@/lib/brief";
import { allSources } from "@/lib/regional";
import { SCENARIOS, simulateDoors, simulateRange, type SimulationParams } from "@/lib/simulation";
import type { County } from "@/lib/types";

export const dynamic = "force-dynamic";

// Cached per county, settings and mode, so switching back to a county costs no new model call.
const globalCache = globalThis as unknown as { __briefCache?: Map<string, { text: string; generated_by: "llm" | "template" }> };
const cache = (globalCache.__briefCache ??= new Map());

export async function POST(request: Request) {
  // `fresh` comes from the "Kirjoita uudelleen" button: skip the cache and replace the cached text.
  const { countyId, overrides, mode, fresh } = (await request.json()) as { countyId?: string; overrides?: Partial<SimulationParams>; mode?: BriefMode; fresh?: boolean };
  const county = (counties as County[]).find((c) => c.id === countyId);
  if (!county) return NextResponse.json({ error: "not found" }, { status: 404 });
  const range = simulateRange(county, overrides ?? {});
  const doors = simulateDoors(county, { ...SCENARIOS.base, ...(overrides ?? {}) });
  const key = JSON.stringify([county.id, overrides ?? {}, mode ?? "doors_survey"]);
  const cached = cache.get(key);
  if (cached && !fresh) return NextResponse.json(cached);
  const brief = await writeBrief(county, range, doors, mode === "doors" ? "doors" : "doors_survey", allSources);
  if (brief.generated_by === "llm") cache.set(key, brief);
  return NextResponse.json(brief);
}
