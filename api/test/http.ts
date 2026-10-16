import type { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { DB } from '../src/database.module';
import type { Db } from '../src/persistence/db';

export interface TestApp {
  app: INestApplication;
  /** The app's own `:memory:` database, taken from its container (ADR 0006). */
  db: Db;
  http: () => ReturnType<typeof request>;
}

/** Boots one app per test file on a fresh `:memory:` database, plus any test-only controllers. */
export async function bootTestApp(
  extra: Pick<ModuleMetadata, 'controllers'> = {},
): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot({ databasePath: ':memory:' })],
    controllers: extra.controllers ?? [],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  return { app, db: app.get<Db>(DB), http: () => request(app.getHttpServer()) };
}
