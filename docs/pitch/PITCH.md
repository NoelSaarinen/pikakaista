# Pitch: alustava suunnitelma

14.11.2026 · Luonnos ilman lopullista demoa. Demon kohdat on merkitty **[DEMO: …]**, ja luvut, jotka tulevat lopullisen demon laskelmasta, merkinnällä **[LUKU DEMOSTA]**. Esiintyjä: Delun. Käsikirjoitus, deck, enintään kahden minuutin video ja palautus: Noel ([TEAM.md](../TEAM.md)).

**Taustat:**
- [Seulontapilotti](../seulontapilotti/SEULONTAPILOTTI.md)
- [Data ja oletukset](../oletukset/OLETUKSET.md)
- [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx)
- [Laskentalogiikka](../laskentalogiikka/LASKENTALOGIIKKA.md)

## Ydinviesti

> **"Kansallinen seulontapilotti ei voi kutsua ketään, koska tupakointihistoria ei näy rekistereissä. Me rakensimme sen puuttuvan kutsun: yksi kysely, joka löytää ne, jotka eivät tule itse, ja vie heidät oikealle polulle päivissä."**

**Rakenne:**
1. **Löydös:** Lappi
2. **Miksi:** riskiryhmä kulkee hitainta reittiä
3. **Oivallus:** järjestelmä ei tavoita ihmisiä
4. **Ratkaisu:** yksi kysely, kolme polkua
5. **Toimenpide:** pilotti Lapissa

## Kahden minuutin käsikirjoitus

| Aika | Osio | Puhe (Delun) | Kuva |
| --- | --- | --- | --- |
| **0:00–0:15** | Koukku | "Jos sairastut keuhkosyöpään Lapissa, saat parantavaa hoitoa puolet harvemmin kuin Vantaalla: 18,5 prosenttia vastaan 35,6. Keuhkosyöpä tappaa Suomessa enemmän ihmisiä kuin mikään muu syöpä." | Pylväskuvio alueista, Lappi korostettuna |
| **0:15–0:35** | Miksi: kaksi ovea | "Syy on se, että syöpä löytyy myöhään: kaksi kolmesta vasta levinneenä. Ja ne, joilla riski on suurin, kulkevat hitainta reittiä. Keuhkosyöpään sairastuvat ovat enimmäkseen eläkeläisiä, eli heillä ei ole työterveyttä. Suomalaisessa tutkimuksessa terveyskeskuksen kautta hoitoon pääsi lähes kaksi kuukautta myöhemmin kuin työterveyden kautta." | Kaksi ovea rinnakkain: työterveys 76 pv, terveyskeskus 127 pv. Alla pienellä: "Kuitunen ym. 2026, lymfooma, n = 160" |
| **0:35–0:55** | Oivallus | "Suomessa alkoi tänä vuonna keuhkosyövän seulontapilotti. 1 200 paikkaa täyttyi muutamassa päivässä vapaaehtoisilla, koska ketään ei voi kutsua: tupakointihistoria ei näy rekistereissä. Lappi ei ole mukana. Tanskassa taas pelkkä pikakaista tavoitti vain 27 prosenttia keuhkosyöpäpotilaista. Ongelma ei ole hoito, vaan se, ettei oikeita ihmisiä löydetä." | Kaksi lukua rinnakkain: "1 200 paikkaa, 0 kutsua" ja "27 %" |
| **0:55–1:30** | Ratkaisu | "Hyvinvointialue lähettää riskiryhmälle kahden minuutin tekstiviestikyselyn. Yksi vastaus johtaa kolmelle polulle. Oireinen pääsee pikakaistalle lääkärille. Oireeton korkean riskin tupakoinut nousee validoidun riskimallin perusteella seulontalistalle. Tupakoiva saa lopetustukea. Tekoäly tiivistää vastaukset ja tulkitsee vapaata tekstiä millä tahansa kielellä, mutta päätöksen tekee aina lääkäri." | **[DEMO: kysely puhelimella → turvaverkko veriyskästä → lääkärin lista ja tekoälyn yhteenveto → hyväksyntä → seulontalista]** |
| **1:30–1:50** | Vaikutus ja toimenpide | "Lapissa tämä tarkoittaa noin **[LUKU DEMOSTA]** keuhkosyöpää vuodessa, jotka löytyvät aiemmin, ja kuvaukseen pääsee päivissä viikkojen sijaan. Laskelma kertoo myös, kuinka monta TT-aikaa pitää varata. Alue voi aloittaa ensi kuussa yhdellä terveysasema-alueella ja verrata tuloksia verrokkialueeseen." | **[DEMO: päättäjänäkymä, Lappi]** ja pilottikortti |
| **1:50–2:00** | Lopetus | "Löydämme ne, jotka eivät tule itse, ja kun seulonta laajenee, kutsukanava on jo valmiina." | Logo ja ydinviesti |

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
2. **Löydös:** parantava hoito alueittain, Lappi viimeisenä. Pienellä tavoite 3:n kuilu Pohjoismaihin (miehet 13,2 ja naiset 7,9 prosenttiyksikköä).
3. **Kaksi ovea:** työterveys 76 pv ja terveyskeskus 127 pv sekä "riskiryhmä on eläkeläisiä". Pienellä Satakunnan luvut: käynnistä lähetteeseen kului 15 pv, lähetteestä diagnoosiin 59 pv, ja 22 % tuli päivystyksen kautta.
4. **Oivallus:** seulontapilotti ei voi kutsua, 1 200 paikkaa täyttyi päivissä, Lappi ei ole mukana, ja Tanskan pikakaista tavoitti 27 %.
5. **Ratkaisu:** kaavio "yksi kysely, kolme polkua" (alla).
6. **Demo:** kuvakaappaukset tai video.
7. **Turvallisuus ja tekoäly:** säännöt ehdottavat ja lääkäri päättää, tekoäly ei poista hälytysmerkkejä, turvaverkko (112 ja 116117) ja PLCOm2012 vain järjestykseen.
8. **Vaikutus ja kapasiteetti:** **[LUVUT DEMOSTA]** vaihteluvälinä.
9. **Pilotti:**
   - missä: yksi terveysasema-alue Lapissa
   - kuka tekee
   - mitä mitataan: aika TT-kuvaukseen, varhaisen vaiheen osuus, löydettyjen määrä, osumatarkkuus ja diagnoosiin johtanut reitti
   - verrokkialue.
