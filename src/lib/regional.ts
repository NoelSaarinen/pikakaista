// Regional Goal 3 findings for the decision-maker view and the brief.
// Data: src/data/goal3_regional.json (mortality, survival) and
// src/data/curative_by_county.json (curative treatment share, quality report 2019–2023).

import curativeData from "@/data/curative_by_county.json";
import goal3Data from "@/data/goal3_regional.json";
import sourcesData from "@/data/sources.json";
import type { SourceRef } from "./types";

type Figure = { value: number; source_id: string; year?: string | number; ci95_low?: number; ci95_high?: number };
type Signal = "consistently_higher" | "consistently_lower" | "higher_latest_period_only" | "lower_latest_period_only" | "not_distinguishable_from_national";

interface Goal3Region {
  id: string;
  name: string;
  cooperation_area?: string;
  lung_cancer_deaths_per_year?: Figure;
  lung_cancer_mortality_asr?: Figure;
  mortality_signal?: { value: Signal };
}

interface CooperationArea {
  id: string;
  name: string;
  registry_name?: string;
  survival_relative_5y?: Figure;
}

const goal3 = goal3Data as unknown as {
  sources: { id: string; title: string; url?: string; table?: string; retrieved: string; note?: string }[];
  national: { lung_cancer_mortality_asr: Figure; survival_relative_5y: Figure };
  cooperation_areas: CooperationArea[];
  regions: Goal3Region[];
};

const curative = curativeData as {
  source_id: string;
  period: string;
  national: { curative_share: number };
  counties: { id: string; name: string; new_cases: number; curative_share: number; no_treatment_record_share: number }[];
};

/** Sources from sources.json plus the Goal 3 file's own sources, without duplicates. */
export const allSources: SourceRef[] = [
  ...(sourcesData as SourceRef[]),
  ...goal3.sources
    .filter((s) => !(sourcesData as SourceRef[]).some((x) => x.id === s.id))
    .map((s) => ({ id: s.id, title: s.title, url: s.url ?? "", page: s.table, retrieved: s.retrieved, note: s.note })),
];

export const SIGNAL_LABEL: Record<Signal, string> = {
  consistently_higher: "Selvästi koko maata korkeampi molemmilla jaksoilla (2015–2019 ja 2020–2024)",
  consistently_lower: "Selvästi koko maata matalampi molemmilla jaksoilla (2015–2019 ja 2020–2024)",
  higher_latest_period_only: "Koholla vain viimeisimmällä jaksolla, ei vielä löydös",
  lower_latest_period_only: "Matalampi vain viimeisimmällä jaksolla, ei vielä löydös",
  not_distinguishable_from_national: "Ei erotu koko maasta (ero satunnaisvaihtelun sisällä)",
};

export interface RegionalFindings {
  curativeShare?: number;
  curativeNational: number;
  curativeRank?: number;
  curativeCount: number;
  curativeSourceId: string;
  curativePeriod: string;
  mortalityAsr?: Figure;
  mortalityNational: Figure;
  deathsPerYear?: number;
  signal?: Signal;
  survivalAreaName?: string;
  survival?: Figure;
  survivalNational: Figure;
}

export function regionalFindings(countyId: string): RegionalFindings {
  const ranked = [...curative.counties].sort((a, b) => b.curative_share - a.curative_share);
  const idx = ranked.findIndex((c) => c.id === countyId);
  // Ties share a rank: 1 + number of counties with a strictly higher share.
  const rank = idx >= 0 ? 1 + ranked.filter((c) => c.curative_share > ranked[idx].curative_share).length : undefined;
  const region = goal3.regions.find((r) => r.id === countyId);
  const area = goal3.cooperation_areas.find((a) => a.id === region?.cooperation_area);
  return {
    curativeShare: idx >= 0 ? ranked[idx].curative_share : undefined,
    curativeNational: curative.national.curative_share,
    curativeRank: rank,
    curativeCount: ranked.length,
    curativeSourceId: curative.source_id,
    curativePeriod: curative.period,
    mortalityAsr: region?.lung_cancer_mortality_asr,
    mortalityNational: goal3.national.lung_cancer_mortality_asr,
    deathsPerYear: region?.lung_cancer_deaths_per_year?.value,
    signal: region?.mortality_signal?.value,
    survivalAreaName: area?.registry_name ?? area?.name,
    survival: area?.survival_relative_5y,
    survivalNational: goal3.national.survival_relative_5y,
  };
}

/** Counties sorted by curative-treatment share, highest first. */
export function curativeRanking() {
  return [...curative.counties].sort((a, b) => b.curative_share - a.curative_share);
}

/** Age-standardised lung cancer mortality for every county, highest first (Goal 3 indicator). */
export function mortalityRanking(): { id: string; name: string; value: number; signal?: Signal }[] {
  return goal3.regions
    .filter((r) => r.lung_cancer_mortality_asr)
    .map((r) => ({ id: r.id, name: r.name, value: r.lung_cancer_mortality_asr!.value, signal: r.mortality_signal?.value }))
    .sort((a, b) => b.value - a.value);
}

export const NATIONAL_MORTALITY = goal3.national.lung_cancer_mortality_asr.value;
