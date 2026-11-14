// Deterministic benefit analysis: lung cancer fast lane with a risk-group survey
// compared with the current pathway, for one county.
//
// Every input is either sourced (source_id in src/data/sources.json) or an explicit
// assumption shown as an adjustable slider. The model computes access times and
// capacity only. It makes no survival or stage-shift claims (see PROJECT.md).

import type { County } from "./types";

export type ScenarioName = "cautious" | "base" | "optimistic";

export interface SimulationParams {
  /** Share of ever-smokers aged 55–80 with enough pack-years for the risk group. */
  heavySmokerShareOfEver: number;
  /** Share of invited people who answer the survey (after reminder and nurse calls). */
  responseRate: number;
  /** Share of respondents the rules place on the fast lane (direct CT or physician). */
  alarmShare: number;
  /** Of fast-lane people, share the rules propose for direct CT. */
  directCtShare: number;
  /** Of people seen by the physician, share then referred to CT. */
  ctAfterVisitShare: number;
  /** Share of fast-lane CT scans that find lung cancer. */
  cancerYieldPerCt: number;
  /** Weeks over which one yearly survey round is processed. */
  surveyWeeks: number;
  /** Current pathway: days to a primary-care appointment. */
  currentPrimaryCareWaitDays: number;
  /** Current pathway: days from primary-care referral to CT. */
  currentCtQueueDays: number;
  /** Fast lane: days to a physician. */
  fastPhysicianDays: number;
  /** Fast lane: days to CT. */
  fastCtDays: number;
  /** Two Doors: share of lung cancer patients who enter through a public health centre. */
  publicDoorShare: number;
  /** Two Doors: days from first contact to CT via occupational health or private care. */
  privateDoorDaysToCt: number;
  /** Two Doors: share of health-centre fast-lane CT referrals that find lung cancer. */
  healthCentreYield: number;
}

export interface ParamMeta {
  key: keyof SimulationParams;
  label: string;
  unit: "share" | "days" | "weeks";
  min: number;
  max: number;
  step: number;
  /** source_id in sources.json, or "assumption". */
  source_id: string;
  note?: string;
}

export const PARAM_META: ParamMeta[] = [
  { key: "heavySmokerShareOfEver", label: "Riskiryhmään kuuluvien osuus tupakoineista (vähintään 20 askivuotta)", unit: "share", min: 0.2, max: 0.8, step: 0.05, source_id: "assumption" },
  { key: "responseRate", label: "Kyselyyn vastaavien osuus", unit: "share", min: 0.1, max: 0.9, step: 0.05, source_id: "assumption", note: "Muistutus ja hoitajan soitot mukana. Ei suomalaista dataa." },
  { key: "alarmShare", label: "Pikakaistalle ohjautuvien osuus vastaajista", unit: "share", min: 0.02, max: 0.4, step: 0.01, source_id: "assumption" },
  { key: "directCtShare", label: "Suoraan TT-kuvaukseen ohjattujen osuus pikakaistasta", unit: "share", min: 0, max: 1, step: 0.05, source_id: "assumption" },
  { key: "ctAfterVisitShare", label: "Lääkärikäynnin jälkeen TT-kuvaukseen ohjattujen osuus", unit: "share", min: 0, max: 1, step: 0.05, source_id: "assumption" },
  { key: "cancerYieldPerCt", label: "Keuhkosyöpä löytyy pikakaistan TT-kuvauksista", unit: "share", min: 0.005, max: 0.2, step: 0.005, source_id: "assumption", note: "Etsitään lähde pohjoismaisista pakettipoluista." },
  { key: "surveyWeeks", label: "Kyselykierroksen käsittelyaika", unit: "weeks", min: 4, max: 52, step: 1, source_id: "assumption" },
  { key: "currentPrimaryCareWaitDays", label: "Nykyään: odotus terveyskeskuslääkärille", unit: "days", min: 0, max: 60, step: 1, source_id: "uh-acta-2025", note: "Kansallinen arvio noin kaksi viikkoa. Alueittaista lukua ei ole." },
  { key: "currentCtQueueDays", label: "Nykyään: lähetteestä TT-kuvaukseen", unit: "days", min: 0, max: 90, step: 1, source_id: "assumption", note: "Kysytään mentoreilta." },
  { key: "fastPhysicianDays", label: "Pikakaista: lääkärille", unit: "days", min: 0, max: 30, step: 1, source_id: "jensen-2017", note: "Tavoitearvo. Tanskan mallissa sairaalaan kolmessa päivässä lähetteestä." },
  { key: "fastCtDays", label: "Pikakaista: TT-kuvaukseen", unit: "days", min: 0, max: 30, step: 1, source_id: "assumption", note: "Tavoitearvo, joka vaatii varatut kuvausajat." },
  { key: "publicDoorShare", label: "Kaksi ovea: terveyskeskuksen kautta tulevien osuus", unit: "share", min: 0.3, max: 0.95, step: 0.05, source_id: "strategy", note: "Vain noin kolmannes sairastuneista on työikäisiä (s. 6). Tarkka jakauma kysytään mentoreilta." },
  { key: "privateDoorDaysToCt", label: "Kaksi ovea: työterveys tai yksityinen, päiviä TT-kuvaukseen", unit: "days", min: 0, max: 60, step: 1, source_id: "roadmap", note: "Oletus: puolet julkisen reitin ajasta. Lymfoomatutkimuksessa julkinen reitti kesti kaksi kertaa kauemmin (s. 11)." },
  { key: "healthCentreYield", label: "Kaksi ovea: keuhkosyöpä löytyy terveyskeskuksen pikakaistan TT-kuvauksista", unit: "share", min: 0.01, max: 0.4, step: 0.01, source_id: "assumption", note: "Oireisilla potilailla korkeampi kuin kyselyssä. Etsitään lähde." },
];

