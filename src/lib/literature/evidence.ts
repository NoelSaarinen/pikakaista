// Evidence weighting for lung cancer articles. Code computes every weight; AI (or the
// keyword fallback) only classifies what the abstract says.
//
// TEAM ASSUMPTIONS, NOT A VALIDATED METHOD. The weights loosely follow the usual
// evidence hierarchy (systematic review and RCT above cohort above case-control above
// modelling and narrative review). They need medical review before any real use.

import type { RawArticle } from "./pubmed";

/** Risk factors the survey asks about, so evidence can map to survey answers. */
export const RISK_FACTORS = [
  "smoking",
  "age",
  "persistent_cough",
  "hemoptysis",
  "weight_loss",
  "breathlessness",
  "chest_pain",
  "recurrent_pneumonia",
  "repeat_consultation",
] as const;
export type RiskFactor = (typeof RISK_FACTORS)[number];

export const FACTOR_LABEL: Record<RiskFactor, string> = {
  smoking: "Tupakointi (askivuodet)",
  age: "Ikä",
  persistent_cough: "Pitkittynyt yskä",
  hemoptysis: "Verta yskösissä",
  weight_loss: "Laihtuminen",
  breathlessness: "Hengenahdistus",
  chest_pain: "Rintakipu",
  recurrent_pneumonia: "Toistuvat keuhkokuumeet",
  repeat_consultation: "Toistuvat käynnit samasta oireesta",
};

export const DESIGNS = [
  "meta_analysis",
  "rct",
  "prospective_cohort",
  "retrospective",
  "cross_sectional",
  "nonrandomized_trial",
  "modelling",
  "narrative_review",
  "other",
  "excluded",
] as const;
export type Design = (typeof DESIGNS)[number];

/** Strength of each study design (team assumption, evidence hierarchy). */
export const DESIGN_WEIGHT: Record<Design, number> = {
  meta_analysis: 1,
  rct: 0.9,
  prospective_cohort: 0.75,
  retrospective: 0.55,
  cross_sectional: 0.5,
  nonrandomized_trial: 0.5,
  modelling: 0.35,
  narrative_review: 0.25,
  other: 0.4,
  excluded: 0,
};

export const DESIGN_LABEL: Record<Design, string> = {
  meta_analysis: "Meta-analyysi tai systemaattinen katsaus",
  rct: "Satunnaistettu kontrolloitu tutkimus",
  prospective_cohort: "Prospektiivinen kohortti tai seulontatutkimuksen aineisto",
  retrospective: "Retrospektiivinen tai tapaus-verrokki",
  cross_sectional: "Poikkileikkaus tai diagnostinen tarkkuus",
  nonrandomized_trial: "Satunnaistamaton kliininen tutkimus",
  modelling: "Mallinnus tai kustannusvaikuttavuus",
  narrative_review: "Kirjallisuuskatsaus",
  other: "Muu tutkimus",
  excluded: "Ei tutkimusnäyttöä (pääkirjoitus, kommentti, kirje)",
};

export const TOPICS = ["symptoms", "risk_factors", "early_detection", "screening", "treatment", "other"] as const;
export type Topic = (typeof TOPICS)[number];

/** How much an article's topic bears on who should be assessed first (team assumption). */
export const TOPIC_RELEVANCE: Record<Topic, number> = {
  symptoms: 1,
  risk_factors: 1,
  early_detection: 0.9,
  screening: 0.7,
  other: 0.1,
  treatment: 0,
};

export const TOPIC_LABEL: Record<Topic, string> = {
  symptoms: "Oireet",
  risk_factors: "Riskitekijät",
  early_detection: "Varhainen toteaminen",
  screening: "Seulonta",
  treatment: "Hoito (ei vaikuta priorisointiin)",
  other: "Muu",
};

export type Direction = 1 | 0 | -1;

export interface FactorFinding {
  factor: RiskFactor;
  /** 1: the factor should raise a person's priority, -1: lower it, 0: no clear effect. */
  direction: Direction;
  /** Effect estimate quoted from the abstract, e.g. "HR 1.8 (95% CI 1.2–2.6)". Empty when none. */
  effect: string;
}

export interface Evidence {
  pmid: string;
  doi: string | null;
  title: string;
  journal: string;
  year: number;
  month: number;
  url: string;
  design: Design;
  sampleSize: number | null;
  topic: Topic;
  factors: FactorFinding[];
  /** One-sentence finding in Finnish (AI) or the abstract's conclusion (fallback). */
  finding: string;
  /** Named trial or cohort, so several papers from the same data count once. */
  dataset: string | null;
  weight: number;
  weightParts: { design: number; size: number; recency: number; relevance: number };
  extractedBy: "llm" | "keyword";
  fetchedAt: string;
}

