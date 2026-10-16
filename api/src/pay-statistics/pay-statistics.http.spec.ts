import { payStatisticsResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/pay-statistics', () => {
  const t = useTestApp();

  it("answers with the statistics of the job title in the country asked for, in that country's currency", async () => {
    const peer = { jobTitle: 'Data Scientist', country: 'BR' } as const;
    insertEmployee(t.db, { ...peer, annualSalaryMinor: 180_000_00 });
    insertEmployee(t.db, { ...peer, department: 'Data', annualSalaryMinor: 240_000_00 });
    // Same title elsewhere, and another title here: neither is a peer.
    insertEmployee(t.db, { jobTitle: 'Data Scientist', country: 'IN', annualSalaryMinor: 1_00 });
    insertEmployee(t.db, { jobTitle: 'Data Analyst', country: 'BR', annualSalaryMinor: 9_000_000_00 });

    const res = await t.http().get('/api/pay-statistics').query(peer).expect(200);

    const statistics = payStatisticsResponseSchema.parse(res.body);
    expect(statistics).toMatchObject({
      jobTitle: 'Data Scientist',
      country: 'BR',
      headcount: 2,
      smallGroup: true,
      min: { amountMinor: 180_000_00, currency: 'BRL' },
      max: { amountMinor: 240_000_00, currency: 'BRL' },
    });
  });
});
