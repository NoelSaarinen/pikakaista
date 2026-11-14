// Deterministic alarm-symptom rules for the lung cancer fast lane.
//
// DEMO RULES, NOT CLINICAL CRITERIA. The symptoms come from the National Lung
// Cancer Programme 2026–2035 (Filha, pp. 2–4): cough, breathlessness, chest pain,
// weight loss, blood-tinged sputum and recurrent pneumonia. The thresholds are team
// assumptions and must be reviewed by Delun and the AstraZeneca mentors before the pitch.
//
// The rules alone decide who reaches the physician's list. AI never removes a flag.

import type { Placement, RuleReason, RuleResult, SurveyResponse } from "./types";
import { plcoRisk } from "./plco";

export const RULES_CONFIG = {
  /** Risk group: ages for the survey invitation (assumption, see PROJECT.md). */
  minAge: 55,
  maxAge: 80,
  /** Ever-smokers with at least this many pack-years are in the risk group (assumption). */
  minPackYears: 20,
  /** Cough lasting at least this many weeks counts as an alarm sign (assumption). */
  coughWeeks: 3,
  /** This many pneumonias in the last year counts as recurrent (assumption). */
  recurrentPneumonias: 2,
  /** An earlier respiratory visit within this many months, with symptoms still present (assumption). */
  recentVisitMonths: 6,
  /** Score at or above this proposes direct CT (assumption). */
  directCtScore: 3,
} as const;

const RESPIRATORY_REASONS = ["yskä", "cough", "hengenahdistus", "breathlessness", "keuhkokuume", "pneumonia", "astma", "asthma", "flunssa", "flu", "keuhkoputkentulehdus", "bronchitis"];

export function isInRiskGroup(r: SurveyResponse): boolean {
  return (
    r.age >= RULES_CONFIG.minAge &&
    r.age <= RULES_CONFIG.maxAge &&
    r.smoking.status !== "never" &&
    r.smoking.pack_years >= RULES_CONFIG.minPackYears
  );
}

function hasOngoingSymptoms(r: SurveyResponse): boolean {
  const s = r.symptoms;
  return s.cough_weeks > 0 || s.blood_in_sputum || s.weight_loss || s.breathlessness || s.chest_pain;
}

export function evaluate(r: SurveyResponse): RuleResult {
  const eligible = isInRiskGroup(r);
  const reasons: RuleReason[] = [];
  const s = r.symptoms;

  if (s.blood_in_sputum) {
    reasons.push({ code: "blood_in_sputum", label: "Verta yskösissä", answer: "kyllä", redFlag: true });
  }
  if (s.cough_weeks >= RULES_CONFIG.coughWeeks) {
    reasons.push({ code: "cough_weeks", label: `Yskä yli ${RULES_CONFIG.coughWeeks} viikkoa`, answer: `${s.cough_weeks} viikkoa`, redFlag: false });
  }
  if (s.weight_loss) {
    reasons.push({ code: "weight_loss", label: "Selittämätön laihtuminen", answer: "kyllä", redFlag: false });
  }
  if (s.breathlessness) {
    reasons.push({ code: "breathlessness", label: "Hengenahdistus", answer: "kyllä", redFlag: false });
  }
  if (s.chest_pain) {
    reasons.push({ code: "chest_pain", label: "Rintakipu", answer: "kyllä", redFlag: false });
  }
  if (s.pneumonias_last_year >= RULES_CONFIG.recurrentPneumonias) {
    reasons.push({ code: "recurrent_pneumonia", label: "Toistuvat keuhkokuumeet", answer: `${s.pneumonias_last_year} viime vuonna`, redFlag: false });
  }
  const recentVisit = r.previous_visits.find(
    (v) => v.months_ago <= RULES_CONFIG.recentVisitMonths && RESPIRATORY_REASONS.some((k) => v.reason.toLowerCase().includes(k)),
  );
  if (recentVisit && hasOngoingSymptoms(r)) {
    reasons.push({
      code: "symptoms_persist_after_visit",
      label: "Oireet jatkuvat aiemman käynnin jälkeen",
      answer: `käynti ${recentVisit.months_ago} kk sitten: ${recentVisit.reason}`,
      redFlag: false,
    });
  }

  const redFlag = reasons.some((x) => x.redFlag);
  const symptomReviewRequired =
    s.cough_weeks > 0 ||
    s.blood_in_sputum ||
    s.weight_loss ||
    s.breathlessness ||
    s.chest_pain ||
    s.pneumonias_last_year > 0;
  const score = reasons.filter((x) => !x.redFlag).length + (redFlag ? RULES_CONFIG.directCtScore : 0);

  // PLCOm2012 is kept separate from symptom triage. As a screening estimate it is
  // shown only for asymptomatic ever-smokers. (For ordering inside the same urgency,
  // store.ts uses the same model for every ever-smoker via priority.ts.)
  const screeningRisk6y = !symptomReviewRequired ? (plcoRisk(r)?.probability ?? null) : null;

  let placement: Placement;
  if (!eligible) placement = "not_eligible";
  else if (redFlag || score >= RULES_CONFIG.directCtScore) placement = "direct_ct";
  else if (score >= 1) placement = "physician_fast";
  else placement = "normal_route";

  return {
    id: r.id,
    eligible,
    symptomReviewRequired,
    screeningRisk6y,
    screeningRiskInOriginalAgeRange: screeningRisk6y === null ? null : r.age >= 55 && r.age <= 74,
    score,
    redFlag,
    placement,
    reasons,
  };
}

/** Symptom review (including red flags) sorts before screening-only statuses. */
export function compareForWorklist(a: RuleResult, b: RuleResult): number {
  const rank = (r: RuleResult) => {
    if (r.redFlag) return 0;
    if (r.symptomReviewRequired) return 1;
    const placementRank: Record<Placement, number> = { direct_ct: 2, physician_fast: 3, normal_route: 4, not_eligible: 5 };
    return placementRank[r.placement];
  };
  return rank(a) - rank(b) || b.score - a.score || a.id.localeCompare(b.id);
}

export const PLACEMENT_LABEL: Record<Placement, string> = {
  direct_ct: "Lääkärin arvio TT-lähetteen tarpeesta",
  physician_fast: "Lääkärille muutaman päivän sisällä",
  normal_route: "Tavallinen reitti",
  not_eligible: "Ei kyselyn riskirajassa",
};
