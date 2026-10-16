# Testing strategy and performance measurement

The build runs test-first, and the requirements ask for tests that are fast, deterministic and easy to understand, plus a list and stats that respond in under 500 ms on the deployed app. So each kind of test targets one seam, behaviour is pinned at the lowest seam that can reach it, and the 500 ms target is measured on the deployed app by a script whose results are committed as generated output.

## Test layers

`pnpm test` runs Vitest in `contract`, `api` and `web`. It needs no browser, no network and no seed. `pnpm test:e2e` is separate.

| Layer | Where | Targets | Data |
|---|---|---|---|
| Domain | `api/src/domain/` | money, rounding, conversion, pay statistics, payroll totals, compa-ratio, outliers and their ranking | hand-computed fixtures, rounding included (ADR 0001) |
| Contract | `packages/contract` | `parseMoney`, `formatMoney`, schemas | fixtures listed in ADR 0003 |
| Seed | `api/src/seed/` | the generator, its snapshots and modes | the full seed (ADR 0005) |
| Repository | `api/src/persistence/` | SQL, triggers, FTS, the MATCH builder | builder rows on `:memory:` (ADR 0002) |
| HTTP | Nest feature modules | wiring, status codes, problems, response schemas | builder rows on `:memory:` |
| Web | `web/` | the pure parts ADR 0004 lists, with no DOM | fixtures |
| End to end | `e2e/` | the built app in a real browser | the default seed in a temporary file |

**Each behaviour is pinned once, at the lowest seam that reaches it.** HTTP tests do not re-check arithmetic that domain fixtures already pin. Each endpoint's HTTP tests check that its parameters reach the repository and the domain function, its success status and shape (every response is parsed with its schema, ADR 0003), and its problem responses. Cross-layer rules that only exist at HTTP level stay there, such as the department filter leaving the outlier median unchanged (ADR 0003).

## A clean dataset for every test

- **Repository tests** open a fresh migrated `:memory:` database per test with `createDb(':memory:')`.
- **HTTP tests** boot one Nest app per test file. Before each test, `clearEmployees(db)` deletes every employee and clears the `employees` row in `sqlite_sequence`. The test then inserts its own rows with the builder.
- **`clearEmployees` lives in `persistence/`** and is shared by the seed's `--reset` (ADR 0005) and the tests, so the reset path the seed relies on runs in every HTTP test.
- **A `:memory:` database exists only on its connection.** HTTP tests take the handle from the app's container (`app.get(DB)`) for `clearEmployees` and for builder inserts. They never open a second `createDb(':memory:')`, which would be a different, empty database.
- **Tests never hard-code ids.** They use the id returned by the builder or by the `POST`. Ids restart at 1 after a clear, but no assertion relies on that.

Clearing is chosen over rolling back a transaction per test because it is simpler than a shared-connection rollback harness, keeps commit behaviour real, and exercises the reset path.

## One end-to-end smoke test

There are no component tests. The UI's pure logic is covered without a DOM (ADR 0004). What nothing else covers is the join: Nest serving the built SPA, the route fallback, and form → `parseMoney` → API → `formatMoney` in a real browser. One Playwright smoke test covers that.

- **Setup:** Playwright's `webServer` starts the built app with the Railway start command (migrate → `seed --if-empty` → start), with `DATABASE_PATH` pointing at a fresh temporary file. The database is therefore the default seed.
- **Chromium only, no retries.** A flaky failure is a bug to fix, not to retry.
- **Its own script and CI job:** `pnpm test:e2e` runs in a CI job next to lint, typecheck and test, so the unit loop never waits for a browser.
- **Exact values, because the seed is deterministic.** A check that "a figure renders" would pass on a wrong number.
  - The planted underpaid employee in Senior Data Scientist · NL (ADR 0005) appears under Underpaid on question 4. Their name comes from the generator's output.
  - Question 4's cost-to-0.80 headline equals the seed test's expected value. Both use the same helper, which computes it from the planted constants, not through the domain function.
  - After the add and save flow with a typed salary of `1,250,000.50` in INR, the detail page shows exactly "₹1,250,000.50". Edit and delete then complete the flow.
  - The assertions on seeded figures run before the add, edit and delete flow, in one serial spec.
- **No fixed waits.** Only web-first assertions, including after the 300 ms search debounce (ADR 0004). Locators use roles and labels, never CSS classes.
- **`trace: 'retain-on-failure'`**, uploaded as a CI artifact, so a red e2e job can be diagnosed without a local rerun.

