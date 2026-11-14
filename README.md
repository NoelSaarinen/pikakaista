# Junction 2026

JYNKKARIT JUNCTION’s private development workspace and shared knowledge base for the 13–15 November hackathon at Hype Areena, Espoo. We’re preparing for challenge selection. The project and stack are open.

**First team task** [TODO before hacking](docs/TODO_BEFORE_HACKING.md) covers team setup, challenge briefs, hardware, software and submission checks.

## Run the demo

Lung cancer fast-lane demo for AstraZeneca's *Equal Care Across Finland*. It uses synthetic data only. It needs Node.js 20 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The demo has three views:

| View | Path | What it shows |
| --- | --- | --- |
| Decision-maker | `/county` | The Two Doors gap, the fast lane and the benefit analysis with sources and adjustable assumptions, plus an AI brief. A toggle switches between **Kaksi ovea** (health-centre fast lane only) and **Kaksi ovea + kysely** (the same fast lane plus the risk-group survey). |
| Survey | `/survey` | The risk-group survey, or the same questions as a nurse's checklist at a health-centre contact. |
| Physician | `/clinician` | Rules put alarm signs on the list, AI summarizes each case and the physician decides. |

AI features use the Claude API. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. Never commit the key. Without a key, the demo uses deterministic template text, so it still runs offline.

| Command | Purpose |
| --- | --- |
| `npm test` | Unit tests for the rules and the benefit analysis |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm run generate:synthetic` | Regenerate the 200 synthetic survey answers in `src/data/synthetic/` |

Where things live:
- **Rules:** [src/lib/rules.ts](src/lib/rules.ts). Alarm thresholds are team assumptions and need medical review.
- **Simulation:** [src/lib/simulation.ts](src/lib/simulation.ts). Every parameter has a source or is labelled as an assumption.
- **Data:** [src/data/counties.json](src/data/counties.json). County figures are `mock` placeholders until they are replaced with public data. Sources are in [src/data/sources.json](src/data/sources.json).
- **AI:** [src/lib/llm.ts](src/lib/llm.ts), [src/lib/summarize.ts](src/lib/summarize.ts) and [src/lib/brief.ts](src/lib/brief.ts). Code computes every number. AI only writes text.

## Get started

1. Accept the GitHub collaborator invitation. Owners can send one from **Settings → Collaborators → Add people**. [GitHub instructions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)
2. Clone the repository using your GitHub credentials.

   ```sh
   git clone https://github.com/patw1kkkk/junction-2026.git
   cd junction-2026
   ```

3. In Codex desktop, open the cloned `junction-2026` folder as a local project. Start with “Read AGENTS.md and docs/STATUS.md, then help me with [task].” [OpenAI desktop help](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

## Shared context

| Document | Use it for |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Codex instructions and documentation workflow |
| [Challenges](docs/CHALLENGES.md) | Verified briefs, submission rules and missing details |
| [Software](docs/SOFTWARE.md) · [Hardware](docs/HARDWARE.md) | Tooling, lab equipment and access checks |
| [Resources](docs/RESOURCES.md) | APIs, datasets, workshops, support and official links |
| [Team](docs/TEAM.md) | Roles, availability and equipment each teammate can use |
| [Ideas](docs/IDEAS.md) · [Project](docs/PROJECT.md) | Shortlist, selected MVP, implementation and demo |
| [Status](docs/STATUS.md) · [Decisions](docs/DECISIONS.md) | Priorities, deadlines, progress and engineering rationale |

## Work together

- Before starting a new task, switch to `main` and run `git pull --ff-only`. Codex reads the updated local files when starting relevant tasks. Each teammate pulls again after changes land on GitHub.
- Keep `main` usable. For substantial changes, branch from current `main` with `git switch -c feature/short-name`, push with `git push -u origin HEAD`, and open a pull request. Use pull requests when work overlaps. Tell teammates which shared files you’re editing and keep changes focused.
- For quick docs-only edits, commit directly to `main` after syncing if nobody is editing the same files. Use descriptive commits such as `docs: verify hardware lab printer profile`. Add a source and verification date for external facts, and commit and push knowledge-base updates for the team.
- Once a project is selected, define one end-to-end demo in [PROJECT.md](docs/PROJECT.md) and record the stack decision. Put application code in [src/](src/), CAD in [hardware/cad/](hardware/cad/), firmware in [hardware/firmware/](hardware/firmware/) and demo media in [assets/](assets/). Add run and build commands when there’s code to run.
- Keep secrets in local environment variables or the provider’s secret store. Before submission, confirm how to share the MIT-licensed deliverable and which links reviewers need. [Submission checklist](docs/PROJECT.md)
