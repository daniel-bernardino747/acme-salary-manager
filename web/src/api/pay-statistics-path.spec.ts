import { describe, expect, it } from 'vitest';
import { payStatisticsPath } from './pay-statistics-path';

describe('payStatisticsPath', () => {
  it('asks for the job title and the country picked', () => {
    expect(payStatisticsPath({ jobTitle: 'Senior Data Scientist', country: 'NL' })).toBe(
      '/api/pay-statistics?jobTitle=Senior+Data+Scientist&country=NL',
    );
  });

  it.each([
    ['nothing', {}],
    ['only a job title', { jobTitle: 'Data Scientist' as const }],
    ['only a country', { country: 'IN' as const }],
  ])('is null, so nothing is fetched, with %s picked', (_, search) => {
    expect(payStatisticsPath(search)).toBeNull();
  });
});
