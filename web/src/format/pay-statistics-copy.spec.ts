import { describe, expect, it } from 'vitest';
import { emptyGroupText, smallGroupNotice, statisticsHeading } from './pay-statistics-copy';

describe('statisticsHeading', () => {
  it.each([
    ['Software Engineer II', 'IN', 'Software Engineer II in India · INR'],
    ['Senior Data Scientist', 'NL', 'Senior Data Scientist in the Netherlands · EUR'],
    ['Accountant', 'GB', 'Accountant in the United Kingdom · GBP'],
  ] as const)('names %s in %s with its currency', (jobTitle, country, heading) => {
    expect(statisticsHeading({ jobTitle, country })).toBe(heading);
  });
});

describe('emptyGroupText', () => {
  it('says no employee has the title there, keeping the title singular', () => {
    expect(emptyGroupText({ jobTitle: 'Software Engineer II', country: 'IN' })).toBe(
      'No employees with the title Software Engineer II in India.',
    );
    expect(emptyGroupText({ jobTitle: 'Recruiter', country: 'US' })).toBe(
      'No employees with the title Recruiter in the United States.',
    );
  });
});

describe('smallGroupNotice', () => {
  const rest =
    'With so few people these figures say little about the role, and they reveal individual pay. ' +
    'Outlier checks skip groups under 5.';

  it.each([
    [3, `Only 3 employees. ${rest}`],
    [1, `Only 1 employee. ${rest}`],
  ])('warns about a small group of %i', (headcount, notice) => {
    expect(smallGroupNotice(headcount)).toBe(notice);
  });
});
