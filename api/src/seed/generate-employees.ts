import type { EmployeeRequest } from '@acme/contract';
import { baseSalaryMinor, salaryStepMinor } from './base-salaries';
import { anchoredSalaries, freeSalaries } from './group-salaries';
import { homeDepartment } from './home-departments';
import { namesByCountry } from './names';
import { intInRange, streamFor, type Uint32Source } from './prng';
import { headcountQuotas, type Quota } from './quotas';

/** The fixed seed every stream is derived from (ADR 0005, *Determinism*). */
export const SEED = 'acme-salary-manager/2026-10';

export interface GeneratedEmployee {
  employee: EmployeeRequest;
}

const pick = (next: Uint32Source, list: readonly string[]) =>
  list[intInRange(next, 0, list.length - 1)] ?? '';

function cellEmployees({ jobTitle, country, count }: Quota): GeneratedEmployee[] {
  const group = {
    baseMinor: baseSalaryMinor(jobTitle, country),
    stepMinor: salaryStepMinor(country),
    size: count,
  };
  // One stream per cell for salaries and one for names, so changing a cell or a name list moves
  // nothing else.
  const salaryStream = streamFor(SEED, 'salaries', jobTitle, country);
  const nameStream = streamFor(SEED, 'names', jobTitle, country);
  const salaries =
    count >= 5 ? anchoredSalaries(salaryStream, group) : freeSalaries(salaryStream, group);
  const { given, family } = namesByCountry[country];
  return salaries.map((annualSalaryMinor) => ({
    employee: {
      name: `${pick(nameStream, given)} ${pick(nameStream, family)}`,
      jobTitle,
      department: homeDepartment[jobTitle],
      country,
      annualSalaryMinor,
    },
  }));
}

/**
 * The seed's 10,000 employees, as a pure function with no database (ADR 0005). Cells come in a
 * fixed order, countries then titles in reference-list order, and the rows are inserted in it.
 */
export function generateEmployees(): GeneratedEmployee[] {
  return headcountQuotas().flatMap(cellEmployees);
}
