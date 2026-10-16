import 'reflect-metadata';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { configureApp } from './configure-app';

// `web` builds next to `api` in the workspace; in dev, Vite serves the app instead.
const webRoot = path.join(__dirname, '..', '..', 'web', 'dist');

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot({ databasePath: config.databasePath }),
  );
  configureApp(app, { webRoot: existsSync(webRoot) ? webRoot : undefined });
  app.enableShutdownHooks();
  await app.listen(config.port);
}

void bootstrap();
