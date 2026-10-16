import { describe, expect, it } from 'vitest';
import { statisticsHeading } from './pay-statistics-copy';

describe('statisticsHeading', () => {
  it.each([
    ['Software Engineer II', 'IN', 'Software Engineer II in India · INR'],
    ['Senior Data Scientist', 'NL', 'Senior Data Scientist in the Netherlands · EUR'],
    ['Accountant', 'GB', 'Accountant in the United Kingdom · GBP'],
  ] as const)('names %s in %s with its currency', (jobTitle, country, heading) => {
    expect(statisticsHeading({ jobTitle, country })).toBe(heading);
  });
});
