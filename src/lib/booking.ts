// Simulated physician appointment booking for high-risk people on the priority list.
//
// DEMO ONLY. No real appointment system, calendar or text message is used. Slots are
// generated from the region's simulated fast-lane capacity, and every booking is
// marked as simulated. A physician can cancel any booking.
//
// Who is booked (tiers follow NICE NG12, checked on nice.org.uk on 2026-11-14):
//   A  Aged 40+ with haemoptysis (NG12 1.1.1: suspected cancer pathway referral).
//      Target: within 3 working days (team assumption, after the Danish 3-day fast track).
//   B  Aged 40+ with 2 or more of the NG12 1.1.2 symptoms, or ever smoked with 1 or more
//      (cough, shortness of breath, chest pain, weight loss). Also people with symptoms
//      whose PLCOm2012 6-year risk is at least 2 % (team addition).
//      Target: within 2 weeks (NG12 defines "urgent" as "before 2 weeks").
// Cough counts as a symptom when it has lasted 3 weeks or more, because the survey
// cannot tell whether a cough is "unexplained" (team assumption).
// Everyone else on the list is not booked automatically; the physician decides.

import type { RiskPriority } from "./priority";
import type { Placement, RuleResult, SurveyResponse } from "./types";

export type BookingTier = "A" | "B";

export const TIER_TARGET_WORKDAYS: Record<BookingTier, number> = { A: 3, B: 10 };

export const TIER_LABEL: Record<BookingTier, string> = {
  A: "A · Hälytysmerkki, aika 3 arkipäivässä",
  B: "B · Kiireellinen, aika 2 viikossa",
};

export interface BookingCandidate {
  response: SurveyResponse;
  rule: RuleResult;
  priority: RiskPriority;
  decision: Placement | null;
}

/** NG12 1.1.2 symptoms the survey asks about. */
export function ng12Symptoms(r: SurveyResponse): string[] {
  const s = r.symptoms;
  const out: string[] = [];
  if (s.cough_weeks >= 3) out.push("yskä");
  if (s.breathlessness) out.push("hengenahdistus");
  if (s.chest_pain) out.push("rintakipu");
  if (s.weight_loss) out.push("laihtuminen");
  return out;
}

/** The booking tier and the reason, or null when the person is not booked automatically. */
export function bookingTier(c: BookingCandidate): { tier: BookingTier; reason: string } | null {
  const r = c.response;
  if (r.age >= 40 && r.symptoms.blood_in_sputum) return { tier: "A", reason: "Verta yskösissä, ikä vähintään 40 (NICE NG12 1.1.1)" };
  const symptoms = ng12Symptoms(r);
  const everSmoked = r.smoking.status !== "never";
  if (r.age >= 40 && (symptoms.length >= 2 || (everSmoked && symptoms.length >= 1))) {
    return {
      tier: "B",
      reason: `${symptoms.length >= 2 ? "Kaksi tai useampi oire" : "Tupakoinut ja oire"}: ${symptoms.join(", ")} (NICE NG12 1.1.2)`,
    };
  }
  if (c.rule.symptomReviewRequired && c.priority.level === "high") {
    return { tier: "B", reason: `Oireita ja PLCOm2012-riski ${c.priority.score.toLocaleString("fi-FI")} % (≥ 2 %)` };
  }
  return null;
}

export interface Booking {
  id: string;
  tier: BookingTier;
  reason: string;
  /** Local date-time, e.g. "2026-11-17T08:20". */
  start: string;
  /** Working days from the booking run to the slot. */
  workdaysFromNow: number;
  withinTarget: boolean;
}

export interface QueueEntry {
  id: string;
  tier: BookingTier;
  reason: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Appointment slots for the next `weeks` weeks, starting the next working day.
 * Each week's slots are spread over Monday–Friday, 20 minutes apart from 8.00.
 */
export function generateSlots(from: Date, slotsPerWeek: number, weeks = 2): { start: string; workday: number }[] {
  const perWeek = Math.max(0, Math.round(slotsPerWeek));
  const slots: { start: string; workday: number }[] = [];
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let workday = 0;
  while (workday < weeks * 5) {
    day.setDate(day.getDate() + 1);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;
    const weekdayIndex = workday % 5;
    // Spread the week's slots evenly: the first (perWeek % 5) weekdays get one extra.
    const today = Math.floor(perWeek / 5) + (weekdayIndex < perWeek % 5 ? 1 : 0);
    workday += 1;
    for (let k = 0; k < today; k++) {
      const t = new Date(day);
      t.setHours(8, 0, 0, 0);
      t.setMinutes(k * 20);
      slots.push({ start: localIso(t), workday });
    }
  }
  return slots;
}

/**
 * Books the earliest free slot for each high-risk person, in priority order (the list
 * order: tier A before tier B, then the physician's list order). People who get no slot
 * within the horizon go to the queue. Cancelled ids and people already past the
 * physician step are skipped.
 */
export function allocate(
  ordered: (BookingCandidate & { stageAwaiting: boolean })[],
  slotsPerWeek: number,
  from: Date,
  cancelled: Set<string>,
): { bookings: Booking[]; queue: QueueEntry[]; slotsTotal: number } {
  const slots = generateSlots(from, slotsPerWeek);
  const candidates = ordered
    .filter((c) => c.stageAwaiting && !cancelled.has(c.response.id))
    .map((c) => ({ c, t: bookingTier(c) }))
    .filter((x): x is { c: (typeof ordered)[number]; t: { tier: BookingTier; reason: string } } => x.t !== null);
  // Tier A first; inside a tier keep the list order (stable sort).
  candidates.sort((a, b) => (a.t.tier === b.t.tier ? 0 : a.t.tier === "A" ? -1 : 1));

  const bookings: Booking[] = [];
  const queue: QueueEntry[] = [];
  let next = 0;
  for (const { c, t } of candidates) {
    const slot = slots[next];
    if (!slot) {
      queue.push({ id: c.response.id, tier: t.tier, reason: t.reason });
      continue;
    }
    next += 1;
    bookings.push({
      id: c.response.id,
      tier: t.tier,
      reason: t.reason,
      start: slot.start,
      workdaysFromNow: slot.workday,
      withinTarget: slot.workday <= TIER_TARGET_WORKDAYS[t.tier],
    });
  }
  return { bookings, queue, slotsTotal: slots.length };
}

export function formatSlot(start: string): string {
  const [date, time] = start.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const weekday = ["su", "ma", "ti", "ke", "to", "pe", "la"][new Date(y, m - 1, d).getDay()];
  return `${weekday} ${d}.${m}. klo ${time.replace(":", ".")}`;
}
