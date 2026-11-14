import { NextResponse } from "next/server";
import { QUESTION_BANK } from "@/lib/analysis";
import { findResponse, store } from "@/lib/store";

export const dynamic = "force-dynamic";

// Saves answers to the adaptive follow-up questions. Only question-bank ids are kept.
// The answers go to the physician's summary; they never change the rules' placement.
export async function POST(request: Request) {
  const { id, answers } = (await request.json()) as { id?: string; answers?: Record<string, unknown> };
  if (!id || !findResponse(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const clean: Record<string, string> = {};
  for (const q of QUESTION_BANK) {
    const v = answers?.[q.id];
    if (v !== undefined && v !== null && String(v).trim()) clean[q.id] = String(v).trim().slice(0, 200);
  }
  store.followups[id] = { ...(store.followups[id] ?? {}), ...clean };
  delete store.summaries[id];
  return NextResponse.json({ id, answers: store.followups[id] });
}
