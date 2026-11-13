# TODO before hacking

Käykää lista läpi yhdessä ennen kuin lukitsette idean tai alatte rakentaa. Jakakaa tarkistukset rinnakkain. Merkitkää rasti, kun tieto on tarkistettu ja kirjattu linkitettyyn tiedostoon. Jos kohta ei koske valittua ideaa, merkitkää **Ei tarvita**. Kirjatkaa avoimelle esteelle vastuuhenkilö ja seuraava tarkistus [STATUS.md](STATUS.md):hen. Ulkoiselle tiedolle lisätään lähde ja tarkistuspäivä.

## 1. Tiimi ja GitHub

- [ ] Kutsukaa kaikki GitHubiin. Jokainen hyväksyy kutsun ja testaa kloonauksen, pullin ja pushin omalta koneeltaan esimerkiksi omalla lyhytikäisellä haaralla. [README](../README.md)
- [ ] Jokainen avaa kloonatun kansion Codexissa ja pyytää sitä lukemaan `AGENTS.md` ja `docs/STATUS.md`. Sopikaa, kuka muokkaa mitäkin yhteistä tiedostoa, ja vetäkää uusin `main` ennen uutta tehtävää. [AGENTS.md](../AGENTS.md) · [README](../README.md)
- [ ] Täyttäkää nimet, GitHub-tunnukset, osaaminen, mieluisat vastuut, käyttöjärjestelmät, omat laitteet ja paikallaoloajat. Sopikaa yhteinen viestikanava ja seuraava yhteinen tilannekatsaus. [TEAM.md](TEAM.md) · [STATUS.md](STATUS.md)
- [ ] Nimetkää vastuuhenkilöt haasteen varmistamiselle, palautukselle, integraatiolle ja demolle. Nimetkää tarvittaessa myös laitteisto- ja API-vastuuhenkilö. [TEAM.md](TEAM.md)

## 2. Haasteet ja palautus

- [ ] Avatkaa Junctionin osallistujanäkymä ja katsokaa avajaisten haastevideot. Käykää julkaistu lista läpi, lisätkää puuttuvat haasteet ja päivittäkää aiemmat tiedot virallisilla briefeillä. Merkitkää edelleen puuttuva tieto `Unknown`. [CHALLENGES.md](CHALLENGES.md)
- [ ] Kirjatkaa kiinnostavista haasteista tarkka tehtävä, kohderyhmä, vaaditut tuotokset, arviointiperusteet, pakolliset teknologiat ja data, kelpoisuus, palkinnot ja mahdolliset lisäkilpailut. Tarkistakaa myös, mitä valmista koodia, AI-työkaluja, ulkoista dataa ja laitteita saa käyttää. [CHALLENGES.md](CHALLENGES.md)
- [ ] Varmistakaa alustavan ja lopullisen palautuksen kellonajat, ristiriitainen alustavan palautuksen aika sekä katselmoinnin ja pitchin käytännöt. Sopikaa tiimin oma palautusaika puskurilla. [STATUS.md](STATUS.md)
- [ ] Tarkistakaa, että tiimi ja palauttaja näkyvät oikein alustalla. Selvittäkää lomakkeen kentät, sallittu haasteiden määrä, demo- tai videovaatimukset, MIT-lisenssi, lähdekoodin näkyvyys ja tuomarien pääsy linkkeihin. [CHALLENGES.md](CHALLENGES.md) · [PROJECT.md](PROJECT.md)

## 3. Softat ja kehitysympäristö

- [ ] Jokainen merkitsee käyttämänsä softat, version, käyttöjärjestelmän ja kenellä työkalu toimii. Tarkistakaa ainakin Codex, Git, editori ja tarvittavat Python- tai Node-versiot. [SOFTWARE.md](SOFTWARE.md)
- [ ] Testatkaa tarvittavat kirjautumiset, lisenssit ja oikeudet. Varmistakaa valitun pinon riippuvuudet ja että vähintään yksi toinen tiimiläinen voi ajaa projektin puhtaalta kloonilta. Kirjatkaa yhteiset asennus-, käynnistys- ja testikomennot, kun ne ovat tiedossa. [SOFTWARE.md](SOFTWARE.md) · [PROJECT.md](PROJECT.md)
- [ ] Jos idea tarvitsee rautaa, testatkaa oikeaan laitteeseen sopivat ajurit, SDK:t, Arduino IDE tai App Lab, CAD ja slicer. Tehkää pieni testi oikealla laitteella, kuten firmware-upload tai sarjaportin luku. [SOFTWARE.md](SOFTWARE.md) · [HARDWARE.md](HARDWARE.md)
- [ ] Tarkistakaa, että kaikilla on toimiva verkko ja tarvittavat laturit, USB-datakaapelit ja adapterit. Sopikaa varayhteys tai paikallinen demo, jos verkko tai palvelu pettää. [TEAM.md](TEAM.md) · [PROJECT.md](PROJECT.md)

