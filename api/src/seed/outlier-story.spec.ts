import { currencyOf } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { plantedCostToReachThreshold } from '../../test/seed-story';
import { compaRatioHundredths } from '../domain/compa-ratio';
import { costToReachThreshold, findOutliers, type PeerGroupMember } from '../domain/outliers';
import { median } from '../domain/statistics';
import { inCell } from './cell';
import { generateEmployees } from './generate-employees';
import { boundaryPlants } from './plants';

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

  it('flags neither boundary plant, whose compa-ratios are exactly 80 and 120 hundredths, shown as "0.80" and "1.20"', () => {
    const flaggedIds = new Set(findOutliers(everyone).outliers.map((o) => o.employee.id));

    for (const plant of boundaryPlants) {
      const { employee } = everyone[generated.findIndex((g) => g.plant === plant)] ?? {};
      const group = everyone.filter((m) => inCell(plant.jobTitle, plant.country)(m.employee));
      const peerMedian = median(group.map((m) => m.employee.annualSalary.amountMinor));

      expect(employee && peerMedian).toBeTruthy();
      expect(flaggedIds.has(employee?.id ?? 0)).toBe(false);
      expect(compaRatioHundredths(employee?.annualSalary.amountMinor ?? 0, peerMedian ?? 1)).toBe(
        plant.ratioHundredths,
      );
    }
  });

  it('costs the sum of the planted underpaid gaps to bring everyone underpaid to 0.80', () => {
    const { outliers } = findOutliers(everyone, 'below');

    expect(costToReachThreshold(outliers)).toEqual(plantedCostToReachThreshold());
  });
});
