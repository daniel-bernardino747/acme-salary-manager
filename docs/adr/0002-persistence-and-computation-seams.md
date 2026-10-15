# Persistence and computation seams

Every money rule in ADR 0001 must have exactly one implementation that hand-computed fixtures can reach without a database. So SQL selects rows and domain code computes, and each layer is tested at its own fast, deterministic seam.

## Where statistics are computed

SQL owns selecting, filtering, search and pagination. Pure domain functions own every computation: min, max, median, average, headcount, payroll totals, USD conversion, compa-ratio and outliers. Each pay question is one narrow query whose rows go to one domain function (e.g. `SELECT annual_salary_minor FROM employees WHERE job_title = ? AND country = ?`). Domain functions take plain data (e.g. `{ annualSalaryMinor, currency, ... }`), never ORM rows-as-entities or Nest types.

The heaviest read is for outliers: at most about 10,000 rows of `(id, job_title, country, annual_salary_minor)`. We expect it to take a few milliseconds in SQLite. That is an expectation to be measured against the 500 ms target, not a measured fact.

**Scaling exit.** At much larger headcounts the domain functions stay. Either SQL pre-aggregates per currency and passes subtotals in, or stats are precomputed on write (salary writes are rare and reads are frequent).

## Driver and data access

`better-sqlite3` with Drizzle ORM. The Drizzle schema is the single source of column types, and rows come back as plain objects. `drizzle-kit generate` writes plain `.sql` migration files that are committed to the repo. `migrate()` applies them at startup (in the start command) and in tests against `:memory:`.

`createDb(path)` returns a migrated database. On a file database it sets `PRAGMA journal_mode = WAL` and a `busy_timeout`.

Node 24 is pinned in `engines` and `.nvmrc`, so local Windows installs and Railpack's Linux build use matching `better-sqlite3` prebuilds. The first implementation slice must prove these on Windows before anything else: `better-sqlite3` installs, a `:memory:` query runs, and an FTS5 table can be created. ADR 0003 adds two more checks for the shared `@acme/contract` package: Nest boots and imports a value from it, and a Vitest test in `api` imports from it and resolves a Nest provider through DI.

## Schema

One table, `employees`:

| column | type | constraint |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | rowid alias; ids are never reused |
| `name` | `TEXT NOT NULL` | |
| `job_title` | `TEXT NOT NULL` | |
| `department` | `TEXT NOT NULL` | |
| `country` | `TEXT NOT NULL` | ISO 3166 alpha-2 code (`US`, `GB`, `DE`, `NL`, `IN`, `BR`, `JP`) |
| `annual_salary_minor` | `INTEGER NOT NULL` | `CHECK (annual_salary_minor > 0)` |

- `AUTOINCREMENT` (amended by ADR 0005): without it, deleting the employee with the highest id and then creating one reuses that id, so a stale link would show a different person. Remove is a hard delete, so that is a real risk. The seed's `--reset` clears the `employees` row in `sqlite_sequence` in the same transaction, so ids still restart at 1.
- The UK is stored as `GB` and displayed as "United Kingdom".
- Currency is not stored. It follows from country through the reference data, and the repository adds it when it maps rows to domain data. A stored currency would allow a row with `DE` and `USD`, which cannot exist.
- The reference lists (country, department, job title) are enforced in code, not with `CHECK … IN (…)`. A `CHECK` would copy each list into a migration. Because the database does not guard these lists, nothing may bypass the domain validation: the seed builds its rows through the same validation and reference lists as the API.
- There is no `created_at` or `updated_at`. Nothing reads them, and salary history is out of scope.

**Indexes:** `(job_title, country)` for peer-group reads (it also serves a title-only filter), `(country)`, `(department)` and `(name, id)` for the list. The list orders by `name, id`, so pagination stays stable when names tie.

## Name search

Name search uses SQLite FTS5. `LIKE '%term%'` was rejected because it matches wrongly, not because it is slow: it folds case only for ASCII letters, does not fold accents ("muller" misses "Müller"), and treats `%` and `_` in the input as wildcards. FTS5 fixes the matching and is also the scaling path.

