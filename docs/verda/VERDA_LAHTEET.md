# Verdan datalähteet: Equal Care -demo

14.11.2026 · Noel → Patrik. Tämä tiedosto on tarkoitettu annettavaksi Verdalle sellaisenaan. Siinä ovat kaikki lähteet, joista demon data ja näyttö on haettu, sekä säännöt haulle.

**Merkinnät:**
- ✅ avoin rajapinta tai tavallinen sivu
- 🟡 PDF tai muu tiedosto, jonka tekstin purkaminen voi epäonnistua
- 🔴 estää automaattiset haut tai vaatii selaimen

**Testattu 14.11.2026 palvelinhaulla ilman selainta** (sama tapa kuin demon palvelimella). Linkkejä on 43:
- 5 avointa rajapintaa palauttaa dataa suoraan: StatFin 11re ja 13u5 sekä Sotkanet 4404, 4405 ja 2371.
- 20 tavallista sivua palauttaa luettavaa tekstiä.
- 7 PDF:ää latautuu, mutta teksti pitää purkaa erikseen. Demon palvelimessa ei ole PDF-purkua.
- 11 linkkiä on estetty tai vaatii selaimen. Niihin kuuluvat molemmat Syöpärekisterin lähteet, joten alueiden syöpäluvut kannattaa tuoda tiedostosta [demo-tilastotuonti.json](../tilastot/demo-tilastotuonti.json).

**Verda ei hae linkkejä itse.** Demossa Verda saa yhden JSON-syötteen (enintään 28 000 merkkiä) ilman työkaluja ja palauttaa JSON-vastauksen. Linkit hakee demon palvelinkoodi, ja Verda näkee vain sen, mitä koodi sille lähettää.

## Ohjeet Verdalle

1. **Älä keksi lukuja.** Jos lähde ei vastaa tai lukua ei löydy, jätä kohta N/A-tilaan ja kirjaa syy.
2. **Tallenna jokaiselle luvulle** lähde-URL, taulukko tai sivu, vuosi tai jakso, ikäryhmä, ikävakiointi ja hakupäivä.
3. **Älä vertaa lukuja, joiden määritelmä eroaa** (vuosijakso, ikäryhmä, ikävakiointi tai sukupuoli).
4. **Vertaa tuloksia tarkistettuihin lukuihin** (alla). Jos luku eroaa, merkitse se tarkistettavaksi äläkä korvaa tarkistettua lukua.
5. **Ulkomaiset lähteet ovat vertailukohtia,** eivät suomalaista dataa. Merkitse ne aina maan mukaan.
6. **Tekoäly ei laske tuloksia.** Luvut tulevat lähteestä tai koodista, ja tekoäly vain hakee ja selittää.

## 1. Aluetilastot (hyvinvointialueittain)

| Mitä | Linkki | Haku |
| --- | --- | --- |
| Väestö, myös 55–80-vuotiaat (taulukko 11re) | https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/11re.px | ✅ |
| Kuntien liittäminen hyvinvointialueisiin | https://stat.fi/fi/luokitukset/corrmaps/kunta_1_20260101%23hyvinvointialue_1_20260101/ | ✅ |
| Päivittäin tupakoivat 20–64 v (demo käyttää) | https://sotkanet.fi/rest/1.1/json?indicator=4405&years=2024&genders=total | ✅ |
| Päivittäin tupakoivat 20+ v | https://sotkanet.fi/rest/1.1/json?indicator=4404&years=2024&genders=total | ✅ |
| Työterveyslääkärikäynnit / 1 000 15–64-v | https://sotkanet.fi/rest/1.1/json?indicator=2371&years=2025&genders=total | ✅ |
| Kuolemat C32–C34 alueittain (taulukko 13u5) | https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/ksyyt/13u5.px | ✅ |
| Keuhkosyöpätapaukset, ilmaantuvuus, kuolleisuus ja elossaolo (C33–C34) | https://tilastot.syoparekisteri.fi/syovat/ | 🔴 JavaScript-sovellus, palvelinhaku saa vain tyhjän sivun. Käytä Noelin löytämää rajapintaa, jos se on käytössä. |
| Parantavan hoidon osuus alueittain (taulukko 11) | https://syoparekisteri.fi/assets/themes/ssy3/factsheets/keuhkosyoparaportti.html | 🔴 Estää automaattiset haut (Cloudflare 403) |

## 2. Kansalliset luvut ja vertailu Pohjoismaihin

