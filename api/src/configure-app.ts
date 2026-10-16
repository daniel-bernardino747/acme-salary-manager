import type { INestApplication } from '@nestjs/common';

/** App-wide setup shared by `main.ts` and the HTTP tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
}
