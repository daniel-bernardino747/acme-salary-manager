import { BarChart } from '@mantine/charts';
import { formatMoney, jobTitles, type Money, type PayComparisonResponse } from '@acme/contract';
import {
  Anchor,
  Badge,
  ColorSwatch,
  Group,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { payComparisonPath } from '../api/pay-comparison-path';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import { comparisonFootnote, highestMedianFirst, medianBars } from '../format/comparison-copy';
import { countText } from '../format/counts';
import { countryName } from '../format/country-name';
import { comparisonSearchSchema } from '../routes/search';

/**
 * The comparison is in whole USD: its figures carry two roundings and a fixed rate, so cents would
 * claim a precision they do not have. Rounded in integers (ADR 0004, *Question 3*).
 */
const whole = (money: Money) => formatMoney(money, 'en', { wholeUnits: true });

/** A bar's length is its median in cents; its labels are that median in whole USD. */
const wholeUsd = (amountMinor: number) => whole({ amountMinor, currency: 'USD' });

/** Small groups are drawn muted, so one person's pay does not read as a national median. */
const barColor = { checked: 'blue.6', smallGroup: 'gray.4' } as const;

type ComparisonRow = PayComparisonResponse['rows'][number];

/** Question 3: one job title across every country, in USD (ADR 0004, *Question 3*). */
export function PayComparison() {
  const search = useSearch({ from: '/pay/comparison' });
  const navigate = useNavigate({ from: '/pay/comparison' });
  const path = payComparisonPath(search);
  const query = useQuery({
    queryKey: queryKey('pay-comparison', search),
    // Disabled until a title is picked, so `path` is set whenever this runs.
    queryFn: () => apiFetch<PayComparisonResponse>(path ?? ''),
    enabled: path !== null,
  });

  return (
    <Stack gap="md">
      <Title order={2}>Pay across countries</Title>
      <Select
        label="Job title"
        placeholder="Pick a job title"
        data={jobTitles}
        value={search.jobTitle ?? null}
        // Each pick pushes a history entry; a cleared select falls back to unset through the URL schema.
        onChange={(jobTitle) =>
          void navigate({ search: (prev) => comparisonSearchSchema.parse({ ...prev, jobTitle }) })
        }
        searchable
        clearable
        w={280}
      />
      <QueryState
        query={query}
        skeleton={<ComparisonSkeleton />}
        idle={<Text c="dimmed">Pick a job title to compare its pay across countries.</Text>}
      >
        {(comparison) => <Comparison comparison={comparison} />}
      </QueryState>
    </Stack>
  );
}

function Comparison({ comparison }: { comparison: PayComparisonResponse }) {
  // The chart and the table share one ranking, so they pair row for row.
  const rows = highestMedianFirst(comparison.rows);
  const bars = medianBars(rows);
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>Median salary of {comparison.jobTitle}, in USD</Title>
        {bars.length === 0 ? (
          <Text>No employees with the title {comparison.jobTitle} in any country.</Text>
        ) : (
          <>
            <BarChart
              h={bars.length * 44 + 40}
              data={bars.map((bar) => ({
                ...bar,
                color: bar.smallGroup ? barColor.smallGroup : barColor.checked,
              }))}
              dataKey="country"
              orientation="vertical"
              series={[{ name: 'medianUsdMinor', label: 'Median', color: barColor.checked }]}
              valueFormatter={wholeUsd}
              yAxisProps={{ width: 120 }}
              gridAxis="x"
            />
            <Group gap="lg">
              <LegendEntry color={barColor.checked}>5 or more employees</LegendEntry>
              <LegendEntry color={barColor.smallGroup}>fewer than 5 employees</LegendEntry>
            </Group>
          </>
        )}
      </Stack>
      <ComparisonTable jobTitle={comparison.jobTitle} rows={rows} />
      <Text size="sm" c="dimmed">
        {comparisonFootnote(comparison.rates)}
      </Text>
    </Stack>
  );
}

function LegendEntry({ color, children }: { color: string; children: ReactNode }) {
  return (
    <Group gap={6}>
      <ColorSwatch color={`var(--mantine-color-${color.replace('.', '-')})`} size={12} />
      <Text size="sm">{children}</Text>
    </Group>
  );
}

function ComparisonTable({
  jobTitle,
  rows,
}: {
  jobTitle: PayComparisonResponse['jobTitle'];
  rows: ComparisonRow[];
}) {
  const navigate = useNavigate();
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Country</Table.Th>
            <Table.Th ta="right">Headcount</Table.Th>
            <Table.Th ta="right">Min</Table.Th>
            <Table.Th ta="right">Median</Table.Th>
            <Table.Th ta="right">Average</Table.Th>
            <Table.Th ta="right">Max</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            // Each row opens that group's pay statistics, with its exact local figures.
            const statistics = {
              to: '/pay/statistics',
              search: { jobTitle, country: row.country },
            } as const;
            return (
              <Table.Tr
                key={row.country}
                onClick={() => void navigate(statistics)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Td>
                  <Anchor
                    renderRoot={(props) => <Link {...props} {...statistics} />}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {countryName(row.country)}
                  </Anchor>
                </Table.Td>
                <Table.Td ta="right">
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    {row.smallGroup && (
                      <Badge color="gray" variant="light">
                        Small group
                      </Badge>
                    )}
                    {countText(row.headcount)}
                  </Group>
                </Table.Td>
                {row.headcount === 0 ? (
                  <Table.Td colSpan={4} ta="right" c="dimmed">
                    No employees
                  </Table.Td>
                ) : (
                  [row.min, row.median, row.average, row.max].map((figure, i) => (
                    <Table.Td key={i} ta="right" style={{ whiteSpace: 'nowrap' }}>
                      {figure && whole(figure)}
                    </Table.Td>
                  ))
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function ComparisonSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      <Skeleton height={24} width="45%" />
      <Skeleton height={7 * 44 + 40} />
      <Stack gap="xs">
        {Array.from({ length: 8 }, (_, row) => (
          <Skeleton key={row} height={28} />
        ))}
      </Stack>
      <Skeleton height={14} width="80%" />
    </Stack>
  );
}
