import { countries, jobTitles, type Outlier, type PayrollTotalsResponse } from '@acme/contract';
import {
  Anchor,
  Box,
  Button,
  Group,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { apiFetch } from '../api/api-fetch';
import { outliersQuery, overpaidSearch, underpaidSearch } from '../api/outliers-query';
import { queryKey } from '../api/query-key';
import {
  CountryStamp,
  DirectionBadge,
  Figure,
  Muted,
  PageHeader,
  Panel,
  ShareBar,
} from '../components/document';
import { ArrowRightIcon, PlusIcon, SearchIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import { countText, employeeCount } from '../format/counts';
import { countryName } from '../format/country-name';
import { costText, smallGroupCountText } from '../format/outliers-copy';
import { shareBars, topOutliers } from '../format/overview';
import { payrollFootnote, shareText } from '../format/payroll-copy';
import { placeDecimal } from '../format/place-decimal';
import { wholeUnits } from '../format/whole-units';
import { openGlobalSearch } from '../layout/global-search';
import { statisticsSearchSchema } from '../routes/search';
import classes from './overview.module.css';

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));

/**
 * `/`, the Overview (ADR 0004, *Overview*, as amended by #40): find an employee, what we pay a
 * role, who is paid out of line, and the annual payroll. Each panel loads and fails on its own.
 */
export function Overview() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="Overview"
        question="Start here: find someone, look up pay, act on outliers."
      />
      <button type="button" className={classes.find} onClick={openGlobalSearch}>
        <SearchIcon size={22} />
        <span>Find an employee by name, or a job title</span>
        <kbd className={classes.kbd}>Ctrl K</kbd>
      </button>
      <Box className={classes.grid}>
        <OutOfLine />
        <Stack gap="lg">
          <WhatDoWePay />
          <AnnualPayroll />
        </Stack>
      </Box>
    </Stack>
  );
}

function OutOfLine() {
  const underpaid = useQuery(outliersQuery(underpaidSearch));
  const overpaid = useQuery(outliersQuery(overpaidSearch));
  return (
    <Panel title="Paid out of line">
      <QueryState query={underpaid} skeleton={<OutOfLineSkeleton />}>
        {(page) => (
          <Stack gap="md">
            <div>
              <Figure color={page.total > 0 ? 'under.6' : undefined}>
                {countText(page.total)} underpaid
              </Figure>
              {page.costToReachThreshold && (
                <Text mt={4}>{costText(page.costToReachThreshold.usd)}</Text>
              )}
            </div>
            {page.total === 0 ? (
              <Text>No one is paid below 0.80 of their peer median.</Text>
            ) : (
              <TopUnderpaid outliers={topOutliers(page.items)} />
            )}
            <Group gap="lg" wrap="wrap">
              {page.total > 0 && (
                <Anchor renderRoot={(props) => <Link {...props} to="/pay/outliers" />}>
                  See all {countText(page.total)} underpaid
                </Anchor>
              )}
              {overpaid.data && (
                <Anchor
                  renderRoot={(props) => (
                    <Link {...props} to="/pay/outliers" search={{ direction: 'above' }} />
                  )}
                >
                  {countText(overpaid.data.total)} overpaid
                </Anchor>
              )}
            </Group>
            <Muted>
              Compa-ratio is salary ÷ the median for the same title in the same country.{' '}
              {smallGroupCountText(page.smallGroupHeadcount)}
            </Muted>
          </Stack>
        )}
      </QueryState>
    </Panel>
  );
}

function TopUnderpaid({ outliers }: { outliers: Outlier[] }) {
  return (
    <Table className={classes.top} verticalSpacing="xs" horizontalSpacing={0}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Most underpaid</Table.Th>
          <Table.Th ta="right">Compa-ratio</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {outliers.map(({ employee, compaRatioHundredths, direction }) => (
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
                {employee.jobTitle} · {countryName(employee.country)}{' '}
                <CountryStamp country={employee.country} />
              </Text>
            </Table.Td>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Text fw={700}>{placeDecimal(compaRatioHundredths, 2)}</Text>
                <DirectionBadge direction={direction} />
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/** "What do we pay?": a job title and a country, which open pay statistics for that pair. */
function WhatDoWePay() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  return (
    <Panel title="What do we pay?">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({
            to: '/pay/statistics',
            search: statisticsSearchSchema.parse({ jobTitle, country }),
          });
        }}
      >
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <Select
              label="Job title"
              placeholder="Pick a job title"
              data={jobTitles}
              value={jobTitle}
              onChange={setJobTitle}
              searchable
              clearable
            />
            <Select
              label="Country"
              placeholder="Pick a country"
              data={countryOptions}
              value={country}
              onChange={setCountry}
              searchable
              clearable
            />
          </SimpleGrid>
          <Group>
            <Button
              type="submit"
              disabled={jobTitle === null}
              rightSection={<ArrowRightIcon size={16} />}
            >
              See pay statistics
            </Button>
          </Group>
        </Stack>
      </form>
    </Panel>
  );
}

function AnnualPayroll() {
  const query = useQuery({
    queryKey: queryKey('payroll-totals'),
    queryFn: () => apiFetch<PayrollTotalsResponse>('/api/payroll-totals'),
  });
  return (
    <Panel title="Annual payroll">
      <QueryState query={query} skeleton={<PayrollSkeleton />}>
        {({ grandTotal, byCountry, rates }) => (
          <Stack gap="md">
            <div>
              <Figure>{wholeUnits(grandTotal.usd)}</Figure>
              <Text mt={4}>{employeeCount(grandTotal.headcount)}</Text>
            </div>
            {grandTotal.headcount === 0 ? (
              <Group gap="sm">
                <Text>No employees yet.</Text>
                <Button component={Link} to="/employees/new" leftSection={<PlusIcon size={16} />}>
                  Add employee
                </Button>
              </Group>
            ) : (
              <Stack gap={10} component="ul" className={classes.shares}>
                {shareBars(byCountry).map((row) => (
                  <li key={row.country}>
                    <Group justify="space-between" wrap="nowrap" gap="sm">
                      <Anchor
                        size="sm"
                        renderRoot={(props) => (
                          <Link
                            {...props}
                            to="/employees"
                            search={{ page: 1, country: row.country }}
                          />
                        )}
                      >
                        {countryName(row.country)}
                      </Anchor>
                      <Text size="sm" fw={600}>
                        {shareText(row.sharePermille, row.usd)}
                      </Text>
                    </Group>
                    <ShareBar width={row.width} />
                  </li>
                ))}
              </Stack>
            )}
            <Anchor renderRoot={(props) => <Link {...props} to="/pay/payroll" />}>
              Payroll by country and department
            </Anchor>
            <Muted size="xs">{payrollFootnote(rates)}</Muted>
          </Stack>
        )}
      </QueryState>
    </Panel>
  );
}

function OutOfLineSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading">
      <Skeleton height={44} width="60%" />
      <Skeleton height={18} width="80%" />
      {Array.from({ length: 5 }, (_, row) => (
        <Skeleton key={row} height={40} />
      ))}
    </Stack>
  );
}

function PayrollSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading">
      <Skeleton height={44} width="70%" />
      <Skeleton height={18} width="40%" />
      {Array.from({ length: 7 }, (_, row) => (
        <Skeleton key={row} height={22} />
      ))}
    </Stack>
  );
}
