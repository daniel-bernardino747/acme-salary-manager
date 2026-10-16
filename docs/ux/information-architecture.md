# Information architecture: the HR Manager's app

The app has one user, the HR Manager. Today it is organized around its four pay questions, each written out as a sentence in the sidebar, and it opens on a payroll table. This document reorganizes it around the jobs that user does most often (see `hr-manager-research.md`). It uses only the existing endpoints and keeps every route in ADR 0004.

**Status:** proposal, waiting for approval. No UI code depends on it yet.

## Principles

1. **Lead with the answer, then the method.** Every screen opens on its figure or its list. The definitions and footnotes stay, but below the figures, in smaller type.
2. **People come first.** Finding one employee is the most frequent job. Search is one keystroke away from every screen.
3. **Aggregates lead to people.** Every total, median or count links to the employees behind it, and every employee links to their peer group.
4. **Short labels in the HR Manager's words.** Each question stays on its page as a subtitle, so the four questions are still answered in the UI.
5. **The phone is for lookups.** On a phone the jobs are "find someone" and "what do we pay X in Y". Tables become stacked rows there, never a sideways scroll for the key figure.

## What the home screen is for

`/` becomes an **Overview** screen instead of a redirect to `/pay/payroll`. It answers the first questions of the day in one view and is the start point for everything else.

It serves these jobs, in order (job numbers are the research ranking):

