"use client";

import { useEffect, useState } from "react";
import { notifyChange } from "@/components/LiveData";
import { More } from "@/components/More";
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

/**
 * PLCOm2012 risk badge, coloured by level for everyone: red ≥ 2 %, yellow 1–2 %, grey
 * under 1 %. The model leaves out symptoms by design, so for people with symptoms the
 * badge carries an asterisk and says it is a screening risk for people WITHOUT symptoms.
 * Urgency always comes from the alarm rules. Display only; the value is unchanged.
 */
export function PlcoBadge({ priority, symptomatic, compact = false, className = "" }: { priority: RiskPriority; symptomatic: boolean; compact?: boolean; className?: string }) {
  if (priority.level === "not_applicable") return <span className={`rounded px-1.5 text-xs ${PRIORITY_BADGE.not_applicable} ${className}`}>{compact ? "–" : "PLCO –"}</span>;
  const risk = formatRisk(priority.score);
  if (symptomatic) {
    return (
      <span
        className={`rounded px-1.5 text-xs font-semibold ${PRIORITY_BADGE[priority.level]} ${className}`}
        title="PLCOm2012 arvioi oireettomien seulontariskiä eikä ota oireita huomioon. Kiireellisyys tulee oireista."
      >
        {compact ? `${risk}*` : `Seulontariski oireettomille (ei koske oireita): ${risk}`}
      </span>
    );
  }
  return (
    <span className={`rounded px-1.5 text-xs font-semibold ${PRIORITY_BADGE[priority.level]} ${className}`} title="PLCOm2012: kuuden vuoden keuhkosyöpäriski">
      {compact ? risk : `PLCOm2012 ${risk} · ${PRIORITY_LEVEL_LABEL[priority.level]}`}
    </span>
  );
}

/** Preliminary AI analysis for one person: urgency and long-term risk apart, plus follow-up questions. */
export function AnalysisCard({
  id,
  onAnswered,
  compact = false,
  respondent = false,
  texts,
  symptomatic = false,
}: {
  id: string;
  onAnswered?: () => void;
  compact?: boolean;
  respondent?: boolean;
  /** Respondent-language texts. Stored answer values stay "kyllä"/"ei". */
  texts?: SurveyText;
  /** The person reported symptoms: PLCOm2012 is then shown as a screening risk that does not cover symptoms. */
  symptomatic?: boolean;
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
  // After saving, the saved draft is the current answer set; before that, what is stored.
  const answered = saved ? draft : (data.answers ?? {});
  const answeredCount = data.questions.filter((q) => answered[q.id]?.trim()).length;

  const questions = (
    <div>
      {respondent ? (
        <p className="text-xs font-semibold text-slate-600">{texts?.followUpHint ?? "Vastaa halutessasi, se auttaa lääkäriä"}</p>
      ) : (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">Kysy puhelimessa tai vastaanotolla</p>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${answeredCount ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
            {answeredCount ? `Vastattu ${answeredCount}/${data.questions.length}` : "Ei vielä vastauksia"}
          </span>
          <p className="w-full text-xs text-slate-500">Potilas näki samat kysymykset kyselyn lopussa. Kirjaa vastaukset, jos kysyt ne itse; yhteenveto ja tekoälyn arvio päivittyvät.</p>
        </div>
      )}
      <div className="mt-1 space-y-2">
        {data.questions.map((q) => (
          <label key={q.id} className="block">
            <span className={respondent ? "text-xs" : "text-sm"}>{(respondent && texts?.followUps[q.id]) || q.text}</span>
            {q.kind === "yes_no" ? (
              <div className="mt-0.5 flex gap-1">
                {["kyllä", "ei"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, [q.id]: v }))}
                    className={`min-h-8 rounded border px-3 py-1 text-sm ${draft[q.id] === v ? "border-sky-700 bg-sky-50 font-semibold text-sky-900" : "border-slate-300 bg-white hover:bg-slate-50"}`}
                  >
                    {texts ? (v === "kyllä" ? texts.answerYes : texts.answerNo) : v}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                inputMode={q.kind === "number" ? "numeric" : "text"}
                value={draft[q.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [q.id]: q.kind === "number" ? e.target.value.replace(/[^0-9]/g, "").slice(0, 4) : e.target.value }))}
                className="mt-0.5 block w-28 rounded border border-slate-300 px-2 py-1 text-sm"
              />
            )}
          </label>
        ))}
      </div>
      <button type="button" onClick={save} className="mt-3 rounded bg-sky-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-800">
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
        <PlcoBadge priority={p} symptomatic={symptomatic} className="py-0.5" />
      </div>

      <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className="rounded bg-white p-2">
          <p className="text-xs font-semibold text-rose-800">Kiireellisyys (säännöt päättävät)</p>
          <p>{data.urgency}</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className={`text-xs font-semibold ${symptomatic ? "text-slate-500" : "text-violet-800"}`}>{symptomatic ? "Seulontariski oireettomille (ei koske oireita)" : "Pitkän aikavälin riski"}</p>
          <p className={symptomatic ? "text-slate-500" : ""}>{data.risk}</p>
          {symptomatic && <p className="mt-1 text-xs text-slate-500">PLCOm2012 ei ota oireita huomioon. Tämän henkilön kiireellisyys tulee oireista.</p>}
        </div>
      </div>

      {p.contributions.length > 0 && (
        <More label="Miksi riski on tämä?">
          <p className="text-xs">
            Kerroin vertaa tekijää mallin keskivertohenkilöön (62-vuotias, keskimääräinen tupakointihistoria). Yli 1 nostaa ja alle 1 laskee riskiä. Ne eivät vaikuta oireiden kiireellisyyteen.
          </p>
          <ul className="mt-1 space-y-0.5 text-xs">
            {/* Display order only: the factors that raise the risk most first, the lowering ones last. */}
            {[...p.contributions].sort((a, b) => b.factor - a.factor).map((c) => (
              <li key={c.key} className="flex justify-between gap-2">
                <span>{c.label}</span>
                <span className={`tabular-nums ${c.logit > 0 ? "text-rose-700" : "text-sky-700"}`}>×{c.factor.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {p.imputed.length > 0 && (
            <p className="mt-1 text-xs text-amber-800">Puuttuvat tiedot täydennetty mallin keskiarvolla: {p.imputed.map((k) => IMPUTED_LABEL[k]).join(", ")}.</p>
          )}
        </More>
      )}

      {questions}
      <p className="text-xs text-slate-400">
        PLCOm2012 (Tammemägi ym., NEJM 2013) arvioi tupakoineen kuuden vuoden keuhkosyöpäriskin. Se ei arvioi oireita: kiireellisyyden päättävät hälytysmerkkisäännöt, ja riski järjestää vain saman kiireellisyysryhmän potilaat.
      </p>
    </div>
  );
}
