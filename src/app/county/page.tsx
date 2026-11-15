"use client";

import { useMemo, useState } from "react";
import { LiveTotalsPanel } from "@/components/LiveData";
import { PilotPanel } from "@/components/PilotPanel";
import { More } from "@/components/More";
import countiesData from "@/data/counties.json";
import { AiAnalyst } from "@/components/AiAnalyst";
import { SourceTag, sourceLabel } from "@/components/SourceTag";
import { regionLanguages } from "@/lib/i18n/region-languages";
import { SURVEY_LANGS } from "@/lib/i18n/survey-text";
import { allSources, curativeRanking, mortalityRanking, NATIONAL_MORTALITY, regionalFindings, SIGNAL_LABEL } from "@/lib/regional";
import { PARAM_META, SCENARIOS, simulateDoors, simulateRange, type SimulationParams, type SimulationResult } from "@/lib/simulation";
import type { County } from "@/lib/types";

const counties = countiesData as County[];
const countiesByName = [...counties].sort((a, b) => a.name.localeCompare(b.name, "fi"));

/**
 * This view's starting values on top of the shared base scenario. The survey round is
 * spread over a year, so weekly slots read as a county's yearly plan (the pitch uses the
 * same figures). SCENARIOS.base stays 12 weeks, so Delun's booking capacity is unchanged.
 */
const VIEW_DEFAULTS: Partial<SimulationParams> = { surveyWeeks: 52 };
const sources = allSources;
const pct = (share: number) => `${nf1.format(share * 100)} %`;
const nf = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 });
const fmt = (n: number) => nf.format(Math.round(n));

const ROWS: { key: keyof SimulationResult; label: string; small?: boolean }[] = [
  { key: "riskGroup", label: "Riskiryhmä, saa kyselyn" },
  { key: "respondents", label: "Vastaa kyselyyn" },
  { key: "nonRespondents", label: "Ei vastaa: hoitajan soitto", small: true },
  { key: "fastLane", label: "Pikakaistalle" },
  { key: "ctScans", label: "TT-kuvauksia" },
  { key: "cancersFound", label: "Löytyy keuhkosyöpä (oletus)" },
  { key: "ctSlotsPerWeek", label: "Varattavia TT-aikoja viikossa" },
  { key: "physicianSlotsPerWeek", label: "Varattavia lääkäriaikoja viikossa" },
];

/** National unit cost of a primary-care physician visit, 1–20 min, 2024 (THL). */
const VISIT_COST = 125;
/** CT price is a team assumption: no public unit cost was found. The region enters its own. */
const DEFAULT_CT_PRICE = 250;

function formatParam(value: number, unit: string) {
  if (unit === "share") return `${nf1.format(value * 100)} %`;
  if (unit === "days") return `${value} pv`;
  if (unit === "ratio") return nf1.format(value);
  return `${value} vk`;
}


// Assumptions that affect the Two Doors view; the rest belong to the survey.

function DoorBar({ label, days, max, share, color, source }: { label: string; days: number; max: number; share?: string; color: string; source: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>
          {label}
          <SourceTag id={source} />
        </span>
        <span className="font-semibold tabular-nums">{fmt(days)} pv</span>
      </div>
      <div className="mt-1 h-3 rounded-xs bg-slate-100">
        <div className={`h-3 rounded-xs ${color}`} style={{ width: `${Math.max(2, Math.min(100, (days / max) * 100))}%` }} />
      </div>
      {share && <p className="mt-0.5 text-xs text-slate-500">{share}</p>}
    </div>
  );
}

