import { describe, expect, it } from "vitest";
import countiesData from "@/data/counties.json";
import sources from "@/data/sources.json";
import { cancerYieldPerScan, isPilotCounty, LDCT_SC_FI, PILOT_COUNTY_IDS, pilotEligibility } from "./pilot";
import type { County, SurveyResponse } from "./types";

const person = (patch: Partial<SurveyResponse> & { cpd?: number; years?: number }): SurveyResponse => ({
  id: "t", age: 60, language: "fi", smoking: { status: "current", pack_years: 30 },
  symptoms: { cough_weeks: 0, blood_in_sputum: false, weight_loss: false, breathlessness: false, chest_pain: false, pneumonias_last_year: 0 },
  previous_visits: [], synthetic: true,
  plco: { cigs_per_day: patch.cpd ?? 20, smoking_years: patch.years ?? 30 },
  ...patch,
});

describe("ISC-LDCT pilot", () => {
  it("applies the published inclusion criteria", () => {
    expect(pilotEligibility(person({})).eligible).toBe(true);
    expect(pilotEligibility(person({ cpd: 15, years: 25 })).eligible).toBe(true);
    expect(pilotEligibility(person({ cpd: 10, years: 30 })).eligible).toBe(true);
    expect(pilotEligibility(person({ cpd: 12, years: 28 }))).toEqual({ eligible: false, reason: "intensity" });
    expect(pilotEligibility(person({ age: 49 }))).toEqual({ eligible: false, reason: "age" });
    expect(pilotEligibility(person({ age: 75 }))).toEqual({ eligible: false, reason: "age" });
    expect(pilotEligibility(person({ smoking: { status: "former", pack_years: 40 } }))).toEqual({ eligible: false, reason: "not_current" });
  });

  it("marks exactly the nine pilot counties, each with a known source", () => {
    const counties = countiesData as County[];
    const marked = counties.filter((c) => c.in_ldct_pilot.value).map((c) => c.id).sort();
    expect(marked).toEqual([...PILOT_COUNTY_IDS].sort());
    for (const c of counties) {
      expect(c.in_ldct_pilot.value).toBe(isPilotCounty(c.id));
      expect(sources.some((s) => s.id === c.in_ldct_pilot.source_id)).toBe(true);
    }
  });

  it("uses the predecessor's published counts", () => {
    expect(LDCT_SC_FI.round1.cancers + LDCT_SC_FI.round2.cancers).toBe(LDCT_SC_FI.cancers);
    expect(LDCT_SC_FI.round1.scans + LDCT_SC_FI.round2.scans).toBe(LDCT_SC_FI.scans);
    expect(cancerYieldPerScan).toBeCloseTo(6 / 383, 10);
    expect(sources.some((s) => s.id === "isc-ldct")).toBe(true);
  });
});
