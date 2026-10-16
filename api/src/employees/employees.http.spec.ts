import { employeeListResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/employees', () => {
  const t = useTestApp();

  it('returns the first page of 25 in the list envelope', async () => {
    const zoe = insertEmployee(t.db, { name: 'Zoë Visser', country: 'NL' });
    const kenji = insertEmployee(t.db, {
      name: 'Kenji Watanabe',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });

    const res = await t.http().get('/api/employees').expect(200);

    const list = employeeListResponseSchema.parse(res.body);
    expect(list).toMatchObject({ page: 1, pageSize: 25, total: 2 });
    expect(list.items.map((employee) => employee.id)).toEqual([kenji.id, zoe.id]);
    expect(list.items[0]?.annualSalary).toEqual({ amountMinor: 7_000_000, currency: 'JPY' });
  });
});