// --- Design, size, recency, dataset ---------------------------------------------

const EXCLUDED_TYPES = ["Editorial", "Comment", "Letter", "News", "Published Erratum", "Retraction of Publication", "Case Reports", "Biography", "Interview", "Congress"];

export function designFromPublicationTypes(types: string[]): Design | null {
  if (types.some((t) => EXCLUDED_TYPES.includes(t))) return "excluded";
  if (types.includes("Meta-Analysis") || types.includes("Systematic Review")) return "meta_analysis";
  if (types.includes("Randomized Controlled Trial")) return "rct";
  return null;
}

export function designFromText(a: Pick<RawArticle, "title" | "abstract" | "publicationTypes">): Design {
  const fromTypes = designFromPublicationTypes(a.publicationTypes);
  if (fromTypes) return fromTypes;
  const t = `${a.title} ${a.abstract}`.toLowerCase();
  if (/meta-analys|systematic review/.test(t)) return "meta_analysis";
  if (/\brandomi[sz]ed (controlled )?trial\b|\brandomly assigned\b/.test(t) && !/post[- ]hoc|secondary analysis/.test(t)) return "rct";
  if (/microsimulation|simulation model|modell?ing study|cost-effectiveness|decision[- ]analytic/.test(t)) return "modelling";
  if (/prospective|cohort study|screening trial|post[- ]hoc|secondary analysis|\bnlst\b|\bnelson\b|biobank/.test(t)) return "prospective_cohort";
  if (/retrospective|case[- ]control|registry|register-based|population-based/.test(t)) return "retrospective";
  if (/cross-sectional|diagnostic accuracy|sensitivity and specificity|\bauc\b/.test(t)) return "cross_sectional";
  if (a.publicationTypes.includes("Clinical Trial") || /phase (1|2|i|ii)\b|single-arm/.test(t)) return "nonrandomized_trial";
  if (a.publicationTypes.includes("Review")) return "narrative_review";
  return "other";
}

const SIZE_RE = /(\d{1,3}(?:[ ,]\d{3})+|\d{2,9})\s+(?:[a-z-]+\s+){0,2}(?:participants|patients|individuals|people|adults|smokers|ever-smokers|subjects|persons|women|men|screenees|cases)\b/gi;

/** Largest participant count stated in the abstract, or null. */
export function sampleSizeFromText(abstract: string): number | null {
  let max = 0;
  for (const m of abstract.matchAll(SIZE_RE)) {
    const n = Number(m[1].replace(/[ ,]/g, ""));
    if (n > max && n < 50_000_000) max = n;
  }
  return max > 0 ? max : null;
}

/** True when a number appears in the abstract, so an AI-reported sample size can be checked. */
export function numberAppearsIn(n: number, abstract: string): boolean {
  const plain = abstract.replace(/(\d)[ ,](?=\d{3}\b)/g, "$1");
  return new RegExp(`\\b${n}\\b`).test(plain);
}

/** Size factor 0.3–1: 100 → 0.4, 1,000 → 0.6, 100,000 → 1. Unknown → 0.6. */
export function sizeWeight(n: number | null): number {
  if (!n) return 0.6;
  return Math.min(1, Math.max(0.3, Math.log10(n) / 5));
}

/** Newer evidence counts more: within 12 months 1, within 24 months 0.85, older 0.7. */
export function recencyWeight(year: number, month: number, now: Date): number {
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  if (months <= 12) return 1;
  if (months <= 24) return 0.85;
  return 0.7;
}

const DATASETS: [RegExp, string][] = [
  [/\bNLST\b|National Lung Screening Trial/i, "NLST"],
  [/\bNELSON\b/, "NELSON"],
  [/\bUKLS\b|UK Lung Cancer Screening Trial/i, "UKLS"],
  [/\bTLHC\b|Targeted Lung Health Check/i, "TLHC"],
  [/\bSUMMIT\b/, "SUMMIT"],
  [/\bPLCO\b/, "PLCO"],
  [/UK Biobank/i, "UK Biobank"],
  [/\bMILD\b trial/i, "MILD"],
  [/\bDLCST\b/, "DLCST"],
  [/\bLUSI\b/, "LUSI"],
  [/Yorkshire Lung Screening|\bYLST\b/i, "YLST"],
  [/4-IN-THE-LUNG-RUN/i, "4-IN-THE-LUNG-RUN"],
];

