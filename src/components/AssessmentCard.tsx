"use client";

import { useEffect, useState } from "react";
import { LEVEL_LABEL, type Assessment } from "@/lib/assessment-labels";

type Result = Assessment;

const COMPARISON_TEXT: Record<Assessment["comparison"], string> = {
  same: "Tekoälyn ehdotus on sama kuin sääntöjen taso.",
  higher: "Tekoäly ehdottaa korkeampaa tasoa. Lääkäri harkitsee; ehdotus ei muuta ajanvarausta.",
  lower: "Tekoäly ehdottaa matalampaa tasoa, mutta säännöt pitävät tasonsa. Tekoäly ei voi laskea kiireellisyyttä.",
};

/** AI summary and suggested level next to the rule level. `version` reloads after follow-up answers. */
export function AssessmentCard({ id, version = 0 }: { id: string; version?: number }) {
  const key = `${id}:${version}`;
  const [loaded, setLoaded] = useState<{ key: string; data: Result | null } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/assess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => active && setLoaded({ key, data: d }));
    return () => {
      active = false;
    };
  }, [id, key]);

  const data = loaded?.key === key ? loaded.data : null;
  if (loaded?.key !== key) return <div className="rounded border border-violet-200 bg-violet-50 p-3 text-sm">Tekoäly arvioi vastausta…</div>;
  if (!data) return null;

  return (
    <div className="space-y-2 rounded border border-violet-200 bg-violet-50 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-violet-900">
          {data.generatedBy === "llm" ? "Tekoälyn arvio" : "Arvio ilman tekoälyä (sääntöpohja)"}
        </p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-slate-600">Sääntöjen taso</dt>
        <dd className="font-semibold">
          {LEVEL_LABEL[data.ruleLevel]}
          <span className="block text-xs font-normal text-slate-600">{data.ruleReason}</span>
        </dd>
        <dt className="text-slate-600">Tekoälyn ehdotus</dt>
        <dd className={`font-semibold ${data.comparison === "higher" ? "text-rose-700" : ""}`}>{LEVEL_LABEL[data.suggestedLevel]}</dd>
      </dl>
      {data.generatedBy === "llm" && <p className="text-xs text-slate-700">{COMPARISON_TEXT[data.comparison]}</p>}
      <p className="whitespace-pre-line">{data.summary}</p>
      {data.reasons.length > 0 && (
        <div>
          <p className="text-xs font-semibold">Perustelut</p>
          <ul className="list-disc pl-5">{data.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {data.evidence.length > 0 && (
        <div>
          <p className="text-xs font-semibold">Vastaajan omat vastaukset</p>
          <ul className="list-disc pl-5">{data.evidence.map((x) => <li key={x}><q>{x}</q></li>)}</ul>
        </div>
      )}
      {data.uncertainties.length > 0 && (
        <div>
          <p className="text-xs font-semibold">Epävarmuudet</p>
          <ul className="list-disc pl-5">{data.uncertainties.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      <p className="text-xs text-slate-500">Ehdotus on avuksi. Taso, ajanvaraus ja listan järjestys tulevat säännöistä, ja lääkäri päättää.</p>
    </div>
  );
}
