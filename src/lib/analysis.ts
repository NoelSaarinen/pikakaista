// Preliminary AI analysis of one survey answer, with adaptive follow-up questions.
//
// Two separate assessments, as the team's design requires:
//   - urgency: decided by the alarm rules. AI may add a concern but never lowers it.
//   - long-term risk: the PLCOm2012 6-year risk from priority.ts, quoted as computed.
// AI picks follow-up questions only from a fixed, reviewed question bank, so it cannot
// ask anything unsafe or off-topic. Without an API key the same choice is made by rules.

import { completeJson } from "./llm";
import { formatRisk, PRIORITY_LEVEL_LABEL, type RiskPriority } from "./priority";
import { PLACEMENT_LABEL } from "./rules";
import type { RuleResult, SurveyResponse } from "./types";

export interface FollowUpQuestion {
  id: string;
  text: string;
  /** Answer type shown in the survey. */
  kind: "yes_no" | "number" | "text";
}

export const QUESTION_BANK: FollowUpQuestion[] = [
  { id: "cough_change", text: "Onko yskän luonne muuttunut viime viikkoina?", kind: "yes_no" },
  { id: "hemoptysis_count", text: "Kuinka monta kertaa olet huomannut verta yskösissä?", kind: "number" },
  { id: "weight_amount", text: "Kuinka monta kiloa olet laihtunut puolen vuoden aikana?", kind: "number" },
  { id: "breath_worse", text: "Onko hengenahdistus pahentunut viimeisen kuukauden aikana?", kind: "yes_no" },
  { id: "chest_pain_breathing", text: "Pahentuuko rintakipu hengittäessä tai yskiessä?", kind: "yes_no" },
  { id: "hoarseness", text: "Onko äänesi ollut käheä yli kolme viikkoa?", kind: "yes_no" },
  { id: "fatigue", text: "Onko sinulla ollut poikkeuksellista väsymystä viime viikkoina?", kind: "yes_no" },
  { id: "asbestos", text: "Oletko työssäsi altistunut asbestille tai muulle pölylle?", kind: "yes_no" },
  { id: "previous_ct", text: "Onko keuhkoistasi otettu TT-kuva viimeisen kahden vuoden aikana?", kind: "yes_no" },
];

const BANK_IDS = QUESTION_BANK.map((q) => q.id);

export interface SurveyAnalysis {
  urgency: string;
  risk: string;
  questions: FollowUpQuestion[];
  generatedBy: "llm" | "template";
}

/** Deterministic choice of up to three follow-up questions, used without an API key. */
export function ruleQuestions(r: SurveyResponse): FollowUpQuestion[] {
  const s = r.symptoms;
  const ids: string[] = [];
  if (s.blood_in_sputum) ids.push("hemoptysis_count");
  if (s.weight_loss) ids.push("weight_amount");
  if (s.cough_weeks > 0) ids.push("cough_change");
  if (s.breathlessness) ids.push("breath_worse");
  if (s.chest_pain) ids.push("chest_pain_breathing");
  if (s.cough_weeks > 0 || s.breathlessness) ids.push("hoarseness");
  ids.push("fatigue", "asbestos");
  return ids.slice(0, 3).map((id) => QUESTION_BANK.find((q) => q.id === id)!);
}

function templateAnalysis(r: SurveyResponse, rule: RuleResult, priority: RiskPriority): SurveyAnalysis {
  const signs = rule.reasons.map((x) => x.label.toLowerCase());
  const top = priority.contributions.filter((c) => c.logit > 0).slice(0, 3).map((c) => c.label.toLowerCase());
  return {
    urgency: `${PLACEMENT_LABEL[rule.placement]}. ${signs.length ? `Hälytysmerkit: ${signs.join(", ")}.` : "Ei hälytysmerkkejä."}`,
    risk:
      priority.level === "not_applicable"
        ? "PLCOm2012-malli koskee vain tupakoineita, joten pitkän aikavälin riskiä ei arvioida."
        : `PLCOm2012: kuuden vuoden keuhkosyöpäriski ${formatRisk(priority.score)}, ${PRIORITY_LEVEL_LABEL[priority.level].toLowerCase()}.${
            priority.aboveThreshold ? " Ylittää mallin julkaisussa käytetyn 1,35 %:n kynnyksen." : ""
          }${top.length ? ` Riskiä nostavat eniten: ${top.join(", ")}.` : ""}`,
    questions: ruleQuestions(r),
    generatedBy: "template",
  };
}

