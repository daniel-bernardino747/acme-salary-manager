import { Stack, Text, Title } from '@mantine/core';

/** Stands in for a screen that a later ticket builds. */
export function Placeholder({ title }: { title: string }) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      <Text c="dimmed">This screen is not built yet.</Text>
    </Stack>
  );
}
