import type { PayStatisticsResponse } from '@acme/contract';
import { queryOptions } from '@tanstack/react-query';
import type { StatisticsSearch } from '../routes/search';
import { apiFetch } from './api-fetch';
import { payStatisticsPath } from './pay-statistics-path';
import { queryKey } from './query-key';

/**
 * Question 1 for one peer group, for its screen and the employee view's Peers panel. Disabled until
 * both a job title and a country are set, so nothing is fetched before then (ADR 0004).
 */
export function payStatisticsQuery(search: StatisticsSearch) {
  const path = payStatisticsPath(search);
  return queryOptions({
    queryKey: queryKey('pay-statistics', search),
    // Disabled while `path` is null, so it is set whenever this runs.
    queryFn: () => apiFetch<PayStatisticsResponse>(path ?? ''),
    enabled: path !== null,
  });
}
