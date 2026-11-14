"use client";

// Large, calm controls for the survey. Built for older respondents: big touch targets
// (at least 48 px), no number spinners or scroll-wheel changes, and clear selected states.

import { useState } from "react";

/**
 * Whole-number input with − and + buttons. A plain text field with a numeric keypad is
 * used instead of <input type="number">, so the mouse wheel or arrow keys never change
 * the value by accident and the list never "runs away".
 */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 120,
  step = 1,
  unit,
  decreaseLabel,
  increaseLabel,
  required = false,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decreaseLabel: string;
  increaseLabel: string;
  required?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const shown = draft ?? (value === "" ? "" : String(value));
  const bump = (d: number) => {
    setDraft(null);
    onChange(clamp((value === "" ? min : value) + d));
  };
  return (
    <div>
      <label className="block text-lg font-medium leading-snug">{label}</label>
      <div className="mt-2 flex items-stretch gap-2">
        <button
          type="button"
          aria-label={`${decreaseLabel}: ${label}`}
          onClick={() => bump(-step)}
          disabled={value !== "" && value <= min}
          className="h-14 w-14 shrink-0 rounded-xl border-2 border-slate-300 bg-white text-3xl font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40"
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={label}
            required={required}
            value={shown}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
              setDraft(raw);
              if (raw === "") onChange("");
              else onChange(clamp(Number(raw)));
            }}
            onBlur={() => setDraft(null)}
            className="h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-center text-2xl font-semibold tabular-nums focus:border-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
          />
          {unit && <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-slate-500">{unit}</span>}
        </div>
        <button
          type="button"
          aria-label={`${increaseLabel}: ${label}`}
          onClick={() => bump(step)}
          disabled={value !== "" && value >= max}
          className="h-14 w-14 shrink-0 rounded-xl border-2 border-slate-300 bg-white text-3xl font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

/** One choice from a short list, as large buttons instead of a drop-down menu. */
export function ChoiceButtons<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 1,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  const grid = columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <fieldset>
      <legend className="text-lg font-medium leading-snug">{label}</legend>
      <div role="radiogroup" className={`mt-2 grid gap-2 ${grid}`}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-start text-lg ${
                selected ? "border-sky-700 bg-sky-50 font-semibold text-sky-900" : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-sky-700 bg-sky-700" : "border-slate-400"}`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A yes/no symptom as a large toggle card with a clear check mark. */
export function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-start text-lg ${
        checked ? "border-sky-700 bg-sky-50 font-semibold text-sky-900" : "border-slate-300 bg-white hover:bg-slate-50"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-lg leading-none ${checked ? "border-sky-700 bg-sky-700 text-white" : "border-slate-400"}`}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}
