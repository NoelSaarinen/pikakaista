import { describe, expect, it } from "vitest";
import { allocate, bookingTier, formatSlot, generateSlots } from "./booking";
import { riskPriority } from "./priority";
import { evaluate } from "./rules";
import type { SurveyResponse } from "./types";

// Saturday 14 Nov 2026, so the first working day is Monday 16 Nov.
const SATURDAY = new Date(2026, 10, 14, 12, 0);

function person(id: string, overrides: Partial<SurveyResponse> = {}, symptoms: Partial<SurveyResponse["symptoms"]> = {}): SurveyResponse {
  return {
    id,
    age: 67,
    language: "fi",
    smoking: { status: "current", pack_years: 40 },
    symptoms: { cough_weeks: 0, blood_in_sputum: false, weight_loss: false, breathlessness: false, chest_pain: false, pneumonias_last_year: 0, ...symptoms },
    previous_visits: [],
    synthetic: true,
    ...overrides,
  };
}

const candidate = (r: SurveyResponse) => ({ response: r, rule: evaluate(r), priority: riskPriority(r), decision: null, stageAwaiting: true });

describe("booking tiers (NICE NG12)", () => {
  it("puts haemoptysis at age 40+ in tier A", () => {
    expect(bookingTier(candidate(person("a", {}, { blood_in_sputum: true })))?.tier).toBe("A");
    expect(bookingTier(candidate(person("a", { age: 35 }, { blood_in_sputum: true })))?.tier).not.toBe("A");
  });

  it("puts an ever-smoker with one NG12 symptom in tier B, a never-smoker needs two", () => {
    expect(bookingTier(candidate(person("b", {}, { breathlessness: true })))?.tier).toBe("B");
    const never = { smoking: { status: "never" as const, pack_years: 0 } };
    expect(bookingTier(candidate(person("c", never, { breathlessness: true })))).toBeNull();
    expect(bookingTier(candidate(person("d", never, { breathlessness: true, chest_pain: true })))?.tier).toBe("B");
  });

  it("counts cough only from 3 weeks and books nobody without symptoms", () => {
    const never = { smoking: { status: "never" as const, pack_years: 0 } };
    expect(bookingTier(candidate(person("e", never, { cough_weeks: 1, chest_pain: true })))).toBeNull();
    expect(bookingTier(candidate(person("f")))).toBeNull();
  });
});

describe("slots", () => {
  it("makes slots on working days only, 20 minutes apart from 8.00", () => {
    const slots = generateSlots(SATURDAY, 7, 2);
    expect(slots).toHaveLength(14);
    expect(slots[0].start).toBe("2026-11-16T08:00");
    expect(slots[1].start).toBe("2026-11-16T08:20");
    for (const s of slots) {
      const [y, m, d] = s.start.slice(0, 10).split("-").map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      expect(dow).toBeGreaterThan(0);
      expect(dow).toBeLessThan(6);
    }
    expect(formatSlot("2026-11-16T08:20")).toBe("ma 16.11. klo 08.20");
  });

  it("makes no slots without capacity", () => {
    expect(generateSlots(SATURDAY, 0)).toEqual([]);
  });
});

describe("allocation", () => {
  const a = candidate(person("A1", {}, { blood_in_sputum: true }));
  const b1 = candidate(person("B1", {}, { breathlessness: true }));
  const b2 = candidate(person("B2", {}, { chest_pain: true }));
  const none = candidate(person("N1"));

  it("books tier A first and in list order, as far as capacity allows, then queues", () => {
    const { bookings, queue } = allocate([b1, none, a, b2], 1, SATURDAY, new Set());
    // 1 slot a week → 2 slots in two weeks.
    expect(bookings.map((x) => x.id)).toEqual(["A1", "B1"]);
    expect(queue.map((x) => x.id)).toEqual(["B2"]);
    expect(bookings[0].start < bookings[1].start).toBe(true);
  });

  it("skips cancelled people and people past the physician step", () => {
    const done = { ...b2, stageAwaiting: false };
    const { bookings, queue } = allocate([a, b1, done], 10, SATURDAY, new Set(["A1"]));
    expect(bookings.map((x) => x.id)).toEqual(["B1"]);
    expect(queue).toEqual([]);
  });

  it("marks a tier A booking later than 3 working days as outside the target", () => {
    const many = Array.from({ length: 12 }, (_, i) => candidate(person(`A${i}`, {}, { blood_in_sputum: true })));
    const { bookings } = allocate(many, 5, SATURDAY, new Set());
    expect(bookings[0].withinTarget).toBe(true);
    expect(bookings.at(-1)!.withinTarget).toBe(false);
  });
});
