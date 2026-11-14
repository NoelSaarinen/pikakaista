import { describe, expect, it } from "vitest";
import { SCENARIOS, simulate, simulateDoors, simulateRange } from "./simulation";

const county = {
  population_50_74: { value: 100000, source_id: "mock", is_estimate: true },
  ever_smoker_share: { value: 0.4, source_id: "mock", is_estimate: true },
};

describe("simulate", () => {
  it("computes the funnel from risk group to cancers found", () => {
    const r = simulate(county, { ...SCENARIOS.base, formerPerCurrentSmoker: 0 });
    // 100 000 × 0.4 × 0.4 = 16 000 in the risk group
    expect(r.riskGroup).toBeCloseTo(16000);
    expect(r.respondents).toBeCloseTo(8000);
    expect(r.nonRespondents).toBeCloseTo(8000);
    expect(r.fastLane).toBeCloseTo(960);
    expect(r.directCt).toBeCloseTo(288);
    expect(r.physicianVisits).toBeCloseTo(672);
    expect(r.ctScans).toBeCloseTo(288 + 336);
    expect(r.cancersFound).toBeCloseTo(624 * 0.02);
  });

  it("is faster than today with the default targets", () => {
    const r = simulate(county, SCENARIOS.base);
    expect(r.currentDaysToCt).toBe(14 + 15 + 9);
    expect(r.fastDaysToCt).toBeLessThan(r.currentDaysToCt);
    expect(r.daysSavedPerPerson).toBeGreaterThan(0);
  });

  it("spreads slots over the survey weeks", () => {
    const r = simulate(county, { ...SCENARIOS.base, surveyWeeks: 10 });
    expect(r.ctSlotsPerWeek).toBeCloseTo(r.ctScans / 10);
    expect(r.physicianSlotsPerWeek).toBeCloseTo(r.physicianVisits / 10);
  });

  it("gives zero people and no division errors with a zero response rate", () => {
    const r = simulate(county, { ...SCENARIOS.base, responseRate: 0 });
    expect(r.ctScans).toBe(0);
    expect(Number.isFinite(r.fastDaysToCt)).toBe(true);
  });

  it("adds former smokers to the risk group by the national ratio", () => {
    expect(SCENARIOS.base.formerPerCurrentSmoker).toBe(5);
    const withFormer = simulate(county, { ...SCENARIOS.base, formerPerCurrentSmoker: 2 });
    // 100 000 × 0.4 × (1 + 2) × 0.4 = 48 000
    expect(withFormer.riskGroup).toBeCloseTo(48000);
  });
});

describe("simulateDoors", () => {
  const withCases = { lung_cancer_cases_per_year: { value: 300, source_id: "mock", is_estimate: true } };

  it("splits patients between the two doors", () => {
    const r = simulateDoors(withCases, SCENARIOS.base);
    expect(r.viaPublicDoor).toBeCloseTo(300 * 0.7);
    expect(r.viaPrivateDoor).toBeCloseTo(300 * 0.3);
  });

  it("shows the gap between doors now and after the fast lane", () => {
    const r = simulateDoors(withCases, SCENARIOS.base);
    expect(r.publicDaysToCt).toBe(38);
    expect(r.gapDaysNow).toBe(38 - 23);
    expect(r.fastLaneDaysToCt).toBe(10);
    expect(r.gapDaysAfter).toBe(10 - 23);
    expect(r.daysSavedPerPatient).toBe(28);
  });

  it("derives weekly CT referrals from the yield", () => {
    const r = simulateDoors(withCases, { ...SCENARIOS.base, healthCentreYield: 0.1 });
    expect(r.ctReferralsPerWeek).toBeCloseTo((300 * 0.7) / 0.1 / 52);
  });

  it("does not divide by zero with a zero yield", () => {
    const r = simulateDoors(withCases, { ...SCENARIOS.base, healthCentreYield: 0 });
    expect(Number.isFinite(r.ctReferralsPerWeek)).toBe(true);
  });
});

describe("simulateRange", () => {
  it("orders cautious ≤ base ≤ optimistic for people reached", () => {
    const r = simulateRange(county);
    expect(r.cautious.ctScans).toBeLessThanOrEqual(r.base.ctScans);
    expect(r.base.ctScans).toBeLessThanOrEqual(r.optimistic.ctScans);
  });
  it("applies slider overrides to every scenario", () => {
    const r = simulateRange(county, { responseRate: 0.2 });
    expect(r.cautious.respondents / r.cautious.riskGroup).toBeCloseTo(0.2);
    expect(r.optimistic.respondents / r.optimistic.riskGroup).toBeCloseTo(0.2);
  });
});
