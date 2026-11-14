"use client";

import { useState } from "react";
import { PLACEMENT_LABEL } from "@/lib/rules";
import type { Channel, RuleResult } from "@/lib/types";

const RESPONDENT_MESSAGE: Record<RuleResult["placement"], string> = {
  direct_ct: "Kiitos! Vastauksesi perusteella lääkäri tarkistaa tilanteesi ja sinulle varataan aika lähipäivinä. Saat tekstiviestin.",
  physician_fast: "Kiitos! Vastauksesi perusteella sinulle varataan lääkäriaika lähipäivinä. Saat tekstiviestin.",
  normal_route: "Kiitos! Vastauksesi perusteella kiireellistä tarvetta ei nyt ole. Jos oireita tulee, ota yhteyttä terveysasemalle.",
  not_eligible: "Kiitos vastauksestasi! Kysely on tarkoitettu tupakoineille 55–80-vuotiaille.",
};

const SYMPTOMS: { key: string; label: string }[] = [
  { key: "blood_in_sputum", label: "Verta yskösissä" },
  { key: "breathlessness", label: "Hengenahdistusta, joka on uutta tai pahentunut" },
  { key: "chest_pain", label: "Rintakipua" },
  { key: "weight_loss", label: "Laihtumista ilman yritystä" },
];

const NURSE_MESSAGE: Record<RuleResult["placement"], string> = {
  direct_ct: "Hälytysmerkki täyttyy. Potilas nousee lääkärin pikakaistalistalle, ja lääkäri päättää suorasta TT-lähetteestä.",
  physician_fast: "Hälytysmerkki täyttyy. Varaa lääkäriaika pikakaistalta muutaman päivän sisään.",
  normal_route: "Hälytysmerkit eivät täyty. Tavallinen hoitopolku.",
  not_eligible: "Potilas ei kuulu keuhkosyövän riskiryhmään. Tavallinen hoitopolku.",
};

