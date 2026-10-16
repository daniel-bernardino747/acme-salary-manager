import type { CountryCode, JobTitle } from '@acme/contract';

/** One title-and-country cell of the seed (ADR 0005): a peer group as the seed builds it. */
export interface Cell {
  jobTitle: JobTitle;
  country: CountryCode;
}

/** Matches anything that sits in the cell of `jobTitle` and `country`. */
export const inCell =
  (jobTitle: JobTitle, country: CountryCode) =>
  (item: Cell): boolean =>
    item.jobTitle === jobTitle && item.country === country;
