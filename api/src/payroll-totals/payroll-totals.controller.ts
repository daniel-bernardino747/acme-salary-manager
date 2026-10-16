import {
  payrollTotalsQuerySchema,
  type PayrollTotalsQuery,
  type PayrollTotalsResponse,
} from '@acme/contract';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { PayrollTotalsService } from './payroll-totals.service';

@Controller('payroll-totals')
export class PayrollTotalsController {
  constructor(private readonly payrollTotals: PayrollTotalsService) {}

  @Get()
  get(
    // Nothing to read, but an unknown parameter is still a 400, never silently ignored.
    @Query(new ZodValidationPipe(payrollTotalsQuerySchema)) _query: PayrollTotalsQuery,
  ): PayrollTotalsResponse {
    return this.payrollTotals.get();
  }
}
