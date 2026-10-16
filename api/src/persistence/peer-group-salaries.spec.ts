import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { peerGroupSalaries } from './peer-group-salaries';

describe('peerGroupSalaries', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("reads the salaries of one job title in one country, in that country's currency", () => {
    const peer = { jobTitle: 'Data Scientist', country: 'IN' } as const;
    insertEmployee(db, { ...peer, department: 'Data', annualSalaryMinor: 3_100_000_00 });
    insertEmployee(db, { ...peer, department: 'Engineering', annualSalaryMinor: 2_900_000_00 });
    insertEmployee(db, { jobTitle: 'Data Analyst', country: 'IN', annualSalaryMinor: 1_000_00 });
    insertEmployee(db, { jobTitle: 'Data Scientist', country: 'BR', annualSalaryMinor: 2_000_00 });

    const group = peerGroupSalaries(db, peer);

    expect(group.currency).toBe('INR');
    expect([...group.salariesMinor].sort((a, b) => a - b)).toEqual([2_900_000_00, 3_100_000_00]);
  });

  it("gives an empty group no salaries, still in its country's currency", () => {
    insertEmployee(db, { jobTitle: 'Data Scientist', country: 'IN' });

    expect(peerGroupSalaries(db, { jobTitle: 'Data Scientist', country: 'JP' })).toEqual({
      currency: 'JPY',
      salariesMinor: [],
    });
  });
});
