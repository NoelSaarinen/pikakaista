// Two-minute brief for a county decision-maker. Code computes every number;
// AI only turns the numbers and sources into readable text with citations.
//
// Two modes share the same fast lane:
//   "doors"        Two Doors: a health-centre fast lane for people who come in themselves.
//   "doors_survey" The team plan: the same fast lane plus a yearly risk-group survey.

import { complete } from "./llm";
import { regionalFindings, SIGNAL_LABEL } from "./regional";
import type { DoorsResult, SimulationResult } from "./simulation";
import type { County, SourceRef } from "./types";

export type BriefMode = "doors" | "doors_survey";
export type Range = { cautious: SimulationResult; base: SimulationResult; optimistic: SimulationResult };

const nf = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });
const fmt = (n: number) => nf.format(Math.round(n));
const span = (r: Range, key: keyof SimulationResult) => {
  const a = r.cautious[key];
  const b = r.optimistic[key];
  return `${fmt(Math.min(a, b))}–${fmt(Math.max(a, b))}`;
};

export function briefFacts(county: County, range: Range, doors: DoorsResult, mode: BriefMode) {
  const usesMock = [county.population_50_74, county.ever_smoker_share, county.lung_cancer_cases_per_year].some((v) => v.source_id === "mock");
  const g3 = regionalFindings(county.id);
  const f1 = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 });
  const pct = (share: number) => `${f1.format(share * 100)} %`;
  const common = {
    parantava_hoito_alueella: {
      arvo: g3.curativeShare !== undefined ? `${pct(g3.curativeShare)} (koko maa ${pct(g3.curativeNational)}, ${g3.curativeRank}. / ${g3.curativeCount} aluetta, 2019–2023)` : "ei tietoa",
      lahde: g3.curativeSourceId,
    },
    keuhkosyopakuolleisuus_alueella: {
      arvo: g3.mortalityAsr ? `${f1.format(g3.mortalityAsr.value)} / 100 000 ikävakioituna (koko maa ${f1.format(g3.mortalityNational.value)}), ${g3.signal ? SIGNAL_LABEL[g3.signal].toLowerCase() : "ei vertailua"}` : "ei tietoa",
      lahde: "fcr-mortality",
    },
    alue: county.name,
    malli: mode === "doors" ? "Kaksi ovea: terveyskeskuksen pikakaista" : "Kaksi ovea ja riskiryhmän oirekysely",
    keuhkosyopia_vuodessa: { arvo: fmt(county.lung_cancer_cases_per_year.value), lahde: county.lung_cancer_cases_per_year.source_id },
    levinneena_loydetyt: { arvo: "noin 65–70 %", lahde: "filha-2026" },
    tyoikaisia_sairastuneista: { arvo: "noin kolmannes", lahde: "strategy" },
    julkinen_reitti_hitaampi: { arvo: "lymfoomassa oireista hoitoon mediaani 127 päivää terveyskeskuksen ja 76 päivää työterveyden tai yksityisen kautta", lahde: "kuitunen-2026" },
    terveyskeskusodotus_nyt: { arvo: "noin 2 viikkoa (kansallinen arvio)", lahde: "uh-acta-2025" },
    terveyskeskuksen_kautta_tulevia: { arvo: fmt(doors.viaPublicDoor), lahde: "laskelma, oletus" },
    paivat_tt_kuvaukseen_terveyskeskus_nyt: { arvo: fmt(doors.publicDaysToCt), lahde: "laskelma" },
    paivat_tt_kuvaukseen_tyoterveys: { arvo: fmt(doors.privateDaysToCt), lahde: "laskelma, oletus" },
    paivat_tt_kuvaukseen_pikakaistalla: { arvo: fmt(doors.fastLaneDaysToCt), lahde: "laskelma" },
    pikakaistan_tt_lahetteita_viikossa: { arvo: fmt(doors.ctReferralsPerWeek), lahde: "laskelma, oletus" },
    sisaltaa_mock_dataa: usesMock,
  };
  if (mode === "doors") return common;
  return {
    ...common,
    kysely_riskiryhma: { arvo: span(range, "riskGroup"), lahde: "laskelma" },
    kysely_vastaajat: { arvo: span(range, "respondents"), lahde: "laskelma, oletus" },
    kysely_vastaamatta_jaavat_hoitajan_soitto: { arvo: span(range, "nonRespondents"), lahde: "laskelma" },
    kysely_tt_kuvauksia: { arvo: span(range, "ctScans"), lahde: "laskelma, oletus" },
    kysely_tt_aikoja_viikossa: { arvo: span(range, "ctSlotsPerWeek"), lahde: "laskelma" },
    pelkka_pikakaista_tavoitti_tanskassa: { arvo: "27 % keuhkosyöpäpotilaista", lahde: "guldbrandt" },
  };
}

