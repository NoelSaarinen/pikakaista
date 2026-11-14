import { NextResponse } from "next/server";
import { JOURNALS, PUBMED_QUERY } from "@/lib/literature/pubmed";
import { factorEvidence, store } from "@/lib/store";

export const dynamic = "force-dynamic";

// Literature evidence and a per-factor summary. Information only: the risk score is
// the validated PLCOm2012 model, which literature does not change.
export function GET() {
  const lit = store.literature;
  return NextResponse.json({
    evidence: [...lit.evidence].sort((a, b) => b.weight - a.weight || b.year - a.year || b.month - a.month),
    factors: factorEvidence(),
    lastRefresh: lit.lastRefresh,
    journals: JOURNALS,
    query: PUBMED_QUERY,
  });
}
