import { describe, expect, it } from "vitest";
import { compareForWorklist, evaluate, isInRiskGroup } from "./rules";
import type { SurveyResponse } from "./types";

function person(overrides: Partial<SurveyResponse> = {}, symptoms: Partial<SurveyResponse["symptoms"]> = {}): SurveyResponse {
  return {
    id: "p-test",
    age: 67,
    language: "fi",
    smoking: { status: "former", pack_years: 30 },
    symptoms: {
      cough_weeks: 0,
      blood_in_sputum: false,
      weight_loss: false,
      breathlessness: false,
      chest_pain: false,
      pneumonias_last_year: 0,
      ...symptoms,
    },
    previous_visits: [],
    synthetic: true,
    ...overrides,
  };
}

describe("risk group", () => {
  it("includes a 67-year-old former smoker with 30 pack-years", () => {
    expect(isInRiskGroup(person())).toBe(true);
  });
  it("excludes never-smokers, the too young and light smokers", () => {
    expect(isInRiskGroup(person({ smoking: { status: "never", pack_years: 0 } }))).toBe(false);
    expect(isInRiskGroup(person({ age: 50 }))).toBe(false);
    expect(isInRiskGroup(person({ smoking: { status: "current", pack_years: 10 } }))).toBe(false);
  });
});

describe("placement", () => {
  it("sends blood in sputum straight to CT as a red flag", () => {
    const r = evaluate(person({}, { blood_in_sputum: true }));
    expect(r.redFlag).toBe(true);
    expect(r.placement).toBe("direct_ct");
    expect(r.reasons.map((x) => x.code)).toContain("blood_in_sputum");
  });
  it("sends one or two alarm signs to a physician within days", () => {
    expect(evaluate(person({}, { cough_weeks: 5 })).placement).toBe("physician_fast");
    expect(evaluate(person({}, { cough_weeks: 5, breathlessness: true })).placement).toBe("physician_fast");
  });
  it("sends three alarm signs to direct CT", () => {
    const r = evaluate(person({}, { cough_weeks: 5, breathlessness: true, weight_loss: true }));
    expect(r.score).toBe(3);
    expect(r.placement).toBe("direct_ct");
  });
  it("keeps people without signs on the normal route", () => {
    expect(evaluate(person()).placement).toBe("normal_route");
  });
  it("marks people outside the risk group as not eligible, but still lists their signs", () => {
    const r = evaluate(person({ age: 45 }, { blood_in_sputum: true }));
    expect(r.placement).toBe("not_eligible");
    expect(r.reasons).toHaveLength(1);
  });
  it("flags symptoms that persist after a recent respiratory visit", () => {
    const r = evaluate(person({ previous_visits: [{ months_ago: 2, reason: "astma" }] }, { cough_weeks: 2 }));
    expect(r.reasons.map((x) => x.code)).toContain("symptoms_persist_after_visit");
  });
  it("quotes the person's own answer in every reason", () => {
    const r = evaluate(person({}, { cough_weeks: 7, pneumonias_last_year: 2 }));
    expect(r.reasons.find((x) => x.code === "cough_weeks")?.answer).toBe("7 viikkoa");
    expect(r.reasons.find((x) => x.code === "recurrent_pneumonia")?.answer).toBe("2 viime vuonna");
  });
});

describe("worklist order", () => {
  it("puts direct CT first, then higher scores", () => {
    const a = evaluate(person({ id: "a" }, { cough_weeks: 5 }));
    const b = evaluate(person({ id: "b" }, { blood_in_sputum: true }));
    const c = evaluate(person({ id: "c" }));
    expect([a, c, b].sort(compareForWorklist).map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
});
