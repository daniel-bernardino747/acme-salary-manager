# UI structure: library, data fetching, routing, forms and the four screens

The four pay questions are the value of the app, so this ADR fixes what each screen shows and how the UI stays in step with the API. Visual design (theme, hierarchy, spacing, empty- and error-state styling) is out of scope here. It comes in a time-boxed polish pass with `/impeccable` after the slices work, constrained to Mantine's theme (`createTheme`), with no Tailwind.

## Libraries

- **Mantine** (core, form, charts), with no separate table library. Mantine `Table` and `Pagination` are enough for server-paged tables with a fixed order (ADR 0003). `@mantine/charts` (a thin Recharts wrapper) is used by one screen only: the cross-country comparison.
- **TanStack Query v5** for data fetching and caching.
- **TanStack Router**, with code-based routes and search params validated by Zod.

## Data fetching

- **Every employee mutation invalidates every query.** Add, edit and delete call `queryClient.invalidateQueries()` with no key on success. Every query is derived from the employees table, so any mutation can make any query stale. Only queries on screen refetch, and the rest refetch when visited. A targeted key map would be logic to test and to get wrong.
- **No optimistic updates.** The target of under 500 ms per request (requirements) makes a round-trip fast enough that rollback logic is not worth it.
- Query keys are `[resource, params]`, e.g. `['employees', { page, q, country }]`.
- Paged queries use `placeholderData: keepPreviousData`, so a table does not flash empty between pages.
- `staleTime` is 30 s, and 4xx responses are not retried.
- **Search is debounced** about 300 ms before `q` reaches the URL, and with it the query key. The search box keeps local state, and the debounce lives in exactly that one place.
- **After a delete:** the deleted employee's detail query is removed (`removeQueries`), and the UI navigates to the list. If the current list page comes back empty and `page > 1`, it steps back one page.

### `apiFetch`

One wrapper sends and receives JSON and returns the typed body (`z.infer` types from `@acme/contract`). Successful responses are not parsed at runtime (ADR 0003).

- A **204** has no body and is not parsed.
- A non-2xx response throws an `ApiProblem` that carries the Problem Details body.
- A **non-JSON error response** (e.g. an HTML 502 while Railway restarts the service) becomes a generic `ApiProblem`, never a JSON parse error.

Both cases are unit tested.

## Routing

All list and question state lives in URL search params. The URL schemas reuse the reference enums from `@acme/contract`, but unlike the API's strict query schemas they are lenient: an invalid or unknown value falls back to its default (`.catch()`) instead of showing an error page. The UI never sends a bad value to the API.

| Path | Screen | Search params |
|---|---|---|
| `/` | redirects to `/pay/payroll`: the app opens on the grand total, the first number the HR Manager asks for (ADR 0001) | |
| `/employees` | list | `page, q, country, department, jobTitle` |
| `/employees/new` | add | |
| `/employees/$id` | view | |
| `/employees/$id/edit` | edit | |
| `/pay/statistics` | question 1 | `jobTitle, country` |
| `/pay/payroll` | question 2 | |
| `/pay/comparison` | question 3 | `jobTitle` |
| `/pay/outliers` | question 4 | `page, direction, country, department, jobTitle` |
| `*` | not found | |

- Navigation is a Mantine `AppShell` sidebar: "Employees", then a "Pay questions" group listing the four, each labelled as the question it answers.
- Changing `q`, a filter or the outlier direction resets `page` to 1. Search updates replace the history entry; page changes push one.
- Add and edit are pages, not modals: they can be linked, Back works, and they are simpler to test. The delete confirmation is the only modal.

## Copy and locale

- **The app has one locale, `en`.** All money displays in it, e.g. `₹1,250,000.50`, not with en-IN lakh grouping. Money is always formatted with `formatMoney`, with its own currency's symbol. The supported currencies have six distinct symbols in `en` (`$ £ € ₹ R$ ¥`), and a `formatMoney` fixture asserts they stay distinct, so a currency added later with a clashing symbol fails a test instead of showing an ambiguous `$`.
- **A job title is never pluralized in copy.** Titles include the level, and "Senior Software Engineers" is not a title. Copy says "employees with the title Software Engineer".
- The UI does no money arithmetic. Its only rounding is `formatMoney`'s whole-unit option, which rounds in integers (ADR 0003). Ratios and shares arrive as integers in their display unit (`compaRatioHundredths`, `sharePermille`), and the UI only places the decimal point, with string operations.

**Known limitation:** locale-aware input and display. Money is typed and shown in `en` format only.

## Forms: add and edit

The form values are `{ name, jobTitle, department, country, annualSalary: string }`. The form schema is the contract's employee schema with `annualSalaryMinor` replaced by a text field. Its refinement runs `parseMoney(text, currencyOf(country))`. Mantine's `transformValues` produces the exact request body. The other four fields are validated by the contract's own schema objects, so the UI and the API cannot disagree on name length, reference lists or the salary cap. Forms use `@mantine/form` with a Zod resolver.

