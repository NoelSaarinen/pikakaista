"use client";

import { useEffect, useState } from "react";
import { notifyChange } from "@/components/LiveData";
import type { SurveyAnalysis } from "@/lib/analysis";
import type { SurveyText } from "@/lib/i18n/survey-text";
import { formatRisk, IMPUTED_LABEL, PRIORITY_LEVEL_LABEL, type RiskPriority } from "@/lib/priority";

type Analysis = SurveyAnalysis & { priority: RiskPriority; answers: Record<string, string> };

export const PRIORITY_BADGE: Record<RiskPriority["level"], string> = {
  high: "bg-rose-100 text-rose-800",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-slate-100 text-slate-600",
  not_applicable: "bg-slate-50 text-slate-400",
};

/** Preliminary AI analysis for one person: urgency and long-term risk apart, plus follow-up questions. */
export function AnalysisCard({
  id,
  onAnswered,
  compact = false,
  respondent = false,
  texts,
}: {
  id: string;
  onAnswered?: () => void;
  compact?: boolean;
  respondent?: boolean;
  /** Respondent-language texts. Stored answer values stay "kyllä"/"ei". */
  texts?: SurveyText;
}) {
  const [data, setData] = useState<Analysis | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      .then((res) => res.json())
      .then((json: Analysis) => {
        if (cancelled) return;
        setData(json);
        setDraft(json.answers ?? {});
        setSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save() {
    await fetch("/api/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, answers: draft }) });
    setSaved(true);
    notifyChange();
    onAnswered?.();
  }

  if (!data) return <div className="rounded border border-slate-200 p-3 text-sm text-slate-500">{texts?.loading ?? "Analysoidaan vastausta…"}</div>;
  const p = data.priority;

  const questions = (
    <div>
      <p className="text-xs font-semibold text-slate-600">{respondent ? (texts?.followUpHint ?? "Vastaa halutessasi, se auttaa lääkäriä") : "Mukautuvat jatkokysymykset"}</p>
      <div className="mt-1 space-y-2">
        {data.questions.map((q) => (
          <label key={q.id} className="block">
            <span className="text-xs">{(respondent && texts?.followUps[q.id]) || q.text}</span>
            {q.kind === "yes_no" ? (
              <div className="mt-0.5 flex gap-1">
                {["kyllä", "ei"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, [q.id]: v }))}
                    className={`rounded border px-2 py-0.5 text-xs ${draft[q.id] === v ? "border-violet-600 bg-violet-100 font-semibold" : "border-slate-300 bg-white"}`}
                  >
                    {texts ? (v === "kyllä" ? texts.answerYes : texts.answerNo) : v}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={q.kind === "number" ? "number" : "text"}
                min={0}
                value={draft[q.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                className="mt-0.5 w-28 rounded border border-slate-300 px-2 py-0.5 text-xs"
              />
            )}
          </label>
        ))}
      </div>
      <button type="button" onClick={save} className="mt-2 rounded bg-violet-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-800">
        {respondent ? (texts?.followUpSend ?? "Lähetä vastaukset") : "Tallenna vastaukset"}
      </button>
      {saved && <span className="ml-2 text-xs text-emerald-700">✓ {respondent ? (texts?.thanks ?? "Kiitos!") : "Tallennettu. Lääkärin yhteenveto päivittyy."}</span>}
    </div>
  );

  // The respondent sees only the questions, never the urgency or risk assessment.
  if (respondent) return <div className="rounded border border-slate-200 p-3 text-sm">{questions}</div>;

  return (
    <div className="space-y-3 rounded border border-violet-200 bg-violet-50/40 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{data.generatedBy === "llm" ? "Tekoälyn alustava analyysi" : "Alustava analyysi (sääntöpohjainen)"}</p>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[p.level]}`}>
          {p.level === "not_applicable" ? PRIORITY_LEVEL_LABEL[p.level] : `PLCOm2012 ${formatRisk(p.score)} · ${PRIORITY_LEVEL_LABEL[p.level]}`}
        </span>
      </div>

      <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className="rounded bg-white p-2">
          <p className="text-xs font-semibold text-rose-800">Kiireellisyys (säännöt päättävät)</p>
          <p>{data.urgency}</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className="text-xs font-semibold text-violet-800">Pitkän aikavälin riski</p>
          <p>{data.risk}</p>
        </div>
      </div>

      {p.contributions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600">PLCOm2012-mallin tekijät (riskikerroin verrattuna mallin keskitasoon)</p>
          <ul className="mt-1 space-y-0.5 text-xs">
            {p.contributions.map((c) => (
              <li key={c.key} className="flex justify-between gap-2">
                <span>{c.label}</span>
                <span className={`tabular-nums ${c.logit > 0 ? "text-rose-700" : "text-sky-700"}`}>×{c.factor.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {p.imputed.length > 0 && (
            <p className="mt-1 text-xs text-amber-800">Puuttuvat tiedot täydennetty mallin keskiarvolla: {p.imputed.map((k) => IMPUTED_LABEL[k]).join(", ")}.</p>
          )}
        </div>
      )}

      {questions}
      <p className="text-xs text-slate-400">
        PLCOm2012 (Tammemägi ym., NEJM 2013) arvioi tupakoineen kuuden vuoden keuhkosyöpäriskin. Se ei arvioi oireita: kiireellisyyden päättävät hälytysmerkkisäännöt, ja riski järjestää vain saman kiireellisyysryhmän potilaat.
      </p>
    </div>
  );
}
