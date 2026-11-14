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

## Entry template

- **Date / decision**
- **Status** (proposed / accepted / superseded)
- **Context and options considered**
- **Rationale and trade-offs**
- **Evidence and follow-up**
