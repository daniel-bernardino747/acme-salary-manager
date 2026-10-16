import type { OutliersResponse } from '@acme/contract';
import { queryOptions } from '@tanstack/react-query';
import { outliersSearchSchema, type OutliersSearch } from '../routes/search';
import { apiFetch } from './api-fetch';
import { outliersPath } from './outliers-path';
import { queryKey } from './query-key';

/** One page of question 4, for its screen, the Overview and the nav's underpaid count. */
export function outliersQuery(search: OutliersSearch) {
  return queryOptions({
    queryKey: queryKey('outliers', search),
    queryFn: () => apiFetch<OutliersResponse>(outliersPath(search)),
  });
}

/**
 * The outliers screen's default, Underpaid on page 1 with no filters. The Overview and the nav
 * read it under the same key, so the three share one cached request (ADR 0004, *Overview*).
 */
export const underpaidSearch: OutliersSearch = outliersSearchSchema.parse({});

/** Overpaid on page 1 with no filters: the Overview reads its `total`. */
export const overpaidSearch: OutliersSearch = outliersSearchSchema.parse({ direction: 'above' });
