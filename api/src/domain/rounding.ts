/** Throws unless `value` is a safe integer, so no sum silently loses precision (ADR 0001). */
export function assertSafeInteger(value: number, what: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${what} is not a safe integer: ${value}.`);
  }
}

/** The sum of whole minor units, asserted as a safe integer. */
export function sumMinor(values: readonly number[]): number {
  let sum = 0;
  for (const value of values) {
    sum += value;
    assertSafeInteger(sum, 'A sum of minor units');
  }
  return sum;
}

/**
 * `sum / n` rounded half up to a whole minor unit, by integer quotient and remainder (ADR 0001,
 * *Rounding*): `r = sum mod n`, `q = (sum − r) / n`, up if `2r ≥ n`. Sums of salaries are never
 * negative.
 */
export function divideRoundHalfUp(sum: number, n: number): number {
  assertSafeInteger(sum, 'The dividend');
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new RangeError(`The divisor must be a positive integer, got ${n}.`);
  }
  if (sum < 0) {
    throw new RangeError(`The dividend must not be negative, got ${sum}.`);
  }
  const remainder = sum % n;
  const quotient = (sum - remainder) / n;
  return 2 * remainder >= n ? quotient + 1 : quotient;
}
