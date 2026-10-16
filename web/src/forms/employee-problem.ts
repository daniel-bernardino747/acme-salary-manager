import type { Problem } from '@acme/contract';
import type { EmployeeFormValues } from './employee-form';

type FormField = keyof EmployeeFormValues;

/** Where a server problem shows on the employee form: on its fields, or as one form-level alert. */
export interface EmployeeProblem {
  fieldErrors: Partial<Record<FormField, string>>;
  formError: string | null;
}

/** Each request body field, by its name in the body, as the form field that shows it. */
const formFieldOf: Record<string, FormField> = {
  name: 'name',
  jobTitle: 'jobTitle',
  department: 'department',
  country: 'country',
  // The one rename (ADR 0004, *Forms: add and edit*).
  annualSalaryMinor: 'annualSalary',
};

/**
 * Maps a problem's errors onto the form by `path[0]` (ADR 0004, *Forms: add and edit*), so each
 * message shows on the field it belongs to. An error on no form field, or a problem with no errors (a 404, a 500, or the generic
 * problem of an unreadable response) is a form-level alert, and the form keeps what was typed.
 */
export function employeeProblem(problem: Problem): EmployeeProblem {
  if (!problem.errors?.length) {
    return { fieldErrors: {}, formError: problem.detail ?? problem.title };
  }
  const fieldErrors: EmployeeProblem['fieldErrors'] = {};
  const unmapped: string[] = [];
  for (const error of problem.errors) {
    const field = Object.hasOwn(formFieldOf, String(error.path[0]))
      ? formFieldOf[String(error.path[0])]
      : undefined;
    if (field) {
      fieldErrors[field] ??= error.message;
    } else {
      unmapped.push(`${error.message}.`);
    }
  }
  return { fieldErrors, formError: unmapped.length > 0 ? unmapped.join(' ') : null };
}
