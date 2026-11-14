import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
            <Link href="/" className="font-bold text-sky-800">
              Pikakaista
            </Link>
            <Link href="/county" className="hover:underline">Päättäjä</Link>
            <Link href="/survey" className="hover:underline">Kysely</Link>
            <Link href="/clinician" className="hover:underline">Lääkäri</Link>
            <Link href="/screening" className="hover:underline">Seulontalista</Link>
            <Link href="/pathway" className="hover:underline">Seuranta</Link>
            <Link href="/search" className="hover:underline">Potilashaku</Link>
            <Link href="/evidence" className="hover:underline">Tutkimus</Link>
            <span
              className={`ml-auto rounded px-2 py-0.5 text-xs ${hasApiKey() ? "bg-violet-100 text-violet-900" : "bg-slate-100 text-slate-600"}`}
              title={hasApiKey() ? "Claude API on käytössä" : "Ei API-avainta: tekstit ja luokittelu tehdään säännöillä"}
            >
              {hasApiKey() ? "Tekoäly: Claude" : "Tekoäly: pois (säännöt)"}
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Synteettinen data</span>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
