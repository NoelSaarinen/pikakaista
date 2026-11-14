# Decision log

Add entries in chronological order. Link evidence, and link any later entry that supersedes a decision.

## 2026-11-13 — Start with a private workspace and shared docs

- **Decision** Keep `main` as the shared stable branch. Track event facts and team constraints in versioned Markdown. Start with empty code, CAD, firmware and asset directories.
- **Rationale** The team can begin comparing challenges and syncing verified information while project and technology selection are still open.
- **Evidence** [README](../README.md) and [working instructions](../AGENTS.md).

## 2026-11-13 — Proposed MVP: Kaksi ovea AI analyst with a lung cancer fast lane

- **Status** Superseded by [2026-11-14 — Risk-group symptom survey with an AI-prepared fast lane](#2026-11-14--risk-group-symptom-survey-with-an-ai-prepared-fast-lane).
- **Context and options considered** AstraZeneca *Equal Care Across Finland* versus Aalto *Beyond the Clinic* ([HAASTEVERTAILU.md](HAASTEVERTAILU.md)). Within AstraZeneca: Two Doors, Pilot Map, Symptom Clock, Distance Tax and Nordic Gap ([IDEAS.md](IDEAS.md)). Wider lung cancer screening was considered and rejected as the main recommendation. It is only being evaluated nationally, a county cannot start it now, and per the team's notes it belongs to Strategy Goal 2.
- **Rationale and trade-offs** The idea locates the gap at a pathway stage a county can change now (primary-care contact → imaging) and fits Roadmap action 2.5.2. The AI analyst meets the AI requirement while code computes all numbers. The design drops a nurse-only triage gate, because 40–60% of Finnish patients see a nurse first while other Nordic countries start with a physician (University of Helsinki, 7 Nov 2025). Trade-offs: route-to-diagnosis data is unverified, the two-times delay figure comes from a single unpublished study, and imaging capacity may be the real bottleneck. Fallback: Pilot Map.
- **Evidence and follow-up** [PROJECT.md](PROJECT.md) lists sources and open questions. Record Kaisa Kaitila's answer on imaging capacity, then confirm or supersede this entry.

## 2026-11-14 — Risk-group symptom survey with an AI-prepared fast lane

- **Status** Proposed (team concept, 2026-11-14 00:30). Supersedes the 2026-11-13 Kaksi ovea AI analyst proposal.
- **Context and options considered**
  - Passive fast lane only. It reaches only people who come in: in Denmark only 27.4% of lung cancer patients were fast-tracked from the GP.
  - Analysis-only tool. The team judged it not to be a real solution.
  - LDCT screening. It is a national decision still under evaluation.
  - AI voice calls. Trust and live-demo risk are too high.
  - Text-message survey to the risk group plus a fast lane (chosen).
- **Decision**
  - The county sends a yearly symptom survey to a lung cancer risk group, with a reminder and nurse calls for non-responders and people over 75.
  - Fixed rules score the answers.
  - AI summarizes each alarm case and proposes a placement with quoted reasons. A physician approves every placement.
  - Reserved physician and CT slots form the fast lane.
  - A deterministic benefit analysis and an AI brief serve decision-makers.
- **Rationale and trade-offs**
  - Targets late detection (the brief's first bottleneck) and the primary-care step.
  - Actionable for a county now, and fits Roadmap action 2.5.2.
  - AI makes county-scale outreach feasible without deciding anything.
  - Trade-offs: no direct evidence yet for a targeted symptom survey, the response rate is unknown, and CT load depends on the share of fast-lane patients with cancer.
- **Evidence and follow-up** [PROJECT.md](PROJECT.md#evidence-for-the-approach). Ask Kaisa Kaitila about credibility and alarm criteria. Find the positive rate in Nordic pathways.

## 2026-11-14 — Public county data, with daily smoking as a proxy for ever-smoking

- **Status** Proposed, for review by Patrik (data owner). Lives on branch `claude/county-data-7397e5`.
- **Context and options considered** All county figures were mock. Public sources were found for population aged 55–80 (StatFin 11re), lung cancer incidence (Cancer Registry app) and smoking (THL Sotkanet). No regional ever-smoker indicator exists in Sotkanet. Options for smoking: daily smokers aged 20+ (4404); a population-weighted mix of 20–64 (4405) and 65+ (4406); or keep the mock value.
- **Rationale and trade-offs** We chose 4404 because it is one published number for the whole age range, and flagged it with `is_estimate: true`. Trade-off: daily smokers exclude former smokers, so the survey risk group shrinks about five-fold against the 40% mock value. Lung cancer uses the 2020–2024 mean because single years swing widely in small counties.
- **Evidence and follow-up** [DATA_NOTES.md](DATA_NOTES.md). Decide whether to relabel the smoking field and slider, or find a national ever-smoker ratio. Confirm the screening pilot counties.

## 2026-11-14 — Show engagement and pathway stage for every person

- **Status** Proposed by Delun. Team review pending. Lives on branch `feature/patient-pathway`.
- **Context and options considered** The physician list showed only who needs a decision, not what happens after it. Equal care also depends on who drops out after answering. Finland has no national LDCT screening, so engagement here means engagement with the risk-group survey and the fast lane.
- **Rationale and trade-offs** A `/pathway` follow-up view and a pathway card in `/clinician` show each person's engagement level (engaged, needs support, at risk of dropping out) with its reasons, the current stage and the next action, so the nurse sees who to call. Follow-up data is synthetic and derived deterministically from each person's id. The shares in `PATHWAY_ASSUMPTIONS` are team assumptions, not measured values. Some fast-lane people get a synthetic earlier physician decision, so the demo starts with people at different stages. A decision made live in the demo moves the person to the first booked visit.
- **Evidence and follow-up** [src/lib/pathway.ts](../src/lib/pathway.ts). Ask mentors for real attendance or drop-out figures to replace the assumed shares.

## 2026-11-14 — AI survey analysis and literature-weighted risk priority

- **Status** Partly superseded by [PLCOm2012 as the risk score](#2026-11-14--plcom2012-as-the-risk-score). The AI survey analysis, the follow-up questions and the PubMed literature watch remain. The team point score and the evidence multipliers were removed.
- **Context and options considered** The team's survey concept separates urgency from long-term risk, keeps AI out of sole safety decisions and asks adaptive follow-up questions. Delun asked for an AI model that reads the newest lung cancer articles from The Lancet, NEJM, JAMA, BMJ, JCO, JTO and Nature Medicine and weights patients by them, by evidence strength, without reusing articles. Options for the article source: scraping each publisher (terms and layouts differ), paid search APIs (Exa, Context.dev) or PubMed E-utilities (free, indexes all seven journals with publication types and abstracts). We chose PubMed.
- **Decision**
  - Code weights each article: design (meta-analysis 1 … narrative review 0.25, editorials 0) × sample size (log scale) × recency × topic relevance (treatment papers 0).
  - Each article is used once (PMID, DOI or title), and papers from the same trial (e.g. NLST) count once per risk factor.
  - Claude classifies topic, design, sample size and risk factors with structured output. Code checks that a reported sample size appears in the abstract. Without an API key, keyword rules classify instead.
  - Evidence proposes a multiplier per risk factor (capped at ×0.7–×1.5). It applies to the risk priority only after a physician approves it on `/evidence`.
  - Risk priority (0–100) only orders people inside the same urgency. The alarm rules still decide the placement, so evidence can never move anyone off the fast lane.
  - AI picks adaptive follow-up questions only from a fixed question bank. The respondent sees only the questions, not the risk assessment.
- **Rationale and trade-offs** This puts evidence to work without letting an automated literature feed make safety decisions. Trade-offs: recent articles in these journals rarely study symptoms, so most of the weight now goes to smoking. The keyword fallback is cruder than Claude (it marked direction only as "raises"). The base points and weights are team assumptions and need medical review.
- **Evidence and follow-up** [src/lib/literature/](../src/lib/literature/), [src/lib/priority.ts](../src/lib/priority.ts), [src/lib/analysis.ts](../src/lib/analysis.ts). Add an API key and run `npm run literature:snapshot` to replace the keyword classification. Ask Delun's medical contacts and the mentors to review the base points and the question bank.

## 2026-11-14 — PLCOm2012 as the risk score

- **Status** Decided by Delun on 2026-11-14. Medical review pending. Lives on branch `feature/patient-pathway`. Supersedes the team point score and evidence multipliers from the entry above.
- **Context and options considered** The team point score was an unvalidated assumption. PLCOm2012 is a validated model that predicts 6-year lung cancer risk in ever-smokers and is widely used to select people for screening. Options for the literature evidence were to keep it as information only or to multiply the PLCOm2012 risk by it. Delun chose information only, because changing the model would mean it is no longer the validated PLCOm2012.
- **Decision**
  - The risk is PLCOm2012 with the published coefficients, unchanged. Source: Tammemägi MC et al., N Engl J Med 2013;368:728–736, Table 2. Coefficients were checked against the PMC author manuscript (PMC3929969) on 2026-11-14. The paper's published correction (vol 369, p. 394) was not checked.
  - The paper's threshold of 1.3455 % (selects as many people as the NLST criteria) is shown, along with its risk categories (< 1 %, 1–2 %, ≥ 2 %). The often-quoted 1.51 % is not in this paper, so we do not use it.
  - Race and ethnicity are not asked. Everyone gets the model's reference category, as Delun decided. Current smokers have quit time 0. Missing inputs are imputed with the model's centring values and listed in the UI.
  - The survey now asks the model inputs: quit time, COPD, earlier cancer, lung cancer in a first-degree relative, height and weight (BMI) and education. The mapping of Finnish education to the model's six US levels is ours.
  - The risk only orders people inside the same urgency. Alarm rules still decide the placement. Never-smokers get no PLCOm2012 risk, because the model does not apply to them.
  - The literature view became a literature watch that highlights risk-model papers. It never changes anyone's risk.
- **Rationale and trade-offs** Using a validated model makes the risk defensible to clinicians and mentors. Trade-offs: the model was developed in a US cohort (PLCO) and is not validated in Finland. It does not use symptoms, which is why urgency stays with the alarm rules. The synthetic data now includes the model inputs, generated with its own seeded PRNG so no other field changed.
- **Evidence and follow-up** [src/lib/plco.ts](../src/lib/plco.ts) and [src/lib/priority.test.ts](../src/lib/priority.test.ts), which checks the code against the published equation. Check the published correction and ask mentors whether a Finnish or Nordic validation exists.

## Entry template

- **Date / decision**
- **Status** (proposed / accepted / superseded)
- **Context and options considered**
- **Rationale and trade-offs**
- **Evidence and follow-up**
