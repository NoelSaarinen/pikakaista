"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { LUNG, LUNG_COLORS } from "./Logo";

/**
 * Home page illustration: how a tumour grows in the lung while the symptoms stay small.
 *
 * Every statement comes from the National Lung Cancer Programme 2026–2035 (source
 * "filha-2026", pp. 2–4): the most common symptoms, the long symptom-free period, 65–70 %
 * found only after spreading, most cancer deaths, and curative treatment when found early.
 * "Cough over 3 weeks" is the alarm threshold of the Pirkanmaa pathway ("pirha-hoitopolku").
 * The order of symptoms is illustrative; it varies between patients.
 */
const STAGES = [
  { title: "Hiljainen alku", symptom: "Ei oireita", text: "Kasvain voi kasvaa pitkään ilman oireita." },
  { title: "Pieni oire", symptom: "Yskä yli 3 viikkoa", text: "Pitkittynyt yskä voi olla ensimmäinen merkki." },
  { title: "Oireet lisääntyvät", symptom: "Hengenahdistus · rintakipu", text: "Kasvain tuhoaa tervettä keuhkokudosta." },
  { title: "Syöpä leviää", symptom: "Veriyskä · laihtuminen", text: "65–70 % löytyy vasta levinneenä. Keuhkosyöpä aiheuttaa eniten syöpäkuolemia." },
] as const;

