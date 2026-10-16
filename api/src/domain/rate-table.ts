import { countries } from '@acme/contract';

/**
 * Throws unless every supported country's currency has a whole rate greater than 0, so a broken table
 * fails at startup rather than on the insights pages (ADR 0001, *Exchange rate table*).
 */
export function assertRateTable(ratesPerUsd: Readonly<Partial<Record<string, number>>>): void {
  for (const { code, currency } of countries) {
    const rate = ratesPerUsd[currency];
    if (rate === undefined) {
      throw new Error(`The exchange rate table has no rate for ${currency} (${code}).`);
    }
    if (!Number.isSafeInteger(rate)) {
      throw new Error(
        `The exchange rate for ${currency} (${code}) must be a whole number of millionths, got ${rate}.`,
      );
    }
    if (rate <= 0) {
      throw new Error(
        `The exchange rate for ${currency} (${code}) must be greater than 0, got ${rate}.`,
      );
    }
  }
}
