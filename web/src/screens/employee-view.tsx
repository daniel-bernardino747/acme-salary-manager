import { formatMoney, type EmployeeResponse } from '@acme/contract';
import { Alert, Anchor, Box, Button, Group, Modal, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { employeePath } from '../api/employees-path';
import { employeesQuery } from '../api/employees-query';
import { errorText } from '../api/error-text';
import { payStatisticsQuery } from '../api/pay-statistics-query';
import { queryKey } from '../api/query-key';
import { useEmployee } from '../api/use-employee';
import { CountryStamp, Figure, Muted, PageHeader, Panel, RangeBar } from '../components/document';
import { EmployeeNotFound } from '../components/employee-not-found';
import { ChevronLeftIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import { countryName } from '../format/country-name';
import {
  emptyGroupText,
  seeEmployeesText,
  peerGroupName,
  smallGroupNotice,
} from '../format/pay-statistics-copy';
import { lastEmployeesSearch } from '../routes/last-employees-search';
import { employeesSearchAfterDelete, type EmployeesSearch } from '../routes/search';
import classes from './employee-view.module.css';

/**
 * One employee: their name, job title, department, country and salary, with Edit, Delete and
 * "Compare with peers" (ADR 0004, *Employee view*).
 */
export function EmployeeView() {
  const { id: idParam } = useParams({ from: '/employees/$id' });
  const { query, notFound } = useEmployee(idParam);
  if (notFound) {
    return <EmployeeNotFound />;
  }
  return (
    <QueryState query={query} skeleton={<ViewSkeleton />}>
      {(employee) => <Employee employee={employee} />}
    </QueryState>
  );
}

function Employee({ employee }: { employee: EmployeeResponse }) {
  const [confirming, confirm] = useDisclosure(false);
  const id = String(employee.id);
  const { jobTitle, department, country } = employee;
  return (
    <Stack gap="lg">
      <PageHeader
        back={
          <Anchor
            size="sm"
            mb="xs"
            className={classes.back}
            renderRoot={(props) => (
              <Link {...props} to="/employees" search={lastEmployeesSearch.get()} />
            )}
          >
            <ChevronLeftIcon size={16} />
            Employees
          </Anchor>
        }
        title={employee.name}
        meta={<CountryStamp country={country} size="lg" />}
        actions={
          <Button
            renderRoot={(props) => <Link {...props} to="/employees/$id/edit" params={{ id }} />}
          >
            Edit
          </Button>
        }
      />
      <Box className={classes.grid}>
        <Panel title="Annual salary">
          <Figure>{`${formatMoney(employee.annualSalary, 'en')} ${employee.annualSalary.currency}`}</Figure>
          <Muted>Annual gross base pay, in the currency of {countryName(country)}.</Muted>
          {/* The data page: small labels over values, each value opening the employees who share it. */}
          <dl className={classes.fields}>
            <div>
              <dt>Job title</dt>
              <dd>
                <MetaLink search={{ page: 1, jobTitle }}>{jobTitle}</MetaLink>
              </dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>
                <MetaLink search={{ page: 1, department }}>{department}</MetaLink>
              </dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>
                <MetaLink search={{ page: 1, country }}>{countryName(country)}</MetaLink>
              </dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>{employee.annualSalary.currency}</dd>
            </div>
          </dl>
        </Panel>
        <Peers employee={employee} />
      </Box>
      <Group justify="space-between" className={classes.danger} wrap="wrap" gap="sm">
        <Muted>Deleting removes {employee.name} for good. It cannot be undone.</Muted>
        <Button color="red.8" variant="subtle" onClick={confirm.open}>
          Delete
        </Button>
      </Group>
      <DeleteEmployee employee={employee} opened={confirming} onClose={confirm.close} />
    </Stack>
  );
}

function MetaLink({ search, children }: { search: EmployeesSearch; children: ReactNode }) {
  return (
    <Anchor inherit renderRoot={(props) => <Link {...props} to="/employees" search={search} />}>
      {children}
    </Anchor>
  );
}

/**
 * The employee's peer group from `GET /api/pay-statistics` (ADR 0004, *Employee view*, as amended
 * by #40): the median, the range with this salary marked, and the headcount. No compa-ratio: that
 * needs a field on the employee resource.
 */
function Peers({ employee }: { employee: EmployeeResponse }) {
  const { jobTitle, country } = employee;
  const search = { jobTitle, country };
  const query = useQuery(payStatisticsQuery(search));
  return (
    <Panel title="Peers">
      <Text size="sm" c="gray.7">
        {peerGroupName(search)} <CountryStamp country={country} />
      </Text>
      <QueryState query={query} skeleton={<Skeleton height={120} mt="sm" />}>
        {(statistics) => {
          const { min, median, average, max, headcount } = statistics;
          if (!min || !median || !average || !max) {
            return <Text mt="sm">{emptyGroupText(statistics)}</Text>;
          }
          return (
            <Stack gap="sm" mt="sm">
              <div>
                <Text size="sm" c="gray.6">
                  Peer median
                </Text>
                <Anchor
                  fw={700}
                  fz="xl"
                  renderRoot={(props) => <Link {...props} to="/pay/statistics" search={search} />}
                >
                  {formatMoney(median, 'en')}
                </Anchor>
              </div>
              {statistics.smallGroup ? (
                // A small group's notice replaces the range (ADR 0004, *Employee view*).
                <Alert color="cover" variant="light" title="Small group">
                  {smallGroupNotice(headcount)}
                </Alert>
              ) : (
                <>
                  <RangeBar
                    min={min.amountMinor}
                    max={max.amountMinor}
                    median={median.amountMinor}
                    average={average.amountMinor}
                    value={employee.annualSalary.amountMinor}
                    label={`${employee.name}'s salary on the range of their peer group, from minimum to maximum`}
                  />
                  <Group justify="space-between" gap="xs">
                    <Text size="sm">
                      <Text span c="gray.6">
                        Min{' '}
                      </Text>
                      {formatMoney(min, 'en')}
                    </Text>
                    <Text size="sm">
                      <Text span c="gray.6">
                        Max{' '}
                      </Text>
                      {formatMoney(max, 'en')}
                    </Text>
                  </Group>
                  <Muted size="xs">
                    The dot is this salary, the tick the median, and the diamond the average (
                    {formatMoney(average, 'en')}).
                  </Muted>
                </>
              )}
              <Anchor
                size="sm"
                renderRoot={(props) => (
                  <Link {...props} to="/employees" search={{ page: 1, jobTitle, country }} />
                )}
              >
                {seeEmployeesText(headcount)}
              </Anchor>
            </Stack>
          );
        }}
      </QueryState>
      {/* Always shown, whatever the peers request does (ADR 0004, *Employee view*). */}
      <Anchor
        size="sm"
        mt="md"
        display="inline-block"
        renderRoot={(props) => <Link {...props} to="/pay/statistics" search={search} />}
      >
        Compare with peers
      </Anchor>
    </Panel>
  );
}

interface DeleteEmployeeProps {
  employee: EmployeeResponse;
  opened: boolean;
  onClose: () => void;
}

/**
 * The confirmation naming the employee, then the delete flow (ADR 0004, *Data fetching*): the
 * detail query is removed, every query invalidated, and the list shown at the page it was on, one
 * page back if the delete emptied it.
 */
function DeleteEmployee({ employee, opened, onClose }: DeleteEmployeeProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const remove = useMutation({
    mutationFn: () => apiFetch<void>(employeePath(employee.id), { method: 'DELETE' }),
    onSuccess: async () => {
      // Removed before invalidating, so the view never refetches its own employee into a 404.
      queryClient.removeQueries({ queryKey: queryKey('employee', { id: employee.id }) });
      void queryClient.invalidateQueries();
      const search = lastEmployeesSearch.get();
      // The delete is done whatever happens here; if the page cannot be read, the list shows why.
      const page = await queryClient.fetchQuery(employeesQuery(search)).catch(() => null);
      onClose();
      void navigate({
        to: '/employees',
        search: page ? employeesSearchAfterDelete(search, page) : search,
      });
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title={`Delete ${employee.name}?`} centered>
      <Stack gap="md">
        <Text>
          {employee.name} will be removed for good. This cannot be undone, and their id is never
          given to anyone else.
        </Text>
        {remove.isError && (
          <Alert color="red.8" title="Could not delete">
            {errorText(remove.error)}
          </Alert>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={remove.isPending}>
            Cancel
          </Button>
          <Button color="red.8" loading={remove.isPending} onClick={() => remove.mutate()}>
            Delete {employee.name}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function ViewSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      <Skeleton height={14} width={90} />
      <Skeleton height={36} width="40%" />
      <Skeleton height={18} width="55%" />
      <Box className={classes.grid}>
        <Skeleton height={140} />
        <Skeleton height={220} />
      </Box>
    </Stack>
  );
}
