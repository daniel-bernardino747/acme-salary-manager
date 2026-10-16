import {
  countries,
  departments,
  jobTitles,
  type EmployeeRequest,
  type EmployeeResponse,
} from '@acme/contract';
import { Alert, Anchor, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useCanGoBack, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { apiFetch, ApiProblem } from '../api/api-fetch';
import { employeePath } from '../api/employees-path';
import { errorText } from '../api/error-text';
import { useEmployee } from '../api/use-employee';
import { PageHeader, Panel } from '../components/document';
import { EmployeeNotFound } from '../components/employee-not-found';
import { ChevronLeftIcon } from '../components/icons';
import { QueryState } from '../components/query-state';
import {
  currencyOfPicked,
  emptyEmployeeForm,
  employeeFormSchema,
  employeeFormValues,
  salaryAfterCountryChange,
  salaryPreview,
  type EmployeeFormValues,
} from '../forms/employee-form';
import { employeeProblem } from '../forms/employee-problem';
import classes from './employee-form-pages.module.css';

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));

/** `/employees/new` (ADR 0004, *Forms: add and edit*). */
export function AddEmployee() {
  return (
    <Stack gap="lg">
      <PageHeader title="Add employee" back={<BackLink />} />
      <EmployeeForm
        initialValues={emptyEmployeeForm}
        submitLabel="Add employee"
        send={(body) => apiFetch<EmployeeResponse>('/api/employees', { method: 'POST', body })}
      />
    </Stack>
  );
}

/** `/employees/$id/edit`: every field, salary included, starting from the current values. */
export function EditEmployee() {
  const { id: idParam } = useParams({ from: '/employees/$id/edit' });
  const { query, notFound } = useEmployee(idParam);
  if (notFound) {
    return <EmployeeNotFound />;
  }
  return (
    <QueryState query={query}>
      {(employee) => (
        <Stack gap="lg">
          <PageHeader title={`Edit ${employee.name}`} back={<BackLink />} />
          <EmployeeForm
            key={employee.id}
            initialValues={employeeFormValues(employee)}
            submitLabel="Save changes"
            send={(body) =>
              apiFetch<EmployeeResponse>(employeePath(employee.id), { method: 'PUT', body })
            }
          />
        </Stack>
      )}
    </QueryState>
  );
}

interface EmployeeFormProps {
  initialValues: EmployeeFormValues;
  submitLabel: string;
  send: (body: EmployeeRequest) => Promise<EmployeeResponse>;
}

/**
 * The add and edit form (ADR 0004, *Forms: add and edit*). It validates against the contract's
 * schema objects on blur and on submit, and maps server problems onto its fields, keeping what was
 * typed.
 */
function EmployeeForm({ initialValues, submitLabel, send }: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EmployeeFormValues, EmployeeRequest>({
    mode: 'controlled',
    initialValues,
    validate: schemaResolver(employeeFormSchema, { sync: true }),
    validateInputOnBlur: true,
    transformValues: (values) => employeeFormSchema.parse(values),
  });
  const save = useMutation({
    mutationFn: send,
    onSuccess: (employee) => {
      // Every query is derived from the employees table, so every one may be stale (ADR 0004).
      void queryClient.invalidateQueries();
      notifications.show({ color: 'green', message: `Saved ${employee.name}` });
      void navigate({ to: '/employees/$id', params: { id: String(employee.id) } });
    },
    onError: (error) => {
      if (!(error instanceof ApiProblem)) {
        setFormError(errorText(error));
        return;
      }
      const { fieldErrors, formError } = employeeProblem(error.problem);
      form.setErrors(fieldErrors);
      setFormError(formError);
    },
  });

  const { country, annualSalary } = form.values;
  const currency = currencyOfPicked(country);
  const preview = salaryPreview(annualSalary, country);
  const changeCountry = (next: string | null) => {
    const after = salaryAfterCountryChange(country, next ?? '', annualSalary);
    form.setFieldValue('country', next ?? '');
    // A message from an earlier change names a currency that may no longer apply.
    form.clearFieldError('annualSalary');
    if (after.message) {
      form.setFieldValue('annualSalary', after.annualSalary);
      form.setFieldError('annualSalary', after.message);
    }
  };
  /** A select's props: the form holds '' until something is picked, Mantine wants null. */
  const select = (field: 'jobTitle' | 'department') => {
    const props = form.getInputProps(field);
    return {
      ...props,
      value: form.values[field] || null,
      onChange: (value: string | null) => form.setFieldValue(field, value ?? ''),
    };
  };
  const cancel = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      void navigate({ to: '/employees' });
    }
  };

  return (
    <form
      noValidate
      onSubmit={form.onSubmit((body) => {
        setFormError(null);
        save.mutate(body);
      })}
    >
      <Stack gap="lg" maw={640}>
        <Panel title="Person">
          <Stack gap="md">
            <TextInput
              label="Name"
              required
              maxLength={100}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <Select
              label="Job title"
              placeholder="Pick a job title"
              required
              searchable
              data={jobTitles}
              {...select('jobTitle')}
            />
            <Select
              label="Department"
              placeholder="Pick a department"
              required
              data={departments}
              {...select('department')}
            />
            <Select
              label="Country"
              placeholder="Pick a country"
              required
              data={countryOptions}
              {...form.getInputProps('country')}
              value={country || null}
              onChange={changeCountry}
            />
          </Stack>
        </Panel>
        <Panel title="Pay">
          <Stack gap="xs">
            <TextInput
              label="Annual salary"
              required
              inputMode="decimal"
              autoComplete="off"
              disabled={currency === null}
              placeholder={currency === null ? undefined : 'e.g. 1,250,000.50'}
              description={
                currency === null
                  ? 'Pick a country first.'
                  : 'Annual gross base pay, digits with optional commas and a decimal point.'
              }
              rightSection={currency && <span className={classes.currency}>{currency}</span>}
              rightSectionWidth={64}
              {...form.getInputProps('annualSalary')}
            />
            {preview && (
              <Text size="sm" fw={600} c="visa.7" aria-live="polite">
                {preview}
              </Text>
            )}
          </Stack>
        </Panel>
        {formError && (
          <Alert color="red" title="Could not save">
            {formError}
          </Alert>
        )}
        <Group gap="sm">
          <Button type="submit" size="md" loading={save.isPending}>
            {submitLabel}
          </Button>
          <Button variant="default" size="md" onClick={cancel} disabled={save.isPending}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

/** Back to wherever the form was opened from, as Cancel does. */
function BackLink() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <Anchor
      size="sm"
      mb="xs"
      className={classes.back}
      renderRoot={(props) =>
        canGoBack ? (
          <button {...props} type="button" onClick={() => router.history.back()} />
        ) : (
          <Link {...props} to="/employees" />
        )
      }
    >
      <ChevronLeftIcon size={16} />
      Back
    </Anchor>
  );
}
