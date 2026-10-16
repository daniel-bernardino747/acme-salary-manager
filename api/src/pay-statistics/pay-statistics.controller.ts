import {
  payStatisticsQuerySchema,
  type PayStatisticsQuery,
  type PayStatisticsResponse,
} from '@acme/contract';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { PayStatisticsService } from './pay-statistics.service';

@Controller('pay-statistics')
export class PayStatisticsController {
  constructor(private readonly payStatistics: PayStatisticsService) {}

  @Get()
  get(
    @Query(new ZodValidationPipe(payStatisticsQuerySchema)) query: PayStatisticsQuery,
  ): PayStatisticsResponse {
    return this.payStatistics.forPeerGroup(query);
  }
}
