import type { EmployeeResponse, Money } from '@acme/contract';
import { compaRatioHundredths, isBelowThreshold } from './compa-ratio';
import { median } from './statistics';

/** Below 0.80 is underpaid, above 1.20 overpaid: the outlier's direction (CONTEXT.md). */
export type OutlierDirection = 'below' | 'above';

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
}

export interface OutlierFindings {
  outliers: Outlier[];
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
 * shown, is strictly below 0.80 (ADR 0001, *Outliers*).
 */
export function findOutliers(members: readonly PeerGroupMember[]): OutlierFindings {
  const outliers: Outlier[] = [];
  for (const group of peerGroups(members)) {
    const peerMedian = median(group.map((m) => m.employee.annualSalary.amountMinor));
    if (peerMedian === null) {
      continue;
    }
    for (const { employee, shown } of group) {
      const salary = employee.annualSalary.amountMinor;
      if (shown && isBelowThreshold(salary, peerMedian)) {
        outliers.push({
          employee,
          peerMedian: { amountMinor: peerMedian, currency: employee.annualSalary.currency },
          peerHeadcount: group.length,
          compaRatioHundredths: compaRatioHundredths(salary, peerMedian),
          direction: 'below',
        });
      }
    }
  }
  return { outliers };
}
