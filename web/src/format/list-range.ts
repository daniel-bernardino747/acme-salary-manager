/** Counts in the app's one locale (ADR 0004, *Copy and locale*), never the machine's default. */
const counts = new Intl.NumberFormat('en');

export interface ListPage {
  page: number;
  pageSize: number;
  total: number;
}

/** Where a page sits in the list, e.g. "26–50 of 9,812" (ADR 0004, *Employee list*). */
export function listRange({ page, pageSize, total }: ListPage): string {
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return `${counts.format(first)}–${counts.format(last)} of ${counts.format(total)}`;
}
