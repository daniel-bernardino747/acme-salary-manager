import { describe, expect, it } from 'vitest';
import {
  comparisonSearchSchema,
  employeesSearchSchema,
  outliersSearchSchema,
  statisticsSearchSchema,
} from './search';

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

describe('outliersSearchSchema', () => {
  it('opens on the underpaid, first page', () => {
    expect(outliersSearchSchema.parse({})).toEqual({ page: 1, direction: 'below' });
  });

  it('keeps a valid direction and filters', () => {
    expect(
      outliersSearchSchema.parse({ page: 3, direction: 'all', country: 'NL', department: 'Data' }),
    ).toEqual({ page: 3, direction: 'all', country: 'NL', department: 'Data' });
  });

  it('falls back to the underpaid for an unknown direction', () => {
    expect(outliersSearchSchema.parse({ direction: 'sideways', jobTitle: 'Accountant' })).toEqual({
      page: 1,
      direction: 'below',
      jobTitle: 'Accountant',
    });
  });
});

describe('statisticsSearchSchema', () => {
  it('keeps a picked title and country, with no defaults', () => {
    expect(statisticsSearchSchema.parse({})).toEqual({});
    expect(statisticsSearchSchema.parse({ jobTitle: 'Data Scientist', country: 'JP' })).toEqual({
      jobTitle: 'Data Scientist',
      country: 'JP',
    });
  });

  it('drops an unknown title or country, so that picker shows empty', () => {
    expect(statisticsSearchSchema.parse({ jobTitle: 'Wizard', country: 'JP' })).toEqual({
      country: 'JP',
    });
  });
});

describe('comparisonSearchSchema', () => {
  it('keeps a picked title and drops an unknown one', () => {
    expect(comparisonSearchSchema.parse({ jobTitle: 'Recruiter' })).toEqual({
      jobTitle: 'Recruiter',
    });
    expect(comparisonSearchSchema.parse({ jobTitle: 'recruiter' })).toEqual({});
  });
});
