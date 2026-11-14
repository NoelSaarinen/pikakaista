import type { Metadata } from "next";
import Link from "next/link";
import { LiveIndicator, LiveProvider } from "@/components/LiveData";
import { MainNav } from "@/components/Nav";
import { hasApiKey } from "@/lib/llm";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keuhkosyövän pikakaista",
  description: "Junction 2026 · AstraZeneca Equal Care Across Finland · demo with synthetic data",
};

// Read the API key at request time, so the badge updates when .env.local changes.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <LiveProvider>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav aria-label="Päävalikko" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm">
            <Link href="/" className="mr-2 flex items-center gap-2 font-bold text-sky-800">
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-lg bg-sky-700 text-xs text-white">PK</span>
              Pikakaista
            </Link>
            <MainNav />
            <span className="ml-auto flex flex-wrap items-center gap-2">
              <LiveIndicator />
            <span
              className={`rounded px-2 py-0.5 text-xs ${hasApiKey() ? "bg-violet-100 text-violet-900" : "bg-slate-100 text-slate-600"}`}
              title={hasApiKey() ? "Claude API on käytössä" : "Ei API-avainta: tekstit ja luokittelu tehdään säännöillä"}
            >
              {hasApiKey() ? "Tekoäly: Claude" : "Tekoäly: pois (säännöt)"}
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Synteettinen data</span>
            </span>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500">
          Junction 2026 · Keuhkosyövän pikakaista · Kaikki henkilöt ovat synteettisiä. Aluetilastot ovat virallisista lähteistä, ja lähde näkyy luvun vieressä.
        </footer>
        </LiveProvider>
      </body>
    </html>
  );
}
