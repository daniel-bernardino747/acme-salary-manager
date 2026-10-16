import {
  countries,
  departments,
  formatMoney,
  jobTitles,
  MAX_SEARCH_LENGTH,
  type EmployeeListResponse,
  type EmployeeResponse,
} from '@acme/contract';
import {
  Anchor,
  Button,
  Group,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { employeesPath } from '../api/employees-path';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import { listRange, pageCount } from '../format/list-range';
import { lastEmployeesSearch } from '../routes/last-employees-search';
import { changeEmployeesSearch, type EmployeesSearchChange } from '../routes/search';

/** How long the search box waits after the last keystroke before searching (ADR 0004). */
const SEARCH_DEBOUNCE_MS = 300;

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));
const countryNames = new Map<string, string>(
  countries.map((country) => [country.code, country.name]),
);

/** The employee list (ADR 0004, *Employee list*). All its state lives in the URL. */
export function EmployeeList() {
  const search = useSearch({ from: '/employees' });
  const navigate = useNavigate({ from: '/employees' });
  const query = useQuery({
    queryKey: queryKey('employees', search),
    queryFn: () => apiFetch<EmployeeListResponse>(employeesPath(search)),
    placeholderData: keepPreviousData,
  });
  // A delete from the employee view comes back to this page of the list.
  useEffect(() => lastEmployeesSearch.set(search), [search]);

  // What is typed while its search waits to reach the URL; null once it has, or was cancelled.
  const [typed, setTyped] = useState<string | null>(null);
  // A search replaces the history entry, so Back skips each debounced step (ADR 0004, *Routing*).
  // Debounced here and nowhere else (ADR 0004, *Data fetching*).
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

  return (
    <Stack gap="md">
      <Title order={2}>Employees</Title>
      <Group align="flex-end" gap="sm">
        <TextInput
          label="Search"
          placeholder="Search by name"
          value={typed ?? search.q ?? ''}
          maxLength={MAX_SEARCH_LENGTH}
          onChange={(event) => {
            setTyped(event.currentTarget.value);
            sendSearch(event.currentTarget.value);
          }}
          w={240}
        />
        <Select
          label="Country"
          placeholder="Any country"
          data={countryOptions}
          value={search.country ?? null}
          onChange={(country) => filter({ country })}
          clearable
          w={180}
        />
        <Select
          label="Department"
          placeholder="Any department"
          data={departments}
          value={search.department ?? null}
          onChange={(department) => filter({ department })}
          clearable
          w={190}
        />
        <Select
          label="Job title"
          placeholder="Any job title"
          data={jobTitles}
          value={search.jobTitle ?? null}
          onChange={(jobTitle) => filter({ jobTitle })}
          clearable
          searchable
          w={260}
        />
        <Button component={Link} to="/employees/new" ml="auto">
          Add employee
        </Button>
      </Group>
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
                <EmployeeTable employees={list.items} />
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
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {list.items.length > 0 && listRange(list)}
                </Text>
                {/* The URL's page, so it moves on click while keepPreviousData shows the old one. */}
                <Pagination
                  total={pageCount(list)}
                  value={search.page}
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
    <Table.ScrollContainer minWidth={760}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Job title</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th ta="right">Salary</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => {
            const view = { to: '/employees/$id', params: { id: String(employee.id) } } as const;
            return (
              // The whole row opens the employee; the name is the link for keyboard and screen readers.
              <Table.Tr
                key={employee.id}
                onClick={() => void navigate(view)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Td>
                  <Anchor
                    renderRoot={(props) => <Link {...props} {...view} />}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {employee.name}
                  </Anchor>
                </Table.Td>
                <Table.Td>{employee.jobTitle}</Table.Td>
                <Table.Td>{employee.department}</Table.Td>
                <Table.Td>{countryNames.get(employee.country)}</Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {formatMoney(employee.annualSalary, 'en')}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function EmptyState({ text, children }: { text: string; children: ReactNode }) {
  return (
    <Stack align="center" gap="sm" py="xl">
      <Text>{text}</Text>
      {children}
    </Stack>
  );
}

function ListSkeleton() {
  return (
    <Stack gap="sm" aria-busy="true" aria-label="Loading">
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
