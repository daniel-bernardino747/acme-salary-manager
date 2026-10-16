import { BarChart } from '@mantine/charts';
import { countries, jobTitles, type JobTitle, type PayComparisonResponse } from '@acme/contract';
import { Anchor, Badge, Box, Group, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { payComparisonPath } from '../api/pay-comparison-path';
import { queryKey } from '../api/query-key';
import { CountryStamp, Muted, PageHeader, Panel } from '../components/document';
import { QueryState } from '../components/query-state';
import rowStyles from '../components/rows.module.css';
import { comparisonFootnote, highestMedianFirst, medianBars } from '../format/comparison-copy';
import { countText, employeeCount } from '../format/counts';
import { countryStamp } from '../format/country-stamp';
import { countryName } from '../format/country-name';
import { wholeUnits } from '../format/whole-units';
import { pageQuestion } from '../layout/navigation';
import { comparisonSearchSchema } from '../routes/search';
import classes from './pay-comparison.module.css';

/**
 * The comparison is in whole USD: its figures carry two roundings and a fixed rate, so cents would
 * claim a precision they do not have (ADR 0004, *Question 3*). A bar's length is its median in
 * cents; its tooltip and axis labels are that median in whole USD.
 */
const wholeUsd = (amountMinor: number) => wholeUnits({ amountMinor, currency: 'USD' });

/** Small groups are drawn muted, so one person's pay does not read as a national median. */
const barColor = { fiveOrMore: 'visa.6', smallGroup: 'url(#small-group-hatch)' } as const;

/** The chart grows with its bars, and its skeleton holds the room for every country. */
const chartHeight = (bars: number) => bars * 44 + 40;

type ComparisonRow = PayComparisonResponse['rows'][number];

/** The table's figure columns, in order after Country and Headcount. */
const figures = ['min', 'median', 'average', 'max'] as const;

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
    <Stack gap="lg">
      <PageHeader title="Across countries" question={pageQuestion('/pay/comparison')} />
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
        w={{ base: '100%', xs: 300 }}
      />
      <QueryState
        query={query}
        skeleton={<ComparisonSkeleton />}
        idle={
          <Panel component="div">
            <Text c="gray.7">Pick a job title to compare its pay across countries.</Text>
          </Panel>
        }
      >
        {(comparison) => <Comparison comparison={comparison} />}
      </QueryState>
    </Stack>
  );
}

function Comparison({ comparison }: { comparison: PayComparisonResponse }) {
  const navigate = useNavigate();
  const { jobTitle } = comparison;
  // The chart and the table share one ranking, so they pair row for row.
  const rows = highestMedianFirst(comparison.rows);
  const bars = medianBars(rows);
  const codeOf = new Map(rows.map((row) => [countryName(row.country), row.country]));
  const narrow = useMediaQuery('(max-width: 48em)') ?? false;
  return (
    <Stack gap="lg">
      <Panel title={`Median salary of ${jobTitle}, in USD`}>
        {bars.length === 0 ? (
          <Text>No employees with the title {jobTitle} in any country.</Text>
        ) : (
          <Stack gap="sm">
            <HatchPattern />
            <BarChart
              h={chartHeight(bars.length)}
              data={bars.map((bar) => ({
                ...bar,
                color: bar.smallGroup ? barColor.smallGroup : barColor.fiveOrMore,
              }))}
              dataKey="country"
              orientation="vertical"
              series={[{ name: 'medianUsdMinor', label: 'Median', color: barColor.fiveOrMore }]}
              valueFormatter={wholeUsd}
              // A phone keeps the bars wide: the axis names the country, and the table below carries the stamp.
              yAxisProps={
                narrow
                  ? { width: 110 }
                  : { width: 190, tick: (props: TickProps) => <CountryTick {...props} /> }
              }
              // A phone has room for three evenly spaced labels, a desktop for five.
              xAxisProps={{ tickCount: narrow ? 3 : 5 }}
              gridAxis="x"
              barProps={{
                radius: 2,
                cursor: 'pointer',
                // A bar opens the same pay statistics as its table row (ADR 0004, *Question 3*).
                onClick: (bar: unknown) => {
                  const name = (bar as { payload?: { country?: string } }).payload?.country;
                  const country = name ? codeOf.get(name) : undefined;
                  if (country) {
                    void navigate({ to: '/pay/statistics', search: { jobTitle, country } });
                  }
                },
              }}
            />
            <Group gap="md">
              <LegendEntry kind="full">5 or more employees</LegendEntry>
              <LegendEntry kind="small">fewer than 5 employees</LegendEntry>
            </Group>
          </Stack>
        )}
      </Panel>
      <Panel title="By country">
        <Box visibleFrom="sm">
          <ComparisonTable jobTitle={jobTitle} rows={rows} />
        </Box>
        <Box hiddenFrom="sm">
          <ComparisonRows jobTitle={jobTitle} rows={rows} />
        </Box>
      </Panel>
      <Muted size="xs">{comparisonFootnote(comparison.rates)}</Muted>
    </Stack>
  );
}

