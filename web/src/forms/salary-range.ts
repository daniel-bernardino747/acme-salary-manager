import { currencyOf, formatMoney, type CountryCode } from '@acme/contract';
import type { EmployeesSearchChange } from '../routes/search';
import { readSalary } from './employee-form';

/** The list's annual salary range (#46): set only once a country is, in its currency. */
export interface SalaryRange {
  country: CountryCode;
  minSalaryMinor?: number;
  maxSalaryMinor?: number;
}

export type SalaryBound = 'min' | 'max';

/** Each bound's search param. */
export const salaryBoundKey = {
  min: 'minSalaryMinor',
  max: 'maxSalaryMinor',
} as const satisfies Record<SalaryBound, keyof SalaryRange>;

export type SalaryBoundResult =
  { success: true; change: EmployeesSearchChange } | { success: false; error: string };

/**
 * One bound's field on blur or Enter (ADR 0004, *Employee list*): the typed text read like the
 * form's salary, in the country's currency. An empty field clears the bound. An error is shown
 * inline, and the URL keeps the last good value.
 */
export function commitSalaryBound(
  bound: SalaryBound,
  text: string,
  range: SalaryRange,
): SalaryBoundResult {
  const key = salaryBoundKey[bound];
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

/**
 * What the two fields hold: the range from the URL, what is typed and not yet committed (null shows
 * the URL's bound), each field's error, and the range this component's own commit is waiting for.
 */
export interface SalaryFieldsState {
  range: SalaryRange;
  typed: Record<SalaryBound, string | null>;
  errors: Record<SalaryBound, string | null>;
  awaiting: string | null;
}

const none = { min: null, max: null };
const rangeKey = (range: SalaryRange) =>
  `${range.country}:${range.minSalaryMinor ?? ''}:${range.maxSalaryMinor ?? ''}`;

/** Both fields showing the URL's range, with nothing typed. */
export function salaryFields(range: SalaryRange): SalaryFieldsState {
  return { range, typed: none, errors: none, awaiting: null };
}

/** Typing replaces the field's text and clears its error until the next commit. */
export function typeSalaryBound(
  state: SalaryFieldsState,
  bound: SalaryBound,
  text: string,
): SalaryFieldsState {
  return {
    ...state,
    typed: { ...state.typed, [bound]: text },
    errors: { ...state.errors, [bound]: null },
  };
}

/**
 * A field's blur or Enter. A valid amount clears the field and returns the change for the URL, unless
 * it is the bound already there, which changes nothing, so the list keeps its page. An invalid one
 * keeps the text and shows its error. The other field is left as it is.
 */
export function commitSalaryField(
  state: SalaryFieldsState,
  bound: SalaryBound,
): { state: SalaryFieldsState; change: EmployeesSearchChange | null } {
  const text = state.typed[bound];
  if (text === null) {
    return { state, change: null };
  }
  const result = commitSalaryBound(bound, text, state.range);
  if (!result.success) {
    return {
      state: { ...state, errors: { ...state.errors, [bound]: result.error } },
      change: null,
    };
  }
  const key = salaryBoundKey[bound];
  const value = result.change[key] ?? undefined;
  const cleared = { ...state, typed: { ...state.typed, [bound]: null } };
  if (value === state.range[key]) {
    return { state: cleared, change: null };
  }
  return {
    state: { ...cleared, awaiting: rangeKey({ ...state.range, [key]: value }) },
    change: result.change,
  };
}

/**
 * The URL's range changed. If it is this component's own commit arriving, the other field keeps
 * what is typed and its error. Any other change (Back, Forward, a link) shows the URL in both.
 */
export function syncSalaryFields(state: SalaryFieldsState, range: SalaryRange): SalaryFieldsState {
  if (rangeKey(range) === rangeKey(state.range)) {
    return state;
  }
  return rangeKey(range) === state.awaiting
    ? { ...state, range, awaiting: null }
    : salaryFields(range);
}

/**
 * What a field shows: the typed text; else the URL's bound, as money (`formatMoney`) while the
 * field is not being edited, and as `formatMoney`'s plain input while it is, which `parseMoney`
 * reads back.
 */
export function salaryFieldText(
  state: SalaryFieldsState,
  bound: SalaryBound,
  { editing }: { editing: boolean },
): string {
  const typed = state.typed[bound];
  if (typed !== null) {
    return typed;
  }
  const amountMinor = state.range[salaryBoundKey[bound]];
  if (amountMinor === undefined || editing) {
    return salaryBoundText(amountMinor, state.range.country);
  }
  return formatMoney({ amountMinor, currency: currencyOf(state.range.country) }, 'en');
}
