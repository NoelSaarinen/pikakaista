# Idea backlog

Add ideas as they come up. Shortlist by verified challenge fit, access to dependencies, and the time needed to show the core result live.

| Idea | Challenge | Complexity | Feasibility by deadline | Status |
| --- | --- | --- | --- | --- |
| [Two Doors + Symptom Clock](#recommended-combination) | Equal Care Across Finland | Medium | Good if mentors confirm usable access data | Recommended |
| [Two Doors](#1-two-doors) | Equal Care Across Finland | Medium | Good | Proposed |
| [Pilot Map](#2-pilot-map) | Equal Care Across Finland | Medium | Good, relies on public registry data | Proposed, fallback |
| [Symptom Clock](#3-symptom-clock) | Equal Care Across Finland | Low–medium | Good, demo runs on synthetic data | Proposed |
| [Distance Tax](#4-distance-tax) | Equal Care Across Finland | Medium | Good, open geodata | Proposed |
| [Nordic Gap](#5-nordic-gap) | Equal Care Across Finland | Medium | Depends on stage data | Proposed |

## Equal Care Across Finland

Challenge brief, judging weights and minimum requirements: [CHALLENGES.md](CHALLENGES.md#verified-participant-briefs). A short summary in Finnish for the team: [SYOPAHAASTE_IDEOINTI.md](SYOPAHAASTE_IDEOINTI.md).

### Source findings

Verified 2026-11-13 from the AstraZeneca resource PDFs: the [national cancer strategy 2026–2035](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_2026_2035_FINAL.pdf) ("Strategy") and its [implementation roadmap 2026–2031](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf) ("Roadmap"). Page numbers are the printed page numbers.

**Goal 3 indicators** (*Varmistetaan yhdenvertainen ja vaikuttava syövänhoito*, Strategy p. 5)

- Five-year relative survival for poor-prognosis cancers reaches the Nordic level (average of Sweden and Norway). From the 2023 NORDCAN level, that means +14 percentage points for lung, +6 for pancreas and +14 for liver cancer.
- Cancer mortality falls by 10%. It is currently 13,300 deaths a year.
- Patients start treatment within target times, per THL guidance 21/2016 on monitoring access to cancer care.
- Sub-goal 3.1 also measures whether national targets and key effectiveness indicators are defined for agreed cancers (Strategy p. 33). Sub-goal 3.2 measures whether reliable information on regional differences in diagnostic and treatment practices is available (Strategy p. 36).

**Gaps the documents name themselves**

- Clinical cancer notifications that include stage at diagnosis cover only about 40% of cases (Strategy p. 30).
- Time from first symptom to diagnosis is not collected systematically (Strategy p. 30).
- Cancer-specific target access times are not defined yet. The Roadmap plans them for five cancers in 2026–2028 (Roadmap p. 57).
- Occupational health care is well resourced with fast access, while public health centres are under-resourced. An unpublished lymphoma study found diagnosis takes twice as long when a patient with symptoms goes to public healthcare instead of private providers (Roadmap p. 11).
- About a third of people diagnosed with cancer are of working age (Strategy p. 6). Most patients therefore have no occupational health care.
- Outcomes are worse for patients living more than 50 km from the treatment unit, and palliative radiotherapy is used less beyond 100 km. Some people live more than 400 km from a central hospital and more than 700 km from a university hospital (Roadmap p. 13).

**Planned national actions a demo can plug into**

- Action 2.5.2 defines standardized referral criteria and symptom-based pathways modelled on Denmark's *Kræftpakkeforløb*, Sweden's *SVF* and Norway's *Pakkeforløp*. In 2026–2028 they cover at least the five most common cancers and are piloted in wellbeing services counties (Roadmap pp. 52–53).
- Action 3.1.2 adds national pathway descriptions and cancer-specific access times for five cancers in 2026–2028 (Roadmap p. 57).
- Action 3.5.3 funds digital care pathways and AI tools with €1.14M and runs limited pilots in some counties in 2026–2028 (Roadmap p. 74).

**Team fit** (reported in chat 2026-11-13): The team is Finnish-speaking, with two Information Networks students, one medical student and one electrical engineering student. Members are strong AI-tool users without deep technical experience. Joel's web stack is in [TEAM.md](TEAM.md).

### Recommended combination

Tell one story with **Two Doors** and **Symptom Clock**:

1. **Gap:** the highest-risk patients use the slowest entry point to care.
2. **Where it emerges:** between the first primary-care contact and the referral.
3. **What to do:** a suspected-cancer fast lane in health centres.
4. **How to measure it:** run Symptom Clock in the pilot county.

This covers all five judging criteria, uses the medical student's knowledge for alarm symptoms and triage, and gives a county something it can start immediately. If mentors say there is no regional data on public versus private routes to diagnosis, switch the headline to **Pilot Map**, where the data is more certain.

### 1. Two Doors

- **Problem** Occupational health is fast and health centres are slow (Roadmap p. 11). About two thirds of cancer patients are not of working age (Strategy p. 6), so the highest-risk group depends on the slow door.
- **Proposed solution** For each wellbeing services county, estimate how many expected cancer patients depend on public primary care and how slow that access is. Then simulate a suspected-cancer fast lane: nurse triage with standardized alarm symptoms and a direct GP referral to imaging or endoscopy.
- **Data** Cancer incidence by region from the Finnish Cancer Registry. Health-centre access times by county from THL. Age and employment structure from Statistics Finland, as an indirect proxy for occupational health coverage. Quotes from mentor interviews.
- **AI role** Writes a two-minute brief for each county. Every number links to its source.
- **Pathway stage** Detection and referral from primary to specialist care.
- **Estimated implementation complexity** Medium. The data joins are simple, but the simulation assumptions must be explicit and adjustable.
- **Main risks and assumptions to validate** The two-times finding comes from a single unpublished lymphoma study. Kela or THL may or may not publish occupational health coverage by county (unknown). Health-centre access times are not cancer-specific.
- **Feasibility within the hackathon** First demo: a county map plus a brief for one county. Fallback: one county analysed in depth.
- **Potential differentiation** Other teams will compare regions. This shows inequality inside a region, by entry route.

#### Route-to-diagnosis evidence (searched 2026-11-14)

- **Lymphoma: first contact and delay by route.** Kuitunen et al., "Socioeconomic Status and Access to Treatment in Diffuse Large B-Cell Lymphoma", *Cancer Medicine* 2026; 15:e71920, [doi:10.1002/cam4.71920](https://doi.org/10.1002/cam4.71920), open access. Prospective questionnaire plus patient records: 160 DLBCL patients, seven Finnish hospitals, October 2014 to March 2020. It is probably the "unpublished lymphoma study" behind Roadmap p. 11, since it comes from the same research group. **Unverified.**
  - **First contact** (156 patients with data, Table 1; we computed the shares):

    | First contact | Patients | Share |
    | --- | ---: | ---: |
    | Health-centre appointment | 48 | 31% |
    | Health-centre emergency | 39 | 25% |
    | Private care | 20 | 13% |
    | Occupational health | 19 | 12% |
    | Hospital emergency | 8 | 5% |
    | Other | 22 | 14% |

  - **Delay:** symptoms to treatment took a median of 127 days (mean 201) via a health-centre appointment, against 76 days (mean 126) via private or occupational care (Mann–Whitney p = 0.027).
  - **Who uses which route** (Table 3 and text):
    - Retirees were 56.3% of health-centre appointment users.
    - People over 70 were 43.8% of health-centre appointment users but 7.7% of private and occupational users.
    - No patient earning over €5,000 a month used public care.
  - **Where the gap opens.** Figure 1 gives cumulative mean days at each step. We read the values from the chart labels and assigned them to the two lines ourselves:

    | Step | Private or occupational | Health-centre appointment |
    | --- | ---: | ---: |
    | First contact | 42 | 72 |
    | Physician | 43 | 94 |
    | Referral | 77 | 147 |
    | Specialist appointment | 118 | 204 |
    | Treatment start | 123 | 207 |

    The largest differences are before first contact (+30 days), between first contact and the physician (+21) and between the physician and the referral (+19).
  - **Limits:**
    - The cancer is lymphoma, not lung cancer.
    - The compared groups are small (39 private or occupational patients against 48 health-centre appointment patients).
    - Patients reported their own symptom onset.
    - The data is from 2014–2020, before the wellbeing services counties, and has no breakdown by county.
    - Incyte funded the study.
- **Lung cancer delays (unpublished).** [Yle MOT](https://yle.fi/a/74-20251023) reports an ongoing study led by Outi Kuittinen (University of Eastern Finland) in Kuopio, Tampere, Turku and Rovaniemi. The article is dated 12 Oct; the page does not print the year, which is probably 2026.
  - Symptoms to treatment take about 155 days: more than 50 days before the patient seeks care, 41 days in primary care and 58 days in specialist care.
  - MOT gives totals of 107 days for Sweden and 67 days for Denmark.
  - The article has no breakdown by route.
- **Nurse first.** [University of Helsinki, 7 Nov 2025](https://www.helsinki.fi/fi/uutiset/terveys/miksi-suomessa-keuhkosyopaan-kuollaan-aiemmin-kuin-pohjoismaissa): a survey of 42 lung cancer professionals in 2023–2024. In Finland 40–60% of patients see a nurse first. The article gives no figures by route or region.
- **Occupational health coverage.** Työterveyslaitos, [*Työterveyshuolto Suomessa 2023*](https://www.ttl.fi/file-download/download/public/8733) (preliminary results, 26 Sep 2024): 2,084,752 personal clients, of whom 2,058,032 were wage earners. The slides have no regional breakdown. Kela's yearly occupational health statistic in Kelasto may have regional tables. **Not checked.**
- **Not found:** public data, by wellbeing services county, on the route to diagnosis for any cancer.

### 2. Pilot Map

- **Problem** The Roadmap pilots Nordic-style referral criteria in counties in 2026–2028 but does not say where to start (Roadmap pp. 52–53).
- **Proposed solution** Rank each county and cancer pair by expected benefit. Inputs are the survival gap to the national average, the mortality-to-incidence ratio as a proxy for late detection, and patient volume. For the top pairs, generate an implementation card: referral criteria, direct test routes and proposed target times based on the Nordic models.
- **Data** Finnish Cancer Registry statistics and NORDCAN. Both are listed in the AstraZeneca source list.
- **AI role** Drafts the implementation card from the Nordic pathway documents and the Finnish data, with citations.
- **Pathway stage** Referral and diagnosis.
- **Estimated implementation complexity** Medium.
- **Main risks and assumptions to validate** The mortality-to-incidence ratio is only a proxy. Small counties give noisy numbers.
- **Feasibility within the hackathon** First demo: a ranked table plus one implementation card. Fallback: a single cancer type.
- **Potential differentiation** Answers the decision counties have to make in the next two years.

### 3. Symptom Clock

- **Problem** Time from first symptom to diagnosis is not collected (Strategy p. 30).
- **Proposed solution** At the first oncology visit, the patient tells the pathway story in their own words. A language model turns it into a timeline using the Aarhus statement intervals: patient, primary care, referral, diagnostic and treatment intervals. A county view shows which interval is long.
- **Data** Synthetic demo stories only, clearly labelled. No patient data.
- **Pathway stage** Measures every stage.
- **Estimated implementation complexity** Low to medium.
- **Main risks and assumptions to validate** Insight is weak without real data, so pair it with Two Doors or Pilot Map.
- **Feasibility within the hackathon** First demo: one story turned into a timeline, then an aggregate view. Fallback: a structured form instead of free text.
- **Potential differentiation** Turns the challenge's data gap into the product. It is cheap to pilot in one county, which matches AstraZeneca's planned follow-up project.

### 4. Distance Tax

- **Problem** Outcomes worsen beyond 50 km and palliative radiotherapy use drops beyond 100 km (Roadmap p. 13).
- **Proposed solution** Map, by municipality, the expected cancer patients living beyond those distances from treatment units. Recommend which care to decentralize, such as remote follow-ups, monitoring oral cancer drugs in health centres and travel support, and simulate the trips saved.
- **Data** Treatment unit locations, population and road distances from open geodata, plus regional incidence.
- **Pathway stage** Treatment start and continuity.
- **Estimated implementation complexity** Medium. A good fit for the electrical engineering student.
- **Main risks and assumptions to validate** Distance alone does not show where in the pathway the delay arises.
- **Feasibility within the hackathon** First demo: a map plus three recommendations. Fallback: straight-line distances.
- **Potential differentiation** Concrete, local recommendations.

### 5. Nordic Gap

- **Problem** Lung cancer survival must rise 14 percentage points to reach the Nordic level (Strategy p. 5).
- **Proposed solution** By county, show how many deaths a year would be avoided at the Nordic survival level. Split the gap into late detection and treatment where stage data allows.
- **Data** NORDCAN and Finnish Cancer Registry data.
- **Pathway stage** Detection and treatment.
- **Estimated implementation complexity** Medium.
- **Main risks and assumptions to validate** Stage data covers only about 40% of cases (Strategy p. 30), so the split may not hold up.
- **Feasibility within the hackathon** First demo: one number per county. Fallback: a national number only.
- **Potential differentiation** Ties directly to a Goal 3 indicator, with one number a decision-maker can read in seconds.

### Scoring tactics

- Make every number clickable to its source and page. Data quality and transparency is worth 20%.
- The brief allows insights from AstraZeneca mentors as evidence. Interview them and cite quotes with name and date.
- Use funnel plots or confidence intervals so noise from small counties is not presented as a finding.
- Open with a two-minute view: one message and one action. Put the detail below.
- No cancer-specific target times exist yet. Proposing them, based on the Nordic models, is itself a concrete recommendation.

### Unknowns to verify with mentors

- Is there regional data on the route to diagnosis, public versus private or occupational health? A public search on 2026-11-14 found none (see [Route-to-diagnosis evidence](#route-to-diagnosis-evidence-searched-2026-11-14)). Ask whether the Kuittinen lung cancer study has route data.
- What target times does THL guidance 21/2016 set? We have not read it.
- What regional level does the Finnish Cancer Registry statistics app use: wellbeing services county or hospital district? Does it include stage?
- Does Kela publish occupational health coverage by region?

## Idea template

- **Problem**
- **Proposed solution**
- **Technical architecture**
- **Required hardware and software**
- **Relevant challenges** ([briefs](CHALLENGES.md))
- **Estimated implementation complexity** (low / medium / high, with reason)
- **Main risks and assumptions to validate**
- **Feasibility within the hackathon** (first working demo and a fallback)
- **Potential differentiation**
