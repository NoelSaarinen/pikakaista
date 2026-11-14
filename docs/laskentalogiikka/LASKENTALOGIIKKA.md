# Kaksi ovea: laskentakaavat ja logiikka

Koottu 14.11.2026 nykyisestä demosta (`src/`). Tämän dokumentin ja tiedoston [kaksi-ovea-tilastot.xlsx](../tilastot/kaksi-ovea-tilastot.xlsx) avulla tiimi voi rakentaa back-endin ja front-endin alusta. Kaikki luvut ja lähteet ovat Excelissä. Tämä dokumentti kertoo, mitä niillä lasketaan ja miten sovellus toimii.

| Mitä | Nykyinen toteutus | Excelissä |
| --- | --- | --- |
| Triage-säännöt | `src/lib/rules.ts` | Säännöt, Testivektorit |
| Kyselyn hyötylaskelma ja kaksi ovea | `src/lib/simulation.ts` | Oletukset, Laskelma |
| Tavoite 3 -löydökset | `src/lib/regional.ts` | Parantava hoito, Tavoite 3 alueittain, Elossaolo YTA |
| Tekoäly | `src/lib/llm.ts`, `src/lib/summarize.ts`, `src/lib/brief.ts` | – |
| Data | `src/data/*.json` | Kaikki välilehdet |

## 1. Periaatteet

Uuden toteutuksen pitää säilyttää nämä periaatteet. Briefin arviointi palkitsee niistä.

1. **Koodi laskee, tekoäly kirjoittaa.** Kaikki luvut lasketaan deterministisesti. Tekoäly saa luvut valmiina eikä keksi uusia.
2. **Säännöt ehdottavat, lääkäri päättää.** Tekoäly ei koskaan päätä ohjauksesta eikä poista hälytysmerkkiä.
3. **Jokaisella luvulla on lähde.** Jokainen arvo on muotoa `{ value, source_id, year, is_estimate, note }`. Käyttöliittymä näyttää lähdetunnuksen jokaisen luvun vieressä.
   - `mock` = paikkamerkki, ei oikeaa dataa
   - `assumption` = tiimin oletus ilman suoraa lähdettä, näytetään säätimenä
   - `is_estimate: true` = korvike tai tiimin oma laskelma.
4. **Vain synteettistä dataa.** Kyselyvastaukset ovat keksittyjä. Briefi sallii vain julkisen koostedatan.
5. **Demo toimii ilman tekoälyä.** Jos API ei vastaa, käytetään tekstipohjia.

## 2. Datamalli

### Alue (`counties.json`, Excel: Alueet)

| Kenttä | Sisältö |
| --- | --- |
| `id`, `name`, `code` | Esimerkiksi `lappi`, "Lappi", "21" |
| `population_55_80` | 55–80-vuotiaat 31.12.2025 (StatFin 11re) |
| `ever_smoker_share` | **Korvike:** päivittäin tupakoivat 20 vuotta täyttäneistä (Sotkanet 4404), 2024. Joskus tupakoineiden aluelukua ei ole. |
| `lung_cancer_cases_per_year` | Uudet keuhkosyövät C33–C34, keskiarvo 2020–2024 (Syöpärekisteri) |
| `occupational_health_doctor_visits_per_1000_aged_15_64` | Työterveyslääkärikäynnit (Sotkanet 2371), 2025. Mittaa käyttöä, ei kattavuutta. |
| `in_ldct_pilot` | Seulontapilotissa? Tällä hetkellä `mock`, eli tieto puuttuu. |

### Kyselyvastaus (`synthetic/responses.json`, Excel: Testivektorit)

```json
{
  "id": "p-0042",
  "age": 67,
  "language": "fi",
  "smoking": { "status": "current | former | never", "pack_years": 30 },
  "symptoms": {
    "cough_weeks": 5, "blood_in_sputum": true, "weight_loss": false,
    "breathlessness": true, "chest_pain": false, "pneumonias_last_year": 1
  },
  "previous_visits": [{ "months_ago": 2, "reason": "yskä" }],
  "free_text": "vapaaehtoinen, millä kielellä tahansa",
  "channel": "survey | health_centre",
  "synthetic": true
}
```

