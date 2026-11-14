import { describe, expect, it } from "vitest";
import synthetic from "@/data/synthetic/responses.json";
import { buildPathway } from "./pathway";
import { evaluate } from "./rules";
import type { SurveyResponse } from "./types";

const people = synthetic as SurveyResponse[];

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

describe("pathway", () => {
  it("is the same for the same person every time", () => {
    const p = people[4];
    expect(buildPathway(p, evaluate(p), null, false)).toEqual(buildPathway(p, evaluate(p), null, false));
  });

  it("puts people outside the risk group at no action", () => {
    const p = person({ age: 45 });
    expect(buildPathway(p, evaluate(p), null, false).stage).toBe("no_action");
  });

  it("keeps a live answer waiting for the physician, with no synthetic history", () => {
    const p = person({ id: "live-1" }, { blood_in_sputum: true });
    const pw = buildPathway(p, evaluate(p), null, true);
    expect(pw.stage).toBe("awaiting_physician");
    expect(pw.priorDecision).toBeNull();
    expect(pw.engagement).toBe("engaged");
  });

  it("moves to the first booked visit after the physician decides", () => {
    const p = person({ id: "live-2" }, { blood_in_sputum: true });
    expect(buildPathway(p, evaluate(p), "direct_ct", true).stage).toBe("ct_booked");
    expect(buildPathway(p, evaluate(p), "physician_fast", true).stage).toBe("physician_booked");
    expect(buildPathway(p, evaluate(p), "normal_route", true).stage).toBe("normal_route");
  });

  it("marks everyone who missed a visit as at risk, with one current or missed step", () => {
    for (const p of people) {
      const pw = buildPathway(p, evaluate(p), null, false);
      if (pw.missedVisits > 0) expect(pw.engagement).toBe("at_risk");
      expect(pw.steps.filter((s) => s.status === "current" || s.status === "missed")).toHaveLength(1);
    }
  });

  it("gives the synthetic cohort a mix of stages and engagement levels", () => {
    const pws = people.map((p) => buildPathway(p, evaluate(p), null, false));
    expect(new Set(pws.map((x) => x.engagement)).size).toBe(3);
    expect(pws.some((x) => x.stage === "awaiting_physician")).toBe(true);
    expect(pws.some((x) => x.stage === "ct_booked" || x.stage === "physician_booked")).toBe(true);
    expect(pws.some((x) => x.stage === "cleared" || x.stage === "specialist")).toBe(true);
  });
});
