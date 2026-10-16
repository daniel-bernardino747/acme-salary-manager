import { currencyOf } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { findOutliers, type PeerGroupMember } from '../domain/outliers';
import { generateEmployees } from './generate-employees';

// ADR 0005, *Tests*, *The story*: question 4 on the full seed finds exactly what was planted.

const generated = generateEmployees();

/** Every seeded employee, as question 4 reads them. Ids follow the insertion order from 1. */
const everyone: PeerGroupMember[] = generated.map(({ employee }, index) => {
  const { annualSalaryMinor, ...rest } = employee;
  return {
    employee: {
      id: index + 1,
      ...rest,
      annualSalary: { amountMinor: annualSalaryMinor, currency: currencyOf(employee.country) },
    },
    shown: true,
  };
});

const byId = (a: { id: number }, b: { id: number }) => a.id - b.id;

describe('the outlier story on the full seed', () => {
  it('flags exactly the planted outliers, each in their planted direction', () => {
    const planted = generated.flatMap(({ plant }, index) =>
      plant && 'direction' in plant ? [{ id: index + 1, direction: plant.direction }] : [],
    );

    const flagged = findOutliers(everyone).outliers.map((o) => ({
      id: o.employee.id,
      direction: o.direction,
    }));

    expect(planted).toHaveLength(20);
    expect(flagged.toSorted(byId)).toEqual(planted);
  });
});
