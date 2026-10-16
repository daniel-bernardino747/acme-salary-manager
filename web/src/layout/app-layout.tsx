import { exchangeRates } from '@acme/contract';
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  Stack,
  Text,
  VisuallyHidden,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { outliersQuery, underpaidSearch } from '../api/outliers-query';
import { PlusIcon, SearchIcon } from '../components/icons';
import { GlobalSearch, openGlobalSearch } from './global-search';
import { activeNavItem, navItems, type NavItem } from './navigation';
import classes from './shell.module.css';

/**
 * The shell (ADR 0004, *Routing*, as amended by #40): a cover-ink rail with Overview, Employees and
 * the Pay group, and a header with global search and "Add employee" on every screen. On a phone
 * the rail is a drawer, closed again by every navigation.
 */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [navOpen, nav] = useDisclosure(false);
  const active = activeNavItem(pathname);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !navOpen } }}
      padding={0}
    >
      <AppShell.Header className={classes.header} px={{ base: 'md', sm: 'xl' }}>
        <Group h="100%" gap="md" wrap="nowrap">
          <Burger
            opened={navOpen}
            onClick={nav.toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
          <Box component={Link} to="/" className={classes.mobileBrand} hiddenFrom="sm">
            ACME Salary Manager
          </Box>
          <Box visibleFrom="sm" style={{ flex: 1 }}>
            <button type="button" className={classes.searchTrigger} onClick={openGlobalSearch}>
              <SearchIcon />
              Search employees, job titles, countries…
              <kbd className={classes.kbd}>Ctrl K</kbd>
            </button>
          </Box>
          <ActionIcon
            hiddenFrom="sm"
            ml="auto"
            variant="subtle"
            color="cover"
            size="lg"
            aria-label="Search"
            onClick={openGlobalSearch}
          >
            <SearchIcon size={20} />
          </ActionIcon>
          <Button
            visibleFrom="sm"
            component={Link}
            to="/employees/new"
            leftSection={<PlusIcon size={16} />}
          >
            Add employee
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar
        className={classes.navbar}
        p="md"
        component="nav"
        aria-label="Main"
        onClick={nav.close}
      >
        <Stack gap={2} h="100%">
          <Link to="/" className={classes.brand}>
            ACME Salary Manager
            <span className={classes.brandLine}>HR · 7 countries</span>
          </Link>
          <Box h={18} />
          {navItems
            .filter((item) => item.group === 'main')
            .map((item) => (
              <NavItemLink key={item.to} item={item} active={active === item.to} />
            ))}
          <div className={classes.group} aria-hidden="true">
            Pay
          </div>
          {navItems
            .filter((item) => item.group === 'pay')
            .map((item) => (
              <NavItemLink key={item.to} item={item} active={active === item.to} />
            ))}
          <Button
            hiddenFrom="sm"
            component={Link}
            to="/employees/new"
            mt="lg"
            variant="white"
            color="cover"
            leftSection={<PlusIcon size={16} />}
          >
            Add employee
          </Button>
          <Text className={classes.rates}>
            Rates as of {exchangeRates.asOf}, from ECB reference rates
          </Text>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main className={classes.main}>
        <div className={classes.page}>
          <Outlet />
        </div>
      </AppShell.Main>
      <GlobalSearch />
    </AppShell>
  );
}

function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={classes.link}
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
    >
      {item.label}
      {item.to === '/pay/outliers' && <UnderpaidCount />}
    </Link>
  );
}

/** The underpaid count beside Outliers, from the same cached query as the Overview. */
function UnderpaidCount() {
  const { data } = useQuery(outliersQuery(underpaidSearch));
  if (!data || data.total === 0) {
    return null;
  }
  return (
    <span className={classes.count}>
      {data.total.toLocaleString('en')}
      <VisuallyHidden> underpaid</VisuallyHidden>
    </span>
  );
}
