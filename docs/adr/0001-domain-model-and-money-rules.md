# Domain model and money rules

Statistics must come out right to the minor unit and be checkable against hand-computed fixtures, so every money rule is integer-only, rounds exactly once per result, and computes what the screen shows.

## Reference data

Country, Department and Job title are fixed lists in code, defined once and read by both the API (validation) and the UI (dropdowns). The supported countries are US (USD), UK (GBP), Germany (EUR), Netherlands (EUR), India (INR), Brazil (BRL) and Japan (JPY). The second eurozone country proves that currency follows country without being unique to it. Adding a title or a country is a code change and a deploy. That cost is accepted for the MVP, and lookup tables with admin screens are the upgrade path.

## Rounding

Round half up to a whole minor unit, applied once per result. It covers averages, the median of an even-sized group (the mean of the two middle values) and conversions to USD. It is implemented with integer quotient and remainder (`q = trunc(sum / n)`, `r = sum − q·n`, round up if `2r ≥ n`). Every sum is asserted with `Number.isSafeInteger`, and no BigInt is needed outside conversion.

## Exchange rate table

The table is a constant in code with a source and an as-of date, and the UI shows both. Each rate is a scaled integer: local currency units per 1 USD to 6 decimals (`83_123_400` for INR 83.1234, `1_000_000` for USD), stored alongside the currency's ISO 4217 minor-unit exponent (JPY 0, the rest 2). Rates derived from a EUR-based source such as the ECB are computed once, stored, and labelled as derived. Conversion computes `localMinor · 10^(2 − exp) · 10⁶ / rate` in BigInt inside that one function, because the product passes 2⁵³ for large totals. It rounds with the rule above and asserts that the result is a safe integer. At startup the app asserts that every supported country's currency has a rate and that every rate is greater than 0. It fails fast rather than on the insights page.

## USD totals

A payroll total in USD (per department, per country, and the grand total) sums salaries per currency, converts each subtotal once, then adds the results. Germany and the Netherlands share one EUR subtotal. Totals are computed in cents and displayed in whole USD (display formatting only). A footnote under the totals says they were converted at fixed rates of the given date and that each total is rounded independently, so parts may not add up exactly to the total. The grand total is kept, because it is the first number the HR Manager asks for.

## Outliers

An employee is an outlier when their compa-ratio is strictly below 0.80 or strictly above 1.20, in a peer group of at least 5 that includes them. The test is integer cross-multiplication (`100·salary < 80·median` or `100·salary > 120·median`) against the median as shown, already rounded. The displayed compa-ratio (2 decimals) never crosses the boundary: flagged-below rounds down, flagged-above rounds up, and everything else rounds half up.

## Edge cases

- An empty peer group has headcount 0 and null min, median, average and max, never 0.
- Pay statistics for groups smaller than 5 are shown and marked as a small group. The threshold applies only to outliers.
- The cross-country comparison converts each local stat as shown (already rounded) once, so its USD figures carry two roundings. This is deliberate, on the same "what you see is what was computed" principle as the compa-ratio median. Every supported country is listed in a fixed order, with "no employees" where empty.

## Required fixtures

- An even-sized median
- A single-employee group
- A JPY conversion
- An exact .5-cent conversion
- A large total that only converts through the BigInt path
- USD → USD as identity
- A compa-ratio of 0.7996 shows "0.79" flagged
- A compa-ratio of 1.2004 shows "1.21" flagged
- A compa-ratio of exactly 0.80 shows "0.80" not flagged

## Considered options

- **Lookup tables for reference data:** rejected for the MVP because they bring admin screens. They are the upgrade path.
- **Banker's rounding:** rejected. Only one rounding happens per result, so there is no bias to cancel out, and it surprises readers of the fixtures.
- **Numerator/denominator rates:** rejected. Published rates are already decimals, so the exactness buys nothing.
- **Converting each salary before summing:** rejected. It means one rounding per employee, and the error grows with headcount.
- **Forced reconciliation (largest-remainder allocation) so parts add up to the total:** considered and rejected as unnecessary. The footnote explains the small mismatch instead.

## Consequences

Known limitation: a small group's stats reveal individual salaries, since n = 1 is that person's pay. This is acceptable while the HR Manager is the only user. Sharing reports beyond HR would need small-group suppression, which is tied to the authentication and roles stretch goal.
