import type { QueryObserverResult } from '@tanstack/react-query';

export type QueryPhase = 'idle' | 'loading' | 'error' | 'data';

/**
 * Which of `QueryState`'s views a query is in. A disabled query with no data stays `pending` in
 * TanStack Query v5 without fetching, so `pending` alone would show a skeleton forever.
 */
export function queryPhase(query: Pick<QueryObserverResult, 'status' | 'fetchStatus'>): QueryPhase {
  if (query.status === 'pending') {
    return query.fetchStatus === 'idle' ? 'idle' : 'loading';
  }
  return query.status === 'error' ? 'error' : 'data';
}
