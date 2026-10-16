import { describe, expect, it } from 'vitest';
import { employeesSearchSchema } from './search';

describe('employeesSearchSchema', () => {
  it('keeps valid values', () => {
    expect(
      employeesSearchSchema.parse({
        page: 2,
        q: 'pri sha',
        country: 'IN',
        department: 'Data',
        jobTitle: 'Data Scientist',
      }),
    ).toEqual({
      page: 2,
      q: 'pri sha',
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Scientist',
    });
  });

  it('defaults to the first page with no search or filters', () => {
    expect(employeesSearchSchema.parse({})).toEqual({ page: 1 });
  });

  it('drops each invalid value to its default, keeping the valid ones', () => {
    expect(
      employeesSearchSchema.parse({
        page: 0,
        q: 'x'.repeat(101),
        country: 'UK',
        department: 'Legal',
        jobTitle: 'Software Engineers',
      }),
    ).toEqual({ page: 1 });
    expect(employeesSearchSchema.parse({ page: 'two', country: 'GB' })).toEqual({
      page: 1,
      country: 'GB',
    });
  });

  it('ignores unknown parameters', () => {
    expect(employeesSearchSchema.parse({ contry: 'IN' })).toEqual({ page: 1 });
  });
});
