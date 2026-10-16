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
import { AddEmployee, EditEmployee } from './screens/employee-form-pages';
import { EmployeeList } from './screens/employee-list';
import { EmployeeView } from './screens/employee-view';
import { NotFound } from './screens/not-found';
import { Outliers } from './screens/outliers';
import { PayComparison } from './screens/pay-comparison';
import { PayStatistics } from './screens/pay-statistics';
import { PayrollTotals } from './screens/payroll-totals';

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
  component: EmployeeList,
});

const newEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/new',
  component: AddEmployee,
});

const employeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id',
  component: EmployeeView,
});

const editEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  component: EditEmployee,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/statistics',
  validateSearch: statisticsSearchSchema,
  component: PayStatistics,
});

const payrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/payroll',
  component: PayrollTotals,
});

const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/comparison',
  validateSearch: comparisonSearchSchema,
  component: PayComparison,
});

const outliersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/outliers',
  validateSearch: outliersSearchSchema,
  component: Outliers,
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
