// Builds src/data/counties.json from public aggregate data. No numbers are typed by hand:
// every county value is computed here from the snapshots in src/data/raw/.
//
// Usage:
//   node scripts/build-county-data.mjs           Build from the committed snapshots (no network).
//   node scripts/build-county-data.mjs --fetch   Refresh the StatFin and Sotkanet snapshots first.
//
// The Cancer Registry snapshot is not fetched: the registry's statistics app has no open API,
// so its table was copied by hand (see src/data/raw/syoparekisteri-lung-c33-c34.json).
// Sources and definitions: docs/DATA_NOTES.md.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(root, "src/data/raw");
const POP_FILE = join(RAW, "statfin-population-55-80.json");
const SOTKA_FILE = join(RAW, "sotkanet.json");
const LUNG_FILE = join(RAW, "syoparekisteri-lung-c33-c34.json");
const OUT_FILE = join(root, "src/data/counties.json");

const POP_YEAR = 2025;
const AGE_MIN = 55;
const AGE_MAX = 80;
const SMOKING = { indicator: 4404, year: 2024, previousYear: 2022 };
const OCC_HEALTH = { indicator: 2371, year: 2025 };
const LUNG_YEARS = [2020, 2021, 2022, 2023, 2024];
const HVA_KEY = "kunta_1_20260101#hyvinvointialue_1_20260101";

// The three original demo counties stay first so the demo's default view does not change.
// The rest follow the official wellbeing services county code order. Ahvenanmaa is left out:
// it is not a wellbeing services county.
const COUNTIES = [
  { code: "HVA08", id: "pirkanmaa", name: "Pirkanmaa", fullName: "Pirkanmaan hyvinvointialue" },
  { code: "HVA13", id: "pohjois-savo", name: "Pohjois-Savo", fullName: "Pohjois-Savon hyvinvointialue" },
  { code: "HVA21", id: "lappi", name: "Lappi", fullName: "Lapin hyvinvointialue" },
  { code: "HVA01", id: "ita-uusimaa", name: "Itä-Uusimaa", fullName: "Itä-Uudenmaan hyvinvointialue" },
  { code: "HVA02", id: "keski-uusimaa", name: "Keski-Uusimaa", fullName: "Keski-Uudenmaan hyvinvointialue" },
  { code: "HVA03", id: "lansi-uusimaa", name: "Länsi-Uusimaa", fullName: "Länsi-Uudenmaan hyvinvointialue" },
  { code: "HVA04", id: "vantaa-kerava", name: "Vantaa ja Kerava", fullName: "Vantaan ja Keravan hyvinvointialue" },
  { code: "HVA05", id: "varsinais-suomi", name: "Varsinais-Suomi", fullName: "Varsinais-Suomen hyvinvointialue" },
  { code: "HVA06", id: "satakunta", name: "Satakunta", fullName: "Satakunnan hyvinvointialue" },
  { code: "HVA07", id: "kanta-hame", name: "Kanta-Häme", fullName: "Kanta-Hämeen hyvinvointialue" },
  { code: "HVA09", id: "paijat-hame", name: "Päijät-Häme", fullName: "Päijät-Hämeen hyvinvointialue" },
  { code: "HVA10", id: "kymenlaakso", name: "Kymenlaakso", fullName: "Kymenlaakson hyvinvointialue" },
  { code: "HVA11", id: "etela-karjala", name: "Etelä-Karjala", fullName: "Etelä-Karjalan hyvinvointialue" },
  { code: "HVA12", id: "etela-savo", name: "Etelä-Savo", fullName: "Etelä-Savon hyvinvointialue" },
  { code: "HVA14", id: "pohjois-karjala", name: "Pohjois-Karjala", fullName: "Pohjois-Karjalan hyvinvointialue" },
  { code: "HVA15", id: "keski-suomi", name: "Keski-Suomi", fullName: "Keski-Suomen hyvinvointialue" },
  { code: "HVA16", id: "etela-pohjanmaa", name: "Etelä-Pohjanmaa", fullName: "Etelä-Pohjanmaan hyvinvointialue" },
  { code: "HVA17", id: "pohjanmaa", name: "Pohjanmaa", fullName: "Pohjanmaan hyvinvointialue" },
  { code: "HVA18", id: "keski-pohjanmaa", name: "Keski-Pohjanmaa", fullName: "Keski-Pohjanmaan hyvinvointialue" },
  { code: "HVA19", id: "pohjois-pohjanmaa", name: "Pohjois-Pohjanmaa", fullName: "Pohjois-Pohjanmaan hyvinvointialue" },
  { code: "HVA20", id: "kainuu", name: "Kainuu", fullName: "Kainuun hyvinvointialue" },
  { code: "HVA90", id: "helsinki", name: "Helsinki", fullName: "Helsingin kaupunki" },
];

