import Link from "next/link";
import countiesData from "@/data/counties.json";
import { LogoMark, LUNG } from "@/components/Logo";
import { LungStory } from "@/components/LungStory";
import { ISC_LDCT, isPilotCounty } from "@/lib/pilot";
import { SCENARIOS, simulate, simulateDoors } from "@/lib/simulation";
import type { County } from "@/lib/types";

const counties = countiesData as County[];
const nf = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });

// Every number on this page is computed from the demo's sourced data (src/data).
const casesPerYear = counties.reduce((s, c) => s + c.lung_cancer_cases_per_year.value, 0);
const pilotRiskGroup = counties.filter((c) => isPilotCounty(c.id)).reduce((s, c) => s + simulate(c, SCENARIOS.base).riskGroup, 0);
const pilotCoverage = ISC_LDCT.participants / pilotRiskGroup;
const days = simulateDoors(counties[0], SCENARIOS.base);

const STATS = [
  { value: nf.format(casesPerYear), label: "keuhkosyöpää vuodessa", note: "Syöpärekisteri 2020–2024", accent: "bg-brand-blue" },
  { value: "65–70 %", label: "löytyy levinneenä", note: "Keuhkosyöpäohjelma 2026–2035", accent: "bg-brand-berry" },
  { value: `alle ${Math.ceil(pilotCoverage * 100)} %`, label: "mahtuu seulontapilottiin", note: `${nf.format(ISC_LDCT.participants)} paikkaa, riskiryhmästä`, accent: "bg-brand-teal" },
  { value: `${nf.format(days.publicDaysToCt)} → ${nf.format(days.fastLaneDaysToCt)} pv`, label: "aika TT-kuvaukseen", note: "Nyt vs. pikakaista", accent: "bg-brand-gold" },
];

const STEPS = [
  { n: "1", title: "Kysely", text: "Kahden minuutin oirekysely tekstiviestillä." },
  { n: "2", title: "Lääkäri", text: "Hälytysmerkit listan kärkeen, lääkäri päättää." },
  { n: "3", title: "TT päivissä", text: "Varatut ajat, ei viikkojen jonoa." },
];

const VIEWS = [
  { href: "/county", title: "Päättäjä", text: "Alueesi luvut ja hyöty.", tag: "Hyvinvointialue" },
  { href: "/survey", title: "Kysely", text: "Kokeile kyselyä itse.", tag: "Kansalainen" },
  { href: "/clinician", title: "Lääkäri", text: "Lista, seulonta, seuranta ja haku.", tag: "Vain lääkäreille" },
  { href: "/evidence", title: "Tutkimus", text: "Uusin näyttö ja riskimalli.", tag: "Näyttö" },
];

const TRUST = ["Lääkäri päättää aina", "Tekoäly vain tiivistää", "Lähteet näkyvät luvuissa", "Synteettinen demodata"];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-12 text-white shadow-xl md:px-12 md:py-20">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 right-32 h-64 w-64 rounded-full bg-brand-berry/40 blur-3xl" />
        {/* Decorative lungs: a quiet echo of the logo on wide screens. */}
        <svg aria-hidden="true" viewBox="2 4 60 54" className="pointer-events-none absolute -right-6 top-1/2 hidden h-[125%] -translate-y-1/2 opacity-20 lg:block">
          <g className="lung-breathe" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round">
            <path d={LUNG.trachea} strokeWidth="3" />
            <path d={LUNG.bronchi} strokeWidth="2.2" />
            <path d={LUNG.left} fill="#ffffff" fillOpacity="0.12" />
            <path d={LUNG.right} fill="#ffffff" fillOpacity="0.3" />
          </g>
        </svg>
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20">
            <LogoMark size={20} /> Keuhkosyövän pikakaista
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight !text-white md:text-6xl">
            Löydetään ne, jotka <span className="text-brand-gold">eivät tule itse.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Oirekysely riskiryhmälle kerran vuodessa. Hälytysmerkit TT-kuvaukseen päivissä, ei viikoissa.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/survey" className="rounded-xl bg-brand-gold px-6 py-3 font-semibold text-brand-navy shadow-lg transition hover:-translate-y-0.5 hover:brightness-105">
              Kokeile kyselyä
            </Link>
            <Link href="/county" className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20">
              Katso alueesi luvut →
            </Link>
          </div>
        </div>
      </section>

      <LungStory />

      <section aria-label="Avainluvut" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${s.accent}`} />
            <p className="text-4xl font-extrabold tracking-tight text-brand-navy">{s.value}</p>
            <p className="mt-1 font-medium text-slate-700">{s.label}</p>
            <p className="mt-2 text-xs text-slate-500">{s.note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="how" className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-teal">Näin se toimii</p>
          <h2 id="how" className="mt-1 text-2xl font-bold md:text-3xl">Kolme askelta</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="brand-gradient grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white shadow">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute -right-[1.15rem] top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-xs text-slate-400 md:grid">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="views" className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-berry">Demo</p>
          <h2 id="views" className="mt-1 text-2xl font-bold md:text-3xl">Avaa näkymä</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {VIEWS.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{v.tag}</span>
                <span className="mt-1 block text-xl font-bold text-brand-navy">{v.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{v.text}</span>
              </span>
              <span aria-hidden="true" className="mt-6 text-xl text-sky-700 transition group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="try" className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-10 text-center text-white shadow-xl md:px-12">
        <div aria-hidden="true" className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-brand-berry/40 blur-3xl" />
        <div className="relative">
          <h2 id="try" className="text-2xl font-extrabold tracking-tight !text-white md:text-3xl">Kokeile itse kahdessa minuutissa</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/survey" className="rounded-xl bg-brand-gold px-6 py-3 font-semibold text-brand-navy shadow-lg transition hover:-translate-y-0.5 hover:brightness-105">
              Kokeile kyselyä
            </Link>
            <Link href="/clinician" className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20">
              Avaa lääkärin työtila →
            </Link>
          </div>
          <ul aria-label="Periaatteet" className="mt-7 flex flex-wrap justify-center gap-2">
            {TRUST.map((t) => (
              <li key={t} className="rounded-full bg-white/10 px-3.5 py-1 text-sm font-medium text-white/90 ring-1 ring-white/20">
                ✓ {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
