"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveVersion } from "@/components/LiveData";
import { PRIORITY_BADGE } from "@/components/AnalysisCard";
import { NewAnswers } from "@/components/NewAnswers";
import { formatRisk, IMPUTED_LABEL } from "@/lib/priority";
import {
  DEFAULT_SCREENING,
  RANKING_LABEL,
  SCREENING_STATUS_LABEL,
  screeningList,
  type RankingMode,
  type ScreeningPerson,
  type ScreeningSettings,
  type ScreeningStatus,
} from "@/lib/screening";
import { SMOKING_LABEL } from "@/lib/search";
import { ISC_LDCT, PILOT_REASON_LABEL, pilotEligibility } from "@/lib/pilot";
import { More } from "@/components/More";

const STATUS_BADGE: Record<ScreeningStatus, string> = {
  invite: "bg-emerald-100 text-emerald-800",
  waiting: "bg-amber-100 text-amber-900",
  below_threshold: "bg-slate-100 text-slate-600",
  symptomatic: "bg-rose-100 text-rose-800",
  never_smoked: "bg-slate-50 text-slate-400",
  outside_age: "bg-slate-50 text-slate-400",
};

const nf = (n: number, d = 1) => n.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function ScreeningPage() {
  const [people, setPeople] = useState<ScreeningPerson[] | null>(null);
  const [settings, setSettings] = useState<ScreeningSettings>(DEFAULT_SCREENING);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const version = useLiveVersion();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/patients", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { items: ScreeningPerson[] }) => {
        if (!cancelled) setPeople(json.items);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const summary = useMemo(() => (people ? screeningList(people, settings) : null), [people, settings]);
  const rows = summary?.rows.filter((r) => showAll || r.status === "invite" || r.status === "waiting" || r.status === "below_threshold") ?? [];
  const row = summary?.rows.find((r) => r.person.response.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Seulontalista · porras 2 · synteettinen data</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Seulontalista</h1>
        <p className="text-slate-600">Oireettomat tupakoineet riskin mukaan, suurin ensin. Kutsuja niin monta kuin TT-aikoja riittää.</p>
        <More className="mt-1" label="Miten lista toimii">
        <p>
          Priorisointi tehdään kahdessa portaassa. <strong>Porras 1:</strong> kaikki oireiset ohjataan oirearvioon, ja korkean riskin oireisille varataan lääkäriaika NICE NG12 -kriteerien mukaan (Lääkäri-näkymä). <strong>Porras 2</strong> on tämä sivu: oireettomat
          tupakoineet järjestetään PLCOm2012-mallin tutkimukseen perustuvien riskitekijöiden mukaan, suurin riski ensin. Oletuksena ikä ei vaikuta järjestykseen. Kutsuja tehdään listan kärjestä niin monta kuin seulonnan TT-kapasiteetti sallii.
        </p>
        <ul className="list-disc space-y-0.5 pl-5 text-xs">

      <NewAnswers
        items={people as (ScreeningPerson & { live?: boolean })[] | null}
        onSelect={setSelected}
        describe={(x) => {
          const r = summary?.rows.find((y) => y.person.response.id === x.response.id);
          if (!r) return "";
          if (r.status === "invite") return `→ Kutsutaan viikolla ${r.inviteWeek} (sija ${r.rank})`;
          if (r.status === "waiting") return `→ Odottaa kutsua (sija ${r.rank})`;
          if (r.status === "symptomatic") return "→ Oireita: ei seulontalistalla, vaan lääkärin listalla (porras 1)";
          return `→ ${SCREENING_STATUS_LABEL[r.status]}`;
        }}
      />

          <li>
            Riski: PLCOm2012, Tammemägi ym., <em>N Engl J Med</em> 2013;368:728–736, taulukko 2. Julkaistut kertoimet muuttamattomina, tarkistettu 14.11.2026.
          </li>
          <li>Kynnys 1,3455 %: julkaisun raja, joka valitsee yhtä monta henkilöä kuin NLST-tutkimuksen ikä- ja askivuosikriteerit. Askivuosirajaa ei tarvita erikseen, koska malli huomioi tupakoinnin määrän, keston ja lopettamisajan.</li>
          <li>
            <strong>Tasa-arvoinen järjestys (oletus):</strong> jokaisen henkilön riskitekijät lasketaan yhteen julkaisun omilla, toisistaan vakioiduilla kertoimilla, mutta ikä asetetaan kaikille samaksi (62 v, mallin keskitaso). Näin järjestys perustuu tupakoinnin määrään, kestoon ja lopettamisaikaan, keuhkoahtaumatautiin, suvun keuhkosyöpään, aiempaan syöpään, koulutukseen ja painoindeksiin, eikä iäkkäämpiä nosteta kärkeen pelkän iän takia. Kutsukelpoinen on jokainen, jonka todellinen tai ikävakioitu riski ylittää kynnyksen, joten kukaan mallin kutsuma ei menetä paikkaansa. Tämä on tiimin tasa-arvoratkaisu, ei validoitu riski.
          </li>
          <li>Ikä 50–74 on sama kuin kansallisessa seulontapilotissa. Mallin kehitysjoukko oli 55–74-vuotiaita, joten 50–54-vuotiaat merkitään.</li>
          <li>TT-kapasiteetti ja kutsujakso ovat säädettäviä oletuksia. Kutsut ovat simuloituja, eikä mitään lähetetä.</li>
          <li>Mallia ei ole kalibroitu Suomen väestöön. Oikea käyttö vaatii lääketieteellisen tarkistuksen ja alueen päätöksen.</li>
        </ul>
        </More>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <fieldset className="text-xs text-slate-600">
          <legend>Järjestys</legend>
          <div className="mt-0.5 flex rounded border border-slate-300 bg-white p-0.5">
            {(Object.keys(RANKING_LABEL) as RankingMode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={settings.mode === m}
                onClick={() => setSettings((s) => ({ ...s, mode: m }))}
                className={`rounded px-2 py-1 text-xs ${settings.mode === m ? "bg-sky-700 font-semibold text-white" : "text-slate-700"}`}
              >
                {RANKING_LABEL[m]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="text-xs text-slate-600">
          Seulonnan TT-kuvauksia viikossa
          <input
            type="number"
            min={0}
            value={settings.ctSlotsPerWeek}
            onChange={(e) => setSettings((s) => ({ ...s, ctSlotsPerWeek: Math.max(0, Number(e.target.value) || 0) }))}
            className="mt-0.5 block w-28 rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-slate-600">
          Kutsujakso (viikkoa)
          <input
            type="number"
            min={1}
            value={settings.weeks}
            onChange={(e) => setSettings((s) => ({ ...s, weeks: Math.max(1, Number(e.target.value) || 1) }))}
            className="mt-0.5 block w-24 rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Näytä myös oireiset, tupakoimattomat ja ikärajan ulkopuoliset
        </label>
      </div>

      {summary && (() => {
        // ISC-LDCT inclusion criteria applied to everyone on the list (tier 2 pool).
        const pool = summary.rows.filter((r) => r.status === "invite" || r.status === "waiting" || r.status === "below_threshold");
        const eligible = pool.filter((r) => pilotEligibility(r.person.response).eligible).length;
        const former = pool.filter((r) => r.person.response.smoking.status === "former").length;
        return (
          <section className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 text-sm" aria-label="Seulontapilotin kriteerit">
            <p>
              <strong>{eligible}</strong> / {pool.length} täyttää seulontapilotin {ISC_LDCT.name} kriteerit. <strong>{former}</strong> on lopettaneita, joita pilotti ei ota, mutta tämä lista voi kutsua.
            </p>
            <More className="mt-1" label="Pilotin kriteerit">
            <p className="text-xs">Pilotin poissulkukriteereitä (aiempi melanooma tai keuhko-, munuais- tai rintasyöpä, TT alle vuosi sitten) ja älypuhelinvaatimusta kysely ei kysy. Pilotin {ISC_LDCT.participants.toLocaleString("fi-FI")} paikkaa täyttyivät muutamassa vuorokaudessa; tuloksia ei ole julkaistu.</p>
            </More>
          </section>
        );
      })()}

      {summary && (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Oireettomia tupakoineita 50–74 v</p>
            <p className="text-2xl font-bold">{summary.pool}</p>
            <p className="text-xs text-slate-500">{summary.symptomatic} oireista ohjattu porras 1:een</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Kutsukelpoisia (riski ≥ 1,3455 %)</p>
            <p className="text-2xl font-bold">{summary.aboveThreshold}</p>
            <p className="text-xs text-slate-500">
              {summary.pool - summary.aboveThreshold} alle kynnyksen
              {settings.mode === "equity" && summary.newlyEligible > 0 && `, ${summary.newlyEligible} kelpoisia vain ikävakioidulla riskillä`}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-800">Kutsutaan {settings.weeks} viikossa</p>
            <p className="text-2xl font-bold text-emerald-900">{summary.invited}</p>
            <p className="text-xs text-emerald-800">kapasiteetti {summary.capacity} kuvausta</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-900">Odottaa kutsua</p>
            <p className="text-2xl font-bold text-amber-900">{summary.waiting}</p>
            <p className="text-xs text-amber-900">kapasiteetti ei riitä</p>
          </div>
        </div>
      )}

      {summary && summary.invited > 0 && (
        <More label="Vertailut: tasa-arvoinen järjestys ja pelkät ikärajat">
        <section className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 text-sm">
          <p className="font-semibold">Mitä tasa-arvoinen järjestys muuttaa (sama kapasiteetti, {summary.capacity} kuvausta)</p>
          <table className="mt-2 w-full max-w-2xl text-left text-xs">
            <thead className="text-slate-600">
              <tr>
                <th className="py-1 pr-3">Järjestys</th>
                <th className="py-1 pr-3">Kutsuttujen keski-ikä</th>
                <th className="py-1 pr-3">Kutsutuista 65 v tai yli</th>
                <th className="py-1">Mallin odottamat syövät kutsutuilla</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(RANKING_LABEL) as RankingMode[]).map((m) => (
                <tr key={m} className={settings.mode === m ? "font-semibold" : ""}>
                  <td className="py-1 pr-3">{RANKING_LABEL[m]}</td>
                  <td className="py-1 pr-3">{nf(summary.byMode[m].meanAge)} v</td>
                  <td className="py-1 pr-3">
                    {summary.byMode[m].aged65plus} / {summary.byMode[m].invited}
                  </td>
                  <td className="py-1">{nf(summary.byMode[m].expectedCancers, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-slate-600">
            Tasa-arvoinen järjestys jakaa kutsut tasaisemmin ikäryhmien kesken, mutta koska ikä on todellinen riskitekijä, malli odottaa kutsutuilta hieman vähemmän syöpiä. Valinta on arvovalinta, joka kuuluu alueen päätettäväksi.
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <p className="font-semibold">Riskijärjestys vs. pelkät ikä- ja askivuosirajat</p>
          <p className="mt-1">
            Kutsuttujen {summary.invited} henkilön kuuden vuoden riskien summa on <strong>{nf(summary.expectedCancersInvited, 2)}</strong> odotettua keuhkosyöpää. Jos sama määrä valittaisiin pelkillä rajoilla (50–74 v, vähintään 20 askivuotta, eniten askivuosia ensin),
            summa olisi <strong>{nf(summary.expectedCancersByCriteria, 2)}</strong>
            {summary.criteriaCount < summary.invited && ` (rajat täyttää vain ${summary.criteriaCount} henkilöä)`}.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Luvut ovat mallin itse laskemia odotusarvoja synteettisestä datasta, eivät riippumatonta näyttöä. Riippumaton vertailu riskimallin ja rajojen välillä on alkuperäisessä julkaisussa.
          </p>
        </section>
        </More>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Henkilö</th>
                <th className="px-3 py-2" title="PLCOm2012-riski riskitekijöistä, ikä vakioitu 62 vuoteen">Riski ilman ikää</th>
                <th className="px-3 py-2" title="PLCOm2012: todellinen kuuden vuoden riski">Todellinen riski</th>
                <th className="px-3 py-2">Tila</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const p = r.person;
                return (
                  <tr key={p.response.id} onClick={() => setSelected(p.response.id)} className={`cursor-pointer hover:bg-slate-50 ${selected === p.response.id ? "bg-sky-50" : ""}`}>
                    <td className="px-3 py-2 tabular-nums text-slate-500">{r.rank ?? "–"}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => setSelected(p.response.id)} className="text-left font-medium text-sky-800 hover:underline">
                        {p.response.id} · {p.response.age} v
                      </button>
                      {(p as ScreeningPerson & { live?: boolean }).live && <span className="ml-1 rounded bg-emerald-100 px-1 text-xs text-emerald-800">uusi</span>}
                      <span className="block text-xs text-slate-500">
                        {SMOKING_LABEL[p.response.smoking.status]}
                        {p.response.smoking.status !== "never" && `, ${p.response.smoking.pack_years} askivuotta`}
                      </span>
                      {(() => {
                        const e = pilotEligibility(p.response);
                        return e.eligible ? (
                          <span className="mt-0.5 inline-block rounded bg-violet-100 px-1 text-xs text-violet-900">ISC-LDCT-kriteerit täyttyvät</span>
                        ) : (
                          <span className="block text-xs text-slate-400" title="Kansallisen seulontapilotin kriteerit">Ei pilottikriteereitä: {PILOT_REASON_LABEL[e.reason]}</span>
                        );
                      })()}
                      {(r.missingInputs.length > 0 || r.outsideModelAge) && (
                        <span className="block text-xs text-amber-800">
                          {r.missingInputs.length > 0 && "Täydennä tiedot ennen kutsua. "}
                          {r.outsideModelAge && "Alle 55 v: mallin kehitysjoukon (55–74 v) ulkopuolella."}
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-2 tabular-nums ${settings.mode === "equity" ? "font-semibold" : "text-slate-500"}`}>
                      {p.priority.level === "not_applicable" ? "–" : formatRisk(p.priority.ageStandardisedScore)}
                      {settings.mode === "equity" && r.timesThreshold !== null && <span className="block text-xs font-normal text-slate-500">{nf(r.timesThreshold)} × kynnys</span>}
                    </td>
                    <td className="px-3 py-2">
                      {p.priority.level === "not_applicable" ? (
                        "–"
                      ) : (
                        <>
                          <span className={`rounded px-1.5 text-xs ${PRIORITY_BADGE[p.priority.level]}`}>{formatRisk(p.priority.score)}</span>
                          {settings.mode === "absolute" && r.timesThreshold !== null && <span className="block text-xs text-slate-500">{nf(r.timesThreshold)} × kynnys</span>}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 text-xs ${STATUS_BADGE[r.status]}`}>
                        {r.status === "invite" ? `Kutsu viikolla ${r.inviteWeek}` : SCREENING_STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {!row ? (
            <p className="text-slate-500">Valitse henkilö nähdäksesi, mistä hänen riskinsä koostuu.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {row.person.response.id} · {row.person.response.age} v
                </h2>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_BADGE[row.status]}`}>
                  {row.status === "invite" ? `Kutsu viikolla ${row.inviteWeek}` : SCREENING_STATUS_LABEL[row.status]}
                </span>
              </div>
              {row.person.priority.level !== "not_applicable" && (
                <>
                  <p>
                    PLCOm2012: todellinen kuuden vuoden keuhkosyöpäriski <strong>{formatRisk(row.person.priority.score)}</strong>, riskitekijöistä ilman ikää (62-vuotiaana){" "}
                    <strong>{formatRisk(row.person.priority.ageStandardisedScore)}</strong>
                    {row.rank && <> · sija {row.rank} seulontajärjestyksessä</>}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Mallin tekijät (riskikerroin verrattuna mallin keskitasoon){settings.mode === "equity" && ". Tasa-arvoisessa järjestyksessä ikää ei lasketa mukaan."}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {row.person.priority.contributions.map((c) => (
                        <li key={c.key} className="flex justify-between gap-2">
                          <span>{c.label}</span>
                          <span className={`tabular-nums ${c.logit > 0 ? "text-rose-700" : "text-sky-700"}`}>×{c.factor.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {row.person.priority.imputed.length > 0 && (
                    <p className="text-xs text-amber-800">Täydennetty mallin keskiarvolla: {row.person.priority.imputed.map((k) => IMPUTED_LABEL[k]).join(", ")}.</p>
                  )}
                </>
              )}
              {row.status === "symptomatic" && (
                <p className="rounded bg-rose-50 p-2 text-xs text-rose-900">
                  Henkilöllä on oireita, joten hänet arvioidaan portaassa 1 (Lääkäri-näkymä) eikä seulontajärjestyksessä.{" "}
                  <a href="/clinician" className="underline">
                    Avaa lääkärin lista →
                  </a>
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
