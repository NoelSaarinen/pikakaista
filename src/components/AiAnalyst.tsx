"use client";

import { useEffect, useState } from "react";
import { RichText } from "./RichText";

type Brief = { text: string; generated_by: "llm" | "template" };

/**
 * AI analyst at the top of the decision-maker view: the model reads the county's figures
 * and writes the situation and the recommended action, citing a source for every number.
 * All numbers come from the calculation; the model only writes. Without an API key the
 * same structure is filled from a template.
 */
export function AiAnalyst({ countyId, countyName, overrides }: { countyId: string; countyName: string; overrides: object }) {
  const [nonce, setNonce] = useState(0);
  const key = `${countyId}:${JSON.stringify(overrides)}:${nonce}`;
  const [loaded, setLoaded] = useState<{ key: string; brief: Brief | null } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ countyId, overrides, mode: "doors_survey", fresh: nonce > 0 }) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((brief) => active && setLoaded({ key, brief }));
    return () => {
      active = false;
    };
  }, [countyId, overrides, key, nonce]);

  const brief = loaded?.key === key ? loaded.brief : null;
  const loading = loaded?.key !== key;

  return (
    <section aria-live="polite" className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-brand-blue text-sm text-white">
            ✦
          </span>
          Tekoälyanalyytikko · {countyName}
        </p>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {brief && (brief.generated_by === "llm" ? "Kirjoitti tekoäly, luvut laskelmasta" : "Varapohja ilman tekoälyä, luvut laskelmasta")}
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            disabled={loading}
            className="rounded-sm border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-sky-800 hover:bg-sky-50 disabled:opacity-50"
          >
            Kirjoita uudelleen
          </button>
        </span>
      </div>
      {loading ? (
        <div className="mt-4 space-y-2" aria-label="Tekoäly analysoi alueen lukuja">
          <p className="text-sm text-slate-600">Tekoäly analysoi alueen lukuja…</p>
          {[92, 80, 86, 60].map((w) => (
            <span key={w} className="block h-3 animate-pulse rounded bg-slate-100" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : brief ? (
        <div className="mt-3 text-[15px] [&_p:has(strong:first-child)]:mt-3">
          <RichText text={brief.text} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Tiivistelmää ei saatu. Luvut ovat alla.</p>
      )}
    </section>
  );
}
