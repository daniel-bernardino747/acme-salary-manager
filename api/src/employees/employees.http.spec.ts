import {
  employeeListResponseSchema,
  employeeResponseSchema,
  problemSchema,
} from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';
import { clearEmployees } from '../persistence/clear-employees';

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

  it('searches names with q, trimmed', async () => {
    const priya = insertEmployee(t.db, { name: 'Priya Sharma' }).id;
    insertEmployee(t.db, { name: 'Rohan Mehta' });

    const res = await t.http().get('/api/employees').query({ q: '  pri sha  ' }).expect(200);

    const list = employeeListResponseSchema.parse(res.body);
    expect(list.total).toBe(1);
    expect(list.items.map((employee) => employee.id)).toEqual([priya]);
  });

  it('takes an empty or whitespace-only q as no search', async () => {
    insertEmployee(t.db, { name: 'Priya Sharma' });
    insertEmployee(t.db, { name: 'Rohan Mehta' });

    for (const q of ['', '   ']) {
      const res = await t.http().get('/api/employees').query({ q }).expect(200);
      expect(employeeListResponseSchema.parse(res.body).total).toBe(2);
    }
  });

  it('takes a q of up to 100 characters once trimmed', async () => {
    await t
      .http()
      .get('/api/employees')
      .query({ q: ` ${'x'.repeat(100)} ` })
      .expect(200);
  });

  it.each([
    ['a page that is not a number', { page: 'two' }, ['page']],
    ['a page that is not an integer', { page: '2.5' }, ['page']],
    ['a page below 1', { page: '0' }, ['page']],
    ['a page size of 0', { pageSize: '0' }, ['pageSize']],
    ['a page size over 100', { pageSize: '101' }, ['pageSize']],
    ['an unknown parameter', { contry: 'IN' }, []],
    ['a country not in the list', { country: 'UK' }, ['country']],
    ['a department not in the list', { department: 'Legal' }, ['department']],
    ['a job title not in the list', { jobTitle: 'Software Engineers' }, ['jobTitle']],
    ['a q over 100 characters once trimmed', { q: 'x'.repeat(101) }, ['q']],
  ])('answers %s with a 400 problem', async (_, query, path) => {
    const res = await t.http().get('/api/employees').query(query).expect(400);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    const problem = problemSchema.parse(res.body);
    expect(problem).toMatchObject({
      title: 'Validation failed',
      status: 400,
      detail: 'Query is invalid',
    });
    expect(problem.errors?.map((error) => error.path)).toEqual([path]);
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

describe('GET /api/employees/:id', () => {
  const t = useTestApp();

  it("returns the employee with the salary in its country's currency", async () => {
    const kenji = insertEmployee(t.db, {
      name: 'Kenji Watanabe',
      jobTitle: 'Data Analyst',
      department: 'Data',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });

    const res = await t.http().get(`/api/employees/${kenji.id}`).expect(200);

    expect(employeeResponseSchema.parse(res.body)).toEqual({
      id: kenji.id,
      name: 'Kenji Watanabe',
      jobTitle: 'Data Analyst',
      department: 'Data',
      country: 'JP',
      annualSalary: { amountMinor: 7_000_000, currency: 'JPY' },
    });
  });

  it('answers an id with no employee with a 404 problem', async () => {
    const removed = insertEmployee(t.db);
    clearEmployees(t.db);

    const res = await t.http().get(`/api/employees/${removed.id}`).expect(404);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(problemSchema.parse(res.body)).toMatchObject({ title: 'Not Found', status: 404 });
  });
});
