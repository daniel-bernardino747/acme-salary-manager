# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One user: ACME's **HR Manager**, who keeps the current base salary of about 10,000 employees in 7 countries (US, UK, Germany, Netherlands, India, Brazil, Japan). They are not technical. Their day is mostly short, interrupted jobs, ranked in `docs/ux/hr-manager-research.md`:

1. look up one employee's pay;
2. correct or change a salary before the pay cutoff;
3. add someone who joined or remove someone who left;
4. answer "what do we pay a [job title] in [country]?", including offer checks;
5. check whether someone is paid out of line before agreeing a raise;
6. give Finance the payroll total by country or department;
7. before the annual review, see who is underpaid and what fixing it costs;
8. compare one job title across countries.

## Product Purpose

The app replaces ACME's salary spreadsheets with one source of truth, where every pay question used to mean a hand-built pivot table and manual currency conversion (`docs/requirements.md`). It answers four questions: pay statistics for a job title in a country; payroll totals by country and department; one job title compared across countries; and who is paid out of line with their peers. Success means each answer is one or two clicks away, exact to the minor unit, and trusted without a spreadsheet beside it.

## Positioning

The app is exact, not approximate. Money is integer minor units with one rounding per result. Cross-country figures use a fixed, dated exchange-rate table whose source and date are always shown. Outliers come from a stated rule (compa-ratio against the peer median, below 0.80 or above 1.20, groups of 5 or more). Every figure can be traced to the rule and the people behind it.

## Operating Context

- **Desktop first:** the work happens at a desk on a laptop or monitor. The phone is for lookups between meetings: finding someone, and "what do we pay X in Y".
- Requests arrive from managers, Finance and leaders, often while someone is waiting. Edits come in runs before each payroll cutoff. The annual review has a run-up of a few weeks.
- Links get shared and bookmarked: all list and question state lives in the URL.

## Capabilities and Constraints

- **Features:** an employee list with server-side paging, name search and filters for country, department and job title; view, add, edit and delete an employee; the four pay questions. The approved navigation and screens are in `docs/ux/information-architecture.md`, and the UI rules in `docs/adr/0004-ui-structure.md`.
- **Terminology:** `CONTEXT.md` is the glossary (Employee, Salary, Peer group, Small group, Pay statistics, Payroll total, Share of payroll, Compa-ratio, Outlier, Gap to 0.80, Cost to reach 0.80), and its terms are used in copy. A job title is never pluralized.
- **Money:** shown only through `formatMoney` and `placeDecimal`, in the `en` locale, with exact minor units except where ADR 0004 says whole units. The UI does no money arithmetic. The exchange-rate source and date, and "nominal, not adjusted for cost of living", appear wherever converted amounts do.
- **Stack:** React with Mantine (themed through `createTheme`, no Tailwind), TanStack Router and TanStack Query, served by the NestJS API as one Railway service.
- **Out of scope:** salary history, import and export, total compensation, pay grades and bands, pay-equity analysis, live exchange rates, cost-of-living adjustment, approvals, bulk edits, notifications, authentication and roles. The UI must not imply any of these exist.
- **Data limits:** the UI shows only what existing endpoints return. A compa-ratio on the employee view needs an API field and is a separate ticket.

## Brand Commitments

None. There is no logo, brand colour or typeface. The name is "ACME Salary Manager". The voice is plain, precise English in the HR Manager's words, with no engineering jargon.

## Evidence on Hand

- A deterministic seed of 10,000 employees (`docs/adr/0005-deterministic-seed-data.md`), used for every screen and screenshot.
- The research (`docs/ux/hr-manager-research.md`) and the approved information architecture (`docs/ux/information-architecture.md`).
- There are no users' quotes, testimonials or usage analytics. Do not invent any.

## Product Principles

1. **Lead with the answer.** Each screen opens on its figure or its list. Method and footnotes follow and are never removed.
2. **People are one step from every number.** Aggregates open the employees behind them, and employees open their peer group.
3. **Precision is visible.** Exact money, a stated rounding rule, a dated rate table, and small groups marked rather than hidden.
4. **Calm and trustworthy over clever.** This is sensitive pay data for a non-technical professional. Nothing should look like a developer tool or alarm without cause.

## Accessibility & Inclusion

WCAG 2.2 AA contrast, full keyboard navigation with visible focus, a label on every control, and `prefers-reduced-motion` respected.
