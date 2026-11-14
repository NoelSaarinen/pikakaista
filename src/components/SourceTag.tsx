import { allSources } from "@/lib/regional";

// Short, readable names for source chips. The full title is in the tooltip and the
// chip links to the source, so transparency stays one click away.
const SHORT: Record<string, string> = {
  strategy: "Syöpästrategia",
  roadmap: "Tiekartta",
  "filha-2026": "Keuhkosyöpäohjelma",
  "uh-acta-2025": "Khalife 2025",
  "jensen-2017": "Jensen 2017",
  guldbrandt: "Guldbrandt",
  "pfizer-2025": "Pfizer-kysely 2025",
  "statfin-11re": "Tilastokeskus",
  "statfin-11rl": "Tilastokeskus",
  "thl-sotkanet-4404": "THL Sotkanet",
  "thl-sotkanet-2371": "THL Sotkanet",
  "syoparekisteri-lung": "Syöpärekisteri",
  "fcr-mortality": "Syöpärekisteri",
  "fcr-survival": "Syöpärekisteri",
  "fcr-quality-lung-2026": "Keuhkosyöpäraportti",
  "kuitunen-2026": "Kuitunen 2026",
  "pirha-hoitopolku": "Pirkanmaan hoitopolku",
  "mattila-2025": "Mattila 2025",
  "thl-tupakka-2023": "THL tupakkatilasto",
  "ylst-2022": "Yorkshire 2022",
  "ylst-2024": "Yorkshire 2026",
  "wagland-2016": "Wagland 2016",
  "wichmann-2025": "Oulu 2025",
  "latti-2018": "Lätti 2018",
  "isc-ldct": "ISC-LDCT",
  "thl-yksikkokustannukset": "THL yksikkökustannukset",
};

export function sourceLabel(id: string): string {
  if (SHORT[id]) return SHORT[id];
  const title = allSources.find((x) => x.id === id)?.title ?? id;
  return title.split(/[:.(]/)[0].trim().slice(0, 28);
}

export function SourceTag({ id }: { id: string }) {
  if (id === "assumption" || id === "mock") {
    return (
      <span className={`ml-1 rounded px-1 text-xs font-medium ${id === "mock" ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-700"}`}>
        {id === "mock" ? "paikkamerkki" : "oletus"}
      </span>
    );
  }
  const s = allSources.find((x) => x.id === id);
  const label = sourceLabel(id);
  return s?.url ? (
    <a href={s.url} target="_blank" rel="noreferrer" title={s.title} className="ml-1 whitespace-nowrap rounded bg-sky-100 px-1 text-xs font-medium text-sky-800 hover:bg-sky-200">
      {label}
    </a>
  ) : (
    <span title={s?.title} className="ml-1 whitespace-nowrap rounded bg-sky-100 px-1 text-xs font-medium text-sky-800">
      {label}
    </span>
  );
}
