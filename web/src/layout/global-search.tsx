import { type EmployeeListResponse } from '@acme/contract';
import { Group, Loader, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { apiFetch } from '../api/api-fetch';
import { outliersQuery, underpaidSearch } from '../api/outliers-query';
import { queryKey } from '../api/query-key';
import { CountryStamp } from '../components/document';
import { GlobeIcon, PersonIcon, PlusIcon, SearchIcon, TagIcon } from '../components/icons';
import { countText } from '../format/counts';
import { countryName } from '../format/country-name';
import { SEARCH_DEBOUNCE_MS } from '../search/debounce';
import {
  EMPLOYEE_RESULTS,
  employeeSearchPath,
  isEmployeeQuery,
  matchingCountries,
  matchingJobTitles,
  matches,
} from '../search/global-search';
import classes from './shell.module.css';

/** Opens the global search from anywhere: the header, the Overview, or a shortcut. */
export const openGlobalSearch = () => spotlight.open();

/**
 * The global search (ADR 0004, *Global search*, as amended by #40): employees by name through the
 * list's own endpoint, job titles and countries from the contract, and the frequent actions.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  // Debounced here and in the list's search box, with one shared delay (ADR 0004, *Data fetching*).
  const [debounced] = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const searching = isEmployeeQuery(debounced);
  const employees = useQuery({
    queryKey: queryKey('employees', { q: debounced, page: 1, pageSize: EMPLOYEE_RESULTS }),
    queryFn: () => apiFetch<EmployeeListResponse>(employeeSearchPath(debounced)),
    enabled: searching,
  });
  // The nav's and the Overview's cached query, so the count costs no request of its own.
  const underpaid = useQuery(outliersQuery(underpaidSearch));
  const titles = matchingJobTitles(query);
  const places = matchingCountries(query);
  const typed = query.trim();

  /** Closes the overlay, clears it for next time, then goes where the picked result leads. */
  const go = (navigation: () => Promise<void>) => {
    spotlight.close();
    setQuery('');
    void navigation();
  };

  const actions = [
    {
      id: 'add',
      label: 'Add employee',
      icon: <PlusIcon />,
      go: () => navigate({ to: '/employees/new' }),
    },
    {
      id: 'underpaid',
      label: underpaid.data
        ? `Underpaid employees (${countText(underpaid.data.total)})`
        : 'Underpaid employees',
      icon: <TagIcon />,
      go: () => navigate({ to: '/pay/outliers' }),
    },
    {
      id: 'overpaid',
      label: 'Overpaid employees',
      icon: <TagIcon />,
      go: () => navigate({ to: '/pay/outliers', search: { direction: 'above' } }),
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: <TagIcon />,
      go: () => navigate({ to: '/pay/payroll' }),
    },
  ];
  const shownActions = typed ? actions.filter((action) => matches(action.label, typed)) : actions;

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      shortcut={['mod + K', '/']}
      scrollable
      maxHeight={480}
      radius="md"
      shadow="xl"
      classNames={{ content: classes.searchContent, actionsGroup: classes.searchGroup }}
    >
      <Spotlight.Search
        placeholder="Search employees, job titles, countries…"
        aria-label="Search employees, job titles and countries"
        leftSection={<SearchIcon />}
        rightSection={searching && employees.isFetching ? <Loader size="xs" /> : null}
      />
      <Spotlight.ActionsList>
        {searching && (
          <Spotlight.ActionsGroup label="Employees">
            {employees.data?.items.map((employee) => (
              <Spotlight.Action
                key={employee.id}
                leftSection={<PersonIcon />}
                onClick={() =>
                  go(() => navigate({ to: '/employees/$id', params: { id: String(employee.id) } }))
                }
              >
                <Group justify="space-between" wrap="nowrap" w="100%" gap="sm">
                  <div>
                    <Text size="sm" fw={600}>
                      {employee.name}
                    </Text>
                    <Text size="xs" c="gray.6">
                      {employee.jobTitle} · {countryName(employee.country)}
                    </Text>
                  </div>
                  <CountryStamp country={employee.country} />
                </Group>
              </Spotlight.Action>
            ))}
            {employees.data && employees.data.total === 0 && (
              <Text size="sm" c="gray.6" px="md" py="xs">
                No employee’s name matches “{debounced}”.
              </Text>
            )}
            {employees.data && employees.data.total > 0 && (
              <Spotlight.Action
                onClick={() =>
                  go(() => navigate({ to: '/employees', search: { page: 1, q: debounced } }))
                }
              >
                <Text size="sm" c="visa.7" fw={600}>
                  See all {countText(employees.data.total)} employees matching “{debounced}”
                </Text>
              </Spotlight.Action>
            )}
          </Spotlight.ActionsGroup>
        )}
        {titles.length > 0 && (
          <Spotlight.ActionsGroup label="Job titles">
            {titles.map((jobTitle) => (
              <Spotlight.Action
                key={jobTitle}
                leftSection={<TagIcon />}
                label={jobTitle}
                description="Pay statistics"
                onClick={() => go(() => navigate({ to: '/pay/statistics', search: { jobTitle } }))}
              />
            ))}
          </Spotlight.ActionsGroup>
        )}
        {places.length > 0 && (
          <Spotlight.ActionsGroup label="Countries">
            {places.map(({ code, name }) => (
              <Spotlight.Action
                key={code}
                leftSection={<GlobeIcon />}
                label={name}
                description="Employees in this country"
                onClick={() =>
                  go(() => navigate({ to: '/employees', search: { page: 1, country: code } }))
                }
              />
            ))}
          </Spotlight.ActionsGroup>
        )}
        {shownActions.length > 0 && (
          <Spotlight.ActionsGroup label="Go to">
            {shownActions.map((action) => (
              <Spotlight.Action
                key={action.id}
                leftSection={action.icon}
                label={action.label}
                onClick={() => go(action.go)}
              />
            ))}
          </Spotlight.ActionsGroup>
        )}
        {typed.length === 1 && (
          <Spotlight.Empty>Type one more letter to search employees by name.</Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
}
