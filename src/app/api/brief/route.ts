import { NextResponse } from "next/server";
import counties from "@/data/counties.json";
import sources from "@/data/sources.json";
import { writeBrief, type BriefMode } from "@/lib/brief";
import { SCENARIOS, simulateDoors, simulateRange, type SimulationParams } from "@/lib/simulation";
import type { County, SourceRef } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { countyId, overrides, mode } = (await request.json()) as { countyId?: string; overrides?: Partial<SimulationParams>; mode?: BriefMode };
  const county = (counties as County[]).find((c) => c.id === countyId);
  if (!county) return NextResponse.json({ error: "not found" }, { status: 404 });
  const range = simulateRange(county, overrides ?? {});
  const doors = simulateDoors(county, { ...SCENARIOS.base, ...(overrides ?? {}) });
  const brief = await writeBrief(county, range, doors, mode === "doors" ? "doors" : "doors_survey", sources as SourceRef[]);
  return NextResponse.json(brief);
}
