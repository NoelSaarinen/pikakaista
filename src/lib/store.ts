// In-memory demo store. Holds the synthetic people, survey answers given live in
// the demo, physician decisions, cached case summaries, follow-up answers and the
// literature evidence. Resets on server restart (evidence reloads from the snapshot).

import literatureSnapshot from "@/data/literature.json";
import synthetic from "@/data/synthetic/responses.json";
import type { SurveyAnalysis } from "./analysis";
import { summarizeFactorEvidence, type Evidence } from "./literature/evidence";
import { buildPathway, type Pathway } from "./pathway";
import { riskPriority, type RiskPriority } from "./priority";
import { compareForWorklist, evaluate } from "./rules";
import type { CaseSummary, Placement, RuleResult, SurveyResponse } from "./types";

export interface LiteratureState {
  evidence: Evidence[];
  lastRefresh: string | null;
}

interface Store {
  live: SurveyResponse[];
  decisions: Record<string, Placement>;
  summaries: Record<string, CaseSummary>;
  analyses: Record<string, SurveyAnalysis>;
  /** Answers to the adaptive follow-up questions, by person id and question id. */
  followups: Record<string, Record<string, string>>;
  literature: LiteratureState;
}

const snapshot = literatureSnapshot as { fetchedAt: string | null; evidence: Evidence[] };

const globalStore = globalThis as unknown as { __fastLaneStore?: Store };
export const store: Store = (globalStore.__fastLaneStore ??= {
  live: [],
  decisions: {},
  summaries: {},
  analyses: {},
  followups: {},
  literature: { evidence: snapshot.evidence, lastRefresh: snapshot.fetchedAt },
});
// Stores created before these fields existed (dev hot reload) get them here.
store.analyses ??= {};
store.followups ??= {};
store.literature ??= { evidence: snapshot.evidence, lastRefresh: snapshot.fetchedAt };

export function allResponses(): SurveyResponse[] {
  return [...store.live, ...(synthetic as SurveyResponse[])];
}

export function findResponse(id: string): SurveyResponse | undefined {
  return allResponses().find((r) => r.id === id);
}

export function factorEvidence() {
  return summarizeFactorEvidence(store.literature.evidence);
}

export interface WorklistItem {
  response: SurveyResponse;
  rule: RuleResult;
  /** The physician's decision: made live in the demo, or a synthetic earlier one from the pathway. */
  decision: Placement | null;
  live: boolean;
  pathway: Pathway;
  priority: RiskPriority;
}

/** Every person with rules, decision, synthetic care pathway and risk priority. */
export function patients(): WorklistItem[] {
  const liveIds = new Set(store.live.map((r) => r.id));
  return allResponses().map((response) => {
    const rule = evaluate(response);
    const live = liveIds.has(response.id);
    const liveDecision = store.decisions[response.id] ?? null;
    const pathway = buildPathway(response, rule, liveDecision, live);
    const priority = riskPriority(response);
    return { response, rule, decision: liveDecision ?? pathway.priorDecision, live, pathway, priority };
  });
}

const RANK: Record<Placement, number> = { direct_ct: 0, physician_fast: 1, normal_route: 2, not_eligible: 3 };

/**
 * Physician's list order: live answers, then the rules' urgency (placement and alarm
 * score), then the PLCOm2012 6-year risk. Risk only breaks ties inside the same
 * urgency, so it never outranks an alarm sign.
 */
export function compareWithPriority(a: WorklistItem, b: WorklistItem): number {
  return (
    RANK[a.rule.placement] - RANK[b.rule.placement] ||
    b.rule.score - a.rule.score ||
    b.priority.score - a.priority.score ||
    compareForWorklist(a.rule, b.rule)
  );
}

export function worklist(): { items: WorklistItem[]; counts: Record<Placement, number>; total: number } {
  const all = patients();
  const counts: Record<Placement, number> = { direct_ct: 0, physician_fast: 0, normal_route: 0, not_eligible: 0 };
  for (const e of all) counts[e.rule.placement] += 1;
  const items = all
    .filter((e) => e.rule.placement === "direct_ct" || e.rule.placement === "physician_fast")
    .sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || compareWithPriority(a, b));
  return { items, counts, total: all.length };
}