- `channel` kertoo, mistä vastaus tuli: `survey` on riskiryhmän tekstiviestikysely, `health_centre` on hoitajan tarkistuslista terveyskeskuksessa (Kaksi ovea).
- **Askivuodet** = savukkeita päivässä ÷ 20 × tupakointivuodet. Lasketaan kyselyssä, pyöristetään kokonaisluvuksi, ja "never" antaa 0.

### Muut tiedostot
- `goal3_regional.json`: kuolleisuus, ilmaantuvuus ja signaali alueittain, elossaolo yhteistyöalueittain sekä kansalliset ja NORDCAN-luvut.
- `curative_by_county.json`: parantavan hoidon osuus alueittain.
- `sources.json`: lähteet.

## 3. Triage-säännöt

Koodissa tämä on funktio `evaluate(response)`. Rakenteiset vastaukset antavat aina saman tuloksen.

```
asetukset: minAge 55, maxAge 80, minPackYears 20, coughWeeks 3,
           recurrentPneumonias 2, recentVisitMonths 6, directCtScore 3

riskiryhmässä = 55 ≤ ikä ≤ 80
              JA tupakointi ≠ "never"
              JA askivuodet ≥ 20

perusteet = []
jos verta yskösissä:            perusteet += "Verta yskösissä" (PUNAINEN LIPPU)
jos yskä ≥ 3 viikkoa:           perusteet += "Yskä yli 3 viikkoa"           (+1)
jos laihtuminen:                perusteet += "Selittämätön laihtuminen"     (+1)
jos hengenahdistus:             perusteet += "Hengenahdistus"               (+1)
jos rintakipu:                  perusteet += "Rintakipu"                    (+1)
jos keuhkokuumeita ≥ 2 / v:     perusteet += "Toistuvat keuhkokuumeet"      (+1)
jos aiempi käynti ≤ 6 kk sitten, sen syy on hengitystieperäinen
   JA jokin oire on yhä päällä: perusteet += "Oireet jatkuvat aiemman käynnin jälkeen" (+1)

pisteet = (+1-perusteiden määrä) + (3, jos punainen lippu)

ohjaus = jos ei riskiryhmässä         → "Ei riskiryhmässä"
         muuten jos punainen lippu
                tai pisteet ≥ 3       → "Suoraan TT-kuvaukseen"
         muuten jos pisteet ≥ 1       → "Lääkärille muutaman päivän sisällä"
         muuten                       → "Tavallinen reitti"
```

**Lisätiedot:**
- **"Hengitystieperäinen syy"** tarkoittaa, että käynnin syy sisältää jonkin näistä sanoista (kirjainkoolla ei väliä): yskä, cough, hengenahdistus, breathlessness, keuhkokuume, pneumonia, astma, asthma, flunssa, flu, keuhkoputkentulehdus, bronchitis.
- **"Oire yhä päällä"** tarkoittaa, että yskä > 0 viikkoa tai jokin seuraavista on kyllä: veriyskä, laihtuminen, hengenahdistus tai rintakipu.
- **Oireiset lääkärin arvioon aina:** jos vastaaja ilmoittaa minkä tahansa oireen (yskä, veriyskä, laihtuminen, hengenahdistus, rintakipu tai keuhkokuume viimeisen vuoden aikana), `symptomReviewRequired` on tosi iästä ja tupakoinnista riippumatta.
- **Säännöt ovat Delunin versio** (`feature/combined`, 6f58412), yhdistetty muuttamattomana 14.11.2026. Koko priorisointimalli (PLCOm2012, NICE NG12 -ajanvaraus, seulontalista) on kuvattu tiedostossa [PRIORISOINTIMALLI.md](../PRIORISOINTIMALLI.md).
- **Ehdotus Delunille:** Pirkanmaan hoitopolku käyttää kolmen viikon rajaa myös hengenahdistukselle ja rintakehän tai hartian kivulle, ja listaa lisäksi äänen käheyden (`pirha-hoitopolku`). Ne eivät ole säännöissä.
- **Jokaiseen perusteeseen liitetään henkilön oma vastaus**, esimerkiksi "Yskä yli 3 viikkoa: 5 viikkoa". Lääkäri näkee sen sellaisenaan.
- **Lääkärin lista** (Delunin `compareWithPriority`):
  1. livenä annetut vastaukset ensin
  2. hälytysmerkki (verta yskösissä)
  3. muut oireiset
  4. sääntöjen ehdotus: TT-arvio, lääkäri, tavallinen reitti
  5. hälytyspisteet laskevasti
  6. PLCOm2012-riski laskevasti, vain tasatilanteissa.
