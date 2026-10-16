import { formatMoney, MAX_SEARCH_LENGTH, type EmployeeResponse } from '@acme/contract';
import {
  Anchor,
  Box,
  Button,
  Group,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { employeesQuery } from '../api/employees-query';
import { CountryStamp, PageHeader } from '../components/document';
import { FilterBar } from '../components/filter-bar';
import { ArrowRightIcon, PlusIcon, SearchIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import rowStyles from '../components/rows.module.css';
import { employeeCount } from '../format/counts';
import { countryName } from '../format/country-name';
import { listRange, pageCount } from '../format/list-range';
import { lastEmployeesSearch } from '../routes/last-employees-search';
import { changeEmployeesSearch, type EmployeesSearchChange } from '../routes/search';
import { SEARCH_DEBOUNCE_MS } from '../search/debounce';

/** The employee list (ADR 0004, *Employee list*). All its state lives in the URL. */
export function EmployeeList() {
  const search = useSearch({ from: '/employees' });
  const navigate = useNavigate({ from: '/employees' });
  const query = useQuery({ ...employeesQuery(search), placeholderData: keepPreviousData });
  // A delete from the employee view comes back to this page of the list.
  useEffect(() => lastEmployeesSearch.set(search), [search]);

  // What is typed while its search waits to reach the URL; null once it has, or was cancelled.
  const [typed, setTyped] = useState<string | null>(null);
  // A search replaces the history entry, so Back skips each debounced step (ADR 0004, *Routing*).
  // Debounced here and in the global search, with one shared delay (ADR 0004, *Data fetching*).
  const sendSearch = useDebouncedCallback((q: string) => {
    setTyped(null);
    void navigate({ search: (prev) => changeEmployeesSearch(prev, { q }), replace: true });
  }, SEARCH_DEBOUNCE_MS);
  // A filter pushes a history entry.
  const filter = (change: EmployeesSearchChange) =>
    void navigate({ search: (prev) => changeEmployeesSearch(prev, change) });
  const clearFilters = () => {
    // A search still waiting would put what was typed back after the clear.
    sendSearch.cancel();
    setTyped(null);
    void navigate({ search: { page: 1 } });
  };
  const filtered = Boolean(
    search.q?.trim() || search.country || search.department || search.jobTitle,
  );
  const { jobTitle, country } = search;

  return (
    <Stack gap="lg">
      <PageHeader
        title="Employees"
        meta={query.data && !filtered ? employeeCount(query.data.total) : undefined}
        actions={
          <Button
            hiddenFrom="sm"
            component={Link}
            to="/employees/new"
            leftSection={<PlusIcon size={16} />}
          >
            Add employee
          </Button>
        }
      />
      <FilterBar
        filters={search}
        onChange={filter}
        leading={
          <TextInput
            label="Search"
            placeholder="Search by name"
            leftSection={<SearchIcon size={16} />}
            value={typed ?? search.q ?? ''}
            maxLength={MAX_SEARCH_LENGTH}
            onChange={(event) => {
              setTyped(event.currentTarget.value);
              sendSearch(event.currentTarget.value);
            }}
            w={{ base: '100%', sm: 260 }}
          />
        }
        trailing={
          filtered && (
            <Button variant="subtle" onClick={clearFilters}>
              Clear filters
            </Button>
          )
        }
      />
      {jobTitle && country && (
        <Anchor
          renderRoot={(props) => (
            <Link {...props} to="/pay/statistics" search={{ jobTitle, country }} />
          )}
        >
          <Group gap={6} component="span">
            Pay statistics for {jobTitle} in {countryName(country)}
            <ArrowRightIcon size={16} />
          </Group>
        </Anchor>
      )}
      <QueryState query={query} skeleton={<ListSkeleton />}>
        {(list) => {
          if (list.total === 0) {
            return filtered ? (
              <EmptyState text="No employees match these filters.">
                <Button variant="light" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyState>
            ) : (
              <EmptyState text="No employees yet.">
                <Button component={Link} to="/employees/new">
                  Add employee
                </Button>
              </EmptyState>
            );
          }
          return (
            <Stack gap="sm">
              {list.items.length > 0 ? (
                <>
                  <Box visibleFrom="sm">
                    <EmployeeTable employees={list.items} />
                  </Box>
                  <Box hiddenFrom="sm">
                    <EmployeeRows employees={list.items} />
                  </Box>
                </>
              ) : (
                <EmptyState text={`Page ${list.page} is past the end of the list.`}>
                  <Button
                    variant="light"
                    onClick={() => void navigate({ search: (prev) => ({ ...prev, page: 1 }) })}
                  >
                    Go to the first page
                  </Button>
                </EmptyState>
              )}
              <Group justify="space-between" gap="sm">
                <Text size="sm" c="gray.6">
                  {list.items.length > 0 && listRange(list)}
                </Text>
                {/* The URL's page, so it moves on click while keepPreviousData shows the old one. */}
                <Pagination
                  total={pageCount(list)}
                  value={search.page}
                  siblings={1}
                  boundaries={1}
                  onChange={(page) => void navigate({ search: (prev) => ({ ...prev, page }) })}
                />
              </Group>
            </Stack>
          );
        }}
      </QueryState>
    </Stack>
  );
}

function EmployeeTable({ employees }: { employees: EmployeeResponse[] }) {
  const navigate = useNavigate();
  return (
    <div className={rowStyles.tableWrap}>
      <Table className={rowStyles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Job title</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th className={rowStyles.money}>Salary</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => {
            const view = { to: '/employees/$id', params: { id: String(employee.id) } } as const;
            return (
              // The whole row opens the employee; the name is the link for keyboard and screen readers.
              <Table.Tr key={employee.id} data-link onClick={() => void navigate(view)}>
                <Table.Td>
                  <Anchor
                    fw={600}
                    renderRoot={(props) => <Link {...props} {...view} />}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {employee.name}
                  </Anchor>
                </Table.Td>
                <Table.Td>{employee.jobTitle}</Table.Td>
                <Table.Td>{employee.department}</Table.Td>
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  {countryName(employee.country)} <CountryStamp country={employee.country} />
                </Table.Td>
                <Table.Td className={rowStyles.money}>
                  {formatMoney(employee.annualSalary, 'en')}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}

/** On a phone each employee is one stacked row: name and salary, then job title · country (ADR 0004). */
function EmployeeRows({ employees }: { employees: EmployeeResponse[] }) {
  return (
    <ul className={rowStyles.stacked}>
      {employees.map((employee) => (
        <li key={employee.id}>
          <Link className={rowStyles.row} to="/employees/$id" params={{ id: String(employee.id) }}>
            <div className={rowStyles.rowTop}>
              <span className={rowStyles.rowName}>{employee.name}</span>
              <span className={rowStyles.money}>{formatMoney(employee.annualSalary, 'en')}</span>
            </div>
            <div className={rowStyles.rowMeta}>
              {employee.jobTitle} · {countryName(employee.country)}{' '}
              <CountryStamp country={employee.country} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ text, children }: { text: string; children: ReactNode }) {
  return (
    <Stack align="center" gap="sm" py="xl" className={rowStyles.tableWrap}>
      <Text fw={600}>{text}</Text>
      {children}
    </Stack>
  );
}

function ListSkeleton() {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 10 }, (_, row) => (
        <Skeleton key={row} height={36} />
      ))}
      <Group justify="space-between">
        <Skeleton height={16} width={140} />
        <Skeleton height={28} width={240} />
      </Group>
    </Stack>
  );
}
