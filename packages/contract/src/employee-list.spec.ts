import { describe, expect, it } from 'vitest';
import { employeeListQuerySchema, outliersQuerySchema } from './index.js';

describe('employeeListQuerySchema, annual salary range', () => {
  it('takes either bound or both, with a country, as whole minor units from query text', () => {
    expect(
      employeeListQuerySchema.parse({
        country: 'DE',
        minSalaryMinor: '5000000',
        maxSalaryMinor: '8000000',
      }),
    ).toMatchObject({ country: 'DE', minSalaryMinor: 5_000_000, maxSalaryMinor: 8_000_000 });
    expect(employeeListQuerySchema.parse({ country: 'DE', minSalaryMinor: '1' })).toMatchObject({
      minSalaryMinor: 1,
    });
    expect(
      employeeListQuerySchema.parse({ country: 'DE', maxSalaryMinor: '900000000000' }),
    ).toMatchObject({ maxSalaryMinor: 900_000_000_000 });
  });

  it('takes a minimum equal to the maximum, since both bounds are inclusive', () => {
    const query = { country: 'JP', minSalaryMinor: '6000000', maxSalaryMinor: '6000000' };
    expect(employeeListQuerySchema.safeParse(query).success).toBe(true);
  });

  it('rejects a bound without a country, since a bound is in that country’s currency', () => {
    expect(employeeListQuerySchema.safeParse({ minSalaryMinor: '5000000' }).success).toBe(false);
    expect(employeeListQuerySchema.safeParse({ maxSalaryMinor: '5000000' }).success).toBe(false);
  });

  it('rejects a minimum above the maximum', () => {
    const query = { country: 'DE', minSalaryMinor: '8000001', maxSalaryMinor: '8000000' };
    expect(employeeListQuerySchema.safeParse(query).success).toBe(false);
  });

  it('takes only whole numbers from 1 to the salary cap', () => {
    for (const value of ['0', '-1', '1.5', 'abc', '900000000001']) {
      const query = { country: 'DE', minSalaryMinor: value };
      expect(employeeListQuerySchema.safeParse(query).success, value).toBe(false);
    }
  });

  it('is not part of the outliers query', () => {
    expect(outliersQuerySchema.safeParse({ country: 'DE', minSalaryMinor: '1' }).success).toBe(
      false,
    );
  });
});
