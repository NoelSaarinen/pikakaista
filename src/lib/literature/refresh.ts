// Pulls the newest articles from PubMed, skips every article already used (by PMID,
// DOI or title) and classifies only the new ones.

import { extractAll } from "./extract";
import { onlyNew, type Evidence } from "./evidence";
import { fetchArticles, searchPmids } from "./pubmed";

export interface RefreshResult {
  /** PMIDs the search returned. */
  checked: number;
  added: Evidence[];
  /** Articles skipped because they were already used (same PMID, DOI or title). */
  duplicates: number;
  /** New articles left for the next refresh because of the batch limit. */
  remaining: number;
}

export async function fetchNewEvidence(existing: Evidence[], opts: { search?: number; maxNew?: number; now?: Date } = {}): Promise<RefreshResult> {
  const now = opts.now ?? new Date();
  const pmids = await searchPmids(opts.search ?? 60);
  const known = new Set(existing.map((e) => e.pmid));
  const allUnseen = pmids.filter((id) => !known.has(id));
  const unseen = allUnseen.slice(0, opts.maxNew ?? 20);
  const raw = await fetchArticles(unseen);
  // A second check by DOI and title catches the same paper under another PMID.
  const fresh = onlyNew(existing, raw);
  const added = await extractAll(fresh, now);
  return {
    checked: pmids.length,
    added,
    duplicates: pmids.length - allUnseen.length + (raw.length - fresh.length),
    remaining: allUnseen.length - unseen.length,
  };
}
