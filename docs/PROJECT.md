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
- **Goal 3 indicator** Lung cancer five-year relative survival towards the Nordic level, a gap of 14 percentage points (Strategy p. 5). The link from earlier imaging to survival is a stated assumption.
  - **Treatment within target times (THL 21/2016) does not fit the survey.** THL monitoring measures from the referral arriving in specialist care to the first treatment procedure, so time before the referral is not counted. Details: [THL 21/2016](#thl-guidance-212016-where-the-clock-starts).
  - The Strategy's Goal 2 list on the same page has an indicator that fits the survey better: "at least 70% of cancers are diagnosed at stage I–II" (Strategy p. 5, read 2026-11-14). It belongs to Goal 2, so cite it as supporting evidence only. The brief requires Goal 3.

### Problem (verified facts and labelled assumptions)

| Claim | Source | Type |
| --- | --- | --- |
| About 65–70% of lung cancers are diagnosed only after they have spread. Early disease is often symptom-free because the lungs do not hurt. Typical symptoms are cough, breathlessness, chest pain, weight loss, blood-tinged sputum and recurrent pneumonia. Stigma delays seeking care. | [National Lung Cancer Programme 2026–2035, preprint](https://www.filha.fi/wp-content/uploads/2026/05/Valtakunnallinen-keuhkosyopaohjelma-2026-2035_180526_preprint.pdf) (Filha, May 2026) pp. 2–4, 15–16 | Verified 2026-11-13 |
| 14,873 new lung cancers in 2019–2023. Within 12 months, 27.0% received curative treatment and 60% died. Stage was missing for 47.7%. Curative treatment ranged by wellbeing services county from 18.5% (Lappi) to 35.6% (Vantaa and Kerava), crude shares. | [*Keuhkosyöpä Suomessa 2019–2023*](https://syoparekisteri.fi/assets/themes/ssy3/factsheets/keuhkosyoparaportti.html) (Finnish Cancer Registry quality-register report, released 23 Apr 2026): sections 1 and 3.2, Tables 4, 6 and 11 | Verified 2026-11-14. County table in [IDEAS.md](IDEAS.md#lung-cancer-quality-report-20192023-by-county-read-2026-11-14). |
| Only 5% of all lung cancers, and 11% of those with stage recorded, are found as localised. | Same report, section 2, citing the Cancer Registry statistics app | Verified 2026-11-14 |
| Finland waits longer than the other Nordic countries at every pathway stage: about two weeks to a primary-care appointment versus usually under one week. Finland's strong gatekeeping hurts hard-to-recognize diseases such as lung cancer. | [University of Helsinki, 7 Nov 2025](https://www.helsinki.fi/fi/uutiset/terveys/miksi-suomessa-keuhkosyopaan-kuollaan-aiemmin-kuin-pohjoismaissa) (*Acta Oncologica* 2025) | Verified 2026-11-13 |
| Health-centre access got worse in 2025. For people aged 23 and over, 59% of non-urgent physician visits took place within 14 days of the care-need assessment, against 70% in 2024. For ages 0–22 it was 56%, against 74%. | THL, [*Hoitoon pääsy perusterveydenhuollossa 2025*](https://thl.fi/data-ja-tilastot/hoitoon-paasy/perusterveydenhuolto) (Tilastoraportti 20/2026, 3 Jun 2026) and its [press release](https://thl.fi/-/potilaat-joutuvat-odottamaan-hoitoon-paasya-perusterveydenhuoltoon-entista-pidempaan-jonot-erikoissairaanhoitoon-ovat-lyhentyneet) | Verified 2026-11-14 from THL's web pages. National only: the pages say access varied by region but give no county values. The clock starts at the care-need assessment, not first contact. Data is mostly unaudited. |
| Occupational health care is fast and health centres are slow. For lymphoma, symptoms to treatment took a median of 127 days via a health-centre appointment, against 76 days via private or occupational care. | Roadmap p. 11; [Kuitunen et al. 2026](https://doi.org/10.1002/cam4.71920) (probably the study the Roadmap cites) | Verified 2026-11-14. Lymphoma, 160 patients, not lung cancer. Details in [IDEAS.md](IDEAS.md#route-to-diagnosis-evidence-searched-2026-11-14). |
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
  - These were mass-media campaigns. Targeted outreach is covered in [Does inviting a risk group find lung cancer earlier?](#does-inviting-a-risk-group-find-lung-cancer-earlier) **No study of a symptom survey alone has shown earlier stage. This is still our biggest evidence gap.**
- **Speed versus survival.** Lung cancer shows a "waiting time paradox": the sickest patients are diagnosed fastest and still do worst, so studies are mixed. [Cancer Epidemiology 2015](https://core.ac.uk/download/77409558.pdf) For stage I–II disease, waiting more than four weeks from diagnosis to surgery was associated with worse survival. [J Thorac Dis](https://jtd.amegroups.org/article/view/104706/html) Benefit is most plausible for early-stage patients with mild symptoms, the group the survey targets.

#### Share of fast-lane CT scans that find lung cancer

Searched 2026-11-14. This sets `cancerYieldPerCt` and `healthCentreYield` in `src/lib/simulation.ts` and therefore the CT load. No Nordic source gives a national lung-specific figure, so the table uses the closest published pathways.

| Pathway | Lung cancer found | Source | Type |
| --- | --- | --- | --- |
| Denmark, GP referral to the lung cancer fast track (cancer patient pathway), Aarhus, 2012 | 37 of 493 referrals (7.5%): 8.9% in the direct-CT arm, 6.1% in the chest-physician arm | Guldbrandt et al., "Reduced specialist time with direct computed tomography for suspected lung cancer in primary care", *Dan Med J* 2013;60(12), Table 2 ([article page](https://ugeskriftet.dk/dmj/reduced-specialist-time-direct-computed-tomography-suspected-lung-cancer-primary-care)) | Verified 2026-11-14. Single centre. Ratio computed by us. |
| Denmark, GPs' direct low-dose CT for symptoms that did **not** meet fast-track criteria | 15 of 648 referred (2.3%); 60% of those cancers were localised | Guldbrandt, PhD thesis summary, *Dan Med J* 2015 Mar, PMID 25748876 ([abstract](https://read.qxmd.com/read/25748876/the-effect-of-direct-referral-for-fast-ct-scan-in-early-lung-cancer-detection-in-general-practice-a-clinical-cluster-randomised-trial)) | Verified from the abstract only. The trial found no effect on stage or time to diagnosis. **Closest analogue to a survey-positive person.** |
| England, urgent suspected lung cancer referral (two-week wait) | Conversion 26.4% in 2009/10 and 15.3% in 2019/20 | Smith et al., *Br J Gen Pract* 2022;72(714):34–37, Table 1, [doi:10.3399/bjgp22X718217](https://doi.org/10.3399/bjgp22X718217) | Verified 2026-11-14. Referrals usually follow an abnormal chest X-ray, so the yield is higher than for symptoms alone. |
| England, Targeted Lung Health Check: LDCT for high-risk people without a symptom requirement | 2,748 lung cancers, 1.7% of people with an initial CT | Ipsos and Strategy Unit, *TLHC Programme – Final evaluation report*, Nov 2024, executive summary ([Ipsos page](https://www.ipsos.com/en-uk/evaluation-targeted-lung-health-check-programme-nhs-england)) | Verified 2026-11-14 |
| Sweden, all standardised care pathways (SVF) combined | About 30% of people investigated have cancer; the share varies strongly by diagnosis | [RCC, Antal patienter i SVF](https://cancercentrum.se/utvecklingsarbeteutbildning/statistikrapporter/svfstatistik/antalpatienterisvf.7780.html) (updated 14 Sep 2026) | Verified for all SVF. **Lung-specific value unknown:** it is only in an interactive chart. |
| Sweden and Norway, lung pathway entry | Entry requires a radiological finding suspicious of malignancy (Norway), so these pathways start after imaging and are not comparable | [Helsedirektoratet, begrunnet mistanke](https://www.helsedirektoratet.no/nasjonale-forlop/lungekreft/inngang-til-pakkeforlop-for-lungekreft/begrunnet-mistanke-kriterier-for-henvisning-til-pakkeforlop) | Norway: from a search result, page not opened. Sweden: assumption, not checked. |

**What this means for the simulation** (the `src/` owner decides; this session did not edit code):
- `cancerYieldPerCt` (survey-positive people sent to CT): the current base of 2% matches the Danish direct-CT figure (2.3%). A cautious value of 1.7% matches TLHC screening. An optimistic value up to 7.5% fits only if a physician triages before CT, as in the Danish fast track. The current optimistic value of 4% sits inside that range.
- `healthCentreYield` (symptomatic patients put on the fast lane at a health centre): the current 10% sits between the Danish fast track (7.5%) and English urgent referrals (15.3%). Label it as Danish and English data, not Finnish.
- CT load per cancer found is roughly 1 ÷ yield: about 43 scans per cancer at 2.3%, and 13 at 7.5%.

#### Does inviting a risk group find lung cancer earlier?

Searched 2026-11-14.

- **Yes for CT invitations, with a stage shift.** England's Targeted Lung Health Check invites ever-smokers aged 55–74 to a risk assessment, and high-risk people get low-dose CT. Source: Ipsos and Strategy Unit final evaluation, Nov 2024, verified 2026-11-14.
  - April 2019 to March 2024: 1.22 million invitations, 324,000 health checks (44% uptake) and 163,000 initial scans (executive summary).
  - 76% of the lung cancers it found were stage 1–2, excluding unstaged cancers (executive summary, footnote 7).
  - In pilot areas, the share of **all** lung cancers diagnosed at stage 1–2 rose from 25% to 39% between 2019 and 2022, with no clear change in similar non-pilot areas. An estimated 781 extra stage 1–2 cancers were found (programme outcomes, p. 6).
  - No mortality effect yet. The evaluation says this is expected at this timescale.
  - **Deprivation:** uptake was 34% in the most deprived quintile against 40% elsewhere. People there who did attend a CT had a higher lung cancer yield, 1.81% against 1.54%, with a similar early-stage share, 64.4% against 65.3% of all cancers including unstaged (section 6.9, Table 6.11, pp. 78–79).
- **Manchester pilot.** Crosbie et al., *Thorax* 2019;74(4):405–409, [doi:10.1136/thoraxjnl-2017-211377](https://doi.org/10.1136/thoraxjnl-2017-211377), accepted manuscript on [White Rose](https://eprints.whiterose.ac.uk/id/eprint/139545/). Verified 2026-11-14.
  - Health checks were held next to shopping centres in deprived areas. 75% of the 2,541 attendees lived in the most deprived quintile.
  - Of 1,384 people scanned, 3% had lung cancer. 80% of cancers were stage I–II, against 31% in the same area in the year before the pilot. Curative-intent treatment was offered for 89%.
- **A symptom-focused intervention alone has not shown earlier diagnosis.** The CHEST Australia trial: Emery et al., *Thorax* 2019;74:362–370, [doi:10.1136/thoraxjnl-2018-212506](https://doi.org/10.1136/thoraxjnl-2018-212506), verified 2026-11-14 from the [accepted manuscript](https://minerva-access.unimelb.edu.au/server/api/core/bitstreams/8ef17669-1d3d-5ae7-8961-38588b8d187a/content).
  - 551 smokers aged 55 or over with at least 20 pack-years. GPs delivered a self-help manual and reminders to seek help for respiratory symptoms.
  - Respiratory consultations rose 40% (rate ratio 1.40, 95% CI 1.08–1.82).
  - Time to first consultation fell by a non-significant mean of 14 days.
  - Only 3 participants (0.54%) were diagnosed with lung cancer in 12 months, so the trial could not test stage or diagnosis time.
- **Postal symptom questionnaire to high-risk patients.** Wagland et al., *PLoS ONE* 2016 ([PMC5096702](https://pmc.ncbi.nlm.nih.gov/articles/PMC5096702/)). **Assumption, unverified:** PMC blocked our fetch, and these figures come from a search-result summary.
  - Eight English practices invited 4,622 people aged 50 or over with a smoking history. 25.3% responded.
  - 53.4% of respondents reported at least one of nine lung cancer symptoms.
  - Consultations rose in the three months after completing the questionnaire. No cancer or stage outcomes.
- **Conclusion for the pitch.** Risk-group outreach is proven to shift stage when it ends in CT, for example TLHC. Symptom prompting raises consultations but has no stage evidence. Our design combines the two, since a positive survey leads to fast CT, so cite TLHC for "outreach plus imaging works" and present the survey arm as the part a pilot must measure. Response rates in comparable outreach: 25% (postal questionnaire, unverified) and 44% (TLHC invitations).

#### THL guidance 21/2016: where the clock starts

- **Verified 2026-11-14:** THL's monitoring of access to cancer care uses two measurement points: the referral arriving in specialist care and the first treatment procedure. The register data does not include public primary-care or private outpatient visits. Source: Järvelin et al., "Kohti luotettavaa syövän hoitoon pääsyn seurantaa", *Lääkärilehti* 45/2019;74:2581–2588 ([article](https://www.laakarilehti.fi/tieteessa/alkuperaistutkimukset/kohti-luotettavaa-syovan-hoitoon-paasyn-seurantaa-hilmon-ja-syoparekisterin-diagnoositietojen-vertailu/)), which describes the guidance.
- **Verified:** The Strategy's indicator "Potilaat pääsevät hoitoon tavoiteaikojen puitteissa" cites THL Ohjaus 21/2016 in a footnote without defining the times (Strategy p. 5). The Julkari record says the guidance has been in force since 1 Jan 2017 and that two annexes were added in 2025 ([Julkari](https://www.julkari.fi/items/0424a55a-f159-406f-8883-5dfdad4d6772)).
- **Unknown:** The numeric target times. The guidance PDF itself could not be read: the Julkari download served a login page to our fetch. A search snippet mentioned six weeks from referral arrival to first treatment, which is **unverified**.
- **Consequence:** the survey and the primary-care fast lane act before the clock starts. This indicator can at most show the specialist-care part of the fast lane. Keep five-year survival as the Goal 3 link.

#### Kuittinen lung cancer delay study

- **Unknown:** No published abstract or poster was found in searches on 2026-11-14. Everything known comes from the [Yle MOT article](https://yle.fi/a/74-20251023): about 155 days from symptoms to treatment, broken into more than 50 days before seeking care, 41 days in primary care and 58 days in specialist care. There is **no breakdown by first-contact route** (health centre, occupational or private). The lymphoma study (Kuitunen et al. 2026) remains our only Finnish route comparison.

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
  - share of fast-lane patients who turn out to have cancer. Published ranges are in [Share of fast-lane CT scans that find lung cancer](#share-of-fast-lane-ct-scans-that-find-lung-cancer).
  - target days to physician and to CT
  - reserved slots per week.
- Current pathway: primary-care wait about 14 days nationally (*Acta Oncologica* 2025) plus the CT queue. Mark this as a national estimate if no county figure exists. THL's 2025 figures say only 59% of adults' non-urgent health-centre physician visits happened within 14 days of the care-need assessment, so 14 days is a typical wait, not a worst case. THL's web pages give no county values; its reporting dashboard was not checked.
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
- ~~What share of fast-lane patients turn out to have cancer in the Nordic package pathways?~~ **Answered 2026-11-14:** Danish GP fast-track referrals 7.5%, Danish direct GP low-dose CT 2.3%, English urgent referrals 15.3%. No national Nordic lung figure was found. See [the yield table](#share-of-fast-lane-ct-scans-that-find-lung-cancer).
- ~~Is there direct evidence that a targeted symptom survey or risk-group invitation finds lung cancer earlier?~~ **Partly answered 2026-11-14:** risk-group invitation to CT shifts stage (TLHC 76% early stage, Manchester 80%). Symptom prompting alone raised consultations but has no stage evidence (CHEST Australia). See [Does inviting a risk group find lung cancer earlier?](#does-inviting-a-risk-group-find-lung-cancer-earlier)
- Response rate assumption, and who does not answer (equity). Benchmarks: 44% TLHC uptake (34% in the most deprived quintile), and 25% for a postal symptom questionnaire (Wagland 2016, unverified).
- County-level data: Cancer Registry figures and smoking prevalence. ~~The Syöpäjärjestöt report.~~ **Found 2026-11-14:** curative treatment by county is in [IDEAS.md](IDEAS.md#lung-cancer-quality-report-20192023-by-county-read-2026-11-14). Stage by county is not published because stage is missing for 47.7% of patients.
- ~~THL 21/2016: where does the target-time clock start?~~ **Answered 2026-11-14:** at the referral arriving in specialist care. The numeric targets are still **unknown** because the PDF was not readable. See [THL guidance 21/2016](#thl-guidance-212016-where-the-clock-starts).
- Health-centre access by county (7- and 14-day shares): **unknown.** THL's pages give national figures only. Next step: THL's reporting dashboard or Sotkanet.
- Kuittinen lung cancer delay study: no publication found. Ask mentors whether it has data by first-contact route.
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
