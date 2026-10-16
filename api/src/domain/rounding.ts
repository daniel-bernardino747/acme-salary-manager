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
