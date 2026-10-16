/**
 * Shows an integer that is already in its display unit with its decimal point placed:
 * `compaRatioHundredths` 79 with 2 decimals is "0.79", `sharePermille` 421 with 1 is "42.1".
 * String operations only, so the UI never rounds a value the domain already rounded (ADR 0004).
 */
export function placeDecimal(value: number, decimals: number): string {
  // Ratios and shares are never negative; anything else here is a caller bug, not a display case.
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`placeDecimal needs a non-negative integer, got ${value}.`);
  }
  if (!Number.isInteger(decimals) || decimals < 1) {
    throw new RangeError(`placeDecimal needs at least one whole decimal place, got ${decimals}.`);
  }
  const digits = String(value).padStart(decimals + 1, '0');
  const point = digits.length - decimals;
  return `${digits.slice(0, point)}.${digits.slice(point)}`;
}