const TONE = [
  { badge: "bg-emerald-100 text-emerald-800", active: "border-emerald-300 bg-emerald-50", bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-900" },
  { badge: "bg-amber-100 text-amber-900", active: "border-amber-300 bg-amber-50", bar: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  { badge: "bg-orange-100 text-orange-900", active: "border-orange-300 bg-orange-50", bar: "bg-orange-500", chip: "bg-orange-100 text-orange-900" },
  { badge: "bg-rose-100 text-rose-800", active: "border-rose-300 bg-rose-50", bar: "bg-rose-600", chip: "bg-rose-100 text-rose-900" },
] as const;

/** How far the damage has spread and how large the tumour is at each stage (0–1). */
const SPREAD = [0.1, 0.34, 0.66, 1.15];
const TUMOUR = [0.2, 0.45, 0.72, 1];
/** Breathing gets faster and shallower as the lung fills up. */
const BREATH_SECONDS = [4.5, 4.5, 3.2, 2.2];
const STAGE_MS = 4200;

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

const grow = (scale: number): React.CSSProperties => ({
  transform: `scale(${scale})`,
  transformBox: "fill-box",
  transformOrigin: "center",
  transition: "transform 1.4s ease",
});
const fade = (on: boolean): React.CSSProperties => ({ opacity: on ? 1 : 0, transition: "opacity 1.2s ease" });

export function LungStory() {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);

  // Run only while the section is on screen, so the story starts when the viewer reaches it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const auto = playing && visible && !reducedMotion;
  const last = stage === STAGES.length - 1;
  const duration = last ? STAGE_MS * 1.7 : STAGE_MS;
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), duration);
    return () => clearTimeout(timer);
  }, [auto, stage, duration]);

  const s = STAGES[stage];
  const tone = TONE[stage];

  return (
    <section ref={ref} aria-labelledby={`${id}-title`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-berry">Miksi ajoissa</p>
          <h2 id={`${id}-title`} className="mt-1 text-2xl font-bold md:text-3xl">Pienikin oire voi olla ensimmäinen merkki</h2>
        </div>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={!playing}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {playing ? "❚❚ Pysäytä" : "▶ Toista"}
          </button>
        )}
      </div>

      <div className="mt-6 grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative mx-auto w-full max-w-sm rounded-3xl bg-gradient-to-b from-sky-50 to-white p-4 ring-1 ring-slate-100">
          <svg viewBox="2 4 60 54" className="w-full" role="img" aria-label="Havainnollistus: kasvain kasvaa keuhkossa ja leviää neljässä vaiheessa.">
            <defs>
              <clipPath id={`${id}-left`}>
                <path d={LUNG.left} />
              </clipPath>
              <clipPath id={`${id}-right`}>
                <path d={LUNG.right} />
              </clipPath>
              <linearGradient id={`${id}-healthy`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={LUNG_COLORS.healthyLight} />
                <stop offset="1" stopColor={LUNG_COLORS.healthy} />
              </linearGradient>
              <radialGradient id={`${id}-damage`}>
                <stop offset="0" stopColor={LUNG_COLORS.damage} stopOpacity="0.95" />
                <stop offset="0.65" stopColor={LUNG_COLORS.sick} stopOpacity="0.9" />
                <stop offset="1" stopColor={LUNG_COLORS.sick} stopOpacity="0" />
              </radialGradient>
            </defs>
            <g className="lung-breathe" style={{ animationDuration: `${BREATH_SECONDS[stage]}s`, animationPlayState: auto ? "running" : "paused" }}>
              <path d={LUNG.trachea} stroke="#13315c" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d={LUNG.bronchi} stroke="#13315c" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Viewer's left: the lobe where the tumour grows. */}
              <path d={LUNG.left} fill={`url(#${id}-healthy)`} />
              <g clipPath={`url(#${id}-left)`}>
                <circle cx="18" cy="33" r="30" fill={`url(#${id}-damage)`} style={grow(SPREAD[stage])} />
                <circle cx="18" cy="33" r="5.5" fill={LUNG_COLORS.tumour} style={grow(TUMOUR[stage])} />
                <g style={fade(stage >= 2)}>
                  <circle cx="21.5" cy="43.5" r="2.6" fill={LUNG_COLORS.tumour} />
                  <circle cx="22.5" cy="25.5" r="1.6" fill={LUNG_COLORS.tumour} />
                </g>
                <circle cx="14.5" cy="44.5" r="2" fill={LUNG_COLORS.tumour} style={fade(last)} />
              </g>
              <path d={LUNG.left} fill="none" stroke="#13315c" strokeOpacity="0.25" strokeWidth="0.6" />

              {/* Viewer's right: healthy until the cancer spreads. */}
              <path d={LUNG.right} fill={`url(#${id}-healthy)`} />
              <g clipPath={`url(#${id}-right)`} style={fade(last)}>
                <path d={LUNG.right} fill={LUNG_COLORS.sick} opacity="0.3" />
                <circle cx="44" cy="30" r="2.2" fill={LUNG_COLORS.tumour} />
                <circle cx="48.5" cy="42" r="1.8" fill={LUNG_COLORS.tumour} />
                <circle cx="41.5" cy="46" r="1.4" fill={LUNG_COLORS.tumour} />
              </g>
              <path d={LUNG.right} fill="none" stroke="#13315c" strokeOpacity="0.25" strokeWidth="0.6" />

              {/* Lymph nodes next to the windpipe. */}
              <g style={fade(last)}>
                <circle cx="29" cy="19.5" r="1.3" fill={LUNG_COLORS.tumour} />
                <circle cx="35" cy="18.5" r="1.1" fill={LUNG_COLORS.tumour} />
              </g>
            </g>
          </svg>
          <p className="-mt-1 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Vaihe {stage + 1}/{STAGES.length} · {s.title}
          </p>
          <p className={`mx-auto mt-2 w-fit rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-700 ${tone.chip}`}>{s.symptom}</p>
        </div>

        <ol className="space-y-2">
          {STAGES.map((item, i) => {
            const active = i === stage;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => {
                    setStage(i);
                    setPlaying(false);
                  }}
                  className={`relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-colors duration-500 ${
                    active ? TONE[i].active : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${active ? TONE[i].badge : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className={`block font-semibold ${active ? "text-brand-navy" : "text-slate-600"}`}>
                      {item.title} <span className="font-normal text-slate-500">· {item.symptom}</span>
                    </span>
                    <span className={`block text-sm ${active ? "text-slate-700" : "text-slate-500"}`}>{item.text}</span>
                  </span>
                  {active && auto && <span key={stage} aria-hidden="true" className={`story-progress absolute bottom-0 left-0 h-0.5 ${TONE[i].bar}`} style={{ animationDuration: `${duration}ms` }} />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-mist px-5 py-4">
        <p className="font-semibold text-brand-navy">Parantava hoito on mahdollinen, kun syöpä löytyy varhain. Siksi kysymme oireista ajoissa.</p>
        <Link href="/survey" className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-ink">
          Kokeile kyselyä →
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Havainnollistus. Oireiden järjestys vaihtelee, ja samoja oireita on myös monissa muissa sairauksissa. Lähde: Valtakunnallinen keuhkosyöpäohjelma 2026–2035.
      </p>
    </section>
  );
}
