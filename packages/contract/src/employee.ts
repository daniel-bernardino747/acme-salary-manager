import { z } from 'zod';
import { countrySchema, departmentSchema, jobTitleSchema } from './reference.js';

/**
 * The highest annual salary, in minor units. 10,000 employees at the cap still sum below 2⁵³ in one
 * currency (ADR 0003, *Validation and errors*). In INR, it is ₹9 billion a year.
 */
export const MAX_ANNUAL_SALARY_MINOR = 900_000_000_000;

/**
 * The body of an add (`POST`) or edit (`PUT`). Strict, with no `currency`: it follows from the
 * country.
 */
export const employeeRequestSchema = z.strictObject({
  name: z.string().trim().min(1, 'Required').max(100, 'Must be at most 100 characters'),
  jobTitle: jobTitleSchema,
  department: departmentSchema,
  country: countrySchema,
  annualSalaryMinor: z
    .int('Must be a whole number of minor units')
    .positive('Must be greater than 0')
    .max(MAX_ANNUAL_SALARY_MINOR, 'Exceeds the maximum salary'),
});
export type EmployeeRequest = z.infer<typeof employeeRequestSchema>;
