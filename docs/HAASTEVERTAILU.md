# Haastevertailu: syöpä vai mielenterveys

13.11.2026 · Kooste Noelin ja Clauden sparrauksesta päätöksen tueksi. Haasteiden kuvaukset ovat tiedostossa [CHALLENGES.md](CHALLENGES.md), ja syöpähaasteen ideat ovat sivulla [ideointi](SYOPAHAASTE_IDEOINTI.md).

## Haasteet lyhyesti

| | **Syöpä** · *Equal Care Across Finland* (AstraZeneca) | **Mielenterveys** · *Beyond the Clinic* (Aalto) |
| --- | --- | --- |
| **Tehtävä** | Löydä alue-ero syövänhoidossa, näytä missä hoitopolun vaiheessa se syntyy ja ehdota korjaus. | Tuote, joka auttaa pysymään hyvässä kunnossa kotona masennushoidon jälkeen: tunnistaa voinnin, auttaa ja oppii, mikä toimii juuri tälle ihmiselle. |
| **Lopputulos** | Analyysi ja suositus, joita tukee toimiva demo | Toimiva tuote |
| **Arviointi** | Toteutettavuus 30 %, oivallus 25 %, datan laatu 20 %, demo 15 %, selkeys 10 % | Hyödyllisyys, arjen helppous, älykäs tunnistus ja oppiminen sekä luovuus, kukin 25 % |
| **Palkinto** | 1 000 € | 2 000 € ja laboratoriovierailu |
| **Jatko kilpailun jälkeen** | AstraZeneca haluaa jatkaa yhteistyönä jonkin hyvinvointialueen kanssa | Mahdollisuus jatkaa kehitystä Aallon tutkijoiden kanssa |
| **Laitteet** | Pelkät läppärit | Läppäri, puhelin ja **Joelin älykello**. Lisäksi Hardware Labista voi lainata Arduinon ja sen LED- ja liikeanturit. |

## Kumpi sopii kenellekin

| Tiimiläinen | Syöpä | Mielenterveys |
| --- | --- | --- |
| **Delun** (HUS-tutkija, lääkis, pitch) | ✅✅ Hoitopolkujen tuntemus ja HUS-taustan uskottavuus | ✅ Lääketieteellinen osaaminen |
| **Joel** (Next.js, älykello) | ✅ Demon käyttöliittymä | ✅✅ Sovellus ja kellon data |
| **Patrik** (Python, pienet ML-mallit, Arduino) | ✅ Data-analyysi | ✅✅ Anturit ja oppiva algoritmi |
| **Suomen kieli** | ✅✅ Kaikki lähteet ovat suomeksi, mikä on etu kansainvälisiin tiimeihin nähden | Ei merkitystä |

## Vahvuudet ja riskit

**Syöpä**
- ✅ **Etumme:** Delunin HUS-tausta ja suomen kieli ovat etuja, joita muilla tiimeillä tuskin on.
- ✅ **Arviointi sopii meille:** noin 85 % pisteistä tulee muusta kuin teknisestä toteutuksesta.
- ✅ **Konkreettinen jatkopolku:** AstraZeneca tarjoaa pilottia hyvinvointialueen kanssa, ja kansallinen tiekartta tarvitsee tällaisia työkaluja vuosina 2026–2028.
- ⚠️ **Dataa on vähän:** hoitopolun vaiheista ei ole juuri julkista tietoa.
- ⚠️ **Hidas markkina yritykselle:** Suomessa on noin 22 ostajaa, myynti kulkee julkisten hankintojen kautta, ja riskisijoittajia aihe kiinnostaa vain maltillisesti.

**Mielenterveys**
- ✅ **Tuplapalkinto ja suurempi markkina.**
- ✅ **Joelin älykello:** voinnin tunnistus perustuu oikeaan dataan, kuten uneen, leposykkeeseen, aktiivisuuteen ja sykevälivaihteluun (HRV).
- ✅ **Patrik pääsee tekemään laitteistoa ja algoritmia,** kuten hän toivoi.
- ⚠️ **Moni tiimi tekee mielialasovelluksen:** idean pitää erottua. Esimerkiksi tuote voi lukea voinnin passiivisesti eikä kysy käyttäjältä mitään.
- ⚠️ **Jatko on enemmän tutkimusta kuin yritystoimintaa:** tuotteeksi asti pääseminen vaatii jatkuvaa teknistä kehitystä ja kliinistä näyttöä.
- ⚠️ **Kellon datan saaminen ulos on testaamatta.**

## Arvio

**Syöpähaaste on hieman edellä,** koska jatkopolku on konkreettisempi ja etumme on vaikea kopioida. Joelin älykellon ansiosta ero on kuitenkin pieni. **Valinnan kannattaa ratkaista sen, kumpi innostaa tiimiä enemmän.**

## Ennen päätöstä

1. **Kertokaa, kumpi innostaa:** jokainen sanoo oman suosikkinsa ja yhden syyn.
2. **Testatkaa älykello** ennen kuin valitsette mielenterveyden:
   - Mikä malli Joelilla on?
   - Saako datan vietyä ulos, ja löytyykö siitä uni, leposyke, askeleet ja HRV?
   - Esimerkiksi Apple Watchin datan saa iPhonen Terveys-sovelluksesta: profiilikuva → *Vie kaikki terveystiedot*.
3. **Selvittäkää haastesivujen tila:** molemmissa näkyi *Status: Closed*. Kysykää järjestäjiltä, mitä se tarkoittaa.
4. **Jos valitsette syövän,** jatkakaa [kysymyssivulta](SYOPAHAASTE_KYSYMYKSET.md) ja menkää vielä tänä iltana AstraZenecan mentorien luo.

Alustava palautus pitää tehdä **perjantaina klo 23:55 mennessä**.
