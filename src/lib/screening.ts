// Screening invitation list: tier 2 of the two-tier prioritisation.
//
// Tier 1 (symptoms) comes first and is handled elsewhere: anyone with a symptom goes to
// symptom review and, if high-risk, gets a physician appointment (booking.ts, NICE NG12).
// Tier 2 is for people WITHOUT symptoms. They are ranked by PLCOm2012 risk, highest
// first, and invited from the top of the list as far as the screening CT capacity allows.
// By default ("equity") the ranking uses the age-standardised risk: the published
// coefficients of every risk factor except age are summed, with age set to 62 for
// everyone, so older people are not ranked first just because of age. See RankingMode.
//
// Sources and assumptions:
//   - PLCOm2012: Tammemägi MC et al., N Engl J Med 2013;368:728–736, Table 2 (checked
//     2026-11-14). Threshold 1.3455 %: the paper's cut-off that selects as many people
//     as the NLST age and pack-year criteria.
//   - Risk-based ranking instead of age and pack-year criteria alone follows the paper.
//     Pack-years are not required: the model already uses intensity, duration and quit time.
//   - Age range 55–80 is the team's survey invitation range (rules.ts). The model's
//     development cohort was aged 55–74 (PLCO trial; as stated in the local version,
//     not re-checked), so ages 75–80 are flagged.
//   - Screening CT capacity per week and the invitation horizon are adjustable demo
//     assumptions. Invitations are simulated: nothing is sent.

import { PLCO_THRESHOLD } from "./plco";
import type { RiskPriority } from "./priority";
import { RULES_CONFIG } from "./rules";
import type { PlcoInputs, RuleResult, SurveyResponse } from "./types";

export interface ScreeningPerson {
  response: SurveyResponse;
  rule: RuleResult;
  priority: RiskPriority;
}

export type ScreeningStatus =
  | "invite" // above threshold, within capacity
  | "waiting" // above threshold, capacity used up
  | "below_threshold"
  | "symptomatic" // goes to tier 1, symptom review
  | "never_smoked" // model does not apply
  | "outside_age";

export const SCREENING_STATUS_LABEL: Record<ScreeningStatus, string> = {
  invite: "Kutsutaan seulontaan",
  waiting: "Odottaa kutsua",
  below_threshold: "Alle kynnyksen: uusi arvio vuoden päästä",
  symptomatic: "Oireita: ohjattu oirearvioon (porras 1)",
  never_smoked: "Ei tupakoinut: malli ei koske",
  outside_age: "Kyselyn ikärajan ulkopuolella",
};

/** Missing inputs that matter for the risk. Race is optional and never blocks. */
const KEY_INPUTS: (keyof PlcoInputs)[] = ["cigs_per_day", "smoking_years", "years_since_quit", "education", "bmi", "copd", "family_history_lung_cancer", "personal_cancer_history"];

export interface ScreeningRow {
  person: ScreeningPerson;
  status: ScreeningStatus;
  /** 1-based rank among people above the threshold. */
  rank: number | null;
  /** Week of the simulated invitation, 1-based. */
  inviteWeek: number | null;
  /** Risk as a multiple of the threshold, e.g. 2.4 = 2.4 × 1.3455 %. */
  timesThreshold: number | null;
  /** Inputs that were imputed and should be asked before inviting. */
  missingInputs: (keyof PlcoInputs)[];
  outsideModelAge: boolean;
}

/**
 * "equity": order by the age-standardised PLCOm2012 risk (age set to 62), so people are
 * ranked by their other research-based risk factors, not by age. Eligible if either the
 * real or the age-standardised risk reaches the threshold, so nobody the validated
 * model would invite loses eligibility. Team equity choice, not validated.
 * "absolute": order by the real PLCOm2012 risk, as published.
 */
export type RankingMode = "equity" | "absolute";

export const RANKING_LABEL: Record<RankingMode, string> = {
  equity: "Tasa-arvoinen: riskitekijät ilman ikää",
  absolute: "Absoluuttinen riski: malli sellaisenaan",
};

export interface ScreeningSettings {
  ctSlotsPerWeek: number;
  weeks: number;
  mode: RankingMode;
}

export const DEFAULT_SCREENING: ScreeningSettings = { ctSlotsPerWeek: 5, weeks: 4, mode: "equity" };

/** The score a mode ranks by, in percent. */
export function rankingScore(p: ScreeningPerson, mode: RankingMode): number {
  return mode === "equity" ? p.priority.ageStandardisedScore : p.priority.score;
}

function eligible(p: ScreeningPerson, mode: RankingMode): boolean {
  const real = p.priority.score / 100 >= PLCO_THRESHOLD;
  return mode === "equity" ? real || p.priority.ageStandardisedScore / 100 >= PLCO_THRESHOLD : real;
}

/** People above the threshold, in invitation order for the mode. */
function rankEligible(pool: ScreeningPerson[], mode: RankingMode): ScreeningPerson[] {
  return pool
    .filter((p) => eligible(p, mode))
    .sort(
      (a, b) =>
        rankingScore(b, mode) - rankingScore(a, mode) ||
        b.priority.score - a.priority.score ||
        a.response.id.localeCompare(b.response.id),
    );
}

