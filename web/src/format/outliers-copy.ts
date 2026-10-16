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
