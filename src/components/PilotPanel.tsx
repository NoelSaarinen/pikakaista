"use client";

import countiesData from "@/data/counties.json";
import { cancerYieldPerScan, ISC_LDCT, isPilotCounty, LDCT_SC_FI } from "@/lib/pilot";
import { SCENARIOS, simulate } from "@/lib/simulation";
import type { County } from "@/lib/types";
import { More } from "./More";
import { SourceTag } from "./SourceTag";

const counties = countiesData as County[];
const nf = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });
const pct = (share: number, digits = 1) => `${new Intl.NumberFormat("fi-FI", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(share * 100)} %`;

const Source = SourceTag;

/**
 * How the survey complements the national screening pilot ISC-LDCT. Shows the pilot's
 * reach in the pilot areas and the published results of its predecessor LDCT-SC-FI.
 * The predecessor's screening yield is NOT fed into the fast-lane calculation: it comes
 * from asymptomatic volunteers, a different group from symptomatic survey respondents.
 */
export function PilotPanel({ county }: { county: County }) {
  const inPilot = isPilotCounty(county.id);
  const pilotCounties = counties.filter((c) => isPilotCounty(c.id));
  const riskGroupInPilotAreas = pilotCounties.reduce((s, c) => s + simulate(c, SCENARIOS.base).riskGroup, 0);
  const coverage = ISC_LDCT.participants / riskGroupInPilotAreas;
  const ownRiskGroup = simulate(county, SCENARIOS.base).riskGroup;

  const points = [
    { pilot: `Alle ${Math.ceil(coverage * 100)} % riskiryhmästä mahtuu mukaan.`, survey: "Tavoittaa koko riskiryhmän joka vuosi." },
    { pilot: "Ei voi kutsua: tupakointi ei näy rekistereissä.", survey: "Tunnistaa kelpoiset ja voi ohjata pilottiin." },
    { pilot: "Vain nykyiset tupakoitsijat, 50–74 v.", survey: "Myös lopettaneet ja oireiset, samalla ikärajalla 50–74." },
  ];

  return (
    <section className="rounded-lg border-2 border-sky-700 bg-sky-50/60 p-4" aria-label="Kansallinen seulontapilotti">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Miten kysely täydentää kansallista seulontapilottia</h2>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${inPilot ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
          {county.name}: {inPilot ? "pilottialue" : "ei pilottialue"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Kansallinen seulontapilotti {ISC_LDCT.name} 2026: {nf.format(ISC_LDCT.participants)} paikkaa viidellä alueella.<Source id="isc-ldct" />
      </p>

      <table className="mt-3 w-full text-left text-sm">
        <thead className="text-xs text-slate-600">
          <tr>
            <th className="w-1/2 py-1 pr-3 font-medium">Pilotti</th>
            <th className="w-1/2 py-1 font-medium">Kysely täydentää</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.pilot} className="border-t border-sky-100 align-top">
              <td className="py-2 pr-3">{p.pilot}</td>
              <td className="py-2 font-medium text-sky-900">{p.survey}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <More className="mt-3">
      <p>
        Pilotin {nf.format(ISC_LDCT.participants)} paikkaa vs. {nf.format(riskGroupInPilotAreas)} riskiryhmään kuuluvaa {pilotCounties.length} pilottialueella (demon perusskenaario). {county.name}: {nf.format(ownRiskGroup)} riskiryhmään kuuluvaa. Edeltäjätutkimuksessa vain {pct(LDCT_SC_FI.healthcareReferralShare)} tuli terveydenhuollon kautta.<Source id="wichmann-2025" />
      </p>
      <p>
        {ISC_LDCT.name} alkoi 2.2.2026 alueilla {ISC_LDCT.areas.join(", ")}.<Source id="syopajarjestot-2026" /> Se tutkii matala-annos-TT-seulontaa ja tupakoinnin lopettamista. Tuloksia ei ole vielä julkaistu.
        {county.in_ldct_pilot.note && ` ${county.in_ldct_pilot.note}`}
      </p>
      <p>
        <strong>Edeltäjätutkimus {LDCT_SC_FI.name} (Oulu, samat kriteerit):</strong> keuhkosyöpä löytyi {LDCT_SC_FI.cancers}/{LDCT_SC_FI.scans} TT-kuvauksesta ({pct(cancerYieldPerScan)}),
        {" "}{LDCT_SC_FI.stageI}/{LDCT_SC_FI.cancers} vaiheessa I, positiivinen ennustearvo {pct(LDCT_SC_FI.ppv, 0)}.<Source id="wichmann-2025" /> Seulonta löytää syövät varhain; kysely ja pikakaista
        nopeuttavat oireisten polkua. Ne täydentävät toisiaan eivätkä korvaa toisiaan.
      </p>
      <p className="text-xs text-slate-500">
        Kattavuusvertailu on suuntaa antava, koska pilotin ja demon riskiryhmän kriteerit eroavat. Edeltäjän löydösosuutta ei käytetä pikakaistan laskelmassa, koska se koskee oireettomia vapaaehtoisia.
      </p>
      </More>
    </section>
  );
}
