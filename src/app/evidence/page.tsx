"use client";

import { useCallback, useEffect, useState } from "react";
import { DESIGN_LABEL, FACTOR_LABEL, TOPIC_LABEL, type Evidence, type FactorEvidence } from "@/lib/literature/evidence";

interface EvidenceState {
  evidence: Evidence[];
  factors: FactorEvidence[];
  lastRefresh: string | null;
  journals: { abbr: string; name: string }[];
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" }) : "ei vielä");

/** Papers about risk models, which could one day change which model the app should use. */
const RISK_MODEL_RE = /PLCO|risk (prediction )?model|risk score|risk calculator|eligibility|INTEGRAL|Sybil|CPH-Lung|LCRAT|LLP/i;

function ArticleCard({ e }: { e: Evidence }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <a href={e.url} target="_blank" rel="noreferrer" className="font-semibold text-sky-800 hover:underline">
          {e.title}
        </a>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${e.weight >= 0.5 ? "bg-emerald-100 text-emerald-800" : e.weight > 0 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"}`}
          title="Näytön vahvuus 0–1"
        >
          näyttö {e.weight.toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        {e.journal} · {e.month}/{e.year} · PMID {e.pmid}
        {e.dataset && <> · aineisto {e.dataset}</>}
      </p>
      <p className="mt-1">{e.finding}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded bg-slate-100 px-1.5">{TOPIC_LABEL[e.topic]}</span>
        <span className="rounded bg-slate-100 px-1.5">{DESIGN_LABEL[e.design]}</span>
        <span className="rounded bg-slate-100 px-1.5">{e.sampleSize ? `n = ${e.sampleSize.toLocaleString("fi-FI")}` : "otoskoko ei tiedossa"}</span>
        {e.factors.map((f) => (
          <span key={f.factor} className="rounded bg-rose-50 px-1.5 text-rose-800">
            {FACTOR_LABEL[f.factor]} {f.direction > 0 ? "↑" : f.direction < 0 ? "↓" : "–"}
            {f.effect && <> ({f.effect})</>}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Näyttö = asetelma {e.weightParts.design} × otoskoko {e.weightParts.size.toFixed(2)} × tuoreus {e.weightParts.recency} × aiheen merkitys {e.weightParts.relevance} · luokitteli{" "}
        {e.extractedBy === "llm" ? "Claude" : "avainsanasäännöt"}
      </p>
    </article>
  );
}

export default function EvidencePage() {
  const [data, setData] = useState<EvidenceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [onlyRelevant, setOnlyRelevant] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/evidence", { cache: "no-store" });
    setData(await res.json());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/evidence", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: EvidenceState) => {
        if (!cancelled) setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/evidence/refresh", { method: "POST" });
      const json = await res.json();
      setMessage(
        res.ok
          ? `Tarkistettiin ${json.checked} uusinta artikkelia. Uusia ${json.added}, jo käytettyjä ohitettiin ${json.duplicates}${json.remaining ? `, seuraavaan hakuun jäi ${json.remaining}` : ""}.`
          : json.error,
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  const byPmid = new Map(data?.evidence.map((e) => [e.pmid, e]) ?? []);
  const riskModels = data?.evidence.filter((e) => e.weight > 0 && RISK_MODEL_RE.test(e.title)) ?? [];
  const shown = data?.evidence.filter((e) => !onlyRelevant || e.weight > 0) ?? [];
  const withEvidence = data?.factors.filter((f) => f.pmids.length > 0) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Kirjallisuusseuranta · lääketieteellinen vastuuhenkilö</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Uusin keuhkosyöpätutkimus</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Järjestelmä hakee PubMedista uusimmat keuhkosyövän riskiä, oireita ja varhaista toteamista koskevat artikkelit seitsemästä lehdestä ja arvioi näytön vahvuuden tutkimusasetelman, otoskoon, tuoreuden ja aiheen mukaan. Jokainen artikkeli käytetään vain kerran, ja saman aineiston (esim. NLST) julkaisut lasketaan yhtenä.
        </p>
        <p className="mt-2 max-w-3xl rounded border border-sky-200 bg-sky-50 p-2 text-sm text-sky-900">
          Tieto ei muuta potilaiden riskiä. Riski lasketaan validoidulla PLCOm2012-mallilla (Tammemägi ym., NEJM 2013) julkaistuin kertoimin. Seuranta kertoo lääkärille, mitä uutta riskitekijöistä ja riskimalleista on julkaistu.
        </p>
        <p className="mt-1 text-xs text-slate-500">Lehdet: {data?.journals.map((j) => j.name).join(", ")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <button onClick={refresh} disabled={busy} className="rounded bg-sky-700 px-3 py-1.5 font-medium text-white hover:bg-sky-800 disabled:opacity-50">
          {busy ? "Haetaan PubMedista…" : "Hae uusimmat artikkelit"}
        </button>
        <span className="text-slate-600">Viimeksi haettu: {fmtDate(data?.lastRefresh ?? null)}</span>
        <span className="text-slate-600">· {data?.evidence.length ?? 0} artikkelia, joista {data?.evidence.filter((e) => e.weight > 0).length ?? 0} koskee riskiä tai varhaista toteamista</span>
        {message && <p className="w-full text-slate-700">{message}</p>}
      </div>

      {riskModels.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Riskimalleja koskevat tutkimukset</h2>
          <p className="text-xs text-slate-500">Nämä voivat olla syy arvioida, pitäisikö PLCOm2012 korvata tai täydentää uudemmalla mallilla.</p>
          {riskModels.map((e) => (
            <ArticleCard key={e.pmid} e={e} />
          ))}
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Mitä uusi tutkimus sanoo kyselyn riskitekijöistä</h2>
        <p className="text-xs text-slate-500">Tietona lääkärille. Saman aineiston julkaisut lasketaan kerran.</p>
        {withEvidence.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Haetuissa artikkeleissa ei ole uutta näyttöä kyselyn riskitekijöistä.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {withEvidence.map((f) => (
              <li key={f.factor}>
                <span className="font-medium">{FACTOR_LABEL[f.factor]}:</span>{" "}
                <span className="text-slate-600">
                  {f.pmids.length} {f.pmids.length === 1 ? "tutkimus" : "tutkimusta"} (
                  {f.pmids
                    .map((id) => byPmid.get(id))
                    .filter(Boolean)
                    .map((e) => `${e!.journal} ${e!.year}`)
                    .join(", ")}
                  )
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kaikki artikkelit näytön vahvuuden mukaan</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyRelevant} onChange={(e) => setOnlyRelevant(e.target.checked)} />
            Vain riskiä ja varhaista toteamista koskevat
          </label>
        </div>
        {shown.map((e) => (
          <ArticleCard key={e.pmid} e={e} />
        ))}
      </section>
    </div>
  );
}