10. **Liite:** lähteet ja rajoitukset (data on synteettistä, PLCOm2012 on kalibroimaton Suomeen, hälytyssäännöt ovat ehdotuksia, kahden oven luvut ovat lymfoomasta).

### Yksi kysely, kolme polkua

```
Tekstiviestikysely riskiryhmälle
 ├─ oireita          → pikakaista lääkärille ja TT (Delunin porras 1)
 ├─ ei oireita,
 │  korkea riski     → seulontalista: kutsu pilottiin tai tulevaan
 │                     seulontaan (Delunin porras 2, PLCOm2012)
 └─ tupakoi          → tupakoinnin lopetustuki (seulontapilotin päämittari)
```

## Painotus arviointikriteereittäin

| Kriteeri | Paino | Missä kohtaa pitchiä |
| --- | ---: | --- |
| Toteutettavuus | 30 % | Pilottidia ja "alue voi aloittaa ensi kuussa". Seulontapilotin kutsukanava todistaa, että tarve on todellinen. |
| Oivallus | 25 % | Lappi, kaksi ovea ja "pilotti ei voi kutsua ketään" |
| Datan laatu | 20 % | Lähde jokaisessa luvussa ja rajoitukset itse sanottuina |
| Toteutus | 15 % | Demo videolla. Live-esityksessä varalla nauhoite. |
| Selkeys | 10 % | Yksi lause, yksi luku ja yksi kaavio dialla |

## Sanavalinnat

