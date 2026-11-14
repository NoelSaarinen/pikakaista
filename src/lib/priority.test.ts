import { describe, expect, it } from "vitest";
import synthetic from "@/data/synthetic/responses.json";
import { QUESTION_BANK, ruleQuestions } from "./analysis";
import { plcom2012, plcoRisk, PLCO_THRESHOLD } from "./plco";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import type { PlcoInputs, SurveyResponse } from "./types";

const logistic = (x: number) => Math.exp(x) / (1 + Math.exp(x));

function person(overrides: Partial<SurveyResponse> = {}, symptoms: Partial<SurveyResponse["symptoms"]> = {}): SurveyResponse {
  return {
    id: "p-test",
    age: 67,
    language: "fi",
    smoking: { status: "current", pack_years: 40 },
    symptoms: { cough_weeks: 0, blood_in_sputum: false, weight_loss: false, breathlessness: false, chest_pain: false, pneumonias_last_year: 0, ...symptoms },
    previous_visits: [],
    synthetic: true,
    ...overrides,
  };
}

// The model's centring values, so every term except the constant is zero.
const REFERENCE: PlcoInputs = {
  race: "white",
  education: 4,
  bmi: 27,
  copd: false,
  personal_cancer_history: false,
  family_history_lung_cancer: false,
  cigs_per_day: 10 / 0.4021541613,
  smoking_years: 27,
  years_since_quit: 10,
};

describe("PLCOm2012 against the published equation (Tammemägi et al., NEJM 2013, Table 2)", () => {
  it("gives the constant alone for a reference former smoker aged 62", () => {
    expect(plcom2012(62, false, REFERENCE).probability).toBeCloseTo(logistic(-4.532506), 12);
  });

  it("matches a hand-written calculation for a full example", () => {
    const x: PlcoInputs = { race: "white", education: 2, bmi: 24, copd: true, personal_cancer_history: false, family_history_lung_cancer: true, cigs_per_day: 20, smoking_years: 45, years_since_quit: 0 };
    const logit =
      -4.532506 +
      0.0778868 * (70 - 62) +
      -0.0812744 * (2 - 4) +
      -0.0274194 * (24 - 27) +
      0.3553063 +
      0.587185 +
      0.2597431 +
      -1.822606 * (1 / (20 / 10) - 0.4021541613) +
      0.0317321 * (45 - 27) +
      -0.0308572 * (0 - 10);
    expect(plcom2012(70, true, x).probability).toBeCloseTo(logistic(logit), 12);
  });

  it("adds each yes/no coefficient exactly", () => {
    const base = plcom2012(62, false, REFERENCE).probability;
    const logitOf = (p: number) => Math.log(p / (1 - p));
    expect(logitOf(plcom2012(62, false, { ...REFERENCE, copd: true }).probability) - logitOf(base)).toBeCloseTo(0.3553063, 10);
    expect(logitOf(plcom2012(62, false, { ...REFERENCE, personal_cancer_history: true }).probability) - logitOf(base)).toBeCloseTo(0.4589971, 10);
    expect(logitOf(plcom2012(62, false, { ...REFERENCE, family_history_lung_cancer: true }).probability) - logitOf(base)).toBeCloseTo(0.587185, 10);
    expect(logitOf(plcom2012(62, true, REFERENCE).probability) - logitOf(base)).toBeCloseTo(0.2597431, 10);
  });

  it("uses the published race betas, with Pacific Islander 1.027152 and American Indian 0", () => {
    const base = plcom2012(62, false, REFERENCE).probability;
    const logitOf = (p: number) => Math.log(p / (1 - p));
    const delta = (race: PlcoInputs["race"]) => logitOf(plcom2012(62, false, { ...REFERENCE, race }).probability) - logitOf(base);
    expect(delta("black")).toBeCloseTo(0.3944778, 10);
    expect(delta("hispanic")).toBeCloseTo(-0.7434744, 10);
    expect(delta("asian")).toBeCloseTo(-0.466585, 10);
    expect(delta("pacific_islander")).toBeCloseTo(1.027152, 10);
    expect(delta("native_american")).toBeCloseTo(0, 10);
  });

  it("rises with age, smoking intensity and duration, and falls with quit time, education and BMI", () => {
    const p = (over: Partial<PlcoInputs>, age = 62) => plcom2012(age, false, { ...REFERENCE, ...over }).probability;
    const base = p({});
    expect(p({}, 70)).toBeGreaterThan(base);
    expect(p({ cigs_per_day: 40 })).toBeGreaterThan(base);
    expect(p({ smoking_years: 40 })).toBeGreaterThan(base);
    expect(p({ years_since_quit: 20 })).toBeLessThan(base);
    expect(p({ education: 6 })).toBeLessThan(base);
    expect(p({ bmi: 32 })).toBeLessThan(base);
  });
});

describe("risk priority", () => {
  it("does not apply to never-smokers", () => {
    const r = person({ smoking: { status: "never", pack_years: 0 } });
    expect(plcoRisk(r)).toBeNull();
    expect(riskPriority(r).level).toBe("not_applicable");
  });

  it("reports risk in percent, the 1.3455 % threshold and the paper's categories", () => {
    const r = person({ plco: { race: "white", education: 2, bmi: 24, copd: true, personal_cancer_history: false, family_history_lung_cancer: true, cigs_per_day: 20, smoking_years: 45, years_since_quit: 0 }, age: 70 });
    const pr = riskPriority(r);
    expect(pr.score).toBeCloseTo(plcoRisk(r)!.probability * 100, 1);
    expect(pr.aboveThreshold).toBe(plcoRisk(r)!.probability >= PLCO_THRESHOLD);
    expect(pr.level).toBe(pr.score >= 2 ? "high" : pr.score >= 1 ? "medium" : "low");
    expect(pr.imputed).toEqual([]);
  });

  it("lists imputed inputs when the answer lacks them", () => {
    expect(riskPriority(person()).imputed).toEqual(expect.arrayContaining(["education", "bmi", "copd", "cigs_per_day", "smoking_years"]));
  });

  it("has complete inputs for every synthetic ever-smoker except the optional race question", () => {
    for (const r of synthetic as SurveyResponse[]) {
      if (r.smoking.status !== "never") expect(riskPriority(r).imputed).toEqual(["race"]);
    }
  });

  it("never changes the rules' placement", () => {
    const p = person({}, { blood_in_sputum: true });
    const before = evaluate(p).placement;
    riskPriority(p);
    expect(evaluate(p).placement).toBe(before);
  });
});

describe("follow-up questions without AI", () => {
  it("asks about the symptoms the person reported, at most three, from the bank", () => {
    const qs = ruleQuestions(person({}, { blood_in_sputum: true, weight_loss: true, cough_weeks: 4 }));
    expect(qs.map((q) => q.id)).toEqual(["hemoptysis_count", "weight_amount", "cough_change"]);
    for (const q of qs) expect(QUESTION_BANK).toContain(q);
  });
});
