# Goal 3 lung cancer indicators by region

Data retrieved and checked on 2026-11-14. The machine-readable figures are in [goal3_regional.json](../src/data/goal3_regional.json). The demo does not use them yet. The team integrates them into the county view.

## Summary

- **Only Lappi is clearly worse than the national level.** Its age-standardised lung cancer mortality is 46.8 per 100,000 in 2020–2024 against 35.8 nationally, and 51.5 against 39.3 in 2015–2019. It is the only county above the national rate in both periods. That is about 110 deaths a year, roughly 26 a year more than the national rate would give (our estimate).
- **Lappi's excess is mostly more cases.** Its lung cancer incidence is also the highest: 58.3 against 47.0 per 100,000. The mortality gap therefore reflects smoking history at least as much as care. These figures do not show whether Lappi's care is slower.
- **Itä-Uusimaa, Kymenlaakso and Pohjois-Pohjanmaa** are above the national rate in 2020–2024 only, and only just. Treat them as "watch", not as findings.
- **Pirkanmaa, Pohjois-Savo, Keski-Suomi and Keski-Pohjanmaa** are below the national rate in both periods.
- **Survival is not published by wellbeing services county.** The Finnish Cancer Registry publishes five-year relative survival only for the five cooperation areas (yhteistyöalue). They range from 19.4% (Pohjois-Suomi) to 21.8% (Länsi-Suomi), against 20.5% nationally. That spread is within the likely noise, so the areas cannot be ranked.
- **Finland vs the Nordic level (NORDCAN, 2020–2024):** the five-year survival gap to the mean of Norway and Sweden is 13.2 percentage points for men and 7.9 for women. The Strategy's target of more than +14 percentage points is close to the men's gap. We could not reproduce it exactly (see [Finland vs the Nordic level](#finland-vs-the-nordic-level)).

## Goal 3 indicators

Quoted from the [National Cancer Strategy 2026–2035](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_2026_2035_FINAL.pdf), p. 5, under *Varmistetaan yhdenvertainen ja vaikuttava syövänhoito*. Re-read from the PDF on 2026-11-14.

- *"Huonoennusteisten syöpien 5 vuoden elossaololuvut saavuttavat pohjoismaisen tason"*. Footnote: five-year relative survival rises *"Nordcan-tilastossa esitetystä vuoden 2023 tasosta yli 14 prosenttiyksikköä keuhkosyövässä"*, and the Nordic level means the mean of Sweden and Norway.
- *"Syöpäkuolleisuus pienenee 10 % (nykyisin 13 300 henkilöä vuodessa)"*. Lung cancer causes about one cancer death in six: 2,302 of 13,424 cancer deaths in 2025 (Statistics Finland, C32–C34 against C00–C97).
- The same page also lists, under equity, that regional and socioeconomic differences in cancer incidence, care and mortality are available to services and used to steer them.

This file covers the first two. The third Goal 3 indicator, treatment start within target times, is not covered.

## Indicators, sources and regional level

| Indicator in the JSON | Definition | Source | Regional level | Years |
| --- | --- | --- | --- | --- |
| `lung_cancer_deaths_per_year` | Deaths from lung and tracheal cancer (C33–C34), mean of five years. `count` holds the five-year total. | [Finnish Cancer Registry statistics app](https://tilastot.syoparekisteri.fi/syovat/), mortality | Wellbeing services county (21 counties, Helsinki and Åland) | 2020–2024, also 2015–2019 |
| `lung_cancer_mortality_asr` | Deaths per 100,000, age-standardised to Finland's 2014 population. Deaths are assigned to the home municipality in the year of death. | Same | Same | 2020–2024 and 2015–2019 |
| `lung_cancer_cases_per_year`, `lung_cancer_incidence_asr` | New C33–C34 cases, mean of five years, and age-standardised incidence (Finland 2014) | Same app, incidence | Same | 2020–2024 and 2015–2019 |
| `deaths_c32_c34_statfin_per_year` | Deaths from larynx, trachea and lung cancer (C32–C34), mean of 2021–2025, with yearly `series` for 2016–2025 | [Statistics Finland table 13u5](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__ksyyt/13u5.px/) | Same | 2016–2025 |
| `survival_relative_5y` | Five-year age-standardised relative survival, both sexes | Cancer Registry app, survival | **Cooperation area only**: five areas, the former university-hospital catchment areas, plus Åland | 2022–2024 |
| `nordcan_survival_5y` | Five-year age-standardised relative survival by sex for Finland, Norway and Sweden | [NORDCAN 2.0](https://nordcan.iarc.who.int/en/dataviz/survival?cancers=160&populations=246_578_752&sexes=1_2&survival=5), data version 9.6.1 (11.2026) | Country | 2015–2019 and 2020–2024 |

Derived fields are marked `is_estimate: true` and use `source_id: "team-calc"`: `mortality_signal`, `excess_deaths_per_year_vs_national_rate`, `mortality_incidence_ratio` and `survival_relative_5y_approx_halfwidth_pp`. The `ci95_low` and `ci95_high` on mortality rates are also our approximation; the registry publishes the rates without intervals.

The registry's C33–C34 counts exclude laryngeal cancer. Statistics Finland's time-series class 11 includes it (C32), so its counts are about 45 a year higher nationally (11,742 against 11,519 deaths in 2020–2024). Statistics Finland is used only as a cross-check and for 2025, which the registry has not published yet.

## Mortality by wellbeing services county

Sorted by 2020–2024 mortality. Rates are per 100,000, age-standardised to Finland 2014. The interval is our approximate 95% interval. "Signal" compares each county's interval with the national rate in each period.

| County | Deaths a year, 2020–2024 | Mortality per 100,000, 2020–2024 (approx. 95% interval) | Mortality per 100,000, 2015–2019 | Signal vs national | Incidence per 100,000, 2020–2024 | Cooperation area |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| **Finland** | 2303.8 | 35.8 | 39.3 | – | 47.0 | – |
| Lappi | 110.0 | 46.8 (43.0–50.9) | 51.5 | **Higher in both periods** | 58.3 | Pohjois-Suomi |
| Ahvenanmaa | 16.0 | 44.2 (35.0–55.0) | 43.6 | Within noise | 48.8 | Ahvenanmaa |
| Itä-Uusimaa | 47.6 | 41.1 (36.1–46.7) | 41.3 | Higher in 2020–2024 only (borderline) | 50.6 | Etelä-Suomi |
| Kymenlaakso | 95.2 | 40.1 (36.6–43.9) | 41.7 | Higher in 2020–2024 only (borderline) | 51.2 | Etelä-Suomi |
| Kainuu | 41.4 | 39.9 (34.7–45.8) | 39.4 | Within noise | 46.3 | Pohjois-Suomi |
| Pohjois-Pohjanmaa | 164.8 | 38.6 (36.1–41.4) | 41.6 | Higher in 2020–2024 only (borderline) | 48.8 | Pohjois-Suomi |
| Satakunta | 113.2 | 38.4 (35.3–41.7) | 39.4 | Within noise | 48.8 | Länsi-Suomi |
| Vantaa ja Kerava | 88.0 | 37.9 (34.4–41.6) | 41.7 | Within noise | 49.9 | Etelä-Suomi |
| Kanta-Häme | 84.6 | 37.6 (34.1–41.3) | 40.1 | Within noise | 48.9 | Sisä-Suomi |
| Länsi-Uusimaa | 171.2 | 37.5 (35.0–40.1) | 39.8 | Within noise | 46.6 | Etelä-Suomi |
| Helsinki | 223.8 | 37.3 (35.2–39.6) | 43.8 | Within noise | 50.2 | Etelä-Suomi |
| Päijät-Häme | 103.8 | 36.9 (33.8–40.2) | 37.1 | Within noise | 48.9 | Etelä-Suomi |
| Pohjois-Karjala | 81.4 | 36.4 (33.0–40.2) | 39.3 | Within noise | 45.0 | Itä-Suomi |
| Varsinais-Suomi | 207.4 | 35.9 (33.7–38.1) | 42.2 | Within noise | 48.5 | Länsi-Suomi |
| Keski-Uusimaa | 72.4 | 35.0 (31.5–38.8) | 40.8 | Within noise | 47.8 | Etelä-Suomi |
| Etelä-Savo | 70.8 | 34.4 (30.9–38.1) | 34.7 | Within noise | 45.1 | Itä-Suomi |
| Pohjanmaa | 70.4 | 33.7 (30.3–37.4) | 38.7 | Within noise | 46.6 | Länsi-Suomi |
| Etelä-Karjala | 58.2 | 32.9 (29.2–36.9) | 36.7 | Within noise | 41.6 | Etelä-Suomi |
| Etelä-Pohjanmaa | 81.6 | 32.5 (29.5–35.9) | 33.4 | Within noise | 45.7 | Sisä-Suomi |
| Pirkanmaa | 187.2 | 31.6 (29.6–33.7) | 36.2 | Lower in both periods | 44.0 | Sisä-Suomi |
| Keski-Pohjanmaa | 24.4 | 29.7 (24.7–35.5) | 31.1 | Lower in both periods | 40.8 | Pohjois-Suomi |
| Keski-Suomi | 96.8 | 29.3 (26.7–32.0) | 32.9 | Lower in both periods | 38.7 | Itä-Suomi |
| Pohjois-Savo | 93.0 | 28.2 (25.7–30.9) | 34.6 | Lower in both periods | 38.9 | Itä-Suomi |

The national rate fell from 39.3 to 35.8 per 100,000 between the two periods, while the yearly number of deaths stayed at about 2,300. Age-standardisation removes the effect of an ageing population, so use the rate, not the count, to compare periods or counties.

## Survival by cooperation area

Five-year age-standardised relative survival for lung and tracheal cancer, both sexes, 2022–2024, from the Cancer Registry app. The registry shows no intervals. The half-width column is our rough estimate (see [Methods](#methods)).

| Cooperation area | Wellbeing services counties | Cases a year, 2020–2024 | 1-year survival | 5-year survival | Rough 95% half-width (our estimate) |
| --- | --- | ---: | ---: | ---: | ---: |
| **Finland** | All | 2994.4 | 45.97% | 20.54% | – |
| Etelä-Suomi (HUS catchment) | Itä-Uusimaa, Keski-Uusimaa, Länsi-Uusimaa, Vantaa ja Kerava, Päijät-Häme, Kymenlaakso, Etelä-Karjala, Helsinki | 1116.2 | 45.63% | 21.02% | ±2.0 pp |
| Itä-Suomi (KYS catchment) | Etelä-Savo, Pohjois-Savo, Pohjois-Karjala, Keski-Suomi | 442.2 | 43.34% | 20.37% | ±3.2 pp |
| Sisä-Suomi (TAYS catchment) | Kanta-Häme, Pirkanmaa, Etelä-Pohjanmaa | 480.0 | 47.55% | 19.45% | ±3.1 pp |
| Länsi-Suomi (TYKS catchment) | Varsinais-Suomi, Satakunta, Pohjanmaa | 515.6 | 48.22% | 21.81% | ±3.0 pp |
| Pohjois-Suomi (OYS catchment) | Keski-Pohjanmaa, Pohjois-Pohjanmaa, Kainuu, Lappi | 422.6 | 45.47% | 19.35% | ±3.3 pp |
| Ahvenanmaa (Åland) | Ahvenanmaa | 17.0 | 33.45% | not published | – |

The county membership of each area comes from the area codes in the registry app (for example, Päijät-Häme is in Etelä-Suomi and Etelä-Pohjanmaa in Sisä-Suomi). The university-hospital labels are our shorthand. In the JSON, each county's `survival_relative_5y` is `null` and points to its area. The area figure must not be shown as the county's own value.

## Finland vs the Nordic level

NORDCAN 2.0, data version 9.6.1 (11.2026), five-year age-standardised relative survival for lung cancer (C33–C34), with NORDCAN's 95% intervals. NORDCAN publishes survival by sex only.

| Period | Sex | Finland | Norway | Sweden | Nordic level (mean of Norway and Sweden) | Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 2015–2019 | Men | 17.4 (16.1–18.7) | 26.3 (25.0–27.6) | 24.8 (23.6–26.1) | 25.55 | 8.15 pp |
| 2015–2019 | Women | 26.1 (24.5–27.8) | 33.2 (31.9–34.5) | 32.7 (31.5–33.8) | 32.95 | 6.85 pp |
| 2020–2024 | Men | 17.9 (16.7–19.2) | 30.8 (29.4–32.3) | 31.3 (30.0–32.7) | 31.05 | **13.15 pp** |
| 2020–2024 | Women | 30.8 (29.1–32.5) | 38.4 (37.1–39.9) | 38.9 (37.7–40.1) | 38.65 | **7.85 pp** |

- **Strategy check.** The Strategy's "more than 14 percentage points from the 2023 NORDCAN level" is close to the current gap for men (13.2 pp) but well above the gap for women (7.9 pp). We could not reproduce the exact figure: NORDCAN gives no both-sexes survival, the Strategy does not say which diagnosis period its "2023 level" means, and NORDCAN now serves data version 9.6.1. **Unverified.**
- **The gap is growing for men.** Finnish men gained 0.5 points between the two periods, while Norway and Sweden gained 4.5 and 6.5.
- **Caveat.** NORDCAN warns that the Swedish registry does not follow back cancers known only from death certificates. That can make Swedish lung cancer survival too high, so NORDCAN recommends mortality rather than incidence for comparisons with Sweden. Norway does not have this problem.
- **Do not mix sources.** The Cancer Registry's national figure (20.54%, both sexes, 2022–2024) and NORDCAN's (17.9% men, 30.8% women, 2020–2024) use different periods and possibly different standard weights. Compare regions with the registry figure and Finland with the Nordics using NORDCAN.

## Small-county noise

- **Counts.** Åland has about 16 lung cancer deaths a year, Keski-Pohjanmaa 24, Kainuu 41 and Itä-Uusimaa 48. All other counties have more than 50.
- **Year-to-year swings** in Statistics Finland's yearly counts for 2016–2025: Keski-Pohjanmaa 15–34, Åland 8–20, Kainuu 34–55 and Itä-Uusimaa 34–64. A single year must never be compared between these counties. All rates here use five-year totals.
- **Intervals.** For a county with 100 deaths a year, the approximate 95% interval of the five-year rate is about ±9%. For Åland it is about ±22%. The method ignores extra variance from age weighting, so the true intervals are somewhat wider.
- **Many comparisons.** With 23 areas, about one area per period can cross the 95% line by chance. That is why only a difference seen in **both** five-year periods counts as a finding (`consistently_higher` or `consistently_lower`).
- **What is likely real:** Lappi's higher mortality and incidence (more than 500 deaths in each period, well clear of the national rate both times), and the lower rates in Pirkanmaa, Pohjois-Savo and Keski-Suomi. Keski-Pohjanmaa's low rate rests on small numbers.
- **What is not supported:** a ranking of the remaining counties, the "borderline" highs (Itä-Uusimaa only just clears the line), and any ranking of survival between cooperation areas.
- **Mortality is not a care-quality measure on its own.** It follows incidence, which reflects smoking decades ago. The ratio of mortality to incidence (`mortality_incidence_ratio`, national 0.762) is a crude proxy for case fatality. It is highest in Åland (0.905) and Kainuu (0.864), but both rest on small numbers, the ratio has no interval, and it must not be shown as survival.

## Methods

- **Means.** Five-year totals from the registry divided by five. Statistics Finland means are 2021–2025.
- **Approximate 95% interval for a rate.** Byar's approximation on the five-year death count *D*: lower = *D* (1 − 1/(9*D*) − 1.96/(3√*D*))³ and upper = (*D*+1) (1 − 1/(9(*D*+1)) + 1.96/(3√(*D*+1)))³. Both are divided by *D* and multiplied by the published age-standardised rate. This treats the rate as having the relative error of its total count.
- **Signal.** `consistently_higher` if the interval's lower end is above the national rate in both 2015–2019 and 2020–2024. `consistently_lower` mirrors it. `higher_latest_period_only` and `lower_latest_period_only` hold for 2020–2024 only. Otherwise the county is `not_distinguishable_from_national`.
- **Excess deaths** (only for `consistently_higher`): deaths a year × (1 − national rate ÷ county rate). For Lappi: 110 × (1 − 35.79 ÷ 46.79) = 25.9.
- **Survival half-width.** The registry gives no intervals. As a rough guide we took NORDCAN's 95% half-width for Finnish men in 2020–2024 (1.25 pp, assumed to rest on the registry's 8,901 male cases) and scaled it by √(8,901 ÷ *n*). Here *n* is three fifths of the area's 2020–2024 cases, because the registry's survival window is three years. This is an order of magnitude, not a registry figure.
- **Nordic level** is the mean of Norway and Sweden, as the Strategy defines it. The gap is that level minus Finland.

## Gaps and unknowns

- **Survival by wellbeing services county is not public** in the registry app, and there is no regional survival time series or interval. The app's help page does not state whether survival uses period or cohort analysis or which standard weights it uses (**unknown**).
- **Stage at diagnosis is national only** in the app. For 2020–2024, 54.1% of 14,972 lung cancers have unknown stage, 5.4% are localised and 40.4% are not localised. This is consistent with the Strategy's point that clinical notifications with stage cover only about 40% of cases (p. 30, as recorded in [IDEAS.md](IDEAS.md)).
- **Treatment-start times**, the third Goal 3 indicator, were not searched for here.
- **The registry app has no stable deep links.** Values were read from its table in a browser on 2026-11-14. Each source in the JSON lists the menu selections needed to reproduce them.
- **The registry has no 2025 mortality yet.** Statistics Finland's 2025 counts are in `deaths_c32_c34_statfin_per_year`.
- **Mock values in the demo.** `src/data/counties.json` uses placeholder `lung_cancer_cases_per_year` values of 330 (Pirkanmaa), 190 (Pohjois-Savo) and 130 (Lappi). The registry's 2020–2024 means are 259.6, 127.0 and 134.8. This file does not change them; replace them during integration.

## How to reproduce

- **Statistics Finland.** POST to `https://pxdata.stat.fi/PXWeb/api/v1/fi/StatFin/ksyyt/13u5.px` with all `alue_23_20260101` values, `kuolinsyyt_1_20210101` = `11` and `04-21`, `timeperiod_y` = 2011–2025, all `contentscode` values and `"response": {"format": "json-stat2"}`.
- **Finnish Cancer Registry.** Open [tilastot.syoparekisteri.fi/syovat](https://tilastot.syoparekisteri.fi/syovat/) and make the selections listed in the `table` field of `fcr-mortality`, `fcr-incidence` and `fcr-survival` in the JSON. Press *Näytä* and open *Taulukko*.
- **NORDCAN.** GET `https://canapi.iarc.who.int/api/nordcan/v2/961//survival/population/5/1_2/246_578_752/160/?&surv_period=5&age_surv=0&year_start=1967&year_end=2024`. Cancer 160 is lung, and populations 246, 578 and 752 are Finland, Norway and Sweden.