const SYSTEM = `Olet avustaja keuhkosyövän riskiryhmän oirekyselyssä. Arvioit kaksi asiaa erikseen:
1. Kiireellisyys: säännöt ovat jo päättäneet sen. Toista sääntöjen ehdotus. Saat lisätä huolen, jos vapaa teksti mainitsee hälyttävän oireen, mutta et koskaan saa vähentää kiireellisyyttä tai sanoa, että jokin hälytysmerkki on merkityksetön.
2. Pitkän aikavälin riski: kuvaa annettu PLCOm2012-mallin kuuden vuoden riski ja sen suurimmat tekijät. Käytä annettua lukua sellaisenaan, älä laske omaa arviota äläkä diagnosoi.
Valitse 1–3 jatkokysymystä annetusta kysymyspankista, jotka tarkentaisivat juuri tämän vastaajan tilannetta eniten. Käytä vain pankin tunnisteita.
Kirjoita suomeksi, kumpikin arvio enintään kaksi lyhyttä virkettä.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["urgency_note", "risk_note", "question_ids"],
  properties: {
    urgency_note: { type: "string" },
    risk_note: { type: "string" },
    question_ids: { type: "array", items: { type: "string", enum: BANK_IDS } },
  },
};

export async function analyzeSurvey(r: SurveyResponse, rule: RuleResult, priority: RiskPriority): Promise<SurveyAnalysis> {
  const fallback = templateAnalysis(r, rule, priority);
  const facts = {
    ikä: r.age,
    tupakointi: r.smoking,
    oireet: r.symptoms,
    aiemmat_käynnit: r.previous_visits,
    vapaa_teksti: r.free_text ?? null,
    sääntöjen_kiireellisyys: PLACEMENT_LABEL[rule.placement],
    hälytysmerkit: rule.reasons.map((x) => `${x.label}: ${x.answer}`),
    plcom2012_kuuden_vuoden_riski: {
      prosentti: formatRisk(priority.score),
      taso: PRIORITY_LEVEL_LABEL[priority.level],
      ylittää_kynnyksen_1_35_prosenttia: priority.aboveThreshold,
      riskiä_nostavat: priority.contributions.filter((c) => c.logit > 0).map((c) => `${c.label} (×${c.factor})`),
      riskiä_laskevat: priority.contributions.filter((c) => c.logit < 0).map((c) => `${c.label} (×${c.factor})`),
    },
    kysymyspankki: QUESTION_BANK.map((q) => ({ id: q.id, kysymys: q.text })),
  };
  const out = await completeJson<{ urgency_note: string; risk_note: string; question_ids: string[] }>(
    SYSTEM,
    `Kyselyvastaus (synteettinen):\n${JSON.stringify(facts, null, 2)}`,
    SCHEMA,
  );
  if (!out) return fallback;
  const questions = [...new Set(out.question_ids)]
    .map((id) => QUESTION_BANK.find((q) => q.id === id))
    .filter((q): q is FollowUpQuestion => Boolean(q))
    .slice(0, 3);
  return {
    // The rules' placement always leads the urgency text, whatever the model wrote.
    urgency: `${PLACEMENT_LABEL[rule.placement]}. ${out.urgency_note.trim()}`.slice(0, 500),
    risk: out.risk_note.trim().slice(0, 400) || fallback.risk,
    questions: questions.length ? questions : fallback.questions,
    generatedBy: "llm",
  };
}
