# Keuhkosyövän pikakaistan priorisointimalli

14.11.2026 · Delun Li · Haara `feature/combined`. Malli kuvaa, miten demo päättää, kuka nousee lääkärin listalle, kuka saa ajan ja missä järjestyksessä oireettomat tupakoineet kutsutaan seulontaan. Kaikki demon potilaat ovat synteettisiä. Mallia ei ole kalibroitu Suomen väestöön, eikä sitä saa käyttää oikeilla potilailla ilman lääketieteellistä tarkistusta.

Priorisointi tehdään kahdessa portaassa. Oireet käsitellään aina ensin, eikä mikään riskipistemäärä ohita niitä.

| Porras | Ketä koskee | Mihin perustuu | Näkymä |
| --- | --- | --- | --- |
| 1 | Kaikki, joilla on oireita | Hälytyssäännöt ja NICE NG12 | Lääkäri |
| 2 | Oireettomat, joskus tupakoineet 50–74-vuotiaat | PLCOm2012-riskimalli | Seulontalista |

## Porras 1: oireiset

### 1.1 Kuka nousee lääkärin listalle

Kuka tahansa, joka ilmoittaa vähintään yhden oireen: yskä, verta yskösissä, laihtuminen, hengenahdistus, rintakipu tai keuhkokuume viimeisen vuoden aikana. Ikä ja tupakointi eivät vaikuta tähän. Koodi: `symptomReviewRequired` tiedostossa [src/lib/rules.ts](../src/lib/rules.ts).

### 1.2 Hälytyspisteet

| Löydös | Pisteet |
| --- | --- |
| Verta yskösissä (hälytysmerkki) | 3 |
| Yskä vähintään 3 viikkoa | 1 |
| Selittämätön laihtuminen | 1 |
| Hengenahdistus | 1 |
| Rintakipu | 1 |
| Vähintään 2 keuhkokuumetta viimeisen vuoden aikana | 1 |
| Oireet jatkuvat hengitystieoireen vuoksi tehdyn käynnin jälkeen (enintään 6 kk) | 1 |

Riskiryhmään kuuluvalle (ikä 50–74 kuten seulontapilotissa, tupakoinut, vähintään 20 askivuotta) sääntöjen ehdotus on:

- hälytysmerkki tai vähintään 3 pistettä → lääkärin arvio TT-lähetteen tarpeesta
- 1–2 pistettä → lääkärille muutaman päivän sisällä
- 0 pistettä → tavallinen reitti

### 1.3 Järjestys lääkärin listalla

1. Demossa juuri annetut vastaukset
2. Hälytysmerkki (verta yskösissä)
3. Muut oireiset
4. Sääntöjen ehdotus: TT-arvio, sitten lääkäri, sitten tavallinen reitti
5. Hälytyspisteet, suurin ensin
6. PLCOm2012-riski, suurin ensin (vain tasatilanteissa)

Koodi: `compareWithPriority` tiedostossa [src/lib/store.ts](../src/lib/store.ts).

### 1.4 Simuloitu ajanvaraus

Luokat perustuvat NICE NG12 -suositukseen (luettu nice.org.uk:sta 14.11.2026).

| Luokka | Ehto | Tavoiteaika |
| --- | --- | --- |
| A | Ikä vähintään 40 ja verta yskösissä (NG12 1.1.1) | 3 arkipäivää |
| B | Ikä vähintään 40 ja joko kaksi oiretta tai tupakoinut ja yksi oire (NG12 1.1.2: yskä vähintään 3 vk, hengenahdistus, rintakipu, laihtuminen). Lisäksi oireiset, joiden PLCOm2012-riski on vähintään 2 %. | 2 viikkoa (NICE: "urgent" = alle 2 viikkoa) |

Ajat jaetaan listan järjestyksessä, A ennen B:tä, kunnes kapasiteetti loppuu:

```text
aikoja yhteensä = alueen pikakaistan lääkäriaikoja viikossa × 2 viikkoa
```

Ajat ovat arkipäivisin 20 minuutin välein kello 8 alkaen. Ne, joille aikaa ei jää, menevät jonoon. Jo varattuja aikoja ei siirretä, kun uusi vastaus saapuu, vaan lääkäri voi järjestää ajat uudelleen napilla. Alueen viikkokapasiteetti tulee Päättäjä-näkymän perusskenaariosta (alueen 50–74-vuotiaat × tupakoinnin osuus × oletukset), ja sen voi myös asettaa käsin. Koodi: [src/lib/booking.ts](../src/lib/booking.ts).

## Porras 2: oireettomat tupakoineet

### 2.1 Kuka on mukana

Ei oireita, on joskus tupakoinut ja ikä 50–74. Koskaan tupakoimattomia malli ei koske, ja oireiset kuuluvat portaaseen 1.

### 2.2 PLCOm2012-riski

Lähde: Tammemägi MC ym., *Selection criteria for lung-cancer screening*, N Engl J Med 2013;368:728–736, taulukko 2. Kertoimet on tarkistettu PMC-käsikirjoituksesta (PMC3929969) 14.11.2026, ja niitä käytetään muuttamattomina.

