// Generates synthetic survey responses for the demo. No real people.
// Usage: node scripts/generate-synthetic.mjs [count] [seed]
// Output: src/data/synthetic/responses.json

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const count = Number(process.argv[2] ?? 200);
const seed = Number(process.argv[3] ?? 2026);

// Small seeded PRNG (mulberry32) so every run gives the same people.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(seed);
const chance = (p) => rand() < p;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const intBetween = (min, max) => min + Math.floor(rand() * (max - min + 1));

const FREE_TEXT = {
  fi: [
    "Yskä ei ole mennyt ohi flunssan jälkeen.",
    "Hengästyn portaissa enemmän kuin ennen.",
    "Aamuisin yskösissä oli vähän verta.",
    "Laihduin vaikka en yrittänyt.",
    "Astmalääke ei auttanut yskään.",
    "Ei erityisiä oireita.",
  ],
  sv: ["Hostan har inte gått över på flera veckor.", "Jag blir andfådd lättare än förut."],
  en: ["My cough has lasted since the summer.", "I have had pneumonia twice this year."],
};

const VISIT_REASONS = ["yskä", "flunssa", "keuhkokuume", "astma", "selkäkipu", "verenpaine"];

function makePerson(i) {
  // Drawn first so the random stream (and every other field) stays the same; survey
  // respondents are moved into the survey age range 50–74 once the channel is known.
  const drawnAge = intBetween(50, 85);
  const smokingStatus = chance(0.15) ? "never" : chance(0.45) ? "current" : "former";
  const packYears = smokingStatus === "never" ? 0 : intBetween(5, 60);
  const language = chance(0.88) ? "fi" : chance(0.6) ? "sv" : "en";

  // A small share of people get a coherent "concerning" symptom profile.
  const concerning = chance(0.12);
  const cough_weeks = concerning ? intBetween(3, 16) : chance(0.2) ? intBetween(1, 4) : 0;
  const symptoms = {
    cough_weeks,
    blood_in_sputum: concerning ? chance(0.35) : chance(0.01),
    weight_loss: concerning ? chance(0.4) : chance(0.04),
    breathlessness: concerning ? chance(0.6) : chance(0.15),
    chest_pain: concerning ? chance(0.3) : chance(0.05),
    pneumonias_last_year: concerning ? (chance(0.4) ? intBetween(1, 3) : 0) : chance(0.05) ? 1 : 0,
  };

  const previous_visits = [];
  if (chance(concerning ? 0.6 : 0.2)) {
    previous_visits.push({ months_ago: intBetween(1, 12), reason: concerning ? pick(["yskä", "flunssa", "keuhkokuume", "astma"]) : pick(VISIT_REASONS) });
  }

  // Two Doors: some symptomatic people come in themselves; the nurse fills the same checklist.
  const channel = concerning && chance(0.4) ? "health_centre" : "survey";
  // The survey goes only to 50–74-year-olds (same as the screening pilot). The health
  // centre checklist is for anyone, so those people keep any age.
  const age = channel === "survey" && drawnAge > 74 ? 50 + (((drawnAge - 75) * 7) % 25) : drawnAge;

  const person = {
    id: `p-${String(i + 1).padStart(4, "0")}`,
    age,
    language,
    smoking: { status: smokingStatus, pack_years: packYears },
    symptoms,
    previous_visits,
    channel,
    synthetic: true,
  };
  if (chance(0.35)) {
    const texts = FREE_TEXT[language];
    const symptomTexts = texts.filter((t) => t !== "Ei erityisiä oireita.");
    person.free_text = concerning ? pick(symptomTexts) : pick(texts);
  }
  person.plco = plcoFields(person);
  return person;
}

// Extra inputs for the PLCOm2012 risk model. They use their own PRNG seeded from the
// id, so adding them does not change any other field of the existing people.
// Shares are team assumptions for a synthetic Finnish 50–85 population.
function plcoFields(person) {
  let h = 0x811c9dc5;
  for (const ch of `plco:${person.id}`) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  const r = mulberry32(h >>> 0);
  const between = (min, max) => min + Math.floor(r() * (max - min + 1));
  const { status, pack_years } = person.smoking;

  // Education levels 1–6 as in PLCOm2012 (see src/lib/plco.ts for the Finnish mapping).
  const u = r();
  const education = u < 0.25 ? 1 : u < 0.55 ? 2 : u < 0.75 ? 3 : u < 0.8 ? 4 : u < 0.92 ? 5 : 6;
  // Roughly normal BMI around 27.
  const bmi = Math.round((19 + (r() + r() + r() + r()) * 4) * 10) / 10;

  let cigs_per_day = 0;
  let smoking_years = 0;
  let years_since_quit = 0;
  if (status !== "never") {
    const startAge = between(15, 22);
    const span = Math.max(1, person.age - startAge);
    years_since_quit = status === "former" ? between(1, Math.max(1, Math.min(30, span - 5))) : 0;
    smoking_years = Math.max(1, span - years_since_quit);
    // Keep the existing pack-years: cigarettes/day = pack-years × 20 / years smoked.
    cigs_per_day = Math.min(60, Math.max(1, Math.round((pack_years * 20) / smoking_years)));
  }
  return {
    education,
    bmi,
    copd: r() < (pack_years >= 30 ? 0.25 : 0.1),
    personal_cancer_history: r() < 0.08,
    family_history_lung_cancer: r() < 0.1,
    cigs_per_day,
    smoking_years,
    years_since_quit,
  };
}

const people = Array.from({ length: count }, (_, i) => makePerson(i));
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "src", "data", "synthetic", "responses.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(people, null, 2) + "\n");
console.log(`Wrote ${people.length} synthetic responses to ${out}`);
