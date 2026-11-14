// Survey languages chosen per region from data (StatFin 11rl, mother tongue of
// 50–74-year-olds by region). Finnish and Swedish are always offered; the region's other
// translated languages follow in order of local size. Large local languages without a
// translation are named, so the region can arrange a nurse's call with an interpreter.

import data from "@/data/survey_languages.json";
import type { SurveyLang } from "./survey-text";

interface LangRow {
  name: string;
  code: string | null;
  count: number;
}
interface RegionRow {
  name: string;
  total: number;
  languages: LangRow[];
  other_count: number;
}

const regions = (data as unknown as { regions: Record<string, RegionRow> }).regions;
export const LANGUAGE_DATA_YEAR = (data as unknown as { year: string }).year;

/** Wellbeing services county → region (maakunta) code in StatFin. The Uusimaa counties share MK01. */
const COUNTY_TO_REGION: Record<string, string> = {
  helsinki: "MK01",
  "ita-uusimaa": "MK01",
  "keski-uusimaa": "MK01",
  "lansi-uusimaa": "MK01",
  "vantaa-kerava": "MK01",
  "varsinais-suomi": "MK02",
  satakunta: "MK04",
  "kanta-hame": "MK05",
  pirkanmaa: "MK06",
  "paijat-hame": "MK07",
  kymenlaakso: "MK08",
  "etela-karjala": "MK09",
  "etela-savo": "MK10",
  "pohjois-savo": "MK11",
  "pohjois-karjala": "MK12",
  "keski-suomi": "MK13",
  "etela-pohjanmaa": "MK14",
  pohjanmaa: "MK15",
  "keski-pohjanmaa": "MK16",
  "pohjois-pohjanmaa": "MK17",
  kainuu: "MK18",
  lappi: "MK19",
};

/** A translated language is listed first for the region when at least this many 50–74-year-olds speak it. */
export const MIN_SPEAKERS = 10;
/** Untranslated languages with at least this many speakers are named for interpreter calls. */
export const INTERPRETER_MIN = 50;

export interface RegionLanguages {
  regionCode: string;
  regionName: string;
  /** True when the county shares a larger region's figures (the Uusimaa counties). */
  sharedRegion: boolean;
  total: number;
  /** Languages shown first for the region, largest first (Finnish and Swedish always included). */
  primary: { code: SurveyLang; name: string; count: number }[];
  /** Other translated languages, behind "more languages". */
  more: SurveyLang[];
  /** Share of 50–74-year-olds whose mother tongue is one of the translated languages. */
  coverage: number;
  /** Largest local languages without a translation: offer a nurse's call with an interpreter. */
  interpreter: { name: string; count: number }[];
}

export function regionLanguages(countyId: string, translated: readonly SurveyLang[]): RegionLanguages {
  const regionCode = COUNTY_TO_REGION[countyId] ?? "SSS";
  const r = regions[regionCode] ?? regions.SSS;
  const isTranslated = (code: string | null): code is SurveyLang => code !== null && translated.includes(code as SurveyLang);
  const primary = r.languages
    .filter((l) => isTranslated(l.code) && (l.code === "fi" || l.code === "sv" || l.count >= MIN_SPEAKERS))
    .map((l) => ({ code: l.code as SurveyLang, name: l.name, count: l.count }));
  const shown = new Set(primary.map((l) => l.code));
  const more = translated.filter((c) => !shown.has(c));
  const covered = r.languages.filter((l) => isTranslated(l.code)).reduce((s, l) => s + l.count, 0);
  const interpreter = r.languages
    .filter((l) => !isTranslated(l.code) && l.code === null && l.name !== "Muu kieli" && l.count >= INTERPRETER_MIN)
    .slice(0, 3)
    .map((l) => ({ name: l.name, count: l.count }));
  return {
    regionCode,
    regionName: r.name,
    sharedRegion: regionCode === "MK01" && countyId !== "uusimaa",
    total: r.total,
    primary,
    more,
    coverage: r.total ? covered / r.total : 0,
    interpreter,
  };
}
