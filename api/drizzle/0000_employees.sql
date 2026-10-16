CREATE TABLE `employees` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`job_title` text NOT NULL,
	`department` text NOT NULL,
	`country` text NOT NULL,
	`annual_salary_minor` integer NOT NULL,
	CONSTRAINT "employees_salary_positive" CHECK("employees"."annual_salary_minor" > 0)
);
--> statement-breakpoint
CREATE INDEX `employees_job_title_country_idx` ON `employees` (`job_title`,`country`);--> statement-breakpoint
CREATE INDEX `employees_country_idx` ON `employees` (`country`);--> statement-breakpoint
CREATE INDEX `employees_department_idx` ON `employees` (`department`);--> statement-breakpoint
CREATE INDEX `employees_name_id_idx` ON `employees` (`name`,`id`);