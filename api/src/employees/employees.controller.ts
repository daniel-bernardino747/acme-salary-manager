import {
  employeeIdSchema,
  employeeListQuerySchema,
  employeeRequestSchema,
  type EmployeeListQuery,
  type EmployeeListResponse,
  type EmployeeRequest,
  type EmployeeResponse,
} from '@acme/contract';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DB } from '../database.module';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { createEmployee } from '../persistence/create-employee';
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
  view(@Param('id', new ZodValidationPipe(employeeIdSchema)) id: number): EmployeeResponse {
    const employee = findEmployee(this.db, id);
    if (!employee) throw new NotFoundException(`Employee ${id} does not exist`);
    return employee;
  }

  @Post()
  add(
    @Body(new ZodValidationPipe(employeeRequestSchema)) body: EmployeeRequest,
    @Res({ passthrough: true }) res: Response,
  ): EmployeeResponse {
    const employee = createEmployee(this.db, body);
    res.location(`/api/employees/${employee.id}`);
    return employee;
  }
}