- **Lääkärin päätös** on yksi kolmesta: suoraan TT:hen, lääkärille tai tavallinen reitti. Lääkäri voi hyväksyä ehdotuksen tai muuttaa sen.
- **Säännöt ovat demosääntöjä, eivät kliinisiä kriteerejä.** Oireet tulevat Filhan keuhkosyöpäohjelmasta ja Pirkanmaan hoitopolusta. Keuhkokuume- ja pisterajat ovat tiimin oletuksia. Delun ja mentorit tarkistavat ne.

**Testi:** Excelin Testivektorit-välilehdellä on 200 vastausta ja sääntöjen tulos kullekin. Uuden toteutuksen pitää antaa täsmälleen samat sarakkeet "→ Riskiryhmässä", "→ Pisteet", "→ Punainen lippu" ja "→ Ohjaus".

## 4. Kyselyn hyötylaskelma

Koodissa tämä on funktio `simulate(alue, oletukset)`. Laskelma ajetaan kolmella skenaariolla: varovainen, perus ja optimistinen. Käyttöliittymän säädin korvaa arvon kaikissa kolmessa skenaariossa.

```
tupakoitsijat   = 55–80-vuotiaat × päivittäin tupakoivien osuus × (1 + entisiä_per_nykyinen)
riskiryhmä      = tupakoitsijat × askivuosiosuus
vastaajat       = riskiryhmä × vastausprosentti
ei_vastaa       = riskiryhmä − vastaajat                    (hoitaja soittaa)
pikakaistalle   = vastaajat × hälytysmerkkien_osuus
suoraan_TT      = pikakaistalle × suoraan_TT_osuus
lääkärille      = pikakaistalle − suoraan_TT
TT_kuvauksia    = suoraan_TT + lääkärille × TT_lääkärin_jälkeen_osuus
löytyy_syöpä    = TT_kuvauksia × osumatarkkuus

nyt_päiviä_TT    = odotus_terveyskeskukseen + käynnistä_lähetteeseen + lähetteestä_TT:hen
pika_päiviä_TT   = jos TT_kuvauksia > 0:
                     (suoraan_TT × pika_TT_päivät
                      + lääkärille × TT_lääkärin_jälkeen_osuus × (pika_lääkäri_päivät + pika_TT_päivät))
                     ÷ TT_kuvauksia
                   muuten: pika_lääkäri_päivät + pika_TT_päivät
säästö_päiviä    = nyt_päiviä_TT − pika_päiviä_TT
lääkäriaikoja_vk = lääkärille ÷ max(1, kyselykierroksen_viikot)
TT_aikoja_vk     = TT_kuvauksia ÷ max(1, kyselykierroksen_viikot)
```

### Oletukset

