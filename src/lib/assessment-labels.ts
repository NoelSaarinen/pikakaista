// Client-safe types and labels for the AI assessment (no LLM code here).

import { TIER_LABEL } from "./booking";

export type PriorityLevel = "A" | "B" | "C";

export const LEVEL_LABEL: Record<PriorityLevel, string> = {
  A: TIER_LABEL.A,
  B: TIER_LABEL.B,
  C: "C · Ei automaattista aikaa, lääkäri päättää",
};

export interface Assessment {
  ruleLevel: PriorityLevel;
  ruleReason: string;
  suggestedLevel: PriorityLevel;
  /** "same", "higher" (physician weighs it) or "lower" (rules keep their level). */
  comparison: "same" | "higher" | "lower";
  summary: string;
  reasons: string[];
  evidence: string[];
  uncertainties: string[];
  generatedBy: "llm" | "template";
}
