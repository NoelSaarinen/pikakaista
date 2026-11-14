import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { LiveIndicator, LiveProvider } from "@/components/LiveData";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/Nav";
import { hasApiKey } from "@/lib/llm";
import "./globals.css";

const brandFont = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-brand", display: "swap" });

export const metadata: Metadata = {
  title: "Pikakaista · keuhkosyöpä nopeammin hoitoon",
  description: "Junction 2026 · AstraZeneca Equal Care Across Finland · demo with synthetic data",
};

// Read the API key at request time, so the badge updates when .env.local changes.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={brandFont.variable}>
      <body className="flex min-h-screen flex-col font-sans text-slate-900 antialiased">
        <LiveProvider>
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="brand-bar h-1" aria-hidden="true" />
            <nav aria-label="Päävalikko" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 text-sm">
              <Link href="/" aria-label="Pikakaista, etusivu">
                <Logo />
              </Link>
              <MainNav />
              <span className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                <span className="hidden md:inline-flex">
                  <LiveIndicator />
                </span>
                <span
                  className={`hidden rounded-full px-2.5 py-0.5 font-medium md:inline-flex ${hasApiKey() ? "bg-violet-100 text-violet-900" : "bg-slate-100 text-slate-600"}`}
                  title={hasApiKey() ? "Claude API on käytössä" : "Ei API-avainta: tekstit ja luokittelu tehdään säännöillä"}
                >
                  {hasApiKey() ? "Tekoäly: Claude" : "Tekoäly: pois (säännöt)"}
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-900">Synteettinen data</span>
              </span>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white/70">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500">
              <span className="flex items-center gap-2 font-semibold text-brand-navy">
                Pikakaista <span className="font-normal text-slate-500">· Junction 2026 · Equal Care Across Finland</span>
              </span>
              <span>Kaikki henkilöt ovat synteettisiä. Aluetilastot ovat virallisista lähteistä, ja lähde näkyy luvun vieressä. Lääkäri päättää aina.</span>
            </div>
          </footer>
        </LiveProvider>
      </body>
    </html>
  );
}
