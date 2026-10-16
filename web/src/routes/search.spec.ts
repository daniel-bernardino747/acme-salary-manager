import { describe, expect, it } from 'vitest';
import {
  changeEmployeesSearch,
  activeFilterCount,
  changeOutliersSearch,
  employeesSearchAfterDelete,
  employeesSearchFromOutliers,
  comparisonSearchSchema,
  employeesSearchSchema,
  outliersSearchSchema,
  parseSearch,
  statisticsSearchSchema,
  stringifySearch,
} from './search';

// Every case goes through the router's own parser, as a typed or shared URL would.

describe('parseSearch', () => {
  it('keeps every value as the text in the URL', () => {
    expect(parseSearch('?page=2&q=123&flag=true&name=Jo%C3%A3o')).toEqual({
      page: '2',
      q: '123',
      flag: 'true',
      name: 'João',
    });
  });

  it('round-trips with stringifySearch, leaving out unset values', () => {
    const search = stringifySearch({ page: 2, q: '007', country: undefined });

    expect(search).toBe('?page=2&q=007');
    expect(parseSearch(search)).toEqual({ page: '2', q: '007' });
  });
});

describe('employeesSearchSchema', () => {
  const parse = (search: string) => employeesSearchSchema.parse(parseSearch(search));

  it('keeps valid values', () => {
    expect(
      parse('?page=2&q=pri%20sha&country=IN&department=Data&jobTitle=Data%20Scientist'),
    ).toEqual({
      page: 2,
      q: 'pri sha',
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Scientist',
    });
  });

  it('keeps a search that looks like a number or a boolean as text', () => {
    expect(parse('?q=123')).toEqual({ page: 1, q: '123' });
    expect(parse('?q=true')).toEqual({ page: 1, q: 'true' });
    expect(parse('?q=007')).toEqual({ page: 1, q: '007' });
  });

  it('defaults to the first page with no search or filters', () => {
    expect(parse('')).toEqual({ page: 1 });
  });

  it('drops each invalid value to its default, keeping the valid ones', () => {
    expect(
      parse(
        `?page=0&q=${'x'.repeat(101)}&country=UK&department=Legal&jobTitle=Software%20Engineers`,
      ),
    ).toEqual({ page: 1 });
    expect(parse('?page=two&country=GB')).toEqual({ page: 1, country: 'GB' });
    expect(parse('?page=2.5')).toEqual({ page: 1 });
  });

  it('ignores unknown parameters', () => {
    expect(parse('?contry=IN')).toEqual({ page: 1 });
  });
});

describe('outliersSearchSchema', () => {
  const parse = (search: string) => outliersSearchSchema.parse(parseSearch(search));

  it('opens on the underpaid, first page', () => {
    expect(parse('')).toEqual({ page: 1, direction: 'below' });
  });

  it('keeps a valid direction and filters', () => {
    expect(parse('?page=3&direction=all&country=NL&department=Data')).toEqual({
      page: 3,
      direction: 'all',
      country: 'NL',
      department: 'Data',
    });
  });

  it('falls back to the underpaid for an unknown direction', () => {
    expect(parse('?direction=sideways&jobTitle=Accountant')).toEqual({
      page: 1,
      direction: 'below',
      jobTitle: 'Accountant',
    });
  });
});

describe('statisticsSearchSchema', () => {
  const parse = (search: string) => statisticsSearchSchema.parse(parseSearch(search));

  it('keeps a picked title and country, with no defaults', () => {
    expect(parse('')).toEqual({});
    expect(parse('?jobTitle=Data%20Scientist&country=JP')).toEqual({
      jobTitle: 'Data Scientist',
      country: 'JP',
    });
  });

  it('drops an unknown title or country, so that picker shows empty', () => {
    expect(parse('?jobTitle=Wizard&country=JP')).toEqual({ country: 'JP' });
  });
});

describe('comparisonSearchSchema', () => {
  const parse = (search: string) => comparisonSearchSchema.parse(parseSearch(search));

  it('keeps a picked title and drops an unknown one', () => {
    expect(parse('?jobTitle=Recruiter')).toEqual({ jobTitle: 'Recruiter' });
    expect(parse('?jobTitle=recruiter')).toEqual({});
  });
});

describe('changeEmployeesSearch', () => {
  const current = { page: 4, q: 'pri', country: 'IN', department: 'Data' } as const;

  it('applies a new search or filter and goes back to the first page', () => {
    expect(changeEmployeesSearch(current, { q: 'pri sha' })).toEqual({
      page: 1,
      q: 'pri sha',
      country: 'IN',
      department: 'Data',
    });
    expect(changeEmployeesSearch(current, { jobTitle: 'Data Scientist' })).toEqual({
      page: 1,
      q: 'pri',
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Scientist',
    });
  });

  it('unsets a cleared filter and a blank search, so they leave the URL', () => {
    expect(changeEmployeesSearch(current, { country: null, q: '   ' })).toEqual({
      page: 1,
      department: 'Data',
    });
  });
});

describe('employeesSearchAfterDelete', () => {
  const priya = {
    id: 7,
    name: 'Priya Sharma',
    jobTitle: 'Software Engineer II',
    department: 'Engineering',
    country: 'IN',
    annualSalary: { amountMinor: 1_250_000_50, currency: 'INR' },
  } as const;

  it('steps back one page when the delete emptied the page, keeping the search and filters', () => {
    const search = { page: 3, q: 'sharma', country: 'IN' } as const;

    expect(employeesSearchAfterDelete(search, { items: [] })).toEqual({
      page: 2,
      q: 'sharma',
      country: 'IN',
    });
  });

  it('stays on a page that still has employees, and on the first page even when it is empty', () => {
    expect(employeesSearchAfterDelete({ page: 3 }, { items: [priya] })).toEqual({ page: 3 });
    expect(employeesSearchAfterDelete({ page: 1 }, { items: [] })).toEqual({ page: 1 });
  });
});

describe('changeOutliersSearch', () => {
  const current = { page: 3, direction: 'below', country: 'IN', department: 'Data' } as const;

  it('applies a new direction or filter and goes back to the first page', () => {
    expect(changeOutliersSearch(current, { direction: 'above' })).toEqual({
      page: 1,
      direction: 'above',
      country: 'IN',
      department: 'Data',
    });
    expect(changeOutliersSearch(current, { jobTitle: 'Data Scientist' })).toEqual({
      page: 1,
      direction: 'below',
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Scientist',
    });
  });

  it('unsets a cleared filter, so it leaves the URL', () => {
    expect(changeOutliersSearch(current, { department: null })).toEqual({
      page: 1,
      direction: 'below',
      country: 'IN',
    });
  });
});

describe('employeesSearchFromOutliers', () => {
  it("opens the employee list on question 4's filters, from its first page", () => {
    const outliers = outliersSearchSchema.parse({
      page: '3',
      direction: 'above',
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Analyst',
    });

    expect(employeesSearchFromOutliers(outliers)).toEqual({
      page: 1,
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Analyst',
    });
  });

  it('opens the whole list when no filter is set', () => {
    expect(employeesSearchFromOutliers(outliersSearchSchema.parse({}))).toEqual({ page: 1 });
  });
});

describe('activeFilterCount', () => {
  it('counts the country, department and job title filters that are set', () => {
    expect(activeFilterCount({})).toBe(0);
    expect(activeFilterCount({ country: 'IN', jobTitle: 'Data Analyst' })).toBe(2);
    expect(activeFilterCount({ country: 'IN', department: 'Data', jobTitle: 'Accountant' })).toBe(3);
  });
});
