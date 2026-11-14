import { describe, expect, it } from "vitest";
import counties from "@/data/counties.json";
import { regionLanguages } from "./region-languages";
import { SURVEY_LANGS } from "./survey-text";

const ALL = SURVEY_LANGS.map((l) => l.code);

describe("region languages", () => {
  it("covers every wellbeing services county and always offers Finnish and Swedish", () => {
    for (const c of counties as { id: string }[]) {
      const r = regionLanguages(c.id, ALL);
      expect(r.regionCode, c.id).not.toBe("SSS");
      expect(r.primary.map((l) => l.code)).toEqual(expect.arrayContaining(["fi", "sv"]));
      expect([...r.primary.map((l) => l.code), ...r.more].sort()).toEqual([...ALL].sort());
      expect(r.coverage).toBeGreaterThan(0.9);
    }
  });

  it("puts Sámi second in Lapland and matches the national figure", () => {
    const lappi = regionLanguages("lappi", ALL);
    expect(lappi.primary.slice(0, 2).map((l) => l.code)).toEqual(["fi", "se"]);
    expect(lappi.coverage).toBeCloseTo(0.992, 3);
  });

  it("puts Swedish first in Ostrobothnia", () => {
    expect(regionLanguages("pohjanmaa", ALL).primary[0].code).toBe("sv");
  });

  it("names Somali for an interpreter call in the Uusimaa counties", () => {
    const helsinki = regionLanguages("helsinki", ALL);
    expect(helsinki.sharedRegion).toBe(true);
    expect(helsinki.interpreter.map((l) => l.name)).toContain("somali");
  });
});
