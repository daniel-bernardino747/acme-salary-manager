import { currencyOf, formatMoney, type CountryCode } from '@acme/contract';
import type { EmployeesSearchChange } from '../routes/search';
import { readSalary } from './employee-form';

/** The list's annual salary range (#46): set only once a country is, in its currency. */
export interface SalaryRange {
  country: CountryCode;
  minSalaryMinor?: number;
  maxSalaryMinor?: number;
}

export type SalaryBoundResult =
  { success: true; change: EmployeesSearchChange } | { success: false; error: string };

/**
 * One bound's field on blur or Enter (ADR 0004, *Employee list*): the typed text read like the
 * form's salary, in the country's currency. An empty field clears the bound. An error is shown
 * inline, and the URL keeps the last good value.
 */
export function commitSalaryBound(
  bound: 'min' | 'max',
  text: string,
  range: SalaryRange,
): SalaryBoundResult {
  const key = bound === 'min' ? 'minSalaryMinor' : 'maxSalaryMinor';
  if (!text.trim()) {
    return { success: true, change: { [key]: null } };
  }
  const salary = readSalary(text, currencyOf(range.country));
  if (!salary.success) {
    return { success: false, error: salary.errors[0] ?? 'Invalid amount' };
  }
  const min = bound === 'min' ? salary.amountMinor : range.minSalaryMinor;
  const max = bound === 'max' ? salary.amountMinor : range.maxSalaryMinor;
  if (min !== undefined && max !== undefined && min > max) {
    return { success: false, error: 'The minimum must not exceed the maximum' };
  }
  return { success: true, change: { [key]: salary.amountMinor } };
}

/** A committed bound as the field shows it: `formatMoney`'s plain input, or empty. */
export function salaryBoundText(amountMinor: number | undefined, country: CountryCode): string {
  return amountMinor === undefined
    ? ''
    : formatMoney({ amountMinor, currency: currencyOf(country) }, 'en', { plainInput: true });
}
