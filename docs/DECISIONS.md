# Decision log

Add entries in chronological order. Link evidence, and link any later entry that supersedes a decision.

## 2026-11-13 — Start with a private workspace and shared docs

- **Decision** Keep `main` as the shared stable branch. Track event facts and team constraints in versioned Markdown. Start with empty code, CAD, firmware and asset directories.
- **Rationale** The team can begin comparing challenges and syncing verified information while project and technology selection are still open.
- **Evidence** [README](../README.md) and [working instructions](../AGENTS.md).

## 2026-11-13 — Proposed MVP: Kaksi ovea AI analyst with a lung cancer fast lane

- **Status** Proposed by Noel. Team confirmation pending.
- **Context and options considered** AstraZeneca *Equal Care Across Finland* versus Aalto *Beyond the Clinic* ([HAASTEVERTAILU.md](HAASTEVERTAILU.md)). Within AstraZeneca: Two Doors, Pilot Map, Symptom Clock, Distance Tax and Nordic Gap ([IDEAS.md](IDEAS.md)). Wider lung cancer screening was considered and rejected as the main recommendation. It is only being evaluated nationally, a county cannot start it now, and per the team's notes it belongs to Strategy Goal 2.
- **Rationale and trade-offs** The idea locates the gap at a pathway stage a county can change now (primary-care contact → imaging) and fits Roadmap action 2.5.2. The AI analyst meets the AI requirement while code computes all numbers. The design drops a nurse-only triage gate, because 40–60% of Finnish patients see a nurse first while other Nordic countries start with a physician (University of Helsinki, 7 Nov 2025). Trade-offs: route-to-diagnosis data is unverified, the two-times delay figure comes from a single unpublished study, and imaging capacity may be the real bottleneck. Fallback: Pilot Map.
- **Evidence and follow-up** [PROJECT.md](PROJECT.md) lists sources and open questions. Record Kaisa Kaitila's answer on imaging capacity, then confirm or supersede this entry.

## Entry template

- **Date / decision**
- **Status** (proposed / accepted / superseded)
- **Context and options considered**
- **Rationale and trade-offs**
- **Evidence and follow-up**
