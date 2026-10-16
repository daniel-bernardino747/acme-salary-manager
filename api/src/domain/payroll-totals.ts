import {
  countries,
  departments,
  divideRoundHalfUpBigInt,
  exchangeRates,
  type CountryCode,
  type CurrencyCode,
  type Department,
  type Money,
} from '@acme/contract';
import { toUsd, type RatesPerUsd, type UsdMoney } from './conversion';
import { sumMinor } from './rounding';

/** An employee as payroll totals see them: where they sit and what they are paid. */
export interface PayrollEmployee {
  country: CountryCode;
  department: Department;
  annualSalary: Money;
}

/** One country's payroll total, in its own currency and in USD (ADR 0001, *USD totals*). */
export interface CountryPayroll {
  country: CountryCode;
  headcount: number;
  local: Money;
  usd: UsdMoney;
  sharePermille: number | null;
}

/** One department's payroll total in USD, across every currency it pays in. */
export interface DepartmentPayroll {
  department: Department;
  headcount: number;
  usd: UsdMoney;
  sharePermille: number | null;
}

/** The whole organization's payroll total in USD, the first number the HR Manager asks for. */
export interface GrandTotal {
  headcount: number;
  usd: UsdMoney;
}

export interface PayrollTotals {
  byCountry: CountryPayroll[];
  byDepartment: DepartmentPayroll[];
  grandTotal: GrandTotal;
}

/**
 * A USD payroll total: salaries summed per currency, each subtotal converted once, then the results
 * added, so parts may not add up exactly to the whole (ADR 0001, *USD totals*).
 */
function usdTotal(salaries: readonly Money[], ratesPerUsd: RatesPerUsd): UsdMoney {
  const byCurrency = new Map<CurrencyCode, number[]>();
  for (const { amountMinor, currency } of salaries) {
    byCurrency.set(currency, [...(byCurrency.get(currency) ?? []), amountMinor]);
  }
  const converted = [...byCurrency].map(
    ([currency, amounts]) =>
      toUsd({ amountMinor: sumMinor(amounts), currency }, ratesPerUsd).amountMinor,
  );
  return { amountMinor: sumMinor(converted), currency: 'USD' };
}

/**
 * A part's share of payroll: its USD total in tenths of a percent of the grand total, rounded half
 * up once (ADR 0003, *Money on the wire*). `part · 1000` can pass 2⁵³, so it divides in BigInt.
 * `null` when the grand total is 0: nothing has a share of nothing.
 */
function sharePermille(part: Money, grandTotal: Money): number | null {
  if (grandTotal.amountMinor === 0) {
    return null;
  }
  return Number(
    divideRoundHalfUpBigInt(BigInt(part.amountMinor) * 1000n, BigInt(grandTotal.amountMinor)),
  );
}

/**
 * Question 2: the payroll total of every country and every department, each in fixed order, with
 * its share of the grand total, and the grand total. Those without employees are listed too, at 0.
 */
export function payrollTotals(
  employees: readonly PayrollEmployee[],
  ratesPerUsd: RatesPerUsd = exchangeRates.ratesPerUsd,
): PayrollTotals {
  const grandTotal = usdTotal(
    employees.map((employee) => employee.annualSalary),
    ratesPerUsd,
  );
  const byCountry = countries.map(({ code, currency }) => {
    const salaries = employees
      .filter((employee) => employee.country === code)
      .map((employee) => employee.annualSalary.amountMinor);
    const local = { amountMinor: sumMinor(salaries), currency };
    const usd = toUsd(local, ratesPerUsd);
    return {
      country: code,
      headcount: salaries.length,
      local,
      usd,
      sharePermille: sharePermille(usd, grandTotal),
    };
  });
  const byDepartment = departments.map((department) => {
    const salaries = employees
      .filter((employee) => employee.department === department)
      .map((employee) => employee.annualSalary);
    const usd = usdTotal(salaries, ratesPerUsd);
    return {
      department,
      headcount: salaries.length,
      usd,
      sharePermille: sharePermille(usd, grandTotal),
    };
  });
  return { byCountry, byDepartment, grandTotal: { headcount: employees.length, usd: grandTotal } };
}
