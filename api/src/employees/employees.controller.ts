import {
  employeeListQuerySchema,
  type EmployeeListQuery,
  type EmployeeListResponse,
  type EmployeeResponse,
} from '@acme/contract';
import { Controller, Get, Inject, NotFoundException, Param, Query } from '@nestjs/common';
import { DB } from '../database.module';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import type { Db } from '../persistence/db';
import { findEmployee } from '../persistence/find-employee';
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

  @Get(':id')
  view(@Param('id') id: string): EmployeeResponse {
    const employee = findEmployee(this.db, Number(id));
    if (!employee) throw new NotFoundException(`Employee ${id} does not exist`);
    return employee;
  }
}
