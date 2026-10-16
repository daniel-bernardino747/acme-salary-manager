import { payStatisticsResponseSchema, problemSchema } from '@acme/contract';
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
    insertEmployee(t.db, {
      jobTitle: 'Data Analyst',
      country: 'BR',
      annualSalaryMinor: 9_000_000_00,
    });

    const res = await t.http().get('/api/pay-statistics').query(peer).expect(200);

    const statistics = payStatisticsResponseSchema.parse(res.body);
    expect(statistics).toMatchObject({
      jobTitle: 'Data Scientist',
      country: 'BR',
      headcount: 2,
      min: { amountMinor: 180_000_00, currency: 'BRL' },
      max: { amountMinor: 240_000_00, currency: 'BRL' },
    });
  });

  it('answers a valid job title and country with no employees with 200, headcount 0 and null figures', async () => {
    insertEmployee(t.db, { jobTitle: 'Data Scientist', country: 'BR' });

    const res = await t
      .http()
      .get('/api/pay-statistics')
      .query({ jobTitle: 'Data Scientist', country: 'JP' })
      .expect(200);

    expect(payStatisticsResponseSchema.parse(res.body)).toEqual({
      jobTitle: 'Data Scientist',
      country: 'JP',
      headcount: 0,
      smallGroup: false,
      min: null,
      median: null,
      average: null,
      max: null,
    });
  });

  it.each([
    ['a missing job title', { country: 'IN' }, ['jobTitle']],
    ['a missing country', { jobTitle: 'Data Scientist' }, ['country']],
    ['a job title not in the list', { jobTitle: 'Data Scientists', country: 'IN' }, ['jobTitle']],
    ['a country not in the list', { jobTitle: 'Data Scientist', country: 'UK' }, ['country']],
    ['an unknown parameter', { jobTitle: 'Data Scientist', country: 'IN', department: 'Data' }, []],
  ])('answers %s with a 400 problem', async (_, query, path) => {
    const res = await t.http().get('/api/pay-statistics').query(query).expect(400);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    const problem = problemSchema.parse(res.body);
    expect(problem).toMatchObject({
      title: 'Validation failed',
      status: 400,
      detail: 'Query is invalid',
    });
    expect(problem.errors?.map((error) => error.path)).toEqual([path]);
  });
});
