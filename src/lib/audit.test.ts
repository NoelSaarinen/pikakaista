// Independent audit of the demo's data and calculations (2026-11-14).
// Recomputes the published figures from the raw snapshots and hand-derived formulas,
// instead of trusting the code that produced them.
import { describe, expect, it } from "vitest";
import countiesData from "@/data/counties.json";
import statfin from "@/data/raw/statfin-population-55-80.json";
import sotkanet from "@/data/raw/sotkanet.json";
import registry from "@/data/raw/syoparekisteri-lung-c33-c34.json";
import synthetic from "@/data/synthetic/responses.json";
import { PLCO_COEFFICIENTS, PLCO_THRESHOLD, plcom2012, plcoRisk } from "./plco";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import { SCENARIOS, simulate, simulateDoors } from "./simulation";
import { compareWithPriority } from "./store";
import type { County, SurveyResponse } from "./types";

const counties = countiesData as County[];
const people = synthetic as SurveyResponse[];

describe("regional data matches the raw snapshots", () => {
  it("population 55–80 is the sum of the county's municipalities (StatFin 11re)", () => {
    const munis = statfin.municipalities as { hva: string; pop_55_80: number }[];
    for (const c of counties) {
      const sum = munis.filter((m) => m.hva === (c as County & { code: string }).code).reduce((s, m) => s + m.pop_55_80, 0);
      expect(c.population_55_80.value, c.id).toBe(sum);
    }
  });

  it("daily-smoking share equals the Sotkanet 4404 value for the stated year", () => {
    const byYear = (sotkanet.indicators as Record<string, { by_year: Record<string, Record<string, number>> }>)["4404"].by_year;
    for (const c of counties) {
      const code = (c as County & { code: string }).code;
      const raw = byYear[String(c.ever_smoker_share.year)]?.[code];
      expect(raw, c.id).toBeDefined();
      expect(c.ever_smoker_share.value, c.id).toBeCloseTo(raw / 100, 6);
    }
  });

  it("lung cancer cases per year are the 2020–2024 mean of the registry table", () => {
    const years = registry.years as number[];
    const idx = [2020, 2021, 2022, 2023, 2024].map((y) => years.indexOf(y));
    const rows = registry.rows as (string | number)[][];
    for (const c of counties) {
      const name = (statfin.hva_names as Record<string, string>)[(c as County & { code: string }).code];
      const row = rows.find((r) => r[0] === name);
      expect(row, c.id).toBeDefined();
      const mean = idx.reduce((s, i) => s + Number(row![i + 1]), 0) / 5;
      expect(c.lung_cancer_cases_per_year.value, c.id).toBeCloseTo(mean, 1);
    }
  });
});

describe("PLCOm2012 equation", () => {
  it("gives the model constant at the centring values (logit = −4.532506)", () => {
    const r = plcom2012(62, false, {
      race: "white", education: 4, bmi: 27, copd: false, personal_cancer_history: false, family_history_lung_cancer: false,
      cigs_per_day: 10 / PLCO_COEFFICIENTS.smokingIntensityCentre, smoking_years: 27, years_since_quit: 10,
    });
    expect(r.probability).toBeCloseTo(1 / (1 + Math.exp(4.532506)), 12);
  });

  it("matches a hand calculation for a heavy current smoker", () => {
    // 70 v, current, 30 cig/day, 45 years, education 2, BMI 24, COPD, family history.
    const c = PLCO_COEFFICIENTS;
    const logit = c.constant + c.age * 8 + c.education * -2 + c.bmi * -3 + c.copd + c.familyHistoryLungCancer + c.currentSmoker
      + c.smokingIntensity * (1 / 3 - c.smokingIntensityCentre) + c.smokingDuration * 18 + c.quitTime * -10;
    const r = plcom2012(70, true, { race: "white", education: 2, bmi: 24, copd: true, personal_cancer_history: false, family_history_lung_cancer: true, cigs_per_day: 30, smoking_years: 45, years_since_quit: 0 });
    expect(r.probability).toBeCloseTo(1 / (1 + Math.exp(-logit)), 12);
  });

  it("threshold decisions use the unrounded probability", () => {
    for (const p of people) {
      const exact = plcoRisk(p);
      if (!exact) continue;
      expect(riskPriority(p).aboveThreshold, p.id).toBe(exact.probability >= PLCO_THRESHOLD);
    }
  });
});

