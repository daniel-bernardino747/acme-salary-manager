import { outliersQuerySchema, type OutliersQuery, type OutliersResponse } from '@acme/contract';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { OutliersService } from './outliers.service';

@Controller('outliers')
export class OutliersController {
  constructor(private readonly outliers: OutliersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(outliersQuerySchema)) query: OutliersQuery): OutliersResponse {
    return this.outliers.list(query);
  }
}
