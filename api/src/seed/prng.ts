/** A stream of unsigned 32-bit integers. */
export type Uint32Source = () => number;

/** Outputs discarded after seeding, so close seeds do not start with close outputs. */
const WARM_UP_ROUNDS = 15;

/**
 * sfc32 (Chris Doty-Humphrey's Small Fast Counting generator), in 32-bit integer operations only
 * (`| 0`, `>>>`, shifts), so it is bit-identical on every engine and OS (ADR 0005, *Determinism*).
 */
export function sfc32(seed: readonly [number, number, number, number]): Uint32Source {
  let [a, b, c, d] = seed.map((word) => word | 0) as [number, number, number, number];
  const next = (): number => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return t >>> 0;
  };
  for (let i = 0; i < WARM_UP_ROUNDS; i++) {
    next();
  }
  return next;
}

/** A whole number from `min` to `max`, both included. */
export function intInRange(next: Uint32Source, min: number, max: number): number {
  return min + (next() % (max - min + 1));
}
