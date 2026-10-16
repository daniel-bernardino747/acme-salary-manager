import { countries, type CountryCode } from '@acme/contract';

/** A country's English name, e.g. "United Kingdom" for GB, which is how the UK is stored. */
export function countryName(country: CountryCode): string {
  return countries.find((c) => c.code === country)?.name ?? country;
}
