import { exchangeRates, type PayrollTotalsResponse } from '@acme/contract';
import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../database.module';
import { payrollTotals } from '../domain/payroll-totals';
import type { Db } from '../persistence/db';
import { payrollEmployees } from '../persistence/payroll-employees';

/** Question 2: one repository read, one domain function (ADR 0002, *Module seams*). */
@Injectable()
export class PayrollTotalsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  get(): PayrollTotalsResponse {
    // Every response with a USD figure says which rate table produced it (ADR 0003).
    const rates = { source: exchangeRates.source, asOf: exchangeRates.asOf };
    return { ...payrollTotals(payrollEmployees(this.db)), rates };
  }
}
