import {
  payComparisonQuerySchema,
  type PayComparisonQuery,
  type PayComparisonResponse,
} from '@acme/contract';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { PayComparisonService } from './pay-comparison.service';

@Controller('pay-comparison')
export class PayComparisonController {
  constructor(private readonly payComparison: PayComparisonService) {}

  @Get()
  get(
    @Query(new ZodValidationPipe(payComparisonQuerySchema)) query: PayComparisonQuery,
  ): PayComparisonResponse {
    return this.payComparison.forJobTitle(query);
  }
}
