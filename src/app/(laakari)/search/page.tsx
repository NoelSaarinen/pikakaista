"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveVersion } from "@/components/LiveData";
import { AnalysisCard, PRIORITY_BADGE } from "@/components/AnalysisCard";
import { BookingBadge } from "@/components/BookingPanel";
import { NewAnswers } from "@/components/NewAnswers";
import { EngagementBadge, PathwayCard } from "@/components/PathwayCard";
import { ENGAGEMENT_LABEL, STAGE_LABEL, STAGE_ORDER, type Engagement, type PathwayStage } from "@/lib/pathway";
import { formatRisk, PRIORITY_LEVEL_LABEL, type RiskPriority } from "@/lib/priority";
import { PLACEMENT_LABEL } from "@/lib/rules";
import {
  EMPTY_FILTERS,
  searchPatients,
  SMOKING_LABEL,
  SORT_LABEL,
  SYMPTOM_FILTERS,
  URGENCY_LABEL,
  urgencyOf,
  type PatientFilters,
  type SearchablePatient,
  type SortKey,
  type Urgency,
} from "@/lib/search";
import type { SmokingStatus } from "@/lib/types";

const URGENCY_BADGE: Record<Urgency, string> = {
  red_flag: "bg-rose-100 text-rose-800",
  symptom_review: "bg-amber-100 text-amber-900",
  direct_ct: "bg-rose-50 text-rose-800",
  physician_fast: "bg-amber-50 text-amber-900",
  normal_route: "bg-slate-100 text-slate-700",
  not_eligible: "bg-slate-100 text-slate-500",
};

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <label className="block text-xs text-slate-600">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SearchPage() {
  const [items, setItems] = useState<SearchablePatient[] | null>(null);
  const [f, setF] = useState<PatientFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<string | null>(null);
  const set = <K extends keyof PatientFilters>(key: K, value: PatientFilters[K]) => setF((prev) => ({ ...prev, [key]: value }));

  const version = useLiveVersion();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/patients", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { items: SearchablePatient[] }) => {
        if (!cancelled) setItems(json.items);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const results = useMemo(() => (items ? searchPatients(items, f) : []), [items, f]);
  const item = items?.find((x) => x.response.id === selected) ?? null;
  const active = JSON.stringify({ ...f, sort: "urgency" }) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Potilashaku · synteettinen data</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Hae potilaita</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Hae tunnuksella, oireella, omin sanoin kirjoitetulla tekstillä tai hoitopolun vaiheella, ja rajaa tuloksia suodattimilla. Kaikkien hakusanojen pitää löytyä. Esimerkiksi <q>yskä entinen</q> löytää entiset tupakoijat, joilla on yskää.
        </p>
      </div>

      <NewAnswers
        items={items}
        onSelect={setSelected}
        describe={(x) => `→ ${URGENCY_LABEL[urgencyOf(x.rule)]} · ${STAGE_LABEL[x.pathway.stage]}${x.priority.level === "not_applicable" ? "" : ` · PLCO ${formatRisk(x.priority.score)}`}`}
      />

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <input
          autoFocus
          value={f.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Hae: tunnus (p-0005), oire, vapaa teksti, vaihe…"
          aria-label="Hakusanat"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          <Select<SmokingStatus | "all">
            label="Tupakointi"
            value={f.smoking}
            onChange={(v) => set("smoking", v)}
            options={[["all", "Kaikki"], ...(Object.entries(SMOKING_LABEL) as [SmokingStatus, string][])]}
          />
          <Select<Urgency | "all">
            label="Kiireellisyys"
            value={f.urgency}
            onChange={(v) => set("urgency", v)}
            options={[["all", "Kaikki"], ...(Object.entries(URGENCY_LABEL) as [Urgency, string][])]}
          />
          <Select<RiskPriority["level"] | "all">
            label="PLCOm2012"
            value={f.plcoLevel}
            onChange={(v) => set("plcoLevel", v)}
            options={[["all", "Kaikki"], ...(Object.entries(PRIORITY_LEVEL_LABEL) as [RiskPriority["level"], string][])]}
          />
          <Select<Engagement | "all">
            label="Sitoutuminen"
            value={f.engagement}
            onChange={(v) => set("engagement", v)}
            options={[["all", "Kaikki"], ...(Object.entries(ENGAGEMENT_LABEL) as [Engagement, string][])]}
          />
          <Select<PathwayStage | "all">
            label="Hoitopolun vaihe"
            value={f.stage}
            onChange={(v) => set("stage", v)}
            options={[["all", "Kaikki"], ...STAGE_ORDER.map((s) => [s, STAGE_LABEL[s]] as [PathwayStage, string])]}
          />
          <Select<"survey" | "health_centre" | "all">
            label="Kanava"
            value={f.channel}
            onChange={(v) => set("channel", v)}
            options={[["all", "Kaikki"], ["survey", "Kysely"], ["health_centre", "Terveyskeskus"]]}
          />
          <div className="grid grid-cols-2 gap-1">
            <label className="block text-xs text-slate-600">
              Ikä vähintään
              <input
                type="number"
                min={0}
                value={f.minAge ?? ""}
                onChange={(e) => set("minAge", e.target.value === "" ? null : Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="block text-xs text-slate-600">
              enintään
              <input
                type="number"
                min={0}
                value={f.maxAge ?? ""}
                onChange={(e) => set("maxAge", e.target.value === "" ? null : Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600">Oireet (kaikki valitut):</span>
          {SYMPTOM_FILTERS.map((s) => {
            const on = f.symptoms.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => set("symptoms", on ? f.symptoms.filter((k) => k !== s.key) : [...f.symptoms, s.key])}
                className={`rounded-full border px-2 py-0.5 ${on ? "border-sky-600 bg-sky-50 font-semibold text-sky-900" : "border-slate-300"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-slate-600" aria-live="polite">
            {items ? `${results.length} / ${items.length} potilasta` : "Ladataan…"}
          </span>
          <div className="flex items-center gap-2">
            <Select<SortKey> label="" value={f.sort} onChange={(v) => set("sort", v)} options={Object.entries(SORT_LABEL) as [SortKey, string][]} />
            {active && (
              <button type="button" onClick={() => setF({ ...EMPTY_FILTERS, sort: f.sort })} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                Tyhjennä haku
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-white">
          {items && results.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Ei osumia. Kokeile väljempää hakua tai tyhjennä suodattimet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-3 py-2">Potilas</th>
                  <th className="px-3 py-2">Kiireellisyys</th>
                  <th className="px-3 py-2">PLCOm2012</th>
                  <th className="hidden px-3 py-2 lg:table-cell">Vaihe</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((x) => {
                  const u = urgencyOf(x.rule);
                  return (
                    <tr
                      key={x.response.id}
                      onClick={() => setSelected(x.response.id)}
                      className={`cursor-pointer hover:bg-slate-50 ${selected === x.response.id ? "bg-sky-50" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <button type="button" className="text-left font-medium text-sky-800 hover:underline" onClick={() => setSelected(x.response.id)}>
                          {x.response.id} · {x.response.age} v
                        </button>
                        {x.live && <span className="ml-1 rounded bg-emerald-100 px-1 text-xs text-emerald-800">uusi</span>}
                        <span className="block text-xs text-slate-500">
                          {SMOKING_LABEL[x.response.smoking.status]}
                          {x.response.smoking.status !== "never" && `, ${x.response.smoking.pack_years} askivuotta`}
                          {" · "}
                          {x.response.channel === "health_centre" ? "terveyskeskus" : "kysely"}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {SYMPTOM_FILTERS.filter((s) => s.has(x.response)).map((s) => s.label).join(", ") || "Ei oireita"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 text-xs ${URGENCY_BADGE[u]}`}>{URGENCY_LABEL[u]}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 text-xs ${PRIORITY_BADGE[x.priority.level]}`}>
                          {x.priority.level === "not_applicable" ? "–" : formatRisk(x.priority.score)}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2 text-xs lg:table-cell">
                        <EngagementBadge engagement={x.pathway.engagement} />
                        <span className="mt-0.5 block text-slate-600">{STAGE_LABEL[x.pathway.stage]}</span>
                        <BookingBadge booking={x.booking ?? null} queued={x.queued ?? null} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {!item ? (
            <p className="text-slate-500">Valitse potilas hakutuloksista.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {item.response.id} · {item.response.age} v
                </h2>
                <span className={`rounded px-2 py-0.5 text-xs ${URGENCY_BADGE[urgencyOf(item.rule)]}`}>{URGENCY_LABEL[urgencyOf(item.rule)]}</span>
              </div>
              <p className="text-xs text-slate-600">
                {SMOKING_LABEL[item.response.smoking.status]}
                {item.response.smoking.status !== "never" && `, ${item.response.smoking.pack_years} askivuotta`} · Sääntöjen ehdotus: {PLACEMENT_LABEL[item.rule.placement]}
                {item.decision && <> · Lääkäri: {PLACEMENT_LABEL[item.decision]}</>}
              </p>
              {item.rule.reasons.length > 0 && (
                <ul className="list-disc pl-5 text-xs">
                  {item.rule.reasons.map((r) => (
                    <li key={r.code}>
                      {r.label}: <q>{r.answer}</q>
                    </li>
                  ))}
                </ul>
              )}
              {item.response.free_text && (
                <p className="text-xs text-slate-600">
                  Omin sanoin: <q>{item.response.free_text}</q>
                </p>
              )}
              <a href="/clinician" className="inline-block text-xs text-sky-700 underline">
                Avaa lääkärin lista →
              </a>
              <AnalysisCard key={item.response.id} id={item.response.id} />
              <PathwayCard pathway={item.pathway} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
