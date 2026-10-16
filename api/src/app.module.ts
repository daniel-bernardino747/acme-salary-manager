import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database.module';
import { EmployeesController } from './employees/employees.controller';
import { HealthController } from './health/health.controller';
import { ProblemFilter } from './http/problem.filter';
import { PayStatisticsController } from './pay-statistics/pay-statistics.controller';
import { PayStatisticsService } from './pay-statistics/pay-statistics.service';

export interface AppOptions {
  databasePath: string;
}

@Module({})
export class AppModule {
  static forRoot(options: AppOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.forRoot(options.databasePath)],
      controllers: [HealthController, EmployeesController, PayStatisticsController],
      providers: [{ provide: APP_FILTER, useClass: ProblemFilter }, PayStatisticsService],
    };
  }
}
