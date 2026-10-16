import {
  countries,
  formatMoney,
  type EmployeeListResponse,
  type EmployeeResponse,
} from '@acme/contract';
import {
  Alert,
  Anchor,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { apiFetch } from '../api/api-fetch';
import { employeePath, employeesPath } from '../api/employees-path';
import { errorText } from '../api/error-text';
import { queryKey } from '../api/query-key';
import { useEmployee } from '../api/use-employee';
import { EmployeeNotFound } from '../components/employee-not-found';
import { QueryState } from '../components/query-state';
import { lastEmployeesSearch } from '../routes/last-employees-search';
import { employeesSearchAfterDelete } from '../routes/search';

const countryNames = new Map<string, string>(
  countries.map((country) => [country.code, country.name]),
);

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
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Title order={2}>{employee.name}</Title>
        <Group gap="sm">
          <Button
            variant="default"
            renderRoot={(props) => <Link {...props} to="/employees/$id/edit" params={{ id }} />}
          >
            Edit
          </Button>
          <Button color="red" variant="light" onClick={confirm.open}>
            Delete
          </Button>
        </Group>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <Field label="Job title" value={employee.jobTitle} />
        <Field label="Department" value={employee.department} />
        <Field label="Country" value={countryNames.get(employee.country) ?? employee.country} />
        <Field
          label="Annual salary"
          value={`${formatMoney(employee.annualSalary, 'en')} ${employee.annualSalary.currency}`}
        />
      </SimpleGrid>
      <Anchor
        renderRoot={(props) => (
          <Link
            {...props}
            to="/pay/statistics"
            search={{ jobTitle: employee.jobTitle, country: employee.country }}
          />
        )}
      >
        Compare with peers
      </Anchor>
      <DeleteEmployee employee={employee} opened={confirming} onClose={confirm.close} />
    </Stack>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text fw={500}>{value}</Text>
    </Paper>
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
      const page = await queryClient
        .fetchQuery({
          queryKey: queryKey('employees', search),
          queryFn: () => apiFetch<EmployeeListResponse>(employeesPath(search)),
        })
        .catch(() => null);
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
          <Alert color="red" title="Could not delete">
            {errorText(remove.error)}
          </Alert>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={remove.isPending}>
            Cancel
          </Button>
          <Button color="red" loading={remove.isPending} onClick={() => remove.mutate()}>
            Delete {employee.name}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function ViewSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading">
      <Skeleton height={32} width="40%" />
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        {Array.from({ length: 4 }, (_, field) => (
          <Skeleton key={field} height={64} />
        ))}
      </SimpleGrid>
      <Skeleton height={16} width={160} />
    </Stack>
  );
}
