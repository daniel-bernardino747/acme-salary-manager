import { outliersResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/outliers', () => {
  const t = useTestApp();

  /** A peer group of 5 with a $10,000.00 median: one at 0.70, three on it and one at 1.10. */
  function insertGroupWithOneUnderpaid() {
    const group = { jobTitle: 'Product Manager', country: 'US', department: 'Product' } as const;
    const underpaid = insertEmployee(t.db, { ...group, annualSalaryMinor: 7_000_00 });
    for (const salary of [10_000_00, 10_000_00, 10_000_00, 11_000_00]) {
      insertEmployee(t.db, { ...group, annualSalaryMinor: salary });
    }
    return underpaid;
  }

  it('answers with the list envelope of outliers and the count of employees in small groups', async () => {
    const underpaid = insertGroupWithOneUnderpaid();
    // A peer group of 2, never checked.
    insertEmployee(t.db, { jobTitle: 'Recruiter', country: 'US', annualSalaryMinor: 1_00 });
    insertEmployee(t.db, { jobTitle: 'Recruiter', country: 'US', annualSalaryMinor: 90_000_00 });

    const res = await t.http().get('/api/outliers').expect(200);

    const page = outliersResponseSchema.parse(res.body);
    expect(page).toMatchObject({ page: 1, pageSize: 25, total: 1, smallGroupHeadcount: 2 });
    expect(page.items.map((o) => o.employee.id)).toEqual([underpaid.id]);
    expect(page.items[0]).toMatchObject({
      peerMedian: { amountMinor: 10_000_00, currency: 'USD' },
      peerHeadcount: 5,
      compaRatioHundredths: 70,
      direction: 'below',
    });
  });
});
