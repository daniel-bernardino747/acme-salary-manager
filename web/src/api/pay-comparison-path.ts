import type { ComparisonSearch } from '../routes/search';

/**
 * `GET /api/pay-comparison` for question 3's URL search, or `null` until a job title is picked:
 * nothing is fetched before then (ADR 0004, *Question 3*).
 */
export function payComparisonPath({ jobTitle }: ComparisonSearch): string | null {
  if (!jobTitle) {
    return null;
  }
  return `/api/pay-comparison?${new URLSearchParams({ jobTitle })}`;
}
