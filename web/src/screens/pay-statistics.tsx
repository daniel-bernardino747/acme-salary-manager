import { formatMoney, jobTitles, type Money, type PayStatisticsResponse } from '@acme/contract';
import { Alert, Anchor, Group, Select, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { payStatisticsQuery } from '../api/pay-statistics-query';
import { CountryStamp, Figure, Muted, PageHeader, Panel, RangeBar } from '../components/document';
import { QueryState } from '../components/query-state';
import {
  emptyGroupText,
  peerGroupName,
  seeEmployeesText,
  smallGroupNotice,
  statisticsHeading,
} from '../format/pay-statistics-copy';
import { pageQuestion } from '../layout/navigation';
import { statisticsSearchSchema } from '../routes/search';
import classes from './pay-statistics.module.css';
import { countryOptions } from '../format/country-name';

/** Counts in the app's one locale (ADR 0004, *Copy and locale*). */
const counts = new Intl.NumberFormat('en');

/** Question 1: pay statistics for one peer group (ADR 0004, *Question 1*). Its state is the URL. */
export function PayStatistics() {
  const search = useSearch({ from: '/pay/statistics' });
  const navigate = useNavigate({ from: '/pay/statistics' });
  const query = useQuery(payStatisticsQuery(search));
  // Each pick pushes a history entry, so Back returns to the previous question.
  // A cleared select's null falls back to unset through the URL's lenient schema.
  const pick = (change: { jobTitle?: string | null; country?: string | null }) =>
    void navigate({ search: (prev) => statisticsSearchSchema.parse({ ...prev, ...change }) });

  return (
    <Stack gap="lg">
      <PageHeader title="Pay statistics" question={pageQuestion('/pay/statistics')} />
      <Group align="flex-end" gap="sm">
        <Select
          label="Job title"
          placeholder="Pick a job title"
          data={jobTitles}
          value={search.jobTitle ?? null}
          onChange={(jobTitle) => pick({ jobTitle })}
          searchable
          clearable
          w={{ base: '100%', xs: 280 }}
        />
        <Select
          label="Country"
          placeholder="Pick a country"
          data={countryOptions}
          value={search.country ?? null}
          onChange={(country) => pick({ country })}
          searchable
          clearable
          w={{ base: '100%', xs: 220 }}
        />
      </Group>
      <QueryState
        query={query}
        skeleton={<StatisticsSkeleton />}
        idle={
          <Panel component="div">
            <Text c="gray.7">Pick a job title and a country to see what ACME pays them.</Text>
          </Panel>
        }
      >
        {(statistics) => <Statistics statistics={statistics} />}
      </QueryState>
    </Stack>
  );
}

function Statistics({ statistics }: { statistics: PayStatisticsResponse }) {
  const { jobTitle, country, headcount, min, median, average, max } = statistics;
  return (
    <Panel
      title={
        <>
          {peerGroupName(statistics)} <CountryStamp country={country} />
        </>
      }
    >
      {headcount === 0 || !min || !median || !average || !max ? (
        <Text>{emptyGroupText(statistics)}</Text>
      ) : (
        <Stack gap="lg">
          {statistics.smallGroup && (
            <Alert color="under" variant="light" title="Small group">
              {smallGroupNotice(headcount)}
            </Alert>
          )}
          <Group justify="space-between" align="flex-end" gap="lg" wrap="wrap">
            <div>
              <Text size="sm" c="gray.6">
                Median
              </Text>
              <Figure>{formatFigure(median)}</Figure>
            </div>
            <div className={classes.headcount}>
              <Text size="sm" c="gray.6">
                Headcount
              </Text>
              <Text fz="xl" fw={700}>
                {counts.format(headcount)}
              </Text>
            </div>
          </Group>
          <RangeBar
            min={min.amountMinor}
            max={max.amountMinor}
            median={median.amountMinor}
            average={average.amountMinor}
            smallGroup={statistics.smallGroup}
            label={`The salary range of ${statisticsHeading(statistics)}, from minimum to maximum, with the median and the average marked`}
          />
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
            <Figurette label="Minimum" value={formatFigure(min)} />
            <Figurette label="Average" value={formatFigure(average)} align="center" />
            <Figurette label="Maximum" value={formatFigure(max)} align="right" />
          </SimpleGrid>
          <Muted size="xs">The tick is the median and the diamond the average.</Muted>
        </Stack>
      )}
      <Group gap="lg" mt="lg" className={classes.links}>
        <Anchor
          renderRoot={(props) => <Link {...props} to="/employees" search={{ jobTitle, country }} />}
        >
          {seeEmployeesText(headcount)}
        </Anchor>
        <Anchor
          renderRoot={(props) => <Link {...props} to="/pay/comparison" search={{ jobTitle }} />}
        >
          Compare across countries
        </Anchor>
        <Anchor
          renderRoot={(props) => (
            <Link {...props} to="/pay/outliers" search={{ jobTitle, country }} />
          )}
        >
          See who&apos;s paid out of line
        </Anchor>
      </Group>
    </Panel>
  );
}

/** A figure in local currency with exact minor units: never whole units here (ADR 0004). */
function formatFigure(figure: Money | null): string {
  return figure === null ? '–' : formatMoney(figure, 'en');
}

function Figurette({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <div className={classes.figurette} data-align={align}>
      <Text size="sm" c="gray.6">
        {label}
      </Text>
      <Text fz="lg" fw={600} style={{ whiteSpace: 'nowrap' }}>
        {value}
      </Text>
    </div>
  );
}

function StatisticsSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading">
      <Skeleton height={24} width="45%" />
      <Skeleton height={48} width="35%" />
      <Skeleton height={28} />
      <SimpleGrid cols={{ base: 1, xs: 3 }}>
        {Array.from({ length: 3 }, (_, figure) => (
          <Skeleton key={figure} height={48} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
