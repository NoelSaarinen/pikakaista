# Tilastotuonti Patrikin demoon

Tiedosto [demo-tilastotuonti.json](demo-tilastotuonti.json) sisältää ne analytiikkasivun tilastot, jotka Patrikin demosta (`junctiondemosite`) puuttuivat 14.11.2026. Muoto on sama kuin demon tiedostossa `src/data/statistics-snapshot.json` (`version: 1`). Jokainen rivi on tarkistettu demon omalla `validateStatistic`-funktiolla, ja kaikki alueet ovat vertailukelpoisia koko maan rivin kanssa.

## Sisältö (24 aluetta: koko maa, 22 hyvinvointialuetta ja Ahvenanmaa)

| Tilasto | Tila | Lähde |
| --- | --- | --- |
| Keuhkosyöpätapaukset / 5 v (2020–2024) | Kaikki alueet | Syöpärekisterin tilastosovellus |
| Ilmaantuvuus, ikävakioitu (2020–2024) | Kaikki alueet | Sama |
| Kuolleisuus, ikävakioitu (2020–2024) ja 95 % väli | Kaikki alueet. Väli on tiimin likiarvo. | Sama |
| Viiden vuoden elossaolo (2022–2024) | Vain koko maa. Alueille N/A ("ei julkisesti saatavilla"). | Sama |
| Parantavan hoidon osuus (2019–2023) | Koko maa ja 22 aluetta. Ahvenanmaalle N/A. | Keuhkosyöpäraportti, taulukko 11 |
| Hoitoon 14 vuorokaudessa (2025) | Vain koko maa (59 %). Alueille N/A ("puuttuu"). | THL |

Kaikkien rivien tila on `manual` (käsin tuotu) ja tarkistuspäivä 2026-11-14. Väestöä ja tupakointia ei ole mukana, koska demo hakee ne itse.

## Käyttö

Patrik voi yhdistää tiedoston demon tilastoihin demon omalla funktiolla:

```ts
import extra from "./data/demo-tilastotuonti.json";
const data = mergeStatistics(mergeStatistics(undefined), extra);
```

Toinen tapa on yhdistää `regions`-osion rivit alueittain tiedostoon `statistics-snapshot.json`. Yksittäisen alueen voi tuoda myös asetusnäkymän JSON-tuonnilla (`{ "version": 1, "regionId": "Lappi", "statistics": { ... } }`).

## Oletukset ja niiden vertailukohdat

Demon oletukset (`assumptions` tiedostossa `src/lib/regional-data.ts`) ovat pelkkiä lukuja selitetekstin kanssa, eikä niille ole lähdekenttää. Siksi ne eivät ole tuontitiedostossa. Alla on vertailukohdat, joilla Patrik voi täydentää selitetekstit. 🇫🇮 = suomalainen, 🌍 = ulkomainen.

| Demon oletus | Arvo demossa | Vertailukohdat | Tyyppi |
| --- | ---: | --- | --- |
| `survey_response_rate` | 50 % | 🇫🇮 Suolistosyövän seulontaan osallistui 2024 kutsutuista 73,5 % (heikoimmilla alueilla alle 68 %). 🌍 Yorkshiren kutsuun vastasi 50,8 % tupakoineista 55–80-vuotiaista (kaksi muistutusta). 🌍 Englannin postitettuun oirekyselyyn 25,3 %. | Ulkomainen, lähin vertailukohta |
| `physician_review_rate` | 12 % | 🌍 Pelkkä pitkittynyt yskä on noin 6–9 %:lla tupakoineista (Ranska, Saksa). Hälytysoireita on useita, joten osuus on suurempi. | Osittain perusteltu |
| `ct_referral_rate` | 50 % | Ei dataa. 🇫🇮 Pirkanmaalla perusterveydenhuolto ottaa ensin röntgenin, ja TT tehdään erikoissairaanhoidossa. | Oletus |
| `target_physician_days` | 3 | 🌍 Tanskan pikakaista: sairaalaan kolmessa päivässä lähetteestä (Jensen 2017) | Tavoite ulkomaisen mallin mukaan |
| `target_ct_days_after_referral` | 7 | 🇫🇮 Pirkanmaa: lähete käsitellään 1–2 arkipäivässä, TT useimmiten viikon sisällä | Kotimainen |
| Syöpä löytyy TT-kuvauksista (ei demossa) | – | 🇫🇮 Oulun TT-seulonta 1,0 % ensimmäisellä kierroksella (oireettomat). 🌍 Tanska: yleislääkärin suorat TT:t 2,3 %, pikakaista 7,5 %. 🌍 Englanti: kiirelähetteet 15,3 %, Lung Health Check 1,7 %. | Ulkomainen |

Tarkat lähteet ovat tiedostoissa [OLETUKSET.md](../oletukset/OLETUKSET.md) ja [kaksi-ovea-tilastot.xlsx](kaksi-ovea-tilastot.xlsx) (välilehti Näyttö).

Tiedosto on tehty tiimin tarkistetusta datasta: `src/data/goal3_regional.json` ja `src/data/curative_by_county.json`.
