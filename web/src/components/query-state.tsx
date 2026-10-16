import { Alert, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiProblem } from '../api/api-fetch';

interface QueryStateProps<T> {
  query: UseQueryResult<T>;
  /** A skeleton matching the screen's final layout. Defaults to a few lines. */
  skeleton?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * The three states every query screen has (ADR 0004, *Screens*): a skeleton while loading, an
 * inline alert with Retry on error, and the data.
 */
export function QueryState<T>({ query, skeleton, children }: QueryStateProps<T>) {
  if (query.isPending) {
    return skeleton ?? <DefaultSkeleton />;
  }
  if (query.isError) {
    return (
      <Alert color="red" title="Could not load this page">
        <Stack gap="sm">
          <Text size="sm">{describeError(query.error)}</Text>
          <Group>
            <Button
              size="xs"
              variant="light"
              color="red"
              loading={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Retry
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  }
  return children(query.data);
}

function DefaultSkeleton() {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Loading">
      <Skeleton height={28} width="40%" />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton height={16} width="70%" />
    </Stack>
  );
}

function describeError(error: Error): string {
  if (error instanceof ApiProblem) {
    return error.message;
  }
  return 'The server could not be reached. Check your connection and try again.';
}
