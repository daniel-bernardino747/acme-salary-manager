import { intInRange, shuffle, type Uint32Source } from './prng';

// ADR 0005, *Salaries within a group*, as amended during the seed (#15). Integer-only: a salary is
// a whole number of steps.

export interface GroupBase {
  baseMinor: number;
  stepMinor: number;
  size: number;
}

export interface AnchoredGroup extends GroupBase {
  /** Planted salaries that take the place of the lowest draws, in minor units. */
  underpaid?: readonly number[];
  /** Planted salaries that take the place of the highest draws, in minor units. */
  overpaid?: readonly number[];
}

/** The draw range in steps, `[ceil(0.88 · base), floor(1.12 · base)]`. */
function drawRange(baseSteps: number): { low: number; high: number } {
  return { low: Math.ceil((88 * baseSteps) / 100), high: Math.floor((112 * baseSteps) / 100) };
}

function toSteps(minor: number, stepMinor: number): number {
  if (minor % stepMinor !== 0) {
    throw new RangeError(`${minor} is not a whole number of ${stepMinor} steps.`);
  }
  return minor / stepMinor;
}

/**
 * The salaries of a group of 5 or more, anchored on the base. With `k = floor((size − 1) / 2)`, k
 * are drawn below the base and k above it, and the one or two left are the base exactly, so the
 * median is the base. Each planted underpaid salary then takes the place of the lowest draw, and
 * each overpaid one the highest: every rank is unchanged, so the median does not move. The group
 * is then shuffled, so sorted positions do not leak into ids.
 */
export function anchoredSalaries(next: Uint32Source, group: AnchoredGroup): number[] {
  const { baseMinor, stepMinor, size, underpaid = [], overpaid = [] } = group;
  if (!Number.isInteger(size) || size < 5) {
    throw new RangeError(`An anchored group has at least 5 employees, got ${size}.`);
  }
  const baseSteps = toSteps(baseMinor, stepMinor);
  const { low, high } = drawRange(baseSteps);
  const half = Math.floor((size - 1) / 2);
  if (underpaid.length > half || overpaid.length > half) {
    throw new RangeError(`A group of ${size} has room for ${half} plants on each side.`);
  }
  const lowestDraw = low * stepMinor;
  const highestDraw = high * stepMinor;
  if (underpaid.some((s) => s >= lowestDraw) || overpaid.some((s) => s <= highestDraw)) {
    throw new RangeError('A planted salary must sit outside the draw range, or ranks would move.');
  }
  const ascending = (a: number, b: number) => a - b;
  const below = Array.from({ length: half }, () => intInRange(next, low, baseSteps - 1));
  const above = Array.from({ length: half }, () => intInRange(next, baseSteps + 1, high));
  const onBase = Array.from({ length: size - 2 * half }, () => baseSteps);
  const toMinor = (steps: number) => steps * stepMinor;
  return shuffle(next, [
    ...underpaid,
    ...below.sort(ascending).slice(underpaid.length).map(toMinor),
    ...onBase.map(toMinor),
    ...above
      .sort(ascending)
      .slice(0, half - overpaid.length)
      .map(toMinor),
    ...overpaid,
  ]);
}

/**
 * The salaries of a small group (under 5), drawn freely in 0.88–1.12 × base with no two alike: on
 * a collision, the next draw from the same stream replaces it. Small groups are never checked for
 * outliers, so neither anchoring nor the bound applies.
 */
export function freeSalaries(next: Uint32Source, group: GroupBase): number[] {
  const { baseMinor, stepMinor, size } = group;
  if (!Number.isInteger(size) || size < 0 || size >= 5) {
    throw new RangeError(`A small group has 0 to 4 employees, got ${size}.`);
  }
  const { low, high } = drawRange(toSteps(baseMinor, stepMinor));
  if (high - low + 1 < size) {
    throw new RangeError(`The draw range has fewer than ${size} distinct salaries.`);
  }
  const drawn = new Set<number>();
  while (drawn.size < size) {
    drawn.add(intInRange(next, low, high));
  }
  return [...drawn].map((steps) => steps * stepMinor);
}
