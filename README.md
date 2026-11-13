# Junction 2026

JYNKKARIT JUNCTION’s private development workspace and shared knowledge base for the 13–15 November hackathon at Hype Areena, Espoo. We’re preparing for challenge selection. The project and stack are open.

**First team task** [TODO before hacking](docs/TODO_BEFORE_HACKING.md) covers team setup, challenge briefs, hardware, software and submission checks.

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
