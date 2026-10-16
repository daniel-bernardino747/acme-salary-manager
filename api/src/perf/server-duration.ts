/** The middleware's metric: `app;dur=<ms>`, with a non-negative decimal duration (ADR 0006). */
const appMetric = /^app;dur=(\d+(?:\.\d+)?)$/;

/**
 * The server time, in milliseconds, from a `Server-Timing: app;dur=<ms>` header (ADR 0006). Throws
 * on a missing or unreadable header, so no figure is ever made up from it.
 */
export function serverDuration(header: string | null): number {
  const duration = header?.match(appMetric)?.[1];
  if (duration === undefined) {
    throw new Error(`Expected a Server-Timing header of app;dur=<ms>, got ${JSON.stringify(header)}.`);
  }
  return Number(duration);
}
