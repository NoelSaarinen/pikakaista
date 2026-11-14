// Shared types for the lung cancer fast-lane demo.
// Data contracts follow docs/PROJECT.md. All people in the demo are synthetic.

export type SmokingStatus = "current" | "former" | "never";

export interface SurveyResponse {
  id: string;
  age: number;
  language: string;
  smoking: { status: SmokingStatus; pack_years: number };
  symptoms: {
    cough_weeks: number;
    blood_in_sputum: boolean;
    weight_loss: boolean;
    breathlessness: boolean;
    chest_pain: boolean;
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
  synthetic: true;
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
  population_55_80: SourcedValue;
  ever_smoker_share: SourcedValue;
  lung_cancer_cases_per_year: SourcedValue;
  in_ldct_pilot: { value: boolean | null; source_id: string; note?: string };
}
