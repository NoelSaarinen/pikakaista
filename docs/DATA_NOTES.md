# County data notes

Updated 2026-11-14. Patrik owns data, so the team should review this before merging. All figures below were retrieved on 2026-11-14.

[`src/data/counties.json`](../src/data/counties.json) now covers all 21 wellbeing services counties plus Helsinki. Ahvenanmaa is left out because it is not a wellbeing services county. Pirkanmaa, Pohjois-Savo and Lappi stay first, so the demo still opens on Pirkanmaa. The rest follow the official county code order.

`scripts/build-county-data.mjs` computes every value from the snapshots in [`src/data/raw/`](../src/data/raw/). Nothing is typed in by hand.

## What is real and what is not

| Field | Status | Source (`source_id`) | Definition | Year |
| --- | --- | --- | --- | --- |
| `population_55_80` | **Real** | Statistics Finland StatFin 11re (`statfin-11re`) | Residents aged 55–80 on 31 Dec, both sexes. Municipal figures are summed to counties with the Statistics Finland 2026 municipality key. | 2025 |
| `ever_smoker_share` | **Real number, proxy definition** (`is_estimate: true`) | THL Sotkanet 4404, from the Healthy Finland survey (`thl-sotkanet-4404`) | Share of **daily smokers aged 20 or over**. This is not the ever-smoker share aged 55–80. See below. | 2024 |
| `lung_cancer_cases_per_year` | **Real** | Finnish Cancer Registry statistics app (`syoparekisteri-lung`) | Mean yearly new cancers of the lung and trachea (ICD-10 C33–C34) in 2020–2024, both sexes. County = home municipality in the year of diagnosis. | 2020–2024 |
| `occupational_health_doctor_visits_per_1000_aged_15_64` (new, extra) | **Real number, proxy for coverage** | THL Sotkanet 2371 (`thl-sotkanet-2371`) | Occupational health doctor visits per 1,000 residents aged 15–64. This measures use, not coverage. | 2025 |
| `in_ldct_pilot` | **Still mock** | `mock` | No public list of the lung cancer screening pilot counties was checked. | — |

The new extra field is not in `County` in `src/lib/types.ts`, and nothing in the app reads it yet. It is plain JSON, so no type change was needed.

National reference values from the same snapshots:
- 1,741,258 residents aged 55–80 (2025)
- 9.1% daily smokers aged 20 or over (2024)
- 2,994 lung cancers per year (mean of 2020–2024)
- 2,049 occupational health doctor visits per 1,000 aged 15–64 (2025)

## Choices and caveats

