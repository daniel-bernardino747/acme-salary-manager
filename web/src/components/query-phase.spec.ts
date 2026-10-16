import { describe, expect, it } from 'vitest';
import { queryPhase } from './query-phase';

describe('queryPhase', () => {
  it('is loading while a query with no data fetches', () => {
    expect(queryPhase({ status: 'pending', fetchStatus: 'fetching' })).toBe('loading');
  });

  it('is idle for a disabled query with no data, such as question 1 before both picks', () => {
    expect(queryPhase({ status: 'pending', fetchStatus: 'idle' })).toBe('idle');
  });

  it('is an error once a query has failed, even while it retries', () => {
    expect(queryPhase({ status: 'error', fetchStatus: 'idle' })).toBe('error');
    expect(queryPhase({ status: 'error', fetchStatus: 'fetching' })).toBe('error');
  });

  it('shows the data once there is some, even while it refetches', () => {
    expect(queryPhase({ status: 'success', fetchStatus: 'idle' })).toBe('data');
    expect(queryPhase({ status: 'success', fetchStatus: 'fetching' })).toBe('data');
  });
});
