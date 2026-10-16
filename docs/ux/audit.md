# Audit: the redesigned web app

`/impeccable audit` on `web/src` after the HR Manager redesign (#40), run against the code and the captures in `docs/ux/screenshots/after/`. This is a technical audit, not a design critique. The fixes are listed at the end, each in its own commit.

## Audit health score

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | Input placeholders (gray-5 on white, 3.99:1) and the subtle Delete button (red on the tint, 4.11:1) fall below 4.5:1 |
| 2 | Performance | 3 | One 1.18 MB JavaScript chunk; Recharts loads on every route, though only the comparison uses it (this predates the redesign) |
| 3 | Theming | 3 | A full token system (one tinted ramp, cover, visa, under, over). The app is light-only by design, with no dark mode |
| 4 | Responsive design | 3 | Phone layouts stack and nothing scrolls sideways, but the phone's search icon (34 px) and drawer links (40 px) are under 44 px |
| 5 | Implementation integrity | 4 | `impeccable detect` finds nothing. One system runs through every screen |
| **Total** | | **16/20** | **Good** |

## Implementation integrity verdict

**Pass.** `impeccable detect --json web/src` returned `[]`. Every screen is built from the same parts: `PageHeader` with its question and band, `Panel`, `Figure`, `CountryStamp`, `DirectionBadge`, `RangeBar` and `ShareBar`, and the `records` table and phone-record styles. All colours come from the theme's five ramps. Nothing on screen could belong to an unrelated product: the stamps, the outlier directions and the peer ranges are this product's own data drawn in its own way.

## Executive summary

- Audit health score: **16/20 (Good)**.
- Issues: 0 P0, 2 P1, 2 P2, 2 P3.
- The two P1 contrast failures and the P2 touch targets are fixed in this branch (see *Fixes applied*).
- Recommended next steps: split Recharts into the comparison route's own chunk (`/impeccable optimize`), as a follow-up.

## Findings by severity

### [P1] Placeholder text below AA contrast

- **Location:** every `TextInput` and `Select`, through Mantine's `--mantine-color-placeholder` (gray-5, `#7a8273`).
- **Category:** Accessibility.
- **Impact:** "Search by name", "Any country" and "Pick a job title" read faintly at 3.99:1 on white.
- **Standard:** WCAG 2.2, 1.4.3 Contrast (Minimum).
- **Recommendation:** point the placeholder at gray-6 (`#596254`, 6.36:1).
- **Suggested command:** `/impeccable polish`.

### [P1] The subtle Delete button is below AA contrast

- **Location:** `web/src/screens/employee-view.tsx`, the Delete button on the tint.
- **Category:** Accessibility.
- **Impact:** the one destructive action reads at 4.11:1.
- **Standard:** WCAG 2.2, 1.4.3.
- **Recommendation:** use red 8.
- **Suggested command:** `/impeccable polish`.

### [P2] Phone touch targets under 44 px

- **Location:** `web/src/layout/app-layout.tsx` (the search `ActionIcon`, size `lg`, 34 px) and `web/src/layout/shell.module.css` (`.link`, min-height 40 px).
- **Category:** Responsive.
- **Impact:** the two most-used phone controls are tight to hit with a thumb. They do pass WCAG 2.2's 24 px minimum (2.5.8).
- **Recommendation:** 44 px for both.
- **Suggested command:** `/impeccable adapt`.

### [P2] Recharts in the main bundle

- **Location:** `web/src/screens/pay-comparison.tsx`, through `router.tsx`.
- **Category:** Performance.
- **Impact:** every first load downloads the chart library, which only Across countries uses. This predates the redesign; the redesign adds `@mantine/spotlight` and about 45 KB of fonts.
- **Recommendation:** lazy-load the comparison route.
- **Suggested command:** `/impeccable optimize`.
- **Status:** follow-up, not in this branch.

### [P3] A global reduced-motion kill

- **Location:** `web/src/theme/global.css`.
- **Category:** Accessibility.
- **Impact:** none here. The only transitions are 120–150 ms colour changes, and no state change depends on motion. A future animated state would lose its feedback, though.
- **Recommendation:** keep it while motion stays colour-only.

### [P3] Pagination buttons are 30 px on a phone

- **Location:** the list and outliers `Pagination` (theme default `sm`).
- **Category:** Responsive.
- **Impact:** small, but above 24 px.
- **Recommendation:** use size `md` under the `sm` breakpoint, when pagination is next touched.

## Patterns and systemic issues

None found. Both contrast failures come from defaults the theme had not overridden: Mantine's placeholder token and the red subtle button. They are not repeated choices in the screens.

## Positive findings

- **Contrast is otherwise at AA or better.** Text on white is 6.36:1 or more, the stamp is 8.07:1, the rail labels are 7.22:1 and above, and the badges are 4.68:1 (Below) and 6.71:1 (Above).
- **State is never carried by colour alone.** Every compa-ratio carries a Below or Above word. Small groups are hatched as well as muted, and carry a "Small group" badge.
- **Semantics:** each page has one `h1` and its panels use `h2`. The nav is a labelled `nav` with `aria-current`. Range drawings are `role="img"` with a label, with their figures in text beside them. Share bars are `aria-hidden` because their percentages are text.
- **Keyboard:** every row's first cell is a real link. The phone's Filters button has `aria-expanded` and `aria-controls`. Focus is a 2 px visa outline, and the nav and table rows have their own focus states.
- **Money:** every amount goes through `formatMoney`, `placeDecimal` or `wholeUnits`. Geometry is the only arithmetic.

## Fixes applied

Each is in its own commit:

1. Placeholder colour set to gray-6.
2. Delete button set to red 8.
3. The phone's search icon and drawer links set to 44 px.

The Recharts split is a follow-up.
