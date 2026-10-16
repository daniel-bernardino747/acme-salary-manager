import { currencyOf, type CountryCode } from '@acme/contract';

/**
 * A country's stamp, e.g. "IN · INR": its code and the currency its salaries are in, shown the
 * same way wherever a country or a currency appears.
 */
export function countryStamp(country: CountryCode): string {
  return `${country} · ${currencyOf(country)}`;
}
