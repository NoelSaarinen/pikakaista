import { NextResponse } from "next/server";
import { assessCase, type Assessment } from "@/lib/assessment";
import { riskPriority } from "@/lib/priority";
import { evaluate } from "@/lib/rules";
import { findResponse, store } from "@/lib/store";

export const dynamic = "force-dynamic";

// AI assessment and suggested level for one answer. Cached per id and follow-up
// answers, so reopening a person does not call the model again.
const globalCache = globalThis as unknown as { __assessCache?: Map<string, Assessment> };
const cache = (globalCache.__assessCache ??= new Map());

export async function POST(request: Request) {
  const { id } = (await request.json()) as { id?: string };
  const response = id ? findResponse(id) : undefined;
  if (!response) return NextResponse.json({ error: "not found" }, { status: 404 });

  const followups = store.followups[response.id] ?? {};
  const key = `${response.id}:${JSON.stringify(followups)}`;
  let assessment = cache.get(key);
  if (!assessment) {
    assessment = await assessCase(response, evaluate(response), riskPriority(response), followups);
    if (assessment.generatedBy === "llm") cache.set(key, assessment);
  }
  return NextResponse.json(assessment);
}
