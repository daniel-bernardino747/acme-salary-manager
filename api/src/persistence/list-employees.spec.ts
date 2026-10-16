import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { listEmployees } from './list-employees';

const firstPage = { page: 1, pageSize: 25 };

describe('listEmployees', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("lists employees by name, each salary as Money in its country's currency, with the total", () => {
    const zoe = insertEmployee(db, {
      name: 'Zoë Visser',
      jobTitle: 'Data Analyst',
      department: 'Data',
      country: 'NL',
      annualSalaryMinor: 64_000_00,
    });
    const kenji = insertEmployee(db, {
      name: 'Kenji Watanabe',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });

    expect(listEmployees(db, firstPage)).toEqual({
      items: [
        {
          id: kenji.id,
          name: 'Kenji Watanabe',
          jobTitle: 'Software Engineer II',
          department: 'Engineering',
          country: 'JP',
          annualSalary: { amountMinor: 7_000_000, currency: 'JPY' },
        },
        {
          id: zoe.id,
          name: 'Zoë Visser',
          jobTitle: 'Data Analyst',
          department: 'Data',
          country: 'NL',
          annualSalary: { amountMinor: 64_000_00, currency: 'EUR' },
        },
      ],
      total: 2,
    });
  });

  it('pages through employees whose names tie in id order, never repeating or skipping one', () => {
    // Inserted out of name order, with three Ana Costas.
    const ids = ['Ana Costa', 'Bruno Lima', 'Ana Costa', 'Ana Costa', 'Aarav Shah'].map(
      (name) => insertEmployee(db, { name }).id,
    );
    const [ana1, bruno, ana2, ana3, aarav] = ids;
    const pageIds = (page: number) =>
      listEmployees(db, { page, pageSize: 2 }).items.map((employee) => employee.id);

    expect([pageIds(1), pageIds(2), pageIds(3)]).toEqual([[aarav, ana1], [ana2, ana3], [bruno]]);
    expect(listEmployees(db, { page: 2, pageSize: 2 }).total).toBe(5);
  });

  it('combines the country, department and job title filters with AND, and counts only matches', () => {
    const match = insertEmployee(db, {
      country: 'IN',
      department: 'Data',
      jobTitle: 'Data Scientist',
    }).id;
    insertEmployee(db, { country: 'BR', department: 'Data', jobTitle: 'Data Scientist' });
    insertEmployee(db, { country: 'IN', department: 'Product', jobTitle: 'Data Scientist' });
    insertEmployee(db, { country: 'IN', department: 'Data', jobTitle: 'Data Analyst' });
    const ids = (filters: Parameters<typeof listEmployees>[1]) => {
      const list = listEmployees(db, filters);
      return { ids: list.items.map((employee) => employee.id), total: list.total };
    };

    expect(
      ids({ ...firstPage, country: 'IN', department: 'Data', jobTitle: 'Data Scientist' }),
    ).toEqual({ ids: [match], total: 1 });
    expect(ids({ ...firstPage, country: 'IN' }).total).toBe(3);
    expect(ids({ ...firstPage, department: 'Data' }).total).toBe(3);
    expect(ids({ ...firstPage, jobTitle: 'Data Scientist' }).total).toBe(3);
    expect(ids({ ...firstPage, country: 'JP' })).toEqual({ ids: [], total: 0 });
  });

  it('searches names by the prefix of each word, with the filters, and counts only matches', () => {
    const priya = insertEmployee(db, { name: 'Priya Sharma' }).id;
    insertEmployee(db, { name: 'Priya Sharma', country: 'BR' });
    insertEmployee(db, { name: 'Priyanka Patel' });
    insertEmployee(db, { name: 'Rohan Sharma' });
    const search = (query: Parameters<typeof listEmployees>[1]) => {
      const list = listEmployees(db, query);
      return { ids: list.items.map((employee) => employee.id), total: list.total };
    };

    expect(search({ ...firstPage, q: 'pri sha', country: 'IN' })).toEqual({
      ids: [priya],
      total: 1,
    });
    expect(search({ ...firstPage, q: 'pri' }).total).toBe(3);
    expect(search({ ...firstPage, q: 'nobody' })).toEqual({ ids: [], total: 0 });
  });

  it('treats an empty or whitespace-only search as no search', () => {
    insertEmployee(db, { name: 'Priya Sharma' });
    insertEmployee(db, { name: 'Rohan Mehta' });

    expect(listEmployees(db, { ...firstPage, q: '' }).total).toBe(2);
    expect(listEmployees(db, { ...firstPage, q: '   ' }).total).toBe(2);
  });

  it('returns no items for a page past the end, with the total still counted', () => {
    insertEmployee(db);

    expect(listEmployees(db, { page: 2, pageSize: 25 })).toEqual({ items: [], total: 1 });
  });
});
