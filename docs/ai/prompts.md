# Prompts

The prompts that drive each phase of the build, in order. Each one opens a fresh AI session; the full transcript of that session is in `docs/ai/sessions/`.

## Phase 0 — Repository and requirements

````markdown
You're helping me with a take-home assessment for a Software Craftsperson (TypeScript) role at Incubyte, a company whose culture is built on TDD, small steps and software craft. The full assessment text is at the end of this message. Read it in full before doing anything.

This session is **phase 0 only**: initialize the repository and write the one-page requirements document. **Write no application code, no package.json, no scaffolding.** The assessment requires the requirements doc to exist *before* the software, and the commit history must prove it. Architecture and planning come in the next session.

## Context you need

- The folder already contains `.claude/settings.json` and `.claude/hooks/save-session.mjs`, a hook that saves every AI session as markdown in `docs/ai/sessions/`, and `docs/ai/prompts.md`, the prompts that drive each phase. Don't modify them. They're part of the deliverable: the assessment asks for the prompts used with AI tools.
- Decisions already made (record them; don't reopen them):
  - **Persona:** the HR Manager of ACME, ~10,000 employees across multiple countries, today working out of Excel files.
  - **Core value:** the app has to *answer questions about how the org pays people*, not just store records. A CRUD alone misses the point of the assessment.
  - **Questions the app answers (MVP):**
    1. Salary stats (min / median / average / max) by job title within a country.
    2. Total payroll cost by country and by department.
    3. Pay for a job title compared across countries, normalized to USD.
    4. Outliers: employees paid outside their job title's band in their country.
  - **Managing data (MVP):** list employees with server-side pagination, search and filters (country, department, job title); view an employee; add one; edit one (salary included); remove one.
  - **Money:** salaries are stored in the employee's local currency as integer minor units, plus an ISO 4217 currency code. Never floats. Stats within a country use the local currency. Comparisons across countries convert to USD using a **fixed, dated exchange-rate table** shipped with the app (no live FX API, and the doc says why).
  - **Seed:** a deterministic seed script for 10,000 employees with plausible salaries per country and job title, so the insights look meaningful.
  - **Stack constraints** (one line in the doc, no detail; architecture is the next session): NestJS + SQLite backend, React UI, deployed on Railway, public GitHub repo.
  - **Authentication / roles:** stretch goal, built last if time allows. The doc must say that production would require SSO and role-based access, because salary data is sensitive.
- **Deliberately out of scope** (each needs a one-line reason; you may suggest others, but flag them as suggestions):
  - salary history and audit trail
  - Excel / CSV import (the obvious next step, since the problem starts in Excel)
  - gender pay-equity analysis (needs sensitive personal data and legal care)
  - live exchange rates
  - approval workflows
  - bulk edits
  - multi-tenancy
  - notifications

## What to do

1. `git init`. Add a `.gitignore` for a Node/TypeScript monorepo (node_modules, dist, coverage, `.env*`, `*.sqlite`/`*.db`, OS and editor files). Do not ignore `docs/ai/`.
2. Write `docs/requirements.md`. **It must fit on one printed page, roughly 450–600 words.** Sections:
   - **Goal:** one or two sentences.
   - **User & problem:** the HR Manager and what hurts about Excel today.
   - **Scope & features:** the MVP, split into *Manage salary data* and *Answer pay questions*. Write each question as the HR Manager would ask it, followed by what the app shows.
   - **Key decisions & assumptions:** money representation, currency normalization, data volume, what "band" means for outliers. Propose a simple, explainable definition, e.g. outside the 10th–90th percentile for that title in that country, and mark it as an assumption.
   - **Out of scope, and why:** the list above, one line of reasoning each.
   - **Success criteria:** how we'll know it works. Concrete and checkable.

   Writing style: plain, direct English, written for an engineer reviewing the submission. No marketing language, no filler, no emojis. Prefer short sentences and concrete nouns. Don't invent requirements I didn't state. If something is ambiguous, pick the simplest reasonable reading and list it under assumptions.
3. **Stop and show me the draft.** Below it, list every assumption or choice you made that I didn't state explicitly, so I can review them. I will edit the doc myself. Do not commit until I say so.
4. Once I approve, make two commits, Conventional Commits style:
   - `docs: requirements for the salary management app` (only `.gitignore` and `docs/requirements.md`)
   - `chore: save AI prompts and sessions in docs/ai` (the `.claude/` folder, `docs/ai/prompts.md` and `docs/ai/sessions/`)
5. Don't create the GitHub repo and don't push. I'll do that myself.

---

## The assessment

Assessment with Product Framing

### Expectations

This exercise is intentionally designed to assess how you think, design, and build software in an AI-driven environment.

You are required to use AI tools to accelerate your work. We care about how you use them, the clarity of your thinking, and the quality of your engineering decisions.

We expect you to:

- Demonstrate clarity in thought and structured problem solving
- Show strong engineering fundamentals & product thinking
- Make thoughtful architectural and design decisions
- Write production-quality code and tests
- Use AI intentionally while maintaining correctness and quality

Please make incremental commits so we can understand how your solution evolved.

### Goal

Build employee salary management software for an organization with 10,000 employees.

### User Persona

HR Manager of the org

### Problem Statement

Currently, ACME org's HR team manages salary data for 10,000 employees across multiple countries, with everything managed via excels, which is tedious. We want the HR manager to manage the salaries data via web-based software and be able to answer questions about how the org pays people.

### Requirements

Write a one-page requirements document before building the software, outlining the goal, scope & features, and what you are deliberately leaving out, and reasoning for it.

### Technical Constraints

You should build end-to-end, fully functional software, including backend & UI.

1. Backend:
   - {Language & Framework as per the role you've applied for (preferred) or any other framework of your choice. Relational database of your choice, like SQLite.
2. UI:
   - ReactJS or NextJS. AngularJS for Java
   - Component library of your choice
3. Seeding:
   - Seed script with 10,000 employees.
4. Readiness:
   - Fully functional deployed software
   - Any video demo of the software

### Development Approach

Using agentic AI tools of your choice, build the solution while maintaining high standards of code quality and test coverage.

Your solution should include:

- A meaningful set of unit tests that cover the core functionality
- Tests that are fast, deterministic, and easy to understand
- Good code structure, readability, and maintainability

Your commit history should show the evolution of your solution through incremental commits. This helps us understand how you approached the problem and how your implementation developed over time.

### Artifacts

Along with your solution, please commit any artifacts that help us understand your thinking and approach. Examples might include:

- Requirements document
- Planning or design notes
- Architecture diagrams
- Prompts or instructions used with AI tools
- Trade-off explanations
- Performance considerations

There is no required format — use whatever helps best explain your approach.

### How to Succeed in This Assessment

The strongest submissions typically show:

- Clear thinking and structured problem solving
- Thoughtful architectural and design decisions
- Clean, maintainable code
- Meaningful tests
- Intentional use of AI tools
- Evidence of product thinking

We are not looking for the most complex system, but for good engineering judgment.

### Submission Instructions

- Commit your code to a Git repository
- Ensure commits show your development process
- Include all artifacts mentioned above
- Share the repository link by replying to the same email once you are done
````

## Phase 1 — Planning map (Wayfinder)

Run in two messages: `/setup-skills` first (it configures the issue tracker the map lives on), then `/wayfinder` with the prompt below.

````markdown
We're building ACME Salary Manager, a take-home assessment for a Software Craftsperson (TypeScript) role at Incubyte, a company built on TDD, small steps and software craft. Read `docs/requirements.md` (the approved one-page requirements) and `docs/ai/prompts.md` (the prompts behind each phase) before anything else. The assessment text is at the end of `docs/ai/prompts.md`.

This session **charts the map only**. Write no application code, no package.json and no scaffolding. The output is a Wayfinder map plus decision tickets on this repo's GitHub Issues. They're public and part of the deliverable: the assessment asks for "planning or design notes" and "trade-off explanations", and a reviewer will read them.

## Destination

Every architecture and design decision needed to build the MVP in `docs/requirements.md` is made and recorded: ADRs in `docs/adr/`, the domain glossary in `CONTEXT.md`. The way to `/to-spec` → `/to-tickets` → `/implement` is clear. Confirm this destination with me in one question; don't re-grill the requirements. Their scope is settled.

## Notes for the map body

- **Speed matters.** I want to start building as soon as possible. Keep the map small: aim for **6–8 tickets** and merge closely related decisions into one. Don't ticket anything a sensible default already settles. List those defaults in the map's Notes so I can veto them at a glance.
- For every grilling question, **lead with your recommendation and a one-line reason** so I can accept it in a word. Never answer for me.
- Skills to consult: `/grilling`, `/domain-modeling` (CONTEXT.md, ADRs), `/codebase-design` (module seams), `/tdd` (test seams), `/research` (facts outside this repo).
- Building happens later through `/implement`, which works test-first and commits at red → green → refactor granularity. Decisions must leave **clear, fast, deterministic test seams**. Pure domain logic (money, currency conversion, stats, compa-ratio) should be testable without Nest, a database or a network.
- Decided already. Record these, don't reopen them: NestJS + SQLite backend, React UI, Railway deploy, public GitHub repo; money as integer minor units + ISO 4217 code; a fixed, dated USD rate table; compa-ratio against the peer median, flagged below 0.80 or above 1.20, groups under 5 skipped; job titles carry the level; remove is a hard delete; auth is a stretch goal built last.

## Decision areas to consider

This is input, not the ticket list. You decide what becomes a ticket, what's a default, and what stays fog:

- **Repo and tooling:** monorepo layout (`api/`, `web/`, shared types?), package manager and workspaces, TypeScript strictness, lint/format, test runner (Jest, Nest's default, vs Vitest).
- **Persistence:** SQLite driver and ORM or query builder (e.g. Drizzle, Prisma, TypeORM, Kysely), migrations, indexes. **Where stats are computed:** SQL aggregates vs pure domain functions fed by a query. SQLite has no built-in median or percentile, and this choice shapes the unit tests.
- **Domain model and glossary:** Employee, Country → currency, Job title (with level), Department, Money, Exchange rate table, Compa-ratio, Pay statistics.
- **API contract:** endpoints for employees and the four questions, pagination and filters, validation approach, error format, how types are shared with the UI.
- **UI:** component library, data fetching, routing, and how each of the four questions is presented.
- **Seed:** generating plausible salaries per country and title deterministically, planting a few real outliers so question 4 has something to show, and keeping it fast and repeatable.
- **Deploy on Railway:** one service (Nest serves the built React app) vs two, SQLite on a persistent volume, seeding on first boot, environment config. **Make this a research ticket.** It depends on current Railway facts.
- **Testing strategy:** which seams get unit tests, which get API integration tests (in-memory SQLite), whether the UI gets any tests, and how the 500 ms target is measured.
- **Fog:** authentication, performance write-up, demo video, README and artifact index.

## Rules for this session

- Follow the Wayfinder skill's "Chart the map" flow: map issue labelled `wayfinder:map`, tickets as sub-issues with `wayfinder:<type>` labels, native blocking edges, research subagents fired at the end. Create the labels if they don't exist.
- Ticket titles and bodies must be readable by an outside reviewer: plain English, the question and why it matters, no internal shorthand.
- **Commits.** Start the session with `docs: restore the outlier flagging rule` (only `docs/requirements.md`, already edited by me). Then commit the `/setup-skills` output if it isn't committed yet. End the session with `chore(ai): session logs` (`docs/ai/`). Push after each commit.
- Stop after charting. Resolve no ticket in this session.
````

Next sessions, one ticket each: `/wayfinder <map URL>`. When the map is clear: `/to-spec`, `/to-tickets`, then `/implement` per ticket.

## Phase 2 — Spec and tickets

Run in two messages in the same session, so `/to-tickets` works from the spec already in context: `/to-spec` with the prompt below, then `/to-tickets` once the spec is published.

````markdown
The planning map for ACME Salary Manager is complete: every ticket is closed and every decision is recorded. This session turns it into one spec and a set of build tickets. Write no application code.

## Read first, in this order

1. `docs/requirements.md` — the approved scope.
2. `CONTEXT.md` — the glossary. Use its terms everywhere (Peer group, Compa-ratio, Outlier, Small group, Payroll total…).
3. `docs/adr/0001` to `0006` — the decisions. They are final; don't reopen any of them.
4. The Wayfinder map issue (label `wayfinder:map`) and its closed tickets with their resolution comments: `gh issue view <n> --comments`.
5. `docs/agents/issue-tracker.md` — how to publish.

## The spec (`/to-spec`)

- **One spec for the whole MVP** in `docs/requirements.md`: managing employees plus the four pay questions, the seed, the deploy, the e2e smoke test and the performance run.
- **Authentication is out of scope** for this spec. It's the stretch goal and gets its own spec later if there's time.
- **Seams are already agreed** (ADR 0002 and 0006): domain fixtures, repositories on `:memory:`, HTTP on `:memory:`, pure web functions, and one Playwright smoke test. Confirm them in one message; don't propose new ones.
- **Implementation Decisions cite ADRs, not copies.** Write "money rules per ADR 0001", not the rules restated. The spec says *what* gets built; the ADRs say *how*. Nothing in the spec may contradict an ADR. If you find a gap or a conflict between ADRs, stop and ask me.
- **User stories** are from the HR Manager's point of view, plus a few from the reviewer's (run the seed, run the tests, read the performance results). Be thorough, but no story without a requirement or ADR behind it.
- **Spine.** There's no spine issue yet. Create one, in English: title "ACME Salary Manager MVP", label `spine`, with this checklist and the first two items ticked: Requirements (`docs/requirements.md`), Planning map (link the map issue and `docs/adr/`), Spec & tickets, Build, Deploy, Performance run, Demo video. The spec body starts with `Part of #<spine>`. No handoff PR: the spec and tickets live on the tracker, not in files.

## The tickets (`/to-tickets`, next message)

Vertical tracer bullets, each sized for **one `/implement` session** (one fresh context window, test-first, red → green → refactor commits). Target **10–13 tickets**. My expected shape — challenge it if the ADRs say otherwise:

1. **Walking skeleton, deployed.** pnpm workspaces, `@acme/contract`, Nest boots importing it, Drizzle migration on `:memory:` and on file, `/api/health`, Nest serving the built SPA with the `/api` 404 fallback, lint rules for layer imports, CI on ubuntu, and **deployed to Railway** with the volume and the `migrate → seed --if-empty → start` command (the seed step can be a no-op stub until ticket 2). It includes all of ADR 0002's first-slice checks. Deploying first takes away the biggest risk while the app is still trivial.
2. **Seed** (ADR 0005): reference lists, quotas and snapshot, bases and snapshot, median anchoring, planted outliers and boundary plants, names, the three modes, golden hashes, the seed tests. It needs the money domain from ADR 0001 that the seed relies on (rates, conversion, rounding); build that domain here, test-first.
3. **Employee list**: pagination, filters, FTS search with the fixture table, list screen.
4. **View, add, edit, remove an employee**: `parseMoney`/`formatMoney`, Problem Details mapped to form fields, the delete flow.
5–8. **One ticket per pay question** (Q1 statistics, Q2 payroll totals, Q3 comparison, Q4 outliers), each through domain → repository → endpoint → screen. Q4 includes the seed-level assertions that need it (flagged set = planted set, cost headline).
9. **E2E smoke test** (ADR 0006).
10. **Performance**: Server-Timing middleware, `pnpm perf`, the results file and the hand-written `docs/performance.md`. The actual run against Railway is mine to do.
11. **README and artifact index**: setup, commands, endpoints, seed modes, known limitations, links to requirements, ADRs, AI prompts and sessions.

Not tickets: the visual polish pass (I'll run it myself with `/impeccable`, constrained to Mantine `createTheme`), the demo video, and auth.

**Blocking edges**: only real gates. 3 and 4 need 1; 5–8 need 1 and the parts of 2's domain they use, not each other; 9 needs 4 and 8; 10 needs 1 and the endpoints it times. Whatever has no blocker should show up as available.

Every ticket's acceptance criteria are checkable: the tests that must exist at which seam, the screen behaviour, and which ADR sections it implements. No file paths, no code.

## Rules

- Quiz me on the breakdown before publishing (granularity, edges, merges/splits). Lead with your recommendation.
- Publish blockers first, as sub-issues of the spine, using native dependencies and the `ready-for-agent` label.
- **Commits:** end the session with `chore(ai): session logs` (`docs/ai/`) and push. Nothing else should change in the repo.
- Stop after publishing. Implement nothing.
````

Then one `/implement #<ticket>` session per ticket, in frontier order.

## Phase 3 — Build, one ticket per session

Each session: `/implement #<ticket>` followed by the prompt below. The same prompt is reused for every ticket; only the number changes. The deploy ticket is `ready-for-human` and isn't run this way.

````markdown
Implement ticket #<n> of ACME Salary Manager.

## Read first

1. The ticket with its comments: `gh issue view <n> --comments`. Its acceptance criteria are the definition of done.
2. The spec, #10, for the user stories this ticket serves.
3. The ADRs the ticket cites, plus `CONTEXT.md`. Use the glossary's terms in code, tests and commit messages.
4. The code already on `main`. Reuse what earlier tickets built (test builder, `clearEmployees`, money core, web shell); don't build a second version.

## How to work

- **Branch** `ticket/<n>-<slug>` off an up-to-date `main`. Comment on the ticket and assign yourself before the first commit.
- **Test-first at the agreed seams** (ADR 0006): domain fixtures, repositories on `:memory:`, HTTP on `:memory:`, pure web functions. No mocks. One behaviour per red → green → refactor cycle, committed as `test:` / `feat:` / `refactor:`. Never batch behaviours.
- **Configuration isn't faked as TDD.** Workspace setup, tsconfig, lint rules, CI and build wiring go in small `build:` or `chore:` commits, one concern each. Don't write a test only to have a red commit.
- **Dependencies:** look up current versions with `npm view <pkg> version`; never rely on memory. Pin exact versions. Node and pnpm stay as pinned.
- **Run** the typecheck and the touched test file constantly, lint and the full suite before review.
- **The ADRs are the law.** If one turns out to be wrong or unworkable (e.g. a first-slice check fails on Windows), **stop and ask me**. Never work around an ADR silently. An agreed change gets its own `docs(adr):` commit.
- **Out of the ticket's scope → leave it.** If you notice something another ticket owns, mention it in your final report instead of doing it.

## Finish

1. `/code-review` against `main`. Fixes go in their own commits.
2. Lint, typecheck and the full suite green locally.
3. Commit `docs/ai/` as `chore(ai): session logs`, then push and open a PR: title = ticket title, body starts with `Part of #9` and `Closes #<n>`, then a short narrative: what was built, decisions taken inside the ticket's room, anything left for later.
4. Wait for CI. When it's green, merge with **`gh pr merge --rebase --delete-branch`**, never squash: the red → green → refactor commits are the evidence the assessment asks for.
5. Report: what's done, test count and suite time, anything I should know before the next ticket. Then stop.
````
