import {
  countrySchema,
  currencyOf,
  employeeRequestSchema,
  formatMoney,
  parseMoney,
  type CountryCode,
  type EmployeeRequest,
} from '@acme/contract';
import { z } from 'zod';

/** What the add and edit forms hold: every field as typed or picked, the salary as text. */
export interface EmployeeFormValues {
  name: string;
  jobTitle: string;
  department: string;
  country: string;
  annualSalary: string;
}

const fields = employeeRequestSchema.shape;

/** A select's value: empty until picked, then checked by the contract's own reference list. */
const picked = <T extends z.ZodType<unknown, string>>(list: T) =>
  z.string().min(1, 'Required').pipe(list);

type SalaryResult = { success: true; amountMinor: number } | { success: false; errors: string[] };

/**
 * The typed salary in minor units of the country's currency: `parseMoney`, then the contract's
 * own bounds, so the form and the API never disagree on the cap.
 */
function readSalary(text: string, country: CountryCode): SalaryResult {
  if (!text.trim()) {
    return { success: false, errors: ['Required'] };
  }
  const salary = parseMoney(text, currencyOf(country));
  if (!salary.success) {
    return { success: false, errors: [salary.error] };
  }
  const amount = fields.annualSalaryMinor.safeParse(salary.amountMinor);
  return amount.success
    ? { success: true, amountMinor: amount.data }
    : { success: false, errors: amount.error.issues.map((issue) => issue.message) };
}

/**
 * The contract's employee schema with the salary as text, refined with `parseMoney` (ADR 0004,
 * *Forms: add and edit*). Its output is the exact request body. The salary is checked whenever a
 * country is picked, even while another field is invalid, so its message shows on blur.
 */
export const employeeFormSchema = z
  .object({
    name: fields.name,
    jobTitle: picked(fields.jobTitle),
    department: picked(fields.department),
    country: picked(fields.country),
    annualSalary: z.string(),
  })
  .superRefine(
    ({ annualSalary, country }, ctx) => {
      const salary = readSalary(annualSalary, country);
      if (!salary.success) {
        addSalaryIssues(ctx, salary.errors);
      }
    },
    { when: ({ issues }) => !issues.some((issue) => issue.path?.[0] === 'country') },
  )
  .transform(({ annualSalary, ...employee }, ctx): EmployeeRequest => {
    // Reached only once every field is valid, so the salary reads; it is checked again, not trusted.
    const salary = readSalary(annualSalary, employee.country);
    if (!salary.success) {
      addSalaryIssues(ctx, salary.errors);
      return z.NEVER;
    }
    return { ...employee, annualSalaryMinor: salary.amountMinor };
  });

function addSalaryIssues(ctx: z.RefinementCtx, messages: string[]): void {
  for (const message of messages) {
    ctx.addIssue({ code: 'custom', path: ['annualSalary'], message });
  }
}

/**
 * The live preview under the salary field, e.g. "= ₹1,250,000.50 a year" (ADR 0004, *Forms*), or
 * `null` while there is no country or the salary does not read: its message shows instead.
 */
export function salaryPreview(annualSalary: string, country: string): string | null {
  const code = countrySchema.safeParse(country);
  if (!code.success) {
    return null;
  }
  const salary = readSalary(annualSalary, code.data);
  if (!salary.success) {
    return null;
  }
  const money = { amountMinor: salary.amountMinor, currency: currencyOf(code.data) };
  return `= ${formatMoney(money, 'en')} a year`;
}
