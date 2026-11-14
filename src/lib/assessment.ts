// AI assessment of one answer for the physician, in the style of Patrik's demo
// (summary, reasons with quoted answers, uncertainties, suggested level).
//
// Delun's model decides. The rule level comes from his NICE NG12 booking tiers
// (booking.ts) and alarm rules (rules.ts), used unchanged. The model only writes the
// summary and may SUGGEST a level. A suggestion never changes the placement, the
// booking or the list order: a higher suggestion is shown for the physician to weigh,
// and a lower one is overruled by the rules. Without an API key the code writes the
// summary and the suggestion equals the rule level.

import type { Assessment, PriorityLevel } from "./assessment-labels";
import { bookingTier } from "./booking";
import { completeJson } from "./llm";
import { formatRisk, PRIORITY_LEVEL_LABEL, type RiskPriority } from "./priority";
import { PLACEMENT_LABEL } from "./rules";
import type { RuleResult, SurveyResponse } from "./types";

export type { Assessment, PriorityLevel } from "./assessment-labels";

const RANK: Record<PriorityLevel, number> = { A: 0, B: 1, C: 2 };

/** The level from Delun's booking tiers. C when he would not book automatically. */
export function ruleLevel(r: SurveyResponse, rule: RuleResult, priority: RiskPriority): { level: PriorityLevel; reason: string } {
  const tier = bookingTier({ response: r, rule, priority, decision: null });
  if (tier) return { level: tier.tier, reason: tier.reason };
  return {
    level: "C",
    reason: rule.symptomReviewRequired ? "Oireita, mutta NICE NG12 -luokan A tai B ehdot eivät täyty" : PLACEMENT_LABEL[rule.placement],
  };
}

function smokingText(r: SurveyResponse): string {
  if (r.smoking.status === "never") return "ei ole tupakoinut";
  return `${r.smoking.status === "current" ? "tupakoi" : "entinen tupakoija"}, ${r.smoking.pack_years} askivuotta`;
}

function template(r: SurveyResponse, rule: RuleResult, level: { level: PriorityLevel; reason: string }): Assessment {
  const signs = rule.reasons.map((x) => `${x.label.toLowerCase()} (${x.answer})`);
  return {
    ruleLevel: level.level,
    ruleReason: level.reason,
    suggestedLevel: level.level,
    comparison: "same",
    summary: `${r.age} v, ${smokingText(r)}. ${signs.length ? `Hälytysmerkit: ${signs.join(", ")}.` : "Ei hälytysmerkkejä."}`,
    reasons: rule.reasons.map((x) => `${x.label}: ${x.answer}`),
    evidence: [],
    uncertainties: [],
    generatedBy: "template",
  };
}

const SYSTEM = `Olet avustaja, joka tiivistää keuhkosyövän oirekyselyn synteettisen vastauksen suomalaiselle terveyskeskuslääkärille.
Tasot:
- A: hälytysmerkki, lääkäriaika 3 arkipäivässä
- B: kiireellinen, lääkäriaika 2 viikossa
- C: ei automaattista aikaa, lääkäri päättää
Säännöt:
- Käytä vain annettuja tietoja. Älä diagnosoi äläkä arvioi syövän todennäköisyyttä.
- Sääntöjen taso on jo päätetty. Ehdota omaa tasoa vain annettujen vastausten perusteella ja perustele se.
- Ehdota korkeampaa tasoa vain, jos vapaa teksti tai jatkokysymysten vastaukset sisältävät hälyttävää tietoa, jota säännöt eivät kata.
- Älä koskaan väitä, että jokin hälytysmerkki puuttuu tai on merkityksetön.
- "evidence"-kohtiin lainaa vastaajan omia vastauksia sellaisinaan.
- "uncertainties"-kohtiin kirjaa puuttuvat tai ristiriitaiset tiedot.
- Kirjoita suomeksi. Yhteenveto enintään kolme lyhyttä virkettä, listoissa enintään kolme kohtaa.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "suggested_level", "reasons", "evidence", "uncertainties"],
  properties: {
    summary: { type: "string" },
    suggested_level: { type: "string", enum: ["A", "B", "C"] },
    reasons: { type: "array", items: { type: "string" } },
    evidence: { type: "array", items: { type: "string" } },
    uncertainties: { type: "array", items: { type: "string" } },
  },
};

const list = (x: unknown) =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim().slice(0, 200)).slice(0, 3) : [];

export async function assessCase(
  r: SurveyResponse,
  rule: RuleResult,
  priority: RiskPriority,
  followups: Record<string, string> = {},
): Promise<Assessment> {
  const level = ruleLevel(r, rule, priority);
  const fallback = template(r, rule, level);
  const facts = {
    ikä: r.age,
    tupakointi: smokingText(r),
    oireet: r.symptoms,
    aiemmat_käynnit: r.previous_visits,
    vapaa_teksti: r.free_text ?? null,
    jatkokysymysten_vastaukset: followups,
    sääntöjen_löydökset: rule.reasons.map((x) => `${x.label}: ${x.answer}`),
    oirearvio_tarvitaan: rule.symptomReviewRequired,
    sääntöjen_taso: `${level.level}: ${level.reason}`,
    plcom2012_kuuden_vuoden_riski:
      priority.level === "not_applicable" ? "ei sovellu" : `${formatRisk(priority.score)} (${PRIORITY_LEVEL_LABEL[priority.level]})`,
  };
  const out = await completeJson<{ summary: string; suggested_level: string; reasons: unknown; evidence: unknown; uncertainties: unknown }>(
    SYSTEM,
    `Kyselyvastaus (synteettinen):\n${JSON.stringify(facts, null, 2)}`,
    SCHEMA,
  );
  const suggested = out?.suggested_level;
  if (!out || (suggested !== "A" && suggested !== "B" && suggested !== "C") || typeof out.summary !== "string" || !out.summary.trim()) {
    return fallback;
  }
  const comparison = RANK[suggested] === RANK[level.level] ? "same" : RANK[suggested] < RANK[level.level] ? "higher" : "lower";
  return {
    ruleLevel: level.level,
    ruleReason: level.reason,
    suggestedLevel: suggested,
    comparison,
    summary: out.summary.trim().slice(0, 600),
    reasons: list(out.reasons),
    evidence: list(out.evidence),
    uncertainties: list(out.uncertainties),
    generatedBy: "llm",
  };
}
