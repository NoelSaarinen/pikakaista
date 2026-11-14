import Link from "next/link";
import countiesData from "@/data/counties.json";
import { LogoMark } from "@/components/Logo";
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
  { value: nf.format(casesPerYear), label: "keuhkosyöpää vuodessa", note: "Syöpärekisteri 2020–2024" },
  { value: "65–70 %", label: "löytyy levinneenä", note: "Keuhkosyöpäohjelma 2026–2035" },
  { value: `alle ${Math.ceil(pilotCoverage * 100)} %`, label: "mahtuu seulontapilottiin", note: `${nf.format(ISC_LDCT.participants)} paikkaa, riskiryhmästä` },
  { value: `${nf.format(days.publicDaysToCt)} → ${nf.format(days.fastLaneDaysToCt)} pv`, label: "aika TT-kuvaukseen", note: "Nyt vs. pikakaista" },
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
    <div className="space-y-12">
      <section className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-12 text-white shadow-xl md:px-12 md:py-16">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-brand-berry/40 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20">
            <LogoMark size={18} /> Keuhkosyövän pikakaista
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight !text-white md:text-5xl">
            Löydetään ne, jotka eivät tule itse.
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Oirekysely riskiryhmälle kerran vuodessa. Hälytysmerkit TT-kuvaukseen päivissä, ei viikoissa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/survey" className="rounded-xl bg-brand-gold px-5 py-3 font-semibold text-brand-navy shadow-lg transition hover:brightness-105">
              Kokeile kyselyä
            </Link>
            <Link href="/county" className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20">
              Katso alueesi luvut →
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Avainluvut" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-extrabold tracking-tight text-brand-navy">{s.value}</p>
            <p className="mt-1 font-medium text-slate-700">{s.label}</p>
            <p className="mt-2 text-xs text-slate-500">{s.note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="how" className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-teal">Näin se toimii</p>
          <h2 id="how" className="mt-1 text-2xl font-bold">Kolme askelta</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-mist text-sm font-bold text-brand-blue">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="views" className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-berry">Demo</p>
          <h2 id="views" className="mt-1 text-2xl font-bold">Avaa näkymä</h2>
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

      <section aria-label="Periaatteet" className="flex flex-wrap justify-center gap-2">
        {TRUST.map((t) => (
          <span key={t} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
            ✓ {t}
          </span>
        ))}
      </section>
    </div>
  );
}