| Avain | Varovainen | Perus | Optimistinen | Lähde |
| --- | ---: | ---: | ---: | --- |
| `formerPerCurrentSmoker` (entisiä tupakoitsijoita yhtä nykyistä kohden) | 5 | 5 | 5 | thl-tupakka-2023: 55–84-v noin 64 % joskus tupakoinut ja noin 10 % päivittäin (tiimin laskelma) |
| `heavySmokerShareOfEver` (≥ 20 askivuotta) | 30 % | 40 % | 50 % | ylst-2024: Yorkshiressa 29 % 55–74-vuotiaista tupakoineista täytti ehdon ≥ 20 askivuotta ja lopettanut ≤ 15 v sitten (alaraja). Perusarvo on arvio. |
| `responseRate` (vastausprosentti) | 25 % | 50 % | 65 % | ylst-2022: Yorkshiren kutsuun vastasi 50,8 %. wagland-2016: postitettuun oirekyselyyn 25,3 %. Suolistosyövän seulonta 73,5 % (2024). |
| `alarmShare` (hälytysmerkkien osuus) | 8 % | 12 % | 15 % | wagland-2016: 6,7 % oireisia, jotka eivät olleet käyneet lääkärissä vuoteen (alaraja), 54 % vähintään yksi laaja oire. latti-2018: yli 8 viikon yskä 7,2 % suomalaisista työikäisistä. |
| `directCtShare` (suoraan TT) | 30 % | 30 % | 30 % | suunnitteluvalinta. Suomessa perusterveydenhuolto ottaa ensin röntgenin (uh-acta-2025, pirha-hoitopolku). |
| `ctAfterVisitShare` (TT lääkärin jälkeen) | 50 % | 50 % | 50 % | oletus, ei julkista lähdettä |
| `cancerYieldPerCt` (osumatarkkuus) | 1 % | 2 % | 4 % | wichmann-2025: Oulun TT-seulonnan 1. kierros 1,0 % (oireettomat). Tanskan yleislääkärin TT 2,3 %, TLHC 1,7 %. |
| `surveyWeeks` (kyselykierroksen viikot) | 12 | 12 | 12 | oletus |
| `currentPrimaryCareWaitDays` (odotus terveyskeskukseen) | 14 | 14 | 14 | uh-acta-2025 (kansallinen arvio noin 2 viikkoa; asiantuntijoiden mukaan monilla alueilla jopa kuukausi) |
| `currentVisitToReferralDays` (käynnistä lähetteeseen) | 15 | 15 | 15 | mattila-2025: Satakunta, mediaani 15 vrk |
| `currentCtQueueDays` (lähetteestä TT:hen) | 9 | 9 | 9 | pirha-hoitopolku: käsittely 1–2 arkipäivää ja TT viikon sisällä |
| `fastPhysicianDays` (pikakaista: lääkärille) | 3 | 3 | 3 | jensen-2017 (tavoite) |
| `fastCtDays` (pikakaista: TT:hen) | 7 | 7 | 7 | pirha-hoitopolku: TT useimmiten viikon sisällä (tavoite) |
| `publicDoorShare` (terveyskeskuksen kautta) | 70 % | 70 % | 70 % | kuitunen-2026: 87 / (87 + 39) = 69 % |
| `privateDoorDaysToCt` (työterveys/yksityinen TT:hen) | 23 | 23 | 23 | kuitunen-2026: 76 ÷ 127 ≈ 0,6 × 38 pv |
| `healthCentreYield` (terveyskeskuksen pikakaistan osumatarkkuus) | 10 % | 10 % | 10 % | oletus Tanskan 7,5 %:n ja Englannin 15,3 %:n välissä |

**Tarkistusluvut, Lappi perusoletuksilla:**

| Tulos | Arvo |
| --- | ---: |
| Riskiryhmä | 17 059,8 |
| Vastaajat | 8 529,9 |
| Pikakaistalle | 1 023,6 |
| TT-kuvauksia | 665,3 |
| Löytyy syöpä | 13,3 |
| Nyt päiviä TT:hen | 38 |
| Pikakaistalla päiviä TT:hen | 8,62 |
| Säästö päivinä | 29,4 |
| Lääkäriaikoja viikossa | 59,7 |
| TT-aikoja viikossa | 55,4 |

Kun entiset tupakoitsijat ovat mukana, kuorma 12 viikon kierroksella on suuri: Lapissa noin 55 TT-aikaa viikossa. Jos kierros jaetaan koko vuodelle (52 viikkoa), kuorma on noin 13 TT-aikaa viikossa.

