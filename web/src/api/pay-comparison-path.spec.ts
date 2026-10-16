import { describe, expect, it } from 'vitest';
import { payComparisonPath } from './pay-comparison-path';

describe('payComparisonPath', () => {
  it('asks for the job title picked', () => {
    expect(payComparisonPath({ jobTitle: 'Senior Data Scientist' })).toBe(
      '/api/pay-comparison?jobTitle=Senior+Data+Scientist',
    );
  });

  it('is null, so nothing is fetched, until a job title is picked', () => {
    expect(payComparisonPath({})).toBeNull();
  });
});
