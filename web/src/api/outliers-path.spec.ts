import { describe, expect, it } from 'vitest';
import { outliersPath } from './outliers-path';

describe('outliersPath', () => {
  it('asks for the page at the fixed page size of 25, in the direction picked', () => {
    expect(outliersPath({ page: 2, direction: 'below' })).toBe(
      '/api/outliers?page=2&pageSize=25&direction=below',
    );
    expect(outliersPath({ page: 1, direction: 'above' })).toBe(
      '/api/outliers?page=1&pageSize=25&direction=above',
    );
  });

  it('leaves out the direction for All, which ranks both together', () => {
    expect(outliersPath({ page: 1, direction: 'all' })).toBe('/api/outliers?page=1&pageSize=25');
  });

  it('passes every filter set', () => {
    expect(
      outliersPath({
        page: 1,
        direction: 'below',
        country: 'GB',
        department: 'Customer Support',
        jobTitle: 'Support Team Lead',
      }),
    ).toBe(
      '/api/outliers?page=1&pageSize=25&direction=below&country=GB&department=Customer+Support&jobTitle=Support+Team+Lead',
    );
  });
});
