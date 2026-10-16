import { countries, currencyOf, type CountryCode, type JobTitle } from '@acme/contract';

/** Counts in the app's one locale (ADR 0004, *Copy and locale*), never the machine's default. */
const counts = new Intl.NumberFormat('en');

export interface PeerGroupNames {
  jobTitle: JobTitle;
  country: CountryCode;
}

/** Countries whose English name reads with "the": "in the Netherlands", never "in Netherlands". */
const takesThe = new Set<CountryCode>(['US', 'GB', 'NL']);

/** "in India", "in the United Kingdom". */
function inCountry(country: CountryCode): string {
  const name = countries.find((c) => c.code === country)?.name ?? country;
  return takesThe.has(country) ? `in the ${name}` : `in ${name}`;
}

/**
 * Question 1's heading, e.g. "Software Engineer II in India · INR" (ADR 0004, *Question 1*). The
 * job title is shown as it is, never pluralized.
 */
export function statisticsHeading({ jobTitle, country }: PeerGroupNames): string {
  return `${jobTitle} ${inCountry(country)} · ${currencyOf(country)}`;
}

/** An empty peer group, shown in place of the figures, never as zeros (ADR 0004, *Question 1*). */
export function emptyGroupText({ jobTitle, country }: PeerGroupNames): string {
  return `No employees with the title ${jobTitle} ${inCountry(country)}.`;
}

/** "1 employee", "3 employees": counts are pluralized, job titles never are. */
function employeeCount(headcount: number): string {
  return headcount === 1 ? '1 employee' : `${counts.format(headcount)} employees`;
}

/** Shown above a small group's figures, which are still shown (ADR 0001, ADR 0004 *Question 1*). */
export function smallGroupNotice(headcount: number): string {
  return (
    `Only ${employeeCount(headcount)}. With so few people these figures say little about the ` +
    'role, and they reveal individual pay. Outlier checks skip groups under 5.'
  );
}

/** The link from the figures to the peer group's employee list, e.g. "See these 47 employees". */
export function seeEmployeesText(headcount: number): string {
  return headcount === 1 ? 'See this employee' : `See these ${employeeCount(headcount)}`;
}
