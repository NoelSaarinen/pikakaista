// Shared types for the lung cancer fast-lane demo.
// Data contracts follow docs/PROJECT.md. All people in the demo are synthetic.

export type SmokingStatus = "current" | "former" | "never";
/** PLCOm2012 race/ethnicity categories (US categories from the original model). */
export type PlcoRace = "white" | "black" | "hispanic" | "asian" | "pacific_islander" | "native_american";

export interface SurveyResponse {
  id: string;
  age: number;
  language: string;
  smoking: { status: SmokingStatus; pack_years: number };
  symptoms: {
    cough_weeks: number;
    blood_in_sputum: boolean;
    weight_loss: boolean;
    /** Breathlessness lasting over 3 weeks. */
    breathlessness: boolean;
    /** Chest or shoulder pain lasting over 3 weeks. */
    chest_pain: boolean;
    /** Hoarse voice lasting over 3 weeks. Missing in older answers means no. */
    hoarseness?: boolean;
    pneumonias_last_year: number;
  };
  previous_visits: { months_ago: number; reason: string }[];
  /** Optional answer to "describe your symptoms in your own words". */
  free_text?: string;
  /**
   * How the person reached the fast lane: the risk-group survey (team plan) or a
   * nurse's checklist at a health-centre contact (Two Doors). Missing means survey.
   */
  channel?: Channel;
  /** Extra inputs for the PLCOm2012 risk model. Missing fields are imputed (see plco.ts). */
  plco?: Partial<PlcoInputs>;
  synthetic: true;
}

export interface PlcoInputs {
  /** Optional question. Missing means the model's reference category (white). */
  race: PlcoRace;
  /** PLCOm2012 education level 1–6. */
  education: number;
  bmi: number;
  copd: boolean;
  personal_cancer_history: boolean;
  family_history_lung_cancer: boolean;
  cigs_per_day: number;
  smoking_years: number;
  /** 0 for current smokers. */
  years_since_quit: number;
}

export type Channel = "survey" | "health_centre";

export type Placement = "direct_ct" | "physician_fast" | "normal_route" | "not_eligible";

export interface RuleReason {
  /** Machine-readable rule code, e.g. "blood_in_sputum". */
  code: string;
  /** Finnish label shown to the physician. */
  label: string;
  /** The person's own answer that triggered the rule. */
  answer: string;
  /** True for a single sign that alone proposes direct CT. */
  redFlag: boolean;
}

export interface RuleResult {
  id: string;
  eligible: boolean;
  /** Any reported symptom is surfaced to a clinician even outside survey eligibility. */
  symptomReviewRequired: boolean;
  /** Six-year PLCOm2012 risk; null when inputs are incomplete, never-smoker, or symptomatic. */
  screeningRisk6y: number | null;
  screeningRiskInOriginalAgeRange: boolean | null;
  score: number;
  redFlag: boolean;
  placement: Placement;
  reasons: RuleReason[];
}

export interface CaseSummary {
  id: string;
  rule_score: number;
  proposed_placement: Placement;
  summary: string;
  reasons: string[];
  /** "llm" when written by the model, "template" for the deterministic fallback. */
  generated_by: "llm" | "template";
  physician_decision: Placement | null;
}

export interface SourceRef {
  id: string;
  title: string;
  url: string;
  page?: string;
  retrieved: string;
  note?: string;
}

export interface SourcedValue {
  value: number;
  source_id: string;
  year?: number;
  is_estimate: boolean;
  note?: string;
}

export interface County {
  id: string;
  name: string;
  population_50_74: SourcedValue;
  ever_smoker_share: SourcedValue;
  lung_cancer_cases_per_year: SourcedValue;
  in_ldct_pilot: { value: boolean | null; source_id: string; note?: string };
}