describe("benefit calculation", () => {
  it("matches the hand formula for every county and scenario", () => {
    for (const c of counties) {
      for (const p of Object.values(SCENARIOS)) {
        const r = simulate(c, p);
        const riskGroup = c.population_55_80.value * c.ever_smoker_share.value * (1 + p.formerPerCurrentSmoker) * p.heavySmokerShareOfEver;
        const fast = riskGroup * p.responseRate * p.alarmShare;
        const ct = fast * p.directCtShare + fast * (1 - p.directCtShare) * p.ctAfterVisitShare;
        expect(r.riskGroup).toBeCloseTo(riskGroup, 6);
        expect(r.ctScans).toBeCloseTo(ct, 6);
        expect(r.cancersFound).toBeCloseTo(ct * p.cancerYieldPerCt, 6);
        expect(r.ctSlotsPerWeek).toBeCloseTo(ct / p.surveyWeeks, 6);
      }
    }
  });

  it("days to CT add up the sourced steps (14 + 15 + 9 now, 3 + 7 on the fast lane)", () => {
    const d = simulateDoors(counties[0], SCENARIOS.base);
    expect(d.publicDaysToCt).toBe(SCENARIOS.base.currentPrimaryCareWaitDays + SCENARIOS.base.currentVisitToReferralDays + SCENARIOS.base.currentCtQueueDays);
    expect(d.fastLaneDaysToCt).toBe(SCENARIOS.base.fastPhysicianDays + SCENARIOS.base.fastCtDays);
  });
});

describe("prioritisation", () => {
  const items = people.map((response) => ({ response, rule: evaluate(response), priority: riskPriority(response) }));
  const sorted = [...items].sort(compareWithPriority);

  it("puts every red flag before everyone without one, and symptoms before no symptoms", () => {
    const rank = (x: (typeof items)[number]) => (x.rule.redFlag ? 0 : x.rule.symptomReviewRequired ? 1 : 2);
    for (let i = 1; i < sorted.length; i++) expect(rank(sorted[i]), sorted[i].response.id).toBeGreaterThanOrEqual(rank(sorted[i - 1]));
  });

  it("never lets PLCOm2012 risk outrank a red flag", () => {
    const firstNonRed = sorted.findIndex((x) => !x.rule.redFlag);
    const highestRiskWithoutFlag = Math.max(...items.filter((x) => !x.rule.redFlag).map((x) => x.priority.score));
    expect(sorted.slice(0, firstNonRed).every((x) => x.rule.redFlag)).toBe(true);
    expect(highestRiskWithoutFlag).toBeGreaterThan(0);
  });

  it("gives no alarm points for age or smoking", () => {
    const base = people.find((p) => !evaluate(p).symptomReviewRequired && p.smoking.status === "never")!;
    const older = { ...base, age: 80, smoking: { status: "current" as const, pack_years: 60 } };
    expect(evaluate(older).score).toBe(evaluate(base).score);
    expect(evaluate(older).redFlag).toBe(false);
  });
});

describe("screening list uses exact risks", () => {
  it("is eligible exactly when the unrounded real or age-standardised risk reaches 1.3455 %", async () => {
    const { screeningList } = await import("./screening");
    const persons = people.map((response) => ({ response, rule: evaluate(response), priority: riskPriority(response) }));
    const s = screeningList(persons, { ctSlotsPerWeek: 1000, weeks: 1, mode: "equity" });
    for (const r of s.rows) {
      if (!["invite", "waiting", "below_threshold"].includes(r.status)) continue;
      const exact = r.person.priority.probability >= PLCO_THRESHOLD || r.person.priority.ageStandardisedProbability >= PLCO_THRESHOLD;
      expect(r.status !== "below_threshold", r.person.response.id).toBe(exact);
    }
  });
});
