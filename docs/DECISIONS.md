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

## 2026-11-14 — Keep PLCOm2012 screening risk separate from symptom review

- **Status** Implemented in the demo as an optional research estimate; not approved for clinical use.
- **Decision** Calculate the published PLCOm2012 six-year probability only when all model inputs are supplied for an asymptomatic ever-smoker. Do not add the probability to the symptom score or use it to suppress symptom review. Surface reported symptoms to the clinician regardless of the survey's age/smoking eligibility rule.
- **Rationale** PLCOm2012 predicts six-year lung-cancer incidence among ever-smokers using a US-derived logistic model, whereas symptom flags address current symptoms and care review. They have different populations, outcomes and time horizons. A combined score would have no validated interpretation. The current PLCO estimate is prominently caveated because it has not been calibrated for Finland.
- **Evidence** [Tammemägi et al., NEJM 2013](https://www.nejm.org/doi/full/10.1056/NEJMoa1211776), including the published model equation and predictor definitions.
- **Follow-up** Confirm model implementation against the published example and have a clinician review the symptom routing before using beyond a synthetic demo. Determine a Finnish screening threshold only through an approved local pathway.

## 2026-11-14 — Combine symptom review with PLCOm2012 ordering

- **Status** Decided by Delun on 2026-11-14 when combining his local version with branch `feature/patient-pathway` (branch `feature/combined`). Medical review pending.
- **Decision**
  - Everyone with a reported symptom reaches the physician list for symptom review, even outside the survey risk group (local version). Order: red flags, other symptom review, then placement and alarm score.
  - Inside the same urgency, PLCOm2012 6-year risk orders people (branch). It is computed for every ever-smoker with one engine, `src/lib/plco.ts`; the separate `plco-m2012.ts` was removed.
  - For asymptomatic ever-smokers the same PLCOm2012 value is also shown as a screening estimate (local version).
  - Race is an optional question. Without an answer the model reference category is used and shown as imputed. Missing inputs are imputed with the model centring values.
  - Fixed: the local version had the race betas for Native Hawaiian or Pacific Islander (1.027152) and American Indian or Alaskan Native (0) swapped. Table 2 of the paper prints them as above; a unit test now checks every race beta.
- **Supersedes** "Race and ethnicity are not asked" in the PLCOm2012 entry above, and "complete inputs only" in the entry below.

## Entry template

- **Date / decision**
- **Status** (proposed / accepted / superseded)
- **Context and options considered**
- **Rationale and trade-offs**
- **Evidence and follow-up**

## 2026-11-14 — Simulated physician booking for high-risk people

- **Status** Built by Delun's request on branch `feature/combined`. Demo only: no real appointment system, calendar or text message. Medical review pending.
- **Decision**
  - The physician view books simulated physician appointments for high-risk people on the priority list, in list order, as far as the region's fast-lane capacity allows over two weeks. The rest go to a queue. A physician can cancel any booking.
  - Tier A: aged 40+ with haemoptysis (NICE NG12 1.1.1, suspected cancer pathway). Target within 3 working days (team assumption after the Danish 3-day fast track).
  - Tier B: aged 40+ with 2 or more NG12 1.1.2 symptoms, or ever smoked and 1 or more (cough of 3+ weeks, shortness of breath, chest pain, weight loss), or symptoms with PLCOm2012 ≥ 2 %. Target within 2 weeks (NG12: "urgent" = before 2 weeks).
  - Capacity: the region's fast-lane physician slots per week from the base scenario on `/county` (population 55–80 × smoking share × assumptions), or a number set by hand. All demo answers are treated as the chosen region's answers.
- **Evidence** NICE NG12 lung recommendations 1.1.1–1.1.3 [2015] and the "Terms used" definitions, read on nice.org.uk on 2026-11-14.
- **Trade-offs** Cough duration, the PLCOm2012 addition to tier B, tier A's 3-day target and the capacity scenario are team assumptions. The survey cannot tell whether a symptom is "unexplained", so the physician still decides.

## 2026-11-14 — Two-tier prioritisation: symptoms first, then PLCOm2012 screening list

- **Status** Built by Delun's request on branch `feature/combined`. Demo only, simulated invitations. Medical review pending.
- **Decision**
  - Tier 1: anyone with a symptom goes to symptom review, and high-risk symptomatic people get a simulated physician appointment by NICE NG12 tiers (entry above). No risk score can override this.
  - Tier 2 (`/screening`): asymptomatic ever-smokers aged 55–80 are ranked by PLCOm2012 6-year risk, highest first. People at or above the paper's 1.3455 % threshold are invited from the top as far as the screening CT capacity allows (default 5 per week for 4 weeks, adjustable). Pack-years are not required separately, because the model uses intensity, duration and quit time.
  - People with imputed key inputs are flagged "complete the data before inviting". Ages 75–80 are flagged as outside the model's 55–74 development cohort.
  - The view compares the model's expected cancers among the invited with the same number chosen by age 55–80 and ≥ 20 pack-years. This is the model's own estimate on synthetic data, not independent evidence.
- **Rationale** Ranking by absolute risk puts limited CT capacity where the most cancers are expected. Tammemägi et al. 2013 compared model-based and NLST-criteria selection at the same number of people. Keeping symptoms out of the score avoids mixing a diagnostic question with a screening model built on asymptomatic people.
- **Trade-offs and follow-up** Pure risk ranking puts the oldest people first; several of the top-ranked are 75–80. Ranking by expected life-years gained could correct for this (e.g. Cheung et al. 2019, not yet checked). PLCOm2012 is not calibrated for Finland. The screening capacity is an assumption; ask mentors for real LDCT capacity.

## 2026-11-14 — Equity ranking for screening invitations: risk factors without age

- **Status** Decided by Delun on 2026-11-14. Default on `/screening`; absolute ranking stays available. Team equity choice, not a validated risk. Medical review pending.
- **Context** Pure PLCOm2012 ranking put the oldest people first (mean age of the invited 73.2 years, 9 of 20 aged 75+), largely because of the age term.
- **Decision**
  - Rank by the age-standardised PLCOm2012 risk: the published, mutually adjusted coefficients of every risk factor except age are summed, with age set to 62 (the model's centring age) for everyone. People with the same risk factors get the same rank at any age.
  - Eligible if either the real or the age-standardised risk reaches 1.3455 %, so nobody the validated model would invite loses eligibility.
  - The real 6-year risk is still shown next to it, and the page compares both rankings for the same capacity.
- **Result on the demo data** (20 slots): mean age of the invited 69.6 vs 73.2 years, aged 75+ 6 vs 9, model-expected cancers among the invited 1.60 vs 1.68 (about 5 % fewer).
- **Trade-offs** Age is a real risk factor, so the equity ranking finds slightly fewer cancers per scan according to the model. Smoking duration still grows with age, so older heavy smokers still rank high, which is intended because it is exposure. Ranking by expected life-years gained is a researched alternative (not yet checked).

## 2026-11-14 — Verda inference as the app's AI provider

- **Status** Implemented by Noel on 2026-11-14 in `feature/mvp-skeleton`. Not yet merged or deployed.
- **Context** Every AI call in the app goes through [`src/lib/llm.ts`](../src/lib/llm.ts). Before this change it supported only the Claude API, and without a key the app ran on rules ("Tekoäly: pois"). Noel received €200 of Verda credits through the Junction hackerpack ([RESOURCES.md](RESOURCES.md#developer-tools-and-assets)), and the Verda Compute Track rewards using Verda inference ([CHALLENGES.md](CHALLENGES.md)).
- **Decision** `llm.ts` uses Verda's OpenAI-compatible endpoint when `VERDA_INFERENCE_API_KEY` is set and Claude only when it is not. Without either key it falls back to rules as before. The default model is `deepseek-4-1-flash-1017` (€0.13 input / €0.53 output per 1M tokens, 1M context, JSON mode). No new dependency is needed, because the call uses `fetch`. JSON answers use Verda's JSON mode with the schema in the system prompt. `completeJson` discards an answer that is missing a required top-level field, so callers fall back to rules.
- **Verified 2026-11-14** against the local dev server. `/api/ai-status` reports Verda. `/api/brief` returned an AI-written brief for Pirkanmaa in about 3 s. `/api/analyze` returned `generatedBy: "llm"` with follow-up questions from the reviewed question bank. All 83 tests and `tsc` pass.
- **Trade-offs and follow-up** Claude's strict structured outputs are replaced by prompt plus JSON mode, so field validation in the callers matters more. The key is personal and kept only in Noel's local `.env.local`. A deployment would need its own key in the host's environment.

## 2026-11-14 — Base the demo's pilot data on ISC-LDCT and its Oulu predecessor

- **Status** Requested by Delun on 2026-11-14. Pilot facts from `docs/seulontapilotti/SEULONTAPILOTTI.md` (checked 2026-11-14) and the `wichmann-2025` source entry.
- **Context** The national screening pilot ISC-LDCT (NCT07331519) runs in five areas, but its results are not published. The predecessor LDCT-SC-FI (Oulu, same criteria) has published results.
- **Decision**
  - `src/lib/pilot.ts` holds the ISC-LDCT design (areas, 1,200 places, 50–74 current smokers, ≥15 cigarettes/25 years or 10/30 years, three arms) and the LDCT-SC-FI results (6/383 scans = 1.6 % yield, 5/6 stage I, PPV 75 %, 2.5 % via healthcare referral).
  - `counties.json` `in_ldct_pilot` is filled for nine areas. "Uusimaa" = Helsinki and the four Uusimaa counties is a team inference, to confirm with mentors.
  - The decision-maker view shows the pilot for the selected county, the share of the pilot areas' risk group its places cover (about 0.6 % with the base scenario) and the predecessor results, framed as how the survey complements the pilot (reach, recruitment, former smokers and symptomatic people). The predecessor's 1.6 % screening yield is shown but not used in the fast-lane calculation, because it comes from asymptomatic volunteers.
  - The screening list shows who meets the pilot's inclusion criteria. Exclusions and the smartphone requirement are not asked, so a clinician confirms them.
- **Trade-offs** The predecessor's yield is from asymptomatic volunteers, so it understates the yield of a symptomatic fast lane. The coverage comparison is indicative because the pilot's and the demo's risk-group criteria differ.

## 2026-11-14 — One model on the decision-maker view; clinician pages in one area

- **Status** Decided by the team on 2026-11-14 (relayed by Delun).
- **Decision**
  - The decision-maker view shows only "Two Doors + survey". The "Two Doors only" toggle was removed; the brief is always written for the combined model.
  - The worklist, screening list, tracking and patient search are grouped under "Lääkäri" (route group `src/app/(laakari)`, URLs unchanged) with their own sub-navigation. The area opens after a one-click "continue as a clinician" choice stored in the browser. **This is not access control**: a real service needs authentication and role-based access.
  - The worklist got the same free-text search as the patient search page, plus quick filters (red flag, symptoms, new answers, booked). Search also matches everyday synonyms such as "veriyskä".

## 2026-11-14 — Home page lung illustration and lung logo

- **Status** Requested by Delun on 2026-11-14.
- **Decision**
  - The logo is a pair of lungs: the lobe on the viewer's left is diseased (grey with dark lesions), the lobe on the right is healthy. Original artwork (`src/components/Logo.tsx`, `src/app/icon.svg`).
  - The home page shows a four-stage illustration of a tumour growing while symptoms stay small (`src/components/LungStory.tsx`). It plays only while visible, can be paused, and respects reduced-motion settings.
  - Every statement comes from the National Lung Cancer Programme 2026–2035 (`filha-2026`, pp. 2–4, checked from the PDF on 2026-11-14): the most common symptoms (cough, breathlessness, chest pain, weight loss, haemoptysis), a long symptom-free period, 65–70 % found only after spreading, most cancer deaths in Finland, and curative treatment when found early. "Cough over 3 weeks" is from the Pirkanmaa pathway (`pirha-hoitopolku`).
- **Trade-offs** The order of symptoms is illustrative and varies between patients; the page says so and notes that the same symptoms occur in many other diseases.

## 2026-11-14 — Logo with healthy lungs and an upward arrow

- **Status** Requested by Noel on 2026-11-14 after a UI review. Replaces the mark from "Home page lung illustration and lung logo" above; the home page story is unchanged.
- **Context** The old mark showed a grey lobe with tumours. The same mark appears in the invitation survey for smokers, who already respond less than others (Yorkshire: adjusted OR 0.44 for current smokers, `ylst-2022`). A diseased-lung image resembles a cigarette-pack warning and can shame or frighten. At 16–40 px the lesions also read as smudges.
- **Decision** The mark now shows two healthy lungs with a gold arrow rising through the trachea ("faster forward"), in `src/components/Logo.tsx` and `src/app/icon.svg`. The diseased-lung imagery stays in the home page story, where it is explained. The tagline under the name is larger (12 px). The home page's primary button now opens the decision-maker view, and the clinician area shows a placeholder instead of a blank page while it loads.
- **Trade-offs** The mark no longer shows the disease directly; the name and tagline carry that meaning.