**Tarkistus ulkoista dataa vasten:** perusoletuksilla malli löytää syövän 0,16 %:lta vastaajista (0,12 × 0,65 × 0,02). Englannin oirekyselyssä (wagland-2016) syöpä todettiin vuoden sisällä 0,26 %:lla vastaajista (3 / 1 172). Suuruusluokka on sama, ja malli on varovaisempi.

Laskelma ei arvioi elossaoloa eikä levinneisyyden muutosta, koska niille ei ole lähdettä.

## 5. Kaksi ovea

Koodissa tämä on funktio `simulateDoors(alue, perusoletukset)`.

```
tk_kautta        = keuhkosyöpiä_vuodessa × publicDoorShare
tt_tai_yks       = keuhkosyöpiä_vuodessa − tk_kautta
tk_nyt_päiviä    = currentPrimaryCareWaitDays + currentVisitToReferralDays + currentCtQueueDays
tt_yks_päiviä    = privateDoorDaysToCt
tk_pika_päiviä   = fastPhysicianDays + fastCtDays
ero_nyt          = tk_nyt_päiviä − tt_yks_päiviä
ero_jälkeen      = tk_pika_päiviä − tt_yks_päiviä
säästö           = tk_nyt_päiviä − tk_pika_päiviä
TT_lähetteitä_vk = tk_kautta ÷ max(healthCentreYield, 0,0001) ÷ 52
```

**Tarkistusluvut, Lappi:**

| Tulos | Arvo |
| --- | ---: |
| Terveyskeskuksen kautta | 94,4 |
| Työterveyden tai yksityisen kautta | 40,4 |
| Terveyskeskus nyt | 38 pv |
| Työterveys tai yksityinen | 23 pv |
| Terveyskeskus pikakaistalla | 10 pv |
| Ero ovien välillä nyt | 15 pv |
| Säästö | 28 pv |
| TT-lähetteitä viikossa | 18,1 |

**Näyttö:** Kuitunen ym. 2026 (lymfooma): oireista hoitoon kului mediaani 127 päivää terveyskeskuksen ja 76 päivää työterveyden tai yksityisen kautta. Keuhkosyövästä vastaavaa reittidataa ei ole, joten ovien ajat ja jakauma ovat arvioita.

## 6. Tavoite 3: missä aukko on suurin

Koodissa tämä on funktio `regionalFindings(alueen_id)`. Funktio ei laske tilastoja uudelleen. Se hakee valmiit rekisteriluvut, ja tiimin omat laskelmat on tehty etukäteen datatiedostoon.

### Parantava hoito
- **Määritelmä:** niiden osuus, jotka saivat parantavaa hoitoa 12 kuukauden kuluessa diagnoosista, 2019–2023. Osuudet ovat ikävakioimattomia. Lähde on keuhkosyövän laaturekisteriraportti, taulukko 11.
- **Sija:** 1 + niiden alueiden määrä, joiden osuus on suurempi. Tasaluvut jakavat saman sijan, esimerkiksi Pirkanmaa ja Länsi-Uusimaa ovat molemmat 4.
- **Ero koko maahan** = (alueen osuus − 27,0 %) prosenttiyksikköinä.

### Keuhkosyöpäkuolleisuus
- **Lähde:** Syöpärekisterin ikävakioitu kuolleisuus (Suomen väestö 2014) jaksoilta 2015–2019 ja 2020–2024. Koko maassa 2020–2024 se oli 35,79 / 100 000.
- **95 %:n väli** on tiimin arvio Byarin approksimaatiolla viiden vuoden kuolemamäärästä *D*:
  ```
  alaraja = D × (1 − 1/(9D) − 1,96/(3√D))³
  yläraja = (D+1) × (1 − 1/(9(D+1)) + 1,96/(3√(D+1)))³
  väli    = [alaraja, yläraja] ÷ D × julkaistu ikävakioitu kuolleisuus
  ```