| Mitä | Linkki | Haku |
| --- | --- | --- |
| NORDCAN, viiden vuoden elossaolo (Suomi, Norja, Ruotsi) | https://nordcan.iarc.who.int/en/dataviz/survival?cancers=160&populations=246_578_752&sexes=1_2&survival=5 | 🔴 Vaatii selaimen (JavaScript-sovellus) |
| Hoitoon pääsy perusterveydenhuollossa 2025 | https://thl.fi/data-ja-tilastot/hoitoon-paasy/perusterveydenhuolto | ✅ Vain kansallinen luku |
| Tupakkatilasto 2023 (joskus tupakoineet, liitetaulukot 1, 2, 9 ja 10) | https://suomenash.fi/wp-content/uploads/2025/02/tupakkatilasto-2023.pdf | 🟡 PDF |
| Työterveyshuolto Suomessa 2023 | https://www.ttl.fi/file-download/download/public/8733 | 🟡 PDF |
| Syöpäseulontojen osallistuminen 2024 | https://www.sttinfo.fi/tiedote/72173590/kolme-aluetta-erottuu-edukseen-syopaseulonnoissa-helsingissa-osallistuminen-jaa-selvasti-jalkeen?lang=fi | ✅ |

## 3. Strategia ja Junctionin materiaalit

| Mitä | Linkki | Haku |
| --- | --- | --- |
| Kansallinen syöpästrategia 2026–2035 (tavoite 3, s. 5) | https://files.hackjunction.app/resources/Kansallinen_syopastrategia_2026_2035_FINAL.pdf | 🟡 PDF |
| Toimeenpanon tiekartta 2026–2031 (seulontapilotti s. 46–47) | https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf | 🟡 PDF |
| Junctionin lähdeluettelo | https://files.hackjunction.app/resources/Sy%C3%B6p%C3%A4strategiat%20ja%20sy%C3%B6p%C3%A4data_linkkikokoelma.pdf | 🟡 PDF, linkit ovat PDF:n linkkimerkinnöissä |
| Valtakunnallinen keuhkosyöpäohjelma 2026–2035 | https://www.filha.fi/wp-content/uploads/2026/05/Valtakunnallinen-keuhkosyopaohjelma-2026-2035_180526_preprint.pdf | 🟡 PDF |

## 4. Suomalaiset viiveet ja hoitopolut

| Mitä | Linkki | Haku |
| --- | --- | --- |
| Kaksi ovea: 127 vs. 76 päivää (lymfooma, 160 potilasta) | https://doi.org/10.1002/cam4.71920 | 🔴 Estää automaattiset haut (Cloudflare) |
| Satakunta: 15 pv, 59 pv, 22 % päivystyksen kautta (opinnäyte) | https://www.utupub.fi/handle/10024/180618 | 🟡 PDF |
| Pirkanmaan hoitopolku: TT noin viikossa, hälytysoireet | https://pirha.fi/documents/d/kehitysversio/keuhkosyopapotilaan-hoitopolku | 🟡 PDF |
| Terveyskeskukseen noin 2 viikkoa (Pohjoismaiden vertailu) | https://doi.org/10.2340/1651-226X.2025.42778 | ✅ |
| Potilaskysely viiveistä (Pfizer ja Suomen Syöpäpotilaat) | https://www.pfizer.fi/ajankohtaista/tiedotteet/keuhkosyopapotilaiden-hoitopolku-kaipaa-parannuksia-%E2%80%93-hoidon-viiveet-ja-tiedon-puute-huolestuttavat | ✅ |
| Keuhkosyövän viiveet 155 pv (julkaisematon tutkimus, Yle MOT) | https://yle.fi/a/74-20251023 | ✅ |
| THL 21/2016: seurannan kello alkaa lähetteestä | https://www.laakarilehti.fi/tieteessa/alkuperaistutkimukset/kohti-luotettavaa-syovan-hoitoon-paasyn-seurantaa-hilmon-ja-syoparekisterin-diagnoositietojen-vertailu/ | ✅ |

## 5. Seulontapilotti

| Mitä | Linkki | Haku |
| --- | --- | --- |
| ISC-LDCT-tutkimus (kriteerit, koko, ryhmät) | https://clinicaltrials.gov/study/NCT07331519 | 🔴 Vaatii selaimen (JavaScript-sovellus) |
| Syöpäjärjestöjen tiedote (alueet, ei henkilökohtaisia kutsuja) | https://www.syopajarjestot.fi/uutinen/keuhkosyovan-seulontapilotti-kaynnistyy-mukaan-etsitaan-pitkaan-tupakoineita-50-74-vuotiaita/ | ✅ |
| OYS:n tiedote | https://www.sttinfo.fi/tiedote/71750363/oys-mukana-keuhkosyovan-seulontapilotissa-tavoitteena-parantaa-taudin-varhaista-toteamista?publisherId=69817636&lang=fi | ✅ |
| Seura: paikat täyttyivät päivissä | https://seura.fi/asiat/ajankohtaista/keuhkosyopa-voi-kuulua-kansalliseen-seulontaohjelmaan/ | ✅ |
| Oulun aiempi seulontatutkimus (LDCT-SC-FI) | https://doi.org/10.2340/1651-226X.2025.43093 | ✅ |

## 6. Ulkomaiset vertailukohdat ja mallit

