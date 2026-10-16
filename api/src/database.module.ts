import {
  Global,
  Inject,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { createDb, type Db } from './persistence/db';

/** Injection token for the app's migrated database. */
export const DB = Symbol('DB');

@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB) private readonly db: Db) {}

  static forRoot(databasePath: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [{ provide: DB, useFactory: () => createDb(databasePath) }],
      exports: [DB],
    };
  }

  onApplicationShutdown(): void {
    this.db.$client.close();
  }
}
