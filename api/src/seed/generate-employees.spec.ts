import { employeeRequestSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { median } from '../domain/statistics';
import { generateEmployees } from './generate-employees';
import { baseSalaryMinor, salaryStepMinor } from './base-salaries';
import { homeDepartment } from './home-departments';
import { namesByCountry } from './names';
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

  it("keeps every employee who isn't planted within 0.85–1.15 of their group's final median, in every group of 5 or more", () => {
    for (const { jobTitle, country, count } of headcountQuotas().filter((q) => q.count >= 5)) {
      const group = generated.filter(
        (g) => g.employee.jobTitle === jobTitle && g.employee.country === country,
      );
      const groupMedian = median(group.map((g) => g.employee.annualSalaryMinor));
      expect(group).toHaveLength(count);
      expect(groupMedian).toBe(baseSalaryMinor(jobTitle, country));

      for (const { employee } of group.filter((g) => !g.plant)) {
        // Integer cross-multiplication, as for outliers (ADR 0001).
        expect(100 * employee.annualSalaryMinor).toBeGreaterThanOrEqual(85 * (groupMedian ?? 0));
        expect(100 * employee.annualSalaryMinor).toBeLessThanOrEqual(115 * (groupMedian ?? 0));
      }
    }
  });

  it('names everyone "Given Family" from their country\'s lists, with accented, apostrophe and hyphen names but no ß', () => {
    for (const { name, country } of employees) {
      const { given, family } = namesByCountry[country];
      const first = given.find((g) => name.startsWith(`${g} `));
      expect(first && family).toContain(first && name.slice(first.length + 1));
    }
    const names = employees.map((e) => e.name);
    expect(names.some((n) => n.includes('João'))).toBe(true);
    expect(names.some((n) => n.includes('Müller'))).toBe(true);
    expect(names.some((n) => n.includes("O'Connor"))).toBe(true);
    expect(names.some((n) => n.includes('Anna-Lena'))).toBe(true);
    expect(names.some((n) => n.includes('ß'))).toBe(false);
  });
});
