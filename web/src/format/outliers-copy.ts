import { formatMoney, type Money } from '@acme/contract';
import type { OutliersSearch } from '../routes/search';
import { employeeCount } from './counts';

type Direction = OutliersSearch['direction'];

const paid: Record<Direction, string> = {
  below: 'below 0.80',
  above: 'above 1.20',
  all: 'outside 0.80–1.20',
};

/** Question 4's headline, from the API's `total` (ADR 0004, *Question 4*). */
export function outliersHeadline(total: number, direction: Direction): string {
  return `${employeeCount(total)} paid ${paid[direction]} of their peer median`;
}

/**
 * The cost to reach 0.80 with Underpaid, in whole USD, rounded in integers by `formatMoney` (ADR
 * 0004, *Question 4*).
 */
export function costText(usd: Money): string {
  return `Bringing them to 0.80 would cost ${formatMoney(usd, 'en', { wholeUnits: true })} a year.`;
}

/**
 * How many matching employees sit in small groups and so weren't checked, so an empty result is
 * never ambiguous between "nobody is out of line" and "nobody could be checked" (ADR 0004).
 */
export function uncheckedText(smallGroupHeadcount: number): string {
  return smallGroupHeadcount === 1
    ? "1 employee in a small group wasn't checked."
    : `${employeeCount(smallGroupHeadcount)} in small groups weren't checked.`;
}

const nobody: Record<Direction, string> = {
  below: 'No underpaid employees',
  above: 'No overpaid employees',
  all: 'No employees paid out of line',
};

/** An empty result; the small-group count still shows next to it (ADR 0004, *Question 4*). */
export function noOutliersText(direction: Direction): string {
  return `${nobody[direction]} for these filters.`;
}
