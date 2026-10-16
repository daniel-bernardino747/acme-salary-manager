# Deterministic seed data

The demo and the success criteria depend on 10,000 seeded employees: two runs must produce identical data, and the four pay questions must have something true to show. So headcount comes from exact quotas, salaries are anchored so that the only outliers are the ones we planted, and every random draw comes from an in-house integer PRNG that is pinned by golden hashes. All figures below are illustrative: hand-picked to be plausible, not market data. The README says so too.

## Reference lists

Countries are fixed by ADR 0001. The seed gives each job title one home department. The model still accepts any title in any department.

| Department | Job titles |
|---|---|
| Engineering | Software Engineer I, Software Engineer II, Senior Software Engineer, Staff Software Engineer, Engineering Manager, QA Engineer |
| Product | Product Manager, Senior Product Manager |
| Design | Product Designer, Senior Product Designer |
| Data | Data Analyst, Data Scientist, Senior Data Scientist |
| Sales | Sales Development Representative, Account Executive, Senior Account Executive, Sales Manager |
| Marketing | Marketing Specialist, Marketing Manager |
| Customer Support | Customer Support Specialist, Support Team Lead |
| People | Recruiter, HR Business Partner |
| Finance | Financial Analyst, Accountant |

Nine departments and 25 titles. People and Finance are separate departments because the HR Manager would notice their own department merged with another.

## Headcount: exact quotas

Headcount is not sampled. A pure function turns the weights into an exact integer count for every title-and-country cell, so the total is exactly 10,000 by construction and the PRNG never touches headcount.

- **Country totals:** US 2,800 · IN 2,600 · GB 1,300 · DE 1,100 · BR 1,000 · JP 700 · NL 500.
- **Global title mix (%):**

  | Department | Titles (%) | Total |
  |---|---|---|
  | Engineering | SWE I 10, SWE II 13, Senior SWE 10, Staff SWE 2, Engineering Manager 3, QA Engineer 4 | 42 |
  | Sales | SDR 6, AE 6, Senior AE 3, Sales Manager 1.5 | 16.5 |
  | Customer Support | Specialist 13, Team Lead 1.5 | 14.5 |
  | Data | Data Analyst 3, Data Scientist 2, Senior Data Scientist 1 | 6 |
  | Marketing | Specialist 4, Manager 1.5 | 5.5 |
  | Product | PM 3, Senior PM 1.5 | 4.5 |
  | Finance | Financial Analyst 2, Accountant 2 | 4 |
  | Design | Product Designer 2.5, Senior Product Designer 1 | 3.5 |
  | People | Recruiter 2, HR Business Partner 1.5 | 3.5 |

- **Country profiles** multiply the mix by department, and the result is renormalised per country:

  | Profile | Countries | Multipliers |
  |---|---|---|
  | Hub | IN, BR | Engineering, Data and Customer Support ×1.4; Sales and Marketing ×0.4 |
  | Market | US, GB, DE, JP | Sales and Marketing ×1.3 |
  | Plain mix | NL | none |
- **Rounding:** largest remainder within each country, so every country total is exact.
- **Small-group overrides.** None of the weighted cells fall under 5, so small groups are planted. An overridden cell gets exactly its count, and the rest of the country's total is spread over the other cells with the same rounding:

  | Cell | Count | Shows |
  |---|---|---|
  | Staff Software Engineer · BR | 0 | empty peer group: null stats, "no employees" in question 3 |
  | Staff Software Engineer · NL | 2 | small group with an even-sized median |
  | Senior Data Scientist · JP | 1 | single-employee group |
  | Sales Manager · NL | 4 | largest small group: shown, marked, never checked |
  | Senior Data Scientist · NL | 5 | smallest checked group, pinned against weight changes |

  Two overrides sit on Staff Software Engineer, so one question-3 screen shows full groups, a marked small group and "no employees" side by side.

**The quota table is committed as a generated snapshot**, and a test compares it with the function's output. No headcount figure appears in docs unless it is taken from that snapshot.

## Base salaries

`base(title, country) = roundToStep(anchor[country] × multiplier[title] ^ spread[country])`

- **Anchor:** the base salary of a Software Engineer II, in local currency:

  | US | GB | DE | NL | IN | BR | JP |
  |---|---|---|---|---|---|---|
  | $130,000 | £62,000 | €68,000 | €64,000 | ₹1,800,000 | R$156,000 | ¥7,000,000 |

