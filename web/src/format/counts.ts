/** Counts in the app's one locale (ADR 0004, *Copy and locale*), never the machine's default. */
const counts = new Intl.NumberFormat('en');

/** A bare count, e.g. "10,000". */
export function countText(count: number): string {
  return counts.format(count);
}

/** "1 employee", "3 employees": counts are pluralized, job titles never are. */
export function employeeCount(headcount: number): string {
  return headcount === 1 ? '1 employee' : `${countText(headcount)} employees`;
}
