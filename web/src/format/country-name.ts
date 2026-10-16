import { countries, type CountryCode } from '@acme/contract';

/** A country's English name, e.g. "United Kingdom" for GB, which is how the UK is stored. */
export function countryName(country: CountryCode): string {
  return countries.find((c) => c.code === country)?.name ?? country;
}

/** The country picker's options: each country's code as the value, its name as the label. */
export const countryOptions = countries.map((country) => ({
  value: country.code,
  label: country.name,
}));

/** Countries whose English name reads with "the": "in the Netherlands", never "in Netherlands". */
const takesThe = new Set<CountryCode>(['US', 'GB', 'NL']);

/** "in India", "in the United Kingdom". */
export function inCountry(country: CountryCode): string {
  const name = countryName(country);
  return takesThe.has(country) ? `in the ${name}` : `in ${name}`;
}
