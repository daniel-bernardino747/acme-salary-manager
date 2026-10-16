import { createHash } from 'node:crypto';

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

const UINT32_RANGE = 0x1_0000_0000;

/**
 * A whole number from `min` to `max`, both included. Draws at or past the last whole multiple of
 * the range size are rejected and redrawn, so every value is equally likely (no modulo bias).
 */
export function intInRange(next: Uint32Source, min: number, max: number): number {
  const size = max - min + 1;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || size < 1 || size > UINT32_RANGE) {
    throw new RangeError(`Cannot draw from ${min} to ${max}.`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % size);
  for (;;) {
    const draw = next();
    if (draw < limit) {
      return min + (draw % size);
    }
  }
}

/**
 * An sfc32 stream seeded from the SHA-256 of `keys`, e.g. (fixed seed, job title, country) for one
 * cell (ADR 0005, *Determinism*). The keys are hashed as a JSON array, so ("ab", "c") and ("a", "bc")
 * seed different streams.
 */
export function streamFor(...keys: readonly string[]): Uint32Source {
  const digest = createHash('sha256').update(JSON.stringify(keys)).digest();
  return sfc32([
    digest.readUInt32BE(0),
    digest.readUInt32BE(4),
    digest.readUInt32BE(8),
    digest.readUInt32BE(12),
  ]);
}
