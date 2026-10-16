import { Anchor, Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { PageHeader } from './document';

/** An unknown or removed employee, e.g. from a stale link (ADR 0004, *Employee view*). */
export function EmployeeNotFound() {
  return (
    <Stack gap="lg">
      <PageHeader title="Employee not found" />
      <Text>There is no employee at this address. They may have been removed.</Text>
      <Anchor display="inline-block" renderRoot={(props) => <Link {...props} to="/employees" />}>
        Back to the employee list
      </Anchor>
    </Stack>
  );
}
