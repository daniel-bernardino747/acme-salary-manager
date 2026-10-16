import { describe, expect, it } from 'vitest';
import { serverDuration } from './server-duration';

describe('serverDuration', () => {
  it.each([
    ['app;dur=12.34', 12.34],
    ['app;dur=0', 0],
    ['app;dur=731.5', 731.5],
  ])('reads %s as %d ms', (header, expected) => {
    expect(serverDuration(header)).toBe(expected);
  });
});

describe('serverDuration on a header it cannot read', () => {
  // A missing or foreign header means the app isn't the one measured; no figure may come from it.
  it.each([null, '', 'app;dur=', 'app;dur=abc', 'db;dur=12', 'app;dur=-1'])(
    'refuses %j',
    (header) => {
      expect(() => serverDuration(header)).toThrow(/Server-Timing/);
    },
  );
});
