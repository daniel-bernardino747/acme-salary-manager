import {
  currencyOf,
  employeeRequestSchema,
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
        for (const message of salary.errors) {
          ctx.addIssue({ code: 'custom', path: ['annualSalary'], message });
        }
      }
    },
    { when: ({ issues }) => !issues.some((issue) => issue.path?.[0] === 'country') },
  )
  .transform(({ annualSalary, ...employee }): EmployeeRequest => {
    // Only reached once every field, the salary included, is valid.
    const salary = readSalary(annualSalary, employee.country);
    return { ...employee, annualSalaryMinor: salary.success ? salary.amountMinor : 0 };
  });