- **Multiplier** (one global ladder, SWE II = 1.00):

  | Department | Multipliers |
  |---|---|
  | Engineering | SWE I 0.80 · SWE II 1.00 · Senior SWE 1.30 · Staff SWE 1.65 · Engineering Manager 1.55 · QA Engineer 0.90 |
  | Product | PM 1.10 · Senior PM 1.40 |
  | Design | Product Designer 0.95 · Senior Product Designer 1.25 |
  | Data | Data Analyst 0.85 · Data Scientist 1.10 · Senior Data Scientist 1.40 |
  | Sales | SDR 0.65 · AE 0.95 · Senior AE 1.25 · Sales Manager 1.45 |
  | Marketing | Specialist 0.75 · Manager 1.15 |
  | Customer Support | Specialist 0.55 · Team Lead 0.75 |
  | People | Recruiter 0.75 · HR Business Partner 1.00 |
  | Finance | Financial Analyst 0.85 · Accountant 0.80 |

- **Spread** (seniority spread per country): US, GB, DE, NL 1.00 · JP 1.15 · BR 1.25 · IN 1.35. The anchor is unchanged at SWE II, senior roles in IN and BR sit closer to US pay than junior ones do, and question 3 differs by title instead of showing one chart rescaled.
- **Salary step:** 100 major units, and ¥10,000 for JPY. Every base is a multiple of the step.
- **The override list for cells is empty.** It exists for a product that looks wrong in the snapshot.

**The base table is committed as a generated snapshot.** Once the exchange rate table is fixed, the snapshot shows a USD column next to each local base, so every cell can be sanity-checked in one currency.

**`^ spread` is the seed's only floating-point operation.** `Math.pow` is implementation-approximated in ECMAScript, so its result is not guaranteed bit-identical across engine versions. The base snapshot test is the guard: any drift fails the test instead of silently changing the data.

## Salaries within a group

