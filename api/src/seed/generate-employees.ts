import {
  divideRoundHalfUp,
  type CountryCode,
  type EmployeeRequest,
  type JobTitle,
} from '@acme/contract';
import { baseSalaryMinor, salaryStepMinor } from './base-salaries';
import { inCell } from './cell';
import { anchoredSalaries, freeSalaries } from './group-salaries';
import { homeDepartment } from './home-departments';
import { namesByCountry } from './names';
import { boundaryPlants, plantedOutliers, type BoundaryPlant, type PlantedOutlier } from './plants';
import { intInRange, streamFor, type Uint32Source } from './prng';
import { headcountQuotas, type Quota } from './quotas';

/** The fixed seed every stream is derived from (ADR 0005, *Determinism*). */
export const SEED = 'acme-salary-manager/2026-10';

export type Plant = PlantedOutlier | BoundaryPlant;

export interface GeneratedEmployee {
  employee: EmployeeRequest;
  /** The plant this employee carries, or `null` for a drawn salary. */
  plant: Plant | null;
}

function pick(next: Uint32Source, list: readonly string[]): string {
  const name = list[intInRange(next, 0, list.length - 1)];
  if (name === undefined) {
    throw new RangeError('A name list is empty.');
  }
  return name;
}

/**
 * A planted salary: a planted outlier's target × base, rounded half up to the step, or a boundary
 * plant's exact 0.80 or 1.20 × base, exempt from step rounding.
 */
function plantedSalaryMinor(plant: Plant, baseMinor: number, stepMinor: number): number {
  if ('ratioHundredths' in plant) {
    const salary = (plant.ratioHundredths * baseMinor) / 100;
    if (!Number.isInteger(salary)) {
      throw new RangeError(`${plant.jobTitle} · ${plant.country}: the boundary is not whole.`);
    }
    return salary;
  }
  return divideRoundHalfUp(plant.targetHundredths * (baseMinor / stepMinor), 100) * stepMinor;
}

const plantsIn = (jobTitle: JobTitle, country: CountryCode): Plant[] =>
  [...plantedOutliers, ...boundaryPlants].filter(inCell(jobTitle, country));

function cellEmployees({ jobTitle, country, count }: Quota): GeneratedEmployee[] {
  const baseMinor = baseSalaryMinor(jobTitle, country);
  const stepMinor = salaryStepMinor(country);
  const planted = plantsIn(jobTitle, country).map((plant) => ({
    plant,
    salary: plantedSalaryMinor(plant, baseMinor, stepMinor),
  }));
  // Rows are matched back to their plant by salary, so no two plants in a cell may share one.
  if (new Set(planted.map((p) => p.salary)).size !== planted.length) {
    throw new RangeError(`${jobTitle} · ${country}: two plants share a salary.`);
  }
  const group = {
    baseMinor,
    stepMinor,
    size: count,
    underpaid: planted.filter((p) => p.salary < baseMinor).map((p) => p.salary),
    overpaid: planted.filter((p) => p.salary > baseMinor).map((p) => p.salary),
  };
  // One stream per cell for salaries and one for names, so changing a cell or a name list moves
  // nothing else.
  const salaryStream = streamFor(SEED, 'salaries', jobTitle, country);
  const nameStream = streamFor(SEED, 'names', jobTitle, country);
  const salaries =
    count >= 5 ? anchoredSalaries(salaryStream, group) : freeSalaries(salaryStream, group);
  const { given, family } = namesByCountry[country];
  // Planted salaries sit outside the draw range, so each one marks its plant's row.
  return salaries.map((annualSalaryMinor) => ({
    plant: planted.find((p) => p.salary === annualSalaryMinor)?.plant ?? null,
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
