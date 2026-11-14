import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keuhkosyövän pikakaista",
  description: "Junction 2026 · AstraZeneca Equal Care Across Finland · demo with synthetic data",
};

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
            <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Synteettinen data</span>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
