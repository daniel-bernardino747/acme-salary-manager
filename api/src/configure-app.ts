import path from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

export interface ConfigureOptions {
  /** The built web app's folder. Omitted, the app serves only `/api`. */
  webRoot?: string;
}

/** App-wide setup shared by `main.ts` and the HTTP tests. */
export function configureApp(app: NestExpressApplication, options: ConfigureOptions = {}): void {
  app.setGlobalPrefix('api');
  if (options.webRoot) {
    serveWebApp(app, options.webRoot);
  }
}

/**
 * Serves the SPA's files, and its `index.html` for any other path outside `/api`, so deep links
 * open the app while an unknown `/api` route still reaches the JSON 404 (ADR 0003, *Endpoints*).
 */
function serveWebApp(app: NestExpressApplication, webRoot: string): void {
  const indexHtml = path.join(webRoot, 'index.html');
  app.useStaticAssets(webRoot);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isPage = req.method === 'GET' || req.method === 'HEAD';
    const isApi = req.path === '/api' || req.path.startsWith('/api/');
    if (isPage && !isApi) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}
