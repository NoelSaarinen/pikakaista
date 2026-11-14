# Delunin muutokset Noelin sovellukseen

14.11.2026 · Haara `feature/patient-pathway`, joka on haarautettu Noelin haarasta `feature/mvp-skeleton`. Tämä opas listaa kaikki muutokset ja kertoo, miten ne saa käyttöön. Perustelut ovat tiedostossa [DECISIONS.md](DECISIONS.md).

## Nopein tapa: ota muutokset Gitillä

Muutoksia ei tarvitse tehdä käsin. Ne ovat kahdessa commitissa:

| Commit | Sisältö |
| --- | --- |
| `bc5882e` | Hoitopolku ja sitoutuminen jokaiselle potilaalle |
| `82745c0` | PLCOm2012-riski, kyselyn AI-analyysi ja kirjallisuusseuranta |

**Pelkkä kokeilu** omalla koneella (repokansiossa):

```sh
git fetch
git switch feature/patient-pathway
npm install
npm run dev
```

Avaa http://localhost:3000.

**Yhdistäminen Noelin haaraan.** Avaa pull request osoitteessa https://github.com/patw1kkkk/junction-2026/pull/new/feature/patient-pathway ja valitse kohdehaaraksi (base) `feature/mvp-skeleton`. Koeyhdistäminen Noelin uusimpaan versioon (`a76dd52`, 14.11. klo 13.03) meni läpi ilman konflikteja, koska muutokset koskevat eri tiedostoja.

**Tekoäly (valinnainen).** Kopioi `.env.example` nimelle `.env.local` ja lisää rivi `ANTHROPIC_API_KEY=...`. Älä koskaan commitoi avainta. Ilman avainta sovellus toimii sääntöpohjaisesti, ja yläpalkissa lukee "Tekoäly: pois (säännöt)".

## Muutokset yksi kerrallaan

### 1. Hoitopolku ja sitoutuminen

**Mitä käyttäjä näkee**
- Uusi **Seuranta**-sivu (`/pathway`), jossa näkyvät kaikki 200 henkilöä: sitoutuminen, nykyinen vaihe hoitopolulla, PLCOm2012-riski ja seuraava toimenpide. Listaa voi suodattaa sitoutumisen ja vaiheen mukaan sekä hakea tunnuksella.
- Lääkärinäkymän listariveillä näkyvät sitoutuminen ja vaihe. Potilaskortissa näkyy hoitopolku vaihe vaiheelta, ja väliin jäänyt käynti on merkitty punaisella.
- Sitoutumisella on kolme tasoa: *Sitoutunut*, *Tarvitsee tukea* (muistutuksia tai siirretty aika) ja *Vaarassa pudota pois* (käynti jäi väliin tai hoitaja ei tavoittanut). Jokaisen kohdalla näkyvät perustelut.
- Hoitopolun vaiheet: kysely tai hoitajan tarkistuslista → lääkärin arvio → lääkärikäynti → TT-kuvaus → radiologin lausunto → tulos (jatkotutkimukset tai ei löydöstä). Lisäksi tavallinen reitti ja "ei riskiryhmässä".
- Kun lääkäri tekee päätöksen, potilas siirtyy vaiheeseen "TT-kuvaus varattu" tai "Lääkärikäynti varattu".

**Tiedostot**
- Uudet: `src/lib/pathway.ts` (logiikka), `src/components/PathwayCard.tsx`, `src/app/pathway/page.tsx`, `src/app/api/patients/route.ts`, `src/lib/pathway.test.ts`
- Muutetut: `src/lib/store.ts` (funktio `patients()`, ja jokaisella rivillä on `pathway`), `src/app/clinician/page.tsx`, `src/app/layout.tsx` (Seuranta-linkki), `src/app/page.tsx` (etusivun kortti)

**Oletukset**
- Kaikki seurantatieto on synteettistä. Se lasketaan potilaan tunnuksesta, joten sama henkilö saa aina saman tilan.
- Osuudet ovat `PATHWAY_ASSUMPTIONS`-asetuksessa: 15 % heikosti sitoutuneita, 25 % tukea tarvitsevia ja 55 %:lla pikakaistan potilaista valmiiksi lääkärin päätös.
- Osalla pikakaistan potilaista on valmiiksi lääkärin päätös, jotta demossa näkyy eri vaiheita. Tämä muuttaa Noelin alkuperäistä asetelmaa, jossa kaikki odottivat päätöstä.

