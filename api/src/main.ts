import 'reflect-metadata';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { exchangeRates } from '@acme/contract';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { configureApp } from './configure-app';
import { assertRateTable } from './domain/rate-table';

// `web` builds next to `api` in the workspace; in dev, Vite serves the app instead.
const webRoot = path.join(__dirname, '..', '..', 'web', 'dist');

async function bootstrap(): Promise<void> {
  assertRateTable(exchangeRates.ratesPerUsd);
  const config = loadConfig(process.env);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot({ databasePath: config.databasePath }),
  );
  const hasWebApp = existsSync(webRoot);
  if (!hasWebApp) {
    new Logger('Bootstrap').warn(
      `No built web app at ${webRoot}: serving /api only. Run the root build (in dev, Vite serves it).`,
    );
  }
  configureApp(app, { webRoot: hasWebApp ? webRoot : undefined });
  app.enableShutdownHooks();
  await app.listen(config.port);
}

void bootstrap();
