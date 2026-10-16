import { z } from 'zod';
import { employeeResponseSchema } from './employee.js';
import { employeeListQuerySchema, pageOf } from './employee-list.js';
import { ratesSchema } from './exchange-rates.js';
import { moneySchema, usdMoneySchema } from './money.js';

/** Below 0.80 is underpaid, above 1.20 overpaid: the outlier's direction (CONTEXT.md). */
export const outlierDirectionSchema = z.enum(['below', 'above']);
export type OutlierDirection = z.infer<typeof outlierDirectionSchema>;

/**
 * `GET /api/outliers` (ADR 0003, *Outliers*): the list's paging and filters, with no name search,
 * and an optional direction that ranks only that one. Strict, like every query.
 */
export const outliersQuerySchema = employeeListQuerySchema
  .omit({ q: true })
  .extend({ direction: outlierDirectionSchema.optional() });
export type OutliersQuery = z.infer<typeof outliersQuerySchema>;

/**
 * One outlier (ADR 0003, *Money on the wire*). The peer median is in the employee's currency, and
 * the gap to 0.80 is set on every underpaid row and on no overpaid one.
 */
export const outlierSchema = z
  .strictObject({
    employee: employeeResponseSchema,
    peerMedian: moneySchema,
    peerHeadcount: z.int().min(5),
    compaRatioHundredths: z.int().min(0),
    direction: outlierDirectionSchema,
    gapMinor: z.int().min(1).nullable(),
  })
  .refine((outlier) => outlier.peerMedian.currency === outlier.employee.annualSalary.currency, {
    message: "The peer median must be in the employee's currency",
  })
  .refine((outlier) => (outlier.gapMinor === null) === (outlier.direction === 'above'), {
    message: 'Only an underpaid outlier has a gap to 0.80',
  });
export type Outlier = z.infer<typeof outlierSchema>;

/**
 * Question 4's page: the list envelope, the count of matching employees in small groups who were
 * not checked, and, with `direction=below` only, the cost to reach 0.80 with the rates that
 * converted it (ADR 0003, with ADR 0004's additions).
 */
export const outliersResponseSchema = pageOf(outlierSchema)
  .extend({
    smallGroupHeadcount: z.int().min(0),
    costToReachThreshold: z.strictObject({ usd: usdMoneySchema }).optional(),
    rates: ratesSchema.optional(),
  })
  .refine((page) => (page.costToReachThreshold === undefined) === (page.rates === undefined), {
    message: 'The cost to reach 0.80 comes with the rates that converted it',
  });
export type OutliersResponse = z.infer<typeof outliersResponseSchema>;