## 4. Hardware Lab ja 3D-tulostus

- [ ] Käykää labrassa. Kirjatkaa käytettävissä olevien levyjen, Jetsonien, sensorien, kameroiden ja robottien tarkat mallit, määrät ja tiimin saatavuus. Tarkistakaa myös virtalähteet, kaapelit, kiinnikkeet ja tarvittavat työkalut. [HARDWARE.md](HARDWARE.md)
- [ ] Kysykää aukiolo, varaus ja lainaaminen, mahdollinen perehdytys, käyttörajoitukset ja keneltä saa apua. Selvittäkää, saako laitteen pitää demoon asti. [HARDWARE.md](HARDWARE.md) · [RESOURCES.md](RESOURCES.md)
- [ ] Tarkistakaa tulostimien mallit, materiaali, suutin, tulostusala, hyväksytty slicer ja profiili, tiedostomuoto sekä jono ja aikarajat. Kysykää, kuka käynnistää tulostuksen ja miten uusintatulostus hoidetaan. [HARDWARE.md](HARDWARE.md)
- [ ] Jos tulostatte, slicetkää pieni testiosa oikealla profiililla. Tarkistakaa tulostusaika, tuet, istuvuus ja jonotusaika. Sopikaa varakiinnitys siltä varalta, ettei osa valmistu ajoissa. [HARDWARE.md](HARDWARE.md) · [PROJECT.md](PROJECT.md)
- [ ] Testatkaa kriittisin fyysinen ketju oikeilla osilla. Varmistakaa esimerkiksi, että sensori antaa dataa tai robotti liikkuu, ja kirjatkaa toimiva kytkentä, virtaratkaisu ja ohjelmistoversio. [HARDWARE.md](HARDWARE.md)

## 5. Sponsoripalvelut, data ja apu

- [ ] Valitkaa vain idealle tarpeelliset palvelut. Lunastakaa mahdolliset krediitit ja tehkää yksi onnistunut testipyyntö tai ajo. Kirjatkaa pääsytapa, vastuuhenkilö, malliversio, kiintiö, kuluraja, vanheneminen ja vararatkaisu. [RESOURCES.md](RESOURCES.md)
- [ ] Avatkaa käytettävä aineisto tai mock API ja kokeilkaa yhtä esimerkkiä. Tarkistakaa formaatti, käyttöehdot, mahdolliset tietosuojarajat ja mitä saa näyttää demossa tai julkaista palautuksessa. [RESOURCES.md](RESOURCES.md) · [CHALLENGES.md](CHALLENGES.md)
- [ ] Sopikaa, kuka käy hyödyllisissä briiffeissä ja työpajoissa ja kuka kysyy avoimet kysymykset mentoreilta. Kirjatkaa vastaukset lähteineen ja päivämäärineen. [RESOURCES.md](RESOURCES.md)
- [ ] Pitäkää avaimet, tokenit, kupongit ja tunnukset paikallisissa ympäristömuuttujissa tai palvelun salaisuushallinnassa. Jos lisäätte `.env.example`-tiedoston, käyttäkää vain tyhjiä esimerkkiarvoja. [AGENTS.md](../AGENTS.md)

## 6. Valitkaa idea ja aloittakaa

- [ ] Kirjatkaa ehdokkaat ja verratkaa haastesopivuutta, erottautumista, työmäärää, riippuvuuksia ja sitä, mitä pystytte näyttämään livenä. [IDEAS.md](IDEAS.md)
- [ ] Valitkaa haaste ja yksi loppuun asti toimiva demopolku. Kirjatkaa käyttäjän ongelma, MVP, onnistumiskriteeri, arkkitehtuuri, pino, vastuuhenkilöt ja varademo. Kirjatkaa merkittävät valinnat perusteluineen. [PROJECT.md](PROJECT.md) · [DECISIONS.md](DECISIONS.md)
- [ ] Sopikaa ensimmäinen pieni päästä päähän -testi, integraatiohetki, demoajan varaus ja palautuksen omistaja. Jos kriittinen riippuvuus on vielä auki, antakaa tarkistukselle aikaraja ja nimetkää varavaihtoehto. [PROJECT.md](PROJECT.md) · [STATUS.md](STATUS.md)
- [ ] Commitatkaa ja pushatkaa vahvistetut tiedot ja rastit. Ilmoittakaa tiimille, mitä päivittyi, ja vetäkää uusin `main` ennen seuraavaa Codex-tehtävää. [README](../README.md)
