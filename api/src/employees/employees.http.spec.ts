import { employeeListResponseSchema, employeeResponseSchema, problemSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';
import { clearEmployees } from '../persistence/clear-employees';

const t = useTestApp();

describe('GET /api/employees', () => {
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

/** A valid add or edit body. */
const priya = {
  name: 'Priya Sharma',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalaryMinor: 1_250_000_50,
};

describe('the :id of /api/employees/:id', () => {
  it.each(['abc', '0', '-3', '2.5', '1e3', '0x10', '007', '9007199254740993'])(
    'answers %s with a 400 problem, since an id is a positive integer written plainly',
    async (id) => {
      insertEmployee(t.db);

      const res = await t.http().get(`/api/employees/${id}`).expect(400);

      expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
      const problem = problemSchema.parse(res.body);
      expect(problem).toMatchObject({
        title: 'Validation failed',
        status: 400,
        detail: 'Path parameter is invalid',
      });
      expect(problem.errors?.map((error) => error.message)).toEqual(['Must be a positive integer']);
    },
  );

  it.each(['put'] as const)('is checked by %s too', async (method) => {
    insertEmployee(t.db);

    const res = await t.http()[method]('/api/employees/0').send(priya).expect(400);

    expect(problemSchema.parse(res.body).detail).toBe('Path parameter is invalid');
  });
});

describe('POST /api/employees', () => {
  it('creates the employee and answers 201 with it and its Location', async () => {
    const res = await t.http().post('/api/employees').send(priya).expect(201);

    const created = employeeResponseSchema.parse(res.body);
    expect(created).toEqual({
      id: created.id,
      name: 'Priya Sharma',
      jobTitle: 'Software Engineer II',
      department: 'Engineering',
      country: 'IN',
      annualSalary: { amountMinor: 1_250_000_50, currency: 'INR' },
    });
    expect(res.headers.location).toBe(`/api/employees/${created.id}`);
    const stored = await t.http().get(`/api/employees/${created.id}`).expect(200);
    expect(employeeResponseSchema.parse(stored.body)).toEqual(created);
  });
});

describe('POST /api/employees with an invalid body', () => {
  it.each([
    ['a currency, which follows from the country', { ...priya, currency: 'INR' }, []],
    ['a missing field', { ...priya, annualSalaryMinor: undefined }, ['annualSalaryMinor']],
    ['a salary of 0', { ...priya, annualSalaryMinor: 0 }, ['annualSalaryMinor']],
    [
      'a salary above the cap',
      { ...priya, annualSalaryMinor: 900_000_000_001 },
      ['annualSalaryMinor'],
    ],
    ['a country not in the list', { ...priya, country: 'UK' }, ['country']],
    ['a department not in the list', { ...priya, department: 'Legal' }, ['department']],
    ['a job title not in the list', { ...priya, jobTitle: 'CEO' }, ['jobTitle']],
  ])('is a 400 problem naming the path of %s, and adds nobody', async (_, body, path) => {
    const res = await t.http().post('/api/employees').send(body).expect(400);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    const problem = problemSchema.parse(res.body);
    expect(problem).toMatchObject({
      title: 'Validation failed',
      status: 400,
      detail: 'Request body is invalid',
    });
    expect(problem.errors?.map((error) => error.path)).toEqual([path]);
    const list = await t.http().get('/api/employees').expect(200);
    expect(employeeListResponseSchema.parse(list.body).total).toBe(0);
  });

  it('names the unknown currency field in its message', async () => {
    const res = await t
      .http()
      .post('/api/employees')
      .send({ ...priya, currency: 'INR' })
      .expect(400);

    expect(problemSchema.parse(res.body).errors?.[0]?.message).toContain('currency');
  });
});

describe('PUT /api/employees/:id', () => {
  it('replaces every field and answers 200 with the employee', async () => {
    const { id } = insertEmployee(t.db, {
      name: 'Kenji Watanabe',
      jobTitle: 'Data Analyst',
      department: 'Data',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });

    const res = await t.http().put(`/api/employees/${id}`).send(priya).expect(200);

    const replaced = {
      id,
      name: 'Priya Sharma',
      jobTitle: 'Software Engineer II',
      department: 'Engineering',
      country: 'IN',
      annualSalary: { amountMinor: 1_250_000_50, currency: 'INR' },
    };
    expect(employeeResponseSchema.parse(res.body)).toEqual(replaced);
    const stored = await t.http().get(`/api/employees/${id}`).expect(200);
    expect(employeeResponseSchema.parse(stored.body)).toEqual(replaced);
  });

  it('answers an id with no employee with a 404 problem, and adds nobody', async () => {
    const removed = insertEmployee(t.db);
    clearEmployees(t.db);

    const res = await t.http().put(`/api/employees/${removed.id}`).send(priya).expect(404);

    expect(problemSchema.parse(res.body)).toMatchObject({ title: 'Not Found', status: 404 });
    const list = await t.http().get('/api/employees').expect(200);
    expect(employeeListResponseSchema.parse(list.body).total).toBe(0);
  });

  it('answers an invalid body with a 400 problem naming the path, and changes nothing', async () => {
    const kenji = insertEmployee(t.db, { name: 'Kenji Watanabe' });

    const res = await t
      .http()
      .put(`/api/employees/${kenji.id}`)
      .send({ ...priya, annualSalaryMinor: 0 })
      .expect(400);

    expect(problemSchema.parse(res.body).errors?.map((error) => error.path)).toEqual([
      ['annualSalaryMinor'],
    ]);
    const stored = await t.http().get(`/api/employees/${kenji.id}`).expect(200);
    expect(employeeResponseSchema.parse(stored.body).name).toBe('Kenji Watanabe');
  });
});

describe('DELETE /api/employees/:id', () => {
  it('removes the employee and answers 204 with no body', async () => {
    const { id } = insertEmployee(t.db);

    const res = await t.http().delete(`/api/employees/${id}`).expect(204);

    expect(res.text).toBe('');
    await t.http().get(`/api/employees/${id}`).expect(404);
  });

  it('answers an id with no employee with a 404 problem', async () => {
    const removed = insertEmployee(t.db);
    clearEmployees(t.db);

    const res = await t.http().delete(`/api/employees/${removed.id}`).expect(404);

    expect(problemSchema.parse(res.body)).toMatchObject({ title: 'Not Found', status: 404 });
  });
});
