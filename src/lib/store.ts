// In-memory demo store. Holds the synthetic people, survey answers given live in
// the demo, physician decisions, cached case summaries, follow-up answers and the
// literature evidence. Resets on server restart (evidence reloads from the snapshot).

import counties from "@/data/counties.json";
import literatureSnapshot from "@/data/literature.json";
import synthetic from "@/data/synthetic/responses.json";
import type { SurveyAnalysis } from "./analysis";
import { allocate, generateSlots, TIER_TARGET_WORKDAYS, type Booking, type QueueEntry } from "./booking";
import { summarizeFactorEvidence, type Evidence } from "./literature/evidence";
import { applyBooking, buildPathway, type Pathway } from "./pathway";
import { riskPriority, type RiskPriority } from "./priority";
import { compareForWorklist, evaluate } from "./rules";
import { SCENARIOS, simulate } from "./simulation";
import type { CaseSummary, County, Placement, RuleResult, SurveyResponse } from "./types";

export interface LiteratureState {
  evidence: Evidence[];
  lastRefresh: string | null;
}

/** Simulated appointment booking (booking.ts). */
export interface BookingState {
  regionId: string;
  /** Slots per week set by hand. Null means the region's simulated fast-lane capacity. */
  slotsOverride: number | null;
  bookings: Record<string, Booking>;
  queue: QueueEntry[];
  cancelled: string[];
  /** When the booking was last run. Null until someone runs it. */
  ranAt: string | null;
  slotsTotal: number;
}

interface Store {
  live: SurveyResponse[];
  decisions: Record<string, Placement>;
  summaries: Record<string, CaseSummary>;
  analyses: Record<string, SurveyAnalysis>;
  /** Answers to the adaptive follow-up questions, by person id and question id. */
  followups: Record<string, Record<string, string>>;
  literature: LiteratureState;
  booking: BookingState;
}

const EMPTY_BOOKING: BookingState = { regionId: "pirkanmaa", slotsOverride: null, bookings: {}, queue: [], cancelled: [], ranAt: null, slotsTotal: 0 };

const snapshot = literatureSnapshot as { fetchedAt: string | null; evidence: Evidence[] };

const globalStore = globalThis as unknown as { __fastLaneStore?: Store };
export const store: Store = (globalStore.__fastLaneStore ??= {
  live: [],
  decisions: {},
  summaries: {},
  analyses: {},
  followups: {},
  literature: { evidence: snapshot.evidence, lastRefresh: snapshot.fetchedAt },
  booking: { ...EMPTY_BOOKING },
});
// Stores created before these fields existed (dev hot reload) get them here.
store.analyses ??= {};
store.followups ??= {};
store.literature ??= { evidence: snapshot.evidence, lastRefresh: snapshot.fetchedAt };
store.booking ??= { ...EMPTY_BOOKING };

export function allResponses(): SurveyResponse[] {
  return [...store.live, ...(synthetic as SurveyResponse[])];
}

export function findResponse(id: string): SurveyResponse | undefined {
  return allResponses().find((r) => r.id === id);
}

export function factorEvidence() {
  return summarizeFactorEvidence(store.literature.evidence);
}

export interface WorklistItem {
  response: SurveyResponse;
  rule: RuleResult;
  /** The physician's decision: made live in the demo, or a synthetic earlier one from the pathway. */
  decision: Placement | null;
  live: boolean;
  pathway: Pathway;
  priority: RiskPriority;
  /** Simulated physician appointment, if one was booked. */
  booking: Booking | null;
  /** Booking tier when the person is high-risk but no slot was free. */
  queued: QueueEntry | null;
}

/** Every person with rules, decision, synthetic care pathway and risk priority, before bookings. */
function basePatients(): Omit<WorklistItem, "booking" | "queued">[] {
  const liveIds = new Set(store.live.map((r) => r.id));
  return allResponses().map((response) => {
    const rule = evaluate(response);
    const live = liveIds.has(response.id);
    const liveDecision = store.decisions[response.id] ?? null;
    const pathway = buildPathway(response, rule, liveDecision, live);
    const priority = riskPriority(response);
    return { response, rule, decision: liveDecision ?? pathway.priorDecision, live, pathway, priority };
  });
}

/** Every person, with any simulated booking shown on the care pathway. */
export function patients(): WorklistItem[] {
  const b = store.booking;
  return basePatients().map((p) => {
    const booking = b.bookings[p.response.id] ?? null;
    const queued = b.queue.find((q) => q.id === p.response.id) ?? null;
    return { ...p, pathway: booking ? applyBooking(p.pathway, booking) : p.pathway, booking, queued };
  });
}

