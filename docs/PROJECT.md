# Project

> **Draft MVP plan · updated 2026-11-14 01:40 EET.** Based on the team's concept from 2026-11-14: a symptom survey to a risk group, AI-prepared fast-lane cases, and a benefit analysis for decision-makers. The team has not formally confirmed the challenge yet (see [HAASTEVERTAILU.md](HAASTEVERTAILU.md)). Mark anything you verify with its source and date.

## One-sentence pitch

Every year, a wellbeing services county sends a short symptom survey to people at high risk of lung cancer. AI summarizes the answers and proposes, with reasons, who should go on a fast lane to a physician or CT. A physician approves every placement, and the tool shows decision-makers how much earlier patients are found compared with today.

## Problem and MVP

- **Selected challenge and source** AstraZeneca — *Equal Care Across Finland*. Brief and judging: [CHALLENGES.md](CHALLENGES.md#astrazeneca--equal-care-across-finland).
- **Working name** *Kaksi ovea* / Fast Lane.
- **Users**
  1. Physician in a health centre: reviews AI-prepared cases and decides placement.
  2. Decision-maker in a wellbeing services county: sees the gap, the plan and its expected benefit.
  3. Person in the risk group: answers the survey.
- **Pathway stage** Late detection: people who do not seek care. Also the step from primary care to diagnostic imaging. These are the brief's first two bottlenecks.
- **Goal 3 indicator** Lung cancer five-year relative survival towards the Nordic level, a gap of 14 percentage points (Strategy p. 5). The link from earlier imaging to survival is a stated assumption. Treatment within target times (THL 21/2016) is a candidate only if its clock starts before referral. **Read the definition before using it.**

### Problem (verified facts and labelled assumptions)

| Claim | Source | Type |
| --- | --- | --- |
| About 65–70% of lung cancers are diagnosed only after they have spread. Early disease is often symptom-free because the lungs do not hurt. Typical symptoms are cough, breathlessness, chest pain, weight loss, blood-tinged sputum and recurrent pneumonia. Stigma delays seeking care. | [National Lung Cancer Programme 2026–2035, preprint](https://www.filha.fi/wp-content/uploads/2026/05/Valtakunnallinen-keuhkosyopaohjelma-2026-2035_180526_preprint.pdf) (Filha, May 2026) pp. 2–4, 15–16 | Verified 2026-11-13 |
| Only 27% of lung cancer patients received curative treatment. Diagnostics differ by wellbeing services county. Stage data is missing for almost half of patients. | Syöpäjärjestöt quality-register lung cancer report, 2019–2023 data, via [Verkkouutiset](https://www.verkkouutiset.fi/a/keuhkosyopa-todetaan-usein-liian-myohaan-vain-joka-neljas-saa-parantavaa-hoitoa/) | Verified via news. **Find the report and check for regional figures.** |
| Finland waits longer than the other Nordic countries at every pathway stage: about two weeks to a primary-care appointment versus usually under one week. Finland's strong gatekeeping hurts hard-to-recognize diseases such as lung cancer. | [University of Helsinki, 7 Nov 2025](https://www.helsinki.fi/fi/uutiset/terveys/miksi-suomessa-keuhkosyopaan-kuollaan-aiemmin-kuin-pohjoismaissa) (*Acta Oncologica* 2025) | Verified 2026-11-13 |
| Occupational health care is fast and health centres are slow. An unpublished lymphoma study found diagnosis takes twice as long via public care. | Roadmap p. 11 | Verified. Single unpublished study. |
| About a third of cancer patients are of working age, so most depend on health centres. | Strategy p. 6, plus team inference | Second half is an **assumption** |
| Time from first symptom to diagnosis is not collected. | Strategy p. 30 | Verified |
| Diagnostic speed and surgery rates vary considerably between regions. | Lung Cancer Programme p. 4 | Verified, no figures yet |
| LDCT screening is only being evaluated nationally, and a decision is expected after the programme's evaluation. | Lung Cancer Programme pp. 17–18, 24 | Verified. This is why we propose a symptom survey, not CT screening. |

## The solution: four steps

| Step | What happens | Who decides | AI role |
| --- | --- | --- | --- |
| **1. Who gets the survey** | Risk group, for example people aged 55–80 who smoke or have smoked. In real use the health centre selects them from its own records. In the demo the people are synthetic. | County, by fixed criteria | None |
| **2. Survey** | A two-minute survey by text message link, in several languages: alarm symptoms and smoking history. Reminders go to non-responders. | Person answers | Optional translation and plain-language rewording |
| **3. Fast lane** | Fixed rules score the answers. AI writes a short case summary for each person with an alarm sign and proposes a placement: physician within days, direct CT, or normal route. Each reason quotes the person's own answers. The physician approves or changes every placement and signs the CT referral. Booking goes to reserved slots, with result tracking and reminders. | **Physician** | Summarizes, proposes and justifies. Never diagnoses or decides. |
| **4. Benefit analysis** | Compares the fast lane with the current pathway for the county: how many people are found, how many days earlier they reach CT, and how many physician and CT slots the county must reserve. Results are a range (cautious, base, optimistic), and all assumptions are visible. | Decision-maker | Writes a two-minute brief with a source for every figure and answers follow-up questions. **Code computes all numbers.** |

**Why this beats a passive fast lane** A fast lane only helps people who come in. The survey reaches people who would not come in, and late detection is the brief's first bottleneck.

**Why AI is needed** Without AI summaries, physicians cannot review hundreds of survey answers. AI makes outreach at county scale feasible while the physician keeps the decision.

**Responsible design** In the demo:
- no real patient data, only synthetic people and answers
- fixed rules decide who reaches a physician's list
- AI output is a proposal with quoted reasons
- a physician signs every referral.

A real pilot would need data permits and a decision on medical-device status.

## Positioning and evidence

### What is new, and what is the landing

- **The survey is the core and the insight.** It finds people who would not come in themselves. Lead the pitch with it and spend most of the demo on it: the survey, the AI summaries and the physician's decision.
- **The fast lane is where survey-positive people land.** Without it, survey-positive people join the normal two-week queue and nothing gets faster. Keep it simple: reserved physician and CT slots plus direct referral. Do not invent it. Plug into the Nordic-style pathways that the Roadmap already pilots (action 2.5.2).
- **Pitch line:** "We find the people who would not come in themselves, and make sure they reach a scan in days, not weeks."

### Why people do not seek care, and how the survey lowers the threshold

| Barrier | Survey response | AI needed? |
| --- | --- | --- |
| Symptoms are non-specific, and the lungs do not hurt (Lung Cancer Programme pp. 2–4) | Ask concrete questions, for example "cough longer than 3 weeks?" or "blood in sputum?", so people do not have to judge for themselves | No |
| Stigma, for example about smoking (Lung Cancer Programme pp. 15–16) | The county sends it to the whole risk group as routine. Nobody has to reach out. | No |
| Effort and waiting | Two minutes on a phone. An alarm sign books directly into the fast lane. | No |
| Language and difficulty describing symptoms | A free-text "in your own words" field in any language. AI translates it and flags possible symptoms for the physician. AI can only add flags, never remove them. | **Yes** |

### Survey channel (decided 2026-11-14)

1. Text-message survey to everyone in the risk group.
2. A reminder after one week.
3. A nurse calls non-responders and people over 75 and fills in the same survey. Answers flow into the same system.

Non-responders are often the oldest and most disadvantaged people, which is the equity point of the challenge.

An AI voice call was considered and rejected for now. Many people do not answer unknown numbers because of scam calls, speech recognition is weak in dialects, and a live demo in a noisy hall is risky. It can be a later extension.

### Evidence for the approach

Collected 2026-11-14. Use with the caveats shown.

- **Danish cancer patient pathways (fast lanes).** In 2008 Denmark introduced fast-track referral: patients with specific symptoms, such as sustained cough, had to be seen at the hospital within three days of referral. After implementation, three-year relative survival for symptomatic patients diagnosed via primary care rose from 45% to 54% (all cancers combined). CPP-referred patients had lower excess mortality. **Caveat:** the authors note the change may partly reflect lead-time and selection bias. [Jensen et al. 2017, BMC Cancer](https://doaj.org/article/15ccea42331548b1b43b87ac43ae986c)
- **A fast lane alone is not enough for lung cancer.** In Denmark in 2010, only 27.4% of lung cancer patients were referred from the GP to the fast track. The authors concluded that the fast track must be supplemented to detect lung cancer earlier. **This is the core argument for the survey.** [Guldbrandt et al., BMC Health Services Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4307896/)
- **Route matters.** Danish patients diagnosed through an unplanned admission had a much higher one-year mortality than those diagnosed through a primary-care pathway (OR 3.38). This is an association, not causation. [Danckert et al.](https://research.regionh.dk/en/publications/routes-to-diagnosis-and-the-association-with-the-prognosis-in-pat/)
- **Getting people to come earlier gives mixed evidence.**
  - England's national Be Clear on Cancer lung campaign was linked to about 700 extra diagnoses, 300 of them with potentially curative treatment. [GOV.UK](https://gov.uk/government/news/be-clear-on-cancer-campaign-findings)
  - The Welsh campaign found no significant change in early-stage diagnoses. [Cardiff evaluation](https://orca.cardiff.ac.uk/126586/2/BCOC%20paper%20BJC%20Rev%201%20submitted%2024.10.2019%20_CLEAN_with%20tables%20for%20ORCA_pre%20print.pdf)
  - These were mass-media campaigns. **No direct evidence for a targeted symptom survey has been found yet. This is our biggest evidence gap.**
- **Speed versus survival.** Lung cancer shows a "waiting time paradox": the sickest patients are diagnosed fastest and still do worst, so studies are mixed. [Cancer Epidemiology 2015](https://core.ac.uk/download/77409558.pdf) For stage I–II disease, waiting more than four weeks from diagnosis to surgery was associated with worse survival. [J Thorac Dis](https://jtd.amegroups.org/article/view/104706/html) Benefit is most plausible for early-stage patients with mild symptoms, the group the survey targets.

### What we claim, and what we do not

1. **Certain and measurable:** time to CT gets shorter. The demo computes this.
2. **Plausible and evidence-based:** fast lanes are associated with better prognosis in Denmark, but a fast lane alone reaches only some lung cancer patients, so outreach is needed.
3. **Assumption, not a promise:** earlier detection improves survival.

### How a pilot would prove it

The county starts in one health centre area and compares it with a control area on four measures:
- time from first contact to CT
- share of cancers found at a curable stage
- number of cancers found through the survey
- share of fast-lane patients who turn out to have cancer.

We do not promise the effect. We give a tool that measures it.

### The two-minute brief for decision-makers

The brief requires that a non-technical decision-maker understands the finding and the action within two minutes. The AI analyst writes one brief per county. Code computes the X values:

> **Pirkanmaa: lung cancer fast lane**
> **Finding:** about X lung cancers a year, most found after spreading [1]. The risk group is about X people [2].
> **Where it stalls:** people do not seek care in time, and the health-centre wait adds about two weeks [3].
> **Action:** a yearly survey to the risk group, a physician-approved fast lane and X reserved CT slots a week.
> **Expected effect (range):** X–X people a year reach CT on average X–X days earlier.
> **Limitations:** effect sizes are assumptions, and the response rate is unknown.
> **Sources:** [1] Finnish Cancer Registry … [2] THL … [3] *Acta Oncologica* 2025 …

## Demo flow (two minutes)

1. **Decision-maker view (20 s)** Map: pick a county and see the problem and the risk-group size, with sources.
2. **Survey (20 s)** Send the survey to 200 synthetic people. Show one person answering on a phone.
3. **Fast lane (40 s)** A physician sees the list sorted by the rules. Open one case to show the AI summary, the proposed placement with quoted reasons and a pre-filled CT referral. The physician approves it.
4. **Benefit (30 s)** Fast lane versus today: people found, days saved and slots needed. Show the AI brief.
5. **Close (10 s)** What the county can start on Monday, and a pilot with AstraZeneca.

## Architecture and stack

Proposal. Record final choices in [DECISIONS.md](DECISIONS.md).

```
src/
  app/                    Next.js App Router
  app/county/             decision-maker view: map, metrics, benefit analysis, brief
  app/survey/             mobile survey (multilingual)
  app/clinician/          fast-lane list and case view with approve/change
  app/api/summarize/      AI case summary and placement proposal
  app/api/brief/          AI analyst brief (tool-calling loop)
  lib/rules.ts            fixed alarm-symptom scoring (deterministic)
  lib/simulation.ts       fast lane vs current pathway (deterministic)
  lib/llm.ts              single wrapper around the LLM provider
  data/counties.json      public aggregate metrics per county, each with source_id, year and is_estimate
  data/sources.json       id, title, url, page and retrieved date
  data/synthetic/         generated synthetic people and survey answers
scripts/                  Python: data preparation and synthetic data generation
```

### Data contracts

```json
// data/synthetic/responses.json — one synthetic survey answer
{
  "id": "p-0042",
  "age": 67,
  "language": "fi",
  "smoking": { "status": "former", "pack_years": 30 },
  "symptoms": { "cough_weeks": 5, "blood_in_sputum": true, "weight_loss": false, "breathlessness": true, "chest_pain": false, "pneumonias_last_year": 1 },
  "previous_visits": [{ "months_ago": 2, "reason": "cough" }],
  "synthetic": true
}
```

```json
// output of /api/summarize — the physician sees this and decides
{
  "id": "p-0042",
  "rule_score": 3,
  "proposed_placement": "direct_ct",
  "summary": "67, former smoker (30 pack-years). Blood in sputum and cough for 5 weeks. Second visit for cough in 2 months.",
  "reasons": ["blood_in_sputum: true", "cough_weeks: 5", "previous_visits: cough 2 months ago"],
  "physician_decision": null
}
```

Every number in `counties.json` carries `source_id`, `year` and `is_estimate`. Label mock values `"source_id": "mock"` until they are replaced.

### Simulation v1

Explicit and adjustable:
- Risk group size per county = population aged 55–80 × smoking prevalence. Source: Statistics Finland and THL regional indicators. **Verify that county-level smoking data exists.**
- Inputs:
  - survey response rate
  - share of respondents with alarm signs
  - share of fast-lane patients who turn out to have cancer
  - target days to physician and to CT
  - reserved slots per week.
- Current pathway: primary-care wait about 14 days nationally (*Acta Oncologica* 2025) plus the CT queue. Mark this as a national estimate if no county figure exists.
- Outputs:
  - people with cancer reaching CT earlier
  - days saved
  - physician and CT slots needed per week.
- No survival or stage-shift numbers unless a source supports them.

| Component | Technology / version | Hardware or access needed | Owner (proposed) | Fallback |
| --- | --- | --- | --- | --- |
| Web app: county view, survey and clinician view | Next.js, TypeScript, Tailwind | Laptop | Joel | One static county |
| Rules and simulation | TypeScript modules | None | Patrik and Noel | Fixed scenarios |
| AI case summary and brief | Anthropic Claude API ($20 per participant) or OpenRouter (Patrik's account). See [RESOURCES.md](RESOURCES.md). | API key, unverified | Noel | Cached outputs |
| Public data and synthetic data | Python and pandas → JSON | Public downloads | Patrik | Hand-entered figures for three counties |
| Alarm criteria, medical review, mentor quotes and pitch | None | Mentors | Delun | None |
| Deploy | Vercel (Patrik's account, unverified) | Account access | Patrik | Run locally |

Keep API keys in `.env.local`. Never commit them.

## Implementation milestones

| Milestone | Owner | Target (EET) | Acceptance check |
| --- | --- | --- | --- |
| Verify critical facts and data | Patrik (data), Delun (mentors) | Sat 14 Nov 10:00 | County-level lung cancer figures and smoking prevalence found with sources. THL 21/2016 definition read. Kaisa Kaitila's answers recorded. |
| Skeleton end to end on synthetic data | Joel and Noel | Sat 14 Nov 14:00 | Survey → rules → AI summary → physician approves → benefit numbers |
| Real public data, AI brief and map | All | Sat 14 Nov 20:00 | The full demo flow runs |
| Feature freeze and rehearsal | All | Sun 15 Nov 06:00 | Two timed two-minute run-throughs. Cached fallback works. |
| Final submission | Noel | Sun 15 Nov 10:00 | All required artifacts submitted |

## Open questions

- Ask Kaisa Kaitila (AstraZeneca Medical Affairs):
  - Does the fast lane just move the queue to imaging?
  - Is a symptom survey to a risk group credible?
  - Which alarm criteria should we use?
- What share of fast-lane patients turn out to have cancer in the Nordic package pathways? This drives CT load. Find a source.
- Is there direct evidence that a targeted symptom survey or risk-group invitation finds lung cancer earlier? See [Evidence for the approach](#evidence-for-the-approach). England's Lung Health Check invites a risk group to CT; verify its results before citing it.
- Response rate assumption, and who does not answer (equity).
- County-level data: Cancer Registry figures, smoking prevalence, and the Syöpäjärjestöt report.
- THL 21/2016: where does the target-time clock start?
- Working LLM API key and Vercel access.

## Start building with Claude Code or Codex

Open the `junction-2026` folder and start with:

> Read AGENTS.md, docs/STATUS.md and docs/PROJECT.md. Scaffold the MVP described in PROJECT.md under src/ as a Next.js + TypeScript + Tailwind app with three views: county (decision-maker), survey (mobile) and clinician (fast-lane list and case view). Generate 200 synthetic survey responses that follow the data contract. Implement lib/rules.ts and lib/simulation.ts as deterministic modules with unit tests. Implement /api/summarize behind lib/llm.ts, reading the API key from .env.local. Its reasons must quote the person's answers, and the physician must approve each placement. Use mock county data labelled as mock. Add run instructions to README.md.

## Submission checklist

- [ ] Confirm challenge eligibility, judging criteria and required submission fields on the [Junction Platform](https://hackjunction.app/hackathons/junction-2026).
- [ ] Confirm the preliminary submission and final deadline in [STATUS.md](STATUS.md).
- [ ] Prepare the MIT-licensed submission per organizer guidance. Confirm source visibility and how reviewers get access.
- [ ] Check that the deliverable contains only material the team can publish. Keep private team notes and credentials out of the submission.
- [ ] Add reproducible run instructions and test the demo on the actual target.
- [ ] Verify links, complete the final submission and check that the platform shows it as submitted.