// Sotkanet notes gaps in the occupational health visit data for these areas.
const OCC_HEALTH_GAPS = new Set(["HVA04", "HVA90"]);

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const today = () => new Date().toISOString().slice(0, 10);
const pct = (n) => `${n.toFixed(1)}%`;

async function getJson(url, body) {
  const res = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// ---------- Fetch: StatFin population 55–80 by municipality ----------

const PX = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak";
const pxItem = (code, values) => ({ code, selection: { filter: "item", values } });

function jsonStatCell(ds, coords) {
  let offset = 0;
  ds.id.forEach((dim, i) => {
    offset = offset * ds.size[i] + (coords[dim] === undefined ? 0 : ds.dimension[dim].category.index[coords[dim]]);
  });
  return ds.value[offset];
}

async function fetchPopulation() {
  const meta = await getJson(`${PX}/11re.px`);
  const areaVar = meta.variables.find((v) => v.code.startsWith("alue"));
  const ageVar = meta.variables.find((v) => v.code.startsWith("ikaryhma"));
  const sexVar = meta.variables.find((v) => v.code.startsWith("sukupuoli"));
  const municipalities = areaVar.values.map((code, i) => ({ code, name: areaVar.valueTexts[i] })).filter((m) => m.code.startsWith("KU"));
  const ages = [];
  for (let a = AGE_MIN; a <= AGE_MAX; a++) ages.push(String(a).padStart(3, "0"));

  const query = [
    pxItem(areaVar.code, [...municipalities.map((m) => m.code), "SSS"]),
    pxItem(ageVar.code, [...ages, "SSS"]),
    pxItem(sexVar.code, ["SSS"]),
    pxItem("timeperiod_y", [String(POP_YEAR)]),
  ];
  const ds = await getJson(`${PX}/11re.px`, { query, response: { format: "json-stat2" } });
  const cell = (area, age) => jsonStatCell(ds, { [areaVar.code]: area, [ageVar.code]: age });
  const sumAges = (area) => ages.reduce((s, age) => s + cell(area, age), 0);

  const key = await getJson(`https://data.stat.fi/api/classifications/v2/correspondenceTables/${encodeURIComponent(HVA_KEY)}/maps?content=data&meta=max&lang=fi&format=json`);
  const kuToHva = {};
  const hvaNames = {};
  for (const m of key) {
    const hva = "HVA" + m.targetLocalId.split("/")[1];
    kuToHva["KU" + m.sourceLocalId.split("/")[1]] = hva;
    hvaNames[hva] = m.targetItem?.classificationItemNames?.[0]?.name;
  }

  // County totals published directly in StatFin 11ra, used as a cross-check.
  const hvaCodes = [...new Set(Object.values(kuToHva))].sort();
  const ra = await getJson(`${PX}/11ra.px`, {
    query: [pxItem(areaVar.code, hvaCodes), pxItem("contentscode", ["vaerak-vaesto"]), pxItem("timeperiod_y", [String(POP_YEAR)])],
    response: { format: "json-stat2" },
  });

  writeJson(POP_FILE, {
    source: "Statistics Finland, StatFin 11re: Väestö iän (1-v.) ja sukupuolen mukaan alueittain, 1972-2025",
    api: `${PX}/11re.px`,
    key: `Statistics Finland classification key ${HVA_KEY}`,
    cross_check: "Statistics Finland, StatFin 11ra: Tunnuslukuja väestöstä alueittain (Väestö 31.12.)",
    retrieved: today(),
    year: POP_YEAR,
    reference_date: `${POP_YEAR}-12-31`,
    ages: `${AGE_MIN}-${AGE_MAX}`,
    sex: "both",
    national: { pop_55_80: sumAges("SSS"), pop_total: cell("SSS", "SSS") },
    hva_names: hvaNames,
    hva_totals_11ra: Object.fromEntries(hvaCodes.map((h) => [h, jsonStatCell(ra, { [areaVar.code]: h })])),
    municipalities: municipalities.map((m) => ({ code: m.code, name: m.name, hva: kuToHva[m.code] ?? null, pop_55_80: sumAges(m.code), pop_total: cell(m.code, "SSS") })),
  });
}

// ---------- Fetch: THL Sotkanet indicators by wellbeing services county ----------

const SOTKA = "https://sotkanet.fi/rest/1.1";

async function fetchSotkanet() {
  const regions = await getJson(`${SOTKA}/regions`);
  const regionToHva = {};
  for (const r of regions) {
    if (r.category === "HYVINVOINTIALUE") regionToHva[r.id] = "HVA" + r.code;
    if (r.category === "MAA") regionToHva[r.id] = "national";
  }
  async function indicator(id, years) {
    const meta = await getJson(`${SOTKA}/indicators/${id}`);
    const data = await getJson(`${SOTKA}/json?indicator=${id}${years.map((y) => `&years=${y}`).join("")}&genders=total`);
    const byYear = {};
    for (const d of data) {
      const area = regionToHva[d.region];
      if (!area) continue;
      (byYear[d.year] ??= {})[area] = d.value;
    }
    // Sorted keys keep snapshot diffs readable.
    for (const y of Object.keys(byYear)) byYear[y] = Object.fromEntries(Object.entries(byYear[y]).sort(([a], [b]) => a.localeCompare(b)));
    return {
      title: meta.title.fi,
      organization: meta.organization?.title?.fi,
      data_source: (meta.sources ?? []).map((s) => s.title?.fi).join("; "),
      data_updated: meta["data-updated"],
      metadata: `https://sotkanet.fi/sotkanet/fi/metadata/indicators/${id}`,
      api: `${SOTKA}/json?indicator=${id}${years.map((y) => `&years=${y}`).join("")}&genders=total`,
      by_year: byYear,
    };
  }
  writeJson(SOTKA_FILE, {
    source: "THL Sotkanet REST API 1.1",
    retrieved: today(),
    indicators: {
      [SMOKING.indicator]: await indicator(SMOKING.indicator, [SMOKING.previousYear, SMOKING.year]),
      [OCC_HEALTH.indicator]: await indicator(OCC_HEALTH.indicator, [OCC_HEALTH.year]),
    },
  });
}

// ---------- Build ----------

function build() {
  const pop = readJson(POP_FILE);
  const sotka = readJson(SOTKA_FILE);
  const lung = readJson(LUNG_FILE);
  const errors = [];

  // Population: sum municipalities to counties and check against the published county totals.
  const popByHva = {};
  for (const m of pop.municipalities) {
    if (!m.hva) errors.push(`StatFin municipality ${m.code} has no county in the key`);
    const agg = (popByHva[m.hva] ??= { pop_55_80: 0, pop_total: 0 });
    agg.pop_55_80 += m.pop_55_80;
    agg.pop_total += m.pop_total;
  }
  for (const [hva, total] of Object.entries(pop.hva_totals_11ra)) {
    if (popByHva[hva]?.pop_total !== total) errors.push(`${hva}: municipality sum ${popByHva[hva]?.pop_total} differs from StatFin 11ra total ${total}`);
  }
  const sum55 = Object.values(popByHva).reduce((s, v) => s + v.pop_55_80, 0);
  if (sum55 !== pop.national.pop_55_80) errors.push(`55–80 county sum ${sum55} differs from national ${pop.national.pop_55_80}`);

  // Lung cancer: rows by county name, columns by year.
  const lungRows = Object.fromEntries(lung.rows.map(([name, ...values]) => [name, Object.fromEntries(lung.years.map((y, i) => [y, values[i]]))]));
  for (const y of lung.years) {
    const regions = lung.rows.slice(1).reduce((s, r) => s + r[1 + lung.years.indexOf(y)], 0);
    const national = lungRows["Koko maa"][y];
    // A few cases per year have no county of residence, so allow a small gap.
    if (Math.abs(national - regions) > 5) errors.push(`Lung cancer ${y}: county sum ${regions} differs from national ${national}`);
  }

  const smoking = sotka.indicators[SMOKING.indicator];
  const occ = sotka.indicators[OCC_HEALTH.indicator];

  const counties = COUNTIES.map((c) => {
    if (pop.hva_names[c.code] !== c.fullName) errors.push(`${c.code}: StatFin name "${pop.hva_names[c.code]}" differs from "${c.fullName}"`);
    const p = popByHva[c.code];
    const smoke = smoking.by_year[SMOKING.year]?.[c.code];
    const smokePrev = smoking.by_year[SMOKING.previousYear]?.[c.code];
    const occVisits = occ.by_year[OCC_HEALTH.year]?.[c.code];
    const lungByYear = lungRows[c.fullName];
    if (!p) errors.push(`${c.code}: no population`);
    if (smoke === undefined) errors.push(`${c.code}: no smoking value for ${SMOKING.year}`);
    if (occVisits === undefined) errors.push(`${c.code}: no occupational health value for ${OCC_HEALTH.year}`);
    if (!lungByYear) errors.push(`${c.code}: no Cancer Registry row named "${c.fullName}"`);
    const lungValues = LUNG_YEARS.map((y) => lungByYear?.[y]);
    if (lungValues.some((v) => typeof v !== "number")) errors.push(`${c.code}: missing lung cancer years`);
    const lungMean = lungValues.reduce((s, v) => s + v, 0) / LUNG_YEARS.length;

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      population_55_80: {
        value: p?.pop_55_80,
        source_id: "statfin-11re",
        year: POP_YEAR,
        is_estimate: false,
        note: `Residents aged ${AGE_MIN}–${AGE_MAX} on 31 Dec ${POP_YEAR}, both sexes. Municipalities summed to the county with the Statistics Finland 2026 key. The county's total population matches StatFin 11ra.`,
      },
      ever_smoker_share: {
        value: Number((smoke / 100).toFixed(4)),
        source_id: "thl-sotkanet-4404",
        year: SMOKING.year,
        is_estimate: true,
        note: `Proxy: daily smokers among residents aged 20 or over, ${pct(smoke)} (${SMOKING.previousYear}: ${smokePrev === undefined ? "no value" : pct(smokePrev)}), THL Healthy Finland survey. Not the ever-smoker share of 55–80-year-olds: former and occasional smokers are excluded, so the risk group is understated. No regional ever-smoker indicator was found. Survey estimate with sampling error.`,
      },
      lung_cancer_cases_per_year: {
        value: Number(lungMean.toFixed(1)),
        source_id: "syoparekisteri-lung",
        year: LUNG_YEARS.at(-1),
        is_estimate: false,
        note: `Mean of new lung and tracheal cancers (ICD-10 C33–C34), both sexes, ${LUNG_YEARS[0]}–${LUNG_YEARS.at(-1)}: ${lungValues.join(", ")}. County = home municipality in the year of diagnosis.`,
      },
      occupational_health_doctor_visits_per_1000_aged_15_64: {
        value: occVisits,
        source_id: "thl-sotkanet-2371",
        year: OCC_HEALTH.year,
        is_estimate: OCC_HEALTH_GAPS.has(c.code),
        note: `Occupational health doctor visits per 1,000 residents aged 15–64 (THL primary care statistics). Measures use, not coverage: Kela's regional coverage figures were not found.${OCC_HEALTH_GAPS.has(c.code) ? " THL notes gaps in the Helsinki, Vantaa and Kerava data." : ""}`,
      },
      in_ldct_pilot: { value: null, source_id: "mock", note: "Ask mentors which counties are in the screening pilot." },
    };
  });

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  writeJson(OUT_FILE, counties);
  console.log(`Wrote ${counties.length} counties to ${OUT_FILE}`);
}

if (process.argv.includes("--fetch")) {
  await fetchPopulation();
  await fetchSotkanet();
  console.log("Refreshed StatFin and Sotkanet snapshots in src/data/raw/");
}
build();