**Population.** StatFin publishes ages by single year only for municipalities ([table 11re](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__vaerak/11re.px/)). The build sums municipal figures to counties with the [Statistics Finland municipality → county key 2026](https://stat.fi/fi/luokitukset/corrmaps/kunta_1_20260101%23hyvinvointialue_1_20260101/). It then checks the result:
- Each county's total population must equal the county total published in StatFin 11ra. All 23 areas match exactly.
- The sum of the 55–80 figures must equal the national figure.

**Smoking. This needs a team decision.**
- Verified: Sotkanet's regional smoking indicators all measure current daily smoking. They are 4404 (aged 20+), 4405 (20–64), 4406 (65+) and 4407 (75+). The survey question is "Do you currently smoke (cigarettes, cigars or a pipe)?", and only "yes, daily" counts.
- Not found: no regional indicator for ever-smokers or former smokers.
- Chosen: 4404 (aged 20+), because it is one published number that covers the whole 55–80 group. A mix of 4405 and 4406 weighted by population would be closer in age but would add our own calculation.
- Impact: county values range from 6.8% (Helsinki) to 12.5% (Vantaa and Kerava, Satakunta), against the mock value of 40%. The simulation's risk group falls about five-fold. For Pirkanmaa, the base scenario drops from about 32,000 people to 5,862.
- The slider "Riskiryhmään kuuluvien osuus tupakoineista" still assumes the share applies to ever-smokers. Applied to daily smokers, the true share with 20+ pack-years is probably higher. The team should either relabel the field and slider or find an ever-smoker figure.
- **Update 2026-11-14:** the simulation has a new slider, `formerPerCurrentSmoker` ("Entisiä tupakoitsijoita yhtä nykyistä kohden"). It adds former smokers to the risk group as a multiple of current daily smokers.
  - Risk group = population 55–80 × daily-smoker share × (1 + ratio) × pack-year share.
  - The default is 0, so the numbers stay as they were until the team decides the risk group.
  - The pack-year slider is relabelled "osuus tupakoitsijoista".
  - A national former-smoker figure (FinTerveys 2017 or Healthy Finland) was not found in a quick search.
- Survey noise: county values move by up to about 4 percentage points between 2022 and 2024. Etelä-Savo went from 11.5% to 7.2%, and Kanta-Häme from 13.9% to 10.2%. Each note also gives the 2022 value.

**Lung cancer.**
- The [registry's statistics app](https://tilastot.syoparekisteri.fi/syovat/) has no open API, and syoparekisteri.fi sits behind a bot check. The app's table view was therefore read in the browser and copied unchanged into `src/data/raw/syoparekisteri-lung-c33-c34.json`. The snapshot lists the exact selections.
- Check: the counties add up to the national total within 0–3 cases a year. The gap is cases with no known county.
- Why a five-year mean: single years swing a lot. Pohjanmaa had 75 cases in 2023 and 117 in 2024, and Lappi had 141 and 109.
- 2024 is the latest year in the registry's final statistics. The app also offers preliminary 2025 figures, which were not used.

**Occupational health.** The brief asked for Kela coverage by region.
- Kela's statistics on occupational health exist, but a regional coverage table was not found in the time available. The Kela release page found by search returned "page not found".
- Sotkanet indicator 2371 is used as a stand-in. It comes from THL primary care statistics, covers 2025, and counts occupational health doctor visits per 1,000 residents aged 15–64.
- Values range from 1,217 (Keski-Pohjanmaa) and 1,219 (Pohjanmaa) to 2,290 (Helsinki). That suggests the "fast door" may be about half as used in some regions. **This is unverified as a coverage measure.**
- THL notes gaps in the Helsinki, Vantaa and Kerava data, so those two counties have `is_estimate: true`.

## Gaps and next steps

- **Ever-smoker share aged 55–80.** No regional figure was found. The Healthy Finland report or the FinTerveys 2017 report may give a national ever-smoker or former-smoker share by age. One option is a national ratio of ever-smokers to daily smokers, labelled as an assumption. Unverified.
- **Lung cancer screening pilot counties (`in_ldct_pilot`).** Still mock.
  - Roadmap p. 46 (action 2.3.4, read 2026-11-14): a randomised lung cancer screening pilot study started in early 2026 in Helsinki and eight wellbeing services counties.
  - In 2026–2028 the pilot is planned to expand regionally and invite the target population set by the EU recommendation.
  - The roadmap does not name the counties or give invitation criteria. Ask the mentors.
  - Position the survey so that it does not overlap the screening pilot.
- **Kela occupational health coverage by region.** Not found. Try Kelasto's occupational health reports, or ask Kela or the mentors.
- **Stage at diagnosis by county.** The registry app offers a "Syövän levinneisyys (2020-2024)" view. If it works with the county filter, it could back the claim that 65–70% are found late with county data. Not fetched.

## How to rebuild

```bash
npm run data:counties
```

That command builds from the committed snapshots without any network. Run `node scripts/build-county-data.mjs --fetch` to refresh the StatFin and Sotkanet snapshots from their APIs first. The Cancer Registry snapshot must be updated by hand. The build stops with an error if a county is missing a value or a cross-check fails. `src/data/counties.test.ts` checks that every value has a known source, a year, an estimate flag and a note.

## Survey languages for the risk group (verified 2026-11-14)

Mother tongue of 55–79-year-olds at the end of 2025, from [StatFin 11rl](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__vaerak/11rl.px/) (population register; registered mother tongue only, so Sámi is undercounted).

| Languages offered | Share of 55–79-year-olds reached, Finland | Lapland |
| --- | ---: | ---: |
| Finnish | 89.8 % | 97.0 % |
| + Swedish | 94.6 % | 97.2 % |
| + Sámi | 94.6 % | 98.0 % |
| + Russian, Estonian | 97.0 % | 98.7 % |
| + Ukrainian, English, Arabic | 97.9 % | 99.2 % |

- **Whole country:** 1 375 463 people aged 55–79, of whom 73 611 (5.4 %) have a foreign mother tongue. The largest groups are Russian 21 265, Estonian 11 043, Ukrainian 4 545, English 4 003 and Arabic 3 960. Thai, Chinese, Somali, Kurdish and Farsi follow, each 1 600–1 900.
- **Lapland:** 49 810 people aged 55–79, of whom 994 (2.0 %) have a foreign mother tongue. Sámi is registered for 406 of the 494 Sámi speakers in this age group nationwide.
- **Legal note (unverified here):** Swedish is a national language, and the Sámi Language Act gives language rights in the Sámi homeland in northern Lapland. Check the exact obligations before the pitch.
- **In the demo (2026-11-14):** the respondent survey has a language picker for Finnish, Swedish, Northern Sámi, Russian, Estonian, Ukrainian, English and Arabic (right-to-left). Texts are in [`src/lib/i18n/survey-text.ts`](../src/lib/i18n/survey-text.ts). Only labels change; stored answer values stay the same, so Delun's rules are untouched. The response records the language, and the physician's AI summary translates free text. **All translations are drafts made with AI help** and need review by a native speaker with health-care background. The Sámi version is partial and falls back to Finnish in the PLCOm2012 section. The nurse checklist stays in Finnish.
- **Languages per region (2026-11-14):** the survey offers languages per region from [`src/data/survey_languages.json`](../src/data/survey_languages.json) (StatFin 11rl, 55–79-year-olds by maakunta, 2025). Finnish and Swedish always come first or second; other translated languages are listed by local size when at least 10 people in the age group speak them, and the rest sit behind "Muut kielet". Untranslated languages with at least 50 speakers are named so the region can arrange a nurse's call with an interpreter. The five Uusimaa counties share the Uusimaa figures. Coverage by translated languages: Lapland 99.2 % (Sámi second), Ostrobothnia 97.4 % (Swedish first), Uusimaa 95.7 % (Somali 1 617, Chinese 1 277 and Farsi 991 need interpreters). Logic: [`src/lib/i18n/region-languages.ts`](../src/lib/i18n/region-languages.ts).
