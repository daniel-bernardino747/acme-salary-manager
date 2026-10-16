import { describe, expect, it } from 'vitest';
import { problemSchema } from './index.js';

describe('problemSchema', () => {
  it('rejects a field outside RFC 9457 and the errors list, such as a leaked stack', () => {
    const problem = { type: 'about:blank', title: 'Internal Server Error', status: 500 };

    expect(problemSchema.safeParse(problem).success).toBe(true);
    expect(problemSchema.safeParse({ ...problem, stack: 'Error: boom\n    at x' }).success).toBe(
      false,
    );
  });
});
