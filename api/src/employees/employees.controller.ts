import {
  employeeListQuerySchema,
  type EmployeeListQuery,
  type EmployeeListResponse,
} from '@acme/contract';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { DB } from '../database.module';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import type { Db } from '../persistence/db';
import { listEmployees } from '../persistence/list-employees';

@Controller('employees')
export class EmployeesController {
  constructor(@Inject(DB) private readonly db: Db) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(employeeListQuerySchema)) query: EmployeeListQuery,
  ): EmployeeListResponse {
    const { items, total } = listEmployees(this.db, query);
    return { items, page: query.page, pageSize: query.pageSize, total };
  }
}
