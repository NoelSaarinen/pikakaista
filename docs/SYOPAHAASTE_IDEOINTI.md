# Syöpähaaste: ideointi

AstraZeneca · *Equal Care Across Finland* · luonnos 13.11.2026. Haastetta ei ole vielä valittu. Lähteet ja tarkemmat tiedot ovat tiedostossa [IDEAS.md](IDEAS.md#equal-care-across-finland). **Vastatkaa myös tiimin [kysymyksiin](SYOPAHAASTE_KYSYMYKSET.md).**

## Haaste lyhyesti

Rakennetaan tekoälyratkaisu, joka:

1. löytää eron syövänhoidossa
2. näyttää, missä hoitopolun vaiheessa ero syntyy
3. ehdottaa konkreettisen korjauksen.

Jokaiselle väitteelle pitää näyttää lähde, ja demon pitää toimia livenä.

**Pisteytys:** toteutettavuus 30 %, oivallus 25 %, datan laatu ja läpinäkyvyys 20 %, toteutus 15 %, selkeys 10 %.

## Mitä asiakirjat kertovat

Lähteinä ovat kansallinen syöpästrategia ja sen tiekartta.

- **Tavoite 3 mittaa kolmea asiaa:** huonoennusteisten syöpien elossaolo nousee pohjoismaiselle tasolle (keuhkosyövässä +14 prosenttiyksikköä), syöpäkuolleisuus laskee 10 % ja hoitoon päästään tavoiteajoissa.
- **Julkinen polku on hidas:** julkaisemattoman lymfoomatutkimuksen mukaan diagnoosiin menee kaksi kertaa niin kauan, kun potilas menee julkiselle puolelle yksityisen sijaan.
- **Suurimmalla osalla ei ole työterveyttä:** vain noin kolmannes syöpään sairastuneista on työikäisiä.
- **Viivettä ei mitata:** aikaa ensioireesta diagnoosiin ei kerätä, ja levinneisyystieto on kirjattu vain noin 40 %:ssa tapauksista.
- **Tavoiteaikoja ei vielä ole:** syöpäkohtaiset tavoiteajat ja pohjoismaiset pakettipolut määritellään ja pilotoidaan hyvinvointialueilla vuosina 2026–2028.

## Ehdotus: Kaksi ovea + ensioirekello

| Vaihe | Sisältö |
| --- | --- |
| **Aukko** | Riskiryhmä kulkee hitaimmasta ovesta, eli terveyskeskuksen kautta. |
| **Missä** | Ensikäynnin ja lähetteen välissä. |
| **Mitä tehdään** | Syöpäepäilyn pikakaista terveyskeskukseen: hoitaja arvioi potilaan standardoitujen hälytysoireiden perusteella, ja lääkäri lähettää suoraan kuvantamiseen tai tähystykseen. |
| **Miten mitataan** | Ensioirekello: tekoäly muuttaa potilaan kertomuksen aikajanaksi ja näyttää, mikä hoitopolun vaihe venyy. |

**Kahden minuutin demo:** kartta hyvinvointialueista → valitaan alue → tekoälyn tiivistelmä näyttää aukon, vaiheen, toimenpiteen ja lähteet → ensioirekello synteettisellä potilastarinalla.

**Miksi tämä:** muut tiimit vertaavat alueita keskenään, me näytämme eron myös saman alueen sisällä. Lisäksi hyvinvointialue voi aloittaa pikakaistan heti, ja AstraZeneca haluaa juuri tällaisen jatkoprojektin.

## Muut vaihtoehdot

- **Pilottikartta** (varasuunnitelma, jos dataa ei löydy): kertoo, millä alueella ja minkä syövän kohdalla pakettipolut kannattaa pilotoida ensin.
- **Etäisyysvero:** hoitotulokset heikkenevät, kun matkaa hoitoyksikköön on yli 50 km. Kartta näyttää, keitä tämä koskee ja mitä hoitoja tuodaan lähemmäs.
- **Pohjoismainen kuilu:** kertoo alueittain, montako keuhkosyöpäkuolemaa vältettäisiin pohjoismaisella elossaolotasolla.

## Roolit (ehdotus)

- **Lääkis:** hälytysoireet ja triage, lääketieteellinen tarkistus ja keskustelut mentorien kanssa.
- **Informaatioverkostot ×2:** data, demo ja pitch. Joel tuntee Next.js:n.
- **Sähkötekniikka:** laskenta ja simulaatio sekä karttaosa.

## Tänään

1. **Kysykää AstraZenecan mentoreilta:**
   - Onko alueellista dataa siitä, mitä kautta potilaat päätyvät diagnoosiin (julkinen, yksityinen vai työterveys)?
   - Mitä tavoiteaikoja THL:n ohje 21/2016 asettaa?
   - Millä aluetasolla Syöpärekisterin tilastot ovat, ja sisältävätkö ne levinneisyyden?
2. **Päättäkää idea:** kirjatkaa valinta [DECISIONS.md](DECISIONS.md):hen.
3. **Tehkää alustava palautus perjantaina klo 23:55 mennessä.**
