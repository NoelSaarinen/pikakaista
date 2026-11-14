import { NextResponse } from "next/server";
import { fetchNewEvidence } from "@/lib/literature/refresh";
import { markChanged, store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

let running: Promise<unknown> | null = null;

// Fetches the newest PubMed articles and adds only ones not used before.
// Approved multipliers stay as they are until a physician approves again.
// ?rebuild=1 drops the current list and classifies the newest articles from scratch,
// e.g. after an API key is added. ?max=N sets the batch size (default 20, max 60).
export async function POST(request: Request) {
  if (running) return NextResponse.json({ error: "Päivitys on jo käynnissä" }, { status: 409 });
  const url = new URL(request.url);
  const rebuild = url.searchParams.get("rebuild") === "1";
  const maxNew = Math.min(60, Math.max(1, Number(url.searchParams.get("max")) || 20));
  try {
    const job = fetchNewEvidence(rebuild ? [] : store.literature.evidence, { maxNew, search: Math.max(60, maxNew) });
    running = job;
    const result = await job;
    store.literature.evidence = rebuild ? result.added : [...result.added, ...store.literature.evidence];
    store.literature.lastRefresh = new Date().toISOString();
    markChanged("evidence", `Kirjallisuus päivitetty: ${result.added.length} uutta artikkelia`);
    return NextResponse.json({
      checked: result.checked,
      added: result.added.length,
      duplicates: result.duplicates,
      remaining: result.remaining,
      total: store.literature.evidence.length,
    });
  } catch (error) {
    console.error("Literature refresh failed", error);
    return NextResponse.json({ error: "PubMed-haku epäonnistui. Tarkista verkkoyhteys." }, { status: 502 });
  } finally {
    running = null;
  }
}
