import {
  currencyOf,
  employeeRequestSchema,
  parseMoney,
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

/**
 * The contract's employee schema with the salary as text (ADR 0004, *Forms: add and edit*). Its
 * output is the exact request body.
 */
export const employeeFormSchema = z
  .object({
    name: fields.name,
    jobTitle: z.string().pipe(fields.jobTitle),
    department: z.string().pipe(fields.department),
    country: z.string().pipe(fields.country),
    annualSalary: z.string(),
  })
  .transform(({ annualSalary, ...employee }, ctx): EmployeeRequest => {
    const salary = parseMoney(annualSalary, currencyOf(employee.country));
    if (!salary.success) {
      ctx.addIssue({ code: 'custom', path: ['annualSalary'], message: salary.error });
      return z.NEVER;
    }
    const amount = fields.annualSalaryMinor.safeParse(salary.amountMinor);
    if (!amount.success) {
      for (const issue of amount.error.issues) {
        ctx.addIssue({ code: 'custom', path: ['annualSalary'], message: issue.message });
      }
      return z.NEVER;
    }
    return { ...employee, annualSalaryMinor: amount.data };
  });
