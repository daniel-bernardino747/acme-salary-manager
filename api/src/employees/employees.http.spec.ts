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

  it('returns the page and page size asked for, up to 100', async () => {
    const [, , carla] = ['Ana Costa', 'Bruno Lima', 'Carla Dias'].map(
      (name) => insertEmployee(t.db, { name }).id,
    );

    const res = await t.http().get('/api/employees?page=2&pageSize=2').expect(200);
    const list = employeeListResponseSchema.parse(res.body);
    expect(list).toMatchObject({ page: 2, pageSize: 2, total: 3 });
    expect(list.items.map((employee) => employee.id)).toEqual([carla]);

    const largest = await t.http().get('/api/employees?pageSize=100').expect(200);
    expect(employeeListResponseSchema.parse(largest.body)).toMatchObject({ pageSize: 100 });
  });

  it('combines the country, department and job title filters with AND', async () => {
    const match = insertEmployee(t.db, {
      country: 'GB',
      department: 'Data',
      jobTitle: 'Data Analyst',
    }).id;
    insertEmployee(t.db, { country: 'US', department: 'Data', jobTitle: 'Data Analyst' });
    insertEmployee(t.db, { country: 'GB', department: 'Finance', jobTitle: 'Data Analyst' });
    insertEmployee(t.db, { country: 'GB', department: 'Data', jobTitle: 'Data Scientist' });

    const res = await t
      .http()
      .get('/api/employees')
      .query({ country: 'GB', department: 'Data', jobTitle: 'Data Analyst' })
      .expect(200);

    const list = employeeListResponseSchema.parse(res.body);
    expect(list.total).toBe(1);
    expect(list.items.map((employee) => employee.id)).toEqual([match]);
  });

  it('answers a page past the end with 200 and no items', async () => {
    insertEmployee(t.db);

    const res = await t.http().get('/api/employees?page=3').expect(200);

    expect(employeeListResponseSchema.parse(res.body)).toEqual({
      items: [],
      page: 3,
      pageSize: 25,
      total: 1,
    });
  });
});
