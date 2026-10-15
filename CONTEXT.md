# ACME Salary Manager

Where ACME's HR Manager keeps the current base salary of every employee and answers four questions about how ACME pays people.

## Language

### People and organization

**Employee**:
A person ACME pays. Has a name, a job title, a department, a country and an annual salary.
_Avoid_: Staff member, worker, record

**Country**:
One of the supported countries. Each has exactly one currency. Several countries can share a currency (Germany and the Netherlands both use EUR).
_Avoid_: Location, region, office

**Job title**:
A role with its level included, e.g. "Senior Software Engineer". Picked from the supported list. Two employees are peers only when they share both job title and country.
_Avoid_: Role, position, grade

**Department**:
The part of ACME an employee works in. Picked from the supported list.
_Avoid_: Team, unit, division

### Money

**Salary**:
An employee's annual gross base pay, in the currency of their country. Always greater than zero.
_Avoid_: Pay, compensation, wage

**Money**:
A whole number of minor units together with a currency, e.g. 1,250,000 cents in USD. Never a fractional amount.
_Avoid_: Amount, value, price

**Minor unit**:
The smallest unit a currency counts in: cents for USD, paise for INR. JPY has none, so its minor unit is one yen.
_Avoid_: Cents (as a general term), subunit

**Exchange rate table**:
The fixed list of rates shipped with the app, one per currency, each stated as local currency units per 1 USD. It has a source and an as-of date, and both are shown wherever converted amounts appear.
_Avoid_: FX feed, live rates, conversion rates

**Rounding rule**:
Round half up to a whole minor unit, applied once per result. It covers averages, the median of an even-sized group, and conversions to USD.
_Avoid_: Banker's rounding

### Pay questions

**Peer group**:
All employees who share one job title and one country, including the employee in question.
_Avoid_: Cohort, segment, bucket

**Pay statistics**:
Minimum, median, average, maximum and headcount of salaries for one peer group, in the country's currency.
_Avoid_: Metrics, aggregates, summary

**Payroll total**:
The sum of salaries over a set of employees (a country, a department, or the whole organization). In USD, each currency is subtotalled and converted once, then the results are added, so parts may not add up exactly to the whole.
_Avoid_: Payroll cost, spend, budget

**Compa-ratio**:
An employee's salary divided by the median salary of their peer group, as that median is shown.
_Avoid_: Pay ratio, comparison ratio

**Outlier**:
An employee whose compa-ratio is strictly below 0.80 or strictly above 1.20, in a peer group of at least 5 employees. Exactly 0.80 or 1.20 is not an outlier.
_Avoid_: Anomaly, exception
