import type { INestApplication, ModuleMetadata } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp, type ConfigureOptions } from '../src/configure-app';
import { DB } from '../src/database.module';
import { clearEmployees } from '../src/persistence/clear-employees';
import type { Db } from '../src/persistence/db';

export interface TestApp {
  app: INestApplication;
  /** The app's own `:memory:` database, taken from its container (ADR 0006). */
  db: Db;
  http: () => ReturnType<typeof request>;
}

/** Test-only controllers, and the built web app to serve, if the test needs one. */
export type TestAppOptions = Pick<ModuleMetadata, 'controllers'> & ConfigureOptions;

/** Boots one app per test file on a fresh `:memory:` database. */
export async function bootTestApp(options: TestAppOptions = {}): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot({ databasePath: ':memory:' })],
    controllers: options.controllers ?? [],
  }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
  configureApp(app, { webRoot: options.webRoot });
  await app.init();
  return { app, db: app.get<Db>(DB), http: () => request(app.getHttpServer()) };
}

/**
 * Registers the per-file lifecycle (ADR 0006): one app booted before all tests, an empty employees
 * table before each, and the app closed after all. Read the returned object inside tests only.
 */
export function useTestApp(options: TestAppOptions = {}): TestApp {
  const t = {} as TestApp;
  beforeAll(async () => {
    Object.assign(t, await bootTestApp(options));
  });
  beforeEach(() => clearEmployees(t.db));
  // If the boot failed there is no app; closing it must not bury the boot error under a TypeError.
  afterAll(() => t.app?.close());
  return t;
}
