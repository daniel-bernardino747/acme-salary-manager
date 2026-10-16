import { AppShell, Burger, Group, NavLink, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';

/** Each pay question is labelled as the question it answers (ADR 0004, *Routing*). */
const payQuestions = [
  { to: '/pay/statistics', label: 'What do we pay for a job title in a country?' },
  { to: '/pay/payroll', label: 'What is our payroll total, by country and department?' },
  { to: '/pay/comparison', label: 'How does pay for a job title compare across countries?' },
  { to: '/pay/outliers', label: 'Who is paid out of line with their peers?' },
] as const;

export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // On narrow screens the sidebar is a drawer, closed again by every navigation.
  const [navOpen, nav] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !navOpen } }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%">
          <Burger
            opened={navOpen}
            onClick={nav.toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
          <Title order={1} size="h4">
            ACME Salary Manager
          </Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs" component="nav" aria-label="Main" onClick={nav.close}>
        <NavLink
          component={Link}
          to="/employees"
          label="Employees"
          active={pathname.startsWith('/employees')}
        />
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mt="md" mb={4}>
          Pay questions
        </Text>
        {payQuestions.map((question) => (
          <NavLink
            key={question.to}
            component={Link}
            to={question.to}
            label={question.label}
            active={pathname === question.to}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
