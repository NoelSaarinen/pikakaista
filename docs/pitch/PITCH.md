# Pitch: alustava versio 2

14.11.2026 klo 23 · Esiintyjä: Delun. Käsikirjoitus, deck, enintään kahden minuutin video ja palautus: Noel ([TEAM.md](../TEAM.md)).

**Mikä muuttui versiosta 1 (klo 18):**
- **Demon luvut on täytetty.** Lapin luvut on ajettu demon nykyisellä laskennalla (`src/lib/simulation.ts` ja `src/data/counties.json`, ajettu 14.11.2026 klo 23). Ne vastaavat [laskentalogiikan](../laskentalogiikka/LASKENTALOGIIKKA.md) tarkistuslukuja.
- **Kahdeksan kieltä ja Verda-tekoäly** ovat nyt demossa, joten ne ovat mukana.
- **Lopetustuen polku on poistettu puheesta,** koska sitä ei ole demossa. Kolmen polun sijaan puhutaan kahdesta.
- **Seulontapilotin alueet on tarkistettu lähteistä,** eikä Lappi ole mukana ([SEULONTAPILOTTI.md](../seulontapilotti/SEULONTAPILOTTI.md)).

**Taustat:**
- [Seulontapilotti](../seulontapilotti/SEULONTAPILOTTI.md)
- [Data ja oletukset](../oletukset/OLETUKSET.md)
- [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx)
- [Laskentalogiikka](../laskentalogiikka/LASKENTALOGIIKKA.md)
- [Priorisointimalli](../PRIORISOINTIMALLI.md)

## Ydinviesti

> **"Kansallinen seulontapilotti ei voi kutsua ketään, koska tupakointihistoria ei näy rekistereissä. Me rakensimme sen puuttuvan kutsun: yksi kysely, joka löytää ne, jotka eivät tule itse, ja vie heidät kuvaukseen päivissä."**

**Rakenne:**
1. **Löydös:** Lappi on viimeinen
2. **Miksi:** riskiryhmä kulkee hitainta reittiä
3. **Oivallus:** järjestelmä ei pysty kutsumaan riskiryhmää
4. **Ratkaisu:** yksi kysely, kaksi polkua, lääkäri päättää
5. **Vaikutus ja toimenpide:** Lapin luvut ja pilotti

## Kahden minuutin käsikirjoitus

Noin 240 sanaa. Jos harjoituksessa aika ylittyy, pudota ensin hakasulkeissa oleva lause.

