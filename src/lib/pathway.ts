// Synthetic care-pathway follow-up for each person: where they are on the fast lane now
// and how well they engage with the risk-group survey and the booked steps.
//
// SYNTHETIC DEMO DATA. Finland has no national LDCT screening yet, so "engagement" here
// means engagement with this pathway: answering the survey, reminders needed and showing
// up for booked visits. Every value is derived deterministically from the person's id,
// so the same person always gets the same history. No real follow-up data is used.

import type { Placement, RuleResult, SurveyResponse } from "./types";

export type PathwayStage =
  | "awaiting_physician"
  | "physician_booked"
  | "ct_booked"
  | "ct_done"
  | "specialist"
  | "cleared"
  | "normal_route"
  | "no_action";

export type Engagement = "engaged" | "needs_support" | "at_risk";

export type StepStatus = "done" | "current" | "missed" | "upcoming";

export interface PathwayStep {
  label: string;
  status: StepStatus;
}

export interface Pathway {
  stage: PathwayStage;
  steps: PathwayStep[];
  engagement: Engagement;
  engagementReasons: string[];
  /** Days from invitation to answer. Null when the person came to the health centre themselves. */
  responseDays: number | null;
  reminders: number;
  missedVisits: number;
  nextAction: string;
  /** Synthetic earlier physician decision, so the demo starts with people at different stages. */
  priorDecision: Placement | null;
}

export const STAGE_LABEL: Record<PathwayStage, string> = {
  awaiting_physician: "Odottaa lääkärin arviota",
  physician_booked: "Lääkärikäynti varattu",
  ct_booked: "TT-kuvaus varattu",
  ct_done: "TT tehty, odottaa lausuntoa",
  specialist: "Jatkotutkimuksissa keuhkopoliklinikalla",
  cleared: "Ei löydöstä, tulos kerrottu",
  normal_route: "Tavallinen reitti omassa terveyskeskuksessa",
  no_action: "Ei riskiryhmässä, ei jatkotoimia",
};

/** Order for sorting and filters, from earliest to latest on the pathway. */
export const STAGE_ORDER: PathwayStage[] = [
  "awaiting_physician",
  "physician_booked",
  "ct_booked",
  "ct_done",
  "specialist",
  "cleared",
  "normal_route",
  "no_action",
];

export const ENGAGEMENT_LABEL: Record<Engagement, string> = {
  engaged: "Sitoutunut",
  needs_support: "Tarvitsee tukea",
  at_risk: "Vaarassa pudota pois",
};

/** Synthetic shares (team assumptions for the demo, not measured values). */
export const PATHWAY_ASSUMPTIONS = {
  /** Share of fast-lane people whose case a physician already decided before the demo starts. */
  priorDecisionShare: 0.55,
  /** Share of people with a low-engagement profile. */
  lowEngagementShare: 0.15,
  /** Share with a medium-engagement profile. */
  mediumEngagementShare: 0.25,
  /** Share of completed CT scans that lead to further tests at the pulmonary clinic. */
  furtherTestsShare: 0.12,
} as const;

// FNV-1a hash of the id seeds a small PRNG (mulberry32), so each person is stable.
function seededRandom(id: string): () => number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bookedSteps(placement: Placement): PathwayStage[] {
  return placement === "physician_fast" ? ["physician_booked", "ct_booked", "ct_done"] : ["ct_booked", "ct_done"];
}

/** Label of the pathway step that each booked stage waits for. */
const STEP_LABEL: Partial<Record<PathwayStage, string>> = {
  physician_booked: "Lääkärikäynti",
  ct_booked: "TT-kuvaus",
  ct_done: "Radiologin lausunto",
};

const MISSED_LABEL: Partial<Record<PathwayStage, string>> = {
  physician_booked: "Ei saapunut lääkärikäynnille",
  ct_booked: "Ei saapunut TT-kuvaukseen",
};

/**
 * Builds the synthetic pathway for one person.
 * @param decision The physician's decision made live in the demo, if any. It overrides the synthetic history.
 * @param live True for answers given live in the demo, which have no synthetic history.
 */
