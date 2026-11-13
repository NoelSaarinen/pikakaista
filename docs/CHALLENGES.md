# Challenges

Public sources and the six participant briefs below were checked on 2026-11-13. Use the participant portal and sponsor briefings to resolve remaining gaps.

## Event-wide rules

- Teams are 1–4 people. Submit through the Junction Platform. See [STATUS.md](STATUS.md) for the preliminary and final deadlines.
- Challenge partners choose track winners using their own criteria. In-person peer review selects five projects for the live overall final. The grand jury chooses the overall winner.
- The organizer advertises €100,000 in event-wide prizes. The FAQ says teams retain ownership and submissions are open-sourced under MIT. Confirm required repository visibility, links, demo/video format, and preliminary and final form fields in the participant portal.
- Public tracks are Hardware (Arduino), Healthcare, AI Infrastructure (Verda), FinTech, Agentic AI, and Data. Cross-track tech challenges can be entered alongside a track. Hardware and AI Infrastructure track ownership alone gives no specific brief for the track.
- **Sources** [Junction 2026 schedule, tracks, judging and FAQ](https://2026.hackjunction.com/) · [Junction Platform](https://hackjunction.app/hackathons/junction-2026)

## Verified participant briefs

Checked against the [Junction participant portal](https://hackjunction.app/participate/45/challenges) on 2026-11-13. Links may require participant access. Challenge-specific submission form fields still need verification.

| Challenge / sponsor and track | Goal and demo | Key requirements | Judging and prizes | Official brief |
| --- | --- | --- | --- | --- |
| **Equal Care Across Finland** · AstraZeneca · Healthcare | Build a working AI demo that detects regional differences in cancer care, locates where they arise (detection, referral, diagnosis or treatment start), and proposes concrete, evidence-based improvements. | Cover at least one indicator under Goal 3 of Finland’s national cancer strategy. Use public aggregate data and/or mentor insights and cite evidence for each claim. | Actionability 30%, insight 25%, data quality and transparency 20%, execution 15%, clarity 10%. Prizes €1,000 / €750 / €250. | [Participant brief](https://hackjunction.app/participate/45/challenges/344) · [Detailed brief](#astrazeneca--equal-care-across-finland) |
| **Trusted Trade Agents** · Valio Aimo · Agentic AI | Prototype an interface that lets an external purchasing agent look up products, prices and availability, then place a fixed-price order or route it to a human for approval. | Mock the current webshop and backend with synthetic data. Define agent permissions and use open, documented interfaces. Substitutions, delivery and sustainability comparisons are optional. | End-to-end demo 30%, user need 20%, autonomy and controls 20%, exception handling 15%, openness and path to production 15%. Prizes €4,000 / €2,000 / €1,000. | [Participant brief](https://hackjunction.app/participate/45/challenges/327) |
| **Spread** · Bahn Express · Agentic AI | Run a simulated Finnish car transport company for a week. Quote dealers, set driver fees and maximize gross margin with at least 90% of deliveries on time. | Ranking opens Fri 19:30. Final registration closes Sun 07:30 and the final simulation begins Sun 08:00. The [Spread portal](https://spread.bahnexpress.com/join) offers rules, API docs and TypeScript/Python kits. | Top 10 by qualifying margin present 5–10 slides or a short video. Jury then judges clarity, elegance, creativity and robustness. Prizes €2,000 / €1,000 / €500. | [Participant brief](https://hackjunction.app/participate/45/challenges/349) |
| **Earned Trust in AI Code** · Tieto · Agentic AI | Design an AI review concept and demo it on one agent-written change tied to a requirement ID. Show findings, decisions deferred by AI, and the evidence a named human uses to approve the change. | Use synthetic or cleared samples. Deliver a concept card, live walkthrough, lessons and decision log, and a demo video or presentation. | Clarity 30%, practicality 25%, measurement 25%, evidence 20%. Prizes €2,000 / €1,000 / €500. | [Participant brief](https://hackjunction.app/participate/45/challenges/351) |
| **Wikipedia Through Time.** · MariaDB · Data | Build a Wikipedia tool around MariaDB. Use native vector search for RAG with source-cited answers, system-versioned tables for exploring how articles changed over time, or both. | Use Wikipedia data. Show a useful workflow for readers or editors and an implementation that scales across the provided datasets. | MariaDB use, implementation, usefulness, design and demo, and originality each count for 20%. Prizes €1,000 plus €1,000 UpCloud credits and MariaDB certification / €500 / €250. | [Participant brief](https://hackjunction.app/participate/45/challenges/307) |
| **Rethinking Recruitment** · City of Espoo · Data | Prototype how companies and job seekers can find more relevant matches before, during or after Espoo recruitment events, using clearer signals about real skills and hiring needs. | Use synthetic data, minimize personal data processing and show how privacy and fairness would be protected. Keep people involved in profiling and decisions about individuals. Technology is open. | Impact and relevance 45%, innovation and UX 35%, responsible and feasible execution 20%. Prizes €1,500 / €1,000 / €500. | [Participant brief](https://hackjunction.app/participate/45/challenges/319) |

### AstraZeneca — Equal Care Across Finland

Source: [official participant brief](https://hackjunction.app/participate/45/challenges/344), cross-checked against the supplied full brief on 2026-11-13. Main Challenge in the Healthcare track.

#### Objective and minimum requirements

Build an AI-powered decision-support solution for equitable and effective cancer care across Finland. Identify a meaningful difference in access or outcomes, show where it emerges along the care pathway, and recommend a concrete, evidence-based improvement that can be implemented nationally or locally, for example by a health centre or wellbeing services county.

1. **Find and locate the gap.** Relevant stages include early detection, referral from primary to specialist care, diagnosis, and treatment initiation. The sponsor highlights late detection, slow or fragmented referrals, and delays between diagnosis and treatment as starting points.
2. **Cover at least one indicator tied to Goal 3** of Finland’s national cancer strategy. Record the exact indicator definition and the source that supports the connection.
3. **Use reliable evidence.** Use public aggregate data and/or insights from AstraZeneca mentors. Cite the evidence supporting each substantive claim and make limitations visible. The brief specifies aggregate public data only and says no patient-level or personal data will be provided or required. Limited data is part of the challenge.
4. **Recommend an implementable action.** Recommendations are the sponsor’s top priority. Make the proposed change concrete enough for its intended decision-maker to act on.
5. **Submit a working demo.** Slides alone are insufficient. A non-technical decision-maker should understand the finding and proposed action within two minutes. Suggested formats include an AI analyst, monitoring dashboard with recommendations, early-warning tool or intervention simulation.

#### Evidence and source material

| Resource | Use |
| --- | --- |
| [National Cancer Strategy 2026–2035 (Finnish PDF)](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_2026_2035_FINAL.pdf) | Sponsor background pack and starting point for Goal 3. |
| [Implementation roadmap 2026–2031 (Finnish PDF)](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf) | Implementation context for actions, responsibilities and timelines. |
| [Curated source list (PDF)](https://files.hackjunction.app/resources/Sy%C3%B6p%C3%A4strategiat%20ja%20sy%C3%B6p%C3%A4data_linkkikokoelma.pdf) | Sponsor collection of reports, statistics and articles. |
| Finnish Cancer Registry and THL regional health indicators | Public aggregate data sources named by the sponsor. Confirm which Goal 3 indicator has usable data, its years, geographic coverage and comparability before making claims. |
| AstraZeneca mentors | Oncology, diagnostics and medical affairs context. Record insights and distinguish them from measured data. |

The brief does not establish a specific open regional dataset for referral or treatment-start intervals. Exact indicator selection, data access and coverage, and challenge-specific submission fields remain open. See [event deadlines](STATUS.md#event-deadlines) and the [submission checklist](PROJECT.md#submission-checklist).

#### Briefing and mentors (EET)

- **Fri 13 Nov, 20:00:** AstraZeneca booth briefing. Mentors available from 18:00: Hanna Rusila (Marketing), Hanna Toivola (Diagnostics), Kaisa Kaitila (Medical Affairs), Laura Aaltonen (Marketing) and Joanna Tuormaa (Business Excellence).
- **Sat 14 Nov, daytime:** Kaisa Kaitila (Medical Affairs).
- **Sun 15 Nov, 14:00, judging:** Hanna Rusila, Laura Aaltonen and Joanna Tuormaa.
- **Contacts:** Joanna Tuormaa, Innovation and Business Excellence Director, Nordics, is the main contact. Laura Aaltonen handles questions. Contact details are in the [participant brief](https://hackjunction.app/participate/45/challenges/344).

#### Judging and prizes

| Criterion | Weight | What judges look for |
| --- | ---: | --- |
| Actionability | 30% | A health centre or wellbeing services county could implement the recommendation. |
| Insight | 25% | The demo reveals a meaningful gap and locates it in the care pathway. |
| Data quality and transparency | 20% | Sources and limitations are visible, and conclusions are supported. |
| Clarity | 10% | A decision-maker grasps the finding and proposed action within two minutes. |
| Execution | 15% | The solution works in a live demonstration. |

Prizes are €1,000, €750 and €250 for the top three teams. AstraZeneca may explore promising concepts after Junction with a Finnish wellbeing services county.

## Tech Challenges

Tech Challenges are sponsor side competitions that reward how a technology is used. The same project can enter a compatible Tech Challenge alongside its Main Challenge. Check each brief for its own submission steps. For example, OpenAI evaluates how Codex helped build the project, while NVIDIA evaluates what Nemotron does in the working solution. See [developer tools and credit offers](RESOURCES.md#developer-tools-and-assets) for access.

All 19 listings were checked in the [Junction participant portal](https://hackjunction.app/participate/45/challenges) on 2026-11-13.

| Challenge | Sponsor | What to demonstrate | Prize | Official brief |
| --- | --- | --- | --- | --- |
| Verda Compute Track | Verda | Use Verda compute or inference where it materially enables the project. Document the process and share a summary link in Verda’s Discord channel. | $10,000 cloud credits and hoodies / $2,500 / $2,500 | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/56) |
| Best Use of MongoDB Atlas | MLH | Use MongoDB Atlas as part of the hack. | M5Stack IoT Kit | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/55) |
| Best Use of Vultr | MLH | Use Vultr cloud infrastructure to deploy or power the project. | M5Stack mini programmable monitor | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/54) |
| Best Use of Tiger Data | MLH | Use Tiger Data for real-time data, time series or analytics and show what it enables. | Stream Deck Mini | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/53) |
| Best Use of Solana | MLH | Use Solana for a project that benefits from fast, low-cost transactions. | Unruggable Hardware Wallets | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/52) |
| Best Use of Entire | MLH | Show human–AI collaboration with Entire’s Sessions, Graph and/or Brain, including the value of shared context. | Mini portable projector | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/51) |
| Best Use of ElevenLabs | MLH | Integrate an autonomous voice or audio experience using ElevenLabs. | Wireless earbuds | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/50) |
| Best Use of Codex | OpenAI | Show how Codex materially helped build, iterate on and ship the project during Junction. | $10,000 / $5,000 / $2,500 in API credits | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/49) |
| Best Use of Gemini API | Google DeepMind | Show how Gemini API contributes meaningfully to a working solution. | €4,000 plus $1,000 Google Cloud credits per member / €2,000 / €1,000 | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/48) |
| Best Use of Gemma | Google DeepMind | Show an innovative, useful application of the Gemma open models. | €1,000 per team for three teams, unranked | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/47) |
| Best Use of Nemotron | NVIDIA | Use Nemotron 3.5 Super VL in the core demo and explain the model’s role and how its outputs were improved in the submission. | One NVIDIA RTX 5080 for each of the two best teams | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/46) |
| Best use of Arduino Uno Q | Arduino | Build a working physical prototype with UNO Q and Modulino sensors, using on-device AI. | UNO Q and Plug and Make Kit per winning team member | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/45) |
| Best Use of Context.dev: Fully Structured Web | Context.dev | Use at least one API endpoint in the core flow. Submit a GitHub repo, demo and note on the endpoints used. | €750 and swag / €250 and swag / swag | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/44) |
| Best Use of Aiven | Aiven | Use at least one Aiven service meaningfully and show what it enables. | €1,000 / €750 / €500 | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/43) |
| Best use of CRACI | CRACI | Run the project’s CI/CD on CRACI. Show what the build dependency data enables for software security. | LEGO sets / Red Bull packs / CRACI × OpenAI lunch invitation | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/42) |
| Best Use of Cloudinary | Cloudinary | Solve a visual-media problem with one of the four listed Cloudinary tools and complete the sponsor’s submission form. | $500 Amazon gift cards per winning team member | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/41) |
| Best use of Modal | Modal | Use Modal for a substantial AI workload such as inference, sandboxes, fine-tuning or batch processing. | $2,000 cash and $3,000 Modal credits | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/40) |
| Best agentic usecase of Oxylabs Web API | Oxylabs | Use the Web API at runtime to find and read live sources for an agent or product. | €1,000 Apple voucher and $500 Oxylabs credits per winning team member | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/32) |
| Atech Real World Challenge | Atech | Build and demo a physical device that solves a real problem using Atech hardware modules. | Pro Atech kit for the winner, kits and swag for runners-up | [Participant brief](https://hackjunction.app/participate/45/tech-challenges/29) |

## Challenges with a public objective

Working titles are marked where the organizer did not publish a formal title. Each entry includes the most specific deliverable information available publicly.

| Challenge / sponsor | Problem, goal and expected deliverable | Technology and rules | Judging, award and submission | Original source |
| --- | --- | --- | --- | --- |
| **Make Unicorns Real** · Cala | Build a product for a concrete founder or VC need using structured public data. The briefing highlights connecting companies, people, investors and funding rounds. Exact required artifacts unknown. | Cala public data layer. Access method, rate limits and any other tech restrictions unknown. | Judges’ criteria will be discussed at Sat 11:00 briefing. Rubric, prizes and challenge-specific submission fields unknown. | [Junction workshop description](https://2026.hackjunction.com/#workshops) · [Cala](https://www.cala.ai/) |
| **Personal Economic Trainer** · S-Pankki | Prototype a conversational AI experience that explains personal spending and lets users explore savings scenarios, such as reducing restaurant spending. Exact required artifacts unknown. | Synthetic transaction data modeled on real banking activity is announced. Dataset access and other rules unknown. | Formal rubric, prizes and challenge-specific submission fields unknown. | [Junction announcement](https://gt.linkedin.com/company/hackjunction) |
| **Hardware robotics challenge** (working title) · Ignite Next × Intel | Connect code to physical motion using robot arms and cameras, with on-site support. Specific task, success metric and required demo format unknown. | Arms and cameras announced. Workshop covers Intel Core Ultra, OpenVINO and Physical AI Studio. Required stack and gear models unknown. | Formal rubric, prizes and challenge-specific submission fields unknown. | [Junction announcement](https://gt.linkedin.com/company/hackjunction) · [Junction workshop](https://2026.hackjunction.com/#workshops) |
| **AI for construction drawings** (working title) · Stoa | Answer questions about real construction drawings accurately and make the answer quick to verify. Required artifacts and sample questions unknown. | AI with construction drawings. File formats, dataset access and required stack unknown. | Accuracy and easy verification are public goals. Formal rubric, prizes and challenge-specific submission fields unknown. | [Junction announcement](https://gt.linkedin.com/company/hackjunction) |

## Confirmed challenge partners awaiting fuller briefs

| Partner | Public information | Missing |
| --- | --- | --- |
| Rokoko | Motion capture gear and mentoring announced for projects using human motion data. [Junction announcement](https://gt.linkedin.com/company/hackjunction) | Formal title, exact prompt, deliverables, supported gear and formats, rules, rubric, prizes and submission fields |
| Exa | Search API partner announcement suggests research assistants, discovery tools or web-enabled agents. These are examples from the announcement. [Junction announcements](https://fi.linkedin.com/company/hackjunction) | Formal title, exact prompt, required API use, deliverables, rules, rubric, prizes and submission fields |

## Add a brief

Record the official title, sponsor, track, exact problem and audience, deliverables, judging, required technology or data, eligibility and restrictions, prizes, submission fields and deadline. Add the direct brief URL or describe where it appears in the participant portal, and record the verification date. Preserve access restrictions when summarizing non-public material.
