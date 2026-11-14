"use client";

import countiesData from "@/data/counties.json";
import { allSources } from "@/lib/regional";
import { cancerYieldPerScan, ISC_LDCT, isPilotCounty, LDCT_SC_FI, pilotAreaPopulation } from "@/lib/pilot";
import { SCENARIOS, simulate } from "@/lib/simulation";
import type { County } from "@/lib/types";

const counties = countiesData as County[];
const nf = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });
const pct = (share: number, digits = 1) => `${new Intl.NumberFormat("fi-FI", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(share * 100)} %`;

function Source({ id }: { id: string }) {
  const s = allSources.find((x) => x.id === id);
  return (
    <a href={s?.url} target="_blank" rel="noreferrer" title={s?.title} className="ml-1 rounded bg-sky-100 px-1 text-xs font-medium text-sky-800">
      {id}
    </a>
  );
}

/**
 * The national screening pilot ISC-LDCT for the selected county: is the county in it,
 * how much of the risk group its 1,200 places cover, and the published results of its
 * predecessor LDCT-SC-FI. ISC-LDCT has not published results.
 */
export function PilotPanel({ county, onUseYield, yieldInUse }: { county: County; onUseYield: () => void; yieldInUse: boolean }) {
  const inPilot = isPilotCounty(county.id);
  const pilotCounties = counties.filter((c) => isPilotCounty(c.id));
  const riskGroupInPilotAreas = pilotCounties.reduce((s, c) => s + simulate(c, SCENARIOS.base).riskGroup, 0);
  const coverage = ISC_LDCT.participants / riskGroupInPilotAreas;
  const perThousand = (ISC_LDCT.participants / pilotAreaPopulation()) * 1000;
  const ownRiskGroup = simulate(county, SCENARIOS.base).riskGroup;

  return (
    <section className="rounded-lg border border-violet-200 bg-violet-50/40 p-4" aria-label="Kansallinen seulontapilotti">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Kansallinen keuhkosyövän seulontapilotti {ISC_LDCT.name}<Source id="isc-ldct" /></h2>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${inPilot ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
          {county.name}: {inPilot ? "pilottialue" : "ei pilottialue"}
        </span>
      </div>
      <p className="mt-1 text-sm">
        Alkoi 2.2.2026 alueilla {ISC_LDCT.areas.join(", ")}.<Source id="syopajarjestot-2026" /> {ISC_LDCT.participants.toLocaleString("fi-FI")} paikkaa 50–74-vuotiaille nykyisille
        tupakoitsijoille (vähintään 15 savuketta päivässä 25 vuotta tai 10 savuketta 30 vuotta). Kolme arvottua ryhmää: {ISC_LDCT.arms.join("; ")}. <strong>Tuloksia ei ole vielä julkaistu.</strong>
      </p>
      {county.in_ldct_pilot.note && <p className="mt-1 text-xs text-slate-600">{county.in_ldct_pilot.note}</p>}

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-violet-200 bg-white p-3">
          <p className="text-xs text-slate-500">Pilotin paikat pilottialueiden riskiryhmästä</p>
          <p className="text-2xl font-bold">{pct(coverage)}</p>
          <p className="text-xs text-slate-500">
            {nf.format(ISC_LDCT.participants)} paikkaa / {nf.format(riskGroupInPilotAreas)} demon riskiryhmään kuuluvaa (perusskenaario, {pilotCounties.length} aluetta). Noin {new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 }).format(perThousand)} paikkaa 1 000:ta 55–80-vuotiasta kohti.
          </p>
        </div>
        <div className="rounded border border-violet-200 bg-white p-3">
          <p className="text-xs text-slate-500">{inPilot ? "Alueen riskiryhmä, josta valtaosa jää pilotin ulkopuolelle" : "Alueen riskiryhmä ilman pilottia"}</p>
          <p className="text-2xl font-bold">{nf.format(ownRiskGroup)}</p>
          <p className="text-xs text-slate-500">Demon riskiryhmä (55–80 v, joskus tupakoineet, vähintään 20 askivuotta) on laajempi kuin pilotin: myös lopettaneet ja 75–80-vuotiaat.</p>
        </div>
        <div className="rounded border border-violet-200 bg-white p-3">
          <p className="text-xs text-slate-500">Edeltäjätutkimus {LDCT_SC_FI.name} (Oulu): löydös TT-kuvausta kohti</p>
          <p className="text-2xl font-bold">{pct(cancerYieldPerScan)}</p>
          <p className="text-xs text-slate-500">
            {LDCT_SC_FI.cancers}/{LDCT_SC_FI.scans} kuvausta (1. kierros {LDCT_SC_FI.round1.cancers}/{LDCT_SC_FI.round1.scans}, 2. kierros {LDCT_SC_FI.round2.cancers}/{LDCT_SC_FI.round2.scans}).<Source id="wichmann-2025" />
          </p>
          <button type="button" onClick={onUseYield} aria-pressed={yieldInUse} className={`mt-2 rounded border border-violet-300 px-2 py-1 text-xs font-medium ${yieldInUse ? "bg-violet-700 text-white" : "text-violet-900"}`}>
            {yieldInUse ? "Käytössä kaikissa skenaarioissa · palauta" : "Käytä hyötylaskelmassa (kaikki skenaariot)"}
          </button>
        </div>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        <li>Edeltäjässä {LDCT_SC_FI.stageI}/{LDCT_SC_FI.cancers} syövistä löytyi vaiheessa I ja positiivinen ennustearvo oli {pct(LDCT_SC_FI.ppv, 0)}.<Source id="wichmann-2025" /></li>
        <li>Vain {pct(LDCT_SC_FI.healthcareReferralShare)} osallistujista tuli terveydenhuollon lähetteellä, {pct(LDCT_SC_FI.newspaperShare)} lehti-ilmoituksilla. Pilotti ei voi kutsua riskiryhmää, koska tupakointihistoria ei näy rekistereissä: oirekysely tavoittaa juuri tämän ryhmän.</li>
        <li>Tupakoinnin lopettaneita vuoden kohdalla {pct(LDCT_SC_FI.quitRateApp)} sovellusryhmässä ja {pct(LDCT_SC_FI.quitRateWritten)} kirjallisen materiaalin ryhmässä (ero ei merkitsevä).</li>
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Edeltäjän luvut koskevat oireettomia vapaaehtoisia, joten oireisten pikakaistalla löydösosuus on todennäköisesti suurempi. Kattavuusvertailu on suuntaa antava: pilotin ja demon riskiryhmän kriteerit eroavat.
      </p>
    </section>
  );
}