- **Groups of 5 or more are median-anchored:**
  1. Draw n salaries uniformly in 0.88–1.12 × base, as a whole number of steps.
  2. Sort them and set the middle value (both middle values when n is even) to the base exactly. The median is then exactly the base.
  3. Each planted underpaid employee replaces the lowest draw, and each overpaid one replaces the highest. Every rank is unchanged, so the median does not move.
  4. Shuffle the group, so sorted positions do not leak into ids.

  Each anchored group has one or two employees on exactly the base salary, which reads as a standard offer.

  *Amended during the seed (#15):* steps 1 and 2 do not hold as written. Setting the sorted middle to the base moves the median whenever values below the middle sit above the base (draws 1.02, 1.04, 1.06, 1.08, 1.10 × base give a median of 1.04 × base once the middle is set to 1.00). The draw is now split by side instead. With `k = floor((n − 1) / 2)`, k salaries are drawn in `[ceil(0.88·base/step), base/step − 1]` steps and k in `[base/step + 1, floor(1.12·base/step)]`, and the one or two remaining are the base exactly. The median is then the base by construction, exactly one or two employees sit on it, and steps 3 and 4 are unchanged: plants replace the lowest or highest draw, then the group is shuffled.
- **Groups under 5 draw freely** in the same range, and their values must be distinct (on a collision, the seed redraws from the same stream). They are never checked for outliers, so neither anchoring nor the bound applies. Anchoring would also give the two Staff Software Engineers in the Netherlands identical salaries and lose the even-sized median the plant exists for.
- **The bound:** every employee who is not planted lands within 0.85–1.15 of their group's final median. The draw range of 0.88–1.12 sits inside it with a margin.

## Planted outliers

- **Twenty planted outliers, 14 underpaid and 6 overpaid**, are a named constant of (job title, country, target compa-ratio). The targets are written out, not drawn. They are spread across all 7 countries and at least 5 departments, and they sit only in groups of 5 or more.
- **One underpaid outlier is in Senior Data Scientist · NL** (exactly 5), so the smallest checked group visibly flags someone. That proves a group of exactly 5 is checked: the threshold is ≥ 5, not > 5. Being underpaid, it also shows a gap to 0.80.
- **Targets sit well clear of the boundaries:** 0.62–0.76 and 1.26–1.55. The planted salary is target × base, rounded to the step.
- **Two boundary plants that are not outliers** sit at exactly 0.80 × base and 1.20 × base (e.g. $67,440 against an $84,300 base). They are exempt from step rounding. Each goes in a group that is odd-sized once it is included, and the base is a multiple of 100 major units, so both products are whole minor units (JPY included) and the boundary is hit exactly.

## Determinism

- **sfc32, implemented in the repo** in `api/src/seed/prng.ts`. It uses only 32-bit integer operations (`Math.imul`, `>>>`), so it is bit-identical on every engine and OS. The seed lives in `api/src/seed/` (`prng.ts`, `generate-employees.ts`, `names.ts`), outside `domain/`, which holds only pay rules.
- **No `Math.random` in seed code,** enforced by an ESLint `no-restricted-properties` rule scoped to `api/src/seed/`.
- **Integer-only draws.** A salary is a whole number of steps drawn in `[ceil(0.88·base/step), floor(1.12·base/step)]` (split at the base for anchored groups, see *Salaries within a group*). Ranges use rejection sampling, so there is no modulo bias.
- **One stream per cell,** seeded from a hash of (fixed seed, job title, country), plus a separate stream for names. Changing one cell's count or one plant changes only that cell's rows, and changing a name list never moves a salary.
- **A fixed order:** countries and titles in reference-list order, and rows inserted in that order.

## Names

- Fixed lists in `api/src/seed/names.ts`, with about 50 given names and 50 family names per country, in Latin script (the UI is `en`). Japanese names are romanized, and Indian names come from several regions.
- One order everywhere, "Given Family", Japan included. The name is one field and search is a per-word prefix match, so the order is presentation only.
- Duplicate full names are allowed. The US has more employees than name combinations, as real companies do. People are told apart by title, department and country, and links go by id.
- **Accented names** (João, Müller) exercise accent folding on real data. **No `ß`:** the search tokenizer does not fold it to `ss` (ADR 0002). **Apostrophe and hyphen names** (O'Connor in GB, Anna-Lena in DE) exercise the tokenizer's word splitting.

## Running it

- **A plain script, not a Nest app context:** `pnpm --filter api seed` runs `dist/seed/main.js`, which opens the database through `persistence/`.
- **Three modes:**

  | Mode | On an empty table | On a non-empty table |
  |---|---|---|
  | default | seeds | exits non-zero, pointing to `--reset` |
  | `--if-empty` | seeds | exits 0 and does nothing; the Railway start command uses this mode (migrate → `seed --if-empty` → start) |
  | `--reset` | seeds | runs `DELETE FROM employees` (the FTS delete trigger clears the index) and `DELETE FROM sqlite_sequence WHERE name = 'employees'`, then seeds |

  Identical ids require an empty table and a reset sequence (ADR 0002 uses `AUTOINCREMENT`). The schema is never dropped: migrations stay its only owner.
- **One transaction** covers the reset and all 10,000 inserts, so a failed seed leaves the previous data intact. Each row is inserted with one prepared statement, with no batching.
- **Validated like the API:** every generated row passes the contract's employee schema before it is inserted (ADR 0002).
- **Output:** the row count, the database golden hash and the duration. The target is under 2 s locally. It is a target, not a measurement.

## Tests

`generateEmployees()` is a pure function with no database, which the seed script writes out. CI runs on ubuntu (a map default), so the golden hashes are checked on Linux as well as locally on Windows.

**Determinism**
- Generator golden hash: the SHA-256 of the canonically serialized output, compared with a committed hash.
- Database golden hash: the rows read back from a migrated `:memory:` database, ordered by id with ids included, compared with a committed hash. Without it, identical ids would never be verified.
- Running the generator twice gives identical output.

**Snapshots**
- The quota snapshot matches, the total is exactly 10,000, no cell is negative, and each of the five small-group overrides lands exactly.
- The base snapshot matches.

**The story**
- The flagged set on the full seed equals the planted list exactly: the same employees, in the same direction.
- Every employee who is not planted is within 0.85–1.15 of their group's median.
- The two boundary plants are not flagged and display exactly "0.80" and "1.20".
- Question 4's cost to reach 0.80 equals the sum of the planted underpaid gaps, summed per currency and converted once (ADR 0001). The expected gaps are computed from the planted constants and the anchored medians, not through the domain function under test.

**Modes**
- Seeding gives exactly 10,000 rows.
- The default mode refuses a non-empty table.
- `--if-empty` does nothing on a non-empty table.
- `--reset` gives the same database golden hash as a fresh seed.

Repository and HTTP tests still use the small test-data builder, never the seed (ADR 0002).

## Considered options

- **Sampling headcount from weights:** rejected. The total would be exactly 10,000 only by luck, and cells could not be pinned.
- **A hand-typed 175-cell base table:** rejected. Seven anchors, 25 multipliers and 7 spreads can be reviewed, and the snapshot still shows every cell.
- **Independent salary draws around the base:** rejected. In a group of 5 the median can drift far enough to flag an employee who was not planted.
- **faker or seedrandom with a fixed seed:** rejected. A library version bump would silently change the data.
- **Natural outliers instead of planted ones:** rejected. "The flagged set equals the planted set" is the assertion that makes the demo's story true.
- **Drop and recreate on `--reset`:** rejected. It would bypass migrations, which own the table, the triggers and the FTS table.
- **Batched multi-row inserts:** rejected. In better-sqlite3, one prepared statement per row inside one transaction is as fast and simpler.

## Consequences

- Changing any weight, anchor, multiplier, plant or name list changes the snapshots and the golden hashes. That is intended: the diff makes the change reviewable.
- On deploy, the data seeded on first boot persists across restarts. Reseeding is a deliberate `--reset`, run through `railway ssh`.
- A Node upgrade that changes `Math.pow` results surfaces as a base snapshot failure, not as silently different data.
