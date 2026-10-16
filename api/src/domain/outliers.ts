import {
  exchangeRates,
  type EmployeeResponse,
  type Money,
  type OutlierDirection,
} from '@acme/contract';
import { compaRatioHundredths, gapMinor, isAboveThreshold, isBelowThreshold } from './compa-ratio';
import { usdTotal, type RatesPerUsd, type UsdMoney } from './conversion';
import { isSmallGroup } from './pay-statistics';
import { median } from './statistics';

/**
 * An employee in one of the peer groups the filters touch. Every member counts towards their
 * group's median; only those who match the filters themselves are `shown` (ADR 0003, *Outliers*).
 */
export interface PeerGroupMember {
  employee: EmployeeResponse;
  shown: boolean;
}

/** An outlier as question 4 lists them (ADR 0003, *Money on the wire*). */
export interface Outlier {
  employee: EmployeeResponse;
  peerMedian: Money;
  peerHeadcount: number;
  compaRatioHundredths: number;
  direction: OutlierDirection;
  /** The gap to 0.80 in the peer group's currency, on underpaid rows only. */
  gapMinor: number | null;
}

export interface OutlierFindings {
  outliers: Outlier[];
  /** Shown employees whose peer group has fewer than 5, so they were not checked (ADR 0003). */
  smallGroupHeadcount: number;
  /** The cost to reach 0.80 over the underpaid outliers found, every page included. */
  costToReachThreshold: UsdMoney;
}

/** An employee's direction against their peer median, or `null` inside 0.80–1.20. */
function directionOf(salaryMinor: number, medianMinor: number): OutlierDirection | null {
  if (isBelowThreshold(salaryMinor, medianMinor)) return 'below';
  if (isAboveThreshold(salaryMinor, medianMinor)) return 'above';
  return null;
}

/**
 * Most extreme first: by distance from 1.00, compared by cross-multiplying, `|s₁−m₁|·m₂` against
 * `|s₂−m₂|·m₁` (ADR 0003, *Outliers*). The products can pass 2⁵³, so they are taken in BigInt.
 * Ties order by `name, id`, as the list does; names compare by code unit, as SQLite's default
 * collation does, so the order never depends on the machine's locale.
 */
function mostExtremeFirst(a: Outlier, b: Outlier): number {
  const distance = (o: Outlier) =>
    BigInt(Math.abs(o.employee.annualSalary.amountMinor - o.peerMedian.amountMinor));
  const aScaled = distance(a) * BigInt(b.peerMedian.amountMinor);
  const bScaled = distance(b) * BigInt(a.peerMedian.amountMinor);
  if (aScaled !== bScaled) {
    return aScaled > bScaled ? -1 : 1;
  }
  if (a.employee.name !== b.employee.name) {
    return a.employee.name < b.employee.name ? -1 : 1;
  }
  return a.employee.id - b.employee.id;
}

/** The members of each peer group, keyed by job title and country. */
function peerGroups(members: readonly PeerGroupMember[]): PeerGroupMember[][] {
  const groups = new Map<string, PeerGroupMember[]>();
  for (const member of members) {
    const key = `${member.employee.jobTitle}\u0000${member.employee.country}`;
    const group = groups.get(key);
    if (group) {
      group.push(member);
    } else {
      groups.set(key, [member]);
    }
  }
  return [...groups.values()];
}

/**
 * Question 4: the shown employees whose compa-ratio against their whole peer group's median, as
 * shown, is strictly below 0.80 or strictly above 1.20, in groups of 5 or more (ADR 0001,
 * *Outliers*), most extreme first. Asked for a direction, it ranks only that one, so the underpaid
 * are never buried under the overpaid (ADR 0003). The same pass counts the shown employees in
 * small groups, who were not checked, and costs bringing the underpaid found to 0.80.
 */
export function findOutliers(
  members: readonly PeerGroupMember[],
  only?: OutlierDirection,
  ratesPerUsd: RatesPerUsd = exchangeRates.ratesPerUsd,
): OutlierFindings {
  const outliers: Outlier[] = [];
  let smallGroupHeadcount = 0;
  for (const group of peerGroups(members)) {
    const peerMedian = median(group.map((m) => m.employee.annualSalary.amountMinor));
    // A small group's median isn't meaningful, so its members are never checked.
    if (peerMedian === null || isSmallGroup(group.length)) {
      smallGroupHeadcount += group.filter((m) => m.shown).length;
      continue;
    }
    for (const { employee, shown } of group) {
      const salary = employee.annualSalary.amountMinor;
      const direction = directionOf(salary, peerMedian);
      if (shown && direction !== null && (only === undefined || direction === only)) {
        outliers.push({
          employee,
          peerMedian: { amountMinor: peerMedian, currency: employee.annualSalary.currency },
          peerHeadcount: group.length,
          compaRatioHundredths: compaRatioHundredths(salary, peerMedian),
          direction,
          gapMinor: direction === 'below' ? gapMinor(salary, peerMedian) : null,
        });
      }
    }
  }
  return {
    outliers: outliers.sort(mostExtremeFirst),
    smallGroupHeadcount,
    costToReachThreshold: costToReachThreshold(outliers, ratesPerUsd),
  };
}

/**
 * The cost to reach 0.80: the sum of the underpaid outliers' gaps, each in their peer group's
 * currency, as a USD total, per currency and converted once (ADR 0003, *Money on the wire*).
 */
export function costToReachThreshold(
  outliers: readonly Pick<Outlier, 'gapMinor' | 'peerMedian'>[],
  ratesPerUsd: RatesPerUsd = exchangeRates.ratesPerUsd,
): UsdMoney {
  const gaps = outliers.flatMap(({ gapMinor, peerMedian }) =>
    gapMinor === null ? [] : [{ amountMinor: gapMinor, currency: peerMedian.currency }],
  );
  return usdTotal(gaps, ratesPerUsd);
}
