// Rebuilds the literature evidence from PubMed through the running dev server and saves
// it as src/data/literature.json, so the demo works offline with the same articles.
// Usage: npm run dev (in another terminal), then: node scripts/save-literature-snapshot.mjs [count]
// With ANTHROPIC_API_KEY set for the server, Claude classifies the abstracts; otherwise
// the keyword fallback does. Abstracts are not saved, only the fields the demo shows.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.env.DEMO_URL ?? "http://localhost:3000";
const count = Number(process.argv[2] ?? 40);

const refresh = await fetch(`${base}/api/evidence/refresh?rebuild=1&max=${count}`, { method: "POST" });
const summary = await refresh.json();
if (!refresh.ok) throw new Error(`Refresh failed: ${JSON.stringify(summary)}`);

const state = await (await fetch(`${base}/api/evidence`)).json();
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "literature.json");
writeFileSync(out, JSON.stringify({ fetchedAt: state.lastRefresh, evidence: state.evidence }, null, 2) + "\n");
const llm = state.evidence.filter((e) => e.extractedBy === "llm").length;
console.log(`Saved ${state.evidence.length} articles (${llm} classified by Claude) to ${out}`);
