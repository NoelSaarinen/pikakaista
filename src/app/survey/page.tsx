"use client";

import { useState } from "react";
import { AnalysisCard } from "@/components/AnalysisCard";
import { notifyChange } from "@/components/LiveData";
import { More } from "@/components/More";
import { ChoiceButtons, NumberStepper, ToggleCard } from "@/components/survey/Controls";
import countiesData from "@/data/counties.json";
import { regionLanguages } from "@/lib/i18n/region-languages";
import { SURVEY_LANGS, surveyText, type SurveyLang, type SymptomKey, type VisitValue } from "@/lib/i18n/survey-text";
import { PLACEMENT_LABEL, RULES_CONFIG } from "@/lib/rules";
import type { Channel, RuleResult } from "@/lib/types";

// Survey for the risk group, built for older respondents: one topic per step, large
// controls, no drop-down menus or number spinners, and the 112 safety text on screen.
// Stored values are unchanged, so Delun's rules work as before.

const COUNTIES = (countiesData as { id: string; name: string }[]).map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name, "fi"));
const ALL_LANGS = SURVEY_LANGS.map((l) => l.code);
const pctFi = (share: number) => `${(share * 100).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} %`;
const SYMPTOM_KEYS: SymptomKey[] = ["blood_in_sputum", "breathlessness", "chest_pain", "weight_loss"];
const VISIT_VALUES: VisitValue[] = ["", "yskä", "flunssa", "keuhkokuume", "astma"];
type Smoking = "current" | "former" | "never";
type YesNo = "" | "yes" | "no";
type Num = number | "";

