import { z } from 'zod';
import { ratesSchema } from './exchange-rates.js';
import { usdMoneySchema } from './money.js';
import { countries, countrySchema, jobTitleSchema } from './reference.js';

/** `GET /api/pay-comparison` (ADR 0003, *Endpoints*): the job title is required, and strict. */
export const payComparisonQuerySchema = z.strictObject({ jobTitle: jobTitleSchema });
export type PayComparisonQuery = z.infer<typeof payComparisonQuerySchema>;

/**
 * Question 3 (ADR 0003, *Money on the wire*): one job title's pay statistics for every supported
 * country, in fixed order, in USD, with the rates that produced them. A country with no employees
 * of the title has headcount 0 and null figures (ADR 0001).
 */
export const payComparisonResponseSchema = z.strictObject({
  jobTitle: jobTitleSchema,
  rows: z
    .array(
      z.strictObject({
        country: countrySchema,
        headcount: z.int().min(0),
        smallGroup: z.boolean(),
        min: usdMoneySchema.nullable(),
        median: usdMoneySchema.nullable(),
        average: usdMoneySchema.nullable(),
        max: usdMoneySchema.nullable(),
      }),
    )
    .refine(
      (rows) =>
        rows.length === countries.length &&
        rows.every((row, i) => row.country === countries[i]?.code),
      { message: 'Every supported country must appear once, in fixed order' },
    ),
  rates: ratesSchema,
});
export type PayComparisonResponse = z.infer<typeof payComparisonResponseSchema>;
