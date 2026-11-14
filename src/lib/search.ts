// Patient search for the demo. Pure functions, so the page can filter in the browser
// and tests can check the logic. All people are synthetic.

import type { Booking, QueueEntry } from "./booking";
import { ENGAGEMENT_LABEL, STAGE_LABEL, type Engagement, type Pathway, type PathwayStage } from "./pathway";
import type { RiskPriority } from "./priority";
import { PLACEMENT_LABEL } from "./rules";
import type { Placement, RuleResult, SmokingStatus, SurveyResponse } from "./types";

/** The fields search needs from a patient row (same shape as /api/patients). */
export interface SearchablePatient {
  response: SurveyResponse;
  rule: RuleResult;
  pathway: Pathway;
  priority: RiskPriority;
  decision: Placement | null;
  live: boolean;
  booking?: Booking | null;
  queued?: QueueEntry | null;
}

export type SymptomKey = "cough" | "blood_in_sputum" | "weight_loss" | "breathlessness" | "chest_pain" | "pneumonia";

export const SYMPTOM_FILTERS: { key: SymptomKey; label: string; has: (r: SurveyResponse) => boolean }[] = [
  { key: "blood_in_sputum", label: "Verta yskösissä", has: (r) => r.symptoms.blood_in_sputum },
  { key: "cough", label: "Yskä", has: (r) => r.symptoms.cough_weeks > 0 },
  { key: "breathlessness", label: "Hengenahdistus", has: (r) => r.symptoms.breathlessness },
  { key: "chest_pain", label: "Rintakipu", has: (r) => r.symptoms.chest_pain },
  { key: "weight_loss", label: "Laihtuminen", has: (r) => r.symptoms.weight_loss },
  { key: "pneumonia", label: "Keuhkokuume viime vuonna", has: (r) => r.symptoms.pneumonias_last_year > 0 },
];

export const SMOKING_LABEL: Record<SmokingStatus, string> = {
  current: "Tupakoi",
  former: "Entinen tupakoija",
  never: "Ei koskaan tupakoinut",
};

export type Urgency = "red_flag" | "symptom_review" | Placement;

export const URGENCY_LABEL: Record<Urgency, string> = {
  red_flag: "Hälytysmerkki (verta yskösissä)",
  symptom_review: "Oireet: ammattilaisen arvio",
  ...PLACEMENT_LABEL,
};

/** Same order as the physician's list: red flags, then symptom review, then placement. */
export function urgencyOf(rule: RuleResult): Urgency {
  if (rule.redFlag) return "red_flag";
  if (rule.symptomReviewRequired) return "symptom_review";
  return rule.placement;
}

const URGENCY_RANK: Record<Urgency, number> = { red_flag: 0, symptom_review: 1, direct_ct: 2, physician_fast: 3, normal_route: 4, not_eligible: 5 };

export type SortKey = "urgency" | "plco" | "age" | "id";

export const SORT_LABEL: Record<SortKey, string> = {
  urgency: "Kiireellisyys, sitten PLCOm2012",
  plco: "PLCOm2012-riski, suurin ensin",
  age: "Ikä, vanhin ensin",
  id: "Tunnus",
};

export interface PatientFilters {
  query: string;
  smoking: SmokingStatus | "all";
  urgency: Urgency | "all";
  plcoLevel: RiskPriority["level"] | "all";
  engagement: Engagement | "all";
  stage: PathwayStage | "all";
  channel: "survey" | "health_centre" | "all";
  minAge: number | null;
  maxAge: number | null;
  /** All listed symptoms must be present. */
  symptoms: SymptomKey[];
  sort: SortKey;
}

export const EMPTY_FILTERS: PatientFilters = {
  query: "",
  smoking: "all",
  urgency: "all",
  plcoLevel: "all",
  engagement: "all",
  stage: "all",
  channel: "all",
  minAge: null,
  maxAge: null,
  symptoms: [],
  sort: "urgency",
};

const norm = (s: string) => s.toLocaleLowerCase("fi-FI").normalize("NFC");

/** Lower-case text that free-text search matches against: id, labels, symptoms and own words. */
export function searchText(p: SearchablePatient): string {
  const r = p.response;
  return norm(
    [
      r.id,
      `${r.age} v`,
      SMOKING_LABEL[r.smoking.status],
      `${r.smoking.pack_years} askivuotta`,
      r.channel === "health_centre" ? "terveyskeskus hoitaja" : "kysely",
      ...SYMPTOM_FILTERS.filter((s) => s.has(r)).map((s) => s.label),
      ...p.rule.reasons.map((x) => `${x.label} ${x.answer}`),
      URGENCY_LABEL[urgencyOf(p.rule)],
      STAGE_LABEL[p.pathway.stage],
      ENGAGEMENT_LABEL[p.pathway.engagement],
      p.pathway.nextAction,
      r.free_text ?? "",
      ...r.previous_visits.map((v) => `käynti ${v.reason}`),
    ].join(" "),
  );
}

/** Filters and sorts patients. Every word in the query must match (AND). */
export function searchPatients<T extends SearchablePatient>(items: T[], f: PatientFilters): T[] {
  const words = norm(f.query).split(/\s+/).filter(Boolean);
  const filtered = items.filter((p) => {
    const r = p.response;
    if (f.smoking !== "all" && r.smoking.status !== f.smoking) return false;
    if (f.urgency !== "all" && urgencyOf(p.rule) !== f.urgency) return false;
    if (f.plcoLevel !== "all" && p.priority.level !== f.plcoLevel) return false;
    if (f.engagement !== "all" && p.pathway.engagement !== f.engagement) return false;
    if (f.stage !== "all" && p.pathway.stage !== f.stage) return false;
    if (f.channel !== "all" && (r.channel ?? "survey") !== f.channel) return false;
    if (f.minAge !== null && r.age < f.minAge) return false;
    if (f.maxAge !== null && r.age > f.maxAge) return false;
    for (const key of f.symptoms) if (!SYMPTOM_FILTERS.find((s) => s.key === key)!.has(r)) return false;
    if (words.length) {
      const text = searchText(p);
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  });
  const byId = (a: T, b: T) => a.response.id.localeCompare(b.response.id);
  const sorters: Record<SortKey, (a: T, b: T) => number> = {
    urgency: (a, b) =>
      URGENCY_RANK[urgencyOf(a.rule)] - URGENCY_RANK[urgencyOf(b.rule)] || b.rule.score - a.rule.score || b.priority.score - a.priority.score || byId(a, b),
    plco: (a, b) => b.priority.score - a.priority.score || byId(a, b),
    age: (a, b) => b.response.age - a.response.age || byId(a, b),
    id: byId,
  };
  return [...filtered].sort(sorters[f.sort]);
}
