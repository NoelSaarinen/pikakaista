// In-memory demo store. Holds the synthetic people, survey answers given live in
// the demo, physician decisions and cached case summaries. Resets on server restart.

import synthetic from "@/data/synthetic/responses.json";
import { buildPathway, type Pathway } from "./pathway";
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
  /** The physician's decision: made live in the demo, or a synthetic earlier one from the pathway. */
  decision: Placement | null;
  live: boolean;
  pathway: Pathway;
}

/** Every person with rules, decision and synthetic care pathway, live answers first. */
export function patients(): WorklistItem[] {
  const liveIds = new Set(store.live.map((r) => r.id));
  return allResponses().map((response) => {
    const rule = evaluate(response);
    const live = liveIds.has(response.id);
    const liveDecision = store.decisions[response.id] ?? null;
    const pathway = buildPathway(response, rule, liveDecision, live);
    return { response, rule, decision: liveDecision ?? pathway.priorDecision, live, pathway };
  });
}

export function worklist(): { items: WorklistItem[]; counts: Record<Placement, number>; total: number } {
  const all = patients();
  const counts: Record<Placement, number> = { direct_ct: 0, physician_fast: 0, normal_route: 0, not_eligible: 0 };
  for (const e of all) counts[e.rule.placement] += 1;
  const items = all
    .filter((e) => e.rule.placement === "direct_ct" || e.rule.placement === "physician_fast")
    .sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || compareForWorklist(a.rule, b.rule));
  return { items, counts, total: all.length };
}
