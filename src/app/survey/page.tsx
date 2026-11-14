"use client";

import { useState } from "react";
import { AnalysisCard } from "@/components/AnalysisCard";
import { notifyChange } from "@/components/LiveData";
import { PLACEMENT_LABEL, RULES_CONFIG } from "@/lib/rules";
import type { Channel, RuleResult } from "@/lib/types";

const RESPONDENT_MESSAGE: Record<RuleResult["placement"], string> = {
  direct_ct: "Kiitos! Lääkäri arvioi, tarvitaanko TT-tutkimusta. Sovellus ei tee lähetettä automaattisesti.",
  physician_fast: "Kiitos! Vastauksesi perusteella sinulle varataan lääkäriaika lähipäivinä. Saat tekstiviestin.",
  normal_route: "Kiitos! Vastauksesi perusteella kiireellistä tarvetta ei nyt ole. Jos oireita tulee, ota yhteyttä terveysasemalle.",
  not_eligible: "Kiitos vastauksestasi! Kysely on tarkoitettu tupakoineille 55–80-vuotiaille.",
};

// Safety net: the survey is not read in real time, so acute symptoms must get an
// instruction on screen at once. Wording to be checked by Delun before real use.
const BLOOD_EMERGENCY_TEXT =
  "Jos yskit verta runsaasti tai jatkuvasti, tai sinulla on samalla vaikea hengenahdistus tai rintakipu, soita heti 112.";

const SYMPTOMS: { key: string; label: string }[] = [
  { key: "blood_in_sputum", label: "Verta yskösissä" },
  { key: "breathlessness", label: "Hengenahdistusta, joka on uutta tai pahentunut" },
  { key: "chest_pain", label: "Rintakipua" },
  { key: "weight_loss", label: "Laihtumista ilman yritystä" },
];

/** Which survey risk-group criteria (Delun's RULES_CONFIG) the answer misses. Display only. */
function riskGroupGaps(age: number, smoking: "current" | "former" | "never", packYears: number): string[] {
  const c = RULES_CONFIG;
  const gaps: string[] = [];
  if (age < c.minAge || age > c.maxAge) gaps.push(`ikä ${age} v (raja ${c.minAge}–${c.maxAge})`);
  if (smoking === "never") gaps.push("ei ole tupakoinut");
  else if (packYears < c.minPackYears) gaps.push(`${packYears} askivuotta (raja ${c.minPackYears})`);
  return gaps;
}

const NURSE_MESSAGE: Record<RuleResult["placement"], string> = {
  direct_ct: "Hälytysmerkki täyttyy. Potilas nousee lääkärin listalle, joka arvioi TT-lähetteen tarpeen.",
  physician_fast: "Hälytysmerkki täyttyy. Varaa lääkäriaika pikakaistalta muutaman päivän sisään.",
  normal_route: "Hälytysmerkit eivät täyty. Tavallinen hoitopolku.",
  not_eligible: "Kyselyn riskiraja ei täyty. Arvioi mahdolliset oireet erikseen.",
};

