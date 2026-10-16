import { z } from 'zod';
import { ratesSchema } from './exchange-rates.js';
import { moneySchema, usdMoneySchema } from './money.js';
import { countrySchema, currencyOf, departmentSchema } from './reference.js';

/** A share of payroll in tenths of a percent, `null` when the grand total is 0 (ADR 0003). */
const sharePermilleSchema = z.int().min(0).nullable();

const headcountSchema = z.int().min(0);

/** `GET /api/payroll-totals` takes no parameters, and is strict like every query (ADR 0003). */
export const payrollTotalsQuerySchema = z.strictObject({});
export type PayrollTotalsQuery = z.infer<typeof payrollTotalsQuerySchema>;

/**
 * `GET /api/payroll-totals`, question 2 (ADR 0003, *Money on the wire*, with ADR 0004's additions):
 * every country and every department, and the grand total, with the rates that produced the USD
 * figures.
 */
export const payrollTotalsResponseSchema = z.strictObject({
  byCountry: z.array(
    z
      .strictObject({
        country: countrySchema,
        headcount: headcountSchema,
        local: moneySchema,
        usd: usdMoneySchema,
        sharePermille: sharePermilleSchema,
      })
      .refine((row) => row.local.currency === currencyOf(row.country), {
        message: "The local total must be in the country's currency",
      }),
  ),
  byDepartment: z.array(
    z.strictObject({
      department: departmentSchema,
      headcount: headcountSchema,
      usd: usdMoneySchema,
      sharePermille: sharePermilleSchema,
    }),
  ),
  grandTotal: z.strictObject({ headcount: headcountSchema, usd: usdMoneySchema }),
  rates: ratesSchema,
});
export type PayrollTotalsResponse = z.infer<typeof payrollTotalsResponseSchema>;