export function templateBrief(county: County, range: Range, doors: DoorsResult, mode: BriefMode): string {
  const f = briefFacts(county, range, doors, mode);
  const lines = [
    `**${f.alue}: ${f.malli.toLowerCase()}**`,
    `**Löydös:** alueella todetaan noin ${f.keuhkosyopia_vuodessa.arvo} keuhkosyöpää vuodessa [${f.keuhkosyopia_vuodessa.lahde}], ja noin 65–70 % löytyy vasta levinneenä [filha-2026]. Parantavaa hoitoa sai ${f.parantava_hoito_alueella.arvo} [${f.parantava_hoito_alueella.lahde}]. Keuhkosyöpäkuolleisuus: ${f.keuhkosyopakuolleisuus_alueella.arvo} [fcr-mortality].`,
    `**Missä polku jumittaa:** työterveyden kautta pääsee nopeasti, terveyskeskuksen kautta hitaasti [roadmap]; ${f.julkinen_reitti_hitaampi.arvo} [kuitunen-2026]. Vain noin kolmannes sairastuneista on työikäisiä [strategy], joten noin ${f.terveyskeskuksen_kautta_tulevia.arvo} potilasta vuodessa kulkee hitaan oven kautta: TT-kuvaukseen noin ${f.paivat_tt_kuvaukseen_terveyskeskus_nyt.arvo} päivässä, työterveydessä noin ${f.paivat_tt_kuvaukseen_tyoterveys.arvo} [laskelma].`,
  ];
  if (mode === "doors") {
    lines.push(
      `**Toimenpide:** syöpäepäilyn pikakaista terveyskeskukseen. Hoitaja tunnistaa hälytysoireet ensikontaktissa, lääkäri muutamassa päivässä ja noin ${f.pikakaistan_tt_lahetteita_viikossa.arvo} varattua TT-aikaa viikossa.`,
      `**Odotettu vaikutus:** terveyskeskuksen kautta TT-kuvaukseen noin ${f.paivat_tt_kuvaukseen_pikakaistalla.arvo} päivässä nykyisen ${f.paivat_tt_kuvaukseen_terveyskeskus_nyt.arvo} sijaan [laskelma].`,
    );
  } else {
    const s = f as ReturnType<typeof briefFacts> & Record<string, { arvo: string }>;
    lines.push(
      `**Toimenpide:** sama pikakaista terveyskeskukseen ja lisäksi vuosittainen oirekysely riskiryhmälle (${s.kysely_riskiryhma.arvo} henkilöä). Pelkkä pikakaista tavoitti Tanskassa vain 27 % keuhkosyöpäpotilaista [guldbrandt], joten kysely etsii ne, jotka eivät tule itse.`,
      `**Odotettu vaikutus (vaihteluväli):** kyselyn kautta ${s.kysely_tt_kuvauksia.arvo} ihmistä pääsee TT-kuvaukseen noin ${f.paivat_tt_kuvaukseen_pikakaistalla.arvo} päivässä. Vastaamatta jääville (${s.kysely_vastaamatta_jaavat_hoitajan_soitto.arvo}) soittaa hoitaja [laskelma].`,
    );
  }
  lines.push(
    `**Rajoitukset:** ovien jakauma, työterveyden aika ja ${mode === "doors" ? "TT-lähetteiden osuvuus" : "kyselyn vastausaste"} ovat oletuksia. Laskelma ei arvioi elossaoloa.${f.sisaltaa_mock_dataa ? " Osa alueen luvuista on vielä paikkamerkkejä (mock)." : ""}`,
    `**Tavoite 3:** keuhkosyövän viiden vuoden elossaolon pitää nousta 14 prosenttiyksikköä pohjoismaiselle tasolle [strategy].`,
  );
  return lines.join("\n\n");
}

const SYSTEM = `Kirjoitat hyvinvointialueen päättäjälle kahden minuutin tiivistelmän keuhkosyövän pikakaistasta.
Säännöt:
- Suomeksi, enintään 160 sanaa, otsikot: Löydös, Missä polku jumittaa, Toimenpide, Odotettu vaikutus, Rajoitukset.
- Kuvaa "malli"-kentän mukainen ratkaisu. Älä mainitse kyselyä, jos malli on pelkkä Kaksi ovea.
- Käytä VAIN annettuja lukuja. Älä keksi uusia lukuja, äläkä lupaa elossaolon paranemista.
- Merkitse jokaisen luvun perään lähde hakasulkeissa, esim. [filha-2026] tai [laskelma].
- Jos sisaltaa_mock_dataa on true, mainitse rajoituksissa, että osa luvuista on paikkamerkkejä.`;

export async function writeBrief(county: County, range: Range, doors: DoorsResult, mode: BriefMode, sources: SourceRef[]) {
  const facts = briefFacts(county, range, doors, mode);
  const sourceList = sources.map((s) => `${s.id}: ${s.title}`).join("\n");
  const llmText = await complete(SYSTEM, `Luvut:\n${JSON.stringify(facts, null, 2)}\n\nLähteet:\n${sourceList}`);
  return { text: llmText ?? templateBrief(county, range, doors, mode), generated_by: llmText ? ("llm" as const) : ("template" as const) };
}
