import Link from "next/link";

const VIEWS = [
  { href: "/county", title: "1. Päättäjä", text: "Alueen keuhkosyöpäaukko, toimenpide ja hyötylaskelma lähteineen. Tekoäly kirjoittaa kahden minuutin tiivistelmän." },
  { href: "/survey", title: "2. Kysely", text: "Kahden minuutin oirekysely, joka lähetetään riskiryhmälle tekstiviestillä." },
  { href: "/clinician", title: "3. Lääkäri", text: "Säännöt nostavat hälytysmerkit listalle, tekoäly tiivistää ja lääkäri päättää jatkosta." },
  { href: "/pathway", title: "4. Seuranta", text: "Jokaisen henkilön sitoutuminen kyselyyn ja käynteihin sekä nykyinen vaihe hoitopolulla. Hoitaja näkee, kenelle soittaa." },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Löydetään ne, jotka eivät tule itse</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Hyvinvointialue lähettää riskiryhmälle vuosittain lyhyen oirekyselyn. Hälytysmerkit ohjautuvat lääkärin hyväksymälle pikakaistalle, ja TT-kuvaukseen pääsee päivissä viikkojen sijaan.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {VIEWS.map((v) => (
          <Link key={v.href} href={v.href} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-sky-400">
            <h2 className="text-lg font-semibold">{v.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{v.text}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-slate-500">Demo käyttää vain synteettistä dataa. Hälytyskriteerit ovat tiimin oletuksia, jotka tarkistetaan lääketieteellisesti.</p>
    </div>
  );
}
