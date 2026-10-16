/**
 * Where `value` sits on the range from `min` to `max`, from 0 to 100, for drawing a marker. The
 * inputs are `amountMinor` as plain numbers and the result is geometry only, never shown as text
 * (ADR 0004, *Question 3*, as amended by #40). A range with no width centres its marker.
 */
export function rangePosition(value: number, min: number, max: number): number {
  if (max <= min) {
    return 50;
  }
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
