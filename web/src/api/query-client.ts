import { QueryClient } from '@tanstack/react-query';
import { ApiProblem } from './api-fetch';

const MAX_RETRIES = 3;

/** The app's query defaults (ADR 0004, *Data fetching*). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A 4xx answers the same way every time, so only server and network failures are retried.
        retry: (failureCount, error) =>
          !(error instanceof ApiProblem && error.status < 500) && failureCount < MAX_RETRIES,
      },
    },
  });
}