| Aika | Osio | Puhe (Delun) | Kuva |
| --- | --- | --- | --- |
| **0:00–0:15** | Koukku | "Jos sairastut keuhkosyöpään Lapissa, saat parantavaa hoitoa harvemmin kuin missään muualla Suomessa: 18,5 prosenttia, kun Vantaalla ja Keravalla 35,6. [Keuhkosyöpä tappaa Suomessa enemmän ihmisiä kuin mikään muu syöpä.]" | Pylväskuvio 22 alueesta, Lappi viimeisenä ja korostettuna |
| **0:15–0:35** | Miksi: kaksi ovea | "Kaksi kolmesta keuhkosyövästä löytyy vasta levinneenä. Ja ne, joilla riski on suurin, kulkevat hitainta reittiä. Sairastuneet ovat enimmäkseen eläkeläisiä, joten työterveys on jäänyt pois. Suomalaisessa tutkimuksessa terveyskeskuksen kautta hoitoon pääsi lähes kaksi kuukautta myöhemmin kuin työterveyden kautta." | Kaksi ovea: työterveys 76 pv, terveyskeskus 127 pv. Pienellä: "Kuitunen ym. 2026, lymfooma, n = 160" |
| **0:35–0:55** | Oivallus | "Tänä vuonna alkoi keuhkosyövän seulontapilotti. Sen 1 200 paikkaa täyttyivät muutamassa päivässä vapaaehtoisilla, koska ketään ei voi kutsua: tupakointihistoria ei näy rekistereissä. Lappi ei ole mukana. Tanskassa pelkkä pikakaista tavoitti vain 27 prosenttia keuhkosyöpäpotilaista. Puuttuu kanava, jolla riskiryhmä tavoitetaan ajoissa." | "1 200 paikkaa, 0 kutsua" ja "27 %" |
| **0:55–1:30** | Ratkaisu ja demo | "Hyvinvointialue lähettää riskiryhmälle kahden minuutin tekstiviestikyselyn kahdeksalla kielellä. Oireinen pääsee pikakaistalle lääkärille. Oireeton, paljon tupakoinut nousee validoidun riskimallin perusteella seulontalistalle. Tekoäly tiivistää vastaukset ja tulkitsee vapaata tekstiä, mutta päätöksen tekee aina lääkäri. Hoitaja soittaa niille, jotka eivät vastaa." | **Demo:** kysely puhelimella (kielivalinta näkyy) → veriyskä → lääkärin lista ja tekoälyn yhteenveto → hyväksyntä → seulontalista |
| **1:30–1:50** | Vaikutus ja toimenpide | "Lapissa riskiryhmään kuuluu noin 17 000 ihmistä. Perusarviolla pikakaistan kuvauksissa löytyy noin 13 keuhkosyöpää vuodessa, ja kuvaukseen pääsee alle kymmenessä päivässä nykyisen 38:n sijaan. Alue tarvitsee tähän noin 13 TT-aikaa viikossa. Se voi aloittaa yhdellä terveysasema-alueella ja verrata tuloksia verrokkialueeseen." | **Demo:** päättäjänäkymä, Lappi, kierros 52 viikkoa. Sitten pilottikortti. |
| **1:50–2:00** | Lopetus | "Löydämme ne, jotka eivät tule itse. Ja kun seulonta laajenee, kutsukanava on jo valmiina." | Logo ja ydinviesti |

### Englanninkielinen versio videolle

Käytä tätä, jos tiimi päättää tehdä videon englanniksi. Ajat ja kuvat ovat samat kuin yllä.

> **Hook.** "If you get lung cancer in Lapland, you are less likely to receive curative treatment than anywhere else in Finland: 18.5 percent, against 35.6 in Vantaa and Kerava."
>
> **Why.** "Two in three lung cancers are found only after they have spread. And the people at highest risk take the slowest route. Most patients are retired, so they no longer have occupational health care. In a Finnish study, patients who came through a public health centre reached treatment almost two months later than those who came through occupational health."
>
> **Insight.** "This year Finland started a lung cancer screening pilot. Its 1,200 places filled with volunteers within days, because nobody can be invited: smoking history is not in any register. Lapland is not included. In Denmark, a fast track alone reached only 27 percent of lung cancer patients. What is missing is a way to reach the risk group in time."
>
> **Solution.** "The wellbeing services county sends its risk group a two-minute text-message survey in eight languages. People with symptoms go to a fast lane to a physician. High-risk ever-smokers without symptoms are ranked for screening with a validated risk model. AI summarises the answers and reads free text, but a physician always decides. A nurse calls those who do not answer."
>
> **Impact.** "Lapland's risk group is about 17,000 people. In our base case, fast-lane scans find about 13 lung cancers a year, and people reach a CT scan in under ten days instead of 38. That takes about 13 CT slots a week. The county can start in one health-centre area and compare it with a control area."
>
> **Close.** "We find the people who would not come in themselves. And when screening expands, the invitation channel is already in place."

## Lapin luvut demosta

