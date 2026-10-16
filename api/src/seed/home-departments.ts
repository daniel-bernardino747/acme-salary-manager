import type { Department, JobTitle } from '@acme/contract';

/**
 * The seed gives each job title one home department (ADR 0005, *Reference lists*). The model still
 * accepts any title in any department.
 */
export const homeDepartment = {
  'Software Engineer I': 'Engineering',
  'Software Engineer II': 'Engineering',
  'Senior Software Engineer': 'Engineering',
  'Staff Software Engineer': 'Engineering',
  'Engineering Manager': 'Engineering',
  'QA Engineer': 'Engineering',
  'Product Manager': 'Product',
  'Senior Product Manager': 'Product',
  'Product Designer': 'Design',
  'Senior Product Designer': 'Design',
  'Data Analyst': 'Data',
  'Data Scientist': 'Data',
  'Senior Data Scientist': 'Data',
  'Sales Development Representative': 'Sales',
  'Account Executive': 'Sales',
  'Senior Account Executive': 'Sales',
  'Sales Manager': 'Sales',
  'Marketing Specialist': 'Marketing',
  'Marketing Manager': 'Marketing',
  'Customer Support Specialist': 'Customer Support',
  'Support Team Lead': 'Customer Support',
  Recruiter: 'People',
  'HR Business Partner': 'People',
  'Financial Analyst': 'Finance',
  Accountant: 'Finance',
} as const satisfies Record<JobTitle, Department>;
