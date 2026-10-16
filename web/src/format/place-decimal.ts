/**
 * Shows an integer that is already in its display unit with its decimal point placed:
 * `compaRatioHundredths` 79 with 2 decimals is "0.79", `sharePermille` 421 with 1 is "42.1".
 * String operations only, so the UI never rounds a value the domain already rounded (ADR 0004).
 */
export function placeDecimal(value: number, decimals: number): string {
  const digits = String(value).padStart(decimals + 1, '0');
  const point = digits.length - decimals;
  return `${digits.slice(0, point)}.${digits.slice(point)}`;
}
