import { employeeRequestSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { generateEmployees } from './generate-employees';
import { homeDepartment } from './home-departments';
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
});
