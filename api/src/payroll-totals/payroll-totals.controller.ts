import type { PayrollTotalsResponse } from '@acme/contract';
import { Controller, Get } from '@nestjs/common';
import { PayrollTotalsService } from './payroll-totals.service';

@Controller('payroll-totals')
export class PayrollTotalsController {
  constructor(private readonly payrollTotals: PayrollTotalsService) {}

  @Get()
  get(): PayrollTotalsResponse {
    return this.payrollTotals.get();
  }
}