export default function SurveyPage() {
  const [channel, setChannel] = useState<Channel>("survey");
  const [age, setAge] = useState(66);
  const [smoking, setSmoking] = useState<"current" | "former" | "never">("former");
  const [perDay, setPerDay] = useState("");
  const [years, setYears] = useState("");
  const [yearsSinceQuit, setYearsSinceQuit] = useState("");
  const [plcoRace, setPlcoRace] = useState("");
  const [plcoEducation, setPlcoEducation] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [copd, setCopd] = useState("");
  const [personalCancer, setPersonalCancer] = useState("");
  const [familyHistoryLungCancer, setFamilyHistoryLungCancer] = useState("");
  const [coughWeeks, setCoughWeeks] = useState(0);
  const [pneumonias, setPneumonias] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [visitReason, setVisitReason] = useState("");
  const [visitMonths, setVisitMonths] = useState(2);
  const [freeText, setFreeText] = useState("");
  const [result, setResult] = useState<RuleResult | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bmi = Number(heightCm) > 0 && Number(weightKg) > 0 ? Number(weightKg) / (Number(heightCm) / 100) ** 2 : null;

  const smokingHistoryValid = perDay !== "" && years !== "" && Number(perDay) > 0 && Number(years) > 0;
  const packYears = smoking === "never" || !smokingHistoryValid ? 0 : Math.round((Number(perDay) / 20) * Number(years));

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
          // PLCOm2012 inputs. Empty answers are left out and the model imputes them.
          plco: {
            race: plcoRace || undefined,
            education: plcoEducation === "" ? undefined : Number(plcoEducation),
            bmi: bmi ?? undefined,
            copd,
            personal_cancer_history: personalCancer,
            family_history_lung_cancer: familyHistoryLungCancer,
            cigs_per_day: perDay === "" ? undefined : Number(perDay),
            smoking_years: years === "" ? undefined : Number(years),
            years_since_quit: smoking === "current" ? 0 : yearsSinceQuit === "" ? undefined : Number(yearsSinceQuit),
          },
          symptoms: { ...checks, cough_weeks: coughWeeks, pneumonias_last_year: pneumonias },
          previous_visit_reason: visitReason,
          previous_visit_months_ago: visitMonths,
          free_text: freeText,
        }),
      });
      const data = await res.json();
      setResult(data.rule);
      setResponseId(data.response.id);
      // Tell the other open views in this browser right away (others refresh on the next poll).
      notifyChange();
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
            <p className="text-lg font-semibold">
              {result.symptomReviewRequired
                ? "Ilmoitit oireita. Terveydenhuollon ammattilaisen tulee arvioida ne riippumatta seulontariskistä. Tämä demo ei tee diagnoosia eikä lähetä automaattisesti TT-kuvaukseen."
                : channel === "survey" ? RESPONDENT_MESSAGE[result.placement] : NURSE_MESSAGE[result.placement]}
            </p>
            {result.redFlag && (
              <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-left text-sm font-medium text-red-900">
                {channel === "survey" ? BLOOD_EMERGENCY_TEXT : "Runsas verenyskä tai vaikea hengenahdistus: ohjaa potilas päivystykseen tai soita 112."}
              </p>
            )}
            {result.screeningRisk6y !== null && (
              <div className="rounded border border-sky-200 bg-sky-50 p-3 text-left text-sm">
                <p className="font-semibold">PLCOm2012-mallin kuuden vuoden arvio: {(result.screeningRisk6y * 100).toFixed(2)} %</p>
                <p className="mt-1 text-xs text-slate-600">
                  Yhdysvaltalaisella aineistolla kehitetty tutkimusmalli; sitä ei ole kalibroitu Suomen väestöön eikä tulos yksin ratkaise seulontaa tai hoitoa.
                  {result.screeningRiskInOriginalAgeRange === false && " Ikä on alkuperäisen tutkimusjoukon 55–74 vuoden ulkopuolella."}
                </p>
              </div>
            )}
            {smoking !== "never" && result.screeningRisk6y !== null && (
              <p className="rounded border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900">
                Puuttuvat PLCOm2012-tiedot täydennettiin mallin keskiarvoilla, ja väestöluokan puuttuessa käytettiin mallin vertailuluokkaa. Lääkärinäkymä näyttää, mitkä tiedot täydennettiin.
              </p>
            )}
            <div className="rounded bg-slate-100 p-3 text-left text-xs text-slate-600">
              <p className="font-semibold">Demo: sääntöjen tulos (ei näy vastaajalle)</p>
              <p>
                Ehdotus:{" "}
                {result.symptomReviewRequired && result.placement === "not_eligible"
                  ? "Oireet ammattilaisen arvioon (seulontakyselyn riskiraja ei täyty)"
                  : PLACEMENT_LABEL[result.placement]}
              </p>
              {!result.eligible && <p>Riskiraja: {riskGroupGaps(age, smoking, packYears).join(", ")}</p>}
              <p>Hälytysmerkit: {result.reasons.map((r) => r.label).join(", ") || "ei"}</p>
            </div>
            {responseId && (result.symptomReviewRequired || result.placement !== "not_eligible") && (
              <div className="text-left">
                <p className="mb-1 text-sm font-semibold">Vielä muutama tarkentava kysymys</p>
                <AnalysisCard id={responseId} compact respondent={channel === "survey"} />
              </div>
            )}
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
                <p className="text-slate-600">Esimerkkikysely. Seulontaan valinnan ja oireiden arvioinnin säännöt ovat erilliset.</p>
                <p className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                  Tämä kysely ei ole kiireellinen palvelu. Jos sinulla on äkillisiä tai vakavia oireita, soita 112 tai Päivystysapuun 116117.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold">Keuhko-oireiden tarkistuslista</h1>
                <p className="text-slate-600">Hoitaja kirjaa oireet. Oirearvio ei riipu iästä eikä tupakointihistoriasta.</p>
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
                  <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={perDay} min={1} max={100} required onChange={(e) => setPerDay(e.target.value)} />
                </label>
                <label>
                  Vuotta yhteensä
                  <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={years} min={1} max={80} required onChange={(e) => setYears(e.target.value)} />
                </label>
                <p className="col-span-2 text-xs text-slate-500">= {packYears} askivuotta</p>
                {smoking === "former" && (
                  <label className="col-span-2">
                    Kuinka monta vuotta sitten lopetit tupakoinnin?
                    <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={yearsSinceQuit} min={0} max={80} required onChange={(e) => setYearsSinceQuit(e.target.value)} />
                  </label>
                )}
              </div>
            )}

            {smoking !== "never" && (
              <details className="rounded border border-slate-200 p-3">
                <summary className="cursor-pointer font-medium">PLCOm2012-seulontariskin lisätiedot</summary>
                <p className="my-2 text-xs text-amber-800">
                  Tämä on yhdysvaltalainen malli, jota ei ole validoitu Suomen väestölle. Demo näyttää mallin laskeman arvion vain tutkimusesimerkkinä; se ei muuta oireohjausta.
                </p>
                <div className="space-y-3 text-xs">
                  <label className="block">
                    Alkuperäisen mallin väestöluokka (vapaaehtoinen)
                    <select className="mt-1 w-full rounded border px-2 py-1.5" value={plcoRace} onChange={(e) => setPlcoRace(e.target.value)}>
                      <option value="">Ei vastausta (vertailuluokka)</option>
                      <option value="white">White</option>
                      <option value="black">Black</option>
                      <option value="hispanic">Hispanic</option>
                      <option value="asian">Asian</option>
                      <option value="pacific_islander">Native Hawaiian / Pacific Islander</option>
                      <option value="native_american">American Indian / Alaska Native</option>
                    </select>
                  </label>
                  <label className="block">
                    Koulutus (mallin 6 luokkaa)
                    <select className="mt-1 w-full rounded border px-2 py-1.5" value={plcoEducation} onChange={(e) => setPlcoEducation(e.target.value)}>
                      <option value="">Valitse</option>
                      <option value="1">1 · Ei toisen asteen tutkintoa</option>
                      <option value="2">2 · Toisen asteen tutkinto</option>
                      <option value="3">3 · Toisen asteen jälkeistä koulutusta</option>
                      <option value="4">4 · Jonkin verran korkeakouluopintoja</option>
                      <option value="5">5 · Korkeakoulututkinto</option>
                      <option value="6">6 · Jatko- tai ammatillinen tutkinto</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      Paino (kg)
                      <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={weightKg} min={1} max={350} step="any" onChange={(e) => setWeightKg(e.target.value)} />
                    </label>
                    <label>
                      Pituus (cm)
                      <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={heightCm} min={50} max={250} step="any" onChange={(e) => setHeightCm(e.target.value)} />
                    </label>
                  </div>
                  {([
                    ["copd", "Keuhkoahtaumatauti (COPD)", copd, setCopd],
                    ["personalCancer", "Aiempi syöpä", personalCancer, setPersonalCancer],
                    ["familyHistoryLungCancer", "Keuhkosyöpä lähisuvussa", familyHistoryLungCancer, setFamilyHistoryLungCancer],
                  ] as const).map(([key, label, value, setValue]) => (
                    <label key={key} className="block">
                      {label}
                      <select className="mt-1 w-full rounded border px-2 py-1.5" value={value} onChange={(e) => setValue(e.target.value)}>
                        <option value="">Valitse</option>
                        <option value="no">Ei</option>
                        <option value="yes">Kyllä</option>
                      </select>
                    </label>
                  ))}
                  <p className="text-slate-500">Tupakoinnin määrä, kesto ja lopettamisesta kulunut aika täytetään yllä. Puuttuvat tiedot täydennetään mallin keskiarvoilla.</p>
                </div>
              </details>
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
              {checks.blood_in_sputum && (
                <p role="alert" className="mt-1 rounded border border-red-300 bg-red-50 p-2 text-xs font-medium text-red-900">
                  {BLOOD_EMERGENCY_TEXT}
                </p>
              )}
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
