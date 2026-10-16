# API contract and shared types

The contract between the API and the UI is the seam that integration tests assert against, and drift across it is a class of bugs we can remove. So both apps share one set of Zod schemas from a workspace package. Money crosses the wire as integers, and it is turned into text, or text into integers, in exactly two functions.

## Shared package

`packages/contract`, imported as `@acme/contract`, depends only on Zod. It holds:

- The reference data (countries with their currency and minor-unit exponent, departments, job titles) and the exchange rate table. These move here from `api/src/domain/`.
- A Zod schema for every request and response body, plus the problem-details error body. Types are derived with `z.infer`.
- `parseMoney` and `formatMoney` (see *Money on the wire*).

The pay statistics, payroll totals, conversion, compa-ratio and outlier functions stay in `api/src/domain/`, because the UI only displays what the API computed. ADR 0002's boundary rule is amended: `domain/` may import `@acme/contract`, and nothing else.

The UI imports the reference lists, the rate table, the schemas and the money functions only from `@acme/contract`. There is no reference-data endpoint.

## Build and module format

There is no codegen, but there is a build: Nest's `tsc` will not compile a workspace package's TypeScript source.

- `contract` is **ESM only**. It sets `"type": "module"` and an `exports` map pointing at `dist/index.js` and `dist/index.d.ts`, and it emits declaration maps. It never uses top-level `await`.
- Nest stays CommonJS and loads it through Node 24's unflagged `require(esm)`. `api` uses `module: nodenext`, which TypeScript 5.8+ type-checks for `require` of ESM. Vite and Vitest read ESM natively.
- `contract` builds with a plain `tsc -p tsconfig.build.json`. pnpm orders the build: `pnpm -r run build` runs workspaces in dependency order, so `contract` builds before `api` and `web`. Railpack runs the root `build` script, so the same order holds on Railway.
- The root `test` and `typecheck` scripts start with `pnpm --filter @acme/contract build`, so they never read a stale `dist`. CI runs the same scripts. `dev` runs `tsc -w` for `contract` next to `nest start --watch` and `vite`. A change to `contract` may need a Nest restart in watch mode (noted in the README).
- Both apps always consume `dist`, with no Vite alias and no tsconfig `paths` to the source.
- **Jest is ruled out for `api`**, because its module system does not support `require(esm)`. `api` tests use Vitest with `unplugin-swc`, so Nest's decorator metadata, and with it DI, works.
- pnpm is pinned in `packageManager`. ~~The root `package.json` allows `better-sqlite3`'s install script under that pnpm version's key (`onlyBuiltDependencies` on pnpm 10). Without it, the native binding is silently missing, locally and on Railway.~~
  *Amended during the API skeleton (#11):* pnpm is pinned at 12, which reads build permissions from `allowBuilds` in `pnpm-workspace.yaml`, not from `package.json`. `better-sqlite3` is listed there. Version 13 has no install script: it ships prebuilt N-API binaries for Windows and Linux (glibc and musl, x64 and arm64), so the native binding no longer depends on an install script running. The entry stays in case a later version brings one back. `@swc/core` and `esbuild` are allowed there too, because pnpm 12 fails an install that has unapproved build scripts.

**First-slice checks.** These are added to the ones in ADR 0002:

- Nest boots and imports a value from `@acme/contract`.
- A Vitest test in `api` imports from `@acme/contract` and resolves a Nest provider through DI.

## Endpoints

Everything is under `/api`. The SPA fallback excludes `/api`, so an unknown `/api` route returns a JSON 404 problem, never `index.html`. One HTTP test pins this.

| Method & path | Purpose | Success |
|---|---|---|
| `GET /api/employees` | the list | 200 |
| `GET /api/employees/:id` | view | 200 / 404 |
| `POST /api/employees` | add | 201, the created employee, a `Location` header |
| `PUT /api/employees/:id` | edit (full replacement) | 200, the employee / 404 |
| `DELETE /api/employees/:id` | remove (hard delete) | 204 / 404 |
| `GET /api/pay-statistics?jobTitle=&country=` | question 1; both parameters required | 200 |
| `GET /api/payroll-totals` | question 2: per country, per department and the grand total, in one response | 200 |
| `GET /api/pay-comparison?jobTitle=` | question 3: every country in fixed order | 200 |
| `GET /api/outliers` | question 4 | 200 |
| `GET /api/health` | runs `SELECT 1`; Railway's healthcheck points here | 200 |

- Edit is `PUT`, because the form always sends every field. It reuses the create schema as is.
- A valid title or country with no employees returns 200 with headcount 0 and null stats (ADR 0001). An unknown title or country, or a missing required parameter, is a 400.

## Listing

- **Pagination** is page-based. `page` counts from 1 and defaults to 1. `pageSize` defaults to 25, with a maximum of 100. The response is `{ items, page, pageSize, total }`. A page past the end returns 200 with empty `items`. A non-integer page, or a page size outside 1–100, is a 400.
- **Search:** `q` is ADR 0002's per-word prefix match. It is trimmed, and its maximum length is 100. An empty or whitespace-only `q` means no search.
- **Filters:** `country`, `department` and `jobTitle` each take one optional exact value from the reference lists, and they combine with AND.
- **Order** is fixed at `name, id`. There is no sort parameter.
- **Query schemas are strict:** an unknown parameter is a 400, so a typo like `?contry=IN` is not silently ignored.

### Outliers

`GET /api/outliers` takes the list's filters and uses its envelope. It also takes an optional `direction=below|above`.

- **Ranking:** most extreme first, measured as distance from 1.00. Distances are compared exactly by cross-multiplying, `|s₁−m₁|·m₂` against `|s₂−m₂|·m₁`. That product can exceed 2⁵³, so the comparison uses BigInt inside the domain function. Ties order by `name, id`.
- **With a direction,** the ranking covers that direction only. With no direction, both directions are ranked together. The parameter exists because underpayment is bounded below by 0 and overpayment is not. A mixed ranking therefore buries the underpaid, who are the group HR acts on first.
- **Filters narrow which outliers are shown, never the peer group.** The median is always taken over the whole peer group (job title and country), whatever the department filter. An HTTP test pins it: a department filter leaves the reported median unchanged.
- **Pagination is in memory.** Being an outlier is a domain decision, not SQL. So the service reads every peer group the filters touch, the domain ranks the outliers, and the service slices out the page and counts the total.

## Validation and errors

- A small custom `ZodValidationPipe` (about 20 lines) is applied to each parameter: `@Body`, `@Query` and `@Param('id')` (a positive integer). The UI's forms validate against the same schema objects.
- Errors are RFC 9457 Problem Details (`application/problem+json`), produced by one global exception filter:

  ```json
  { "type": "about:blank", "title": "Validation failed", "status": 400,
    "detail": "Request body is invalid",
    "errors": [{ "path": ["annualSalaryMinor"], "message": "Must be greater than 0" }] }
  ```

  `errors[].path` is the Zod issue path, so the UI attaches each message to its form field without a mapping table.
- **Statuses:** 400 for any request that fails its schema, query or body. 404 for an unknown employee or an unknown `/api` route. 500 is a generic problem body with no stack trace or SQL in it, and the detail is logged on the server.
  *Amended during the web shell (#12):* a deliberate 5xx `HttpException` (e.g. `ServiceUnavailableException`) keeps its status, with the same generic body: its title is the status text and its detail never carries the exception's own message, which is logged like any 5xx. Any other error is a 500.
- **Responses are not parsed at runtime.** Services are typed through `z.infer`, and the HTTP tests parse every response with its response schema.

**Employee request body:** `{ name, jobTitle, department, country, annualSalaryMinor }`. The schema is strict and has no `currency` field (it follows from country), so a request that sends one is rejected.

- `name` is trimmed, 1–100 characters.
- `annualSalaryMinor` is an integer, greater than 0 and at most `900_000_000_000`. Since 10,000 × 9×10¹¹ is just under `Number.MAX_SAFE_INTEGER`, ADR 0001's safe-integer assertion on sums cannot fire while no currency has more than 10,000 employees. ADR 0001 sums per currency, so the bound is per currency headcount, not per organization. Nothing caps headcount, so the assertion stays as the safety net. In INR, the cap is ₹9 billion a year.

## Money on the wire

Money is `{ "amountMinor": 1250000, "currency": "INR" }` everywhere. `amountMinor` is a JSON number: every amount is bounded and asserted below 2⁵³, so strings would only add parsing.

| Response | Shape |
|---|---|
| Employee | `{ id, name, jobTitle, department, country, annualSalary: Money }` |
| Pay statistics | `{ jobTitle, country, headcount, smallGroup, min, median, average, max }`, each stat `Money \| null` |
| Payroll totals | `{ byCountry: [{ country, headcount, local, usd, sharePermille }], byDepartment: [{ department, headcount, usd, sharePermille }], grandTotal: { headcount, usd }, rates }` |
| Pay comparison | `{ jobTitle, rows: [{ country, headcount, smallGroup, min, median, average, max }], rates }`, every country in fixed order, stats in USD |
| Outliers page | the list envelope `{ items, page, pageSize, total }` plus `smallGroupHeadcount`, and with `direction=below` also `costToReachThreshold: { usd }` and `rates` |
| Outlier | `{ employee, peerMedian: Money, peerHeadcount, compaRatioHundredths, direction: "below" \| "above", gapMinor }` |

- USD amounts stay in cents on the wire. Showing whole dollars is formatting only (ADR 0001).
- `compaRatioHundredths` is an integer that the domain has already rounded with ADR 0001's directional rule (`79` shows as "0.79"). The UI never rounds a compa-ratio.
- Every response that contains a USD figure carries `rates: { source, asOf }`, so the response states which rate table produced it.

Added by ADR 0004 (UI structure):

- **`sharePermille`** is a row's **share of payroll**: its USD total as tenths of a percent of the USD grand total, rounded half up once in the domain (ADR 0001). 421 shows as "42.1%". It is `null` when the grand total is 0. The UI only places the decimal point. Shares may not add up to 1000.
- **`smallGroupHeadcount`** counts the employees matching the outlier filters whose peer group has fewer than 5 employees, so they were not checked. It is computed in the same pass that reads the peer groups.
- **`gapMinor`** is the **gap to 0.80**, in the peer group's local currency: the smallest salary with `100·salary ≥ 80·median`, minus the current salary. It is computed in integers as `(80·median + 99) div 100 − salary`, so it is always at least 1. It is set on every underpaid row and `null` on overpaid ones, whatever the `direction` parameter.
- **`costToReachThreshold`** is the **cost to reach 0.80**: the sum of `gapMinor` over every underpaid employee matching the filters (all pages, not only the current one), in USD. Following ADR 0001 it is summed per currency, each subtotal is converted once, and the results are added. It is present only with `direction=below`, because a mixed list has no single cost to state, and that response then carries `rates`.
- **Fixtures:** a share that rounds half up, a zero grand total, a gap where `80·median` divides exactly by 100, and a cost spanning two currencies.

### Text and integers

`parseMoney(input, currency)` and `formatMoney(money, locale, options)` in `@acme/contract` are the only places where money is converted between text and integers. Both work on strings and never do float arithmetic: no `parseFloat(x) * 100`, no `amountMinor / 10 ** exp`.

- `parseMoney` splits the typed text into whole and fraction digits and returns minor units. It rejects more decimals than the currency's exponent allows (JPY has 0). Its input format is pinned to the app's single `en` locale (ADR 0004): digits, optional comma thousands separators and an optional `.` decimal point, with no currency symbols. Anything else is rejected.
- `formatMoney` has a plain-input option (no grouping, no symbol), used to pre-fill the edit form.
- `formatMoney` builds the decimal string from the integer and passes it to `Intl.NumberFormat`, which formats decimal strings exactly. Its options include whole units for payroll totals. Whole units are rounded half up in integers first (ADR 0001), then formatted with zero fraction digits, so the result doesn't depend on Intl's `roundingMode`.
- **Fixtures:**
  - `parseMoney`: JPY with no decimals, too many decimals rejected, an amount at the cap, comma thousands separators accepted, and `"1.250.000,50"` rejected.
  - `formatMoney`: JPY, an amount near the cap, whole-USD rounding including an exact half dollar, the plain-input option, and the symbols of all supported currencies being distinct in `en`.

## Considered options

- **OpenAPI generated from Nest decorators, with typed clients generated for the UI:** rejected. Every endpoint would need decorators, codegen would be a build step, and the reference lists would still need sharing. The cost is that we lose generated docs: the README documents the endpoints instead. If external clients appear, OpenAPI generated from the Zod schemas is the upgrade path.
- **Types duplicated in each app:** rejected. That is exactly the drift this ADR removes.
- **`class-validator` DTOs:** rejected. They are a second schema language next to Zod.
- **`nestjs-zod`:** rejected. Its DTO classes and Swagger integration only matter with OpenAPI, and it is one more dependency to keep in step with Nest and Zod, in place of 20 lines.
- **Dual CJS and ESM output (tsup):** rejected. It adds a bundler to work around a problem Node 24 removes.
- **CommonJS-only `contract`:** rejected. Vite does not pre-bundle linked workspace packages, so dev would need an `optimizeDeps` workaround.
- **A source-only package compiled by each app:** rejected. Nest's `tsc` refuses files outside its `rootDir`.
- **TypeScript project references:** rejected. `nest build` ignores `tsc -b`, so the build order would have two sources of truth.
- **A reference-data endpoint:** rejected. It duplicates `contract` and adds a request before the filters render.
- **`PATCH` for edit:** rejected. It needs a partial schema and presence logic that the form never uses.
- **Cursor pagination:** rejected. The UI wants page numbers and a total, and offset over about 10,000 rows on `(name, id)` is cheap.
- **Multi-value filters and a sort parameter:** not needed by any question. Both can be added later without breaking the contract.
- **422 for body validation, 400 for malformed requests:** rejected. The UI handles both the same way.
- **Amounts as decimal strings:** rejected. They push parsing into every consumer and invite `parseFloat`.
- **A float compa-ratio:** rejected. The UI would re-round it and could cross the 0.80 or 1.20 boundary.
- **One `currency` at the top of pay statistics:** rejected. One Money shape means one schema and one formatter.

## Consequences

- The two apps are coupled through `contract`. They live in one repo and deploy as one service, so they can never run different versions.
- A change to a reference list or to the rate table is a code change and a deploy (already accepted in ADR 0001).
- The endpoints are documented by hand in the README, not generated.
- `require(esm)` is recent. If it fails on any target, the fallback is dual output from `contract`.
