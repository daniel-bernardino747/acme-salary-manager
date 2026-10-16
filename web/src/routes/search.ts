import { countrySchema, departmentSchema, jobTitleSchema } from '@acme/contract';
import { z } from 'zod';

// URL search params are lenient (ADR 0004, *Routing*): each invalid or unknown value falls back to
// its default on its own, instead of showing an error page. So the UI never sends a bad value.

const page = z.number().int().min(1).default(1).catch(1);
const q = z.string().max(100).optional().catch(undefined);
const country = countrySchema.optional().catch(undefined);
const department = departmentSchema.optional().catch(undefined);
const jobTitle = jobTitleSchema.optional().catch(undefined);

export const employeesSearchSchema = z.object({ page, q, country, department, jobTitle });
export type EmployeesSearch = z.infer<typeof employeesSearchSchema>;

/** `all` omits the API's `direction` parameter (ADR 0004, *Question 4*). */
export const outlierDirections = ['below', 'above', 'all'] as const;
const direction = z.enum(outlierDirections).default('below').catch('below');

export const outliersSearchSchema = z.object({ page, direction, country, department, jobTitle });
export type OutliersSearch = z.infer<typeof outliersSearchSchema>;

/** Question 1 picks both with no defaults: nothing is fetched until both are set. */
export const statisticsSearchSchema = z.object({ jobTitle, country });
export type StatisticsSearch = z.infer<typeof statisticsSearchSchema>;

/** Question 3 picks a title with no default. */
export const comparisonSearchSchema = z.object({ jobTitle });
export type ComparisonSearch = z.infer<typeof comparisonSearchSchema>;
