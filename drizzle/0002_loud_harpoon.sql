CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`permission` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_role_permissions_role` ON `role_permissions` (`role`);--> statement-breakpoint
ALTER TABLE `processing_authorities` ADD `consent_required` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `processing_authorities` ADD `recipient` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `membership_id` text REFERENCES memberships(id);