-- Name search (ADR 0002): an external-content FTS5 index over employees(name), kept in sync by triggers.
CREATE VIRTUAL TABLE `employees_fts` USING fts5(
	name,
	content = 'employees',
	content_rowid = 'id',
	tokenize = 'unicode61 remove_diacritics 2',
	prefix = '2 3'
);
--> statement-breakpoint
CREATE TRIGGER `employees_fts_after_insert` AFTER INSERT ON `employees` BEGIN
	INSERT INTO employees_fts (rowid, name) VALUES (new.id, new.name);
END;
--> statement-breakpoint
CREATE TRIGGER `employees_fts_after_update` AFTER UPDATE ON `employees` BEGIN
	INSERT INTO employees_fts (employees_fts, rowid, name) VALUES ('delete', old.id, old.name);
	INSERT INTO employees_fts (rowid, name) VALUES (new.id, new.name);
END;
--> statement-breakpoint
CREATE TRIGGER `employees_fts_after_delete` AFTER DELETE ON `employees` BEGIN
	INSERT INTO employees_fts (employees_fts, rowid, name) VALUES ('delete', old.id, old.name);
END;
