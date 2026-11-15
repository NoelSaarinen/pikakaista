// A survey answer in Finnish words for the AI prompts. The models quote and summarize
// what they see, so they must never get the stored field names (cough_weeks,
// blood_in_sputum: true). Display only: the rules read the stored answer unchanged.

import type { SurveyResponse } from "./types";

const yesNo = (b: boolean | undefined) => (b ? "kyllä" : "ei");

export function symptomsFi(r: SurveyResponse): string[] {
  const s = r.symptoms;
  return [
    s.cough_weeks > 0 ? `yskää ${s.cough_weeks} viikkoa` : "ei yskää",
    `verta yskösissä: ${yesNo(s.blood_in_sputum)}`,
    `hengenahdistusta: ${yesNo(s.breathlessness)}`,
    `rintakipua: ${yesNo(s.chest_pain)}`,
    `tahatonta laihtumista: ${yesNo(s.weight_loss)}`,
    ...(s.hoarseness !== undefined ? [`käheyttä: ${yesNo(s.hoarseness)}`] : []),
    `keuhkokuumeita viimeisen vuoden aikana: ${s.pneumonias_last_year}`,
  ];
}

export function smokingFi(r: SurveyResponse): string {
  if (r.smoking.status === "never") return "ei ole tupakoinut";
  return `${r.smoking.status === "current" ? "tupakoi" : "entinen tupakoija"}, ${r.smoking.pack_years} askivuotta`;
}

export function visitsFi(r: SurveyResponse): string[] {
  return r.previous_visits.map((v) => `lääkärissä ${v.months_ago} kk sitten, syy: ${v.reason}`);
}
