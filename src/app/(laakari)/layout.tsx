"use client";

import { useSyncExternalStore } from "react";
import { ClinicianNav } from "@/components/Nav";

const ROLE_KEY = "pikakaista-role";
const ROLE_EVENT = "pikakaista-role-change";

function readRole(): "doctor" | "none" {
  try {
    return localStorage.getItem(ROLE_KEY) === "doctor" ? "doctor" : "none";
  } catch {
    return "none";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(ROLE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ROLE_EVENT, onChange);
  };
}

function setRole(doctor: boolean) {
  try {
    if (doctor) localStorage.setItem(ROLE_KEY, "doctor");
    else localStorage.removeItem(ROLE_KEY);
  } catch {}
  window.dispatchEvent(new Event(ROLE_EVENT));
}

/**
 * Clinician area: worklist, screening list, tracking and patient search.
 * Only clinicians should see these pages. The demo has no real login: the role is a
 * one-click choice stored in this browser. A real service needs authentication.
 */
export default function ClinicianLayout({ children }: { children: React.ReactNode }) {
  // Server render has no role yet: render nothing until the browser value is known.
  const role = useSyncExternalStore(subscribe, readRole, () => null);

  if (role === null) return null;

  if (role !== "doctor") {
    return (
      <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-sky-700">Lääkärin työtila</p>
        <h1 className="mt-1 text-xl font-bold">Vain lääkäreille</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pikakaistan lista, seulontalista, seuranta ja potilashaku sisältävät potilastietoja, joten ne näkyvät vain lääkärille.
        </p>
        <button type="button" onClick={() => setRole(true)} className="mt-4 rounded-lg bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-800">
          Jatka lääkärinä
        </button>
        <p className="mt-3 text-xs text-slate-500">Demossa ei ole oikeaa kirjautumista. Oikeassa palvelussa tunnistautuminen ja käyttöoikeudet tarvitaan.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <ClinicianNav />
        <button type="button" onClick={() => setRole(false)} className="text-xs text-slate-500 hover:text-slate-800 hover:underline">
          Poistu lääkärin työtilasta
        </button>
      </div>
      {children}
    </div>
  );
}
