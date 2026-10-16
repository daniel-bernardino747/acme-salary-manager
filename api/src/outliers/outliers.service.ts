import type { OutliersQuery, OutliersResponse } from '@acme/contract';
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
    const { outliers, smallGroupHeadcount } = findOutliers(
      peerGroupMembers(this.db, filters),
      direction,
    );
    return { items: outliers, page, pageSize, total: outliers.length, smallGroupHeadcount };
  }
}