```text
logit = −4,532506
      + 0,0778868 × (ikä − 62)
      − 0,0812744 × (koulutus 1–6 − 4)
      − 0,0274194 × (painoindeksi − 27)
      + 0,3553063 × keuhkoahtaumatauti (1/0)
      + 0,4589971 × aiempi syöpä (1/0)
      + 0,587185  × keuhkosyöpä lähisuvussa (1/0)
      + 0,2597431 × tupakoi edelleen (1/0)
      − 1,822606  × (10 / savukkeita päivässä − 0,4021541613)
      + 0,0317321 × (tupakointivuodet − 27)
      − 0,0308572 × (vuosia lopettamisesta − 10)
      + väestöluokan kerroin

kuuden vuoden riski = e^logit / (1 + e^logit)
```

| Väestöluokka (valinnainen kysymys) | Kerroin |
| --- | --- |
| Valkoinen (vertailuluokka, oletus) | 0 |
| Musta | 0,3944778 |
| Latinalaisamerikkalainen | −0,7434744 |
| Aasialainen | −0,466585 |
| Amerikan tai Alaskan alkuperäiskansa | 0 |
| Havaijin tai Tyynenmeren alkuperäiskansa | 1,027152 |

- Nykyisillä tupakoijilla lopettamisaika on 0.
- Puuttuvat tiedot täydennetään mallin keskiarvolla (esim. koulutus 4, painoindeksi 27), ja täydennetyt tiedot näytetään.
- Koulutuksen kuusi tasoa on sovitettu suomalaisiin tutkintoihin tiimin oletuksena.

Koodi: [src/lib/plco.ts](../src/lib/plco.ts). Testit vertaavat koodia julkaisun yhtälöön: [src/lib/priority.test.ts](../src/lib/priority.test.ts).

### 2.3 Riski ilman ikää (tasa-arvoinen järjestys, oletus)

Sama kaava, mutta ikään laitetaan kaikille 62 vuotta, jolloin iän termi on 0. Jäljelle jäävät tupakoinnin, sairauksien, suvun, koulutuksen ja painoindeksin vaikutukset. Kaksi ihmistä, joilla on samat riskitekijät, saavat näin saman sijan iästä riippumatta. Tämä on tiimin tasa-arvoratkaisu eikä validoitu riski. Todellinen riski näytetään rinnalla.

### 2.4 Kutsukelpoisuus

```text
kutsukelpoinen, jos todellinen riski ≥ 1,3455 % TAI riski ilman ikää ≥ 1,3455 %
```

Raja 1,3455 % on julkaisusta. Se valitsee yhtä monta henkilöä kuin NLST-tutkimuksen ikä- ja askivuosikriteerit. Ehdon TAI-muodon ansiosta kukaan, jonka validoitu malli kutsuisi, ei menetä paikkaansa.

### 2.5 Järjestys ja kutsut

1. Riski ilman ikää, suurin ensin (absoluuttisessa tilassa todellinen riski)
2. Tasatilanteessa todellinen riski
3. Tunnus

```text
kutsujen määrä = TT-kuvauksia viikossa × kutsujakson viikot   (oletus 5 × 4 = 20)
kutsuviikko    = ⌈ sija / TT-kuvauksia viikossa ⌉
```

Listan kärki kutsutaan kapasiteetin verran, ja muut kynnyksen ylittäjät odottavat kutsua. Merkinnät:
- **Täydennä tiedot ennen kutsua:** keskeisiä mallin tietoja on täydennetty.
- **Alle 55 v:** henkilö on mallin kehitysjoukon (55–74 v) ulkopuolella.

Koodi: [src/lib/screening.ts](../src/lib/screening.ts).

### 2.6 Esimerkki demon datalla (20 kuvausta)

| Järjestys | Kutsuttujen keski-ikä | Vähintään 75-vuotiaita | Mallin odottamat syövät kutsutuilla |
| --- | --- | --- | --- |
| Tasa-arvoinen (riski ilman ikää) | 69,6 v | 6/20 | 1,60 |
| Absoluuttinen riski | 73,2 v | 9/20 | 1,68 |

Tasa-arvoinen järjestys jakaa kutsut tasaisemmin ikäryhmien kesken. Mallin mukaan se löytää samalla kuvausmäärällä noin 5 % vähemmän syöpiä, koska ikä on todellinen riskitekijä. Valinta on arvovalinta, joka kuuluu alueen päätettäväksi.

## Mikä perustuu tutkimukseen ja mikä on oletusta

| Tutkimukseen perustuvaa | Tiimin oletuksia |
| --- | --- |
| PLCOm2012-kaava ja kertoimet | hälytyspisteet ja rajat (3 vk, 2 keuhkokuumetta, 3 pistettä, 6 kk) |
| kynnys 1,3455 % | riski ilman ikää |
| NICE NG12 -luokat A ja B | A:n 3 päivän tavoite, PLCOm2012 ≥ 2 % B-luokassa, yskä vähintään 3 vk |
| NICE: kiireellinen = alle 2 viikkoa | kapasiteetit, ikäraja 50–74 (seulontapilotin mukaan, muutettu 14.11.), koulutuksen suomalainen sovitus |

## Avoimet asiat

- Hälytyspisteiden rajat ja kysymyspankki tarvitsevat lääketieteellisen tarkistuksen.
- PLCOm2012:ta ei ole kalibroitu Suomeen, eikä julkaisun korjausliitettä (NEJM 369:394) ole tarkistettu.
- Mallin kehitysjoukon ikärajaa 55–74 ei ole tarkistettu uudelleen.
- Tutkimuksessa ehdotettu järjestäminen voitettujen elinvuosien mukaan on tarkistamatta.
- Seulonnan todellinen TT-kapasiteetti pitää kysyä mentoreilta.

Perustelut ja päätökset: [DECISIONS.md](DECISIONS.md).
