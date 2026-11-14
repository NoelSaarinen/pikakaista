import { describe, expect, it } from "vitest";
import countiesData from "./counties.json";
import sourcesData from "./sources.json";
import lung from "./raw/syoparekisteri-lung-c33-c34.json";
import type { County, SourceRef } from "@/lib/types";

const counties = countiesData as County[];
const sources = sourcesData as SourceRef[];
const sourceIds = new Set(sources.map((s) => s.id));
const NUMERIC = ["population_55_80", "ever_smoker_share", "lung_cancer_cases_per_year"] as const;

describe("counties.json", () => {
  it("has unique ids and keeps Pirkanmaa as the demo default", () => {
    expect(new Set(counties.map((c) => c.id)).size).toBe(counties.length);
    expect(counties[0].id).toBe("pirkanmaa");
  });

  it("gives every value a known source, a year, an estimate flag and a note", () => {
    for (const c of counties) {
      for (const key of NUMERIC) {
        const v = c[key];
        expect(sourceIds.has(v.source_id), `${c.id}.${key} source ${v.source_id}`).toBe(true);
        expect(Number.isFinite(v.value), `${c.id}.${key} value`).toBe(true);
        expect(typeof v.is_estimate).toBe("boolean");
        expect(v.note, `${c.id}.${key} note`).toBeTruthy();
        if (v.source_id !== "mock") expect(v.year, `${c.id}.${key} year`).toBeGreaterThan(2000);
      }
      expect(c.ever_smoker_share.value).toBeGreaterThan(0);
      expect(c.ever_smoker_share.value).toBeLessThan(1);
    }
  });

  it("matches the Cancer Registry snapshot for 2020–2024", () => {
    const pirkanmaa = lung.rows.find((r) => r[0] === "Pirkanmaan hyvinvointialue")!;
    const recent = pirkanmaa.slice(1 + lung.years.indexOf(2020)) as number[];
    const mean = recent.reduce((s, v) => s + v, 0) / recent.length;
    expect(counties[0].lung_cancer_cases_per_year.value).toBeCloseTo(mean, 1);
  });
});
