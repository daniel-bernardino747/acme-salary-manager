import { exchangeRates, type OutliersQuery, type OutliersResponse } from '@acme/contract';
import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../database.module';
import { findOutliers } from '../domain/outliers';
import type { Db } from '../persistence/db';
import { peerGroupMembers } from '../persistence/peer-group-members';

/**
 * Question 4: one repository read, one domain function (ADR 0002, *Module seams*). Being an outlier
 * is a domain decision, not SQL, so the read covers every peer group the filters touch.
 */
@Injectable()
export class OutliersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list({ page, pageSize, direction, ...filters }: OutliersQuery): OutliersResponse {
    const { outliers, smallGroupHeadcount, costToReachThreshold } = findOutliers(
      peerGroupMembers(this.db, filters),
      direction,
    );
    // Pagination is in memory: the domain ranked every outlier, so the page is a slice of it.
    const items = outliers.slice((page - 1) * pageSize, page * pageSize);
    const listed = { items, page, pageSize, total: outliers.length, smallGroupHeadcount };
    if (direction !== 'below') {
      return listed;
    }
    // Only an underpaid list has one cost, over every page, with the rates that converted it.
    return {
      ...listed,
      costToReachThreshold: { usd: costToReachThreshold },
      rates: { source: exchangeRates.source, asOf: exchangeRates.asOf },
    };
  }
}