- **Signaali:**
  - `consistently_higher`, jos välin alaraja on koko maan tason yläpuolella **molemmilla** jaksoilla
  - `consistently_lower`, jos välin yläraja on koko maan tason alapuolella molemmilla jaksoilla
  - `higher_latest_period_only` tai `lower_latest_period_only`, jos ero näkyy vain 2020–2024
  - muuten `not_distinguishable_from_national`.
- **Löydöksenä** esitetään vain `consistently_*`, koska 23 alueen joukosta noin yksi ylittää 95 %:n rajan sattumalta.
- **Ylikuolleisuus** lasketaan vain alueille, joilla on `consistently_higher`: kuolemia/v × (1 − koko maan taso ÷ alueen taso). Lapissa 110 × (1 − 35,79 ÷ 46,79) ≈ 25,9.
- **Huomio:** korkea kuolleisuus johtuu osin korkeasta ilmaantuvuudesta, eli tupakointihistoriasta. Se ei yksin osoita hoidon eroja.

### Elossaolo
- **Määritelmä:** viiden vuoden suhteellinen elossaolo 2022–2024, julkaistu vain viidelle yhteistyöalueelle. Koko maassa se on 20,54 %.
- **Aluetaso:** hyvinvointialueelle näytetään sen yhteistyöalueen luku, ja käyttöliittymässä pitää lukea, että luku on yhteistyöalueen.
- **Epävarmuus:** noin ±2 prosenttiyksikköä, joten alueita ei saa järjestää.

### Löydöksen käyttö
- **Tärkein havainto:** Lapissa parantavaa hoitoa sai 18,5 % (sija 22 / 22, Vantaa ja Kerava 35,6 %), ja Lapin keuhkosyöpäkuolleisuus on selvästi korkeampi molemmilla jaksoilla.
- **Mittari:** tavoite 3:n mittari on viiden vuoden elossaolo. THL 21/2016 ei sovellu, koska sen kello käynnistyy vasta lähetteestä.

## 7. Tekoäly

### Yhteinen kutsu (`llm.ts`)
- **Toteutus:** Anthropic SDK (`@anthropic-ai/sdk`), kutsu tehdään vain palvelimella. Avain on ympäristömuuttujassa `ANTHROPIC_API_KEY`, eikä se saa koskaan päätyä selaimeen.
- **Malli:** `claude-opus-5-5`, vaihdettavissa muuttujalla `ANTHROPIC_MODEL`.
- **Parametrit:** `max_tokens` 16000 ja `output_config.effort: "low"`.
- **Kieltäytymiset:** varamalli on päällä (`betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"`).
- **Virheet:** jos `stop_reason` on `refusal`, avain puuttuu tai kutsu epäonnistuu, funktio palauttaa `null`. Silloin kutsuja käyttää tekstipohjaa ja merkitsee `generated_by: "template"`.
- **Tila:** tekoälyä **ei ole vielä ajettu oikealla avaimella**.

### Kutsu 1: tapausyhteenveto lääkärille
- **Milloin:** lääkäri avaa tapauksen. Vastaus tallennetaan välimuistiin tunnuksen mukaan.
- **Järjestelmäkehote:**
  ```
  Olet avustaja, joka tiivistää keuhkosyövän riskiryhmän oirekyselyn vastauksen terveyskeskuslääkärille.
  Säännöt:
  - Kirjoita suomeksi 1–3 lyhyttä virkettä. Käytä vain annettuja tietoja.
  - Älä diagnosoi, älä arvioi syövän todennäköisyyttä äläkä muuta ehdotettua jatkoa. Lääkäri päättää.
  - Jos vapaassa tekstissä (millä kielellä tahansa) mainitaan oire, jota rakenteiset vastaukset eivät kata, lisää loppuun rivi "Huom: " ja lainaus suomennettuna.
  - Älä koskaan väitä, että jokin hälytysmerkki puuttuu tai on merkityksetön.
  ```
