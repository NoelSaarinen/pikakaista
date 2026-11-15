// Case summary for the physician. The rules decide the placement; AI only writes
// the summary and may add a note from the free-text answer. It never removes a flag.

import { QUESTION_BANK } from "./analysis";
import { symptomsFi, visitsFi } from "./answers-fi";
import { complete } from "./llm";
import { PLACEMENT_LABEL } from "./rules";
import type { CaseSummary, RuleResult, SurveyResponse } from "./types";

const SYSTEM = `Olet avustaja, joka tiivistää keuhkosyövän riskiryhmän oirekyselyn vastauksen terveyskeskuslääkärille.
Säännöt:
- Kirjoita suomeksi 1–3 lyhyttä virkettä. Käytä vain annettuja tietoja.
- Älä diagnosoi, älä arvioi syövän todennäköisyyttä äläkä muuta ehdotettua jatkoa. Lääkäri päättää.
- Jos oirearvio_tarvitaan on true, sano selvästi, että oireet pitää arvioida ammattilaisen kanssa riippumatta seulontakyselyn riskirajasta.
- Jos vapaassa tekstissä (millä kielellä tahansa) mainitaan oire, jota rakenteiset vastaukset eivät kata, lisää loppuun rivi "Huom: " ja lainaus suomennettuna.
- Älä koskaan väitä, että jokin hälytysmerkki puuttuu tai on merkityksetön.`;

function smokingText(r: SurveyResponse): string {
  if (r.smoking.status === "never") return "ei ole tupakoinut";
  const status = r.smoking.status === "current" ? "tupakoi" : "entinen tupakoija";
  return `${status} (${r.smoking.pack_years} askivuotta)`;
}

export function templateSummary(r: SurveyResponse, rule: RuleResult): string {
  const signs = rule.reasons.map((x) => `${x.label.toLowerCase()} (${x.answer})`);
  const head = `${r.age} v, ${smokingText(r)}.`;
  const body = signs.length ? ` Hälytysmerkit: ${signs.join(", ")}.` : " Ei hälytysmerkkejä.";
  return head + body;
}

function followupText(followups: Record<string, string>): string {
  return Object.entries(followups)
    .map(([id, answer]) => `${QUESTION_BANK.find((q) => q.id === id)?.text ?? id} ${answer}`)
    .join(" ");
}

export async function summarizeCase(r: SurveyResponse, rule: RuleResult, followups: Record<string, string> = {}): Promise<CaseSummary> {
  const hasFollowups = Object.keys(followups).length > 0;
  const facts = {
    jatkokysymysten_vastaukset: hasFollowups ? followupText(followups) : null,
    ikä: r.age,
    tupakointi: smokingText(r),
    oireet: symptomsFi(r),
    aiemmat_käynnit: visitsFi(r),
    vapaa_teksti: r.free_text ?? null,
    vastauksen_kieli: r.language,
    sääntöjen_löydökset: rule.reasons.map((x) => `${x.label}: ${x.answer}`),
    ehdotettu_jatko: PLACEMENT_LABEL[rule.placement],
    oirearvio_tarvitaan: rule.symptomReviewRequired,
  };
  const llmText = await complete(SYSTEM, `Kyselyvastaus (synteettinen):\n${JSON.stringify(facts, null, 2)}`);
  return {
    id: r.id,
    rule_score: rule.score,
    proposed_placement: rule.placement,
    summary: llmText ?? templateSummary(r, rule) + (hasFollowups ? ` Jatkokysymykset: ${followupText(followups)}` : ""),
    reasons: rule.reasons.map((x) => `${x.label}: ${x.answer}`),
    generated_by: llmText ? "llm" : "template",
    physician_decision: null,
  };
}
