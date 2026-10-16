import {
  countries,
  formatMoney,
  jobTitles,
  type Money,
  type PayStatisticsResponse,
} from '@acme/contract';
import {
  Alert,
  Anchor,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { apiFetch } from '../api/api-fetch';
import { payStatisticsPath } from '../api/pay-statistics-path';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import {
  emptyGroupText,
  seeEmployeesText,
  smallGroupNotice,
  statisticsHeading,
} from '../format/pay-statistics-copy';
import { statisticsSearchSchema } from '../routes/search';

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));

/** Counts in the app's one locale (ADR 0004, *Copy and locale*). */
const counts = new Intl.NumberFormat('en');

/** Question 1: pay statistics for one peer group (ADR 0004, *Question 1*). Its state is the URL. */
export function PayStatistics() {
  const search = useSearch({ from: '/pay/statistics' });
  const navigate = useNavigate({ from: '/pay/statistics' });
  const path = payStatisticsPath(search);
  const query = useQuery({
    queryKey: queryKey('pay-statistics', search),
    // Disabled until both are picked, so `path` is set whenever this runs.
    queryFn: () => apiFetch<PayStatisticsResponse>(path ?? ''),
    enabled: path !== null,
  });
  // Each pick pushes a history entry, so Back returns to the previous question.
  // A cleared select's null falls back to unset through the URL's lenient schema.
  const pick = (change: { jobTitle?: string | null; country?: string | null }) =>
    void navigate({ search: (prev) => statisticsSearchSchema.parse({ ...prev, ...change }) });

  return (
    <Stack gap="md">
      <Title order={2}>Pay statistics</Title>
      <Group align="flex-end" gap="sm">
        <Select
          label="Job title"
          placeholder="Pick a job title"
          data={jobTitles}
          value={search.jobTitle ?? null}
          onChange={(jobTitle) => pick({ jobTitle })}
          searchable
          clearable
          w={280}
        />
        <Select
          label="Country"
          placeholder="Pick a country"
          data={countryOptions}
          value={search.country ?? null}
          onChange={(country) => pick({ country })}
          searchable
          clearable
          w={200}
        />
      </Group>
      <QueryState
        query={query}
        skeleton={<StatisticsSkeleton />}
        idle={<Text c="dimmed">Pick a job title and a country to see what ACME pays them.</Text>}
      >
        {(statistics) => <Statistics statistics={statistics} />}
      </QueryState>
    </Stack>
  );
}

function Statistics({ statistics }: { statistics: PayStatisticsResponse }) {
  const { jobTitle, country, headcount } = statistics;
  return (
    <Stack gap="md">
      <Title order={3}>{statisticsHeading(statistics)}</Title>
      {headcount === 0 ? (
        <Text>{emptyGroupText(statistics)}</Text>
      ) : (
        <>
          {statistics.smallGroup && (
            <Alert color="yellow" title="Small group">
              {smallGroupNotice(headcount)}
            </Alert>
          )}
          <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }}>
            <Figure label="Headcount" value={counts.format(headcount)} />
            <Figure label="Minimum" value={money(statistics.min)} />
            <Figure label="Median" value={money(statistics.median)} />
            <Figure label="Average" value={money(statistics.average)} />
            <Figure label="Maximum" value={money(statistics.max)} />
          </SimpleGrid>
        </>
      )}
      <Group gap="lg">
        {headcount > 0 && (
          <Anchor
            renderRoot={(props) => (
              <Link {...props} to="/employees" search={{ jobTitle, country }} />
            )}
          >
            {seeEmployeesText(headcount)}
          </Anchor>
        )}
        <Anchor
          renderRoot={(props) => <Link {...props} to="/pay/comparison" search={{ jobTitle }} />}
        >
          Compare across countries
        </Anchor>
        {headcount > 0 && (
          <Anchor
            renderRoot={(props) => (
              <Link {...props} to="/pay/outliers" search={{ jobTitle, country }} />
            )}
          >
            See who&apos;s paid out of line
          </Anchor>
        )}
      </Group>
    </Stack>
  );
}

/** A figure in local currency with exact minor units: never whole units here (ADR 0004). */
function money(figure: Money | null): string {
  return figure === null ? '–' : formatMoney(figure, 'en');
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="xl" fw={600} style={{ whiteSpace: 'nowrap' }}>
        {value}
      </Text>
    </Paper>
  );
}

function StatisticsSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading">
      <Skeleton height={28} width="45%" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }}>
        {Array.from({ length: 5 }, (_, figure) => (
          <Skeleton key={figure} height={72} />
        ))}
      </SimpleGrid>
      <Skeleton height={16} width="60%" />
    </Stack>
  );
}
