import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';
import onHeaders from 'on-headers';

/**
 * Sets `Server-Timing: app;dur=<ms>` from the request's arrival to the writing of its headers
 * (ADR 0006, *Measuring the 500 ms target*). Registered first, so the interval covers routing,
 * guards, pipes, the handler and JSON serialization, and leaves out the network and sending the body.
 */
export function serverTiming(_req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  onHeaders(res, () => {
    res.setHeader('Server-Timing', `app;dur=${(performance.now() - start).toFixed(2)}`);
  });
  next();
}
