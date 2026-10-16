/**
 * The rounding rule (ADR 0001, *Rounding*): `dividend / divisor` rounded half up to a whole unit,
 * once, by integer quotient and remainder (`r = dividend mod divisor`, `q = (dividend − r) /
 * divisor`, up if `2r ≥ divisor`). It lives here, not in `api/src/domain/`, so the API's statistics
 * and conversion and this package's whole-unit display share one implementation (ADR 0002).
 * Money here is never negative.
 */
export function divideRoundHalfUp(dividend: number, divisor: number): number {
  if (!Number.isSafeInteger(dividend) || dividend < 0) {
    throw new RangeError(`The dividend must be a non-negative safe integer, got ${dividend}.`);
  }
  if (!Number.isSafeInteger(divisor) || divisor < 1) {
    throw new RangeError(`The divisor must be a positive integer, got ${divisor}.`);
  }
  const remainder = dividend % divisor;
  const quotient = (dividend - remainder) / divisor;
  return 2 * remainder >= divisor ? quotient + 1 : quotient;
}

/**
 * The same rule in BigInt, for the two products that pass 2⁵³: deriving a rate from the ECB
 * figures, and converting to USD (ADR 0001, *Exchange rate table*).
 */
export function divideRoundHalfUpBigInt(dividend: bigint, divisor: bigint): bigint {
  if (dividend < 0n || divisor < 1n) {
    throw new RangeError(`Needs a non-negative dividend and a positive divisor.`);
  }
  const quotient = dividend / divisor;
  const remainder = dividend % divisor;
  return 2n * remainder >= divisor ? quotient + 1n : quotient;
}
