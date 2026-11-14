import { describe, expect, it } from "vitest";
import { SCENARIOS, simulate, simulateDoors, simulateRange } from "./simulation";

const county = {
  population_55_80: { value: 100000, source_id: "mock", is_estimate: true },
  ever_smoker_share: { value: 0.4, source_id: "mock", is_estimate: true },
};

describe("simulate", () => {
  it("computes the funnel from risk group to cancers found", () => {
    const r = simulate(county, SCENARIOS.base);
    // 100 000 × 0.4 × 0.5 = 20 000 in the risk group
    expect(r.riskGroup).toBeCloseTo(20000);
    expect(r.respondents).toBeCloseTo(10000);
    expect(r.nonRespondents).toBeCloseTo(10000);
    expect(r.fastLane).toBeCloseTo(1200);
    expect(r.directCt).toBeCloseTo(360);
    expect(r.physicianVisits).toBeCloseTo(840);
    expect(r.ctScans).toBeCloseTo(360 + 420);
    expect(r.cancersFound).toBeCloseTo(780 * 0.02);
  });

  it("is faster than today with the default targets", () => {
    const r = simulate(county, SCENARIOS.base);
    expect(r.currentDaysToCt).toBe(35);
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

  it("adds former smokers to the risk group only when the team sets a ratio", () => {
    expect(SCENARIOS.base.formerPerCurrentSmoker).toBe(0);
    const withFormer = simulate(county, { ...SCENARIOS.base, formerPerCurrentSmoker: 2 });
    // 100 000 × 0.4 × (1 + 2) × 0.5 = 60 000
    expect(withFormer.riskGroup).toBeCloseTo(60000);
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
    expect(r.publicDaysToCt).toBe(35);
    expect(r.gapDaysNow).toBe(35 - 21);
    expect(r.fastLaneDaysToCt).toBe(10);
    expect(r.gapDaysAfter).toBe(10 - 21);
    expect(r.daysSavedPerPatient).toBe(25);
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
