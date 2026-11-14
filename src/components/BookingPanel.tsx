"use client";

import { useEffect, useState } from "react";
import { formatSlot, TIER_LABEL, type Booking, type QueueEntry } from "@/lib/booking";

interface BookingState {
  regionId: string;
  slotsOverride: number | null;
  slotsPerWeek: number;
  slotsTotal: number;
  ranAt: string | null;
  booked: number;
  queued: number;
  lateBookings: number;
  cancelled: number;
  regions: { id: string; name: string; slotsPerWeek: number }[];
}

/** Region, capacity and the button that books simulated appointments by priority. */
export function BookingPanel({ onBooked }: { onBooked: () => void }) {
  const [s, setS] = useState<BookingState | null>(null);
  const [regionId, setRegionId] = useState("pirkanmaa");
  const [override, setOverride] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: BookingState) => {
        if (cancelled) return;
        setS(json);
        setRegionId(json.regionId);
        setOverride(json.slotsOverride === null ? "" : String(json.slotsOverride));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId, slotsOverride: override === "" ? null : Number(override) }),
      });
      setS(await res.json());
      onBooked();
    } finally {
      setBusy(false);
    }
  }

  const region = s?.regions.find((r) => r.id === regionId);

  return (
    <section className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Ajanvaraus prioriteettijärjestyksessä (simuloitu)</p>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Demo: ei oikeaa ajanvarausta eikä tekstiviestejä</span>
      </div>
      <p className="text-xs text-slate-600">
        Lääkäriaika varataan korkean riskin potilaille listan järjestyksessä niin kauan kuin alueen pikakaistan aikoja riittää kahden viikon ajalle. A: verta yskösissä ja ikä vähintään 40, aika 3 arkipäivässä (NICE NG12 1.1.1). B: ikä vähintään 40 ja kaksi oiretta tai tupakoinut ja yksi oire (NG12 1.1.2) tai oireita ja PLCOm2012 ≥ 2 %, aika 2 viikossa. Muut lääkäri arvioi itse.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-600">
          Alue
          <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className="mt-0.5 block rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900">
            {s?.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.slotsPerWeek} aikaa/vko)
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Aikoja viikossa (tyhjä = alueen arvio)
          <input
            type="number"
            min={0}
            value={override}
            placeholder={region ? String(region.slotsPerWeek) : ""}
            onChange={(e) => setOverride(e.target.value)}
            className="mt-0.5 block w-36 rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          />
        </label>
        <button onClick={run} disabled={busy} className="rounded bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Varataan…" : s?.ranAt ? "Varaa ajat uudelleen" : "Varaa ajat"}
        </button>
      </div>
      {s?.ranAt && (
        <p className="text-xs text-slate-700" aria-live="polite">
          {s.slotsPerWeek} aikaa viikossa, {s.slotsTotal} aikaa kahdelle viikolle. Varattu {s.booked}
          {s.lateBookings > 0 && `, joista ${s.lateBookings} yli tavoiteajan`}. Jonossa ilman aikaa {s.queued}.
          {s.cancelled > 0 && ` Lääkäri perui ${s.cancelled}.`}
        </p>
      )}
      <p className="text-xs text-slate-500">Aikoja viikossa: alueen väestöön ja tupakointiin perustuva simulaation perusskenaario (Päättäjä-näkymä). Kaikki demossa olevat vastaukset käsitellään valitun alueen vastauksina.</p>
    </section>
  );
}

/** Small badge for a booking or a queue place. */
export function BookingBadge({ booking, queued }: { booking: Booking | null; queued: QueueEntry | null }) {
  if (booking) {
    return (
      <span className={`rounded px-1.5 text-xs ${booking.withinTarget ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`} title={TIER_LABEL[booking.tier]}>
        {booking.tier} · {formatSlot(booking.start)}
      </span>
    );
  }
  if (queued) {
    return (
      <span className="rounded bg-rose-100 px-1.5 text-xs text-rose-800" title={TIER_LABEL[queued.tier]}>
        {queued.tier} · jonossa, ei vapaata aikaa
      </span>
    );
  }
  return null;
}