/** Which survey risk-group criteria (Delun's RULES_CONFIG) the answer misses. Display only. */
function riskGroupGaps(age: number, smoking: Smoking, packYears: number): string[] {
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

const RACES = [
  ["white", "White"],
  ["black", "Black"],
  ["hispanic", "Hispanic"],
  ["asian", "Asian"],
  ["pacific_islander", "Native Hawaiian / Pacific Islander"],
  ["native_american", "American Indian / Alaska Native"],
] as const;

export default function SurveyPage() {
  const [channel, setChannel] = useState<Channel>("survey");
  const [lang, setLang] = useState<SurveyLang>("fi");
  const [countyId, setCountyId] = useState("lappi");
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<Num>(66);
  const [smoking, setSmoking] = useState<Smoking | "">("");
  const [perDay, setPerDay] = useState<Num>("");
  const [years, setYears] = useState<Num>("");
  const [yearsSinceQuit, setYearsSinceQuit] = useState<Num>("");
  const [plcoRace, setPlcoRace] = useState("");
  const [plcoEducation, setPlcoEducation] = useState("");
  const [weightKg, setWeightKg] = useState<Num>("");
  const [heightCm, setHeightCm] = useState<Num>("");
  const [copd, setCopd] = useState<YesNo>("");
  const [personalCancer, setPersonalCancer] = useState<YesNo>("");
  const [familyHistoryLungCancer, setFamilyHistoryLungCancer] = useState<YesNo>("");
  const [coughWeeks, setCoughWeeks] = useState<Num>(0);
  const [pneumonias, setPneumonias] = useState<Num>(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [visitReason, setVisitReason] = useState<VisitValue>("");
  const [visitMonths, setVisitMonths] = useState<Num>(2);
  const [freeText, setFreeText] = useState("");
  const [result, setResult] = useState<RuleResult | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Languages are offered per region from Statistics Finland data (StatFin 11rl):
  // Finnish and Swedish always, then the region's translated languages by local size.
  const regionLangs = regionLanguages(countyId, ALL_LANGS);
  const langButtons = [
    ...regionLangs.primary.map((p) => SURVEY_LANGS.find((l) => l.code === p.code)!),
    ...(showAllLangs || regionLangs.primary.every((p) => p.code !== lang) ? SURVEY_LANGS.filter((l) => regionLangs.more.includes(l.code) && (showAllLangs || l.code === lang)) : []),
  ];

  // The nurse's checklist is for Finnish staff; the respondent survey follows the chosen language.
  const uiLang: SurveyLang = channel === "survey" ? lang : "fi";
  const t = surveyText(uiLang);
  const langInfo = SURVEY_LANGS.find((l) => l.code === uiLang)!;
  const smoker = smoking === "current" || smoking === "former";
  const ageN = age === "" ? 0 : age;
  const bmi = heightCm !== "" && weightKg !== "" && heightCm > 0 && weightKg > 0 ? weightKg / (heightCm / 100) ** 2 : null;
  const packYears = smoker && perDay !== "" && years !== "" ? Math.round((perDay / 20) * years) : 0;

  // Steps: about you, smoking (only for smokers), symptoms, finally.
  const steps = [0, ...(smoking !== "never" ? [1] : []), 2, 3];
  const pos = Math.max(0, steps.indexOf(step));
  const isLast = pos === steps.length - 1;
  const stepValid =
    step === 0 ? age !== "" && smoking !== "" : step === 1 ? perDay !== "" && years !== "" && (smoking !== "former" || yearsSinceQuit !== "") : true;
  const yesNoOptions = [
    { value: "yes" as const, label: t.yes },
    { value: "no" as const, label: t.no },
  ];
  const stepper = { decreaseLabel: t.decrease, increaseLabel: t.increase };

  /** Starts a fresh answer: the next respondent must not see the previous person's answers. */
  function reset() {
    setResult(null);
    setResponseId(null);
    setStep(0);
    setAge(66);
    setSmoking("");
    setPerDay("");
    setYears("");
    setYearsSinceQuit("");
    setPlcoRace("");
    setPlcoEducation("");
    setWeightKg("");
    setHeightCm("");
    setCopd("");
    setPersonalCancer("");
    setFamilyHistoryLungCancer("");
    setCoughWeeks(0);
    setPneumonias(0);
    setChecks({});
    setVisitReason("");
    setVisitMonths(2);
    setFreeText("");
  }

  async function submit() {
    setSending(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: ageN,
          channel,
          language: uiLang,
          smoking_status: smoking || "never",
          pack_years: packYears,
          // PLCOm2012 inputs. Empty answers are left out and the model imputes them.
          plco: {
            race: plcoRace || undefined,
            education: plcoEducation === "" ? undefined : Number(plcoEducation),
            bmi: bmi ?? undefined,
            copd,
            personal_cancer_history: personalCancer,
            family_history_lung_cancer: familyHistoryLungCancer,
            cigs_per_day: perDay === "" ? undefined : perDay,
            smoking_years: years === "" ? undefined : years,
            years_since_quit: smoking === "current" ? 0 : yearsSinceQuit === "" ? undefined : yearsSinceQuit,
          },
          symptoms: { ...checks, cough_weeks: coughWeeks === "" ? 0 : coughWeeks, pneumonias_last_year: pneumonias === "" ? 0 : pneumonias },
          previous_visit_reason: visitReason,
          previous_visit_months_ago: visitMonths === "" ? 0 : visitMonths,
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
    <div className="mx-auto max-w-md">
      <div className="mb-2 flex rounded-full border border-slate-300 bg-white p-0.5 text-xs">
        {([["survey", "Kysely riskiryhmälle"], ["health_centre", "Terveyskeskus: hoitajan lista"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setChannel(v);
              reset();
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
      {channel === "survey" && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600">
          <label className="flex items-center justify-between gap-2">
            <span className="font-medium">Demo: vastaajan hyvinvointialue</span>
            <select
              value={countyId}
              onChange={(e) => {
                setCountyId(e.target.value);
                setShowAllLangs(false);
              }}
              className="rounded border border-slate-300 bg-white px-1.5 py-1"
            >
              {COUNTIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-1">
            Kielet alueen 50–74-vuotiaiden äidinkielten mukaan{regionLangs.sharedRegion ? ` (${regionLangs.regionName}, koko maakunta)` : ""}. Käännetyt kielet kattavat {pctFi(regionLangs.coverage)}.
            {regionLangs.interpreter.length > 0 &&
              ` Ilman käännöstä: ${regionLangs.interpreter.map((l) => `${l.name} ${l.count.toLocaleString("fi-FI")}`).join(", ")}. Heille hoitajan soitto tulkin kanssa.`}
          </p>
        </div>
      )}

      <div dir={langInfo.dir} lang={uiLang} className="mt-2 rounded-[2rem] border-[10px] border-slate-800 bg-white px-5 pb-6 pt-5 text-lg leading-relaxed text-slate-900 shadow-xl">
        {result ? (
          <div className="space-y-5 py-4 text-center">
            <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
              ✓
            </div>
            <p className="text-xl font-semibold">
              {result.symptomReviewRequired ? t.symptomReview : channel === "survey" ? t.placement[result.placement] : NURSE_MESSAGE[result.placement]}
            </p>
            {result.redFlag && (
              <p role="alert" className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-start text-base font-semibold text-red-900">
                {channel === "survey" ? t.bloodEmergency : "Runsas verenyskä tai vaikea hengenahdistus: ohjaa potilas päivystykseen tai soita 112."}
              </p>
            )}
            {result.screeningRisk6y !== null && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-start text-base">
                <p className="font-semibold">{t.riskTitle((result.screeningRisk6y * 100).toFixed(2))}</p>
                <More className="mt-1" label={t.riskMore}>
                  <p className="text-sm">
                    {t.riskNote}
                    {result.screeningRiskInOriginalAgeRange === false && t.riskAge}
                    {smoker && ` ${t.imputedNote}`}
                  </p>
                </More>
              </div>
            )}
            {responseId && (result.symptomReviewRequired || result.placement !== "not_eligible") && (
              <div className="text-start">
                <p className="mb-2 text-lg font-semibold">{t.followUpTitle}</p>
                <div className="[&_button]:min-h-11 [&_button]:px-3 [&_button]:text-base [&_input]:h-11 [&_input]:text-base [&_span.text-xs]:text-base">
                  <AnalysisCard id={responseId} compact respondent={channel === "survey"} texts={channel === "survey" ? t : undefined} />
                </div>
              </div>
            )}
            <button type="button" onClick={reset} className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg font-medium hover:bg-slate-50">
              {t.newAnswer}
            </button>
            <div dir="ltr" lang="fi" className="rounded-lg bg-slate-100 p-3 text-left text-xs leading-normal text-slate-600">
              <p className="font-semibold">Demo: sääntöjen tulos (ei näy vastaajalle)</p>
              <p>
                Ehdotus:{" "}
                {result.symptomReviewRequired && result.placement === "not_eligible"
                  ? "Oireet ammattilaisen arvioon (seulontakyselyn riskiraja ei täyty)"
                  : PLACEMENT_LABEL[result.placement]}
              </p>
              {!result.eligible && <p>Riskiraja: {riskGroupGaps(ageN, smoking || "never", packYears).join(", ")}</p>}
              <p>Hälytysmerkit: {result.reasons.map((r) => r.label).join(", ") || "ei"}</p>
              <p>Vastauksen kieli: {langInfo.name}</p>
              <a href="/clinician" className="mt-1 inline-block font-semibold text-sky-700 underline">
                Lääkärin lista →
              </a>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!stepValid) return;
              if (isLast) submit();
              else setStep(steps[pos + 1]);
            }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{t.stepOf(pos + 1, steps.length)}</span>
                <span className="font-medium text-slate-700">{t.steps[step]}</span>
              </div>
              <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {steps.map((s, i) => (
                  <span key={s} className={`h-2 flex-1 rounded-full ${i <= pos ? "bg-sky-700" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>

            {step === 0 && (
              <>
                {channel === "survey" ? (
                  <>
                    <fieldset>
                      <legend className="text-sm font-medium text-slate-500">{t.chooseLanguage}</legend>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {langButtons.map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            lang={l.code}
                            dir={l.dir}
                            aria-pressed={lang === l.code}
                            onClick={() => setLang(l.code)}
                            className={`min-h-12 rounded-xl border-2 px-3 text-base ${lang === l.code ? "border-sky-700 bg-sky-50 font-semibold text-sky-900" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                      {!showAllLangs && regionLangs.more.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAllLangs(true)}
                          className="mt-2 min-h-11 w-full rounded-xl border-2 border-dashed border-slate-300 px-3 text-base text-slate-600 hover:bg-slate-50"
                        >
                          {t.moreLanguages} ({regionLangs.more.length})
                        </button>
                      )}
                      {t.draftNote && <p className="mt-1 text-xs text-slate-400">{t.draftNote}</p>}
                    </fieldset>
                    <div>
                      <h1 className="text-2xl font-bold leading-tight">{t.title}</h1>
                      <p className="mt-1 text-slate-600">{t.intro}</p>
                    </div>
                    <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-base text-amber-900">{t.emergency}</p>
                  </>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold">Keuhko-oireiden tarkistuslista</h1>
                    <p className="text-slate-600">Hoitaja kirjaa oireet. Oirearvio ei riipu iästä eikä tupakointihistoriasta.</p>
                  </div>
                )}
                <NumberStepper label={t.age} value={age} onChange={setAge} min={18} max={110} required {...stepper} />
                <ChoiceButtons
                  label={t.smokingQuestion}
                  value={smoking}
                  onChange={setSmoking}
                  options={[
                    { value: "current", label: t.smokingCurrent },
                    { value: "former", label: t.smokingFormer },
                    { value: "never", label: t.smokingNever },
                  ]}
                />
              </>
            )}

            {step === 1 && (
              <>
                <NumberStepper label={t.cigsPerDay} value={perDay} onChange={setPerDay} min={1} max={100} required {...stepper} />
                <NumberStepper label={t.yearsSmoked} value={years} onChange={setYears} min={1} max={80} required {...stepper} />
                {smoking === "former" && <NumberStepper label={t.yearsSinceQuit} value={yearsSinceQuit} onChange={setYearsSinceQuit} min={0} max={80} required {...stepper} />}
                {packYears > 0 && <p className="rounded-xl bg-slate-50 px-4 py-2 text-base text-slate-600">{t.packYears(packYears)}</p>}
                <details className="rounded-xl border border-slate-200 p-4">
                  <summary className="cursor-pointer text-base font-medium">{t.plcoTitle}</summary>
                  <p className="my-3 text-sm text-amber-800">{t.plcoNote}</p>
                  <div className="space-y-5">
                    <ChoiceButtons
                      label={t.educationLabel}
                      value={plcoEducation}
                      onChange={setPlcoEducation}
                      options={t.education.map((label, i) => ({ value: String(i + 1), label }))}
                    />
                    <NumberStepper label={t.weight} value={weightKg} onChange={setWeightKg} min={30} max={250} {...stepper} />
                    <NumberStepper label={t.height} value={heightCm} onChange={setHeightCm} min={120} max={220} {...stepper} />
                    <ChoiceButtons label={t.copd} value={copd} onChange={setCopd} options={yesNoOptions} columns={2} />
                    <ChoiceButtons label={t.personalCancer} value={personalCancer} onChange={setPersonalCancer} options={yesNoOptions} columns={2} />
                    <ChoiceButtons label={t.familyLungCancer} value={familyHistoryLungCancer} onChange={setFamilyHistoryLungCancer} options={yesNoOptions} columns={2} />
                    <ChoiceButtons
                      label={t.raceLabel}
                      value={plcoRace}
                      onChange={setPlcoRace}
                      options={[{ value: "", label: t.raceNone }, ...RACES.map(([value, label]) => ({ value, label }))]}
                    />
                    <p className="text-sm text-slate-500">{t.plcoFooter}</p>
                  </div>
                </details>
              </>
            )}

            {step === 2 && (
              <>
                <NumberStepper label={t.coughWeeks} value={coughWeeks} onChange={setCoughWeeks} min={0} max={104} {...stepper} />
                <fieldset className="space-y-2">
                  <legend className="text-lg font-medium leading-snug">{t.symptomsLegend}</legend>
                  {SYMPTOM_KEYS.map((key) => (
                    <ToggleCard key={key} label={t.symptoms[key]} checked={Boolean(checks[key])} onChange={(v) => setChecks((c) => ({ ...c, [key]: v }))} />
                  ))}
                </fieldset>
                {checks.blood_in_sputum && (
                  <p role="alert" className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-base font-semibold text-red-900">
                    {t.bloodEmergency}
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <NumberStepper label={t.pneumonias} value={pneumonias} onChange={setPneumonias} min={0} max={20} {...stepper} />
                <ChoiceButtons label={t.visitQuestion} value={visitReason} onChange={setVisitReason} options={VISIT_VALUES.map((v) => ({ value: v, label: t.visit[v] }))} />
                {visitReason && <NumberStepper label={t.monthsAgo} value={visitMonths} onChange={setVisitMonths} min={0} max={60} {...stepper} />}
                <label className="block">
                  <span className="text-lg font-medium leading-snug">{t.freeText}</span>
                  <textarea
                    className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-lg focus:border-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    rows={3}
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                  />
                </label>
              </>
            )}

            {!stepValid && <p className="text-base text-slate-500">{t.fillRequired}</p>}
            <div className="flex gap-3">
              {pos > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(steps[pos - 1])}
                  className="min-h-14 flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 text-lg font-medium hover:bg-slate-50"
                >
                  {t.back}
                </button>
              )}
              <button
                type="submit"
                disabled={!stepValid || sending}
                className="min-h-14 flex-[2] rounded-xl bg-sky-700 px-4 text-lg font-semibold text-white hover:bg-sky-800 disabled:bg-slate-300"
              >
                {isLast ? (sending ? t.sending : t.send) : t.next}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