export default function CountyPage() {
  // Lapland first: the team's case region, with the highest lung cancer mortality.
  const [countyId, setCountyId] = useState(counties.some((c) => c.id === "lappi") ? "lappi" : counties[0].id);
  const [ctPrice, setCtPrice] = useState(DEFAULT_CT_PRICE);
  const [overrides, setOverrides] = useState<Partial<SimulationParams>>({});

  const county = counties.find((c) => c.id === countyId)!;
  const effective = useMemo(() => ({ ...VIEW_DEFAULTS, ...overrides }), [overrides]);
  const range = useMemo(() => simulateRange(county, effective), [county, effective]);
  const doors = useMemo(() => simulateDoors(county, { ...SCENARIOS.base, ...effective }), [county, effective]);
  const usesMock = [county.population_50_74, county.ever_smoker_share, county.lung_cancer_cases_per_year].some((v) => v.source_id === "mock");
  const maxDays = Math.max(doors.publicDaysToCt, doors.privateDaysToCt, doors.fastLaneDaysToCt);
  const findings = useMemo(() => regionalFindings(countyId), [countyId]);
  const mortality = useMemo(() => mortalityRanking(), []);
  const langs = useMemo(() => regionLanguages(countyId, SURVEY_LANGS.map((l) => l.code)), [countyId]);
  const params = { ...SCENARIOS.base, ...effective };
  const cost = { total: range.base.physicianVisits * VISIT_COST + range.base.ctScans * ctPrice };
  const ranking = useMemo(() => curativeRanking(), []);

  return (
    <div className="view-sharp space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Päättäjänäkymä</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Keuhkosyövän pikakaista</h1>
          <p className="text-slate-600">Hälytysmerkit TT-kuvaukseen päivissä, ei viikoissa.</p>
        </div>
        <label className="text-sm">
          Hyvinvointialue
          <select
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1"
            value={countyId}
            onChange={(e) => {
              setCountyId(e.target.value);
            }}
          >
            {countiesByName.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>


      {usesMock && (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Osa alueen luvuista on paikkamerkkejä (merkitty keltaisella). Ne korvataan julkisella datalla ennen esitystä.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AiAnalyst countyId={countyId} countyName={county.name} overrides={effective} />
        </div>
        <section className="rounded-md border border-slate-200 bg-white p-4 lg:col-span-2">
          <p className="text-sm font-semibold">Koko maa: keuhkosyöpäkuolleisuus alueittain</p>
          <p className="text-xs text-slate-500">
            Ikävakioitu, / 100 000, 2020–2024. Koko maa {nf1.format(NATIONAL_MORTALITY)}.<SourceTag id="fcr-mortality" /> Valitse alue napauttamalla.
          </p>
          <ul className="mt-2 space-y-0.5">
            {mortality.map((m) => {
              const selected = m.id === countyId;
              const known = counties.some((c) => c.id === m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    disabled={!known}
                    onClick={() => setCountyId(m.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-xs ${selected ? "bg-sky-50 font-semibold" : "hover:bg-slate-50"}`}
                  >
                    <span className="w-28 shrink-0 truncate">{m.name}</span>
                    <span className="relative h-2.5 flex-1 rounded-xs bg-slate-100">
                      <span
                        className={`absolute inset-y-0 left-0 rounded-xs ${selected ? "bg-sky-700" : m.signal === "consistently_higher" ? "bg-rose-500" : m.signal === "consistently_lower" ? "bg-emerald-500" : "bg-slate-400"}`}
                        style={{ width: `${(m.value / mortality[0].value) * 100}%` }}
                      />
                      <span aria-hidden="true" className="absolute inset-y-[-2px] w-px bg-slate-700" style={{ left: `${(NATIONAL_MORTALITY / mortality[0].value) * 100}%` }} />
                    </span>
                    <span className="w-9 text-right tabular-nums">{nf1.format(m.value)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-rose-500" />selvästi korkeampi</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-500" />selvästi matalampi</span>
            <span><span className="mr-1 inline-block h-2 w-px bg-slate-700" />koko maa</span>
          </p>
        </section>
      </div>

      <PilotPanel county={county} />

      <ol className="grid gap-4 md:grid-cols-3">
        <li className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">1 · Aukko · Tavoite 3 -mittarit</p>
          {findings.mortalityAsr ? (
            <>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {nf1.format(findings.mortalityAsr.value)}
                <span className="text-base font-medium text-slate-500"> / 100 000</span>
              </p>
              <p className="text-sm text-slate-600">
                keuhkosyöpäkuolleisuus, koko maa {nf1.format(findings.mortalityNational.value)}
                <SourceTag id="fcr-mortality" />
              </p>
            </>
          ) : (
            <p className="mt-2 text-3xl font-bold">{fmt(county.lung_cancer_cases_per_year.value)}</p>
          )}
          {findings.curativeShare !== undefined && (
            <p className="mt-3 text-sm">
              Parantavaa hoitoa sai <strong>{pct(findings.curativeShare)}</strong> (koko maa {pct(findings.curativeNational)}
              {findings.curativeRank !== undefined && `, sija ${findings.curativeRank}/${findings.curativeCount}`}).
              <SourceTag id={findings.curativeSourceId} />
            </p>
          )}
          {findings.signal && (
            <p className={`mt-2 text-xs ${findings.signal === "consistently_higher" ? "font-semibold text-rose-700" : "text-slate-500"}`}>{SIGNAL_LABEL[findings.signal]}</p>
          )}
        </li>
        <li className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">2 · Missä se syntyy</p>
          <p className="mt-2 text-lg font-semibold">Terveyskeskuksessa, ennen lähetettä</p>
          <p className="text-xs text-slate-500">Kansalliset arviot (Suomi, Satakunta, Pirkanmaa). Alueen omia aikoja ei julkaista.</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between gap-2">
              <span>Lääkäriaika<SourceTag id="uh-acta-2025" /></span>
              <span className="whitespace-nowrap tabular-nums">{fmt(params.currentPrimaryCareWaitDays)} pv</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Käynnistä lähetteeseen<SourceTag id="mattila-2025" /></span>
              <span className="whitespace-nowrap tabular-nums">{fmt(params.currentVisitToReferralDays)} pv</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Lähetteestä TT:hen<SourceTag id="pirha-hoitopolku" /></span>
              <span className="whitespace-nowrap tabular-nums">{fmt(params.currentCtQueueDays)} pv</span>
            </li>
          </ul>
          <p className="mt-2 text-sm text-slate-600">Suomessa perusterveydenhuolto ei juuri käytä TT:tä, vaan ensin otetaan röntgen.<SourceTag id="uh-acta-2025" /></p>
          <More className="mt-1" label="Miksi">
            <p>Noin 65–70 % keuhkosyövistä löytyy vasta levinneenä.<SourceTag id="filha-2026" /></p>
            <p>Potilaskyselyssä kolmannes hakeutui lääkäriin vasta yli kuukauden päästä oireista.<SourceTag id="pfizer-2025" /> Siksi pelkkä pikakaista ei riitä: Tanskassa se tavoitti vain 27 % potilaista.<SourceTag id="guldbrandt" /></p>
          </More>
        </li>
        <li className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">3 · Toimenpide</p>
          <p className="mt-2 text-lg font-semibold">Oirekysely riskiryhmälle ja pikakaista terveyskeskukseen</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {fmt(doors.publicDaysToCt)} → {fmt(doors.fastLaneDaysToCt)} pv
          </p>
          <p className="text-sm text-slate-600">aika TT-kuvaukseen, nyt → pikakaistalla</p>
          <p className="mt-3 text-sm">
            Kysely alueen kielillä ({langs.primary.map((l) => l.name.split(",")[0]).join(", ")}) tavoittaa <strong>{pct(langs.coverage)}</strong> 50–74-vuotiaista äidinkielellään
            {langs.sharedRegion ? ` (${langs.regionName}, koko maakunta)` : ""}.
            <SourceTag id="statfin-11rl" />
          </p>
          {langs.interpreter.length > 0 && (
            <p className="mt-1 text-xs text-slate-600">
              Ilman käännöstä suurimmat: {langs.interpreter.map((l) => `${l.name} ${fmt(l.count)}`).join(", ")}. Heille hoitajan soitto tulkin kanssa.
            </p>
          )}
        </li>
      </ol>

      <section className="rounded-lg border-2 border-sky-700 bg-sky-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">4 · Mitä {county.name} päättää</p>
        <div className="mt-2 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-600">Varaa vuodessa (yksi {fmt(params.surveyWeeks)} viikon kierros)</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{fmt(range.base.physicianVisits)} lääkäriaikaa</p>
            <p className="text-2xl font-bold tabular-nums">{fmt(range.base.ctScans)} TT-aikaa</p>
            <p className="text-sm text-slate-600">
              eli {fmt(range.base.physicianSlotsPerWeek)} + {fmt(range.base.ctSlotsPerWeek)} viikossa kierroksen aikana (perusskenaario)
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Kustannus vuodessa (sama kierros)</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">noin {fmt(cost.total / 1000)} t€</p>
            <p className="text-sm text-slate-600">
              {fmt(range.base.physicianVisits)} lääkärikäyntiä × {VISIT_COST} €<SourceTag id="thl-yksikkokustannukset" /> + {fmt(range.base.ctScans)} TT-kuvausta × {ctPrice} €
              <SourceTag id="assumption" />
            </p>
            {range.base.cancersFound >= 1 && <p className="text-sm text-slate-600">noin {fmt(cost.total / range.base.cancersFound / 1000)} t€ löydettyä syöpää kohden</p>}
            <label className="mt-2 block text-xs text-slate-600">
              TT-tutkimuksen hinta alueella (€)
              <input
                type="number"
                min={0}
                step={10}
                value={ctPrice}
                onChange={(e) => setCtPrice(Math.max(0, Number(e.target.value)))}
                className="ml-2 w-20 rounded border border-slate-300 px-1 py-0.5"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-slate-600">Seuraa näitä mittareita</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              <li>aika oireesta TT-kuvaukseen (tavoite {fmt(doors.fastLaneDaysToCt)} pv)</li>
              <li>kyselyn vastausprosentti</li>
              <li>vaiheen I–II osuus löydetyistä</li>
              <li>parantavan hoidon osuus{findings.curativeShare !== undefined && ` (nyt ${pct(findings.curativeShare)})`}</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Kustannus sisältää lääkärikäynnit ja TT-kuvaukset, ei kyselyn, hoitajan soittojen eikä hoidon kuluja. TT-hinta on oletus: julkista hintaa ei löytynyt, joten alue syöttää oman hinnastonsa.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Kaksi ovea: kuka pääsee nopeasti?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Työterveys on nopea ovi, terveyskeskus hidas, ja valtaosa sairastuneista tulee hitaan oven kautta.<SourceTag id="roadmap" />
        </p>
        <div className="mt-4 space-y-3">
          <DoorBar label="Työterveys tai yksityinen" days={doors.privateDaysToCt} max={maxDays} share={`noin ${fmt(doors.viaPrivateDoor)} potilasta vuodessa`} color="bg-emerald-500" source="assumption" />
          <DoorBar label="Terveyskeskus nyt" days={doors.publicDaysToCt} max={maxDays} share={`noin ${fmt(doors.viaPublicDoor)} potilasta vuodessa`} color="bg-rose-500" source="uh-acta-2025" />
          <DoorBar label="Terveyskeskus pikakaistalla" days={doors.fastLaneDaysToCt} max={maxDays} color="bg-sky-600" source="jensen-2017" />
        </div>
        <More className="mt-3">
          <p>Lymfoomatutkimuksessa oireista hoitoon kului terveyskeskuksen kautta mediaani 127 päivää, työterveyden tai yksityisen kautta 76 päivää.<SourceTag id="kuitunen-2026" /> Vain noin kolmannes sairastuneista on työikäisiä.<SourceTag id="strategy" /></p>
          <p>Ovien ajat ja jakauma ovat arvioita lymfoomatutkimuksesta (160 potilasta, 2014–2020), koska keuhkosyövästä vastaavaa tietoa ei ole. Keuhkosyövän luvut kysytään mentoreilta.</p>
        </More>
      </section>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Tavoite 3 -mittarit: {county.name} verrattuna koko maahan</summary>
        <p className="mt-2 text-sm text-slate-600">
          Tavoite: elossaolo pohjoismaiselle tasolle.<SourceTag id="strategy" />
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded bg-slate-50 p-3">
            <p className="text-sm text-slate-600">Parantavaa hoitoa sai ({findings.curativePeriod})</p>
            <p className="mt-1 text-2xl font-bold">
              {findings.curativeShare !== undefined ? pct(findings.curativeShare) : "–"}
              <SourceTag id={findings.curativeSourceId} />
            </p>
            <p className="text-sm text-slate-600">
              koko maa {pct(findings.curativeNational)}
              {findings.curativeRank !== undefined && ` · ${findings.curativeRank}. / ${findings.curativeCount} aluetta`}
            </p>
          </div>
          <div className="rounded bg-slate-50 p-3">
            <p className="text-sm text-slate-600">Keuhkosyöpäkuolleisuus, ikävakioitu (2020–2024)</p>
            <p className="mt-1 text-2xl font-bold">
              {findings.mortalityAsr ? `${nf1.format(findings.mortalityAsr.value)} / 100 000` : "–"}
              <SourceTag id="fcr-mortality" />
            </p>
            <p className="text-sm text-slate-600">
              koko maa {nf1.format(findings.mortalityNational.value)}
              {findings.deathsPerYear !== undefined && ` · noin ${fmt(findings.deathsPerYear)} kuolemaa vuodessa`}
            </p>
            {findings.signal && (
              <p className={`mt-2 text-xs ${findings.signal === "consistently_higher" ? "font-semibold text-rose-700" : "text-slate-500"}`}>{SIGNAL_LABEL[findings.signal]}</p>
            )}
          </div>
          <div className="rounded bg-slate-50 p-3">
            <p className="text-sm text-slate-600">Viiden vuoden suhteellinen elossaolo (2022–2024)</p>
            <p className="mt-1 text-2xl font-bold">
              {findings.survival ? `${nf1.format(findings.survival.value)} %` : "–"}
              <SourceTag id="fcr-survival" />
            </p>
            <p className="text-sm text-slate-600">
              {findings.survivalAreaName ?? "yhteistyöalue"} · koko maa {nf1.format(findings.survivalNational.value)} %
            </p>
          </div>
        </div>
        <More className="mt-4" label="Kaikki alueet ja tulkinta">
          <p>Matala parantavan hoidon osuus viittaa myöhäiseen toteamiseen. Korkea kuolleisuus johtuu osin korkeasta ilmaantuvuudesta (tupakointihistoria), joten se ei yksin osoita hoidon eroja. Elossaolo julkaistaan vain viidelle yhteistyöalueelle, ja niiden erot ovat satunnaisvaihtelun sisällä.</p>
          <ul className="mt-2 space-y-1 text-sm">
            {ranking.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className={`w-36 shrink-0 truncate ${c.id === countyId ? "font-semibold" : ""}`}>{c.name}</span>
                <span className="h-2 flex-1 rounded-xs bg-slate-100">
                  <span
                    className={`block h-2 rounded-xs ${c.id === countyId ? "bg-sky-700" : c.curative_share < findings.curativeNational ? "bg-rose-400" : "bg-emerald-400"}`}
                    style={{ width: `${(c.curative_share / ranking[0].curative_share) * 100}%` }}
                  />
                </span>
                <span className="w-14 text-right tabular-nums">{pct(c.curative_share)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Ikävakioimattomat osuudet, 2019–2023. Pienten alueiden luvut vaihtelevat paljon, ja puuttuva hoitotieto voi johtua kirjauskäytännöistä.
          </p>
        </More>
      </details>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Kyselyn laskelma vaihteluväleinä (varovainen, perus, optimistinen)</summary>
        <div className="-mx-1 overflow-x-auto px-1">
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-1 font-medium"></th>
              <th className="py-1 text-right font-medium">Varovainen</th>
              <th className="py-1 text-right font-medium">Perus</th>
              <th className="py-1 text-right font-medium">Optimistinen</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-b last:border-0">
                <td className={`py-1.5 ${row.small ? "pl-4 text-slate-500" : ""}`}>{row.label}</td>
                {(["cautious", "base", "optimistic"] as const).map((s) => (
                  <td key={s} className={`py-1.5 text-right tabular-nums ${s === "base" ? "font-semibold" : ""}`}>
                    {fmt(range[s][row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Arvioi pääsyä TT-kuvaukseen ja tarvittavia aikoja, ei elossaoloa.</p>
      </details>


      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Demon kyselydata reaaliajassa</summary>
        <div className="mt-3">
          <LiveTotalsPanel />
        </div>
      </details>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Oletukset ({PARAM_META.length})</summary>
        <p className="mt-2 text-sm text-slate-600">Liukusäädin korvaa arvon kaikissa skenaarioissa. Harmaa = oletus ilman lähdettä.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {PARAM_META.map((m) => {
            const value = effective[m.key] ?? SCENARIOS.base[m.key];
            return (
              <label key={m.key} className="block text-sm">
                <span className="flex justify-between gap-2">
                  <span>
                    {m.label}
                    <SourceTag id={m.source_id} />
                  </span>
                  <span className="tabular-nums font-medium">{formatParam(value, m.unit)}{overrides[m.key] === undefined ? "" : " *"}</span>
                </span>
                <input
                  type="range"
                  className="w-full"
                  min={m.min}
                  max={m.max}
                  step={m.step}
                  value={value}
                  onChange={(e) => setOverrides((o) => ({ ...o, [m.key]: Number(e.target.value) }))}
                />
                {m.note && <span className="text-xs text-slate-500">{m.note}</span>}
              </label>
            );
          })}
        </div>
        {Object.keys(overrides).length > 0 && (
          <button onClick={() => setOverrides({})} className="mt-3 text-sm text-sky-700 underline">
            Palauta oletusarvot
          </button>
        )}
      </details>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Lähteet</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {sources.map((s) => (
            <li key={s.id}>
              <span className="text-xs font-semibold text-sky-800">{sourceLabel(s.id)}</span>{" "}
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
              {s.note && <span className="block text-xs text-slate-500">{s.note}</span>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