- An external-content FTS5 table over `employees(name)`, with `tokenize = 'unicode61 remove_diacritics 2'` and `prefix = '2 3'`.
- `AFTER INSERT`, `AFTER UPDATE` and `AFTER DELETE` triggers keep it in sync. The update trigger issues the `'delete'` command for the old values and then inserts the new ones. Drizzle's schema does not model virtual tables or triggers, so they are created in a custom migration (`drizzle-kit generate --custom`).
- Search is a per-word prefix match. The input is split into words, and each word is quoted (inner quotes doubled) and suffixed with `*`. The words are joined with AND. Raw input is never passed to `MATCH`. The builder uses SQLite syntax, so it lives in `persistence/` as a pure function with fixtures for accents, case, quotes and operator-like input (`AND`, `-`, `*`).
- The list query joins the FTS table on `rowid = employees.id`, applies the filters, orders by `name, id` and paginates. The count query uses the same join. An empty search skips the join.
- **Tokenizer fixtures** (amended by ADR 0005, whose seed names include these cases). `unicode61` splits words on apostrophes and hyphens. A quoted input word becomes a phrase whose last token is a prefix, so these work through the per-word builder. The behaviour was checked against FTS5 with this tokenizer:

  | Query | Name | Matches |
  |---|---|---|
  | `o'connor` | O'Connor | yes (phrase "o connor*") |
  | `connor` | O'Connor | yes |
  | `oconnor` | O'Connor | no |
  | `anna lena` | Anna-Lena | yes |
  | `anna-lena` | Anna-Lena | yes |
  | `annalena` | Anna-Lena | no |
  | `joao` | João | yes |
  | `muller` | Müller | yes |
  | `gross` | Groß | no |
  | `groß` | Groß | yes |

- **Known limitations:**
  - There is no infix match ("ller" does not find "Müller"). The trigram tokenizer was rejected because it needs 3 or more characters.
  - Punctuation inside a name must be typed or replaced by a space: "oconnor" does not find O'Connor, and "annalena" does not find Anna-Lena.
  - `ß` is not folded to `ss`: "gross" does not find "Groß". The seed avoids `ß` in names.

## Module seams

Three layers inside `api/src/`, with imports going one way only. An ESLint `no-restricted-imports` rule enforces this:

- **`domain/`** imports nothing outside itself except `@acme/contract`, which depends only on Zod (amended by ADR 0003). It holds money, rounding and conversion, pay statistics, payroll totals, compa-ratio and outliers. The reference data and request validation schemas live in `@acme/contract`. It knows nothing about storage.
- **`persistence/`** imports `domain/`. It holds the Drizzle schema, migrations, `createDb`, the FTS MATCH builder, and repository functions that take and return plain data.
- **Nest feature modules** import both. They hold controllers, DTOs and services. A service makes one repository read and calls one domain function. The database reaches Nest as a provider built by `createDb(process.env.DATABASE_PATH)`.

There is no repository interface and there are no mocks. Repositories are concrete functions tested against a real migrated `:memory:` database, which exercises the SQL, the triggers and the indexes for real. That leaves three test seams:

1. Domain functions, on hand-computed fixtures.
2. Repository functions, on `:memory:`.
3. HTTP end to end, on `:memory:`.

Repository and HTTP tests build their rows with a small test-data builder, never the 10,000-employee seed.

ADR 0003 moves the reference data, the exchange rate table and the request and response schemas to the `@acme/contract` workspace package. Because those had no dependencies, the move is a rename. The computations stay in `domain/`.

## Considered options

- **SQL aggregates with a window-function median:** rejected. The rounding and the median "as shown" would live in SQL, outside the pure fixtures.
- **A mix (e.g. `SUM … GROUP BY currency` in SQL):** rejected at this volume. It saves almost nothing and splits one rule across two layers. It returns as the scaling exit.
- **`node:sqlite`:** not chosen. `better-sqlite3` is mature and well supported by Drizzle.
- **Prisma:** rejected. Its engine is heavy and its client is async-only and generated, which is a lot for one table.
- **TypeORM:** rejected. Its entities are exactly what the domain must not see.
- **Kysely:** rejected. Migrations would be written by hand and the schema types kept separately.
- **Plain SQL:** rejected. Row types would be written by hand, and building the dynamic filter query by concatenating strings is error-prone.
- **A stored currency column, or `CHECK … IN` on the reference lists:** rejected. It duplicates the code lists and allows inconsistent rows.
- **A normalized `name_search` column with `LIKE`:** rejected in favor of FTS5, which fixes the same matching problems and also scales.
- **A repository interface with in-memory fakes:** rejected. It adds an abstraction with one implementation and a fake that can drift from SQLite.

## Consequences

- SQLite on a Railway volume means a single instance: no replicas, and brief downtime on each deploy. Needing more than one instance is the trigger for moving to Postgres.
- Name search matches whole words and word prefixes only.
- Any write path that skips the domain validation can store an invalid country, department or job title, because the database does not check them.