| Mitä | Linkki | Haku |
| --- | --- | --- |
| 🇬🇧 NICE NG12, syöpäepäilyn lähetesuositus (Delunin ajanvarauksen luokat) | https://www.nice.org.uk/guidance/ng12 | ✅ |
| 🇺🇸 PLCOm2012-riskimalli (Delunin riski) | https://pmc.ncbi.nlm.nih.gov/articles/PMC3929969 | ✅ |
| 🇩🇰 Pikakaista tavoitti vain 27,4 % keuhkosyöpäpotilaista | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4307896/ | ✅ |
| 🇩🇰 Pikakaistat: kolmen vuoden elossaolo 45 % → 54 % | https://doaj.org/article/15ccea42331548b1b43b87ac43ae986c | 🔴 Estää automaattiset haut (Cloudflare) |
| 🇩🇰 Pikakaistan osumatarkkuus 7,5 % | https://ugeskriftet.dk/dmj/reduced-specialist-time-direct-computed-tomography-suspected-lung-cancer-primary-care | ✅ |
| 🇩🇰 Yleislääkärin suorat TT:t, osumatarkkuus 2,3 % | https://read.qxmd.com/read/25748876/the-effect-of-direct-referral-for-fast-ct-scan-in-early-lung-cancer-detection-in-general-practice-a-clinical-cluster-randomised-trial | ✅ |
| 🇬🇧 Kiireelliset lähetteet, osumatarkkuus 15,3 % | https://doi.org/10.3399/bjgp22X718217 | ✅ |
| 🇬🇧 Lung Health Check: 1,7 %, 76 % varhaisvaiheessa, osallistuminen 44 % | https://www.ipsos.com/en-uk/evaluation-targeted-lung-health-check-programme-nhs-england | ✅ |
| 🇬🇧 Manchesterin pilotti: 80 % varhaisvaiheessa | https://doi.org/10.1136/thoraxjnl-2017-211377 | 🔴 Estää automaattiset haut (Cloudflare) |
| 🇦🇺 CHEST Australia: oirekehotus lisäsi käyntejä 40 % | https://doi.org/10.1136/thoraxjnl-2018-212506 | 🔴 Estää automaattiset haut (Cloudflare) |
| 🇫🇷🇩🇪 Pitkittyneen yskän esiintyvyys tupakoineilla | https://pmc.ncbi.nlm.nih.gov/articles/PMC8752938 | 🟡 PMC voi pyytää robottitarkistusta toistuvissa hauissa |
| Oireiden todennäköisyyssuhteet (meta-analyysi, Okoli 2018) | https://pmc.ncbi.nlm.nih.gov/articles/PMC6248994 | 🟡 PMC voi pyytää robottitarkistusta toistuvissa hauissa |

## Mitä mikään linkki ei anna

Jätä nämä N/A-tilaan tai oletuksiksi. Älä hae niitä arvaamalla.

| Puuttuu | Miksi | Mistä saadaan |
| --- | --- | --- |
| Terveyskeskusten hoitoonpääsy alueittain | Ei löytynyt THL:n sivuilta | Kokeile Sotkanetia (https://sotkanet.fi/sotkanet/fi/index) |
| Työterveyden kattavuus alueittain | Kelan aluetaulukkoa ei löytynyt | Kokeile Kelastoa (https://tietotarjotin.kela.fi/kelasto) |
| TT- ja lääkärikapasiteetti sekä jonot alueittain | Ei ole julkista tietoa | Mentorit, tai luvut merkitään oletuksiksi |
| Elossaolo hyvinvointialueittain | Julkaistaan vain viidelle yhteistyöalueelle | N/A |
| Levinneisyys alueittain | Julkaistaan vain koko maasta | N/A |
| Seulontapilotin alueiden vahvistus | Tieto on vain lehdistötiedotteissa | Kaisa Kaitila (AstraZeneca) |
| Kustannukset | Ei lähdettä | Jätetään pois |

## Tarkistetut luvut vertailua varten

Nämä luvut on tarkistettu 14.11.2026. Koko aineisto 24 alueelle on tiedostossa [demo-tilastotuonti.json](../tilastot/demo-tilastotuonti.json) demon omassa muodossa (ohje: [DEMO_TUONTI.md](../tilastot/DEMO_TUONTI.md)).

| Luku | Lappi | Koko maa |
| --- | ---: | ---: |
| 55–80-vuotiaat (2025) | 62 353 | 1 741 258 (sis. Ahvenanmaan) |
| Keuhkosyöpätapaukset 2020–2024 | 674 | 14 972 |
| Ilmaantuvuus, ikävakioitu (2020–2024) | 58,26 / 100 000 | 46,98 / 100 000 |
| Kuolleisuus, ikävakioitu (2020–2024) | 46,79 / 100 000 | 35,79 / 100 000 |
| Parantava hoito 12 kk:ssa (2019–2023) | 18,5 % | 27,0 % |
| Viiden vuoden elossaolo (2022–2024) | ei alueittain | 20,54 % |