export function datasetFromText(text: string): string | null {
  for (const [re, name] of DATASETS) if (re.test(text)) return name;
  return null;
}

// --- Keyword fallback for topic and factors ---------------------------------------

const FACTOR_KEYWORDS: Record<RiskFactor, RegExp> = {
  smoking: /pack-?years?|smok|tobacco|cigarette/i,
  age: /\bolder (adults|age)|\bage (group|threshold|criteria|eligibility)|aged \d{2}/i,
  persistent_cough: /\bcough/i,
  hemoptysis: /ha?emoptysis|blood in (the )?sputum/i,
  weight_loss: /weight loss|cachexia/i,
  breathlessness: /dyspn|breathless|shortness of breath/i,
  chest_pain: /chest pain/i,
  recurrent_pneumonia: /pneumonia|respiratory (tract )?infection/i,
  repeat_consultation: /repeat(ed)? (consultation|visit)|consultations? before|diagnostic interval|missed (diagnos|opportunit)|emergency presentation/i,
};

const TREATMENT_RE =
  /adjuvant|perioperative|chemotherapy|chemoradi|immunotherapy|targeted therap|radiotherapy|radiation|stereotactic|\bsbrt\b|\bsabr\b|segmentectomy|lobectomy|resection|surgery|surgical|progression-free|overall survival|recurrence|minimal residual|\bmrd\b|osimertinib|pembrolizumab|nivolumab|durvalumab|atezolizumab|ivonescimab|tyrosine kinase|\btki\b|metastatic|advanced nsclc|pneumonitis/;
const BIOLOGY_RE = /genomic|germline|mutation|\bkras\b|\begfr\b|\btp53\b|\bmtap\b|signaling|pathway activation|carcinogenesis|in mice|murine|cell line|organoid/;

/**
 * Keyword fallback topic. Treatment and biology are checked first, because nearly
 * every lung cancer abstract mentions risk somewhere. Screening must be lung screening.
 */
export function topicFromText(title: string, abstract: string): Topic {
  const t = `${title} ${abstract}`.toLowerCase();
  const head = title.toLowerCase();
  const lungScreening = /lung cancer screening|lung screening|low-dose (ct|computed tomography)|\bldct\b|lung health check/;
  // Drug names in the title (…tinib, …mab, …ciclib, …lisib) mean a treatment paper.
  if (TREATMENT_RE.test(head) || /\b\w+(tinib|mab|ciclib|lisib)\b/.test(head)) return "treatment";
  if (TREATMENT_RE.test(t) && !lungScreening.test(t) && !/symptom/.test(t)) return "treatment";
  if (BIOLOGY_RE.test(head)) return "other";
  // A title about another cancer is not lung cancer evidence, even if lung is mentioned.
  if (/esophageal|oesophageal|breast|colorectal|prostate|gastric|pancrea|cervical|liver cancer/.test(head) && !/lung/.test(head)) return "other";
  if (/symptom|cough|ha?emoptysis|dyspn|presenting feature/.test(t)) return "symptoms";
  if (/risk (prediction|model|score|stratif)|risk factors? for lung|risk of (developing )?lung cancer|lung cancer (risk|incidence)|eligib/.test(t)) return "risk_factors";
  if (lungScreening.test(t)) return "screening";
  if (/early (diagnosis|detection)|stage shift|primary care|general practi|diagnostic (pathway|interval)|time to diagnosis/.test(t)) return "early_detection";
  return "other";
}

/** Conclusion section of a structured abstract, else its last sentence. */
export function conclusionOf(abstract: string): string {
  const m = abstract.match(/(?:CONCLUSIONS?|INTERPRETATION|DISCUSSION)[^:]*:\s*(.+)$/);
  if (m) return m[1].trim();
  const sentences = abstract.split(/(?<=\.)\s+/);
  return sentences[sentences.length - 1] ?? "";
}

export function factorsFromText(a: Pick<RawArticle, "title" | "abstract">, topic: Topic): FactorFinding[] {
  if (TOPIC_RELEVANCE[topic] === 0) return [];
  // Only the results and conclusions count, so a factor named in the background does not.
  const findings = a.abstract.match(/(?:RESULTS?|FINDINGS|CONCLUSIONS?|INTERPRETATION)[^:]*:([\s\S]*)$/)?.[1] ?? a.abstract;
  const sentences = `${a.title}. ${findings}`.split(/(?<=[.;])\s+/);
  const out: FactorFinding[] = [];
  for (const factor of RISK_FACTORS) {
    // A factor counts only in a sentence that ties it to lung cancer risk or diagnosis.
    const hits = sentences.filter(
      (s) =>
        FACTOR_KEYWORDS[factor].test(s) &&
        ASSOCIATION_RE.test(s) &&
        // Quitting trials are about an intervention, not about who is at risk.
        !(factor === "smoking" && /cessation|quit|cytisine|varenicline/i.test(s) && !/mortality|incidence|risk of lung/i.test(s)),
    );
    // Prefer a sentence that quotes an effect estimate.
    const hit = hits.find((s) => EFFECT_RE.test(s)) ?? hits[0];
    if (hit) out.push({ factor, direction: 1, effect: hit.match(EFFECT_RE)?.[0]?.trim() ?? "" });
  }
  return out;
}

