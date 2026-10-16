import { formatMoney, type Money, type PayrollTotalsResponse } from '@acme/contract';
import { Anchor, Button, Group, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, type LinkProps } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import { countText } from '../format/counts';
import { countryName } from '../format/country-name';
import {
  highestUsdFirst,
  payrollFootnote,
  payrollHeadline,
  shareText,
} from '../format/payroll-copy';

/** Payroll totals are shown in whole units, rounded in integers (ADR 0001, *USD totals*). */
const whole = (money: Money) => formatMoney(money, 'en', { wholeUnits: true });

/** Question 2, the landing screen: payroll per country and per department (ADR 0004, *Question 2*). */
export function PayrollTotals() {
  const query = useQuery({
    queryKey: queryKey('payroll-totals'),
    queryFn: () => apiFetch<PayrollTotalsResponse>('/api/payroll-totals'),
  });

  return (
    <QueryState query={query} skeleton={<PayrollSkeleton />}>
      {(totals) => <Payroll totals={totals} />}
    </QueryState>
  );
}

function Payroll({ totals }: { totals: PayrollTotalsResponse }) {
  return (
    <Stack gap="lg">
      <Title order={2}>{payrollHeadline(totals.grandTotal)}</Title>
      {totals.grandTotal.headcount === 0 && (
        <Group gap="sm">
          <Text>No employees yet. Add one to start the payroll.</Text>
          <Button component={Link} to="/employees/new">
            Add employee
          </Button>
        </Group>
      )}
      <Stack gap="xs">
        <Title order={3}>By country</Title>
        <TotalsTable
          name="Country"
          withLocal
          rows={highestUsdFirst(totals.byCountry).map((row) => ({
            key: row.country,
            name: countryName(row.country),
            list: { to: '/employees', search: { country: row.country } },
            ...row,
          }))}
        />
      </Stack>
      <Stack gap="xs">
        <Title order={3}>By department</Title>
        <TotalsTable
          name="Department"
          rows={highestUsdFirst(totals.byDepartment).map((row) => ({
            key: row.department,
            name: row.department,
            list: { to: '/employees', search: { department: row.department } },
            ...row,
          }))}
        />
      </Stack>
      <Text size="sm" c="dimmed">
        {payrollFootnote(totals.rates)}
      </Text>
    </Stack>
  );
}

interface TotalsRow {
  key: string;
  name: string;
  /** The employee list filtered to this row (ADR 0004, *Question 2*). */
  list: LinkProps;
  headcount: number;
  local?: Money;
  usd: Money;
  sharePermille: number | null;
}

function TotalsTable({
  name,
  rows,
  withLocal = false,
}: {
  name: string;
  rows: TotalsRow[];
  withLocal?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Table.ScrollContainer minWidth={withLocal ? 640 : 520}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{name}</Table.Th>
            <Table.Th ta="right">Headcount</Table.Th>
            {withLocal && <Table.Th ta="right">Local total</Table.Th>}
            <Table.Th ta="right">USD total</Table.Th>
            <Table.Th ta="right">Share</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            // The whole row opens the list; the name is the link for keyboard and screen readers.
            <Table.Tr
              key={row.key}
              onClick={() => void navigate(row.list)}
              style={{ cursor: 'pointer' }}
            >
              <Table.Td>
                <Anchor
                  renderRoot={(props) => <Link {...props} {...row.list} />}
                  onClick={(event) => event.stopPropagation()}
                >
                  {row.name}
                </Anchor>
              </Table.Td>
              <Table.Td ta="right">{countText(row.headcount)}</Table.Td>
              {withLocal && <MoneyCell>{row.local && whole(row.local)}</MoneyCell>}
              <MoneyCell>{whole(row.usd)}</MoneyCell>
              <Table.Td ta="right">{shareText(row.sharePermille, row.usd)}</Table.Td>
            </Table.Tr>
          ))}
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

function PayrollSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      <Skeleton height={32} width="55%" />
      {[7, 9].map((rows) => (
        <Stack key={rows} gap="xs">
          <Skeleton height={24} width={160} />
          {Array.from({ length: rows }, (_, row) => (
            <Skeleton key={row} height={28} />
          ))}
        </Stack>
      ))}
      <Skeleton height={14} width="80%" />
    </Stack>
  );
}
