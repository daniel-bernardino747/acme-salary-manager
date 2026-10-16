import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create(AppModule.forRoot({ databasePath: config.databasePath }));
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(config.port);
}

void bootstrap();