### 2. PLCOm2012-riskimalli

**Mitä käyttäjä näkee**
- Lääkärin listalla ja Seuranta-sivulla näkyy PLCOm2012:n kuuden vuoden keuhkosyöpäriski, esimerkiksi "PLCO 3,3 %". Riskiluokat ovat alle 1 %, 1–2 % ja vähintään 2 %.
- Lääkärin lista järjestetään näin: ensin hälytysmerkit (kuten ennenkin), saman kiireellisyyden sisällä PLCOm2012-riski. **Riski ei koskaan muuta sääntöjen ehdotusta.**
- Potilaskortissa näkyvät mallin tekijät riskikertoimina (esim. "Ikä ×3,22"), tieto kynnyksen ylityksestä ja täydennetyt puuttuvat tiedot.
- Kyselyyn tuli uusia kysymyksiä: lopettamisesta kulunut aika, keuhkoahtaumatauti, aiempi syöpä, lähisuvun keuhkosyöpä, pituus, paino ja koulutus.

**Tiedostot**
- Uudet: `src/lib/plco.ts` (malli), `src/lib/priority.ts`, `src/lib/priority.test.ts`
- Muutetut: `src/lib/types.ts` (kenttä `plco` ja tyyppi `PlcoInputs`), `src/app/survey/page.tsx`, `src/app/api/responses/route.ts` (uusien kenttien tarkistus), `scripts/generate-synthetic.mjs` ja `src/data/synthetic/responses.json` (mallin tiedot synteettisille henkilöille)

**Lähde ja oletukset**
- Malli: Tammemägi MC ym., *Selection criteria for lung-cancer screening*, N Engl J Med 2013;368:728–736, taulukko 2. Kertoimet on tarkistettu PMC-käsikirjoituksesta (PMC3929969) 14.11.2026, ja niitä käytetään muuttamattomina.
- Kynnys 1,3455 % on julkaisusta. Usein mainittua 1,51 %:a ei ole tässä julkaisussa.
- Etnistä taustaa ei kysytä, joten kaikille käytetään mallin vertailuluokkaa. Nykyisillä tupakoijilla lopettamisaika on 0. Puuttuvat tiedot täydennetään mallin keskiarvoilla.
- Suomalaisen koulutuksen sovitus mallin kuuteen tasoon on oma oletuksemme.
- Malli ei koske koskaan tupakoimattomia, joten heidän kohdallaan näkyy "PLCO –".
- Synteettiset mallitiedot tehtiin erillisellä satunnaislukugeneraattorilla, joten yhdenkään henkilön aiemmat tiedot eivät muuttuneet.
- Testit vertaavat koodia julkaisun yhtälöön, joka on kirjoitettu testiin erikseen julkaisun numeroista.

### 3. Kyselyn alustava AI-analyysi ja jatkokysymykset

**Mitä käyttäjä näkee**
- Lääkärin potilaskortissa on analyysikortti, jossa **kiireellisyys** (hälytyssäännöt päättävät) ja **pitkän aikavälin riski** (PLCOm2012) ovat erillään.
- Kyselyn lähettämisen jälkeen kysytään enintään kolme mukautuvaa jatkokysymystä kiinteästä kysymyspankista. **Vastaaja näkee vain kysymykset**, ei riskiarviota. Hoitajan tarkistuslistassa näkyy koko analyysi.
- Jatkokysymysten vastaukset päivittyvät lääkärin yhteenvetoon.

**Tiedostot**
- Uudet: `src/lib/analysis.ts` (kysymyspankki ja analyysi), `src/components/AnalysisCard.tsx`, `src/app/api/analyze/route.ts`, `src/app/api/followup/route.ts`
- Muutetut: `src/lib/llm.ts` (uusi funktio `completeJson`, Claude structured outputs), `src/lib/summarize.ts` ja `src/app/api/summarize/route.ts` (jatkokysymysten vastaukset yhteenvetoon), `src/app/clinician/page.tsx`, `src/app/survey/page.tsx`

**Turvasäännöt**
- Tekoäly ei voi laskea kiireellisyyttä. Sääntöjen ehdotus on aina tekstin alussa.
- Tekoäly valitsee kysymykset vain pankista. Se ei keksi omia.
- Ilman API-avainta sama tehdään säännöillä.

