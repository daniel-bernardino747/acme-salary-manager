import { AppShell, Title } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';

export function AppLayout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header px="md" style={{ display: 'flex', alignItems: 'center' }}>
        <Title order={1} size="h4">
          ACME Salary Manager
        </Title>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
