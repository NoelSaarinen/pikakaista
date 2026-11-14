// AI classification of one abstract. Claude only reads and classifies; code computes the
// weight and checks what it can (a reported sample size must appear in the abstract).
// Without an API key, or if the answer fails validation, the keyword fallback is used.

import { completeJson } from "../llm";
import {
  computeWeight,
  conclusionOf,
  datasetFromText,
  designFromPublicationTypes,
  DESIGNS,
  keywordEvidence,
  numberAppearsIn,
  RISK_FACTORS,
  TOPICS,
  type Design,
  type Direction,
  type Evidence,
  type FactorFinding,
  type RiskFactor,
  type Topic,
} from "./evidence";
import type { RawArticle } from "./pubmed";

const SYSTEM = `You classify one lung cancer research abstract for a primary-care triage demo.
Rules:
- Use only what the abstract states. Never guess numbers. If the abstract gives no participant count, sample_size is null.
- topic: "symptoms" (symptoms or presenting features), "risk_factors" (who is at higher risk), "early_detection" (earlier diagnosis, pathways, primary care), "screening" (LDCT screening programmes), "treatment" (therapy or prognosis after diagnosis), "other".
- design: the study design of THIS paper. A secondary or post-hoc analysis of a trial is "prospective_cohort", not "rct".
- factors: list a factor only when the results or conclusions report evidence that it predicts lung cancer, or a late or missed diagnosis. direction "raises" means having the factor should make a person a higher priority for early assessment, "lowers" the opposite, "neutral" no clear association. Quote any effect estimate exactly (e.g. "OR 2.1, 95% CI 1.4-3.2"), else "".
- Treatment papers get an empty factors list.
- finding_fi: one plain Finnish sentence (max 30 words) on what the paper found that matters for finding lung cancer earlier. For treatment papers, say briefly what was treated.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topic", "design", "sample_size", "factors", "finding_fi"],
  properties: {
    topic: { type: "string", enum: [...TOPICS] },
    design: { type: "string", enum: DESIGNS.filter((d) => d !== "excluded") },
    sample_size: { anyOf: [{ type: "integer" }, { type: "null" }] },
    factors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["factor", "direction", "effect_estimate"],
        properties: {
          factor: { type: "string", enum: [...RISK_FACTORS] },
          direction: { type: "string", enum: ["raises", "lowers", "neutral"] },
          effect_estimate: { type: "string" },
        },
      },
    },
    finding_fi: { type: "string" },
  },
};

interface LlmClassification {
  topic: string;
  design: string;
  sample_size: number | null;
  factors: { factor: string; direction: string; effect_estimate: string }[];
  finding_fi: string;
}

const DIRECTION: Record<string, Direction> = { raises: 1, lowers: -1, neutral: 0 };

export async function extractEvidence(a: RawArticle, now: Date): Promise<Evidence> {
  const fallback = keywordEvidence(a, now);
  // Editorials, letters and comments are not evidence; no need to spend an API call.
  if (fallback.design === "excluded") return fallback;

  const user = `Journal: ${a.journal} (${a.year})\nPublication types: ${a.publicationTypes.join(", ")}\nTitle: ${a.title}\nAbstract: ${a.abstract}`;
  const out = await completeJson<LlmClassification>(SYSTEM, user, SCHEMA);
  if (!out || !TOPICS.includes(out.topic as Topic) || !DESIGNS.includes(out.design as Design)) return fallback;

  const topic = out.topic as Topic;
  // Publication types from PubMed win over the model when they are definite.
  const design = designFromPublicationTypes(a.publicationTypes) ?? (out.design as Design);
  // A sample size the abstract does not contain is discarded.
  const sampleSize = out.sample_size && numberAppearsIn(out.sample_size, a.abstract) ? out.sample_size : fallback.sampleSize;
  const seen = new Set<RiskFactor>();
  const factors: FactorFinding[] = [];
  for (const f of out.factors) {
    if (!RISK_FACTORS.includes(f.factor as RiskFactor) || seen.has(f.factor as RiskFactor) || !(f.direction in DIRECTION)) continue;
    seen.add(f.factor as RiskFactor);
    factors.push({ factor: f.factor as RiskFactor, direction: DIRECTION[f.direction], effect: f.effect_estimate.slice(0, 120) });
  }
  const { weight, parts } = computeWeight(design, sampleSize, a.year, a.month, topic, now);

  return {
    ...fallback,
    design,
    sampleSize,
    topic,
    factors: topic === "treatment" ? [] : factors,
    finding: out.finding_fi.trim().slice(0, 400) || conclusionOf(a.abstract).slice(0, 400),
    dataset: datasetFromText(`${a.title} ${a.abstract}`),
    weight,
    weightParts: parts,
    extractedBy: "llm",
  };
}

/** Classifies several abstracts with limited parallelism to stay inside API rate limits. */
export async function extractAll(articles: RawArticle[], now: Date, concurrency = 4): Promise<Evidence[]> {
  const out: Evidence[] = new Array(articles.length);
  let next = 0;
  async function worker() {
    while (next < articles.length) {
      const i = next++;
      out[i] = await extractEvidence(articles[i], now);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, articles.length) }, worker));
  return out;
}
