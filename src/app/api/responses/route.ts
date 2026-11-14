import { NextResponse } from "next/server";
import { evaluate } from "@/lib/rules";
import { store } from "@/lib/store";
import type { SmokingStatus, SurveyResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const num = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
};

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
      pneumonias_last_year: num(symptoms.pneumonias_last_year, 0, 20),
    },
    previous_visits: typeof body.previous_visit_reason === "string" && body.previous_visit_reason.trim()
      ? [{ months_ago: num(body.previous_visit_months_ago, 0, 60), reason: body.previous_visit_reason.trim().slice(0, 80) }]
      : [],
    free_text: typeof body.free_text === "string" && body.free_text.trim() ? body.free_text.trim().slice(0, 1000) : undefined,
    channel: body.channel === "health_centre" ? "health_centre" : "survey",
    synthetic: true,
  };
  store.live.unshift(response);
  return NextResponse.json({ response, rule: evaluate(response) });
}
