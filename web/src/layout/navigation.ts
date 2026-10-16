/** A destination in the sidebar. */
export type NavPath =
  '/' | '/employees' | '/pay/statistics' | '/pay/outliers' | '/pay/payroll' | '/pay/comparison';

export interface NavItem {
  to: NavPath;
  label: string;
  group: 'main' | 'pay';
}

/**
 * The sidebar, in the order of the research ranking (`docs/ux/hr-manager-research.md`): short
 * labels in the HR Manager's words (ADR 0004, *Routing*, as amended by #40).
 */
export const navItems: readonly NavItem[] = [
  { to: '/', label: 'Overview', group: 'main' },
  { to: '/employees', label: 'Employees', group: 'main' },
  { to: '/pay/statistics', label: 'Pay by role', group: 'pay' },
  { to: '/pay/outliers', label: 'Outliers', group: 'pay' },
  { to: '/pay/payroll', label: 'Payroll', group: 'pay' },
  { to: '/pay/comparison', label: 'Across countries', group: 'pay' },
];

/** The question each pay page answers, shown as its subtitle (requirements, *Answer pay questions*). */
const questions: Partial<Record<NavPath, string>> = {
  '/pay/statistics': 'What do we pay for a job title in a country?',
  '/pay/outliers': 'Who is paid out of line with their peers?',
  '/pay/payroll': 'What is our payroll total, by country and department?',
  '/pay/comparison': 'How does pay for a job title compare across countries?',
};

export function pageQuestion(to: NavPath): string | undefined {
  return questions[to];
}

/**
 * The item a path belongs to: Overview only at `/`, Employees for everything under `/employees`,
 * and each pay page at its own path. An unknown path claims no item.
 */
export function activeNavItem(pathname: string): NavPath | null {
  if (pathname === '/employees' || pathname.startsWith('/employees/')) {
    return '/employees';
  }
  return navItems.find((item) => item.to === pathname)?.to ?? null;
}