const COMMON: Omit<SimulationParams, "heavySmokerShareOfEver" | "responseRate" | "alarmShare" | "cancerYieldPerCt"> = {
  directCtShare: 0.3,
  ctAfterVisitShare: 0.5,
  surveyWeeks: 12,
  currentPrimaryCareWaitDays: 14,
  currentCtQueueDays: 21,
  fastPhysicianDays: 3,
  fastCtDays: 7,
  publicDoorShare: 0.65,
  privateDoorDaysToCt: 17,
  healthCentreYield: 0.1,
};

export const SCENARIOS: Record<ScenarioName, SimulationParams> = {
  cautious: { ...COMMON, heavySmokerShareOfEver: 0.4, responseRate: 0.3, alarmShare: 0.08, cancerYieldPerCt: 0.01 },
  base: { ...COMMON, heavySmokerShareOfEver: 0.5, responseRate: 0.5, alarmShare: 0.12, cancerYieldPerCt: 0.02 },
  optimistic: { ...COMMON, heavySmokerShareOfEver: 0.6, responseRate: 0.65, alarmShare: 0.15, cancerYieldPerCt: 0.04 },
};

export interface SimulationResult {
  riskGroup: number;
  respondents: number;
  nonRespondents: number;
  fastLane: number;
  directCt: number;
  physicianVisits: number;
  ctScans: number;
  cancersFound: number;
  currentDaysToCt: number;
  fastDaysToCt: number;
  daysSavedPerPerson: number;
  physicianSlotsPerWeek: number;
  ctSlotsPerWeek: number;
}

export function simulate(county: Pick<County, "population_55_80" | "ever_smoker_share">, p: SimulationParams): SimulationResult {
  const riskGroup = county.population_55_80.value * county.ever_smoker_share.value * p.heavySmokerShareOfEver;
  const respondents = riskGroup * p.responseRate;
  const fastLane = respondents * p.alarmShare;
  const directCt = fastLane * p.directCtShare;
  const physicianVisits = fastLane - directCt;
  const ctScans = directCt + physicianVisits * p.ctAfterVisitShare;
  const cancersFound = ctScans * p.cancerYieldPerCt;

  const currentDaysToCt = p.currentPrimaryCareWaitDays + p.currentCtQueueDays;
  // Direct-CT people skip the physician step; physician-route people go physician then CT.
  const fastDaysDirect = p.fastCtDays;
  const fastDaysViaPhysician = p.fastPhysicianDays + p.fastCtDays;
  const fastDaysToCt = ctScans > 0
    ? (directCt * fastDaysDirect + physicianVisits * p.ctAfterVisitShare * fastDaysViaPhysician) / ctScans
    : fastDaysViaPhysician;

  const weeks = Math.max(1, p.surveyWeeks);
  return {
    riskGroup,
    respondents,
    nonRespondents: riskGroup - respondents,
    fastLane,
    directCt,
    physicianVisits,
    ctScans,
    cancersFound,
    currentDaysToCt,
    fastDaysToCt,
    daysSavedPerPerson: currentDaysToCt - fastDaysToCt,
    physicianSlotsPerWeek: physicianVisits / weeks,
    ctSlotsPerWeek: ctScans / weeks,
  };
}

export interface DoorsResult {
  cancersPerYear: number;
  viaPublicDoor: number;
  viaPrivateDoor: number;
  publicDaysToCt: number;
  privateDaysToCt: number;
  gapDaysNow: number;
  fastLaneDaysToCt: number;
  gapDaysAfter: number;
  daysSavedPerPatient: number;
  ctReferralsPerWeek: number;
}

// Two Doors: patients who come in themselves. Compares the public health-centre door
// with occupational health or private care, before and after a health-centre fast lane
// (alarm symptoms at first contact → physician within days → reserved CT slot).
export function simulateDoors(county: Pick<County, "lung_cancer_cases_per_year">, p: SimulationParams): DoorsResult {
  const cancersPerYear = county.lung_cancer_cases_per_year.value;
  const viaPublicDoor = cancersPerYear * p.publicDoorShare;
  const publicDaysToCt = p.currentPrimaryCareWaitDays + p.currentCtQueueDays;
  const fastLaneDaysToCt = p.fastPhysicianDays + p.fastCtDays;
  const yieldShare = Math.max(p.healthCentreYield, 0.0001);
  return {
    cancersPerYear,
    viaPublicDoor,
    viaPrivateDoor: cancersPerYear - viaPublicDoor,
    publicDaysToCt,
    privateDaysToCt: p.privateDoorDaysToCt,
    gapDaysNow: publicDaysToCt - p.privateDoorDaysToCt,
    fastLaneDaysToCt,
    gapDaysAfter: fastLaneDaysToCt - p.privateDoorDaysToCt,
    daysSavedPerPatient: publicDaysToCt - fastLaneDaysToCt,
    ctReferralsPerWeek: viaPublicDoor / yieldShare / 52,
  };
}

export function simulateRange(county: Pick<County, "population_55_80" | "ever_smoker_share">, overrides: Partial<SimulationParams> = {}) {
  return {
    cautious: simulate(county, { ...SCENARIOS.cautious, ...overrides }),
    base: simulate(county, { ...SCENARIOS.base, ...overrides }),
    optimistic: simulate(county, { ...SCENARIOS.optimistic, ...overrides }),
  };
}
