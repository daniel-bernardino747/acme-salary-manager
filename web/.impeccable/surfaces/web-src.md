---
version: 1
slug: "web-src"
primary_target: "web/src"
related_targets: []
---

# Surface brief: the ACME Salary Manager web app

## Scope and mode

The whole web app (`web/src`): the shell, global search, Overview, Employees (list, view, add, edit), and the four pay screens. Mode: **Operate**. Desktop first (1440), phone for lookups (390). Structure is fixed by `docs/ux/information-architecture.md` (approved) and ADR 0004 as amended (#40).

## Audience, job and constraints

The HR Manager, non-technical, interrupted, often answering someone who is waiting. Jobs in research order: find an employee, correct a salary, add or remove someone, "what do we pay X in Y", check out-of-line pay, payroll for Finance, review prep, compare across countries. Constraints: Mantine (themed through `createTheme`), TanStack Router and Query, no API change, money only through `formatMoney` and `placeDecimal`, WCAG AA, keyboard, visible focus, reduced motion. Every footnote and small-group notice stays.

## Direction contract

THESIS: Seven countries, one official document. The app is set like the data page of a well-made passport: a deep cover-ink rail, a calm security-tint ground, white document panels, and every country and currency stamped the same way everywhere. It refuses the category default: a grey sidebar with white KPI cards and one blue accent.

OWN-WORLD: Cover navy `#1B2440` rail and header ink; security-tint ground `#F3F5EF` from one stepped neutral ramp; white panels with hairline borders and 6px corners; teal `#2F6B66` for actions, links and selection; burnt orange `#B4541A` for underpaid, plum `#6B3A7A` for overpaid, each with a word, never colour alone; small groups hatched. Public Sans, one family, a strict 1.2 scale, tabular figures right-aligned tight. The signature move is the **country stamp**, a double-hairline frame around `IN · INR`, used wherever a country or currency appears. A faint security-print band sits under each page title.

STORY: The HR Manager sees the answer first (the count, the total, the median), recognises each country by its stamp, and reaches the person behind any number in one click. They trust the figures because the method and the rate date sit right under them.

FIRST VIEWPORT: Overview at 1440. Navy rail on the left (232px): brand, Overview, Employees, PAY (Pay by role, Outliers with an orange count badge, Payroll, Across countries), rate date at the foot. A top bar on the tint: global search (560px, Ctrl K) and the teal "Add employee" on the right. The page title "Overview", its date line and the security band, then two columns: **Paid out of line** (14 underpaid at 40px, the cost to reach 0.80, the five most extreme with stamps and compa-ratios, links) on the left; **What do we pay?** (picker) and **Annual payroll** ($669,197,391, the shares by country as bars) on the right. Rates footnote below.

FORM: passport data page, candidate 7 of 7 on the grounded list, the assigned direction. Raised by the declined challengers: hatched small groups (labanotation), one tonal ramp (exposure record), one family at strict steps (Emigre specimen), tabular right-aligned figures (cassette j-card), focus as a first-class state (streaming wall). seed:b4d79a173ceedc89

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

The country stamp: the same double-framed `IN · INR` mark on the Overview, the list, the employee view, the outliers rows and the comparison chart, so the seven countries read as one system.

## Unresolved

None. The compa-ratio on the employee view is a separate ticket (needs an API field).
