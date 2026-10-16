/** One endpoint's durations in milliseconds: the run's first request, then the timed ones. */
export interface Samples {
  cold: number;
  timed: readonly number[];
}

export interface Summary {
  cold: number;
  p50: number;
  p95: number;
  max: number;
}

/**
 * The cold request as is, and the timed ones by nearest rank: the p-th percentile is the sample at
 * rank ⌈p × n⌉ in ascending order, always a measured value. With 100 samples, p95 is the 95th
 * (ADR 0006, *Measuring the 500 ms target*).
 */
export function summarize(samples: Samples): Summary {
  const sorted = [...samples.timed].sort((a, b) => a - b);
  const atRank = (p: number): number => {
    const sample = sorted[Math.ceil(p * sorted.length) - 1];
    if (sample === undefined) {
      throw new RangeError('A summary needs at least one timed sample.');
    }
    return sample;
  };
  return { cold: samples.cold, p50: atRank(0.5), p95: atRank(0.95), max: atRank(1) };
}
