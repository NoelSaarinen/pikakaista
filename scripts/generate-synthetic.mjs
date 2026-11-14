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
  const age = intBetween(50, 85);
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

  const person = {
    id: `p-${String(i + 1).padStart(4, "0")}`,
    age,
    language,
    smoking: { status: smokingStatus, pack_years: packYears },
    symptoms,
    previous_visits,
    // Two Doors: some symptomatic people come in themselves; the nurse fills the same checklist.
    channel: concerning && chance(0.4) ? "health_centre" : "survey",
    synthetic: true,
  };
  if (chance(0.35)) {
    const texts = FREE_TEXT[language];
    const symptomTexts = texts.filter((t) => t !== "Ei erityisiä oireita.");
    person.free_text = concerning ? pick(symptomTexts) : pick(texts);
  }
  return person;
}

const people = Array.from({ length: count }, (_, i) => makePerson(i));
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "src", "data", "synthetic", "responses.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(people, null, 2) + "\n");
console.log(`Wrote ${people.length} synthetic responses to ${out}`);