## Determinism

- **No network.** The exchange rate table ships in `@acme/contract`. The e2e test talks only to the app on localhost.
- **No wall-clock dependence.** The schema has no timestamps (ADR 0002). The timing middleware uses `performance.now()` in the HTTP layer only, and tests assert that the `Server-Timing` header is present and well-formed, never its value.
- **No unseeded randomness.** Every random draw comes from sfc32 (ADR 0005).
- **No dependence on the machine's locale or timezone.** `formatMoney` builds the decimal string from integers with string operations, then hands it to `Intl.NumberFormat` only for grouping and the symbol (ADR 0003). It always passes the app's explicit locale, `en`, never the default. Any other use of `Intl` does the same, and any date formatting passes `timeZone: 'UTC'`. Node 24 is pinned in `engines` and `.nvmrc` (ADR 0002), so CI and local share ICU data. In the browser, Playwright's pinned Chromium brings its own ICU, and the Playwright config sets `locale: 'en-US'` and `timezoneId: 'UTC'`.
- **Test files run in parallel safely:** each has its own `:memory:` database.

## Measuring the 500 ms target

The target is a claim about what the app does, so pass or fail is judged on server time. Client time is reported next to it.

- **Server time covers the whole request.** A middleware registered first starts the clock when the request arrives and, through `on-headers`, sets `Server-Timing: app;dur=<ms>` when the headers are written. The interval covers routing, guards, pipes, the handler, and JSON serialization (Express serializes the body before writing headers). It excludes the network and the time to send the body.
- **A script, run by hand, never in CI:** `pnpm perf <baseUrl>`, in plain Node with `fetch`. It runs against the Railway app with the full default seed. There is no load tool: one HR user makes sequential requests, and nobody asked a concurrency question.
- **Fixed request list:**
  - `GET /api/employees`: the first page, the last page, a filtered page and a name search.
  - Each question endpoint (`pay-statistics`, `payroll-totals`, `pay-comparison`, `outliers`), with and without filters.
- **Per endpoint:** the first request of the run is recorded as *cold*, then 3 warm-ups, then 100 sequential timed requests. With 100 samples, p95 is not just the second-worst sample.
- **Cold column procedure:** restart the service, wait for `/api/health`, then run. The script cannot restart Railway, so it records the first request of the run, and the results label it cold only under this procedure. The cold column is reported, not part of pass or fail.
- **Pass:** p95 server time under 500 ms on every endpoint.
- **Write-up, in two files:**
  - `docs/performance-results.md` is generated by the script and overwritten on each run: the date, commit, base URL, Railway region, seed mode and row count, then one row per endpoint with cold, p50, p95 and max for server time and for client time, the place the client ran from, and pass or fail.
  - `docs/performance.md` is hand-written and links to the results: what was measured, exactly what the server interval covers, the cold-start procedure, and the scaling exit (ADR 0002). No figure appears in it unless it is taken from the generated results.

## Considered options

- **A transaction rolled back per test:** rejected. better-sqlite3 would handle it (triggers roll back, nested transactions become savepoints), but it needs a shared-connection harness, hides real commit behaviour, and leaves the reset path untested.
- **A fresh Nest app per test:** rejected. Boot cost grows with the number of tests, for no extra isolation over clearing.
- **Component tests with Testing Library:** rejected. Through jsdom they mostly re-check Mantine and TanStack wiring.
- **No UI tests:** rejected. Nothing would catch a broken SPA build or broken serving before the deploy does.
- **A load tool (k6, autocannon):** rejected. It answers a concurrency question the requirements do not ask.
- **Pass or fail on client time:** rejected. The result would depend on where the script runs from, which the app does not control.
- **A performance test in CI:** rejected. Shared CI runners make timings flaky, and the target is about the deployed app.

## Consequences

- The `Server-Timing` header is on every `/api` response in production. It reveals only a duration.
- `on-headers` is a new runtime dependency of `api`.
- `pnpm test` stays browser-free. The e2e job adds a Chromium install to CI, in parallel with the other jobs.
- A change to the seed that moves the planted Senior Data Scientist · NL employee or the question 4 total fails the seed tests and the e2e test together, since both read the same expected values.
- Re-running `pnpm perf` overwrites only the generated results. The hand-written note changes only when what is measured changes.
