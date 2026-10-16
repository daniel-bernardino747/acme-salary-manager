import type { StatisticsSearch } from '../routes/search';

/**
 * `GET /api/pay-statistics` for question 1's URL search, or `null` until both a job title and a
 * country are picked: nothing is fetched before then (ADR 0004, *Question 1*).
 */
export function payStatisticsPath({ jobTitle, country }: StatisticsSearch): string | null {
  if (!jobTitle || !country) {
    return null;
  }
  return `/api/pay-statistics?${new URLSearchParams({ jobTitle, country })}`;
}