- **Käyttäjäviesti:** `Kyselyvastaus (synteettinen):` ja JSON, jossa ovat kentät `ikä`, `tupakointi`, `oireet`, `aiemmat_käynnit`, `vapaa_teksti`, `vastauksen_kieli`, `sääntöjen_löydökset` ja `ehdotettu_jatko`.
- **Tekstipohja:** `"{ikä} v, {tupakointi}. Hälytysmerkit: {peruste (vastaus), …}."`, tai "Ei hälytysmerkkejä.", jos perusteita ei ole.
- **Palautus:**
  ```json
  {
    "id": "...",
    "rule_score": 0,
    "proposed_placement": "...",
    "summary": "...",
    "reasons": ["peruste: vastaus"],
    "generated_by": "llm | template",
    "physician_decision": null
  }
  ```

### Kutsu 2: päättäjän tiivistelmä
- **Milloin:** päättäjä painaa "Luo tiivistelmä". Palvelin laskee luvut samoilla funktioilla kuin selain, joten tiivistelmän luvut ovat samat kuin ruudulla.
- **Järjestelmäkehote:**
  ```
  Kirjoitat hyvinvointialueen päättäjälle kahden minuutin tiivistelmän keuhkosyövän pikakaistasta.
  Säännöt:
  - Suomeksi, enintään 160 sanaa, otsikot: Löydös, Missä polku jumittaa, Toimenpide, Odotettu vaikutus, Rajoitukset.
  - Kuvaa "malli"-kentän mukainen ratkaisu. Älä mainitse kyselyä, jos malli on pelkkä Kaksi ovea.
  - Käytä VAIN annettuja lukuja. Älä keksi uusia lukuja, äläkä lupaa elossaolon paranemista.
  - Merkitse jokaisen luvun perään lähde hakasulkeissa, esim. [filha-2026] tai [laskelma].
  - Jos sisaltaa_mock_dataa on true, mainitse rajoituksissa, että osa luvuista on paikkamerkkejä.
  ```
- **Käyttäjäviesti:** `Luvut:` ja JSON, jossa kukin arvo on muotoa `{ arvo, lahde }`. Mukana ovat `alue`, `malli`, `parantava_hoito_alueella`, `keuhkosyopakuolleisuus_alueella`, `keuhkosyopia_vuodessa`, `levinneena_loydetyt`, `tyoikaisia_sairastuneista`, `julkinen_reitti_hitaampi`, `terveyskeskusodotus_nyt`, ovien päivät ja potilasmäärät, `pikakaistan_tt_lahetteita_viikossa` ja `sisaltaa_mock_dataa`. Kyselymallissa mukana ovat lisäksi kyselyn vaihteluvälit. Viestin lopussa on `Lähteet:` ja rivit `tunnus: nimi`.
- **Tekstipohja:** samat otsikot kiinteinä lauseina, joihin luvut sijoitetaan, sekä lopussa rivi tavoitteesta 3.

### Tunnetut puutteet tekoälyssä
1. **Testaamatta.** Tekoälyä ei ole testattu oikealla avaimella, ja epäonnistunut kutsu näyttää käyttöliittymässä samalta kuin puuttuva avain.
2. **Vapaa teksti ei tavoita kaikkia.** Tekoäly lukee vapaan tekstin vasta lääkärin listalla. Henkilö, jolle säännöt eivät anna hälytysmerkkiä mutta joka kuvaa oireen vapaassa tekstissä, ei koskaan päädy listalle. **Ehdotus:** luetaan vapaa teksti heti vastaanotossa rakenteisena tuloksena (mahdolliset oireet ja lainaus), ja jos oire löytyy, nostetaan henkilö listalle merkinnällä "Tekoäly lisäsi". Tekoäly voi vain lisätä.
3. **Tavoite 3 voi pudota pois.** Tiivistelmän järjestelmäkehotteessa ei ole otsikkoa "Tavoite 3", joten tekoälyn versiosta mittari voi puuttua.
4. **Lukuja ei tarkisteta.** Koodi ei tarkista, että tiivistelmän luvut löytyvät annetusta listasta.
5. **Jatkokysymykset puuttuvat.** AI-analyytikolta ei voi kysyä jatkokysymyksiä. **Ehdotus:** työkalukutsut, jotka ajavat laskelman, aluelöydökset ja alueiden vertailun koodilla.