const ASSOCIATION_RE = /associat|predict|risk|odds|hazard|incidence|higher|increas|mortality|diagnos/i;
const EFFECT_RE = /\b(?:a?OR|a?HR|RR|IRR)\b[^;.)]*?\d+(?:\.\d+)?[^;.)]*?(?:CI[^;.)]*\d)?/;

// --- Weight and aggregation -------------------------------------------------------

export function computeWeight(design: Design, sampleSize: number | null, year: number, month: number, topic: Topic, now: Date) {
  const parts = {
    design: DESIGN_WEIGHT[design],
    size: sizeWeight(sampleSize),
    recency: recencyWeight(year, month, now),
    relevance: TOPIC_RELEVANCE[topic],
  };
  const weight = Math.round(parts.design * parts.size * parts.recency * parts.relevance * 100) / 100;
  return { weight, parts };
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Keeps only articles not seen before, by PMID, DOI or title. Duplicates within `incoming` are dropped too. */
export function onlyNew<T extends Pick<RawArticle, "pmid" | "doi" | "title">>(existing: Pick<Evidence, "pmid" | "doi" | "title">[], incoming: T[]): T[] {
  const pmids = new Set(existing.map((e) => e.pmid));
  const dois = new Set(existing.map((e) => e.doi).filter(Boolean) as string[]);
  const titles = new Set(existing.map((e) => normalizeTitle(e.title)));
  const fresh: T[] = [];
  for (const a of incoming) {
    const t = normalizeTitle(a.title);
    if (pmids.has(a.pmid) || (a.doi && dois.has(a.doi)) || titles.has(t)) continue;
    pmids.add(a.pmid);
    if (a.doi) dois.add(a.doi);
    titles.add(t);
    fresh.push(a);
  }
  return fresh;
}

export interface FactorEvidence {
  factor: RiskFactor;
  /** Signed evidence sum after counting each dataset once. Information only. */
  support: number;
  pmids: string[];
}

/**
 * Summarises the evidence per risk factor, for information only: the risk score is
 * the validated PLCOm2012 model and literature never changes it. Several articles
 * from the same trial or cohort count once, with the strongest one kept.
 */
export function summarizeFactorEvidence(evidence: Evidence[]): FactorEvidence[] {
  return RISK_FACTORS.map((factor) => {
    const best = new Map<string, { value: number; pmid: string }>();
    for (const e of evidence) {
      if (e.weight <= 0) continue;
      const f = e.factors.find((x) => x.factor === factor);
      if (!f || f.direction === 0) continue;
      const key = e.dataset ?? `pmid:${e.pmid}`;
      const value = f.direction * e.weight;
      const prev = best.get(key);
      if (!prev || Math.abs(value) > Math.abs(prev.value)) best.set(key, { value, pmid: e.pmid });
    }
    const support = Math.round([...best.values()].reduce((s, x) => s + x.value, 0) * 100) / 100;
    return { factor, support, pmids: [...best.values()].map((x) => x.pmid) };
  });
}

/** Builds evidence from a raw article with the keyword fallback. */
export function keywordEvidence(a: RawArticle, now: Date): Evidence {
  const topic = topicFromText(a.title, a.abstract);
  const design = designFromText(a);
  const sampleSize = sampleSizeFromText(a.abstract);
  const { weight, parts } = computeWeight(design, sampleSize, a.year, a.month, topic, now);
  return {
    pmid: a.pmid,
    doi: a.doi,
    title: a.title,
    journal: a.journal,
    year: a.year,
    month: a.month,
    url: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
    design,
    sampleSize,
    topic,
    factors: factorsFromText(a, topic),
    finding: conclusionOf(a.abstract).slice(0, 400),
    dataset: datasetFromText(`${a.title} ${a.abstract}`),
    weight,
    weightParts: parts,
    extractedBy: "keyword",
    fetchedAt: now.toISOString(),
  };
}
