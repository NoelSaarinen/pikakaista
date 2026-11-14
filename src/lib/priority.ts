// Long-term risk priority, kept separate from urgency.
//
// Urgency comes from the alarm rules (rules.ts) and decides the placement. Long-term
// risk is the validated PLCOm2012 6-year lung cancer probability (plco.ts), used as
// published. It only orders people inside the same urgency and shows who is above the
// paper's screening threshold. It never moves anyone off the fast lane.
// Literature evidence does not change this score (decision 2026-11-14).

import { PLCO_CATEGORY, PLCO_THRESHOLD, plcoAgeStandardised, plcoRisk, type PlcoTerm } from "./plco";
import type { PlcoInputs, SurveyResponse } from "./types";

export interface RiskPriority {
  model: "PLCOm2012";
  /** 6-year lung cancer risk in percent (e.g. 2.31). 0 when the model does not apply. */
  score: number;
  /**
   * The same risk with age set to 62 for everyone (percent): only the other
   * research-based risk factors count. Team equity choice for ordering, not validated.
   */
  ageStandardisedScore: number;
  /** Unrounded 6-year probability (0–1). Threshold decisions and sums use this, not the rounded percent. */
  probability: number;
  /** Unrounded age-standardised probability (0–1). */
  ageStandardisedProbability: number;
  level: "high" | "medium" | "low" | "not_applicable";
  /** At or above the paper's 1.3455 % threshold. */
  aboveThreshold: boolean;
  /** Model terms, largest effect first. `factor` is the odds multiplier (e^logit). */
  contributions: (PlcoTerm & { factor: number })[];
  imputed: (keyof PlcoInputs)[];
}

export const PRIORITY_LEVEL_LABEL: Record<RiskPriority["level"], string> = {
  high: "Korkea riski (≥ 2 %)",
  medium: "Kohtalainen riski (1–2 %)",
  low: "Matala riski (< 1 %)",
  not_applicable: "Ei arvioitavissa (ei tupakoinut)",
};

export const IMPUTED_LABEL: Record<keyof PlcoInputs, string> = {
  race: "väestöluokka (vertailuluokka käytössä)",
  education: "koulutus",
  bmi: "painoindeksi",
  copd: "keuhkoahtaumatauti",
  personal_cancer_history: "aiempi syöpä",
  family_history_lung_cancer: "suvun keuhkosyöpä",
  cigs_per_day: "savukkeita päivässä",
  smoking_years: "tupakointivuodet",
  years_since_quit: "lopettamisesta kulunut aika",
};

export function formatRisk(score: number): string {
  return `${score.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function riskPriority(r: SurveyResponse): RiskPriority {
  const result = plcoRisk(r);
  if (!result) return { model: "PLCOm2012", score: 0, ageStandardisedScore: 0, probability: 0, ageStandardisedProbability: 0, level: "not_applicable", aboveThreshold: false, contributions: [], imputed: [] };
  const p = result.probability;
  const standardised = plcoAgeStandardised(result);
  return {
    model: "PLCOm2012",
    score: Math.round(p * 10000) / 100,
    ageStandardisedScore: Math.round(standardised * 10000) / 100,
    probability: p,
    ageStandardisedProbability: standardised,
    level: p >= PLCO_CATEGORY.high ? "high" : p >= PLCO_CATEGORY.medium ? "medium" : "low",
    aboveThreshold: p >= PLCO_THRESHOLD,
    contributions: result.terms
      .filter((t) => Math.abs(t.logit) >= 0.005)
      .map((t) => ({ ...t, factor: Math.round(Math.exp(t.logit) * 100) / 100 }))
      .sort((a, b) => Math.abs(b.logit) - Math.abs(a.logit)),
    imputed: result.imputed,
  };
}