// --- Simulated booking -----------------------------------------------------------

/** The region's simulated fast-lane physician slots per week (base scenario on /county). */
export function regionSlotsPerWeek(regionId: string): number {
  const county = (counties as County[]).find((c) => c.id === regionId);
  return county ? simulate(county, SCENARIOS.base).physicianSlotsPerWeek : 0;
}

export function slotsPerWeek(): number {
  const b = store.booking;
  return Math.round(b.slotsOverride ?? regionSlotsPerWeek(b.regionId));
}

/**
 * Books simulated physician appointments for high-risk people in priority order, as
 * far as the region's capacity allows. Earlier bookings are replaced; cancelled
 * people stay cancelled.
 */
export function runBooking(regionId: string, slotsOverride: number | null): BookingState {
  const b = store.booking;
  b.regionId = regionId;
  b.slotsOverride = slotsOverride;
  const ordered = basePatients()
    .sort(compareWithPriority)
    .map((p) => ({ ...p, stageAwaiting: p.pathway.stage === "awaiting_physician" }));
  const { bookings, queue, slotsTotal } = allocate(ordered, slotsPerWeek(), new Date(), new Set(b.cancelled));
  b.bookings = Object.fromEntries(bookings.map((x) => [x.id, x]));
  b.queue = queue;
  b.slotsTotal = slotsTotal;
  b.ranAt = new Date().toISOString();
  return b;
}

/** A physician cancels a booking. The person returns to the physician's list without a time. */
export function cancelBooking(id: string): void {
  const b = store.booking;
  delete b.bookings[id];
  b.queue = b.queue.filter((q) => q.id !== id);
  if (!b.cancelled.includes(id)) b.cancelled.push(id);
}

/**
 * After a booking run, a new high-risk survey answer gets the next free slot without
 * moving anyone already booked. Returns the booking, or null.
 */
export function bookNewAnswer(id: string): Booking | null {
  const b = store.booking;
  if (!b.ranAt) return null;
  const p = basePatients().find((x) => x.response.id === id);
  if (!p || p.pathway.stage !== "awaiting_physician") return null;
  const { bookings, queue } = allocate([{ ...p, stageAwaiting: true }], slotsPerWeek(), new Date(b.ranAt), new Set());
  if (!bookings.length && !queue.length) return null;
  const taken = new Set(Object.values(b.bookings).map((x) => x.start));
  const free = generateSlots(new Date(b.ranAt), slotsPerWeek()).find((s) => !taken.has(s.start));
  const tier = (bookings[0] ?? queue[0]).tier;
  const reason = (bookings[0] ?? queue[0]).reason;
  if (!free) {
    b.queue.push({ id, tier, reason });
    return null;
  }
  const booking: Booking = { id, tier, reason, start: free.start, workdaysFromNow: free.workday, withinTarget: free.workday <= TIER_TARGET_WORKDAYS[tier] };
  b.bookings[id] = booking;
  return booking;
}

const RANK: Record<Placement, number> = { direct_ct: 0, physician_fast: 1, normal_route: 2, not_eligible: 3 };

/** Symptom urgency from the rules: red flags, then any symptom review, then placement. */
function urgency(r: RuleResult): number {
  if (r.redFlag) return 0;
  if (r.symptomReviewRequired) return 1;
  return 2 + RANK[r.placement];
}

/**
 * Physician's list order: symptom urgency and alarm score first, then the PLCOm2012
 * 6-year risk. Risk only breaks ties inside the same urgency, so it never outranks
 * an alarm sign.
 */
export function compareWithPriority(a: Pick<WorklistItem, "rule" | "priority">, b: Pick<WorklistItem, "rule" | "priority">): number {
  return (
    urgency(a.rule) - urgency(b.rule) ||
    b.rule.score - a.rule.score ||
    b.priority.score - a.priority.score ||
    compareForWorklist(a.rule, b.rule)
  );
}

export function worklist(): { items: WorklistItem[]; counts: Record<Placement, number>; total: number } {
  const all = patients();
  const counts: Record<Placement, number> = { direct_ct: 0, physician_fast: 0, normal_route: 0, not_eligible: 0 };
  for (const e of all) counts[e.rule.placement] += 1;
  // Everyone with a symptom is surfaced for review, even outside the survey risk group.
  const items = all
    .filter((e) => e.rule.placement === "direct_ct" || e.rule.placement === "physician_fast" || e.rule.symptomReviewRequired)
    .sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || compareWithPriority(a, b));
  return { items, counts, total: all.length };
}