- **Salary input** is a `TextInput`, not a `NumberInput`, because `NumberInput` returns floats. The currency derived from the selected country is shown as a right-side label and is never editable. Until a country is picked, the salary field is disabled with "Pick a country first."
- **The input format is pinned:** digits, optional comma thousands separators and an optional `.` decimal point, with no symbols (`en`, matching the UI). `parseMoney` rejects more decimals than the currency allows (JPY 0) and rejects other formats. Its fixtures include `"1.250.000,50"` being rejected.
- **A live preview** under the field shows the parsed amount through `formatMoney`, e.g. "= ₹1,250,000.50 a year". It catches separator mix-ups and extra zeros before save.
- **When a country change alters the currency** and the salary field has a value, the field is cleared with "Salary was in USD; enter it in JPY." Otherwise an edit from US to Japan would keep 120,000 and silently mean ¥120,000. A change that keeps the currency (Germany ↔ Netherlands) leaves the salary as it is.
- **Edit pre-fill** uses `formatMoney` with its plain-input option (no grouping, no symbol). The UI never converts money any other way.
- **Validation** runs per field on blur and on all fields on submit.
- **Server errors:** each `ApiProblem.errors[]` entry is mapped onto a field by `path[0]`, with one rename: `annualSalaryMinor` → `annualSalary`. An unmapped path, or a problem with no `errors` (404, 500, or the generic problem from a non-JSON response), shows as a form-level alert above the buttons and keeps what the user typed. The mapping is a pure function with its own test.
- **Submit** shows loading and is disabled while pending. On success it invalidates everything, shows a notification ("Saved Priya Sharma"), and navigates to `/employees/$id`. Cancel goes back.
- There is no unsaved-changes guard: five fields, little to lose.
- The form schema, JPY and too-many-decimals cases included, is unit tested in `web` without a DOM.

## Screens

Every query screen has three states: a skeleton matching the final layout while loading, an inline alert with Retry on error, and the data. One shared `QueryState` component renders them, so all screens behave the same.

### Employee list (`/employees`)

- A toolbar has the search box, three clearable filter `Select`s (country, department, job title) and "Add employee".
- Columns: Name, Job title, Department, Country, Salary. Salary is in local currency with exact minor units and its own currency symbol. The whole row links to the view.
- Below the table: "26–50 of 9,812" and `Pagination`. The page size is fixed at 25, with no selector.
- An empty result says "No employees match these filters." with "Clear filters". An empty organization says "No employees yet." with the add button.

### Employee view (`/employees/$id`)

- Name, job title, department, country, and salary with its currency.
- Actions: Edit; Delete (confirmation modal naming the employee, then the delete flow above); and **"Compare with peers"**, linking to `/pay/statistics?jobTitle=…&country=…`.
- An unknown id shows "Employee not found" with a link to the list.
- The view page does not show a compa-ratio. "Compare with peers" answers that one click away.

### Question 1: pay statistics (`/pay/statistics`)

- Searchable job-title and country `Select`s, bound to the URL, with no defaults. Until both are picked, a one-line prompt shows and nothing is fetched.
- The heading is "Software Engineer in India · INR". Then headcount, min, median, average and max as figures, in local currency with **exact minor units**. Whole units are for payroll totals only (ADR 0001), and this median must match the peer median on the outliers screen digit for digit.
- No chart. Five numbers for one group read better as numbers.
- **Small group (1–4):** an inline notice above the figures: "Only 3 employees. With so few people these figures say little about the role, and they reveal individual pay. Outlier checks skip groups under 5." The figures are still shown (ADR 0001).
- **Empty group:** "No employees with the title Software Engineer in India." No figures, never zeros.
- Links: "See these 47 employees" → `/employees?jobTitle=…&country=…`; "Compare across countries" → `/pay/comparison?jobTitle=…`; **"See who's paid out of line"** → `/pay/outliers?jobTitle=…&country=…`.

### Question 2: payroll totals (`/pay/payroll`, the landing screen)

- Headline: "Annual payroll: $412,380,117 · 10,000 employees", whole USD.
- **By country:** Country, Headcount, Local total, USD total, Share. Totals are in whole units; the local total is in the country's currency. Germany and the Netherlands each show their own EUR total.
- **By department:** Department, Headcount, USD total, Share.
- **Share of payroll** comes from the API as `sharePermille` and is shown as "42.1%". A `null` share (a zero grand total) shows as "–". A row whose total is above 0 but whose share rounds to 0 shows **"<0.1%"**, not "0.0%".
- Both tables are sorted by USD total, highest first (a client-side sort, not arithmetic). Every row links to the filtered employee list.
- No chart: a sorted table with a share column already reads as a ranking.
- Footnote, rendered from the response's `rates`: "USD amounts converted at fixed rates from <source>, as of <date>. Each total is rounded on its own, so the parts may not add up exactly to the total, or to 100%."
- An empty organization shows `$0` with a prompt to add an employee.

### Question 3: cross-country comparison (`/pay/comparison`)