/** The chart's country axis: the country's name, then its stamp, drawn in the chart's SVG. */
/** What Recharts passes a custom axis tick. */
interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: unknown };
}

function CountryTick({ x, y, payload }: TickProps) {
  const name = String(payload?.value ?? '');
  const code = countries.find((country) => country.name === name)?.code;
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text x={-74} dy={4} textAnchor="end" fontSize={12} fill="var(--mantine-color-gray-7)">
        {name}
      </text>
      {code && (
        <>
          <rect
            x={-66}
            y={-9}
            width={60}
            height={18}
            fill="none"
            stroke="var(--mantine-color-visa-4)"
          />
          <rect
            x={-64}
            y={-7}
            width={56}
            height={14}
            fill="none"
            stroke="var(--mantine-color-visa-4)"
          />
          <text
            x={-36}
            dy={4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            letterSpacing="0.06em"
            fill="var(--mantine-color-visa-7)"
          >
            {countryStamp(code)}
          </text>
        </>
      )}
    </g>
  );
}

/**
 * The hatch a small group's bar is filled with, so it never reads as a national median by colour
 * alone. An inline SVG pattern, referenced by id from the chart's bars.
 */
function HatchPattern() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <pattern
          id="small-group-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="var(--mantine-color-gray-1)" />
          <rect width="3" height="6" fill="var(--mantine-color-gray-4)" />
        </pattern>
      </defs>
    </svg>
  );
}

function LegendEntry({ kind, children }: { kind: 'full' | 'small'; children: ReactNode }) {
  return (
    <Group gap={6}>
      <span className={classes.swatch} data-kind={kind} aria-hidden="true" />
      <Text size="sm">{children}</Text>
    </Group>
  );
}

function ComparisonTable({ jobTitle, rows }: { jobTitle: JobTitle; rows: ComparisonRow[] }) {
  const navigate = useNavigate();
  return (
    <Table className={rowStyles.table} horizontalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Country</Table.Th>
          <Table.Th className={rowStyles.money}>Headcount</Table.Th>
          <Table.Th className={rowStyles.money}>Min</Table.Th>
          <Table.Th className={rowStyles.money}>Median</Table.Th>
          <Table.Th className={rowStyles.money}>Average</Table.Th>
          <Table.Th className={rowStyles.money}>Max</Table.Th>
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
            <Table.Tr key={row.country} data-link onClick={() => void navigate(statistics)}>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Anchor
                  fw={600}
                  renderRoot={(props) => <Link {...props} {...statistics} />}
                  onClick={(event) => event.stopPropagation()}
                >
                  {countryName(row.country)}
                </Anchor>{' '}
                <CountryStamp country={row.country} />
              </Table.Td>
              <Table.Td className={rowStyles.money}>
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
                <Table.Td colSpan={4} ta="right" c="gray.6">
                  No employees
                </Table.Td>
              ) : (
                figures.map((figure) => (
                  <Table.Td
                    key={figure}
                    className={rowStyles.money}
                    fw={figure === 'median' ? 700 : undefined}
                  >
                    {row[figure] && wholeUnits(row[figure])}
                  </Table.Td>
                ))
              )}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

/** On a phone each country stacks: name and headcount, the median, then min to max. */
function ComparisonRows({ jobTitle, rows }: { jobTitle: JobTitle; rows: ComparisonRow[] }) {
  return (
    <ul className={classes.stacked}>
      {rows.map((row) => (
        <li key={row.country}>
          <Link
            className={rowStyles.row}
            to="/pay/statistics"
            search={{ jobTitle, country: row.country }}
          >
            <div className={rowStyles.rowTop}>
              <span className={rowStyles.rowName}>
                {countryName(row.country)} <CountryStamp country={row.country} />
              </span>
              <span className={rowStyles.rowMeta}>
                {row.smallGroup ? 'Small group · ' : ''}
                {employeeCount(row.headcount)}
              </span>
            </div>
            {row.headcount === 0 || !row.median || !row.min || !row.max ? (
              <div className={rowStyles.rowMeta}>No employees</div>
            ) : (
              <div className={rowStyles.rowFigures}>
                <Text fw={700}>Median {wholeUnits(row.median)}</Text>
                <Text size="sm" c="gray.6">
                  {wholeUnits(row.min)} to {wholeUnits(row.max)}
                </Text>
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ComparisonSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      <Skeleton height={24} width="45%" />
      <Skeleton height={chartHeight(countries.length)} />
      <Stack gap="xs">
        {Array.from({ length: 8 }, (_, row) => (
          <Skeleton key={row} height={28} />
        ))}
      </Stack>
      <Skeleton height={14} width="80%" />
    </Stack>
  );
}
