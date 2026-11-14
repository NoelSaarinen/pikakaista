// Fetches the newest lung cancer articles from seven journals through NCBI PubMed
// E-utilities (free, no key). PubMed indexes every journal the team named, so one
// source covers them all, with publication types and abstracts.
// API docs: https://www.ncbi.nlm.nih.gov/books/NBK25499/ (checked 2026-11-14).

export const JOURNALS = [
  { abbr: "Lancet", name: "The Lancet" },
  { abbr: "N Engl J Med", name: "New England Journal of Medicine" },
  { abbr: "JAMA", name: "JAMA" },
  { abbr: "BMJ", name: "BMJ" },
  { abbr: "J Clin Oncol", name: "Journal of Clinical Oncology" },
  { abbr: "J Thorac Oncol", name: "Journal of Thoracic Oncology" },
  { abbr: "Nat Med", name: "Nature Medicine" },
] as const;

/** Lung cancer articles in the seven journals that may touch risk, symptoms or early detection. */
export const PUBMED_QUERY =
  `(${JOURNALS.map((j) => `"${j.abbr}"[ta]`).join(" OR ")}) AND ("lung neoplasms"[mh] OR "lung cancer"[tiab]) ` +
  `AND (screening[tiab] OR "early detection"[tiab] OR "early diagnosis"[tiab] OR risk[tiab] OR symptom*[tiab] OR "primary care"[tiab] OR smoking[tiab]) ` +
  `AND hasabstract`;

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const TOOL = "junction-fastlane-demo";

export interface RawArticle {
  pmid: string;
  doi: string | null;
  title: string;
  journal: string;
  year: number;
  month: number;
  publicationTypes: string[];
  abstract: string;
}

/** Newest PMIDs first. */
export async function searchPmids(limit: number): Promise<string[]> {
  const params = new URLSearchParams({ db: "pubmed", term: PUBMED_QUERY, retmax: String(limit), sort: "pub_date", retmode: "json", tool: TOOL });
  const res = await fetch(`${BASE}/esearch.fcgi?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);
  const json = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist ?? [];
}

export async function fetchArticles(pmids: string[]): Promise<RawArticle[]> {
  if (pmids.length === 0) return [];
  const params = new URLSearchParams({ db: "pubmed", id: pmids.join(","), retmode: "xml", tool: TOOL });
  const res = await fetch(`${BASE}/efetch.fcgi?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);
  return parsePubmedXml(await res.text());
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

function decode(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function first(xml: string, re: RegExp): string | null {
  const m = xml.match(re);
  return m ? decode(m[1]) : null;
}

/** Parses efetch XML. Regex is enough for the few fields we need and avoids a parser dependency. */
export function parsePubmedXml(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];
  for (const block of xml.split("<PubmedArticle>").slice(1)) {
    const pmid = first(block, /<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmid) continue;
    const pubDate = block.match(/<PubDate>([\s\S]*?)<\/PubDate>/)?.[1] ?? "";
    const year = Number(first(pubDate, /<Year>(\d{4})<\/Year>/) ?? first(pubDate, /<MedlineDate>(\d{4})/) ?? 0);
    const monthRaw = (first(pubDate, /<Month>([^<]+)<\/Month>/) ?? "1").toLowerCase();
    const month = Number(monthRaw) || MONTHS[monthRaw.slice(0, 3)] || 1;
    const abstract = [...block.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)]
      .map((m) => {
        const label = m[1].match(/Label="([^"]+)"/)?.[1];
        return (label ? `${label}: ` : "") + decode(m[2]);
      })
      .join(" ");
    articles.push({
      pmid,
      doi: first(block, /<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)?.toLowerCase() ?? null,
      title: first(block, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/) ?? "",
      journal: first(block, /<ISOAbbreviation>([^<]+)<\/ISOAbbreviation>/) ?? "",
      year,
      month,
      publicationTypes: [...block.matchAll(/<PublicationType[^>]*>([^<]+)<\/PublicationType>/g)].map((m) => decode(m[1])),
      abstract,
    });
  }
  return articles;
}