- A searchable job-title `Select` bound to `?jobTitle`, with a prompt until one is picked.
- **A horizontal bar chart of the median in USD**, one bar per country, above the table. Countries with no employees are left out of the chart. Small groups are drawn in a distinct muted tone, with a legend entry "fewer than 5 employees", so one person's pay does not read as a national median. Bar length comes from `amountMinor` as a plain number: geometry only. Tooltips and axis labels use `formatMoney`.
- **Table:** Country, Headcount, Min, Median, Average, Max, in **whole USD**. These figures carry two roundings and an exchange-rate approximation, so cents would imply precision they do not have. Rounding happens in integers, via `formatMoney`'s whole-unit option. A small group has a "Small group" badge in its headcount cell. An empty country shows "No employees". Each row links to `/pay/statistics?jobTitle=…&country=…`.
- **The chart and the table are both sorted by median USD, highest first**, in the same order so they pair row for row. Ties are ordered by country name. Countries with no employees go last in the table. Countries have no natural order, and the ranking is the answer.
- Footnote: "Converted to USD at fixed rates from <source>, as of <date>. Each figure is converted from the local figure as shown, so it may differ slightly from converting individual salaries. **Amounts are nominal, not adjusted for cost of living.**" Purchasing-power adjustment is out of scope (requirements).

### Question 4: outliers (`/pay/outliers`)

- **Direction:** a `SegmentedControl` with Underpaid | Overpaid | All, **defaulting to Underpaid**, because the underpaid are who HR acts on first (ADR 0003). In the URL, `direction=below|above|all` defaults to `below`, and `all` omits the API parameter.
- Filters are the list's country, department and job title. A hint by the filters reads: "Filters choose which employees are shown. Each median always covers everyone with the same title in the same country."
- A static note at the top: "Compa-ratio is salary ÷ the median salary for the same title in the same country. Below 0.80 or above 1.20 is flagged. Groups with fewer than 5 employees aren't checked: their median isn't meaningful." It is followed by the count from `smallGroupHeadcount`: "12 employees in small groups weren't checked." So an empty result is never ambiguous between "nobody is out of line" and "nobody could be checked".
- **Headline**, from `total`: "38 employees paid below 0.80 of their peer median" (or "above 1.20", or "outside 0.80–1.20" for All). With Underpaid it continues: "Bringing them to 0.80 would cost $X a year." The cost is in whole USD, with the rates footnote.
- **Table**, 25 per page, in the API's ranking order (most extreme first): Name, Job title, Country, Department, Salary, Peer median, Compa-ratio, Gap to 0.80, Peers.
  - Salary, peer median and gap are in local currency with exact minor units, matching question 1 digit for digit.
  - Compa-ratio shows `compaRatioHundredths` with the decimal point placed ("0.74") and a Below or Above badge.
  - Gap to 0.80 is shown on underpaid rows and is blank on overpaid ones.
  - Name links to `/employees/$id`. Peer median links to `/pay/statistics?jobTitle=…&country=…`.
- Empty result: "No underpaid employees for these filters." The small-group count still shows.

## Contract amendments (ADR 0003)

This ADR adds to ADR 0003's response shapes, which are updated in place:

- **Payroll totals:** `headcount` and `sharePermille` on every country and department row, and `headcount` on the grand total.
- **Outliers:** `smallGroupHeadcount` in the response, `gapMinor` on each row, and `costToReachThreshold` when `direction=below`.
- **Money text functions:** the `parseMoney` input format above, and a plain-input option on `formatMoney`.

## Considered options

- **shadcn/ui:** rejected. It brings Tailwind and copy-in components we would own and maintain.
- **MUI:** rejected. It is heavier and more opinionated, and its useful DataGrid features are paid or overkill.
- **TanStack Table:** rejected. Server paging with a fixed order needs none of it.
- **SWR, RTK Query, plain `useEffect` fetching:** rejected. SWR has a weaker mutation and invalidation story. RTK Query brings Redux. Plain fetching rebuilds caching and race handling by hand.
- **Targeted invalidation per mutation:** rejected. It is logic to test and to get wrong, for little saving.
- **Optimistic updates:** rejected. See *Data fetching*.
- **React Router:** rejected. TanStack Router types and validates search params, which hold all list and question state.
- **Modals for add and edit:** rejected. They cannot be linked to, and they break Back.
- **`NumberInput` for salary:** rejected. It returns floats.
- **Locale-aware money input and display:** deferred. This is the known limitation above.
- **An unsaved-changes guard:** not needed for five fields.
- **Charts for questions 1 and 2:** rejected. Numbers and a ranked table read better there.
- **A share computed in the UI, or basis points displayed to one decimal:** rejected. Either would put a division or a second rounding in the UI.
- **Comparison in fixed country order:** rejected. Countries have no natural order, and the ranking is the answer.
- **All as the default outlier direction:** rejected. A mixed ranking buries the underpaid.
- **Compa-ratio on the employee view:** deferred. It needs a new field, and "Compare with peers" covers it.
- **A page-size selector:** not needed.

## Consequences

- The web app's testable pure parts are the form schema, the problem-to-field mapping, `apiFetch` (204 and non-JSON errors), and the decimal-point placement for ratios and shares. None needs a DOM.
- `@mantine/charts` and Recharts enter the bundle for one chart.
- A future second locale touches `parseMoney`, `formatMoney` and every copy string, not the screens' structure.