### 4. Kirjallisuusseuranta (Tutkimus-sivu)

**Mitä käyttäjä näkee**
- Uusi **Tutkimus**-sivu (`/evidence`). Se näyttää uusimmat keuhkosyöpäartikkelit seitsemästä lehdestä (The Lancet, NEJM, JAMA, BMJ, JCO, JTO ja Nature Medicine) näytön vahvuuden mukaan järjestettynä.
- Sivu nostaa erikseen esiin riskimalleja koskevat tutkimukset ja kertoo, mitä uutta kyselyn riskitekijöistä on julkaistu.
- "Hae uusimmat artikkelit" -nappi hakee PubMedista vain sellaiset artikkelit, joita ei ole jo käytetty.
- **Pelkkää tietoa:** sivu ei muuta kenenkään riskiä.

**Tiedostot**
- Uudet: `src/lib/literature/pubmed.ts` (haku), `src/lib/literature/evidence.ts` (painotus ja kaksoiskappaleet), `src/lib/literature/extract.ts` (Claude-luokittelu), `src/lib/literature/refresh.ts`, `src/lib/literature/evidence.test.ts`, `src/app/evidence/page.tsx`, `src/app/api/evidence/route.ts`, `src/app/api/evidence/refresh/route.ts`, `src/data/literature.json` (40 artikkelin tilannekuva demoa varten), `scripts/save-literature-snapshot.mjs`
- Muutetut: `package.json` (komento `npm run literature:snapshot`), `src/lib/store.ts`

**Miten painotus toimii**
- Näytön vahvuus = tutkimusasetelma × otoskoko × tuoreus × aiheen merkitys. Meta-analyysi saa asetelmalle 1,0 ja pääkirjoitus 0. Hoitotutkimukset saavat painon 0.
- Sama artikkeli käytetään vain kerran (PMID, DOI tai otsikko), ja saman aineiston (esim. NLST) julkaisut lasketaan yhtenä.
- Lähde on PubMed E-utilities. Se on ilmainen eikä vaadi avainta.
- Ilman API-avainta artikkelit luokitellaan avainsanoilla. Avaimen kanssa komento `npm run literature:snapshot` luokittelee ne Claudella.

### 5. Tekoälyn tila yläpalkissa

- `src/app/layout.tsx`: merkki "Tekoäly: Claude" tai "Tekoäly: pois (säännöt)".
- `src/app/api/ai-status/route.ts`: kertoo, onko avain asetettu. Itse avainta se ei koskaan näytä.

### 6. Dokumentaatio

- `README.md`: viisi näkymää, uudet komennot ja tiedostojen sijainnit
- `docs/DECISIONS.md`: kolme päätöstä (hoitopolku, AI-analyysi ja kirjallisuus, PLCOm2012)
- `docs/RESOURCES.md`: PubMed E-utilities ja tarkistuspäivä

## Näin tarkistat, että kaikki toimii

```sh
npm test        # 52 testiä, mukana PLCOm2012 julkaisun yhtälöä vasten
npm run lint
npm run build
```

Käy läpi selaimessa:
1. **Kysely:** täytä kysely ja rastita esimerkiksi "Verta yskösissä". Lähetyksen jälkeen pitäisi näkyä jatkokysymyksiä.
2. **Lääkäri:** avaa potilas. Kortissa pitäisi näkyä analyysi, PLCOm2012-riski, hoitopolku ja sitoutuminen. Kun hyväksyt ehdotuksen, vaihe muuttuu muotoon "varattu".
3. **Seuranta:** suodata "Vaarassa pudota pois" ja tarkista, että seuraava toimenpide on hoitajan soitto.
4. **Tutkimus:** artikkelit näkyvät näytön vahvuuden mukaan.

## Avoimet asiat

- Peruspisteet, hälytyskynnykset ja kysymyspankki tarvitsevat lääketieteellisen tarkistuksen.
- PLCOm2012:ta ei ole validoitu Suomessa. Julkaisun korjausliite (NEJM 369:394) on tarkistamatta.
- Claude-tekoälyä ei ole vielä testattu oikealla API-avaimella.
- Pitkittäisseuranta (viikoittaisten vastausten trendit) on vielä rakentamatta.
