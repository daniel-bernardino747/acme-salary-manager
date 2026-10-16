import { exchangeRates, type PayComparisonQuery, type PayComparisonResponse } from '@acme/contract';
import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../database.module';
import { payComparison } from '../domain/pay-comparison';
import type { Db } from '../persistence/db';
import { jobTitleSalaries } from '../persistence/job-title-salaries';

/** Question 3: one repository read, one domain function (ADR 0002, *Module seams*). */
@Injectable()
export class PayComparisonService {
  constructor(@Inject(DB) private readonly db: Db) {}

  forJobTitle({ jobTitle }: PayComparisonQuery): PayComparisonResponse {
    // Every response with a USD figure says which rate table produced it (ADR 0003).
    const rates = { source: exchangeRates.source, asOf: exchangeRates.asOf };
    return { jobTitle, rows: payComparison(jobTitleSalaries(this.db, jobTitle)), rates };
  }
}
