// PLCOm2012 lung cancer risk model: 6-year probability of lung cancer for ever-smokers.
//
// Source: Tammemägi MC et al. Selection criteria for lung-cancer screening.
// N Engl J Med 2013;368:728–736, Table 2 and its footnotes. Coefficients checked
// against the PMC author manuscript (PMC3929969) on 2026-11-14.
// The coefficients are used exactly as published and must not be changed: changing
// them would make the result no longer the validated PLCOm2012 risk.
//
// Team assumptions (documented, not part of the model):
//   - Race/ethnicity is not asked; everyone gets the reference category (white, beta 0).
//   - Current smokers have quit time 0.
//   - Missing inputs are imputed with the model's centring value (e.g. BMI 27,
//     education 4) or derived from pack-years, and listed in `imputed`.
//   - The Finnish education mapping below is ours.

import type { PlcoInputs, SurveyResponse } from "./types";

export const PLCO_COEFFICIENTS = {
  age: 0.0778868, // per year, centred at 62
  education: -0.0812744, // per level, centred at 4
  bmi: -0.0274194, // per unit, centred at 27
  copd: 0.3553063,
  personalCancerHistory: 0.4589971,
  familyHistoryLungCancer: 0.587185,
  currentSmoker: 0.2597431, // current vs former
  smokingIntensity: -1.822606, // × ((cigs per day / 10)^-1 − 0.4021541613)
  smokingIntensityCentre: 0.4021541613,
  smokingDuration: 0.0317321, // per year, centred at 27
  quitTime: -0.0308572, // per year, centred at 10
  constant: -4.532506,
} as const;

/** Probability threshold the paper used to select as many people as the NLST criteria (Results, Table 4). */
export const PLCO_THRESHOLD = 0.013455;

/** Risk categories the paper used for net reclassification (Methods): < 1 %, 1–2 %, ≥ 2 %. */
export const PLCO_CATEGORY = { medium: 0.01, high: 0.02 } as const;

/** PLCOm2012 education levels with the team's Finnish mapping. */
export const EDUCATION_LEVELS: { level: number; label: string }[] = [
  { level: 1, label: "Peruskoulu, kansakoulu tai vähemmän" },
  { level: 2, label: "Lukio tai ammatillinen perustutkinto" },
  { level: 3, label: "Ammatillinen lisäkoulutus tai opistotaso" },
  { level: 4, label: "Korkeakouluopintoja ilman tutkintoa" },
  { level: 5, label: "Alempi korkeakoulututkinto tai AMK" },
  { level: 6, label: "Ylempi korkeakoulututkinto tai tohtori" },
];

export interface PlcoTerm {
  key: keyof PlcoInputs | "age" | "current_smoker";
  label: string;
  /** Contribution to the logit. Positive raises the risk. */
  logit: number;
}

export interface PlcoResult {
  /** 6-year lung cancer probability, 0–1. */
  probability: number;
  terms: PlcoTerm[];
  /** Inputs that were missing and filled in. */
  imputed: (keyof PlcoInputs)[];
}

/** Fills missing inputs. Cigarettes per day and years smoked are derived from pack-years when possible. */
export function plcoInputs(r: SurveyResponse): { inputs: PlcoInputs; imputed: (keyof PlcoInputs)[] } {
  const given = r.plco ?? {};
  const imputed: (keyof PlcoInputs)[] = [];
  const pick = <K extends keyof PlcoInputs>(key: K, fallback: PlcoInputs[K]): PlcoInputs[K] => {
    const v = given[key];
    if (v === undefined || v === null || (typeof v === "number" && !Number.isFinite(v))) {
      imputed.push(key);
      return fallback;
    }
    return v as PlcoInputs[K];
  };
  const current = r.smoking.status === "current";
  const yearsSinceQuit = current ? 0 : pick("years_since_quit", 10);
  const smokingYears = pick("smoking_years", Math.max(1, Math.min(27, r.age - 18 - yearsSinceQuit)));
  const cigsPerDay = pick("cigs_per_day", Math.max(1, Math.round((r.smoking.pack_years * 20) / Math.max(1, smokingYears))));
  return {
    inputs: {
      education: pick("education", 4),
      bmi: pick("bmi", 27),
      copd: pick("copd", false),
      personal_cancer_history: pick("personal_cancer_history", false),
      family_history_lung_cancer: pick("family_history_lung_cancer", false),
      cigs_per_day: cigsPerDay,
      smoking_years: smokingYears,
      years_since_quit: yearsSinceQuit,
    },
    imputed,
  };
}

/** Pure PLCOm2012 equation. `current` is true for current smokers. */
export function plcom2012(age: number, current: boolean, x: PlcoInputs): Omit<PlcoResult, "imputed"> {
  const c = PLCO_COEFFICIENTS;
  const cpd = Math.max(0.1, x.cigs_per_day);
  const terms: PlcoTerm[] = [
    { key: "age", label: "Ikä", logit: c.age * (age - 62) },
    { key: "education", label: "Koulutus", logit: c.education * (x.education - 4) },
    { key: "bmi", label: "Painoindeksi", logit: c.bmi * (x.bmi - 27) },
    { key: "copd", label: "Keuhkoahtaumatauti (COPD)", logit: x.copd ? c.copd : 0 },
    { key: "personal_cancer_history", label: "Aiempi syöpä", logit: x.personal_cancer_history ? c.personalCancerHistory : 0 },
    { key: "family_history_lung_cancer", label: "Keuhkosyöpä lähisuvussa", logit: x.family_history_lung_cancer ? c.familyHistoryLungCancer : 0 },
    { key: "current_smoker", label: "Tupakoi edelleen", logit: current ? c.currentSmoker : 0 },
    { key: "cigs_per_day", label: "Savukkeita päivässä", logit: c.smokingIntensity * (1 / (cpd / 10) - c.smokingIntensityCentre) },
    { key: "smoking_years", label: "Tupakointivuodet", logit: c.smokingDuration * (x.smoking_years - 27) },
    { key: "years_since_quit", label: "Vuosia lopettamisesta", logit: c.quitTime * (x.years_since_quit - 10) },
  ];
  const logit = c.constant + terms.reduce((s, t) => s + t.logit, 0);
  return { probability: Math.exp(logit) / (1 + Math.exp(logit)), terms };
}

/** PLCOm2012 for one survey answer. Null for never-smokers, for whom the model does not apply. */
export function plcoRisk(r: SurveyResponse): PlcoResult | null {
  if (r.smoking.status === "never") return null;
  const { inputs, imputed } = plcoInputs(r);
  return { ...plcom2012(r.age, r.smoking.status === "current", inputs), imputed };
}
