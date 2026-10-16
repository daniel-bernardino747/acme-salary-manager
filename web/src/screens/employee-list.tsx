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
import { useState, type ReactNode } from 'react';
import { apiFetch } from '../api/api-fetch';
import { employeesPath } from '../api/employees-path';
import { queryKey } from '../api/query-key';
import { QueryState } from '../components/query-state';
import { listRange, pageCount } from '../format/list-range';
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

  // A search replaces the history entry, so Back skips each debounced step; a filter pushes one.
  const change = (searchChange: EmployeesSearchChange, replace = false) =>
    void navigate({ search: (prev) => changeEmployeesSearch(prev, searchChange), replace });
  const clearFilters = () => void navigate({ search: { page: 1 } });
  const filtered = Boolean(
    search.q?.trim() || search.country || search.department || search.jobTitle,
  );

  return (
    <Stack gap="md">
      <Title order={2}>Employees</Title>
      <Group align="flex-end" gap="sm">
        <SearchBox q={search.q ?? ''} onSearch={(q) => change({ q }, true)} />
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
                <EmptyState text={`There are no employees on page ${list.page}.`}>
                  <Button
                    variant="light"
                    onClick={() => void navigate({ search: { ...search, page: 1 } })}
                  >
                    Go to the first page
                  </Button>
                </EmptyState>
              )}
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {list.items.length > 0 ? listRange(list) : `${list.total} employees`}
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

/**
 * The search box keeps what is typed and sends it to the URL once typing pauses: the one place the
 * search is debounced (ADR 0004, *Data fetching*). A search changed elsewhere, by Back or
 * "Clear filters", replaces what is typed.
 */
function SearchBox({ q, onSearch }: { q: string; onSearch: (q: string) => void }) {
  const [text, setText] = useState(q);
  // The URL's search as this box last sent or saw it, to tell an outside change from its own.
  const [known, setKnown] = useState(q);
  const send = useDebouncedCallback((value: string) => {
    // A blank search leaves the URL, so the URL will read it back as empty.
    setKnown(value.trim() ? value : '');
    onSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  if (q !== known) {
    send.cancel();
    setKnown(q);
    setText(q);
  }

  return (
    <TextInput
      label="Search"
      placeholder="Search by name"
      value={text}
      maxLength={MAX_SEARCH_LENGTH}
      onChange={(event) => {
        setText(event.currentTarget.value);
        send(event.currentTarget.value);
      }}
      w={240}
    />
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
