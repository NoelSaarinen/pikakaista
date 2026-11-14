import { describe, expect, it } from "vitest";
import synthetic from "@/data/synthetic/responses.json";
import { buildPathway } from "./pathway";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import { EMPTY_FILTERS, searchPatients, searchText, urgencyOf, type SearchablePatient } from "./search";
import type { SurveyResponse } from "./types";

const people: SearchablePatient[] = (synthetic as SurveyResponse[]).map((response) => {
  const rule = evaluate(response);
  const pathway = buildPathway(response, rule, null, false);
  return { response, rule, pathway, priority: riskPriority(response), decision: null, live: false };
});

describe("patient search", () => {
  it("returns everyone with empty filters", () => {
    expect(searchPatients(people, EMPTY_FILTERS)).toHaveLength(people.length);
  });

  it("finds a patient by id", () => {
    const hits = searchPatients(people, { ...EMPTY_FILTERS, query: "p-0005" });
    expect(hits.map((p) => p.response.id)).toEqual(["p-0005"]);
  });

  it("requires every word to match and ignores case", () => {
    const hits = searchPatients(people, { ...EMPTY_FILTERS, query: "YSKÄ entinen" });
    expect(hits.length).toBeGreaterThan(0);
    for (const p of hits) {
      expect(p.response.smoking.status).toBe("former");
      // "yskä" may come from the symptom, a rule reason, own words or an earlier visit's reason.
      expect(searchText(p)).toContain("yskä");
    }
    // Most hits have the symptom itself.
    expect(hits.filter((p) => p.response.symptoms.cough_weeks > 0).length).toBeGreaterThan(hits.length / 2);
  });

  it("filters by smoking status, symptoms and age together", () => {
    const hits = searchPatients(people, { ...EMPTY_FILTERS, smoking: "current", symptoms: ["blood_in_sputum"], minAge: 60, maxAge: 80 });
    for (const p of hits) {
      expect(p.response.smoking.status).toBe("current");
      expect(p.response.symptoms.blood_in_sputum).toBe(true);
      expect(p.response.age).toBeGreaterThanOrEqual(60);
      expect(p.response.age).toBeLessThanOrEqual(80);
    }
  });

  it("finds never-smokers with symptoms, who are outside the survey risk group", () => {
    const hits = searchPatients(people, { ...EMPTY_FILTERS, smoking: "never", urgency: "symptom_review" });
    expect(hits.length).toBeGreaterThan(0);
    for (const p of hits) expect(p.priority.level).toBe("not_applicable");
  });

  it("sorts red flags first by default and by PLCOm2012 on request", () => {
    const byUrgency = searchPatients(people, EMPTY_FILTERS);
    expect(urgencyOf(byUrgency[0].rule)).toBe("red_flag");
    const byPlco = searchPatients(people, { ...EMPTY_FILTERS, sort: "plco" });
    for (let i = 1; i < byPlco.length; i++) expect(byPlco[i - 1].priority.score).toBeGreaterThanOrEqual(byPlco[i].priority.score);
  });

  it("returns nothing for a word no patient has", () => {
    expect(searchPatients(people, { ...EMPTY_FILTERS, query: "zzzz-ei-ole" })).toEqual([]);
  });
});
