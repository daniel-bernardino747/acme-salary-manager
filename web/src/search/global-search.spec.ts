import { describe, expect, it } from 'vitest';
import {
  employeeSearchPath,
  isEmployeeQuery,
  matchingCountries,
  matchingJobTitles,
} from './global-search';

describe('isEmployeeQuery', () => {
  it('searches employees from 2 characters, ignoring surrounding spaces', () => {
    expect(isEmployeeQuery('')).toBe(false);
    expect(isEmployeeQuery(' a ')).toBe(false);
    expect(isEmployeeQuery('sh')).toBe(true);
  });
});

describe('employeeSearchPath', () => {
  it("asks the list's own endpoint for the first 8 matches", () => {
    expect(employeeSearchPath('  Rohan Sh ')).toBe('/api/employees?page=1&pageSize=8&q=Rohan+Sh');
  });
});

describe('matchingJobTitles', () => {
  it('matches any part of a title, ignoring case, in the reference order', () => {
    expect(matchingJobTitles('software engineer')).toEqual([
      'Software Engineer I',
      'Software Engineer II',
      'Senior Software Engineer',
      'Staff Software Engineer',
    ]);
  });

  it('matches nothing for a blank query', () => {
    expect(matchingJobTitles('  ')).toEqual([]);
  });

  it('keeps to at most 4 titles', () => {
    expect(matchingJobTitles('e').length).toBe(4);
  });
});

describe('matchingCountries', () => {
  it('matches a country by name or by code', () => {
    expect(matchingCountries('ind').map(({ code }) => code)).toEqual(['IN']);
    expect(matchingCountries('gb').map(({ code }) => code)).toEqual(['GB']);
  });

  it('matches nothing for a blank query', () => {
    expect(matchingCountries('')).toEqual([]);
  });
});
