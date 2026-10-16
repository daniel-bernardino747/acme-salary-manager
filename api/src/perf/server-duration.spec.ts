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
