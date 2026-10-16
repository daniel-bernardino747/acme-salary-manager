import { countries, currencyOf, type CountryCode, type JobTitle } from '@acme/contract';

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
