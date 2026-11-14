import { NextResponse } from "next/server";
import { analyzeSurvey } from "@/lib/analysis";
import { riskPriority } from "@/lib/priority";
import { evaluate } from "@/lib/rules";
import { findResponse, store } from "@/lib/store";

export const dynamic = "force-dynamic";

// Preliminary AI analysis of one answer: urgency (alarm rules) and long-term risk
// (PLCOm2012) kept apart, plus adaptive follow-up questions. Cached per id.
export async function POST(request: Request) {
  const { id } = (await request.json()) as { id?: string };
  const response = id ? findResponse(id) : undefined;
  if (!response) return NextResponse.json({ error: "not found" }, { status: 404 });

  const rule = evaluate(response);
  const priority = riskPriority(response);
  const analysis = store.analyses[response.id] ?? (await analyzeSurvey(response, rule, priority));
  if (analysis.generatedBy === "llm") store.analyses[response.id] = analysis;
  return NextResponse.json({ ...analysis, priority, answers: store.followups[response.id] ?? {} });
}
