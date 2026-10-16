import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ADR 0002, "Schema". Currency is not stored: it follows from country.
export const employees = sqliteTable(
  'employees',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    jobTitle: text('job_title').notNull(),
    department: text('department').notNull(),
    country: text('country').notNull(),
    annualSalaryMinor: integer('annual_salary_minor').notNull(),
  },
  (t) => [
    check('employees_salary_positive', sql`${t.annualSalaryMinor} > 0`),
    index('employees_job_title_country_idx').on(t.jobTitle, t.country),
    index('employees_country_idx').on(t.country),
    index('employees_department_idx').on(t.department),
    index('employees_name_id_idx').on(t.name, t.id),
  ],
);
