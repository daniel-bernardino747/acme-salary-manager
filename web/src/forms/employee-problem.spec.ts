import type { Problem } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { employeeProblem } from './employee-problem';

const validationFailed = {
  type: 'about:blank',
  title: 'Validation failed',
  status: 400,
  detail: 'Request body is invalid',
} satisfies Problem;

describe('employeeProblem', () => {
  it('puts each error on its field by the first step of its path, the salary renamed', () => {
    const problem: Problem = {
      ...validationFailed,
      errors: [
        { path: ['name'], message: 'Must be at most 100 characters' },
        { path: ['annualSalaryMinor'], message: 'Exceeds the maximum salary' },
      ],
    };

    expect(employeeProblem(problem)).toEqual({
      fieldErrors: {
        name: 'Must be at most 100 characters',
        annualSalary: 'Exceeds the maximum salary',
      },
      formError: null,
    });
  });
});
