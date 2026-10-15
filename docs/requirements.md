# Requirements: ACME Salary Manager

## Goal

Replace ACME's salary spreadsheets with a web app where the HR Manager maintains salary data for about 10,000 employees and answers questions about how ACME pays people.

## User &amp; problem

The HR Manager keeps salary data for several countries in Excel files. Every pay question means a hand-built pivot table and manual currency conversion. There is no single source of truth and no quick way to see who is paid out of line.

## Scope &amp; features

### Manage salary data

- List employees with server-side pagination, search by name, and filters for country, department and job title.
- View, add, edit (salary included) and remove an employee.
- Input is validated: required fields, salary greater than zero, country from the supported list.

An employee has a name, job title, department, country and annual salary; currency follows from country.

### Answer pay questions

1. **"What do we pay a Software Engineer in India?"** Min, median, average, max and headcount for that title and country, in local currency.
2. **"What does payroll cost per country and per department?"** Total annual salary per country (local currency and USD) and per department (USD).
3. **"How does pay for this title compare across countries?"** The title's stats per country in USD, side by side.
4. **"Who is paid out of line for their role?"** Flagged employees, each with salary, compa-ratio and the median for their title in their country.

## Key decisions &amp; assumptions

- **Money.** Integer minor units plus an ISO 4217 code. Never floats, so sums and averages do not drift.
- **Salary** is annual gross base pay. Each country has one currency. *(Assumptions.)*
- **Job titles include the level** (e.g. "Software Engineer II", "Senior Software Engineer"), so stats compare like with like. *(Assumption.)*
- **Currency.** Within a country, stats use local currency. Across countries, amounts convert to USD with a fixed, dated rate table shipped with the app; the date is shown. No live FX API: results stay reproducible and testable, with no external dependency.
- **Volume.** About 10,000 employees, one organization. Filtering, pagination and stats run on the server.
- **Outliers.** *(Assumption.)* An employee's compa-ratio is their salary divided by the median for their title in their country (the peer median stands in for a pay-grade midpoint, since pay grades are out of scope). Employees below 0.80 or above 1.20 are flagged; title-and-country groups with fewer than 5 employees are skipped, because their median isn't meaningful.

- **Remove** is a hard delete; keeping leavers belongs with salary history. *(Assumption.)*
- **Seed.** Deterministic; 10,000 employees with plausible salaries per country and title.
- **Access.** Authentication and roles are a stretch goal. Production would require SSO and role-based access, because salary data is sensitive.

## Out of scope, and why

- **Salary history and audit trail.** Needs an effective-dated model; the MVP keeps current salary only.
- **Excel / CSV import.** The obvious next step, since the data starts in Excel; deferred until the model is proven.
- **Export to Excel / CSV.** HR will ask for it early; it comes after import, which shapes the file format.
- **Total compensation** (bonus, equity, benefits). Base salary answers the core questions; the rest needs separate data and rules.
- **Pay grades.** Bands would come from policy instead of statistics; that needs HR input the MVP doesn't have.
- **Gender pay-equity analysis.** Needs sensitive personal data and legal care.
- **Live exchange rates.** Break reproducibility and add an external dependency.
- **Purchasing-power (PPP) adjustment.** Cross-country amounts are nominal. Adjusting for cost of living needs a PPP data source and a policy decision on which index HR trusts.
- **Approval workflows.** Need multiple users and roles.
- **Bulk edits.** Safe bulk changes need preview and undo.
- **Multi-tenancy.** There is one organization.
- **Notifications.** Nothing in the MVP needs them.

## Success criteria

- The seed creates exactly 10,000 employees; two runs produce identical data.
- Adding, editing or removing an employee in the UI updates the list and the stats.
- Each of the four questions is answered from the UI on seeded data.
- The employee list and each stat respond in under 500 ms on the deployed app.
- Unit tests check stats, totals, currency conversion and outliers against small hand-computed fixtures, rounding included.
- Tests are deterministic and need no network.
- The app runs at a public Railway URL; a video demo walks through each question.

