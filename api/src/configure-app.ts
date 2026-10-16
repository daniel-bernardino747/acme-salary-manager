import path from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { serverTiming } from './http/server-timing';

export interface ConfigureOptions {
  /** The built web app's folder. Omitted, the app serves only `/api`. */
  webRoot?: string;
}

/** Every endpoint lives under this prefix; the SPA gets every other path (ADR 0003). */
const API_PREFIX = 'api';

/** App-wide setup shared by `main.ts` and the HTTP tests. */
export function configureApp(app: NestExpressApplication, options: ConfigureOptions = {}): void {
  // First, before any other middleware, so the clock starts as the request arrives (ADR 0006).
  app.use(serverTiming);
  app.setGlobalPrefix(API_PREFIX);
  if (options.webRoot) {
    serveWebApp(app, options.webRoot);
  }
}

/**
 * Serves the SPA's files, and its `index.html` for any other page path outside `/api`, so deep links
 * open the app while an unknown `/api` route still reaches the JSON 404 (ADR 0003, *Endpoints*).
 */
function serveWebApp(app: NestExpressApplication, webRoot: string): void {
  const indexHtml = path.join(webRoot, 'index.html');
  app.useStaticAssets(webRoot);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isRead = req.method === 'GET' || req.method === 'HEAD';
    const isApi = req.path === `/${API_PREFIX}` || req.path.startsWith(`/${API_PREFIX}/`);
    // A path with an extension asks for a file the static handler didn't find, so it stays a 404.
    const isFile = path.posix.extname(req.path) !== '';
    if (isRead && !isApi && !isFile) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}
