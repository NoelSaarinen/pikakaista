import { ENGAGEMENT_LABEL, STAGE_LABEL, type Engagement, type Pathway, type StepStatus } from "@/lib/pathway";

export const ENGAGEMENT_BADGE: Record<Engagement, string> = {
  engaged: "bg-emerald-100 text-emerald-800",
  needs_support: "bg-amber-100 text-amber-900",
  at_risk: "bg-rose-100 text-rose-800",
};

const STEP_DOT: Record<StepStatus, string> = {
  done: "border-emerald-600 bg-emerald-600",
  current: "border-sky-600 bg-white ring-2 ring-sky-200",
  missed: "border-rose-600 bg-rose-600",
  upcoming: "border-slate-300 bg-white",
};

const STEP_TEXT: Record<StepStatus, string> = {
  done: "text-slate-700",
  current: "font-semibold text-sky-900",
  missed: "font-semibold text-rose-700",
  upcoming: "text-slate-400",
};

export function EngagementBadge({ engagement }: { engagement: Engagement }) {
  return <span className={`rounded px-1.5 text-xs ${ENGAGEMENT_BADGE[engagement]}`}>{ENGAGEMENT_LABEL[engagement]}</span>;
}

/** Care-pathway steps, current stage and engagement for one person. Synthetic data. */
export function PathwayCard({ pathway }: { pathway: Pathway }) {
  return (
    <div className="space-y-3 rounded border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Hoitopolku ja sitoutuminen</p>
        <EngagementBadge engagement={pathway.engagement} />
      </div>

      <ol className="space-y-1.5">
        {pathway.steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={`h-3 w-3 shrink-0 rounded-full border-2 ${STEP_DOT[step.status]}`} aria-hidden />
            <span className={STEP_TEXT[step.status]}>
              {step.label}
              {step.status === "current" && <span className="ml-1 text-xs font-normal text-sky-700">(nyt)</span>}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <p className="font-semibold text-slate-600">Nykyinen vaihe</p>
          <p>{STAGE_LABEL[pathway.stage]}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-600">Seuraava toimenpide</p>
          <p>{pathway.nextAction}</p>
        </div>
      </div>

      <div className="text-xs">
        <p className="font-semibold text-slate-600">Sitoutumisen perusteet</p>
        <ul className="list-disc pl-5">
          {pathway.engagementReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-slate-400">Synteettinen seurantatieto demoa varten.</p>
    </div>
  );
}
