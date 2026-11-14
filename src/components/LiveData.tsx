"use client";

// Live data for every view. Polls /api/live every few seconds; when the data version
// grows (a new survey answer, a decision, a booking…), every view that uses
// useLiveVersion() refetches its own data. In the same browser, a BroadcastChannel
// message makes the other tabs refresh at once instead of waiting for the next poll.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface LiveTotals {
  responses: number;
  live: number;
  onList: number;
  redFlags: number;
  symptomReview: number;
  fastLane: number;
  booked: number;
  queued: number;
}

interface LiveEvent {
  version: number;
  at: string;
  type: string;
  id?: string;
  text: string;
}

interface LiveState {
  version: number;
  events: LiveEvent[];
  totals: LiveTotals | null;
  updatedAt: Date | null;
  online: boolean;
}

const POLL_MS = 3000;
const CHANNEL = "fast-lane-live";

const LiveContext = createContext<LiveState>({ version: 0, events: [], totals: null, updatedAt: null, online: true });

/** Tells the other open tabs in this browser that data changed. */
export function notifyChange() {
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage("changed");
    ch.close();
  } catch {
    // BroadcastChannel is not available: the other tabs refresh on the next poll.
  }
}

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiveState>({ version: 0, events: [], totals: null, updatedAt: null, online: true });
  const busy = useRef(false);

  const poll = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = (await res.json()) as { version: number; events: LiveEvent[]; totals: LiveTotals };
      setState((prev) =>
        prev.version === json.version && prev.totals && prev.online
          ? { ...prev, updatedAt: new Date() }
          : { version: json.version, events: json.events, totals: json.totals, updatedAt: new Date(), online: true },
      );
    } catch {
      setState((prev) => ({ ...prev, online: false }));
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(poll, 0);
    const timer = setInterval(poll, POLL_MS);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(CHANNEL);
      ch.onmessage = () => poll();
    } catch {
      ch = null;
    }
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      ch?.close();
    };
  }, [poll]);

  return <LiveContext.Provider value={state}>{children}</LiveContext.Provider>;
}

/** The data version. Put it in a fetch effect's dependencies to refetch on every change. */
export function useLiveVersion(): number {
  return useContext(LiveContext).version;
}

export function useLiveData(): LiveState {
  return useContext(LiveContext);
}

/** Header indicator: live status, number of answers and a short note of the newest change. */
export function LiveIndicator() {
  const { totals, events, online, updatedAt } = useLiveData();
  const [toast, setToast] = useState<LiveEvent | null>(null);
  const seen = useRef<number | null>(null);
  const newest = events[0];

  useEffect(() => {
    if (!newest) return;
    // Show only changes that happen while the page is open, not old ones on first load.
    if (seen.current !== null && newest.version > seen.current) {
      const show = setTimeout(() => setToast(newest), 0);
      const hide = setTimeout(() => setToast(null), 6000);
      seen.current = newest.version;
      return () => {
        clearTimeout(show);
        clearTimeout(hide);
      };
    }
    seen.current = newest.version;
  }, [newest]);

  return (
    <span className="relative flex items-center gap-1.5 text-xs text-slate-600" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden />
      {online ? (
        <span title={updatedAt ? `Tarkistettu ${updatedAt.toLocaleTimeString("fi-FI")}` : undefined}>
          Live · {totals ? `${totals.responses} vastausta` : "…"}
        </span>
      ) : (
        <span>Ei yhteyttä palvelimeen</span>
      )}
      {toast && (
        <span className="absolute right-0 top-6 z-20 whitespace-nowrap rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-900 shadow">
          {toast.text}
        </span>
      )}
    </span>
  );
}

/** Live totals of the demo data, for views that otherwise show only models (e.g. /county). */
export function LiveTotalsPanel() {
  const { totals } = useLiveData();
  if (!totals) return null;
  const items: [string, number][] = [
    ["Kyselyvastauksia", totals.responses],
    ["Demossa annettuja", totals.live],
    ["Lääkärin listalla", totals.onList],
    ["Hälytysmerkkejä", totals.redFlags],
    ["Oirearvioon", totals.symptomReview],
    ["Pikakaistalle", totals.fastLane],
    ["Lääkäriaikoja varattu", totals.booked],
    ["Jonossa ilman aikaa", totals.queued],
  ];
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
      <p className="text-sm font-semibold">Demon kyselydata nyt (päivittyy automaattisesti)</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded bg-white p-2">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-lg font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-xs text-slate-500">Synteettiset vastaukset ja demossa annetut kyselyt. Alueen luvut yllä tulevat mallista eivätkä muutu yksittäisistä vastauksista.</p>
    </section>
  );
}
