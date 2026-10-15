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