export interface ModeOutcome {
  invited: number;
  expectedCancers: number;
  meanAge: number;
  aged75plus: number;
}

function outcome(invited: ScreeningPerson[]): ModeOutcome {
  const n = invited.length;
  return {
    invited: n,
    expectedCancers: Math.round(invited.reduce((s, p) => s + p.priority.score / 100, 0) * 100) / 100,
    meanAge: n ? Math.round((invited.reduce((s, p) => s + p.response.age, 0) / n) * 10) / 10 : 0,
    aged75plus: invited.filter((p) => p.response.age >= 75).length,
  };
}

export interface ScreeningSummary {
  rows: ScreeningRow[];
  pool: number;
  aboveThreshold: number;
  invited: number;
  waiting: number;
  symptomatic: number;
  capacity: number;
  /** Sum of the invited people's 6-year risks: the model's own expected number of cancers. */
  expectedCancersInvited: number;
  /** The same number of people chosen by age 55–80 and ≥ 20 pack-years, most pack-years first. */
  expectedCancersByCriteria: number;
  /** How many people the criteria comparison could pick (may be fewer than `invited`). */
  criteriaCount: number;
  /** Who gets invited under each ranking, for the same capacity. */
  byMode: Record<RankingMode, ModeOutcome>;
  /** Eligible only through the age-standardised risk (younger people with serious risk factors). */
  newlyEligible: number;
}

function statusBase(p: ScreeningPerson): ScreeningStatus | null {
  const r = p.response;
  if (p.rule.symptomReviewRequired) return "symptomatic";
  if (r.smoking.status === "never" || p.priority.level === "not_applicable") return "never_smoked";
  if (r.age < RULES_CONFIG.minAge || r.age > RULES_CONFIG.maxAge) return "outside_age";
  return null;
}

/** Ranks asymptomatic ever-smokers by PLCOm2012 risk and invites from the top within capacity. */
export function screeningList(people: ScreeningPerson[], s: ScreeningSettings): ScreeningSummary {
  const capacity = Math.max(0, Math.round(s.ctSlotsPerWeek)) * Math.max(0, Math.round(s.weeks));
  const perWeek = Math.max(0, Math.round(s.ctSlotsPerWeek));
  const pool = people.filter((p) => statusBase(p) === null);
  const above = rankEligible(pool, s.mode);
  const slots = perWeek > 0 ? capacity : 0;
  const byMode = {
    equity: outcome(rankEligible(pool, "equity").slice(0, slots)),
    absolute: outcome(rankEligible(pool, "absolute").slice(0, slots)),
  };

  const rankOf = new Map(above.map((p, i) => [p.response.id, i]));
  const rows: ScreeningRow[] = people.map((person) => {
    const base = statusBase(person);
    const i = rankOf.get(person.response.id);
    let status: ScreeningStatus;
    let inviteWeek: number | null = null;
    if (base) status = base;
    else if (i === undefined) status = "below_threshold";
    else if (i < capacity && perWeek > 0) {
      status = "invite";
      inviteWeek = Math.floor(i / perWeek) + 1;
    } else status = "waiting";
    const inPool = base === null;
    return {
      person,
      status,
      rank: i === undefined ? null : i + 1,
      inviteWeek,
      timesThreshold: inPool ? Math.round((rankingScore(person, s.mode) / 100 / PLCO_THRESHOLD) * 10) / 10 : null,
      missingInputs: inPool ? person.priority.imputed.filter((k) => KEY_INPUTS.includes(k)) : [],
      outsideModelAge: inPool && person.response.age > 74,
    };
  });

  const order: Record<ScreeningStatus, number> = { invite: 0, waiting: 1, below_threshold: 2, symptomatic: 3, outside_age: 4, never_smoked: 5 };
  rows.sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      (a.rank ?? Infinity) - (b.rank ?? Infinity) ||
      rankingScore(b.person, s.mode) - rankingScore(a.person, s.mode) ||
      a.person.response.id.localeCompare(b.person.response.id),
  );

  const invitedPeople = above.slice(0, slots);
  const n = invitedPeople.length;
  const byCriteria = pool
    .filter((p) => p.response.smoking.pack_years >= RULES_CONFIG.minPackYears)
    .sort((a, b) => b.response.smoking.pack_years - a.response.smoking.pack_years || a.response.id.localeCompare(b.response.id))
    .slice(0, n);
  const sumRisk = (xs: ScreeningPerson[]) => Math.round(xs.reduce((s2, p) => s2 + p.priority.score / 100, 0) * 100) / 100;

  return {
    rows,
    pool: pool.length,
    aboveThreshold: above.length,
    invited: n,
    waiting: above.length - n,
    symptomatic: people.filter((p) => statusBase(p) === "symptomatic").length,
    capacity,
    expectedCancersInvited: sumRisk(invitedPeople),
    expectedCancersByCriteria: sumRisk(byCriteria),
    criteriaCount: byCriteria.length,
    byMode,
    newlyEligible: pool.filter((p) => eligible(p, "equity") && !eligible(p, "absolute")).length,
  };
}
