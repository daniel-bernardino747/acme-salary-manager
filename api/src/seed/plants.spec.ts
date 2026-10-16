import { countries } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { homeDepartment } from './home-departments';
import { boundaryPlants, plantedOutliers } from './plants';
import { headcountQuotas } from './quotas';

const quotas = headcountQuotas();
const groupSize = (p: { jobTitle: string; country: string }) =>
  quotas.find((q) => q.jobTitle === p.jobTitle && q.country === p.country)?.count ?? 0;

describe('plantedOutliers', () => {
  const underpaid = plantedOutliers.filter((p) => p.direction === 'below');
  const overpaid = plantedOutliers.filter((p) => p.direction === 'above');

  it('are 14 underpaid and 6 overpaid, with targets well clear of the boundaries', () => {
    expect(underpaid).toHaveLength(14);
    expect(overpaid).toHaveLength(6);
    for (const p of underpaid) {
      expect(p.targetHundredths).toBeGreaterThanOrEqual(62);
      expect(p.targetHundredths).toBeLessThanOrEqual(76);
    }
    for (const p of overpaid) {
      expect(p.targetHundredths).toBeGreaterThanOrEqual(126);
      expect(p.targetHundredths).toBeLessThanOrEqual(155);
    }
  });

  it('sit only in groups of 5 or more, across all 7 countries and at least 5 departments', () => {
    expect(plantedOutliers.every((p) => groupSize(p) >= 5)).toBe(true);
    expect(new Set(plantedOutliers.map((p) => p.country))).toEqual(
      new Set(countries.map((c) => c.code)),
    );
    expect(
      new Set(plantedOutliers.map((p) => homeDepartment[p.jobTitle])).size,
    ).toBeGreaterThanOrEqual(5);
  });

  it('include one underpaid Senior Data Scientist in the Netherlands, the smallest checked group', () => {
    expect(
      underpaid.filter((p) => p.jobTitle === 'Senior Data Scientist' && p.country === 'NL'),
    ).toHaveLength(1);
    expect(groupSize({ jobTitle: 'Senior Data Scientist', country: 'NL' })).toBe(5);
  });
});

describe('boundaryPlants', () => {
  it('are one at exactly 0.80 and one at exactly 1.20, each in an odd-sized group of 5 or more', () => {
    expect(boundaryPlants.map((p) => p.ratioHundredths)).toEqual([80, 120]);
    for (const p of boundaryPlants) {
      expect(groupSize(p)).toBeGreaterThanOrEqual(5);
      expect(groupSize(p) % 2).toBe(1);
    }
  });
});
