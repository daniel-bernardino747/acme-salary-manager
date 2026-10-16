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

  const notFound: Problem = {
    type: 'about:blank',
    title: 'Not Found',
    status: 404,
    detail: 'Employee 7 does not exist',
  };
  const serverError: Problem = {
    type: 'about:blank',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  };
  const noDetail: Problem = { type: 'about:blank', title: 'Bad Gateway', status: 502 };

  it.each([
    ['an unknown employee', notFound, 'Employee 7 does not exist'],
    ['a server error', serverError, 'An unexpected error occurred'],
    ['a problem with no detail', noDetail, 'Bad Gateway'],
  ])('shows %s, which has no errors, as a form-level alert', (_, problem, alert) => {
    expect(employeeProblem(problem)).toEqual({ fieldErrors: {}, formError: alert });
  });

  it('shows an error whose path names no form field as a form-level alert, the rest on fields', () => {
    const problem: Problem = {
      ...validationFailed,
      errors: [
        { path: [], message: 'Unrecognized key: "currency"' },
        { path: ['id'], message: 'Must be a positive integer' },
        { path: ['country'], message: 'Invalid option' },
      ],
    };

    expect(employeeProblem(problem)).toEqual({
      fieldErrors: { country: 'Invalid option' },
      formError: 'Unrecognized key: "currency". Must be a positive integer.',
    });
  });
});
