/** The middleware's metric: `app;dur=<ms>`, with a non-negative decimal duration (ADR 0006). */
const appMetric = /^app;dur=(\d+(?:\.\d+)?)$/;

/**
 * The server time, in milliseconds, from the `app` metric of a `Server-Timing` header (ADR 0006).
 * A proxy may list its own metrics next to it. Throws on a missing or unreadable `app` metric, so no
 * figure is ever made up from it.
 */
export function serverDuration(header: string | null): number {
  const metrics = header?.split(',').map((metric) => metric.trim()) ?? [];
  const duration = metrics.map((metric) => metric.match(appMetric)?.[1]).find(Boolean);
  if (duration === undefined) {
    throw new Error(
      `Expected a Server-Timing header of app;dur=<ms>, got ${JSON.stringify(header)}.`,
    );
  }
  return Number(duration);
}
