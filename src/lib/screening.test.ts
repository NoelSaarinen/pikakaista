import { describe, expect, it } from "vitest";
import synthetic from "@/data/synthetic/responses.json";
import { PLCO_THRESHOLD } from "./plco";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import { screeningList, type ScreeningPerson } from "./screening";
import type { SurveyResponse } from "./types";

const toPerson = (r: SurveyResponse): ScreeningPerson => ({ response: r, rule: evaluate(r), priority: riskPriority(r) });
const people = (synthetic as SurveyResponse[]).map(toPerson);

function person(id: string, overrides: Partial<SurveyResponse> = {}, symptoms: Partial<SurveyResponse["symptoms"]> = {}): ScreeningPerson {
  return toPerson({
    id,
    age: 65,
    language: "fi",
    smoking: { status: "current", pack_years: 40 },
    symptoms: { cough_weeks: 0, blood_in_sputum: false, weight_loss: false, breathlessness: false, chest_pain: false, pneumonias_last_year: 0, ...symptoms },
    previous_visits: [],
    plco: { race: "white", education: 2, bmi: 26, copd: false, personal_cancer_history: false, family_history_lung_cancer: false, cigs_per_day: 20, smoking_years: 40, years_since_quit: 0 },
    synthetic: true,
    ...overrides,
  });
}

describe("screening list (tier 2)", () => {
  it("keeps symptomatic people, never-smokers and people outside 50–74 out of the ranking", () => {
    const s = screeningList(
      [person("sym", {}, { breathlessness: true }), person("never", { smoking: { status: "never", pack_years: 0 }, plco: undefined }), person("young", { age: 45 }), person("ok")],
      { ctSlotsPerWeek: 10, weeks: 1, mode: "absolute" },
    );
    const status = Object.fromEntries(s.rows.map((r) => [r.person.response.id, r.status]));
    expect(status).toMatchObject({ sym: "symptomatic", never: "never_smoked", young: "outside_age" });
    expect(s.pool).toBe(1);
  });

  it("ranks by PLCOm2012 risk, highest first, and invites only above the 1.3455 % threshold", () => {
    const s = screeningList(people, { ctSlotsPerWeek: 1000, weeks: 1, mode: "absolute" });
    const ranked = s.rows.filter((r) => r.rank !== null);
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1].person.priority.score).toBeGreaterThanOrEqual(ranked[i].person.priority.score);
    for (const r of s.rows) {
      if (r.status === "invite") expect(r.person.priority.score / 100).toBeGreaterThanOrEqual(PLCO_THRESHOLD);
      if (r.status === "below_threshold") expect(r.person.priority.score / 100).toBeLessThan(PLCO_THRESHOLD);
      if (r.status === "invite" || r.status === "waiting" || r.status === "below_threshold") expect(r.person.rule.symptomReviewRequired).toBe(false);
    }
    expect(s.invited).toBe(s.aboveThreshold);
  });

  it("invites from the top within capacity and spreads invitations over weeks", () => {
    const s = screeningList(people, { ctSlotsPerWeek: 3, weeks: 2, mode: "absolute" });
    const invited = s.rows.filter((r) => r.status === "invite");
    expect(invited).toHaveLength(Math.min(6, s.aboveThreshold));
    expect(invited.map((r) => r.rank)).toEqual(invited.map((_, i) => i + 1));
    expect(invited.map((r) => r.inviteWeek)).toEqual(invited.map((_, i) => Math.floor(i / 3) + 1));
    expect(s.waiting).toBe(s.aboveThreshold - invited.length);
  });

  it("finds at least as much model-expected cancer as the age and pack-year criteria for the same number", () => {
    const s = screeningList(people, { ctSlotsPerWeek: 5, weeks: 4, mode: "absolute" });
    expect(s.expectedCancersInvited).toBeGreaterThanOrEqual(s.expectedCancersByCriteria);
  });

  it("flags missing key inputs and ages outside the model's 55–74", () => {
    const s = screeningList([person("missing", { plco: { race: "white" } }), person("old", { age: 52 })], { ctSlotsPerWeek: 10, weeks: 1, mode: "absolute" });
    const byId = Object.fromEntries(s.rows.map((r) => [r.person.response.id, r]));
    expect(byId.missing.missingInputs.length).toBeGreaterThan(0);
    expect(byId.old.outsideModelAge).toBe(true);
  });

  it("invites nobody without capacity", () => {
    const s = screeningList(people, { ctSlotsPerWeek: 0, weeks: 4, mode: "absolute" });
    expect(s.invited).toBe(0);
    expect(s.waiting).toBe(s.aboveThreshold);
  });
});

describe("equity ranking (age-standardised)", () => {
  it("gives two people with the same risk factors the same score whatever their age", () => {
    const young = person("young", { age: 56 });
    const old = person("old", { age: 79 });
    expect(young.priority.ageStandardisedScore).toBe(old.priority.ageStandardisedScore);
    expect(old.priority.score).toBeGreaterThan(young.priority.score);
  });

  it("equals the real risk at the model's reference age 62", () => {
    const p = person("ref", { age: 62 });
    expect(p.priority.ageStandardisedScore).toBe(p.priority.score);
  });

  it("orders by risk factors, so more smoking outranks more age", () => {
    const olderLight = person("olderLight", { age: 78, plco: { race: "white", education: 4, bmi: 27, copd: false, personal_cancer_history: false, family_history_lung_cancer: false, cigs_per_day: 10, smoking_years: 30, years_since_quit: 0 } });
    const youngerHeavy = person("youngerHeavy", { age: 58, plco: { race: "white", education: 2, bmi: 24, copd: true, personal_cancer_history: false, family_history_lung_cancer: true, cigs_per_day: 30, smoking_years: 40, years_since_quit: 0 } });
    const equity = screeningList([olderLight, youngerHeavy], { ctSlotsPerWeek: 1, weeks: 1, mode: "equity" });
    expect(equity.rows.find((r) => r.status === "invite")?.person.response.id).toBe("youngerHeavy");
  });

  it("keeps everyone the validated model would invite eligible", () => {
    const abs = screeningList(people, { ctSlotsPerWeek: 1000, weeks: 1, mode: "absolute" });
    const eq = screeningList(people, { ctSlotsPerWeek: 1000, weeks: 1, mode: "equity" });
    const invitedEq = new Set(eq.rows.filter((r) => r.status === "invite").map((r) => r.person.response.id));
    for (const r of abs.rows.filter((x) => x.status === "invite")) expect(invitedEq.has(r.person.response.id)).toBe(true);
    expect(eq.aboveThreshold).toBe(abs.aboveThreshold + eq.newlyEligible);
  });

  it("invites a younger group than absolute ranking for the same capacity", () => {
    const s = screeningList(people, { ctSlotsPerWeek: 5, weeks: 4, mode: "equity" });
    expect(s.byMode.equity.meanAge).toBeLessThan(s.byMode.absolute.meanAge);
    expect(s.byMode.equity.aged65plus).toBeLessThanOrEqual(s.byMode.absolute.aged65plus);
  });
});
