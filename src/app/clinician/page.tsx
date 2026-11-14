"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalysisCard, PRIORITY_BADGE } from "@/components/AnalysisCard";
import { EngagementBadge, PathwayCard } from "@/components/PathwayCard";
import { STAGE_LABEL } from "@/lib/pathway";
import { formatRisk } from "@/lib/priority";
import { PLACEMENT_LABEL } from "@/lib/rules";
import type { CaseSummary, Placement } from "@/lib/types";
import type { WorklistItem } from "@/lib/store";

type Worklist = { items: WorklistItem[]; counts: Record<Placement, number>; total: number };

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
    `Tupakointi: ${r.smoking.status === "current" ? "tupakoi" : "entinen tupakoija"}, ${r.smoking.pack_years} askivuotta`,
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

  const load = useCallback(async () => {
    const res = await fetch("/api/worklist", { cache: "no-store" });
    setData(await res.json());
  }, []);

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
  }, []);

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

  async function decide(placement: Placement) {
    if (!selected) return;
    await fetch("/api/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected, placement }) });
    await load();
  }

  const item = data?.items.find((x) => x.response.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-sky-700">Lääkärinäkymä · terveyskeskus</p>
        <h1 className="text-2xl font-bold">Pikakaistan lista</h1>
        {data && (
          <p className="text-sm text-slate-600">
            {data.total} vastausta (synteettisiä). Säännöt ohjasivat pikakaistalle {data.counts.direct_ct + data.counts.physician_fast}: suoraan TT {data.counts.direct_ct}, lääkärille {data.counts.physician_fast}. Tavallinen reitti {data.counts.normal_route}, ei riskiryhmässä {data.counts.not_eligible}.
          </p>
        )}
        {data && (
          <p className="text-xs text-slate-500">
            Järjestys: hälytysmerkit ensin, saman kiireellisyyden sisällä PLCOm2012-mallin kuuden vuoden keuhkosyöpäriski (Tammemägi ym., NEJM 2013).{" "}
            <a href="/evidence" className="text-sky-700 underline">Uusin tutkimus →</a>
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul className="max-h-[70vh] divide-y overflow-auto rounded-lg border border-slate-200 bg-white">
          {data?.items.map((x) => (
            <li key={x.response.id}>
              <button onClick={() => open(x.response.id)} className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${selected === x.response.id ? "bg-sky-50" : ""}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {x.response.id} · {x.response.age} v{x.live && <span className="ml-1 rounded bg-emerald-100 px-1 text-xs text-emerald-800">uusi</span>}
                    <span className="ml-1 rounded bg-slate-100 px-1 text-xs text-slate-600">{x.response.channel === "health_centre" ? "terveyskeskus" : "kysely"}</span>
                  </span>
                  <span className={`rounded px-1.5 text-xs ${BADGE[x.rule.placement]}`}>{PLACEMENT_LABEL[x.rule.placement]}</span>
                </span>
                <span className="block truncate text-xs text-slate-500">{x.rule.reasons.map((r) => r.label).join(", ")}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <EngagementBadge engagement={x.pathway.engagement} />
                  <span className="text-slate-600">{STAGE_LABEL[x.pathway.stage]}</span>
                  <span className={`ml-auto rounded px-1.5 ${PRIORITY_BADGE[x.priority.level]}`} title="PLCOm2012: kuuden vuoden keuhkosyöpäriski">
                    {x.priority.level === "not_applicable" ? "PLCO –" : `PLCO ${formatRisk(x.priority.score)}`}
                  </span>
                </span>
                {x.decision && <span className="text-xs font-medium text-emerald-700">✓ Lääkäri: {PLACEMENT_LABEL[x.decision]}</span>}
              </button>
            </li>
          ))}
        </ul>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {!item ? (
            <p className="text-sm text-slate-500">Valitse henkilö listasta.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {item.response.id} · {item.response.age} v
                </h2>
                <span className={`rounded px-2 py-0.5 text-xs ${BADGE[item.rule.placement]}`}>Ehdotus: {PLACEMENT_LABEL[item.rule.placement]}</span>
              </div>

              <div className="rounded bg-sky-50 p-3">
                <p className="text-xs font-semibold text-sky-800">{summary?.generated_by === "llm" ? "Tekoälyn yhteenveto" : "Yhteenveto"}</p>
                <p className="mt-1 whitespace-pre-line">{loadingSummary ? "Tiivistetään…" : summary?.summary}</p>
              </div>

              <AnalysisCard id={item.response.id} onAnswered={() => open(item.response.id)} />

              <div>
                <p className="font-semibold">Perustelut (henkilön omat vastaukset)</p>
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
              <p className="text-xs text-slate-500">Tekoäly vain tiivistää ja ehdottaa. Säännöt päättävät, kuka nousee listalle, ja lääkäri päättää jatkosta.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
