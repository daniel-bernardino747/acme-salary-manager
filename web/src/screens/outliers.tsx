import {
  countries,
  departments,
  formatMoney,
  jobTitles,
  type Outlier,
  type OutliersResponse,
} from '@acme/contract';
import {
  Anchor,
  Badge,
  Group,
  Pagination,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { outliersPath } from '../api/outliers-path';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import { countText } from '../format/counts';
import { listRange, pageCount } from '../format/list-range';
import {
  costFootnote,
  costText,
  noOutliersText,
  outliersHeadline,
  uncheckedText,
} from '../format/outliers-copy';
import { placeDecimal } from '../format/place-decimal';
import { changeOutliersSearch, type OutliersSearchChange } from '../routes/search';

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));
const countryNames = new Map<string, string>(
  countries.map((country) => [country.code, country.name]),
);

const directionOptions = [
  { value: 'below', label: 'Underpaid' },
  { value: 'above', label: 'Overpaid' },
  { value: 'all', label: 'All' },
];

/** Question 4: who is paid out of line for their role (ADR 0004, *Question 4*). Its state is the URL. */
export function Outliers() {
  const search = useSearch({ from: '/pay/outliers' });
  const navigate = useNavigate({ from: '/pay/outliers' });
  const query = useQuery({
    queryKey: queryKey('outliers', search),
    queryFn: () => apiFetch<OutliersResponse>(outliersPath(search)),
    placeholderData: keepPreviousData,
  });
  // A direction or a filter pushes a history entry and goes back to the first page.
  const change = (next: OutliersSearchChange) =>
    void navigate({ search: (prev) => changeOutliersSearch(prev, next) });

  return (
    <Stack gap="md">
      <Title order={2}>Paid out of line</Title>
      <Stack gap={4}>
        <Text size="sm">
          Compa-ratio is salary ÷ the median salary for the same title in the same country. Below
          0.80 or above 1.20 is flagged. Groups with fewer than 5 employees aren&apos;t checked:
          their median isn&apos;t meaningful.
        </Text>
        {query.data && (
          <Text size="sm" c="dimmed">
            {uncheckedText(query.data.smallGroupHeadcount)}
          </Text>
        )}
      </Stack>
      <SegmentedControl
        data={directionOptions}
        value={search.direction}
        onChange={(direction) => change({ direction })}
        w="fit-content"
      />
      <Stack gap={4}>
        <Group align="flex-end" gap="sm">
          <Select
            label="Country"
            placeholder="Any country"
            data={countryOptions}
            value={search.country ?? null}
            onChange={(country) => change({ country })}
            clearable
            w={180}
          />
          <Select
            label="Department"
            placeholder="Any department"
            data={departments}
            value={search.department ?? null}
            onChange={(department) => change({ department })}
            clearable
            w={190}
          />
          <Select
            label="Job title"
            placeholder="Any job title"
            data={jobTitles}
            value={search.jobTitle ?? null}
            onChange={(jobTitle) => change({ jobTitle })}
            clearable
            searchable
            w={260}
          />
        </Group>
        <Text size="xs" c="dimmed">
          Filters choose which employees are shown. Each median always covers everyone with the same
          title in the same country.
        </Text>
      </Stack>
      <QueryState query={query} skeleton={<OutliersSkeleton />}>
        {(page) => (
          <Stack gap="sm">
            <Stack gap={4}>
              <Title order={3}>{outliersHeadline(page.total, search.direction)}</Title>
              {page.costToReachThreshold && <Text>{costText(page.costToReachThreshold.usd)}</Text>}
            </Stack>
            {page.total === 0 ? (
              <Text py="xl" ta="center">
                {noOutliersText(search.direction)}
              </Text>
            ) : (
              <>
                {page.items.length > 0 ? (
                  <OutliersTable outliers={page.items} />
                ) : (
                  <Text py="xl" ta="center">
                    Page {page.page} is past the end of the list.
                  </Text>
                )}
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
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
            {page.rates && (
              <Text size="sm" c="dimmed">
                {costFootnote(page.rates)}
              </Text>
            )}
          </Stack>
        )}
      </QueryState>
    </Stack>
  );
}

function OutliersTable({ outliers }: { outliers: Outlier[] }) {
  return (
    <Table.ScrollContainer minWidth={1080}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Job title</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th ta="right">Salary</Table.Th>
            <Table.Th ta="right">Peer median</Table.Th>
            <Table.Th ta="right">Compa-ratio</Table.Th>
            <Table.Th ta="right">Gap to 0.80</Table.Th>
            <Table.Th ta="right">Peers</Table.Th>
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
                    renderRoot={(props) => (
                      <Link {...props} to="/employees/$id" params={{ id: String(employee.id) }} />
                    )}
                  >
                    {employee.name}
                  </Anchor>
                </Table.Td>
                <Table.Td>{jobTitle}</Table.Td>
                <Table.Td>{countryNames.get(country)}</Table.Td>
                <Table.Td>{employee.department}</Table.Td>
                <MoneyCell>{formatMoney(employee.annualSalary, 'en')}</MoneyCell>
                <MoneyCell>
                  {/* The same median as question 1 for this group, digit for digit. */}
                  <Anchor
                    renderRoot={(props) => (
                      <Link {...props} to="/pay/statistics" search={{ jobTitle, country }} />
                    )}
                  >
                    {formatMoney(outlier.peerMedian, 'en')}
                  </Anchor>
                </MoneyCell>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    {placeDecimal(outlier.compaRatioHundredths, 2)}
                    <Badge
                      color={outlier.direction === 'below' ? 'orange' : 'grape'}
                      variant="light"
                    >
                      {outlier.direction === 'below' ? 'Below' : 'Above'}
                    </Badge>
                  </Group>
                </Table.Td>
                <MoneyCell>
                  {outlier.gapMinor !== null &&
                    formatMoney({ amountMinor: outlier.gapMinor, currency }, 'en')}
                </MoneyCell>
                <Table.Td ta="right">{countText(outlier.peerHeadcount)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function MoneyCell({ children }: { children: ReactNode }) {
  return (
    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
      {children}
    </Table.Td>
  );
}

function OutliersSkeleton() {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Loading">
      <Skeleton height={28} width="55%" />
      <Skeleton height={16} width="40%" />
      {Array.from({ length: 10 }, (_, row) => (
        <Skeleton key={row} height={28} />
      ))}
      <Group justify="space-between">
        <Skeleton height={16} width={140} />
        <Skeleton height={28} width={240} />
      </Group>
    </Stack>
  );
}
