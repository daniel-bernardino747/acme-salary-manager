/** What the screens read from the API, one per GET endpoint (ADR 0003, *Endpoints*). */
export type Resource =
  'employees' | 'employee' | 'pay-statistics' | 'payroll-totals' | 'pay-comparison' | 'outliers';

/**
 * Every query key is `[resource, params]` (ADR 0004, *Data fetching*), e.g.
 * `queryKey('employees', { page, q, country })`. Mutations invalidate every query, so no key
 * is ever matched by hand.
 */
export function queryKey<P extends object = Record<string, never>>(
  resource: Resource,
  params: P = {} as P,
): readonly [Resource, P] {
  return [resource, params];
}
