/** Counts in the app's one locale (ADR 0004, *Copy and locale*), never the machine's default. */
const counts = new Intl.NumberFormat('en');

/** "1 employee", "3 employees": counts are pluralized, job titles never are. */
export function employeeCount(headcount: number): string {
  return headcount === 1 ? '1 employee' : `${counts.format(headcount)} employees`;
}