- **Sano "löytyy aiemmin", älä "löytyy lisää".** Elossaolon paranemista ei luvata, vaan se mitataan pilotissa.
- **Sano "lähes kaksi kuukautta myöhemmin", älä "kaksi kertaa kauemmin".** Mainitse, että luku on lymfoomasta.
- **Seulontalista on "valmius",** ei oma seulonta. Pilotti on tutkimus, jonka tulokset eivät ole vielä valmiita.
- **Tekoäly "tiivistää ja tulkitsee",** ei "päättää" eikä "diagnosoi".
- **Pilottialueet varmistetaan Kaisalta** ennen kuin ne esitetään faktana.

## Todennäköiset kysymykset

1. **"Ylikuormittaako tämä TT-kuvantamisen?"** Laskelma näyttää tarvittavat ajat alueittain, ja kierroksen voi jakaa koko vuodelle.
2. **"Miksi ette tee suoraan seulontaa?"** Seulonnasta päätetään kansallisesti. Tavoitamme oireiset nyt, ja kutsukanava on valmiina, kun seulonta laajenee.
3. **"Onko oirekyselystä näyttöä?"** Kun kutsu johtaa TT-kuvaukseen, varhaisvaiheen osuus kasvaa: Englannin Lung Health Checkissä 76 % löydetyistä oli varhaisvaiheessa. Pelkästä oirekyselystä näyttö puuttuu, joten mittaamme sen.
4. **"Entä ne, jotka eivät vastaa?"** Hoitaja soittaa vastaamatta jättäneille ja yli 75-vuotiaille, ja seurantanäkymä näyttää, kuka on vaarassa pudota pois.
5. **"Miksi PLCOm2012, kun sitä ei ole validoitu Suomessa?"** Se on laajimmin käytetty validoitu malli. Se vain järjestää listaa eikä ohita oireita, ja kalibrointi kuuluu pilottiin.
6. **"Pätevätkö kahden oven luvut keuhkosyöpään?"** "Emme tiedä varmasti, koska Suomessa ei mitata diagnoosiin johtanutta reittiä. Siksi pilotti mittaa sen." Satakunnasta tiedämme, että 22 % keuhkosyöpäpotilaista tuli päivystyksen kautta.

## Avoimet riippuvuudet

| Mitä | Kuka | Milloin |
| --- | --- | --- |
| Lopullisen demon luvut (Lappi) ja kuvakaappaukset | Patrik, sitten Noel | Kun Delunin laskenta on integroitu |
| 1–2 lainausta Kaisalta | Delun tai Noel | Lauantaina |
| Arvioinnin muoto (live vai video, kesto, kieli) | Noel kysyy järjestäjiltä | Lauantaina |
| Pitchin kieli | Tiimi | Pian. Junction on kansainvälinen, joten video ja deck kannattaa todennäköisesti tehdä englanniksi. |
| Kahden oven kuvaajan luvut tarkistetaan artikkelista | Noel | Ennen dian tekemistä |
| Harjoittelu kahdesti ajastettuna | Delun | Sunnuntaina ennen klo 06 |

## Lähteet

- **Lapin parantava hoito ja kuolleisuus:** Syöpärekisterin keuhkosyöpäraportti 2019–2023 ja tilastosovellus, ks. [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx).
- **Myöhäinen toteaminen (65–70 %):** Valtakunnallinen keuhkosyöpäohjelma 2026–2035 (Filha).
- **Kaksi ovea:** Kuitunen ym., *Cancer Medicine* 2026;15:e71920, [doi:10.1002/cam4.71920](https://doi.org/10.1002/cam4.71920).
- **Satakunnan viiveet ja reitit:** Mattila 2025, Turun yliopisto (opinnäyte).
- **Seulontapilotti:** ks. [SEULONTAPILOTTI.md](../seulontapilotti/SEULONTAPILOTTI.md).
- **Tanskan pikakaista (27,4 %):** Guldbrandt ym., *BMC Health Services Research*.
- **Lung Health Check (76 %):** Ipsos ja Strategy Unit, TLHC final evaluation 2024.
- **NORDCAN-kuilu:** NORDCAN 2.0, ks. [Tilastot](../tilastot/kaksi-ovea-tilastot.xlsx).
