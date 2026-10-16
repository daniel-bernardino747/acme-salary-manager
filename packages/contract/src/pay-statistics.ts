import { z } from 'zod';
import { moneySchema } from './money.js';
import { countrySchema, currencyOf, jobTitleSchema } from './reference.js';

/** `GET /api/pay-statistics` (ADR 0003, *Endpoints*): both required, and strict like every query. */
export const payStatisticsQuerySchema = z.strictObject({
  jobTitle: jobTitleSchema,
  country: countrySchema,
});
export type PayStatisticsQuery = z.infer<typeof payStatisticsQuerySchema>;

/**
 * Pay statistics for one peer group, in the country's currency (ADR 0003, *Money on the wire*).
 * An empty group has headcount 0 and null figures, never 0 (ADR 0001).
 */
export const payStatisticsResponseSchema = z
  .strictObject({
    jobTitle: jobTitleSchema,
    country: countrySchema,
    headcount: z.int().min(0),
    smallGroup: z.boolean(),
    min: moneySchema.nullable(),
    median: moneySchema.nullable(),
    average: moneySchema.nullable(),
    max: moneySchema.nullable(),
  })
  .refine(
    (statistics) =>
      [statistics.min, statistics.median, statistics.average, statistics.max].every(
        (figure) => figure === null || figure.currency === currencyOf(statistics.country),
      ),
    { message: "Every figure must be in the country's currency" },
  );
export type PayStatisticsResponse = z.infer<typeof payStatisticsResponseSchema>;