1. **Find an employee** (jobs 1–3: look up, correct a salary, remove a leaver): a large search field at the top. It opens the same global search as the header, so typing a name and pressing Enter opens that employee, one click from Edit.
2. **Answer "what do we pay X in Y"** (job 4, including offer checks): a job title and a country picker, which opens pay statistics for that pair.
3. **See who is paid out of line** (jobs 5 and 7): the number of underpaid employees, the cost to reach 0.80, and the five most extreme underpaid names. Below that, the number of overpaid employees.
4. **Payroll at a glance** (job 6, and ADR 0001's "first number the HR Manager asks for"): the annual payroll total and headcount, and the share of payroll per country as a compact ranked list.

**Why not keep `/pay/payroll` as the landing page?** The research calls that defensible if the header carries search, Add employee and the underpaid link, and this proposal does put all three in the header. But the payroll tables serve job 6 (monthly to quarterly), while the jobs above it come daily or weekly. The Overview keeps the grand total, so the first number on screen is unchanged, and it adds the start of every more frequent job. If you'd rather keep the payroll landing, everything else in this document still holds; only the Overview section and the `/` amendment drop out.

### Figures that earn a place, and where each comes from

| Figure | Endpoint (existing) | Why it's here |
|---|---|---|
| Annual payroll, whole USD, and headcount | `GET /api/payroll-totals` → `grandTotal` | ADR 0001: the first number the HR Manager asks for |
| Share of payroll per country, ranked | same response → `byCountry[].sharePermille` | where the money goes, in one glance; each row links to that country |
| Underpaid count and cost to reach 0.80 | `GET /api/outliers?direction=below&page=1&pageSize=25` → `total`, `costToReachThreshold` | the group HR acts on first (ADR 0003) |
| The five most extreme underpaid employees | same response → `items[0..4]` (already ranked by the API) | names to act on, one click from home |
| Overpaid count | `GET /api/outliers?direction=above&page=1&pageSize=25` → `total` | the other half of "out of line", without burying the underpaid |
| Employees in small groups, not checked | the underpaid response → `smallGroupHeadcount` | so a zero is never ambiguous |
| Rates source and as-of date | `rates` on both responses | footnote, wherever USD appears |

The underpaid request is the same query key as the outliers screen's default (`['outliers', { page: 1, direction: 'below' }]`), so opening the outliers screen from home is served from the cache.

Not on home, on purpose: department totals (payroll screen), the cross-country chart (it needs a job title), and any figure the API does not return (for example "salaries changed this week": there is no history).

## Navigation

### Groups, labels and order

| Group | Label | Route | Page subtitle (the question) |
|---|---|---|---|
| — | **Overview** | `/` | — |
| — | **Employees** | `/employees` | — |
| Pay | **Pay ranges** | `/pay/statistics` | What do we pay for a job title in a country? |
| Pay | **Outliers** | `/pay/outliers` | Who is paid out of line with their peers? |
| Pay | **Payroll** | `/pay/payroll` | What is our payroll total, by country and department? |
| Pay | **Across countries** | `/pay/comparison` | How does pay for a job title compare across countries? |

- The group heading is **Pay**, not "Pay questions": the labels are places, not questions.
- **Order** follows the research ranking (`hr-manager-research.md`, section 3): Employees serves jobs 1–3, Pay ranges job 4, Outliers jobs 5 and 7, Payroll job 6, Across countries job 8.
- **"Pay ranges"** is what HR people call min to max for a role. The page keeps the glossary's term, *pay statistics*, in its heading and copy.
- **Outliers** shows the underpaid count as a badge in the nav (from the cached underpaid query), so the to-do count is visible from every screen.

### One click from anywhere

| Action | Where | How |
|---|---|---|
| **Search an employee** | header, every screen | a search field (desktop) or a search icon (phone) opening a global search; `Ctrl`/`⌘`+`K` and `/` also open it |
| **Add employee** | header, every screen | a primary button (desktop); in the drawer and on the Employees screen (phone) |
| **Open underpaid outliers** | nav | "Outliers" with its count badge, defaulting to Underpaid |
| **Look up pay for a role** | global search and Overview | type a job title in global search, or use the Overview picker |

### Global search

One overlay (Mantine Spotlight), opened from the header, the Overview field or the keyboard. It searches:

- **Employees**, by name, through `GET /api/employees?q=…&page=1&pageSize=8`: the list's own endpoint and search rule. Each result shows the name, then the job title and country. Enter opens the employee.
- **Job titles and countries**, from the reference lists in `@acme/contract`, with no request. Picking a job title opens pay statistics for it, with the country still to pick (or across countries).
- **Actions:** Add employee, Underpaid employees, Overpaid employees, Payroll.
- A last line, "See all employees matching 'Sha'", opens `/employees?q=Sha`.

The query is debounced like the list's search box (300 ms) and needs at least 2 characters.

## Cross-links between screens

Existing links stay. New ones are in **bold**.

| From | Element | To |
|---|---|---|
| Overview | payroll total | `/pay/payroll` |
| Overview | **a country's share row** | **`/employees?country=…`** |
| Overview | **underpaid count / "See all"** | **`/pay/outliers`** |
| Overview | **an underpaid name** | **`/employees/$id`** |
| Overview | **overpaid count** | **`/pay/outliers?direction=above`** |
| Overview | **job title and country picker** | **`/pay/statistics?jobTitle=…&country=…`** |
| Employee list | a row | `/employees/$id` |
| Employee list | **with both job title and country filtered: "Pay ranges for this group"** | **`/pay/statistics?jobTitle=…&country=…`** |
| Employee view | "Compare with peers" | `/pay/statistics?jobTitle=…&country=…` |
| Employee view | **the peer median in the new Peers panel** | **`/pay/statistics?jobTitle=…&country=…`** |
| Employee view | **"See the 47 peers"** | **`/employees?jobTitle=…&country=…`** |
| Employee view | **job title / country / department values** | **`/employees?jobTitle=…` / `?country=…` / `?department=…`** |
| Pay statistics | see these employees / compare across countries / who's paid out of line | as today |
| Payroll | a country or department row | `/employees?country=…` / `?department=…` (as today) |
| Payroll | **"Outliers in this country"** on a country row (desktop: row action) | **`/pay/outliers?country=…`** |
| Across countries | a row | `/pay/statistics?jobTitle=…&country=…` (as today) |
| Across countries | **a bar in the chart** | **the same pay statistics link** |
| Outliers | name / peer median | `/employees/$id` / `/pay/statistics?…` (as today) |
| Outliers | **"See all employees with these filters"** | **`/employees?country=…&department=…&jobTitle=…`** (the research's "filters carry across pages") |
| Not found | link | **Overview (`/`)** instead of payroll |

## What moves, merges or gets demoted

| Change | Today | After | Why |
|---|---|---|---|
| Landing screen | `/` redirects to the payroll tables | `/` is the Overview | Research: jobs 1–5 come daily or weekly; the payroll tables serve job 6, monthly to quarterly. The grand total, ADR 0001's "first number", moves onto the Overview, so it is still the first number seen. |
| Sidebar labels | four questions as sentences | short labels; each question becomes its page's subtitle | Scanning six words beats reading four sentences, and the questions are still on screen where they're answered. |
| Nav order | Employees, then the questions in requirements order | Overview, Employees, Pay ranges, Outliers, Payroll, Across countries | Frequency × urgency (research ranking). |
| Search | only inside the Employees screen | global, in the header, from every screen | The most frequent job took two clicks and a page load. |
| Add employee | only on the Employees screen | also in the header | Adding a hire is frequent and shouldn't depend on where you are. |
| Payroll screen | the landing page | a Pay page; its headline is also on the Overview | Its tables are for budget and finance questions, which come weekly or monthly, not daily. |
| Outliers: the method note | first, above the controls | below the headline, as a short "How outliers are flagged" line with the full text | Lead with the answer. The note's text is unchanged. |
| Outliers: filters | always open, three selects | desktop: one row; phone: behind a "Filters" button showing how many are active | On a phone, three selects pushed the answer below the fold. |
| Pay statistics: figures | five equal boxes | the **median** leads; min to max drawn as a range with the average marked; headcount beside it | The median is the figure HR quotes; equal boxes hide that. Every figure stays, with exact minor units. |
| Employee view | four boxed fields and a link | a header (name, title, country, department as links), the salary as the hero figure, a **Peers** panel (peer median, range, headcount from `GET /api/pay-statistics`), and Delete set apart from Edit | The view answered nothing about the person's pay. The peer context is one existing request. |
| Phone tables | sideways-scrolling tables (outliers needs 1,080 px) | stacked rows: name, then title · country, then the key money figure | The key figure was off-screen on a phone. |
| Brand | "ACME Salary Manager" as an H1 on every page | the brand in the header as text, not a heading; each page's title is its own H1-level heading | Each page's heading names the page. (The E2E test's level-2 headings are updated with it.) |

Nothing is removed. Every figure, footnote, small-group notice and route stays.

## Wireframes

Desktop is 1440 px with a 240 px sidebar. Phone is 390 px with a header and a drawer.

### Shell

```text
DESKTOP
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ACME Salary Manager      [🔍 Search employees, job titles…        Ctrl K]  [+ Add employee] │
├──────────────┬───────────────────────────────────────────────────────────────────────┤
│ Overview     │  <Page title>                                                          │
│ Employees    │  <question as subtitle>                                                │
│              │                                                                         │
│ PAY          │  …                                                                      │
│ Pay ranges   │                                                                         │
│ Outliers (14)│                                                                         │
│ Payroll      │                                                                         │
│ Across ctries│                                                                         │
│              │                                                                         │
│ ─────────────│                                                                         │
│ Rates as of  │                                                                         │
│ 2026-09-30   │                                                                         │
└──────────────┴───────────────────────────────────────────────────────────────────────┘

PHONE
┌──────────────────────────────┐        drawer
│ ☰  ACME Salary Manager   🔍  │        ┌──────────────────────┐
├──────────────────────────────┤        │ Overview             │
│ <Page title>                 │        │ Employees            │
│ <subtitle>                   │        │ PAY                  │
│ …                            │        │ Pay ranges           │
└──────────────────────────────┘        │ Outliers        (14) │
                                        │ Payroll              │
                                        │ Across countries     │
                                        │ [+ Add employee]     │
                                        └──────────────────────┘
```

### Global search (overlay)

```text
┌──────────────────────────────────────────────┐
│ 🔍 sha|                                       │
├──────────────────────────────────────────────┤
│ EMPLOYEES                                     │
│ › Rohan Shah      Customer Support Spec · IN  │
│   Aarav Shah      Data Analyst · IN           │
│   See all employees matching “sha”  →         │
│ JOB TITLES                                    │
│   Marketing Specialist → Pay ranges           │
│ ACTIONS                                       │
│   + Add employee                              │
│   Underpaid employees (14)                    │
└──────────────────────────────────────────────┘
Phone: the same overlay, full screen.
```

### Overview (`/`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Overview                                                                       │
│ [🔍 Find an employee by name…                                               ] │
│                                                                                │
│ ┌──── Paid out of line ─────────────────────┐ ┌──── What do we pay? ─────────┐ │
│ │ 14 underpaid                               │ │ [Job title       ▾]           │ │
│ │ $80,898 a year to bring them to 0.80       │ │ [Country         ▾]           │ │
│ │                                            │ │ [See pay ranges →]            │ │
│ │ Natália Azevedo  SWE I · Brazil      0.62  │ └──────────────────────────────┘ │
│ │ Rohan Shah       CS Spec · India     0.64  │ ┌──── Annual payroll ──────────┐ │
│ │ Diego Castro     QA Eng · Brazil     0.66  │ │ $669,197,391                  │ │
│ │ Kaito Ogawa      Support TL · Japan  0.66  │ │ 10,000 employees              │ │
│ │ Nancy Davis      SWE II · US         0.68  │ │ United States   ███████ 51.8% │ │
│ │ See all 14 underpaid →                     │ │ United Kingdom  ██      15.3% │ │
│ │ 6 overpaid →   7 in small groups not checked│ │ …               (7 rows)       │ │
│ └────────────────────────────────────────────┘ │ Payroll by country & dept →   │ │
│                                                 └──────────────────────────────┘ │
│ USD at fixed rates from <source>, as of <date>. Nominal, not adjusted for cost… │
└───────────────────────────────────────────────────────────────────────────────┘

PHONE
┌──────────────────────────────┐
│ Overview                     │
│ [🔍 Find an employee…      ] │
│ ┌ Paid out of line ─────────┐│
│ │ 14 underpaid              ││
│ │ $80,898 a year to 0.80    ││
│ │ Natália Azevedo      0.62 ││
│ │ SWE I · Brazil            ││
│ │ … (5)                     ││
│ │ See all 14 →  6 overpaid →││
│ └───────────────────────────┘│
│ ┌ What do we pay? ──────────┐│
│ │ [Job title ▾] [Country ▾] ││
│ └───────────────────────────┘│
│ ┌ Annual payroll ───────────┐│
│ │ $669,197,391 · 10,000     ││
│ │ US 51.8% · UK 15.3% · …   ││
│ └───────────────────────────┘│
│ footnote                     │
└──────────────────────────────┘
```

(The bars in the share list are drawn from `sharePermille` as a plain number: geometry only, like the comparison chart.)

### Employees (`/employees`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Employees                                               10,000 employees       │
│ [🔍 Search by name     ] [Country ▾] [Department ▾] [Job title ▾]  Clear       │
│ ─────────────────────────────────────────────────────────────────────────────  │
│ Name               Job title                 Department   Country      Salary  │
│ Aarav Agarwal      Customer Support Spec     Cust Support India  ₹762,400.00   │
│ …                                                                              │
│ 1–25 of 10,000                                           ‹ 1 2 3 … 400 ›       │
│ (when title + country are filtered:) Pay ranges for SWE II in India →          │
└───────────────────────────────────────────────────────────────────────────────┘

PHONE
┌──────────────────────────────┐
│ Employees         [+ Add]    │
│ [🔍 Search by name         ] │
│ [Filters (2)]       Clear    │
│ ──────────────────────────── │
│ Aarav Agarwal                │
│ Customer Support Spec · IN   │
│                 ₹762,400.00  │
│ ──────────────────────────── │
│ …                            │
│ 1–25 of 10,000   ‹ 1 … 400 › │
└──────────────────────────────┘
```

### Employee view (`/employees/$id`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ ‹ Employees                                                                    │
│ Aarav Agarwal                                                     [Edit]       │
│ Customer Support Specialist · Customer Support · India   (each a link)         │
│                                                                                │
│ Annual salary                         Peers: Customer Support Specialist, India │
│ ₹762,400.00 INR                       Median ₹803,100.00  (→ pay ranges)        │
│                                       ├──────●───────┼──────────┤               │
│                                       min ₹…   this   median    max ₹…          │
│                                       423 employees · See the 423 peers →       │
│                                                                                │
│ ───────────────────────────────────────────────────────────────────────────── │
│ Delete employee                                          (set apart, quiet)    │
└───────────────────────────────────────────────────────────────────────────────┘
PHONE: the same blocks stacked: name, meta, salary, Peers panel, Edit (full width), Delete.
Small group: the Peers panel shows the small-group notice instead of the range.
```

### Add and edit (`/employees/new`, `/employees/$id/edit`)

```text
DESKTOP                                         PHONE
┌───────────────────────────────────────────┐   ┌──────────────────────────────┐
│ ‹ Back                                     │   │ ‹ Back                       │
│ Add employee                               │   │ Add employee                 │
│ ┌ Person ───────────────────────────────┐  │   │ Name                         │
│ │ Name          [                     ] │  │   │ Job title ▾                  │
│ │ Job title     [                    ▾] │  │   │ Department ▾                 │
│ │ Department    [                    ▾] │  │   │ Country ▾                    │
│ │ Country       [                    ▾] │  │   │ Annual salary         [INR]  │
│ └───────────────────────────────────────┘  │   │ = ₹1,250,000.50 a year       │
│ ┌ Pay ──────────────────────────────────┐  │   │ [Add employee] (full width)  │
│ │ Annual salary [ 1,250,000.50    ][INR] │  │   │ Cancel                       │
│ │ = ₹1,250,000.50 a year                 │  │   └──────────────────────────────┘
│ └───────────────────────────────────────┘  │
│ [Add employee]  Cancel                     │
└───────────────────────────────────────────┘
Behaviour unchanged (ADR 0004, Forms). Only layout and grouping change.
```

### Pay ranges (`/pay/statistics`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Pay ranges                                                                     │
│ What do we pay for a job title in a country?                                   │
│ [Job title: Software Engineer II ▾] [Country: India ▾]                         │
│                                                                                │
│ Software Engineer II in India · INR                                            │
│ Median                                    Headcount                            │
│ ₹1,800,000.00                             423                                  │
│ ├────────────────────────┼──◆────────────────────┤                             │
│ Minimum ₹1,584,100.00   median  average ₹1,806,531.91   Maximum ₹2,014,700.00  │
│                                                                                │
│ See these 423 employees →   Compare across countries →   See who's paid out… → │
└───────────────────────────────────────────────────────────────────────────────┘
PHONE: pickers stacked; median large; then min / average / max as a 3-row list; links stacked.
Idle: the prompt line, plus 3 recent or suggested pairs is NOT added (no history); just the prompt.
```

### Outliers (`/pay/outliers`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Outliers                                                                       │
│ Who is paid out of line with their peers?                                      │
│ [Underpaid 14 | Overpaid | All]    [Country ▾] [Department ▾] [Job title ▾]    │
│                                                                                │
│ 14 employees paid below 0.80 of their peer median                              │
│ Bringing them to 0.80 would cost $80,898 a year.                               │
│ How outliers are flagged: compa-ratio is salary ÷ … (full note). 7 employees … │
│ ─────────────────────────────────────────────────────────────────────────────  │
│ Name / title · country     Salary      Peer median   Compa-ratio  Gap to 0.80   │
│ Natália Azevedo            R$73,200.00 R$118,000.00  0.62 ▼Below  R$21,200.00   │
│ SWE I · Brazil · Eng · 128 peers                                                │
│ …                                                                              │
│ 1–14 of 14                                                       ‹ 1 ›         │
│ footnote                                                                       │
└───────────────────────────────────────────────────────────────────────────────┘
PHONE
┌──────────────────────────────┐
│ Outliers                     │
│ [Underpaid|Overpaid|All]     │
│ [Filters (0)]                │
│ 14 employees paid below 0.80 │
│ Bringing them to 0.80 would  │
│ cost $80,898 a year.         │
│ ──────────────────────────── │
│ Natália Azevedo   0.62 Below │
│ SWE I · Brazil               │
│ R$73,200.00 of R$118,000.00  │
│ Gap R$21,200.00              │
│ ──────────────────────────── │
│ …                            │
└──────────────────────────────┘
```

### Across countries (`/pay/comparison`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Across countries                                                               │
│ How does pay for a job title compare across countries?                         │
│ [Job title: Software Engineer II ▾]                                            │
│ Median salary of Software Engineer II, in USD                                  │
│ United States  ████████████████████████████  $130,000   (bars link to Pay ranges)│
│ United Kingdom ███████████████              $…                                  │
│ …                                       ■ 5 or more  ■ fewer than 5            │
│ Country  Headcount  Min  Median  Average  Max   (table as today)               │
│ footnote (nominal, not adjusted for cost of living)                            │
└───────────────────────────────────────────────────────────────────────────────┘
PHONE: chart full width; the table becomes rows: country + headcount, then median large,
min–max small. No sideways scroll.
```

### Payroll (`/pay/payroll`)

```text
DESKTOP
┌───────────────────────────────────────────────────────────────────────────────┐
│ Payroll                                                                        │
│ What is our payroll total, by country and department?                          │
│ Annual payroll  $669,197,391   ·   10,000 employees                            │
│ [By country | By department]  (tabs, both one click)                           │
│ Country        Headcount   Local total      USD total     Share                │
│ United States      2,800   $346,783,800   $346,783,800   ███████ 51.8%  ⋯      │
│ …                                                                              │
│ footnote                                                                       │
└───────────────────────────────────────────────────────────────────────────────┘
PHONE: rows: country + share, then USD total large, local total and headcount small.
```

Question: tabs or both tables stacked? Proposal: **both tables stacked as today on desktop** (they fit), tabs only on phone. Listed as an open choice below.

### Not found

```text
Page not found
There is no page at this address.
[Go to the overview]   [Search employees]
```

## Data and limits

- **No new endpoints, fields or parameters.** Every figure above comes from the responses listed in ADR 0003.
- **Where this departs from the research:**
  - The research asks for the **compa-ratio on the employee view**. No endpoint returns one person's compa-ratio, and the UI does no ratio arithmetic (ADR 0004), so the view shows the peer median and the min–max range from `GET /api/pay-statistics` instead, with the outliers screen one click away. The ratio itself is a follow-up.
  - The research suggests **returning to the list after saving an edit**. ADR 0004 lands on the employee view, which shows the saved salary as confirmation; the list's last search is still one click away through "‹ Employees". Unchanged.
  - **Prefilling "Add employee" from a filtered list** (research, inference) would need search params on `/employees/new`. Left as a follow-up.
- **Follow-ups (need the API):** a compa-ratio and outlier flag on the employee resource; a reference-count endpoint so nav badges don't need a full outliers request; "recently edited" on the Overview (needs history, out of scope).

## Open choices for the reviewer

1. **Payroll on phone:** tabs (By country / By department) or both stacked.
2. **Label for question 1:** "Pay ranges" (HR wording) or "Pay statistics" (the glossary term).
3. **Outliers badge in the nav:** the underpaid count on every screen costs one cached request per 30 s.

## ADR 0004 amendments this implies

Applied as one `docs(adr):` commit before any code, in ADR 0004's style: the replaced text struck through, followed by *Amended by the HR Manager redesign (#<issue>):* and the new text.

1. **Opening paragraph.** ~~Visual design (theme, hierarchy, spacing, empty- and error-state styling) is out of scope here. It comes in a time-boxed polish pass with `/impeccable` after the slices work, constrained to Mantine's theme (`createTheme`), with no Tailwind.~~ → Information architecture is in `docs/ux/information-architecture.md`, and the visual system in `DESIGN.md`. Both are constrained to Mantine's theme (`createTheme`), with no Tailwind.
2. **Libraries.** Add: **`@mantine/spotlight`** for the global search overlay. No other new dependency.
3. **Data fetching, debounce.** ~~The search box keeps local state, and the debounce lives in exactly that one place.~~ → There are two search boxes, the list's and the global search. Each keeps local state and debounces in one place, through one shared 300 ms constant. Only the list's writes `q` to the URL.
4. **Routing table, `/`.** ~~redirects to `/pay/payroll`: the app opens on the grand total, the first number the HR Manager asks for (ADR 0001)~~ → **Overview**: the grand total (still the first number on screen, ADR 0001), the underpaid count, cost and top five, the overpaid count, a pay-ranges picker and employee search. No search params.
5. **Routing, navigation bullet.** ~~Navigation is a Mantine `AppShell` sidebar: "Employees", then a "Pay questions" group listing the four, each labelled as the question it answers.~~ → Navigation is a Mantine `AppShell` sidebar: Overview, Employees, then a **Pay** group: Pay ranges, Outliers, Payroll, Across countries. Each pay page shows its question as a subtitle under its title. Outliers carries the underpaid count, from the same cached query as the Overview. The header has global search (`Ctrl`/`⌘`+`K`, `/`) and "Add employee" on every screen.
6. **New section, Global search.** As in *Global search* above: employees from `GET /api/employees?q=&page=1&pageSize=8` (at least 2 characters), job titles and countries from `@acme/contract`, four actions, and "See all employees matching …" → `/employees?q=…`.
7. **New section, Overview (`/`).** The figures table and the empty and error states: each panel has its own `QueryState`, so a failed outliers request never hides the payroll total. An empty organization shows `$0`, "No employees yet" and Add employee, as the payroll screen does today.
8. **Employee list.** Add: on a phone each row is stacked (name; job title · country; salary). With both job title and country filtered, a "Pay ranges for this group" link → `/pay/statistics`.
9. **Employee view.** ~~The view page does not show a compa-ratio. "Compare with peers" answers that one click away.~~ → The view adds a **Peers** panel from `GET /api/pay-statistics` for the employee's job title and country: the peer median (linking to pay statistics), the headcount (linking to the filtered list), and a min-to-max range with the employee's salary marked. A small group shows its notice instead of the range. The view still shows no compa-ratio; that needs a field on the employee resource (follow-up). Job title, department and country link to the filtered list.
10. **Question 1.** Add: the median leads, larger than the other figures; min to max is drawn as a range with the average marked. All five figures stay as text with exact minor units.
11. **Question 2.** ~~(`/pay/payroll`, the landing screen)~~ → (`/pay/payroll`). Add: a country row also offers "Outliers in this country" → `/pay/outliers?country=…`. On a phone each row is stacked.
12. **Question 3.** Add: each bar links to the same pay statistics as its table row. On a phone the table becomes stacked rows (country and headcount; median; min to max). The chart's "geometry only" rule extends to the Overview's share bars, the employee view's range and question 1's range: positions come from `amountMinor` or `sharePermille` as plain numbers and are never shown as text.
13. **Question 4.** ~~A static note at the top~~ → The headline and cost come first, then the static note, with its text unchanged. Add: "See all employees with these filters" → `/employees?…`. On a phone, the filters sit behind a "Filters" button showing how many are active, and each row is stacked (name and compa-ratio badge; job title · country; salary of peer median; gap).
14. **Consequences.** Add: `@mantine/spotlight` enters the bundle. The Overview makes three requests (payroll totals and two outlier pages), all through existing endpoints.

**E2E locators that change with it:** the nav link "Who is paid out of line with their peers?" becomes "Outliers"; the employee's name heading moves from level 2 to level 1 (each page's title becomes its `h1`, and the brand stops being one). The other locators (Search, Add employee, Edit, Delete, Save changes, the form labels, the outliers headline text) are unchanged.
