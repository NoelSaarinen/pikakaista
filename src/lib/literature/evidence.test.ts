import { describe, expect, it } from "vitest";
import {
  computeWeight,
  designFromText,
  keywordEvidence,
  numberAppearsIn,
  onlyNew,
  summarizeFactorEvidence,
  sampleSizeFromText,
  topicFromText,
  type Evidence,
} from "./evidence";
import { parsePubmedXml, type RawArticle } from "./pubmed";

const NOW = new Date("2026-11-14T12:00:00Z");

function raw(overrides: Partial<RawArticle> = {}): RawArticle {
  return {
    pmid: "1",
    doi: "10.1/a",
    title: "Risk of lung cancer among ever-smokers",
    journal: "JAMA",
    year: 2026,
    month: 10,
    publicationTypes: ["Journal Article"],
    abstract: "METHODS: Prospective cohort of 12,000 participants. RESULTS: Pack-years were associated with higher lung cancer incidence (HR 2.1, 95% CI 1.6-2.8).",
    ...overrides,
  };
}

function evidence(overrides: Partial<Evidence>): Evidence {
  return { ...keywordEvidence(raw(), NOW), ...overrides };
}

describe("PubMed XML", () => {
  it("reads PMID, DOI, journal, date, types and a labelled abstract", () => {
    const xml = `<PubmedArticleSet><PubmedArticle><PMID Version="1">123</PMID><Journal><JournalIssue><PubDate><Year>2026</Year><Month>Nov</Month></PubDate></JournalIssue><ISOAbbreviation>Lancet</ISOAbbreviation></Journal><ArticleTitle>A &amp; B <i>trial</i></ArticleTitle><Abstract><AbstractText Label="RESULTS">Among 1,234 patients.</AbstractText></Abstract><PublicationType UI="x">Randomized Controlled Trial</PublicationType><ArticleId IdType="doi">10.1/ABC</ArticleId></PubmedArticle></PubmedArticleSet>`;
    const [a] = parsePubmedXml(xml);
    expect(a).toMatchObject({ pmid: "123", doi: "10.1/abc", title: "A & B trial", journal: "Lancet", year: 2026, month: 11 });
    expect(a.publicationTypes).toEqual(["Randomized Controlled Trial"]);
    expect(a.abstract).toBe("RESULTS: Among 1,234 patients.");
  });
});

describe("design and size", () => {
  it("trusts PubMed publication types first and excludes editorials", () => {
    expect(designFromText(raw({ publicationTypes: ["Meta-Analysis"] }))).toBe("meta_analysis");
    expect(designFromText(raw({ publicationTypes: ["Editorial"] }))).toBe("excluded");
  });
  it("treats a post-hoc analysis of a trial as cohort evidence, not an RCT", () => {
    expect(designFromText(raw({ abstract: "A post-hoc analysis of the randomized controlled trial NLST." }))).toBe("prospective_cohort");
  });
  it("finds the largest participant count", () => {
    expect(sampleSizeFromText("Among 31,560 continuous smokers, 7,197 died; 120 patients had cancer.")).toBe(31560);
    expect(sampleSizeFromText("No numbers here.")).toBeNull();
  });
  it("checks that a reported sample size appears in the abstract", () => {
    expect(numberAppearsIn(31560, "Among 31,560 smokers")).toBe(true);
    expect(numberAppearsIn(50000, "Among 31,560 smokers")).toBe(false);
  });
});

describe("topic", () => {
  it("does not let treatment trials or other cancers count as risk evidence", () => {
    expect(topicFromText("Segmentectomy versus lobectomy in NSCLC", "lower risk of recurrence")).toBe("treatment");
    expect(topicFromText("Selpercatinib side effects", "symptoms in 113 patients")).toBe("treatment");
    expect(topicFromText("Esophageal cancer screening with CT", "lung cancer screening low-dose CT")).toBe("other");
  });
  it("recognises risk, symptom and screening papers", () => {
    expect(topicFromText("Risk prediction model for lung cancer", "")).toBe("risk_factors");
    expect(topicFromText("Haemoptysis before lung cancer diagnosis", "")).toBe("symptoms");
    expect(topicFromText("Uptake of lung cancer screening", "")).toBe("screening");
  });
});

describe("weight", () => {
  it("gives treatment papers zero weight and ranks an RCT above a review", () => {
    expect(computeWeight("rct", 1000, 2026, 10, "treatment", NOW).weight).toBe(0);
    const rct = computeWeight("rct", 1000, 2026, 10, "risk_factors", NOW).weight;
    const review = computeWeight("narrative_review", 1000, 2026, 10, "risk_factors", NOW).weight;
    expect(rct).toBeGreaterThan(review);
  });
  it("weights newer and larger studies higher", () => {
    expect(computeWeight("rct", 100_000, 2026, 10, "risk_factors", NOW).weight).toBeGreaterThan(computeWeight("rct", 100, 2026, 10, "risk_factors", NOW).weight);
    expect(computeWeight("rct", 1000, 2026, 10, "risk_factors", NOW).weight).toBeGreaterThan(computeWeight("rct", 1000, 2023, 1, "risk_factors", NOW).weight);
  });
  it("picks up a factor and its effect estimate only from a risk sentence", () => {
    const e = keywordEvidence(raw(), NOW);
    expect(e.factors).toEqual([{ factor: "smoking", direction: 1, effect: expect.stringContaining("HR 2.1") }]);
  });
});

describe("duplicates", () => {
  it("skips articles already used by PMID, DOI or title, and duplicates inside a batch", () => {
    const existing = [evidence({ pmid: "1", doi: "10.1/a", title: "Same title" })];
    const incoming = [
      raw({ pmid: "1", doi: null, title: "x" }),
      raw({ pmid: "2", doi: "10.1/a", title: "y" }),
      raw({ pmid: "3", doi: null, title: "Same  Title!" }),
      raw({ pmid: "4", doi: "10.1/new", title: "New" }),
      raw({ pmid: "4", doi: "10.1/new", title: "New" }),
    ];
    expect(onlyNew(existing, incoming).map((a) => a.pmid)).toEqual(["4"]);
  });
  it("counts several papers from the same trial once, keeping the strongest", () => {
    const a = evidence({ pmid: "a", dataset: "NLST", weight: 0.6 });
    const b = evidence({ pmid: "b", dataset: "NLST", weight: 0.4 });
    const smoking = summarizeFactorEvidence([a, b]).find((x) => x.factor === "smoking")!;
    expect(smoking.support).toBe(0.6);
    expect(smoking.pmids).toEqual(["a"]);
  });
  it("ignores treatment papers (weight 0) in the factor summary", () => {
    const smoking = summarizeFactorEvidence([evidence({ pmid: "t", weight: 0 })]).find((x) => x.factor === "smoking")!;
    expect(smoking.pmids).toEqual([]);
  });
});
