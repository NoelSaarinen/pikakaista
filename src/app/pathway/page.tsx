"use client";

import { useEffect, useMemo, useState } from "react";
import { PRIORITY_BADGE } from "@/components/AnalysisCard";
import { formatRisk } from "@/lib/priority";
import { EngagementBadge, ENGAGEMENT_BADGE, PathwayCard } from "@/components/PathwayCard";
import { ENGAGEMENT_LABEL, STAGE_LABEL, STAGE_ORDER, type Engagement, type PathwayStage } from "@/lib/pathway";
import { PLACEMENT_LABEL } from "@/lib/rules";
import type { WorklistItem } from "@/lib/store";

const ENGAGEMENTS: Engagement[] = ["at_risk", "needs_support", "engaged"];
const ENGAGEMENT_RANK: Record<Engagement, number> = { at_risk: 0, needs_support: 1, engaged: 2 };

export default function PathwayPage() {
  const [items, setItems] = useState<WorklistItem[] | null>(null);
  const [engagement, setEngagement] = useState<Engagement | "all">("all");
  const [stage, setStage] = useState<PathwayStage | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/patients", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { items: WorklistItem[] }) => {
        if (!cancelled) setItems(json.items);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const engagementCounts = useMemo(() => {
    const c: Record<Engagement, number> = { engaged: 0, needs_support: 0, at_risk: 0 };
    for (const x of items ?? []) c[x.pathway.engagement] += 1;
    return c;
  }, [items]);

  const stageCounts = useMemo(() => {
    const c = Object.fromEntries(STAGE_ORDER.map((s) => [s, 0])) as Record<PathwayStage, number>;
    for (const x of items ?? []) c[x.pathway.stage] += 1;
    return c;
  }, [items]);

  // Fast-lane stages first and the least engaged first, so the nurse sees who needs a call.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? [])
      .filter((x) => engagement === "all" || x.pathway.engagement === engagement)
      .filter((x) => stage === "all" || x.pathway.stage === stage)
      .filter((x) => !q || x.response.id.includes(q))
      .sort(
        (a, b) =>
          STAGE_ORDER.indexOf(a.pathway.stage) - STAGE_ORDER.indexOf(b.pathway.stage) ||
          ENGAGEMENT_RANK[a.pathway.engagement] - ENGAGEMENT_RANK[b.pathway.engagement] ||
          a.response.id.localeCompare(b.response.id),
      );
  }, [items, engagement, stage, query]);

  const fastLaneStages = STAGE_ORDER.filter((s) => s !== "normal_route" && s !== "no_action");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-sky-700">Hoitajan seurantanäkymä · hyvinvointialue</p>
        <h1 className="text-2xl font-bold">Sitoutuminen ja hoitopolun vaihe</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Jokaisen kyselyyn vastanneen sitoutuminen kyselyyn ja varattuihin käynteihin sekä nykyinen vaihe pikakaistalla. Suomessa ei vielä ole kansallista keuhkosyöpäseulontaa, joten sitoutuminen tarkoittaa tässä riskiryhmäkyselyä ja pikakaistaa. Kaikki tiedot ovat synteettisiä.
        </p>
      </div>

      {items && (
        <div className="grid gap-3 md:grid-cols-3">
          {ENGAGEMENTS.map((e) => (
            <button
              key={e}
              onClick={() => setEngagement(engagement === e ? "all" : e)}
              className={`rounded-lg border bg-white p-3 text-left hover:border-sky-400 ${engagement === e ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"}`}
            >
              <span className={`rounded px-1.5 text-xs ${ENGAGEMENT_BADGE[e]}`}>{ENGAGEMENT_LABEL[e]}</span>
              <p className="mt-1 text-2xl font-bold">{engagementCounts[e]}</p>
              <p className="text-xs text-slate-500">{Math.round((engagementCounts[e] / items.length) * 100)} % vastanneista</p>
            </button>
          ))}
        </div>
      )}

      {items && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold">Pikakaistalla nyt</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {fastLaneStages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(stage === s ? "all" : s)}
                className={`rounded border px-2 py-1 text-xs hover:border-sky-400 ${stage === s ? "border-sky-500 bg-sky-50" : "border-slate-200"}`}
              >
                {STAGE_LABEL[s]} <span className="font-semibold">{stageCounts[s]}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Muut: {STAGE_LABEL.normal_route.toLowerCase()} {stageCounts.normal_route}, {STAGE_LABEL.no_action.toLowerCase()} {stageCounts.no_action}.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hae tunnuksella, esim. p-0005"
          className="rounded border border-slate-300 px-2 py-1"
        />
        <select value={engagement} onChange={(e) => setEngagement(e.target.value as Engagement | "all")} className="rounded border border-slate-300 px-2 py-1">
          <option value="all">Kaikki sitoutumistasot</option>
          {ENGAGEMENTS.map((e) => (
            <option key={e} value={e}>
              {ENGAGEMENT_LABEL[e]}
            </option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value as PathwayStage | "all")} className="rounded border border-slate-300 px-2 py-1">
          <option value="all">Kaikki vaiheet</option>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="text-slate-500">{rows.length} henkilöä</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Henkilö</th>
                <th className="px-3 py-2">Sitoutuminen</th>
                <th className="px-3 py-2">Vaihe nyt</th>
                <th className="px-3 py-2" title="PLCOm2012: kuuden vuoden keuhkosyöpäriski">PLCOm2012</th>
                <th className="hidden px-3 py-2 lg:table-cell">Seuraava toimenpide</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((x) => (
                <tr
                  key={x.response.id}
                  onClick={() => setSelected(x.response.id)}
                  className={`cursor-pointer hover:bg-slate-50 ${selected === x.response.id ? "bg-sky-50" : ""}`}
                >
                  <td className="px-3 py-2 font-medium">
                    {x.response.id} · {x.response.age} v
                  </td>
                  <td className="px-3 py-2">
                    <EngagementBadge engagement={x.pathway.engagement} />
                  </td>
                  <td className="px-3 py-2">{STAGE_LABEL[x.pathway.stage]}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 text-xs ${PRIORITY_BADGE[x.priority.level]}`}>
                      {x.priority.level === "not_applicable" ? "–" : formatRisk(x.priority.score)}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2 text-slate-600 lg:table-cell">{x.pathway.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {(() => {
            const item = items?.find((x) => x.response.id === selected);
            if (!item) return <p className="text-slate-500">Valitse henkilö taulukosta.</p>;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {item.response.id} · {item.response.age} v
                  </h2>
                  <span className="text-xs text-slate-600">{item.response.channel === "health_centre" ? "terveyskeskus" : "kysely"}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Sääntöjen ehdotus: {PLACEMENT_LABEL[item.rule.placement]}
                  {item.decision && <> · Lääkäri: {PLACEMENT_LABEL[item.decision]}</>}
                </p>
                <PathwayCard pathway={item.pathway} />
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
