import type { Problem } from '@acme/contract';
import type { EmployeeFormValues } from './employee-form';

type FormField = keyof EmployeeFormValues;

/** Where a server problem shows on the employee form: on its fields, or as one form-level alert. */
export interface EmployeeProblem {
  fieldErrors: Partial<Record<FormField, string>>;
  formError: string | null;
}

/** The request body's field names that differ from the form's (ADR 0004, *Forms*). */
const renamed: Record<string, FormField> = { annualSalaryMinor: 'annualSalary' };

/**
 * Maps a problem's errors onto the form by `path[0]` (ADR 0004, *Forms: add and edit*), so each
 * message shows on the field it belongs to. A problem with no errors (a 404, a 500, or the generic
 * problem of an unreadable response) is a form-level alert, and the form keeps what was typed.
 */
export function employeeProblem(problem: Problem): EmployeeProblem {
  if (!problem.errors?.length) {
    return { fieldErrors: {}, formError: problem.detail ?? problem.title };
  }
  const fieldErrors: EmployeeProblem['fieldErrors'] = {};
  for (const error of problem.errors) {
    const key = String(error.path[0]);
    const field = renamed[key] ?? (key as FormField);
    fieldErrors[field] ??= error.message;
  }
  return { fieldErrors, formError: null };
}
