import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <Stack gap="xs">
      <Title order={2}>Page not found</Title>
      <Text>There is no page at this address.</Text>
      <Anchor component={Link} to="/pay/payroll">
        Go to the annual payroll
      </Anchor>
    </Stack>
  );
}
