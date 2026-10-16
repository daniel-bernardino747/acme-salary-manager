import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  type RouterHistory,
} from '@tanstack/react-router';
import { AppLayout } from './layout/app-layout';
import {
  comparisonSearchSchema,
  employeesSearchSchema,
  outliersSearchSchema,
  parseSearch,
  statisticsSearchSchema,
  stringifySearch,
} from './routes/search';
import { NotFound } from './screens/not-found';
import { Placeholder } from './screens/placeholder';

// Every route in ADR 0004, *Routing*. Screens are placeholders until their tickets land.

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFound,
});

/** The app opens on the grand total, the first number the HR Manager asks for (ADR 0001). */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/pay/payroll', replace: true });
  },
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  validateSearch: employeesSearchSchema,
  component: () => <Placeholder title="Employees" />,
});

const newEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/new',
  component: () => <Placeholder title="Add employee" />,
});

const employeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id',
  component: () => <Placeholder title="Employee" />,
});

const editEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  component: () => <Placeholder title="Edit employee" />,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/statistics',
  validateSearch: statisticsSearchSchema,
  component: () => <Placeholder title="Pay statistics" />,
});

const payrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/payroll',
  component: () => <Placeholder title="Annual payroll" />,
});

const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/comparison',
  validateSearch: comparisonSearchSchema,
  component: () => <Placeholder title="Pay across countries" />,
});

const outliersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/outliers',
  validateSearch: outliersSearchSchema,
  component: () => <Placeholder title="Paid out of line" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  newEmployeeRoute,
  employeeRoute,
  editEmployeeRoute,
  statisticsRoute,
  payrollRoute,
  comparisonRoute,
  outliersRoute,
]);

/**
 * The app's router. `main.tsx` creates it with the browser's history; tests pass a memory history.
 * The app is a client-only SPA, so it never takes the server path, which Node would otherwise pick.
 */
export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history, parseSearch, stringifySearch, isServer: false });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
