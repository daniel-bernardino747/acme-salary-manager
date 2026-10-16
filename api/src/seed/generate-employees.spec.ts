import { employeeRequestSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { generateEmployees } from './generate-employees';
import { baseSalaryMinor, salaryStepMinor } from './base-salaries';
import { homeDepartment } from './home-departments';
import { boundaryPlants, plantedOutliers } from './plants';
import { headcountQuotas } from './quotas';

const generated = generateEmployees();
const employees = generated.map((g) => g.employee);

describe('generateEmployees', () => {
  it("gives every cell its quota's headcount, countries then titles in reference-list order, each a valid employee in the title's home department", () => {
    const quotas = headcountQuotas();
    const cellOrder = quotas.flatMap((q) =>
      Array.from({ length: q.count }, () => `${q.jobTitle} · ${q.country}`),
    );

    expect(employees).toHaveLength(10_000);
    expect(employees.map((e) => `${e.jobTitle} · ${e.country}`)).toEqual(cellOrder);
    for (const employee of employees) {
      expect(employeeRequestSchema.parse(employee)).toEqual(employee);
      expect(employee.department).toBe(homeDepartment[employee.jobTitle]);
    }
  });

  it('puts each planted outlier in its cell at target × base, to the step, and each boundary plant at exactly 0.80 or 1.20 × base', () => {
    const plantedIn = (jobTitle: string, country: string) =>
      generated.filter(
        (g) => g.plant && g.employee.jobTitle === jobTitle && g.employee.country === country,
      );

    for (const plant of plantedOutliers) {
      const steps = baseSalaryMinor(plant.jobTitle, plant.country) / salaryStepMinor(plant.country);
      // target × base rounded half up to a whole step, in integers.
      const expected =
        Math.floor((steps * plant.targetHundredths + 50) / 100) * salaryStepMinor(plant.country);
      const [found, ...others] = plantedIn(plant.jobTitle, plant.country);

      expect(others).toEqual([]);
      expect(found?.plant).toEqual(plant);
      expect(found?.employee.annualSalaryMinor).toBe(expected);
    }
    for (const plant of boundaryPlants) {
      const base = baseSalaryMinor(plant.jobTitle, plant.country);
      const [found, ...others] = plantedIn(plant.jobTitle, plant.country);

      expect(others).toEqual([]);
      expect(found?.plant).toEqual(plant);
      expect(found && 100 * found.employee.annualSalaryMinor).toBe(plant.ratioHundredths * base);
    }
    expect(generated.filter((g) => g.plant)).toHaveLength(22);
  });
});