Ajettu 14.11.2026 demon koodilla. Väestö ja tupakointi ovat julkista dataa, mutta suppilon osuudet ovat oletuksia ([laskentalogiikka, kohta 4](../laskentalogiikka/LASKENTALOGIIKKA.md#4-kyselyn-hyötylaskelma)).

| Tulos | Varovainen | **Perus** | Optimistinen | Pitchissä |
| --- | ---: | ---: | ---: | --- |
| Riskiryhmä (55–80 v, ≥ 20 askivuotta) | 12 800 | **17 100** | 21 300 | "noin 17 000" |
| Vastaajat | 3 200 | **8 500** | 13 900 | – |
| Pikakaistalle | 260 | **1 020** | 2 080 | – |
| TT-kuvauksia kierroksella | 170 | **670** | 1 350 | – |
| Keuhkosyöpiä löytyy pikakaistan kuvauksista | 2 | **13** | 54 | "noin 13", diassa vaihteluväli 2–54 |
| Päiviä TT:hen, nyt → pikakaista | 38 → 8,6 | **38 → 8,6** | 38 → 8,6 | "alle kymmenessä päivässä 38:n sijaan" |
| TT-aikoja viikossa, kierros 52 viikkoa | 3 | **13** | 26 | "noin 13" |
| Lääkäriaikoja viikossa, kierros 52 viikkoa | 3 | **14** | 28 | diassa |

**Huomiot:**
- **Demon oletuskierros on 12 viikkoa,** jolloin perusarvio on 55 TT-aikaa viikossa. Pitchissä kierros jaetaan koko vuodelle, joten päättäjänäkymän säädin pitää asettaa 52 viikkoon ennen kuvakaappausta tai videota.
- **Vertailu:** Lapissa todetaan keskimäärin 135 keuhkosyöpää vuodessa (Syöpärekisteri 2020–2024). Perusarvion 13 on noin kymmenesosa niistä. Tämä on tiimin laskelma.
- **Päivät TT:hen** ovat samat kaikissa skenaarioissa, koska vain suppilon osuudet vaihtelevat. Nykyreitin 38 päivää on summa 14 + 15 + 9: odotus terveyskeskukseen (kansallinen arvio), käynnistä lähetteeseen (Satakunta) ja lähetteestä TT:hen (Pirkanmaan hoitopolku).
- **Kaksi ovea, Lappi:** terveyskeskuksen kautta 38 päivää TT:hen, työterveyden tai yksityisen kautta 23 päivää ja pikakaistalla 10 päivää. Pikakaista kääntää eron terveyskeskuksen eduksi. Työterveysreitin 23 päivää on johdettu lymfoomatutkimuksen suhteesta, joten se on arvio.
- **Elossaolon paranemista ei lasketa eikä luvata.**

## Kaksi ovea: miksi suuremman riskin ihmisillä on vain hitaampi väylä

**Kukaan ei ole päättänyt tätä, vaan se on suomalaisen järjestelmän rakenteen sivutuote:**
- **Työterveys kuuluu vain työssäkäyville.** Se loppuu eläkkeelle jäädessä, eli juuri silloin, kun keuhkosyövän riski kasvaa. Satakunnan aineistossa keuhkosyöpäpotilaiden keski-ikä oli 70 vuotta.
- **Yksityinen palvelu maksaa,** joten se on ulottuvilla vain niille, joilla on siihen varaa.
- **Kaikille muille jää terveyskeskus,** jossa odotetaan pisimpään.
- Lymfoomatutkimuksen kirjoittajat kutsuvat tätä itse **käänteiseksi hoitolaiksi**: palvelut ovat helpoimmin niiden saatavilla, jotka tarvitsevat niitä vähiten.

**Luvut (Kuitunen ym. 2026, lymfooma, 160 potilasta, 2014–2020):**
- Oireista hoitoon kului **mediaani 127 päivää** terveyskeskuksen ajanvarauksen kautta ja **76 päivää** työterveyden tai yksityisen kautta. Ero on noin 1,7-kertainen eli **lähes kaksi kuukautta**. Älä sano "kaksi kertaa".
- Eläkeläisiä oli 56 % terveyskeskuksen ajanvaraukseen tulleista.
- Yli 70-vuotiaita oli 44 % terveyskeskuksen kautta tulleista mutta vain 8 % työterveyden tai yksityisen kautta tulleista.
- Kukaan yli 5 000 €/kk ansaitsevista ei käyttänyt julkista puolta.

**Missä ero syntyy ja miten ratkaisu korjaa sen** (tutkimuksen kuva 1; luvut on luettu kuvaajan teksteistä, joten ne tarkistetaan artikkelista):

| Vaihe | Ero terveyskeskuksen haitaksi | Mikä sen korjaa |
| --- | --- | --- |
| Oireista ensimmäiseen yhteydenottoon | noin kuukausi | **Kysely** tavoittaa ihmiset aiemmin |
| Yhteydenotosta lääkärille ja lähetteeseen | noin 40 päivää | **Pikakaista** nopeuttaa tätä vaihetta |

**Rajoitus sanotaan itse:** tutkimus koski lymfoomaa. Keuhkosyövästä vastaavaa suomalaista vertailua ei ole, koska diagnoosiin johtanutta reittiä ei mitata. Tämä on yksi briefin havaitsemista data-aukoista, ja pilotti mittaa sen.

## Diat

1. **Otsikko:** nimi ja ydinviesti yhdellä rivillä.
2. **Löydös:** parantava hoito alueittain, Lappi viimeisenä (sija 22/22). Pienellä tavoite 3:n kuilu Pohjoismaihin (miehet 13,2 ja naiset 7,9 prosenttiyksikköä) ja se, että Lapin keuhkosyöpäkuolleisuus on koholla molemmilla jaksoilla 2015–2019 ja 2020–2024.
3. **Kaksi ovea:** työterveys 76 pv ja terveyskeskus 127 pv sekä "riskiryhmä on eläkeläisiä". Pienellä Satakunnan luvut: käynnistä lähetteeseen kului 15 pv, lähetteestä diagnoosiin 59 pv, ja 22 % tuli päivystyksen kautta.
4. **Oivallus:** seulontapilotti ei voi kutsua, 1 200 paikkaa täyttyi päivissä, Lappi ei ole mukana, mukaan pääsevät vain nykyiset tupakoitsijat, ja Tanskan pikakaista tavoitti 27 %.
5. **Ratkaisu:** kaavio "yksi kysely, kaksi polkua" (alla).
6. **Demo:** kuvakaappaukset tai video.
7. **Tasa-arvo:**
   - kahdeksan kieltä kattaa 98,6 % Lapin 55–79-vuotiaista rekisteröidyn äidinkielen mukaan, ja lisäksi on pohjoissaamenkielinen luonnos
   - hoitaja soittaa vastaamatta jättäneille ja yli 75-vuotiaille
   - seulontalistan oletusjärjestys ei nosta ketään kärkeen pelkän iän takia.
8. **Turvallisuus ja tekoäly:**
   - säännöt ehdottavat ja lääkäri päättää
   - tekoäly voi lisätä hälytysmerkin mutta ei poistaa sitä
   - kyselyssä on hätäohje (112 ja 116117)
   - PLCOm2012 vain järjestää seulontalistaa, eikä sitä ole kalibroitu Suomeen
   - tekoäly ajetaan Verdan avoimella mallilla, ja ilman tekoälyä demo toimii säännöillä.
9. **Vaikutus ja kapasiteetti:** Lapin taulukko yllä vaihteluvälinä: 2–13–54 keuhkosyöpää, alle 10 päivää TT:hen 38:n sijaan, 3–13–26 TT-aikaa viikossa.
10. **Pilotti:**
    - missä: yksi terveysasema-alue Lapissa
    - kuka tekee: hyvinvointialue, ja AstraZeneca voi tukea jatkoprojektina
    - mitä mitataan: aika TT-kuvaukseen, varhaisen vaiheen osuus, löydettyjen määrä, osumatarkkuus ja diagnoosiin johtanut reitti
    - verrokkialue.
11. **Liite:** lähteet ja rajoitukset (data on synteettistä, PLCOm2012 on kalibroimaton Suomeen, hälytyssäännöt ovat ehdotuksia, kahden oven luvut ovat lymfoomasta ja suppilon osuudet ovat oletuksia).

### Yksi kysely, kaksi polkua

```
Tekstiviestikysely riskiryhmälle (8 kieltä, hoitaja soittaa vastaamattomille)
 ├─ oireita          → lääkärin lista → pikakaista lääkärille ja TT
 │                     (Delunin porras 1, lääkäri hyväksyy)
 └─ ei oireita,
    korkea riski     → seulontalista: kutsu pilottiin tai tulevaan
                       seulontaan (Delunin porras 2, PLCOm2012)
```

## Painotus arviointikriteereittäin

| Kriteeri | Paino | Missä kohtaa pitchiä |
| --- | ---: | --- |
| Toteutettavuus | 30 % | Pilottidia, 13 TT-aikaa viikossa ja "aloittaa yhdellä terveysasema-alueella". Seulontapilotin puuttuva kutsukanava todistaa, että tarve on todellinen. |
| Oivallus | 25 % | Lappi, kaksi ovea ja "pilotti ei voi kutsua ketään" |
| Datan laatu | 20 % | Lähde jokaisessa luvussa, vaihteluväli ja rajoitukset itse sanottuina |
| Toteutus | 15 % | Demo videolla. Live-esityksessä varalla nauhoite. |
| Selkeys | 10 % | Yksi lause, yksi luku ja yksi kaavio dialla |

## Sanavalinnat

- **Sano "löytyy aiemmin", älä "löytyy lisää".** Elossaolon paranemista ei luvata, vaan se mitataan pilotissa.
- **Sano "lähes kaksi kuukautta myöhemmin", älä "kaksi kertaa kauemmin".** Mainitse, että luku on lymfoomasta.
- **Sano "perusarviolla noin 13",** ja näytä vaihteluväli diassa.
- **Seulontalista on "valmius",** ei oma seulonta. Pilotti on tutkimus, jonka tulokset eivät ole vielä valmiita.
- **Tekoäly "tiivistää ja tulkitsee",** ei "päättää" eikä "diagnosoi".

## Todennäköiset kysymykset

1. **"Ylikuormittaako tämä TT-kuvantamisen?"** Lapissa perusarvio on noin 13 TT-aikaa viikossa, kun kierros jaetaan vuodelle. Päättäjä näkee luvun ennen päätöstä ja voi säätää kierroksen pituutta.
2. **"Miksi ette tee suoraan seulontaa?"** Seulonnasta päätetään kansallisesti. Tavoitamme oireiset nyt, ja kutsukanava on valmiina, kun seulonta laajenee.
3. **"Onko oirekyselystä näyttöä?"** Kun kutsu johtaa TT-kuvaukseen, varhaisvaiheen osuus kasvaa: Englannin Lung Health Checkissä 76 % löydetyistä oli varhaisvaiheessa. Pelkästä oirekyselystä näyttö puuttuu, joten pilotti mittaa sen.
4. **"Entä ne, jotka eivät vastaa?"** Hoitaja soittaa vastaamatta jättäneille ja yli 75-vuotiaille, ja seurantanäkymä näyttää, kuka on vaarassa pudota pois.
5. **"Miksi PLCOm2012, kun sitä ei ole validoitu Suomessa?"** Se on laajimmin käytetty validoitu malli. Se vain järjestää listaa eikä ohita oireita, ja kalibrointi kuuluu pilottiin.
6. **"Pätevätkö kahden oven luvut keuhkosyöpään?"** "Emme tiedä varmasti, koska Suomessa ei mitata diagnoosiin johtanutta reittiä. Siksi pilotti mittaa sen." Satakunnasta tiedämme, että 22 % keuhkosyöpäpotilaista tuli päivystyksen kautta.
7. **"Miksi 13 eikä 54?"** Perusarvion osumatarkkuus 2 % vastaa Tanskan yleislääkärien suoria TT-lähetteitä (2,3 %). Optimistinen 54 edellyttää 4 %:n osumatarkkuutta ja 65 %:n vastausprosenttia, joten emme käytä sitä puheessa.
8. **"Eikö järjestys suosi vanhimpia?"** Oletusjärjestys laskee riskin ilman ikää, joten kaksi ihmistä, joilla on samat riskitekijät, saa saman sijan. Mallin mukaan se löytää samalla kuvausmäärällä noin 5 % vähemmän syöpiä. Valinta on arvovalinta, joka kuuluu alueelle.

## Avoimet riippuvuudet

| Mitä | Kuka | Milloin |
| --- | --- | --- |
| Kuvakaappaukset ja video Lapista, kierroksen säädin 52 viikossa | Patrik, sitten Noel | Ennen sunnuntaita klo 06 |
| Pitchin kieli (suomi vai englanti) ja arvioinnin muoto (live vai video, kesto) | Tiimi, Noel kysyy järjestäjiltä | Heti |
| 1–2 lainausta Kaisalta. Mentorikysymysten vastaukset ovat yhä tyhjinä ([ASTRAZENECA_LAUANTAI.md](../mentorikysymykset/ASTRAZENECA_LAUANTAI.md)). | Delun tai Noel | Jos ehtii, muuten pitch ilman lainauksia |
| Pohjoissaamenkielinen käännös on luonnos. Joko se tarkistetaan, tai diassa lukee "luonnos". | Noel | Ennen dian tekemistä |
| Lause "keuhkosyöpä tappaa enemmän kuin mikään muu syöpä" tarvitsee lähteen, tai se pudotetaan. | Noel | Ennen harjoitusta |
| Kahden oven kuvaajan luvut tarkistetaan artikkelista | Noel | Ennen dian tekemistä |
| Lopetustuen polku: lisätäänkö demoon ohjausviesti tupakoivalle vai jätetäänkö pois | Tiimi | Valinnainen |
| Harjoittelu kahdesti ajastettuna | Delun | Sunnuntaina ennen klo 06 |

## Lähteet

- **Lapin parantava hoito ja kuolleisuus:** Syöpärekisterin keuhkosyöpäraportti 2019–2023 ja tilastosovellus, ks. [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx).
- **Myöhäinen toteaminen (65–70 %):** Valtakunnallinen keuhkosyöpäohjelma 2026–2035 (Filha).
- **Kaksi ovea:** Kuitunen ym., *Cancer Medicine* 2026;15:e71920, [doi:10.1002/cam4.71920](https://doi.org/10.1002/cam4.71920).
- **Satakunnan viiveet ja reitit:** Mattila 2025, Turun yliopisto (opinnäyte).
- **Seulontapilotti ja sen alueet:** ks. [SEULONTAPILOTTI.md](../seulontapilotti/SEULONTAPILOTTI.md).
- **Tanskan pikakaista (27,4 %):** Guldbrandt ym., *BMC Health Services Research*.
- **Lung Health Check (76 %):** Ipsos ja Strategy Unit, TLHC final evaluation 2024.
- **NORDCAN-kuilu:** NORDCAN 2.0, ks. [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx).
- **Kielet:** StatFin 11rl, 55–79-vuotiaiden äidinkieli 2025, ks. [DATA_NOTES.md](../DATA_NOTES.md#survey-languages-for-the-risk-group-verified-2026-11-14).
- **Lapin luvut:** demon laskenta, ks. [Lapin luvut demosta](#lapin-luvut-demosta) ja [laskentalogiikka](../laskentalogiikka/LASKENTALOGIIKKA.md).
