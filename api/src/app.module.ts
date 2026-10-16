import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database.module';
import { EmployeesController } from './employees/employees.controller';
import { HealthController } from './health/health.controller';
import { ProblemFilter } from './http/problem.filter';
import { OutliersController } from './outliers/outliers.controller';
import { OutliersService } from './outliers/outliers.service';
import { PayComparisonController } from './pay-comparison/pay-comparison.controller';
import { PayComparisonService } from './pay-comparison/pay-comparison.service';
import { PayStatisticsController } from './pay-statistics/pay-statistics.controller';
import { PayStatisticsService } from './pay-statistics/pay-statistics.service';
import { PayrollTotalsController } from './payroll-totals/payroll-totals.controller';
import { PayrollTotalsService } from './payroll-totals/payroll-totals.service';

export interface AppOptions {
  databasePath: string;
}

@Module({})
export class AppModule {
  static forRoot(options: AppOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.forRoot(options.databasePath)],
      controllers: [
        HealthController,
        EmployeesController,
        PayStatisticsController,
        PayrollTotalsController,
        PayComparisonController,
        OutliersController,
      ],
      providers: [
        { provide: APP_FILTER, useClass: ProblemFilter },
        PayStatisticsService,
        PayrollTotalsService,
        PayComparisonService,
        OutliersService,
      ],
    };
  }
}
