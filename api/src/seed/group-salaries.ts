import { intInRange, type Uint32Source } from './prng';

// ADR 0005, *Salaries within a group*, as amended during the seed (#15). Integer-only: a salary is
// a whole number of steps.

export interface GroupBase {
  baseMinor: number;
  stepMinor: number;
  size: number;
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
 * median is the base.
 */
export function anchoredSalaries(next: Uint32Source, group: GroupBase): number[] {
  const { baseMinor, stepMinor, size } = group;
  if (!Number.isInteger(size) || size < 5) {
    throw new RangeError(`An anchored group has at least 5 employees, got ${size}.`);
  }
  const baseSteps = toSteps(baseMinor, stepMinor);
  const { low, high } = drawRange(baseSteps);
  const half = Math.floor((size - 1) / 2);
  const below = Array.from({ length: half }, () => intInRange(next, low, baseSteps - 1));
  const above = Array.from({ length: half }, () => intInRange(next, baseSteps + 1, high));
  const onBase = Array.from({ length: size - 2 * half }, () => baseSteps);
  return [...below, ...onBase, ...above].map((steps) => steps * stepMinor);
}
