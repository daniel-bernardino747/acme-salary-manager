import { formatMoney, type Money } from '@acme/contract';

/**
 * Money in whole units of its currency, e.g. "$412,380,117", rounded half up in integers by
 * `formatMoney` (ADR 0003). For payroll totals and the cross-country comparison, never for a
 * figure that must match to the minor unit (ADR 0004).
 */
export function wholeUnits(money: Money): string {
  return formatMoney(money, 'en', { wholeUnits: true });
}
