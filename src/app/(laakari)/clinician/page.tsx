"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notifyChange, useLiveVersion } from "@/components/LiveData";
import { AnalysisCard, PRIORITY_BADGE } from "@/components/AnalysisCard";
import { BookingBadge, BookingPanel } from "@/components/BookingPanel";
import { EngagementBadge, PathwayCard } from "@/components/PathwayCard";
import { formatSlot, TIER_LABEL } from "@/lib/booking";
import { STAGE_LABEL } from "@/lib/pathway";
import { formatRisk } from "@/lib/priority";
import { PLACEMENT_LABEL } from "@/lib/rules";
import { searchText } from "@/lib/search";
import type { CaseSummary, Placement } from "@/lib/types";
import type { WorklistItem } from "@/lib/store";

type Worklist = { items: WorklistItem[]; counts: Record<Placement, number>; total: number };

type QuickFilter = "all" | "red_flag" | "symptoms" | "new" | "booked";
const QUICK_FILTERS: { key: QuickFilter; label: string; test: (x: WorklistItem) => boolean }[] = [
  { key: "all", label: "Kaikki", test: () => true },
  { key: "red_flag", label: "Hälytysmerkki", test: (x) => x.rule.redFlag },
  { key: "symptoms", label: "Oireet", test: (x) => x.rule.symptomReviewRequired },
  { key: "new", label: "Uudet vastaukset", test: (x) => x.live },
  { key: "booked", label: "Varattu aika", test: (x) => !!x.booking },
];

const BADGE: Record<Placement, string> = {
  direct_ct: "bg-rose-100 text-rose-800",
  physician_fast: "bg-amber-100 text-amber-900",
  normal_route: "bg-slate-100 text-slate-700",
  not_eligible: "bg-slate-100 text-slate-500",
};

