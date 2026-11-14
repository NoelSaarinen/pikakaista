import { afterEach, describe, expect, it, vi } from "vitest";
import { assessCase, ruleLevel } from "./assessment";
import * as llm from "./llm";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import type { SurveyResponse } from "./types";

function person(symptoms: Partial<SurveyResponse["symptoms"]> = {}, overrides: Partial<SurveyResponse> = {}): SurveyResponse {
  return {
    id: "a-test",
    age: 67,
    language: "fi",
    smoking: { status: "current", pack_years: 40 },
    symptoms: { cough_weeks: 0, blood_in_sputum: false, weight_loss: false, breathlessness: false, chest_pain: false, pneumonias_last_year: 0, ...symptoms },
    previous_visits: [],
    synthetic: true,
    ...overrides,
  };
}
const run = (r: SurveyResponse) => assessCase(r, evaluate(r), riskPriority(r));

afterEach(() => vi.restoreAllMocks());

describe("rule level from Delun's booking tiers", () => {
  it("blood in sputum is A, a smoker with a long cough is B, no symptoms is C", () => {
    for (const [r, level] of [
      [person({ blood_in_sputum: true }), "A"],
      [person({ cough_weeks: 4 }), "B"],
      [person(), "C"],
    ] as const) {
      expect(ruleLevel(r, evaluate(r), riskPriority(r)).level).toBe(level);
    }
  });
});

describe("assessCase", () => {
  it("falls back to the rule level without AI", async () => {
    vi.spyOn(llm, "completeJson").mockResolvedValue(null);
    const a = await run(person({ cough_weeks: 4 }));
    expect(a.generatedBy).toBe("template");
    expect(a.suggestedLevel).toBe("B");
    expect(a.comparison).toBe("same");
  });

  it("keeps the rule level when the model suggests a lower one", async () => {
    vi.spyOn(llm, "completeJson").mockResolvedValue({ summary: "Yhteenveto.", suggested_level: "C", reasons: [], evidence: [], uncertainties: [] });
    const a = await run(person({ blood_in_sputum: true }));
    expect(a.ruleLevel).toBe("A");
    expect(a.suggestedLevel).toBe("C");
    expect(a.comparison).toBe("lower");
  });

  it("shows a higher suggestion for the physician to weigh", async () => {
    vi.spyOn(llm, "completeJson").mockResolvedValue({ summary: "Yhteenveto.", suggested_level: "A", reasons: ["Vapaassa tekstissä veriyskä"], evidence: [], uncertainties: [] });
    const a = await run(person({ cough_weeks: 4 }));
    expect(a.ruleLevel).toBe("B");
    expect(a.comparison).toBe("higher");
    expect(a.reasons).toEqual(["Vapaassa tekstissä veriyskä"]);
  });

  it("rejects an invalid level from the model", async () => {
    vi.spyOn(llm, "completeJson").mockResolvedValue({ summary: "x", suggested_level: "Z", reasons: [], evidence: [], uncertainties: [] });
    const a = await run(person({ cough_weeks: 4 }));
    expect(a.generatedBy).toBe("template");
  });
});
