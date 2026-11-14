"use client";

import type { SurveyResponse } from "@/lib/types";

interface LivePerson {
  response: SurveyResponse;
  live?: boolean;
}

/**
 * "New survey answers" box shown at the top of every list view, so an answer given in
 * the demo is easy to find on each page and the page says where it went. Live answers
 * come newest first from the API.
 */
export function NewAnswers<T extends LivePerson>({
  items,
  describe,
  onSelect,
  max = 5,
}: {
  items: T[] | null;
  describe: (item: T) => string;
  onSelect?: (id: string) => void;
  max?: number;
}) {
  const live = (items ?? []).filter((x) => x.live);
  if (live.length === 0) return null;
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm" aria-live="polite">
      <p className="font-semibold text-emerald-900">
        Uudet kyselyvastaukset ({live.length}){live.length > max && `, näytetään ${max} uusinta`}
      </p>
      <ul className="mt-1 space-y-1">
        {live.slice(0, max).map((x) => (
          <li key={x.response.id} className="flex flex-wrap items-baseline gap-x-2">
            {onSelect ? (
              <button type="button" onClick={() => onSelect(x.response.id)} className="font-medium text-sky-800 hover:underline">
                {x.response.id} · {x.response.age} v
              </button>
            ) : (
              <span className="font-medium">
                {x.response.id} · {x.response.age} v
              </span>
            )}
            <span className="text-emerald-900">{describe(x)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
