import type { PayStatisticsQuery, PayStatisticsResponse } from '@acme/contract';
import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../database.module';
import { payStatistics } from '../domain/pay-statistics';
import type { Db } from '../persistence/db';
import { peerGroupSalaries } from '../persistence/peer-group-salaries';

/** Question 1: one repository read, one domain function (ADR 0002, *Module seams*). */
@Injectable()
export class PayStatisticsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  forPeerGroup(group: PayStatisticsQuery): PayStatisticsResponse {
    return { ...group, ...payStatistics(peerGroupSalaries(this.db, group)) };
  }
}
