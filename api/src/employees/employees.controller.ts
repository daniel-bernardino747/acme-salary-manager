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
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DB } from '../database.module';
import { ZodValidationPipe } from '../http/zod-validation.pipe';
import { createEmployee } from '../persistence/create-employee';
import type { Db } from '../persistence/db';
import { deleteEmployee } from '../persistence/delete-employee';
import { findEmployee } from '../persistence/find-employee';
import { listEmployees } from '../persistence/list-employees';
import { replaceEmployee } from '../persistence/replace-employee';

/** The `:id` of every single-employee route: a positive integer, or a 400 (ADR 0003). */
const employeeId = new ZodValidationPipe(employeeIdSchema);
const employeeBody = new ZodValidationPipe(employeeRequestSchema);

function employeeNotFound(id: number): NotFoundException {
  return new NotFoundException(`Employee ${id} does not exist`);
}

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
  view(@Param('id', employeeId) id: number): EmployeeResponse {
    const employee = findEmployee(this.db, id);
    if (!employee) throw employeeNotFound(id);
    return employee;
  }

  @Post()
  add(
    @Body(employeeBody) body: EmployeeRequest,
    @Res({ passthrough: true }) res: Response,
  ): EmployeeResponse {
    const employee = createEmployee(this.db, body);
    res.location(`/api/employees/${employee.id}`);
    return employee;
  }

  @Put(':id')
  edit(
    @Param('id', employeeId) id: number,
    @Body(employeeBody) body: EmployeeRequest,
  ): EmployeeResponse {
    const employee = replaceEmployee(this.db, id, body);
    if (!employee) throw employeeNotFound(id);
    return employee;
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', employeeId) id: number): void {
    if (!deleteEmployee(this.db, id)) throw employeeNotFound(id);
  }
}
