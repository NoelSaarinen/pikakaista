import { describe, expect, it } from "vitest";
import counties from "@/data/counties.json";
import { allSources, curativeRanking, regionalFindings } from "./regional";

describe("regional Goal 3 findings", () => {
  it("covers every county in the demo", () => {
    for (const c of counties) {
      const f = regionalFindings(c.id);
      expect(f.curativeShare, c.id).toBeDefined();
      expect(f.mortalityAsr, c.id).toBeDefined();
      expect(f.survival, c.id).toBeDefined();
    }
  });

  it("ranks Lappi last for curative treatment and flags its mortality", () => {
    const ranking = curativeRanking();
    expect(ranking[ranking.length - 1].id).toBe("lappi");
    const f = regionalFindings("lappi");
    expect(f.curativeRank).toBe(22);
    expect(f.signal).toBe("consistently_higher");
  });

  it("resolves every source the view cites", () => {
    for (const id of ["fcr-quality-lung-2026", "fcr-mortality", "fcr-survival", "kuitunen-2026", "strategy"]) {
      expect(allSources.some((s) => s.id === id), id).toBe(true);
    }
  });
});