export function buildPathway(response: SurveyResponse, rule: RuleResult, decision: Placement | null, live: boolean): Pathway {
  const rand = seededRandom(response.id);
  const profile = rand();
  const lowEngagement = !live && profile < PATHWAY_ASSUMPTIONS.lowEngagementShare;
  const mediumEngagement =
    !live && !lowEngagement && profile < PATHWAY_ASSUMPTIONS.lowEngagementShare + PATHWAY_ASSUMPTIONS.mediumEngagementShare;

  // Survey answer: days to answer and reminders follow the engagement profile.
  const viaSurvey = response.channel !== "health_centre";
  let responseDays: number | null = null;
  let reminders = 0;
  if (viaSurvey) {
    if (live) responseDays = 0;
    else if (lowEngagement) responseDays = 15 + Math.floor(rand() * 10);
    else if (mediumEngagement) responseDays = 8 + Math.floor(rand() * 7);
    else responseDays = Math.floor(rand() * 7);
    reminders = responseDays >= 15 ? 2 : responseDays >= 8 ? 1 : 0;
  }

  const fastLane = rule.placement === "direct_ct" || rule.placement === "physician_fast";
  const priorDecision = fastLane && !live && rand() < PATHWAY_ASSUMPTIONS.priorDecisionShare ? rule.placement : null;
  const effectiveDecision = decision ?? priorDecision;
  const firstStep: PathwayStep = { label: viaSurvey ? "Kysely vastattu" : "Hoitajan tarkistuslista täytetty", status: "done" };

  let stage: PathwayStage;
  let missedVisits = 0;
  const steps: PathwayStep[] = [firstStep];

  if (!rule.eligible) {
    stage = "no_action";
    steps.push({ label: STAGE_LABEL.no_action, status: "current" });
  } else if (!fastLane || effectiveDecision === "normal_route" || effectiveDecision === "not_eligible") {
    stage = "normal_route";
    steps.push({ label: STAGE_LABEL.normal_route, status: "current" });
  } else if (!effectiveDecision) {
    stage = "awaiting_physician";
    steps.push({ label: "Lääkärin arvio", status: "current" });
    for (const s of bookedSteps(rule.placement)) steps.push({ label: STEP_LABEL[s]!, status: "upcoming" });
    steps.push({ label: "Tulos", status: "upcoming" });
  } else {
    steps.push({ label: "Lääkärin arvio", status: "done" });
    const booked = bookedSteps(effectiveDecision);
    // A fresh decision in the demo starts at the first booked step. Synthetic history may be further along.
    let reached = decision ? 0 : Math.floor(rand() * (booked.length + 1));
    // People who drop out miss the visit they are booked for, so they stay at a booked visit.
    if (!decision && lowEngagement) reached = Math.min(reached, booked.length - 2);
    if (reached < booked.length) {
      stage = booked[reached];
      booked.forEach((s, i) => {
        if (i < reached) steps.push({ label: STEP_LABEL[s]!, status: "done" });
        else if (i === reached && lowEngagement && !decision && MISSED_LABEL[s]) {
          missedVisits = 1;
          steps.push({ label: MISSED_LABEL[s]!, status: "missed" });
        } else steps.push({ label: STEP_LABEL[s]!, status: i === reached ? "current" : "upcoming" });
      });
      steps.push({ label: "Tulos", status: "upcoming" });
    } else {
      stage = rand() < PATHWAY_ASSUMPTIONS.furtherTestsShare ? "specialist" : "cleared";
      for (const s of booked) steps.push({ label: STEP_LABEL[s]!, status: "done" });
      steps.push({ label: STAGE_LABEL[stage], status: "current" });
    }
  }

  // Engagement level and the reasons behind it, in the order a nurse would read them.
  const engagementReasons: string[] = [];
  const rescheduled = mediumEngagement && stage !== "awaiting_physician" && fastLane && rand() < 0.5;
  const unreachable = lowEngagement && missedVisits === 0;
  if (!viaSurvey) engagementReasons.push("Tuli itse terveyskeskukseen");
  else if (live) engagementReasons.push("Vastasi kyselyyn juuri nyt");
  else if (reminders === 0) engagementReasons.push(`Vastasi kyselyyn ${responseDays} päivässä ilman muistutusta`);
  else engagementReasons.push(`Vastasi kyselyyn ${responseDays} päivässä, ${reminders} muistutus${reminders > 1 ? "ta" : ""}`);
  if (missedVisits > 0) engagementReasons.push(steps.find((s) => s.status === "missed")!.label);
  if (rescheduled) engagementReasons.push("Siirsi varattua aikaa kerran");
  if (unreachable) engagementReasons.push("Ei vastannut hoitajan puheluun");
  const anyVisitDone = steps.some((s, i) => i > 1 && s.status === "done");
  if (!missedVisits && !rescheduled && anyVisitDone) engagementReasons.push("Saapui kaikille varatuille käynneille");

  const engagement: Engagement =
    missedVisits > 0 || unreachable ? "at_risk" : reminders > 0 || rescheduled ? "needs_support" : "engaged";

  return {
    stage,
    steps,
    engagement,
    engagementReasons,
    responseDays,
    reminders,
    missedVisits,
    nextAction: nextAction(stage, engagement),
    priorDecision,
  };
}

function nextAction(stage: PathwayStage, engagement: Engagement): string {
  if (engagement === "at_risk") {
    if (stage === "physician_booked") return "Hoitaja soittaa ja varaa uuden lääkäriajan";
    if (stage === "ct_booked") return "Hoitaja soittaa ja varaa uuden TT-ajan";
    if (stage === "awaiting_physician" || stage === "normal_route") return "Hoitaja yrittää tavoittaa uudelleen";
  }
  switch (stage) {
    case "awaiting_physician":
      return "Lääkäri arvioi ja hyväksyy ehdotuksen";
    case "physician_booked":
      return "Muistutusviesti päivää ennen lääkärikäyntiä";
    case "ct_booked":
      return "Muistutusviesti päivää ennen TT-kuvausta";
    case "ct_done":
      return "Radiologin lausunto ja tuloksen kertominen";
    case "specialist":
      return "Keuhkopoliklinikka jatkaa tutkimuksia";
    case "cleared":
      return "Uusi kysely vuoden kuluttua";
    case "normal_route":
      return "Hakeutuu omaan terveyskeskukseen, jos oireet jatkuvat";
    case "no_action":
      return "Ei toimia";
  }
}
