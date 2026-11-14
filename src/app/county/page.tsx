"use client";

import { useMemo, useState } from "react";
import countiesData from "@/data/counties.json";
import sourcesData from "@/data/sources.json";
import { RichText } from "@/components/RichText";
import { PARAM_META, SCENARIOS, simulateDoors, simulateRange, type SimulationParams, type SimulationResult } from "@/lib/simulation";
import type { County, SourceRef } from "@/lib/types";

const counties = countiesData as County[];
const sources = sourcesData as SourceRef[];
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

function SourceTag({ id }: { id: string }) {
  const s = sources.find((x) => x.id === id);
  const color = id === "mock" ? "bg-amber-100 text-amber-900" : id === "assumption" ? "bg-slate-200 text-slate-700" : "bg-sky-100 text-sky-800";
  const label = id === "mock" ? "paikkamerkki" : id === "assumption" ? "oletus" : id;
  return (
    <span title={s?.title} className={`ml-1 rounded px-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatParam(value: number, unit: string) {
  if (unit === "share") return `${nf1.format(value * 100)} %`;
  if (unit === "days") return `${value} pv`;
  return `${value} vk`;
}

type Mode = "doors" | "doors_survey";

// Assumptions that affect the Two Doors view; the rest belong to the survey.
const DOORS_PARAMS: (keyof SimulationParams)[] = ["currentPrimaryCareWaitDays", "currentCtQueueDays", "fastPhysicianDays", "fastCtDays", "publicDoorShare", "privateDoorDaysToCt", "healthCentreYield"];

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
      <div className="mt-1 h-3 rounded bg-slate-100">
        <div className={`h-3 rounded ${color}`} style={{ width: `${Math.max(2, Math.min(100, (days / max) * 100))}%` }} />
      </div>
      {share && <p className="mt-0.5 text-xs text-slate-500">{share}</p>}
    </div>
  );
}

export default function CountyPage() {
  const [countyId, setCountyId] = useState(counties[0].id);
  const [mode, setMode] = useState<Mode>("doors_survey");
  const [overrides, setOverrides] = useState<Partial<SimulationParams>>({});
  const [brief, setBrief] = useState<{ text: string; generated_by: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const county = counties.find((c) => c.id === countyId)!;
  const range = useMemo(() => simulateRange(county, overrides), [county, overrides]);
  const doors = useMemo(() => simulateDoors(county, { ...SCENARIOS.base, ...overrides }), [county, overrides]);
  const usesMock = [county.population_55_80, county.ever_smoker_share, county.lung_cancer_cases_per_year].some((v) => v.source_id === "mock");
  const maxDays = Math.max(doors.publicDaysToCt, doors.privateDaysToCt, doors.fastLaneDaysToCt);

  async function makeBrief() {
    setLoading(true);
    try {
      const res = await fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ countyId, overrides, mode }) });
      setBrief(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sky-700">Päättäjänäkymä</p>
          <h1 className="text-2xl font-bold">Keuhkosyövän pikakaista</h1>
        </div>
        <div className="flex rounded-full border border-slate-300 bg-white p-0.5 text-sm">
          {([["doors", "Kaksi ovea"], ["doors_survey", "Kaksi ovea + kysely"]] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setMode(v);
                setBrief(null);
              }}
              className={`rounded-full px-3 py-1 ${mode === v ? "bg-sky-700 font-semibold text-white" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="text-sm">
          Hyvinvointialue
          <select
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1"
            value={countyId}
            onChange={(e) => {
              setCountyId(e.target.value);
              setBrief(null);
            }}
          >
            {counties.map((c) => (
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

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Löydös</h2>
          <p className="mt-2 text-3xl font-bold">
            {fmt(county.lung_cancer_cases_per_year.value)}
            <SourceTag id={county.lung_cancer_cases_per_year.source_id} />
          </p>
          <p className="text-sm text-slate-600">keuhkosyöpää vuodessa</p>
          <p className="mt-3 text-sm">
            Noin 65–70 % löytyy vasta levinneenä.
            <SourceTag id="filha-2026" />
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Missä polku jumittaa</h2>
          <p className="mt-2 text-sm">Ihmiset eivät hakeudu ajoissa: kolmannes meni lääkäriin vasta yli kuukauden kuluttua oireista.<SourceTag id="pfizer-2025" /></p>
          <p className="mt-2 text-sm">Terveyskeskuslääkärille odotetaan noin kaksi viikkoa.<SourceTag id="uh-acta-2025" /></p>
          <p className="mt-2 text-sm">Pelkkä pikakaista tavoitti Tanskassa vain 27 % keuhkosyöpäpotilaista.<SourceTag id="guldbrandt" /></p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Toimenpide ja vaikutus</h2>
          <p className="mt-2 text-sm">
            {mode === "doors"
              ? "Terveyskeskukseen syöpäepäilyn pikakaista: hoitaja tunnistaa hälytysoireet ensikontaktissa, lääkäri muutamassa päivässä ja varattu TT-aika."
              : "Sama pikakaista terveyskeskukseen ja lisäksi vuosittainen oirekysely riskiryhmälle, joka tavoittaa myös ne, jotka eivät tule itse."}
          </p>
          <p className="mt-3 text-3xl font-bold">
            {fmt(doors.publicDaysToCt)} → {fmt(doors.fastLaneDaysToCt)} pv
          </p>
          <p className="text-sm text-slate-600">aika TT-kuvaukseen terveyskeskuksen kautta, nyt → pikakaistalla</p>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Kaksi ovea: kuka pääsee nopeasti?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Työterveys on nopea ovi, terveyskeskus hidas.<SourceTag id="roadmap" /> Vain noin kolmannes sairastuneista on työikäisiä, joten valtaosa tulee hitaan oven kautta.<SourceTag id="strategy" />
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <DoorBar label="Työterveys tai yksityinen" days={doors.privateDaysToCt} max={maxDays} share={`noin ${fmt(doors.viaPrivateDoor)} potilasta vuodessa`} color="bg-emerald-500" source="roadmap" />
            <DoorBar label="Terveyskeskus nyt" days={doors.publicDaysToCt} max={maxDays} share={`noin ${fmt(doors.viaPublicDoor)} potilasta vuodessa`} color="bg-rose-500" source="uh-acta-2025" />
            <DoorBar label="Terveyskeskus pikakaistalla" days={doors.fastLaneDaysToCt} max={maxDays} color="bg-sky-600" source="jensen-2017" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-rose-50 p-3">
              <p className="text-2xl font-bold">{fmt(doors.gapDaysNow)} pv</p>
              <p className="text-slate-600">ero ovien välillä nyt</p>
            </div>
            <div className="rounded bg-sky-50 p-3">
              <p className="text-2xl font-bold">{fmt(doors.daysSavedPerPatient)} pv</p>
              <p className="text-slate-600">nopeammin TT-kuvaukseen terveyskeskuksen kautta</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-2xl font-bold">{fmt(doors.viaPublicDoor)}</p>
              <p className="text-slate-600">keuhkosyöpäpotilasta vuodessa hyötyy</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-2xl font-bold">{fmt(doors.ctReferralsPerWeek)}</p>
              <p className="text-slate-600">pikakaistan TT-lähetettä viikossa (oletus)</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Ovien ajat ovat arvioita: kahden kertaisen eron lähde on yksi julkaisematon lymfoomatutkimus, ja oven jakauma kysytään mentoreilta.
        </p>
      </section>

      {mode === "doors_survey" && (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Kysely: hyötylaskelma vuodessa (vaihteluväli)</h2>
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
        <p className="mt-3 text-xs text-slate-500">Laskelma arvioi vain pääsyä TT-kuvaukseen ja tarvittavia aikoja. Se ei arvioi elossaoloa.</p>
      </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Tiivistelmä päättäjälle</h2>
          <button onClick={makeBrief} disabled={loading} className="rounded bg-sky-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50">
            {loading ? "Kirjoitetaan…" : brief ? "Kirjoita uudelleen" : "Luo tiivistelmä"}
          </button>
        </div>
        {brief ? (
          <div className="mt-3">
            <p className="mb-2 text-xs text-slate-500">{brief.generated_by === "llm" ? "Tekoäly kirjoitti tekstin. Kaikki luvut ovat laskelmasta." : "Varapohja (ei API-avainta). Kaikki luvut ovat laskelmasta."}</p>
            <RichText text={brief.text} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Tekoäly kokoaa luvut ja lähteet kahden minuutin tiivistelmäksi.</p>
        )}
      </section>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Oletukset ({PARAM_META.length})</summary>
        <p className="mt-2 text-sm text-slate-600">Liukusäädin korvaa arvon kaikissa skenaarioissa. Harmaa = oletus ilman lähdettä.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {PARAM_META.filter((m) => mode === "doors_survey" || DOORS_PARAMS.includes(m.key)).map((m) => {
            const value = overrides[m.key] ?? SCENARIOS.base[m.key];
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
              <span className="font-mono text-xs text-sky-800">{s.id}</span>{" "}
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
