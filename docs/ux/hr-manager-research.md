# HR Manager research: what the job is, and what the app should put first

How an HR Manager responsible for about 10,000 employees in 7 countries works with salary data, and what that means for the ACME Salary Manager's navigation, home screen and shortcuts. Terms follow `CONTEXT.md`.

**How to read this.** Claims are cited inline. **Inference:** marks conclusions drawn from the evidence, not stated by any source. Several vendor help centres could not be read in full (BambooHR's is behind a login; Figures' manager guide returned 401; Ravio's blog and Personio's page returned 429). Where a claim comes only from a search-engine excerpt of a page I could not open, it says so. No source gave a measured frequency for ad hoc pay questions, so the frequency and urgency ratings in section 3 are judgements built from the cited evidence, and are marked as such.

## 1. Summary

- **Most of the work is looking up one person and changing one number.** Point lookups and edits recur at every pay run, and the comp review comes round once a year. WorldatWork reports the average time between pay increases is "at or slightly lower than the historical average of 12 months" ([WorldatWork](https://worldatwork.org/publications/workspan-daily/employers-budgeting-4-1-pay-raises-in-2024)). Salary changes must reach payroll before each cutoff, often monthly ([Playroll](https://playroll.com/blog/employee-payroll-cutoff-date)).
- **Changes outside the annual cycle are common.** A Mercer QuickPulse (March 2025) found "just over 60 percent of employers have provided or plan to provide off-cycle pay increases" (cited by [CompLogix](https://www.complogix.io/blog/off-cycle-promotion/); I did not read the Mercer survey itself). SHRM names the reasons: pay equity, pay compression, and keeping people ([SHRM 2023](https://www.shrm.org/in/topics-tools/news/benefits-compensation/how-employers-managing-compensation-challenges-2023)).
- **Search for a person is a global, first-class control in HRIS tools.** Workday's search box finds "people, tasks, reports, and business data", and a People facet narrows results to workers ([UC Cumberlands Workday job aid](https://helpdesk.ucumberlands.edu/support/solutions/articles/7000049007-use-tools-and-navigation)).
- **Every comp tool links an aggregate to the people inside it.** Lattice's band table count "links to a filtered view of Employee Pay showing only the employees belonging to this band" ([Lattice](https://help.lattice.com/en-us/articles/15179221-compensation-bands-page-overview)). Pave lets you "drill down" from a cluster to Band Details ([Pave](https://support.pave.com/articles/employee-distribution-in-bands-s6Tzc4gppg)). In Ravio you "click on any band to see more detail on the employees within that band" ([Ravio](https://help.ravio.com/bands-view)).
- **Out-of-band employees are shown in context and are easy to filter.** Pave colours them ("blue are in band ... red are out of band") and offers an In band / Out of band filter ([Pave](https://support.pave.com/articles/employee-distribution-on-bands-KGObks6Jim)). Workday puts compa-ratio on the compensation view and in change tasks, and warns when pay is outside the range ([Workday admin guide](https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html)).
- **The 80–120% window is common practice.** Figures says HR teams read compa-ratio "within a standard 80% to 120% pay range" ([Figures](https://figures.hr/post/decoding-compa-ratio-a-comprehensive-guide-for-hr-professionals)). That matches this app's 0.80 / 1.20 thresholds, so the outlier labels will be familiar.
- **Filters are role, location and organisational unit.** Figures tailors bands by "job role, location, business unit, and job grade" ([Figures](https://figures.hr/salary-bands)). Rippling slices "by department, geography, or demographics" ([Rippling](https://www.rippling.com/blog/compensation-bands-rfp-template)). These are the same three filters this app already has.
- **Inference:** the app should keep the payroll grand total as a landing view, but it should never be more than one action from (a) finding an employee, (b) adding one, and (c) the underpaid list. Every number on the pay pages should open the people behind it.

## 2. The persona and their week

ACME's HR Manager owns the salary records of about 10,000 people. The requirements say that today every pay question "means a hand-built pivot table and manual currency conversion" (`docs/requirements.md`). In larger companies a compensation manager or analyst does this work. I found no single published "week in the life" from a primary source, so the picture below is pieced together from what the sources do say.

- **Every pay run.** Salary changes have to reach payroll before the cutoff. Playroll lists "Changes to base salary" and "Submitting changes in salary and employment terms" among the inputs due by its monthly cutoff. Late items "might be deferred to the following payroll run", and manual out-of-cycle processing costs extra ([Playroll](https://playroll.com/blog/employee-payroll-cutoff-date)). Access Group's PeopleXD stages changes entered after the cutoff, which "applies to the input date of the change, not the effective date" ([Access Group](https://help-peoplexdpayroll.theaccessgroup.com/en/articles/13441395-set-the-payroll-cutoff-date)). **Inference:** in the days before cutoff, the HR Manager confirms and corrects individual salaries quickly, one record after another.
- **Ad hoc, through the week.** Managers ask HR for raises outside the cycle, often worded as "Since Jane is taking on additional responsibilities, I want to give her a salary increase. How does HR feel about this?" or "Can we give him an adjustment to make his compensation equal to that of his co-workers?" ([SHRM](https://www.shrm.org/in/topics-tools/news/benefits-compensation/cycle-salary-adjustments-can-undercut-pay-performance)). To answer, HR needs that person's salary next to their peers'. SHRM also says "compensation managers on staff" field compensation questions ([SHRM 2023](https://www.shrm.org/in/topics-tools/news/benefits-compensation/how-employers-managing-compensation-challenges-2023)).
- **Hiring.** Workday shows compa-ratio inside the Hire task as well as in compensation changes ([Workday](https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html)). Rippling and Deel present keeping offers within range as a core feature ([Rippling](https://www.rippling.com/blog/compensation-bands-rfp-template), [Deel](https://www.deel.com/hr/compensation-management)). **Inference:** checking an offer against current peers is a regular request whenever recruiting is active. With 10,000 employees, joiners and leavers come every week.
- **Monthly or quarterly.** Finance and leadership ask for cost views. HiBob pitches "real-time dashboards built for Finance and leadership" ([HiBob](https://www.hibob.com/features/compensation-management/)). Deel offers "compensation by country" reports ([Deel](https://www.deel.com/hr/compensation-management)). Pay distribution should be reviewed "over the course of a given year" ([SHRM](https://www.shrm.org/in/topics-tools/news/benefits-compensation/cycle-salary-adjustments-can-undercut-pay-performance)).
- **Once a year: the merit or compensation review.** Merit matrices tie an employee's position against the midpoint to their raise ([SHRM](https://www.shrm.org/in/topics-tools/news/benefits-compensation/cycle-salary-adjustments-can-undercut-pay-performance)). Pave sells Band Insights as the way to find out-of-band employees and fix them before a merit cycle (Pave's foundations page, per a search excerpt). Ravio advises current market data "before you kick-off the compensation review" (search excerpt of [Ravio](https://ravio.com/blog/complete-guide-to-compensation-reviews); page returned 429). Figures' manager guide reportedly shows the budget needed "to raise all employees' salaries to the minimum of their respective salary range" (search excerpt of [Figures](https://help.figures.hr/en/articles/389239-figures-for-managers-a-complete-guide); page returned 401). That is the same idea as this app's Cost to reach 0.80.

## 3. Ranked jobs the MVP can serve

Ranked by frequency × urgency for this persona. **Frequency and urgency are judgements** built from the evidence cited, not measured figures.

| Rank | Job (HR words) | Frequency | Urgency | Evidence | Entry point in this app |
|---|---|---|---|---|---|
| 1 | Look up one employee's pay | Daily | High (someone is waiting) | Workday job aid; SHRM manager requests | Global search → `/employees?q=` → `/employees/$id` |
| 2 | Correct or change a salary | Weekly, peaks at each pay cutoff | High near cutoff | Playroll; Access Group; Mercer via CompLogix | `/employees/$id` → `/employees/$id/edit` |
| 3 | Record a joiner or remove a leaver | Weekly | High before cutoff | Playroll cutoff inputs; Workday Hire task | "Add employee" → `/employees/new`; delete on `/employees/$id` |
| 4 | "What do we pay a X in Y?" (incl. checking an offer) | Weekly | Medium–high | Workday Hire task; Rippling and Deel offer ranges | `/pay/statistics?jobTitle=&country=` |
| 5 | Check whether someone is paid out of line before agreeing a raise | Weekly to monthly | Medium–high | SHRM off-cycle requests; Mercer 60% | `/employees/$id` → peer stats / `/pay/outliers?jobTitle=&country=` |
| 6 | Payroll cost by country or department for Finance | Monthly–quarterly | Medium | HiBob; Deel; Rippling | `/pay/payroll` (the landing page) |
| 7 | Prepare the annual review: who is underpaid, and what fixing it costs | Annually, with a run-up of weeks | High in the run-up, low otherwise | WorldatWork 12 months; Pave; Figures | `/pay/outliers?direction=below` |
| 8 | Compare one title across countries (location and hiring choices) | Monthly or less | Low–medium | Ravio "Compare bands across locations" | `/pay/comparison?jobTitle=` |

### 1. Look up one employee's pay
A manager, Finance or the employee asks about one person. Workday makes this the first thing the search box does: "to find a worker, type their name into the Search box and press Enter", then filter to People ([UC Cumberlands](https://helpdesk.ucumberlands.edu/support/solutions/articles/7000049007-use-tools-and-navigation)). BambooHR's directory search reportedly matches "a name, department, division, location, or job title" (search excerpt of [BambooHR help](https://bamboohr.screenstepslive.com/m/61968/l/587751-view-the-company-directory-and-org-chart); page behind login). **Entry point:** a search field in the app header on every screen. It submits to `/employees?q=<text>`. **Inference:** jumping straight to `/employees/$id` when there is exactly one match would save a click. Workday's caveat that "searches find exact matches" and may miss "Alexander" for "Alex" is a reason to keep this app's partial-name match.

### 2. Correct or change a salary
Off-cycle changes are common (Mercer, above). Changes are due by each payroll cutoff, and late ones slip to the next run ([Playroll](https://playroll.com/blog/employee-payroll-cutoff-date)). **Entry point:** `/employees/$id/edit`, one click from the employee view and from the list row. After saving, return to the list exactly as it was left; the app already remembers the last list search for this. **Inference:** the HR Manager will make several of these edits in a row before cutoff, so the path list → edit → list must not lose the filters or the page.

### 3. Record a joiner or remove a leaver
New hires and terminations are standard pre-cutoff payroll inputs. BambooHR's Home reportedly gives administrators a button to create a new employee (search excerpt of [BambooHR Home](https://bamboohr.screenstepslive.com/m/53917/l/587797-bamboohr-home); page behind login). **Entry point:** "Add employee" visible from every screen → `/employees/new`, with job title and country prefilled when started from a filtered list (**Inference**). Remove stays on `/employees/$id`, behind a confirmation, because the MVP's delete is permanent.

### 4. "What do we pay a X in Y?"
This is the requirements' first question, and it is also what offer checks need. Workday shows compa-ratio inside the Hire task ([Workday](https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html)). Rippling and Deel position their bands as keeping offers in range ([Rippling](https://www.rippling.com/blog/introducing-rippling-headcount-planning-compensation-bands), [Deel](https://www.deel.com/hr/compensation-management)). **Entry point:** `/pay/statistics?jobTitle=&country=`. Reach it from the nav, from an employee's view ("peers: this title in this country"), and from a comparison bar. The headcount should open `/employees?jobTitle=&country=`. Small groups stay marked.

### 5. Check whether someone is paid out of line before agreeing a raise
SHRM's examples are requests about one person relative to co-workers ([SHRM](https://www.shrm.org/in/topics-tools/news/benefits-compensation/cycle-salary-adjustments-can-undercut-pay-performance)). Workday displays compa-ratio "in the Compensation View Compensation task and in compensation change tasklets" ([Workday](https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html)). Ravio shows each employee's "band placement" from their record (search excerpt of [Ravio January update](https://ravio.com/blog/january-ravio-product-update)). **Entry point:** on `/employees/$id`, show the compa-ratio against the peer median, say whether the person is underpaid or overpaid, and link to `/pay/statistics` for that peer group. **Inference:** this is the most valuable small addition the research suggests, because it answers the raise request on the screen where the HR Manager already is. It only presents values the app already computes.

### 6. Payroll cost by country or department for Finance
HiBob, Deel and Rippling all sell reporting by country or department for Finance and leaders ([HiBob](https://www.hibob.com/features/compensation-management/), [Deel](https://www.deel.com/hr/compensation-management), [Rippling](https://www.rippling.com/blog/compensation-bands-rfp-template)). **Entry point:** `/pay/payroll`, the current landing page. Each country row opens `/employees?country=` and each department row opens `/employees?department=`, following the Lattice band-count pattern.

### 7. Prepare the annual review
Merit cycles come about once a year (WorldatWork). Pave positions out-of-band detection as cycle preparation, and Figures reportedly sizes the budget to bring people up to the range minimum (both above). **Entry point:** `/pay/outliers?direction=below`, which shows the ranked underpaid list and the Cost to reach 0.80. Narrow it with `&country=` or `&department=` to give each leader their slice. Each row opens `/employees/$id`.

### 8. Compare one title across countries
Ravio offers "Compare bands across locations" and "across different roles" ([Ravio](https://help.ravio.com/bands-view)). **Inference:** for ACME this comes up with location or relocation decisions, less often than the jobs above. **Entry point:** `/pay/comparison?jobTitle=`. Each country's bar or row opens `/pay/statistics?jobTitle=&country=`.

## 4. How established tools structure navigation and home

### Workday
The Home page "displays applications that provide access to tasks and reports". It splits them into "Actions" (tasks) and "View" (reports), and it is "highly configurable, so your organization may display different applications" ([UC Cumberlands](https://helpdesk.ucumberlands.edu/support/solutions/articles/7000049007-use-tools-and-navigation)). Search covers people, tasks, reports and data. It uses prefixes such as `bp:` ("?" lists them), shows "Recent searches ... below the Search box", favours complete-word matches, and supports saved faceted searches (same source). For compensation, admins can turn on "Display Compa-Ratio", "Display Position in Range" and "Display Midpoint" on View Compensation and on change tasks (Hire, Request Compensation Change), and "A warning message displays for values above or below the pay range" ([Workday admin guide](https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html)). I could not verify Workday's own top-level menu labels from a readable primary page.

### BambooHR
All help articles were behind a login, so this section rests on search-engine excerpts. Tabs reportedly include Home, My Info, People, Hiring and Files, with more under a "More" menu ([access-level article](https://bamboohr.screenstepslive.com/m/53910/l/587361-employee-access-level-view)). Home is per-user widgets, with an admin button to create a new employee or a custom report ([Home article](https://bamboohr.screenstepslive.com/m/53917/l/587797-bamboohr-home)). The People directory searches name, department, division, location or job title, and narrows by Department, Division, Location or a Custom Filter ([directory article](https://bamboohr.screenstepslive.com/m/61968/l/587751-view-the-company-directory-and-org-chart)). I found no verifiable BambooHR outlier or compa-ratio view; its compensation product pages returned 404.

### HiBob
From the product page only ([HiBob](https://www.hibob.com/features/compensation-management/)): Compensation sits under "Planning & Compensation". It offers "Automated alerts for out-of-band proposals", pay gaps "by role, level, gender, and location", "real-time dashboards built for Finance and leadership", and cycle insights on "trends, outliers, and risks". It is multi-currency. I could not read help-centre pages on navigation, search or drill-down.

### Pave
From the help centre ([distribution on bands](https://support.pave.com/articles/employee-distribution-on-bands-KGObks6Jim), [distribution in bands](https://support.pave.com/articles/employee-distribution-in-bands-s6Tzc4gppg)), all features named in those articles:

- A graph icon next to a pay range plots employees on the band. A point is one employee; hovering shows "the base pay and compa ratio of that employee". A cluster shows averages and lets "you drill down" to Band Details.
- Band Details has an In Band / Out of Band filter.
- The data grid colours employees blue (in band) or red (out of band).
- Seeing employees needs "Aggregated employee data" access, and a "Team Dashboard" setting scopes the people shown.

Product areas named on the marketing site: Market Pricing, Compensation Planning, Team View, Total Rewards ([Pave](https://www.pave.com/compensation-bands)).

### Ravio
"Navigate to Bands > View" (admin only) to "view how your employees sit within each salary band". "Click on any band to see more detail on the employees within that band, their position in the range, and their compa-ratio". Left-hand filters toggle "between different band groups and locations", and there are compare modes across roles and locations ([Ravio](https://help.ravio.com/bands-view)). A product update reportedly lets you "click into any employee's name" for band placement (search excerpt; page returned 429).

### Figures
The top navigation on the site reads Benchmark, Salary Bands, Compensation Review, and Pay Transparency & Equity. Bands can be tailored by "job role, location, business unit, and job grade", and "visual indicators ... flag employees misaligned with salary bands" ([Figures](https://figures.hr/salary-bands)). Users can "sort and filter your whole workforce by compa-ratio" and see "each employee's current compa-ratio on their profile". Analytics dashboards are listed as "coming soon" ([Figures blog](https://figures.hr/post/decoding-compa-ratio-a-comprehensive-guide-for-hr-professionals)).

### Deel
From the product page only ([Deel](https://www.deel.com/hr/compensation-management)): "Track compa-ratios by role, level, and geography", "Spot gaps, compression, or outliers", "compensation by country" reports, review cycles with "built-in global currency support". I found nothing verifiable on navigation or search.

### Lattice (optional)
Compensation Bands is under "Admin > Compensation > Compensation Bands". The table shows Job Level, band, and an Employees count, and the count "links to a filtered view of Employee Pay showing only the employees belonging to this band". Compa-ratio uses the band Target, or the midpoint if there is no Target ([Lattice](https://help.lattice.com/en-us/articles/15179221-compensation-bands-page-overview)). Cycle analytics show "spend vs. budget" ([Lattice](https://lattice.com/platform/compensation/compensation-analytics)).

### Rippling (optional)
Rippling blocks out-of-band compensation and routes it for approval. A "Workflow warns HR and a department VP when a employee's compa-ratio drops below midpoint", and compa-ratio can be reported "across any employee attribute—like gender, department" ([Rippling](https://www.rippling.com/blog/introducing-rippling-headcount-planning-compensation-bands)).

### Cross-tool patterns, and what they suggest for us
1. **Search for a person is everywhere, and it is the main way into a record** (Workday, BambooHR). *For us:* a header search that lands on the filtered list.
2. **Every aggregate opens the people inside it** (Lattice band count, Pave clusters, Ravio bands). *For us:* every total, headcount and bar in `/pay/*` links to `/employees?...` or `/pay/statistics?...`.
3. **The individual record shows where the person sits relative to peers** (Workday compa-ratio on View Compensation; Figures' profile; Ravio's band placement). *For us:* compa-ratio and the peer median on `/employees/$id`.
4. **Out-of-line pay is filterable and colour-coded, never only a total** (Pave's red/blue and In/Out filter; Figures' "visual indicators"). *For us:* the underpaid/overpaid direction filter, with a consistent colour for underpaid and overpaid in every view.
5. **Filters are the same three dimensions everywhere:** role/level, location, organisational unit. These match our job title, country and department filters.
6. **Home screens are configurable launchers (Workday, BambooHR) or analytics dashboards (HiBob, Deel). Neither kind is a single report.** *For us:* **Inference:** with one fixed user, keeping `/pay/payroll` as the landing page is defensible (ADR 0001). The header still has to carry search, Add employee and the underpaid shortcut, so the landing choice never costs the frequent jobs a detour.
7. **Much of what the tools centre on is bands, cycles, approvals and permissions.** All of that is out of this MVP's scope (section 6).

## 5. Shortcuts and entry points to provide

1. **Global employee search in the header, on every page.** It submits to `/employees?q=`, and Enter from any screen works. *Why:* job 1 is the most frequent. Workday makes search the main entry to people ([UC Cumberlands](https://helpdesk.ucumberlands.edu/support/solutions/articles/7000049007-use-tools-and-navigation)). **Inference:** a keyboard shortcut to focus it (e.g. `/`) suits someone working through a batch of lookups.
2. **"Add employee" always visible** → `/employees/new`. *Why:* joiners are a pre-cutoff input ([Playroll](https://playroll.com/blog/employee-payroll-cutoff-date)), and BambooHR puts a new-employee action on Home (search excerpt).
3. **Edit salary in one step from the record and the list row** → `/employees/$id/edit`. After saving, return to the remembered list search. *Why:* job 2 happens in runs before cutoff.
4. **Compa-ratio and peer median on `/employees/$id`**, linking to `/pay/statistics?jobTitle=&country=` and to the peers at `/employees?jobTitle=&country=`. *Why:* this answers "is this person paid in line?" where the request arrives. Workday, Figures and Ravio all do it.
5. **Deep link to underpaid outliers** (`/pay/outliers?direction=below`) as a named nav item. **Inference:** show the underpaid count and Cost to reach 0.80 next to it. *Why:* this is the pre-review check (job 7) and the Pave and Figures pattern.
6. **Drill-down from every payroll row:** a country opens `/employees?country=`, a department opens `/employees?department=`. *Why:* Lattice's count-to-filtered-list pattern, and Finance follow-ups ("who is in this number?").
7. **Drill-down from pay statistics and comparison:** a headcount opens `/employees?jobTitle=&country=`; a comparison bar or row opens `/pay/statistics?jobTitle=&country=`; the statistics page links to `/pay/outliers?jobTitle=&country=&direction=all`. *Why:* the same pattern applied to peer groups (Pave, Ravio).
8. **Outlier rows open the employee** at `/employees/$id`, and from there edit. *Why:* acting on an underpaid flag means editing one salary. Pave's band details and Ravio's band click both lead to individuals.
9. **Filters live in the URL, so a bookmark is a saved filter.** *Why:* Workday offers saved faceted searches. Shareable URLs give the HR Manager "my underpaid engineers in India" without building a saved-filter feature.
10. **Filters carry across pages.** **Inference:** moving from `/pay/outliers?country=IN` to the list should keep `country=IN`, because the HR Manager is working one slice at a time.

## 6. Later, not now

- **Salary history and audit trail.** Every tool keeps comp history (HiBob: "comp history"), but it needs an effective-dated model, which the MVP excludes.
- **Effective dates and payroll cutoff handling.** Cutoffs work on input versus effective date ([Access Group](https://help-peoplexdpayroll.theaccessgroup.com/en/articles/13441395-set-the-payroll-cutoff-date)). That depends on history.
- **Import and export (Excel/CSV).** Finance follow-ups will ask for export. It is deferred until after import, per the requirements.
- **Pay bands and position in range.** This is the centre of Pave, Ravio, Figures and Lattice. It needs policy input; the peer median stands in for now.
- **Comp review cycle workflow** (budgets, manager recommendations, merit matrices, budget pacing). Lattice, HiBob and Deel all have it. It needs multiple users and roles.
- **Approvals and blocking out-of-band changes** (Rippling, HiBob). These need roles and a band policy.
- **Alerts when someone falls below a threshold** (Rippling workflow). Notifications are out of scope.
- **Authentication and role-scoped visibility** (Pave's "Aggregated employee data" access, Rippling's row-level permissions). Production needs it; the MVP has one user.
- **Total compensation** (variable pay, equity, on-target earnings in Pave and Lattice). That needs separate data.
- **Gender pay equity analysis** (HiBob, Deel, Ravio overlays). It needs sensitive data and legal care.
- **External market benchmarks and percentiles** (Pave, Ravio, Figures). These are a different data source and not in the requirements.
- **Bulk edits.** They need preview and undo.
- **Configurable home and widgets** (Workday, BambooHR). One user and a fixed set of four questions do not need them.

## 7. Sources

- https://worldatwork.org/publications/workspan-daily/employers-budgeting-4-1-pay-raises-in-2024
- https://www.shrm.org/in/topics-tools/news/benefits-compensation/cycle-salary-adjustments-can-undercut-pay-performance
- https://www.shrm.org/in/topics-tools/news/benefits-compensation/how-employers-managing-compensation-challenges-2023
- https://www.complogix.io/blog/off-cycle-promotion/ (cites Mercer QuickPulse, March 2025, and SHRM 2022; originals not read)
- https://playroll.com/blog/employee-payroll-cutoff-date
- https://help-peoplexdpayroll.theaccessgroup.com/en/articles/13441395-set-the-payroll-cutoff-date
- https://helpdesk.ucumberlands.edu/support/solutions/articles/7000049007-use-tools-and-navigation (Workday job aid by a Workday customer)
- https://doc.workday.com/admin-guide/en-us/human-capital-management/compensation/manage-compensation/dan1370796725325.html
- https://bamboohr.screenstepslive.com/m/61968/l/587751-view-the-company-directory-and-org-chart (login; search excerpt only)
- https://bamboohr.screenstepslive.com/m/53917/l/587797-bamboohr-home (login; search excerpt only)
- https://bamboohr.screenstepslive.com/m/53910/l/587361-employee-access-level-view (login; search excerpt only)
- https://www.hibob.com/features/compensation-management/
- https://support.pave.com/articles/employee-distribution-on-bands-KGObks6Jim
- https://support.pave.com/articles/employee-distribution-in-bands-s6Tzc4gppg
- https://www.pave.com/compensation-bands
- https://pave.com/foundations (search excerpt; fetched page had no feature content)
- https://help.ravio.com/bands-view
- https://ravio.com/blog/january-ravio-product-update (429; search excerpt only)
- https://ravio.com/blog/complete-guide-to-compensation-reviews (429; search excerpt only)
- https://figures.hr/salary-bands
- https://figures.hr/post/decoding-compa-ratio-a-comprehensive-guide-for-hr-professionals
- https://help.figures.hr/en/articles/389239-figures-for-managers-a-complete-guide (401; search excerpt only)
- https://help.figures.hr/en/collections/893825-salary-bands
- https://www.deel.com/hr/compensation-management
- https://help.lattice.com/en-us/articles/15179221-compensation-bands-page-overview
- https://lattice.com/platform/compensation/compensation-analytics
- https://www.rippling.com/blog/introducing-rippling-headcount-planning-compensation-bands
- https://www.rippling.com/blog/compensation-bands-rfp-template
- Not reachable: Personio (https://personio.com/apps/compensation-management, 429).
