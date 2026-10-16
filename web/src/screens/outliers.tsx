import { formatMoney, type Outlier } from '@acme/contract';
import {
  Anchor,
  Box,
  Group,
  Pagination,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { outliersQuery } from '../api/outliers-query';
import { CountryStamp, DirectionBadge, Muted, PageHeader, Panel } from '../components/document';
import { FilterBar } from '../components/filter-bar';
import { ArrowRightIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import records from '../components/records.module.css';
import { countText } from '../format/counts';
import { countryName } from '../format/country-name';
import { listRange, pageCount } from '../format/list-range';
import {
  costFootnote,
  costText,
  noOutliersText,
  outliersHeadline,
  smallGroupCountText,
} from '../format/outliers-copy';
import { placeDecimal } from '../format/place-decimal';
import { pageQuestion } from '../layout/navigation';
import {
  changeOutliersSearch,
  employeesSearchFromOutliers,
  type OutliersSearch,
  type OutliersSearchChange,
} from '../routes/search';
import classes from './outliers.module.css';

const directionOptions: { value: OutliersSearch['direction']; label: string }[] = [
  { value: 'below', label: 'Underpaid' },
  { value: 'above', label: 'Overpaid' },
  { value: 'all', label: 'All' },
];

/** Question 4: who is paid out of line for their role (ADR 0004, *Question 4*). Its state is the URL. */
export function Outliers() {
  const search = useSearch({ from: '/pay/outliers' });
  const navigate = useNavigate({ from: '/pay/outliers' });
  const query = useQuery({ ...outliersQuery(search), placeholderData: keepPreviousData });
  // A direction or a filter pushes a history entry and goes back to the first page.
  const change = (next: OutliersSearchChange) =>
    void navigate({ search: (prev) => changeOutliersSearch(prev, next) });

  return (
    <Stack gap="lg">
      <PageHeader title="Outliers" question={pageQuestion('/pay/outliers')} />
      <Stack gap="xs">
        <Group gap="md" align="flex-end" wrap="wrap">
          <SegmentedControl<OutliersSearch['direction']>
            data={directionOptions}
            value={search.direction}
            onChange={(direction) => change({ direction })}
            color={
              search.direction === 'above'
                ? 'over'
                : search.direction === 'below'
                  ? 'under'
                  : 'cover'
            }
            className={classes.direction}
          />
          <FilterBar filters={search} onChange={change} />
        </Group>
        <Muted size="xs">
          Filters choose which employees are shown. Each median always covers everyone with the same
          title in the same country.
        </Muted>
      </Stack>
      <QueryState query={query} skeleton={<OutliersSkeleton />}>
        {(page) => (
          <Stack gap="md">
            <div>
              <Title order={2} className={classes.headline}>
                {outliersHeadline(page.total, search.direction)}
              </Title>
              {page.costToReachThreshold && (
                <Text fz="lg" mt={4}>
                  {costText(page.costToReachThreshold.usd)}
                </Text>
              )}
            </div>
            <Box className={classes.method}>
              <Text size="sm">
                Compa-ratio is salary ÷ the median salary for the same title in the same country.
                Below 0.80 or above 1.20 is flagged. Groups with fewer than 5 employees aren&apos;t
                checked: their median isn&apos;t meaningful.
              </Text>
              <Text size="sm" c="gray.6">
                {smallGroupCountText(page.smallGroupHeadcount)}
              </Text>
            </Box>
            {page.total === 0 ? (
              <Panel component="div">
                <Text ta="center" py="lg" fw={600}>
                  {noOutliersText(search.direction)}
                </Text>
              </Panel>
            ) : (
              <>
                {page.items.length > 0 ? (
                  <>
                    <Box visibleFrom="sm">
                      <OutliersTable outliers={page.items} />
                    </Box>
                    <Box hiddenFrom="sm">
                      <OutlierRecords outliers={page.items} />
                    </Box>
                  </>
                ) : (
                  <Text py="xl" ta="center">
                    Page {page.page} is past the end of the list.
                  </Text>
                )}
                <Group justify="space-between" gap="sm">
                  <Text size="sm" c="gray.6">
                    {page.items.length > 0 && listRange(page)}
                  </Text>
                  {/* The URL's page, so it moves on click while keepPreviousData shows the old one. */}
                  <Pagination
                    total={pageCount(page)}
                    value={search.page}
                    onChange={(next) =>
                      void navigate({ search: (prev) => ({ ...prev, page: next }) })
                    }
                  />
                </Group>
              </>
            )}
            <Anchor
              renderRoot={(props) => (
                <Link {...props} to="/employees" search={employeesSearchFromOutliers(search)} />
              )}
            >
              <Group gap={6} component="span">
                See all employees with these filters
                <ArrowRightIcon size={16} />
              </Group>
            </Anchor>
            {page.rates && <Muted size="xs">{costFootnote(page.rates)}</Muted>}
          </Stack>
        )}
      </QueryState>
    </Stack>
  );
}

function OutliersTable({ outliers }: { outliers: Outlier[] }) {
  return (
    <div className={records.tableWrap}>
      <Table className={records.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Employee</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th className={records.money}>Salary</Table.Th>
            <Table.Th className={records.money}>Peer median</Table.Th>
            <Table.Th className={records.money}>Compa-ratio</Table.Th>
            <Table.Th className={records.money}>Gap to 0.80</Table.Th>
            <Table.Th className={records.money}>Peers</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {outliers.map((outlier) => {
            const { employee } = outlier;
            const { jobTitle, country } = employee;
            const currency = employee.annualSalary.currency;
            return (
              <Table.Tr key={employee.id}>
                <Table.Td>
                  <Anchor
                    fw={600}
                    renderRoot={(props) => (
                      <Link {...props} to="/employees/$id" params={{ id: String(employee.id) }} />
                    )}
                  >
                    {employee.name}
                  </Anchor>
                  <Text size="sm" c="gray.6">
                    {jobTitle} · {countryName(country)} <CountryStamp country={country} />
                  </Text>
                </Table.Td>
                <Table.Td>{employee.department}</Table.Td>
                <Table.Td className={records.money}>
                  {formatMoney(employee.annualSalary, 'en')}
                </Table.Td>
                <Table.Td className={records.money}>
                  {/* The same median as question 1 for this group, digit for digit. */}
                  <Anchor
                    renderRoot={(props) => (
                      <Link {...props} to="/pay/statistics" search={{ jobTitle, country }} />
                    )}
                  >
                    {formatMoney(outlier.peerMedian, 'en')}
                  </Anchor>
                </Table.Td>
                <Table.Td className={records.money}>
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    <Text fw={700} span>
                      {placeDecimal(outlier.compaRatioHundredths, 2)}
                    </Text>
                    <DirectionBadge direction={outlier.direction} />
                  </Group>
                </Table.Td>
                <Table.Td className={records.money}>
                  {outlier.gapMinor !== null &&
                    formatMoney({ amountMinor: outlier.gapMinor, currency }, 'en')}
                </Table.Td>
                <Table.Td className={records.money}>{countText(outlier.peerHeadcount)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}

/**
 * On a phone each outlier stacks: name and compa-ratio, job title · country, salary against the
 * peer median, and the gap.
 */
function OutlierRecords({ outliers }: { outliers: Outlier[] }) {
  return (
    <ul className={records.records}>
      {outliers.map((outlier) => {
        const { employee } = outlier;
        const currency = employee.annualSalary.currency;
        return (
          <li key={employee.id}>
            <Link
              className={records.record}
              to="/employees/$id"
              params={{ id: String(employee.id) }}
            >
              <div className={records.recordTop}>
                <span className={records.recordName}>{employee.name}</span>
                <Group gap={6} wrap="nowrap">
                  <Text fw={700} span>
                    {placeDecimal(outlier.compaRatioHundredths, 2)}
                  </Text>
                  <DirectionBadge direction={outlier.direction} />
                </Group>
              </div>
              <div className={records.recordMeta}>
                {employee.jobTitle} · {countryName(employee.country)}{' '}
                <CountryStamp country={employee.country} />
              </div>
              <div className={records.recordFigures}>
                <span>
                  {formatMoney(employee.annualSalary, 'en')}{' '}
                  <Text span c="gray.6" size="sm">
                    of median {formatMoney(outlier.peerMedian, 'en')}
                  </Text>
                </span>
                {outlier.gapMinor !== null && (
                  <span>
                    <Text span c="gray.6" size="sm">
                      Gap{' '}
                    </Text>
                    {formatMoney({ amountMinor: outlier.gapMinor, currency }, 'en')}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function OutliersSkeleton() {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Loading">
      <Skeleton height={28} width="55%" />
      <Skeleton height={20} width="40%" />
      <Skeleton height={56} />
      {Array.from({ length: 8 }, (_, row) => (
        <Skeleton key={row} height={48} />
      ))}
    </Stack>
  );
}
