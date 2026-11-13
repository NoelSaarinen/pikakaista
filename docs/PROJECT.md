# Project

> **Draft MVP plan · 2026-11-13 23:40 EET.** Proposed by Noel after mentor conversations. The team has not confirmed the challenge yet (see [HAASTEVERTAILU.md](HAASTEVERTAILU.md)). Open questions are listed in [Open questions](#open-questions). Mark anything you verify with its source and date.

## Problem and MVP

- **Selected challenge and source** AstraZeneca — *Equal Care Across Finland* (proposed). Brief and judging: [CHALLENGES.md](CHALLENGES.md#astrazeneca--equal-care-across-finland).
- **Working name** *Kaksi ovea* (Two Doors): an AI analyst that shows a wellbeing services county where suspected lung cancer gets stuck and simulates a suspected-cancer fast lane in health centres.
- **User** Leadership or the primary-care development lead of a wellbeing services county (hyvinvointialue) who must decide where and how to pilot the national referral criteria (Roadmap action 2.5.2, pp. 52–53). Secondary: AstraZeneca as a pilot partner after Junction.
- **Goal 3 indicator** Five-year relative survival of poor-prognosis cancers reaches the Nordic level, for lung cancer +14 percentage points (Strategy p. 5). Secondary candidate: treatment starts within target times (THL guidance 21/2016). Confirm with mentors which one to lead with.

### Problem (verified facts and labelled assumptions)

| Claim | Source | Type |
| --- | --- | --- |
| About 65–70% of lung cancers are diagnosed only after they have spread. About a quarter are found without symptoms, many incidentally on imaging done for other reasons. | [National Lung Cancer Programme 2026–2035, preprint](https://www.filha.fi/wp-content/uploads/2026/05/Valtakunnallinen-keuhkosyopaohjelma-2026-2035_180526_preprint.pdf) (Filha, May 2026) pp. 2–4, 19 | Verified 2026-11-13 |
| Only 27% of lung cancer patients received curative treatment. Diagnostics and treatment differ by wellbeing services county. Stage data is missing for almost half of patients. | Syöpäjärjestöt quality-register lung cancer report, 2019–2023 data, via [Verkkouutiset](https://www.verkkouutiset.fi/a/keuhkosyopa-todetaan-usein-liian-myohaan-vain-joka-neljas-saa-parantavaa-hoitoa/) | Verified via news 2026-11-13. Find the report itself and check for regional figures. |
| Finland has longer waits than the other Nordic countries at every pathway stage: about two weeks to a primary-care appointment versus usually under one week. 40–60% of patients see a nurse first. Other countries use CT earlier. | [University of Helsinki news, 7 Nov 2025](https://www.helsinki.fi/fi/uutiset/terveys/miksi-suomessa-keuhkosyopaan-kuollaan-aiemmin-kuin-pohjoismaissa) on an *Acta Oncologica* 2025 survey of 42 specialists | Verified 2026-11-13 |
| Occupational health care is fast and health centres are slow. An unpublished lymphoma study found diagnosis takes twice as long via public care. | Roadmap p. 11 | Verified. Single unpublished study. |
| About a third of people diagnosed with cancer are of working age. | Strategy p. 6 | Verified |
| Most cancer patients therefore depend on the slower health-centre door. | Team inference from the two rows above | **Assumption** |
| Time from first symptom to diagnosis is not collected, and stage is recorded in only about 40% of clinical notifications. | Strategy p. 30 | Verified |
| No uniform national timetable for diagnostic steps exists yet. A national diagnostic recommendation with primary-care referral criteria and time limits is planned. | Lung Cancer Programme pp. 4, 16–17 | Verified 2026-11-13 |

**Where the gap emerges** Between the first primary-care contact and diagnostic imaging (primary-care interval). The patient interval before the first contact is real but unmeasured.

### Recommended action

One action a county can start now: **a suspected-lung-cancer fast lane in health centres.**

1. **Low-threshold entry.** Phone or digital contact asks standardized alarm-symptom questions and smoking history and books directly into the fast lane.
2. **Physician within days.** An alarm symptom leads to a physician appointment within a set target time, not a nurse-only gate or the normal queue.
3. **Direct CT from primary care.** If imaging capacity is the bottleneck, reserve a fixed number of CT slots per week for the fast lane. This depends on Kaisa Kaitila's answer (asked 2026-11-13).
4. **Follow up incidental lung findings systematically.**
5. **Measure with Symptom Clock** before and after the pilot.

Alarm criteria and target times are proposed from the Nordic package pathway models (Denmark, Sweden, Norway). Delun verifies the medical content.

**Not the main recommendation: screening.** LDCT screening is only being evaluated nationally (Lung Cancer Programme pp. 17–18, 24), a county cannot start it now, and per the team's notes screening sits under Strategy Goal 2, not Goal 3. Mention it as a long-term step.

### MVP: one end-to-end flow

1. The decision-maker opens a map of wellbeing services counties and picks one.
2. The county view shows the gap metrics, each with a source link.
3. The user moves fast-lane sliders: share of suspected cases caught, target wait to a physician and reserved CT slots per week. A deterministic simulation shows the estimated days saved and the number of patients affected.
4. **The AI analyst** writes a two-minute brief: the gap, where it emerges, the action and its expected effect, the sources and the limitations. The user can ask follow-up questions in natural language and gets cited answers.
5. **Symptom Clock**: paste a synthetic patient story. The LLM extracts a timeline with the Aarhus intervals and shows which interval is long.

### Demo success criteria

- A non-technical decision-maker understands the finding and the action within two minutes.
- Every number in the brief links to its source and page. Estimates and assumptions are labelled.
- Live: switch county, move a slider and regenerate the brief in about 20 seconds or less. Symptom Clock processes one story live.
- Cached briefs work if the network or the API fails.

### Optional features

Pilot Map ranking of county–cancer pairs, a Distance Tax layer, and a Finnish/English toggle.

## Where AI is used

**Principle:** numbers are computed in code. The LLM receives computed metrics and retrieved source passages, never invents numbers, and must cite. A post-check compares every number in the generated text against the tool outputs.

| Component | AI role | Judging criteria it serves |
| --- | --- | --- |
| AI analyst | LLM with tool calls: `get_county_metrics(county)`, `run_simulation(params)` and `search_sources(query)`. Writes the brief in Finnish or English with citations. | Insight 25%, clarity 10%, data quality 20% |
| Source Q&A | Retrieval over the strategy, the roadmap, the Lung Cancer Programme and AstraZeneca's curated sources, with page references. Keyword search such as BM25 is enough for the MVP. | Data quality and transparency 20% |
| Symptom Clock | Structured extraction from a free-text patient story into a timeline of patient, primary-care, referral, diagnostic and treatment intervals, each with a confidence score. Synthetic stories only. | Insight: measures the unmeasured patient interval. Actionability: a cheap pilot measurement. |
| Not AI | Data joins, metrics and simulation, which are deterministic with adjustable, visible assumptions. | Credibility |

No patient-level data, and no AI triage of real patients. Clinicians apply the fast-lane criteria. This keeps the demo outside medical-device territory.

## Architecture and stack

Proposal. Record final choices in [DECISIONS.md](DECISIONS.md).

```
src/
  app/                Next.js App Router pages: map, county view, Symptom Clock
  app/api/brief/      AI analyst endpoint (tool-calling loop)
  app/api/clock/      Symptom Clock extraction endpoint
  lib/simulation.ts   deterministic fast-lane model
  lib/llm.ts          single wrapper around the LLM provider
  lib/sources.ts      source registry and keyword search over PDF text chunks
  data/counties.json  metrics per county, each value with source_id, year and is_estimate
  data/sources.json   id, title, url, page and retrieved date
  data/corpus/        PDF text chunks with page numbers
scripts/              Python data preparation (pandas) writing to src/data/
```

**Data contract**, so that UI and AI work can start on mock data before the real data lands:

```json
{
  "id": "pirkanmaa",
  "name": "Pirkanmaan hyvinvointialue",
  "metrics": {
    "lung_cancer_cases_per_year": { "value": 0, "unit": "cases", "year": 2023, "source_id": "cancer-registry", "is_estimate": false },
    "primary_care_wait_days": { "value": 0, "unit": "days", "year": 2025, "source_id": "thl-sotkanet", "is_estimate": false },
    "working_age_share": { "value": 0, "unit": "share", "year": 2024, "source_id": "statfin", "is_estimate": false }
  }
}
```

Label mock values `"is_estimate": true` and `"source_id": "mock"` until they are replaced. Never present mock values as findings.

**Simulation v1** (explicit and adjustable):
- Expected lung cancer cases per year by county, from the Cancer Registry.
- Share dependent on the health centre = 1 − working-age share × occupational-health coverage. The coverage default is an assumption shown as a slider.
- Baseline primary-care wait comes from THL access data. It covers all visits and is labelled as not cancer-specific.
- Days saved = baseline wait − fast-lane target wait, plus the CT queue change from reserved slots versus expected demand.
- Output: patients reaching CT earlier and days saved. No survival or stage-shift claims unless a source supports them.

| Component | Technology / version | Hardware or access needed | Owner (proposed) | Fallback |
| --- | --- | --- | --- | --- |
| Web app and map | Next.js, TypeScript, Tailwind; county GeoJSON (source and licence to verify) | Laptop | Joel | Static page for one county |
| Data pipeline | Python and pandas → JSON | Public downloads: Cancer Registry, NORDCAN, THL Sotkanet, Statistics Finland | Patrik | Hand-entered figures for three counties |
| Simulation | TypeScript module | None | Patrik and Noel | Fixed scenarios |
| AI analyst and source Q&A | Anthropic Claude API ($20 per participant) or OpenRouter (Patrik's account). See [RESOURCES.md](RESOURCES.md). | API key, unverified | Noel | Pre-generated briefs |
| Symptom Clock | LLM structured output | API key | Noel | Structured form instead of free text |
| Medical content, alarm criteria, mentor quotes and pitch | None | Mentors | Delun | None |
| Deploy | Vercel (Patrik's account, unverified) | Account access | Patrik | Run locally |

Keep API keys in `.env.local`. Never commit them.

## Implementation milestones

| Milestone | Owner | Target (EET) | Acceptance check |
| --- | --- | --- | --- |
| Preliminary submission | Noel | Fri 13 Nov 23:55 | The platform shows it as submitted |
| Confirm the challenge and verify the critical data | Team; Patrik for data, Delun for mentors | Sat 14 Nov 10:00 | Regional Cancer Registry figures and THL access data downloaded with sources. Kaisa's answer recorded. |
| Skeleton end to end on mock data | Joel and Noel | Sat 14 Nov 14:00 | Map → county → metrics → AI brief runs locally |
| Real data, simulation, source Q&A and Symptom Clock | All | Sat 14 Nov 20:00 | The full demo flow runs on real data |
| Feature freeze and rehearsal | All | Sun 15 Nov 06:00 | Two timed two-minute run-throughs. Fallback cache works. |
| Final submission | Noel | Sun 15 Nov 10:00 | All required artifacts submitted |

## Demo strategy

- **Run instructions and demo input** To be added with the code. Demo county to choose once the data is in.
- **Live sequence and expected result**
  1. Hook: two thirds of lung cancers are found only after spreading, and Finland waits longer than the Nordic countries at every step.
  2. Map, then pick the demo county.
  3. AI brief: gap → stage → action → sources.
  4. Slider: reserve CT slots and watch the days saved.
  5. Symptom Clock: story → timeline.
  6. Close: what the county can start on Monday, and a pilot with AstraZeneca.
- **Presenter and operator** Delun presents. Operator to be decided.
- **Fallback if a service, device or network fails** Cached API responses and a screen recording of the full flow.
- **Video or screenshots** Record after the feature freeze.

## Open questions

- Does the fast lane only move the queue to imaging? Asked from Kaisa Kaitila (AstraZeneca Medical Affairs) on 2026-11-13. Record her answer here.
- Is there regional data on the route to diagnosis (health centre, private or occupational health)? If not, which proxy would mentors accept?
- Which Goal 3 indicator should we lead with: survival or target times?
- What regional level do the Cancer Registry statistics use, and do they include stage? Does the Syöpäjärjestöt lung cancer report include regional figures?
- Team confirmation of the challenge, compared with Beyond the Clinic.
- Working LLM API key and Vercel access.

## Start building with Claude Code or Codex

Open the `junction-2026` folder and start with:

> Read AGENTS.md, docs/STATUS.md and docs/PROJECT.md. Scaffold the MVP described in PROJECT.md under src/: a Next.js + TypeScript + Tailwind app with a county map, a county view and a Symptom Clock page. Use mock data for three counties that follows the data contract and is labelled as mock. Implement lib/simulation.ts, and the AI analyst endpoint with tool calls behind lib/llm.ts, reading the API key from .env.local. Add run instructions to README.md.

## Submission checklist

- [ ] Confirm challenge eligibility, judging criteria and required submission fields on the [Junction Platform](https://hackjunction.app/hackathons/junction-2026).
- [ ] Confirm the preliminary submission and final deadline in [STATUS.md](STATUS.md).
- [ ] Prepare the MIT-licensed submission per organizer guidance. Confirm source visibility and how reviewers get access.
- [ ] Check that the deliverable contains only material the team can publish. Keep private team notes and credentials out of the submission.
- [ ] Add reproducible run instructions and test the demo on the actual target.
- [ ] Verify links, complete the final submission and check that the platform shows it as submitted.
