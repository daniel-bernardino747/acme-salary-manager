import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

/** An unknown or removed employee, e.g. from a stale link (ADR 0004, *Employee view*). */
export function EmployeeNotFound() {
  return (
    <Stack gap="xs">
      <Title order={2}>Employee not found</Title>
      <Text>There is no employee at this address. They may have been removed.</Text>
      <Anchor renderRoot={(props) => <Link {...props} to="/employees" />}>
        Back to the employee list
      </Anchor>
    </Stack>
  );
}