## 8. Rajapinnat (nykyinen toteutus)

| Pyyntö | Runko | Vastaus |
| --- | --- | --- |
| `POST /api/responses` | `age`, `channel`, `language`, `smoking_status`, `pack_years`, `symptoms{…}`, `previous_visit_reason`, `previous_visit_months_ago`, `free_text` | `{ response, rule }`. Arvot rajataan (esimerkiksi ikä 18–110), ja tunnukseksi tulee `live-001`, `live-002` jne. |
| `GET /api/worklist` | – | `{ items: [{ response, rule, decision, live }], counts: { direct_ct, physician_fast, normal_route, not_eligible }, total }` |
| `POST /api/summarize` | `{ id }` | Tapausyhteenveto (kohta 7) |
| `POST /api/decision` | `{ id, placement }`, jossa `placement` on `direct_ct`, `physician_fast` tai `normal_route` | `{ id, placement }` |
| `POST /api/brief` | `{ countyId, overrides, mode }`, jossa `mode` on `doors` tai `doors_survey` | `{ text, generated_by }` |

**Tallennus:** vastaukset, päätökset ja yhteenvedot ovat palvelimen muistissa, ja ne nollautuvat uudelleenkäynnistyksessä. **Vercelissä** palvelinfunktiot eivät jaa muistia, joten livenä annettu vastaus ei välttämättä näy lääkärin listalla. Uudessa toteutuksessa tarvitaan pysyvä tallennus, esimerkiksi pieni tietokanta tai Vercel KV, tai demo ajetaan omalta koneelta.

## 9. Näkymät ja demopolku

1. **Päättäjänäkymä:**
   - aluevalitsin ja tila (Kaksi ovea / Kaksi ovea + kysely)
   - löydös, missä polku jumittaa sekä toimenpide ja vaikutus
   - tavoite 3 -osio
   - kahden oven vertailu ja kyselyn vaihteluvälitaulukko
   - tiivistelmä ja oletusten säätimet
   - lähteet.
2. **Kysely (mobiili):**
   - kaksi tilaa: kysely riskiryhmälle tai hoitajan tarkistuslista
   - vastaajalle näytetään viesti ohjauksen mukaan
   - hoitajalle näytetään ohje.
3. **Lääkärin lista:**
   - määrät jonoittain ja lista
   - avatussa tapauksessa yhteenveto, perusteet ja ehdotus
   - painikkeet "Hyväksy ehdotus" ja "Muuta: …".

Kahden minuutin demopolku on kuvattu tiedostossa [PROJECT.md](../PROJECT.md#demo-flow-two-minutes).

## 10. Avoimet päätökset

- **Riskiryhmä.** `formerPerCurrentSmoker` on nyt 5 kansallisen tupakkatilaston perusteella. Askivuosiraja ja lopettamisesta kulunut aika ovat yhä auki. Ota huomioon myös EU:n suositus, josta voi kysyä mentoreilta. Data ja oletukset on koottu tiedostoon [OLETUKSET.md](../oletukset/OLETUKSET.md).
- **Seulontapilotti.** Keuhkosyövän seulontapilotti alkoi 2026 Helsingissä ja kahdeksalla hyvinvointialueella. Alueita ei nimetä, joten kysely ei saa mennä päällekkäin pilotin kanssa.
- **Hälytyssäännöt.** Raja-arvot ja suora TT-ohjaus kyselyn perusteella vaativat lääketieteellisen tarkistuksen.
- **Lähetteestä TT:hen (9 pv).** Luku perustuu Pirkanmaan hoitopolkuun. Muiden alueiden ajat kysytään mentoreilta.
- **Tekoälyn puutteet.** Katso kohta 7.
