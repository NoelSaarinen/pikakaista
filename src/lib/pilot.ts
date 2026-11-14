// The Finnish lung cancer screening pilot and its published predecessor.
//
// ISC-LDCT (NCT07331519) is the national pilot that started in early 2026 in five areas:
// Uusimaa, Pirkanmaa, Pohjanmaa, Pohjois-Pohjanmaa and Varsinais-Suomi. Its results are
// NOT published yet, so the demo uses only its design: areas, eligibility and size.
// Outcome figures come from its predecessor LDCT-SC-FI (Oulu, Wichmann et al. 2025),
// which used the same eligibility criteria. They are labelled as predecessor results.
//
// Facts as recorded in docs/seulontapilotti/SEULONTAPILOTTI.md (checked 2026-11-14) and
// the wichmann-2025 entry in src/data/sources.json.

import countiesData from "@/data/counties.json";
import type { County, SurveyResponse } from "./types";

export const ISC_LDCT = {
  name: "ISC-LDCT",
  sourceId: "isc-ldct",
  participants: 1200,
  startDate: "2026-02-02",
  minAge: 50,
  maxAge: 74,
  /** Eligible: current smokers with at least 15 cigarettes a day for 25 years, or 10 a day for 30 years. */
  intensity: [
    { cigsPerDay: 15, years: 25 },
    { cigsPerDay: 10, years: 30 },
  ],
  arms: [
    "Lopetussovellus ja matala-annos-TT",
    "Kirjallinen lopetusmateriaali ja matala-annos-TT",
    "Lopetussovellus ilman TT:tä",
  ],
  /** Areas named in the press releases. */
  areas: ["Uusimaa", "Pirkanmaa", "Pohjanmaa", "Pohjois-Pohjanmaa", "Varsinais-Suomi"],
  resultsPublished: false,
} as const;

/** LDCT-SC-FI (Oulu 2022–2023): the published predecessor with the same criteria. */
export const LDCT_SC_FI = {
  name: "LDCT-SC-FI",
  sourceId: "wichmann-2025",
  participants: 200,
  round1: { cancers: 2, scans: 200 },
  round2: { cancers: 4, scans: 183 },
  cancers: 6,
  scans: 383,
  stageI: 5,
  ppv: 0.75,
  /** Share recruited through healthcare referrals; most came through newspaper ads (74.5 %). */
  healthcareReferralShare: 0.025,
  newspaperShare: 0.745,
  quitRateApp: 0.183,
  quitRateWritten: 0.128,
} as const;

export const cancerYieldPerScan = LDCT_SC_FI.cancers / LDCT_SC_FI.scans;

/**
 * Wellbeing services counties in the pilot. "Uusimaa" is read as Helsinki and the four
 * Uusimaa counties (team inference, matching the roadmap's "Helsinki and eight counties").
 */
export const PILOT_COUNTY_IDS = [
  "helsinki", "ita-uusimaa", "keski-uusimaa", "lansi-uusimaa", "vantaa-kerava",
  "pirkanmaa", "pohjanmaa", "pohjois-pohjanmaa", "varsinais-suomi",
] as const;

export function isPilotCounty(id: string): boolean {
  return (PILOT_COUNTY_IDS as readonly string[]).includes(id);
}

export type PilotEligibility =
  | { eligible: true }
  | { eligible: false; reason: "age" | "not_current" | "intensity" | "unknown_history" };

export const PILOT_REASON_LABEL: Record<Exclude<PilotEligibility, { eligible: true }>["reason"], string> = {
  age: "ikä ei ole 50–74",
  not_current: "ei tupakoi nyt (lopettaneet eivät kelpaa pilottiin)",
  intensity: "tupakointi alle 15 savuketta/25 v tai 10 savuketta/30 v",
  unknown_history: "savukkeiden määrä tai vuodet puuttuvat",
};

/**
 * ISC-LDCT inclusion criteria that the survey can check. Exclusions (earlier melanoma
 * or lung, kidney or breast cancer, chest CT within a year) and the smartphone
 * requirement are not asked, so a clinician must still confirm them.
 */
export function pilotEligibility(r: SurveyResponse): PilotEligibility {
  if (r.age < ISC_LDCT.minAge || r.age > ISC_LDCT.maxAge) return { eligible: false, reason: "age" };
  if (r.smoking.status !== "current") return { eligible: false, reason: "not_current" };
  const cpd = r.plco?.cigs_per_day;
  const years = r.plco?.smoking_years;
  if (cpd === undefined || years === undefined) return { eligible: false, reason: "unknown_history" };
  return ISC_LDCT.intensity.some((t) => cpd >= t.cigsPerDay && years >= t.years)
    ? { eligible: true }
    : { eligible: false, reason: "intensity" };
}

/** Population aged 55–80 in the pilot areas (StatFin), for the coverage comparison. */
export function pilotAreaPopulation(): number {
  return (countiesData as County[]).filter((c) => isPilotCounty(c.id)).reduce((s, c) => s + c.population_55_80.value, 0);
}
