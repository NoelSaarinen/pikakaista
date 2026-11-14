import { NextResponse } from "next/server";
import { evaluate } from "@/lib/rules";
import { findResponse, store } from "@/lib/store";
import { summarizeCase } from "@/lib/summarize";

export const dynamic = "force-dynamic";

// AI case summary for one person. Cached per id so repeated clicks cost nothing.
export async function POST(request: Request) {
  const { id } = (await request.json()) as { id?: string };
  const response = id ? findResponse(id) : undefined;
  if (!response) return NextResponse.json({ error: "not found" }, { status: 404 });

  const cached = store.summaries[response.id];
  if (cached) return NextResponse.json({ ...cached, physician_decision: store.decisions[response.id] ?? null });

  const summary = await summarizeCase(response, evaluate(response));
  if (summary.generated_by === "llm") store.summaries[response.id] = summary;
  return NextResponse.json({ ...summary, physician_decision: store.decisions[response.id] ?? null });
}
