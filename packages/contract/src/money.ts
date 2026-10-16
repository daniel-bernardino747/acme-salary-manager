import { z } from 'zod';
import { currencies, type CurrencyCode } from './reference.js';

export const currencySchema = z.enum(Object.keys(currencies) as [CurrencyCode, ...CurrencyCode[]]);

/** Money on the wire (ADR 0003): a whole number of minor units with its currency, below 2⁵³. */
export const moneySchema = z.strictObject({
  amountMinor: z.int(),
  currency: currencySchema,
});
export type Money = z.infer<typeof moneySchema>;
