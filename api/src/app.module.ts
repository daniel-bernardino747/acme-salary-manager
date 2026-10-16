import { Module, type DynamicModule } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { HealthController } from './health/health.controller';

export interface AppOptions {
  databasePath: string;
}

@Module({})
export class AppModule {
  static forRoot(options: AppOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.forRoot(options.databasePath)],
      controllers: [HealthController],
    };
  }
}
