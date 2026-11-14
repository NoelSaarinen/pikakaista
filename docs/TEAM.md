# Team

| Name / GitHub handle | Technical skills | Preferred responsibilities | Available equipment | Development environment (OS, architecture, tools) | Availability (EET) |
| --- | --- | --- | --- | --- | --- |
| Patrik / `patw1kkkk` | Python prototyping, including small language-model experiments (n-gram, GRU and Transformer). Web app prototyping with StudyOS. Aalto coursework in circuit analysis and programming. | Prefers hands-on Arduino hardware prototyping. Interested in wiring and testing sensors, bringing up the board and integrating it with the demo. | | macOS · [verified tools](SOFTWARE.md) | |
| Joel Äyrälä / `joelayr12` | Web prototyping with Next.js, TypeScript, Tailwind CSS and Supabase. Scala coursework at Aalto (Information Networks). | To confirm | MacBook Air (Apple M4) | macOS 26.6.2 · arm64 · [verified tools](SOFTWARE.md) | To confirm |
| Delun Li / `delunli-spec` | Researcher at HUS. Medical student at University of Helsinki. Information Networks at Aalto University. | Pitching | | Windows · IntelliJ | |
| Noel | | | | | |

**Team composition** (reported in chat 2026-11-13): two Information Networks students, one medical student and one electrical engineering student. Strong AI-tool users, without deep technical experience.

When a project is selected, name owners for submission, integration/demo, and any hardware or external service the demo depends on.

## Chat aliases

| Chat alias | Team member |
| --- | --- |
| Vellu | Delun |
| patw1kk | Patrik |
| shrekingoat | Joel |
| Noppa | Noel |

## Junction 2026 — tarkennettu työnjako

Alustava ehdotus 14.11.2026. Tiimin vahvistus on auki.

### Patrik — Demo, AI ja integraatio

- Viimeistele demosivuston UI/UX ja vastaa käyttäjälle näkyvästä toiminnallisuudesta.
- Yhdistä backend frontendiin. Integroi potilaskysely, triage-pisteytys, A/B-jonot, lääkärin hyväksyntä ja hyvinvointialueiden analytiikka.
- Toteuta live-LLM-integraatio kyselyvastausten tiivistämiseen, vapaatekstin tulkintaan ja ehdotusten perusteluun. Nykyisen [demo-PR:n](https://github.com/patw1kkkk/junction-2026/pull/2) AI-yhteenvedot ovat tiimin mukaan mockattuja.
- Toteuta AI-analyytikko hyvinvointialueen päätöksentekijälle.
- Vastaa Vercel-julkaisusta, testauksesta ja koko demopolun toimivuudesta.

### Delun — Kysely ja kliininen pisteytys

- Suunnittele tutkimukseen perustuva kysely. Valitse keuhkosyövän olennaiset oireet, riskitekijät, taustatiedot ja diagnostisesti hyödylliset kysymykset. Muotoile kysymykset ymmärrettävästi ja kirjaa lähteet sekä kliiniset perusteet.
- Suunnittele läpinäkyvä A/B-jonojen pisteytys. Määritä oireiden ja riskitekijöiden vaikutus kiireellisyyteen, pisteytyksen ohittavat löydökset sekä kiireellisen lääkärinarvion, normaalin hoitopolun ja välittömän päivystyksellisen tarpeen erottelu. Tarkista ehdotukset lääketieteellisiä ohjeita vasten.
- Validoi AI:n vapaatekstitulkinta. Tarkista oireiden, keston, vakavuuden ja epävarmuuden tunnistus sekä keinot ehkäistä vaarallisia vääriä negatiivisia tuloksia.

**Toimitus** `survey_questions.json`, `triage_rules.json`, lähteet ja 10 synteettistä esimerkkipotilasta odotettuine luokituksineen.

### Joel — Aluedata, analytiikka ja optimointi

- Kokoa hyvinvointialueiden keuhkosyövän ilmaantuvuus-, kuolleisuus- ja elossaolotilastot sekä saatavilla olevat hoitoonpääsy-, lähete- ja diagnostiikkajonotiedot. Selvitä viiveen osatekijät ja erottele mitattu data kansallisista arvioista.
- Mallinna nykyinen hoitopolku ja A-jonon vaikutus odotusaikoihin, lääkärikäyntien määrään ja kuvantamiskapasiteettiin. Arvioi kokonaisviive ja ruuhkan mahdollinen siirtyminen. Tee varovainen, perus- ja optimistinen skenaario.
- Kuvaa AI:n aluesuositusten syötteet ja toimintamallin valinta. Huomioi resurssit, kysyntä ja jonojen kasvu sekä perustele vaikutukset laskelmilla.

**Toimitus** `counties.json`, `simulation_spec.md`, `recommendation_logic.md` ja yksi läpilaskettu alue-esimerkki.

### Noel — Haastetutkimus, kohderyhmä ja pitch

- Kokoa Suomen diagnostiikan ja hoitoonpääsyn keskeiset tilastot, näyttö varhaisen diagnostiikan hyödyistä ja pohjoismaiset hoitopolkuesimerkit. Kytke ratkaisu syöpästrategian Goal 3 -mittariin.
- Määritä kyselyn riskiryhmä tutkimustiedon perusteella. Selvitä SMS:n, OmaKannan ja muiden kanavien soveltuvuus sekä oma-aloitteisen osallistumisen mahdollisuus. Arvioi, miten tavoitetaan myös ihmiset, jotka eivät muuten hakeutuisi hoitoon, ja miten tavoittamisen väestöryhmäeroja ehkäistään.
- Selvitä aiempien käyntien, kuvantamisen ja tutkimusten mahdollinen käyttö AI:ssa sekä tietosuoja-, käyttöoikeus- ja sääntelyrajat. Kuvaa realistinen toteutustapa hyvinvointialueelle.
- Kokoa lähteistetty ongelma–ratkaisu–vaikutus-tarina, pitch deck, enintään kahden minuutin video ja lopullinen palautus.

**Toimitus** `research_summary.md`, `target_population.md`, `patient_data_feasibility.md` ja pitch-materiaalit.
