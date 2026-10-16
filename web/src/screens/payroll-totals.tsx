import type { CountryCode, Money, PayrollTotalsResponse } from '@acme/contract';
import { Anchor, Box, Button, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, type LinkProps } from '@tanstack/react-router';
import { apiFetch } from '../api/api-fetch';
import { queryKey } from '../api/query-key';
import { CountryStamp, Figure, Muted, PageHeader, Panel, ShareBar } from '../components/document';
import { PlusIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import records from '../components/records.module.css';
import { countText, employeeCount } from '../format/counts';
import { countryName } from '../format/country-name';
import { shareBars } from '../format/overview';
import { outliersInCountryText, payrollFootnote, shareText } from '../format/payroll-copy';
import { wholeUnits } from '../format/whole-units';
import { pageQuestion } from '../layout/navigation';
import classes from './payroll-totals.module.css';

/** Question 2: payroll per country and per department (ADR 0004, *Question 2*). */
export function PayrollTotals() {
  const query = useQuery({
    queryKey: queryKey('payroll-totals'),
    queryFn: () => apiFetch<PayrollTotalsResponse>('/api/payroll-totals'),
  });

  return (
    <Stack gap="lg">
      <PageHeader title="Payroll" question={pageQuestion('/pay/payroll')} />
      <QueryState query={query} skeleton={<PayrollSkeleton />}>
        {(totals) => <Payroll totals={totals} />}
      </QueryState>
    </Stack>
  );
}

function Payroll({ totals }: { totals: PayrollTotalsResponse }) {
  const { grandTotal } = totals;
  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" c="gray.6">
          Annual payroll
        </Text>
        <Group gap="md" align="baseline" wrap="wrap">
          <Figure>{wholeUnits(grandTotal.usd)}</Figure>
          <Text fz="lg">{employeeCount(grandTotal.headcount)}</Text>
        </Group>
      </div>
      {grandTotal.headcount === 0 && (
        <Group gap="sm">
          <Text>No employees yet. Add one to start the payroll.</Text>
          <Button component={Link} to="/employees/new" leftSection={<PlusIcon size={16} />}>
            Add employee
          </Button>
        </Group>
      )}
      <Panel title="By country">
        <Totals
          name="Country"
          withLocal
          rows={shareBars(totals.byCountry).map((row) => ({
            key: row.country,
            name: countryName(row.country),
            list: { to: '/employees', search: { page: 1, country: row.country } },
            ...row,
          }))}
        />
      </Panel>
      <Panel title="By department">
        <Totals
          name="Department"
          rows={shareBars(totals.byDepartment).map((row) => ({
            key: row.department,
            name: row.department,
            list: { to: '/employees', search: { page: 1, department: row.department } },
            ...row,
          }))}
        />
      </Panel>
      <Muted size="xs">{payrollFootnote(totals.rates)}</Muted>
    </Stack>
  );
}

interface TotalsRow {
  key: string;
  name: string;
  /** Set on a country row: its stamp and its outliers link. */
  country?: CountryCode;
  /** The employee list filtered to this row (ADR 0004, *Question 2*). */
  list: LinkProps;
  headcount: number;
  local?: Money;
  usd: Money;
  sharePermille: number | null;
  /** The share bar's width, geometry from `sharePermille`. */
  width: number;
}

function Totals(props: { name: string; rows: TotalsRow[]; withLocal?: boolean }) {
  return (
    <>
      <Box visibleFrom="sm">
        <TotalsTable {...props} />
      </Box>
      <Box hiddenFrom="sm">
        <TotalsRecords rows={props.rows} />
      </Box>
    </>
  );
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
    <Table className={records.table} horizontalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{name}</Table.Th>
          <Table.Th className={records.money}>Headcount</Table.Th>
          {withLocal && <Table.Th className={records.money}>Local total</Table.Th>}
          <Table.Th className={records.money}>USD total</Table.Th>
          <Table.Th className={classes.shareHead}>Share</Table.Th>
          {withLocal && (
            <Table.Th>
              <span className={classes.visuallyHidden}>Outliers</span>
            </Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          // The whole row opens the list; the name is the link for keyboard and screen readers.
          <Table.Tr key={row.key} data-link onClick={() => void navigate(row.list)}>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <Anchor
                fw={600}
                renderRoot={(props) => <Link {...props} {...row.list} />}
                onClick={(event) => event.stopPropagation()}
              >
                {row.name}
              </Anchor>
              {row.country && (
                <>
                  {' '}
                  <CountryStamp country={row.country} />
                </>
              )}
            </Table.Td>
            <Table.Td className={records.money}>{countText(row.headcount)}</Table.Td>
            {withLocal && (
              <Table.Td className={records.money}>{row.local && wholeUnits(row.local)}</Table.Td>
            )}
            <Table.Td className={records.money} fw={600}>
              {wholeUnits(row.usd)}
            </Table.Td>
            <Table.Td className={classes.shareCell}>
              <ShareBar width={row.width} />
              <span>{shareText(row.sharePermille, row.usd)}</span>
            </Table.Td>
            {withLocal && row.country && (
              <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                <Anchor
                  size="sm"
                  renderRoot={(props) => (
                    <Link {...props} to="/pay/outliers" search={{ country: row.country }} />
                  )}
                  onClick={(event) => event.stopPropagation()}
                >
                  {outliersInCountryText(row.country)}
                </Anchor>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/** On a phone each row stacks: name and share, the USD total, then the local total and headcount. */
function TotalsRecords({ rows }: { rows: TotalsRow[] }) {
  return (
    <ul className={classes.records}>
      {rows.map((row) => (
        <li key={row.key}>
          <Link className={records.record} {...row.list}>
            <div className={records.recordTop}>
              <span className={records.recordName}>
                {row.name} {row.country && <CountryStamp country={row.country} />}
              </span>
              <span>{shareText(row.sharePermille, row.usd)}</span>
            </div>
            <ShareBar width={row.width} />
            <div className={records.recordFigures}>
              <Text fw={700}>{wholeUnits(row.usd)}</Text>
              <Text size="sm" c="gray.6">
                {row.local && row.local.currency !== 'USD' && `${wholeUnits(row.local)} · `}
                {employeeCount(row.headcount)}
              </Text>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PayrollSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      <Skeleton height={48} width="45%" />
      {[7, 9].map((rows) => (
        <Stack key={rows} gap="xs">
          <Skeleton height={24} width={160} />
          {Array.from({ length: rows }, (_, row) => (
            <Skeleton key={row} height={36} />
          ))}
        </Stack>
      ))}
      <Skeleton height={14} width="80%" />
    </Stack>
  );
}