export default function SurveyPage() {
  const [channel, setChannel] = useState<Channel>("survey");
  const [age, setAge] = useState(66);
  const [smoking, setSmoking] = useState<"current" | "former" | "never">("former");
  const [perDay, setPerDay] = useState(20);
  const [years, setYears] = useState(30);
  const [coughWeeks, setCoughWeeks] = useState(0);
  const [pneumonias, setPneumonias] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [visitReason, setVisitReason] = useState("");
  const [visitMonths, setVisitMonths] = useState(2);
  const [freeText, setFreeText] = useState("");
  const [result, setResult] = useState<RuleResult | null>(null);
  const [sending, setSending] = useState(false);

  const packYears = smoking === "never" ? 0 : Math.round((perDay / 20) * years);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          channel,
          language: "fi",
          smoking_status: smoking,
          pack_years: packYears,
          symptoms: { ...checks, cough_weeks: coughWeeks, pneumonias_last_year: pneumonias },
          previous_visit_reason: visitReason,
          previous_visit_months_ago: visitMonths,
          free_text: freeText,
        }),
      });
      const data = await res.json();
      setResult(data.rule);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-2 flex rounded-full border border-slate-300 bg-white p-0.5 text-xs">
        {([["survey", "Kysely riskiryhmälle"], ["health_centre", "Terveyskeskus: hoitajan lista"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setChannel(v);
              setResult(null);
            }}
            className={`flex-1 rounded-full px-2 py-1 ${channel === v ? "bg-sky-700 font-semibold text-white" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">
        {channel === "survey" ? "Esimerkki tekstiviestilinkin takaa avautuvasta kyselystä" : "Kaksi ovea: samat kysymykset hoitajan tarkistuslistana, kun potilas ottaa yhteyttä terveyskeskukseen"}
      </p>
      <div className="mt-2 rounded-3xl border-8 border-slate-800 bg-white p-5 shadow-lg">
        {result ? (
          <div className="space-y-4 py-6 text-center">
            <p className="text-lg font-semibold">{channel === "survey" ? RESPONDENT_MESSAGE[result.placement] : NURSE_MESSAGE[result.placement]}</p>
            <div className="rounded bg-slate-100 p-3 text-left text-xs text-slate-600">
              <p className="font-semibold">Demo: sääntöjen tulos (ei näy vastaajalle)</p>
              <p>Ehdotus: {PLACEMENT_LABEL[result.placement]}</p>
              <p>Hälytysmerkit: {result.reasons.map((r) => r.label).join(", ") || "ei"}</p>
            </div>
            <div className="flex justify-center gap-3 text-sm">
              <a href="/clinician" className="rounded bg-sky-700 px-3 py-1.5 font-medium text-white">Lääkärin lista →</a>
              <button onClick={() => setResult(null)} className="underline">Uusi vastaus</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 text-sm">
            {channel === "survey" ? (
              <div>
                <h1 className="text-lg font-bold">Keuhkojen terveyskysely</h1>
                <p className="text-slate-600">Hyvinvointialueesi kysyy tämän kaikilta 55–80-vuotiailta. Vastaaminen vie kaksi minuuttia.</p>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold">Keuhko-oireiden tarkistuslista</h1>
                <p className="text-slate-600">Hoitaja täyttää, kun yli 55-vuotias tupakoinut potilas ottaa yhteyttä yskän, hengenahdistuksen tai muiden keuhko-oireiden takia.</p>
              </div>
            )}

            <label className="block">
              Ikä
              <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={age} min={18} max={110} onChange={(e) => setAge(Number(e.target.value))} />
            </label>

            <fieldset>
              <legend>Tupakoitko tai oletko tupakoinut?</legend>
              <div className="mt-1 flex gap-2">
                {([["current", "Tupakoin"], ["former", "Olen lopettanut"], ["never", "En koskaan"]] as const).map(([v, l]) => (
                  <button type="button" key={v} onClick={() => setSmoking(v)} className={`flex-1 rounded border px-2 py-1.5 ${smoking === v ? "border-sky-700 bg-sky-50 font-semibold" : ""}`}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>

            {smoking !== "never" && (
              <div className="grid grid-cols-2 gap-2">
                <label>
                  Savukkeita päivässä
                  <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={perDay} min={0} onChange={(e) => setPerDay(Number(e.target.value))} />
                </label>
                <label>
                  Vuotta yhteensä
                  <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={years} min={0} onChange={(e) => setYears(Number(e.target.value))} />
                </label>
                <p className="col-span-2 text-xs text-slate-500">= {packYears} askivuotta</p>
              </div>
            )}

            <label className="block">
              Kuinka monta viikkoa sinulla on ollut yskää? (0 = ei yskää)
              <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={coughWeeks} min={0} onChange={(e) => setCoughWeeks(Number(e.target.value))} />
            </label>

            <fieldset className="space-y-1">
              <legend>Onko sinulla ollut viimeisen kuukauden aikana:</legend>
              {SYMPTOMS.map((s) => (
                <label key={s.key} className="flex items-center gap-2">
                  <input type="checkbox" checked={Boolean(checks[s.key])} onChange={(e) => setChecks((c) => ({ ...c, [s.key]: e.target.checked }))} />
                  {s.label}
                </label>
              ))}
            </fieldset>

            <label className="block">
              Keuhkokuumeita viimeisen vuoden aikana
              <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={pneumonias} min={0} onChange={(e) => setPneumonias(Number(e.target.value))} />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="col-span-2">
                Olitko lääkärissä hengitysoireiden takia?
                <select className="mt-1 w-full rounded border px-2 py-1" value={visitReason} onChange={(e) => setVisitReason(e.target.value)}>
                  <option value="">En</option>
                  <option value="yskä">Kyllä, yskä</option>
                  <option value="flunssa">Kyllä, flunssa</option>
                  <option value="keuhkokuume">Kyllä, keuhkokuume</option>
                  <option value="astma">Kyllä, astma</option>
                </select>
              </label>
              {visitReason && (
                <label>
                  kk sitten
                  <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={visitMonths} min={0} onChange={(e) => setVisitMonths(Number(e.target.value))} />
                </label>
              )}
            </div>

            <label className="block">
              Kerro halutessasi omin sanoin, millä tahansa kielellä
              <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={freeText} onChange={(e) => setFreeText(e.target.value)} />
            </label>

            <button disabled={sending} className="w-full rounded-full bg-sky-700 py-2 font-semibold text-white disabled:opacity-50">
              {sending ? "Lähetetään…" : "Lähetä"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
