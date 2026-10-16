/** The server time, in milliseconds, from a `Server-Timing: app;dur=<ms>` header (ADR 0006). */
export function serverDuration(header: string): number {
  return Number(header.slice('app;dur='.length));
}