function referralText(item: WorklistItem, summary: CaseSummary | null) {
  const r = item.response;
  return [
    "LÄHETE: Rintakehän TT-tutkimus, keuhkosyöpäepäilyn pikakaista",
    `Potilas: ${r.id} (synteettinen), ${r.age} v`,
    `Tupakointi: ${r.smoking.status === "current" ? "tupakoi" : r.smoking.status === "former" ? "entinen tupakoija" : "ei ole tupakoinut"}, ${r.smoking.pack_years} askivuotta`,
    `Oireet: ${item.rule.reasons.map((x) => `${x.label.toLowerCase()} (${x.answer})`).join(", ")}`,
    summary ? `Yhteenveto: ${summary.summary}` : "",
    "Lähettävä lääkäri: ______________________ (allekirjoitus)",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ClinicianPage() {
  const [data, setData] = useState<Worklist | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<QuickFilter>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/worklist", { cache: "no-store" });
    setData(await res.json());
  }, []);

  const version = useLiveVersion();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/worklist", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: Worklist) => {
        if (!cancelled) setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function open(id: string) {
    setSelected(id);
    setSummary(null);
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setSummary(await res.json());
    } finally {
      setLoadingSummary(false);
    }
  }

  async function cancelBooking(id: string) {
    await fetch("/api/booking/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    notifyChange();
    await load();
  }

  async function decide(placement: Placement) {
    if (!selected) return;
    await fetch("/api/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected, placement }) });
    notifyChange();
    await load();
  }

  const item = data?.items.find((x) => x.response.id === selected) ?? null;
  // Same free-text search as the patient search page: every word must match. The list
  // order (urgency first) is kept.
  const shown = useMemo(() => {
    const words = query.toLocaleLowerCase("fi-FI").normalize("NFC").split(/s+/).filter(Boolean);
    const test = QUICK_FILTERS.find((f) => f.key === quick)!.test;
    return (data?.items ?? []).filter((x) => test(x) && (words.length === 0 || words.every((w) => searchText(x).includes(w))));
  }, [data, query, quick]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-sky-700">Lääkärinäkymä · terveyskeskus</p>
        <h1 className="text-2xl font-bold">Pikakaistan lista</h1>
        {data && (
          <p className="text-sm text-slate-600">
            {data.total} vastausta (synteettisiä). Säännöt ohjasivat pikakaistalle {data.counts.direct_ct + data.counts.physician_fast}: suoraan TT {data.counts.direct_ct}, lääkärille {data.counts.physician_fast}. Oirearvioon lisäksi {data.items.filter((x) => x.rule.symptomReviewRequired && x.rule.placement === "not_eligible").length} riskiryhmän ulkopuolista. Tavallinen reitti {data.counts.normal_route}, ei seulontakyselyn riskirajassa {data.counts.not_eligible}.
          </p>
        )}
        {data && (
          <p className="text-xs text-slate-500">
            Järjestys: hälytysmerkit ensin, saman kiireellisyyden sisällä PLCOm2012-mallin kuuden vuoden keuhkosyöpäriski (Tammemägi ym., NEJM 2013).{" "}
            <a href="/evidence" className="text-sky-700 underline">Uusin tutkimus →</a>
          </p>
        )}
      </div>

      <BookingPanel onBooked={load} />

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-2">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <label className="sr-only" htmlFor="worklist-search">Hae listalta</label>
          <input
            id="worklist-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hae tunnuksella, iällä, oireella tai omin sanoin, esim. veriyskä 67 v"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={quick === f.key}
                onClick={() => setQuick(f.key)}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${quick === f.key ? "border-sky-700 bg-sky-700 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500" aria-live="polite">
              {shown.length} / {data?.items.length ?? 0}
            </span>
          </div>
        </div>
        <ul className="max-h-[65vh] divide-y overflow-auto rounded-lg border border-slate-200 bg-white">
          {data && shown.length === 0 && <li className="px-3 py-4 text-sm text-slate-500">Hakua vastaavia henkilöitä ei löytynyt.</li>}
          {shown.map((x) => (
            <li key={x.response.id}>
              <button onClick={() => open(x.response.id)} className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${selected === x.response.id ? "bg-sky-50" : ""}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {x.response.id} · {x.response.age} v{x.live && <span className="ml-1 rounded bg-emerald-100 px-1 text-xs text-emerald-800">uusi</span>}
                    <span className="ml-1 rounded bg-slate-100 px-1 text-xs text-slate-600">{x.response.channel === "health_centre" ? "terveyskeskus" : "kysely"}</span>
                  </span>
                  <span className={`rounded px-1.5 text-xs ${BADGE[x.rule.placement]}`}>
                    {x.rule.symptomReviewRequired ? "Oireet: ammattilaisen arvio" : PLACEMENT_LABEL[x.rule.placement]}
                  </span>
                </span>
                <span className="block truncate text-xs text-slate-500">{x.rule.reasons.map((r) => r.label).join(", ")}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <EngagementBadge engagement={x.pathway.engagement} />
                  <span className="text-slate-600">{STAGE_LABEL[x.pathway.stage]}</span>
                  <span className={`ml-auto rounded px-1.5 ${PRIORITY_BADGE[x.priority.level]}`} title="PLCOm2012: kuuden vuoden keuhkosyöpäriski">
                    {x.priority.level === "not_applicable" ? "PLCO –" : `PLCO ${formatRisk(x.priority.score)}`}
                  </span>
                </span>
                {(x.booking || x.queued) && (
                  <span className="mt-0.5 block">
                    <BookingBadge booking={x.booking} queued={x.queued} />
                  </span>
                )}
                {x.decision && <span className="text-xs font-medium text-emerald-700">✓ Lääkäri: {PLACEMENT_LABEL[x.decision]}</span>}
              </button>
            </li>
          ))}
        </ul>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {!item ? (
            <p className="text-sm text-slate-500">Valitse henkilö listasta.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {item.response.id} · {item.response.age} v
                </h2>
                <span className={`rounded px-2 py-0.5 text-xs ${BADGE[item.rule.placement]}`}>
                  {item.rule.symptomReviewRequired
                    ? "Oireet arvioitava ammattilaisella; seulontariski arvioidaan erikseen"
                    : `Ehdotus: ${PLACEMENT_LABEL[item.rule.placement]}`}
                </span>
              </div>

              <div className="rounded bg-sky-50 p-3">
                <p className="text-xs font-semibold text-sky-800">{summary?.generated_by === "llm" ? "Tekoälyn yhteenveto" : "Yhteenveto"}</p>
                <p className="mt-1 whitespace-pre-line">{loadingSummary ? "Tiivistetään…" : summary?.summary}</p>
              </div>

              {(item.booking || item.queued) && (
                <div className={`rounded border p-3 ${item.booking ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                  <p className="font-semibold">
                    {item.booking ? `Lääkäriaika varattu (simuloitu): ${formatSlot(item.booking.start)}` : "Korkea riski, mutta vapaata aikaa ei ole kahden viikon sisällä"}
                  </p>
                  <p className="text-xs text-slate-700">
                    {TIER_LABEL[(item.booking ?? item.queued)!.tier]} · {(item.booking ?? item.queued)!.reason}
                  </p>
                  {item.booking && !item.booking.withinTarget && (
                    <p className="mt-1 text-xs font-medium text-amber-900">Aika on tavoiteajan jälkeen ({item.booking.workdaysFromNow} arkipäivää). Alueen kapasiteetti ei riitä.</p>
                  )}
                  {item.queued && <p className="mt-1 text-xs text-rose-900">Lisää alueen pikakaistan aikoja tai arvioi potilas muuta reittiä.</p>}
                  {item.booking && (
                    <button onClick={() => cancelBooking(item.response.id)} className="mt-2 rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">
                      Peru aika
                    </button>
                  )}
                </div>
              )}

              <AnalysisCard id={item.response.id} onAnswered={() => open(item.response.id)} />

              <div>
                <p className="font-semibold">Perustelut (henkilön omat vastaukset)</p>
                {item.rule.symptomReviewRequired && (
                  <p className="mt-1 rounded bg-amber-50 p-2 text-amber-900">Henkilö ilmoitti oireita. Ne pitää arvioida ammattilaisen kanssa; seulontarajan alittaminen ei poista tätä tarvetta. Sääntöpisteet eivät ole validoitu kliininen kriteeri.</p>
                )}
                <ul className="mt-1 list-disc pl-5">
                  {item.rule.reasons.map((r) => (
                    <li key={r.code}>
                      {r.label}: <q>{r.answer}</q>
                      {r.redFlag && <span className="ml-1 text-xs font-semibold text-rose-700">yksinään riittävä merkki</span>}
                    </li>
                  ))}
                </ul>
                {item.response.free_text && (
                  <p className="mt-2 text-slate-600">
                    Omin sanoin ({item.response.language}): <q>{item.response.free_text}</q>
                  </p>
                )}
              </div>

              <PathwayCard pathway={item.pathway} />
              {item.rule.screeningRisk6y !== null && (
                <div className="rounded border border-sky-200 bg-sky-50 p-3">
                  <p className="font-semibold">PLCOm2012, 6 vuoden seulontariskin tutkimusarvio: {(item.rule.screeningRisk6y * 100).toFixed(2)} %</p>
                  <p className="mt-1 text-xs text-slate-600">Yhdysvaltalaisella aineistolla kehitetty malli; ei kalibroitu Suomen väestöön eikä käytetä oireohjaukseen. {item.rule.screeningRiskInOriginalAgeRange === false && "Ikä on alkuperäisen tutkimusjoukon 55–74 vuoden ulkopuolella."}</p>
                </div>
              )}

              {item.rule.placement === "direct_ct" && (
                <pre className="whitespace-pre-wrap rounded border border-dashed border-slate-300 p-3 font-mono text-xs">{referralText(item, summary)}</pre>
              )}

              <div className="flex flex-wrap gap-2">
                <button onClick={() => decide(item.rule.placement)} className="rounded bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800">
                  Hyväksy ehdotus
                </button>
                {(["direct_ct", "physician_fast", "normal_route"] as Placement[])
                  .filter((p) => p !== item.rule.placement)
                  .map((p) => (
                    <button key={p} onClick={() => decide(p)} className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
                      Muuta: {PLACEMENT_LABEL[p]}
                    </button>
                  ))}
              </div>
              {item.decision && <p className="font-medium text-emerald-700">✓ Lääkäri päätti: {PLACEMENT_LABEL[item.decision]}</p>}
              <p className="text-xs text-slate-500">Oireet ja seulontariski arvioidaan erikseen. PLCOm2012 ei ole Suomen väestölle validoitu; lääkäri päättää tutkimuksista ja jatkosta.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
