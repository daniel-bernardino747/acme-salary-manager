import { exchangeRates } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { assertRateTable } from './rate-table';

describe('assertRateTable', () => {
  it('accepts the shipped table', () => {
    expect(() => assertRateTable(exchangeRates.ratesPerUsd)).not.toThrow();
  });

  it("fails fast when a supported country's currency has no rate", () => {
    const withoutGbp = Object.fromEntries(
      Object.entries(exchangeRates.ratesPerUsd).filter(([currency]) => currency !== 'GBP'),
    );
    expect(() => assertRateTable(withoutGbp)).toThrow(/GBP/);
  });

  it.each([0, -1, Number.NaN])(
    'fails fast on a rate of %s, which is not greater than 0',
    (rate) => {
      expect(() => assertRateTable({ ...exchangeRates.ratesPerUsd, JPY: rate })).toThrow(/JPY/);
    },
  );

  it('fails fast on a rate that is not a whole number of millionths', () => {
    expect(() => assertRateTable({ ...exchangeRates.ratesPerUsd, JPY: 156_996_918.5 })).toThrow(
      /JPY/,
    );
  });
});
