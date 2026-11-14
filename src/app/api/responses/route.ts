import { NextResponse } from "next/server";
import { PLCO_RACE } from "@/lib/plco";
import { evaluate } from "@/lib/rules";
import { bookNewAnswer, markChanged, store } from "@/lib/store";
import type { PlcoInputs, PlcoRace, SmokingStatus, SurveyResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const num = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
};

/** Accepts true/false and the survey's "yes"/"no". Anything else is "not answered". */
const yesNo = (v: unknown): boolean | undefined => (v === "yes" || v === true ? true : v === "no" || v === false ? false : undefined);

// PLCOm2012 inputs. Anything missing or invalid is left out, so the model imputes it
// and lists it. Race is an optional question; without it the reference category is used.
function plcoFromBody(raw: unknown): Partial<PlcoInputs> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Record<string, unknown>;
  const out: Partial<PlcoInputs> = {};
  const n = (v: unknown, min: number, max: number) => {
    const x = Number(v);
    return v !== undefined && v !== null && v !== "" && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : undefined;
  };
  if (typeof p.race === "string" && p.race in PLCO_RACE) out.race = p.race as PlcoRace;
  const education = n(p.education, 1, 6);
  if (education !== undefined) out.education = Math.round(education);
  const bmi = n(p.bmi, 12, 70);
  if (bmi !== undefined) out.bmi = Math.round(bmi * 10) / 10;
  for (const key of ["copd", "personal_cancer_history", "family_history_lung_cancer"] as const) {
    const v = yesNo(p[key]);
    if (v !== undefined) out[key] = v;
  }
  const cigs = n(p.cigs_per_day, 0, 150);
  if (cigs !== undefined && cigs > 0) out.cigs_per_day = cigs;
  const years = n(p.smoking_years, 0, 90);
  if (years !== undefined && years > 0) out.smoking_years = years;
  const quit = n(p.years_since_quit, 0, 90);
  if (quit !== undefined) out.years_since_quit = quit;
  return out;
}

// Stores one survey answer given live in the demo. The answer is synthetic too:
// the presenter types it in. No real personal data.
export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const symptoms = (body.symptoms ?? {}) as Record<string, unknown>;
  const status = (["current", "former", "never"].includes(String(body.smoking_status)) ? body.smoking_status : "never") as SmokingStatus;

  const response: SurveyResponse = {
    id: `live-${String(store.live.length + 1).padStart(3, "0")}`,
    age: num(body.age, 18, 110),
    language: typeof body.language === "string" ? body.language.slice(0, 5) : "fi",
    smoking: { status, pack_years: status === "never" ? 0 : num(body.pack_years, 0, 150) },
    symptoms: {
      cough_weeks: num(symptoms.cough_weeks, 0, 104),
      blood_in_sputum: Boolean(symptoms.blood_in_sputum),
      weight_loss: Boolean(symptoms.weight_loss),
      breathlessness: Boolean(symptoms.breathlessness),
      chest_pain: Boolean(symptoms.chest_pain),
      hoarseness: Boolean(symptoms.hoarseness),
      pneumonias_last_year: num(symptoms.pneumonias_last_year, 0, 20),
    },
    previous_visits: typeof body.previous_visit_reason === "string" && body.previous_visit_reason.trim()
      ? [{ months_ago: num(body.previous_visit_months_ago, 0, 60), reason: body.previous_visit_reason.trim().slice(0, 80) }]
      : [],
    free_text: typeof body.free_text === "string" && body.free_text.trim() ? body.free_text.trim().slice(0, 1000) : undefined,
    channel: body.channel === "health_centre" ? "health_centre" : "survey",
    plco: status === "never" ? undefined : plcoFromBody(body.plco),
    synthetic: true,
  };
  store.live.unshift(response);
  // After a booking run, a new high-risk answer gets the next free simulated slot.
  const booking = bookNewAnswer(response.id);
  markChanged("response", `Uusi kyselyvastaus ${response.id}${booking ? ", lääkäriaika varattu" : ""}`, response.id);
  return NextResponse.json({ response, rule: evaluate(response), booking });
}
