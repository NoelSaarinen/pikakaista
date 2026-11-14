// In-memory demo store. Holds the synthetic people, survey answers given live in
// the demo, physician decisions and cached case summaries. Resets on server restart.

import synthetic from "@/data/synthetic/responses.json";
import { compareForWorklist, evaluate } from "./rules";
import type { CaseSummary, Placement, RuleResult, SurveyResponse } from "./types";

interface Store {
  live: SurveyResponse[];
  decisions: Record<string, Placement>;
  summaries: Record<string, CaseSummary>;
}

const globalStore = globalThis as unknown as { __fastLaneStore?: Store };
export const store: Store = (globalStore.__fastLaneStore ??= { live: [], decisions: {}, summaries: {} });

export function allResponses(): SurveyResponse[] {
  return [...store.live, ...(synthetic as SurveyResponse[])];
}

export function findResponse(id: string): SurveyResponse | undefined {
  return allResponses().find((r) => r.id === id);
}

export interface WorklistItem {
  response: SurveyResponse;
  rule: RuleResult;
  decision: Placement | null;
  live: boolean;
}

export function worklist(): { items: WorklistItem[]; counts: Record<Placement, number>; total: number } {
  const liveIds = new Set(store.live.map((r) => r.id));
  const evaluated = allResponses().map((response) => ({ response, rule: evaluate(response) }));
  const counts: Record<Placement, number> = { direct_ct: 0, physician_fast: 0, normal_route: 0, not_eligible: 0 };
  for (const e of evaluated) counts[e.rule.placement] += 1;
  const items = evaluated
    .filter((e) => e.rule.placement === "direct_ct" || e.rule.placement === "physician_fast")
    .sort((a, b) => (liveIds.has(b.response.id) ? 1 : 0) - (liveIds.has(a.response.id) ? 1 : 0) || compareForWorklist(a.rule, b.rule))
    .map((e) => ({ ...e, decision: store.decisions[e.response.id] ?? null, live: liveIds.has(e.response.id) }));
  return { items, counts, total: evaluated.length };
}
